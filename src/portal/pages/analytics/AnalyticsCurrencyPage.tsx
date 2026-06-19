import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getDatasetSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRENCY_RATES } from "@/portal/data/finder";
import { CURRENCY_HISTORY } from "@/portal/data/forecasts";
import { Sparkline } from "@/components/ui/Sparkline";
import { useNBUFinderRates } from "@/hooks/useNBUFinderRates";
import { ArrowRight, Info, WifiOff, History as HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { AsOfDatePicker } from "@/portal/components/analytics/AsOfDatePicker";
import { getValueAsOf } from "@/portal/lib/historyAsOf";

export default function AnalyticsCurrencyPage() {
  const [activeCurrency, setActiveCurrency] = useState("USD");
  const [convertAmount, setConvertAmount] = useState(1000);

  const [asOf, setAsOf] = useState<Date | undefined>();
  const isHistorical = !!asOf;

  const { rates: liveRates, history, isLoading, isLive, lastUpdated } = useNBUFinderRates(activeCurrency);

  // Merge live rates into static data
  const staticRate = CURRENCY_RATES.rates.find(r => r.currency === activeCurrency)!;
  const live = liveRates.get(activeCurrency);

  // Historical snapshot from CURRENCY_HISTORY
  const histSeries = CURRENCY_HISTORY.find(c => c.currency === activeCurrency);
  const snapshot = isHistorical && histSeries
    ? getValueAsOf(histSeries.history.map(h => ({ date: h.date, value: h.value })), asOf!)
    : null;

  const liveNbuRate = live?.rate ?? staticRate.nbuRate;
  const liveNbuChange = live?.change ?? staticRate.nbuChange;
  const liveNbuChangePercent = live?.changePercent ?? staticRate.nbuChangePercent;

  const nbuRate = snapshot ? snapshot.value : liveNbuRate;
  const nbuChange = snapshot
    ? (snapshot.prevValue !== undefined ? +(snapshot.value - snapshot.prevValue).toFixed(2) : 0)
    : liveNbuChange;
  const nbuChangePercent = snapshot
    ? (snapshot.prevValue ? +(((snapshot.value - snapshot.prevValue) / snapshot.prevValue) * 100).toFixed(2) : 0)
    : liveNbuChangePercent;

  const bestBuy = Math.max(...staticRate.banks.filter(b => b.buyRate).map(b => b.buyRate!));
  const bestSell = Math.min(...staticRate.banks.filter(b => b.sellRate).map(b => b.sellRate!));

  // Use snapshot history, live history or fallback to mock
  const sparklineData = snapshot
    ? snapshot.pointsUpTo.map(p => p.value)
    : history.length >= 2
      ? history
      : Array.from({ length: 30 }, () => nbuRate + (Math.random() - 0.5) * 0.6);

  const spreads = staticRate.banks
    .filter(b => b.buyRate && b.sellRate)
    .map(b => ({ name: b.bankName, spread: b.sellRate! - b.buyRate!, pct: ((b.sellRate! - b.buyRate!) / b.buyRate! * 100) }))
    .sort((a, b) => a.spread - b.spread);

  const updatedText = isLive && lastUpdated
    ? `Дані НБУ · ${lastUpdated.toLocaleString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    : CURRENCY_RATES.meta.lastUpdated;

  // Dynamic meta with live rate
  const usdLive = liveRates.get("USD");
  const eurLive = liveRates.get("EUR");
  const metaUsd = usdLive?.rate.toFixed(2) ?? CURRENCY_RATES.rates[0].nbuRate.toFixed(2);
  const metaEur = eurLive?.rate.toFixed(2) ?? CURRENCY_RATES.rates[1].nbuRate.toFixed(2);

  return (
    <PortalLayout meta={{
      title: `Курси валют банків України — порівняння сьогодні | FINTODO`,
      description: `USD ${metaUsd}, EUR ${metaEur}. Порівняйте курси купівлі і продажу в 10+ банках.`,
      canonical: `${SITE_URL}/analytics/currency`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Аналітика", url: `${SITE_URL}/analytics` },
        { name: "Курси валют", url: `${SITE_URL}/analytics/currency` },
      ])} />
      <JsonLd data={getDatasetSchema({
        name: "Курси валют банків України",
        description: "Щоденне порівняння курсів купівлі та продажу USD, EUR, PLN, GBP у 10+ банках України з історією від 2014 року.",
        url: `${SITE_URL}/analytics/currency`,
        dateModified: new Date().toISOString().slice(0, 10),
        sourceName: "Національний банк України",
        sourceUrl: "https://bank.gov.ua/ua/markets/exchangerates",
        keywords: ["курс валют", "USD", "EUR", "PLN", "НБУ", "банки України"],
        temporalCoverage: "2014/..",
      })} />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Аналітика", to: "/analytics" },
          { label: "Курси валют" },
        ]} />

        <header className="py-6 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Курси валют</h1>
          <p className="text-muted-foreground text-sm">Порівняння курсів купівлі і продажу валют у банках України</p>
          <div className="flex flex-wrap items-center gap-3">
            <AsOfDatePicker value={asOf} onChange={setAsOf} minDate={new Date(2014, 0, 1)} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isHistorical ? (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <HistoryIcon className="h-3 w-3" />
                  Історичний знімок · {format(asOf!, "d MMMM yyyy", { locale: uk })}
                </Badge>
              ) : (
                <>
                  <span>{updatedText}</span>
                  {!isLive && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <WifiOff className="h-3 w-3" />
                      Офлайн дані
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        {/* Currency tabs */}
        <div className="flex gap-2 pb-6 overflow-x-auto scrollbar-hide">
          {CURRENCY_RATES.rates.map(r => {
            const rl = liveRates.get(r.currency);
            return (
              <Button
                key={r.currency}
                variant={activeCurrency === r.currency ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCurrency(r.currency)}
              >
                {r.flag} {r.currency}
                {rl && <span className="ml-1.5 font-mono text-xs opacity-80">{rl.rate.toFixed(2)}</span>}
              </Button>
            );
          })}
        </div>

        {/* NBU rate card */}
        <Card className="mb-6">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm text-muted-foreground">
                Офіційний курс НБУ — {live?.name ?? staticRate.currencyName}
              </p>
              <p className="text-3xl font-bold font-mono text-foreground">{nbuRate.toFixed(2)} ₴</p>
              <div className={cn("flex items-center gap-1 text-sm", nbuChange > 0 ? "text-destructive" : nbuChange < 0 ? "text-chart-2" : "text-muted-foreground")}>
                <span>{nbuChange > 0 ? '▲' : nbuChange < 0 ? '▼' : '—'} {Math.abs(nbuChange).toFixed(2)} ({Math.abs(nbuChangePercent).toFixed(2)}%)</span>
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="w-[120px] h-[40px]" />
            ) : (
              <Sparkline data={sparklineData} width={120} height={40} color={nbuChange >= 0 ? "warning" : "success"} />
            )}
          </CardContent>
        </Card>

        {isHistorical ? (
          <Card className="mb-6 border-info/30 bg-info/5">
            <CardContent className="p-4 flex gap-3 items-start">
              <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Курси банків та спред доступні лише для актуальної дати. Зніміть фільтр дати, щоб побачити порівняння банків і конвертер за поточним курсом.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Bank comparison table */}
            <Card className="mb-6 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Банк</TableHead>
                      <TableHead className="text-right">Купівля</TableHead>
                      <TableHead className="text-right">Продаж</TableHead>
                      <TableHead className="text-right">Безготівковий</TableHead>
                      <TableHead>Примітка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staticRate.banks.map(b => (
                      <TableRow key={b.bankId}>
                        <TableCell className="font-medium">
                          {b.bankName}
                          {b.isOnline && <Badge variant="secondary" className="ml-2 text-[10px]">online</Badge>}
                        </TableCell>
                        <TableCell className={cn("text-right font-mono", b.buyRate === bestBuy && "text-chart-2 font-bold")}>
                          {b.buyRate?.toFixed(2) ?? '—'}
                        </TableCell>
                        <TableCell className={cn("text-right font-mono", b.sellRate === bestSell && "text-chart-2 font-bold")}>
                          {b.sellRate?.toFixed(2) ?? '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono">{b.cardRate?.toFixed(2) ?? '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{b.note ?? ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Spread indicator */}
            {spreads.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-5 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Спред (різниця купівлі/продажу)</p>
                  {spreads.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-mono", i === 0 ? "text-chart-2 font-semibold" : i === spreads.length - 1 ? "text-destructive" : "text-foreground")}>
                          {s.spread.toFixed(2)} ₴ ({s.pct.toFixed(1)}%)
                        </span>
                        {i === 0 && <Badge variant="secondary" className="text-[10px]">Найвигідніший</Badge>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Converter */}
        <Card className="mb-6">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Конвертер</p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 flex-1 w-full">
                <Input
                  type="number"
                  value={convertAmount}
                  onChange={e => setConvertAmount(Number(e.target.value))}
                  className="font-mono"
                />
                <span className="text-sm text-muted-foreground shrink-0">{activeCurrency}</span>
              </div>
              <span className="text-muted-foreground">↔</span>
              <div className="flex items-center gap-2 flex-1 w-full">
                <Input
                  type="text"
                  readOnly
                  value={(convertAmount * nbuRate).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  className="font-mono bg-muted"
                />
                <span className="text-sm text-muted-foreground shrink-0">UAH</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">За офіційним курсом НБУ</p>
          </CardContent>
        </Card>

        {/* Editorial note */}
        <Card className="mb-8 border-info/30 bg-info/5">
          <CardContent className="p-5 flex gap-3">
            <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-foreground">Редакція FINTODO</p>
              <p className="text-muted-foreground">
                Для переказів від іноземних клієнтів найвигідніше використовувати Wise (курс близький до НБУ, комісія 0.41%).
                FINTODO автоматично перераховує валютні надходження за курсом НБУ на дату зарахування — необхідно для декларування ФОП.
              </p>
              <Button variant="link" asChild className="p-0 h-auto">
                <Link to={CTA_CHECKOUT_URL}>Почати безкоштовно <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
