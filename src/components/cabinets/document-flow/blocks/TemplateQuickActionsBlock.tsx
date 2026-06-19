/**
 * TemplateQuickActionsBlock — Блок "Швидкі дії" для шаблону
 * Горизонтальний скрол чіпів для швидкої навігації та операцій
 */

import { Edit, Play, Copy, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";

interface TemplateQuickActionsBlockProps {
  template: DocumentTemplate;
  canEdit: boolean;
  onNavigateToTab?: (tabId: string) => void;
  onEditTemplate?: () => void;
  onTestTemplate?: () => void;
  onDuplicate?: () => void;
  onChatPrompt?: (prompt: string) => void;
  className?: string;
}

interface QuickActionChip {
  id: string;
  icon: typeof Edit;
  label: string;
  mobileLabel?: string;
  action: () => void;
  variant?: "default" | "primary" | "destructive" | "outline";
}

export const TemplateQuickActionsBlock = ({
  template,
  canEdit,
  onNavigateToTab,
  onEditTemplate,
  onTestTemplate,
  onDuplicate,
  onChatPrompt,
  className,
}: TemplateQuickActionsBlockProps) => {
  // Build chips based on available actions
  const chips: QuickActionChip[] = [];

  // Edit template (primary action for custom templates)
  if (canEdit && onEditTemplate) {
    chips.push({
      id: "edit",
      icon: Edit,
      label: "Редагувати",
      action: () => onEditTemplate(),
      variant: "primary",
    });
  }

  // Test with data
  if (onTestTemplate) {
    chips.push({
      id: "test",
      icon: Play,
      label: "Тестувати",
      mobileLabel: "Тест",
      action: () => onTestTemplate(),
      variant: "default",
    });
  }

  // Duplicate template
  if (onDuplicate) {
    chips.push({
      id: "duplicate",
      icon: Copy,
      label: "Дублювати",
      mobileLabel: "Дубл.",
      action: () => onDuplicate(),
      variant: "outline",
    });
  }

  // Ask AI
  if (onChatPrompt) {
    chips.push({
      id: "ask-ai",
      icon: Sparkles,
      label: "Запитати AI",
      mobileLabel: "AI",
      action: () => onChatPrompt(`Проаналізуй структуру шаблону "${template.name}" та дай рекомендації`),
      variant: "outline",
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <Card className={cn("overflow-hidden", className)} data-section="quick-actions">
      <CardHeader className="px-3 sm:px-6 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="sm:hidden">Дії</span>
          <span className="hidden sm:inline">Швидкі дії</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 sm:px-6 pb-3">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {chips.map(chip => (
              <Button
                key={chip.id}
                variant={
                  chip.variant === "primary" 
                    ? "default" 
                    : chip.variant === "destructive" 
                    ? "destructive" 
                    : "outline"
                }
                size="sm"
                onClick={chip.action}
                className={cn(
                  "gap-1.5 shrink-0 text-xs h-8",
                  chip.variant === "primary" && "bg-primary hover:bg-primary/90"
                )}
                data-action={chip.id}
              >
                <chip.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{chip.label}</span>
                <span className="sm:hidden">{chip.mobileLabel || chip.label}</span>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
