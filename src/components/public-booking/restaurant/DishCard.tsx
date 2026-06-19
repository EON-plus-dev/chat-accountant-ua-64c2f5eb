/**
 * Картка страви у списку меню. Сучасний світовий рівень:
 *  - 96×96 thumbnail (фото або градієнт-плейсхолдер з емодзі);
 *  - дієтичні / гострота бейджі;
 *  - 2-рядковий опис, мета (вага · хв · ккал);
 *  - швидкий «+» (миттєво в кошик) або тап → детальна шторка.
 *  - стоп-лист — приглушена картка з бейджем «Тимчасово недоступно».
 */

import { Clock, Flame, Plus, Minus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DishVisual, DIETARY_META, type EnrichedMenuItem } from "./dishVisuals";

interface Props {
  item: EnrichedMenuItem;
  qty: number;
  accent: string;
  onOpen: () => void;
  onInc: () => void;
  onDec: () => void;
}

export function DishCard({ item, qty, accent, onOpen, onInc, onDec }: Props) {
  const disabled = !!item.stopList;
  return (
    <div
      className={cn(
        "relative p-3 md:p-3.5 flex gap-3 items-stretch transition-colors",
        disabled && "opacity-60",
        !disabled && "hover:bg-muted/40 cursor-pointer",
      )}
      onClick={!disabled ? onOpen : undefined}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden shrink-0 bg-muted">
        <DishVisual item={item} className="w-full h-full object-cover" />
        {item.chefPick && (
          <span
            className="absolute top-1 left-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
            style={{ background: accent }}
          >
            <Star className="w-2.5 h-2.5 fill-current" /> Шеф
          </span>
        )}
        {disabled && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-foreground/80 px-2 text-center leading-tight">
              Тимчасово<br />недоступно
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-sm md:text-base leading-snug line-clamp-2">
            {item.name}
          </div>
          <div className="text-sm md:text-base font-bold tabular-nums shrink-0">
            {item.price} ₴
          </div>
        </div>

        {item.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Тег-рядок: дієта + гострота */}
        {(item.dietary.length > 0 || item.spicy > 0 || item.popular) && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.popular && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                🔥 Хіт
              </Badge>
            )}
            {item.dietary.slice(0, 2).map((d) => {
              const meta = DIETARY_META[d];
              return (
                <Badge key={d} variant="outline" className="text-[10px] h-5 px-1.5 gap-0.5">
                  <span>{meta.emoji}</span>
                  <span className="hidden sm:inline">{meta.label}</span>
                </Badge>
              );
            })}
            {item.spicy > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-0.5 border-orange-300 text-orange-600">
                {Array.from({ length: item.spicy }).map((_, i) => (
                  <Flame key={i} className="w-2.5 h-2.5 fill-current" />
                ))}
              </Badge>
            )}
          </div>
        )}

        {/* Footer: мета + кнопка */}
        <div className="mt-auto pt-1.5 flex items-end justify-between gap-2">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
            {item.weight && <span>{item.weight} {item.unit}</span>}
            <span className="inline-flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {item.prepTimeMin} хв
            </span>
            <span>{item.calories} ккал</span>
          </div>

          {!disabled && (
            <div onClick={(e) => e.stopPropagation()}>
              {qty === 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onInc}
                  className="h-8 w-8 p-0 rounded-full"
                  aria-label="Додати"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              ) : (
                <div
                  className="inline-flex items-center gap-1 rounded-full border bg-card"
                  style={{ borderColor: accent }}
                >
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={onDec}>
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-sm font-semibold w-5 text-center tabular-nums">{qty}</span>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={onInc}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
