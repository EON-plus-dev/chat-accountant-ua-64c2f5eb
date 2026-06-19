import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Info, BookOpen, Sparkles, Calculator, Users, FileText, AlertTriangle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  PSP_ENTRIES,
  PSP_CATEGORY_LABEL,
  PSP_AS_OF,
  PSP_BASE_2026,
  PSP_INCOME_LIMIT_2026,
  PSP_PROZHYTKOVYY_2026,
  calcIncomeLimit,
  calcPdfoEconomy,
  type PspCategory,
} from "@/portal/data/pspPilhy";

const CATEGORIES: PspCategory[] = [
  'basic', 'children', 'single_parent', 'disabled_child', 'disability', 'chornobyl', 'war_veteran',
];

const fmtUah = (n: number) =>
  new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 2 }).format(n);

const PspPilhyPage = () => {
  const [catFilter, setCatFilter] = useState<PspCategory | "all">("all");
  const [search, setSearch] = useState("");

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: PSP_ENTRIES.length };
    PSP_ENTRIES.forEach((e) => (c[e.category] = (c[e.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PSP_ENTRIES.filter((e) => {
      if (catFilter !== "all" && e.category !== catFilter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.whoApplies.toLowerCase().includes(q) ||
        e.legalRef.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (!!a.popular !== !!b.popular) return a.popular ? -1 : 1;
      return b.coefficient - a.coefficient;
    });
  }, [catFilter, search]);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: catCounts.all },
            ...CATEGORIES.map((c) => ({
              value: c,
              label: PSP_CATEGORY_LABEL[c],
              count: catCounts[c] || 0,
            })).filter((o) => o.count > 0),
          ]}
          value={catFilter}
          onChange={(v) => setCatFilter(v as PspCategory | "all")}
        />
      </FilterSection>
      <FilterSection title="Базові показники 2026">
        <div className="text-[11px] space-y-1.5 text-muted-foreground">
          <div>
            <span className="text-foreground font-medium">Прожитковий мін.: </span>
            {fmtUah(PSP_PROZHYTKOVYY_2026)}
          </div>
          <div>
            <span className="text-foreground font-medium">Базова ПСП (50%): </span>
            {fmtUah(PSP_BASE_2026)}/міс
          </div>
          <div>
            <span className="text-foreground font-medium">Граничний дохід: </span>
            {fmtUah(PSP_INCOME_LIMIT_2026)}/міс
          </div>
        </div>
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Податкова соціальна пільга (ПСП) ст. 169 ПКУ — довідник | FINTODO",
        description: `Усі види податкової соціальної пільги з ПДФО за ст. 169 ПКУ: базова, на дітей, одинокий батько, інвалідність, чорнобильці. Розміри 2026, граничний дохід, документи. Snapshot ${PSP_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/psp`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Соціальна пільга ПДФО", url: `${SITE_URL}/dovidnyky/psp` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Соціальна пільга ПДФО" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Податкова соціальна пільга (ПСП)
            </h1>
            <p className="text-muted-foreground">
              ПСП за ст. 169 ПКУ зменшує базу оподаткування ПДФО (18%) на фіксовану суму щомісяця.
              Застосовується лише за заявою працівника і лише до доходу від ОДНОГО роботодавця.
              Граничний дохід у 2026 = {fmtUah(PSP_INCOME_LIMIT_2026)}/міс (× кількість дітей для пільг на дітей).
              Базова ПСП = {fmtUah(PSP_BASE_2026)} → економія ПДФО {fmtUah(PSP_BASE_2026 * 0.18)}/міс.
              Snapshot {PSP_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: діти, інвалідність, чорнобиль, 169.1.2..."
            resultCount={filtered.length}
            resultLabel="пільг"
            activeFilterCount={catFilter !== "all" ? 1 : 0}
            onResetFilters={() => setCatFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((e) => {
                const limit = calcIncomeLimit(e, 2);
                const economy = calcPdfoEconomy(e, 2);
                return (
                  <Card key={e.id} className="p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge
                            variant="default"
                            className="text-[10px] font-bold tabular-nums"
                          >
                            {Math.round(e.coefficient * 100)}%
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {PSP_CATEGORY_LABEL[e.category]}
                          </Badge>
                          {e.popular && (
                            <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                              <Sparkles className="h-3 w-3" /> Часто
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{e.title}</h3>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground mb-2">{e.whoApplies}</p>

                    <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                      <div>
                        <span className="text-muted-foreground">Сума: </span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {fmtUah(e.amount2026)}
                          {e.perChild && <span className="text-muted-foreground"> × дітей</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Економія ПДФО: </span>
                        <span className="font-semibold text-emerald-600 tabular-nums">
                          {fmtUah(Math.round(e.amount2026 * 0.18 * 100) / 100)}
                          {e.perChild && <span className="text-muted-foreground"> × дітей</span>}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Граничний дохід:{' '}
                        <span className="text-foreground font-medium tabular-nums">
                          {fmtUah(PSP_INCOME_LIMIT_2026)}
                          {e.incomeLimitMultiplier === 'per_child' && ' × дітей'}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen className="h-3 w-3" /> {e.legalRef}
                      </div>
                      {e.perChild && (
                        <div className="col-span-2 flex items-center gap-1.5 text-primary/80">
                          <Calculator className="h-3 w-3" />
                          Приклад (2 дітей): пільга {fmtUah(e.amount2026 * 2)}, ліміт ЗП{' '}
                          {fmtUah(limit)}, економія {fmtUah(economy)}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-muted-foreground mb-2 flex items-start gap-1.5">
                      <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">Документи: </span>
                        {e.documents.join('; ')}
                      </div>
                    </div>

                    {e.note && (
                      <p className="text-[11px] text-muted-foreground italic flex items-start gap-1.5">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{e.note}</span>
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Правила застосування ПСП
              </p>
              <ul className="text-muted-foreground space-y-1 ml-3 list-disc">
                <li>Лише за <strong>заявою працівника</strong> — без заяви ПСП не застосовується автоматично.</li>
                <li>Лише до доходу від <strong>одного роботодавця</strong> (за вибором працівника). У 4ДФ — ознака 169.</li>
                <li>Не застосовується до доходів ФОП, ЦПД, дивідендів, спадщини — лише до зарплати у трудових відносинах.</li>
                <li>ПСП не діє у місяці, коли ЗП перевищила граничний розмір (навіть за 1 ₴) — навіть якщо у наступному знову нижче.</li>
                <li>Декілька підстав одночасно — застосовується <strong>одна</strong>, найбільша за розміром (крім «на дітей» + «дитина з інвалідністю» — додаються).</li>
                <li>За неправомірне застосування ПСП — донарахування ПДФО + штраф 25% (ст. 119 ПКУ) для роботодавця.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="psp" />
    </PortalLayout>
  );
};

export default PspPilhyPage;
