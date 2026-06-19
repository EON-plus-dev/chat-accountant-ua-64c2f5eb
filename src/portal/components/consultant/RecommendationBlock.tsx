import { cn } from "@/lib/utils";
import { getInstitutionBySlug } from "@/portal/data/institutionProfiles";
import { useNavigate } from "react-router-dom";

export type RecommendationSource = "own" | "partner" | "neutral";

export interface RecItem {
  source: RecommendationSource;
  institutionId?: string;
  productName: string;
  whyFits: string;
  watchOut?: string;
  cta: { label: string; href: string; isExternal: boolean };
  score?: number;
}

const SOURCE_STYLES = {
  own: {
    borderColor: "border-primary",
    bg: "bg-primary/5",
    badge: "⭐ Власний продукт FINTODO",
    badgeCss: "bg-primary/10 text-primary",
  },
  partner: {
    borderColor: "border-border",
    bg: "bg-background",
    badge: "🤝 Партнер",
    badgeCss: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  },
  neutral: {
    borderColor: "border-border",
    bg: "bg-muted/30",
    badge: "🏛 Державний / безкоштовний",
    badgeCss: "bg-muted text-muted-foreground",
  },
} as const;

export function RecommendationBlock({ items }: { items: RecItem[] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 my-3">
      {items.map((item, i) => {
        const inst = item.institutionId
          ? getInstitutionBySlug(item.institutionId)
          : null;
        const style = SOURCE_STYLES[item.source];

        return (
          <div
            key={i}
            className={cn(
              "border rounded-xl p-4",
              style.borderColor,
              style.bg,
              item.source === "own" && "ring-1 ring-primary/20"
            )}
          >
            {/* Header row */}
            <div className="flex items-start gap-3 mb-3">
              {inst ? (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: inst.logo.color }}
                >
                  {inst.logo.initials}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
                  {item.source === "own" ? "⚡" : "🏦"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-medium text-sm">
                    {inst?.name || item.productName}
                  </span>
                  {item.score != null && (
                    <span className="text-xs font-mono text-primary">
                      {item.score}/100
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full",
                      style.badgeCss
                    )}
                  >
                    {style.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.productName}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-start gap-2 text-xs text-green-700 dark:text-green-400">
                <span className="shrink-0 mt-0.5">✓</span>
                <span>{item.whyFits}</span>
              </div>
              {item.watchOut && (
                <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <span className="shrink-0 mt-0.5">⚠</span>
                  <span>{item.watchOut}</span>
                </div>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex gap-2">
              <a
                href={item.cta.href}
                target={item.cta.isExternal ? "_blank" : undefined}
                rel={item.cta.isExternal ? "noopener noreferrer" : undefined}
                onClick={
                  !item.cta.isExternal
                    ? (e) => {
                        e.preventDefault();
                        navigate(item.cta.href);
                      }
                    : undefined
                }
                className={cn(
                  "text-xs px-4 py-2 rounded-lg font-medium transition",
                  item.source === "own"
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-foreground text-background hover:opacity-80"
                )}
              >
                {item.cta.label}
                {item.cta.isExternal && " ↗"}
              </a>
              {inst && (
                <a
                  href={`/dovidnyky/ustanovy/profile/${inst.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/dovidnyky/ustanovy/profile/${inst.slug}`);
                  }}
                  className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition"
                >
                  Повний огляд
                </a>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-[10px] text-muted-foreground text-center pt-1">
        Партнерські рекомендації позначені. Оцінки незалежні.{" "}
        <a
          href="/publications/ratings"
          className="underline hover:text-foreground"
        >
          Методологія
        </a>
      </p>
    </div>
  );
}
