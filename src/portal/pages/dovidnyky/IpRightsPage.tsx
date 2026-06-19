import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, ShieldAlert, Info, Building2 } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  IP_RIGHTS,
  IP_KIND_LABEL,
  IP_RIGHTS_AS_OF,
  type IpRightKind,
} from "@/portal/data/ipRights";

const KINDS: IpRightKind[] = ['trademark', 'patent', 'copyright', 'license', 'royalty', 'software', 'protection'];

const KIND_BADGE_CLASS: Record<IpRightKind, string> = {
  trademark: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  patent: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  copyright: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  license: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  royalty: 'bg-pink-500/15 text-pink-700 dark:text-pink-400 border border-pink-500/30',
  software: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30',
  protection: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
};

const IpRightsPage = () => {
  const [kindFilter, setKindFilter] = useState<IpRightKind | "all">("all");
  const [search, setSearch] = useState("");

  const kindCounts = useMemo(() => {
    const c: Record<string, number> = { all: IP_RIGHTS.length };
    IP_RIGHTS.forEach((p) => (c[p.kind] = (c[p.kind] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return IP_RIGHTS.filter((p) => {
      if (kindFilter !== "all" && p.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.legalRef.toLowerCase().includes(q) ||
        (p.authority || '').toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [kindFilter, search]);

  const activeFilters = kindFilter !== "all" ? 1 : 0;

  const sidebar = (
    <>
      <FilterSection title="Тип IP">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: kindCounts.all },
            ...KINDS.map((k) => ({
              value: k,
              label: IP_KIND_LABEL[k],
              count: kindCounts[k] || 0,
            })),
          ]}
          value={kindFilter}
          onChange={(v) => setKindFilter(v as IpRightKind | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Інтелектуальна власність — ТМ, патенти, авторське право, роялті | FINTODO`,
        description: `Довідник IP: торгові марки (8 МЗП), патенти (20 р.), авторське право, ліцензії, роялті без ПДВ, Дія City R&D, захист в суді і АМКУ, митний реєстр.`,
        canonical: `${SITE_URL}/dovidnyky/ip-prava`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Інтелектуальна власність", url: `${SITE_URL}/dovidnyky/ip-prava` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Інтелектуальна власність" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              Інтелектуальна власність — ТМ, патенти, роялті, захист
            </h1>
            <p className="text-muted-foreground">
              Повний довідник IP в Україні: реєстрація торгових марок і патентів, авторське право,
              ліцензійні договори, роялті без ПДВ, Дія City R&D, судовий захист і митний реєстр.
              Snapshot {IP_RIGHTS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: ТМ, патент, ліцензія, роялті, Дія City..."
            resultCount={filtered.length}
            resultLabel="записів"
            activeFilterCount={activeFilters}
            onResetFilters={() => setKindFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((p) => (
                <Card key={p.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-[10px] ${KIND_BADGE_CLASS[p.kind]}`}>
                          {IP_KIND_LABEL[p.kind]}
                        </Badge>
                        {p.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{p.name}</h3>
                      <p className="text-[12px] text-muted-foreground mt-1">{p.summary}</p>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1">
                    {p.authority && (
                      <div className="flex items-start gap-1.5">
                        <Building2 className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                        <span><span className="text-muted-foreground">Орган: </span><span className="text-foreground">{p.authority}</span></span>
                      </div>
                    )}
                    {p.term && <div><span className="text-muted-foreground">Строк: </span><span className="text-foreground font-medium">{p.term}</span></div>}
                    {p.cost && <div><span className="text-muted-foreground">Вартість: </span><span className="text-foreground">{p.cost}</span></div>}
                    <div className="text-muted-foreground italic">{p.legalRef}</div>
                  </div>

                  {p.details && p.details.length > 0 && (
                    <ul className="text-[11px] space-y-0.5 ml-3 list-disc text-muted-foreground mb-2">
                      {p.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}

                  {p.taxation && (
                    <div className="text-[11px] text-foreground bg-emerald-500/5 border border-emerald-500/20 rounded px-2 py-1 mb-1">
                      <span className="text-muted-foreground">Податки: </span>{p.taxation}
                    </div>
                  )}

                  {p.practicalNote && (
                    <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground italic">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{p.practicalNote}</span>
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
                Ключові цифри IP 2026
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>Реєстрація ТМ — 8 МЗП за 1 клас МКТП (≈ 64 000 ₴), +1 МЗП за кожен наступний</li>
                <li>Свідоцтво ТМ — 10 років, продовжується необмежено по 10 років</li>
                <li>Патент на винахід — 20 років, на корисну модель — 10 років, промзразок — до 25 років</li>
                <li>Авторське право — усе життя автора + 70 років після смерті</li>
                <li>Роялті — без ПДВ (пп. 196.1.6 ПКУ), але box-software і SaaS — з ПДВ 20%</li>
                <li>Виплата роялті нерезиденту — податок на репатріацію 15% (з урах. КУПО)</li>
                <li>Дія City — 9% з виведеного капіталу, повне списання R&D, ESOP з PIT 5%</li>
                <li>Компенсація за порушення авторського права — 10–50 000 МЗП без доказування збитків</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="ip-prava" />
    </PortalLayout>
  );
};

export default IpRightsPage;
