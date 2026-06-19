import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Copy, Sparkles, Info, ShieldAlert, Check } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { toast } from "@/hooks/use-toast";
import {
  COUNTRIES,
  COUNTRY_GROUP_LABEL,
  COUNTRY_RISK_LABEL,
  COUNTRY_CODES_AS_OF,
  type CountryGroup,
  type CountryRiskLevel,
} from "@/portal/data/countryCodes";

const GROUPS: CountryGroup[] = [
  'eu', 'g7', 'major_trade', 'cis_partner', 'offshore', 'fatf_high_risk', 'sanctioned', 'other',
];

const RISKS: CountryRiskLevel[] = ['safe', 'enhanced', 'high_risk', 'sanctioned'];

const CountryCodesPage = () => {
  const [groupFilter, setGroupFilter] = useState<CountryGroup | "all">("all");
  const [riskFilter, setRiskFilter] = useState<CountryRiskLevel | "all">("all");
  const [search, setSearch] = useState("");

  const groupCounts = useMemo(() => {
    const c: Record<string, number> = { all: COUNTRIES.length };
    COUNTRIES.forEach((e) => (c[e.group] = (c[e.group] || 0) + 1));
    return c;
  }, []);
  const riskCounts = useMemo(() => {
    const c: Record<string, number> = { all: COUNTRIES.length };
    COUNTRIES.forEach((e) => (c[e.risk] = (c[e.risk] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter((e) => {
      if (groupFilter !== "all" && e.group !== groupFilter) return false;
      if (riskFilter !== "all" && e.risk !== riskFilter) return false;
      if (!q) return true;
      return (
        e.alpha2.toLowerCase().includes(q) ||
        e.alpha3.toLowerCase().includes(q) ||
        e.numeric.includes(q) ||
        e.name.toLowerCase().includes(q) ||
        (e.fullName?.toLowerCase().includes(q) ?? false)
      );
    }).sort((a, b) => {
      if (!!a.popular !== !!b.popular) return a.popular ? -1 : 1;
      return a.name.localeCompare(b.name, 'uk');
    });
  }, [groupFilter, riskFilter, search]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: `${label}: ${text}` });
  };

  const sidebar = (
    <>
      <FilterSection title="Група / регіон">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: groupCounts.all },
            ...GROUPS.map((g) => ({
              value: g,
              label: COUNTRY_GROUP_LABEL[g],
              count: groupCounts[g] || 0,
            })).filter((o) => o.count > 0),
          ]}
          value={groupFilter}
          onChange={(v) => setGroupFilter(v as CountryGroup | "all")}
        />
      </FilterSection>
      <FilterSection title="Рівень ризику">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: riskCounts.all },
            ...RISKS.map((r) => ({
              value: r,
              label: COUNTRY_RISK_LABEL[r].text,
              count: riskCounts[r] || 0,
            })).filter((o) => o.count > 0),
          ]}
          value={riskFilter}
          onChange={(v) => setRiskFilter(v as CountryRiskLevel | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Коди країн ISO 3166 — alpha-2, alpha-3, numeric | FINTODO",
        description: `Довідник кодів країн ISO 3166-1 для митниць (ВМД, УКТ ЗЕД), SWIFT-платежів, форми 4ДФ і CRS/FATCA. ${COUNTRIES.length} країн з оцінкою ризику для ЗЕД і фінмоніторингу. Snapshot ${COUNTRY_CODES_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/krayiny`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Країни ISO 3166", url: `${SITE_URL}/dovidnyky/krayiny` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Країни ISO 3166" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Коди країн ISO 3166
            </h1>
            <p className="text-muted-foreground">
              ISO 3166-1: alpha-2 (2 літери — SWIFT, IBAN), alpha-3 (3 літери — митниця, ВМД)
              і цифровий 3-значний код. Маркери ризику для фінмоніторингу, ЗЕД-операцій,
              ТЦО та переліку низькоподаткових юрисдикцій за ст. 39 ПКУ.
              Snapshot {COUNTRY_CODES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: UA, USA, 804, Польща, Кіпр..."
            resultCount={filtered.length}
            resultLabel="країн"
            activeFilterCount={(groupFilter !== "all" ? 1 : 0) + (riskFilter !== "all" ? 1 : 0)}
            onResetFilters={() => {
              setGroupFilter("all");
              setRiskFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((e, idx) => {
                const risk = COUNTRY_RISK_LABEL[e.risk];
                return (
                  <Card key={`${e.alpha2}-${e.numeric}-${idx}`} className="p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xl leading-none">{e.flag}</span>
                          <h3 className="text-sm font-semibold text-foreground">{e.name}</h3>
                          {e.popular && (
                            <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                              <Sparkles className="h-3 w-3" /> Часто
                            </Badge>
                          )}
                        </div>
                        {e.fullName && (
                          <p className="text-[11px] text-muted-foreground italic">{e.fullName}</p>
                        )}
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {COUNTRY_GROUP_LABEL[e.group]}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 grid grid-cols-3 gap-2 text-[11px]">
                      <button
                        onClick={() => copy(e.alpha2, 'alpha-2')}
                        className="flex flex-col items-start hover:text-primary group"
                      >
                        <span className="text-[10px] text-muted-foreground">alpha-2</span>
                        <span className="font-mono font-bold text-sm tabular-nums">{e.alpha2}</span>
                      </button>
                      <button
                        onClick={() => copy(e.alpha3, 'alpha-3')}
                        className="flex flex-col items-start hover:text-primary group"
                      >
                        <span className="text-[10px] text-muted-foreground">alpha-3</span>
                        <span className="font-mono font-bold text-sm tabular-nums">{e.alpha3}</span>
                      </button>
                      <button
                        onClick={() => copy(e.numeric, 'numeric')}
                        className="flex flex-col items-start hover:text-primary group"
                      >
                        <span className="text-[10px] text-muted-foreground">numeric</span>
                        <span className="font-mono font-bold text-sm tabular-nums">{e.numeric}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] mb-2 gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Ризик: </span>
                        <span className={risk.cls + ' font-medium'}>{risk.text}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        {e.hasDtt ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">ДПО з Україною</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Без ДПО</span>
                        )}
                      </span>
                    </div>

                    {e.note && (
                      <p className="text-[11px] text-muted-foreground italic mb-2 flex items-start gap-1.5">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{e.note}</span>
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] w-full"
                      onClick={() => copy(`${e.alpha2} / ${e.alpha3} / ${e.numeric}`, e.name)}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Копіювати всі коди
                    </Button>
                  </Card>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-600" /> Де які коди використовувати?
              </p>
              <ul className="text-muted-foreground space-y-1 ml-3 list-disc">
                <li><span className="font-mono font-semibold">alpha-2</span> — SWIFT-платежі, IBAN, домени верхнього рівня, форма 4ДФ для нерезидентів.</li>
                <li><span className="font-mono font-semibold">alpha-3</span> — митні декларації (ВМД), УКТ ЗЕД, статистична звітність до НБУ.</li>
                <li><span className="font-mono font-semibold">numeric</span> — електронні формати ВМД, ISO-стандарти платіжних систем.</li>
                <li>Перелік низькоподаткових юрисдикцій (постанова КМУ № 1045) — спеціальний контроль ТЦО, навіть якщо країна не офшор за статусом.</li>
                <li>Операції з санкційованими країнами (рф, рб, КНДР, Іран, Сирія) — повністю заборонені згідно ЗУ № 2120-IX.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="krayiny" />
    </PortalLayout>
  );
};

export default CountryCodesPage;
