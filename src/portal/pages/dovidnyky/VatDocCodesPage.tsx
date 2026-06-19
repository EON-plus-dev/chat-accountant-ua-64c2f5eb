import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileBarChart2, Sparkles, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  VAT_DOC_CODES,
  VAT_CODE_KIND_LABEL,
  VAT_DOC_CODES_AS_OF,
  type VatCodeKind,
} from "@/portal/data/vatDocCodes";

const KINDS: VatCodeKind[] = ['rk_reason', 'pn_unissued', 'pn_special', 'service_place'];

const KIND_BADGE_CLASS: Record<VatCodeKind, string> = {
  rk_reason: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  pn_unissued: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  pn_special: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  service_place: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
};

const VatDocCodesPage = () => {
  const [kindFilter, setKindFilter] = useState<VatCodeKind | "all">("all");
  const [search, setSearch] = useState("");

  const kindCounts = useMemo(() => {
    const c: Record<string, number> = { all: VAT_DOC_CODES.length };
    VAT_DOC_CODES.forEach((d) => (c[d.kind] = (c[d.kind] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return VAT_DOC_CODES.filter((d) => {
      if (kindFilter !== "all" && d.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        d.code.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.useCase.toLowerCase().includes(q) ||
        d.legalRef.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [kindFilter, search]);

  const activeFilters = kindFilter !== "all" ? 1 : 0;

  const sidebar = (
    <>
      <FilterSection title="Тип коду">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: kindCounts.all },
            ...KINDS.map((k) => ({
              value: k,
              label: VAT_CODE_KIND_LABEL[k],
              count: kindCounts[k] || 0,
            })),
          ]}
          value={kindFilter}
          onChange={(v) => setKindFilter(v as VatCodeKind | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Коди ПДВ-документів — РК, причини невидачі ПН, місце постачання | FINTODO`,
        description: `Довідник кодів для ПДВ: причини коригування РК (101–301), типи невидачі ПН (02–15), спецознаки (касовий, імпорт послуг), місце постачання (186.2–186.4).`,
        canonical: `${SITE_URL}/dovidnyky/kody-pdv`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Коди ПДВ-документів", url: `${SITE_URL}/dovidnyky/kody-pdv` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Коди ПДВ-документів" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileBarChart2 className="h-6 w-6 text-primary" />
              Коди податкових накладних і коригувань
            </h1>
            <p className="text-muted-foreground">
              Усі коди для заповнення ПН і РК за Наказом Мінфіну № 1307: причини коригування (101–301),
              типи причин невидачі ПН (02–15), спецознаки (касовий метод, імпорт послуг, мінбаза)
              і місце постачання послуг (ст. 186 ПКУ). Snapshot {VAT_DOC_CODES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: 101, повернення, експорт, імпорт послуг..."
            resultCount={filtered.length}
            resultLabel="кодів"
            activeFilterCount={activeFilters}
            onResetFilters={() => setKindFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((d) => (
                <Card key={d.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="default" className="text-xs font-bold font-mono">{d.code}</Badge>
                        <Badge className={`text-[10px] ${KIND_BADGE_CLASS[d.kind]}`}>
                          {VAT_CODE_KIND_LABEL[d.kind]}
                        </Badge>
                        {d.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{d.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{d.description}</p>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span>
                        <span className="text-muted-foreground">Приклад: </span>
                        <span className="text-foreground">{d.useCase}</span>
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
                Реєстрація ПН/РК у ЄРПН — критичні строки
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>ПН — до 15 календарних днів з дати складання (п. 201.10 ПКУ).</li>
                <li>РК на зменшення — реєструє <b>покупець</b>, на збільшення — продавець.</li>
                <li>Прострочення реєстрації — штраф 10–50% від суми ПДВ (ст. 120¹ ПКУ).</li>
                <li>Блокування ПН за СМКОР — оскарження через ДПС в 365 днів (п. 56.18 ПКУ).</li>
                <li>Помилка в коді причини «невидачі» — не критична, але створює питання при перевірці.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="kody-pdv" />
    </PortalLayout>
  );
};

export default VatDocCodesPage;
