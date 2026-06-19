import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup, FilterCheckboxGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Sparkles, Globe, Calendar, Coins, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  EDU_GRANTS,
  GRANT_REGION_LABEL,
  GRANT_LEVEL_LABEL,
  GRANTS_AS_OF,
  type GrantRegion,
  type GrantLevel,
} from "@/portal/data/eduGrants";

const REGIONS: GrantRegion[] = ['eu', 'uk', 'usa', 'asia', 'global', 'ua'];
const LEVELS: GrantLevel[] = ['bachelor', 'master', 'phd', 'mba', 'exchange', 'research'];

const REGION_BADGE: Record<GrantRegion, string> = {
  eu: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  uk: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30',
  usa: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  asia: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  global: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30',
  ua: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
};

const EduGrantsPage = () => {
  const [regionFilter, setRegionFilter] = useState<GrantRegion | "all">("all");
  const [levelFilters, setLevelFilters] = useState<string[]>([]);
  const [onlyUaEligible, setOnlyUaEligible] = useState(false);
  const [search, setSearch] = useState("");

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = { all: EDU_GRANTS.length };
    EDU_GRANTS.forEach((o) => (c[o.region] = (c[o.region] || 0) + 1));
    return c;
  }, []);

  const levelCounts = useMemo(() => {
    const c: Record<string, number> = {};
    EDU_GRANTS.forEach((o) => o.levels.forEach((l) => (c[l] = (c[l] || 0) + 1)));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return EDU_GRANTS.filter((o) => {
      if (regionFilter !== "all" && o.region !== regionFilter) return false;
      if (levelFilters.length > 0 && !levelFilters.some((l) => o.levels.includes(l as GrantLevel))) return false;
      if (onlyUaEligible && !o.ukraineEligible) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        (o.shortName ?? '').toLowerCase().includes(q) ||
        o.funder.toLowerCase().includes(q) ||
        o.countries.toLowerCase().includes(q) ||
        o.fields.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      if (a.ukraineEligible !== b.ukraineEligible) return a.ukraineEligible ? -1 : 1;
      return a.name.localeCompare(b.name, 'uk');
    });
  }, [regionFilter, levelFilters, onlyUaEligible, search]);

  const activeFilters =
    (regionFilter !== "all" ? 1 : 0) +
    (levelFilters.length > 0 ? 1 : 0) +
    (onlyUaEligible ? 1 : 0);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Регіон">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: regionCounts.all },
            ...REGIONS.map((k) => ({
              value: k,
              label: GRANT_REGION_LABEL[k],
              count: regionCounts[k] || 0,
            })),
          ]}
          value={regionFilter}
          onChange={(v) => setRegionFilter(v as GrantRegion | "all")}
        />
      </FilterSection>
      <FilterSection title="Рівень">
        <FilterCheckboxGroup
          options={LEVELS.map((l) => ({ value: l, label: GRANT_LEVEL_LABEL[l], count: levelCounts[l] || 0 }))}
          values={levelFilters}
          onChange={setLevelFilters}
        />
      </FilterSection>
      <FilterSection title="Доступність">
        <button
          onClick={() => setOnlyUaEligible((v) => !v)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
            onlyUaEligible ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
              onlyUaEligible ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
            }`}>
              {onlyUaEligible && '✓'}
            </span>
            Лише доступні для українців
          </span>
        </button>
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: `Гранти на навчання за кордоном 2026 — Erasmus, Chevening, Fulbright, DAAD | FINTODO`,
        description: `Каталог грантів і стипендій на навчання: Erasmus Mundus, Chevening, Fulbright, DAAD, Eiffel, Visby, Gates Cambridge, Rhodes, MEXT, GKS. Хто фінансує, що покриває, коли подавати. Snapshot ${GRANTS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/granty-na-navchannya`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Гранти на навчання", url: `${SITE_URL}/dovidnyky/granty-na-navchannya` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Гранти на навчання" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Гранти на навчання за кордоном і в Україні
            </h1>
            <p className="text-muted-foreground">
              {EDU_GRANTS.length} програм для українців: Erasmus Mundus, Chevening, Fulbright,
              DAAD, Eiffel, Visby, Gates Cambridge, Rhodes, MEXT, GKS, Завтра.UA. Що покривають,
              хто фінансує, коли подавати. Snapshot {GRANTS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: Erasmus, Chevening, Fulbright..."
            resultCount={filtered.length}
            resultLabel="програм"
            activeFilterCount={activeFilters}
            onResetFilters={() => {
              setRegionFilter("all");
              setLevelFilters([]);
              setOnlyUaEligible(false);
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((o) => (
                <Card key={o.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <Badge className={`text-[10px] ${REGION_BADGE[o.region]}`}>
                          {GRANT_REGION_LABEL[o.region]}
                        </Badge>
                        {o.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                        {o.ukraineEligible ? (
                          <Badge variant="outline" className="text-[10px] gap-0.5 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" /> UA доступний
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] gap-0.5 text-muted-foreground">
                            <XCircle className="h-3 w-3" /> UA недоступний
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-foreground leading-snug flex items-center gap-2">
                        <span className="text-lg leading-none">{o.emoji}</span>
                        {o.shortName ?? o.name}
                      </h3>
                      {o.shortName && (
                        <p className="text-[11px] text-muted-foreground">{o.name}</p>
                      )}
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Фінансує: <span className="text-foreground">{o.funder}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap mb-2">
                    {o.levels.map((l) => (
                      <Badge key={l} variant="secondary" className="text-[10px]">{GRANT_LEVEL_LABEL[l]}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> Країни</div>
                      <div className="text-[11px] font-semibold text-foreground line-clamp-2">{o.countries}</div>
                    </div>
                    <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> Тривалість</div>
                      <div className="text-[11px] font-semibold text-foreground">{o.duration}</div>
                    </div>
                  </div>

                  <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 mb-2">
                    <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                      <Coins className="h-3 w-3" /> Покриття:
                    </div>
                    <div className="text-[11px] text-foreground">{o.benefits}</div>
                    {o.amountUsd && (
                      <div className="text-[11px] mt-1">
                        <span className="text-muted-foreground">Сума: </span>
                        <span className="font-semibold text-primary">{o.amountUsd}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] mb-1">
                    <span className="text-muted-foreground">Галузі: </span>
                    <span className="text-foreground">{o.fields}</span>
                  </div>
                  <div className="text-[11px] mb-1 flex items-start gap-1">
                    <Calendar className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Подача:</span>
                    <span className="text-foreground font-medium">{o.applicationPeriod}</span>
                  </div>
                  {o.ukraineQuota && (
                    <div className="text-[11px] mb-1 text-emerald-700 dark:text-emerald-400">
                      🇺🇦 {o.ukraineQuota}
                    </div>
                  )}
                  {(o.ageLimit || o.englishLevel) && (
                    <div className="text-[11px] mb-1 text-muted-foreground flex flex-wrap gap-x-3">
                      {o.ageLimit && <span>Вік: <span className="text-foreground">{o.ageLimit}</span></span>}
                      {o.englishLevel && <span>Мова: <span className="text-foreground">{o.englishLevel}</span></span>}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border text-[11px]">
                    <a href={o.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Globe className="h-3 w-3" /> Офіційний сайт
                    </a>
                  </div>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="granty-na-navchannya" />
    </PortalLayout>
  );
};

export default EduGrantsPage;
