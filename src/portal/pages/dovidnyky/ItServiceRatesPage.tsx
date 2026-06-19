import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Code2, Briefcase, DollarSign } from "lucide-react";
import {
  IT_ROLE_RATES,
  ROLE_CATEGORY_LABEL,
  SENIORITY_LABEL,
  PROJECT_PACKAGES,
  PRICING_MODELS,
  IT_RATES_AS_OF,
  IT_RATES_FX,
  type RoleCategory,
  type Seniority,
} from "@/portal/data/itServiceRates";

const CATS: RoleCategory[] = ["development","design","marketing","content","management","qa_devops","data_ai"];
const SENS: Seniority[] = ["junior","middle","senior","lead"];

const usd = (v: number) => `$${v}`;
const uahFromUsd = (v: number) => `${Math.round(v * IT_RATES_FX).toLocaleString("uk-UA")} ₴`;

const ItServiceRatesPage = () => {
  const [cat, setCat] = useState<RoleCategory | "all">("all");
  const [sen, setSen] = useState<Seniority | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return IT_ROLE_RATES.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (sen !== "all" && r.seniority !== sen) return false;
      if (!q) return true;
      return r.role.toLowerCase().includes(q);
    });
  }, [cat, sen, search]);

  const activeCount = (cat !== "all" ? 1 : 0) + (sen !== "all" ? 1 : 0);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...CATS.map((c) => ({ value: c, label: ROLE_CATEGORY_LABEL[c] }))]}
          value={cat}
          onChange={(v) => setCat(v as RoleCategory | "all")}
        />
      </FilterSection>
      <FilterSection title="Seniority">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...SENS.map((s) => ({ value: s, label: SENIORITY_LABEL[s] }))]}
          value={sen}
          onChange={(v) => setSen(v as Seniority | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Ставки IT і маркетинг 2026 Україна: фриланс, агенції, in-house | FINTODO",
        description: "Погодинні ставки і місячні зарплати: розробка, дизайн, PPC, SEO, QA, DevOps, AI. Курс $/₴ = " + IT_RATES_FX + ". Snapshot " + IT_RATES_AS_OF + ".",
        canonical: `${SITE_URL}/dovidnyky/it-stavky`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Ставки IT/маркетинг", url: `${SITE_URL}/dovidnyky/it-stavky` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Ставки IT/маркетинг" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              Ставки IT і маркетингу 2026
            </h1>
            <p className="text-muted-foreground">
              Орієнтовні ставки для фрилансу, агенцій і in-house. Дані базуються на DOU.ua, AIN, Upwork UA. Snapshot {IT_RATES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Frontend, PPC, DevOps..."
            resultCount={filtered.length}
            resultLabel="ролей"
            activeFilterCount={activeCount}
            onResetFilters={() => { setCat("all"); setSen("all"); }}
          >
            <div className="grid gap-2.5">
              {filtered.map((r) => (
                <Card key={r.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{r.role}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">{ROLE_CATEGORY_LABEL[r.category]}</Badge>
                        <Badge variant="outline" className="text-[10px]">{SENIORITY_LABEL[r.seniority]}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-2">
                    <RateBlock
                      title="Фриланс ($/год)"
                      min={usd(r.freelanceHourUsd.min)}
                      avg={usd(r.freelanceHourUsd.avg)}
                      max={usd(r.freelanceHourUsd.max)}
                      sub={uahFromUsd(r.freelanceHourUsd.avg) + "/год"}
                    />
                    <RateBlock
                      title="Агенція ($/год)"
                      min={usd(r.agencyHourUsd.min)}
                      avg={usd(r.agencyHourUsd.avg)}
                      max={usd(r.agencyHourUsd.max)}
                      sub={uahFromUsd(r.agencyHourUsd.avg) + "/год"}
                      highlight
                    />
                    {r.monthlySalaryUsd && (
                      <RateBlock
                        title="In-house ($/міс)"
                        min={usd(r.monthlySalaryUsd.min)}
                        avg={usd(r.monthlySalaryUsd.avg)}
                        max={usd(r.monthlySalaryUsd.max)}
                        sub={uahFromUsd(r.monthlySalaryUsd.avg) + "/міс"}
                      />
                    )}
                  </div>

                  {r.note && <div className="text-[11px] text-muted-foreground border-l-2 border-primary/30 pl-2">💡 {r.note}</div>}
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>

          {/* Проектні пакети */}
          <Card className="p-4 space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Скільки коштують типові проекти
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {PROJECT_PACKAGES.map((p) => (
                <div key={p.id} className="bg-muted/40 rounded p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground">{p.name}</h3>
                    <Badge variant="default" className="text-[10px] shrink-0 font-mono">
                      ${p.priceUsd.min.toLocaleString()}–{p.priceUsd.max.toLocaleString()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.scope}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    <span>⏱ {p.timeline}</span>
                    <span>· {p.whoFor}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Моделі ціноутворення */}
          <Card className="p-4 space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Моделі ціноутворення
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left text-[10px] uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-1.5 pr-3">Модель</th>
                    <th className="py-1.5 pr-3">Типово</th>
                    <th className="py-1.5">Коли застосовувати</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICING_MODELS.map((m, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0">
                      <td className="py-1.5 pr-3 font-semibold">{m.model}</td>
                      <td className="py-1.5 pr-3 font-mono text-muted-foreground">{m.typical}</td>
                      <td className="py-1.5 text-muted-foreground">{m.whenToUse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="it-stavky" />
    </PortalLayout>
  );
};

const RateBlock = ({ title, min, avg, max, sub, highlight }: { title: string; min: string; avg: string; max: string; sub: string; highlight?: boolean }) => (
  <div className={`rounded p-2.5 ${highlight ? "bg-primary/10 border border-primary/30" : "bg-muted/40"}`}>
    <div className="text-[10px] uppercase text-muted-foreground mb-1">{title}</div>
    <div className="text-sm font-bold text-foreground font-mono">{min} – <span className={highlight ? "text-primary" : ""}>{avg}</span> – {max}</div>
    <div className="text-[10px] text-muted-foreground mt-0.5">≈ {sub}</div>
  </div>
);

export default ItServiceRatesPage;
