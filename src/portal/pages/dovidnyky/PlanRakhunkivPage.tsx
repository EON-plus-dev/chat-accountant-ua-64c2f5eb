import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { PLAN_RAKHUNKIV, ACCOUNT_CLASS_LABEL, ACCOUNT_TYPE_LABEL, type AccountClass } from "@/portal/data/planRakhunkiv";

const PlanRakhunkivPage = () => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<AccountClass | "all">("all");

  const classCounts = useMemo(() => {
    const c: Record<string, number> = { all: PLAN_RAKHUNKIV.length };
    PLAN_RAKHUNKIV.forEach((e) => (c[e.class] = (c[e.class] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PLAN_RAKHUNKIV.filter((e) => {
      if (classFilter !== "all" && e.class !== classFilter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.code.includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        (e.subaccounts?.some((s) => s.name.toLowerCase().includes(q) || s.code.includes(q)) ?? false)
      );
    });
  }, [search, classFilter]);

  const sidebar = (
    <FilterSection title="Клас рахунків">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Всі класи", count: classCounts.all },
          ...(Object.entries(ACCOUNT_CLASS_LABEL) as [AccountClass, string][])
            .filter(([v]) => (classCounts[v] || 0) > 0)
            .map(([v, l]) => ({ value: v, label: `${v}. ${l}`, count: classCounts[v] || 0 })),
        ]}
        value={classFilter}
        onChange={(v) => setClassFilter(v as AccountClass | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `План рахунків бухобліку — наказ Мінфіну № 291 | FINTODO`,
        description: `Повний План рахунків бухгалтерського обліку (наказ Мінфіну № 291): класи, субрахунки, типові проводки Дт/Кт. ${PLAN_RAKHUNKIV.length} основних рахунків з прикладами.`,
        canonical: `${SITE_URL}/dovidnyky/plan-rakhunkiv`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "План рахунків", url: `${SITE_URL}/dovidnyky/plan-rakhunkiv` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "План рахунків" },
          ]}
        />
        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              План рахунків бухобліку
            </h1>
            <p className="text-muted-foreground">
              Наказ Мінфіну № 291 від 30.11.1999. Для кожного рахунку — клас, тип, призначення, субрахунки і типові кореспонденції Дт/Кт.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за кодом, назвою або субрахунком..."
            resultCount={filtered.length}
            resultLabel="рахунків"
            activeFilterCount={classFilter !== "all" ? 1 : 0}
            onResetFilters={() => setClassFilter("all")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((e) => (
                <Link key={e.id} to={`/dovidnyky/plan-rakhunkiv/${e.slug}`}>
                  <Card className="p-4 h-full hover:border-primary/40 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="font-mono text-lg font-bold text-primary">{e.code}</span>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{e.name}</h3>
                      </div>
                      <Badge variant="outline" size="sm" className="text-[10px] shrink-0">{ACCOUNT_TYPE_LABEL[e.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{e.description}</p>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] border-t border-border pt-2">
                      <Badge variant="secondary" size="sm" className="text-[10px]">Клас {e.class}</Badge>
                      {e.subaccounts && <span className="text-[10px] text-muted-foreground">{e.subaccounts.length} субрахунків</span>}
                      {e.inSimplifiedPlan && <span className="text-[10px] text-primary ml-auto">✓ Спрощений план</span>}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Малі підприємства</strong> можуть застосовувати Спрощений план рахунків (наказ Мінфіну № 186 від 19.04.2001) — рахунки відмічені позначкою «Спрощений план».
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="plan-rakhunkiv" />
    </PortalLayout>
  );
};

export default PlanRakhunkivPage;
