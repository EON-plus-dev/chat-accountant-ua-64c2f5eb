import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, AlertTriangle, BookOpen, Building2, FileCode } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  REPORTING_FORMS,
  FORM_CATEGORY_LABEL,
  FORM_FREQUENCY_LABEL,
  FORM_SUBMITTER_LABEL,
  REPORTING_FORMS_AS_OF,
  type FormCategory,
  type FormSubmitter,
} from "@/portal/data/reportingForms";

const CATEGORIES: FormCategory[] = [
  "income_tax",
  "esv",
  "vat",
  "single_tax",
  "profit",
  "financial",
  "property",
  "other",
];

const SUBMITTERS: FormSubmitter[] = ["fop", "tov", "employer", "individual"];

const ReportingFormsPage = () => {
  const [catFilter, setCatFilter] = useState<FormCategory | "all">("all");
  const [subFilter, setSubFilter] = useState<FormSubmitter | "all">("all");
  const [search, setSearch] = useState("");

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: REPORTING_FORMS.length };
    REPORTING_FORMS.forEach((f) => (c[f.category] = (c[f.category] || 0) + 1));
    return c;
  }, []);

  const subCounts = useMemo(() => {
    const c: Record<string, number> = { all: REPORTING_FORMS.length };
    REPORTING_FORMS.forEach((f) =>
      f.submitters.forEach((s) => (c[s] = (c[s] || 0) + 1))
    );
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return REPORTING_FORMS.filter((f) => {
      if (catFilter !== "all" && f.category !== catFilter) return false;
      if (subFilter !== "all" && !f.submitters.includes(subFilter)) return false;
      if (!q) return true;
      return (
        f.code.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.basis.toLowerCase().includes(q) ||
        (f.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [catFilter, subFilter, search]);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі категорії", count: catCounts.all },
            ...CATEGORIES.filter((c) => (catCounts[c] || 0) > 0).map((c) => ({
              value: c,
              label: FORM_CATEGORY_LABEL[c],
              count: catCounts[c] || 0,
            })),
          ]}
          value={catFilter}
          onChange={(v) => setCatFilter(v as FormCategory | "all")}
        />
      </FilterSection>
      <FilterSection title="Хто подає">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: subCounts.all },
            ...SUBMITTERS.filter((s) => (subCounts[s] || 0) > 0).map((s) => ({
              value: s,
              label: FORM_SUBMITTER_LABEL[s],
              count: subCounts[s] || 0,
            })),
          ]}
          value={subFilter}
          onChange={(v) => setSubFilter(v as FormSubmitter | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Звітні форми ДПС — 4ДФ, ЄСВ, ПДВ, ЄП, фінзвітність | FINTODO",
        description: `Каталог фіскальної звітності: 4ДФ, об'єднаний розрахунок, декларація ПДВ, ЄП, фінзвітність, прибуток. Терміни, КЕП, штрафи. ${REPORTING_FORMS.length} форм на ${REPORTING_FORMS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/zvitni-formy`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Звітні форми", url: `${SITE_URL}/dovidnyky/zvitni-formy` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Звітні форми" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Звітні форми
            </h1>
            <p className="text-muted-foreground">
              Каталог податкової і фінансової звітності: коли подавати, куди, в якому форматі і
              який штраф за прострочення. Snapshot на {REPORTING_FORMS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: 4ДФ, ПДВ, ЄСВ, декларація..."
            resultCount={filtered.length}
            resultLabel="форм"
            activeFilterCount={(catFilter !== "all" ? 1 : 0) + (subFilter !== "all" ? 1 : 0)}
            onResetFilters={() => {
              setCatFilter("all");
              setSubFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((f) => (
                <Card key={f.id} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="text-[10px] mb-1">
                        {FORM_CATEGORY_LABEL[f.category]}
                      </Badge>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">
                        {f.code}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.title}</p>
                    </div>
                  </div>

                  <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 mb-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground">
                        <strong>{FORM_FREQUENCY_LABEL[f.frequency]}:</strong> {f.deadline}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{f.submitTo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <FileCode className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{f.format}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        <span className="text-foreground">Підстава:</span> {f.basis}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {f.submitters.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">
                          {FORM_SUBMITTER_LABEL[s]}
                        </Badge>
                      ))}
                    </div>
                    {f.penaltyForLate && (
                      <div className="flex items-start gap-2 pt-1 mt-1 border-t border-border/50">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          <span className="text-foreground">Штраф:</span> {f.penaltyForLate}
                        </span>
                      </div>
                    )}
                    {f.notes?.map((n, i) => (
                      <p key={i} className="text-muted-foreground italic">
                        {n}
                      </p>
                    ))}
                  </div>

                  {f.tags && f.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
                      {f.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="zvitni-formy" />
    </PortalLayout>
  );
};

export default ReportingFormsPage;
