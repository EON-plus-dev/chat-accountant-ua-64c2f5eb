import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, ExternalLink, Activity } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  INFLATION_INDEX,
  INFLATION_DATA_AS_OF,
  INFLATION_SOURCE_URL,
  INFLATION_INDEXATION_THRESHOLD,
  getLatestInflation,
  getCumulativeIndex,
} from "@/portal/data/inflationIndex";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from "recharts";

const InflationIndexPage = () => {
  const latest = getLatestInflation();
  const dates = INFLATION_INDEX.map((p) => p.date);

  const [fromDate, setFromDate] = useState(dates[Math.max(0, dates.length - 13)]);
  const [toDate, setToDate] = useState(dates[dates.length - 1]);
  const [amount, setAmount] = useState(10000);

  const chartData = useMemo(
    () =>
      INFLATION_INDEX.map((p) => ({
        date: p.date.slice(0, 7),
        mm: p.monthOverMonth,
        yy: p.yearOverYear,
      })),
    [],
  );

  const cumulativeIdx = getCumulativeIndex(fromDate, toDate);
  const indexedAmount = cumulativeIdx ? amount * cumulativeIdx : null;
  const inflationPct = cumulativeIdx ? (cumulativeIdx - 1) * 100 : null;

  return (
    <PortalLayout
      meta={{
        title: "Індекс інфляції — місячна динаміка ІСЦ України | FINTODO",
        description: `Індекс споживчих цін: m/m і y/y по місяцях. Кумулятивний розрахунок для індексації зобовʼязань (ст. 625 ЦКУ), зарплати, аліментів. Snapshot ${INFLATION_DATA_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/indeks-infliatsii`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Індекс інфляції", url: `${SITE_URL}/dovidnyky/indeks-infliatsii` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Індекс інфляції" },
          ]}
        />

        <div className="space-y-6 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Індекс інфляції (ІСЦ)
            </h1>
            <p className="text-muted-foreground">
              Місячні значення індексу споживчих цін від Держстату. Snapshot станом на {INFLATION_DATA_AS_OF}.
              Використовується для індексації грошових зобовʼязань (ст. 625 ЦКУ), зарплати (постанова КМУ № 1078),
              аліментів, оренди, страхових виплат.
            </p>
          </header>

          {/* Latest */}
          {latest && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Поточний місяць</div>
                <div className="text-lg font-semibold text-foreground">{latest.date.slice(0, 7)}</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">До попереднього місяця</div>
                <div className="text-2xl font-bold text-foreground tabular-nums">{latest.monthOverMonth}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {latest.monthOverMonth > 100 ? `+${(latest.monthOverMonth - 100).toFixed(1)}%` : `${(latest.monthOverMonth - 100).toFixed(1)}%`}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Рік до року</div>
                <div className="text-2xl font-bold text-foreground tabular-nums">{latest.yearOverYear}%</div>
                <div className="text-xs text-muted-foreground mt-1">+{(latest.yearOverYear - 100).toFixed(1)}% інфляція</div>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Поріг індексації ЗП</div>
                <div className="text-2xl font-bold text-foreground tabular-nums">{INFLATION_INDEXATION_THRESHOLD}%</div>
                <div className="text-xs text-muted-foreground mt-1">пост. КМУ № 1078</div>
              </Card>
            </div>
          )}

          {/* Calculator */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Калькулятор індексації</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Кумулятивний індекс = добуток m/m індексів за обраний період. Базис ст. 625 ЦКУ.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <Label className="text-xs">З місяця</Label>
                <select
                  className="w-full mt-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                >
                  {dates.map((d) => (
                    <option key={d} value={d}>
                      {d.slice(0, 7)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">По місяць</Label>
                <select
                  className="w-full mt-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                >
                  {dates.map((d) => (
                    <option key={d} value={d}>
                      {d.slice(0, 7)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs">Сума (грн)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
            {cumulativeIdx !== null && indexedAmount !== null && inflationPct !== null ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/40">
                  <div className="text-xs text-muted-foreground">Кумулятивний індекс</div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">
                    {(cumulativeIdx * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <div className="text-xs text-muted-foreground">Інфляція за період</div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">
                    {inflationPct >= 0 ? "+" : ""}
                    {inflationPct.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="text-xs text-muted-foreground">Сума з індексацією</div>
                  <div className="text-lg font-semibold tabular-nums text-foreground">
                    {indexedAmount.toLocaleString("uk-UA", { maximumFractionDigits: 2 })} ₴
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Оберіть коректний період.</p>
            )}
          </Card>

          {/* Chart YoY */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Інфляція рік до року (%)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[100, "dataMax + 2"]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <ReferenceLine y={105} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: "Ціль НБУ 5%", position: "right", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Line type="monotone" dataKey="yy" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="y/y" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart MoM */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Місяць до місяця (%)</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[98, "dataMax + 1"]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <ReferenceLine y={100} stroke="hsl(var(--muted-foreground))" />
                  <Bar dataKey="mm" fill="hsl(var(--primary))" name="m/m" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Table */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Таблиця індексів</h2>
              <a
                href={INFLATION_SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Джерело ukrstat.gov.ua <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Місяць</th>
                    <th className="py-2 px-3 font-medium text-right">m/m</th>
                    <th className="py-2 px-3 font-medium text-right">y/y</th>
                    <th className="py-2 px-3 font-medium text-right">Індексація ЗП</th>
                  </tr>
                </thead>
                <tbody>
                  {[...INFLATION_INDEX].reverse().map((p) => {
                    const reachesThreshold = p.monthOverMonth >= INFLATION_INDEXATION_THRESHOLD;
                    return (
                      <tr key={p.date} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-3 text-foreground tabular-nums">{p.date.slice(0, 7)}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-foreground">{p.monthOverMonth}%</td>
                        <td className="py-2 px-3 text-right tabular-nums text-foreground">{p.yearOverYear}%</td>
                        <td className="py-2 px-3 text-right">
                          {reachesThreshold ? (
                            <Badge variant="default" className="text-[10px]">+</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Як читати таблицю:</strong> m/m {">"} 100 = ціни виросли. Для індексації
              зарплати (постанова КМУ № 1078) потрібен сукупний індекс {">"} 103% від базового місяця.
            </p>
            <p>
              <Link to="/dovidnyky/kursy-nbu" className="text-primary hover:underline">
                Курси НБУ →
              </Link>
              <span className="mx-2">·</span>
              <Link to="/dovidnyky/stavky" className="text-primary hover:underline">
                Інші показники →
              </Link>
              <span className="mx-2">·</span>
              <Link to="/analytics/indices" className="text-primary hover:underline">
                Макроіндекси у реальному часі →
              </Link>
            </p>
          </div>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="indeks-infliatsii" />
    </PortalLayout>
  );
};

export default InflationIndexPage;
