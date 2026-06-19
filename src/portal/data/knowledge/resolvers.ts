import { KNOWLEDGE_FACTS, KNOWLEDGE_FORECASTS, type FactId } from "./registry";
import type { KnowledgeFact, KnowledgeForecast } from "./types";

export function getFact(id: FactId): KnowledgeFact {
  return KNOWLEDGE_FACTS[id];
}

export function tryGetFact(id: string): KnowledgeFact | undefined {
  return (KNOWLEDGE_FACTS as Record<string, KnowledgeFact>)[id];
}

export function listFacts(filter?: (f: KnowledgeFact) => boolean): KnowledgeFact[] {
  const all = Object.values(KNOWLEDGE_FACTS) as KnowledgeFact[];
  return filter ? all.filter(filter) : all;
}

export function getForecast(id: string): KnowledgeForecast | undefined {
  return KNOWLEDGE_FORECASTS.find((f) => f.id === id);
}

export function listForecasts(): KnowledgeForecast[] {
  return KNOWLEDGE_FORECASTS;
}

/** Найстарший asOf серед переданих фактів — використовується для «загальної свіжості» сторінки. */
export function oldestAsOf(facts: KnowledgeFact[]): string | null {
  if (facts.length === 0) return null;
  return facts
    .map((f) => f.asOf)
    .sort()
    .shift() ?? null;
}

/** Найсвіжіший asOf серед переданих фактів. */
export function latestAsOf(facts: KnowledgeFact[]): string | null {
  if (facts.length === 0) return null;
  return facts
    .map((f) => f.asOf)
    .sort()
    .pop() ?? null;
}

export function formatAsOf(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}
