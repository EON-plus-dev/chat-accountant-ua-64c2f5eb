import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Minus, Handshake, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

/* ── News helpers ── */
const newsTypeLabel = (t: string) => {
  const map: Record<string, string> = {
    product_launch: "Нові продукти", pricing_change: "Зміна тарифів", award: "Нагорода",
    regulatory: "Регуляторне", partnership: "Партнерство", leadership: "Керівництво",
    expansion: "Розширення", controversy: "Скандал", financial: "Фінансове",
    changelog_pricing: "Тарифи", changelog_feature: "Функція", changelog_policy: "Політика",
    changelog_fix: "Виправлення", changelog_expansion: "Розширення",
  };
  return map[t] || t;
};
const newsTypeVariant = (t: string): "success" | "warning" | "info" | "secondary" => {
  if (["product_launch", "award", "expansion", "changelog_feature", "changelog_expansion"].includes(t)) return "success";
  if (["pricing_change", "controversy", "changelog_pricing"].includes(t)) return "warning";
  if (["partnership", "leadership", "changelog_policy"].includes(t)) return "info";
  return "secondary";
};

const MAX_NEWS = 5;
const MAX_NEWS_WITH_SUMMARY = 3;

interface Props {
  profile: FullInstitutionProfile;
}

export const ProfileCompare = ({ profile }: Props) => {
  const [showAllNews, setShowAllNews] = useState(false);

  const hasComparisons = profile.comparisons && profile.comparisons.length > 0;
  const hasNews = profile.news && profile.news.length > 0;
  const hasChangelog = profile.changelog && profile.changelog.length > 0;
  const hasPartnerships = profile.partnerships && profile.partnerships.length > 0;

  // Graceful degradation: don't render empty section
  if (!hasComparisons && !hasNews && !hasChangelog && !hasPartnerships) return null;

  /* ── News + changelog merged timeline ── */
  interface TimelineItem { date: string; dateISO: string; title: string; summary: string; type: string; sourceUrl?: string }
  const newsItems: TimelineItem[] = profile.news.map(n => ({
    date: n.date, dateISO: n.dateISO, title: n.title, summary: n.summary, type: n.type, sourceUrl: n.sourceUrl,
  }));
  const changelogItems: TimelineItem[] = profile.changelog.map(ch => ({
    date: ch.date, dateISO: ch.date, title: ch.changes[0] || "Зміна",
    summary: ch.changes.slice(1).join(". "), type: `changelog_${ch.type}`, sourceUrl: undefined,
  }));
  const allNewsItems = [...newsItems, ...changelogItems].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  const visibleNews = showAllNews ? allNewsItems : allNewsItems.slice(0, MAX_NEWS);
  const hiddenNewsCount = allNewsItems.length - MAX_NEWS;

  return (
    <section id="compare" className="border-t border-border pt-6 mt-8 scroll-mt-28">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <ArrowLeftRight className="w-6 h-6 text-primary" /> Порівняння
      </h2>

      {/* ── Comparisons ── */}
      {hasComparisons && (
        <div className="mt-4 space-y-3">
          {profile.comparisons.map((comp, i) => (
            <Card key={i} className="p-4">
              <h3 className="text-base font-semibold text-foreground mb-3">{profile.name} vs {comp.competitorName}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-emerald-500/5 p-3">
                  <p className="font-medium text-foreground mb-2 flex items-center gap-1.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" /> Де {profile.name} кращий
                  </p>
                  <div className="space-y-1.5">
                    {comp.ourAdvantages.map((a, j) => (
                      <div key={j} className="text-sm"><span className="font-medium text-foreground">{a.area}</span> <span className="text-muted-foreground">— {a.detail}</span></div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-amber-500/5 p-3">
                  <p className="font-medium text-foreground mb-2 flex items-center gap-1.5 text-sm">
                    <Minus className="w-4 h-4 text-muted-foreground" /> Де {comp.competitorName} кращий
                  </p>
                  <div className="space-y-1.5">
                    {comp.theirAdvantages.map((a, j) => (
                      <div key={j} className="text-sm"><span className="font-medium text-foreground">{a.area}</span> <span className="text-muted-foreground">— {a.detail}</span></div>
                    ))}
                  </div>
                </div>
              </div>
              {comp.equalAreas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-xs text-muted-foreground self-center">Нарівні:</span>
                  {comp.equalAreas.map((area, j) => (
                    <Badge key={j} variant="secondary" size="sm">{area}</Badge>
                  ))}
                </div>
              )}
              <blockquote className="border-l-2 border-primary pl-3 mt-3 text-sm italic text-foreground">{comp.bottomLine}</blockquote>
              <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                <div className="bg-emerald-500/5 border-l-2 border-emerald-500 rounded-r-lg pl-3 pr-2 py-2">
                  <span className="font-medium text-foreground">Обирайте {profile.name} якщо: </span>
                  <span className="text-muted-foreground">{comp.whenChooseUs}</span>
                </div>
                <div className="bg-amber-500/5 border-l-2 border-amber-500 rounded-r-lg pl-3 pr-2 py-2">
                  <span className="font-medium text-foreground">Обирайте {comp.competitorName} якщо: </span>
                  <span className="text-muted-foreground">{comp.whenChooseThem}</span>
                </div>
              </div>
              {comp.compareUrl && (
                <Link to={comp.compareUrl} className="text-sm text-primary hover:underline mt-3 inline-block">Детальне порівняння →</Link>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── News & changelog ── */}
      {allNewsItems.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-foreground mb-2">Новини та зміни</p>
          <div>
            {visibleNews.map((n, i) => (
              <div key={i} className="flex items-start gap-3 mb-2">
                <time dateTime={n.dateISO} className="text-xs text-muted-foreground font-mono w-20 shrink-0 pt-0.5">{n.date}</time>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={newsTypeVariant(n.type)} size="sm" className="shrink-0">{newsTypeLabel(n.type)}</Badge>
                    <span className="font-medium text-foreground text-sm truncate">{n.title}</span>
                    {n.sourceUrl && (
                      <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline shrink-0 ml-auto">↗</a>
                    )}
                  </div>
                  {n.summary && i < MAX_NEWS_WITH_SUMMARY && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.summary}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {hiddenNewsCount > 0 && !showAllNews && (
            <button onClick={() => setShowAllNews(true)} className="text-sm text-primary hover:underline mt-1">
              Показати ще {hiddenNewsCount}
            </button>
          )}
        </div>
      )}

      {/* ── Partnerships ── */}
      {profile.partnerships.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Handshake className="w-4 h-4 text-primary" /> Партнерства
          </p>
          <div className="space-y-1.5">
            {profile.partnerships.map((p, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-foreground">{p.partner}</span>
                <span className="text-muted-foreground"> — {p.description}</span>
                {p.since && <span className="text-xs text-muted-foreground ml-1">({p.since})</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
