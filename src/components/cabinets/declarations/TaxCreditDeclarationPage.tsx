import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  HeartPulse,
  Home,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Plus,
  ArrowRight,
  Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { useSortState } from "@/hooks/use-sort-state";
import { toast } from "@/hooks/use-toast";
import { getDemoReportsForCabinet } from "@/config/demoCabinets/getters";
import { SummaryTile } from "./shared/SummaryTile";
import { DeclarationDetailShell } from "./shared/DeclarationDetailShell";
import { DeclarationJournalTab, type JournalEntry } from "./shared/DeclarationJournalTab";
import { GeneratedDocumentsBlock } from "./shared/GeneratedDocumentsBlock";
import { PrepareSubmissionSheet } from "./shared/PrepareSubmissionSheet";
import { cn } from "@/lib/utils";

interface Props {
  cabinetId: string;
  reportId: string;
  onBack: () => void;
}

const fmt = (n: number) => `${Math.abs(Math.round(n)).toLocaleString("uk-UA")} ₴`;
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("uk-UA") : "—";

interface Receipt {
  id: string;
  category: string;
  icon: typeof GraduationCap;
  contractor: string;
  date: string;
  amount: number;
  includedPct: number;
  article: string;
}

const RECEIPTS: Receipt[] = [
  { id: "r1", category: "Навчання", icon: GraduationCap, contractor: "КНУ ім. Шевченка — 1 семестр", date: "2025-09-12", amount: 33_000, includedPct: 100, article: "пп. 166.3.3" },
  { id: "r2", category: "Навчання", icon: GraduationCap, contractor: "КНУ ім. Шевченка — 2 семестр", date: "2026-02-08", amount: 33_000, includedPct: 100, article: "пп. 166.3.3" },
  { id: "r3", category: "Реабілітація", icon: HeartPulse, contractor: "МЦ «Добробут»", date: "2025-11-20", amount: 18_500, includedPct: 100, article: "пп. 166.3.4" },
  { id: "r4", category: "Іпотека", icon: Home, contractor: "Іпотечні відсотки (демо)", date: "2025-12-31", amount: 18_000, includedPct: 100, article: "пп. 166.3.1" },
];

type ReceiptSortKey = "date" | "amount" | "category";

