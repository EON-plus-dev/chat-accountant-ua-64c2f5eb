import DOMPurify from "dompurify";

/**
 * Supported custom container block types for consultation articles.
 * Syntax: :::type\ncontent\n:::
 */
const BLOCK_TYPES = ["intro", "warning", "instruction", "legal", "error", "conclusion", "checklist"] as const;
type BlockType = (typeof BLOCK_TYPES)[number];

/* ── Slugify & TOC extraction ── */

/** Slugify a heading for HTML id generation. Supports Cyrillic. */
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[«»"'"']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export type TocItem = { id: string; label: string };

/**
 * Extract TOC items from ## headings in raw markdown text.
 * Ignores headings inside :::type container blocks.
 */
export const extractTocItems = (text: string): TocItem[] => {
  const lines = text.split("\n");
  const items: TocItem[] = [];
  let inBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^:::(intro|warning|instruction|legal|error|conclusion|checklist)\s*$/.test(trimmed)) {
      inBlock = true;
      continue;
    }
    if (/^:::\s*$/.test(trimmed)) {
      inBlock = false;
      continue;
    }
    if (!inBlock && /^## /.test(line)) {
      const label = line
        .replace(/^## /, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .trim();
      items.push({ id: slugify(label), label });
    }
  }

  return items;
};

/* ── Render pipeline ── */

/** Auto-incrementing section counter, reset per renderMarkdown call */
let sectionCounter = 0;

/**
 * Lightweight Markdown-to-HTML renderer for consultation articles.
 * Supports: **bold**, ## / ### headings with auto-IDs, numbered lists,
 * \n\n paragraphs, \n line breaks, tables, links, and custom
 * container blocks (:::type ... :::).
 */
export const renderMarkdown = (text: string): string => {
  sectionCounter = 0;

  const segments = splitContainerBlocks(text);

  const html = segments
    .map((segment) => {
      if (segment.type !== "plain") {
        if (segment.type === "checklist") {
          return renderChecklistBlock(segment.content);
        }
        const innerHtml = renderPlainBlocks(segment.content);
        return `<div class="consultation-block consultation-block--${segment.type}">${innerHtml}</div>`;
      }
      return renderPlainBlocks(segment.content);
    })
    .join("");

  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
};

type Segment = { type: "plain" | BlockType; content: string };

/**
 * Split text into plain segments and :::type container blocks.
 */
const splitContainerBlocks = (text: string): Segment[] => {
  const segments: Segment[] = [];
  const lines = text.split("\n");
  let plainBuffer: string[] = [];
  let blockType: BlockType | null = null;
  let blockBuffer: string[] = [];

  const flushPlain = () => {
    const joined = plainBuffer.join("\n").trim();
    if (joined) segments.push({ type: "plain", content: joined });
    plainBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Opening tag: :::type
    if (!blockType) {
      const openMatch = trimmed.match(/^:::(intro|warning|instruction|legal|error|conclusion|checklist)\s*$/);
      if (openMatch) {
        flushPlain();
        blockType = openMatch[1] as BlockType;
        blockBuffer = [];
        continue;
      }
      plainBuffer.push(line);
      continue;
    }

    // Closing tag: :::
    if (/^:::\s*$/.test(trimmed)) {
      const content = blockBuffer.join("\n").trim();
      segments.push({ type: blockType, content });
      blockType = null;
      blockBuffer = [];
      continue;
    }

    blockBuffer.push(line);
  }

  // Flush remaining
  if (blockType && blockBuffer.length > 0) {
    const content = blockBuffer.join("\n").trim();
    segments.push({ type: blockType, content });
  } else if (blockBuffer.length > 0) {
    plainBuffer.push(...blockBuffer);
  }
  flushPlain();

  return segments;
};

/**
 * Render plain markdown blocks (headings, paragraphs, lists, tables) into HTML.
 */
