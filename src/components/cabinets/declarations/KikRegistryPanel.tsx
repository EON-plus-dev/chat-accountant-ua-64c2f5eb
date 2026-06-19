import { useMemo, useState } from "react";
import {
  Building2,
  AlertTriangle,
  CalendarClock,
  ShieldCheck,
  TrendingUp,
  Coins,
  ChevronRight,
  Plus,
  ArrowLeft,
  FileText,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getKikEntitiesForCabinet,
  getKikEntityById,
  chainDepth,
  effectiveShare,
  JURISDICTION_LABELS,
  KIK_STATUS_LABELS,
  KIK_REPORTING_STATUS_LABELS,
  type KikEntity,
  type KikDeadline,
} from "@/config/demoCabinets/kikRegistryConfig";
import { KikOwnershipTree } from "./KikOwnershipTree";

const reportingTone: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  submitted_kik_report:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  submitted_with_declaration:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  exempt: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
};

const deadlineTone: Record<KikDeadline["status"], string> = {
  upcoming: "border-muted-foreground/30 text-muted-foreground",
  due_soon: "border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10",
  overdue: "border-destructive/40 text-destructive bg-destructive/10",
  done: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
};

const deadlineLabel: Record<KikDeadline["status"], string> = {
  upcoming: "Заплановано",
  due_soon: "Скоро дедлайн",
  overdue: "Прострочено",
  done: "Виконано",
};

