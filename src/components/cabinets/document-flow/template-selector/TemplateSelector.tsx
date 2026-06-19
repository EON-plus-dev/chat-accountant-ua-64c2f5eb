/**
 * TemplateSelector - Enterprise Card Grid template selector
 * Single-panel layout with Quick Preview dialog
 * Replaces Master-Detail with unified card-based experience
 */

import { useState, useEffect, useMemo } from "react";
import { useRecentlyUsedTemplates } from "@/hooks/use-recently-used-templates";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Cabinet } from "@/types/cabinet";
import { type DocumentType, type Document, documentTypeConfigs } from "@/config/documentFlowConfig";
import { type DocumentTemplate, systemTemplates, demoCustomTemplates } from "@/config/documentTemplatesConfig";
import { TemplateMasterList, relatedTemplateTypes } from "./TemplateMasterList";

// Creatable types for "all" filter
const creatableTypes: DocumentType[] = [
  "invoice", "act", "waybill", "ttn", "tax-invoice", "payment-order", 
  "reconciliation", "discrepancy-act", "contract"
];

interface TemplateSelectorProps {
  cabinet: Cabinet;
  onSelect: (type: DocumentType, template: DocumentTemplate) => void;
  onBack?: () => void;
  onCreateTemplate?: () => void;
  initialType?: DocumentType;
  aiSuggestedTags?: string[];
  parentDocument?: Document | null;
}

export function TemplateSelector({
  cabinet,
  onSelect,
  onBack,
  onCreateTemplate,
  initialType,
  aiSuggestedTags = [],
  parentDocument,
}: TemplateSelectorProps) {
  const isMobile = useIsMobile();
  const [selectedType, setSelectedType] = useState<DocumentType | "all">(
    parentDocument ? "all" : (initialType || "all")
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const { addRecent } = useRecentlyUsedTemplates();
  
  // Update type when initialType changes (from chat context)
  useEffect(() => {
    if (initialType) {
      setSelectedType(initialType);
    }
  }, [initialType]);
  
  // Get all templates for count display
  const allTemplates = useMemo(() => {
    if (selectedType === "all") {
      const relevantTypes = parentDocument 
        ? relatedTemplateTypes[parentDocument.type] || creatableTypes 
        : creatableTypes;
      const filterFn = (t: DocumentTemplate) => relevantTypes.includes(t.type);
      return [...systemTemplates.filter(filterFn), ...demoCustomTemplates.filter(filterFn)];
    }
    const filterFn = (t: DocumentTemplate) => t.type === selectedType;
    return [...systemTemplates.filter(filterFn), ...demoCustomTemplates.filter(filterFn)];
  }, [selectedType, parentDocument]);
  
  // Auto-select first template when type changes
  useEffect(() => {
    if (allTemplates.length > 0 && !allTemplates.find(t => t.id === selectedTemplateId)) {
      setSelectedTemplateId(allTemplates[0].id);
    }
  }, [selectedType, allTemplates, selectedTemplateId]);
  
  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplateId(template.id);
  };
  
  const handleUseTemplate = (template: DocumentTemplate) => {
    // Track MRU before proceeding
    addRecent(template.id);
    // Use template's actual type, not the filter value
    onSelect(template.type, template);
  };
  
  const handleTypeChange = (type: DocumentType | "all") => {
    setSelectedType(type);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">Оберіть шаблон</h1>
          <p className="text-xs text-muted-foreground truncate">
            {parentDocument 
              ? `до ${documentTypeConfigs[parentDocument.type]?.label || 'документу'} ${parentDocument.number}`
              : `${allTemplates.length} шаблонів доступно`
            }
          </p>
        </div>
        
        {/* Create Template button */}
        {onCreateTemplate && (
          <Button 
            variant="outline"
            size="sm"
            onClick={onCreateTemplate}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className={cn(isMobile && "sr-only")}>Свій шаблон</span>
          </Button>
        )}
      </div>
      
      {/* Content - Single panel with cards */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <TemplateMasterList 
          className="h-full"
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={handleSelectTemplate}
          onUseTemplate={handleUseTemplate}
          onCreateTemplate={onCreateTemplate}
          aiSuggestedTags={aiSuggestedTags}
          parentDocument={parentDocument}
        />
      </div>
    </div>
  );
}
