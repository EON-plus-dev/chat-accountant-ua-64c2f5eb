/**
 * TemplateJournalTab - Journal tab with History, Integrations, Numbering sections
 * Similar pattern to DocumentLifecycleTab
 */

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Link2, 
  Hash,
  User,
  BookOpen,
  CreditCard,
  Receipt,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import {
  formatNumberPreview,
  defaultNumberingRules,
  resetPolicyLabels,
  lockAfterLabels,
} from "@/config/documentNumberingConfig";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";
import type { Cabinet } from "@/types/cabinet";
import { TemplateHistorySection } from "./template/TemplateHistorySection";
import { toast } from "@/hooks/use-toast";

type JournalSection = "history" | "integrations" | "numbering";

interface TemplateJournalTabProps {
  template: DocumentTemplate;
  cabinet: Cabinet;
  initialSection?: JournalSection;
  className?: string;
}

// Integration sections
const integrationSections = [
  { id: "income-book", label: "Книга доходів", icon: BookOpen, description: "Автоматичний запис в книгу доходів ФОП", enabled: true },
  { id: "payments", label: "Платежі", icon: CreditCard, description: "Створення платіжних доручень на основі документа", enabled: true },
  { id: "reports", label: "Звітність", icon: Receipt, description: "Відображення в податковій звітності", enabled: false },
  { id: "analytics", label: "Аналітика", icon: BarChart3, description: "Дані для аналітичних звітів", enabled: true },
];

// Section button component
function SectionButton({ 
  id,
  label, 
  icon: Icon,
  isActive, 
  onClick 
}: { 
  id: JournalSection;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
        isActive 
          ? "bg-card text-foreground shadow-sm border border-border/50" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export const TemplateJournalTab = ({
  template,
  cabinet,
  initialSection = "history",
  className,
}: TemplateJournalTabProps) => {
  const [activeSection, setActiveSection] = useState<JournalSection>(initialSection);
  
  // Get numbering rule for this template type
  const numberingRule = useMemo(() => 
    defaultNumberingRules.find(r => r.documentType === template.type),
    [template.type]
  );
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Section selector */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-border/70 bg-card">
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50 w-fit">
          <SectionButton
            id="history"
            label="Історія"
            icon={History}
            isActive={activeSection === "history"}
            onClick={() => setActiveSection("history")}
          />
          <SectionButton
            id="integrations"
            label="Інтеграції"
            icon={Link2}
            isActive={activeSection === "integrations"}
            onClick={() => setActiveSection("integrations")}
          />
          <SectionButton
            id="numbering"
            label="Нумерація"
            icon={Hash}
            isActive={activeSection === "numbering"}
            onClick={() => setActiveSection("numbering")}
          />
        </div>
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6 space-y-4">
          {/* HISTORY SECTION */}
          {activeSection === "history" && (
            <TemplateHistorySection
              template={template}
              onViewVersion={(versionId) => {
                toast({ 
                  title: "Перегляд версії", 
                  description: `Версія ${versionId}` 
                });
              }}
              onCompareVersions={(left, right) => {
                toast({ 
                  title: "Порівняння версій", 
                  description: `${left.versionLabel} ↔ ${right.versionLabel}` 
                });
              }}
              onRestoreVersion={(versionId, version) => {
                toast({ 
                  title: "Відновлення версії",
                  description: `Версію ${version.versionLabel} буде відновлено`
                });
              }}
              onExportAudit={() => {
                toast({ 
                  title: "Експорт історії",
                  description: "Історію шаблону буде експортовано"
                });
              }}
            />
          )}
          
          {/* INTEGRATIONS SECTION */}
          {activeSection === "integrations" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Вхідні дані</CardTitle>
                  <CardDescription>
                    Звідки підтягуються дані при створенні документа
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <div className="rounded-md bg-blue-100 dark:bg-blue-950/40 p-2">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Профіль кабінету</p>
                        <p className="text-xs text-muted-foreground">Реквізити, підпис, печатка</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <div className="rounded-md bg-purple-100 dark:bg-purple-950/40 p-2">
                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Контрагенти</p>
                        <p className="text-xs text-muted-foreground">Довідник контрагентів</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Вихідні інтеграції</CardTitle>
                  <CardDescription>
                    Куди передаються дані після створення документа
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {integrationSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <div 
                        key={section.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                          section.enabled ? "bg-card" : "bg-muted/30 opacity-60"
                        )}
                      >
                        <div className={cn(
                          "rounded-md p-2",
                          section.enabled ? "bg-primary/10" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "w-4 h-4",
                            section.enabled ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{section.label}</p>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                        <Badge variant={section.enabled ? "default" : "secondary"} className="text-xs">
                          {section.enabled ? "Активно" : "Вимкнено"}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}
          
          {/* NUMBERING SECTION */}
          {activeSection === "numbering" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Правила нумерації</CardTitle>
                  <CardDescription>
                    Налаштування автоматичної нумерації документів цього типу
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {numberingRule ? (
                    <>
                      {/* Preview */}
                      <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Приклад номера:</p>
                        <p className="text-lg font-mono font-semibold">
                          {formatNumberPreview(numberingRule)}
                        </p>
                      </div>
                      
                      {/* Pattern description */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Формат нумерації</label>
                        <div className="p-3 bg-muted/30 rounded-lg font-mono text-sm">
                          {numberingRule.prefix}{numberingRule.separator}
                          {numberingRule.yearFormat !== "none" && (numberingRule.yearFormat === "full" ? "YYYY" : "YY") + numberingRule.separator}
                          {"0".repeat(numberingRule.sequencePadding)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Префікс: {numberingRule.prefix}, Рік: {numberingRule.yearFormat === "full" ? "повний" : numberingRule.yearFormat === "short" ? "скорочений" : "без року"}
                        </p>
                      </div>
                      
                      {/* Settings grid */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Скидання лічильника</label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {resetPolicyLabels[numberingRule.resetPolicy]}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Блокування номера</label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {lockAfterLabels[numberingRule.lockAfter]}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Поточний лічильник</label>
                          <p className="text-sm font-mono text-muted-foreground mt-1">
                            {numberingRule.currentSequence}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Довжина номера</label>
                          <p className="text-sm font-mono text-muted-foreground mt-1">
                            {numberingRule.sequencePadding} цифр
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Hash className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                      <p className="text-muted-foreground">
                        Правила нумерації не налаштовані для цього типу документа
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
