import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  FileSignature,
  ExternalLink,
  Banknote,
  Calculator,
  FileText,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  buildDeclarationSnapshot,
  type DeclarationLineItem,
  type DeclarationSnapshot,
} from "@/config/demoCabinets/declarationSnapshot";
import type { DeclarationCase } from "@/config/demoCabinets/declarationCases";
import { useDemoRoleView } from "@/contexts/DemoRoleViewContext";
import { SourceDrillSheet } from "./SourceDrillSheet";

interface DeclarationWizardProps {
  caseItem: DeclarationCase;
}

type StepId = "review" | "appendices" | "calculation" | "confirm";

interface Step {
  id: StepId;
  label: string;
  icon: typeof FileText;
  shortLabel: string;
}

const STEPS: Step[] = [
  { id: "review", label: "Перегляд даних", shortLabel: "Дані", icon: FileText },
  { id: "appendices", label: "Додатки та документи", shortLabel: "Додатки", icon: Sparkles },
  { id: "calculation", label: "Розрахунок податку", shortLabel: "Розрахунок", icon: Calculator },
  { id: "confirm", label: "Підтвердження та підпис", shortLabel: "Підпис", icon: FileSignature },
];

const fmt = (n: number) => `${n.toLocaleString("uk-UA")} ₴`;

