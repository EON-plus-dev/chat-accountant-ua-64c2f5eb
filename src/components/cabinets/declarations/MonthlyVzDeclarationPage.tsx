import { useMemo, useState } from "react";
import {
  CalendarDays,
  Send,
  Shield,
  TrendingUp,
  Receipt,
  Sparkles,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { getDemoReportsForCabinet } from "@/config/demoCabinets/getters";
import { SummaryTile } from "./shared/SummaryTile";
import { DeclarationDetailShell } from "./shared/DeclarationDetailShell";
import { DeclarationJournalTab, type JournalEntry } from "./shared/DeclarationJournalTab";
import { GeneratedDocumentsBlock } from "./shared/GeneratedDocumentsBlock";
import { PrepareSubmissionSheet } from "./shared/PrepareSubmissionSheet";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface Props {
  cabinetId: string;
  reportId: string;
  onBack: () => void;
}

const fmt = (n: number) => `${n.toLocaleString("uk-UA")} ₴`;
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("uk-UA") : "—";

const MONTHS = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];

export function MonthlyVzDeclarationPage({ cabinetId, reportId, onBack }: Props) {
  const reports = getDemoReportsForCabinet(cabinetId);
  const report = reports.find((r) => r.id === reportId);
  const [prepareOpen, setPrepareOpen] = useState(false);

  if (!report) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <Shield className="size-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Звіт не знайдено</p>
          <Button variant="outline" onClick={onBack}>
            Назад
          </Button>
        </CardContent>
      </Card>
    );
  }

  const calc = report.calculation?.type === "vz" ? report.calculation.data : null;
  const status = (report.status === "submitted" || report.status === "accepted") ? report.status : "draft";
  const statusLabel = report.statusLabel;

  // YTD по поточному + минулому році
  const yearVz = useMemo(
    () => reports.filter((r) => r.type === "vz" && r.year === report.year),
    [reports, report.year],
  );
  const prevYearVz = useMemo(
    () => reports.filter((r) => r.type === "vz" && r.year === (report.year ?? 0) - 1),
    [reports, report.year],
  );
  const ytdTax = yearVz.reduce((s, r) => s + (r.amountToPay ?? 0), 0);
  const ytdBase = yearVz.reduce((s, r) => {
    const c = r.calculation?.type === "vz" ? r.calculation.data : null;
    return s + (c?.baseAmount ?? 0);
  }, 0);

  const chartData = useMemo(() => {
    return MONTHS.map((m, idx) => {
      const cur = yearVz.find((r) => new Date(r.deadline).getMonth() === idx + 1 || new Date(r.deadline).getMonth() === idx);
      const prev = prevYearVz.find((r) => new Date(r.deadline).getMonth() === idx + 1 || new Date(r.deadline).getMonth() === idx);
      return {
        month: m,
        [`${report.year}`]: cur?.amountToPay ?? 0,
        [`${(report.year ?? 0) - 1}`]: prev?.amountToPay ?? 0,
      };
    });
  }, [yearVz, prevYearVz, report.year]);

  const monthlyHistory = reports
    .filter((r) => r.type === "vz" && r.id !== report.id)
    .sort((a, b) => (b.deadline > a.deadline ? 1 : -1))
    .slice(0, 6);

  const journalEntries: JournalEntry[] = useMemo(
    () =>
      (report.history ?? []).map<JournalEntry>((h) => ({
        at: h.date,
        label: h.action,
        eventType: h.action.includes("Подано")
          ? "submitted"
          : h.action.includes("Підпис")
          ? "signed"
          : "field_changed",
      })),
    [report.history],
  );

  const isFinal = report.status === "submitted" || report.status === "accepted";

  return (
    <DeclarationDetailShell
      onBack={onBack}
      breadcrumb="Декларації / Військовий збір"
      title={report.name}
      badges={
        <Badge variant="outline" className="font-mono">{report.periodLabel}</Badge>
      }
      status={status as never}
      statusLabel={statusLabel}
      deadline={report.deadline}
      progressTone="amber"
      metaSlots={
        <>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" /> Дедлайн: {fmtDate(report.deadline)}
          </span>
          <span>{report.legalBasis?.article ?? "п. 16¹ підрозд. 10 ПКУ"}</span>
          {calc && (
            <span className="font-mono">
              ставка {(calc.rate * 100).toFixed(1).replace(".0", "")}%
            </span>
          )}
        </>
      }
      actions={
        !isFinal ? (
          <Button size="sm" onClick={() => setPrepareOpen(true)} className="gap-1">
            <Send className="size-3.5" /> Підготувати до подання
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
                <Sparkles className="size-4 text-amber-600" /> Що далі
              </h3>
              {!isFinal ? (
                <Button size="sm" className="w-full justify-start" onClick={() => setPrepareOpen(true)}>
                  Підготувати до подання
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Подано до ДПС.</p>
              )}
            </CardContent>
          </Card>

          <GeneratedDocumentsBlock
            docs={[
              {
                formCode: "F0103903",
                title: "Декларація з військового збору",
                status: isFinal ? "submitted" : "draft",
              },
            ]}
          />

          <Card>
            <CardContent className="p-4 space-y-1.5">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <TrendingUp className="size-4" /> YTD {report.year}
              </h3>
              <p className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                {fmt(ytdTax)}
              </p>
              <p className="text-xs text-muted-foreground">
                База: {fmt(ytdBase)} · {yearVz.length} періодів
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1.5 text-xs">
              <h3 className="font-medium text-sm">Версія форми</h3>
              <Row label="Норматив" value={report.legalBasis?.article ?? "п. 16¹ ПКУ"} />
              <Row label="Ставка" value={calc ? `${(calc.rate * 100).toFixed(1).replace(".0", "")}%` : "—"} />
              <Row label="Звітний рік" value={String(report.year)} />
            </CardContent>
          </Card>
        </>
      }
    >
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="calc">Розрахунок</TabsTrigger>
          <TabsTrigger value="history">Історія ({monthlyHistory.length})</TabsTrigger>
          <TabsTrigger value="audit">Журнал ({journalEntries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryTile
              label="База оподаткування"
              value={calc ? fmt(calc.baseAmount) : "—"}
              tone="primary"
              hint="Інвестиційні доходи"
            />
            <SummaryTile
              label="Ставка"
              value={calc ? `${(calc.rate * 100).toFixed(1).replace(".0", "")}%` : "—"}
              tone="neutral"
              hint={report.legalBasis?.rate ?? "Чинна ставка"}
            />
            <SummaryTile
              label="До сплати"
              value={fmt(report.amountToPay ?? 0)}
              tone="warning"
              hint={`До ${fmtDate(report.deadline)}`}
            />
          </div>

          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="font-medium flex items-center gap-2">
                <Receipt className="size-4" /> Джерело доходу
              </div>
              <p className="text-muted-foreground text-xs">
                База ВЗ автоматично сформована з реалізованих інвестиційних операцій (Interactive Brokers)
                за {report.periodLabel?.toLowerCase()}. Ставка 5% діє з 01.01.2025 (Закон №4014-IX).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calc" className="space-y-3 mt-0">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="size-4" /> ВЗ по місяцях: {report.year} vs {(report.year ?? 0) - 1}
                </h3>
                <Badge variant="outline" className="text-xs">{yearVz.length} періодів</Badge>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={50} />
                    <RechartsTooltip
                      formatter={(value: number) => fmt(value)}
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey={`${(report.year ?? 0) - 1}`} fill="hsl(var(--muted-foreground))" fillOpacity={0.4} radius={[3, 3, 0, 0]} />
                    <Bar dataKey={`${report.year}`} fill="hsl(38 92% 50%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground">
                Порівняння суми ВЗ помісячно з аналогічним періодом минулого року.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b text-sm font-medium">Попередні періоди</div>
              <div className="divide-y">
                {monthlyHistory.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                    Інших періодів ще немає
                  </div>
                ) : (
                  monthlyHistory.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-4 py-3 gap-3">
                      <div>
                        <div className="text-sm font-medium leading-tight">{r.periodLabel}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.legalBasis?.rate ?? ""} · дедлайн {fmtDate(r.deadline)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">{fmt(r.amountToPay ?? 0)}</div>
                        <Badge variant="outline" className="text-[10px] h-5 mt-0.5">
                          {r.statusLabel}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <DeclarationJournalTab entries={journalEntries} />
        </TabsContent>
      </Tabs>

      <PrepareSubmissionSheet
        open={prepareOpen}
        onOpenChange={setPrepareOpen}
        title="Підготувати ВЗ до подання"
        description={`${report.periodLabel} · ${fmt(report.amountToPay ?? 0)} до сплати`}
        formCode="F0103903"
        summaryRows={[
          { label: "Період", value: report.periodLabel ?? "—" },
          { label: "База", value: calc ? fmt(calc.baseAmount) : "—" },
          { label: "Ставка", value: calc ? `${(calc.rate * 100).toFixed(1).replace(".0", "")}%` : "—" },
          { label: "До сплати", value: fmt(report.amountToPay ?? 0) },
        ]}
        checklist={[
          { id: "src", label: "Джерела доходу синхронізовано (IB)", required: true, done: true },
          { id: "rate", label: "Підтверджую ставку 5% (з 01.01.2025)", required: true },
          { id: "rec", label: "Реквізити сплати ДПС перевірено", required: true },
        ]}
        onSubmit={() => toast({ title: "ВЗ готово до подання", description: "Демо: перейдіть до підпису КЕП." })}
      />
    </DeclarationDetailShell>
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
