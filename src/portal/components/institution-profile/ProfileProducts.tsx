import { useState } from "react";
import { Package } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";
import { ProductCard } from "./ProductCard";
import { CurrencyExchangeCard } from "./CurrencyExchangeCard";


interface Props {
  profile: FullInstitutionProfile;
}

export const ProfileProducts = ({ profile }: Props) => {
  const productCategories = [...new Set(profile.products.map(p => p.category))];
  const [activeCategory, setActiveCategory] = useState(productCategories[0] || "");

  const filteredProducts = productCategories.length <= 1
    ? profile.products
    : profile.products.filter(p => p.category === activeCategory);

  return (
    <section id="products" className="border-t border-border pt-6 mt-8 scroll-mt-28">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Package className="w-6 h-6 text-primary" /> Продукти та послуги
      </h2>

      {/* Folder tabs — only when 2+ categories */}
      {productCategories.length > 1 && (
        <div className="mt-4 -mb-px">
          <ScrollArea className="w-full" scrollbarVariant="hidden" orientation="horizontal">
            <nav className="inline-flex items-center gap-0 w-max border-b border-border" role="tablist">
              {productCategories.map(cat => {
                const isActive = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "relative h-9 px-4 text-sm font-medium shrink-0",
                      "transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      isActive
                        ? "text-foreground border-b-2 border-primary -mb-px bg-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>
            <ScrollBar orientation="horizontal" variant="thin" />
          </ScrollArea>
        </div>
      )}

      {/* Product cards */}
      <div className="space-y-3 mt-4">
        {filteredProducts.map(p =>
          p.category === "Обмін валют"
            ? <CurrencyExchangeCard key={p.id} product={p} profile={profile} />
            : <ProductCard key={p.id} product={p} profile={profile} />
        )}
      </div>

    </section>
  );
};
