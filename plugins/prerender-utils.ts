/**
 * Node.js-compatible Markdown utilities for build-time prerendering.
 * No DOMPurify — safe for Node.js execution during Vite build.
 */

/** FINTODO CTA — business audience */
const FINTODO_CTA_BUSINESS_NODE = `:::instruction
**Або довірте це FINTODO** — система автоматично відстежує ваші надходження, рахує дохід наростаючим підсумком і попереджає при наближенні до ліміту. Жодних таблиць, жодних ручних підрахунків. [Спробувати безкоштовно →](/)
:::`;

/** FINTODO CTA — individual audience */
const FINTODO_CTA_INDIVIDUAL_NODE = `:::instruction
**FINTODO зробить це за вас** — імпортує дані, розрахує податок і сформує декларацію автоматично. Без бухгалтера, без помилок. [Спробувати безкоштовно →](/)
:::`;

const STEP_HEADING_RE_NODE = /(крок|покроков|інструкці|процес переходу|як підключити|що робити|виконайте)/i;
const WARNING_HEADING_RE_NODE = /(штраф|наслідк|ризик|що може статись|відповідальніст|загроз|перевищ|обмежен|заборон|блокуванн)/i;
const CHECKLIST_HEADING_RE_NODE = /(чек-лист|checklist|контрольний перелік)/i;

function isProductFeatureContentNode(text: string): boolean {
  const lowerText = text.toLowerCase();
  const fintodoMentions = (lowerText.match(/fintodo/g) || []).length;
  if (fintodoMentions >= 3) return true;
  const productPhrases = [
    "fintodo автоматично", "fintodo допоможе", "система fintodo",
    "у fintodo", "через fintodo", "підключити fintodo",
  ];
  return productPhrases.some(phrase => lowerText.includes(phrase));
}

function splitActionDetailsNode(text: string): { action: string; details: string } {
  const dashIdx = text.indexOf(" — ");
  if (dashIdx >= 0) return { action: text.slice(0, dashIdx).trim(), details: text.slice(dashIdx + 3).trim() };
  const dotIdx = text.indexOf(". ", 1);
  if (dotIdx >= 0 && dotIdx < text.length - 2) return { action: text.slice(0, dotIdx + 1).trim(), details: text.slice(dotIdx + 2).trim() };
  return { action: text.trim(), details: "" };
}

function numberedListToStepTableNode(listParagraph: string): string | null {
  const lines = listParagraph.split("\n").map(l => l.trim()).filter(Boolean);
  const items = lines.map(l => l.match(/^\d+[\)\.]\s*(.+)$/)).filter(Boolean) as RegExpMatchArray[];
  if (items.length < 3 || items.length !== lines.length) return null;
  const header = "| № | Дія | Деталі |";
  const sep = "|---|---|---|";
  const rows = items.map((m, i) => {
    const { action, details } = splitActionDetailsNode(m[1]);
    return `| ${i + 1} | ${action} | ${details} |`;
  });
  return "|step-table|\n" + header + "\n" + sep + "\n" + rows.join("\n");
}

