import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Sparkles, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  LABOR_PAYMENTS,
  LABOR_CATEGORY_LABEL,
  LABOR_PAYMENTS_AS_OF,
  type LaborPaymentCategory,
} from "@/portal/data/laborPayments";

const CATS: LaborPaymentCategory[] = ['leave', 'sick', 'maternity', 'travel', 'compensation', 'severance', 'wartime'];

const CAT_BADGE_CLASS: Record<LaborPaymentCategory, string> = {
  leave: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  sick: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  maternity: 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border border-pink-500/30',
  travel: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  compensation: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  severance: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30',
  wartime: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
};

const PAYER_LABEL: Record<string, string> = {
  employer: 'Роботодавець',
  social_fund: 'ПФУ/Соцстрах',
  state: 'Держбюджет',
  mixed: 'Змішане',
};

const LaborPaymentsPage = () => {
  const [catFilter, setCatFilter] = useState<LaborPaymentCategory | "all">("all");
  const [search, setSearch] = useState("");

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: LABOR_PAYMENTS.length };
    LABOR_PAYMENTS.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return LABOR_PAYMENTS.filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.formula.toLowerCase().includes(q) ||
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
    <>
      <FilterSection title="Категорія виплати">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: catCounts.all },
            ...CATS.map((k) => ({
              value: k,
              label: LABOR_CATEGORY_LABEL[k],
              count: catCounts[k] || 0,
            })),
          ]}
          value={catFilter}
          onChange={(v) => setCatFilter(v as LaborPaymentCategory | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Трудові виплати — відпустки, лікарняні, декрет, відрядні, вихідна | FINTODO`,
        description: `Усі виплати працівникам: відпустки (28 к.д., дитячі, навчальні), лікарняні (% за стажем), декрет, добові, індексація, вихідна допомога, воєнні. Формули, ПДФО/ВЗ/ЄСВ, ліміти 2026.`,
        canonical: `${SITE_URL}/dovidnyky/trudovi-vyplaty`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Трудові виплати", url: `${SITE_URL}/dovidnyky/trudovi-vyplaty` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Трудові виплати" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Трудові виплати — формули і оподаткування
            </h1>
            <p className="text-muted-foreground">
              Повний довідник виплат працівникам: відпускні, лікарняні (% за стажем), декретні,
              добові у відрядженні (ліміт 0.1 МЗП), індексація, вихідна допомога і воєнні виплати.
              Snapshot {LABOR_PAYMENTS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: відпустка, лікарняні, декрет, відрядні..."
            resultCount={filtered.length}
            resultLabel="виплат"
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
                          {LABOR_CATEGORY_LABEL[p.category]}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Платник: {PAYER_LABEL[p.payer]}
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

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1">
                    <div><span className="text-muted-foreground">База: </span><span className="text-foreground">{p.base}</span></div>
                    <div><span className="text-muted-foreground">Формула: </span><span className="text-foreground font-medium">{p.formula}</span></div>
                    <div className="flex items-start gap-1.5 pt-1">
                      <Info className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span><span className="text-muted-foreground">Приклад: </span><span className="text-foreground">{p.example}</span></span>
                    </div>
                    <div className="text-muted-foreground italic">{p.legalRef}</div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2 text-[10px]">
                    <Badge variant={p.taxation.pdfo ? "default" : "outline"} className="text-[10px]">
                      ПДФО 18% {p.taxation.pdfo ? '✓' : '—'}
                    </Badge>
                    <Badge variant={p.taxation.vz ? "default" : "outline"} className="text-[10px]">
                      ВЗ 5% {p.taxation.vz ? '✓' : '—'}
                    </Badge>
                    <Badge variant={p.taxation.esv ? "default" : "outline"} className="text-[10px]">
                      ЄСВ 22% {p.taxation.esv ? '✓' : '—'}
                    </Badge>
                  </div>

                  {p.taxation.notes && (
                    <p className="text-[11px] text-muted-foreground italic mb-2">{p.taxation.notes}</p>
                  )}

                  {p.limits && p.limits.length > 0 && (
                    <ul className="text-[11px] space-y-0.5 ml-3 list-disc text-muted-foreground">
                      {p.limits.map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
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
                Ключові ліміти 2026 року
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>МЗП — 8 000 ₴/міс, мін. погодинна — 48 ₴/год.</li>
                <li>Прожитковий мінімум для працездатних — 3 028 ₴.</li>
                <li>Максимальна база ЄСВ — 15 МЗП = 120 000 ₴/міс.</li>
                <li>Добові по Україні — до 800 ₴/добу без ПДФО (0.1 × МЗП).</li>
                <li>Добові за кордон — до 80 EUR/добу без ПДФО.</li>
                <li>Лікарняні: 50% (стаж до 3 р.), 60% (3–5 р.), 70% (5–8 р.), 100% (8+ р., чорнобильці, УБД).</li>
                <li>Перші 5 днів лікарняних — за рахунок роботодавця, з 6-го дня — ПФУ.</li>
                <li>Невикористана основна відпустка компенсується тільки при звільненні.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="trudovi-vyplaty" />
    </PortalLayout>
  );
};

export default LaborPaymentsPage;
