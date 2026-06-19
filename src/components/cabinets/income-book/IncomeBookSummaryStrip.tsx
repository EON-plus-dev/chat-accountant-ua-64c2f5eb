/**
 * Mobile-only collapsible summary strip for Income Book.
 * Replaces the dense 4-card KPI grid on small screens.
 *
 * Uses the same `useIncomeBookKPIs` source as desktop — no AI calls,
 * no extra fetches, just a deterministic one-line summary that expands
 * into a vertical list of the same 4 metrics + a "limit headroom" line.
 */

import { useEffect, useState } from "react";
import { ChevronDown, BarChart3 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useIncomeBookKPIs } from "./useIncomeBookKPIs";
import { FOP_INCOME_LIMITS } from "@/lib/businessRules";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { Cabinet } from "@/types/cabinet";

interface Props {
  cabinet: Cabinet;
  records: IncomeBookRecord[];
  selectedYear: number;
}

const STORAGE_KEY = "incomeBook.summaryOpen";

const formatCompactUah = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2).replace(".", ",")}М ₴`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}К ₴`;
  return `${n} ₴`;
};

const formatFullUah = (n: number): string =>
  `${new Intl.NumberFormat("uk-UA").format(Math.round(n))} ₴`;

export function IncomeBookSummaryStrip({ cabinet, records, selectedYear }: Props) {
  const kpis = useIncomeBookKPIs({ cabinet, records, selectedYear });

  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    }
  }, [open]);

  if (kpis.length === 0) return null;

  const yearKpi = kpis.find((k) => k.id === "year-income");
  const monthKpi = kpis.find((k) => k.id === "month-income");
  const avgKpi = kpis.find((k) => k.id === "avg-month");
  const topKpi = kpis.find((k) => k.id === "top-contractor");

  const yearIncome = yearKpi?.value ?? 0;
  const fopGroup = (cabinet.fopGroup || 3) as 1 | 2 | 3;
  const limit = FOP_INCOME_LIMITS[fopGroup];
  const usedPercent = limit > 0 ? Math.round((yearIncome / limit) * 100) : 0;
  const headroom = Math.max(0, limit - yearIncome);

  // Top share parsed from description ("X · NN% доходу · ...")
  const topShareMatch = topKpi?.description?.match(/(\d+)%/);
  const topShare = topShareMatch ? Number(topShareMatch[1]) : 0;

  const limitTone =
    usedPercent >= 90 ? "text-destructive" : usedPercent >= 75 ? "text-warning" : "text-muted-foreground";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
        <CollapsibleTrigger
          className={cn(
            "w-full flex items-center gap-2 h-11 px-3",
            "text-left text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label={open ? "Згорнути коротку довідку" : "Розгорнути коротку довідку"}
        >
          <BarChart3 className="w-4 h-4 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0 flex items-center gap-1.5 text-[13px] truncate">
            <span className="font-semibold tabular-nums">{formatCompactUah(yearIncome)}</span>
            <span className="opacity-40">·</span>
            <span className={cn("tabular-nums", limitTone)}>{usedPercent}% ліміту</span>
            {topShare > 0 && (
              <>
                <span className="opacity-40">·</span>
                <span className="tabular-nums text-muted-foreground">топ {topShare}%</span>
              </>
            )}
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 space-y-1.5 text-[13px] border-t border-border/40">
            {yearKpi && (
              <Row label={`Дохід ${selectedYear}`} value={formatFullUah(yearKpi.value)} />
            )}
            {monthKpi && (
              <Row label="Цього місяця" value={formatFullUah(monthKpi.value)} />
            )}
            {avgKpi && (
              <Row label="Середньомісячний" value={formatFullUah(avgKpi.value)} />
            )}
            {topKpi && (
              <Row
                label="Топ-контрагент"
                value={`${formatFullUah(topKpi.value)}${topShare ? ` (${topShare}%)` : ""}`}
              />
            )}
            <div className="pt-1.5 mt-1 border-t border-border/40">
              <Row
                label={`До ліміту ФОП-${fopGroup} залишилось`}
                value={`~${formatCompactUah(headroom)}`}
                muted
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={cn("text-muted-foreground", muted && "text-[12px]")}>{label}</span>
      <span className="flex-1 border-b border-dotted border-border/50 translate-y-[-3px]" />
      <span className={cn("font-medium tabular-nums", muted && "text-[12px] text-muted-foreground")}>
        {value}
      </span>
    </div>
  );
}