const renderPlainBlocks = (text: string): string => {
  const blocks = text.split("\n\n");

  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      const lines = trimmed.split("\n");

      /* ── Heading: ## Section (auto-numbered) ── */
      if (/^## /.test(lines[0])) {
        sectionCounter++;
        const title = lines[0].replace(/^## /, "").trim();
        const cleanTitle = title.replace(/\*\*(.+?)\*\*/g, "$1");
        const id = slugify(cleanTitle);
        let html = `<div class="section-header" id="${id}"><span class="section-badge">РОЗДІЛ ${sectionCounter}</span><h2>${inlineFormat(title)}</h2></div>`;
        if (lines.length > 1) {
          const rest = lines
            .slice(1)
            .map((l) => inlineFormat(l.trim()))
            .join("<br />");
          html += `<p class="mb-4">${rest}</p>`;
        }
        return html;
      }

      /* ── Heading: ### Sub-section ── */
      if (/^### /.test(lines[0])) {
        const title = lines[0].replace(/^### /, "").trim();
        const cleanTitle = title.replace(/\*\*(.+?)\*\*/g, "$1");
        const id = slugify(cleanTitle);
        let html = `<h3 id="${id}">${inlineFormat(title)}</h3>`;
        if (lines.length > 1) {
          const rest = lines
            .slice(1)
            .map((l) => inlineFormat(l.trim()))
            .join("<br />");
          html += `<p class="mb-4">${rest}</p>`;
        }
        return html;
      }

      /* ── Markdown table ── */
      const nonEmptyLines = lines.filter((l) => l.trim());
      const isTable =
        nonEmptyLines.length >= 2 && nonEmptyLines.every((l) => l.trim().startsWith("|"));
      if (isTable) {
        return renderTable(nonEmptyLines);
      }

      /* ── Numbered list ── */
      const isNumberedList = lines.every(
        (line) => /^\d+[\)\.]\s/.test(line.trim()) || line.trim() === ""
      );
      if (isNumberedList && lines.filter((l) => l.trim()).length > 0) {
        const items = lines
          .filter((l) => l.trim())
          .map((line) => {
            const content = line.replace(/^\d+[\)\.]\s*/, "").trim();
            return `<li>${inlineFormat(content)}</li>`;
          })
          .join("");
        return `<ol class="list-decimal pl-6 mb-4 space-y-1">${items}</ol>`;
      }

      /* ── Dash / bullet list ── */
      const isDashList = lines.every(
        (line) => /^[-•]\s/.test(line.trim()) || line.trim() === ""
      );
      if (isDashList && lines.filter((l) => l.trim()).length > 0) {
        const items = lines
          .filter((l) => l.trim())
          .map((line) => {
            const content = line.replace(/^[-•]\s*/, "").trim();
            return `<li>${inlineFormat(content)}</li>`;
          })
          .join("");
        return `<ul class="list-disc pl-6 mb-4 space-y-1">${items}</ul>`;
      }

      /* ── Regular paragraph ── */
      const formatted = lines
        .map((line) => inlineFormat(line.trim()))
        .join("<br />");
      return `<p class="mb-4">${formatted}</p>`;
    })
    .join("");
};

/**
 * Render a :::checklist block with checkmark icons and timeline.
 */
const renderChecklistBlock = (content: string): string => {
  const paragraphs = content.split("\n\n");
  let headerHtml = "";
  const items: string[] = [];

  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    // Collect numbered list items
    const lines = trimmed.split("\n");
    const listLines = lines.filter(l => /^\d+[\)\.]\s/.test(l.trim()));
    if (listLines.length > 0) {
      for (const line of listLines) {
        const text = line.replace(/^\d+[\)\.]\s*/, "").trim();
        items.push(text);
      }
    } else {
      // Non-list content = header/description
      headerHtml += renderPlainBlocks(trimmed);
    }
  }

  const itemsHtml = items.map((item, i) => {
    const isLast = i === items.length - 1;
    return `<li class="checklist-item${isLast ? " checklist-item--last" : ""}"><span class="checklist-icon">✓</span><span class="checklist-text">${inlineFormat(item)}</span></li>`;
  }).join("");

  return `<div class="consultation-block consultation-block--checklist">${headerHtml}<ul class="checklist-list">${itemsHtml}</ul></div>`;
};

/**
 * Apply inline formatting: **bold**, [links](url)
 */
const inlineFormat = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
      const isExternal = url.startsWith("http");
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${url}" class="text-primary underline hover:text-primary/80"${attrs}>${linkText}</a>`;
    });
};

/**
 * Parse a Markdown table block into styled HTML <table>.
 * Supports:
 * - |caption: Text| → <caption>
 * - |step-table| → .step-table wrapper with timeline circles
 * - [good] / [bad] row markers → .row--good / .row--bad classes
 */
