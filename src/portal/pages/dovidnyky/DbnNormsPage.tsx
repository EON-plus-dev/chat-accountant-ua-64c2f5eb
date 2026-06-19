import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { BookOpenCheck, Calendar, Building, ArrowRightLeft } from "lucide-react";
import { DBN_NORMS, DBN_AS_OF, DBN_CATEGORY_LABEL, DBN_PROCESS_CHAIN, type DbnCategory } from "@/portal/data/dbnNorms";

const CATS: DbnCategory[] = ["general","urban_planning","buildings","engineering","transport","fire_safety","energy"];

const DbnNormsPage = () => {
  const [cat, setCat] = useState<DbnCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return DBN_NORMS.filter((n) => {
      if (cat !== "all" && n.category !== cat) return false;
      if (!q) return true;
      return n.code.toLowerCase().includes(q) || n.title.toLowerCase().includes(q);
    });
  }, [cat, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...CATS.map((c) => ({ value: c, label: DBN_CATEGORY_LABEL[c] }))]}
          value={cat}
          onChange={(v) => setCat(v as DbnCategory | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "ДБН 2026: реєстр державних будівельних норм України | FINTODO",
        description: "Чинні ДБН для проектування і будівництва: житло, громадські, інженерні мережі, пожежна безпека, енергоефективність. Snapshot " + DBN_AS_OF + ".",
        canonical: `${SITE_URL}/dovidnyky/dbn`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "ДБН", url: `${SITE_URL}/dovidnyky/dbn` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "ДБН" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpenCheck className="h-6 w-6 text-primary" />
              ДБН: державні будівельні норми
            </h1>
            <p className="text-muted-foreground">
              Реєстр чинних ДБН на 2026, які потрібні для проектування, будівництва, реконструкції та введення об'єктів в експлуатацію. Snapshot {DBN_AS_OF}.
            </p>
          </header>

          {/* Процес дозвільної документації */}
          <Card className="p-4 space-y-3 bg-primary/5 border-primary/20">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              Послідовність для забудовника
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {DBN_PROCESS_CHAIN.map((s) => (
                <div key={s.step} className="bg-background rounded p-2.5 border border-border">
                  <div className="flex items-start gap-2">
                    <Badge variant="default" className="text-[10px] h-5 px-1.5 shrink-0">{s.step}</Badge>
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-foreground leading-tight">{s.title}</div>
                      <div className="text-[10px] text-muted-foreground">{s.source}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: ДБН В.2.6, теплоізоляція..."
            resultCount={filtered.length}
            resultLabel="норм"
            activeFilterCount={cat !== "all" ? 1 : 0}
            onResetFilters={() => setCat("all")}
          >
            <div className="grid gap-3">
              {filtered.map((n) => (
                <Card key={n.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-[10px] font-mono">{n.code}</Badge>
                      <h3 className="text-base font-bold text-foreground">{n.title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{DBN_CATEGORY_LABEL[n.category]}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{n.scope}</p>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="bg-muted/40 rounded p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />Чинний з
                      </div>
                      <div className="text-sm font-semibold text-foreground">{n.effectiveFrom}</div>
                      {n.replaces && <div className="text-[10px] text-muted-foreground mt-0.5">Замість: {n.replaces}</div>}
                    </div>
                    <div className="bg-muted/40 rounded p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-1">
                        <Building className="h-3 w-3" />Застосовується
                      </div>
                      <ul className="text-[11px] text-foreground space-y-0.5 list-disc pl-4">
                        {n.appliesTo.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  </div>

                  {n.notes && <div className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">💡 {n.notes}</div>}
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="dbn" />
    </PortalLayout>
  );
};

export default DbnNormsPage;
