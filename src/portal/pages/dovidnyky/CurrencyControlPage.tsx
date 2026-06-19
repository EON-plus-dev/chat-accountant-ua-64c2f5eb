import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe2, Sparkles, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  CURRENCY_CONTROL,
  CC_CATEGORY_LABEL,
  CURRENCY_CONTROL_AS_OF,
  type CurrencyControlCategory,
} from "@/portal/data/currencyControl";

const CATS: CurrencyControlCategory[] = ['deadline', 'penalty', 'e_limit', 'monitoring', 'license', 'invest', 'loan', 'cash'];

const CAT_BADGE_CLASS: Record<CurrencyControlCategory, string> = {
  deadline: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  penalty: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
  e_limit: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  monitoring: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  license: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  invest: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30',
  loan: 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border border-pink-500/30',
  cash: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30',
};

const CurrencyControlPage = () => {
  const [catFilter, setCatFilter] = useState<CurrencyControlCategory | "all">("all");
  const [search, setSearch] = useState("");

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: CURRENCY_CONTROL.length };
    CURRENCY_CONTROL.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CURRENCY_CONTROL.filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.rule.toLowerCase().includes(q) ||
        p.example.toLowerCase().includes(q) ||
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
            label: CC_CATEGORY_LABEL[k],
            count: catCounts[k] || 0,
          })),
        ]}
        value={catFilter}
        onChange={(v) => setCatFilter(v as CurrencyControlCategory | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `Валютний контроль ЗЕД 2026 — 180 днів, пеня 0.3%, e-ліміти НБУ | FINTODO`,
        description: `Усі правила валютного контролю: 180 днів для виручки і передоплати, пеня 0.3%/день, e-ліміти $2 млн/$100К, нагляд банку від 400К, ліцензії НБУ, обмеження воєнного часу.`,
        canonical: `${SITE_URL}/dovidnyky/valyutnyy-kontrol`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Валютний контроль", url: `${SITE_URL}/dovidnyky/valyutnyy-kontrol` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Валютний контроль ЗЕД" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Globe2 className="h-6 w-6 text-primary" />
              Валютний контроль і ЗЕД-розрахунки
            </h1>
            <p className="text-muted-foreground">
              Строки розрахунків (180 днів), пеня 0.3%/день, e-ліміти НБУ ($100К/$2М),
              валютний нагляд банку (400К), ліцензії НБУ, заборона з недружніми юрисдикціями
              і воєнні обмеження. Snapshot {CURRENCY_CONTROL_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: 180, експорт, пеня, e-ліміт, НБУ..."
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
                          {CC_CATEGORY_LABEL[p.category]}
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

                  <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 mb-2">
                    <div className="text-[11px] text-muted-foreground">Значення:</div>
                    <div className="text-sm font-semibold text-foreground">{p.value}</div>
                  </div>

                  <p className="text-[12px] text-foreground mb-2">{p.rule}</p>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1">
                    <div className="flex items-start gap-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span><span className="text-muted-foreground">Приклад: </span><span className="text-foreground">{p.example}</span></span>
                    </div>
                    <div className="text-muted-foreground italic">{p.legalRef}</div>
                  </div>

                  {p.exceptions && p.exceptions.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[10px] text-muted-foreground mb-0.5">Виключення:</div>
                      <ul className="text-[11px] space-y-0.5 ml-3 list-disc text-foreground">
                        {p.exceptions.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}

                  {p.penalty && (
                    <div className="rounded-md bg-red-500/10 border border-red-500/30 px-2 py-1.5 text-[11px] flex items-start gap-1.5">
                      <ShieldAlert className="h-3 w-3 mt-0.5 shrink-0 text-red-500" />
                      <span><span className="text-red-700 dark:text-red-400 font-medium">Санкція: </span><span className="text-foreground">{p.penalty}</span></span>
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
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Ключові цифри валютного контролю 2026
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li><b>180 днів</b> — для надходження виручки за експорт або постачання за передоплатою</li>
                <li><b>0.3% / день</b> — пеня за прострочення (макс. 100% суми)</li>
                <li><b>$2 000 000 / рік</b> — e-ліміт юрособи на інвестиції за кордон</li>
                <li><b>$100 000 / рік</b> — e-ліміт фізособи на перекази / інвестиції</li>
                <li><b>$9 100 / міс</b> — ліміт переказів родичам за кордон (воєнні обмеження)</li>
                <li><b>400 000 ₴</b> — поріг обовʼязкового валютного нагляду банку</li>
                <li><b>10 000 EUR</b> — вивезення готівкою без декларування</li>
                <li><b>1, 2 групи ФОП — БЕЗ ЗЕД</b>; 3 група — без обмежень</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="valyutnyy-kontrol" />
    </PortalLayout>
  );
};

export default CurrencyControlPage;
