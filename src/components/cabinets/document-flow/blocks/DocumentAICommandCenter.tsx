/**
 * DocumentAICommandCenter v4 — AI Insights with Actionable Suggestions
 * 
 * Single source of truth replacing:
 * - AI Summary section from DocumentPassportBlock
 * - OverviewTasksBlock
 * - OverviewRisksBlock
 * 
 * NEW in v4:
 * - AIInsightCard: Combined risk + AI suggestion in one card
 * - "Actionable Insight" pattern: Problem + Solution together
 * - Accept/Edit/Reject workflow for suggestions
 * - Clipboard integration for quick text insertion
 */

import { useState, useMemo, useCallback } from "react";
import {
  Sparkles, AlertCircle, Lightbulb, Zap, Check, Circle, Lock, CheckCircle2,
  ChevronDown, ChevronRight, Clock, HelpCircle, ListChecks, AlertTriangle, Search,
  ExternalLink, Upload, UserPlus, MessageSquare, FileSearch, Beaker, FileText, Edit
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useCommandCenterState } from "@/hooks/useCommandCenterState";
import { AIInsightCard } from "./AIInsightCard";
import type { Document as FlowDocument, DocumentRisk, DocumentTask, RiskSeverity, RiskCategory } from "@/config/documentFlowConfig";
import type { DocumentSummary, ContractSummary, DocumentChecklist, ChecklistItem, ChecklistActionType } from "@/types/documentSummary";
import type { CommandCenterItem, CommandSection, GroupedCommandItems, CommandCenterProgress, SmartTerm, TermCategory } from "@/types/aiCommandCenter";
import { severityStyles, categoryLabels, categoryIcons, getSectionForTask, getSectionForRisk, actionButtonLabels, termCategoryConfig } from "@/types/aiCommandCenter";
import { getDocumentTypeLabel } from "./OverviewPassportBlock";

// ============================================
// PROPS
// ============================================

interface ContractorPartyInfo {
  name: string;
  code?: string;
  isOwner?: boolean;
  systemStatus?: "in-directory" | "invited" | "has-cabinet" | "not-found";
}

interface DocumentAICommandCenterProps {
  document: FlowDocument;
  summary?: DocumentSummary | ContractSummary;
  aiRisks?: DocumentRisk[];
  tasks?: DocumentTask[];
  checklist?: DocumentChecklist;
  documentId?: string;
  className?: string;
  parties?: ContractorPartyInfo[];
  keyTerms?: string[];
  contractDetails?: ContractSummary['contract'];
  // NEW: Unified field values from template
  fieldValues?: {
    documentNumber?: string;
    documentDate?: string;
    total?: string;
    supplierName?: string;
    supplierCode?: string;
    buyerName?: string;
    buyerCode?: string;
    subject?: string;
    validUntil?: string;
  };
  // Action handlers
  onSignDocument?: () => void;
  onValidateContractor?: () => void;
  onInviteContractor?: () => void;
  onNavigateToRegistration?: () => void;
  onNavigateToContractor?: (code: string) => void;
  onChatPrompt?: (prompt: string) => void;
  onOpenEditor?: () => void;  // NEW: Open document editor
  // External completion state
  externalCompletedTaskIds?: Set<string>;
}

// ============================================
// HELPERS
// ============================================

const currencyLabels: Record<string, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatFullDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getInitials = (name: string): string => {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
};

const formatAmount = (amount?: number, currency?: string): string => {
  if (!amount) return "";
  const symbol = currencyLabels[currency || "UAH"] || currency || "₴";
  return amount.toLocaleString("uk-UA") + " " + symbol;
};

const priorityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// Type-aware demo risk generator for realistic AI Analysis fallbacks
const getDemoRiskByDocType = (docType: string, docStatus: string): CommandCenterItem | null => {
  const riskMap: Record<string, CommandCenterItem | null> = {
    "contract": {
      id: "demo-risk-contract",
      type: "risk" as const,
      title: "Перевірте умови пролонгації",
      description: "Договір може автоматично продовжитись без вашого контролю",
      section: "attention" as CommandSection,
      severity: "medium" as RiskSeverity,
      category: "deadline" as RiskCategory,
      sourceSection: "Термін дії",
      suggestion: {
        text: "Рекомендую встановити нагадування за 30 днів до закінчення терміну дії договору.",
        targetSection: "Термін дії",
        insertPosition: "append" as const,
        confidence: 85,
      },
      status: "pending",
    },
    "rental-agreement": {
      id: "demo-risk-rental",
      type: "risk" as const,
      title: "Контролюйте термін оренди",
      description: "Наближається закінчення терміну оренди",
      section: "attention" as CommandSection,
      severity: "medium" as RiskSeverity,
      category: "deadline" as RiskCategory,
      sourceSection: "Умови пролонгації",
      suggestion: {
        text: "Прийміть рішення про пролонгацію не пізніше ніж за 30 днів до закінчення договору.",
        targetSection: "Термін дії",
        insertPosition: "append" as const,
        confidence: 90,
      },
      status: "pending",
    },
    "supply-contract": {
      id: "demo-risk-supply",
      type: "risk" as const,
      title: "Відтермінування платежу",
      description: "Перевірте умови відтермінування та їх вплив на ліміт ФОП",
      section: "attention" as CommandSection,
      severity: "medium" as RiskSeverity,
      category: "financial" as RiskCategory,
      sourceSection: "Умови оплати",
      suggestion: {
        text: "Контролюйте дебіторську заборгованість для уникнення касових розривів.",
        targetSection: "Оплата",
        insertPosition: "append" as const,
        confidence: 82,
      },
      status: "pending",
    },
  };

  // Status-aware risks for invoices and acts
  if (docType === "invoice" && docStatus === "sent") {
    return {
      id: "demo-risk-invoice",
      type: "risk" as const,
      title: "Контролюйте термін оплати",
      description: "Рахунок відправлено — відстежуйте надходження коштів",
      section: "attention" as CommandSection,
      severity: "low" as RiskSeverity,
      category: "financial" as RiskCategory,
      sourceSection: "Умови оплати",
      suggestion: {
        text: "Якщо оплата не надійде протягом 3 днів після дедлайну, надішліть нагадування.",
        targetSection: "Оплата",
        insertPosition: "append" as const,
        confidence: 80,
      },
      status: "pending",
    };
  }

  if (docType === "act" && docStatus !== "signed" && docStatus !== "confirmed") {
    return {
      id: "demo-risk-act",
      type: "risk" as const,
      title: "Акт очікує підпису",
      description: "Акт виконаних робіт не підписано обома сторонами",
      section: "attention" as CommandSection,
      severity: "medium" as RiskSeverity,
      category: "legal" as RiskCategory,
      sourceSection: "Підписи сторін",
      suggestion: {
        text: "Надішліть акт контрагенту через ЕДО або нагадайте про підписання.",
        targetSection: "Підписи",
        insertPosition: "append" as const,
        confidence: 88,
      },
      status: "pending",
    };
  }

  // No risks for receipts, bank statements, confirmed documents
  if (["receipt", "prro-receipt", "bank-statement", "waybill", "ttn"].includes(docType)) {
    return null;
  }

  return riskMap[docType] ?? null;
};


// ============================================
// SMART DESCRIPTION (with inline contractor links)
// ============================================

interface SmartDescriptionProps {
  text: string;
  parties?: ContractorPartyInfo[];
  onContractorClick?: (code: string) => void;
}

