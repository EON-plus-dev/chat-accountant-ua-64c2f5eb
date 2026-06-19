import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Building2, Smartphone, Clock, FileText } from "lucide-react";
import { CNAP_SERVICES, CNAP_SERVICES_AS_OF, CNAP_CATEGORY_LABEL, type CnapCategory } from "@/portal/data/cnapServices";

const CATS: CnapCategory[] = ["passport","registration","civil_status","land_realty","vehicle","business","social"];

const CnapServicesPage = () => {
  const [cat, setCat] = useState<CnapCategory | "all">("all");
  const [diiaOnly, setDiiaOnly] = useState<"all" | "diia">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CNAP_SERVICES.filter((s) => {
      if (cat !== "all" && s.category !== cat) return false;
      if (diiaOnly === "diia" && !s.onlineDiia) return false;
      if (!q) return true;
      return s.service.toLowerCase().includes(q);
    });
  }, [cat, diiaOnly, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...CATS.map((c) => ({ value: c, label: CNAP_CATEGORY_LABEL[c] }))]}
          value={cat}
          onChange={(v) => setCat(v as CnapCategory | "all")}
        />
      </FilterSection>
      <FilterSection title="Спосіб">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, { value: "diia", label: "Доступно в Дії" }]}
          value={diiaOnly}
          onChange={(v) => setDiiaOnly(v as "all" | "diia")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "ЦНАП послуги 2026: тарифи, терміни, документи | FINTODO",
        description: "Усі адміністративні послуги у ЦНАП та через Дію: паспорти, реєстрація місця проживання, РАЦС, земля, бізнес. Тарифи, терміни, документи. Snapshot " + CNAP_SERVICES_AS_OF + ".",
        canonical: `${SITE_URL}/dovidnyky/tsnap`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "ЦНАП", url: `${SITE_URL}/dovidnyky/tsnap` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "ЦНАП послуги" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              ЦНАП: адміністративні послуги
            </h1>
            <p className="text-muted-foreground">
              Найпоширеніші послуги Центрів надання адміністративних послуг та їх еквіваленти в застосунку «Дія».
              Тарифи (адмінзбір/держмито), терміни, перелік документів. Snapshot {CNAP_SERVICES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: паспорт, реєстрація, ФОП..."
            resultCount={filtered.length}
            resultLabel="послуг"
            activeFilterCount={(cat !== "all" ? 1 : 0) + (diiaOnly !== "all" ? 1 : 0)}
            onResetFilters={() => { setCat("all"); setDiiaOnly("all"); }}
          >
            <div className="grid gap-3">
              {filtered.map((s) => (
                <Card key={s.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="text-base font-bold text-foreground">{s.service}</h3>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{CNAP_CATEGORY_LABEL[s.category]}</Badge>
                      {s.onlineDiia && (
                        <Badge variant="default" className="text-[10px] gap-1">
                          <Smartphone className="h-2.5 w-2.5" />Дія
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="bg-muted/40 rounded p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">Тариф</div>
                      <div className="text-sm font-semibold text-foreground">{s.fee}</div>
                    </div>
                    <div className="bg-muted/40 rounded p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />Термін
                      </div>
                      <div className="text-sm font-semibold text-foreground">{s.term}</div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded p-2.5">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" />Документи
                    </div>
                    <ul className="text-[11px] text-foreground space-y-0.5 list-disc pl-4">
                      {s.documents.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>

                  {s.notes && <div className="text-xs text-muted-foreground">💡 {s.notes}</div>}
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="tsnap" />
    </PortalLayout>
  );
};

export default CnapServicesPage;
