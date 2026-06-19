import { useState, useEffect, useMemo } from "react";
import { 
  AlertTriangle, FileSignature, Clock, CreditCard, 
  Building2, FileWarning, Copy, Receipt, ChevronRight,
  AlertCircle, ShieldAlert, X, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  type Document,
  type DocumentIssueType,
  documentIssueTypeConfig,
  detectDocumentIssues,
} from "@/config/documentFlowConfig";

const STORAGE_KEY = "document_attention_dismissed";
const COLLAPSED_KEY = "document_attention_collapsed";

interface DocumentAttentionBlockProps {
  documents: Document[];
  blockId?: string;
  onFilterByIssue?: (issueType: DocumentIssueType) => void;
  onNavigateToAnalytics?: () => void;
}

// Icon mapping for issue types
const issueIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileSignature,
  UserX: Building2,
  Clock,
  CreditCard,
  CalendarClock: Clock,
  Building2,
  ShieldAlert,
  Copy,
  FileWarning,
  Receipt,
  AlertCircle,
};

// Priority groups
const CRITICAL_ISSUES: DocumentIssueType[] = ["pending-signature", "expired", "overdue-payment"];
const HIGH_ISSUES: DocumentIssueType[] = ["missing-counterparty-sign", "missing-payment", "registration-pending"];
const MEDIUM_ISSUES: DocumentIssueType[] = ["partial-payment", "missing-contractor", "invalid-requisites", "duplicate-suspected", "missing-file", "retention-expiring"];

const getDismissedBlocks = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const setDismissedBlocks = (blocks: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
};

const getCollapsedState = (blockId: string): boolean => {
  try {
    const collapsed = JSON.parse(localStorage.getItem(COLLAPSED_KEY) || "{}");
    return collapsed[blockId] || false;
  } catch {
    return false;
  }
};

const setCollapsedState = (blockId: string, isCollapsed: boolean) => {
  try {
    const collapsed = JSON.parse(localStorage.getItem(COLLAPSED_KEY) || "{}");
    collapsed[blockId] = isCollapsed;
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(collapsed));
  } catch {
    // ignore
  }
};

