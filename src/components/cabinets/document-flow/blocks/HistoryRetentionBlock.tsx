import { 
  Archive, 
  Calendar, 
  Clock, 
  Lock, 
  AlertTriangle,
  Info,
  FileText,
  Ban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { DocumentType } from "@/config/documentFlowConfig";
import {
  type RetentionCategory,
  retentionCategories,
  getDaysRemaining,
  getRetentionProgress,
  getArchiveEligibleDate,
} from "@/config/complianceConfig";

interface LegalHold {
  isActive: boolean;
  reason?: string;
  since?: string;
  caseNumber?: string;
}

interface HistoryRetentionBlockProps {
  documentId: string;
  documentType?: DocumentType;
  createdAt?: string;
  retentionCategory?: RetentionCategory;
  legalHold?: LegalHold;
  className?: string;
}

const getRetentionCategoryFromType = (type?: DocumentType): RetentionCategory => {
  if (!type) return "operational";
  switch (type) {
    case "tax-invoice":
    case "invoice":
    case "payment-order":
      return "tax";
    case "contract":
    case "power-of-attorney":
      return "legal";
    case "act":
    case "waybill":
      return "accounting";
    default:
      return "operational";
  }
};

export const HistoryRetentionBlock = ({
  documentId,
  documentType,
  createdAt,
  retentionCategory: propCategory,
  legalHold,
  className,
}: HistoryRetentionBlockProps) => {
  const category = propCategory || getRetentionCategoryFromType(documentType);
  const config = retentionCategories[category];
  const effectiveCreatedAt = createdAt || new Date().toISOString();
  
  const archiveDate = getArchiveEligibleDate(effectiveCreatedAt, category);
  const daysRemaining = getDaysRemaining(archiveDate);
  const progress = getRetentionProgress(effectiveCreatedAt, category);

  const effectiveLegalHold: LegalHold = legalHold || (
    documentId.includes("legal-hold") ? {
      isActive: true,
      reason: "Податкова перевірка (камеральна)",
      caseNumber: "ПП-2025-00145",
      since: "2025-01-10",
    } : { isActive: false }
  );

  const getUrgencyColor = () => {
    if (daysRemaining > 365) return "emerald";
    if (daysRemaining > 90) return "amber";
    return "red";
  };

  const urgency = getUrgencyColor();

  const colorClasses = {
    emerald: { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", bgLight: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
    amber: { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", bgLight: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800" },
    red: { text: "text-red-600 dark:text-red-400", bg: "bg-red-500", bgLight: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
  };

  const colors = colorClasses[urgency];

  const formatTimeRemaining = (): string => {
    if (daysRemaining === 0) return "Термін завершено";
    const years = Math.floor(daysRemaining / 365);
    const months = Math.floor((daysRemaining % 365) / 30);
    if (years > 0) return months > 0 ? `${years} р. ${months} міс.` : `${years} р.`;
    if (months > 0) return `${months} міс.`;
    return `${daysRemaining} дн.`;
  };

  return (
    <Card className={cn("overflow-hidden", className)} data-section="document-history-retention">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Archive className="w-4 h-4 text-muted-foreground" />
          Зберігання та архівація
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {effectiveLegalHold.isActive && (
          <Alert variant="destructive" className="border-2 border-red-500 bg-red-50 dark:bg-red-950/50">
            <Lock className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
              <span>Legal Hold активний</span>
              <Badge variant="destructive" className="text-[10px] gap-1"><Ban className="w-3 h-3" />ЗАБОРОНЕНО</Badge>
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-1.5 text-xs">
              {effectiveLegalHold.reason && <p className="font-medium text-red-800 dark:text-red-200">{effectiveLegalHold.reason}</p>}
              <div className="text-red-700 dark:text-red-300 space-y-0.5">
                {effectiveLegalHold.caseNumber && <p>Справа: {effectiveLegalHold.caseNumber}</p>}
                {effectiveLegalHold.since && <p>Діє з: {format(new Date(effectiveLegalHold.since), "dd.MM.yyyy", { locale: uk })}</p>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">Категорія:</span></div>
          <Badge variant="outline" className="text-xs">{config.labelUk} документ</Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Підстава:</span>
          <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="font-medium cursor-help flex items-center gap-1">{config.legalBasis}<Info className="w-3 h-3 text-muted-foreground" /></span></TooltipTrigger><TooltipContent><p className="max-w-[200px] text-xs">{config.description}</p></TooltipContent></Tooltip></TooltipProvider>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Строк зберігання:</span>
            <span className={cn("font-semibold", colors.text)}>{formatTimeRemaining()}</span>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Progress value={progress} className="h-2" />
              <div className={cn("absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background shadow-sm", colors.bg)} style={{ left: `calc(${Math.min(progress, 98)}% - 6px)` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Створено</span><span>{Math.round(progress)}%</span><span>Архівування</span></div>
          </div>
        </div>

        <div className={cn("flex items-center gap-3 p-3 rounded-lg border", colors.bgLight, colors.border)}>
          <Calendar className={cn("w-5 h-5 shrink-0", colors.text)} />
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Зберігати до:</div>
            <div className={cn("font-semibold", colors.text)}>{format(archiveDate, "dd MMMM yyyy", { locale: uk })}</div>
          </div>
          {urgency === "red" && <AlertTriangle className="w-5 h-5 text-red-500" />}
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{config.description}</span>
        </div>
      </CardContent>
    </Card>
  );
};
