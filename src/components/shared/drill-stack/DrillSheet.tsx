/**
 * DrillSheet — обгортка над Sheet, що рендериться на конкретний рівень drill-стека.
 *
 * Особливості:
 *   • Розкривається лише коли поточний (top) рівень = matchKind + matchId.
 *   • На ESC / клік поза → pop() (назад на рівень нижче), а не закриває весь стек.
 *   • Breadcrumb у шапці: «← {sourceLabel}» — клік повертає до батька.
 *   • Z-index масштабується з глибиною (50 / 60 / 70).
 */

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDrillStack } from "./DrillStackProvider";
import type { DrillKind } from "./types";

interface DrillSheetProps {
  matchKind: DrillKind;
  matchId: string;
  /** Заголовок sheet (напр. «Запис у Книзі доходів») */
  title: string;
  /** Підпис батьківського контексту (напр. «Платіж №PAY-2026-0418-001») */
  sourceLabel?: string;
  /** Контент drill-view */
  children: ReactNode;
  /** Sticky футер з основними діями (опц.) */
  footer?: ReactNode;
  /** Опц. clas для SheetContent */
  contentClassName?: string;
}

export function DrillSheet({
  matchKind,
  matchId,
  title,
  sourceLabel,
  children,
  footer,
  contentClassName,
}: DrillSheetProps) {
  const { current, depth, pop } = useDrillStack();
  const isOpen = !!current && current.kind === matchKind && current.id === matchId;

  // depth=1 → перший drill, z-50; depth=2 → 60; etc.
  const zIndex = 40 + depth * 10;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && pop()}>
      <SheetContent
        side="responsive-right"
        className={cn("flex flex-col p-0", contentClassName)}
        style={{ zIndex }}
        onEscapeKeyDown={(e) => {
          // ESC: радix сам викличе onOpenChange(false) → pop(). Не чіпаємо.
        }}
      >
        {/* Hide default close X — у нас власна навігація через breadcrumb */}
        <SheetHeader className="px-6 pt-5 pb-3 border-b shrink-0">
          {sourceLabel && (
            <button
              type="button"
              onClick={pop}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Повернутися до: {sourceLabel}</span>
            </button>
          )}
          <SheetTitle className="text-base font-semibold pr-8">{title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer && (
          <div className="border-t px-6 py-3 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
