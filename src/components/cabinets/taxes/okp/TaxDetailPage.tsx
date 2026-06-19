/**
 * TaxDetailPage — повна сторінка податку у стилі ОКП ДПС (Інтегрована
 * картка платника). Відкривається замість бокового sheet, коли користувач
 * клікнув по картці податку у переліку.
 *
 * Розділи (зверху-вниз): Header → Сальдо ОКП (3 бакети) → Банери
 * (переплата / мораторій) → KPI strip → Розстрочення (опц.) → Реквізити
 * → Хронологія операцій → Декларації → ППР → Платежі → Контекст бази →
 * Sticky bottom-bar (Сплатити / Декларація / Книга / Календар / Акт звірки).
 */
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import {
  ArrowLeft,
  Download,
  Calendar as CalendarIcon,
  Wallet,
  FileText,
  BookOpen,
  Calendar,
  FileSearch,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  taxTypeConfig,
  type TaxPayment,
  type TaxType,
} from "@/config/paymentsConfig";
import {
  getDpsAuthorityForCabinet,
  isMoratoriumActive,
  getPprsForCabinet,
  buildDemoSettlements,
  pprFormLabel,
  pprStatusLabel,
  getDeferralPlan,
  type Ppr,
} from "@/config/taxOkpConfig";
import type { Cabinet } from "@/types/cabinet";
import { taxFormula, taxFullName, humanizeDeadline } from "../taxFormulas";
import { computeTypeSummary } from "../lib/computeTypeSummary";
import {
  buildOkpOperations,
  okpKindLabel,
  okpDocumentTypeLabel,
  okpBucketLabel,
  type OkpBucket,
  type OkpKind,
  type OkpOperation,
} from "../lib/okpLedgerEngine";
import {
  computeOkpBalance,
  balanceLabel,
} from "../lib/okpBalance";
import { calcTaxPenalty } from "@/lib/taxPenaltyCalculator";
import { effectiveTaxStatus, daysToDeadline } from "@/lib/taxStatus";
import { RequisitesBlock } from "./RequisitesBlock";

interface Props {
  cabinet: Cabinet;
  taxType: TaxType;
  year: number;
  payments: TaxPayment[]; // усі нарахування цього типу за цей рік
  asOf: Date;
  onYearChange: (y: number) => void;
  onAsOfChange: (d: Date) => void;
  onBack: () => void;
  onOpenPayment: (p: TaxPayment) => void;
  onOpenDeclaration?: (taxType: TaxType, samples: TaxPayment[]) => void;
  onOpenIncomeBook?: (period?: { year: number; quarter?: number }) => void;
  onOpenCalendar?: () => void;
  availableYears: number[];
}

