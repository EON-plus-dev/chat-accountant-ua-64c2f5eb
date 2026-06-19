import { useState } from "react";
import {
  Cpu,
  Upload,
  ScanText,
  FileSearch,
  FileOutput,
  CheckCircle2,
  Database,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { Document } from "@/config/documentFlowConfig";

// ============================================
// PROCESSING STAGES
// ============================================

export type ProcessingStage =
  | "upload"           // Завантаження
  | "ocr"              // Розпізнавання тексту
  | "classification"   // Класифікація типу
  | "extraction"       // Видобування даних
  | "validation"       // Валідація
  | "indexing";        // Індексація

export type StageStatus = "pending" | "processing" | "completed" | "error" | "skipped";

export interface ProcessingStageInfo {
  stage: ProcessingStage;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number;        // ms
  model?: string;
  version?: string;
  confidence?: number;
  warnings?: string[];
  errors?: string[];
}

export interface ProcessingHistory {
  documentId: string;
  startedAt: string;
  completedAt?: string;
  totalDuration?: number;
  stages: ProcessingStageInfo[];
  overallStatus: "completed" | "processing" | "error";
}

// ============================================
// STAGE CONFIGURATION
// ============================================

const stageConfig: Record<ProcessingStage, {
  labelUk: string;
  icon: typeof Upload;
  description: string;
}> = {
  upload: {
    labelUk: "Завантаження",
    icon: Upload,
    description: "Отримання та збереження файлу",
  },
  ocr: {
    labelUk: "OCR",
    icon: ScanText,
    description: "Розпізнавання тексту з документа",
  },
  classification: {
    labelUk: "Класифікація",
    icon: FileSearch,
    description: "Визначення типу документа",
  },
  extraction: {
    labelUk: "Видобування",
    icon: FileOutput,
    description: "Витягування структурованих даних",
  },
  validation: {
    labelUk: "Валідація",
    icon: CheckCircle2,
    description: "Перевірка коректності даних",
  },
  indexing: {
    labelUk: "Індексація",
    icon: Database,
    description: "Збереження в базу даних",
  },
};

const statusConfig: Record<StageStatus, {
  color: string;
  bgColor: string;
  label: string;
}> = {
  pending: {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Очікує",
  },
  processing: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/50",
    label: "В процесі",
  },
  completed: {
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/50",
    label: "Завершено",
  },
  error: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950/50",
    label: "Помилка",
  },
  skipped: {
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    label: "Пропущено",
  },
};

// ============================================
// DEMO DATA GENERATOR
// ============================================

export const generateDemoProcessingHistory = (documentId: string): ProcessingHistory => {
  const startedAt = new Date(Date.now() - 30000).toISOString();
  const baseTime = new Date(startedAt).getTime();
  
  const stages: ProcessingStageInfo[] = [
    {
      stage: "upload",
      status: "completed",
      startedAt: new Date(baseTime).toISOString(),
      completedAt: new Date(baseTime + 500).toISOString(),
      duration: 500,
    },
    {
      stage: "ocr",
      status: "completed",
      startedAt: new Date(baseTime + 500).toISOString(),
      completedAt: new Date(baseTime + 3500).toISOString(),
      duration: 3000,
      model: "Tesseract 5.0",
      confidence: 98.5,
    },
    {
      stage: "classification",
      status: "completed",
      startedAt: new Date(baseTime + 3500).toISOString(),
      completedAt: new Date(baseTime + 4200).toISOString(),
      duration: 700,
      model: "Gemini 2.5 Flash",
      version: "2025-01",
      confidence: 95.2,
    },
    {
      stage: "extraction",
      status: "completed",
      startedAt: new Date(baseTime + 4200).toISOString(),
      completedAt: new Date(baseTime + 6800).toISOString(),
      duration: 2600,
      model: "Gemini 2.5 Flash",
      version: "2025-01",
      confidence: 92.8,
      warnings: ["Низька впевненість у полі 'Сума'"],
    },
    {
      stage: "validation",
      status: "completed",
      startedAt: new Date(baseTime + 6800).toISOString(),
      completedAt: new Date(baseTime + 7500).toISOString(),
      duration: 700,
    },
    {
      stage: "indexing",
      status: "completed",
      startedAt: new Date(baseTime + 7500).toISOString(),
      completedAt: new Date(baseTime + 8000).toISOString(),
      duration: 500,
    },
  ];
  
  return {
    documentId,
    startedAt,
    completedAt: new Date(baseTime + 8000).toISOString(),
    totalDuration: 8000,
    stages,
    overallStatus: "completed",
  };
};