function flushStepsNode(steps: { num: string; title: string; details: string }[]): string {
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

export function preprocessConsultationContentNode(
  text: string,
  isHub: boolean = false,
  audience: "business" | "individual" = "business",
): string {
  if (/^:::/m.test(text)) return text;

  const skipCta = isProductFeatureContentNode(text);
  const ctaBlock = audience === "individual" ? FINTODO_CTA_INDIVIDUAL_NODE : FINTODO_CTA_BUSINESS_NODE;

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
      result.push(flushStepsNode(stepBuffer));
      if (!skipCta) result.push(ctaBlock);
      stepBuffer = [];
    }
  };

  for (const rawParagraph of paragraphs) {
    const p = rawParagraph.trim();
    if (!p) continue;
    if (/^Дата публікації:/.test(p)) continue;

    const sectionMatch = p.match(/^\*\*Розділ\s+\d+[\.\)]\s*(.+?)\*\*$/);
    if (sectionMatch) { flushStepBuffer(); result.push("## " + sectionMatch[1]); continue; }

    if (p.startsWith("**Корисні посилання:**") || p.startsWith("**Нормативна база:**")) {
      flushStepBuffer(); collectingLegal = true; legalBuffer.push(p); continue;
    }
    if (collectingLegal) { legalBuffer.push(p); continue; }

    if (p.startsWith("**Важливо:**") || /^\*\*(Зверніть увагу|Увага|Запам'ятайте|Пам'ятайте|Врахуйте|Зауважте|Майте на увазі)[.:!]\*\*/.test(p)) {
      flushStepBuffer(); result.push(":::warning\n" + p + "\n:::"); continue;
    }

    if (p.startsWith("**Приклад:**") || p.startsWith("**Приклад.") || p.startsWith("**Практичний приклад:**") || p.startsWith("**Практичний приклад.")) {
      flushStepBuffer(); result.push(":::instruction\n" + p + "\n:::"); continue;
    }

    if (p.startsWith("**Практична порада:**") || p.startsWith("**Практична порада.")) {
      flushStepBuffer(); result.push(":::instruction\n" + p + "\n:::"); continue;
    }

    if (p.startsWith("**Типові помилки:**") || p.startsWith("**Типові помилки.")) {
      flushStepBuffer(); result.push(":::error\n" + p + "\n:::"); continue;
    }

    if (p.startsWith("**Порівняння:**") || p.startsWith("**Порівняння.")) {
      flushStepBuffer(); result.push(":::instruction\n" + p + "\n:::"); continue;
    }

    const stepMatch = p.match(/^\*\*Крок\s+(\d+)[\.\)]\s*(.+?)\*\*(.*)$/);
    if (stepMatch) {
      const suffix = stepMatch[3].trim();
      stepBuffer.push({ num: stepMatch[1], title: stepMatch[2] + (suffix ? " " + suffix : ""), details: "" });
      continue;
    }

    if (stepBuffer.length > 0 && /^[-•]\s/.test(p.split("\n")[0])) {
      stepBuffer[stepBuffer.length - 1].details = p;
      continue;
    }

    flushStepBuffer();

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

    const boldMatch = p.match(/^\*\*(.+?)\*\*$/);
    if (boldMatch) {
      if (CHECKLIST_HEADING_RE_NODE.test(boldMatch[1])) {
        pendingChecklistHeading = p;
        continue;
      }
      if (WARNING_HEADING_RE_NODE.test(boldMatch[1])) {
        pendingWarningHeading = p;
        continue;
      }
      if (STEP_HEADING_RE_NODE.test(boldMatch[1])) {
        pendingStepHeading = p;
        result.push(p);
        continue;
      }
    }

    if (pendingChecklistHeading) {
      const heading = pendingChecklistHeading;
      pendingChecklistHeading = null;
      const isNumbered = /^\d+[\)\.]\s/.test(p.split("\n")[0]);
      if (isNumbered) {
        result.push(":::checklist\n" + heading + "\n\n" + p + "\n:::");
        continue;
      }
      pendingChecklistDesc = { heading, desc: p };
      continue;
    }

    if (pendingChecklistDesc) {
      const { heading, desc } = pendingChecklistDesc;
      pendingChecklistDesc = null;
      const isNumbered = /^\d+[\)\.]\s/.test(p.split("\n")[0]);
      if (isNumbered) {
        result.push(":::checklist\n" + heading + "\n\n" + desc + "\n\n" + p + "\n:::");
        continue;
      }
      result.push(heading);
      result.push(desc);
    }

    if (pendingStepHeading) {
      pendingStepHeading = null;
      const table = numberedListToStepTableNode(p);
      if (table) { result.push(table); if (!skipCta) result.push(ctaBlock); continue; }
    }

    result.push(p);
  }

  flushStepBuffer();

  if (isHub) {
    const ci = result.findIndex(p => p === "**Висновок**" || p.startsWith("## Висновок"));
    if (ci >= 0) {
      const cp = result.splice(ci);
      if (cp[0].startsWith("## Висновок")) cp[0] = cp[0].replace(/^## Висновок/, "**Висновок**");
      result.push(":::conclusion\n" + cp.join("\n\n") + "\n:::");
    }
  }

  if (isHub && result.length > 0 && !result[0].startsWith(":::")) {
    result[0] = ":::intro\n" + result[0] + "\n:::";
  }

  if (legalBuffer.length > 0) {
    result.push(":::legal\n" + legalBuffer.join("\n\n") + "\n:::");
  }

  return result.join("\n\n");
}

/** Strip all Markdown markers from text (for meta descriptions, previews). */
export const stripMarkdownNode = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\|caption:.*\|$/gm, "")
    .replace(/^\|step-table\|\s*$/gm, "")
    .replace(/\[good\]\s*/g, "")
    .replace(/\[bad\]\s*/g, "")
    .replace(/^\|[\s\-:|]+\|$/gm, "")
    .replace(/^\|(.+)\|$/gm, (_, inner) =>
      inner.split("|").map((c: string) => c.trim()).filter(Boolean).join(", ")
    )
    .replace(/^\d+[\)\.]\s*/gm, "")
    .replace(/^[-•]\s*/gm, "")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

/** Create a clean meta description from article text (120-155 chars). */
export const createMetaDescriptionNode = (text: string): string => {
  const clean = stripMarkdownNode(text);
  if (clean.length <= 155) return clean;

  const truncated = clean.slice(0, 155);
  const lastDot = truncated.lastIndexOf(".");
  const lastExcl = truncated.lastIndexOf("!");
  const lastQ = truncated.lastIndexOf("?");
  const boundary = Math.max(lastDot, lastExcl, lastQ);

  if (boundary >= 80) {
    return clean.slice(0, boundary + 1);
  }

  const words = truncated.split(" ");
  words.pop();
  return words.join(" ") + "…";
};

