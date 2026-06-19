import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { TrendingUp, Target, BarChart3 } from "lucide-react";
import {
  CHANNEL_BENCHMARKS,
  CHANNEL_LABEL,
  NICHE_LABEL,
  CAC_BENCHMARKS,
  SITE_CONVERSIONS,
  MKT_AS_OF,
  type AdChannel,
  type IndustryNiche,
} from "@/portal/data/marketingBenchmarks";

const NICHES: IndustryNiche[] = ["ecommerce","saas_b2b","fintech","education","real_estate","auto","health","legal","hr_recruiting","travel"];
const CHANNELS: AdChannel[] = ["google_search","meta_facebook","meta_instagram","tiktok","youtube","linkedin","seo_organic","email"];

const fmt = (v: number) => v === 0 ? "—" : `${v.toLocaleString("uk-UA")} ₴`;
const pct = (v: number) => v === 0 ? "—" : `${v.toFixed(1)}%`;

const MarketingBenchmarksPage = () => {
  const [niche, setNiche] = useState<IndustryNiche | "all">("all");
  const [channel, setChannel] = useState<AdChannel | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CHANNEL_BENCHMARKS.filter((b) => {
      if (niche !== "all" && b.niche !== niche) return false;
      if (channel !== "all" && b.channel !== channel) return false;
      if (!q) return true;
      return CHANNEL_LABEL[b.channel].toLowerCase().includes(q)
        || NICHE_LABEL[b.niche].toLowerCase().includes(q);
    });
  }, [niche, channel, search]);

  const activeCount = (niche !== "all" ? 1 : 0) + (channel !== "all" ? 1 : 0);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Ніша">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...NICHES.map((n) => ({ value: n, label: NICHE_LABEL[n] }))]}
          value={niche}
          onChange={(v) => setNiche(v as IndustryNiche | "all")}
        />
      </FilterSection>
      <FilterSection title="Канал">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABEL[c] }))]}
          value={channel}
          onChange={(v) => setChannel(v as AdChannel | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "CPC, CPM, CAC: маркетингові бенчмарки 2026 України | FINTODO",
        description: "Середні ціни кліку, ліда та CAC для Google Ads, Meta, TikTok, LinkedIn по 10 нішах. Дані станом на " + MKT_AS_OF + ".",
        canonical: `${SITE_URL}/dovidnyky/marketingovi-benchmarky`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Маркетингові бенчмарки", url: `${SITE_URL}/dovidnyky/marketingovi-benchmarky` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Маркетингові бенчмарки" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Маркетингові бенчмарки 2026
            </h1>
            <p className="text-muted-foreground">
              Середні CPC, CPM, CTR, CPL та CVR для платних каналів і нішевих ринків. Snapshot {MKT_AS_OF}, курс перерахунку $/₴ = 42.0.
            </p>
          </header>

          {/* CAC блок */}
          <Card className="p-4 space-y-3 bg-primary/5 border-primary/20">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              CAC / LTV / Payback по нішах
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left text-[10px] uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-1.5 pr-3">Ніша</th>
                    <th className="py-1.5 pr-3 text-right">CAC</th>
                    <th className="py-1.5 pr-3 text-right">LTV (1 рік)</th>
                    <th className="py-1.5 pr-3 text-right">LTV/CAC</th>
                    <th className="py-1.5 text-right">Payback</th>
                  </tr>
                </thead>
                <tbody>
                  {CAC_BENCHMARKS.map((c) => (
                    <tr key={c.niche} className="border-b border-border/40 last:border-0">
                      <td className="py-1.5 pr-3 font-medium">{NICHE_LABEL[c.niche]}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{fmt(c.cacUah)}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{fmt(c.ltvUah)}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">
                        <Badge variant={c.ltvCacRatio >= 3 ? "default" : "destructive"} className="text-[10px]">
                          {c.ltvCacRatio.toFixed(1)}×
                        </Badge>
                      </td>
                      <td className="py-1.5 text-right text-muted-foreground">{c.paybackMonths} міс.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-muted-foreground">💡 Здорове співвідношення LTV/CAC ≥ 3:1, payback ≤ 12 міс. (для SaaS), ≤ 3 міс. (для e-commerce).</p>
          </Card>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Канал чи ніша..."
            resultCount={filtered.length}
            resultLabel="бенчмарків"
            activeFilterCount={activeCount}
            onResetFilters={() => { setNiche("all"); setChannel("all"); }}
          >
            <div className="grid gap-2.5">
              {filtered.map((b, i) => (
                <Card key={`${b.channel}-${b.niche}-${i}`} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="space-y-0.5">
                      <Badge variant="default" className="text-[10px]">{CHANNEL_LABEL[b.channel]}</Badge>
                      <div className="text-sm font-bold text-foreground">{NICHE_LABEL[b.niche]}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <Metric label="CPC" value={fmt(b.cpcUah)} />
                    <Metric label="CPM" value={fmt(b.cpmUah)} />
                    <Metric label="CTR" value={pct(b.ctrPct)} />
                    <Metric label="CPL" value={fmt(b.cplUah)} highlight />
                    <Metric label="CVR" value={pct(b.cvrPct)} />
                  </div>
                  {b.note && <div className="text-[11px] text-muted-foreground border-l-2 border-primary/30 pl-2">{b.note}</div>}
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>

          {/* Конверсії */}
          <Card className="p-4 space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Конверсії воронки (середні)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left text-[10px] uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-1.5 pr-3">Етап</th>
                    <th className="py-1.5 pr-3">E-commerce</th>
                    <th className="py-1.5">B2B / SaaS</th>
                  </tr>
                </thead>
                <tbody>
                  {SITE_CONVERSIONS.map((s, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0">
                      <td className="py-1.5 pr-3 font-medium">{s.stage}</td>
                      <td className="py-1.5 pr-3 font-mono">{s.ecommerce}</td>
                      <td className="py-1.5 font-mono">{s.b2b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="marketingovi-benchmarky" />
    </PortalLayout>
  );
};

const Metric = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`rounded p-2 ${highlight ? "bg-primary/10 border border-primary/30" : "bg-muted/40"}`}>
    <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
    <div className={`text-sm font-semibold ${highlight ? "text-primary" : "text-foreground"} font-mono`}>{value}</div>
  </div>
);

export default MarketingBenchmarksPage;
