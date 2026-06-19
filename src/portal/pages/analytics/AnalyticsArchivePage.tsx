import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getDatasetSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { SlidersHorizontal, History, ArrowRight } from "lucide-react";
import { FINANCIAL_INDICES } from "@/portal/data/finder";
import { KEY_FIGURES_HISTORY } from "@/portal/data/indicesMethodology";
import { CURRENCY_HISTORY, FORECASTS } from "@/portal/data/forecasts";
import { ArchiveSeriesCard, type ArchiveSeries } from "@/portal/components/analytics/ArchiveSeriesCard";
import { ArchiveFilterPanel, type ArchiveCategory, type ArchiveRange } from "@/portal/components/analytics/ArchiveFilterPanel";

const RANGE_YEARS: Record<ArchiveRange, number | null> = {
  "1y": 1, "3y": 3, "5y": 5, "10y": 10, "all": null,
};

function parsePeriod(p: string): Date {
  // "2026" | "2026-01" | "2026 Q1" | "2026-Q1"
  const yMatch = p.match(/^(\d{4})/);
  const year = yMatch ? Number(yMatch[1]) : new Date().getFullYear();
  const monthMatch = p.match(/-(\d{2})/);
  const qMatch = p.match(/Q(\d)/);
  let month = 0;
  if (monthMatch) month = Number(monthMatch[1]) - 1;
  else if (qMatch) month = (Number(qMatch[1]) - 1) * 3;
  return new Date(year, month, 1);
}

function buildAllSeries(): ArchiveSeries[] {
  const series: ArchiveSeries[] = [];

  // Currencies
  for (const c of CURRENCY_HISTORY) {
    series.push({
      id: `cur-${c.currency}`,
      category: "currency",
      label: `${c.flag} ${c.name} / UAH`,
      unit: "₴",
      source: "НБУ",
      sourceUrl: "https://bank.gov.ua",
      points: c.history.map((h) => ({ period: h.date, value: h.value })),
      badge: c.currency,
    });
  }

  // Indices
  for (const idx of FINANCIAL_INDICES.indices) {
    series.push({
      id: `idx-${idx.id}`,
      category: "indices",
      label: idx.name,
      unit: idx.unit.includes("%") ? "%" : idx.unit.includes("грн") ? "₴" : "",
      source: idx.source,
      sourceUrl: idx.sourceUrl,
      points: idx.history.map((h) => ({ period: h.date, value: h.value })),
      note: idx.whyItMatters,
    });
  }

  // Key figures
  for (const fig of KEY_FIGURES_HISTORY) {
    series.push({
      id: `key-${fig.id}`,
      category: "key",
      label: fig.name,
      unit: fig.unit.includes("грн") ? "₴" : "",
      source: "ПКУ / КМУ",
      sourceUrl: "https://zakon.rada.gov.ua",
      points: fig.years.map((y) => ({ period: String(y.year), value: y.value })),
      note: fig.impact,
      badge: fig.totalGrowth,
    });
  }

  // Forecasts
  for (const f of FORECASTS) {
    const points = [
      ...f.actuals.map((a) => ({ period: a.period, value: a.value, isForecast: false })),
      ...f.forecast.map((p) => ({ period: p.period, value: p.value, isForecast: true })),
    ];
    series.push({
      id: `fc-${f.id}`,
      category: "forecast",
      label: f.label,
      unit: f.unit,
      source: f.source,
      sourceUrl: f.sourceUrl,
      points,
      note: f.note,
      badge: f.horizon,
    });
  }

  return series;
}

