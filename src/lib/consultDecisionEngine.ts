/**
 * Decision Engine for consultation mode.
 * Collects candidates from 4 sources → Scores → Confidence routing (ANSWER / CLARIFY / FALLBACK).
 */

import { matchGlossary } from "@/config/chatGlossary";
import {
  matchFreeTextAll,
  findRelevantConsultationTopN,
  getConsultResponse,
  type UserProfile,
  type ConsultResponseResult,
} from "@/config/chatSalesFunnel";

// ── Types ──

export type Candidate = {
  id: string;
  type: "glossary" | "handler" | "library" | "keyword";
  text: string;
  title?: string;
  sourceKey?: string;
  matched?: string[];
  score: number;
  explain: string[]; // debug / calibration info
};

export type DecisionResult =
  | { mode: "ANSWER"; candidate: Candidate }
  | { mode: "CLARIFY"; options: { id: string; title: string; preview: string }[] }
  | { mode: "FALLBACK"; message: string };

// ── Constants ──

const DEFINITION_PATTERN = /що\s+таке|що\s+означає|визначення|поясни\s+термін/i;

const ANCHOR_KEYS = new Set(["декларац", "єсв", "податк", "прро", "рро"]);

const FALLBACK_MESSAGE =
  "Я не знайшов точної відповіді. Спробуйте уточнити питання або виберіть одну з тем нижче.";

// ── Handler score calculation ──

function calcHandlerScore(handlerKey: string): { score: number; explain: string[] } {
  let score = 0.65;
  const explain: string[] = [`base=0.65`];

  if (handlerKey.length >= 10) {
    score += 0.15;
    explain.push(`+0.15 (specific key, len=${handlerKey.length})`);
  }

  if (ANCHOR_KEYS.has(handlerKey)) {
    score += 0.10;
    explain.push(`+0.10 (anchor key)`);
  }

  if (handlerKey.length < 4) {
    score -= 0.05;
    explain.push(`-0.05 (short key, len=${handlerKey.length})`);
  }

  return { score: Math.min(1, Math.max(0, score)), explain };
}

// ── Main function ──

export function decideConsultAnswer(
  inputText: string,
  profile: UserProfile,
  audience: "business" | "individual",
  options?: { fromClarify?: boolean }
): DecisionResult {
  const candidates: Candidate[] = [];
  const text = inputText.trim();

  // 1. Glossary candidates
  const glossaryMatch = matchGlossary(text);
  if (glossaryMatch) {
    const isDefinitionQuery = DEFINITION_PATTERN.test(text);
    const score = isDefinitionQuery ? 0.95 : 0.45;
    candidates.push({
      id: `glossary-${glossaryMatch.term}`,
      type: "glossary",
      text: glossaryMatch.definition,
      title: glossaryMatch.term,
      score,
      explain: [isDefinitionQuery ? "definition query → 0.95" : "term mentioned → 0.45"],
    });
  }

  // 2. Keyword candidates (matchFreeTextAll)
  const keywordMatches = matchFreeTextAll(text, profile);
  for (const km of keywordMatches) {
    candidates.push({
      id: `keyword-${km.key}`,
      type: "keyword",
      text: "", // will be resolved via handler if promoted
      title: km.key,
      sourceKey: km.key,
      matched: km.matched,
      score: km.score,
      explain: [`keyword score=${km.score.toFixed(2)}`],
    });
  }

  // 3. Handler candidates — check CONSULT_KEYWORDS for each keyword match
  for (const km of keywordMatches) {
    const consultResult = getConsultResponse(km.key, profile);
    if (consultResult) {
      const { score, explain } = calcHandlerScore(km.key);
      candidates.push({
        id: `handler-${km.key}`,
        type: "handler",
        text: consultResult.text,
        title: km.key,
        sourceKey: km.key,
        matched: km.matched,
        score,
        explain: [`handler: ${explain.join(", ")}`],
      });
    }
  }

  // 4. Library candidates
  const libraryResults = findRelevantConsultationTopN(text, profile);
  for (const lr of libraryResults) {
    candidates.push({
      id: `library-${lr.consultation.id}`,
      type: "library",
      text: lr.consultation.answer,
      title: lr.consultation.question.split("?")[0].slice(0, 60),
      sourceKey: lr.consultation.slug,
      matched: lr.matchedTokens,
      score: lr.scoreNorm,
      explain: [`library raw=${lr.scoreRaw.toFixed(1)}, norm=${lr.scoreNorm.toFixed(2)}`],
    });
  }

  // Guard: no candidates → FALLBACK
  if (candidates.length === 0) {
    return { mode: "FALLBACK", message: FALLBACK_MESSAGE };
  }

  // Sort by score DESC
  candidates.sort((a, b) => b.score - a.score);

  const best = candidates[0];
  const second = candidates[1];

  // Design decision: single candidate → always HIGH confidence.
  // Rationale: no competing candidates means no ambiguity to clarify.
  const ratio = best.score / (second?.score ?? 0.01);

  // Confidence routing
  const answerThreshold = options?.fromClarify ? 0.50 : 0.75;

  if (best.score >= answerThreshold && ratio >= 1.2) {
    return { mode: "ANSWER", candidate: best };
  }

  if (best.score >= 0.55) {
    // CLARIFY — return top 2-4 distinct candidates
    const clarifyOptions = candidates
      .slice(0, 4)
      .filter((c) => c.title)
      .map((c) => ({
        id: c.id,
        title: c.title!,
        preview: c.text.slice(0, 120).replace(/\n/g, " "),
      }));

    if (clarifyOptions.length >= 2) {
      return { mode: "CLARIFY", options: clarifyOptions };
    }

    // Only 1 option in clarify → just answer it
    return { mode: "ANSWER", candidate: best };
  }

  return { mode: "FALLBACK", message: FALLBACK_MESSAGE };
}
