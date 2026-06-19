/**
 * Auto-enhances consultation answer text with :::container blocks
 * for visual differentiation. Only applied if text doesn't already
 * contain ::: blocks (preserving manually formatted articles like KVED).
 *
 * Transformations:
 * - Removes "Дата публікації: ..." metadata lines (already displayed by UI)
 * - Converts **Розділ N. Title** → ## Title (enables TOC generation)
 * - Wraps **Важливо:** paragraphs in :::warning
 * - Wraps **Корисні посилання:** + **Нормативна база:** in :::legal
 * - For hub articles: wraps first paragraph in :::intro
 * - For hub articles: wraps **Висновок** section in :::conclusion
 * - Contextual CTA: different text for business vs individual audience
 * - Skips CTA for product-feature articles (already describe FINTODO)
 */

/** FINTODO CTA — business audience (income tracking, limits) */
const FINTODO_CTA_BUSINESS = `:::instruction
**Або довірте це FINTODO** — система автоматично відстежує ваші надходження, рахує дохід наростаючим підсумком і попереджає при наближенні до ліміту. Жодних таблиць, жодних ручних підрахунків. [Спробувати безкоштовно →](/)
:::`;

/** FINTODO CTA — individual audience (tax calculation, declarations) */
const FINTODO_CTA_INDIVIDUAL = `:::instruction
**FINTODO зробить це за вас** — імпортує дані, розрахує податок і сформує декларацію автоматично. Без бухгалтера, без помилок. [Спробувати безкоштовно →](/)
:::`;

/** Keywords in bold headings that signal a checklist follows */
const CHECKLIST_HEADING_RE = /(чек-лист|checklist|контрольний перелік)/i;

/** Keywords in bold headings that signal a step-list follows */
const STEP_HEADING_RE = /(крок|покроков|інструкці|процес переходу|як підключити|що робити|виконайте)/i;

/** Keywords in bold headings that signal a warning block follows */
const WARNING_HEADING_RE = /(штраф|наслідк|ризик|що може статись|відповідальніст|загроз|перевищ|обмежен|заборон|блокуванн)/i;

/** Detect if raw text is a product-feature article (already describes FINTODO) */
function isProductFeatureContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  const fintodoMentions = (lowerText.match(/fintodo/g) || []).length;
  // If FINTODO is mentioned 3+ times, it's a product-feature article
  if (fintodoMentions >= 3) return true;
  // Check for explicit product descriptions
  const productPhrases = [
    "fintodo автоматично",
    "fintodo допоможе",
    "система fintodo",
    "у fintodo",
    "через fintodo",
    "підключити fintodo",
  ];
  return productPhrases.some(phrase => lowerText.includes(phrase));
}

/** Split a numbered-list item into action + details using ` — ` or first `. ` */
function splitActionDetails(text: string): { action: string; details: string } {
  const dashIdx = text.indexOf(" — ");
  if (dashIdx >= 0) return { action: text.slice(0, dashIdx).trim(), details: text.slice(dashIdx + 3).trim() };
  // Split on first `. ` but not at start
  const dotIdx = text.indexOf(". ", 1);
  if (dotIdx >= 0 && dotIdx < text.length - 2) return { action: text.slice(0, dotIdx + 1).trim(), details: text.slice(dotIdx + 2).trim() };
  return { action: text.trim(), details: "" };
}

/** Convert a numbered list paragraph into |step-table| if >= 3 items */
function numberedListToStepTable(listParagraph: string): string | null {
  const lines = listParagraph.split("\n").map(l => l.trim()).filter(Boolean);
  const items = lines.map(l => l.match(/^\d+[\)\.]\s*(.+)$/)).filter(Boolean) as RegExpMatchArray[];
  if (items.length < 3 || items.length !== lines.length) return null;

  const header = "| № | Дія | Деталі |";
  const sep = "|---|---|---|";
  const rows = items.map((m, i) => {
    const { action, details } = splitActionDetails(m[1]);
    return `| ${i + 1} | ${action} | ${details} |`;
  });
  return "|step-table|\n" + header + "\n" + sep + "\n" + rows.join("\n");
}

/** Flush collected steps into a |step-table| markdown block */
function flushSteps(steps: { num: string; title: string; details: string }[]): string {
  if (steps.length < 3) {
    return steps.map(s => {
      const base = `**Крок ${s.num}. ${s.title}**`;
      return s.details ? base + "\n\n" + s.details : base;
    }).join("\n\n");
  }
  const header = "| № | Дія | Деталі |";
  const sep = "|---|---|---|";
  const rows = steps.map(s => {
    const detailText = s.details
      .split("\n")
      .map(l => l.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean)
      .join(". ");
    return `| ${s.num} | ${s.title} | ${detailText} |`;
  });
  return "|step-table|\n" + header + "\n" + sep + "\n" + rows.join("\n");
}

