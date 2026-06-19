import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildUrlWithTrail } from "@/hooks/useBackTrail";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Bot,
  Calendar,
  Banknote,
  Users,
  FileCheck,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Report } from "@/config/reportsConfig";
import { formatCurrency } from "@/lib/formatters";

interface ChecklistAction {
  label: string;
  type: "navigate" | "external";
  url: string;
}

interface ReviewChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  severity: "error" | "warning" | "info";
  action?: ChecklistAction;
}

interface ReportReviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  onApprove: (reportId: string) => void;
  onReject: (reportId: string, reason: string) => void;
  onRequestCorrection: (reportId: string) => void;
}

export function ReportReviewSheet({
  open,
  onOpenChange,
  report,
  onApprove,
  onReject,
  onRequestCorrection,
}: ReportReviewSheetProps) {
  const navigate = useNavigate();
  
  const [checklist, setChecklist] = useState<ReviewChecklistItem[]>(() => {
    const baseChecklist: ReviewChecklistItem[] = [
      {
        id: "income-complete",
        label: "Дані з Книги доходів повні",
        description: "Всі операції за період внесено",
        checked: true,
        severity: "error",
        action: {
          label: "Відкрити Книгу доходів",
          type: "navigate",
          url: `/dashboard?cabinet=${encodeURIComponent(report?.cabinetId || "")}&tab=operations&subtab=income-book`,
        },
      },
      {
        id: "documents-attached",
        label: "Всі записи мають документи",
        description: "Первинні документи прикріплено",
        checked: true,
        severity: "warning",
        action: {
          label: "Переглянути документи",
          type: "navigate",
          url: `/dashboard?cabinet=${encodeURIComponent(report?.cabinetId || "")}&tab=operations&subtab=documents&filter=has-issues`,
        },
      },
      {
        id: "no-clarification",
        label: "Немає записів 'Потребує уточнення'",
        description: "Всі суми та контрагенти верифіковані",
        checked: false,
        severity: "error",
        action: {
          label: "Переглянути записи",
          type: "navigate",
          url: `/dashboard?cabinet=${encodeURIComponent(report?.cabinetId || "")}&tab=operations&subtab=income-book&quickFilter=needs-clarification`,
        },
      },
      {
        id: "calculation-valid",
        label: "Розрахунок відповідає законодавству",
        description: "Ставки та база оподаткування коректні",
        checked: true,
        severity: "error",
        action: {
          label: "Довідка ДПС",
          type: "external",
          url: "https://tax.gov.ua/zakonodavstvo/podatkove-zakonodavstvo/",
        },
      },
      {
        id: "requisites-valid",
        label: "Реквізити ФОП коректні",
        description: "РНОКПП, адреса, група ЄП актуальні",
        checked: true,
        severity: "error",
        action: {
          label: "Редагувати профіль",
          type: "navigate",
          url: "/settings/cabinet",
        },
      },
      {
        id: "form-code-valid",
        label: "Код форми відповідає типу звіту",
        description: `Форма ${report?.formCode || "не визначена"}`,
        checked: !!report?.formCode,
        severity: "warning",
      },
    ];

    // Для звітів з працівниками (1ДФ)
    if (report?.type === "1df") {
      baseChecklist.push({
        id: "employees-valid",
        label: "Дані працівників актуальні",
        description: "ПІБ, ІПН, нарахування перевірено",
        checked: true,
        severity: "error",
        action: {
          label: "Переглянути працівників",
          type: "navigate",
          url: "/employees",
        },
      });
    }

    return baseChecklist;
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  if (!report) return null;

  const dataQualityScore = report.draftProgress || 85;
  const allCriticalChecked = checklist
    .filter((item) => item.severity === "error")
    .every((item) => item.checked);

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked } : item
      )
    );
  };

  const handleApprove = () => {
    if (report && allCriticalChecked) {
      onApprove(report.id);
      onOpenChange(false);
    }
  };

  const handleReject = () => {
    if (report && rejectionReason.trim()) {
      onReject(report.id, rejectionReason);
      onOpenChange(false);
      setRejectionReason("");
      setShowRejectionForm(false);
    }
  };

  const handleCorrectiveAction = (action: ChecklistAction) => {
    if (action.type === "navigate") {
      // Тип 3: повна навігація з контексту звіту → залишаємо back-trail.
      const trailLabel = report ? `Звіт: ${report.name || report.periodLabel}` : "Звіт";
      onOpenChange(false);
      navigate(
        buildUrlWithTrail(action.url, {
          label: trailLabel,
          url: window.location.pathname + window.location.search,
        }),
      );
    } else if (action.type === "external") {
      window.open(action.url, "_blank", "noopener,noreferrer");
    }
  };

  // Mock comparison data
  const comparison = {
    income: {
      current: 450000,
      previous: 380000,
      change: ((450000 - 380000) / 380000) * 100,
    },
    tax: {
      current: 22500,
      previous: 19000,
      change: ((22500 - 19000) / 19000) * 100,
    },
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              На перевірку
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Bot className="h-3 w-3" />
              AI-generated
            </Badge>
          </div>
          <SheetTitle className="text-left">
            {report.type.toUpperCase()} — {report.periodLabel}
          </SheetTitle>
          <SheetDescription className="text-left">
            Перегляньте автоматично сформований звіт та підтвердіть для подання
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 mt-6 -mr-4 pr-4">
          <div className="space-y-6">
            {/* AI Summary */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">AI Summary</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Сформовано <span className="font-medium text-foreground">{report.type.toUpperCase()}</span> за{" "}
                <span className="font-medium text-foreground">{report.periodLabel}</span>.
                {comparison.income.current > 0 && (
                  <>
                    {" "}Загальний дохід:{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(comparison.income.current)}
                    </span>
                    , податок до сплати:{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(comparison.tax.current)}
                    </span>
                    .
                  </>
                )}
              </p>
            </div>

            {/* Data Quality Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Data Quality Score
                </h4>
                <span
                  className={cn(
                    "font-semibold",
                    dataQualityScore >= 90
                      ? "text-green-600"
                      : dataQualityScore >= 70
                      ? "text-amber-600"
                      : "text-red-600"
                  )}
                >
                  {dataQualityScore}%
                </span>
              </div>
              <Progress
                value={dataQualityScore}
                className={cn(
                  "h-2",
                  dataQualityScore >= 90
                    ? "[&>div]:bg-green-500"
                    : dataQualityScore >= 70
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-red-500"
                )}
              />
              {dataQualityScore < 90 && (
                <p className="text-xs text-muted-foreground">
                  Рекомендуємо перевірити дані перед затвердженням
                </p>
              )}
            </div>

            <Separator />

            {/* Period Comparison */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Порівняння з попереднім періодом</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Дохід</span>
                    {getChangeIcon(comparison.income.change)}
                  </div>
                  <p className="font-semibold">{formatCurrency(comparison.income.current)}</p>
                  <p className="text-xs text-muted-foreground">
                    {comparison.income.change > 0 ? "+" : ""}
                    {comparison.income.change.toFixed(1)}% vs минулий
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Податок</span>
                    {getChangeIcon(comparison.tax.change)}
                  </div>
                  <p className="font-semibold">{formatCurrency(comparison.tax.current)}</p>
                  <p className="text-xs text-muted-foreground">
                    {comparison.tax.change > 0 ? "+" : ""}
                    {comparison.tax.change.toFixed(1)}% vs минулий
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Review Checklist */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Чек-лист перевірки
              </h4>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3",
                      !item.checked && item.severity === "error" && "border-red-200 bg-red-50/50",
                      !item.checked && item.severity === "warning" && "border-amber-200 bg-amber-50/50"
                    )}
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={(checked) =>
                        handleChecklistChange(item.id, checked as boolean)
                      }
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={item.id}
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        {item.label}
                        {!item.checked && item.severity === "error" && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </label>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      {!item.checked && item.action && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-1 text-xs gap-1"
                          onClick={() => handleCorrectiveAction(item.action!)}
                        >
                          <ExternalLink className="h-3 w-3" />
                          {item.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Джерела даних</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <span>Книга доходів</span>
                  <Badge variant="secondary" className="ml-auto text-xs">12 записів</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Документи</span>
                  <Badge variant="secondary" className="ml-auto text-xs">8 файлів</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Контрагенти</span>
                  <Badge variant="secondary" className="ml-auto text-xs">5 записів</Badge>
                </div>
              </div>
            </div>

            {/* Rejection Form */}
            {showRejectionForm && (
              <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/50 p-4">
                <h4 className="font-medium text-sm text-red-700">Причина відхилення</h4>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Опишіть причину відхилення звіту..."
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                  >
                    Відхилити
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowRejectionForm(false);
                      setRejectionReason("");
                    }}
                  >
                    Скасувати
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex-shrink-0 flex gap-2 pt-4 border-t mt-auto">
          <Button
            className="flex-1"
            onClick={handleApprove}
            disabled={!allCriticalChecked}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Підтвердити
          </Button>
          <Button
            variant="outline"
            onClick={() => onRequestCorrection(report.id)}
          >
            Редагувати
          </Button>
          {!showRejectionForm && (
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowRejectionForm(true)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
