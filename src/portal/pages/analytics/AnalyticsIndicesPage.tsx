import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getDatasetSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FINANCIAL_INDICES } from "@/portal/data/finder";
import { Sparkline } from "@/components/ui/Sparkline";
import { ArrowRight, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { AsOfDatePicker } from "@/portal/components/analytics/AsOfDatePicker";
import { getValueAsOf, parseHistoryDate } from "@/portal/lib/historyAsOf";

const trendColor = (id: string, trend: string): "success" | "warning" | "destructive" | "primary" => {
  if (trend === 'stable') return 'primary';
  if (id === 'inflation') return trend === 'up' ? 'destructive' : 'success';
  return trend === 'down' ? 'destructive' : 'success';
};

const trendTextColor = (id: string, trend: string) => {
  if (trend === 'stable') return 'text-muted-foreground';
  if (id === 'inflation') return trend === 'up' ? 'text-destructive' : 'text-chart-2';
  return trend === 'down' ? 'text-destructive' : 'text-chart-2';
};

export default function AnalyticsIndicesPage() {
  const [asOf, setAsOf] = useState<Date | undefined>();

  return (
    <PortalLayout meta={{
      title: "Фінансові індекси України 2025 — облікова ставка, інфляція | FINTODO",
      description: "Облікова ставка НБУ 14.5%, інфляція 12.8%, мінзарплата 8000 ₴. Актуальні дані з офіційних джерел.",
      canonical: `${SITE_URL}/analytics/indices`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Аналітика", url: `${SITE_URL}/analytics` },
        { name: "Фінансові індекси", url: `${SITE_URL}/analytics/indices` },
      ])} />
      <JsonLd data={getDatasetSchema({
        name: "Фінансові індекси України",
        description: "Облікова ставка НБУ, інфляція, мінімальна зарплата, прожитковий мінімум — актуальні значення з офіційних джерел.",
        url: `${SITE_URL}/analytics/indices`,
        dateModified: FINANCIAL_INDICES.meta.lastUpdatedISO,
        sourceName: "НБУ, Держстат, Мінфін",
        sourceUrl: "https://bank.gov.ua/ua/markets/refinancing-rate",
        keywords: ["облікова ставка", "інфляція", "мінімальна зарплата", "прожитковий мінімум", "НБУ"],
        temporalCoverage: "2014/..",
      })} />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Аналітика", to: "/analytics" },
          { label: "Фінансові індекси" },
        ]} />

        <header className="py-6 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Фінансові індекси</h1>
          <p className="text-muted-foreground text-sm">Ключові фінансові показники України — актуальні дані з офіційних джерел</p>
          <div className="flex flex-wrap items-center gap-3">
            <AsOfDatePicker
              value={asOf}
              onChange={setAsOf}
              minDate={new Date(2014, 0, 1)}
            />
            <p className="text-xs text-muted-foreground">
              {asOf
                ? `Знімок станом на ${format(asOf, "d MMMM yyyy", { locale: uk })}`
                : `Оновлено: ${FINANCIAL_INDICES.meta.lastUpdated} · ${FINANCIAL_INDICES.meta.source}`}
            </p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {FINANCIAL_INDICES.indices.map(idx => {
            const isHistorical = !!asOf;
            const snapshot = isHistorical ? getValueAsOf(idx.history.map(h => ({ date: h.date, value: h.value })), asOf!) : null;

            const histValuesAll = idx.history.map(h => h.value);
            const histValues = snapshot ? snapshot.pointsUpTo.map(p => p.value) : histValuesAll;

            // Compute display value, change, trend
            let displayValue = idx.value;
            let change = idx.change;
            let trend: 'up' | 'down' | 'stable' = idx.trend;
            let changeDateLabel = idx.changeDate;
            const unitSuffix = idx.unit.includes('%') ? '%' : (idx.unit.includes('грн') ? ' ₴' : '');

            if (snapshot) {
              const v = snapshot.value;
              displayValue = unitSuffix === ' ₴'
                ? `${v.toLocaleString('uk-UA')} ₴`
                : unitSuffix === '%'
                  ? `${v}%`
                  : String(v);
              if (snapshot.prevValue !== undefined) {
                change = +(v - snapshot.prevValue).toFixed(2);
                trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
              } else {
                change = 0;
                trend = 'stable';
              }
              changeDateLabel = format(parseHistoryDate(snapshot.date), "MMMM yyyy", { locale: uk });
            }

            const noData = isHistorical && !snapshot;

            return (
              <Card key={idx.id} className={cn(noData && "opacity-60")}>
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{idx.name}</p>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xl font-bold font-mono text-foreground">
                          {noData ? "—" : displayValue}
                        </span>
                        {!noData && change !== undefined && change !== 0 && (
                          <span className={cn("flex items-center gap-1 text-xs", trendTextColor(idx.id, trend))}>
                            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {change > 0 ? '+' : ''}{change}{unitSuffix === '%' ? '%' : ''}
                          </span>
                        )}
                        {!noData && (change === 0 || change === undefined) && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Minus className="h-3 w-3" /> без змін
                          </span>
                        )}
                      </div>
                    </div>
                    {histValues.length >= 2 && (
                      <Sparkline data={histValues} width={84} height={32} color={trendColor(idx.id, trend)} />
                    )}
                  </div>

                  {noData && (
                    <p className="text-xs text-muted-foreground italic">Немає даних на вибрану дату</p>
                  )}

                  {/* Next update — only in live mode */}
                  {!isHistorical && idx.nextUpdateDate && (
                    <p className="text-xs text-muted-foreground">
                      Наступне оновлення: <span className="font-medium text-foreground">{idx.nextUpdateDate}</span>
                    </p>
                  )}

                  {/* Why it matters */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{idx.whyItMatters}</p>

                  {/* Source */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    <a href={idx.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                      {idx.source} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <span>{changeDateLabel}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FINTODO CTA */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-foreground">FINTODO використовує ці дані автоматично</p>
              <p className="text-sm text-muted-foreground">
                Мінімальний ЄСВ, ставки податків, курси валют — все оновлюється без вашої участі.
              </p>
            </div>
            <Button asChild>
              <Link to={CTA_CHECKOUT_URL}>
                Почати безкоштовно <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