export function preprocessConsultationContent(
  text: string,
  isHub: boolean = false,
  audience: "business" | "individual" = "business",
): string {
  // Skip if already has ::: container blocks (manually formatted article)
  if (/^:::/m.test(text)) {
    return text;
  }

  const skipCta = isProductFeatureContent(text);
  const ctaBlock = audience === "individual" ? FINTODO_CTA_INDIVIDUAL : FINTODO_CTA_BUSINESS;

  const paragraphs = text.split("\n\n");
  const result: string[] = [];
  const legalBuffer: string[] = [];
  let collectingLegal = false;
  let stepBuffer: { num: string; title: string; details: string }[] = [];
  let pendingStepHeading: string | null = null;
  let pendingWarningHeading: string | null = null;
  let pendingChecklistHeading: string | null = null;
  let pendingChecklistDesc: { heading: string; desc: string } | null = null;

  const flushStepBuffer = () => {
    if (stepBuffer.length > 0) {
      result.push(flushSteps(stepBuffer));
      if (!skipCta) result.push(ctaBlock);
      stepBuffer = [];
    }
  };

  for (const rawParagraph of paragraphs) {
    const p = rawParagraph.trim();
    if (!p) continue;

    // Remove "Дата публікації: ..." metadata (displayed by UI components)
    if (/^Дата публікації:/.test(p)) continue;

    // Convert **Розділ N. Title** → ## Title (for TOC and section badges)
    const sectionMatch = p.match(/^\*\*Розділ\s+\d+[\.\)]\s*(.+?)\*\*$/);
    if (sectionMatch) {
      flushStepBuffer();
      const title = sectionMatch[1];
      result.push("## " + title);
      if (CHECKLIST_HEADING_RE.test(title)) {
        pendingChecklistHeading = "**" + title + "**";
      }
      continue;
    }

    // Detect legal/reference sections (always at the end of article)
    if (
      p.startsWith("**Корисні посилання:**") ||
      p.startsWith("**Нормативна база:**")
    ) {
      flushStepBuffer();
      collectingLegal = true;
      legalBuffer.push(p);
      continue;
    }
    // Once collecting legal, keep accumulating
    if (collectingLegal) {
      legalBuffer.push(p);
      continue;
    }

    // Wrap **Важливо:** and similar attention markers in :::warning
    if (p.startsWith("**Важливо:**") || /^\*\*(Зверніть увагу|Увага|Запам'ятайте|Пам'ятайте|Врахуйте|Зауважте|Майте на увазі)[.:!]\*\*/.test(p)) {
      flushStepBuffer();
      result.push(":::warning\n" + p + "\n:::");
      continue;
    }

    // Wrap **Приклад:** paragraphs in :::instruction
    if (p.startsWith("**Приклад:**") || p.startsWith("**Приклад.") || p.startsWith("**Практичний приклад:**") || p.startsWith("**Практичний приклад.")) {
      flushStepBuffer();
      result.push(":::instruction\n" + p + "\n:::");
      continue;
    }

    // Wrap **Практична порада:** paragraphs in :::instruction
    if (p.startsWith("**Практична порада:**") || p.startsWith("**Практична порада.")) {
      flushStepBuffer();
      result.push(":::instruction\n" + p + "\n:::");
      continue;
    }

    // Wrap **Типові помилки:** paragraphs in :::error
    if (p.startsWith("**Типові помилки:**") || p.startsWith("**Типові помилки.")) {
      flushStepBuffer();
      result.push(":::error\n" + p + "\n:::");
      continue;
    }

    // Wrap **Порівняння:** paragraphs in :::instruction for visual differentiation
    if (p.startsWith("**Порівняння:**") || p.startsWith("**Порівняння.")) {
      flushStepBuffer();
      result.push(":::instruction\n" + p + "\n:::");
      continue;
    }

    // Detect **Крок N. Title** pattern for step-table generation
    const stepMatch = p.match(/^\*\*Крок\s+(\d+)[\.\)]\s*(.+?)\*\*(.*)$/);
    if (stepMatch) {
      const suffix = stepMatch[3].trim();
      stepBuffer.push({ num: stepMatch[1], title: stepMatch[2] + (suffix ? " " + suffix : ""), details: "" });
      continue;
    }

    // If we have steps and this is a bullet list — attach as details to last step
    if (stepBuffer.length > 0 && /^[-•]\s/.test(p.split("\n")[0])) {
      stepBuffer[stepBuffer.length - 1].details = p;
      continue;
    }

    // Non-step paragraph encountered — flush step buffer
    flushStepBuffer();

    // Check if previous paragraph was a warning-heading and this is a list
    if (pendingWarningHeading) {
      const saved = pendingWarningHeading;
      pendingWarningHeading = null;
      const isList = /^(\d+[\)\.]\s|[-•]\s)/.test(p.split("\n")[0]);
      if (isList) {
        result.push(":::warning\n" + saved + "\n\n" + p + "\n:::");
        continue;
      }
      result.push(saved);
    }

    // Detect bold heading with checklist, step-keywords, or warning-keywords
    const boldMatch = p.match(/^\*\*(.+?)\*\*$/);
    if (boldMatch) {
      if (CHECKLIST_HEADING_RE.test(boldMatch[1])) {
        pendingChecklistHeading = p;
        continue;
      }
      if (WARNING_HEADING_RE.test(boldMatch[1])) {
        pendingWarningHeading = p;
        continue;
      }
      if (STEP_HEADING_RE.test(boldMatch[1])) {
        pendingStepHeading = p;
        result.push(p);
        continue;
      }
    }

    // If previous paragraph was a checklist-heading, collect heading + description + list
    if (pendingChecklistHeading) {
      const heading = pendingChecklistHeading;
      pendingChecklistHeading = null;
      const firstLine = p.split("\n")[0];
      const isNumbered = /^\d+[\)\.]\s/.test(firstLine);
      if (isNumbered) {
        result.push(":::checklist\n" + heading + "\n\n" + p + "\n:::");
        continue;
      }
      // Check if paragraph contains mixed desc + numbered list
      const lines = p.split("\n");
      const firstNumIdx = lines.findIndex(l => /^\d+[\)\.]\s/.test(l.trim()));
      if (firstNumIdx > 0) {
        const desc = lines.slice(0, firstNumIdx).join("\n");
        const list = lines.slice(firstNumIdx).join("\n");
        result.push(":::checklist\n" + heading + "\n\n" + desc + "\n\n" + list + "\n:::");
        continue;
      }
      // Pure description — store for next paragraph
      pendingChecklistDesc = { heading, desc: p };
      continue;
    }

    // If we have a checklist heading+desc pending, next should be the numbered list
    if (pendingChecklistDesc) {
      const { heading, desc } = pendingChecklistDesc;
      pendingChecklistDesc = null;
      const isNumbered = /^\d+[\)\.]\s/.test(p.split("\n")[0]);
      if (isNumbered) {
        result.push(":::checklist\n" + heading + "\n\n" + desc + "\n\n" + p + "\n:::");
        continue;
      }
      // Not a list — flush heading+desc as plain
      result.push(heading);
      result.push(desc);
    }

    // If previous paragraph was a step-heading, check if this is a numbered list
    if (pendingStepHeading) {
      pendingStepHeading = null;
      const table = numberedListToStepTable(p);
      if (table) {
        result.push(table);
        if (!skipCta) result.push(ctaBlock);
        continue;
      }
    }

    result.push(p);
  }

  // Flush remaining steps
  flushStepBuffer();

  // Hub: wrap **Висновок** section in :::conclusion
  if (isHub) {
    const conclusionIdx = result.findIndex(
      (p) => p === "**Висновок**" || p.startsWith("## Висновок"),
    );
    if (conclusionIdx >= 0) {
      const conclusionParts = result.splice(conclusionIdx);
      if (conclusionParts[0].startsWith("## Висновок")) {
        conclusionParts[0] = conclusionParts[0].replace(
          /^## Висновок/,
          "**Висновок**",
        );
      }
      result.push(
        ":::conclusion\n" + conclusionParts.join("\n\n") + "\n:::",
      );
    }
  }

  // Hub: wrap first paragraph in :::intro
  if (isHub && result.length > 0 && !result[0].startsWith(":::")) {
    result[0] = ":::intro\n" + result[0] + "\n:::";
  }

  // Flush legal buffer as :::legal block
  if (legalBuffer.length > 0) {
    result.push(":::legal\n" + legalBuffer.join("\n\n") + "\n:::");
  }

  return result.join("\n\n");
}
