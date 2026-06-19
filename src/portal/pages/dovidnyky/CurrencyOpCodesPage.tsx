import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Copy, Sparkles, ShieldAlert, Info, FileText } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { toast } from "@/hooks/use-toast";
import {
  CURRENCY_OP_CODES,
  CURRENCY_OP_CATEGORY_LABEL,
  CURRENCY_OPS_AS_OF,
  type CurrencyOpCategory,
} from "@/portal/data/currencyOpCodes";

const CATEGORIES: CurrencyOpCategory[] = [
  'trade_goods',
  'trade_services',
  'investments',
  'credits',
  'transfers',
  'budget',
  'other',
];

const DIRECTION_LABEL = {
  in: 'Зарахування',
  out: 'Списання',
  both: 'Обидва напрямки',
} as const;

const DirectionIcon = ({ d }: { d: 'in' | 'out' | 'both' }) => {
  if (d === 'in') return <ArrowDownToLine className="h-3.5 w-3.5" />;
  if (d === 'out') return <ArrowUpFromLine className="h-3.5 w-3.5" />;
  return <ArrowLeftRight className="h-3.5 w-3.5" />;
};

const CurrencyOpCodesPage = () => {
  const [categoryFilter, setCategoryFilter] = useState<CurrencyOpCategory | "all">("all");
  const [directionFilter, setDirectionFilter] = useState<'in' | 'out' | 'both' | "all">("all");
  const [supervisionFilter, setSupervisionFilter] = useState<'yes' | 'no' | "all">("all");
  const [search, setSearch] = useState("");

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: CURRENCY_OP_CODES.length };
    CURRENCY_OP_CODES.forEach((o) => (c[o.category] = (c[o.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CURRENCY_OP_CODES.filter((o) => {
      if (categoryFilter !== "all" && o.category !== categoryFilter) return false;
      if (directionFilter !== "all" && o.direction !== directionFilter && o.direction !== 'both') return false;
      if (supervisionFilter === 'yes' && !o.underSupervision) return false;
      if (supervisionFilter === 'no' && o.underSupervision) return false;
      if (!q) return true;
      return (
        o.code.includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [categoryFilter, directionFilter, supervisionFilter, search]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: `${label}: ${text}` });
  };

  const activeFilters =
    (categoryFilter !== "all" ? 1 : 0) +
    (directionFilter !== "all" ? 1 : 0) +
    (supervisionFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: categoryCounts.all },
            ...CATEGORIES.map((c) => ({
              value: c,
              label: CURRENCY_OP_CATEGORY_LABEL[c],
              count: categoryCounts[c] || 0,
            })),
          ]}
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as CurrencyOpCategory | "all")}
        />
      </FilterSection>
      <FilterSection title="Напрямок">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            { value: "in", label: "Зарахування" },
            { value: "out", label: "Списання" },
          ]}
          value={directionFilter}
          onChange={(v) => setDirectionFilter(v as 'in' | 'out' | 'both' | "all")}
        />
      </FilterSection>
      <FilterSection title="Валютний нагляд">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            { value: "yes", label: "Підпадає (180 днів)" },
            { value: "no", label: "Без нагляду" },
          ]}
          value={supervisionFilter}
          onChange={(v) => setSupervisionFilter(v as 'yes' | 'no' | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Коди валютних операцій НБУ — ${CURRENCY_OP_CODES.length}+ кодів для SWIFT і платіжних інструкцій | FINTODO`,
        description: `Довідник кодів валютних операцій: експорт/імпорт товарів і послуг, дивіденди, роялті, кредити, перекази фізосіб. Для платежок, SWIFT MT103 і валютного нагляду банку.`,
        canonical: `${SITE_URL}/dovidnyky/kvo`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Коди валютних операцій", url: `${SITE_URL}/dovidnyky/kvo` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Коди валютних операцій" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              Коди валютних операцій НБУ
            </h1>
            <p className="text-muted-foreground">
              Коди для платіжних доручень в інвалюті, SWIFT MT103 і валютного нагляду банку.
              Визначають характер операції — від експорту IT-послуг до виплати дивідендів і
              імпорту товарів. Snapshot {CURRENCY_OPS_AS_OF}, на основі положень НБУ № 5, 7, 18.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: 301, експорт, дивіденди, роялті..."
            resultCount={filtered.length}
            resultLabel="кодів"
            activeFilterCount={activeFilters}
            onResetFilters={() => {
              setCategoryFilter("all");
              setDirectionFilter("all");
              setSupervisionFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((o) => (
                <Card key={o.code} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="default" className="text-sm font-bold tabular-nums">
                          {o.code}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {CURRENCY_OP_CATEGORY_LABEL[o.category]}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <DirectionIcon d={o.direction} />
                          {DIRECTION_LABEL[o.direction]}
                        </Badge>
                        {o.underSupervision && (
                          <Badge className="text-[10px] gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            <ShieldAlert className="h-3 w-3" /> Нагляд 180 днів
                          </Badge>
                        )}
                        {o.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">
                        {o.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    {o.description}
                  </p>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1">
                    <div className="flex items-start gap-1.5">
                      <FileText className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span>
                        <span className="text-muted-foreground">Документи: </span>
                        <span className="text-foreground">{o.documents.join(' · ')}</span>
                      </span>
                    </div>
                    <div className="text-muted-foreground italic">{o.legalRef}</div>
                  </div>

                  {o.note && (
                    <p className="text-[11px] text-muted-foreground italic mb-2 flex items-start gap-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{o.note}</span>
                    </p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] w-full"
                    onClick={() => copy(o.code, 'Код операції')}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Копіювати код {o.code}
                  </Button>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
              <p className="text-foreground font-semibold">Як використовувати коди?</p>
              <ul className="space-y-1 ml-3 list-disc">
                <li><span className="text-foreground">Платіжна інструкція в інвалюті</span> — поле «Призначення / код операції» в банк-клієнті. Невірний код = ризик зупинки нагляду банком.</li>
                <li><span className="text-foreground">SWIFT MT103</span> — банк автоматично формує поле 70 (Remittance Information) на основі вашого коду і коментарю.</li>
                <li><span className="text-foreground">Валютний нагляд (ст. 13 ЗУ № 2473)</span> — коди з позначкою «Нагляд» відстежуються банком 180 днів: чи відбулася зустрічна поставка/повернення.</li>
                <li><span className="text-foreground">Е-ліміт (Постанова НБУ № 18)</span> — для фізосіб: 400 тис. ₴/рік за курсом НБУ на закордонні перекази без підтверджуючих документів.</li>
              </ul>
              <p className="pt-2 border-t border-border text-foreground font-semibold">Що буде, якщо вказати невірний код?</p>
              <p>
                Банк зупиняє виконання платежу і запитує пояснення/документи. Якщо операція
                підпадала під нагляд (наприклад, експорт послуг — код 301), а ви вказали «999»,
                нагляд не запускається — ризик штрафу за ст. 14 ЗУ «Про валюту і валютні операції»
                (100% несвоєчасно повернутих коштів за курсом НБУ).
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="kvo" />
    </PortalLayout>
  );
};

export default CurrencyOpCodesPage;
