import { useState } from "react";
import {
  CalendarIcon,
  GitCompareArrows,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { PERIOD_LABELS, type PeriodType } from "@/lib/analytics/periodFilter";
import type { AnalysisMode } from "./QueryBuilderBar";

interface MobileFilterBarProps {
  period: PeriodType;
  analysisMode: AnalysisMode;
  comparisonLabel?: string;
  customRange: { from: Date; to: Date } | null;
  /** Той самий sidebar, що й на desktop */
  sidebar: React.ReactNode;
}

const fmt = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;

/**
 * Мобільна summary-смуга з кнопкою "Налаштувати", що відкриває
 * Drawer із повним AnalyticsSidebar — тим самим, що й на desktop.
 * Усуває дублювання логіки QueryBuilderBar vs AnalyticsSidebar.
 */
export const MobileFilterBar = ({
  period,
  analysisMode,
  comparisonLabel,
  customRange,
  sidebar,
}: MobileFilterBarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
        <div className="flex items-center gap-1.5 text-sm flex-wrap min-w-0">
          <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{PERIOD_LABELS[period]}</span>
          {period === "custom" && customRange && (
            <span className="text-xs text-muted-foreground">
              {fmt(customRange.from)} — {fmt(customRange.to)}
            </span>
          )}
          {analysisMode === "compare" && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-0.5">
              <GitCompareArrows className="w-2.5 h-2.5" />
              vs {comparisonLabel || "попередній"}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs min-h-[44px] shrink-0 whitespace-nowrap"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Налаштувати
        </Button>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Налаштування аналітики</DrawerTitle>
            <DrawerDescription>
              Період, порівняння, показники та вигляд
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6 max-h-[70vh] overflow-y-auto">
            {sidebar}
            <Button
              className="w-full mt-3 min-h-[44px]"
              onClick={() => setOpen(false)}
            >
              Готово
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
