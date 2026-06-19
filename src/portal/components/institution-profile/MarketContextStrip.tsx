import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { getCategoryIndices, generateAiInsight, type CategoryIndex } from "@/portal/data/categoryIndices";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

const severityColor: Record<string, string> = {
  positive: "text-chart-2",
  neutral: "text-muted-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  negative: "text-destructive",
};

function CompactIndexCard({ idx }: { idx: CategoryIndex }) {
  return (
    <Link
      to={idx.href}
      title={idx.detail}
      className={cn(
        "flex flex-col gap-1 rounded-md bg-muted/30 p-2 transition-all duration-200",
        "hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm leading-none">{idx.icon}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{idx.label}</span>
      </div>
      <span className={cn("text-sm font-semibold tabular-nums tracking-tight", severityColor[idx.severity])}>
        {idx.value}
      </span>
      {idx.progress !== undefined && <Progress value={idx.progress} className="h-0.5" />}
      {idx.contextLabel && (
        <span className={cn("text-[10px] leading-tight", severityColor[idx.severity])}>
          {idx.contextLabel}
        </span>
      )}
    </Link>
  );
}

interface MarketContextStripProps {
  categorySlug: string;
  categoryName: string;
  profile: FullInstitutionProfile;
}

export function MarketContextStrip({ categorySlug, categoryName, profile }: MarketContextStripProps) {
  const indices = getCategoryIndices(categorySlug, profile.types);
  const insight = generateAiInsight(profile);

  if (indices.length === 0) return null;
  const aiQuery = encodeURIComponent(`Порівняй ${profile.name} з іншими установами у категорії ${categoryName}`);

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">📊</span>
        <h3 className="text-xs font-semibold text-foreground">
          Як {profile.name} на тлі ринку
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {indices.map((idx) => (
          <CompactIndexCard key={idx.id} idx={idx} />
        ))}
      </div>

      {/* AI Insight — compact inline */}
      <div className="rounded-md bg-primary/5 border border-primary/10 p-2 flex items-center gap-2 text-xs">
        <span className="shrink-0">🤖</span>
        <p className="text-foreground/80 leading-relaxed flex-1 line-clamp-2">
          {insight}
        </p>
        <Link
          to={`/consultant?q=${aiQuery}`}
          className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap shrink-0"
        >
          Запитати AI <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