export function DeclarationWizard({ caseItem }: DeclarationWizardProps) {
  const { canSign, isConsultant } = useDemoRoleView();
  const snapshot = useMemo(() => buildDeclarationSnapshot(caseItem), [caseItem]);

  const [stepIndex, setStepIndex] = useState(0);
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);
  const [confirmedLiability, setConfirmedLiability] = useState(false);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const isFirst = stepIndex === 0;

  const hasErrors = snapshot.warnings.some((w) => w.severity === "error");
  const allAppendicesReady = snapshot.appendices.every((a) => a.ready);
  const canProceedFromAppendices = allAppendicesReady;
  const canSubmit = confirmedAccuracy && confirmedLiability && !hasErrors && allAppendicesReady && canSign;

  const handleNext = () => {
    if (step.id === "appendices" && !canProceedFromAppendices) {
      toast({
        title: "Не всі додатки готові",
        description: "Завершіть формування обовʼязкових додатків перед переходом далі.",
        variant: "destructive",
      });
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const handleSign = () => {
    toast({
      title: "Декларацію підписано (демо)",
      description: `Кейс ${caseItem.reportingYear} р. готовий до подання до ДПС. Hash: demo-sha256-${Date.now().toString(16).slice(-8)}…`,
    });
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Step header */}
        <div className="p-4 md:p-5 border-b space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-base">Майстер підготовки декларації</h3>
              <p className="text-xs text-muted-foreground">
                Перегляньте, перевірте та підпишіть декларацію за {caseItem.reportingYear} рік
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              {step.id} · {stepIndex + 1}/{STEPS.length}
            </Badge>
          </div>

          {/* Stepper */}
          <ol className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isDone = i < stepIndex;
              const isCurrent = i === stepIndex;
              return (
                <li
                  key={s.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md border p-2 text-xs",
                    isCurrent && "border-primary bg-primary/5",
                    isDone && "border-emerald-500/40 bg-emerald-500/5",
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Icon className="size-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className={cn("font-medium truncate", isCurrent && "text-primary")}>
                      {s.shortLabel}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate hidden md:block">
                      {s.label}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Step content */}
        <div className="p-4 md:p-5">
          {step.id === "review" && <ReviewStep snapshot={snapshot} />}
          {step.id === "appendices" && <AppendicesStep snapshot={snapshot} />}
          {step.id === "calculation" && <CalculationStep snapshot={snapshot} />}
          {step.id === "confirm" && (
            <ConfirmStep
              snapshot={snapshot}
              caseItem={caseItem}
              canSign={canSign}
              isConsultant={isConsultant}
              confirmedAccuracy={confirmedAccuracy}
              confirmedLiability={confirmedLiability}
              setConfirmedAccuracy={setConfirmedAccuracy}
              setConfirmedLiability={setConfirmedLiability}
              hasErrors={hasErrors}
              allAppendicesReady={allAppendicesReady}
            />
          )}
        </div>

        {/* Footer nav */}
        <div className="p-4 border-t flex flex-wrap items-center justify-between gap-2 bg-muted/30">
          <Button variant="outline" size="sm" onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={isFirst} className="gap-1">
            <ArrowLeft className="size-3.5" /> Назад
          </Button>
          <div className="text-xs text-muted-foreground hidden md:block">
            Крок {stepIndex + 1} з {STEPS.length}: {step.label}
          </div>
          {isLast ? (
            <Button size="sm" onClick={handleSign} disabled={!canSubmit} className="gap-1">
              <FileSignature className="size-3.5" /> Підписати та подати
            </Button>
          ) : (
            <Button size="sm" onClick={handleNext} className="gap-1">
              Далі <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 1: Review aggregated data ──────────────────────────────────────────

function ReviewStep({ snapshot }: { snapshot: DeclarationSnapshot }) {
  return (
    <div className="space-y-4">
      <SectionBlock title="Розділ II — Доходи" items={snapshot.incomes} emptyHint="Доходи не виявлено" />
      {snapshot.assets.length > 0 && (
        <SectionBlock title="Розділ V — Майно" items={snapshot.assets} />
      )}
      {snapshot.fxRates.length > 0 && (
        <div className="rounded-md border p-3 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1.5">
            <Banknote className="size-4 text-muted-foreground" /> Курси НБУ (на 31.12)
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {snapshot.fxRates.map((fx) => (
              <div key={fx.currency} className="rounded border bg-muted/30 p-2 text-xs">
                <div className="font-mono font-semibold">{fx.currency}</div>
                <div className="tabular-nums text-sm">{fx.rate.toFixed(4)} ₴</div>
                <div className="text-[10px] text-muted-foreground">{fx.date} · {fx.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionBlock({
  title,
  items,
  emptyHint,
}: {
  title: string;
  items: DeclarationLineItem[];
  emptyHint?: string;
}) {
  const [drillItem, setDrillItem] = useState<DeclarationLineItem | null>(null);
  if (items.length === 0) {
    return (
      <div className="rounded-md border p-4 text-center text-xs text-muted-foreground">
        {emptyHint ?? "Немає даних"}
      </div>
    );
  }
  const total = items.reduce((s, i) => s + i.amount, 0);
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="px-3 py-2 bg-muted/40 border-b flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className="text-xs tabular-nums font-medium">{fmt(total)}</span>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.code} className="px-3 py-2.5 flex items-start gap-3 text-sm">
            <Badge variant="outline" className="font-mono text-[10px] shrink-0 mt-0.5">
              {item.code}
            </Badge>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{item.label}</span>
                {item.needsReview && (
                  <Badge variant="outline" className="text-[10px] h-5 gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
                    <AlertTriangle className="size-3" /> Перевірити
                  </Badge>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ExternalLink className="size-3" />
                Джерело: {item.sourceLabel}
                {item.txCount != null && <span>· {item.txCount} операцій</span>}
              </div>
              {item.reviewNote && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400">{item.reviewNote}</div>
              )}
              {item.evidence && item.evidence.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDrillItem(item)}
                  className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  <ExternalLink className="size-3" /> Дивитись джерело ({item.evidence.length})
                </button>
              )}
            </div>
            <span className="text-sm font-semibold tabular-nums shrink-0">
              {item.amount < 0 ? `−${fmt(Math.abs(item.amount))}` : fmt(item.amount)}
            </span>
          </div>
        ))}
      </div>
      <SourceDrillSheet
        open={!!drillItem}
        onOpenChange={(o) => !o && setDrillItem(null)}
        title={drillItem?.label ?? ""}
        evidence={drillItem?.evidence ?? []}
      />
    </div>
  );
}

// ─── Step 2: Appendices readiness ────────────────────────────────────────────

function AppendicesStep({ snapshot }: { snapshot: DeclarationSnapshot }) {
  if (snapshot.appendices.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-500" />
        Додатки не потрібні для цієї декларації.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        На основі тегів профілю сформовано перелік необхідних додатків. Усі обовʼязкові мають бути готові перед підписанням.
      </p>
      {snapshot.appendices.map((app) => (
        <div
          key={app.code}
          className={cn(
            "rounded-md border p-3 flex items-start gap-3",
            app.ready && "border-emerald-500/40 bg-emerald-500/5",
            !app.ready && app.required && "border-amber-500/40 bg-amber-500/5",
          )}
        >
          {app.ready ? (
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">{app.code}</Badge>
              <span className="font-medium text-sm">{app.label}</span>
              {app.required && (
                <Badge variant="secondary" className="text-[10px] h-5">Обовʼязковий</Badge>
              )}
              {app.itemsCount != null && (
                <Badge variant="outline" className="text-[10px] h-5">{app.itemsCount} рядків</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{app.description}</p>
            {!app.ready && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Потрібно: завершити введення даних або отримати підтверджуючий документ.
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            {app.ready ? "Переглянути" : "Завершити"}
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Step 3: Tax calculation ─────────────────────────────────────────────────

function CalculationStep({ snapshot }: { snapshot: DeclarationSnapshot }) {
  const t = snapshot.totals;
  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <div className="px-3 py-2 bg-muted/40 border-b">
          <h4 className="text-sm font-medium">Розрахунок зобовʼязань</h4>
        </div>
        <div className="divide-y text-sm">
          <CalcRow label="Загальний оподатковуваний дохід" value={t.grossIncome} />
          <CalcRow label="ПДФО (18%)" value={t.pit} />
          <CalcRow label="Військовий збір (5%)" value={t.militaryTax} />
          {t.foreignTaxCredit > 0 && (
            <CalcRow label="Залік сплаченого іноземного податку (ФТК)" value={-t.foreignTaxCredit} tone="success" />
          )}
          {t.refund > 0 && (
            <CalcRow label="Повернення з податкової знижки" value={-t.refund} tone="success" />
          )}
          <div className="px-3 py-3 flex items-center justify-between bg-primary/5 border-t-2 border-primary/30">
            <span className="font-semibold">До сплати в бюджет</span>
            <span className="text-lg font-bold tabular-nums text-primary">{fmt(t.netToPay)}</span>
          </div>
        </div>
      </div>

      {snapshot.taxLiabilities.length > 0 && (
        <SectionBlock title="Деталізація — Розділ III" items={snapshot.taxLiabilities} />
      )}
      {snapshot.taxDiscount.length > 0 && (
        <SectionBlock title="Розділ IV — Податкова знижка" items={snapshot.taxDiscount} />
      )}
    </div>
  );
}

function CalcRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning";
}) {
  return (
    <div className="px-3 py-2 flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "tabular-nums font-medium",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "warning" && "text-amber-600 dark:text-amber-400",
        )}
      >
        {value < 0 ? `−${fmt(Math.abs(value))}` : fmt(value)}
      </span>
    </div>
  );
}

// ─── Step 4: Confirm & sign ──────────────────────────────────────────────────

function ConfirmStep({
  snapshot,
  caseItem,
  canSign,
  isConsultant,
  confirmedAccuracy,
  confirmedLiability,
  setConfirmedAccuracy,
  setConfirmedLiability,
  hasErrors,
  allAppendicesReady,
}: {
  snapshot: DeclarationSnapshot;
  caseItem: DeclarationCase;
  canSign: boolean;
  isConsultant: boolean;
  confirmedAccuracy: boolean;
  confirmedLiability: boolean;
  setConfirmedAccuracy: (v: boolean) => void;
  setConfirmedLiability: (v: boolean) => void;
  hasErrors: boolean;
  allAppendicesReady: boolean;
}) {
  const t = snapshot.totals;
  return (
    <div className="space-y-4">
      {/* Final summary */}
      <div className="rounded-md border bg-primary/5 p-4 space-y-2">
        <h4 className="font-semibold flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" /> Декларація готова до підпису
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <SumTile label="Звітний рік" value={String(caseItem.reportingYear)} />
          <SumTile label="Загальний дохід" value={fmt(t.grossIncome)} />
          <SumTile label="До сплати" value={fmt(t.netToPay)} tone="warning" />
          <SumTile label="ПДФО" value={fmt(t.pit)} />
          <SumTile label="Військовий збір" value={fmt(t.militaryTax)} />
          {t.refund > 0 && <SumTile label="До повернення" value={fmt(t.refund)} tone="success" />}
        </div>
      </div>

      {/* Warnings */}
      {snapshot.warnings.length > 0 && (
        <div className="space-y-1.5">
          {snapshot.warnings.map((w) => {
            const Icon = w.severity === "error" ? AlertCircle : w.severity === "warning" ? AlertTriangle : Info;
            const cls =
              w.severity === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-200"
                : w.severity === "warning"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                  : "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200";
            return (
              <div key={w.id} className={cn("rounded-md border px-3 py-2 text-xs flex items-start gap-2", cls)}>
                <Icon className="size-4 shrink-0 mt-0.5" />
                <span>{w.message}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmations */}
      <Separator />
      <div className="space-y-3">
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox
            checked={confirmedAccuracy}
            onCheckedChange={(v) => setConfirmedAccuracy(!!v)}
            disabled={!canSign}
            className="mt-0.5"
          />
          <span className="text-sm">
            Підтверджую, що всі вказані дані відповідають дійсності та підкріплені первинними документами.
          </span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox
            checked={confirmedLiability}
            onCheckedChange={(v) => setConfirmedLiability(!!v)}
            disabled={!canSign}
            className="mt-0.5"
          />
          <span className="text-sm">
            Усвідомлюю, що відповідальність за достовірність даних несе виключно платник податків (ст. 47 ПКУ).
          </span>
        </label>
      </div>

      {/* Blockers */}
      {!canSign && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          {isConsultant
            ? "Консультант не може підписувати декларацію. Передайте кейс власнику після завершення перевірки."
            : "Підписання доступне виключно власнику кабінету (§ 2 ТЗ). Як довірена особа, ви можете підготувати дані."}
        </div>
      )}
      {hasErrors && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-900 dark:text-red-200">
          Підпис заблоковано через критичні помилки валідації (див. вище).
        </div>
      )}
      {!allAppendicesReady && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          Не всі обовʼязкові додатки готові. Поверніться до кроку «Додатки».
        </div>
      )}
    </div>
  );
}

function SumTile({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  return (
    <div className="rounded border bg-background p-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-base font-semibold tabular-nums",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "warning" && "text-amber-600 dark:text-amber-400",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export default DeclarationWizard;
