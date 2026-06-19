import { useState } from "react";
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Eye,
  Scan,
  Brain,
  FileText,
  Table2,
  Pencil,
  Database,
  Check,
  X,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FieldConfidence, ExtractionMethod } from "@/types/documentSummary";

// Side-by-Side viewing modes
type SideBySideMode = 'verification' | 'review' | 'audit';

// Method labels and icons
const methodConfig: Record<
  ExtractionMethod,
  { label: string; icon: typeof Scan; color: string }
> = {
  ocr: { label: "OCR", icon: Scan, color: "text-blue-600 bg-blue-100 dark:bg-blue-950" },
  nlp: { label: "NLP", icon: Brain, color: "text-purple-600 bg-purple-100 dark:bg-purple-950" },
  pattern: { label: "Pattern", icon: FileText, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950" },
  table: { label: "Table", icon: Table2, color: "text-amber-600 bg-amber-100 dark:bg-amber-950" },
  manual: { label: "Manual", icon: Pencil, color: "text-slate-600 bg-slate-100 dark:bg-slate-800" },
  lookup: { label: "DB", icon: Database, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950" },
};

// Get confidence color class
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return "bg-emerald-500";
  if (confidence >= 70) return "bg-amber-500";
  return "bg-red-500";
};

const getConfidenceTextColor = (confidence: number) => {
  if (confidence >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (confidence >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

// Section titles based on mode
const getSectionConfig = (mode: SideBySideMode) => {
  switch (mode) {
    case 'verification':
      return {
        needsReviewTitle: 'Потребує перевірки',
        successTitle: 'Розпізнано успішно',
        needsReviewIcon: AlertTriangle,
        successIcon: CheckCircle2,
        needsReviewColor: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
        successColor: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
      };
    case 'review':
      return {
        needsReviewTitle: 'Зверніть увагу',
        successTitle: 'AI-витягнуті дані',
        needsReviewIcon: Eye,
        successIcon: FileSearch,
        needsReviewColor: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
        successColor: 'bg-muted/50 text-muted-foreground',
      };
    case 'audit':
      return {
        needsReviewTitle: 'Історія витягування',
        successTitle: 'Зафіксовані дані',
        needsReviewIcon: FileSearch,
        successIcon: Lock,
        needsReviewColor: 'bg-muted/50 text-muted-foreground',
        successColor: 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400',
      };
  }
};

interface FieldConfidenceBreakdownProps {
  fields: FieldConfidence[];
  mode?: SideBySideMode;
  onSelectAlternative?: (fieldName: string, newValue: string) => void;
  onFieldClick?: (field: FieldConfidence) => void;
  onFieldHover?: (field: FieldConfidence | null) => void;
  onConfirmField?: (fieldName: string) => void;
  onDisputeField?: (fieldName: string) => void;
  confirmedFields?: Set<string>;
  disputedFields?: Set<string>;
  className?: string;
}

export const FieldConfidenceBreakdown = ({
  fields,
  mode = 'verification',
  onSelectAlternative,
  onFieldClick,
  onFieldHover,
  onConfirmField,
  onDisputeField,
  confirmedFields = new Set(),
  disputedFields = new Set(),
  className,
}: FieldConfidenceBreakdownProps) => {
  const [selectedAlternatives, setSelectedAlternatives] = useState<
    Record<string, string>
  >({});

  // Get section configuration based on mode
  const sectionConfig = getSectionConfig(mode);

  // Separate fields by status
  const needsReviewFields = fields.filter(
    (f) => f.needsReview || f.confidence < 80
  );
  const successFields = fields.filter(
    (f) => !f.needsReview && f.confidence >= 80
  );

  // Calculate overall stats
  const avgConfidence = fields.length
    ? Math.round(
        fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length
      )
    : 0;

  const handleSelectAlternative = (fieldName: string, value: string) => {
    setSelectedAlternatives((prev) => ({ ...prev, [fieldName]: value }));
    onSelectAlternative?.(fieldName, value);
  };

  const getFieldVerificationStatus = (fieldName: string) => {
    if (confirmedFields.has(fieldName)) return 'confirmed';
    if (disputedFields.has(fieldName)) return 'disputed';
    return 'pending';
  };

  const renderField = (field: FieldConfidence) => {
    const method = methodConfig[field.method];
    const MethodIcon = method.icon;
    const hasAlternatives =
      field.alternatives && field.alternatives.length > 0;
    const currentValue =
      selectedAlternatives[field.fieldName] || field.value;
    
    const verificationStatus = getFieldVerificationStatus(field.fieldName);
    const showVerificationButtons = mode === 'verification' && onConfirmField && onDisputeField;

    return (
      <div
        key={field.fieldName}
        className={cn(
          "p-3 rounded-lg border bg-card transition-colors",
          verificationStatus === 'confirmed' && "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20",
          verificationStatus === 'disputed' && "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20",
          verificationStatus === 'pending' && (field.needsReview || field.confidence < 80)
            ? "border-amber-300 dark:border-amber-700"
            : verificationStatus === 'pending' && "border-border",
          mode === 'audit' && "border-slate-200 dark:border-slate-700",
          onFieldClick && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={() => onFieldClick?.(field)}
        onMouseEnter={() => onFieldHover?.(field)}
        onMouseLeave={() => onFieldHover?.(null)}
      >
        {/* Header row with verification status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {verificationStatus === 'confirmed' && (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            {verificationStatus === 'disputed' && (
              <X className="w-4 h-4 text-red-600 shrink-0" />
            )}
            {mode === 'audit' && verificationStatus === 'pending' && (
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="text-sm font-medium truncate">{field.fieldLabel}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] px-1.5 py-0 gap-1",
                      method.color
                    )}
                  >
                    <MethodIcon className="w-3 h-3" />
                    {method.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Метод витягування:{" "}
                    {method.label === "OCR"
                      ? "Оптичне розпізнавання"
                      : method.label === "NLP"
                      ? "Обробка природної мови"
                      : method.label === "Pattern"
                      ? "Розпізнавання шаблону"
                      : method.label === "Table"
                      ? "Витягування з таблиці"
                      : method.label === "Manual"
                      ? "Ручне введення"
                      : "Пошук у базі даних"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span
              className={cn(
                "text-xs font-semibold",
                getConfidenceTextColor(field.confidence)
              )}
            >
              {field.confidence}%
            </span>
          </div>
        </div>

        {/* Value row */}
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-muted-foreground truncate flex-1">
            "{currentValue}"
          </p>
          {field.pageNumber && onFieldClick && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFieldClick(field);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {field.boundingBox ? `Перейти до с. ${field.pageNumber}` : "Знайти в тексті"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mb-2">
          <div
            className={cn("h-full transition-all", getConfidenceColor(field.confidence))}
            style={{ width: `${field.confidence}%` }}
          />
        </div>

        {/* Alternatives - only in verification and review modes */}
        {hasAlternatives && mode !== 'audit' && onSelectAlternative && (
          <div className="flex items-center gap-2 pt-2 border-t border-dashed">
            <span className="text-xs text-muted-foreground shrink-0">
              Альтернативи:
            </span>
            <Select
              value={selectedAlternatives[field.fieldName] || ""}
              onValueChange={(v) =>
                handleSelectAlternative(field.fieldName, v)
              }
            >
              <SelectTrigger className="h-7 text-xs flex-1">
                <SelectValue placeholder="Оберіть..." />
              </SelectTrigger>
              <SelectContent>
                {field.alternatives!.map((alt, i) => (
                  <SelectItem key={i} value={alt.value} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[150px]">{alt.value}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        {alt.confidence}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Human-in-the-Loop Verification Actions - ONLY in verification mode */}
        {showVerificationButtons && verificationStatus === 'pending' && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs flex-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              onClick={(e) => {
                e.stopPropagation();
                onConfirmField(field.fieldName);
              }}
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Підтвердити
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={(e) => {
                e.stopPropagation();
                onDisputeField(field.fieldName);
              }}
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Оскаржити
            </Button>
          </div>
        )}

        {/* Review mode - read-only hint */}
        {mode === 'review' && verificationStatus === 'pending' && (
          <div className="mt-2 pt-2 border-t border-dashed text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Перевірте значення перед підписом
            </span>
          </div>
        )}

        {/* Audit mode - locked indicator */}
        {mode === 'audit' && verificationStatus === 'pending' && (
          <div className="mt-2 pt-2 border-t border-dashed text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Зафіксовано
            </span>
          </div>
        )}

        {/* Verification status indicator - for confirmed/disputed in any mode */}
        {verificationStatus !== 'pending' && (
          <div className={cn(
            "mt-2 pt-2 border-t border-dashed text-xs",
            verificationStatus === 'confirmed' && "text-emerald-600 dark:text-emerald-400",
            verificationStatus === 'disputed' && "text-red-600 dark:text-red-400"
          )}>
            {verificationStatus === 'confirmed' && (
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Підтверджено
              </span>
            )}
            {verificationStatus === 'disputed' && (
              <span className="flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" /> Оскаржено
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // In audit mode, show all fields together
  if (mode === 'audit') {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Summary header */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {fields.length} полів зафіксовано
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Впевненість:</span>
            <span className={cn("font-semibold", getConfidenceTextColor(avgConfidence))}>
              {avgConfidence}%
            </span>
          </div>
        </div>

        {/* All fields in single collapsible */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className={cn(
            "flex items-center gap-2 w-full p-2 rounded-lg transition-colors",
            sectionConfig.successColor,
            "hover:opacity-80"
          )}>
            <sectionConfig.successIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {sectionConfig.successTitle}
            </span>
            <Badge variant="outline" className="ml-auto">
              {fields.length}
            </Badge>
            <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {fields.map(renderField)}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary header */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">
            {fields.length} полів витягнуто
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Середня впевненість:</span>
          <span className={cn("font-semibold", getConfidenceTextColor(avgConfidence))}>
            {avgConfidence}%
          </span>
        </div>
      </div>

      {/* Needs review section */}
      {needsReviewFields.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className={cn(
            "flex items-center gap-2 w-full p-2 rounded-lg transition-colors",
            sectionConfig.needsReviewColor,
            "hover:opacity-80"
          )}>
            <sectionConfig.needsReviewIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {sectionConfig.needsReviewTitle}
            </span>
            <Badge
              variant="secondary"
              className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
            >
              {needsReviewFields.length}
            </Badge>
            <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {needsReviewFields.map(renderField)}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Successfully recognized section */}
      {successFields.length > 0 && (
        <Collapsible defaultOpen={mode === 'review'}>
          <CollapsibleTrigger className={cn(
            "flex items-center gap-2 w-full p-2 rounded-lg transition-colors",
            sectionConfig.successColor,
            "hover:opacity-80"
          )}>
            <sectionConfig.successIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {sectionConfig.successTitle}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                mode === 'verification' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
                mode === 'review' && "bg-muted text-muted-foreground"
              )}
            >
              {successFields.length}
            </Badge>
            <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {successFields.map(renderField)}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