const SmartDescription = ({ text, parties, onContractorClick }: SmartDescriptionProps) => {
  // Find contractor (non-owner) in text
  const contractor = parties?.find(p => !p.isOwner && p.name);
  
  if (!contractor || !text.includes(contractor.name)) {
    return <p className="text-sm text-foreground/90 leading-relaxed">{text}</p>;
  }
  
  // Split text around contractor name
  const escapedName = contractor.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedName})`, 'g'));
  
  const isClickable = contractor.code && contractor.systemStatus !== "not-found";
  
  const getStatusStyles = () => {
    switch (contractor.systemStatus) {
      case "has-cabinet":
        return "text-primary font-medium hover:underline underline-offset-2 cursor-pointer";
      case "in-directory":
      case "invited":
        return "text-foreground font-medium hover:text-primary hover:underline underline-offset-2 cursor-pointer";
      case "not-found":
      default:
        return "text-muted-foreground font-medium";
    }
  };
  
  return (
    <p className="text-sm text-foreground/90 leading-relaxed">
      {parts.map((part, index) => {
        if (part === contractor.name) {
          return isClickable ? (
            <button
              key={index}
              onClick={() => onContractorClick?.(contractor.code!)}
              className={cn(
                "transition-colors inline",
                getStatusStyles()
              )}
            >
              {part}
            </button>
          ) : (
            <span key={index} className={getStatusStyles()}>
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};

// SmartTermsSection and parseKeyTermsToSmart removed — functionality disabled per UI requirements

// ============================================
// VALIDATION ALERTS (missing mandatory fields)
// ============================================

interface ValidationAlertsProps {
  document: FlowDocument;
}

const ValidationAlerts = ({ document }: ValidationAlertsProps) => {
  const missingFields: string[] = [];
  
  // Check for missing mandatory fields based on document type
  const financialTypes = ["invoice", "act", "contract", "waybill", "tax-invoice", "supply-contract", "fop-service-contract", "rental-agreement"];
  const contractTypes = ["contract", "supply-contract", "fop-service-contract", "rental-agreement", "sale-agreement"];
  
  if (financialTypes.includes(document.type) && !document.amount) {
    missingFields.push("сума");
  }
  if (!document.date) {
    missingFields.push("дата");
  }
  if (contractTypes.includes(document.type) && !document.subject) {
    missingFields.push("предмет");
  }
  if (document.contractor && !document.contractor.code) {
    missingFields.push("ЄДРПОУ контрагента");
  }
  
  if (missingFields.length === 0) return null;
  
  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-md px-2 py-1.5 mt-2 border border-amber-200 dark:border-amber-800">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      <span>Не вистачає: <span className="font-medium">{missingFields.join(", ")}</span></span>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

interface CommandItemCardProps {
  item: CommandCenterItem;
  onAction?: () => void;
  onConfirm?: () => void;
  onDispute?: () => void;
  onExplain?: () => void;
}

const CommandItemCard = ({ item, onAction, onConfirm, onDispute, onExplain }: CommandItemCardProps) => {
  const isRisk = item.type === "risk";
  const isTask = item.type === "task";
  const isCompleted = item.status === "completed";
  const isConfirmed = item.status === "confirmed";
  const isDisputed = item.status === "disputed";
  const isResolved = isCompleted || isConfirmed || isDisputed;
  const isAutomatic = item.actionType === "auto";
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !isResolved;
  
  const getStatusIcon = () => {
    if (isCompleted || isConfirmed) return CheckCircle2;
    if (isDisputed) return Circle;
    if (isAutomatic) return Lock;
    return Circle;
  };
  const StatusIcon = getStatusIcon();
  
  const riskStyles = isRisk && item.severity ? severityStyles[item.severity] : null;
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-2.5 rounded-lg transition-colors",
      isRisk && riskStyles && riskStyles.bg,
      isRisk && riskStyles && `border ${riskStyles.border}`,
      isTask && !isResolved && "hover:bg-muted/50",
      isResolved && "opacity-60"
    )}>
      {/* Status Icon */}
      <StatusIcon className={cn(
        "w-4 h-4 mt-0.5 shrink-0",
        isCompleted || isConfirmed ? "text-success" : 
        isDisputed ? "text-muted-foreground" :
        isAutomatic ? "text-muted-foreground" : 
        isRisk ? (riskStyles?.text || "text-warning-foreground") : "text-primary"
      )} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {/* Type marker + Title */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {isRisk && item.category && (
                <span className="text-sm">{categoryIcons[item.category]}</span>
              )}
              <span className={cn(
                "text-sm font-medium",
                isResolved && "line-through text-muted-foreground"
              )}>
                {item.title}
              </span>
              {isConfirmed && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-success text-success">
                  Підтверджено
                </Badge>
              )}
              {isDisputed && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-muted-foreground text-muted-foreground">
                  Не стосується
                </Badge>
              )}
            </div>
            
            {/* Meta row */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {item.assignee && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-[8px] bg-muted font-medium">
                      {getInitials(item.assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{item.assignee}</span>
                </div>
              )}
              
              {item.dueDate && (
                <span className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                )}>
                  <Clock className="w-3 h-3" />
                  до {formatDate(item.dueDate)}
                  {isOverdue && <AlertCircle className="w-3 h-3" />}
                </span>
              )}
              
              {item.potentialImpact && (
                <span className="text-xs text-destructive font-medium">
                  💰 {formatAmount(item.potentialImpact)}
                </span>
              )}
              
              {item.sourceSection && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5 cursor-help">
                        <FileSearch className="w-3 h-3" />
                        {item.sourceSection}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      {item.aiExplanation?.keywords && (
                        <p className="text-xs">
                          <span className="font-medium">Ключові слова:</span> {item.aiExplanation.keywords.join(", ")}
                        </p>
                      )}
                      {item.aiExplanation?.confidence && (
                        <p className="text-xs">
                          <span className="font-medium">Впевненість:</span> {item.aiExplanation.confidence}%
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Task action button */}
            {isTask && item.actionType && item.actionType !== "auto" && !isResolved && onAction && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAction}
                className="h-7 text-xs gap-1"
              >
                {item.actionLabel || actionButtonLabels[item.actionType]}
              </Button>
            )}
            
            {/* Risk HITL buttons */}
            {isRisk && !isResolved && (
              <div className="flex items-center gap-1">
                {onExplain && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExplain}
                    className="h-7 text-xs gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                  </Button>
                )}
                {onConfirm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onConfirm}
                    className="h-7 text-xs gap-1 text-success hover:text-success hover:bg-success/10"
                  >
                    <Check className="w-3 h-3" />
                    Ок
                  </Button>
                )}
                {onDispute && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDispute}
                    className="h-7 text-xs text-muted-foreground"
                  >
                    Не стосується
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section sub-header
const SectionSubHeader = ({ icon: Icon, label }: { icon: typeof ListChecks; label: string }) => (
  <div className="flex items-center gap-2 py-1.5">
    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export const DocumentAICommandCenter = ({
  document,
  summary,
  aiRisks,
  tasks,
  checklist,
  documentId,
  className,
  parties,
  keyTerms,
  contractDetails,
  fieldValues,
  onSignDocument,
  onValidateContractor,
  onInviteContractor,
  onNavigateToRegistration,
  onNavigateToContractor,
  onChatPrompt,
  onOpenEditor,
  externalCompletedTaskIds,
}: DocumentAICommandCenterProps) => {
  // State management
  const {
    completeTask,
    confirmRisk,
    disputeRisk,
    acceptSuggestion,
    isTaskCompleted,
    isSuggestionAccepted,
    getItemStatus,
  } = useCommandCenterState(documentId || document.id);
  
  // Collapsible state
  const [expanded, setExpanded] = useState({
    recommended: false,
    automatic: false,
  });
  
  // Track if using demo data
  const isUsingDemoData = !tasks?.length && !checklist?.items?.length && !aiRisks?.length;
  
  // Generate AI description
  const aiDescription = useMemo(() => {
    return summary?.description || summary?.shortSummary || document.aiSummary || "";
  }, [summary, document.aiSummary]);
  
  // Confidence level
  const rawConfidence = summary?.confidence;
  const confidenceLevel = typeof rawConfidence === 'number' 
    ? rawConfidence > 1 ? Math.round(rawConfidence) : Math.round(rawConfidence * 100)
    : 95;
  
  // Smart terms parsing removed — functionality disabled per UI requirements
  
  // Build action handlers map
  const actionHandlers: Record<string, () => void> = useMemo(() => ({
    "demo-1": onSignDocument!,
    "demo-2": onNavigateToRegistration!,
    "demo-3": onValidateContractor!,
    "demo-4": onInviteContractor!,
  }), [onSignDocument, onNavigateToRegistration, onValidateContractor, onInviteContractor]);
  
  // Convert tasks to CommandCenterItems
  const taskItems = useMemo((): CommandCenterItem[] => {
    const result: CommandCenterItem[] = [];
    
    // From checklist items
    if (checklist?.items?.length) {
      checklist.items.forEach(item => {
        const isCompleted = isTaskCompleted(item.id) || 
          externalCompletedTaskIds?.has(item.id) || 
          item.status === "done";
        
        result.push({
          id: item.id,
          type: "task",
          title: item.title,
          description: item.description,
          section: getSectionForTask(item.priority, item.action?.type, item.actionCategory),
          priority: item.priority,
          actionType: item.action?.type,
          actionLabel: item.action?.label,
          assignee: item.assignee,
          dueDate: item.dueDate,
          actionCategory: item.actionCategory,
          status: isCompleted ? "completed" : "pending",
        });
      });
    }
    
    // From document tasks
    if (tasks?.length) {
      tasks.forEach(task => {
        const isCompleted = isTaskCompleted(task.id) || 
          externalCompletedTaskIds?.has(task.id) || 
          task.status === "completed";
        
        result.push({
          id: task.id,
          type: "task",
          title: task.title,
          description: task.description,
          section: getSectionForTask(task.priority),
          priority: task.priority,
          assignee: task.assignee,
          dueDate: task.dueDate,
          status: isCompleted ? "completed" : "pending",
        });
      });
    }
    
    // Demo tasks if nothing provided
    if (result.length === 0) {
      result.push(
        {
          id: "demo-1",
          type: "task",
          title: "Підписати документ КЕП",
          description: "Використайте ваш кваліфікований електронний підпис",
          section: "attention",
          priority: "critical",
          actionType: "manual",
          actionLabel: "Підписати",
          assignee: "Директор",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          actionCategory: "required",
          status: isTaskCompleted("demo-1") || externalCompletedTaskIds?.has("demo-1") ? "completed" : "pending",
        },
        {
          id: "demo-2",
          type: "task",
          title: "Зареєструвати ПН в ЄРПН",
          description: "Реєстрація податкової накладної",
          section: "attention",
          priority: "high",
          actionType: "navigate",
          actionLabel: "Перейти",
          assignee: "Бухгалтер",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          actionCategory: "required",
          status: isTaskCompleted("demo-2") || externalCompletedTaskIds?.has("demo-2") ? "completed" : "pending",
        },
        {
          id: "demo-3",
          type: "task",
          title: "Перевірити реквізити контрагента",
          description: "Перевірте ЄДРПОУ в реєстрі",
          section: "recommended",
          priority: "medium",
          actionType: "validate",
          actionLabel: "Перевірити",
          assignee: "Бухгалтер",
          actionCategory: "recommended",
          status: isTaskCompleted("demo-3") || externalCompletedTaskIds?.has("demo-3") ? "completed" : "pending",
        },
        {
          id: "demo-4",
          type: "task",
          title: "Погодити з юристом",
          description: "Необхідна віза юриста",
          section: "recommended",
          priority: "medium",
          actionType: "invite",
          actionLabel: "Запросити",
          assignee: "Юрист",
          actionCategory: "recommended",
          status: isTaskCompleted("demo-4") || externalCompletedTaskIds?.has("demo-4") ? "completed" : "pending",
        },
        {
          id: "demo-5",
          type: "task",
          title: "Запис в Книгу обліку доходів",
          description: "Автоматично після оплати",
          section: "automatic",
          priority: "low",
          actionType: "auto",
          actionCategory: "automatic",
          status: isTaskCompleted("demo-5") || externalCompletedTaskIds?.has("demo-5") ? "completed" : "pending",
        }
      );
    }
    
    return result;
  }, [tasks, checklist, isTaskCompleted, externalCompletedTaskIds]);
  
  // Convert risks to CommandCenterItems
  const riskItems = useMemo((): CommandCenterItem[] => {
    const risks = aiRisks || [];
    
    // Type-aware demo risk with AI suggestion if nothing provided
    if (risks.length === 0 && isUsingDemoData && document) {
      const demoRisk = getDemoRiskByDocType(document.type, document.status);
      if (demoRisk) {
        const status = getItemStatus(demoRisk.id, "risk");
        return [{
          ...demoRisk,
          status: status as "pending" | "confirmed" | "disputed",
          isSuggestionAccepted: isSuggestionAccepted(demoRisk.id),
        }];
      }
      // No fallback for types that don't need risks (receipts, bank statements, etc.)
      return [];
    }
    
    return risks.map(risk => {
      const status = getItemStatus(risk.id, "risk");
      return {
        id: risk.id,
        type: "risk" as const,
        title: risk.title,
        description: risk.description,
        section: getSectionForRisk(risk.severity),
        severity: risk.severity,
        category: risk.category,
        potentialImpact: risk.potentialImpact,
        sourceSection: risk.sourceSection,
        suggestion: risk.suggestion,
        isSuggestionAccepted: isSuggestionAccepted(risk.id) || risk.isSuggestionAccepted,
        status: risk.isConfirmed ? "confirmed" : risk.isDisputed ? "disputed" : status as "pending" | "confirmed" | "disputed",
      };
    });
  }, [aiRisks, getItemStatus, isUsingDemoData, isSuggestionAccepted]);
  
  // Merge and group items
  const allItems = useMemo(() => [...taskItems, ...riskItems], [taskItems, riskItems]);
  
  const groupedItems = useMemo((): GroupedCommandItems => {
    const groups: GroupedCommandItems = {
      attention: [],
      recommended: [],
      automatic: [],
    };
    
    allItems.forEach(item => {
      groups[item.section].push(item);
    });
    
    // Sort by: pending first, then by severity/priority
    const sortItems = (items: CommandCenterItem[]) => {
      return items.sort((a, b) => {
        // Resolved items at the end
        const aResolved = a.status !== "pending";
        const bResolved = b.status !== "pending";
        if (aResolved !== bResolved) return aResolved ? 1 : -1;
        
        // Then by severity/priority
        const aPrio = priorityOrder[a.severity || a.priority || "medium"];
        const bPrio = priorityOrder[b.severity || b.priority || "medium"];
        return aPrio - bPrio;
      });
    };
    
    groups.attention = sortItems(groups.attention);
    groups.recommended = sortItems(groups.recommended);
    groups.automatic = sortItems(groups.automatic);
    
    return groups;
  }, [allItems]);
  
  // Calculate progress for all attention items
  const progress = useMemo((): CommandCenterProgress => {
    const attentionItems = groupedItems.attention;
    const total = attentionItems.length;
    const completed = attentionItems.filter(i => i.status !== "pending").length;
    
    return {
      total,
      completed,
      label: `${completed} з ${total} виконано`,
    };
  }, [groupedItems.attention]);
  
  // Calculate progress specifically for tasks only (for "Необхідні дії" section)
  const tasksProgress = useMemo((): CommandCenterProgress => {
    const taskItems = groupedItems.attention.filter(i => i.type === "task");
    const total = taskItems.length;
    const completed = taskItems.filter(i => i.status !== "pending").length;
    
    return {
      total,
      completed,
      label: `${completed} з ${total}`,
    };
  }, [groupedItems.attention]);
  
  // Check if all items resolved
  const allCompleted = allItems.length > 0 && allItems.every(i => i.status !== "pending");
  const noItemsAtAll = allItems.length === 0;
  
  // Smart expand: auto-expand recommendations if has high severity
  const hasHighSeverityRecommendation = groupedItems.recommended.some(
    i => i.severity === "high" || i.severity === "critical"
  );
  
  // Handle task action
  const handleTaskAction = useCallback((item: CommandCenterItem) => {
    const handler = actionHandlers[item.id];
    if (handler) {
      handler();
      // Auto-complete task after action
      completeTask(item.id);
    }
  }, [actionHandlers, completeTask]);
  
  // Handle risk explain
  const handleExplainRisk = useCallback((item: CommandCenterItem) => {
    onChatPrompt?.(`Поясни ризик "${item.title}" детальніше`);
  }, [onChatPrompt]);
  
  // Handle accept suggestion
  const handleAcceptSuggestion = useCallback((riskId: string, suggestionText: string) => {
    acceptSuggestion(riskId);
  }, [acceptSuggestion]);
  
  // Separate tasks and risks in attention section
  const attentionTasks = groupedItems.attention.filter(i => i.type === "task");
  const attentionRisks = groupedItems.attention.filter(i => i.type === "risk");
  
  return (
    <Card className={cn("overflow-hidden", className)} data-section="ai-command-center">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Аналіз
            {isUsingDemoData && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 border-dashed border-warning text-warning-foreground">
                      <Beaker className="w-3 h-3" />
                      Demo
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Приклад для демонстрації</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {confidenceLevel}%
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="text-xs space-y-1">
                    <p>AI автоматично проаналізував документ:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                      <li><span className="text-foreground">Рекомендації</span> — виявлені ризики з пропозиціями</li>
                      <li><span className="text-foreground">Необхідні дії</span> — задачі для документообігу</li>
                    </ul>
                    <p className="text-muted-foreground pt-1">
                      Відсоток показує впевненість AI в аналізі.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description + Subject + KeyTerms */}
        <div className="space-y-2">
          {/* 1. AI Description or minimal fallback */}
          {aiDescription ? (
            <SmartDescription 
              text={aiDescription} 
              parties={parties} 
              onContractorClick={onNavigateToContractor}
            />
          ) : (
            <p className="text-sm font-medium text-foreground/90">
              {getDocumentTypeLabel(document.type)}
              {(fieldValues?.documentDate || document.date) && (
                <span className="font-normal text-muted-foreground"> від {formatFullDate(fieldValues?.documentDate || document.date)}</span>
              )}
            </p>
          )}

          {/* 2. Subject — ALWAYS (if exists and not duplicated in aiDescription) */}
          {(() => {
            const subject = fieldValues?.subject || document.subject;
            const aiDescContainsSubject = subject && aiDescription && aiDescription.toLowerCase().includes(subject.toLowerCase().slice(0, 20));
            return subject && !aiDescContainsSubject ? (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-muted-foreground">Предмет: </span>
                  <span className="text-foreground/90 line-clamp-2">{subject}</span>
                </div>
              </div>
            ) : null;
          })()}

          {/* 3. Key Terms — ALWAYS (if available) */}
          {(() => {
            const keyTerms = (summary as ContractSummary)?.keyTerms;
            return keyTerms && keyTerms.length > 0 ? (
              <div className="mt-1 p-2 rounded-md bg-muted/30 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <ListChecks className="w-3 h-3" />
                  Ключові умови
                </p>
                <ul className="text-xs text-foreground/80 space-y-0.5 list-disc list-inside">
                  {keyTerms.map((term, i) => <li key={i}>{term}</li>)}
                </ul>
              </div>
            ) : null;
          })()}
          
          {/* Validation Alerts for missing mandatory fields */}
          <ValidationAlerts document={document} />
        </div>
        
        {/* Smart Terms Section - REMOVED per UI requirements */}
        
        {/* All Completed State */}
        {allCompleted && !noItemsAtAll && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium text-success">Все готово!</p>
              <p className="text-xs text-muted-foreground">
                Усі дії виконано, ризиків не виявлено
              </p>
            </div>
          </div>
        )}
        
        {/* No Items State */}
        {noItemsAtAll && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              AI не виявив задач чи ризиків для цього документа
            </p>
          </div>
        )}
        
        {/* 💡 РЕКОМЕНДАЦІЇ SECTION - Risks with suggestions */}
        {attentionRisks.length > 0 && !allCompleted && (
          <div className="space-y-2 border-t border-border/50 pt-3" role="region" aria-label="Рекомендації">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Рекомендації
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {attentionRisks.length}
              </Badge>
            </div>
            
            {attentionRisks.map(item => (
              <AIInsightCard
                key={item.id}
                risk={{
                  id: item.id,
                  category: item.category!,
                  severity: item.severity!,
                  title: item.title,
                  description: item.description || "",
                  sourceSection: item.sourceSection,
                  potentialImpact: item.potentialImpact,
                  suggestion: item.suggestion,
                }}
                isAccepted={item.isSuggestionAccepted}
                isConfirmed={item.status === "confirmed"}
                isDisputed={item.status === "disputed"}
                onAcceptSuggestion={handleAcceptSuggestion}
                onConfirm={confirmRisk}
                onDispute={disputeRisk}
                onOpenEditor={onOpenEditor}
                onExplain={() => handleExplainRisk(item)}
              />
            ))}
          </div>
        )}
        
        {/* ❗ НЕОБХІДНІ ДІЇ SECTION - Tasks with progress (single indicator) */}
        {attentionTasks.length > 0 && !allCompleted && (
          <div className="space-y-2 border-t border-border/50 pt-3" role="region" aria-label="Необхідні дії">
            {/* Header - no duplicate badge */}
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
                Необхідні дії
              </span>
            </div>
            
            {attentionTasks.map(item => (
              <CommandItemCard
                key={item.id}
                item={item}
                onAction={() => handleTaskAction(item)}
              />
            ))}
            
            {/* Single progress indicator at bottom */}
            <div className="flex items-center gap-2 pt-2">
              <Progress 
                value={(tasksProgress.completed / Math.max(tasksProgress.total, 1)) * 100} 
                className="h-1.5 flex-1"
                aria-label={tasksProgress.label}
              />
              <span className="text-xs font-medium text-muted-foreground shrink-0">
                {tasksProgress.completed}/{tasksProgress.total}
              </span>
            </div>
          </div>
        )}
        
        {/* RECOMMENDATIONS merged into АІ РЕКОМЕНДАЦІЇ - removed duplicate section */}
        
        {/* AUTOMATIC SECTION (collapsible) */}
        {groupedItems.automatic.length > 0 && (
          <Collapsible 
            open={expanded.automatic}
            onOpenChange={(open) => setExpanded(e => ({ ...e, automatic: open }))}
          >
            <CollapsibleTrigger 
              className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded-md px-1 -mx-1"
              aria-expanded={expanded.automatic}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Автоматично
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {groupedItems.automatic.length}
                </Badge>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                expanded.automatic && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
              {groupedItems.automatic.map(item => (
                <CommandItemCard
                  key={item.id}
                  item={item}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
