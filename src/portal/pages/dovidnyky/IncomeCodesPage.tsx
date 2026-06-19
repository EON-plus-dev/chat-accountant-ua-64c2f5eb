import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hash, Copy, Sparkles, Info, Users, BookOpen } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { toast } from "@/hooks/use-toast";
import {
  INCOME_CODES,
  INCOME_CATEGORY_LABEL,
  TAXABLENESS_LABEL,
  INCOME_CODES_AS_OF,
  type IncomeCodeCategory,
} from "@/portal/data/incomeCodes";

const CATEGORIES: IncomeCodeCategory[] = [
  'salary', 'cpd', 'rent', 'dividends', 'gifts', 'social', 'inheritance', 'investment', 'fop', 'foreign', 'other',
];

const IncomeCodesPage = () => {
  const [catFilter, setCatFilter] = useState<IncomeCodeCategory | "all">("all");
  const [taxFilter, setTaxFilter] = useState<'taxable' | 'exempt' | "all">("all");
  const [search, setSearch] = useState("");

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: INCOME_CODES.length };
    INCOME_CODES.forEach((e) => (c[e.category] = (c[e.category] || 0) + 1));
    return c;
  }, []);
  const taxCounts = useMemo(() => ({
    all: INCOME_CODES.length,
    taxable: INCOME_CODES.filter((e) => e.pdfo === 'taxable').length,
    exempt: INCOME_CODES.filter((e) => e.pdfo === 'exempt').length,
  }), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return INCOME_CODES.filter((e) => {
      if (catFilter !== "all" && e.category !== catFilter) return false;
      if (taxFilter !== "all" && e.pdfo !== taxFilter) return false;
      if (!q) return true;
      return (
        e.code.includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.pkArticle?.toLowerCase().includes(q) ?? false)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [catFilter, taxFilter, search]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: `${label}: ${text}` });
  };

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: catCounts.all },
            ...CATEGORIES.map((c) => ({
              value: c,
              label: INCOME_CATEGORY_LABEL[c],
              count: catCounts[c] || 0,
            })).filter((o) => o.count > 0),
          ]}
          value={catFilter}
          onChange={(v) => setCatFilter(v as IncomeCodeCategory | "all")}
        />
      </FilterSection>
      <FilterSection title="ПДФО">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: taxCounts.all },
            { value: "taxable", label: "Оподатковується", count: taxCounts.taxable },
            { value: "exempt", label: "Звільнено / 0%", count: taxCounts.exempt },
          ]}
          value={taxFilter}
          onChange={(v) => setTaxFilter(v as 'taxable' | 'exempt' | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Ознаки доходу для 4ДФ — довідник кодів | FINTODO",
        description: `Коди ознак доходів для додатка 4ДФ Об\u02bcєднаного розрахунку: 101 зарплата, 102 ЦПД, 106 оренда, 109 дивіденди, 157 ФОП. ${INCOME_CODES.length} кодів з оподаткуванням ПДФО і ВЗ.`,
        canonical: `${SITE_URL}/dovidnyky/oznaky-dohodu`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Ознаки доходу 4ДФ", url: `${SITE_URL}/dovidnyky/oznaky-dohodu` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Ознаки доходу 4ДФ" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Hash className="h-6 w-6 text-primary" />
              Ознаки доходу для 4ДФ
            </h1>
            <p className="text-muted-foreground">
              3-значні коди для додатка 4ДФ Об{'\u02bc'}єднаного розрахунку. Визначають тип виплати
              фізособі та оподаткування ПДФО і військовим збором. Помилка в коді = розбіжність з ДПС.
              За Наказом Мінфіну № 4. Snapshot {INCOME_CODES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: код, зарплата, ЦПД, дивіденди..."
            resultCount={filtered.length}
            resultLabel="кодів"
            activeFilterCount={(catFilter !== "all" ? 1 : 0) + (taxFilter !== "all" ? 1 : 0)}
            onResetFilters={() => {
              setCatFilter("all");
              setTaxFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((e, idx) => {
                const pdfo = TAXABLENESS_LABEL[e.pdfo];
                const vz = TAXABLENESS_LABEL[e.vz];
                return (
                  <Card key={`${e.code}-${idx}`} className="p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="default" className="text-sm font-mono font-bold tabular-nums">
                            {e.code}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {INCOME_CATEGORY_LABEL[e.category]}
                          </Badge>
                          {e.popular && (
                            <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                              <Sparkles className="h-3 w-3" /> Часто
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{e.name}</h3>
                        <p className="text-[11px] text-muted-foreground mt-1">{e.description}</p>
                      </div>
                    </div>

                    <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] grid grid-cols-2 gap-x-3 gap-y-1">
                      <div>
                        <span className="text-muted-foreground">ПДФО 18%: </span>
                        <span className={pdfo.cls + ' font-medium'}>{pdfo.text}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ВЗ 5%: </span>
                        <span className={vz.cls + ' font-medium'}>{vz.text}</span>
                      </div>
                      {e.pkArticle && (
                        <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
                          <BookOpen className="h-3 w-3" /> {e.pkArticle}
                        </div>
                      )}
                      <div className="col-span-2 flex items-start gap-1.5 text-muted-foreground">
                        <Users className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{e.payers.join('; ')}</span>
                      </div>
                    </div>

                    {e.note && (
                      <p className="text-[11px] text-muted-foreground italic mb-2 flex items-start gap-1.5">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{e.note}</span>
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] w-full"
                      onClick={() => copy(e.code, 'Код ознаки')}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Копіювати {e.code}
                    </Button>
                  </Card>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-600" /> Чому код важливий?
              </p>
              <ul className="text-muted-foreground space-y-1 ml-3 list-disc">
                <li>ДПС зіставляє ваш 4ДФ з декларацією одержувача. Код визначає, як рахувати ПДФО і ВЗ.</li>
                <li>Помилковий код 127 («Інші») замість 157 (ФОП) = ДПС вважає, що ви не утримали ПДФО з фізособи, і нараховує донарахування.</li>
                <li>Подарунки понад ліміт (код 126) рахуються з коефіцієнтом 1,21951 при натуральній формі.</li>
                <li>Виплати ФОП показуються у 4ДФ навіть з 0% ПДФО — для прозорості перед ДПС.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="oznaky-dohodu" />
    </PortalLayout>
  );
};

export default IncomeCodesPage;
