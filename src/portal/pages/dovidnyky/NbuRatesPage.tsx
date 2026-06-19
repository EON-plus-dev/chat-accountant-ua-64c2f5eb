import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ExternalLink, DollarSign } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  NBU_RATES_HISTORY,
  NBU_CURRENCY_LABEL,
  NBU_CURRENCY_SHORT,
  NBU_DATA_AS_OF,
  NBU_SOURCE_URL,
  getLatestRate,
  getYoyChange,
  type NbuCurrency,
} from "@/portal/data/nbuRatesHistory";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CURRENCIES: NbuCurrency[] = ["USD", "EUR", "PLN", "GBP"];

const COLORS: Record<NbuCurrency, string> = {
  USD: "hsl(var(--primary))",
  EUR: "hsl(var(--chart-2, 173 58% 39%))",
  PLN: "hsl(var(--chart-3, 43 74% 49%))",
  GBP: "hsl(var(--chart-4, 280 65% 60%))",
};

const NbuRatesPage = () => {
  const [selected, setSelected] = useState<NbuCurrency[]>(["USD", "EUR"]);

  const chartData = useMemo(() => {
    const dateSet = new Set<string>();
    NBU_RATES_HISTORY.forEach((s) => s.points.forEach((p) => dateSet.add(p.date)));
    const dates = Array.from(dateSet).sort();
    return dates.map((date) => {
      const row: Record<string, string | number> = { date: date.slice(0, 7) };
      for (const cur of selected) {
        const series = NBU_RATES_HISTORY.find((s) => s.currency === cur);
        const point = series?.points.find((p) => p.date === date);
        if (point) row[cur] = point.rate;
      }
      return row;
    });
  }, [selected]);

  const toggleCurrency = (cur: NbuCurrency) => {
    setSelected((prev) =>
      prev.includes(cur) ? (prev.length > 1 ? prev.filter((c) => c !== cur) : prev) : [...prev, cur],
    );
  };

  return (
    <PortalLayout
      meta={{
        title: "Курси НБУ — історія USD, EUR, PLN, GBP до гривні | FINTODO",
        description: `Офіційні курси НБУ — місячна динаміка з січня 2024 по ${NBU_DATA_AS_OF}. Для бухгалтерії, курсових різниць і перерахунку валютних авансів.`,
        canonical: `${SITE_URL}/dovidnyky/kursy-nbu`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Курси НБУ", url: `${SITE_URL}/dovidnyky/kursy-nbu` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Курси НБУ" },
          ]}
        />

        <div className="space-y-6 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Курси НБУ — історія
            </h1>
            <p className="text-muted-foreground">
              Офіційні курси Національного банку України на кінець місяця. Snapshot станом на {NBU_DATA_AS_OF}.
              Дані для бухгалтерського обліку курсових різниць (П(С)БО 21, МСФЗ 21), перерахунку інвалютних
              авансів і декларації єдиного податку.
            </p>
          </header>

          {/* Latest values */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {CURRENCIES.map((cur) => {
              const latest = getLatestRate(cur);
              const yoy = getYoyChange(cur);
              if (!latest) return null;
              return (
                <Card key={cur} className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">{NBU_CURRENCY_LABEL[cur]}</div>
                  <div className="text-2xl font-bold text-foreground tabular-nums">
                    {latest.rate.toFixed(4)} ₴
                  </div>
                  {yoy !== null && (
                    <div className={`text-xs flex items-center gap-1 mt-1 ${yoy >= 0 ? "text-destructive" : "text-emerald-600"}`}>
                      {yoy >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span className="tabular-nums">{yoy >= 0 ? "+" : ""}{yoy.toFixed(2)}%</span>
                      <span className="text-muted-foreground">р/р</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Currency toggle */}
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((cur) => (
              <Button
                key={cur}
                variant={selected.includes(cur) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCurrency(cur)}
              >
                {NBU_CURRENCY_SHORT[cur]}
              </Button>
            ))}
          </div>

          {/* Chart */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Динаміка курсу</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Legend />
                  {selected.map((cur) => (
                    <Line
                      key={cur}
                      type="monotone"
                      dataKey={cur}
                      stroke={COLORS[cur]}
                      strokeWidth={2}
                      dot={false}
                      name={NBU_CURRENCY_SHORT[cur]}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Table */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Місячна таблиця</h2>
              <a
                href={NBU_SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Джерело bank.gov.ua <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Місяць</th>
                    {CURRENCIES.map((cur) => (
                      <th key={cur} className="py-2 px-3 font-medium text-right">
                        {NBU_CURRENCY_SHORT[cur]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData
                    .slice()
                    .reverse()
                    .map((row) => (
                      <tr key={row.date as string} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-3 text-foreground tabular-nums">{row.date}</td>
                        {CURRENCIES.map((cur) => {
                          const series = NBU_RATES_HISTORY.find((s) => s.currency === cur);
                          const point = series?.points.find((p) => p.date.startsWith(row.date as string));
                          return (
                            <td key={cur} className="py-2 px-3 text-right tabular-nums text-foreground">
                              {point ? point.rate.toFixed(4) : <span className="text-muted-foreground">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Як користуватись:</strong> для оприбуткування інвалютної виручки
              на дату операції використовується офіційний курс НБУ на ту саму дату; для перерахунку залишків і
              авансів у звітності — курс на дату балансу.
            </p>
            <p>
              <Link to="/dovidnyky/stavky" className="text-primary hover:underline">
                Інші макропоказники →
              </Link>
              <span className="mx-2">·</span>
              <Link to="/dovidnyky/indeks-infliatsii" className="text-primary hover:underline">
                Індекс інфляції →
              </Link>
              <span className="mx-2">·</span>
              <Link to="/analytics/currency" className="text-primary hover:underline">
                Денні курси і прогнози →
              </Link>
            </p>
          </div>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="kursy-nbu" />
    </PortalLayout>
  );
};

export default NbuRatesPage;
