/**
 * OverviewQuickActionsBlock — Блок "Швидкі дії та чіпи-запити"
 * Горизонтальний скрол чіпів для швидкої навігації та AI-запитів
 */

import { FileText, BarChart3, Link2, GitCompare, Scale, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";

interface OverviewQuickActionsBlockProps {
  document: FlowDocument;
  onNavigateToTab?: (tabId: string) => void;
  onChatPrompt?: (prompt: string) => void;
  onCompareVersions?: () => void;
  onCreateDiscrepancy?: () => void;
  className?: string;
}

interface QuickActionChip {
  id: string;
  icon: typeof FileText;
  label: string;
  action: () => void;
  variant?: "default" | "primary" | "destructive";
}

export const OverviewQuickActionsBlock = ({
  document,
  onNavigateToTab,
  onChatPrompt,
  onCompareVersions,
  onCreateDiscrepancy,
  className,
}: OverviewQuickActionsBlockProps) => {
  // Build chips based on document type and available actions
  const chips: QuickActionChip[] = [];

  // Navigate to document view
  if (onNavigateToTab) {
    chips.push({
      id: "document",
      icon: FileText,
      label: "Перейти до документа",
      action: () => onNavigateToTab("document"),
    });
  }

  // Show in accounting (for financial documents)
  if (onNavigateToTab && ["invoice", "act", "contract", "tax-invoice"].includes(document.type)) {
    chips.push({
      id: "accounting",
      icon: BarChart3,
      label: "Показати в обліку",
      action: () => onNavigateToTab("accounting"),
    });
  }

  // Show related documents
  if (onNavigateToTab) {
    chips.push({
      id: "related",
      icon: Link2,
      label: "Показати зв'язки",
      action: () => onNavigateToTab("related"),
    });
  }

  // Compare versions (if multiple versions exist)
  if (onCompareVersions && (document.version || 1) > 1) {
    chips.push({
      id: "versions",
      icon: GitCompare,
      label: "Порівняти версії",
      action: onCompareVersions,
    });
  }

  // Create discrepancy act (for contracts/acts)
  if (onCreateDiscrepancy && ["contract", "act", "invoice"].includes(document.type)) {
    chips.push({
      id: "discrepancy",
      icon: Scale,
      label: "Створити акт розбіжностей",
      action: onCreateDiscrepancy,
      variant: "destructive",
    });
  }

  // Ask AI
  if (onChatPrompt) {
    chips.push({
      id: "ask-ai",
      icon: MessageSquare,
      label: "Поставити запитання AI",
      action: () => onChatPrompt(`Що ти можеш розповісти про документ ${document.number}?`),
      variant: "primary",
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <Card className={cn("overflow-hidden", className)} data-section="quick-actions">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Швидкі дії
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {chips.map(chip => (
              <Button
                key={chip.id}
                variant={chip.variant === "primary" ? "default" : chip.variant === "destructive" ? "destructive" : "outline"}
                size="sm"
                onClick={chip.action}
                className={cn(
                  "gap-1.5 shrink-0 text-xs h-8",
                  chip.variant === "primary" && "bg-primary hover:bg-primary/90"
                )}
                data-action={chip.id}
              >
                <chip.icon className="w-3.5 h-3.5" />
                {chip.label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
