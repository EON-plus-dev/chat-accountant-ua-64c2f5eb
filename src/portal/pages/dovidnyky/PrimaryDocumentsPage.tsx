import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Users, Clock, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  PRIMARY_DOCUMENTS,
  PRIMARY_DOC_CATEGORY_LABEL,
  PRIMARY_DOC_FORM_LABEL,
  PRIMARY_DOCS_AS_OF,
  type PrimaryDocCategory,
  type PrimaryDocLegalForm,
} from "@/portal/data/primaryDocuments";

const CATEGORIES: PrimaryDocCategory[] = [
  'cash', 'bank', 'sales', 'inventory', 'fixed_assets', 'payroll', 'transport', 'business_trip', 'other',
];

const FORM_BADGE_CLASS: Record<PrimaryDocLegalForm, string> = {
  standard: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30',
  typical: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  free_form: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
};

const PrimaryDocumentsPage = () => {
  const [categoryFilter, setCategoryFilter] = useState<PrimaryDocCategory | "all">("all");
  const [formFilter, setFormFilter] = useState<PrimaryDocLegalForm | "all">("all");
  const [search, setSearch] = useState("");

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: PRIMARY_DOCUMENTS.length };
    PRIMARY_DOCUMENTS.forEach((d) => (c[d.category] = (c[d.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PRIMARY_DOCUMENTS.filter((d) => {
      if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
      if (formFilter !== "all" && d.legalForm !== formFilter) return false;
      if (!q) return true;
      return (
        d.code.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.purpose.toLowerCase().includes(q) ||
        d.legalRef.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [categoryFilter, formFilter, search]);

  const activeFilters = (categoryFilter !== "all" ? 1 : 0) + (formFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: categoryCounts.all },
            ...CATEGORIES.map((c) => ({
              value: c,
              label: PRIMARY_DOC_CATEGORY_LABEL[c],
              count: categoryCounts[c] || 0,
            })),
          ]}
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as PrimaryDocCategory | "all")}
        />
      </FilterSection>
      <FilterSection title="Тип форми">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            { value: "standard", label: "Стандартна (обовʼязкова)" },
            { value: "typical", label: "Типова" },
            { value: "free_form", label: "Довільна" },
          ]}
          value={formFilter}
          onChange={(v) => setFormFilter(v as PrimaryDocLegalForm | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Первинні документи бухобліку — ${PRIMARY_DOCUMENTS.length}+ форм (КО-1, М-11, ОЗ-1, ТТН) | FINTODO`,
        description: `Довідник первинних документів: касові, банківські, реалізація, склад, ОЗ, зарплата, ТТН, відрядження. Хто підписує, нормативка, строк зберігання.`,
        canonical: `${SITE_URL}/dovidnyky/pervynni-dokumenty`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Первинні документи", url: `${SITE_URL}/dovidnyky/pervynni-dokumenty` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Первинні документи" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Первинні документи бухгалтерського обліку
            </h1>
            <p className="text-muted-foreground">
              Каталог форм первинних документів за ЗУ № 996-XIV «Про бухоблік». Кожен документ —
              нормативна підстава, хто підписує, строк зберігання і коли застосовується.
              Stand-alone форми (стандартні, типові) і довільні з обовʼязковими реквізитами ст. 9.
              Snapshot {PRIMARY_DOCS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: КО-1, ТТН, акт, відрядження..."
            resultCount={filtered.length}
            resultLabel="документів"
            activeFilterCount={activeFilters}
            onResetFilters={() => {
              setCategoryFilter("all");
              setFormFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((d) => (
                <Card key={d.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="default" className="text-xs font-bold">
                          {d.code}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {PRIMARY_DOC_CATEGORY_LABEL[d.category]}
                        </Badge>
                        <Badge className={`text-[10px] ${FORM_BADGE_CLASS[d.legalForm]}`}>
                          {PRIMARY_DOC_FORM_LABEL[d.legalForm]}
                        </Badge>
                        {d.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">
                        {d.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    {d.purpose}
                  </p>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <Users className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span>
                        <span className="text-muted-foreground">Підписи: </span>
                        <span className="text-foreground">{d.signedBy.join(' · ')}</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Clock className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span>
                        <span className="text-muted-foreground">Зберігання: </span>
                        <span className="text-foreground">{d.retention}</span>
                      </span>
                    </div>
                    <div className="text-muted-foreground italic">{d.legalRef}</div>
                  </div>

                  {d.note && (
                    <p className="text-[11px] text-muted-foreground italic flex items-start gap-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{d.note}</span>
                    </p>
                  )}
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Обовʼязкові реквізити первинного документа (ст. 9 ЗУ № 996-XIV)
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>Назва документа (форми)</li>
                <li>Дата складання</li>
                <li>Назва підприємства, від імені якого складено документ</li>
                <li>Зміст і обсяг господарської операції, одиниця виміру</li>
                <li>Посади осіб, відповідальних за здійснення операції</li>
                <li>Особистий підпис або інші дані, що дають змогу ідентифікувати особу (КЕП)</li>
              </ul>
              <p className="pt-2 border-t border-border text-foreground font-semibold">Що буде, якщо документа немає?</p>
              <p>
                ДПС знімає витрати з податку на прибуток і податковий кредит з ПДВ.
                Штраф за порушення порядку ведення бухобліку — 510–1 020 ₴ (ст. 164² КпАП) на посадовця.
                Електронні документи з КЕП мають таку ж юридичну силу, як паперові (ст. 7 ЗУ № 851-IV).
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="pervynni-dokumenty" />
    </PortalLayout>
  );
};

export default PrimaryDocumentsPage;
