import { useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  FileText,
  Copy,
  Gift,
  Globe,
  Shield,
  Receipt,
  TrendingDown,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { useSortState } from "@/hooks/use-sort-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { KPIStrip, type KPIStripItem } from "@/components/ui/KPIStrip";
import {
  REPORTING_YEARS,
  type DeclarationCase,
} from "@/config/demoCabinets/declarationCases";
import { getDeclarationCasesWithAutoDrafts } from "@/lib/declarations/declarationAutoCreate";
import {
  getAllDeclarationsForCabinet,
  computeDeclarationsKpis,
  KIND_LABELS,
  KIND_SHORT,
  type DeclarationKind,
  type UnifiedDeclaration,
  type UnifiedStatus,
} from "@/lib/declarations/unifiedDeclarations";
import { DeclarationsAttentionInbox } from "./DeclarationsAttentionInbox";
import { DeclarationCard } from "./shared/DeclarationCard";

type SortKey = "type" | "deadline" | "status" | "amount";
type QuickFilter = "needs_attention" | "overdue" | "to_pay" | "refund" | "submitted" | null;

const fmt = (n: number) => `${Math.abs(n).toLocaleString("uk-UA")} ₴`;
const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const STATUS_TONE: Record<UnifiedStatus, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  in_review: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  ready: "bg-primary/10 text-primary border-primary/30",
  scheduled: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  submitted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
};

const STATUS_ICON: Record<UnifiedStatus, React.ReactNode> = {
  draft: <FileText className="size-3.5" />,
  in_review: <Clock className="size-3.5" />,
  ready: <ShieldCheck className="size-3.5" />,
  scheduled: <CalendarDays className="size-3.5" />,
  submitted: <Send className="size-3.5" />,
  accepted: <CheckCircle2 className="size-3.5" />,
};

const KIND_ICON: Record<DeclarationKind, React.ReactNode> = {
  property_income: <FileText className="size-3.5" />,
  amendment: <Copy className="size-3.5" />,
  tax_credit: <Gift className="size-3.5" />,
  kik: <Globe className="size-3.5" />,
  vz_monthly: <Shield className="size-3.5" />,
};

