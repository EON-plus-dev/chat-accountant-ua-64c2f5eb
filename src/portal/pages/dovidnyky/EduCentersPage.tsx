import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup, FilterCheckboxGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Sparkles, Phone, Globe, MapPin, Award, Briefcase } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  EDU_CENTERS,
  EDU_CENTER_KIND_LABEL,
  EDU_FORMAT_LABEL,
  EDU_CENTERS_AS_OF,
  type EduCenterKind,
} from "@/portal/data/educationCenters";

const KINDS: EduCenterKind[] = [
  'business_school',
  'it_school',
  'professional',
  'language',
  'university_executive',
  'online_platform',
];

const KIND_BADGE: Record<EduCenterKind, string> = {
  business_school: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  it_school: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  professional: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  language: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  university_executive: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30',
  online_platform: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30',
};

const formatPrice = (from?: number, to?: number) => {
  if (from === undefined && to === undefined) return null;
  const fmt = (n: number) => n === 0 ? 'Free' : `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  if (from === 0 && to) return `Free – ${fmt(to)} ₴`;
  if (from && to && from !== to) return `${fmt(from)} – ${fmt(to)} ₴`;
  if (from) return `від ${fmt(from)} ₴`;
  return null;
};

const EduCentersPage = () => {
  const [kindFilter, setKindFilter] = useState<EduCenterKind | "all">("all");
  const [formatFilters, setFormatFilters] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const kindCounts = useMemo(() => {
    const c: Record<string, number> = { all: EDU_CENTERS.length };
    EDU_CENTERS.forEach((o) => (c[o.kind] = (c[o.kind] || 0) + 1));
    return c;
  }, []);

  const formatCounts = useMemo(() => {
    const c: Record<string, number> = {};
    EDU_CENTERS.forEach((o) => o.formats.forEach((f) => (c[f] = (c[f] || 0) + 1)));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return EDU_CENTERS.filter((o) => {
      if (kindFilter !== "all" && o.kind !== kindFilter) return false;
      if (formatFilters.length > 0 && !formatFilters.some((f) => o.formats.includes(f as any))) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.programs.some((p) => p.toLowerCase().includes(q)) ||
        (o.notes ?? '').toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.name.localeCompare(b.name, 'uk');
    });
  }, [kindFilter, formatFilters, search]);

  const activeFilters = (kindFilter !== "all" ? 1 : 0) + (formatFilters.length > 0 ? 1 : 0);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Тип навчання">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: kindCounts.all },
            ...KINDS.map((k) => ({
              value: k,
              label: EDU_CENTER_KIND_LABEL[k],
              count: kindCounts[k] || 0,
            })),
          ]}
          value={kindFilter}
          onChange={(v) => setKindFilter(v as EduCenterKind | "all")}
        />
      </FilterSection>
      <FilterSection title="Формат">
        <FilterCheckboxGroup
          options={[
            { value: 'offline', label: EDU_FORMAT_LABEL.offline, count: formatCounts.offline || 0 },
            { value: 'online', label: EDU_FORMAT_LABEL.online, count: formatCounts.online || 0 },
            { value: 'hybrid', label: EDU_FORMAT_LABEL.hybrid, count: formatCounts.hybrid || 0 },
          ]}
          values={formatFilters}
          onChange={setFormatFilters}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: `Бізнес-школи і освітні центри України 2026 | FINTODO`,
        description: `Каталог бізнес-шкіл, IT-шкіл, профкурсів і онлайн-платформ України: kmbs, LvBS, MIM, KSE, Projector, Mate, GoIT, Prometheus, Laba. Програми, ціни, формат, корпоративне навчання. Snapshot ${EDU_CENTERS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/navchalni-tsentry`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Навчальні центри", url: `${SITE_URL}/dovidnyky/navchalni-tsentry` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Навчальні центри" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Бізнес-школи і освітні центри
            </h1>
            <p className="text-muted-foreground">
              {EDU_CENTERS.length} провідних освітніх організацій України: бізнес-школи (MBA),
              IT-школи, профкурси (бух, фін, право), мовні центри, executive education при ВНЗ
              та онлайн-платформи. Snapshot {EDU_CENTERS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: kmbs, MBA, Python, англійська..."
            resultCount={filtered.length}
            resultLabel="центрів"
            activeFilterCount={activeFilters}
            onResetFilters={() => {
              setKindFilter("all");
              setFormatFilters([]);
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((o) => {
                const price = formatPrice(o.priceFrom, o.priceTo);
                return (
                  <Card key={o.slug} className="p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <Badge className={`text-[10px] ${KIND_BADGE[o.kind]}`}>
                            {EDU_CENTER_KIND_LABEL[o.kind]}
                          </Badge>
                          {o.popular && (
                            <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                              <Sparkles className="h-3 w-3" /> Топ
                            </Badge>
                          )}
                          {o.b2bCorporate && (
                            <Badge variant="outline" className="text-[10px] gap-0.5">
                              <Briefcase className="h-3 w-3" /> B2B
                            </Badge>
                          )}
                          {o.accreditation && (
                            <Badge variant="outline" className="text-[10px] gap-0.5">
                              <Award className="h-3 w-3" /> {o.accreditation}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-foreground leading-snug">
                          {o.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" /> {o.city}
                          {o.founded && <> · засн. {o.founded}</>}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/80 mb-2 line-clamp-2">{o.tagline}</p>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5">
                        <div className="text-[10px] text-muted-foreground">Тривалість</div>
                        <div className="text-[11px] font-semibold text-foreground">{o.durationRange}</div>
                      </div>
                      <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5">
                        <div className="text-[10px] text-muted-foreground">Вартість</div>
                        <div className="text-[11px] font-semibold text-foreground">
                          {price ?? '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {o.formats.map((f) => (
                        <Badge key={f} variant="secondary" className="text-[10px]">
                          {EDU_FORMAT_LABEL[f]}
                        </Badge>
                      ))}
                      {o.languages.map((l) => (
                        <Badge key={l} variant="outline" className="text-[10px] uppercase">{l}</Badge>
                      ))}
                      {o.certificate && (
                        <Badge variant="outline" className="text-[10px]">Сертифікат</Badge>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="text-[10px] text-muted-foreground mb-0.5">Ключові програми:</div>
                      <div className="flex flex-wrap gap-1">
                        {o.programs.slice(0, 5).map((p) => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/5 border border-primary/15 text-foreground">
                            {p}
                          </span>
                        ))}
                        {o.programs.length > 5 && (
                          <span className="text-[10px] text-muted-foreground">+{o.programs.length - 5}</span>
                        )}
                      </div>
                    </div>

                    {o.notes && (
                      <p className="text-[11px] text-muted-foreground italic mb-2">{o.notes}</p>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t border-border text-[11px] flex-wrap">
                      <a href={o.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <Globe className="h-3 w-3" /> Сайт
                      </a>
                      {o.phone && (
                        <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 text-foreground hover:text-primary">
                          <Phone className="h-3 w-3" /> {o.phone}
                        </a>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="navchalni-tsentry" />
    </PortalLayout>
  );
};

export default EduCentersPage;
