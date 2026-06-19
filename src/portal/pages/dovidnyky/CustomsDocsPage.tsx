import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship, Sparkles, Building2, Clock, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  CUSTOMS_DOCUMENTS,
  CUSTOMS_CATEGORY_LABEL,
  CUSTOMS_AUDIENCE_LABEL,
  CUSTOMS_DOCS_AS_OF,
  type CustomsDocCategory,
  type CustomsDocAudience,
} from "@/portal/data/customsDocs";

const CATEGORIES: CustomsDocCategory[] = [
  'customs_declaration', 'transport', 'commercial', 'origin', 'permits', 'other',
];

const AUDIENCE_BADGE_CLASS: Record<CustomsDocAudience, string> = {
  import: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  export: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  both: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
};

const CustomsDocsPage = () => {
  const [categoryFilter, setCategoryFilter] = useState<CustomsDocCategory | "all">("all");
  const [audienceFilter, setAudienceFilter] = useState<CustomsDocAudience | "all">("all");
  const [search, setSearch] = useState("");

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: CUSTOMS_DOCUMENTS.length };
    CUSTOMS_DOCUMENTS.forEach((d) => (c[d.category] = (c[d.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CUSTOMS_DOCUMENTS.filter((d) => {
      if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
      if (audienceFilter !== "all" && d.audience !== audienceFilter && d.audience !== 'both') return false;
      if (!q) return true;
      return (
        d.code.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.purpose.toLowerCase().includes(q) ||
        d.legalRef.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [categoryFilter, audienceFilter, search]);

  const activeFilters = (categoryFilter !== "all" ? 1 : 0) + (audienceFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: categoryCounts.all },
            ...CATEGORIES.map((c) => ({
              value: c,
              label: CUSTOMS_CATEGORY_LABEL[c],
              count: categoryCounts[c] || 0,
            })),
          ]}
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as CustomsDocCategory | "all")}
        />
      </FilterSection>
      <FilterSection title="Напрямок">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            { value: "import", label: "Імпорт" },
            { value: "export", label: "Експорт" },
          ]}
          value={audienceFilter}
          onChange={(v) => setAudienceFilter(v as CustomsDocAudience | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Митні документи ЗЕД — ${CUSTOMS_DOCUMENTS.length}+ форм (ВМД, CMR, EUR.1, Інвойс) | FINTODO`,
        description: `Довідник митних документів для імпорту/експорту: МД-2, CMR, EUR.1, інвойс, проформа, фітосан, ATA. Хто видає, нормативка, коли обовʼязковий.`,
        canonical: `${SITE_URL}/dovidnyky/mytni-dokumenty`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Митні документи", url: `${SITE_URL}/dovidnyky/mytni-dokumenty` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Митні документи" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Ship className="h-6 w-6 text-primary" />
              Митні документи для імпорту/експорту
            </h1>
            <p className="text-muted-foreground">
              Каталог документів ЗЕД: митні декларації, транспортні (CMR, AWB, B/L),
              комерційні (інвойс, проформа), сертифікати походження (EUR.1, СТ-1) і дозволи
              (фітосан, ветсертифікат, ATA). Snapshot {CUSTOMS_DOCS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: МД-2, CMR, EUR.1, інвойс, фітосан..."
            resultCount={filtered.length}
            resultLabel="документів"
            activeFilterCount={activeFilters}
            onResetFilters={() => {
              setCategoryFilter("all");
              setAudienceFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((d) => (
                <Card key={d.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="default" className="text-xs font-bold">{d.code}</Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {CUSTOMS_CATEGORY_LABEL[d.category]}
                        </Badge>
                        <Badge className={`text-[10px] ${AUDIENCE_BADGE_CLASS[d.audience]}`}>
                          {CUSTOMS_AUDIENCE_LABEL[d.audience]}
                        </Badge>
                        {d.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{d.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{d.purpose}</p>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <Building2 className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span>
                        <span className="text-muted-foreground">Видає: </span>
                        <span className="text-foreground">{d.issuer}</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span>
                        <span className="text-muted-foreground">Коли потрібен: </span>
                        <span className="text-foreground">{d.whenRequired}</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Clock className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <span>
                        <span className="text-muted-foreground">Зберігання: </span>
                        <span className="text-foreground">{d.retention}</span>
                      </span>
                    </div>
                    <div className="text-muted-foreground italic">{d.legalRef}</div>
                  </div>

                  {d.note && (
                    <p className="text-[11px] text-muted-foreground italic flex items-start gap-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{d.note}</span>
                    </p>
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
                Що буде, якщо документ оформлений з помилкою?
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>Корекція ВМД після випуску — заява до митниці + донарахування мита/ПДВ + пеня 120% облікової ставки НБУ.</li>
                <li>Відсутність CMR — митниця не випустить вантаж, штраф 1 700 ₴ перевізнику (ст. 469 МКУ).</li>
                <li>Помилкове EUR.1 — імпортер ЄС повертає ввізне мито + штраф; продавець відшкодовує збитки.</li>
                <li>Заниження митної вартості в інвойсі — донарахування мита/ПДВ, штраф 100% (ст. 485 МКУ).</li>
                <li>Валютний нагляд: усі ЗЕД-документи мають бути в банку для зняття з контролю (180 днів за ЗУ № 2473).</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="mytni-dokumenty" />
    </PortalLayout>
  );
};

export default CustomsDocsPage;
