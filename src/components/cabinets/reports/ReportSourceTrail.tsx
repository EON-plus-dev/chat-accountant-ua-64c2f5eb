import { useMemo, useState } from "react";
import {
  Banknote,
  Database,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { Report } from "@/config/reportsConfig";

type SourceId = "income-book" | "integrations" | "manual" | "employees" | "documents";

interface SourceBreakdown {
  id: string;
  sourceType: SourceId;
  label: string;
  sublabel?: string;
  icon: typeof Banknote;
  amount: number;
  share: number; // 0..100
  operations: number;
  lastSyncLabel: string;
  freshness: "fresh" | "stale" | "error";
  coverageOk: boolean;
  coverageNote?: string;
  drillTo?: string; // route
}

const SOURCE_META: Record<SourceId, { label: string; icon: typeof Banknote; drillTo?: string }> = {
  "income-book": { label: "Книга доходів", icon: Banknote, drillTo: "/dashboard?tab=income-book" },
  integrations: { label: "Банківські інтеграції", icon: Database, drillTo: "/dashboard?tab=integrations" },
  manual: { label: "Ручне введення", icon: FileText },
  employees: { label: "Працівники", icon: Users, drillTo: "/dashboard?tab=employees" },
  documents: { label: "Документи", icon: FileText, drillTo: "/dashboard?tab=documents" },
};

// Deterministic pseudo-split: split total across sources with stable weights per source id.
// UI-only — реальна агрегація прийде з бекенду пізніше.
function buildBreakdown(report: Report, total: number): SourceBreakdown[] {
  const sources = (report.dataSources || []) as SourceId[];
  if (sources.length === 0 || total <= 0) return [];

  // Stable weights by source type so UI is consistent across renders
  const weights: Record<SourceId, number> = {
    integrations: 0.78,
    "income-book": 0.15,
    manual: 0.05,
    documents: 0.015,
    employees: 0.005,
  };

  const present = sources.filter((s, i, arr) => arr.indexOf(s) === i);
  const weightSum = present.reduce((s, id) => s + (weights[id] ?? 0.1), 0);

  // For "integrations" we render two sub-cards (Моно + Приват) for explainability.
  // ВАЖЛИВО: тут не показуємо «реальні» IBAN — це демо-дані, які користувач може сприйняти
  // як підтвердження підключеного рахунку (N6). Замість IBAN — нейтральний підпис рахунку.
  const items: SourceBreakdown[] = [];
  present.forEach((id) => {
    const w = (weights[id] ?? 0.1) / weightSum;
    const amount = Math.round(total * w);
    const meta = SOURCE_META[id];

    if (id === "integrations") {
      const monoAmount = Math.round(amount * 0.84);
      const privatAmount = amount - monoAmount;
      items.push({
        id: "mono",
        sourceType: "integrations",
        label: "Monobank",
        sublabel: "Корпоративний рахунок · демо",
        icon: Database,
        amount: monoAmount,
        share: 0,
        operations: Math.max(1, Math.round(monoAmount / 8000)),
        lastSyncLabel: "5 хв тому",
        freshness: "fresh",
        coverageOk: true,
        drillTo: "/dashboard?tab=integrations",
      });
      items.push({
        id: "privat",
        sourceType: "integrations",
        label: "ПриватБанк",
        sublabel: "Корпоративний рахунок · демо",
        icon: Database,
        amount: privatAmount,
        share: 0,
        operations: Math.max(1, Math.round(privatAmount / 9500)),
        lastSyncLabel: "2 год тому",
        freshness: "stale",
        coverageOk: true,
        drillTo: "/dashboard?tab=integrations",
      });
      return;
    }

    items.push({
      id,
      sourceType: id,
      label: meta.label,
      icon: meta.icon,
      amount,
      share: 0,
      operations: id === "income-book" ? 12 : id === "documents" ? 8 : id === "employees" ? 3 : 1,
      lastSyncLabel: id === "manual" ? "—" : "сьогодні",
      freshness: "fresh",
      coverageOk: true,
      drillTo: meta.drillTo,
    });
  });

  // Recompute shares from final amounts (so they actually sum to 100)
  const sumActual = items.reduce((s, i) => s + i.amount, 0) || 1;
  return items
    .map((i) => ({ ...i, share: Math.round((i.amount / sumActual) * 1000) / 10 }))
    .sort((a, b) => b.amount - a.amount);
}

function FreshnessDot({ state }: { state: SourceBreakdown["freshness"] }) {
  const cls =
    state === "fresh"
      ? "bg-emerald-500"
      : state === "stale"
        ? "bg-amber-500"
        : "bg-destructive";
  return <span className={cn("inline-block h-2 w-2 rounded-full", cls)} aria-hidden />;
}

interface ReportSourceTrailProps {
  report: Report;
  totalAmount: number;
  periodLabel: string;
  onChatPromptInsert?: (prompt: string) => void;
  onDrillDown?: (route: string) => void;
}

export function ReportSourceTrail({
  report,
  totalAmount,
  periodLabel,
  onChatPromptInsert,
  onDrillDown,
}: ReportSourceTrailProps) {
  const [expanded, setExpanded] = useState(false);

  const breakdown = useMemo(
    () => buildBreakdown(report, totalAmount),
    [report, totalAmount],
  );

  if (breakdown.length === 0) {
    return (
      <div className="rounded-lg border p-4 space-y-2">
        <h4 className="font-medium text-sm">Джерела даних</h4>
        <p className="text-xs text-muted-foreground">
          Джерела даних не підключено. Підключіть банк або заповніть Книгу доходів, щоб AI міг сформувати звіт.
        </p>
      </div>
    );
  }

  const sourcesCount = breakdown.length;
  const top = breakdown.slice(0, 3);
  const hasStale = breakdown.some((b) => b.freshness !== "fresh");
  const totalOps = breakdown.reduce((s, b) => s + b.operations, 0);

  const handleExplain = () => {
    onChatPromptInsert?.(
      `Поясни, як AI отримав суму ${formatCurrency(totalAmount)} у звіті за ${periodLabel}. Покажи розрахунок крок за кроком: які джерела, скільки операцій, які періоди.`,
    );
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="font-medium text-sm">Джерела даних звіту</h4>
          <p className="text-[11px] text-muted-foreground">
            {formatCurrency(totalAmount)} · {sourcesCount} {sourcesCount === 1 ? "джерело" : "джерел"} · {totalOps} операцій
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleExplain}
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          Пояснити цифру
        </Button>
      </div>

      {/* Waterfall: top contributors */}
      <div className="space-y-2">
        {top.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate font-medium">{b.label}</span>
                  <FreshnessDot state={b.freshness} />
                </div>
                <span className="text-muted-foreground whitespace-nowrap tabular-nums">
                  {formatCurrency(b.amount)} · {b.share}%
                </span>
              </div>
              <Progress value={b.share} className="h-1.5" />
            </div>
          );
        })}
      </div>

      {/* Coverage / freshness summary */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <Badge variant="outline" className="gap-1 font-normal">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Покриття: {periodLabel}
        </Badge>
        {hasStale ? (
          <Badge variant="outline" className="gap-1 font-normal text-amber-700 border-amber-300">
            <AlertTriangle className="h-3 w-3" />
            Є несвіжі джерела
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 font-normal text-emerald-700 border-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Дані актуальні
          </Badge>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-full justify-between text-xs"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span>{expanded ? "Згорнути деталі" : "Розкрити деталі джерел"}</span>
        {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </Button>

      {expanded && (
        <div className="space-y-2 pt-1">
          {breakdown.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="rounded-md border bg-muted/30 p-3 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{b.label}</div>
                      {b.sublabel && (
                        <div className="text-[11px] text-muted-foreground font-mono truncate">
                          {b.sublabel}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium tabular-nums">{formatCurrency(b.amount)}</div>
                    <div className="text-[11px] text-muted-foreground">{b.share}%</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span>{b.operations} оп.</span>
                  <span className="flex items-center gap-1">
                    <FreshnessDot state={b.freshness} />
                    sync: {b.lastSyncLabel}
                  </span>
                  {b.coverageNote && (
                    <span className="text-amber-700">⚠ {b.coverageNote}</span>
                  )}
                </div>
                {b.drillTo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] -ml-2"
                    onClick={() => onDrillDown?.(b.drillTo!)}
                  >
                    Перейти до джерела
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