/** Inline formatting: **bold** → <strong>, [text](url) → <a> */
const inlineFormat = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
      const isExternal = url.startsWith('http');
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url}"${attrs}>${text}</a>`;
    });
};

/** Escape HTML special characters */
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

/** Parse a Markdown table block into HTML <table> (no CSS classes). */
const renderTableNode = (lines: string[]): string => {
  const parseCells = (line: string): string[] =>
    line.split("|").slice(1, -1).map((c) => c.trim());

  let filteredLines = [...lines];
  let caption = "";
  let isStepTable = false;

  const captionMatch = filteredLines[0]?.match(/^\|caption:\s*(.+?)\s*\|$/);
  if (captionMatch) {
    caption = captionMatch[1];
    filteredLines.shift();
  }

  if (/^\|step-table\|\s*$/.test(filteredLines[0]?.trim() ?? "")) {
    isStepTable = true;
    filteredLines.shift();
  }

  if (filteredLines.length === 0) return "";

  const headerCells = parseCells(filteredLines[0]);
  const hasSeparator = filteredLines.length > 1 && /^\|[\s\-:|]+\|$/.test(filteredLines[1].trim());
  const dataStartIndex = hasSeparator ? 2 : 1;

  const thead = `<thead><tr>${headerCells
    .map((c) => `<th>${inlineFormat(escapeHtml(c))}</th>`)
    .join("")}</tr></thead>`;

  const rows = filteredLines.slice(dataStartIndex).map((line) => {
    const cells = parseCells(line);
    let rowClass = "";

    if (cells.length > 0) {
      if (cells[0].startsWith("[good]")) {
        rowClass = ' class="row--good"';
        cells[0] = cells[0].replace(/^\[good\]\s*/, "");
      } else if (cells[0].startsWith("[bad]")) {
        rowClass = ' class="row--bad"';
        cells[0] = cells[0].replace(/^\[bad\]\s*/, "");
      }
    }

    if (isStepTable && cells.length >= 2 && /^\d+$/.test(cells[0].trim())) {
      const stepNum = cells[0].trim();
      const stepAction = cells[1];
      const restCells = cells.slice(2);
      return `<tr${rowClass}><td class="step-num"><span>${stepNum}</span></td><td class="step-action">${inlineFormat(escapeHtml(stepAction))}</td>${restCells.map((c) => `<td>${inlineFormat(escapeHtml(c))}</td>`).join("")}</tr>`;
    }

    return `<tr${rowClass}>${cells.map((c) => `<td>${inlineFormat(escapeHtml(c))}</td>`).join("")}</tr>`;
  });

  const tbody = `<tbody>${rows.join("")}</tbody>`;
  const captionHtml = caption ? `<caption>${inlineFormat(escapeHtml(caption))}</caption>` : "";
  const tableClass = isStepTable ? ' class="step-table"' : "";

  return `<table${tableClass}>${captionHtml}${thead}${tbody}</table>`;
};

/** Lightweight Markdown-to-HTML renderer for Node.js (no DOMPurify). */
export const renderMarkdownNode = (text: string): string => {
  const blocks = text.split("\n\n");

  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      const lines = trimmed.split("\n");

      // Table
      const nonEmptyLines = lines.filter((l) => l.trim());
      const isTable = nonEmptyLines.length >= 2 && nonEmptyLines.every((l) => l.trim().startsWith("|"));
      if (isTable) {
        return renderTableNode(nonEmptyLines);
      }

      // Numbered list
      const isNumberedList = lines.every(
        (line) => /^\d+[\)\.]\s/.test(line.trim()) || line.trim() === ""
      );
      if (isNumberedList && lines.filter((l) => l.trim()).length > 0) {
        const items = lines
          .filter((l) => l.trim())
          .map((line) => {
            const content = line.replace(/^\d+[\)\.]\s*/, "").trim();
            return `<li>${inlineFormat(escapeHtml(content))}</li>`;
          })
          .join("");
        return `<ol>${items}</ol>`;
      }

      // Dash/bullet list
      const isDashList = lines.every(
        (line) => /^[-•]\s/.test(line.trim()) || line.trim() === ""
      );
      if (isDashList && lines.filter((l) => l.trim()).length > 0) {
        const items = lines
          .filter((l) => l.trim())
          .map((line) => {
            const content = line.replace(/^[-•]\s*/, "").trim();
            return `<li>${inlineFormat(escapeHtml(content))}</li>`;
          })
          .join("");
        return `<ul>${items}</ul>`;
      }

      // Regular paragraph
      const formatted = lines
        .map((line) => inlineFormat(escapeHtml(line.trim())))
        .join("<br />");
      return `<p>${formatted}</p>`;
    })
    .join("");
};