export default function AnalyticsArchivePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = (searchParams.get("cat") as ArchiveCategory) || "all";
  const range = (searchParams.get("range") as ArchiveRange) || "all";
  const query = searchParams.get("q") || "";
  const [sheetOpen, setSheetOpen] = useState(false);

  const update = (k: string, v: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!v || v === "all" || v === "") next.delete(k);
    else next.set(k, v);
    setSearchParams(next, { replace: true });
  };

  const allSeries = useMemo(buildAllSeries, []);

  const counts = useMemo(() => {
    const c: Record<ArchiveCategory, number> = { all: allSeries.length, currency: 0, indices: 0, key: 0, forecast: 0 };
    for (const s of allSeries) c[s.category]++;
    return c;
  }, [allSeries]);

  const filtered = useMemo(() => {
    const cutoff = RANGE_YEARS[range];
    const now = new Date(2026, 3, 30);
    const cutoffDate = cutoff ? new Date(now.getFullYear() - cutoff, now.getMonth(), 1) : null;
    const q = query.trim().toLowerCase();

    return allSeries
      .filter((s) => category === "all" || s.category === category)
      .filter((s) => !q || s.label.toLowerCase().includes(q))
      .map((s) => {
        if (!cutoffDate) return s;
        const points = s.points.filter((p) => parsePeriod(p.period) >= cutoffDate);
        return points.length >= 2 ? { ...s, points } : s;
      });
  }, [allSeries, category, range, query]);

  const activeCount = (category !== "all" ? 1 : 0) + (range !== "all" ? 1 : 0) + (query ? 1 : 0);

  const filterPanel = (
    <ArchiveFilterPanel
      category={category}
      range={range}
      query={query}
      onCategory={(v) => update("cat", v)}
      onRange={(v) => update("range", v)}
      onQuery={(v) => update("q", v)}
      onReset={() => setSearchParams({}, { replace: true })}
      counts={counts}
    />
  );

  return (
    <PortalLayout meta={{
      title: "Архів курсів, індексів і прогнозів | FINTODO",
      description: "Історичні значення курсів валют, ключових фінансових індексів та офіційні прогнози НБУ і Мінфіну.",
      canonical: `${SITE_URL}/analytics/archive`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Аналітика", url: `${SITE_URL}/analytics` },
        { name: "Архів", url: `${SITE_URL}/analytics/archive` },
      ])} />
      <JsonLd data={getDatasetSchema({
        name: "Архів фінансових показників України",
        description: "Історичні дані по курсах валют, депозитах, ставках, індексах за минулі періоди.",
        url: `${SITE_URL}/analytics/archive`,
        dateModified: new Date().toISOString().slice(0, 10),
        sourceName: "НБУ, Держстат",
        sourceUrl: "https://bank.gov.ua/ua/statistic",
        keywords: ["архів", "історичні дані", "курси", "інфляція", "ставки"],
        temporalCoverage: "2014/..",
      })} />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Аналітика", to: "/analytics" },
          { label: "Архів" },
        ]} />

        <header className="py-6 space-y-2">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-[10px]">Архів і прогнози</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Архів курсів, індексів і прогнозів
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Історичні ряди валютних курсів, ключових фінансових показників і офіційні прогнози НБУ та Мінфіну в одному місці.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6 pb-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
              {filterPanel}
            </div>
          </aside>

          <div className="space-y-4">
            {/* Mobile toolbar */}
            <div className="flex items-center justify-between gap-2 lg:hidden">
              <p className="text-sm text-muted-foreground">{filtered.length} рядів</p>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                    Фільтри{activeCount > 0 ? ` (${activeCount})` : ""}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Фільтри архіву</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">{filterPanel}</div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop counter */}
            <div className="hidden lg:flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Знайдено {filtered.length} {filtered.length === 1 ? "ряд" : "рядів"}</p>
            </div>

            {filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
                Нічого не знайдено. Спробуйте скинути фільтри.
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((s) => <ArchiveSeriesCard key={s.id} series={s} />)}
              </div>
            )}

            {/* CTA */}
            <Card className="border-primary/20 bg-primary/5 mt-6">
              <CardContent className="p-5 space-y-3">
                <p className="font-semibold text-foreground">Потрібен глибший аналіз?</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/analytics/currency">Курси валют <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/analytics/indices">Фінансові індекси <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/analytics/deposits">Депозити <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
