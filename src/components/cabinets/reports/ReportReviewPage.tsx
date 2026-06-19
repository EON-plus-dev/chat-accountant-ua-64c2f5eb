import { useState, useMemo, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { buildUrlWithTrail } from "@/hooks/useBackTrail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Bot,
  Banknote,
  Users,
  FileCheck,
  FileCheck2,
  FileEdit,
  GitCompareArrows,
  Link2,
  ShieldCheck,
  ExternalLink,
  Database,
  Clock,
  Send,
  Sparkles,
  Receipt,
  MessageSquare,
  Wand2,
  Eye,
  Download,
  ClipboardCheck,
  FileDown,
  ChevronDown,
} from "lucide-react";
import { mockCabinets } from "@/config/cabinetsData";
import { ReportFormPreview } from "./ReportFormPreview";
import {
  downloadReportPdf,
  downloadReceiptPdf,
  downloadRejectionNoticePdf,
} from "./pdf-templates/downloadHelpers";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Report, ReportType, ReportStatus } from "@/config/reportsConfig";
import {
  reportTypeConfig,
  migrateReportStatus,
  reportStatusConfig,
  getCanonicalStatusLabel,
  getStatusVariant,
  getStatusBadgeClasses,
} from "@/config/reportsConfig";
import { formatCurrency } from "@/lib/formatters";
import { ReportDraftPreview } from "./ReportDraftPreview";
import { ReportSectionsList } from "./ReportSectionsList";
import { ReportSourceTrail } from "./ReportSourceTrail";
import { ReportLifecycleStepper } from "./ReportLifecycleStepper";

import { RelatedPaymentsSection, type MarkPaidPayload } from "./RelatedPaymentsSection";
import { PayDialog } from "./PayDialog";
import { getReportPaymentTotals, getRelatedPayments } from "@/lib/reportPayments";
import { EmployeesLinkedSection } from "./EmployeesLinkedSection";
import { IndividualPitBreakdown } from "./IndividualPitBreakdown";
import { DeclarationWizard } from "@/components/cabinets/declaration/DeclarationWizard";
import { PaymentSlipGenerator } from "@/components/cabinets/declaration/PaymentSlipGenerator";
import { NotificationCenter } from "@/components/cabinets/declaration/NotificationCenter";

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

interface ReportReviewPageProps {
  report: Report;
  previousReport?: Report | null;
  onBack: () => void;
  onApprove: (reportId: string) => void;
  onReject: (reportId: string, reason: string) => void;
  onRequestCorrection: (reportId: string) => void;
  onCreateDraft?: (report: Report) => void;
  onSubmitReport?: (report: Report) => void;
  onChatPromptInsert?: (prompt: string) => void;
  onNavigateToPayment?: (paymentId: string) => void;
  onNavigateToEmployee?: (employeeId: string) => void;
  onMarkPaid?: (reportId: string, data: MarkPaidPayload) => void;
  allReports?: Report[];
  onNavigateToReport?: (reportId: string) => void;
}

// Офіційна назва типу звіту (UA)
const TYPE_LABEL_FALLBACK: Record<ReportType, string> = {
  ep: "Декларація ЄП",
  esv: "Звіт ЄСВ",
  "esv-emp": "ЄСВ за найманих",
  vz: "Військовий збір",
  "vz-emp": "Військовий збір (наймані)",
  "1df": "Податковий розрахунок (4ДФ)",
  mpz: "Мінімальне податкове зобов'язання",
  pdfo: "ПДФО",
  stat: "Статистичний звіт",
  other: "Інший звіт",
};

function getOfficialTypeLabel(report: Report): string {
  return (
    report.typeLabel ||
    reportTypeConfig[report.type]?.label ||
    TYPE_LABEL_FALLBACK[report.type] ||
    "Звіт"
  );
}

interface MetricLabels {
  baseLabel: string;
  taxLabel: string;
}

function getMetricLabels(type: ReportType): MetricLabels {
  switch (type) {
    case "ep":
      return { baseLabel: "Дохід", taxLabel: "Єдиний податок" };
    case "esv":
    case "esv-emp":
      return { baseLabel: "База нарахування", taxLabel: "ЄСВ-внесок" };
    case "vz":
    case "vz-emp":
      return { baseLabel: "База", taxLabel: "Військовий збір" };
    case "1df":
      return { baseLabel: "Нараховано доходу", taxLabel: "ПДФО + ВЗ" };
    case "mpz":
      return { baseLabel: "База МПЗ", taxLabel: "Сума МПЗ" };
    default:
      return { baseLabel: "Сума", taxLabel: "До сплати" };
  }
}

function getReportMetrics(report: Report): { base: number; tax: number; vz?: number } {
  const calc = report.calculation;
  if (calc?.type === "ep") {
    const base = calc.data.totalIncome;
    const tax = calc.data.toPay;
    const vz = report.militaryTax?.toPay;
    return { base, tax, vz };
  }
  if (calc?.type === "esv") {
    return { base: calc.data.minContribution * calc.data.monthsCount, tax: calc.data.toPay };
  }
  if (calc?.type === "vz") {
    return { base: calc.data.baseAmount, tax: calc.data.toPay };
  }
  if (calc?.type === "1df") {
    return { base: calc.data.totalSalary, tax: calc.data.pdfo + calc.data.vz };
  }
  return { base: 0, tax: report.amountToPay ?? 0 };
}

