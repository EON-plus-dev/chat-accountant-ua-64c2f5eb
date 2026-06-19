import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Landmark, AlertCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  BUDGET_ACCOUNTS,
  BUDGET_TAX_LABEL,
  BUDGET_REGION_LABEL,
  type BudgetTaxType,
  type BudgetRegion,
} from "@/portal/data/budgetAccounts";

const BudgetAccountsPage = () => {
  const [search, setSearch] = useState("");
  const [taxFilter, setTaxFilter] = useState<BudgetTaxType | "all">("all");
  const [regionFilter, setRegionFilter] = useState<BudgetRegion | "all">("all");
  const [audienceFilter, setAudienceFilter] = useState<"all" | "business" | "personal">("all");

  const taxCounts = useMemo(() => {
    const c: Record<string, number> = { all: BUDGET_ACCOUNTS.length };
    BUDGET_ACCOUNTS.forEach((a) => (c[a.taxType] = (c[a.taxType] || 0) + 1));
    return c;
  }, []);

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = { all: BUDGET_ACCOUNTS.length };
    BUDGET_ACCOUNTS.forEach((a) => (c[a.region] = (c[a.region] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return BUDGET_ACCOUNTS.filter((a) => {
      if (taxFilter !== "all" && a.taxType !== taxFilter) return false;
      if (regionFilter !== "all" && a.region !== regionFilter) return false;
      if (audienceFilter !== "all" && a.audience !== audienceFilter && a.audience !== "both") return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.iban.toLowerCase().includes(q) ||
        a.recipientName.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, taxFilter, regionFilter, audienceFilter]);

  const activeFilterCount =
    (taxFilter !== "all" ? 1 : 0) + (regionFilter !== "all" ? 1 : 0) + (audienceFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Податок">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: taxCounts.all },
            ...(Object.entries(BUDGET_TAX_LABEL) as [BudgetTaxType, string][])
              .filter(([v]) => (taxCounts[v] || 0) > 0)
              .map(([v, l]) => ({ value: v, label: l, count: taxCounts[v] || 0 })),
          ]}
          value={taxFilter}
          onChange={(v) => setTaxFilter(v as BudgetTaxType | "all")}
        />
      </FilterSection>
      <FilterSection title="Регіон">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: regionCounts.all },
            ...(Object.entries(BUDGET_REGION_LABEL) as [BudgetRegion, string][])
              .filter(([v]) => (regionCounts[v] || 0) > 0)
              .map(([v, l]) => ({ value: v, label: l, count: regionCounts[v] || 0 })),
          ]}
          value={regionFilter}
          onChange={(v) => setRegionFilter(v as BudgetRegion | "all")}
        />
      </FilterSection>
      <FilterSection title="Кому корисно">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всім" },
            { value: "business", label: "Бізнесу / ФОП" },
            { value: "personal", label: "Фізособам" },
          ]}
          value={audienceFilter}
          onChange={(v) => setAudienceFilter(v as "all" | "business" | "personal")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Бюджетні рахунки — ${BUDGET_ACCOUNTS.length} реквізитів Казначейства для сплати податків | FINTODO`,
        description: `Довідник IBAN рахунків Держказначейства для сплати ПДФО, ЄСВ, ПДВ, ЄП, військового збору. Реквізити, призначення платежу, дедлайни.`,
        canonical: `${SITE_URL}/dovidnyky/biudzhetni-rakhunky`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Бюджетні рахунки", url: `${SITE_URL}/dovidnyky/biudzhetni-rakhunky` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Бюджетні рахунки" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Бюджетні рахунки України</h1>
            <p className="text-muted-foreground">
              Реквізити Держказначейства для сплати податків і зборів. IBAN, отримувач, код класифікації, призначення платежу.
            </p>
          </header>

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Звіряйте з ДПС перед платежем.</strong> Рахунки можуть змінюватися — Держказначейство оновлює реквізити щонайменше раз на рік. Офіційне джерело:{" "}
              <a href="https://tax.gov.ua/byudjetni-rahunki" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                tax.gov.ua/byudjetni-rahunki
              </a>
              .
            </p>
          </div>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за податком, IBAN, регіоном..."
            resultCount={filtered.length}
            resultLabel="рахунків"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => {
              setTaxFilter("all");
              setRegionFilter("all");
              setAudienceFilter("all");
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((a) => (
                <Link key={a.id} to={`/dovidnyky/biudzhetni-rakhunky/${a.slug}`}>
                  <Card className="p-4 h-full hover:border-primary/40 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-primary shrink-0" />
                        <Badge variant="default" size="sm" className="text-[10px]">
                          {BUDGET_TAX_LABEL[a.taxType]}
                        </Badge>
                      </div>
                      <Badge variant="outline" size="sm" className="text-[10px] shrink-0">
                        {BUDGET_REGION_LABEL[a.region]}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                      {a.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{a.summary}</p>
                    <div className="text-[11px] font-mono text-foreground break-all border-t border-border pt-2">
                      {a.iban}
                    </div>
                    {a.paymentDeadline && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1">⏱ {a.paymentDeadline}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="biudzhetni-rakhunky" />
    </PortalLayout>
  );
};

export default BudgetAccountsPage;