const fmt = (n: number) => `${Math.round(n).toLocaleString("uk-UA")} ₴`;
const fmtSigned = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n)).toLocaleString("uk-UA")} ₴`;

export function TaxDetailPage({
  cabinet,
  taxType,
  year,
  payments,
  asOf,
  onYearChange,
  onAsOfChange,
  onBack,
  onOpenPayment,
  onOpenDeclaration,
  onOpenIncomeBook,
  onOpenCalendar,
  availableYears,
}: Props) {
  const { toast } = useToast();
  const cfg = taxTypeConfig[taxType];
  const fullName = taxFullName[taxType] ?? cfg.label;
  const formula = taxFormula[taxType] ?? cfg.description;
  const dps = getDpsAuthorityForCabinet(cabinet.id);
  const moratorium = isMoratoriumActive(asOf);

  // ======================== Дані ОКП ========================
  const settlements = useMemo(() => buildDemoSettlements(payments), [payments]);
  const pprs = useMemo(() => getPprsForCabinet(cabinet.id, taxType), [cabinet.id, taxType]);
  const deferral = useMemo(() => getDeferralPlan(cabinet.id, taxType), [cabinet.id, taxType]);

  const ops = useMemo(
    () =>
      buildOkpOperations({
        taxType,
        year,
        payments,
        settlements,
        pprs,
        moratoriumActive: !!moratorium,
        asOf,
      }),
    [taxType, year, payments, settlements, pprs, moratorium, asOf],
  );

  const balance = useMemo(() => computeOkpBalance(ops, asOf), [ops, asOf]);
  const summary = useMemo(() => computeTypeSummary(payments, taxType), [payments, taxType]);

  // ======================== Filters для ledger ========================
  const [kindFilter, setKindFilter] = useState<OkpKind | "all">("all");
  const [bucketFilter, setBucketFilter] = useState<OkpBucket | "all">("all");
  const [search, setSearch] = useState("");
  const filteredOps = useMemo(() => {
    return ops.filter((op) => {
      if (kindFilter !== "all" && op.kind !== kindFilter) return false;
      if (bucketFilter !== "all" && op.bucket !== bucketFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!op.documentNumber.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [ops, kindFilter, bucketFilter, search]);

  // ======================== Sheets ========================
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  // ======================== Render ========================
  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="space-y-3 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2 gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            До переліку податків
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              toast({
                title: "Витяг з ОКП",
                description: "ДЕМО — генерація PDF недоступна у демо-режимі.",
              })
            }
          >
            <Download className="h-3.5 w-3.5" />
            Експорт витягу OKP (PDF)
          </Button>
        </div>

        <div>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-semibold leading-tight">
                {fullName}
              </h1>
              <div className="text-xs text-muted-foreground mt-1">
                {formula}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(year)} onValueChange={(v) => onYearChange(parseInt(v))}>
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y} рік
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Станом на {format(asOf, "dd.MM.yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarUI
                    mode="single"
                    selected={asOf}
                    onSelect={(d) => d && onAsOfChange(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              Платник: <span className="text-foreground">{cabinet.name}</span>
              {cabinet.taxId && <span className="font-mono">· {cabinet.taxId}</span>}
            </span>
            <span className="text-border">·</span>
            <span>
              Орган ДПС: <span className="text-foreground">{dps.name}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Сальдо ОКП — 3 окремих картки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <BalanceCard title="Основний платіж" bucket={balance.main} accent="primary" />
        <BalanceCard
          title="Штрафні санкції"
          bucket={balance.fine}
          accent="warning"
          subtitle={pprs.length > 0 ? `${pprs.length} ППР` : undefined}
        />
        <BalanceCard
          title="Пеня"
          bucket={balance.penalty}
          accent="destructive"
          subtitle={moratorium ? "Мораторій діє" : undefined}
          extra={
            <PenaltyCalculatorPopover
              payments={payments}
              moratoriumActive={!!moratorium}
            />
          }
        />
      </div>

      {/* Банери */}
      {balance.main.net < -0.5 && (
        <div className="mb-3 rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 flex items-center justify-between gap-2">
          <div className="text-sm">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              Переплата {fmt(Math.abs(balance.main.net))}
            </span>
            <span className="text-muted-foreground"> · можна повернути або зарахувати у рахунок іншого податку</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setRefundOpen(true)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Заява J1302002
          </Button>
        </div>
      )}
      {moratorium && (
        <div className="mb-3 rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-xs flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-amber-800 dark:text-amber-300">
              Мораторій на пеню: {moratorium.reason}
            </div>
            <div className="text-muted-foreground mt-0.5">
              Період: {format(parseISO(moratorium.from), "dd MMM yyyy", { locale: uk })}
              {moratorium.until && ` — ${format(parseISO(moratorium.until), "dd MMM yyyy", { locale: uk })}`}
            </div>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <KpiTile label="Нараховано" value={fmt(summary.accrued)} />
        <KpiTile label="Сплачено" value={fmt(summary.paid)} tone="emerald" />
        <KpiTile
          label="Залишок"
          value={fmt(summary.remaining)}
          tone={summary.remaining > 0 ? "default" : "muted"}
        />
        <KpiTile
          label="Прострочено"
          value={String(summary.overdueCount)}
          tone={summary.overdueCount > 0 ? "destructive" : "muted"}
        />
        <KpiTile
          label="Санкції"
          value={summary.sanctions > 0 ? fmt(summary.sanctions) : "—"}
          tone={summary.sanctions > 0 ? "destructive" : "muted"}
        />
      </div>

      {/* Розстрочення/відстрочення */}
      {deferral && (
        <Card className="mb-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Розстрочення/відстрочення</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Затверджено: {format(parseISO(deferral.approvedAt), "dd MMM yyyy", { locale: uk })}</span>
              <span>Залишок: <span className="font-semibold text-foreground tabular-nums">{fmt(deferral.remaining)}</span></span>
            </div>
            <ul className="space-y-1">
              {deferral.schedule.map((s, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {format(parseISO(s.dueDate), "dd MMM yyyy", { locale: uk })}
                  </span>
                  <span className={cn("tabular-nums", s.paid && "text-emerald-600")}>
                    {fmt(s.amount)} {s.paid ? "✓" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Реквізити */}
      <div className="mb-4">
        <RequisitesBlock taxType={taxType} asOf={asOf} />
      </div>

      {/* Хронологія операцій по особовому рахунку */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm flex items-center gap-2">
              ОКП — операції за рахунком
              <Badge variant="outline" className="text-[10px] font-normal">
                {filteredOps.length} з {ops.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as OkpKind | "all")}>
                <SelectTrigger className="h-7 text-xs w-36">
                  <SelectValue placeholder="Тип операції" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі типи</SelectItem>
                  {(Object.keys(okpKindLabel) as OkpKind[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {okpKindLabel[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={bucketFilter} onValueChange={(v) => setBucketFilter(v as OkpBucket | "all")}>
                <SelectTrigger className="h-7 text-xs w-32">
                  <SelectValue placeholder="Бакет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі бакети</SelectItem>
                  <SelectItem value="main">{okpBucketLabel.main}</SelectItem>
                  <SelectItem value="fine">{okpBucketLabel.fine}</SelectItem>
                  <SelectItem value="penalty">{okpBucketLabel.penalty}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Пошук № документа"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 text-xs w-44"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <OkpLedgerTable
            ops={filteredOps}
            payments={payments}
            onOpenPayment={onOpenPayment}
          />
        </CardContent>
      </Card>

      {/* Декларації */}
      <DeclarationsCard payments={payments} onOpenDeclaration={onOpenDeclaration} taxType={taxType} />

      {/* ППР */}
      {pprs.length > 0 && <PprCard pprs={pprs} />}

      {/* Платежі / settlements */}
      <SettlementsCard
        settlements={settlements}
        payments={payments}
        onOpenPayment={onOpenPayment}
      />

      {/* Контекст бази */}
      <ContextNoteCard taxType={taxType} payments={payments} year={year} />

      {/* Sticky bottom-bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-0 md:w-[calc(100%-var(--sidebar-width,0px))] z-30 bg-background/95 backdrop-blur border-t border-border px-4 py-2 flex items-center gap-2 flex-wrap">
        {summary.nextDue && (
          <Button
            size="sm"
            variant="default"
            className="gap-1"
            onClick={() => onOpenPayment(summary.nextDue!.payment)}
          >
            <Wallet className="h-3.5 w-3.5" />
            Сплатити найближче
          </Button>
        )}
        {onOpenDeclaration && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => onOpenDeclaration(taxType, payments)}
          >
            <FileText className="h-3.5 w-3.5" />
            Декларація
          </Button>
        )}
        {(taxType === "ep" || taxType === "military-fop") && onOpenIncomeBook && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1"
            onClick={() => onOpenIncomeBook({ year })}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Книга доходів
          </Button>
        )}
        {onOpenCalendar && (
          <Button size="sm" variant="ghost" className="gap-1" onClick={onOpenCalendar}>
            <Calendar className="h-3.5 w-3.5" />
            Календар
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="gap-1 ml-auto"
          onClick={() => setReconcileOpen(true)}
        >
          <FileSearch className="h-3.5 w-3.5" />
          Сформувати акт звірки
        </Button>
      </div>

      {/* Reconciliation sheet */}
      <ReconciliationSheet
        open={reconcileOpen}
        onOpenChange={setReconcileOpen}
        taxType={taxType}
        year={year}
      />

      {/* Refund sheet */}
      <OverpaymentRefundSheet
        open={refundOpen}
        onOpenChange={setRefundOpen}
        amount={Math.abs(balance.main.net)}
        taxType={taxType}
      />
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function BalanceCard({
  title,
  bucket,
  accent,
  subtitle,
  extra,
}: {
  title: string;
  bucket: { dt: number; kt: number; net: number };
  accent: "primary" | "warning" | "destructive";
  subtitle?: string;
  extra?: React.ReactNode;
}) {
  const lbl = balanceLabel(bucket.net);
  const toneClass =
    lbl.tone === "debt"
      ? "text-destructive"
      : lbl.tone === "credit"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-muted-foreground";
  const accentBorder =
    accent === "primary"
      ? "border-primary/30"
      : accent === "warning"
        ? "border-amber-300/60 dark:border-amber-900/60"
        : "border-rose-300/60 dark:border-rose-900/60";
  return (
    <Card className={cn("border", accentBorder)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</div>
          {subtitle && <div className="text-[10px] text-muted-foreground">{subtitle}</div>}
        </div>
        <div className={cn("text-xl font-bold tabular-nums", toneClass)}>
          {Math.abs(bucket.net) < 0.5 ? "0 ₴" : fmtSigned(-bucket.net)}
        </div>
        <div className={cn("text-[11px] mt-0.5", toneClass)}>{lbl.text}</div>
        <div className="grid grid-cols-2 gap-1 mt-2 text-[11px] text-muted-foreground">
          <div>Дт (нарах.): <span className="text-foreground tabular-nums">{fmt(bucket.dt)}</span></div>
          <div>Кт (сплач.): <span className="text-foreground tabular-nums">{fmt(bucket.kt)}</span></div>
        </div>
        {extra && <div className="mt-2 pt-2 border-t border-border/40">{extra}</div>}
      </CardContent>
    </Card>
  );
}

function KpiTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "emerald" | "muted" | "destructive";
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/30 p-2">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">{label}</div>
      <div
        className={cn(
          "text-sm font-semibold tabular-nums mt-1.5",
          tone === "emerald" && "text-emerald-600 dark:text-emerald-400",
          tone === "muted" && "text-muted-foreground",
          tone === "destructive" && "text-destructive",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function OkpLedgerTable({
  ops,
  payments,
  onOpenPayment,
}: {
  ops: OkpOperation[];
  payments: TaxPayment[];
  onOpenPayment: (p: TaxPayment) => void;
}) {
  if (ops.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-8">
        За обраними фільтрами операцій немає.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="text-left font-medium px-3 py-2">Дата</th>
            <th className="text-left font-medium px-3 py-2">Документ</th>
            <th className="text-left font-medium px-3 py-2">Тип операції</th>
            <th className="text-left font-medium px-3 py-2">Бюджет. період</th>
            <th className="text-left font-medium px-3 py-2">Бакет</th>
            <th className="text-right font-medium px-3 py-2">Сума</th>
            <th className="text-right font-medium px-3 py-2">Сальдо після</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {ops.map((op) => {
            const linked =
              op.documentType === "payment" || op.kind === "accrual"
                ? payments.find((p) => p.id === op.documentRef)
                : null;
            const clickable = !!linked;
            return (
              <tr
                key={op.id}
                className={cn("hover:bg-muted/30", clickable && "cursor-pointer")}
                onClick={() => linked && onOpenPayment(linked)}
              >
                <td className="px-3 py-1.5 tabular-nums whitespace-nowrap">
                  {format(parseISO(op.date), "dd.MM.yyyy")}
                </td>
                <td className="px-3 py-1.5">
                  <div className="font-medium truncate max-w-[220px]">{op.documentNumber}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {okpDocumentTypeLabel[op.documentType]}
                  </div>
                </td>
                <td className="px-3 py-1.5">{okpKindLabel[op.kind]}</td>
                <td className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
                  {op.budgetPeriod}
                </td>
                <td className="px-3 py-1.5">
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {okpBucketLabel[op.bucket]}
                  </Badge>
                </td>
                <td
                  className={cn(
                    "px-3 py-1.5 text-right tabular-nums font-medium",
                    op.amount > 0 ? "text-foreground" : "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {fmtSigned(op.amount)}
                </td>
                <td
                  className={cn(
                    "px-3 py-1.5 text-right tabular-nums",
                    op.runningBalance > 0
                      ? "text-foreground"
                      : op.runningBalance < 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground",
                  )}
                >
                  {fmtSigned(-op.runningBalance) /* +Дт=недоїмка показуємо з + */ }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DeclarationsCard({
  payments,
  taxType,
  onOpenDeclaration,
}: {
  payments: TaxPayment[];
  taxType: TaxType;
  onOpenDeclaration?: (t: TaxType, samples: TaxPayment[]) => void;
}) {
  // Групуємо платежі за relatedReportId — кожна група = декларація
  const decls = useMemo(() => {
    const map = new Map<string, TaxPayment[]>();
    for (const p of payments) {
      const key = p.relatedReportId ?? `synth-${p.period}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).map(([id, items]) => ({ id, items }));
  }, [payments]);

  if (decls.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Декларації за податком</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-3 py-2">Тип</th>
                <th className="text-left font-medium px-3 py-2">Період</th>
                <th className="text-left font-medium px-3 py-2">Подано</th>
                <th className="text-left font-medium px-3 py-2">Квит. №1</th>
                <th className="text-left font-medium px-3 py-2">Квит. №2</th>
                <th className="text-left font-medium px-3 py-2">Статус</th>
                <th className="text-right font-medium px-3 py-2">Самонарах.</th>
                <th className="text-left font-medium px-3 py-2">Гран. термін</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {decls.map((d) => {
                const first = d.items[0];
                const total = d.items.reduce((s, p) => s + p.amountToPay, 0);
                // Демо-метадані квитанцій (детермінована синтетика з id)
                const submittedAt = first.createdAt ?? first.deadline;
                const r1No = `Q1-${first.id.slice(-6)}`;
                const r2No = `Q2-${first.id.slice(-6)}`;
                return (
                  <tr
                    key={d.id}
                    className={cn("hover:bg-muted/30", onOpenDeclaration && "cursor-pointer")}
                    onClick={() => onOpenDeclaration?.(taxType, d.items)}
                  >
                    <td className="px-3 py-1.5">Звітна</td>
                    <td className="px-3 py-1.5">{first.period}</td>
                    <td className="px-3 py-1.5 tabular-nums whitespace-nowrap">
                      {format(parseISO(submittedAt), "dd.MM.yyyy")}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-[11px]">{r1No}</td>
                    <td className="px-3 py-1.5 font-mono text-[11px]">{r2No}</td>
                    <td className="px-3 py-1.5">
                      <Badge
                        variant="status"
                        className="bg-emerald-50/60 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/60"
                      >
                        Прийнято
                      </Badge>
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums font-medium">{fmt(total)}</td>
                    <td className="px-3 py-1.5 tabular-nums whitespace-nowrap">
                      {format(parseISO(first.deadline), "dd.MM.yyyy")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PprCard({ pprs }: { pprs: Ppr[] }) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          Податкові повідомлення-рішення (ППР)
          <Badge variant="outline" className="text-[10px] font-normal">{pprs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-3 py-2">№</th>
                <th className="text-left font-medium px-3 py-2">Дата</th>
                <th className="text-left font-medium px-3 py-2">Форма</th>
                <th className="text-right font-medium px-3 py-2">Сума</th>
                <th className="text-left font-medium px-3 py-2">Статус</th>
                <th className="text-left font-medium px-3 py-2">Гран. термін</th>
                <th className="text-left font-medium px-3 py-2">Акт перевірки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {pprs.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-3 py-1.5 font-mono text-[11px]">{p.number}</td>
                  <td className="px-3 py-1.5 tabular-nums whitespace-nowrap">
                    {format(parseISO(p.date), "dd.MM.yyyy")}
                  </td>
                  <td className="px-3 py-1.5">{pprFormLabel[p.form]}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums font-medium">{fmt(p.amount)}</td>
                  <td className="px-3 py-1.5">
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {pprStatusLabel[p.status]}
                    </Badge>
                  </td>
                  <td className="px-3 py-1.5 tabular-nums whitespace-nowrap">
                    {format(parseISO(p.dueDate), "dd.MM.yyyy")}
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {p.auditId ? <span className="font-mono text-[11px]">{p.auditId}</span> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function SettlementsCard({
  settlements,
  payments,
  onOpenPayment,
}: {
  settlements: ReturnType<typeof buildDemoSettlements>;
  payments: TaxPayment[];
  onOpenPayment: (p: TaxPayment) => void;
}) {
  if (settlements.length === 0) return null;
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Платежі (платіжні інструкції)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-3 py-2">Дата платежу</th>
                <th className="text-left font-medium px-3 py-2">Зараховано</th>
                <th className="text-left font-medium px-3 py-2">№ платіжки</th>
                <th className="text-left font-medium px-3 py-2">Банк</th>
                <th className="text-left font-medium px-3 py-2">Призначення</th>
                <th className="text-left font-medium px-3 py-2">Код</th>
                <th className="text-right font-medium px-3 py-2">Сума</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {settlements.map((s) => {
                const linked = payments.find((p) => p.id === s.paymentId);
                return (
                  <tr
                    key={s.id}
                    className={cn("hover:bg-muted/30", linked && "cursor-pointer")}
                    onClick={() => linked && onOpenPayment(linked)}
                  >
                    <td className="px-3 py-1.5 tabular-nums whitespace-nowrap">
                      {format(parseISO(s.paidAt), "dd.MM.yyyy")}
                    </td>
                    <td className="px-3 py-1.5 tabular-nums whitespace-nowrap text-muted-foreground">
                      {format(parseISO(s.creditedAt), "dd.MM.yyyy")}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-[11px]">{s.paymentInstructionNo}</td>
                    <td className="px-3 py-1.5">{s.bankName}</td>
                    <td className="px-3 py-1.5 truncate max-w-[260px]">{s.purpose}</td>
                    <td className="px-3 py-1.5 font-mono text-[11px]">{s.purposeCode || "—"}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                      {fmt(s.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ContextNoteCard({
  taxType,
  payments,
  year,
}: {
  taxType: TaxType;
  payments: TaxPayment[];
  year: number;
}) {
  if (taxType === "ep") {
    const baseEp = payments.reduce((s, p) => s + (p.calculatedFromIncome ?? 0), 0);
    if (baseEp === 0) return null;
    return (
      <Card className="mb-4">
        <CardContent className="p-3 text-xs flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <div className="text-muted-foreground">
              База ЄП за {year} рік:{" "}
              <span className="font-semibold text-foreground tabular-nums">{fmt(baseEp)}</span>
              {" → "}
              <span className="text-foreground tabular-nums">{fmt(baseEp * 0.05)}</span> ЄП (5%)
            </div>
            <div className="text-muted-foreground mt-1">
              Для 1-2 групи — авансові внески до 20-го числа щомісяця, незалежно від обороту.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (taxType === "military-fop") {
    return (
      <Card className="mb-4">
        <CardContent className="p-3 text-xs flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-muted-foreground">
            Військовий збір ФОП-єдинника обліковується на окремому КБК <span className="font-mono">11011001</span>{" "}
            (з 01.01.2025), не змішується з ВЗ із зарплати найманих.
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
}

// ============================================================
// Penalty calculator (popover)
// ============================================================

function PenaltyCalculatorPopover({
  payments,
  moratoriumActive,
}: {
  payments: TaxPayment[];
  moratoriumActive: boolean;
}) {
  const [date, setDate] = useState<Date>(new Date());
  // Берем перший прострочений нарах. для калькулятора (демо)
  const overdue = useMemo(
    () => payments.find((p) => effectiveTaxStatus(p) === "overdue"),
    [payments],
  );
  if (!overdue) return null;
  const days = Math.max(
    0,
    Math.floor((date.getTime() - new Date(overdue.deadline).getTime()) / (1000 * 60 * 60 * 24)),
  );
  const calc = moratoriumActive ? null : calcTaxPenalty(overdue.amountToPay, days);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[11px] gap-1 w-full justify-start text-muted-foreground hover:text-foreground">
          <Calculator className="h-3 w-3" />
          Розрахунок на дату
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="text-xs font-semibold mb-2">Розрахунок штрафу + пені</div>
        <div className="text-[11px] text-muted-foreground mb-2">
          Базовий платіж: {fmt(overdue.amountToPay)} (дедлайн{" "}
          {format(parseISO(overdue.deadline), "dd MMM", { locale: uk })})
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 w-full justify-start text-xs gap-1.5 mb-2">
              <CalendarIcon className="h-3.5 w-3.5" />
              Дата сплати: {format(date, "dd.MM.yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarUI
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {moratoriumActive ? (
          <div className="text-[11px] text-amber-700 dark:text-amber-400">
            Діє мораторій — пеня не нараховується.
          </div>
        ) : calc ? (
          <div className="space-y-1 text-[11px]">
            <Row k="Тіло боргу" v={fmt(overdue.amountToPay)} />
            <Row k={`Штраф (${(calc.finePercent * 100).toFixed(0)}%)`} v={`+${fmt(calc.fine)}`} />
            <Row k={`Пеня · ${calc.daysOverdue} дн.`} v={`+${fmt(calc.penalty)}`} />
            <div className="border-t border-border/40 pt-1 mt-1 flex justify-between font-semibold">
              <span>Разом</span>
              <span className="tabular-nums">{fmt(overdue.amountToPay + calc.total)}</span>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );
}

// ============================================================
// Reconciliation sheet
// ============================================================

function ReconciliationSheet({
  open,
  onOpenChange,
  taxType,
  year,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  taxType: TaxType;
  year: number;
}) {
  const { toast } = useToast();
  const [period, setPeriod] = useState<"year" | "quarter" | "month" | "custom">("year");
  const [bucket, setBucket] = useState<OkpBucket | "all">("all");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Сформувати акт звірки</SheetTitle>
          <SheetDescription>
            Акт з ДПС за {year} рік з {taxTypeConfig[taxType].label}.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label className="text-xs">Період</Label>
            <RadioGroup value={period} onValueChange={(v) => setPeriod(v as typeof period)} className="mt-1.5 space-y-1">
              {[
                ["year", "Поточний рік"],
                ["quarter", "Останній квартал"],
                ["month", "Останній місяць"],
                ["custom", "Довільний період"],
              ].map(([v, l]) => (
                <div key={v} className="flex items-center gap-2 text-sm">
                  <RadioGroupItem id={`p-${v}`} value={v} />
                  <Label htmlFor={`p-${v}`} className="cursor-pointer font-normal">{l}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label className="text-xs">Бакет</Label>
            <Select value={bucket} onValueChange={(v) => setBucket(v as OkpBucket | "all")}>
              <SelectTrigger className="mt-1.5 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі бакети</SelectItem>
                <SelectItem value="main">Основний платіж</SelectItem>
                <SelectItem value="fine">Штрафи</SelectItem>
                <SelectItem value="penalty">Пеня</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-2 text-[11px] text-amber-800 dark:text-amber-300">
            ДЕМО — не має юридичної сили. Реальна звірка з ДПС вимагає КЕП-підпису та надсилання форми J/F1300306.
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button
            size="sm"
            onClick={() => {
              toast({
                title: "Акт звірки сформовано (демо)",
                description: `Період: ${period}, бакет: ${bucket}. PDF недоступний у демо-режимі.`,
              });
              onOpenChange(false);
            }}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Завантажити PDF
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================
// Overpayment refund sheet (J/F1302002)
// ============================================================

function OverpaymentRefundSheet({
  open,
  onOpenChange,
  amount,
  taxType,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  amount: number;
  taxType: TaxType;
}) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"refund" | "transfer">("refund");
  const [iban, setIban] = useState("");
  const [transferTo, setTransferTo] = useState<TaxType>("esv");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Заява про повернення/зарахування</SheetTitle>
          <SheetDescription>
            Форма J/F1302002. Сума переплати: <span className="font-semibold">{fmt(amount)}</span>
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <div className="flex items-center gap-2 text-sm">
              <RadioGroupItem id="m-refund" value="refund" />
              <Label htmlFor="m-refund" className="cursor-pointer font-normal">Повернути на IBAN заявника</Label>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RadioGroupItem id="m-transfer" value="transfer" />
              <Label htmlFor="m-transfer" className="cursor-pointer font-normal">Зарахувати у рахунок іншого податку</Label>
            </div>
          </RadioGroup>

          {mode === "refund" ? (
            <div>
              <Label className="text-xs" htmlFor="iban">IBAN заявника</Label>
              <Input
                id="iban"
                placeholder="UA00 0000 0000 0000 0000 0000 0000 0"
                className="mt-1 font-mono text-xs"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <Label className="text-xs">Податок-отримувач</Label>
              <Select value={transferTo} onValueChange={(v) => setTransferTo(v as TaxType)}>
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(taxTypeConfig) as TaxType[])
                    .filter((t) => t !== taxType && t !== "other")
                    .map((t) => (
                      <SelectItem key={t} value={t}>{taxTypeConfig[t].label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-2 text-[11px] text-amber-800 dark:text-amber-300">
            ДЕМО — не має юридичної сили. Реальне подання — з КЕП-підписом через ДПС.
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button
            size="sm"
            onClick={() => {
              toast({
                title: "Заяву збережено (демо)",
                description: mode === "refund" ? `Повернення на ${iban || "—"}` : `Зарахування у ${taxTypeConfig[transferTo].label}`,
              });
              onOpenChange(false);
            }}
          >
            Подати
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Гасимо unused warnings — utils icons
void CheckCircle2; void Clock;
