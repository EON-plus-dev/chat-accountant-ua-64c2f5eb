/**
 * Сторінка адміністративного/судового оскарження ППР (D6 плану).
 *
 * Маршрут: /appeals/:auditId
 *
 * Показує 6-крокову лінію оскарження для конкретної перевірки:
 *   1. Адмінскарга в обласне ГУ ДПС
 *   2. Повторна адмінскарга в ДПС України
 *   3. Окружний адмінсуд
 *   4. Апеляційний адмінсуд
 *   5. Касаційний адмінсуд (Верховний Суд)
 *   6. Конституційне подання (опційно)
 *
 * Дедлайни рахуються від вручення ППР (10 р.д. для адмінскарги, 1095 днів для суду).
 */

import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { uk } from "date-fns/locale";
import {
  ArrowLeft,
  Check,
  Clock,
  AlertCircle,
  Scale,
  FileText,
  Building2,
  Landmark,
  Gavel,
  Shield,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BackTrailBar } from "@/components/shared/BackTrailBar";
import { cn } from "@/lib/utils";
import { buildPaymentDraftFromPPR } from "@/lib/auditPaymentBridge";
import {
  demoAudits,
  getAppealsForAudit,
  getPPRForAudit,
  getActForAudit,
  APPEAL_INSTANCE_LABEL,
  APPEAL_STATUS_LABEL,
  type AppealInstance,
  type TaxAppeal,
} from "@/config/taxAuditsConfig";

const APPEAL_INSTANCES: AppealInstance[] = [
  "admin-regional",
  "admin-central",
  "court-first",
  "court-appeal",
  "court-cassation",
  "constitutional",
];

const INSTANCE_ICON: Record<AppealInstance, typeof Building2> = {
  "admin-regional": Building2,
  "admin-central": Landmark,
  "court-first": Scale,
  "court-appeal": Scale,
  "court-cassation": Gavel,
  "constitutional": Shield,
};

const STATUS_TONE: Record<string, string> = {
  satisfied: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  "in-review": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  filed: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  draft: "bg-muted text-muted-foreground border-border",
};

function formatUaDate(iso: string): string {
  return format(parseISO(iso), "d MMMM yyyy", { locale: uk });
}

function formatMoney(amount: number): string {
  return `₴${amount.toLocaleString("uk-UA")}`;
}

