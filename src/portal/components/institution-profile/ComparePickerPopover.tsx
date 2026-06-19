import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

interface Props {
  currentProfile: FullInstitutionProfile;
}

export const ComparePickerPopover = ({ currentProfile }: Props) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const others = useMemo(
    () => INSTITUTION_PROFILES.filter((p) => p.slug !== currentProfile.slug),
    [currentProfile.slug]
  );

  const showSearch = others.length > 8;

  const filtered = useMemo(() => {
    if (!search.trim()) return others;
    const q = search.toLowerCase();
    return others.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.legalName.toLowerCase().includes(q) ||
        p.brandNames.some((b) => b.toLowerCase().includes(q))
    );
  }, [others, search]);

  const sameCategory = filtered.filter(
    (p) => p.ratings.fintodo.categorySlug === currentProfile.ratings.fintodo.categorySlug
  );
  const otherCategory = filtered.filter(
    (p) => p.ratings.fintodo.categorySlug !== currentProfile.ratings.fintodo.categorySlug
  );

  const handleSelect = (slug: string) => {
    setOpen(false);
    setSearch("");
    navigate(`/dovidnyky/ustanovy/compare/${currentProfile.slug}/${slug}`);
  };

  const renderItem = (p: FullInstitutionProfile) => (
    <button
      key={p.slug}
      onClick={() => handleSelect(p.slug)}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-left hover:bg-accent transition-colors"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ backgroundColor: p.logo.color }}
      >
        {p.logo.initials}
      </div>
      <span className="text-sm font-medium text-foreground truncate flex-1">{p.name}</span>
      <Badge variant="secondary" className="text-xs tabular-nums shrink-0">
        {p.ratings.fintodo.overall}
      </Badge>
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Порівняти з іншими
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        {showSearch && (
          <div className="px-1 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук установи..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
                autoFocus
              />
            </div>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto space-y-1">
          {sameCategory.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {currentProfile.ratings.fintodo.categoryName}
              </p>
              {sameCategory.map(renderItem)}
            </div>
          )}

          {otherCategory.length > 0 && (
            <div>
              {sameCategory.length > 0 && <hr className="my-1.5 border-border" />}
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Інші установи
              </p>
              {otherCategory.map(renderItem)}
            </div>
          )}

          {filtered.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground text-center">
              Нічого не знайдено
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
