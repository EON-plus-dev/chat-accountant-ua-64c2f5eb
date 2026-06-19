import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { INSTITUTION_PROFILES, type FullInstitutionProfile } from "@/portal/data/institutionProfiles";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const TYPE_LABELS: Record<string, string> = {
  bank: 'Банк',
  fintech: 'Фінтех',
  insurance: 'Страхова',
  broker: 'Брокер',
  investment: 'Інвестиції',
  logistics: 'Логістика',
  payment_system: 'Платіжна система',
  money_transfer: 'Грошові перекази',
  accounting_software: 'Бухгалтерія',
  tax_automation: 'Автоматизація податків',
  edo: 'ЕДО',
  reporting: 'Звітність',
  digital_signature: 'ЕЦП',
  gov_service: 'Держсервіс',
  cashier_software: 'Каса',
  prro: 'ПРРО',
  startup_hub: 'Стартап-хаб',
  coworking: 'Коворкінг',
  grant_program: 'Грантова програма',
  development: 'Розвиток',
  personal: 'Фізособи',
  acquiring: 'Еквайринг',
  credit_bureau: 'Бюро кредитних історій',
  legal_service: 'Юридичний сервіс',
  legal_database: 'Правова база',
  legal_consulting: 'Юридичний консалтинг',
  ovdp: 'ОВДП',
  pension_fund: 'Пенсійний фонд',
  tax_service: 'Податкова служба',
  social_insurance: 'Соцстрахування',
};

const scoreLabel = (score: number) => {
  if (score >= 90) return { label: "Відмінно", className: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 80) return { label: "Дуже добре", className: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 70) return { label: "Добре", className: "text-amber-600 dark:text-amber-400" };
  if (score >= 60) return { label: "Задовільно", className: "text-amber-600 dark:text-amber-400" };
  return { label: "Слабко", className: "text-red-600 dark:text-red-400" };
};

const scoreRingColor = (score: number) => {
  if (score >= 85) return "stroke-emerald-500";
  if (score >= 70) return "stroke-amber-500";
  return "stroke-red-500";
};

const barColor = (pct: number) => {
  if (pct >= 85) return "bg-emerald-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-red-500";
};

const barTextColor = (pct: number) => {
  if (pct >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

interface Props {
  profile: FullInstitutionProfile;
  heroRef: React.RefObject<HTMLDivElement>;
}

export const ProfileHero = ({ profile, heroRef }: Props) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sl = scoreLabel(profile.ratings.fintodo.overall);
  const categoryCount = INSTITUTION_PROFILES.filter(p =>
    p.ratings.fintodo.categorySlug === profile.ratings.fintodo.categorySlug
  ).length;

  const overall = profile.ratings.fintodo.overall;
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (overall / 100) * circumference;

  const normalizedScores = profile.editorial.scores.map(s => ({
    category: s.category,
    pct: Math.round((s.score / s.maxScore) * 100),
  }));

  const ScoreRing = ({ size = 88, className = "" }: { size?: number; className?: string }) => (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r="36" fill="none" strokeWidth="5" className="stroke-muted/40" />
        <circle
          cx="40" cy="40" r="36" fill="none" strokeWidth="5"
          strokeLinecap="round"
          className={scoreRingColor(overall)}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black leading-none ${sl.className}`}>{overall}</span>
        <span className="text-[9px] text-muted-foreground">з 100</span>
      </div>
    </div>
  );

  const CategoryBars = () => (
    <div className="space-y-1.5">
      {normalizedScores.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground w-[80px] truncate text-right">{s.category}</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div className={`h-full rounded-full ${barColor(s.pct)} transition-all`} style={{ width: `${s.pct}%` }} />
          </div>
          <span className={`font-mono text-[11px] font-bold w-6 text-right ${barTextColor(s.pct)}`}>{s.pct}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div ref={heroRef}>
      <span className="sr-only">{profile.legalName} · {profile.brandNames.join(", ")}</span>

      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
          style={{ backgroundColor: profile.logo.color }}
        >
          {profile.logo.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{profile.name}</h1>
            {profile.verified && (
              <Badge variant="secondary" size="sm">✓ Перевірено</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{profile.editorial.oneLiner}</p>
          {profile.editorial.bestFor && profile.editorial.bestFor.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">Для:</span> {profile.editorial.bestFor[0].emoji} {profile.editorial.bestFor[0].segment}
            </p>
          )}

          {/* Mobile score — collapsible */}
          <div className="sm:hidden mt-2">
            <Collapsible open={mobileOpen} onOpenChange={setMobileOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 group">
                <span className={`text-lg font-black ${sl.className}`}>{overall}/100</span>
                <span className="text-xs text-muted-foreground">· {sl.label}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <span className="text-[10px] text-muted-foreground block">
                  #{profile.ratings.fintodo.rank} з {categoryCount} · {profile.ratings.fintodo.categoryName}
                </span>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Type badges + external ratings + last updated */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {Array.from(
              new Map(
                profile.types.map(t => [(TYPE_LABELS[t] || t).trim().toLowerCase(), t])
              ).values()
            ).map(t => (
              <Badge key={t} variant="secondary" size="sm">{TYPE_LABELS[t] || t}</Badge>
            ))}
            <span className="text-muted-foreground">·</span>
            {profile.ratings.external.map(ext => (
              <span key={ext.source} className="text-xs text-muted-foreground inline-flex items-center gap-0.5">
                <span className="text-amber-500">★</span> {ext.rating}/{ext.maxRating}
                <span className="hidden sm:inline"> {ext.source}</span>
                {ext.reviewCount ? <span className="hidden sm:inline"> ({ext.reviewCount.toLocaleString()})</span> : ""}
              </span>
            ))}
            <span className="text-muted-foreground">·</span>
            <time className="text-xs text-muted-foreground">{profile.dataLastUpdated}</time>
          </div>
        </div>

        {/* Desktop score card */}
        <div className="shrink-0 hidden sm:flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/50 backdrop-blur p-3 shadow-sm w-[230px]">
          <div className="flex items-center gap-3">
            <ScoreRing size={76} />
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${sl.className}`}>{sl.label}</span>
              <span className="text-[10px] text-muted-foreground">
                #{profile.ratings.fintodo.rank} з {categoryCount}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                {profile.ratings.fintodo.categoryName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
