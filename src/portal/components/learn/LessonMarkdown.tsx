import { Fragment, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const slugifyHeading = (h: string) =>
  h
    .toLowerCase()
    .replace(/[^a-zа-яіїєґʼ0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Витягуємо H2/H3/legacy bold-only заголовки для побудови TOC. */
export function extractToc(source: string): TocItem[] {
  const out: TocItem[] = [];
  for (const raw of source.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const h2 = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (h2) {
      out.push({ id: slugifyHeading(h2[1]), text: h2[1].trim(), level: 2 });
      continue;
    }
    const h3 = line.match(/^###\s+(.+?)\s*#*\s*$/);
    if (h3) {
      out.push({ id: slugifyHeading(h3[1]), text: h3[1].trim(), level: 3 });
      continue;
    }
    const h1 = line.match(/^#\s+(.+?)\s*#*\s*$/);
    if (h1) {
      out.push({ id: slugifyHeading(h1[1]), text: h1[1].trim(), level: 2 });
      continue;
    }
    const bold = line.match(/^\*\*(.+)\*\*$/);
    if (bold) {
      out.push({ id: slugifyHeading(bold[1]), text: bold[1].trim(), level: 2 });
    }
  }
  return out;
}

// ───────── Inline parser ─────────

const renderInline = (text: string, keyPrefix = ""): ReactNode[] => {
  // Розбиваємо на сегменти: **bold**, _italic_, *italic*, `code`, [label](href)
  const pattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\)|_[^_\n]+_|\*[^*\n]+\*)/g;
  const parts = text.split(pattern);
  const nodes: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (!part) return;
    const k = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(<strong key={k} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>);
      return;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(
        <code key={k} className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono text-foreground">
          {part.slice(1, -1)}
        </code>
      );
      return;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const isExternal = /^https?:\/\//i.test(href);
      nodes.push(
        <a
          key={k}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {label}
        </a>
      );
      return;
    }
    if ((part.startsWith("_") && part.endsWith("_")) || (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**"))) {
      nodes.push(<em key={k} className="italic">{part.slice(1, -1)}</em>);
      return;
    }
    nodes.push(<Fragment key={k}>{part}</Fragment>);
  });
  return nodes;
};

// ───────── Block parser ─────────

interface Block {
  render: () => ReactNode;
}

const isTableSep = (line: string) => /^\s*\|?\s*:?-{2,}:?(\s*\|\s*:?-{2,}:?)+\s*\|?\s*$/.test(line);
const isTableRow = (line: string) => /^\s*\|.+\|\s*$/.test(line.trim());
const splitTableRow = (line: string) =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

interface ParseState {
  firstHeadingDone: boolean;
}

function parseBlocks(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];
  const state: ParseState = { firstHeadingDone: false };
  let i = 0;
  let blockKey = 0;

  const headingMt = () => {
    if (!state.firstHeadingDone) {
      state.firstHeadingDone = true;
      return "mt-0";
    }
    return "mt-8";
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i++;
      continue;
    }

    // Code fence
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      const k = `code-${blockKey++}`;
      const code = buf.join("\n");
      blocks.push({
        render: () => (
          <pre key={k} className="my-4 overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
            <code className="font-mono text-foreground">{code}</code>
          </pre>
        ),
      });
      continue;
    }

    // Headings
    const h2 = line.match(/^##\s+(.+?)\s*#*\s*$/);
    const h3 = line.match(/^###\s+(.+?)\s*#*\s*$/);
    const h1 = line.match(/^#\s+(.+?)\s*#*\s*$/);
    const boldOnly = line.match(/^\*\*(.+)\*\*$/);
    if (h2 || h1) {
      const text = (h2 ?? h1)![1].trim();
      const id = slugifyHeading(text);
      const k = `h2-${blockKey++}`;
      const mt = headingMt();
      blocks.push({
        render: () => (
          <h3
            key={k}
            id={id}
            className={`scroll-mt-24 ${mt} mb-3 border-b border-border/60 pb-1.5 text-xl font-semibold tracking-tight text-foreground`}
          >
            {renderInline(text, k)}
          </h3>
        ),
      });
      i++;
      continue;
    }
    if (h3) {
      const text = h3[1].trim();
      const id = slugifyHeading(text);
      const k = `h3-${blockKey++}`;
      const mt = state.firstHeadingDone ? "mt-6" : "mt-0";
      state.firstHeadingDone = true;
      blocks.push({
        render: () => (
          <h4 key={k} id={id} className={`scroll-mt-24 ${mt} mb-2 text-base font-semibold text-foreground`}>
            {renderInline(text, k)}
          </h4>
        ),
      });
      i++;
      continue;
    }
    if (boldOnly) {
      const text = boldOnly[1].trim();
      const id = slugifyHeading(text);
      const k = `hb-${blockKey++}`;
      const mt = headingMt();
      blocks.push({
        render: () => (
          <h3
            key={k}
            id={id}
            className={`scroll-mt-24 ${mt} mb-3 border-b border-border/60 pb-1.5 text-xl font-semibold tracking-tight text-foreground`}
          >
            {text}
          </h3>
        ),
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const k = `bq-${blockKey++}`;
      blocks.push({
        render: () => (
          <blockquote
            key={k}
            className="my-4 rounded-r-md border-l-4 border-primary/50 bg-muted/40 px-4 py-2 text-sm italic text-muted-foreground"
          >
            {buf.map((b, idx) => (
              <p key={idx} className="leading-relaxed">{renderInline(b, `${k}-${idx}`)}</p>
            ))}
          </blockquote>
        ),
      });
      continue;
    }

    // Table
    if (isTableRow(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const headerCells = splitTableRow(line);
      i += 2; // skip header + sep
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      const k = `tbl-${blockKey++}`;
      blocks.push({
        render: () => (
          <div key={k} className="my-4 overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  {headerCells.map((c, ci) => (
                    <TableHead key={ci} className="text-foreground font-semibold">
                      {renderInline(c, `${k}-h-${ci}`)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, ri) => (
                  <TableRow key={ri}>
                    {row.map((c, ci) => (
                      <TableCell key={ci} className="align-top text-sm">
                        {renderInline(c, `${k}-c-${ri}-${ci}`)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ),
      });
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      const k = `ol-${blockKey++}`;
      blocks.push({
        render: () => (
          <ol
            key={k}
            className="my-3 list-decimal space-y-1.5 pl-6 text-foreground/90 marker:font-medium marker:text-primary"
          >
            {items.map((it, idx) => (
              <li key={idx} className="leading-relaxed pl-1">{renderInline(it, `${k}-${idx}`)}</li>
            ))}
          </ol>
        ),
      });
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
        i++;
      }
      const k = `ul-${blockKey++}`;
      blocks.push({
        render: () => (
          <ul key={k} className="my-3 list-disc space-y-1.5 pl-6 text-foreground/90 marker:text-primary/70">
            {items.map((it, idx) => (
              <li key={idx} className="leading-relaxed pl-1">{renderInline(it, `${k}-${idx}`)}</li>
            ))}
          </ul>
        ),
      });
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(line) || /^\*{3,}$/.test(line)) {
      const k = `hr-${blockKey++}`;
      blocks.push({ render: () => <hr key={k} className="my-6 border-border/60" /> });
      i++;
      continue;
    }

    // Paragraph: збираємо до порожнього рядка / нового блоку
    const paraLines: string[] = [raw];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      const t = next.trim();
      if (!t) break;
      if (
        /^#{1,3}\s+/.test(t) ||
        /^\*\*.+\*\*$/.test(t) ||
        /^[-*•]\s+/.test(t) ||
        /^\d+[.)]\s+/.test(t) ||
        t.startsWith(">") ||
        t.startsWith("```") ||
        isTableRow(t) ||
        /^-{3,}$/.test(t)
      ) break;
      paraLines.push(next);
      i++;
    }
    const para = paraLines.join(" ").trim();
    const k = `p-${blockKey++}`;
    blocks.push({
      render: () => (
        <p key={k} className="my-3 text-[15px] leading-7 text-foreground/90 sm:text-base">
          {renderInline(para, k)}
        </p>
      ),
    });
  }

  return blocks;
}

export function LessonMarkdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <article className="max-w-[68ch]">
      {blocks.map((b) => b.render())}
    </article>
  );
}