const renderTable = (lines: string[]): string => {
  const parseCells = (line: string): string[] =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());

  let filteredLines = [...lines];
  let caption = "";
  let captionBottom = false;
  let isStepTable = false;

  // Check for |caption: ...| at first line (top caption)
  const captionMatch = filteredLines[0]?.match(/^\|caption:\s*(.+?)\s*\|$/);
  if (captionMatch) {
    caption = captionMatch[1];
    filteredLines.shift();
  }

  // Check for |caption: ...| at last line (bottom caption)
  if (!caption && filteredLines.length > 0) {
    const lastLine = filteredLines[filteredLines.length - 1];
    const bottomCaptionMatch = lastLine?.match(/^\|caption:\s*(.+?)\s*\|$/);
    if (bottomCaptionMatch) {
      caption = bottomCaptionMatch[1];
      captionBottom = true;
      filteredLines.pop();
    }
  }

  // Check for |step-table| marker
  if (/^\|step-table\|\s*$/.test(filteredLines[0]?.trim() ?? "")) {
    isStepTable = true;
    filteredLines.shift();
  }

  if (filteredLines.length === 0) return "";

  const headerCells = parseCells(filteredLines[0]);

  const hasSeparator = filteredLines.length > 1 && /^\|[\s\-:|]+\|$/.test(filteredLines[1].trim());
  const dataStartIndex = hasSeparator ? 2 : 1;

  const thead = `<thead><tr>${headerCells
    .map((c) => `<th>${inlineFormat(c)}</th>`)
    .join("")}</tr></thead>`;

  const rows = filteredLines.slice(dataStartIndex).map((line) => {
    const cells = parseCells(line);
    let rowClass = "";

    // Check first cell for [good]/[bad] marker
    if (cells.length > 0) {
      if (cells[0].startsWith("[good]")) {
        rowClass = ' class="row--good"';
        cells[0] = cells[0].replace(/^\[good\]\s*/, "");
      } else if (cells[0].startsWith("[bad]")) {
        rowClass = ' class="row--bad"';
        cells[0] = cells[0].replace(/^\[bad\]\s*/, "");
      }
    }

    // Step-table: render first cell as step number circle
    if (isStepTable && cells.length >= 2 && /^\d+$/.test(cells[0].trim())) {
      const stepNum = cells[0].trim();
      const stepAction = cells[1];
      const restCells = cells.slice(2);
      return `<tr${rowClass}><td class="step-num"><span>${stepNum}</span></td><td class="step-action">${inlineFormat(stepAction)}</td>${restCells.map((c) => `<td>${inlineFormat(c)}</td>`).join("")}</tr>`;
    }

    return `<tr${rowClass}>${cells.map((c) => `<td>${inlineFormat(c)}</td>`).join("")}</tr>`;
  });

  const tbody = `<tbody>${rows.join("")}</tbody>`;
  const captionHtml = caption
    ? `<caption${captionBottom ? ' style="caption-side:bottom"' : ''}>${inlineFormat(caption)}</caption>`
    : "";
  const tableClass = isStepTable ? ' class="step-table"' : "";

  return `<div class="table-wrapper"><table${tableClass}>${captionHtml}${thead}${tbody}</table></div>`;
};

/**
 * Strip all Markdown markers from text (for meta descriptions, card previews).
 */
export const stripMarkdown = (text: string): string => {
  return text
    .replace(/^:::(intro|warning|instruction|legal|error|conclusion|checklist)\s*$/gm, "")
    .replace(/^:::\s*$/gm, "")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\|caption:.*\|$/gm, "")
    .replace(/^\|step-table\|\s*$/gm, "")
    .replace(/\[good\]\s*/g, "")
    .replace(/\[bad\]\s*/g, "")
    .replace(/^\|[\s\-:|]+\|$/gm, "")
    .replace(/^\|(.+)\|$/gm, (_, inner) =>
      inner
        .split("|")
        .map((c: string) => c.trim())
        .filter(Boolean)
        .join(", ")
    )
    .replace(/^\d+[\)\.]\s*/gm, "")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

/**
 * Create a clean meta description from article text.
 * Strips markdown, truncates at sentence boundary, 120-155 chars.
 */
export const createMetaDescription = (text: string): string => {
  const clean = stripMarkdown(text);
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
