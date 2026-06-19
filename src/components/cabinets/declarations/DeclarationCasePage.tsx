import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ShieldCheck,
  UserPlus,
  Users,
  Copy,
  FileSignature,
  Clock,
  AlertCircle,
  CheckCircle2,
  History,
  Sparkles,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getDeclarationCaseById,
  STATUS_LABELS,
  STATUS_TONE,
  FILING_STATUS_LABELS,
  RESIDENCY_LABELS,
  PROFILE_TAG_LABELS,
  type CaseAuditEntry,
} from "@/config/demoCabinets/declarationCases";
import { DeclarationProfilePanel } from "./DeclarationProfilePanel";
import { KikRegistryPanel } from "./KikRegistryPanel";
import { getKikEntitiesForCabinet } from "@/config/demoCabinets/kikRegistryConfig";
import { useDemoRoleView } from "@/contexts/DemoRoleViewContext";
import { RoleViewSwitcher } from "./RoleViewSwitcher";
import { ConsultantReviewPanel } from "./ConsultantReviewPanel";
import { DeclarationWizard } from "./DeclarationWizard";
import { SubmittedDeclarationView } from "./SubmittedDeclarationView";
import { NbuFxPanel } from "./NbuFxPanel";
import { AuditLogTimeline } from "./AuditLogTimeline";
import { DeclarationAutoStatusCard } from "./DeclarationAutoStatusCard";
import { buildDeclarationSnapshot } from "@/config/demoCabinets/declarationSnapshot";
import { AmendmentDeltaCard } from "./shared/AmendmentDeltaCard";
import { GeneratedDocumentsBlock } from "./shared/GeneratedDocumentsBlock";


const toneClass: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  primary: "bg-primary/10 text-primary border-primary/30",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
};

const fmt = (n?: number) =>
  n == null ? "—" : `${n.toLocaleString("uk-UA")} ₴`;

const fmtDateTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" });
};

interface DeclarationCasePageProps {
  caseId: string;
  onBack: () => void;
}

