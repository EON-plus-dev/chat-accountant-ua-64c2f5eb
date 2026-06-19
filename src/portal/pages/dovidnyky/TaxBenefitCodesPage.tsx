import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, BookOpen, Sparkles, AlertTriangle, Receipt, ScrollText } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { toast } from "sonner";
import {
  TAX_BENEFIT_CODES,
  TAX_LABEL,
  KIND_LABEL,
  CATEGORY_LABEL,
  TAX_BENEFIT_AS_OF,
  type TaxBenefitTax,
  type TaxBenefitCategory,
} from "@/portal/data/taxBenefitCodes";

const TAXES: TaxBenefitTax[] = ['pdv', 'profit', 'pdfo', 'ep', 'land', 'rent'];
const CATEGORIES: TaxBenefitCategory[] = [
  'it', 'medicine', 'education', 'social', 'defense', 'agro', 'export', 'energy', 'investment', 'culture', 'other',
];

const KIND_COLOR: Record<string, string> = {
  exempt: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300',
  zero_rate: 'bg-blue-500/15 text-blue-700 border border-blue-500/30 dark:text-blue-300',
  reduced_rate: 'bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300',
  deduction: 'bg-violet-500/15 text-violet-700 border border-violet-500/30 dark:text-violet-300',
  not_subject: 'bg-slate-500/15 text-slate-700 border border-slate-500/30 dark:text-slate-300',
};

const TaxBenefitCodesPage = () => {
  const [taxFilter, setTaxFilter] = useState<TaxBenefitTax | "all">("all");
  const [catFilter, setCatFilter] = useState<TaxBenefitCategory | "all">("all");
  const [search, setSearch] = useState("");

  const taxCounts = useMemo(() => {
    const c: Record<string, number> = { all: TAX_BENEFIT_CODES.length };
    TAX_BENEFIT_CODES.forEach((e) => (c[e.tax] = (c[e.tax] || 0) + 1));
    return c;
  }, []);

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: TAX_BENEFIT_CODES.length };
    TAX_BENEFIT_CODES.forEach((e) => (c[e.category] = (c[e.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TAX_BENEFIT_CODES.filter((e) => {
      if (taxFilter !== "all" && e.tax !== taxFilter) return false;
      if (catFilter !== "all" && e.category !== catFilter) return false;
      if (!q) return true;
      return (
        e.code.includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.legalRef.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (!!a.popular !== !!b.popular) return a.popular ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [taxFilter, catFilter, search]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Код пільги ${code} скопійовано`);
  };

  const activeCount = (taxFilter !== "all" ? 1 : 0) + (catFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Податок">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: taxCounts.all },
            ...TAXES.map((t) => ({
              value: t,
              label: TAX_LABEL[t],
              count: taxCounts[t] || 0,
            })).filter((o) => o.count > 0),
          ]}
          value={taxFilter}
          onChange={(v) => setTaxFilter(v as TaxBenefitTax | "all")}
        />
      </FilterSection>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: catCounts.all },
            ...CATEGORIES.map((c) => ({
              value: c,
              label: CATEGORY_LABEL[c],
              count: catCounts[c] || 0,
            })).filter((o) => o.count > 0),
          ]}
          value={catFilter}
          onChange={(v) => setCatFilter(v as TaxBenefitCategory | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Довідник податкових пільг ДПС (ф. 1ПП) — коди ПДВ, прибуток, ПДФО | FINTODO",
        description: `Топ-${TAX_BENEFIT_CODES.length} кодів довідника податкових пільг ДПС: для Звіту про суми пільг (ф. 1ПП), додатка 5 декларації ПДВ і декларації з прибутку. Snapshot ${TAX_BENEFIT_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/kody-pilg`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Коди податкових пільг", url: `${SITE_URL}/dovidnyky/kody-pilg` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Коди податкових пільг" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              Довідник податкових пільг ДПС
            </h1>
            <p className="text-muted-foreground">
              7-значні коди для Звіту про суми податкових пільг (форма 1ПП), додатка 5 декларації ПДВ
              та декларації з податку на прибуток. ДПС оновлює довідник щокварталу. Snapshot {TAX_BENEFIT_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: код, назва, стаття ПКУ..."
            resultCount={filtered.length}
            resultLabel="кодів"
            activeFilterCount={activeCount}
            onResetFilters={() => {
              setTaxFilter("all");
              setCatFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((e) => {
                const isObsolete = !!e.endDate && new Date(e.endDate) < new Date();
                return (
                  <Card
                    key={e.code}
                    className={`p-4 hover:border-primary/40 transition-colors ${isObsolete ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => copyCode(e.code)}
                            className="font-mono text-sm font-bold tabular-nums text-primary hover:underline inline-flex items-center gap-1"
                            title="Копіювати код"
                          >
                            {e.code}
                            <Copy className="h-3 w-3 opacity-60" />
                          </button>
                          <Badge variant="outline" className="text-[10px]">{TAX_LABEL[e.tax]}</Badge>
                          <Badge className={`text-[10px] ${KIND_COLOR[e.kind]}`} variant="outline">
                            {KIND_LABEL[e.kind]}
                          </Badge>
                          {e.popular && !isObsolete && (
                            <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                              <Sparkles className="h-3 w-3" /> Часто
                            </Badge>
                          )}
                          {isObsolete && (
                            <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">
                              Не діє з {e.endDate}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{e.name}</h3>
                      </div>
                    </div>

                    <p className="text-[12px] text-foreground/85 mb-2 leading-snug">{e.summary}</p>

                    <div className="rounded-md bg-muted/40 border border-border px-3 py-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                      <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen className="h-3 w-3" /> {e.legalRef}
                      </div>
                      {e.rate && (
                        <div>
                          <span className="text-muted-foreground">Ставка: </span>
                          <span className="font-semibold text-foreground tabular-nums">{e.rate}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Категорія: </span>
                        <span className="text-foreground">{CATEGORY_LABEL[e.category]}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
                        <ScrollText className="h-3 w-3" />
                        {e.requires1pp
                          ? <span>Відображається у формі <strong className="text-foreground">1ПП</strong></span>
                          : <span>1ПП не подається</span>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Як працювати з кодами пільг
              </p>
              <ul className="text-muted-foreground space-y-1 ml-3 list-disc">
                <li>Звіт за <strong>ф. 1ПП</strong> подається щоквартально протягом 40 к.д. після кварталу, в якому застосовано пільгу.</li>
                <li>У звіті — код пільги, сума втрат бюджету, дата початку і кінця застосування у звітному періоді.</li>
                <li>Несвоєчасна подача 1ПП — штраф 340 ₴ (за першу), 1 020 ₴ (за повторну протягом року) — ст. 119<sup>1</sup> ПКУ.</li>
                <li>Довідник ДПС оновлюється щокварталу — звіряйтесь з актуальною версією на офіційному сайті <strong>tax.gov.ua</strong>.</li>
                <li>У декларації з ПДВ коди вказуються у <strong>додатку 5</strong> по кожній операції зі звільненням / 0% ставкою.</li>
                <li>Втрата чинності пільги (наприклад, ПДВ-пільга на ІТ-софт після 01.01.2023) — припиняє підставу для застосування.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="kody-pilg" />
    </PortalLayout>
  );
};

export default TaxBenefitCodesPage;
