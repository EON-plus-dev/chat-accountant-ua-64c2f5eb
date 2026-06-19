/**
 * TemplateOverviewTab — Вкладка "Огляд" для сторінки шаблону
 * Архітектурно консистентна з DocumentOverviewTab
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Info, Lightbulb, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";
import type { UnifiedTemplateField } from "@/types/templateField";
import { getTemplateById } from "@/config/documentTemplatesConfig";

// Import blocks
import { TemplateQuickActionsBlock } from "../blocks/TemplateQuickActionsBlock";
import { TemplatePassportBlock } from "../blocks/TemplatePassportBlock";
import { FieldCoverageWidget } from "../blocks/FieldCoverageWidget";

interface TemplateOverviewTabProps {
  template: DocumentTemplate;
  fields: UnifiedTemplateField[];
  cabinet?: Cabinet;
  canEdit: boolean;
  onNavigateToTab?: (tabId: string) => void;
  onEditTemplate?: () => void;
  onTestTemplate?: () => void;
  onDuplicate?: () => void;
  onChatPrompt?: (prompt: string) => void;
  onNavigateToRelatedTemplate?: (templateId: string) => void;
  className?: string;
}

// Related documents by type
const relatedDocuments: Record<string, string[]> = {
  invoice: ["act", "waybill", "tax-invoice"],
  act: ["invoice", "contract"],
  waybill: ["invoice", "ttn"],
  contract: ["act", "invoice", "fop-service-contract"],
  "tax-invoice": ["invoice"],
  "employment-order": ["vacation-order", "dismissal-order"],
};

export const TemplateOverviewTab = ({
  template,
  fields,
  cabinet,
  canEdit,
  onNavigateToTab,
  onEditTemplate,
  onTestTemplate,
  onDuplicate,
  onChatPrompt,
  onNavigateToRelatedTemplate,
  className,
}: TemplateOverviewTabProps) => {
  // Get related templates
  const relatedTemplates = useMemo(() => {
    const relatedTypes = relatedDocuments[template.type] || [];
    return relatedTypes
      .map(relType => {
        const relTemplate = getTemplateById(`sys-${relType}-standard`) || getTemplateById(`sys-${relType}-services`);
        return relTemplate;
      })
      .filter((t): t is DocumentTemplate => t !== undefined);
  }, [template.type]);

  const handleNavigateToRelated = (templateId: string) => {
    if (onNavigateToRelatedTemplate) {
      onNavigateToRelatedTemplate(templateId);
    }
  };

  return (
    <ScrollArea className={cn("flex-1 animate-fade-in", className)}>
      <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
        {/* 1. Quick Actions */}
        <TemplateQuickActionsBlock
          template={template}
          canEdit={canEdit}
          onNavigateToTab={onNavigateToTab}
          onEditTemplate={onEditTemplate}
          onTestTemplate={onTestTemplate}
          onDuplicate={onDuplicate}
          onChatPrompt={onChatPrompt}
        />

        {/* 2. Template Passport */}
        <TemplatePassportBlock template={template} />

        {/* 3. Field Coverage */}
        <FieldCoverageWidget
          fields={fields}
          onNavigateToFields={() => onNavigateToTab?.("template")}
        />

        {/* 4. Description & Use Cases */}
        {(template.description || template.useCases?.length) && (
          <Card data-section="description">
            <CardHeader className="px-3 sm:px-6 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="sm:hidden">Опис</span>
                <span className="hidden sm:inline">Опис та призначення</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 space-y-3">
              {template.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              )}

              {template.useCases && template.useCases.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Приклади використання:</span>
                    <span className="sm:hidden">Приклади:</span>
                  </p>
                  <ul className="space-y-1 pl-4">
                    {template.useCases.map((useCase, idx) => (
                      <li 
                        key={idx} 
                        className="text-sm text-muted-foreground list-disc marker:text-primary/50"
                      >
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 5. Related Document Types */}
        <Card data-section="related-documents">
          <CardHeader className="px-3 sm:px-6 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="sm:hidden">Пов'язані</span>
              <span className="hidden sm:inline">Пов'язані документи</span>
            </CardTitle>
            <CardDescription className="text-xs hidden sm:block">
              Документи, які часто створюються разом з цим шаблоном
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {relatedTemplates.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {relatedTemplates.map(relTemplate => {
                  const RelIcon = relTemplate.icon;
                  return (
                    <Badge
                      key={relTemplate.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 transition-colors max-w-[140px] sm:max-w-none"
                      onClick={() => handleNavigateToRelated(relTemplate.id)}
                    >
                      <RelIcon className="h-3 w-3 mr-1 shrink-0" />
                      <span className="truncate">{relTemplate.name}</span>
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Немає пов'язаних документів
              </p>
            )}
          </CardContent>
        </Card>

        {/* 6. Compliance & Features (if available) */}
        {(template.compliance?.length || template.features?.length) && (
          <Card data-section="compliance">
            <CardHeader className="px-3 sm:px-6 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="sm:hidden">Можливості</span>
                <span className="hidden sm:inline">Можливості та відповідність</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {template.features?.map(feature => {
                  const featureLabels: Record<string, { full: string; short: string }> = {
                    positions: { full: "📋 Таблиця позицій", short: "📋 Позиції" },
                    discount: { full: "💰 Знижки", short: "💰" },
                    notes: { full: "📝 Коментарі", short: "📝" },
                    signature: { full: "✍️ Підпис", short: "✍️" },
                    schedule: { full: "📅 Графік платежів", short: "📅 Графік" },
                    appendix: { full: "📎 Додатки", short: "📎" },
                  };
                  const labels = featureLabels[feature] || { full: feature, short: feature };
                  return (
                    <Badge key={feature} variant="outline" className="text-xs">
                      <span className="hidden sm:inline">{labels.full}</span>
                      <span className="sm:hidden">{labels.short}</span>
                    </Badge>
                  );
                })}
                {template.compliance?.map(tag => {
                  const complianceLabels: Record<string, { full: string; short: string }> = {
                    "legal-verified": { full: "⚖️ Юридично перевірено", short: "⚖️ Перевір." },
                    "dstu-compliant": { full: "📄 ДСТУ", short: "📄 ДСТУ" },
                  };
                  const labels = complianceLabels[tag] || { full: tag, short: tag };
                  return (
                    <Badge key={tag} variant="success" className="text-xs">
                      <span className="hidden sm:inline">{labels.full}</span>
                      <span className="sm:hidden">{labels.short}</span>
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};