export function DeclarationCasePage({ caseId, onBack }: DeclarationCasePageProps) {
  const caseItem = getDeclarationCaseById(caseId);
  const [trusteeOpen, setTrusteeOpen] = useState(false);
  const { isOwner, isTrustee, isConsultant, canSign } = useDemoRoleView();

  if (!caseItem) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="size-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Кейс не знайдено</p>
          <Button variant="outline" className="mt-4" onClick={onBack}>
            <ArrowLeft className="size-4 mr-1" /> Назад до списку
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tone = STATUS_TONE[caseItem.status];
  const isLocked = caseItem.status === "in_review";
  const isFinal = caseItem.status === "submitted" || caseItem.status === "accepted";
  const hasKik = caseItem.profileTags.includes("has_kik");
  const kikCount = useMemo(
    () =>
      hasKik
        ? getKikEntitiesForCabinet(caseItem.cabinetId).filter(
            (k) => k.reportingYear === caseItem.reportingYear,
          ).length
        : 0,
    [hasKik, caseItem.cabinetId, caseItem.reportingYear],
  );

  const handleAction = (label: string) => {
    toast({
      title: label,
      description: `Демо: дія "${label}" виконана для кейсу ${caseItem.reportingYear} р.`,
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Sticky header */}
        <Card className="sticky top-0 z-10 shadow-sm border-primary/20">
          <CardContent className="p-4 md:p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={onBack} className="h-7 px-2 -ml-2">
                    <ArrowLeft className="size-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">Декларації / Кейс</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg md:text-xl font-semibold leading-tight">{caseItem.title}</h2>
                  <Badge variant="outline" className="font-mono">{caseItem.reportingYear}</Badge>
                  {caseItem.amendmentOf && (
                    <Badge variant="outline" className="gap-1">
                      <Copy className="size-3" /> Уточнююча №{caseItem.amendmentNumber ?? 1}
                    </Badge>
                  )}
                  <Badge className={cn("gap-1", toneClass[tone])} variant="outline">
                    {STATUS_LABELS[caseItem.status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3" /> Дедлайн: 01.05.{caseItem.reportingYear + 1}
                  </span>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                      <FileText className="size-3" /> {caseItem.rulesVersion}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Версія правил розрахунку, актуальна на звітний рік. При зміні законодавства правила версіонуються.
                    </TooltipContent>
                  </Tooltip>
                  <span>{FILING_STATUS_LABELS[caseItem.filingStatus]}</span>
                  <span>{RESIDENCY_LABELS[caseItem.residencyStatus]}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {isOwner && !isFinal && (
                  <Button variant="outline" size="sm" onClick={() => setTrusteeOpen(true)} className="gap-1">
                    <UserPlus className="size-3.5" /> Запросити довірену особу
                  </Button>
                )}
                {!isConsultant && !isFinal && !isLocked && (
                  <Button variant="outline" size="sm" onClick={() => handleAction("Запит на перевірку консультанта")} className="gap-1">
                    <ShieldCheck className="size-3.5" /> Запросити консультанта
                  </Button>
                )}
                {isOwner && isFinal && (
                  <Button variant="outline" size="sm" onClick={() => handleAction("Створення уточнюючої декларації")} className="gap-1">
                    <Copy className="size-3.5" /> Створити уточнюючу
                  </Button>
                )}
                {!isFinal && !isLocked && canSign && (
                  <Button size="sm" onClick={() => handleAction("Перейти до підпису та подання")} className="gap-1">
                    <FileSignature className="size-3.5" /> Підготувати до подання
                  </Button>
                )}
                {!isFinal && !isLocked && !canSign && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button size="sm" disabled className="gap-1">
                          <FileSignature className="size-3.5" /> Підпис недоступний
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Підписання декларації — виключно власник кабінету (§ 2 ТЗ).
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Progress + lock notice */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${caseItem.progressPercent}%` }} />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{caseItem.progressPercent}%</span>
            </div>

            {isLocked && (
              <div className="flex items-start gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-900 dark:text-blue-100">
                <Clock className="size-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">Кейс на перевірці у консультанта {caseItem.consultantName ?? "Андрія"}</div>
                  <div className="opacity-80">
                    Редагування заблоковано. SLA до: <span className="font-medium">{fmtDateTime(caseItem.reviewSlaDueAt)}</span>
                    {caseItem.reviewReason && <> · {caseItem.reviewReason}</>}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Body grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Огляд</TabsTrigger>
              <TabsTrigger value="declaration">Декларація</TabsTrigger>
              {hasKik && <TabsTrigger value="kik">КІК ({kikCount})</TabsTrigger>}
              <TabsTrigger value="audit">Журнал ({caseItem.auditLog.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3 mt-0">
              {caseItem.amendmentOf && (() => {
                const original = getDeclarationCaseById(caseItem.amendmentOf);
                if (!original) return null;
                return (
                  <AmendmentDeltaCard
                    originalYear={original.reportingYear}
                    originalSubmittedAt={original.submittedAt}
                    deltaIncome={(caseItem.totalIncome ?? 0) - (original.totalIncome ?? 0)}
                    deltaTax={(caseItem.totalTax ?? 0) - (original.totalTax ?? 0)}
                  />
                );
              })()}
              {!caseItem.signedAt && (
                <DeclarationAutoStatusCard snapshot={buildDeclarationSnapshot(caseItem)} />
              )}
              {isConsultant && (caseItem.status === "in_review" || caseItem.status === "reviewed") && (
                <ConsultantReviewPanel caseItem={caseItem} />
              )}
              {(() => {
                const hasRefund = (caseItem.totalRefund ?? 0) > 0;
                return (
                  <Card>
                    <CardContent
                      className={cn(
                        "p-4 grid grid-cols-1 gap-3",
                        hasRefund ? "md:grid-cols-3" : "md:grid-cols-2",
                      )}
                    >
                      <SummaryTile label="Загальний дохід" value={fmt(caseItem.totalIncome)} />
                      <SummaryTile label="Податок до сплати" value={fmt(caseItem.totalTax)} tone="warning" />
                      {hasRefund && (
                        <SummaryTile
                          label="Повернення (знижка)"
                          value={fmt(caseItem.totalRefund)}
                          tone="success"
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Теги профілю</h3>
                    <Button variant="ghost" size="sm" onClick={() => handleAction("Перепройти профілювання")} className="gap-1 text-xs">
                      <Sparkles className="size-3" /> Оновити профіль
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {caseItem.profileTags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Профіль ще не пройдено</span>
                    ) : (
                      caseItem.profileTags.map((t) => (
                        <Badge key={t} variant="secondary">{PROFILE_TAG_LABELS[t]}</Badge>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Теги визначають додатки декларації, перелік потрібних документів і набір правил розрахунку.
                  </p>
                </CardContent>
              </Card>

              {caseItem.signedAt && (
                <Card>
                  <CardContent className="p-4 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldCheck className="size-4 text-primary" /> Підписано та подано
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      <div className="text-muted-foreground">Дата підпису</div>
                      <div className="tabular-nums">{fmtDateTime(caseItem.signedAt)}</div>
                      <div className="text-muted-foreground">IP підписанта</div>
                      <div className="font-mono">{caseItem.signerIp}</div>
                      <div className="text-muted-foreground">Hash даних</div>
                      <div className="font-mono break-all">{caseItem.dataHash}</div>
                      <div className="text-muted-foreground">Версія правил</div>
                      <div className="font-mono">{caseItem.rulesVersion}</div>
                      {caseItem.submittedAt && (
                        <>
                          <div className="text-muted-foreground">Подано до ДПС</div>
                          <div className="tabular-nums">{fmtDateTime(caseItem.submittedAt)}</div>
                        </>
                      )}
                      {caseItem.acceptedAt && (
                        <>
                          <div className="text-muted-foreground">Прийнято ДПС</div>
                          <div className="tabular-nums">{fmtDateTime(caseItem.acceptedAt)}</div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="declaration" className="mt-0 space-y-4">
              <DeclarationProfilePanel caseItem={caseItem} />
              {isFinal ? (
                <SubmittedDeclarationView caseItem={caseItem} />
              ) : (
                <DeclarationWizard caseItem={caseItem} />
              )}
              {(hasKik || caseItem.profileTags.includes("has_foreign_income")) && (
                <NbuFxPanel reportingYear={caseItem.reportingYear} />
              )}
            </TabsContent>

            {hasKik && (
              <TabsContent value="kik" className="mt-0">
                <KikRegistryPanel cabinetId={caseItem.cabinetId} reportingYear={caseItem.reportingYear} />
              </TabsContent>
            )}

            <TabsContent value="audit" className="mt-0">
              <AuditLogTimeline entries={caseItem.auditLog} />
            </TabsContent>
          </Tabs>

          {/* Sidebar */}
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium flex items-center gap-2 text-sm">
                  <Users className="size-4" /> Довірені особи
                </h3>
                {caseItem.trustees.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Не запрошено</p>
                ) : (
                  caseItem.trustees.map((t) => (
                    <div key={t.id} className="rounded border p-2 space-y-1">
                      <div className="text-sm font-medium">{t.name ?? t.email}</div>
                      <div className="text-xs text-muted-foreground">{t.email}</div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-[10px] h-5">{t.status === "active" ? "Активна" : t.status === "pending" ? "Очікує" : "Скасовано"}</Badge>
                        {t.canEdit && <Badge variant="secondary" className="text-[10px] h-5">Редагування</Badge>}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-[10px] h-5 cursor-help">Без підпису</Badge>
                          </TooltipTrigger>
                          <TooltipContent>Підписання декларації — виключно власник кабінету</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => setTrusteeOpen(true)}>
                  <UserPlus className="size-3.5" /> Запросити
                </Button>
              </CardContent>
            </Card>

            <GeneratedDocumentsBlock
              docs={[
                {
                  formCode: caseItem.amendmentOf ? "F0100114-У" : "F0100114",
                  title: caseItem.amendmentOf
                    ? "Уточнююча декларація про майновий стан і доходи"
                    : "Декларація про майновий стан і доходи",
                  status: isFinal
                    ? "submitted"
                    : (caseItem.status === "ready_to_confirm" || caseItem.status === "confirmed")
                    ? "ready"
                    : "draft",
                },
                ...(hasKik
                  ? [{
                      formCode: "J0108601",
                      title: "Звіт про КІК (додаток)",
                      status: (isFinal ? "submitted" : "draft") as "submitted" | "draft",
                    }]
                  : []),
              ]}
            />

            <Card>
              <CardContent className="p-4 space-y-2 text-xs">
                <h3 className="font-medium text-sm">Метадані</h3>
                <Row label="ID кейсу" value={<span className="font-mono">{caseItem.id}</span>} />
                <Separator />
                <Row label="Створено" value={fmtDateTime(caseItem.createdAt)} />
                <Row label="Оновлено" value={fmtDateTime(caseItem.updatedAt)} />
                {caseItem.amendmentOf && (
                  <Row label="Уточнює" value={<span className="font-mono">{caseItem.amendmentOf}</span>} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trustee invite dialog */}
        <Dialog open={trusteeOpen} onOpenChange={setTrusteeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Запросити довірену особу</DialogTitle>
              <DialogDescription>
                Довірена особа отримає доступ до перегляду та редагування кейсу. Підписувати декларацію може лише власник.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="trustee-email">Email</Label>
                <Input id="trustee-email" type="email" placeholder="accountant@example.com" />
              </div>
              <div>
                <Label htmlFor="trustee-name">Імʼя (необовʼязково)</Label>
                <Input id="trustee-name" placeholder="Олена Бухгалтер" />
              </div>
              <div className="space-y-2 rounded border p-3">
                <div className="text-xs font-medium">Права</div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox defaultChecked /> Перегляд
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox defaultChecked /> Редагування
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox disabled /> Підписання — недоступно для довірених осіб
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTrusteeOpen(false)}>Скасувати</Button>
              <Button onClick={() => {
                setTrusteeOpen(false);
                toast({ title: "Запрошення надіслано", description: "Демо: довірена особа отримає посилання на email" });
              }}>Надіслати запрошення</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function SummaryTile({ label, value, tone = "primary" }: { label: string; value: string; tone?: keyof typeof toneClass }) {
  return (
    <div className={cn("rounded-lg border px-3 py-3", toneClass[tone])}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

const eventIcon: Record<CaseAuditEntry["eventType"], React.ReactNode> = {
  field_changed: <FileText className="size-3.5" />,
  document_uploaded: <FileText className="size-3.5" />,
  status_changed: <CheckCircle2 className="size-3.5" />,
  review_requested: <ShieldCheck className="size-3.5" />,
  review_completed: <CheckCircle2 className="size-3.5" />,
  signed: <FileSignature className="size-3.5" />,
  submitted: <CheckCircle2 className="size-3.5" />,
  trustee_invited: <UserPlus className="size-3.5" />,
  comment: <AlertCircle className="size-3.5" />,
};

const eventLabel: Record<CaseAuditEntry["eventType"], string> = {
  field_changed: "Зміна поля",
  document_uploaded: "Завантажено документ",
  status_changed: "Зміна статусу",
  review_requested: "Запит перевірки",
  review_completed: "Перевірку завершено",
  signed: "Підписано",
  submitted: "Подано до ДПС",
  trustee_invited: "Запрошено довірену особу",
  comment: "Коментар",
};

function AuditEntryRow({ entry }: { entry: CaseAuditEntry }) {
  return (
    <div className="px-4 py-3 flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{eventIcon[entry.eventType]}</div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{eventLabel[entry.eventType]}</span>
          <Badge variant="outline" className="text-[10px] h-5">{entry.actorName}</Badge>
          <span className="text-xs text-muted-foreground tabular-nums">{fmtDateTime(entry.createdAt)}</span>
        </div>
        {(entry.fieldPath || entry.oldValue || entry.newValue) && (
          <div className="text-xs text-muted-foreground">
            {entry.fieldPath && <span className="font-mono">{entry.fieldPath}</span>}
            {entry.oldValue && entry.newValue && <> · <span>{entry.oldValue} → {entry.newValue}</span></>}
            {!entry.oldValue && entry.newValue && <> · {entry.newValue}</>}
          </div>
        )}
        {entry.reason && <div className="text-xs italic text-muted-foreground">«{entry.reason}»</div>}
        {entry.ip && <div className="text-[10px] text-muted-foreground font-mono">IP: {entry.ip}</div>}
      </div>
    </div>
  );
}
