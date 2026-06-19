import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { getUniqueIndices, type UniqueIndex } from "@/portal/data/dailyDigest";
import { SNAPSHOT_AS_OF } from "@/portal/data/knowledge/registry";
import { formatAsOf } from "@/portal/data/knowledge/resolvers";
import { useAudience } from "@/contexts/AudienceContext";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const severityColor: Record<string, string> = {
  positive: "text-chart-2",
  neutral: "text-muted-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  negative: "text-destructive",
};

const severityBorder: Record<string, string> = {
  positive: "border-chart-2/30",
  neutral: "border-border/60",
  warning: "border-amber-500/30",
  negative: "border-destructive/30",
};

function PrimaryCard({ idx }: { idx: UniqueIndex }) {
  return (
    <Link
      to={idx.href}
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border bg-card p-3.5 transition-all duration-200",
        "hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5",
        severityBorder[idx.severity],
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{idx.icon}</span>
        <span className="text-xs text-muted-foreground truncate">{idx.label}</span>
      </div>
      <span className={cn("text-lg sm:text-xl font-bold tabular-nums tracking-tight truncate", severityColor[idx.severity])}>
        {idx.value}
      </span>
      {idx.progress !== undefined && (
        <Progress value={idx.progress} className="h-1" />
      )}
      <span className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{idx.detail}</span>
    </Link>
  );
}

function SecondaryCard({ idx }: { idx: UniqueIndex }) {
  return (
    <Link
      to={idx.href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border bg-card/60 px-3 py-2 transition-all",
        "hover:bg-card hover:shadow-[var(--shadow-sm)]",
        "border-border/50",
      )}
    >
      <span className="text-sm leading-none">{idx.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground truncate leading-tight">{idx.label}</p>
        <p className={cn("text-sm font-semibold tabular-nums truncate leading-tight", severityColor[idx.severity])}>
          {idx.value}
        </p>
      </div>
      <span className="hidden sm:block text-[10px] text-muted-foreground truncate max-w-[180px]">
        {idx.detail}
      </span>
    </Link>
  );
}

export const LiveDataStrip = () => {
  const { ref, isVisible } = useScrollReveal();
  const { audience } = useAudience();
  // На десктопі secondary розгорнуті, на мобайл — згорнуті
  const [expanded, setExpanded] = useState(false);

  const indices = getUniqueIndices(audience);
  const primary = indices.filter(i => i.priority === "primary");
  const secondary = indices.filter(i => i.priority !== "primary");

  return (
    <section
      ref={ref}
      className={cn(
        "py-6 bg-muted/30 border-y border-border/40 transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-3">
        {/* Primary row — найважливіше */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {primary.map((idx) => (
            <PrimaryCard key={idx.id} idx={idx} />
          ))}
        </div>

        {/* Secondary row — desktop розгорнутий, mobile collapsible */}
        {secondary.length > 0 && (
          <>
            {/* Desktop: завжди розгорнутий */}
            <div className="hidden md:grid grid-cols-3 gap-2">
              {secondary.map((idx) => (
                <SecondaryCard key={idx.id} idx={idx} />
              ))}
            </div>

            {/* Mobile: collapsible */}
            <div className="md:hidden">
              <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1.5"
              >
                {expanded ? "Згорнути" : `Більше індексів (${secondary.length})`}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
              </button>
              {expanded && (
                <div className="grid grid-cols-1 gap-2 mt-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                  {secondary.map((idx) => (
                    <SecondaryCard key={idx.id} idx={idx} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <p className="text-center text-[11px] text-muted-foreground">
          Унікальна аналітика FINTODO · станом на {formatAsOf(SNAPSHOT_AS_OF)}
        </p>
      </div>
    </section>
  );
};
