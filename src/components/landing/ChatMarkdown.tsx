import { Fragment } from "react";
import { InternalLinkCard } from "./InternalLinkCard";
import {
  RecommendationBlock,
  type RecItem,
  type RecommendationSource,
} from "@/portal/components/consultant/RecommendationBlock";

interface ChatMarkdownProps {
  text: string;
}

/** Parse a REC line into a RecItem */
const parseRecLine = (raw: string): RecItem | null => {
  // Format: institutionId | source | productName | whyFits | watchOut | ctaLabel | ctaHref | score?
  const parts = raw.split("|").map((s) => s.trim());
  if (parts.length < 7) return null;

  const [institutionId, source, productName, whyFits, watchOut, ctaLabel, ctaHref, scoreStr] = parts;
  const validSources: RecommendationSource[] = ["own", "partner", "neutral"];
  const src = validSources.includes(source as RecommendationSource)
    ? (source as RecommendationSource)
    : "neutral";

  return {
    institutionId: institutionId && institutionId !== "-" ? institutionId : undefined,
    source: src,
    productName,
    whyFits,
    watchOut: watchOut && watchOut !== "-" ? watchOut : undefined,
    cta: {
      label: ctaLabel,
      href: ctaHref,
      isExternal: ctaHref.startsWith("http"),
    },
    score: scoreStr ? parseInt(scoreStr, 10) || undefined : undefined,
  };
};

/** Render inline segments: bold + links */
const renderInline = (text: string) => {
  // Split by **bold** and [link](url)
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={j}>{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isInternalDovidnyky = href.includes("/dovidnyky/") || href.startsWith("/dovidnyky");
      if (isInternalDovidnyky || href.includes("fintodo.com.ua/dovidnyky")) {
        const cleanHref = href.replace(/^https?:\/\/fintodo\.com\.ua/, "");
        return <InternalLinkCard key={j} href={cleanHref} label={label} />;
      }
      const isInternal = href.startsWith("/");
      return (
        <a
          key={j}
          href={href}
          target={isInternal ? undefined : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          className="text-primary hover:text-primary/80 underline underline-offset-2"
        >
          {label}
        </a>
      );
    }
    return <Fragment key={j}>{part}</Fragment>;
  });
};

const REC_PATTERN = /^>\s*\*\*REC:\*\*\s*(.+)$/;

export const ChatMarkdown = ({ text }: ChatMarkdownProps) => {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listKey = 0;
  let recKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="my-1 ml-4 space-y-0.5 list-disc text-sm">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for REC block (consecutive > **REC:** lines)
    const recMatch = trimmed.match(REC_PATTERN);
    if (recMatch) {
      flushList();
      const recItems: RecItem[] = [];
      let j = i;
      while (j < lines.length) {
        const m = lines[j].trim().match(REC_PATTERN);
        if (!m) break;
        const parsed = parseRecLine(m[1]);
        if (parsed) recItems.push(parsed);
        j++;
      }
      if (recItems.length > 0) {
        elements.push(<RecommendationBlock key={`rec-${recKey++}`} items={recItems} />);
      }
      i = j - 1; // skip consumed lines
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={i} className="my-2 border-border/40" />);
      continue;
    }

    // Headers ### / ##
    const headerMatch = trimmed.match(/^(#{2,4})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      elements.push(
        <p key={i} className="font-semibold text-sm mt-2 mb-0.5 text-foreground">
          {renderInline(headerMatch[2])}
        </p>
      );
      continue;
    }

    // List items - or *
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      listItems.push(<li key={i}>{renderInline(listMatch[1])}</li>);
      continue;
    }

    // Numbered list
    const numMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numMatch) {
      listItems.push(<li key={i}>{renderInline(numMatch[1])}</li>);
      continue;
    }

    // Regular line
    flushList();
    if (trimmed === "") {
      elements.push(<br key={i} />);
    } else {
      elements.push(
        <Fragment key={i}>
          {i > 0 && elements.length > 0 && "\n"}
          {renderInline(trimmed)}
        </Fragment>
      );
    }
  }

  flushList();
  return <>{elements}</>;
};
