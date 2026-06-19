import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSignature, Sparkles, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  CONTRACT_TYPES,
  CONTRACT_CATEGORY_LABEL,
  CONTRACT_TYPES_AS_OF,
  type ContractCategory,
} from "@/portal/data/contractTypes";

const CATS: ContractCategory[] = ['sale', 'services', 'work', 'rent', 'agency', 'finance', 'ip', 'corporate', 'foreign'];

const CAT_BADGE_CLASS: Record<ContractCategory, string> = {
  sale: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  services: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  work: 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border border-pink-500/30',
  rent: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  agency: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  finance: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30',
  ip: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30',
  corporate: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30',
  foreign: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
};

const ContractTypesPage = () => {
  const [catFilter, setCatFilter] = useState<ContractCategory | "all">("all");
  const [search, setSearch] = useState("");

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: CONTRACT_TYPES.length };
    CONTRACT_TYPES.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CONTRACT_TYPES.filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.parties.toLowerCase().includes(q) ||
        p.legalRef.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [catFilter, search]);

  const activeFilters = catFilter !== "all" ? 1 : 0;

  const sidebar = (
    <FilterSection title="Категорія договору">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Усі", count: catCounts.all },
          ...CATS.map((k) => ({
            value: k,
            label: CONTRACT_CATEGORY_LABEL[k],
            count: catCounts[k] || 0,
          })),
        ]}
        value={catFilter}
        onChange={(v) => setCatFilter(v as ContractCategory | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `Договори — типи, істотні умови, форма, ризики 2026 | FINTODO`,
        description: `Каталог 22 типів договорів: купівля-продаж, підряд, ЦПХ, трудовий, оренда, NDA, ліцензія, ESOP, SHA, ЗЕД. Сторони, істотні умови, форма (письмова / нотаріальна), оподаткування, ризики і ст. ЦКУ/ГКУ.`,
        canonical: `${SITE_URL}/dovidnyky/dogovory`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Договори", url: `${SITE_URL}/dovidnyky/dogovory` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Договори" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-primary" />
              Договори — типи, істотні умови, ризики
            </h1>
            <p className="text-muted-foreground">
              22 типи договорів за ЦКУ і ГКУ: купівля-продаж, постачання, підряд, ЦПХ, трудовий,
              оренда, NDA, ліцензія, ESOP, SHA, ЗЕД. Без істотних умов договір не вважається
              укладеним. Snapshot {CONTRACT_TYPES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: підряд, ЦПХ, NDA, оренда, ЗЕД..."
            resultCount={filtered.length}
            resultLabel="договорів"
            activeFilterCount={activeFilters}
            onResetFilters={() => setCatFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((p) => (
                <Card key={p.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-[10px] ${CAT_BADGE_CLASS[p.category]}`}>
                          {CONTRACT_CATEGORY_LABEL[p.category]}
                        </Badge>
                        {p.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{p.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{p.parties}</p>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px]">
                    <div className="text-muted-foreground mb-0.5">Істотні умови:</div>
                    <ul className="ml-3 list-disc text-foreground space-y-0.5">
                      {p.essentialTerms.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>

                  <div className="text-[11px] space-y-1 mb-2">
                    <div><span className="text-muted-foreground">Форма: </span><span className="text-foreground">{p.form}</span></div>
                    {p.taxation && (
                      <div><span className="text-muted-foreground">Оподаткування: </span><span className="text-foreground">{p.taxation}</span></div>
                    )}
                    <div className="text-muted-foreground italic">{p.legalRef}</div>
                  </div>

                  {p.risks && p.risks.length > 0 && (
                    <div className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-1.5 text-[11px]">
                      <div className="text-amber-700 dark:text-amber-400 font-medium mb-0.5 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Ризики:
                      </div>
                      <ul className="ml-3 list-disc text-foreground space-y-0.5">
                        {p.risks.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" />
                Загальні правила укладення договорів
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>Без істотних умов (предмет, ціна, строк) — договір не вважається укладеним.</li>
                <li>Письмова форма обовʼязкова для угод ≥ 17 000 ₴ між фізособами (10 НМДГ).</li>
                <li>Нотаріальна форма — нерухомість, авто, корпоративні права, спадщина.</li>
                <li>Електронний договір з КЕП = письмовий (ст. 11 ЗУ № 851-IV).</li>
                <li>Конклюдентні дії (акцепт оферти, оплата) = укладений договір.</li>
                <li>ЦПХ vs трудовий — заборона ознак трудових (графік, місце, підпорядкування).</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="dogovory" />
    </PortalLayout>
  );
};

export default ContractTypesPage;
