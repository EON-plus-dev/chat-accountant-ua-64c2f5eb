import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, MoreHorizontal, X } from "lucide-react";
import { fmtDueShort, isUrgentDue, TONE_ICON_CLASS, type WcCard, type WcTone } from "./workCenterMockData";
import { cn } from "@/lib/utils";

interface Props {
  card: WcCard;
  onDelegate: (card: WcCard) => void;
  onPrimary?: (card: WcCard) => void;
  onSecondary?: (card: WcCard) => void;
  onReject?: (card: WcCard) => void;
}

function defaultTone(card: WcCard): WcTone {
  if (card.tone) return card.tone;
  if (card.kind === "decision") return "violet";
  if (card.kind === "progress") return "blue";
  if (card.kind === "done") return "green";
  return "orange";
}

export function WorkCenterCard({ card, onDelegate, onPrimary, onSecondary, onReject }: Props) {
  const Icon = card.icon;
  const tone = defaultTone(card);
  const toneClass = TONE_ICON_CLASS[tone];

  if (card.kind === "done") {
    return (
      <article className="rounded-xl border border-border/60 bg-card p-3 flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all">
        <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{card.title}</div>
          <div className="text-xs text-muted-foreground truncate">{card.module}</div>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">{card.doneAt}</span>
        <button className="text-muted-foreground/60 hover:text-foreground shrink-0" aria-label="Дії">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </article>
    );
  }

  const allowReject = card.kind === "decision" && card.allowReject && !!onReject;

  return (
    <article className="rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md hover:-translate-y-px space-y-2.5">
      <div className="flex items-start gap-2.5">
        <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium leading-tight line-clamp-2">{card.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{card.module}</p>
        </div>
      </div>

      {card.kind === "attention" && card.dueAt && (
        <div className="text-xs">
          <span className={cn("font-medium", isUrgentDue(card.dueAt) ? "text-rose-600" : "text-muted-foreground")}>
            До {fmtDueShort(card.dueAt)}
          </span>
        </div>
      )}

      {card.kind === "decision" && (
        <div className="space-y-1 text-xs">
          {card.amount && <div className="text-base font-semibold text-foreground">{card.amount}</div>}
          <div className="text-muted-foreground line-clamp-2">
            {card.amount ? card.meta : <>Статус: {card.status}</>}
          </div>
          {!card.amount && card.meta && <div className="text-muted-foreground line-clamp-2">{card.meta}</div>}
        </div>
      )}

      {card.kind === "progress" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Прогрес</span>
            <span className="font-semibold tabular-nums">{card.progressPct}%</span>
          </div>
          <Progress value={card.progressPct} className="h-1.5" />
          <div className="text-xs text-muted-foreground pt-1 line-clamp-2">
            <span className="text-foreground/70">Далі:</span> {card.nextStep}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-0.5 flex-nowrap min-w-0">
        {card.kind === "attention" && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs gap-1 flex-1 min-w-0"
              onClick={() => onDelegate(card)}
            >
              <Sparkles className="h-3 w-3 shrink-0" />
              <span className="truncate">Передати AI</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 px-2.5 text-xs flex-1 min-w-0"
              onClick={() => onPrimary?.(card)}
            >
              Виконати
            </Button>
          </>
        )}
        {card.kind === "decision" && (
          <TooltipProvider delayDuration={200}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs flex-1 min-w-0"
              onClick={() => onSecondary?.(card)}
            >
              Переглянути
            </Button>
            <Button
              size="sm"
              className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-600/90 text-white flex-1 min-w-0"
              onClick={() => onPrimary?.(card)}
            >
              Погодити
            </Button>
            {allowReject && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0 text-rose-600 border-border hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                    onClick={() => onReject?.(card)}
                    aria-label="Відхилити"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Відхилити</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        )}
        {card.kind === "progress" && (
          <Button size="sm" variant="secondary" className="h-8 px-2.5 text-xs w-full" onClick={() => onPrimary?.(card)}>
            Відкрити процес
          </Button>
        )}
      </div>
    </article>
  );
}
