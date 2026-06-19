import { useMemo, useCallback } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link, useSearchParams } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import {
  DirectorySidebarLayout,
  FilterSection,
  FilterRadioGroup,
  FilterCheckboxGroup,
} from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { ACCOUNTANTS } from "@/portal/data/accountants";
import { ArrowRight, Star, Globe, Award, Zap, ShieldCheck } from "lucide-react";
import { AccountantsCertifiedCTA } from "@/portal/components/AccountantsCertifiedCTA";

type SortKey = "rating" | "experience" | "priceAsc" | "newest";

const PRICE_MIN = 0;
const PRICE_MAX = 10000;
const PRICE_STEP = 500;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "rating", label: "За рейтингом" },
  { value: "experience", label: "За досвідом" },
  { value: "priceAsc", label: "Дешевші спершу" },
  { value: "newest", label: "Нові у каталозі" },
];

const REGIONS = ["Київ", "Харків", "Одеса", "Дніпро", "Львів"] as const;
const SPECS = [
  "ФОП 1-3 групи",
  "ТОВ",
  "IT-компанії",
  "ЗЕД",
  "Загальна система",
  "Єдиний податок",
] as const;

// parse "до 2 годин" / "до 30 хвилин" → minutes
const parseResponseMinutes = (s: string): number => {
  const m = s.match(/(\d+)\s*(хвил|годин)/i);
  if (!m) return 9999;
  const n = parseInt(m[1], 10);
  return /годин/i.test(m[2]) ? n * 60 : n;
};

interface Filters {
  q: string;
  region: string;             // 'all' | city | 'online'
  specs: string[];
  taxSystems: string[];
  industries: string[];
  languages: string[];
  priceMin: number;
  priceMax: number;
  experience: string;         // 'any' | '3' | '5' | '10'
  rating: string;             // 'any' | '4.0' | '4.5' | '4.8'
  certified: boolean;
  verified: boolean;
  fastResponse: boolean;
  sort: SortKey;
}

const DEFAULTS: Filters = {
  q: "",
  region: "all",
  specs: [],
  taxSystems: [],
  industries: [],
  languages: [],
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  experience: "any",
  rating: "any",
  certified: false,
  verified: false,
  fastResponse: false,
  sort: "rating",
};

