/**
 * CrmDealCard — компактна картка угоди для колонок Pipeline Board.
 * Працює в desktop (draggable через @dnd-kit) та mobile (tap → drill).
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CrmAccount, CrmDeal, CrmPreset } from "../types";
import { CrmHealthScoreBadge } from "./CrmHealthScoreBadge";

interface Props {
  deal: CrmDeal;
  account?: CrmAccount;
  preset: CrmPreset;
  draggable?: boolean;
  onOpen?: (deal: CrmDeal) => void;
}

function formatValue(value: number, currency: string, isRecurring: boolean): string {
  const formatted = new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value);
  const symbol = currency === "UAH" ? "₴" : currency;
  return `${formatted} ${symbol}${isRecurring ? "/міс" : ""}`;
}

function ageInDays(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function daysUntil(iso: string): number {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export function CrmDealCard({ deal, account, preset, draggable = true, onOpen }: Props) {
  const sortable = useSortable({ id: deal.id, disabled: !draggable });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  const stageAge = ageInDays(deal.stageEnteredAt);
  const closeIn = daysUntil(deal.expectedCloseAt);
  const isStaleStage = stageAge >= 14;
  const isClosingSoon = closeIn >= 0 && closeIn <= 7;
  const isOverdue = closeIn < 0;

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-card text-card-foreground p-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer",
        sortable.isDragging && "opacity-50",
      )}
      onClick={() => onOpen?.(deal)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(deal);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${preset.terminology.deal}: ${deal.title}`}
    >
      <div className="flex items-start gap-2">
        {draggable && (
          <button
            type="button"
            className="shrink-0 -ml-1 mt-0.5 text-muted-foreground/40 hover:text-muted-foreground touch-none cursor-grab active:cursor-grabbing"
            aria-label="Перетягнути"
            onClick={(e) => e.stopPropagation()}
            {...sortable.attributes}
            {...sortable.listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-medium leading-tight line-clamp-2 min-w-0">{deal.title}</h4>
            {deal.health && <CrmHealthScoreBadge health={deal.health} />}
          </div>
          {account && (
            <p className="text-xs text-muted-foreground truncate mb-2">{account.name}</p>
          )}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-semibold tabular-nums">
              {formatValue(deal.value, deal.currency, preset.terminology.valueIsRecurring)}
            </span>
            <span className="text-[10px] text-muted-foreground tabular-nums">{deal.probability}%</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] gap-1 px-1.5 py-0 leading-none h-5",
                isStaleStage && "border-amber-500/40 text-amber-700 dark:text-amber-300",
              )}
            >
              <Clock className="h-2.5 w-2.5" /> {stageAge}д у стадії
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] gap-1 px-1.5 py-0 leading-none h-5",
                isOverdue && "border-red-500/40 text-red-700 dark:text-red-300",
                isClosingSoon && !isOverdue && "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
              )}
            >
              <Calendar className="h-2.5 w-2.5" />
              {isOverdue ? `+${Math.abs(closeIn)}д прострочено` : `${closeIn}д до закриття`}
            </Badge>
            {deal.tags?.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 leading-none h-5">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
