import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Scale, Info } from "lucide-react";
import { LAWYER_FEES, LAWYER_FEES_AS_OF, LAWYER_SERVICE_LABEL, PMPO_2026, type LawyerService } from "@/portal/data/lawyerFees";

const CATS: LawyerService[] = ["consultation","criminal","civil","commercial","administrative","documents","representation"];

const LawyerFeesPage = () => {
  const [cat, setCat] = useState<LawyerService | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return LAWYER_FEES.filter((f) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (!q) return true;
      return f.service.toLowerCase().includes(q);
    });
  }, [cat, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...CATS.map((c) => ({ value: c, label: LAWYER_SERVICE_LABEL[c] }))]}
          value={cat}
          onChange={(v) => setCat(v as LawyerService | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Мінімальні гонорари адвокатів 2026 (НААУ) і ринкові ставки | FINTODO",
        description: `Рекомендовані мінімальні ставки НААУ і ринкові гонорари адвокатів у Києві. Кримінал, цивільні, господарські, оскарження ППР. ПМПО = ${PMPO_2026.toLocaleString("uk-UA")} ₴. Snapshot ${LAWYER_FEES_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/advokaty`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Гонорари адвокатів", url: `${SITE_URL}/dovidnyky/advokaty` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Гонорари адвокатів" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              Гонорари адвокатів: мінімум НААУ і ринок
            </h1>
            <p className="text-muted-foreground">
              Рекомендовані мінімальні ставки гонорару адвоката (Положення РАУ від 27.09.2019). База — ПМПО {PMPO_2026.toLocaleString("uk-UA")} ₴ (станом на 01.01.2026).
              Ринкові ставки — приблизно по Києву. Snapshot {LAWYER_FEES_AS_OF}.
            </p>
          </header>

          <div className="bg-muted/40 rounded p-3 text-xs text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>«Мінімум НААУ» — рекомендована планка для дисциплінарної практики РАУ; не імперативна. Реальний гонорар встановлюється договором з клієнтом (ЗУ № 5076-VI ст. 30). Можливі форми: погодинна, фіксована, success fee (% від результату — макс. 50%).</div>
          </div>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: консультація, захист, апеляція..."
            resultCount={filtered.length}
            resultLabel="послуг"
            activeFilterCount={cat !== "all" ? 1 : 0}
            onResetFilters={() => setCat("all")}
          >
            <div className="grid gap-3">
              {filtered.map((f) => (
                <Card key={f.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="text-base font-bold text-foreground">{f.service}</h3>
                    <Badge variant="outline" className="text-[10px]">{LAWYER_SERVICE_LABEL[f.category]}</Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="bg-muted/40 rounded p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">Мінімум НААУ ({f.minPmpo} ПМПО)</div>
                      <div className="text-sm font-semibold text-foreground">{f.minUah.toLocaleString("uk-UA")} ₴</div>
                    </div>
                    <div className="bg-primary/5 rounded p-2.5 border border-primary/20">
                      <div className="text-[10px] uppercase text-primary mb-1">Ринковий діапазон (Київ)</div>
                      <div className="text-sm font-semibold text-foreground">{f.marketRange}</div>
                    </div>
                  </div>

                  {f.notes && <div className="text-xs text-muted-foreground">{f.notes}</div>}
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="advokaty" />
    </PortalLayout>
  );
};

export default LawyerFeesPage;