function calculateDataQualityScore(report: Report): number {
  let score = 0;
  // 25% — calculation
  if (report.calculation && report.calculation.data) score += 25;
  // 25% — dataSources
  if (report.dataSources && report.dataSources.length > 0) score += 25;
  // 25% — formCode + deadline
  if (report.formCode && report.deadline) score += 25;
  // 25% — legalBasis or history
  if (report.legalBasis || (report.history && report.history.length > 0)) score += 25;
  return score;
}

const DATA_SOURCE_LABELS: Record<string, { label: string; icon: typeof Banknote }> = {
  "income-book": { label: "Книга доходів", icon: Banknote },
  integrations: { label: "Банківські інтеграції", icon: Database },
  manual: { label: "Ручне введення", icon: FileText },
  employees: { label: "Працівники", icon: Users },
  documents: { label: "Документи", icon: FileText },
};

export function ReportReviewPage({
  report,
  previousReport,
  onBack,
  onApprove,
  onReject,
  onRequestCorrection,
  onCreateDraft,
  onSubmitReport,
  onChatPromptInsert,
  onNavigateToPayment,
  onNavigateToEmployee,
  onMarkPaid,
  allReports,
  onNavigateToReport,
}: ReportReviewPageProps) {
  const navigate = useNavigate();
  const isIndividual = report.cabinetId === "demo-individual-declarant";
  const [wizardOpen, setWizardOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  // AI-уточнення: швидкі чіпси-промти для перегенерації звіту
  const reportTitleForPrompt =
    report.typeLabel ||
    reportTypeConfig[report.type]?.label ||
    TYPE_LABEL_FALLBACK[report.type] ||
    "звіт";
  const aiRefineChips = useMemo(
    () => [
      {
        label: "Інша ставка",
        prompt: `Перерахуй ${reportTitleForPrompt} за ${report.periodLabel} з іншою ставкою податку. Уточни, яку ставку застосувати.`,
      },
      {
        label: "Коригуючий",
        prompt: `Сформуй коригуючий ${reportTitleForPrompt} за ${report.periodLabel}. Запитай, які саме показники потрібно скоригувати.`,
      },
      {
        label: "Період",
        prompt: `Зміни період ${reportTitleForPrompt} (зараз: ${report.periodLabel}). Уточни новий період і перерахуй усі суми.`,
      },
      {
        label: "Реквізити",
        prompt: `Онови реквізити підписанта у ${reportTitleForPrompt} за ${report.periodLabel}. Запитай ПІБ, посаду та контактні дані.`,
      },
    ],
    [reportTitleForPrompt, report.periodLabel]
  );

  const handleRefineInChat = (prompt: string) => {
    onChatPromptInsert?.(prompt);
  };

  const normalizedStatus = useMemo(
    () => migrateReportStatus(report.status) as ReportStatus,
    [report.status]
  );
  const isOverdue = useMemo(() => {
    if (["accepted", "submitted"].includes(normalizedStatus)) return false;
    return new Date(report.deadline) < new Date();
  }, [report.deadline, normalizedStatus]);

  /** Статуси, де користувач активно працює зі звітом → показуємо «робочі»
   * індикатори (готовність, інлайн-структуру, бейдж «Прострочено»).
   * Для scheduled/processing/submitted/accepted/cancelled — приховуємо. */
  const isWorkingStatus = useMemo(
    () => (["draft", "review", "approved", "rejected"] as ReportStatus[]).includes(normalizedStatus),
    [normalizedStatus]
  );

  const officialTitle = useMemo(() => getOfficialTypeLabel(report), [report]);
  const metrics = useMemo(() => getReportMetrics(report), [report]);
  const previousMetrics = useMemo(
    () => (previousReport ? getReportMetrics(previousReport) : null),
    [previousReport]
  );
  const labels = useMemo(() => getMetricLabels(report.type), [report.type]);
  const dataQualityScore = useMemo(() => calculateDataQualityScore(report), [report]);

  const checklistBaseUrls = useMemo(() => {
    const cabinetId = report.cabinetId || "";
    const encoded = encodeURIComponent(cabinetId);
    const dashboardOpsBase = `/dashboard?cabinet=${encoded}&tab=operations`;
    return {
      incomeBook: `${dashboardOpsBase}&subtab=income-book`,
      incomeBookNeedsClarification: `${dashboardOpsBase}&subtab=income-book&quickFilter=needs-clarification`,
      documentsMissingAttachments: `${dashboardOpsBase}&subtab=documents&filter=has-issues`,
      employees: `${dashboardOpsBase}&subtab=employees`,
      cabinetSettings: `/dashboard?cabinet=${encoded}&tab=settings`,
    };
  }, [report.cabinetId]);

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
          url: checklistBaseUrls.incomeBook,
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
          url: checklistBaseUrls.documentsMissingAttachments,
        },
      },
      {
        id: "no-clarification",
        label: "Немає записів «Потребує уточнення»",
        description: "Всі суми та контрагенти верифіковані",
        checked: false,
        severity: "error",
        action: {
          label: "Переглянути записи",
          type: "navigate",
          url: checklistBaseUrls.incomeBookNeedsClarification,
        },
      },
      {
        id: "calculation-valid",
        label: "Розрахунок відповідає законодавству",
        description: "Ставки та база оподаткування коректні",
        checked: !!report.calculation,
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
          url: checklistBaseUrls.cabinetSettings,
        },
      },
      {
        id: "form-code-valid",
        label: "Код форми відповідає типу звіту",
        description: `Форма ${report.formCode || "не визначена"}`,
        checked: !!report.formCode,
        severity: "warning",
      },
    ];

    if (report.type === "1df") {
      baseChecklist.push({
        id: "employees-valid",
        label: "Дані працівників актуальні",
        description: "ПІБ, ІПН, нарахування перевірено",
        checked: true,
        severity: "error",
        action: {
          label: "Переглянути працівників",
          type: "navigate",
          url: checklistBaseUrls.employees,
        },
      });
    }

    return baseChecklist;
  });

  // Sync URLs when cabinet changes
  useEffect(() => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (!item.action || item.action.type !== "navigate") return item;
        const urlMap: Record<string, string> = {
          "income-complete": checklistBaseUrls.incomeBook,
          "documents-attached": checklistBaseUrls.documentsMissingAttachments,
          "no-clarification": checklistBaseUrls.incomeBookNeedsClarification,
          "requisites-valid": checklistBaseUrls.cabinetSettings,
          "employees-valid": checklistBaseUrls.employees,
        };
        const url = urlMap[item.id];
        return url ? { ...item, action: { ...item.action, url } } : item;
      })
    );
  }, [checklistBaseUrls]);

  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [mobileVerifyOpen, setMobileVerifyOpen] = useState(false);

  // sessionStorage persistence для стану Accordion-секцій
  const accordionStorageKey = `report-review-accordion-${report.id}`;
  const readAccordionState = useCallback((key: string, fallback: string | undefined): string | undefined => {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = sessionStorage.getItem(accordionStorageKey);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Record<string, string>;
      return parsed[key] ?? fallback;
    } catch {
      return fallback;
    }
  }, [accordionStorageKey]);
  const writeAccordionState = useCallback((key: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(accordionStorageKey);
      const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      parsed[key] = value;
      sessionStorage.setItem(accordionStorageKey, JSON.stringify(parsed));
    } catch {
      /* noop */
    }
  }, [accordionStorageKey]);

  const { toast } = useToast();

  const cabinet = useMemo(
    () => mockCabinets.find((c) => c.id === report.cabinetId) || mockCabinets[0],
    [report.cabinetId]
  );

  const showDocumentActions = ["review", "approved", "submitted", "accepted", "rejected"].includes(
    normalizedStatus
  );

  const handleDownloadReport = async () => {
    try {
      await downloadReportPdf(report, cabinet);
      toast({ title: "PDF звіту завантажено" });
    } catch (e) {
      console.error(e);
      toast({ title: "Не вдалося згенерувати PDF", variant: "destructive" });
    }
  };

  const handleDownloadReceipt = async (n: 1 | 2) => {
    try {
      await downloadReceiptPdf(report, cabinet, n);
      toast({ title: `Квитанцію №${n} завантажено` });
    } catch (e) {
      console.error(e);
      toast({ title: "Не вдалося згенерувати квитанцію", variant: "destructive" });
    }
  };

  const handleDownloadRejection = async () => {
    try {
      await downloadRejectionNoticePdf(report, cabinet);
      toast({ title: "Повідомлення про відхилення завантажено" });
    } catch (e) {
      console.error(e);
      toast({ title: "Не вдалося згенерувати документ", variant: "destructive" });
    }
  };

  const allCriticalChecked = checklist
    .filter((item) => item.severity === "error")
    .every((item) => item.checked);

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked } : item))
    );
  };

  const handleApprove = () => {
    if (allCriticalChecked) {
      onApprove(report.id);
    }
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(report.id, rejectionReason);
    }
  };

  const handleCorrectiveAction = (action: ChecklistAction) => {
    if (action.type === "navigate") {
      // Тип 3: повна навігація — додаємо back-trail для повернення у звіт.
      const trailLabel = report ? `Звіт: ${report.name || report.periodLabel}` : "Звіт";
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

  const getChange = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const getChangeIcon = (change: number | null) => {
    if (change === null) return null;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const incomeChange = previousMetrics ? getChange(metrics.base, previousMetrics.base) : null;
  const taxChange = previousMetrics ? getChange(metrics.tax, previousMetrics.tax) : null;

  // Зведення джерел даних з реальних даних звіту
  const dataSourceSummary = useMemo(() => {
    return (report.dataSources || []).map((src) => {
      const meta = DATA_SOURCE_LABELS[src] || { label: src, icon: FileText };
      return { id: src, ...meta };
    });
  }, [report.dataSources]);

  const summaryText = useMemo(() => {
    const sourceCount = (report.dataSources || []).length;
    // Український плюрал у родовому відмінку: «На основі N джерел/джерела/джерел даних»
    // 1 → джерела, 2-4 → джерел, 5+ → джерел; винятки 11-14 → джерел.
    const pluralizeSource = (n: number): string => {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod100 >= 11 && mod100 <= 14) return "джерел";
      if (mod10 === 1) return "джерела";
      if (mod10 >= 2 && mod10 <= 4) return "джерел";
      return "джерел";
    };
    return (
      <>
        {sourceCount > 0 && (
          <>
            На основі <span className="font-medium text-foreground">{sourceCount}</span>{" "}
            {pluralizeSource(sourceCount)} даних.{" "}
          </>
        )}
        Перевірте показники у формі ліворуч і підтвердьте.
      </>
    );
  }, [report.dataSources]);


  // Контекстний FAB для мобільного — лейбл/іконка/дія залежать від статусу
  const fabConfig = useMemo(() => {
    switch (normalizedStatus) {
      case "scheduled":
        return onCreateDraft
          ? { label: "Створити", Icon: Sparkles, action: () => onCreateDraft(report) }
          : null;
      case "review":
        return { label: "Перевірка", Icon: ClipboardCheck, action: () => setMobileVerifyOpen(true) };
      case "approved":
        return onSubmitReport
          ? { label: "Подати", Icon: Send, action: () => onSubmitReport(report) }
          : null;
      case "rejected":
        return { label: "Виправити", Icon: AlertTriangle, action: () => onRequestCorrection(report.id) };
      default:
        return null;
    }
  }, [normalizedStatus, onCreateDraft, onSubmitReport, onRequestCorrection, report]);

  // Render-функція вмісту правої панелі — використовується і на desktop (sticky right column),
  // і всередині мобільного <Sheet> (виклик через FAB). Це уникає дублювання великого JSX-блоку.
  const renderVerificationPanel = () => (
    <div className="space-y-4">
      {/* Individual declarant — wizard / payment slips / notifications */}
      {isIndividual && report.type === "pdfo" && (
        <div className="rounded-lg border bg-card p-4">
          <Button className="w-full gap-2" onClick={() => setWizardOpen(true)}>
            <FileText className="h-4 w-4" />
            Формування декларації
          </Button>
        </div>
      )}
      {isIndividual && report.type === "pdfo" && (report.amountToPay ?? 0) > 0 && (
        <PaymentSlipGenerator
          totalPdfo={report.amountToPay ?? 0}
          totalVz={Math.round((report.amountToPay ?? 0) * 0.278)}
          year={report.year}
        />
      )}
      {isIndividual && report.type === "pdfo" && (
        <NotificationCenter year={report.year} deadlineDate={report.deadline} />
      )}

      {/* === Пакет Г: блоки правої колонки винесені у локальні JSX-змінні
              та рендеряться у порядку, релевантному поточному статусу === */}

      {(() => {
        // --- conclusionBlock: стислий висновок (тільки для draft/review/approved/processing) ---
        const conclusionBlock = !["submitted", "accepted", "rejected"].includes(normalizedStatus) ? (
          <div key="conclusion" className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Стислий висновок</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{summaryText}</p>
          </div>
        ) : null;

        // --- paymentsBlock ---
        const paymentsBlock = (
          <RelatedPaymentsSection
            key="payments"
            report={report}
            onNavigateToPayment={onNavigateToPayment}
            onMarkPaid={onMarkPaid}
            payDialogOpen={payDialogOpen}
            onPayDialogOpenChange={setPayDialogOpen}
          />
        );

        // --- detailsDividerBlock: візуально відокремлює зону «Дії» від «Дані/Контекст» ---
        const detailsDividerBlock = (
          <div
            key="details-divider"
            className="pt-2 mt-2 border-t border-dashed text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            Деталі та джерела
          </div>
        );

        // --- checklistBlock: AI-перевірка (ховається для accepted) ---
        const checklistBlock = normalizedStatus !== "accepted" ? (() => {
          const errorItems = checklist.filter((i) => !i.checked && i.severity === "error");
          const warnItems = checklist.filter((i) => !i.checked && i.severity === "warning");
          const passedCount = checklist.filter((i) => i.checked).length;
          const totalCount = checklist.length;
          const hasIssues = errorItems.length > 0 || warnItems.length > 0;
          const defaultChecklist = errorItems.length > 0 ? "checklist" : "";
          return (
            <Accordion
              key="checklist"
              type="single"
              collapsible
              defaultValue={readAccordionState("checklist", defaultChecklist) || undefined}
              onValueChange={(v) => writeAccordionState("checklist", v ?? "")}
              className="rounded-lg border bg-card scroll-mt-24"
              id="ai-checklist-section"
            >
              <AccordionItem value="checklist" className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <ShieldCheck className={cn("h-4 w-4 shrink-0", hasIssues ? "text-amber-600" : "text-emerald-600")} />
                    <span className="font-medium text-sm">AI-перевірка</span>
                    <span className={cn(
                      "ml-auto mr-2 text-xs font-semibold",
                      dataQualityScore >= 90 ? "text-emerald-600" : dataQualityScore >= 70 ? "text-amber-600" : "text-destructive"
                    )}>
                      {passedCount}/{totalCount} · {dataQualityScore}%
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Progress
                    value={dataQualityScore}
                    indicatorClassName={cn(
                      dataQualityScore >= 90 ? "bg-emerald-500" : dataQualityScore >= 70 ? "bg-amber-500" : "bg-destructive"
                    )}
                    className="h-1.5 mb-3"
                  />
                  <div className="space-y-2">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-2.5",
                          !item.checked && item.severity === "error" && "border-destructive/30 bg-destructive/5",
                          !item.checked && item.severity === "warning" && "border-amber-300 bg-amber-50/50"
                        )}
                      >
                        <Checkbox
                          id={`${item.id}-panel`}
                          checked={item.checked}
                          onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={`${item.id}-panel`} className="text-xs font-medium cursor-pointer flex items-center gap-2">
                            {item.label}
                            {!item.checked && item.severity === "error" && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                          </label>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })() : null;

        // --- sourceBlock: Джерела даних (згорнутий accordion) ---
        const sourceBlock = (
          <Accordion
            key="sources"
            type="single"
            collapsible
            defaultValue={readAccordionState("sources", "") || undefined}
            onValueChange={(v) => writeAccordionState("sources", v ?? "")}
            className="rounded-lg border bg-card"
          >
            <AccordionItem value="sources" className="border-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2 flex-1 text-left">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Джерела даних</span>
                  {dataSourceSummary.length > 0 && (() => {
                    const n = dataSourceSummary.length;
                    const mod10 = n % 10;
                    const mod100 = n % 100;
                    const word =
                      (mod100 >= 11 && mod100 <= 14) ? "джерел"
                      : mod10 === 1 ? "джерело"
                      : (mod10 >= 2 && mod10 <= 4) ? "джерела"
                      : "джерел";
                    return (
                      <span className="ml-auto mr-2 text-xs text-muted-foreground">
                        {n} {word}
                      </span>
                    );
                  })()}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ReportSourceTrail
                  report={report}
                  totalAmount={metrics.base || report.amountToPay || 0}
                  periodLabel={report.periodLabel}
                  onChatPromptInsert={onChatPromptInsert}
                  onDrillDown={(route) =>
                    navigate(
                      buildUrlWithTrail(route, {
                        label: `Звіт: ${report.name || report.periodLabel}`,
                        url: window.location.pathname + window.location.search,
                      }),
                    )
                  }
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );

        // --- rejectionFormBlock ---
        const rejectionFormBlock = showRejectionForm ? (
          <div key="rejection-form" className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <h4 className="font-medium text-sm text-destructive">Причина відхилення</h4>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Опишіть причину відхилення звіту..."
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleReject} disabled={!rejectionReason.trim()}>
                Відхилити
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowRejectionForm(false); setRejectionReason(""); }}>
                Скасувати
              </Button>
            </div>
          </div>
        ) : null;

        // --- docsBlock: сітка 2×2 (Пакет В) ---
        const docsBlock = showDocumentActions ? (() => {
          type DocTile = {
            key: string;
            label: string;
            Icon: typeof Eye;
            action: () => void;
            status: string;
            available: boolean;
          };
          const fmtDate = (iso?: string) =>
            iso ? new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

          const tiles: DocTile[] = [];

          tiles.push({
            key: "form",
            label: "Форма ДПС",
            Icon: Eye,
            action: () => setShowFormPreview(true),
            status: "Переглянути",
            available: true,
          });

          const pdfAvailable = ["approved", "submitted", "accepted", "rejected"].includes(normalizedStatus);
          tiles.push({
            key: "pdf",
            label: "PDF звіту",
            Icon: FileDown,
            action: handleDownloadReport,
            status: pdfAvailable ? "Готовий" : "Недоступний",
            available: pdfAvailable,
          });

          const r1Available = (normalizedStatus === "submitted" || normalizedStatus === "accepted") && !!report.receipt1;
          tiles.push({
            key: "r1",
            label: "Квитанція №1",
            Icon: Receipt,
            action: () => handleDownloadReceipt(1),
            status: r1Available && report.receipt1?.date ? `Отримано ${fmtDate(report.receipt1.date)}` : "Очікується",
            available: r1Available,
          });

          if (normalizedStatus === "rejected") {
            const rejAvailable = !!report.rejectionDetails;
            tiles.push({
              key: "rej",
              label: "Причина відхилення",
              Icon: Download,
              action: handleDownloadRejection,
              status: rejAvailable ? "Отримано" : "Очікується",
              available: rejAvailable,
            });
          } else {
            const r2Available = normalizedStatus === "accepted" && !!report.receipt2;
            tiles.push({
              key: "r2",
              label: "Квитанція №2",
              Icon: Receipt,
              action: () => handleDownloadReceipt(2),
              status: r2Available && report.receipt2?.date ? `Отримано ${fmtDate(report.receipt2.date)}` : "Очікується",
              available: r2Available,
            });
          }

          return (
            <div key="docs" className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <FileDown className="h-3.5 w-3.5" />
                Документи звіту
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tiles.map(({ key, label, Icon, action, status, available }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={available ? action : undefined}
                    disabled={!available}
                    className={`group flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors ${
                      available
                        ? "border-border bg-card hover:border-primary/40 hover:bg-accent/40 cursor-pointer"
                        : "border-dashed border-border/60 bg-muted/30 cursor-not-allowed opacity-60"
                    }`}
                    aria-label={`${label} — ${status}`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon className={`h-4 w-4 ${available ? "text-primary" : "text-muted-foreground"}`} />
                      {available && (
                        <Download className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <div className="text-xs font-medium leading-tight">{label}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{status}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })() : null;

        // --- actionsBlock: дії за статусом ---
        const actionsBlock = (
          <div key="actions" className="flex flex-wrap gap-2">
            {(normalizedStatus === "scheduled" || normalizedStatus === "processing") && (
              <>
                <Button
                  className="flex-1 min-w-[120px] sm:min-w-[140px]"
                  onClick={() => onCreateDraft?.(report)}
                  disabled={!onCreateDraft || normalizedStatus === "processing"}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Створити чернетку зараз
                </Button>
                <p className="w-full text-[11px] text-muted-foreground">
                  Зазвичай AI формує автоматично за 3 дні до дедлайну ({new Date(report.deadline).toLocaleDateString("uk-UA")})
                </p>
              </>
            )}

            {normalizedStatus === "review" && (
              <>
                <Button className="flex-1 min-w-[120px] sm:min-w-[140px]" onClick={handleApprove} disabled={!allCriticalChecked}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Підтвердити
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={!onChatPromptInsert}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Уточнити
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {aiRefineChips.map((chip) => (
                      <DropdownMenuItem key={chip.label} onClick={() => handleRefineInChat(chip.prompt)}>
                        {chip.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => handleRefineInChat(`Уточни ${reportTitleForPrompt} за ${report.periodLabel}: опиши, що потрібно змінити.`)}>
                      <MessageSquare className="h-3.5 w-3.5 mr-2" />
                      Інше…
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {!showRejectionForm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowRejectionForm(true)}
                    aria-label="Відхилити"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}

            {normalizedStatus === "approved" && (
              <>
                <Button className="flex-1 min-w-[120px] sm:min-w-[140px]" onClick={() => onSubmitReport?.(report)} disabled={!onSubmitReport}>
                  <Send className="h-4 w-4 mr-2" />
                  Подати до ДПС
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={!onChatPromptInsert}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Уточнити
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {aiRefineChips.map((chip) => (
                      <DropdownMenuItem key={chip.label} onClick={() => handleRefineInChat(chip.prompt)}>
                        {chip.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {normalizedStatus === "submitted" && (
              <Button variant="ghost" onClick={onBack}>Закрити</Button>
            )}
            {normalizedStatus === "accepted" && (
              <Button variant="ghost" onClick={onBack}>Закрити</Button>
            )}

            {normalizedStatus === "rejected" && (
              <Button variant="destructive" className="flex-1 min-w-[120px] sm:min-w-[140px]" onClick={() => onRequestCorrection(report.id)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Виправити та подати повторно
              </Button>
            )}

            {isOverdue && !["accepted", "submitted"].includes(normalizedStatus) && (
              <div className="w-full mt-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-[11px] text-destructive">
                <Clock className="h-3 w-3 inline mr-1" />
                Прострочено на {Math.ceil((Date.now() - new Date(report.deadline).getTime()) / 86400000)} дн.
                Можлива пеня та штраф 340 ₴ (ст. 120 ПКУ).
              </div>
            )}
          </div>
        );

        // --- relatedReportsBlock: зв'язок зі звітами ---
        const relatedReportsBlock = (report.isCorrection || allReports?.some((r) => r.correctionOf === report.id)) ? (
          <div key="related" className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm">Зв'язок зі звітами</h4>
            </div>
            {report.isCorrection && report.correctionOf && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <FileEdit className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Коригуючий звіт №{report.correctionNumber || 1}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      Причина: {report.correctionReason || "Виправлення помилок"}
                    </p>
                    {report.originalRejectionCode && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                        Код помилки: {report.originalRejectionCode}
                      </p>
                    )}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2 text-sm text-amber-700 dark:text-amber-300"
                      onClick={() => onNavigateToReport?.(report.correctionOf!)}
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Переглянути оригінальний звіт
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {allReports?.filter((r) => r.correctionOf === report.id).map((correction) => (
              <div
                key={correction.id}
                className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start gap-3">
                  <FileCheck2 className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Створено коригуючий звіт
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">{correction.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs h-5">
                        {correction.statusLabel}
                      </Badge>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2 text-sm text-blue-700 dark:text-blue-300"
                      onClick={() => onNavigateToReport?.(correction.id)}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Переглянути коригуючий звіт
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null;

        // --- amendmentDiffBlock ---
        const amendmentDiffBlock = (report.amendmentDiff && report.amendmentDiff.length > 0) ? (
          <div key="amendment" className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm">Порівняння з первинною декларацією</h4>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-2 py-2 font-medium text-muted-foreground">Поле</th>
                    <th className="text-right px-2 py-2 font-medium text-muted-foreground">Було</th>
                    <th className="text-right px-2 py-2 font-medium text-muted-foreground">Стало</th>
                    <th className="text-center px-2 py-2 font-medium text-muted-foreground">Зміна</th>
                  </tr>
                </thead>
                <tbody>
                  {report.amendmentDiff.map((item) => (
                    <tr
                      key={item.field}
                      className={cn(
                        "border-t",
                        item.changeType === "added" && "bg-emerald-50/50 dark:bg-emerald-950/20",
                        item.changeType === "changed" && "bg-amber-50/50 dark:bg-amber-950/20",
                        item.changeType === "removed" && "bg-destructive/5 dark:bg-destructive/10",
                      )}
                    >
                      <td className="px-2 py-2 font-medium">{item.label}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                        {item.oldValue === null ? "—" : typeof item.oldValue === "number" ? formatCurrency(item.oldValue) : item.oldValue}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums font-medium">
                        {item.newValue === null ? "—" : typeof item.newValue === "number" ? formatCurrency(item.newValue) : item.newValue}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px]",
                            item.changeType === "added" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                            item.changeType === "changed" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                            item.changeType === "removed" && "bg-destructive/10 text-destructive",
                          )}
                        >
                          {item.changeType === "added" ? "Додано" : item.changeType === "changed" ? "Змінено" : "Видалено"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null;

        // --- Композиція за статусом: action-first (Дії зверху, Дані/Контекст нижче) ---
        let order: (ReactNode | null)[];
        switch (normalizedStatus) {
          case "accepted":
            order = [paymentsBlock, docsBlock, actionsBlock, detailsDividerBlock, relatedReportsBlock, amendmentDiffBlock, sourceBlock];
            break;
          case "submitted":
            order = [paymentsBlock, docsBlock, actionsBlock, detailsDividerBlock, sourceBlock, relatedReportsBlock, amendmentDiffBlock];
            break;
          case "rejected":
            order = [paymentsBlock, docsBlock, actionsBlock, detailsDividerBlock, checklistBlock, relatedReportsBlock, amendmentDiffBlock, sourceBlock];
            break;
          case "review":
          case "draft":
          case "approved":
            order = [actionsBlock, checklistBlock, docsBlock, rejectionFormBlock, detailsDividerBlock, conclusionBlock, paymentsBlock, sourceBlock, relatedReportsBlock, amendmentDiffBlock];
            break;
          case "scheduled":
          case "processing":
          default:
            order = [actionsBlock, checklistBlock, docsBlock, detailsDividerBlock, conclusionBlock, paymentsBlock, sourceBlock, relatedReportsBlock, amendmentDiffBlock];
            break;
        }

        return <>{order.filter(Boolean)}</>;
      })()}
    </div>
  );

  const handleScrollToChecklist = useCallback(() => {
    if (typeof document === "undefined") return;
    const el = document.getElementById("ai-checklist-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="pt-5 space-y-4 min-w-0">
      {/* Header — професійна шапка: stepper → h1+code → meta-strip.
          Локальна кнопка «Назад» прибрана — навігація через HubBreadcrumbBar зверху. */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* 1. Stepper — головний навігатор статусу (без дублюючих бейджів) */}
          <ReportLifecycleStepper status={normalizedStatus} size="md" />

          {/* 2. H1 + код форми справа */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-lg sm:text-xl xl:text-2xl font-semibold tracking-tight flex-1 min-w-0">
              {officialTitle} — {report.periodLabel}
            </h1>
            <div className="flex items-center gap-2 shrink-0 pt-1">
              {isOverdue && isWorkingStatus && (
                <Badge variant="outline" className={getStatusBadgeClasses("destructive")}>
                  Прострочено
                </Badge>
              )}
              {report.formCode && (
                <Badge variant="secondary" className="gap-1 text-[11px] font-mono hidden sm:inline-flex">
                  <Bot className="h-3 w-3" />
                  {report.formCode}
                </Badge>
              )}
            </div>
          </div>

          {/* Мета-смуга під h1 прибрана: структура показується інлайн через
              `ReportSectionsList`, готовність — у блоці AI-перевірки нижче,
              а дедлайн — у бейджі «Прострочено» в h1-row. */}

          {/* Опис лишаємо лише для rejected — там потрібен контекст */}
          {normalizedStatus === "rejected" && (
            <p className="text-sm text-muted-foreground">
              Звіт відхилено ДПС. Перегляньте причину та виправте помилки.
            </p>
          )}
        </div>
      </div>

      {/* Банери — submitted */}
      {normalizedStatus === "submitted" && report.receipt1 && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm flex-1 min-w-0 truncate">
              ✓ Подано до ДПС {new Date(report.receipt1.date).toLocaleDateString("uk-UA")} · очікується Квит. №2
            </p>
          </div>
          {/* Завантаження — у сітці 2×2 «Документи» нижче — Пакет В */}
        </div>
      )}

      {normalizedStatus === "accepted" && (report.receipt1 || report.receipt2) && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm flex-1 min-w-0 truncate">
              ✓ Прийнято ДПС {report.receipt2 && `· ${new Date(report.receipt2.date).toLocaleDateString("uk-UA")}`}
            </p>
          </div>
          {/* Завантаження — у сітці 2×2 «Документи» нижче — Пакет В */}
        </div>
      )}

      {normalizedStatus === "rejected" && report.rejectionDetails && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="font-semibold text-destructive text-sm">
                  Звіт відхилено ДПС
                  {report.rejectionDetails.code && (
                    <span className="ml-2 font-mono text-xs">[{report.rejectionDetails.code}]</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Дата відхилення: {new Date(report.rejectionDetails.date).toLocaleString("uk-UA")}
                </p>
              </div>
              <div className="rounded-md bg-background border p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                  Причина
                </p>
                <p className="text-sm text-foreground leading-relaxed">{report.rejectionDetails.reason}</p>
              </div>
              {report.rejectionDetails.correctionDeadline && (
                <p className="text-xs text-destructive">
                  ⏱ Виправити до:{" "}
                  <span className="font-semibold">
                    {new Date(report.rejectionDetails.correctionDeadline).toLocaleDateString("uk-UA")}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout (lg+) — на mobile права панель — у Sheet через FAB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Full draft preview */}
        <div className="lg:col-span-2 min-w-0 space-y-4">
          {/* Mobile-only тонкий sticky-trigger «Сплатити XXX грн» — відкриває Sheet з картою «Платежі».
              На lg+ ховаємо (картка «Платежі» вже видима у правій колонці). */}
          {(() => {
            const totals = getReportPaymentTotals(report);
            const canPayMobile =
              totals.pending > 0 &&
              (normalizedStatus === "submitted" ||
                normalizedStatus === "accepted" ||
                normalizedStatus === "rejected");
            if (!canPayMobile) return null;
            return (
              <button
                type="button"
                onClick={() => setPayDialogOpen(true)}
                className="lg:hidden sticky top-2 z-30 w-full h-10 px-3 rounded-lg bg-primary text-primary-foreground shadow-sm flex items-center justify-between gap-2 hover:bg-primary/90 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                  <Banknote className="h-4 w-4 shrink-0" />
                  <span className="truncate">Сплатити {formatCurrency(totals.pending)}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            );
          })()}

          {/* Структура звіту — інлайн-перелік розділів зі статусом і hint-описом.
              Для scheduled/processing структура показується всередині ReportDraftPreview
              → ScheduledReportPlaceholder, тому тут не дублюємо. */}
          {isWorkingStatus && (
            <ReportSectionsList report={report} />
          )}

          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <ReportDraftPreview report={report} onCreateDraft={onCreateDraft} onNavigateToEmployee={onNavigateToEmployee} />
          </div>

          {/* Individual PIT breakdown — лише для декларанта-фізособи */}
          {isIndividual && <IndividualPitBreakdown report={report} />}

          {/* Пов'язані працівники для 4ДФ — компонент сам ховається для інших типів */}
          <EmployeesLinkedSection
            report={report}
            onNavigateToEmployee={onNavigateToEmployee}
          />
        </div>

        {/* RIGHT: Verification panel — sticky на lg+; на mobile повністю прихована (доступ через FAB → Sheet) */}
        <div id="verification-panel" className="hidden lg:block lg:col-span-1 scroll-mt-20">
          <div className="lg:sticky lg:top-4">
            {renderVerificationPanel()}
          </div>
        </div>
      </div>

      {/* Mobile FAB — контекстний (лейбл/іконка/дія залежать від статусу). Для review — відкриває Sheet. */}
      {fabConfig && (
        <button
          type="button"
          onClick={fabConfig.action}
          className={cn(
            "lg:hidden fixed bottom-20 right-4 z-40",
            "h-14 px-5 rounded-full shadow-lg",
            "bg-primary text-primary-foreground font-medium text-sm",
            "flex items-center gap-2 transition-transform active:scale-95",
            normalizedStatus === "review" && !allCriticalChecked && "ring-4 ring-amber-400/40"
          )}
          aria-label={fabConfig.label}
        >
          <fabConfig.Icon className="h-5 w-5" />
          {fabConfig.label}
          {normalizedStatus === "review" && !allCriticalChecked && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" aria-hidden />
          )}
        </button>
      )}

      {/* Mobile Sheet — повноекранний доступ до панелі верифікації */}
      <Sheet open={mobileVerifyOpen} onOpenChange={setMobileVerifyOpen}>
        <SheetContent side="bottom" className="lg:hidden max-h-[90dvh] overflow-y-auto">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="text-base">Перевірка звіту</SheetTitle>
          </SheetHeader>
          {renderVerificationPanel()}
        </SheetContent>
      </Sheet>

      {/* PDF preview dialog — офіційна форма ДПС */}
      <ReportFormPreview
        open={showFormPreview}
        onOpenChange={setShowFormPreview}
        report={report}
        cabinet={cabinet}
      />

      {/* Top-level PayDialog — єдиний екземпляр на сторінці.
          Викликається і з картки «Платежі» (через controlled props), і з mobile sticky-CTA.
          Гарантує, що сума і реквізити завжди беруться з одного джерела (getRelatedPayments). */}
      <PayDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        report={report}
        payments={getRelatedPayments(report)}
      />

      {/* Declaration Wizard — для individual-декларанта */}
      {isIndividual && (
        <DeclarationWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      )}
    </div>
  );
}
