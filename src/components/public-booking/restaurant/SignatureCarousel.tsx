/**
 * Hero-карусель «Хіти шефа» — горизонтальний скрол з великими фото.
 * Wolt/UberEats стиль: 220×140 картки з градієнтним overlay.
 */

import { Star } from "lucide-react";
import { DishVisual, type EnrichedMenuItem } from "./dishVisuals";

interface Props {
  items: EnrichedMenuItem[];
  accent: string;
  onSelect: (item: EnrichedMenuItem) => void;
}

export function SignatureCarousel({ items, accent, onSelect }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="py-3">
      <div className="px-3 md:px-4 mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold inline-flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-current" style={{ color: accent }} />
          Хіти від шефа
        </h3>
        <span className="text-[11px] text-muted-foreground">{items.length}</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x px-3 md:px-4 pb-1">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onSelect(it)}
            className="snap-start shrink-0 w-[210px] md:w-[240px] rounded-xl overflow-hidden border bg-card text-left hover:shadow-md transition-shadow group"
          >
            <div className="relative h-[120px] md:h-[140px] bg-muted overflow-hidden">
              <DishVisual item={it} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-2 right-2 text-white">
                <div className="text-[11px] opacity-90">
                  {it.prepTimeMin} хв · {it.calories} ккал
                </div>
              </div>
              <span
                className="absolute top-1.5 right-1.5 text-[10px] font-bold rounded-full px-2 py-0.5 text-white"
                style={{ background: accent }}
              >
                {it.price} ₴
              </span>
            </div>
            <div className="p-2.5">
              <div className="font-semibold text-sm leading-tight line-clamp-2">{it.name}</div>
              {it.description && (
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {it.description}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
