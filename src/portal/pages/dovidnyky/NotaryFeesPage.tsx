import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Stamp, Info } from "lucide-react";
import { NOTARY_FEES, NOTARY_FEES_AS_OF, NOTARY_CATEGORY_LABEL, NMDG_2026, type NotaryCategory } from "@/portal/data/notaryFees";

const CATS: NotaryCategory[] = ["real_estate","vehicle","inheritance","power_of_attorney","contracts","copies","corporate"];

const NotaryFeesPage = () => {
  const [cat, setCat] = useState<NotaryCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return NOTARY_FEES.filter((f) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (!q) return true;
      return f.service.toLowerCase().includes(q);
    });
  }, [cat, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...CATS.map((c) => ({ value: c, label: NOTARY_CATEGORY_LABEL[c] }))]}
          value={cat}
          onChange={(v) => setCat(v as NotaryCategory | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Тарифи нотаріусів 2026: державне мито і приватні ставки | FINTODO",
        description: `Повний прайс нотаріальних дій: купівля-продаж, дарування, спадщина, довіреності. Державне мито vs приватний нотаріус. НМДГ = ${NMDG_2026} ₴. Snapshot ${NOTARY_FEES_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/notariusy`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Тарифи нотаріусів", url: `${SITE_URL}/dovidnyky/notariusy` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Тарифи нотаріусів" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Stamp className="h-6 w-6 text-primary" />
              Тарифи нотаріусів
            </h1>
            <p className="text-muted-foreground">
              Державне мито (Декрет КМУ № 7-93) і орієнтовні ринкові тарифи приватних нотаріусів (м. Київ). НМДГ = {NMDG_2026} ₴.
              Snapshot {NOTARY_FEES_AS_OF}.
            </p>
          </header>

          <div className="bg-muted/40 rounded p-3 text-xs text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>Державний нотаріус — мінімум держмита, але черги і обмежений перелік. Приватний — швидше, дорожче, але всі категорії дій. Окремо сплачуються реєстраційні збори (ДРРП — 230 ₴), оцінка майна, ПДФО і військовий збір (за наявності).</div>
          </div>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: купівля, дарування, довіреність..."
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
                    <Badge variant="outline" className="text-[10px]">{NOTARY_CATEGORY_LABEL[f.category]}</Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="bg-muted/40 rounded p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">Державне мито</div>
                      <div className="text-sm font-semibold text-foreground">{f.stateFee}</div>
                    </div>
                    <div className="bg-primary/5 rounded p-2.5 border border-primary/20">
                      <div className="text-[10px] uppercase text-primary mb-1">Приватний нотаріус</div>
                      <div className="text-sm font-semibold text-foreground">{f.privateFee}</div>
                    </div>
                  </div>

                  {f.notes && (
                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded p-2 border border-amber-200/40">
                      ⚠️ {f.notes}
                    </div>
                  )}

                  <div className="text-[11px] text-muted-foreground">Підстава: {f.legalBasis}</div>
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="notariusy" />
    </PortalLayout>
  );
};

export default NotaryFeesPage;
