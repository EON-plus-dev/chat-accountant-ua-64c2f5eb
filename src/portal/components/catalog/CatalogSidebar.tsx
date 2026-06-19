import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { X, Check, ChevronsUpDown, Briefcase, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "default" | "az" | "rating";
export type RatingFilter = "all" | "8" | "7";
export type AudienceFilter = "" | "business" | "personal";
export interface FeatureFilter {
  key: string;
  label: string;
  count: number;
}

export interface FeatureGroup {
  label: string;
  features: FeatureFilter[];
}

export interface CityOption {
  slug: string;
  name: string;
  count: number;
}

interface Props {
  onReset: () => void;
  hasActiveFilters: boolean;
  profilesCount?: number;
  ratingFilter?: RatingFilter;
  onRatingFilterChange?: (v: RatingFilter) => void;
  showRatingFilter?: boolean;
  /** Audience filter */
  audienceFilter?: AudienceFilter;
  onAudienceFilterChange?: (v: AudienceFilter) => void;
  showAudienceFilter?: boolean;
  /** City filter */
  cityFilter?: string;
  onCityFilterChange?: (v: string) => void;
  availableCities?: CityOption[];
  showCityFilter?: boolean;
  /** Feature filters — flat list (legacy) */
  featureFilters?: FeatureFilter[];
  /** Feature filters — grouped (preferred for banks) */
  featureGroups?: FeatureGroup[];
  activeFeatures?: string[];
  onToggleFeature?: (key: string) => void;
  showFeatureFilter?: boolean;
  /** Fixed structure mode — always render all sections */
  fixedStructure?: boolean;
}

export const CatalogSidebar = ({
  onReset,
  hasActiveFilters,
  profilesCount = 0,
  ratingFilter = "all",
  onRatingFilterChange,
  showRatingFilter = false,
  audienceFilter = "",
  onAudienceFilterChange,
  showAudienceFilter = false,
  cityFilter = "",
  onCityFilterChange,
  availableCities = [],
  showCityFilter = false,
  featureFilters = [],
  featureGroups,
  activeFeatures = [],
  onToggleFeature,
  showFeatureFilter = false,
  fixedStructure = false,
}: Props) => {
  const [cityOpen, setCityOpen] = useState(false);
  const showCity = fixedStructure ? showCityFilter : (showCityFilter && availableCities.length > 0 && !!onCityFilterChange);
  const hasGroups = featureGroups && featureGroups.length > 0;
  const showFeatures = fixedStructure ? showFeatureFilter : (showFeatureFilter && (featureFilters.length > 0 || !!hasGroups) && !!onToggleFeature);

  const selectedCityName = cityFilter
    ? availableCities.find((c) => c.slug === cityFilter)?.name ?? cityFilter
    : "Усі міста";

  const renderFeatureCheckbox = (f: FeatureFilter) => (
    <label key={f.key} className="flex items-center gap-2 cursor-pointer group">
      <Checkbox
        checked={activeFeatures.includes(f.key)}
        onCheckedChange={() => onToggleFeature?.(f.key)}
        className="h-4 w-4"
      />
      <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1 truncate">
        {f.label}
      </span>
      <span className="text-[10px] text-muted-foreground font-mono">
        {f.count}
      </span>
    </label>
  );

  return (
    <nav className="space-y-5" aria-label="Фільтри каталогу">

      {/* ── ДЛЯ КОГО ── */}
      {(fixedStructure || showAudienceFilter) && onAudienceFilterChange && (
        <>
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Для кого
            </p>
            <ToggleGroup
              type="single"
              value={audienceFilter || "all"}
              onValueChange={(v) => {
                if (v) onAudienceFilterChange(v === "all" ? "" : v as AudienceFilter);
              }}
              className="flex w-full gap-0.5 bg-muted rounded-lg p-0.5"
            >
              <ToggleGroupItem value="all" className="flex-1 gap-1 text-xs h-7 px-2 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
                <Users className="w-3 h-3" />
                Всі
              </ToggleGroupItem>
              <ToggleGroupItem value="personal" className="flex-1 gap-1 text-xs h-7 px-2 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
                <User className="w-3 h-3" />
                Фізособам
              </ToggleGroupItem>
              <ToggleGroupItem value="business" className="flex-1 gap-1 text-xs h-7 px-2 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
                <Briefcase className="w-3 h-3" />
                Бізнесу
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Separator />
        </>
      )}

      {/* ── МІСТО ── */}
      {showCity && (
        <>
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Місто
            </p>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <button
                  role="combobox"
                  aria-expanded={cityOpen}
                  className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span className="truncate">{selectedCityName}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Пошук міста..." />
                  <CommandList>
                    <CommandEmpty>Місто не знайдено</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          onCityFilterChange?.("");
                          setCityOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", !cityFilter ? "opacity-100" : "opacity-0")} />
                        Усі міста
                      </CommandItem>
                      {availableCities.map((city) => (
                        <CommandItem
                          key={city.slug}
                          value={city.name}
                          onSelect={() => {
                            onCityFilterChange?.(city.slug);
                            setCityOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", cityFilter === city.slug ? "opacity-100" : "opacity-0")} />
                          <span className="flex-1">{city.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono ml-1">({city.count})</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Separator />
        </>
      )}

      {/* ── ОСОБЛИВОСТІ ── */}
      {showFeatures && (
        <>
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Особливості
              {activeFeatures.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {activeFeatures.length}
                </span>
              )}
            </p>

            {hasGroups ? (
              <div className="space-y-3">
                {featureGroups!.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                      {group.label}
                    </p>
                    <div className="space-y-1.5">
                      {group.features.map(renderFeatureCheckbox)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {featureFilters.map(renderFeatureCheckbox)}
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* ── РЕЙТИНГ ── */}
      {(fixedStructure || (showRatingFilter && onRatingFilterChange)) && (
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
            Рейтинг
          </p>
          <Select value={ratingFilter} onValueChange={(v) => onRatingFilterChange?.(v as RatingFilter)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі</SelectItem>
              <SelectItem value="8">★ 8.0 і вище</SelectItem>
              <SelectItem value="7">★ 7.0 і вище</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Profiles link */}
      {profilesCount > 0 && (
        <>
          <Separator />
          <a
            href="/dovidnyky/ustanovy?view=profiles"
            className="text-sm text-primary hover:underline"
          >
            Профілі установ ({profilesCount}) →
          </a>
        </>
      )}
    </nav>
  );
};