const AccountantsPage = () => {
  const [params, setParams] = useSearchParams();

  const filters: Filters = useMemo(() => ({
    q: params.get("q") ?? "",
    region: params.get("region") ?? "all",
    specs: params.get("spec")?.split(",").filter(Boolean) ?? [],
    taxSystems: params.get("tax")?.split(",").filter(Boolean) ?? [],
    industries: params.get("ind")?.split(",").filter(Boolean) ?? [],
    languages: params.get("lang")?.split(",").filter(Boolean) ?? [],
    priceMin: Number(params.get("pmin") ?? PRICE_MIN),
    priceMax: Number(params.get("pmax") ?? PRICE_MAX),
    experience: params.get("exp") ?? "any",
    rating: params.get("rating") ?? "any",
    certified: params.get("certified") === "1",
    verified: params.get("verified") === "1",
    fastResponse: params.get("fast") === "1",
    sort: (params.get("sort") as SortKey) ?? "rating",
  }), [params]);

  const update = useCallback((patch: Partial<Filters>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      const merged = { ...filters, ...patch };
      const setOrDel = (k: string, v: string | undefined) => {
        if (!v || v === "all" || v === "any" || v === "") next.delete(k);
        else next.set(k, v);
      };
      setOrDel("q", merged.q);
      setOrDel("region", merged.region);
      setOrDel("exp", merged.experience);
      setOrDel("rating", merged.rating);
      setOrDel("sort", merged.sort === "rating" ? undefined : merged.sort);
      const arr = (k: string, v: string[]) => v.length ? next.set(k, v.join(",")) : next.delete(k);
      arr("spec", merged.specs);
      arr("tax", merged.taxSystems);
      arr("ind", merged.industries);
      arr("lang", merged.languages);
      merged.priceMin > PRICE_MIN ? next.set("pmin", String(merged.priceMin)) : next.delete("pmin");
      merged.priceMax < PRICE_MAX ? next.set("pmax", String(merged.priceMax)) : next.delete("pmax");
      merged.certified ? next.set("certified", "1") : next.delete("certified");
      merged.verified ? next.set("verified", "1") : next.delete("verified");
      merged.fastResponse ? next.set("fast", "1") : next.delete("fast");
      return next;
    }, { replace: true });
  }, [filters, setParams]);

  // Build a predicate for a partial filter set — used both for results and for option counts
  const matches = useCallback((acc: typeof ACCOUNTANTS[number], f: Filters) => {
    if (f.q) {
      const q = f.q.toLowerCase().trim();
      const hay = [acc.name, acc.city, acc.region, ...acc.specializations, ...acc.industries, acc.description].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.region !== "all") {
      if (f.region === "online") {
        if (!acc.isOnline) return false;
      } else if (acc.city !== f.region) return false;
    }
    if (f.specs.length && !f.specs.some((s) => acc.specializations.some((as) => as.toLowerCase().includes(s.toLowerCase())))) return false;
    if (f.taxSystems.length && !f.taxSystems.every((t) => acc.taxSystems.includes(t))) return false;
    if (f.industries.length && !f.industries.some((i) => acc.industries.includes(i))) return false;
    if (f.languages.length && !f.languages.some((l) => acc.languages.includes(l))) return false;
    if (acc.priceFrom < f.priceMin || acc.priceFrom > f.priceMax) return false;
    if (f.experience !== "any" && acc.experience < Number(f.experience)) return false;
    if (f.rating !== "any" && acc.rating < Number(f.rating)) return false;
    if (f.certified && !acc.isFintodoCertified) return false;
    if (f.verified && !acc.isVerified) return false;
    if (f.fastResponse && parseResponseMinutes(acc.responseTime) > 240) return false;
    return true;
  }, []);

  // Count helper — counts matches with one filter dimension overridden
  const countWith = useCallback((override: Partial<Filters>) => {
    const f = { ...filters, ...override };
    return ACCOUNTANTS.filter((a) => matches(a, f)).length;
  }, [filters, matches]);

  const filtered = useMemo(() => {
    const res = ACCOUNTANTS.filter((a) => matches(a, filters));
    res.sort((a, b) => {
      switch (filters.sort) {
        case "experience": return b.experience - a.experience;
        case "priceAsc": return a.priceFrom - b.priceFrom;
        case "newest": return b.joinedDate.localeCompare(a.joinedDate);
        case "rating":
        default: return b.rating - a.rating || b.reviewCount - a.reviewCount;
      }
    });
    return res;
  }, [filters, matches]);

  // Unique value sets
  const allTaxSystems = useMemo(() => Array.from(new Set(ACCOUNTANTS.flatMap((a) => a.taxSystems))).sort(), []);
  const allIndustries = useMemo(() => Array.from(new Set(ACCOUNTANTS.flatMap((a) => a.industries))).sort(), []);
  const allLanguages = useMemo(() => Array.from(new Set(ACCOUNTANTS.flatMap((a) => a.languages))).sort(), []);

  const toggleArr = (key: keyof Filters, value: string) => {
    const cur = filters[key] as string[];
    update({ [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] } as any);
  };

  const activeCount =
    (filters.q ? 1 : 0) +
    (filters.region !== "all" ? 1 : 0) +
    filters.specs.length +
    filters.taxSystems.length +
    filters.industries.length +
    filters.languages.length +
    (filters.priceMin > PRICE_MIN || filters.priceMax < PRICE_MAX ? 1 : 0) +
    (filters.experience !== "any" ? 1 : 0) +
    (filters.rating !== "any" ? 1 : 0) +
    (filters.certified ? 1 : 0) +
    (filters.verified ? 1 : 0) +
    (filters.fastResponse ? 1 : 0);

  const reset = () => setParams(new URLSearchParams(), { replace: true });

  // Sidebar
  const sidebar = (
    <div className="space-y-5">
      {/* Quick toggles */}
      <FilterSection title="Швидкі фільтри">
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-xs">
            <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-primary" />FINTODO Certified</span>
            <Switch checked={filters.certified} onCheckedChange={(v) => update({ certified: v })} />
          </label>
          <label className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-xs">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />Перевірений</span>
            <Switch checked={filters.verified} onCheckedChange={(v) => update({ verified: v })} />
          </label>
          <label className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-xs">
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-500" />Відповідь ≤ 4 год</span>
            <Switch checked={filters.fastResponse} onCheckedChange={(v) => update({ fastResponse: v })} />
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Регіон">
        <FilterRadioGroup
          value={filters.region}
          onChange={(v) => update({ region: v })}
          options={[
            { value: "all", label: "Усі регіони", count: countWith({ region: "all" }) },
            ...REGIONS.map((r) => ({ value: r, label: r, count: countWith({ region: r }) })),
            { value: "online", label: "Онлайн (дистанційно)", count: countWith({ region: "online" }) },
          ]}
        />
      </FilterSection>

      <FilterSection title="Спеціалізація">
        <FilterCheckboxGroup
          values={filters.specs}
          onChange={(v) => update({ specs: v })}
          options={SPECS.map((s) => ({ value: s, label: s, count: countWith({ specs: [s] }) }))}
        />
      </FilterSection>

      <FilterSection title="Система оподаткування">
        <FilterCheckboxGroup
          values={filters.taxSystems}
          onChange={(v) => update({ taxSystems: v })}
          options={allTaxSystems.map((t) => ({ value: t, label: t, count: countWith({ taxSystems: [t] }) }))}
        />
      </FilterSection>

      <FilterSection title="Галузь">
        <FilterCheckboxGroup
          values={filters.industries}
          onChange={(v) => update({ industries: v })}
          options={allIndustries.map((i) => ({ value: i, label: i, count: countWith({ industries: [i] }) }))}
        />
      </FilterSection>

      <FilterSection title="Ціна, ₴/міс">
        <div className="px-1 pt-2 pb-1 space-y-3">
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={[filters.priceMin, filters.priceMax]}
            onValueChange={([min, max]) => update({ priceMin: min, priceMax: max })}
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>{filters.priceMin.toLocaleString("uk-UA")} ₴</span>
            <span>{filters.priceMax >= PRICE_MAX ? `${PRICE_MAX.toLocaleString("uk-UA")}+` : filters.priceMax.toLocaleString("uk-UA")} ₴</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { label: "до 2k", min: 0, max: 2000 },
              { label: "2–5k", min: 2000, max: 5000 },
              { label: "5k+", min: 5000, max: PRICE_MAX },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => update({ priceMin: p.min, priceMax: p.max })}
                className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors ${
                  filters.priceMin === p.min && filters.priceMax === p.max
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >{p.label}</button>
            ))}
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Досвід">
        <FilterRadioGroup
          value={filters.experience}
          onChange={(v) => update({ experience: v })}
          options={[
            { value: "any", label: "Будь-який" },
            { value: "3", label: "3+ роки", count: countWith({ experience: "3" }) },
            { value: "5", label: "5+ років", count: countWith({ experience: "5" }) },
            { value: "10", label: "10+ років", count: countWith({ experience: "10" }) },
          ]}
        />
      </FilterSection>

      <FilterSection title="Рейтинг">
        <FilterRadioGroup
          value={filters.rating}
          onChange={(v) => update({ rating: v })}
          options={[
            { value: "any", label: "Будь-який" },
            { value: "4.0", label: "4.0+", count: countWith({ rating: "4.0" }) },
            { value: "4.5", label: "4.5+", count: countWith({ rating: "4.5" }) },
            { value: "4.8", label: "4.8+", count: countWith({ rating: "4.8" }) },
          ]}
        />
      </FilterSection>

      <FilterSection title="Мови">
        <FilterCheckboxGroup
          values={filters.languages}
          onChange={(v) => update({ languages: v })}
          options={allLanguages.map((l) => ({ value: l, label: l, count: countWith({ languages: [l] }) }))}
        />
      </FilterSection>
    </div>
  );

  // Sort pills toolbar
  const toolbar = (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground shrink-0 mr-1">Сортувати:</span>
      {SORT_OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => update({ sort: o.value })}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filters.sort === o.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >{o.label}</button>
      ))}
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Бухгалтери на аутсорсі — знайти перевіреного бухгалтера | FINTODO",
        description: "Каталог сертифікованих бухгалтерів-аутсорсерів. Пошук за регіоном, спеціалізацією, ціною та досвідом.",
        canonical: `${SITE_URL}/dovidnyky/accountants`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Бухгалтери", url: `${SITE_URL}/dovidnyky/accountants` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Бухгалтери" },
          ]}
        />

        <div className="space-y-6 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-foreground">
              Каталог бухгалтерів-аутсорсерів
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Перевірені спеціалісти для ФОП, ТОВ та IT-компаній. FINTODO Certified — гарантія якості.
            </p>
          </header>

          <AccountantsCertifiedCTA variant="strip" />

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={filters.q}
            onSearchChange={(v) => update({ q: v })}
            searchPlaceholder="Імʼя, місто, спеціалізація…"
            resultCount={filtered.length}
            resultLabel="бухгалтерів"
            activeFilterCount={activeCount}
            onResetFilters={reset}
            toolbar={toolbar}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((acc) => {
                const fast = parseResponseMinutes(acc.responseTime) <= 240;
                return (
                <Link key={acc.id} to={`/dovidnyky/accountants/${acc.slug}`}>
                  <Card className="p-4 h-full hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: acc.initialsColor }}
                      >
                        {acc.initials}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground text-sm">{acc.name}</p>
                          {acc.isFintodoCertified && (
                            <Badge variant="success" className="text-[10px] gap-1">
                              <Award className="h-3 w-3" /> Certified
                            </Badge>
                          )}
                          {fast && (
                            <Badge variant="outline" className="text-[10px] gap-1 text-amber-600 border-amber-200">
                              <Zap className="h-3 w-3" />{acc.responseTime}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{acc.city}</span>
                          {acc.isOnline && (
                            <span className="flex items-center gap-0.5 text-emerald-600">
                              <Globe className="h-3 w-3" /> Онлайн
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {acc.specializations.slice(0, 3).map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Досвід: {acc.experience} р.</span>
                          <span>Клієнтів: {acc.clientCount}</span>
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {acc.rating}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{acc.priceDisplay}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </Card>
                </Link>
                );
              })}

              {filtered.length === 0 && (
                <div className="col-span-full py-6 text-center space-y-3">
                  <p className="text-muted-foreground">За вашими фільтрами нікого не знайдено</p>
                  <Button variant="outline" size="sm" onClick={reset}>Скинути всі фільтри</Button>
                </div>
              )}
            </div>

            <AccountantsCertifiedCTA variant="card" />
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="accountants" />
    </PortalLayout>
  );
};

export default AccountantsPage;
