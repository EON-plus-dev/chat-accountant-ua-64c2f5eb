import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Sparkles, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  CORPORATE_LAW,
  CORP_CATEGORY_LABEL,
  CORPORATE_LAW_AS_OF,
  type CorporateRuleCategory,
} from "@/portal/data/corporateLaw";

const CATS: CorporateRuleCategory[] = ['tov_setup', 'tov_governance', 'shares', 'capital', 'reporting', 'liquidation', 'ao', 'dyvidendy'];

const CAT_BADGE_CLASS: Record<CorporateRuleCategory, string> = {
  tov_setup: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  tov_governance: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  shares: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  capital: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  reporting: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30',
  liquidation: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
  ao: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30',
  dyvidendy: 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border border-pink-500/30',
};

const CorporateLawPage = () => {
  const [catFilter, setCatFilter] = useState<CorporateRuleCategory | "all">("all");
  const [search, setSearch] = useState("");

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: CORPORATE_LAW.length };
    CORPORATE_LAW.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CORPORATE_LAW.filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.legalRef.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [catFilter, search]);

  const activeFilters = catFilter !== "all" ? 1 : 0;

  const sidebar = (
    <FilterSection title="Категорія">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Усі", count: catCounts.all },
          ...CATS.map((k) => ({
            value: k,
            label: CORP_CATEGORY_LABEL[k],
            count: catCounts[k] || 0,
          })),
        ]}
        value={catFilter}
        onChange={(v) => setCatFilter(v as CorporateRuleCategory | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `Корпоративне право ТОВ — статут, збори, частки, UBO, дивіденди 2026 | FINTODO`,
        description: `Усе про ТОВ і АТ за ЗУ № 2275-VIII і № 2465-IX: реєстрація 24 год, кворум 50%, ключові рішення 75%, UBO 15 р.д., ROFR/tag/drag-along, ESOP, виплата дивідендів 9%/5%, ліквідація.`,
        canonical: `${SITE_URL}/dovidnyky/korporatyvne-pravo`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Корпоративне право", url: `${SITE_URL}/dovidnyky/korporatyvne-pravo` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Корпоративне право" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Корпоративне право — ТОВ і АТ
            </h1>
            <p className="text-muted-foreground">
              Створення ТОВ за 24 години, статут (модельний / власний), кворум загальних зборів,
              виплата дивідендів, відчуження часток (ROFR), декларування UBO за 15 р.д.,
              реорганізація і ліквідація. Snapshot {CORPORATE_LAW_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: статут, збори, частка, UBO, дивіденди..."
            resultCount={filtered.length}
            resultLabel="правил"
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
                          {CORP_CATEGORY_LABEL[p.category]}
                        </Badge>
                        {p.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{p.name}</h3>
                    </div>
                  </div>

                  <p className="text-[12px] text-foreground mb-2">{p.summary}</p>

                  <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 mb-2">
                    <div className="text-[11px] text-muted-foreground">Пороги / строки:</div>
                    <div className="text-sm font-medium text-foreground">{p.thresholds}</div>
                  </div>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px]">
                    <ul className="ml-3 list-disc text-foreground space-y-0.5">
                      {p.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>

                  <p className="text-[11px] text-muted-foreground italic mb-2">{p.legalRef}</p>

                  {p.penalty && (
                    <div className="rounded-md bg-red-500/10 border border-red-500/30 px-2 py-1.5 text-[11px] flex items-start gap-1.5">
                      <ShieldAlert className="h-3 w-3 mt-0.5 shrink-0 text-red-500" />
                      <span><span className="text-red-700 dark:text-red-400 font-medium">Штраф: </span><span className="text-foreground">{p.penalty}</span></span>
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
                Ключові цифри корпоративного права
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li><b>24 год</b> — реєстрація ТОВ через ЦНАП / онлайн</li>
                <li><b>0 ₴</b> — мінімальний статутний капітал ТОВ; 200 МЗП — для АТ</li>
                <li><b>6 міс.</b> — строк внесення часток засновниками</li>
                <li><b>{'>'} 50% / ≥ 75%</b> — кворум зборів / ключові рішення</li>
                <li><b>30 днів</b> — повідомлення про загальні збори учасникам</li>
                <li><b>15 робочих днів</b> — декларування UBO в ЄДР</li>
                <li><b>3 робочі дні</b> — реєстрація змін у ЄДР</li>
                <li><b>9% ПДФО + 5% ВЗ</b> — на дивіденди (Дія City — 5% + 5%)</li>
                <li><b>1 рік</b> — макс. строк виплати вартості частки при виході</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="korporatyvne-pravo" />
    </PortalLayout>
  );
};

export default CorporateLawPage;
