import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Ship, ExternalLink } from "lucide-react";
import {
  CUSTOMS_TARIFF, CUSTOMS_CATEGORY_LABEL, TRADE_REGIME_LABEL, CUSTOMS_TARIFF_AS_OF,
  type CustomsTariffCategory, type TradeRegime,
} from "@/portal/data/customsTariff";

const CATEGORIES: CustomsTariffCategory[] = [
  "food", "agro", "chemicals", "pharma", "plastics", "textile",
  "metals", "machinery", "electronics", "vehicles", "fuel", "consumer",
];

const REGIMES: TradeRegime[] = ["MFN", "EU", "UK", "CA", "EFTA", "TR"];

const CustomsTariffPage = () => {
  const [category, setCategory] = useState<CustomsTariffCategory | "all">("all");
  const [regime, setRegime] = useState<TradeRegime>("MFN");
  const [search, setSearch] = useState("");

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: CUSTOMS_TARIFF.length };
    CUSTOMS_TARIFF.forEach((t) => (c[t.category] = (c[t.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CUSTOMS_TARIFF.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q) || t.uktZedCode.includes(q);
    });
  }, [category, search]);

  const activeFilters = category !== "all" ? 1 : 0;

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Торговельний режим">
        <FilterRadioGroup
          options={REGIMES.map((r) => ({ value: r, label: TRADE_REGIME_LABEL[r] }))}
          value={regime}
          onChange={(v) => setRegime(v as TradeRegime)}
        />
      </FilterSection>
      <FilterSection title="Категорія товару">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: catCounts.all },
            ...CATEGORIES.map((c) => ({ value: c, label: CUSTOMS_CATEGORY_LABEL[c], count: catCounts[c] || 0 })),
          ]}
          value={category}
          onChange={(v) => setCategory(v as CustomsTariffCategory | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Митні ставки за УКТ ЗЕД 2026 — мито, ПДВ, акциз | FINTODO",
        description: `Ставки мита, ПДВ і акцизу для топ-кодів УКТ ЗЕД з порівнянням режимів MFN, ЄС, Великобританії, Канади. Snapshot ${CUSTOMS_TARIFF_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/uktzed-mytni-stavky`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Митні ставки", url: `${SITE_URL}/dovidnyky/uktzed-mytni-stavky` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Митні ставки" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Ship className="h-6 w-6 text-primary" />
              Митні ставки за УКТ ЗЕД
            </h1>
            <p className="text-muted-foreground">
              Мито, ПДВ і акциз для найбільш імпортованих позицій. Перемикайте режим (MFN / DCFTA з ЄС / Велика Британія / Канада / EFTA / Туреччина), щоб побачити преференційну ставку. Snapshot {CUSTOMS_TARIFF_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: код або назва товару..."
            resultCount={filtered.length}
            resultLabel="позицій"
            activeFilterCount={activeFilters}
            onResetFilters={() => setCategory("all")}
          >
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Код УКТ ЗЕД</TableHead>
                      <TableHead className="text-xs">Назва</TableHead>
                      <TableHead className="text-xs text-right">Мито ({TRADE_REGIME_LABEL[regime]})</TableHead>
                      <TableHead className="text-xs text-right">ПДВ</TableHead>
                      <TableHead className="text-xs">Акциз / нотатки</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => {
                      const rate = t.rates.find((r) => r.regime === regime);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="text-xs font-mono whitespace-nowrap">{t.uktZedCode}</TableCell>
                          <TableCell className="text-xs">
                            <div className="font-medium text-foreground">{t.name}</div>
                            <div className="text-[10px] text-muted-foreground">{CUSTOMS_CATEGORY_LABEL[t.category]}</div>
                          </TableCell>
                          <TableCell className="text-xs text-right tabular-nums whitespace-nowrap">
                            {rate ? (
                              <>
                                <span className={rate.importRate === 0 ? "font-semibold text-emerald-600" : "font-semibold text-primary"}>
                                  {rate.display ?? (rate.importRate === 0 ? "0% (безмитно)" : `${rate.importRate}%`)}
                                </span>
                                {rate.note && (
                                  <div className="text-[10px] text-muted-foreground font-normal mt-0.5 max-w-[200px] whitespace-normal text-right">
                                    {rate.note}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-right tabular-nums font-semibold">{t.vatRate}%</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {t.excise && <div className="mb-1"><Badge variant="secondary" className="text-[10px]">Акциз</Badge> {t.excise}</div>}
                            {t.permits && t.permits.length > 0 && (
                              <div className="text-[10px]">Дозволи: {t.permits.join(", ")}</div>
                            )}
                            {t.note && <div className="text-[10px] italic mt-0.5">{t.note}</div>}
                            <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline mt-1">
                              <ExternalLink className="h-2.5 w-2.5" />{t.legalBasis}
                            </a>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="uktzed-mytni-stavky" />
    </PortalLayout>
  );
};

export default CustomsTariffPage;
