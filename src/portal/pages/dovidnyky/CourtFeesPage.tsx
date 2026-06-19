import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Gavel, ShieldCheck } from "lucide-react";
import { COURT_FEES, COURT_FEES_AS_OF, COURT_TYPE_LABEL, COURT_FEE_EXEMPTIONS, PMPO_JAN_2026, type CourtType } from "@/portal/data/courtFees";

const CATS: CourtType[] = ["civil","commercial","administrative","supreme"];

const CourtFeesPage = () => {
  const [cat, setCat] = useState<CourtType | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return COURT_FEES.filter((f) => {
      if (cat !== "all" && f.court !== cat) return false;
      if (!q) return true;
      return f.action.toLowerCase().includes(q);
    });
  }, [cat, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Вид судочинства">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...CATS.map((c) => ({ value: c, label: COURT_TYPE_LABEL[c] }))]}
          value={cat}
          onChange={(v) => setCat(v as CourtType | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Судовий збір 2026: ставки за всіма категоріями справ | FINTODO",
        description: `Актуальні ставки судового збору (ЗУ № 3674-VI) на 2026. Цивільні, господарські, адміністративні, ВС. ПМПО = ${PMPO_JAN_2026.toLocaleString("uk-UA")} ₴. Пільги і звільнення. Snapshot ${COURT_FEES_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/sudovyj-zbir`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Судовий збір", url: `${SITE_URL}/dovidnyky/sudovyj-zbir` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Судовий збір" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Gavel className="h-6 w-6 text-primary" />
              Судовий збір
            </h1>
            <p className="text-muted-foreground">
              Ставки за ЗУ № 3674-VI «Про судовий збір». Розраховуються від ПМПО на 1 січня року подання — у 2026 це {PMPO_JAN_2026.toLocaleString("uk-UA")} ₴.
              Snapshot {COURT_FEES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: позов, апеляція, банкрутство..."
            resultCount={filtered.length}
            resultLabel="ставок"
            activeFilterCount={cat !== "all" ? 1 : 0}
            onResetFilters={() => setCat("all")}
          >
            <div className="grid gap-3">
              {filtered.map((f) => (
                <Card key={f.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="text-base font-bold text-foreground">{f.action}</h3>
                    <Badge variant="outline" className="text-[10px]">{COURT_TYPE_LABEL[f.court]}</Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="bg-muted/40 rounded p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">Фіз. особа</div>
                      <div className="text-sm font-semibold text-foreground">{f.forIndividual}</div>
                    </div>
                    <div className="bg-primary/5 rounded p-2.5 border border-primary/20">
                      <div className="text-[10px] uppercase text-primary mb-1">Юр. особа / ФОП</div>
                      <div className="text-sm font-semibold text-foreground">{f.forBusiness}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground">Підстава: {f.legalBasis}</div>
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>

            <Card className="p-4 mt-6 bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/40">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Пільги і звільнення (ст. 5 ЗУ № 3674-VI)
              </h3>
              <ul className="space-y-2">
                {COURT_FEE_EXEMPTIONS.map((ex, i) => (
                  <li key={i} className="text-sm text-foreground">
                    <span className="font-semibold">{ex.who}:</span>{" "}
                    <span className="text-muted-foreground">{ex.what}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="sudovyj-zbir" />
    </PortalLayout>
  );
};

export default CourtFeesPage;