export const DocumentAttentionBlock = ({
  documents,
  blockId = "document-flow-attention",
  onFilterByIssue,
  onNavigateToAnalytics,
}: DocumentAttentionBlockProps) => {
  const [visible, setVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const dismissed = getDismissedBlocks();
    setVisible(!dismissed.includes(blockId));
    setIsCollapsed(getCollapsedState(blockId));
  }, [blockId]);

  const handleDismiss = () => {
    const dismissed = getDismissedBlocks();
    if (!dismissed.includes(blockId)) {
      setDismissedBlocks([...dismissed, blockId]);
    }
    setVisible(false);
  };

  const handleToggleCollapse = (open: boolean) => {
    const newCollapsed = !open;
    setIsCollapsed(newCollapsed);
    setCollapsedState(blockId, newCollapsed);
  };

  // Calculate issues breakdown
  const issuesData = useMemo(() => {
    const issuesByType: Record<DocumentIssueType, Document[]> = {} as Record<DocumentIssueType, Document[]>;
    
    documents.forEach(doc => {
      const issues = detectDocumentIssues(doc);
      issues.forEach(issueType => {
        if (!issuesByType[issueType]) {
          issuesByType[issueType] = [];
        }
        issuesByType[issueType].push(doc);
      });
    });

    // Sort by priority
    const sortedIssues = Object.entries(issuesByType)
      .map(([type, docs]) => ({
        type: type as DocumentIssueType,
        count: docs.length,
        config: documentIssueTypeConfig[type as DocumentIssueType],
      }))
      .sort((a, b) => a.config.priority - b.config.priority);

    const totalWithIssues = documents.filter(doc => detectDocumentIssues(doc).length > 0).length;
    const criticalCount = sortedIssues
      .filter(i => CRITICAL_ISSUES.includes(i.type))
      .reduce((sum, i) => sum + i.count, 0);
    const highCount = sortedIssues
      .filter(i => HIGH_ISSUES.includes(i.type))
      .reduce((sum, i) => sum + i.count, 0);

    return {
      issuesByType: sortedIssues,
      totalWithIssues,
      totalDocuments: documents.length,
      criticalCount,
      highCount,
      healthPercent: documents.length > 0 
        ? Math.round(((documents.length - totalWithIssues) / documents.length) * 100)
        : 100,
    };
  }, [documents]);

  // Don't show if dismissed or no issues
  if (!visible) return null;

  if (issuesData.totalWithIssues === 0) {
    return (
      <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-medium text-emerald-800 dark:text-emerald-200">
                  Усі документи в порядку
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">
                  {documents.length} документів без проблем
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-7 w-7 p-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
              aria-label="Закрити"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine alert level
  const alertLevel = issuesData.criticalCount > 0 
    ? "critical" 
    : issuesData.highCount > 0 
    ? "high" 
    : "medium";

  const alertStyles = {
    critical: {
      bg: "bg-red-50/50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-800",
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      textColor: "text-red-800 dark:text-red-200",
      subTextColor: "text-red-600 dark:text-red-400",
      progressColor: "bg-red-500",
    },
    high: {
      bg: "bg-orange-50/50 dark:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-800",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      textColor: "text-orange-800 dark:text-orange-200",
      subTextColor: "text-orange-600 dark:text-orange-400",
      progressColor: "bg-orange-500",
    },
    medium: {
      bg: "bg-amber-50/50 dark:bg-amber-950/20",
      border: "border-amber-200 dark:border-amber-800",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      textColor: "text-amber-800 dark:text-amber-200",
      subTextColor: "text-amber-600 dark:text-amber-400",
      progressColor: "bg-amber-500",
    },
  };

  const styles = alertStyles[alertLevel];

  return (
    <Card className={cn(styles.bg, styles.border, "animate-in fade-in slide-in-from-top-1 duration-200")}>
      <Collapsible open={!isCollapsed} onOpenChange={handleToggleCollapse}>
        <CardContent className="p-4">
          {/* Header - always visible */}
          <div className="flex items-start justify-between gap-3">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity">
                <div className={cn("p-2 rounded-full", styles.iconBg)}>
                  <AlertTriangle className={cn("w-5 h-5", styles.iconColor)} />
                </div>
                <div>
                  <div className={cn("font-semibold", styles.textColor)}>
                    Потребують уваги: {issuesData.totalWithIssues} документів
                  </div>
                  <div className={cn("text-sm", styles.subTextColor)}>
                    {issuesData.criticalCount > 0 && `${issuesData.criticalCount} критичних`}
                    {issuesData.criticalCount > 0 && issuesData.highCount > 0 && ", "}
                    {issuesData.highCount > 0 && `${issuesData.highCount} важливих`}
                  </div>
                </div>
                {isCollapsed ? (
                  <ChevronDown className={cn("w-4 h-4 ml-1", styles.iconColor)} />
                ) : (
                  <ChevronUp className={cn("w-4 h-4 ml-1", styles.iconColor)} />
                )}
              </button>
            </CollapsibleTrigger>
            
            {/* Health indicator + dismiss */}
            <div className="flex items-start gap-2">
              <div className="text-right">
                <div className="text-2xl font-bold tabular-nums">
                  {issuesData.healthPercent}%
                </div>
                <div className="text-xs text-muted-foreground">якість</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className={cn(
                  "h-7 w-7 p-0",
                  styles.iconColor,
                  "hover:bg-background/50"
                )}
                aria-label="Закрити блок"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Collapsible content */}
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", styles.progressColor)}
                  style={{ width: `${100 - issuesData.healthPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{issuesData.totalWithIssues} з проблемами</span>
                <span>{issuesData.totalDocuments - issuesData.totalWithIssues} OK</span>
              </div>
            </div>

            {/* Issues breakdown */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                За типами проблем
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {issuesData.issuesByType.slice(0, 6).map(({ type, count, config }) => {
                  const IconComponent = issueIconMap[config.icon] || AlertCircle;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => onFilterByIssue?.(type)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                        "hover:bg-background/80 border",
                        config.bgColor,
                        config.bgColorDark,
                        config.borderColor
                      )}
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {config.shortLabel}
                        </div>
                        <div className="text-lg font-bold tabular-nums leading-tight">
                          {count}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {issuesData.issuesByType.length > 6 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateToAnalytics}
                  className="w-full text-xs h-8 gap-1"
                >
                  Показати всі ({issuesData.issuesByType.length} типів)
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* AI suggestions */}
            <div className="pt-2 border-t">
              <div className="flex flex-wrap gap-2">
                {issuesData.criticalCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary/20 text-xs"
                    onClick={() => onFilterByIssue?.("pending-signature")}
                  >
                    🤖 Підписати терміново
                  </Badge>
                )}
                {issuesData.issuesByType.some(i => i.type === "overdue-payment") && (
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary/20 text-xs"
                    onClick={() => onFilterByIssue?.("overdue-payment")}
                  >
                    🤖 Перевірити оплати
                  </Badge>
                )}
                {issuesData.issuesByType.some(i => i.type === "missing-file") && (
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary/20 text-xs"
                    onClick={() => onFilterByIssue?.("missing-file")}
                  >
                    🤖 Завантажити файли
                  </Badge>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
};