import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Sparkles, ShieldAlert, ExternalLink, Check, X } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  RRO_DEVICES,
  RRO_KIND_LABEL,
  RRO_DEVICES_AS_OF,
  FISCAL_RECEIPT_CODES,
  type RroKind,
} from "@/portal/data/rroDevices";

const KINDS: RroKind[] = ['pprro_free', 'pprro_paid', 'hardware', 'pos_terminal'];

const KIND_BADGE_CLASS: Record<RroKind, string> = {
  pprro_free: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  pprro_paid: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  hardware: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  pos_terminal: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
};

const RroDevicesPage = () => {
  const [kindFilter, setKindFilter] = useState<RroKind | "all">("all");
  const [search, setSearch] = useState("");

  const kindCounts = useMemo(() => {
    const c: Record<string, number> = { all: RRO_DEVICES.length };
    RRO_DEVICES.forEach((d) => (c[d.kind] = (c[d.kind] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return RRO_DEVICES.filter((d) => {
      if (kindFilter !== "all" && d.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        d.bestFor.join(' ').toLowerCase().includes(q) ||
        d.supports.join(' ').toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [kindFilter, search]);

  const activeFilters = kindFilter !== "all" ? 1 : 0;

  const sidebar = (
    <>
      <FilterSection title="Тип РРО/ПРРО">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: kindCounts.all },
            ...KINDS.map((k) => ({
              value: k,
              label: RRO_KIND_LABEL[k],
              count: kindCounts[k] || 0,
            })),
          ]}
          value={kindFilter}
          onChange={(v) => setKindFilter(v as RroKind | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `РРО і ПРРО — Держреєстр, ціни, порівняння | FINTODO`,
        description: `Усі програмні (ПРРО) і апаратні РРО, дозволені ДПС: Checkbox, Cashälot, ПРРО ДПС, monobank, LiqPay, IIKO, МІНІ-Т, МАРІЯ. Ціни, інтеграції, плюси і мінуси.`,
        canonical: `${SITE_URL}/dovidnyky/rro-pprro`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "РРО і ПРРО", url: `${SITE_URL}/dovidnyky/rro-pprro` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "РРО і ПРРО" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              РРО та ПРРО — реєстр, ціни, порівняння
            </h1>
            <p className="text-muted-foreground">
              Усі дозволені фіскальні рішення з Держреєстру РРО і Реєстру ПРРО ДПС: безкоштовні
              (ПРРО ДПС), комерційні (Checkbox, Cashälot, monobank, LiqPay) та апаратні моделі.
              Snapshot {RRO_DEVICES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: Checkbox, monobank, ПриватБанк, кафе..."
            resultCount={filtered.length}
            resultLabel="рішень"
            activeFilterCount={activeFilters}
            onResetFilters={() => setKindFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((d) => (
                <Card key={d.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-[10px] ${KIND_BADGE_CLASS[d.kind]}`}>
                          {RRO_KIND_LABEL[d.kind]}
                        </Badge>
                        {d.registered && (
                          <Badge variant="outline" className="text-[10px] gap-0.5">
                            <Check className="h-3 w-3 text-emerald-600" /> У Держреєстрі
                          </Badge>
                        )}
                        {d.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{d.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{d.vendor}</p>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1">
                    <div><span className="text-muted-foreground">Ціна: </span><span className="text-foreground font-medium">{d.priceUah}</span></div>
                    <div><span className="text-muted-foreground">Канал: </span><span className="text-foreground">{d.channel}</span></div>
                    <div><span className="text-muted-foreground">Оплати: </span><span className="text-foreground">{d.supports.join(', ')}</span></div>
                    {d.acquiringNotes && (
                      <div><span className="text-muted-foreground">Еквайринг: </span><span className="text-foreground">{d.acquiringNotes}</span></div>
                    )}
                    <div className="text-muted-foreground italic">{d.registryRef}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1"><Check className="h-3 w-3" /> Плюси</p>
                      <ul className="space-y-0.5 ml-3 list-disc text-muted-foreground">
                        {d.pros.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1"><X className="h-3 w-3" /> Мінуси</p>
                      <ul className="space-y-0.5 ml-3 list-disc text-muted-foreground">
                        {d.cons.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  </div>

                  {d.website && (
                    <a
                      href={d.website} target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      Перейти на сайт <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            {/* Fiscal receipt codes block */}
            <div className="mt-6 p-4 rounded-lg border border-border bg-card">
              <h2 className="text-sm font-semibold text-foreground mb-2">Коди форми оплати у фіскальному чеку</h2>
              <p className="text-xs text-muted-foreground mb-3">
                За Наказом Мінфіну № 13 кожен чек містить код виду оплати. Помилка призведе до невідповідності
                між фіскальним звітом і виторгом у банку.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {FISCAL_RECEIPT_CODES.map((c) => (
                  <div key={c.code} className="rounded-md border border-border bg-muted/30 p-2 text-[11px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant="default" className="text-xs font-bold font-mono">{c.code}</Badge>
                      <span className="font-medium text-foreground">{c.name}</span>
                    </div>
                    <p className="text-muted-foreground mb-1">{c.description}</p>
                    <p className="text-foreground italic">{c.example}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Коли РРО/ПРРО обовʼязковий
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>ФОП 2–4 групи з обігом понад 220 × МЗП на рік (≈ 1.76 млн ₴ у 2026).</li>
                <li>Будь-які продажі технічно складних товарів (телефони, ноутбуки, годинники).</li>
                <li>Прийом картки (POS, LiqPay, Fondy) — РРО з 2022, незалежно від обігу.</li>
                <li>Інтернет-торгівля з прийомом онлайн-оплат.</li>
                <li>Штраф 100% від суми незареєстрованого продажу + 1500% за повторне порушення (ст. 17 ЗУ № 265/95).</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="rro-pprro" />
    </PortalLayout>
  );
};

export default RroDevicesPage;