// ============================================
// COMPONENT
// ============================================

interface ProcessingHistorySectionProps {
  document: Document;
  history?: ProcessingHistory;
  className?: string;
}

export const ProcessingHistorySection = ({
  document,
  history,
  className,
}: ProcessingHistorySectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate demo data if not provided
  const processingHistory = history || generateDemoProcessingHistory(document.id);
  
  const completedStages = processingHistory.stages.filter(s => s.status === "completed").length;
  const totalStages = processingHistory.stages.length;
  const progress = (completedStages / totalStages) * 100;
  
  const hasErrors = processingHistory.stages.some(s => s.status === "error");
  const hasWarnings = processingHistory.stages.some(s => s.warnings && s.warnings.length > 0);
  
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}мс`;
    return `${(ms / 1000).toFixed(1)}с`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("rounded-lg border bg-card", className)}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full p-3 hover:bg-accent/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">AI-обробка</span>
              {processingHistory.overallStatus === "completed" && (
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                  ✓ {formatDuration(processingHistory.totalDuration || 0)}
                </Badge>
              )}
              {hasWarnings && !hasErrors && (
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  ⚠ Попередження
                </Badge>
              )}
              {hasErrors && (
                <Badge variant="destructive" className="text-[10px]">
                  ✗ Помилки
                </Badge>
              )}
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-4">
            <Separator />

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Загальний прогрес</span>
                <span className="font-medium">{completedStages}/{totalStages} етапів</span>
              </div>
              <Progress 
                value={progress} 
                className={cn(
                  "h-2",
                  hasErrors && "[&>div]:bg-red-500",
                  progress === 100 && !hasErrors && "[&>div]:bg-emerald-500"
                )}
              />
            </div>

            {/* Stages Timeline */}
            <div className="space-y-1">
              {processingHistory.stages.map((stage, index) => {
                const config = stageConfig[stage.stage];
                const status = statusConfig[stage.status];
                const StageIcon = config.icon;
                
                return (
                  <div 
                    key={stage.stage}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-md transition-colors",
                      stage.status === "error" && "bg-red-50/50 dark:bg-red-950/20",
                      stage.warnings?.length && "bg-amber-50/50 dark:bg-amber-950/20"
                    )}
                  >
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center",
                        status.bgColor
                      )}>
                        {stage.status === "processing" ? (
                          <Sparkles className={cn("w-3.5 h-3.5 animate-pulse", status.color)} />
                        ) : stage.status === "error" ? (
                          <AlertTriangle className={cn("w-3.5 h-3.5", status.color)} />
                        ) : (
                          <StageIcon className={cn("w-3.5 h-3.5", status.color)} />
                        )}
                      </div>
                      {index < processingHistory.stages.length - 1 && (
                        <div className="w-px h-full min-h-[16px] bg-border" />
                      )}
                    </div>
                    
                    {/* Stage content */}
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{config.labelUk}</p>
                        {stage.duration && (
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(stage.duration)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                      
                      {/* Model info */}
                      {stage.model && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">
                            {stage.model}
                          </Badge>
                          {stage.confidence && (
                            <span className="text-[10px] text-muted-foreground">
                              {stage.confidence.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Warnings */}
                      {stage.warnings?.map((warning, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 dark:text-amber-400"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {warning}
                        </div>
                      ))}
                      
                      {/* Errors */}
                      {stage.errors?.map((error, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-1.5 mt-1 text-xs text-red-600 dark:text-red-400"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>
                Оброблено: {format(new Date(processingHistory.completedAt || processingHistory.startedAt), "dd.MM.yyyy HH:mm:ss", { locale: uk })}
              </span>
              {processingHistory.totalDuration && (
                <span>Загалом: {formatDuration(processingHistory.totalDuration)}</span>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
