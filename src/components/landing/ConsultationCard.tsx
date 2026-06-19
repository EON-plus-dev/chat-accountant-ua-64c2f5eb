import { Link } from "react-router-dom";
import type { MockConsultation } from "@/config/consultationMockData";
import { Badge } from "@/components/ui/badge";
import { getRelevanceBadge } from "@/lib/relevanceBadge";
import { stripMarkdown } from "@/lib/markdownRenderer";
import { RefreshCw, Eye } from "lucide-react";

/** Deterministic fake view count from string id (stable across renders) */
function fakeViews(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return 500 + Math.abs(hash) % 14500; // 500–15000
}

function formatViews(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
}

interface Props {
  item: MockConsultation;
  onTagClick?: (tag: string) => void;
}

export const ConsultationCard = ({ item, onTagClick }: Props) => {
  const badge = getRelevanceBadge(item.date, item.updatedDate);

  return (
    <Link to={`/consultations/${item.slug}`} className="block group cursor-pointer h-full">
      <article itemScope itemType="https://schema.org/Question" className="rounded-xl bg-card hover:shadow-md transition-shadow h-full flex flex-col overflow-hidden border">
        <div className="p-5 flex flex-col flex-grow">
          <h3 itemProp="name" className="font-semibold text-sm text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {item.question}
          </h3>
        <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer" className="flex-grow">
          <p itemProp="text" className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {item.cardDescription || stripMarkdown(item.answer.split("\n\n")[0])}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-auto pt-3">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onTagClick?.(tag); }}
                className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {item.history && item.history.length > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                {item.history.length + 1}
              </span>
            )}
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Eye className="w-3 h-3" />
              {formatViews(fakeViews(item.id))}
            </span>
            <Badge variant={badge.variant} size="sm" className="whitespace-nowrap">
              {badge.label}
            </Badge>
          </div>
        </div>
        </div>
      </article>
    </Link>
  );
};
