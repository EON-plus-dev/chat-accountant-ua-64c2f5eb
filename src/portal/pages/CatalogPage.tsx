import { useState, useMemo, useCallback } from "react";
import { GovBranchList } from "@/portal/components/gov/GovBranchList";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAudience } from "@/contexts/AudienceContext";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { CatalogSidebar, type SortOption, type RatingFilter, type AudienceFilter, type FeatureGroup, type CityOption } from "@/portal/components/catalog/CatalogSidebar";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, ArrowRight, SlidersHorizontal, List, LayoutGrid, CheckCircle2, Star, GitCompareArrows } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CATALOG_CATEGORIES } from "@/portal/data/catalog";
import { INSTITUTION_PROFILES, type FullInstitutionProfile } from "@/portal/data/institutionProfiles";
import { CATEGORY_FILTERS, getAllFilterDefs } from "@/portal/data/catalogFilters";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { analytics } from "@/portal/services/analytics";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { useGovCities } from "@/portal/hooks/useGovBranches";
import { useIsMobile } from "@/hooks/use-mobile";

type LayoutMode = "list" | "grid";

const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-foreground rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
};

/** Get profiles belonging to a category */
const getCategoryProfiles = (categorySlug: string, typeSlugs: string[], aliases: string[] = []) => {
  const aliasSet = new Set(aliases);
  return INSTITUTION_PROFILES.filter((p) =>
    p.types.some((t) => t === categorySlug || typeSlugs.includes(t) || aliasSet.has(t))
  );
};

const CatalogPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { audience: globalAudience } = useAudience();
  const audienceDataKey = globalAudience === "individual" ? "personal" : "business";
  const isMobile = useIsMobile();

  // ── URL state ──
  const selectedCat = searchParams.get("cat") || "";
  const sort: SortOption = (searchParams.get("sort") as SortOption) || "default";
  const ratingFilter: RatingFilter = (searchParams.get("rating") as RatingFilter) || "all";
  const layout: LayoutMode = (searchParams.get("layout") as LayoutMode) || "list";
  const rawSearch = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(rawSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 200);

  // ── Compare selection ──
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const toggleCompare = useCallback((slug: string) => {
    setCompareSelection((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 2) return prev;
      return [...prev, slug];
    });
  }, []);
  const cityFilter = searchParams.get("city") || "";
  const audienceFilter: AudienceFilter = (searchParams.get("aud") as AudienceFilter) || "";

  // ── Gov-specific state ──
  const [govAgency, setGovAgency] = useState('');
  const [govCity, setGovCity] = useState('');
  const { data: govCities = [] } = useGovCities();
  const isGov = selectedCat === 'gov';
  const govSearch = isGov ? debouncedSearch : '';
  const resetGovFilters = () => {
    setGovAgency('');
    setGovCity('');
    setSearchInput('');
    updateParams({ q: null });
  };
  const activeFeatures = useMemo(() => {
    const raw = searchParams.get("features");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setSelectedCat = (v: string) => {
    // Reset category-specific filters when switching category
    updateParams({ cat: v || null, city: null, features: null });
  };
  const setSort = (v: SortOption) => updateParams({ sort: v === "default" ? null : v });
  const setRatingFilter = (v: RatingFilter) => updateParams({ rating: v === "all" ? null : v });
  const setLayout = (v: LayoutMode) => updateParams({ layout: v === "list" ? null : v });
  const setCityFilter = (v: string) => updateParams({ city: v || null });
  const setAudienceFilter = (v: AudienceFilter) => updateParams({ aud: v || null });
  const handleSearchChange = (q: string) => {
    setSearchInput(q);
    updateParams({ q: q || null });
  };
  const toggleFeature = (key: string) => {
    const next = activeFeatures.includes(key)
      ? activeFeatures.filter((k) => k !== key)
      : [...activeFeatures, key];
    updateParams({ features: next.length > 0 ? next.join(",") : null });
  };
  const resetFilters = () => {
    setSearchParams(selectedCat ? new URLSearchParams({ cat: selectedCat }) : new URLSearchParams(), { replace: true });
    setSearchInput("");
  };

  // ── Resolved category ──
  const category = CATALOG_CATEGORIES.find((c) => c.slug === selectedCat);
  const filterConfig = selectedCat ? CATEGORY_FILTERS[selectedCat] : undefined;

  // ── Audience-filtered categories (for the grid fallback) ──
  const visibleCategories = useMemo(() => {
    return CATALOG_CATEGORIES
      .map((cat) => {
        const profiles = getCategoryProfiles(cat.slug, cat.types.map((t) => t.slug), cat.profileTypeAliases);
        return { ...cat, profiles, profileCount: profiles.length };
      })
      .filter((cat) => cat.audience === "both" || cat.audience === audienceDataKey)
      .sort((a, b) => a.priority - b.priority);
  }, [audienceDataKey]);

  // ── Category profiles ──
  const categoryProfiles = useMemo(() => {
    if (!category) return INSTITUTION_PROFILES; // all profiles when no category
    const typeSlugs = new Set(category.types.map((t) => t.slug));
    const aliases = new Set(category.profileTypeAliases || []);
    return INSTITUTION_PROFILES.filter((p) =>
      p.types.some((pt) => typeSlugs.has(pt) || aliases.has(pt) || pt === category.slug)
    );
  }, [category]);

  // ── Feature test map ──
  const featureDefs = useMemo(() => getAllFilterDefs(selectedCat), [selectedCat]);
  const featureTestMap = useMemo(() => {
    const map = new Map<string, (p: FullInstitutionProfile) => boolean>();
    featureDefs.forEach((f) => map.set(f.key, f.test));
    return map;
  }, [featureDefs]);

  // ── City list ──
  const availableCities: CityOption[] = useMemo(() => {
    if (!filterConfig?.showCity) return [];
    const cityMap = new Map<string, number>();
    categoryProfiles.forEach((p) => {
      p.branches.regions.forEach((r) => {
        if (r === "Вся Україна" || r === "Усі області України") return;
        cityMap.set(r, (cityMap.get(r) || 0) + 1);
      });
    });
    const allUkraineCount = categoryProfiles.filter((p) =>
      p.branches.regions.some((r) => r === "Вся Україна" || r === "Усі області України")
    ).length;
    return Array.from(cityMap.entries())
      .map(([name, count]) => ({ slug: name.toLowerCase().replace(/\s+/g, "-"), name, count: count + allUkraineCount }))
      .sort((a, b) => b.count - a.count);
  }, [filterConfig, categoryProfiles]);

  const cityNameFromSlug = (slug: string) => availableCities.find((c) => c.slug === slug)?.name || slug;

  const profileMatchesCity = (p: FullInstitutionProfile, slug: string): boolean => {
    if (!slug) return true;
    const cityName = cityNameFromSlug(slug);
    return p.branches.regions.some(
      (r) => r === "Вся Україна" || r === "Усі області України" || r.toLowerCase() === cityName.toLowerCase()
    );
  };

  const profileMatchesAudience = (p: FullInstitutionProfile, aud: AudienceFilter): boolean => {
    if (!aud) return true;
    return p.products.some((pr) => pr.audience === aud || pr.audience === "both");
  };

  // ── Contextual count ──
  const contextualCount = useCallback(
    (testFn: (p: FullInstitutionProfile) => boolean, selfKey: string) => {
      const otherFeatures = activeFeatures.filter((k) => k !== selfKey);
      return categoryProfiles.filter((p) => {
        if (ratingFilter === "8" && p.ratings.fintodo.overall < 8.0) return false;
        if (ratingFilter === "7" && p.ratings.fintodo.overall < 7.0) return false;
        if (cityFilter && !profileMatchesCity(p, cityFilter)) return false;
        if (audienceFilter && !profileMatchesAudience(p, audienceFilter)) return false;
        for (const key of otherFeatures) {
          const t = featureTestMap.get(key);
          if (t && !t(p)) return false;
        }
        return testFn(p);
      }).length;
    },
    [categoryProfiles, ratingFilter, cityFilter, audienceFilter, activeFeatures, featureTestMap]
  );

  // ── Feature groups for sidebar ──
  const featureGroups: FeatureGroup[] = useMemo(() => {
    if (!filterConfig) return [];
    return filterConfig.groups.map((group) => ({
      label: group.label,
      features: group.defs
        .filter((f) => !f.audienceScope || !audienceFilter || f.audienceScope === audienceFilter)
        .map((f) => ({
          key: f.key,
          label: f.label,
          count: contextualCount(f.test, f.key),
        })),
    })).filter((g) => g.features.length > 0);
  }, [filterConfig, contextualCount]);

  // ── Filtered profiles ──
  const filteredProfiles = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    let result = categoryProfiles.filter((p) => {
      if (ratingFilter === "8" && p.ratings.fintodo.overall < 8.0) return false;
      if (ratingFilter === "7" && p.ratings.fintodo.overall < 7.0) return false;
      if (cityFilter && !profileMatchesCity(p, cityFilter)) return false;
      if (audienceFilter && !profileMatchesAudience(p, audienceFilter)) return false;
      if (activeFeatures.length > 0) {
        for (const key of activeFeatures) {
          const test = featureTestMap.get(key);
          if (test && !test(p)) return false;
        }
      }
      if (q && !p.name.toLowerCase().includes(q) && !p.legalName.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sort === "az") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, "uk"));
    } else if (sort === "rating") {
      result = [...result].sort((a, b) => b.ratings.fintodo.overall - a.ratings.fintodo.overall);
    } else {
      result = [...result].sort((a, b) => {
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        return b.ratings.fintodo.overall - a.ratings.fintodo.overall;
      });
    }
    return result;
  }, [categoryProfiles, debouncedSearch, sort, ratingFilter, cityFilter, audienceFilter, activeFeatures, featureTestMap]);

  const hasActiveFilters = debouncedSearch.length > 0 || sort !== "default" || ratingFilter !== "all" || cityFilter !== "" || audienceFilter !== "" || activeFeatures.length > 0;
  const activeFilterCount = (ratingFilter !== "all" ? 1 : 0) + (cityFilter ? 1 : 0) + (audienceFilter ? 1 : 0) + activeFeatures.length;

  // ── Mode: show profiles or category grid ──
  const showProfiles = !!selectedCat;

  // ── Sidebar ──
  const categorySelectorContent = (
    <div className="mb-4">
      <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Категорія</p>
      <Select value={selectedCat || "all"} onValueChange={(v) => setSelectedCat(v === "all" ? "" : v)}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Оберіть категорію" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Усі категорії</SelectItem>
          {CATALOG_CATEGORIES
            .filter((c) => c.audience === "both" || c.audience === audienceDataKey)
            .sort((a, b) => a.priority - b.priority)
            .map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.emoji} {c.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );

  const GOV_AGENCY_OPTIONS = [
    { value: '', label: 'Усі органи' },
    { value: 'dps', label: '🏛 ДПС (податкова)' },
    { value: 'pfu', label: '🏥 ПФУ (пенсійний)' },
    { value: 'cnap', label: '📋 ЦНАП' },
    { value: 'dracs', label: '📝 ДРАЦС' },
    { value: 'court', label: '⚖️ Суди' },
  ];

  const govSidebarContent = (
    <div>
      {categorySelectorContent}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Орган</p>
          <Select value={govAgency || 'all'} onValueChange={(v) => setGovAgency(v === 'all' ? '' : v)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Усі органи" />
            </SelectTrigger>
            <SelectContent>
              {GOV_AGENCY_OPTIONS.map((o) => (
                <SelectItem key={o.value || 'all'} value={o.value || 'all'}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Місто</p>
          <Select value={govCity || 'all'} onValueChange={(v) => setGovCity(v === 'all' ? '' : v)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Усі міста" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі міста</SelectItem>
              {govCities.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(govAgency || govCity || searchInput) && (
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={resetGovFilters}>
            Скинути фільтри
          </Button>
        )}
      </div>
    </div>
  );

  const sidebarContent = isGov ? govSidebarContent : (
    <div>
      {categorySelectorContent}
      <CatalogSidebar
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        showRatingFilter={showProfiles}
        audienceFilter={audienceFilter}
        onAudienceFilterChange={setAudienceFilter}
        showAudienceFilter={showProfiles}
        cityFilter={cityFilter}
        onCityFilterChange={setCityFilter}
        availableCities={availableCities}
        showCityFilter={!!filterConfig?.showCity}
        featureGroups={featureGroups}
        activeFeatures={activeFeatures}
        onToggleFeature={toggleFeature}
        showFeatureFilter={featureGroups.length > 0}
        fixedStructure={!!filterConfig}
      />
    </div>
  );

  // ── Helper: extract quick info from profile ──
  const getProfileQuickInfo = (profile: FullInstitutionProfile) => {
    const story = profile.company.story || "";
    const tagline = story.length > 60 ? story.slice(0, 57) + "..." : story;

    const audiences = new Set(profile.products.map((p) => p.audience));
    const audience = audiences.has("personal") && audiences.has("business")
      ? "Для всіх"
      : audiences.has("both")
        ? "Для всіх"
        : audiences.has("business")
          ? "Для бізнесу"
          : "Фізособам";

    let minPrice: string | null = null;
    for (const p of profile.products) {
      if (p.price?.isFree) { minPrice = "Безкоштовно"; break; }
      if (p.price?.monthly) { minPrice = `від ${p.price.monthly}/міс`; break; }
    }

    const showBranches = profile.branches.totalCount > 0;
    const isTop = profile.ratings.fintodo.overall >= 9.5;
    const typeInfo = (() => {
      const t = profile.types[0];
      const cat = CATALOG_CATEGORIES.find((c) => c.types.some((ct) => ct.slug === t));
      const type = cat?.types.find((ct) => ct.slug === t);
      return type ? `${type.emoji} ${type.shortName}` : "";
    })();

    const allCategories = [...new Set(profile.products.map((p) => p.category).filter(Boolean))];
    const productTags = allCategories.slice(0, 4);
    const moreProducts = Math.max(0, allCategories.length - 4);

    return { tagline, audience, minPrice, showBranches, isTop, typeInfo, productTags, moreProducts };
  };

  // ── Render: profile row ──
  const renderProfileRow = (profile: FullInstitutionProfile) => {
    const info = getProfileQuickInfo(profile);
    const rating = profile.ratings.fintodo.overall;
    const isSelected = compareSelection.includes(profile.slug);
    return (
      <Card
        key={profile.id}
        className={`p-3 cursor-pointer hover:border-primary/40 transition-all active:scale-[0.99] ${isSelected ? "border-primary ring-1 ring-primary/20" : ""}`}
        onClick={() => navigate(`/dovidnyky/ustanovy/profile/${profile.slug}`)}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: profile.logo.color }}
          >
            {profile.logo.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-foreground text-sm truncate">
                <HighlightMatch text={profile.name} query={debouncedSearch} />
              </p>
              {profile.verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
              {info.isTop && (
                <Badge variant="warning" size="sm" className="shrink-0">⭐ Топ</Badge>
              )}
            </div>
            {info.productTags.length > 0 && (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {info.productTags.map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
                ))}
                {info.moreProducts > 0 && (
                  <span className="text-[10px] text-muted-foreground">+{info.moreProducts}</span>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground truncate mt-0.5">{info.tagline}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {info.typeInfo && <Badge variant="outline" size="sm">{info.typeInfo}</Badge>}
              <Badge variant="outline" size="sm">👥 {info.audience}</Badge>
              {info.minPrice && <Badge variant="outline" size="sm">💰 {info.minPrice}</Badge>}
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 min-w-[80px]">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-foreground tabular-nums">{rating.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">/ 10</span>
            </div>
            <Progress value={rating * 10} className="h-1.5 w-16" indicatorClassName="bg-amber-500" />
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="text-[11px] h-7 px-2.5 mt-0.5"
              onClick={(e) => { e.stopPropagation(); toggleCompare(profile.slug); }}
              disabled={!isSelected && compareSelection.length >= 2}
            >
              {isSelected ? "✓ Обрано" : "Порівняти"}
            </Button>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
      </Card>
    );
  };

  // ── Render: profile grid card ──
  const renderProfileGrid = (profile: FullInstitutionProfile) => {
    const info = getProfileQuickInfo(profile);
    const rating = profile.ratings.fintodo.overall;
    const isSelected = compareSelection.includes(profile.slug);
    return (
      <Card
        key={profile.id}
        className={`p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98] flex flex-col ${isSelected ? "border-primary ring-1 ring-primary/20" : ""}`}
        onClick={() => navigate(`/dovidnyky/ustanovy/profile/${profile.slug}`)}
      >
        <div className="space-y-3 flex-1">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: profile.logo.color }}
            >
              {profile.logo.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-foreground text-sm truncate">{profile.name}</p>
                {profile.verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{info.tagline}</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <p className="text-lg font-bold text-foreground tabular-nums leading-tight">{rating.toFixed(1)}</p>
              </div>
              <Progress value={rating * 10} className="h-1 w-14 mt-1" indicatorClassName="bg-amber-500" />
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="text-[11px] h-7 px-2.5 mt-1.5"
                onClick={(e) => { e.stopPropagation(); toggleCompare(profile.slug); }}
                disabled={!isSelected && compareSelection.length >= 2}
              >
                {isSelected ? "✓ Обрано" : "Порівняти"}
              </Button>
            </div>
          </div>

          {info.isTop && (
            <Badge variant="warning" size="sm">⭐ Топ рейтинг</Badge>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-border/40">
            {info.typeInfo && (
              <p className="text-[11px] text-muted-foreground truncate">{info.typeInfo}</p>
            )}
            <p className="text-[11px] text-muted-foreground truncate">👥 {info.audience}</p>
            {info.minPrice && (
              <p className="text-[11px] text-muted-foreground truncate">💰 {info.minPrice}</p>
            )}
            {info.showBranches && (
              <p className="text-[11px] text-muted-foreground truncate">📍 {profile.branches.totalCount} відділень</p>
            )}
          </div>
          {info.productTags.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {info.productTags.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
              ))}
              {info.moreProducts > 0 && (
                <span className="text-[10px] text-muted-foreground">+{info.moreProducts}</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-border/40">
          <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary">
            Детальніше <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  // ── Active filter chips ──
  const renderFilterChips = () => {
    if (!hasActiveFilters) return null;
    const allDefs = featureDefs;
    return (
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {selectedCat && category && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
            {category.emoji} {category.name}
          </span>
        )}
        {ratingFilter !== "all" && (
          <button onClick={() => setRatingFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors">
            ★ {ratingFilter}.0+ <X className="h-3 w-3" />
          </button>
         )}
        {audienceFilter && (
          <button onClick={() => setAudienceFilter("")} className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors">
            👤 {audienceFilter === "personal" ? "Фізособам" : "Бізнесу"} <X className="h-3 w-3" />
          </button>
        )}
        {cityFilter && (
          <button onClick={() => setCityFilter("")} className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors">
            🏙 {cityNameFromSlug(cityFilter)} <X className="h-3 w-3" />
          </button>
        )}
        {activeFeatures.map((key) => {
          const feat = allDefs.find((f) => f.key === key);
          if (!feat) return null;
          return (
            <button key={key} onClick={() => toggleFeature(key)} className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors">
              {feat.label} <X className="h-3 w-3" />
            </button>
          );
        })}
        <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground underline ml-1">
          Скинути все
        </button>
      </div>
    );
  };

  // ── Category grid (no category selected) ──
  const renderCategoryGrid = () => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visibleCategories.map((cat) => (
        <Card
          key={cat.id}
          className="p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98] group"
          onClick={() => setSelectedCat(cat.slug)}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-3xl">{cat.emoji}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{cat.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{cat.shortDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{cat.types.length} типів</Badge>
              {cat.profileCount > 0 && <Badge variant="outline" className="text-[10px]">{cat.profileCount} установ</Badge>}
            </div>
            {cat.profiles.length > 0 && (
              <div className="flex items-center gap-1 pt-1">
                {cat.profiles.slice(0, 3).map((p) => (
                  <div key={p.id} className="h-6 w-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: p.logo.color }} title={p.name}>
                    {p.logo.initials}
                  </div>
                ))}
                {cat.profiles.length > 3 && <span className="text-[10px] text-muted-foreground ml-1">+{cat.profiles.length - 3}</span>}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  // ── Profile list/grid ──
  const renderProfiles = () => {
    if (filteredProfiles.length === 0) {
      return (
        <div className="py-12 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {categoryProfiles.length === 0
              ? "В цій категорії ще немає профілів установ."
              : "Нічого не знайдено. Спробуйте змінити фільтри або пошуковий запит."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="text-xs" onClick={resetFilters}>
              Скинути фільтри
            </Button>
          )}
        </div>
      );
    }

    const effectiveLayout = isMobile ? "list" : layout;
    return effectiveLayout === "grid" ? (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filteredProfiles.map(renderProfileGrid)}</div>
    ) : (
      <div className="space-y-1.5">{filteredProfiles.map(renderProfileRow)}</div>
    );
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Каталог установ України",
    numberOfItems: CATALOG_CATEGORIES.length,
    itemListElement: CATALOG_CATEGORIES.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat.name,
      url: `${SITE_URL}/dovidnyky/ustanovy?cat=${cat.slug}`,
    })),
  };

  return (
    <PortalLayout
      meta={{
        title: category
          ? `${category.name} — каталог установ | FINTODO`
          : "Каталог установ України — путівник для бізнесу | FINTODO",
        description: category
          ? `${category.shortDescription}. Оберіть ${category.name.toLowerCase()} з фільтрами та рейтингами.`
          : `${CATALOG_CATEGORIES.length} категорій установ: банки, держоргани, страхові, нотаріуси. Знайдіть потрібну установу з фільтрами та рейтингами.`,
        canonical: selectedCat
          ? `${SITE_URL}/dovidnyky/ustanovy?cat=${selectedCat}`
          : `${SITE_URL}/dovidnyky/ustanovy`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema(
          category
            ? [
                { name: "Головна", url: SITE_URL },
                { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
                { name: "Каталог установ", url: `${SITE_URL}/dovidnyky/ustanovy` },
                { name: category.name, url: `${SITE_URL}/dovidnyky/ustanovy?cat=${category.slug}` },
              ]
            : [
                { name: "Головна", url: SITE_URL },
                { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
                { name: "Каталог установ", url: `${SITE_URL}/dovidnyky/ustanovy` },
              ]
        )}
      />
      <JsonLd data={itemListSchema} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav
          items={
            category
              ? [
                  { label: "Головна", to: "/" },
                  { label: "Довідники", to: "/dovidnyky" },
                  { label: "Каталог установ", to: "/dovidnyky/ustanovy" },
                  { label: category.name },
                ]
              : [
                  { label: "Головна", to: "/" },
                  { label: "Довідники", to: "/dovidnyky" },
                  { label: "Каталог установ" },
                ]
          }
        />

        <header className="py-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-4xl tracking-tight">
            {category ? `${category.emoji} ${category.name}` : "Каталог установ і сервісів"}
          </h1>
          <p className="text-muted-foreground max-w-3xl leading-relaxed text-sm">
            {category?.pageSubtitle
              ?? "Оберіть категорію, щоб переглянути конкретні установи з фільтрами, рейтингами та порівнянням"}
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={isGov ? "Пошук відділення..." : category ? `Пошук серед ${category.name.toLowerCase()}...` : "Пошук категорії або установи..."}
              className="pl-9 h-10"
            />
            {searchInput && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Active filter chips (not for gov — gov has its own sidebar) */}
        {showProfiles && !isGov && renderFilterChips()}
        {isGov && (govAgency || govCity) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {govAgency && (
              <button onClick={() => setGovAgency('')} className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors">
                {GOV_AGENCY_OPTIONS.find((o) => o.value === govAgency)?.label} <X className="h-3 w-3" />
              </button>
            )}
            {govCity && (
              <button onClick={() => setGovCity('')} className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-medium hover:bg-secondary/80 transition-colors">
                🏙 {govCity} <X className="h-3 w-3" />
              </button>
            )}
            <button onClick={resetGovFilters} className="text-xs text-muted-foreground hover:text-foreground underline ml-1">
              Скинути
            </button>
          </div>
        )}

        {/* Layout: sidebar + main */}
        <div className="flex gap-8 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-20">
            {sidebarContent}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar (only in profile view) */}
            {showProfiles && !isGov && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Фільтри
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="responsive-right">
                    <SheetTitle className="text-sm font-semibold mb-4">Фільтри</SheetTitle>
                    {sidebarContent}
                  </SheetContent>
                </Sheet>

                <div className="flex-1 min-w-0" />

                <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                  <SelectTrigger className="h-8 w-auto text-xs gap-1.5 sm:min-w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">За релевантністю</SelectItem>
                    <SelectItem value="rating">За рейтингом</SelectItem>
                    <SelectItem value="az">А — Я</SelectItem>
                  </SelectContent>
                </Select>

                <ToggleGroup
                  type="single"
                  value={layout}
                  onValueChange={(v) => v && setLayout(v as LayoutMode)}
                  className="hidden sm:flex bg-muted p-0.5 rounded-lg"
                >
                  <ToggleGroupItem value="list" aria-label="Список" className="gap-1 text-xs h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                    <List className="w-3.5 h-3.5" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="grid" aria-label="Картки" className="gap-1 text-xs h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </ToggleGroupItem>
                </ToggleGroup>

                <span className="hidden sm:inline text-xs text-muted-foreground font-mono shrink-0">
                  {filteredProfiles.length === categoryProfiles.length
                    ? `${categoryProfiles.length} установ`
                    : `${filteredProfiles.length} з ${categoryProfiles.length} установ`}
                </span>
              </div>
            )}

            {isGov && (
              <div className="flex items-center gap-3 mb-4 lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Фільтри
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="responsive-right">
                    <SheetTitle className="text-sm font-semibold mb-4">Фільтри</SheetTitle>
                    {sidebarContent}
                  </SheetContent>
                </Sheet>
              </div>
            )}

            {!showProfiles && (
              <div className="flex items-center gap-3 mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Категорія
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="responsive-right">
                    <SheetTitle className="text-sm font-semibold mb-4">Категорія</SheetTitle>
                    {categorySelectorContent}
                  </SheetContent>
                </Sheet>
              </div>
            )}

            {isGov ? <GovBranchList agency={govAgency} city={govCity} search={govSearch} onReset={resetGovFilters} /> : showProfiles ? renderProfiles() : renderCategoryGrid()}

          </div>
        </div>

        {/* CTA */}
        {showProfiles && !isGov && (
          <section className="py-10 border-t border-border/40 mt-10 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">
              FINTODO автоматизує роботу з {category ? category.name.toLowerCase() : "установами"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
              Звітність, облік та автоматизація — без ручних операцій
            </p>
            <Button asChild size="sm" onClick={() => analytics.ctaClick("catalog_page_cta")}>
              <Link to={CTA_CHECKOUT_URL}>Почати безкоштовно →</Link>
            </Button>
          </section>
        )}

        {/* Total stats */}
        {!showProfiles && (
          <p className="text-xs text-muted-foreground text-center mt-8 tabular-nums">
            {CATALOG_CATEGORIES.length} категорій · {CATALOG_CATEGORIES.reduce((sum, c) => sum + c.types.length, 0)} типів · {INSTITUTION_PROFILES.length} установ
          </p>
        )}
      </div>

      {/* Floating compare bar */}
      {showProfiles && compareSelection.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background border border-border shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 max-w-md w-[calc(100%-2rem)]">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {compareSelection.map((slug) => {
              const p = INSTITUTION_PROFILES.find((pr) => pr.slug === slug);
              if (!p) return null;
              return (
                <div key={slug} className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: p.logo.color }}
                  >
                    {p.logo.initials}
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">{p.name}</span>
                </div>
              );
            })}
            {compareSelection.length === 1 && (
              <span className="text-xs text-muted-foreground">← оберіть ще одну</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {compareSelection.length === 2 && (
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => navigate(`/dovidnyky/ustanovy/compare/${compareSelection[0]}/${compareSelection[1]}`)}
              >
                <GitCompareArrows className="h-3.5 w-3.5 mr-1" />
                Порівняти
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCompareSelection([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default CatalogPage;
