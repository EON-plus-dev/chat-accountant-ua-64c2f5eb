import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import type { InstitutionProduct, FullInstitutionProfile } from "@/portal/data/institutionProfiles";

interface Props {
  currentProduct: InstitutionProduct;
  currentProfile: FullInstitutionProfile;
}

export const ProductComparePickerPopover = ({ currentProduct, currentProfile }: Props) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const competitors = useMemo(() => {
    const results: { profile: FullInstitutionProfile; product: InstitutionProduct }[] = [];
    for (const p of INSTITUTION_PROFILES) {
      if (p.slug === currentProfile.slug) continue;
      for (const prod of p.products) {
        if (prod.category === currentProduct.category) {
          results.push({ profile: p, product: prod });
        }
      }
    }
    return results;
  }, [currentProfile.slug, currentProduct.category]);

  const showSearch = competitors.length > 6;

  const filtered = useMemo(() => {
    if (!search.trim()) return competitors;
    const q = search.toLowerCase();
    return competitors.filter(
      (c) =>
        c.profile.name.toLowerCase().includes(q) ||
        c.product.name.toLowerCase().includes(q)
    );
  }, [competitors, search]);

  const handleSelect = (targetSlug: string, targetProductId: string) => {
    setOpen(false);
    setSearch("");
    navigate(
      `/dovidnyky/ustanovy/compare-products/${currentProfile.slug}/${currentProduct.id}/${targetSlug}/${targetProductId}`
    );
  };

  if (competitors.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-3 text-[11px] min-w-[120px] gap-1 border-primary/30 text-primary hover:bg-primary/5">
          <ArrowLeftRight className="h-3 w-3" />
          Порівняти
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        {showSearch && (
          <div className="px-1 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Пошук..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
                autoFocus
              />
            </div>
          </div>
        )}

        <p className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {currentProduct.category} від інших установ
        </p>

        <div className="max-h-60 overflow-y-auto space-y-0.5">
          {filtered.map((c) => (
            <button
              key={`${c.profile.slug}-${c.product.id}`}
              onClick={() => handleSelect(c.profile.slug, c.product.id)}
              className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md text-left hover:bg-accent transition-colors"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: c.profile.logo.color }}
              >
                {c.profile.logo.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{c.product.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{c.profile.name}</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                {c.product.price.isFree ? "Безк." : c.product.price.monthly || c.product.price.perTransaction || "—"}
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted-foreground text-center">
              Нічого не знайдено
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