const fmtMoney = (n: number, ccy: string) =>
  `${n.toLocaleString("uk-UA")} ${ccy}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "short", year: "numeric" });

interface KikRegistryPanelProps {
  cabinetId: string;
  reportingYear: number;
}

export function KikRegistryPanel({ cabinetId, reportingYear }: KikRegistryPanelProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const entities = useMemo(
    () =>
      getKikEntitiesForCabinet(cabinetId).filter((k) => k.reportingYear === reportingYear),
    [cabinetId, reportingYear],
  );

  if (activeId) {
    const entity = getKikEntityById(activeId);
    if (entity) {
      return <KikDetail entity={entity} onBack={() => setActiveId(null)} />;
    }
  }

  return (
    <KikList
      entities={entities}
      reportingYear={reportingYear}
      onOpen={(id) => setActiveId(id)}
    />
  );
}

// ─── List ────────────────────────────────────────────────────────────────────

function KikList({
  entities,
  reportingYear,
  onOpen,
}: {
  entities: KikEntity[];
  reportingYear: number;
  onOpen: (id: string) => void;
}) {
  const totalCompanies = entities.length;
  const reviewCount = entities.filter((e) => e.reviewRequired).length;
  const dueSoonCount = entities.reduce(
    (sum, e) => sum + e.deadlines.filter((d) => d.status === "due_soon" || d.status === "overdue").length,
    0,
  );

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile label="Компаній КІК" value={String(totalCompanies)} />
          <KpiTile label="Звітний рік" value={String(reportingYear)} />
          <KpiTile
            label="Потребує консультанта"
            value={String(reviewCount)}
            tone={reviewCount > 0 ? "warning" : "default"}
          />
          <KpiTile
            label="Дедлайни ≤30 днів"
            value={String(dueSoonCount)}
            tone={dueSoonCount > 0 ? "warning" : "default"}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Реєстр контрольованих іноземних компаній</h3>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => toast({ title: "Додавання КІК", description: "Демо: тут запуститься майстер додавання компанії." })}
        >
          <Plus className="size-3.5" /> Додати компанію
        </Button>
      </div>

      {entities.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Компаній КІК не зареєстровано для цього року.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entities.map((e) => (
            <KikListCard key={e.id} entity={e} onOpen={() => onOpen(e.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function KikListCard({ entity, onOpen }: { entity: KikEntity; onOpen: () => void }) {
  const depth = chainDepth(entity.ownership);
  const eff = effectiveShare(entity.ownership);
  const nextDeadline = [...entity.deadlines]
    .filter((d) => d.status !== "done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return (
    <Card
      className={cn(
        "cursor-pointer hover:border-primary/40 transition-colors",
        entity.reviewRequired && "border-amber-500/40",
      )}
      onClick={onOpen}
    >
      <CardContent className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Building2 className="size-4 text-muted-foreground" />
              <span className="font-medium truncate">{entity.name}</span>
              <Badge variant="outline" className="text-[10px] h-5">
                {JURISDICTION_LABELS[entity.jurisdiction]}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {entity.legalForm} · {entity.registrationNumber}
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px] h-5">{KIK_STATUS_LABELS[entity.status]}</Badge>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5", reportingTone[entity.reportingStatus])}
          >
            {KIK_REPORTING_STATUS_LABELS[entity.reportingStatus]}
          </Badge>
          {entity.reviewRequired && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300"
            >
              <AlertTriangle className="size-3" /> Перевірка консультанта
            </Badge>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-2 text-xs">
          <Mini label="Контроль" value={`${entity.controlShare}%`} hint={entity.controlType} />
          <Mini label="Ефективна частка" value={`${eff.toFixed(1)}%`} hint={`Ланцюг: ${depth} р.`} />
          <Mini
            label="Прибуток"
            value={fmtMoney(entity.financials.adjustedProfit, entity.financials.currency)}
          />
        </div>

        {nextDeadline && (
          <div
            className={cn(
              "rounded-md border px-2 py-1.5 flex items-center gap-2 text-xs",
              deadlineTone[nextDeadline.status],
            )}
          >
            <CalendarClock className="size-3.5" />
            <span className="flex-1 truncate">{nextDeadline.label}</span>
            <span className="tabular-nums">{fmtDate(nextDeadline.dueDate)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Detail ──────────────────────────────────────────────────────────────────

function KikDetail({ entity, onBack }: { entity: KikEntity; onBack: () => void }) {
  const depth = chainDepth(entity.ownership);
  const eff = effectiveShare(entity.ownership);

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
            <ArrowLeft className="size-4" /> До реєстру КІК
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => toast({ title: "Підготовка звіту КІК", description: "Демо: формування пакету для подання." })}
          >
            <FileText className="size-3.5" /> Сформувати звіт
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 md:p-5 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 className="size-5 text-primary" />
                  <h2 className="text-lg font-semibold">{entity.name}</h2>
                  <Badge variant="outline">{JURISDICTION_LABELS[entity.jurisdiction]}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {entity.legalForm} · Reg. {entity.registrationNumber} · з {fmtDate(entity.incorporatedAt)}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline" className="text-[10px] h-5">{KIK_STATUS_LABELS[entity.status]}</Badge>
                  <Badge variant="outline" className={cn("text-[10px] h-5", reportingTone[entity.reportingStatus])}>
                    {KIK_REPORTING_STATUS_LABELS[entity.reportingStatus]}
                  </Badge>
                </div>
              </div>
            </div>

            {entity.reviewRequired && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs flex gap-2">
                <ShieldCheck className="size-4 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-900 dark:text-amber-100">
                    Рекомендована перевірка консультанта
                  </div>
                  <div className="text-amber-900/80 dark:text-amber-100/80">{entity.reviewReason}</div>
                </div>
              </div>
            )}

            {entity.financials.exemptUnderTreaty && (
              <div className="rounded-md border border-blue-500/40 bg-blue-500/10 p-3 text-xs flex gap-2">
                <Info className="size-4 text-blue-700 dark:text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">Звільнення від звітування</div>
                  <div className="text-blue-900/80 dark:text-blue-100/80">
                    {entity.financials.exemptionReason}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Ownership */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm flex items-center gap-1.5">
                  <Building2 className="size-4 text-muted-foreground" /> Структура власності
                </h3>
                <Badge variant="outline" className="text-[10px] h-5">
                  {depth} {depth === 1 ? "рівень" : "рівні(в)"}
                </Badge>
              </div>
              <KikOwnershipTree root={entity.ownership} />
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <Mini label="Тип контролю" value={entity.controlType === "direct" ? "Прямий" : entity.controlType === "indirect" ? "Опосередкований" : "Фактичний"} />
                <Mini label="Ефективна частка" value={`${eff.toFixed(1)}%`} />
              </div>
            </CardContent>
          </Card>

          {/* Financials */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium text-sm flex items-center gap-1.5">
                <Coins className="size-4 text-muted-foreground" /> Фінансові показники, {entity.reportingYear}
              </h3>
              <div className="space-y-1.5 text-sm">
                <FinRow label="Виручка" value={fmtMoney(entity.financials.revenue, entity.financials.currency)} />
                <FinRow label="Чистий прибуток" value={fmtMoney(entity.financials.netProfit, entity.financials.currency)} />
                <FinRow
                  label="Скоригований прибуток"
                  hint="ст. 39².3 ПКУ — база для оподаткування КІК"
                  value={fmtMoney(entity.financials.adjustedProfit, entity.financials.currency)}
                  emphasize
                />
                <FinRow
                  label="Ефективна ставка податку"
                  value={`${entity.financials.effectiveTaxRate.toFixed(1)}%`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deadlines */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-medium text-sm flex items-center gap-1.5">
              <CalendarClock className="size-4 text-muted-foreground" /> Дедлайни звітування
            </h3>
            <div className="divide-y">
              {entity.deadlines.map((d) => (
                <div key={d.id} className="flex items-center gap-3 py-2 text-sm">
                  <div
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      d.status === "overdue" && "bg-destructive",
                      d.status === "due_soon" && "bg-amber-500",
                      d.status === "upcoming" && "bg-muted-foreground/40",
                      d.status === "done" && "bg-emerald-500",
                    )}
                  />
                  <span className="flex-1 truncate">{d.label}</span>
                  <Badge variant="outline" className={cn("text-[10px] h-5", deadlineTone[d.status])}>
                    {deadlineLabel[d.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground tabular-nums w-24 text-right">
                    {fmtDate(d.dueDate)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {entity.notes && (
          <Card>
            <CardContent className="p-3 text-xs text-muted-foreground flex gap-2">
              <Info className="size-3.5 shrink-0 mt-0.5" />
              <span>{entity.notes}</span>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}

// ─── Atoms ───────────────────────────────────────────────────────────────────

function KpiTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-lg font-semibold tabular-nums",
          tone === "warning" && "text-amber-700 dark:text-amber-300",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Mini({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function FinRow({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2",
        emphasize && "border-t pt-1.5 mt-1.5",
      )}
    >
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        {label}
        {hint && (
          <Tooltip>
            <TooltipTrigger>
              <Info className="size-3" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{hint}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className={cn("tabular-nums", emphasize && "font-semibold text-primary")}>{value}</div>
    </div>
  );
}

export default KikRegistryPanel;