const AppealDetailPage = () => {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const audit = useMemo(() => demoAudits.find((a) => a.id === auditId), [auditId]);
  const appeals = useMemo(() => (auditId ? getAppealsForAudit(auditId) : []), [auditId]);
  const ppr = useMemo(() => (auditId ? getPPRForAudit(auditId) : undefined), [auditId]);
  const act = useMemo(() => (auditId ? getActForAudit(auditId) : undefined), [auditId]);

  const handlePayPpr = () => {
    if (!ppr || !audit) return;
    const draft = buildPaymentDraftFromPPR(ppr, audit, audit.id);
    toast({
      title: "Чернетку платежу створено",
      description: `${draft.taxTypeLabel} · ₴${draft.amountToPay.toLocaleString("uk-UA")}. Перейдіть у «Платежі», щоб підтвердити.`,
    });
  };

  if (!audit) {
    return (
      <div className="container max-w-3xl mx-auto p-6">
        <BackTrailBar />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Перевірку не знайдено</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              На дашборд
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Map appeals по інстанції для швидкого пошуку
  const appealsByInstance = new Map<AppealInstance, TaxAppeal>();
  for (const a of appeals) appealsByInstance.set(a.instance, a);

  const lastFiledStep = appeals.length > 0
    ? Math.max(...appeals.map((a) => a.step))
    : -1;

  const totalDisputed = ppr?.totalAmount ?? 0;
  const totalRelief = appeals.reduce((sum, a) => sum + (a.reliefAmount ?? 0), 0);

  return (
    <div className="container max-w-5xl mx-auto p-4 sm:p-6">
      <BackTrailBar />

      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          До перевірок
        </Button>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Оскарження ППР
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Перевірка №{audit.orderNumber} · {audit.taxOffice}
            </p>
          </div>
          {ppr && (
            <Badge variant="outline" className="text-base px-3 py-1.5">
              {formatMoney(ppr.totalAmount)} оскаржується
            </Badge>
          )}
        </div>
      </div>

      {/* Контекст: акт + ППР */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {act && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Акт перевірки
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-medium">{act.number}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Складено {formatUaDate(act.issuedDate)} · вручено {formatUaDate(act.servedDate)}
              </p>
              {act.additionalTax !== undefined && (
                <p className="text-sm mt-2">
                  Донараховано: <strong>{formatMoney(act.additionalTax)}</strong>
                </p>
              )}
            </CardContent>
          </Card>
        )}
        {ppr && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Scale className="h-4 w-4" />
                ППР {ppr.form}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-medium">{ppr.number}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Прийнято {formatUaDate(ppr.issuedDate)} · вручено {formatUaDate(ppr.servedDate)}
              </p>
              <div className="text-sm mt-2 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Основна сума:</span>
                  <span>{formatMoney(ppr.principalAmount)}</span>
                </div>
                {ppr.fineAmount ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Штраф:</span>
                    <span>{formatMoney(ppr.fineAmount)}</span>
                  </div>
                ) : null}
                {ppr.penaltyAmount ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Пеня:</span>
                    <span>{formatMoney(ppr.penaltyAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-medium pt-1 border-t mt-1">
                  <span>Усього:</span>
                  <span>{formatMoney(ppr.totalAmount)}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 gap-1.5"
                onClick={handlePayPpr}
              >
                <Wallet className="h-3.5 w-3.5" />
                Сплатити за ППР
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 6-крокова лінія оскарження */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Етапи оскарження</CardTitle>
          <p className="text-sm text-muted-foreground">
            ПКУ ст. 56 (адмін.), ст. 102 + КАСУ (суд). Дедлайн рахується від
            дати вручення ППР.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <ol className="space-y-3">
            {APPEAL_INSTANCES.map((instance, idx) => {
              const appeal = appealsByInstance.get(instance);
              const Icon = INSTANCE_ICON[instance];
              const isCompleted = appeal && ["satisfied", "partial", "rejected"].includes(appeal.status);
              const isActive = appeal && ["filed", "in-review", "draft"].includes(appeal.status);
              const isPending = !appeal && idx <= lastFiledStep + 1;
              const isFuture = !appeal && idx > lastFiledStep + 1;

              return (
                <li
                  key={instance}
                  className={cn(
                    "rounded-lg border p-4 flex gap-3",
                    isCompleted && "bg-muted/30",
                    isActive && "border-primary bg-primary/5",
                    isFuture && "opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2",
                      isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                      isActive && "bg-primary border-primary text-primary-foreground",
                      isPending && "bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/30",
                      isFuture && "bg-muted border-border text-muted-foreground",
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="font-medium text-foreground">
                        {idx + 1}. {APPEAL_INSTANCE_LABEL[instance]}
                      </p>
                      {appeal && (
                        <Badge
                          variant="outline"
                          className={cn("text-xs", STATUS_TONE[appeal.status])}
                        >
                          {APPEAL_STATUS_LABEL[appeal.status]}
                        </Badge>
                      )}
                    </div>

                    {appeal ? (
                      <div className="mt-1.5 text-sm text-muted-foreground space-y-0.5">
                        {appeal.number && <p>№ {appeal.number}</p>}
                        {appeal.filedDate && (
                          <p>Подано: {formatUaDate(appeal.filedDate)}</p>
                        )}
                        {appeal.reviewDeadline && (
                          <p>
                            <Clock className="h-3 w-3 inline mr-1" />
                            Розгляд до: {formatUaDate(appeal.reviewDeadline)}
                          </p>
                        )}
                        {appeal.decision && (
                          <p className="text-foreground mt-1.5">
                            <strong>Рішення:</strong> {appeal.decision}
                            {appeal.decisionDate && (
                              <span className="text-muted-foreground"> ({formatUaDate(appeal.decisionDate)})</span>
                            )}
                          </p>
                        )}
                        {appeal.reliefAmount !== undefined && appeal.reliefAmount > 0 && (
                          <p className="text-emerald-600 dark:text-emerald-400">
                            Звільнено: {formatMoney(appeal.reliefAmount)}
                          </p>
                        )}
                      </div>
                    ) : isPending && ppr ? (
                      <div className="mt-1.5 text-sm">
                        <p className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Доступно до подання
                        </p>
                        {idx <= 1 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Дедлайн: {formatUaDate(ppr.appealAdminDeadline)} (10 р.д. з вручення)
                          </p>
                        )}
                        {idx === 2 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Дедлайн: 1095 днів з вручення ППР (ст. 102 ПКУ)
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isFuture ? "Доступно після проходження попередньої інстанції" : "Не подавалося"}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {/* Підсумок */}
      {appeals.length > 0 && totalDisputed > 0 && (
        <Card className="mt-4">
          <CardContent className="py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Сума оскарження</p>
              <p className="text-xl font-semibold">{formatMoney(totalDisputed)}</p>
            </div>
            {totalRelief > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Звільнено за результатом</p>
                <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(totalRelief)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppealDetailPage;
