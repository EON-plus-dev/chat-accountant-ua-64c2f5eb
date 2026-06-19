import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TaxTypeCard } from "./TaxTypeCard";
import type { TaxPayment, TaxType } from "@/config/paymentsConfig";
import { effectiveTaxStatus } from "@/lib/taxStatus";

type FilterStatus = "overdue" | "due" | "open" | "paid";

export type TaxCardsSortMode = "deadline" | "amount" | "default";

interface Props {
  payments: TaxPayment[];
  year: number;
  hasEmployees: boolean;
  /** @deprecated kept for backward compatibility — sorting was removed */
  sortMode?: TaxCardsSortMode;
  onOpenPayment: (payment: TaxPayment) => void;
  onOpenDeclaration?: (taxType: TaxType, payments: TaxPayment[]) => void;
  onOpenIncomeBook?: (period?: { year: number; quarter?: number }) => void;
  onOpenDetail?: (taxType: TaxType) => void;
}

const FOP_TYPES: TaxType[] = ["ep", "esv", "military-fop"];
const SALARY_TYPES: TaxType[] = ["pdfo", "military", "esv-employer"];

export function TaxTypeOverviewGrid({
  payments,
  year,
  hasEmployees,
  onOpenPayment,
  onOpenDeclaration,
  onOpenIncomeBook,
  onOpenDetail,
}: Props) {
  const grouped = useMemo(() => {
    const byType = new Map<TaxType, TaxPayment[]>();
    for (const p of payments) {
      if (p.year !== year) continue;
      const arr = byType.get(p.taxType) ?? [];
      arr.push(p);
      byType.set(p.taxType, arr);
    }
    return byType;
  }, [payments, year]);

  const visibleTypes: TaxType[] = useMemo(() => {
    const result: TaxType[] = [];
    for (const t of FOP_TYPES) {
      if ((grouped.get(t)?.length ?? 0) > 0) result.push(t);
    }
    if (hasEmployees) {
      for (const t of SALARY_TYPES) {
        if ((grouped.get(t)?.length ?? 0) > 0) result.push(t);
      }
    }
    return result;
  }, [grouped, hasEmployees]);

  const counts = useMemo(() => {
    const today = new Date();
    let overdue = 0;
    let due = 0;
    let open = 0;
    let paid = 0;
    for (const p of payments) {
      if (p.year !== year) continue;
      const st = effectiveTaxStatus(p, today);
      if (st === "overdue") overdue++;
      else if (st === "due") due++;
      else if (st === "paid") paid++;
      else if (st !== "cancelled") open++;
    }
    return { overdue, due, open, paid };
  }, [payments, year]);

  const [activeStatus, setActiveStatus] = useState<FilterStatus | null>(null);

  const typesByStatus = useMemo(() => {
    const today = new Date();
    const map: Record<FilterStatus, Set<TaxType>> = {
      overdue: new Set(),
      due: new Set(),
      open: new Set(),
      paid: new Set(),
    };
    for (const t of visibleTypes) {
      for (const p of grouped.get(t) ?? []) {
        const st = effectiveTaxStatus(p, today);
        if (st === "overdue") map.overdue.add(t);
        else if (st === "due") map.due.add(t);
        else if (st === "paid") map.paid.add(t);
        else if (st !== "cancelled") map.open.add(t);
      }
    }
    return map;
  }, [visibleTypes, grouped]);

  const filteredTypes = activeStatus
    ? visibleTypes.filter((t) => typesByStatus[activeStatus].has(t))
    : visibleTypes;

  if (visibleTypes.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        За {year} рік ще немає нарахованих податкових зобов'язань.
      </div>
    );
  }

  const badges: Array<{
    key: FilterStatus;
    label: string;
    n: number;
    inactive: string;
    active: string;
  }> = [
    {
      key: "overdue",
      label: "Прострочено",
      n: counts.overdue,
      inactive: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/60",
      active: "border-rose-600 bg-rose-600 text-white hover:bg-rose-600",
    },
    {
      key: "due",
      label: "До сплати",
      n: counts.due,
      inactive: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/60",
      active: "border-amber-600 bg-amber-600 text-white hover:bg-amber-600",
    },
    {
      key: "open",
      label: "Заплановано",
      n: counts.open,
      inactive: "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
      active: "border-foreground bg-foreground text-background hover:bg-foreground",
    },
    {
      key: "paid",
      label: "Сплачено",
      n: counts.paid,
      inactive: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/60",
      active: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {badges.map((b) => {
          const isActive = activeStatus === b.key;
          const disabled = b.n === 0;
          return (
            <button
              key={b.key}
              type="button"
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => setActiveStatus(isActive ? null : b.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isActive ? b.active : b.inactive,
                disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              {b.label}
              <span className="tabular-nums font-semibold">{b.n}</span>
            </button>
          );
        })}
        {activeStatus && (
          <button
            type="button"
            onClick={() => setActiveStatus(null)}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline ml-1"
          >
            Скинути
          </button>
        )}
      </div>
      {filteredTypes.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Немає типів податків у цьому статусі.{" "}
          <button
            type="button"
            onClick={() => setActiveStatus(null)}
            className="text-primary hover:underline"
          >
            Скинути фільтр
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTypes.map((t) => (
            <TaxTypeCard
              key={t}
              taxType={t}
              payments={grouped.get(t) ?? []}
              year={year}
              onOpenPayment={onOpenPayment}
              onOpenDeclaration={onOpenDeclaration}
              onOpenIncomeBook={onOpenIncomeBook}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
