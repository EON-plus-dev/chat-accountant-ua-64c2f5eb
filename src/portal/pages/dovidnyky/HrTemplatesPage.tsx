import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { FileText, AlertTriangle, ExternalLink } from "lucide-react";
import {
  HR_TEMPLATES, HR_TEMPLATES_AS_OF, HR_TEMPLATE_CATEGORY_LABEL,
  type HrTemplateCategory,
} from "@/portal/data/hrTemplates";

const CATEGORIES: HrTemplateCategory[] = [
  "labor_contract", "gpa", "order", "termination", "vacation_sickleave", "internal_policy", "nda",
];

const HrTemplatesPage = () => {
  const [category, setCategory] = useState<HrTemplateCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return HR_TEMPLATES.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q);
    });
  }, [category, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            ...CATEGORIES.map((c) => ({ value: c, label: HR_TEMPLATE_CATEGORY_LABEL[c] })),
          ]}
          value={category}
          onChange={(v) => setCategory(v as HrTemplateCategory | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Шаблони трудових договорів, наказів і ЦПД для бізнесу 2026 | FINTODO",
        description: `Готові HR-шаблони: трудові договори, накази, ЦПД/ГПХ, NDA, ПВТР, посадові інструкції. Підстава, типові помилки, штрафи. Snapshot ${HR_TEMPLATES_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/hr-shablony`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "HR-шаблони", url: `${SITE_URL}/dovidnyky/hr-shablony` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "HR-шаблони" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              HR-шаблони і кадрові документи
            </h1>
            <p className="text-muted-foreground">
              Трудові договори, накази, ЦПД, NDA, ПВТР, посадові інструкції. Для кожного шаблону — обов'язкові поля, законодавча база, типові помилки і штрафи. Snapshot {HR_TEMPLATES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: договір, наказ, NDA..."
            resultCount={filtered.length}
            resultLabel="шаблонів"
            activeFilterCount={category !== "all" ? 1 : 0}
            onResetFilters={() => setCategory("all")}
          >
            <div className="grid gap-3">
              {filtered.map((t) => (
                <Card key={t.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-foreground">{t.title}</h3>
                      <p className="text-xs text-muted-foreground">{t.forWho}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{HR_TEMPLATE_CATEGORY_LABEL[t.category]}</Badge>
                      <Badge variant="secondary" className="text-[10px] uppercase">{t.format}</Badge>
                      {t.isFree && <Badge variant="default" className="text-[10px]">Безкоштовно</Badge>}
                    </div>
                  </div>

                  <p className="text-sm text-foreground">{t.summary}</p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-muted/40 rounded p-2.5">
                      <div className="text-[11px] font-semibold text-foreground mb-1.5">Обов'язкові поля</div>
                      <ul className="text-[11px] text-muted-foreground space-y-0.5 list-disc pl-4">
                        {t.mandatoryFields.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded p-2.5 border border-amber-200/40">
                      <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />Типові помилки
                      </div>
                      <ul className="text-[11px] text-amber-800/90 dark:text-amber-300 space-y-0.5 list-disc pl-4">
                        {t.pitfalls.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  </div>

                  <a href={t.legalBasisUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />{t.legalBasis}
                  </a>
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="hr-shablony" />
    </PortalLayout>
  );
};

export default HrTemplatesPage;
