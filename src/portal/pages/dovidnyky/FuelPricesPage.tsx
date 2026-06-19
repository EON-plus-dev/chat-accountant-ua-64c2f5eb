import { useMemo, useState } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, TrendingDown, TrendingUp, Info, ExternalLink, ArrowUpDown } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  FUEL_CHAINS,
  FUEL_PRICES,
  FUEL_TYPE_LABEL,
  FUEL_AS_OF,
  FUEL_PRICE_SOURCE,
  getFuelStats,
  type FuelType,
} from "@/portal/data/fuelStations";

const FUEL_ORDER: FuelType[] = ['A95', 'A95+', 'A98', 'DT', 'DT+', 'LPG'];

const FuelPricesPage = () => {
  const [sortBy, setSortBy] = useState<FuelType | 'name'>('A95');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rows = useMemo(() => {
    const chainMap = Object.fromEntries(FUEL_CHAINS.map((c) => [c.id, c]));
    const merged = FUEL_PRICES.map((r) => ({ chain: chainMap[r.chainId], prices: r.prices }))
      .filter((r) => r.chain);

    merged.sort((a, b) => {
      if (sortBy === 'name') {
        return sortDir === 'asc'
          ? a.chain.name.localeCompare(b.chain.name)
          : b.chain.name.localeCompare(a.chain.name);
      }
      const va = a.prices[sortBy] ?? Infinity;
      const vb = b.prices[sortBy] ?? Infinity;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return merged;
  }, [sortBy, sortDir]);

  const stats = useMemo(() => {
    const s: Partial<Record<FuelType, { min: number; max: number; avg: number; count: number } | null>> = {};
    FUEL_ORDER.forEach((f) => (s[f] = getFuelStats(f)));
    return s;
  }, []);

  const toggleSort = (key: FuelType | 'name') => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  return (
    <PortalLayout
      meta={{
        title: `Ціни на паливо в Україні ${FUEL_AS_OF} — А95, ДП, газ по мережах АЗС | FINTODO`,
        description: `Актуальні ціни на бензин А-95, А-95+, А-98, дизель (ДП, ДП+) і автогаз (LPG) по мережах WOG, OKKO, SOCAR, Shell, UPG і інших. Snapshot ${FUEL_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/tsiny-palyva`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Ціни на паливо", url: `${SITE_URL}/dovidnyky/tsiny-palyva` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Ціни на паливо" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Fuel className="h-6 w-6 text-primary" />
              Ціни на паливо в Україні
            </h1>
            <p className="text-muted-foreground">
              Середні ціни на А-95, А-98, дизель і автогаз по найбільших мережах АЗС. Snapshot{" "}
              {FUEL_AS_OF}. Джерело —{" "}
              <a href={FUEL_PRICE_SOURCE} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                index.minfin <ExternalLink className="h-3 w-3" />
              </a>.
            </p>
          </header>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {FUEL_ORDER.map((f) => {
              const s = stats[f];
              if (!s) return null;
              return (
                <Card key={f} className="p-3">
                  <div className="text-[11px] text-muted-foreground mb-1">{FUEL_TYPE_LABEL[f]}</div>
                  <div className="text-base font-bold text-foreground">{s.avg.toFixed(2)} ₴</div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingDown className="h-3 w-3" /> {s.min.toFixed(2)}
                    </span>
                    <span className="text-red-600 dark:text-red-400 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> {s.max.toFixed(2)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Price table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-3 py-2 sticky left-0 bg-muted/50">
                      <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2 gap-1" onClick={() => toggleSort('name')}>
                        Мережа <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    {FUEL_ORDER.map((f) => (
                      <th key={f} className="text-right px-3 py-2 whitespace-nowrap">
                        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1" onClick={() => toggleSort(f)}>
                          {FUEL_TYPE_LABEL[f]} <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ chain, prices }) => {
                    const minVal = sortBy !== 'name' ? Math.min(...rows.map((r) => r.prices[sortBy] ?? Infinity)) : null;
                    return (
                      <tr key={chain.id} className="border-b border-border hover:bg-muted/30">
                        <td className="px-3 py-2 sticky left-0 bg-background font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            {chain.name}
                            {chain.popular && (
                              <Badge variant="secondary" className="text-[9px] h-4 px-1">Топ</Badge>
                            )}
                          </div>
                        </td>
                        {FUEL_ORDER.map((f) => {
                          const v = prices[f];
                          const isMin = sortBy === f && v != null && v === minVal;
                          return (
                            <td
                              key={f}
                              className={`px-3 py-2 text-right tabular-nums ${
                                isMin ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-foreground'
                              }`}
                            >
                              {v != null ? v.toFixed(2) : <span className="text-muted-foreground/50">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
            <p className="text-foreground font-semibold flex items-center gap-1.5">
              <Info className="h-4 w-4 text-primary" />
              Як використовувати
            </p>
            <ul className="space-y-1 ml-3 list-disc">
              <li>Зелений колір — мережа з найнижчою ціною за обраним типом палива.</li>
              <li>Натисніть на заголовок колонки для сортування.</li>
              <li>Для автопарку — оформіть FleetCard у обраних мереж: знижка зазвичай −0.5…−2.0 ₴/л.</li>
              <li>Дані оновлюються щомісяця. Поточні роздрібні ціни перевіряйте безпосередньо на АЗС.</li>
            </ul>
          </div>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="tsiny-palyva" />
    </PortalLayout>
  );
};

export default FuelPricesPage;