const KIND_TONE: Record<DeclarationKind, string> = {
  property_income: "bg-primary/10 text-primary border-primary/30",
  amendment: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
  tax_credit: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  kik: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  vz_monthly: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

const URGENCY_TEXT: Record<UnifiedDeclaration["urgency"], string> = {
  overdue: "text-destructive font-medium",
  urgent: "text-red-600 dark:text-red-400 font-medium",
  warning: "text-amber-600 dark:text-amber-400",
  normal: "text-muted-foreground",
};

const STATUS_LABEL_MAP: Record<UnifiedStatus, string> = {
  draft: "Чернетка",
  in_review: "На перевірці",
  ready: "Готова",
  scheduled: "Запланована",
  submitted: "Подано",
  accepted: "Прийнято",
};

interface DeclarationCasesListPageProps {
  cabinetId: string;
  onOpenDeclaration: (decl: UnifiedDeclaration) => void;
  /** Backward-compat: пряма навігація на DeclarationCase. */
  onOpenCase: (caseId: string) => void;
}

export function DeclarationCasesListPage({
  cabinetId,
  onOpenDeclaration,
  onOpenCase,
}: DeclarationCasesListPageProps) {
  const isMobile = useIsMobile();
  const allCases = useMemo(
    () => getDeclarationCasesWithAutoDrafts(cabinetId, REPORTING_YEARS),
    [cabinetId],
  );

  const allDeclarations = useMemo(
    () => getAllDeclarationsForCabinet(cabinetId),
    [cabinetId],
  );

  const kpis = useMemo(
    () => computeDeclarationsKpis(allDeclarations),
    [allDeclarations],
  );

  const allKinds = useMemo(
    () => Array.from(new Set(allDeclarations.map((d) => d.kind))) as DeclarationKind[],
    [allDeclarations],
  );
  const allYears = useMemo(
    () =>
      Array.from(new Set(allDeclarations.map((d) => d.reportingYear))).sort(
        (a, b) => b - a,
      ),
    [allDeclarations],
  );
  const allStatuses = useMemo(
    () => Array.from(new Set(allDeclarations.map((d) => d.status))) as UnifiedStatus[],
    [allDeclarations],
  );

  // Filters
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | DeclarationKind>("all");
  const [yearFilter, setYearFilter] = useState<"all" | number>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UnifiedStatus>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);

  // Sort
  const { sort, handleSort } = useSortState<SortKey>("deadline", "asc");

  // Quick filter counts
  const counts = useMemo(() => {
    const needs_attention = allDeclarations.filter(
      (d) => d.status === "in_review" || d.urgency === "urgent" || d.urgency === "overdue",
    ).length;
    const overdue = allDeclarations.filter((d) => d.urgency === "overdue").length;
    const to_pay = allDeclarations.filter(
      (d) =>
        d.taxAmount > 0 && d.status !== "submitted" && d.status !== "accepted",
    ).length;
    const refund = allDeclarations.filter(
      (d) => d.taxAmount < 0 && d.status !== "accepted",
    ).length;
    const submitted = allDeclarations.filter(
      (d) => d.status === "submitted" || d.status === "accepted",
    ).length;
    return { needs_attention, overdue, to_pay, refund, submitted };
  }, [allDeclarations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allDeclarations.filter((d) => {
      if (kindFilter !== "all" && d.kind !== kindFilter) return false;
      if (yearFilter !== "all" && d.reportingYear !== yearFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (quickFilter === "needs_attention" && !(d.status === "in_review" || d.urgency === "urgent" || d.urgency === "overdue")) return false;
      if (quickFilter === "overdue" && d.urgency !== "overdue") return false;
      if (quickFilter === "to_pay" && !(d.taxAmount > 0 && d.status !== "submitted" && d.status !== "accepted")) return false;
      if (quickFilter === "refund" && !(d.taxAmount < 0 && d.status !== "accepted")) return false;
      if (quickFilter === "submitted" && !(d.status === "submitted" || d.status === "accepted")) return false;
      if (q) {
        const text = `${d.title} ${d.period} ${KIND_LABELS[d.kind]} ${d.statusLabel}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sort.key) {
        case "type":
          cmp = KIND_LABELS[a.kind].localeCompare(KIND_LABELS[b.kind], "uk");
          break;
        case "deadline":
          cmp = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case "status":
          cmp = a.statusLabel.localeCompare(b.statusLabel, "uk");
          break;
        case "amount": {
          const aEmpty = a.taxAmount === 0;
          const bEmpty = b.taxAmount === 0;
          if (aEmpty && !bEmpty) return 1;
          if (!aEmpty && bEmpty) return -1;
          cmp = Math.abs(a.taxAmount) - Math.abs(b.taxAmount);
          break;
        }
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [allDeclarations, search, kindFilter, yearFilter, statusFilter, quickFilter, sort]);

  const hasActiveFilters =
    !!search.trim() ||
    kindFilter !== "all" ||
    yearFilter !== "all" ||
    statusFilter !== "all" ||
    quickFilter !== null;

  const resetFilters = () => {
    setSearch("");
    setKindFilter("all");
    setYearFilter("all");
    setStatusFilter("all");
    setQuickFilter(null);
  };

  const previousYearWithData = useMemo(() => {
    if (yearFilter === "all") return null;
    const earlier = allYears.filter((y) => y !== yearFilter);
    return earlier[0] ?? null;
  }, [allYears, yearFilter]);

  const kpiItems: KPIStripItem[] = [
    {
      id: "count",
      title: `Декларацій ${kpis.currentYear}`,
      value: kpis.countCurrentYear,
      icon: FileText,
    },
    {
      id: "to-pay",
      title: "До сплати",
      value: kpis.totalToPay > 0 ? fmt(kpis.totalToPay) : "—",
      icon: Receipt,
      variant: kpis.totalToPay > 0 ? "warning" : "default",
    },
    {
      id: "refund",
      title: "До повернення",
      value: kpis.totalRefund > 0 ? fmt(kpis.totalRefund) : "—",
      icon: TrendingDown,
      variant: kpis.totalRefund > 0 ? "success" : "default",
    },
    {
      id: "in-review",
      title: "На перевірці",
      value: kpis.inReview,
      icon: Clock,
      variant: kpis.inReview > 0 ? "warning" : "default",
    },
    {
      id: "submitted",
      title: "Подано до ДПС",
      value: `${kpis.submittedFraction.submitted} з ${kpis.submittedFraction.total}`,
      icon: Send,
      variant: "success",
    },
  ];

  const QuickChip = ({
    id,
    label,
    count,
  }: {
    id: NonNullable<QuickFilter>;
    label: string;
    count: number;
  }) => {
    const active = quickFilter === id;
    return (
      <Button
        size="sm"
        variant={active ? "default" : "outline"}
        className="h-7 px-2.5 text-xs gap-1.5"
        onClick={() => setQuickFilter(active ? null : id)}
      >
        {label}
        <Badge
          variant="secondary"
          className={cn(
            "h-4 px-1 text-[10px]",
            active && "bg-primary-foreground text-primary",
          )}
        >
          {count}
        </Badge>
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      <DeclarationsAttentionInbox cases={allCases} onOpenCase={onOpenCase} />

      {/* Заголовок */}
      <div className="space-y-1">
        <h2 className="text-xl md:text-2xl font-semibold">Декларації</h2>
        <p className="text-sm text-muted-foreground">
          Усі ваші декларації та звіти. Готуємо автоматично з даних кабінету — ви перевіряєте і підписуєте.
        </p>
      </div>

      {/* KPI-стрічка */}
      <KPIStrip items={kpiItems} ariaLabel="Декларації — ключові показники" />

      {/* Toolbar + Quick chips */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук декларацій…"
              className="pl-8 h-8"
            />
          </div>

          <Select
            value={String(kindFilter)}
            onValueChange={(v) => setKindFilter(v === "all" ? "all" : (v as DeclarationKind))}
          >
            <SelectTrigger className="w-[160px] h-8">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі типи</SelectItem>
              {allKinds.map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {allYears.length > 1 && (
            <Select
              value={String(yearFilter)}
              onValueChange={(v) => setYearFilter(v === "all" ? "all" : Number(v))}
            >
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі роки</SelectItem>
                {allYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {allStatuses.length > 1 && (
            <Select
              value={String(statusFilter)}
              onValueChange={(v) => setStatusFilter(v === "all" ? "all" : (v as UnifiedStatus))}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі статуси</SelectItem>
                {allStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL_MAP[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <QuickChip id="needs_attention" label="Потребує уваги" count={counts.needs_attention} />
          {counts.overdue > 0 && (
            <QuickChip id="overdue" label="Прострочено" count={counts.overdue} />
          )}
          <QuickChip id="to_pay" label="До сплати" count={counts.to_pay} />
          <QuickChip id="refund" label="До повернення" count={counts.refund} />
          <QuickChip id="submitted" label="Подані" count={counts.submitted} />
        </div>

        {/* Active filters strip */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs text-muted-foreground">
              Знайдено:{" "}
              <span className="font-medium text-foreground">{filtered.length}</span> з{" "}
              {allDeclarations.length}
            </span>
            {kindFilter !== "all" && (
              <Badge
                variant="secondary"
                className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => setKindFilter("all")}
              >
                {KIND_LABELS[kindFilter]}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {yearFilter !== "all" && (
              <Badge
                variant="secondary"
                className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => setYearFilter("all")}
              >
                {yearFilter}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge
                variant="secondary"
                className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => setStatusFilter("all")}
              >
                {STATUS_LABEL_MAP[statusFilter]}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {search.trim() && (
              <Badge
                variant="secondary"
                className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-destructive/10"
                onClick={() => setSearch("")}
              >
                «{search}»
                <X className="h-3 w-3" />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" /> Скинути
            </Button>
          </div>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <TableEmptyState
              icon={FileText}
              title="Немає декларацій за обраними фільтрами"
              description="Спробуйте змінити фільтри або переглянути інший рік."
              action={{ label: "Скинути фільтри", onClick: resetFilters }}
              secondaryAction={
                previousYearWithData
                  ? {
                      label: `Перейти на ${previousYearWithData}`,
                      onClick: () => setYearFilter(previousYearWithData),
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-2">
          {filtered.map((d) => (
            <DeclarationCard
              key={d.id}
              item={d}
              onOpen={() => onOpenDeclaration(d)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead
                    className="w-[36%] group"
                    sortable
                    sorted={sort.key === "type"}
                    sortDirection={sort.key === "type" ? sort.direction : undefined}
                    onSort={() => handleSort("type")}
                  >
                    <span className="flex items-center">
                      Тип / Назва
                      <SortIndicator
                        active={sort.key === "type"}
                        direction={sort.key === "type" ? sort.direction : null}
                      />
                    </span>
                  </TableHead>
                  <TableHead>Період</TableHead>
                  <TableHead
                    className="group"
                    sortable
                    sorted={sort.key === "status"}
                    sortDirection={sort.key === "status" ? sort.direction : undefined}
                    onSort={() => handleSort("status")}
                  >
                    <span className="flex items-center">
                      Статус
                      <SortIndicator
                        active={sort.key === "status"}
                        direction={sort.key === "status" ? sort.direction : null}
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    numeric
                    className="group"
                    sortable
                    sorted={sort.key === "amount"}
                    sortDirection={sort.key === "amount" ? sort.direction : undefined}
                    onSort={() => handleSort("amount")}
                  >
                    <span className="flex items-center justify-end">
                      Сума
                      <SortIndicator
                        active={sort.key === "amount"}
                        direction={sort.key === "amount" ? sort.direction : null}
                      />
                    </span>
                  </TableHead>
                  <TableHead
                    className="group"
                    sortable
                    sorted={sort.key === "deadline"}
                    sortDirection={sort.key === "deadline" ? sort.direction : undefined}
                    onSort={() => handleSort("deadline")}
                  >
                    <span className="flex items-center">
                      Дедлайн
                      <SortIndicator
                        active={sort.key === "deadline"}
                        direction={sort.key === "deadline" ? sort.direction : null}
                      />
                    </span>
                  </TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <DeclarationRow
                    key={d.id}
                    item={d}
                    onOpen={() => onOpenDeclaration(d)}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DeclarationRow({
  item,
  onOpen,
}: {
  item: UnifiedDeclaration;
  onOpen: () => void;
}) {
  const isRefund = item.taxAmount < 0;
  const showAmount = item.taxAmount !== 0;
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onOpen}>
      <TableCell>
        <div className="flex items-start gap-2">
          <Badge className={cn("gap-1 shrink-0 mt-0.5", KIND_TONE[item.kind])} variant="outline">
            {KIND_ICON[item.kind]}
            {KIND_SHORT[item.kind]}
          </Badge>
          <div className="min-w-0">
            <div className="font-medium leading-tight truncate">{item.title}</div>
            <div className="text-xs text-muted-foreground">{KIND_LABELS[item.kind]}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm tabular-nums">{item.period}</TableCell>
      <TableCell>
        <Badge className={cn("gap-1", STATUS_TONE[item.status])} variant="outline">
          {STATUS_ICON[item.status]}
          {item.statusLabel}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {!showAmount ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          <div className="space-y-0.5">
            <div
              className={cn(
                "text-sm font-semibold tabular-nums",
                isRefund && "text-emerald-700 dark:text-emerald-400",
              )}
            >
              {isRefund ? "↩ " : ""}
              {fmt(item.taxAmount)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {isRefund ? "повернення" : "до сплати"}
            </div>
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className={cn("inline-flex items-center gap-1 text-xs tabular-nums", URGENCY_TEXT[item.urgency])}>
          {item.urgency === "overdue" && <AlertTriangle className="size-3" />}
          {fmtDate(item.deadline)}
        </div>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="gap-1"
          aria-label="Відкрити"
        >
          <Eye className="size-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Експортуємо локально для типізації props батька
export type { UnifiedDeclaration } from "@/lib/declarations/unifiedDeclarations";
// Зберігаємо неекспортовану раніше залежність від типу DeclarationCase для AttentionInbox
export type { DeclarationCase };
