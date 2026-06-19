import { ExternalLink, FileCheck, Building2, CheckCircle2, AlertCircle, Clock, XCircle, FileText, FileEdit, KeyRound, Send, RotateCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Report } from "@/config/reportsConfig";
import { migrateReportStatus } from "@/config/reportsConfig";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { ReportDraftPreview } from "./ReportDraftPreview";

interface ReportSubmissionSectionProps {
  report: Report;
  onCreateDraft?: (report: Report) => void;
  onSubmitReport?: (report: Report) => void;
  onEditDraft?: (report: Report) => void;
  onCreateCorrection?: (report: Report) => void;
}

const TAX_CABINET_URL = "https://cabinet.tax.gov.ua";

interface ChecklistItem {
  label: string;
  ok: boolean;
  warning?: boolean;
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const Icon = item.ok ? CheckCircle2 : item.warning ? AlertCircle : XCircle;
  const colorClass = item.ok
    ? "text-emerald-600 dark:text-emerald-400"
    : item.warning
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`h-4 w-4 ${colorClass} shrink-0`} />
      <span className={item.ok ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
    </div>
  );
}

export function ReportSubmissionSection({
  report,
  onCreateDraft,
  onSubmitReport,
  onEditDraft,
  onCreateCorrection,
}: ReportSubmissionSectionProps) {
  const { toast } = useToast();
  const status = migrateReportStatus(report.status);

  const isSubmitted = status === "submitted";
  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";

  // Чернетка готова до перевірки/подання (review або approved)
  const isDraftReady = status === "review" || status === "approved";

  // Чернетку ще не створено (scheduled / processing)
  const isDraftNotCreated = status === "scheduled" || status === "processing";

  // Готовність чек-листа
  const checklist: ChecklistItem[] = [
    { label: "Реквізити платника заповнено", ok: true },
    { label: `Звітний період: ${report.periodLabel}`, ok: true },
    { label: "Суми звірено з обліком", ok: !!report.calculation },
    { label: "КЕП готовий до підпису", ok: false, warning: true },
  ];
  const allRequiredOk = checklist.filter((i) => !i.warning).every((i) => i.ok);

  const handleCreateDraft = () => {
    if (onCreateDraft) {
      onCreateDraft(report);
    } else {
      toast({
        title: "Чернетку формується",
        description: `${report.name} буде готова до перевірки за хвилину`,
      });
    }
  };

  const handleSubmit = () => {
    window.open(TAX_CABINET_URL, "_blank", "noopener,noreferrer");
    if (onSubmitReport) {
      onSubmitReport(report);
    } else {
      toast({
        title: "Перехід до Кабінету ДПС",
        description: "Підпишіть звіт КЕП у вкладці, що відкрилася",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            Подання звіту
          </CardTitle>
          {isSubmitted && (
            <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Подано
            </Badge>
          )}
          {isDraftReady && (
            <Badge variant="secondary" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30">
              <FileEdit className="h-3 w-3 mr-1" />
              Чернетка
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Канал подання — статична мітка */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-background">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Електронний кабінет ДПС</p>
              <p className="text-xs text-muted-foreground">cabinet.tax.gov.ua · потребує КЕП</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 text-xs">
            <KeyRound className="h-3 w-3" />
            КЕП
          </Badge>
        </div>

        {/* Статус: Подано */}
        {isSubmitted && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Звіт подано, очікуємо відповіді ДПС
                </p>
                {report.receipt1 && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    <span className="font-medium">Квитанція №1:</span> {report.receipt1.number}
                  </p>
                )}
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Очікуваний термін відповіді: до 48 годин
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Статус: Прийнято */}
        {isAccepted && (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  Звіт прийнято ДПС
                </p>
                <div className="mt-2 space-y-1">
                  {report.receipt2 && (
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      <span className="font-medium">Квитанція №2:</span> {report.receipt2.number}
                    </p>
                  )}
                  {report.acceptedDate && (
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      <span className="font-medium">Дата прийняття:</span>{" "}
                      {format(new Date(report.acceptedDate), "dd.MM.yyyy", { locale: uk })}
                    </p>
                  )}
                </div>
                {report.receipt2 && (
                  <Button variant="outline" size="sm" className="mt-3 gap-2 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                    <FileText className="h-3.5 w-3.5" />
                    Переглянути квитанцію
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Статус: Відхилено */}
        {isRejected && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Звіт відхилено ДПС
                </p>
                {report.rejectionDetails && (
                  <>
                    <div className="mt-2 p-2 bg-red-100/50 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200">
                      <p className="font-medium">Причина ({report.rejectionDetails.code || "—"}):</p>
                      <p className="mt-0.5">{report.rejectionDetails.reason}</p>
                    </div>
                    {report.rejectionDetails.correctionDeadline && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        Термін виправлення: до{" "}
                        {format(new Date(report.rejectionDetails.correctionDeadline), "dd.MM.yyyy", { locale: uk })}
                      </p>
                    )}
                  </>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                    onClick={() => onCreateCorrection?.(report)}
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    Виправити
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Стан 1: Чернетку ще не створено → "Створити звіт" */}
        {isDraftNotCreated && (
          <>
            {new Date(report.deadline) < new Date() && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Термін подання минув. Рекомендуємо подати звіт якнайшвидше для уникнення штрафних санкцій.
                  </p>
                </div>
              </div>
            )}

            <Button onClick={handleCreateDraft} className="w-full gap-2">
              <FileEdit className="h-4 w-4" />
              Створити звіт
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Сформуємо чернетку офіційної форми ДПС для перевірки. Подання — окремим кроком.
            </p>
          </>
        )}

        {/* Стан 2: Чернетка готова до перевірки/подання */}
        {isDraftReady && (
          <>
            {/* Превʼю офіційної форми */}
            <ReportDraftPreview report={report} />

            {/* Чек-ліст готовності */}
            <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Готовність до подання
              </p>
              {checklist.map((item, idx) => (
                <ChecklistRow key={idx} item={item} />
              ))}
            </div>

            {new Date(report.deadline) < new Date() && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Термін подання минув. Подайте звіт якнайшвидше для уникнення штрафних санкцій.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleSubmit}
                className="flex-1 gap-2"
                disabled={!allRequiredOk}
              >
                <Send className="h-4 w-4" />
                Подати звіт
              </Button>
              {onEditDraft && (
                <Button
                  variant="outline"
                  onClick={() => onEditDraft(report)}
                  className="gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Редагувати
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
              <ExternalLink className="h-3 w-3" />
              Відкриється офіційний Кабінет ДПС у новій вкладці для підпису КЕП
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
