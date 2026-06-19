import { useMemo, useState } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Map, TrendingUp, Receipt, Banknote } from "lucide-react";
import {
  LAND_BASE_RATES,
  LAND_CATEGORY_LABEL,
  LAND_COEFFICIENTS,
  LAND_TAX_RULES,
  LAND_RENT_RULES,
  LAND_VALUATION_AS_OF,
  INDEX_COEF_2025,
  type LandCategory,
} from "@/portal/data/landValuation";

const CATS: LandCategory[] = ["residential","commercial","industrial","agricultural_arable","agricultural_perennial","recreational","garden","forest"];

const f = (n: number) => n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₴";

const LandValuationPage = () => {
  const [cat, setCat] = useState<LandCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return LAND_BASE_RATES.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (!q) return true;
      return r.location.toLowerCase().includes(q);
    });
  }, [cat, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Категорія землі">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...CATS.map((c) => ({ value: c, label: LAND_CATEGORY_LABEL[c] }))]}
          value={cat}
          onChange={(v) => setCat(v as LandCategory | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Нормативна грошова оцінка землі 2026: НГО, ставки, коефіцієнти | FINTODO",
        description: "НГО землі для розрахунку податку та оренди. Базові ₴/м² по регіонах + індексація " + INDEX_COEF_2025 + ". Коефіцієнти Км1-Кф, ставки податку і оренди. Snapshot " + LAND_VALUATION_AS_OF + ".",
        canonical: `${SITE_URL}/dovidnyky/otsinka-zemli`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Оцінка землі", url: `${SITE_URL}/dovidnyky/otsinka-zemli` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Оцінка землі" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Map className="h-6 w-6 text-primary" />
              Нормативна грошова оцінка землі
            </h1>
            <p className="text-muted-foreground">
              База для розрахунку земельного податку, орендної плати, державного мита при операціях з землею.
              Регулюється ЗУ № 1378-IV, ПКМУ № 1147. Коефіцієнт індексації за 2025 — <strong>{INDEX_COEF_2025}</strong>.
              Snapshot {LAND_VALUATION_AS_OF}.
            </p>
          </header>

          {/* Коефіцієнти */}
          <Card className="p-4 space-y-3 bg-primary/5 border-primary/20">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Локальні коефіцієнти НГО
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {LAND_COEFFICIENTS.map((c) => (
                <div key={c.code} className="bg-background rounded p-2.5 border border-border">
                  <div className="flex items-baseline gap-2 mb-1">
                    <Badge variant="default" className="text-[10px] font-mono">{c.code}</Badge>
                    <span className="text-xs font-bold text-foreground">{c.range}</span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{c.description}</div>
                </div>
              ))}
            </div>
          </Card>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: Київ, Львів, рілля..."
            resultCount={filtered.length}
            resultLabel="ставок"
            activeFilterCount={cat !== "all" ? 1 : 0}
            onResetFilters={() => setCat("all")}
          >
            <div className="grid gap-3">
              {filtered.map((r) => (
                <Card key={r.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{r.location}</h3>
                      <Badge variant="outline" className="text-[10px] mt-1">{LAND_CATEGORY_LABEL[r.category]}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{f(r.indexed2026)}/м²</div>
                      <div className="text-[10px] text-muted-foreground">База: {f(r.basePerM2)} × {INDEX_COEF_2025}</div>
                    </div>
                  </div>
                  {r.notes && <div className="text-xs text-muted-foreground">💡 {r.notes}</div>}
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>

          {/* Податок і оренда */}
          <div className="grid lg:grid-cols-2 gap-3 pt-2">
            <Card className="p-4 space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Земельний податок (ст. 274 ПКУ)
              </h3>
              {LAND_TAX_RULES.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground">{r.who}</span>
                  <span className="text-sm font-semibold text-foreground text-right shrink-0">{r.rate}</span>
                </div>
              ))}
            </Card>

            <Card className="p-4 space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                Орендна плата за землю (ст. 288 ПКУ)
              </h3>
              {LAND_RENT_RULES.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground">{r.type}</span>
                  <span className="text-sm font-semibold text-foreground text-right shrink-0">{r.rate}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="otsinka-zemli" />
    </PortalLayout>
  );
};

export default LandValuationPage;