export function TaxCreditDeclarationPage({ cabinetId, reportId, onBack }: Props) {
  const reports = getDemoReportsForCabinet(cabinetId);
  const report = reports.find((r) => r.id === reportId);
  const { sort, handleSort } = useSortState<ReceiptSortKey>("date", "desc");
  const [prepareOpen, setPrepareOpen] = useState(false);

  const sortedReceipts = useMemo(() => {
    return [...RECEIPTS].sort((a, b) => {
      let cmp = 0;
      if (sort.key === "date") cmp = a.date.localeCompare(b.date);
      else if (sort.key === "amount") cmp = a.amount - b.amount;
      else cmp = a.category.localeCompare(b.category, "uk");
      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [sort]);

  if (!report) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <FileText className="size-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Декларацію не знайдено</p>
          <Button variant="outline" onClick={onBack}>Назад</Button>
        </CardContent>
      </Card>
    );
  }

  const totalEligible = RECEIPTS.reduce((s, r) => s + r.amount * (r.includedPct / 100), 0);
  const refund = Math.abs(report.amountToPay ?? 0);
  const annualIncomeCap = 720_000;
  const capUsedPct = Math.round((totalEligible / annualIncomeCap) * 100);
  const eligibleBase = Math.min(totalEligible, annualIncomeCap);
  const computedRefund = Math.round(eligibleBase * 0.18);
  const progressPct = 75;

  const status: "draft" | "ready" | "submitted" | "accepted" =
    report.status === "submitted" || report.status === "accepted" ? report.status : "draft";
  const isFinal = status === "submitted" || status === "accepted";

  const journalEntries: JournalEntry[] = useMemo(
    () =>
      (report.history ?? []).map<JournalEntry>((h) => ({
        at: h.date,
        label: h.action,
        eventType: h.action.includes("Подано") ? "submitted" : "field_changed",
      })),
    [report.history],
  );

  return (
    <DeclarationDetailShell
      onBack={onBack}
      breadcrumb="Декларації / Податкова знижка"
      title={report.name}
      badges={<Badge variant="outline" className="font-mono">{report.year}</Badge>}
      status={status}
      statusLabel={report.statusLabel}
      deadline={report.deadline}
      progressTone="emerald"
      progressPercent={progressPct}
      metaSlots={
        <>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" /> Дедлайн: {fmtDate(report.deadline)}
          </span>
          <span>ст. 166 ПКУ</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            ↩ {fmt(refund)} до повернення
          </span>
        </>
      }
      actions={
        !isFinal ? (
          <Button size="sm" onClick={() => setPrepareOpen(true)} className="gap-1">
            <Sparkles className="size-3.5" /> Подати заяву
          </Button>
        ) : (
          <Button size="sm" disabled className="gap-1">
            <Send className="size-3.5" /> Подано
          </Button>
        )
      }
      sidebar={
        <>
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600" /> Що далі
              </h3>
              {!isFinal ? (
                <>
                  <Button size="sm" className="w-full justify-start" onClick={() => setPrepareOpen(true)}>
                    Підготувати до подання
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      toast({ title: "Додати квитанцію", description: "Демо: відкриється модуль документів." })
                    }
                  >
                    <Plus className="size-3.5 mr-1" /> Додати квитанцію
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Подано до ДПС.</p>
              )}
            </CardContent>
          </Card>

          <GeneratedDocumentsBlock
            docs={[
              {
                formCode: "F0140101",
                title: "Заява на повернення податкової знижки",
                status: isFinal ? "submitted" : "draft",
              },
            ]}
          />

          <Card>
            <CardContent className="p-4 space-y-1.5">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <FileText className="size-4" /> Документи
              </h3>
              <p className="text-2xl font-bold tabular-nums">{RECEIPTS.length}</p>
              <p className="text-xs text-muted-foreground">квитанцій у складі знижки</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1.5 text-xs">
              <h3 className="font-medium text-sm">Версія форми</h3>
              <Row label="Норматив" value="ст. 166 ПКУ" />
              <Row label="Ставка" value="18%" />
              <Row label="Звітний рік" value={String(report.year)} />
            </CardContent>
          </Card>
        </>
      }
    >
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="calc">Розрахунок</TabsTrigger>
          <TabsTrigger value="documents">Документи ({RECEIPTS.length})</TabsTrigger>
          <TabsTrigger value="audit">Журнал ({journalEntries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryTile
              label="До повернення з бюджету"
              value={fmt(refund)}
              tone="success"
              hint={`18% × ${fmt(refund / 0.18)}`}
            />
            <SummaryTile
              label="Витрат у складі знижки"
              value={fmt(totalEligible)}
              tone="primary"
              hint={`${RECEIPTS.length} квитанції`}
            />
            <SummaryTile
              label="Використано від ліміту"
              value={`${capUsedPct}%`}
              tone={capUsedPct > 80 ? "warning" : "neutral"}
              hint={`Ліміт: ${fmt(annualIncomeCap)}`}
            />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b text-sm font-medium flex items-center justify-between">
                <span>Джерела податкової знижки</span>
                <span className="text-xs text-muted-foreground">{RECEIPTS.length} квитанції</span>
              </div>
              <div className="divide-y">
                {RECEIPTS.map((r) => {
                  const Icon = r.icon;
                  return (
                    <div key={r.id} className="flex items-center justify-between px-4 py-3 gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium leading-tight">{r.contractor}</div>
                          <div className="text-xs text-muted-foreground">{r.article} · {r.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">{fmt(r.amount)}</div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
                          ↩ {fmt(r.amount * 0.18 * (r.includedPct / 100))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calc" className="space-y-3 mt-0">
          {capUsedPct > 80 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
              <AlertTriangle className="size-4 mt-0.5 text-amber-600 shrink-0" />
              <div>
                Використано <span className="font-medium">{capUsedPct}%</span> ліміту річного доходу.
                Сума витрат у складі знижки не може перевищувати річний дохід платника (ст. 166.4.2 ПКУ).
              </div>
            </div>
          )}

          <Card>
            <CardContent className="p-4 md:p-6 space-y-3">
              <div className="text-sm font-medium">Покроковий розрахунок повернення</div>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
                <FormulaStep order={1} label="Витрати" value={fmt(totalEligible)} />
                <ArrowRight className="size-4 text-muted-foreground hidden md:block mx-auto" />
                <FormulaStep
                  order={2}
                  label={`Ліміт (${fmt(annualIncomeCap)})`}
                  value={fmt(eligibleBase)}
                  hint={eligibleBase < totalEligible ? "обмежено" : "у межах"}
                />
                <ArrowRight className="size-4 text-muted-foreground hidden md:block mx-auto" />
                <FormulaStep order={3} label="× ставка ПДФО" value="18%" />
                <ArrowRight className="size-4 text-muted-foreground hidden md:block mx-auto" />
                <FormulaStep order={4} label="До повернення" value={fmt(computedRefund)} highlight />
              </div>
              <p className="text-xs text-muted-foreground">
                Формула: <span className="font-mono">min(витрати; річний дохід) × 18%</span>. Підстава — ст. 166.4.2 ПКУ.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b text-sm font-medium flex items-center justify-between">
                <span>Квитанції у розрахунку</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1"
                  onClick={() =>
                    toast({ title: "Додати квитанцію", description: "Демо: відкриється модуль документів." })
                  }
                >
                  <Plus className="size-3.5" /> Додати
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      sortable
                      sorted={sort.key === "category"}
                      sortDirection={sort.key === "category" ? sort.direction : undefined}
                      onSort={() => handleSort("category")}
                    >
                      <span className="flex items-center">
                        Категорія
                        <SortIndicator active={sort.key === "category"} direction={sort.key === "category" ? sort.direction : null} />
                      </span>
                    </TableHead>
                    <TableHead>Контрагент</TableHead>
                    <TableHead
                      sortable
                      sorted={sort.key === "date"}
                      sortDirection={sort.key === "date" ? sort.direction : undefined}
                      onSort={() => handleSort("date")}
                    >
                      <span className="flex items-center">
                        Дата
                        <SortIndicator active={sort.key === "date"} direction={sort.key === "date" ? sort.direction : null} />
                      </span>
                    </TableHead>
                    <TableHead
                      numeric
                      sortable
                      sorted={sort.key === "amount"}
                      sortDirection={sort.key === "amount" ? sort.direction : undefined}
                      onSort={() => handleSort("amount")}
                    >
                      <span className="flex items-center justify-end">
                        Сума
                        <SortIndicator active={sort.key === "amount"} direction={sort.key === "amount" ? sort.direction : null} />
                      </span>
                    </TableHead>
                    <TableHead numeric>% включено</TableHead>
                    <TableHead numeric>Повернення</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReceipts.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell><Badge variant="outline" className="text-xs">{r.category}</Badge></TableCell>
                      <TableCell>
                        <div className="text-sm">{r.contractor}</div>
                        <div className="text-xs text-muted-foreground">{r.article}</div>
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">{fmtDate(r.date)}</TableCell>
                      <TableCell numeric>{fmt(r.amount)}</TableCell>
                      <TableCell numeric>{r.includedPct}%</TableCell>
                      <TableCell numeric className="text-emerald-700 dark:text-emerald-400">
                        {fmt(r.amount * 0.18 * (r.includedPct / 100))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="size-4" />
              Усі квитанції (навчання, медицина, іпотека) автоматично прив'язані до цієї заяви з модуля «Документи».
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <DeclarationJournalTab entries={journalEntries} />
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-3">
        <TrendingDown className="size-3" />
        Сума повернення розраховується як 18% від витрат у межах річного доходу платника (ст. 166.4.2 ПКУ).
      </p>

      <PrepareSubmissionSheet
        open={prepareOpen}
        onOpenChange={setPrepareOpen}
        title="Подати заяву на знижку"
        description={`Повернення ${fmt(computedRefund)} з бюджету`}
        formCode="F0140101"
        summaryRows={[
          { label: "Звітний рік", value: String(report.year) },
          { label: "Витрати", value: fmt(totalEligible) },
          { label: "Ліміт річного доходу", value: fmt(annualIncomeCap) },
          { label: "До повернення (18%)", value: fmt(computedRefund) },
        ]}
        checklist={[
          { id: "scan", label: "Скани усіх квитанцій завантажено", required: true, done: true },
          { id: "iban", label: "IBAN для повернення вказано", required: true },
          { id: "income", label: "Підтверджую офіційний річний дохід", required: true },
          { id: "limit", label: capUsedPct > 80 ? "Перевірив обмеження ст. 166.4.2 ПКУ" : "Витрати у межах ліміту" },
        ]}
        onSubmit={() => toast({ title: "F0140101 готовий", description: `Демо: заяву на повернення ${fmt(computedRefund)} сформовано.` })}
      />
    </DeclarationDetailShell>
  );
}

function FormulaStep({
  order,
  label,
  value,
  hint,
  highlight,
}: {
  order: number;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-center md:col-span-1",
        highlight ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-muted/30",
      )}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Крок {order}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      <div className={cn("text-base font-semibold tabular-nums mt-1", highlight && "text-emerald-700 dark:text-emerald-300")}>
        {value}
      </div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
