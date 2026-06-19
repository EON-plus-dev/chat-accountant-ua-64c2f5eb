/**
 * TemplateMasterList - Enterprise-grade template list with Grid/List toggle
 * Features: AI recommendations, MRU, search, source filters, Quick Preview
 */

import { useState, useMemo, useLayoutEffect, useRef, useCallback } from "react";
import { Search, Sparkles, Link2, X, Clock, FileText, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type DocumentType, documentTypeConfigs } from "@/config/documentFlowConfig";
import { type DocumentTemplate, systemTemplates, demoCustomTemplates } from "@/config/documentTemplatesConfig";
import { TemplateRichCard } from "./TemplateRichCard";
import { TemplatePreviewDialog } from "../TemplatePreviewDialog";
import { ViewModeToggle, type TemplateViewMode } from "@/components/ui/view-mode-toggle";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useRecentlyUsedTemplates } from "@/hooks/use-recently-used-templates";

type TemplateSource = "all" | "system" | "custom";

// Document types that can be created
const creatableTypes: DocumentType[] = [
  "invoice", "act", "waybill", "ttn", "tax-invoice", "payment-order", 
  "reconciliation", "discrepancy-act", "contract",
];

interface TemplateMasterListProps {
  selectedType: DocumentType | "all";
  onTypeChange: (type: DocumentType | "all") => void;
  selectedTemplateId: string;
  onSelectTemplate: (template: DocumentTemplate) => void;
  onUseTemplate: (template: DocumentTemplate) => void;
  onCreateTemplate?: () => void;
  aiSuggestedTags?: string[];
  className?: string;
  parentDocument?: import("@/config/documentFlowConfig").Document | null;
}

// Related template types mapping for context-aware filtering
export const relatedTemplateTypes: Record<DocumentType, DocumentType[]> = {
  contract: ["act", "invoice", "waybill", "ttn", "tax-invoice", "payment-order", "reconciliation"],
  "rental-agreement": ["act", "invoice", "tax-invoice", "payment-order", "reconciliation"],
  "supply-contract": ["waybill", "ttn", "invoice", "act", "tax-invoice", "payment-order", "reconciliation", "discrepancy-act"],
  "sale-agreement": ["act", "invoice", "waybill", "ttn", "tax-invoice", "payment-order", "reconciliation"],
  "fop-service-contract": ["act", "invoice", "payment-order", "reconciliation"],
  invoice: ["act", "payment-order", "tax-invoice"],
  act: ["invoice", "payment-order", "tax-invoice"],
  waybill: ["invoice", "act", "tax-invoice", "payment-order"],
  ttn: ["waybill", "invoice", "act", "discrepancy-act"],
  "tax-invoice": ["invoice"],
  "prro-receipt": [],
  "payment-order": [],
  "bank-statement": [],
  reconciliation: [],
  "discrepancy-act": ["invoice", "act"],
  certificate: [],
  receipt: [],
  "power-of-attorney": [],
  order: [],
  "employment-order": [],
  "dismissal-order": [],
  "vacation-order": [],
  other: [],
};

export const canCreateChildDocument = (docType: DocumentType): boolean => {
  return (relatedTemplateTypes[docType] || []).length > 0;
};

interface MatchResult {
  score: number;
  matchedTags: string[];
}

function calculateMatchScore(template: DocumentTemplate, tags: string[]): MatchResult {
  if (!tags.length) return { score: 0, matchedTags: [] };
  
  let score = 0;
  const matchedTags: string[] = [];
  
  for (const suggestedTag of tags) {
    const lowerTag = suggestedTag.toLowerCase();
    
    if (template.tags?.some(t => t.toLowerCase() === lowerTag)) {
      score += 2;
      matchedTags.push(suggestedTag);
      continue;
    }
    
    if (template.tags?.some(t => 
      t.toLowerCase().includes(lowerTag) || lowerTag.includes(t.toLowerCase())
    )) {
      score += 1;
      if (!matchedTags.includes(suggestedTag)) matchedTags.push(suggestedTag);
      continue;
    }
    
    if (template.keywords?.some(k => k.toLowerCase().includes(lowerTag))) {
      score += 0.5;
      if (!matchedTags.includes(suggestedTag)) matchedTags.push(suggestedTag);
      continue;
    }
    
    if (template.useCases?.some(uc => uc.toLowerCase().includes(lowerTag))) {
      score += 1.5;
      if (!matchedTags.includes(suggestedTag)) matchedTags.push(suggestedTag);
    }
  }
  
  if (template.isPopular && score > 0) score *= 1.2;
  
  return { score, matchedTags };
}

// Get stored view mode from localStorage
function getStoredViewMode(): TemplateViewMode {
  if (typeof window === "undefined") return "grid";
  return (localStorage.getItem("template-view-mode") as TemplateViewMode) || "grid";
}

export function TemplateMasterList({
  selectedType,
  onTypeChange,
  selectedTemplateId,
  onSelectTemplate,
  onUseTemplate,
  onCreateTemplate,
  aiSuggestedTags = [],
  className,
  parentDocument,
}: TemplateMasterListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 200);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<TemplateSource>("all");
  const [viewMode, setViewMode] = useState<TemplateViewMode>(getStoredViewMode);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const { recentIds } = useRecentlyUsedTemplates();
  
  // Persist view mode
  const handleViewModeChange = useCallback((mode: TemplateViewMode) => {
    setViewMode(mode);
    localStorage.setItem("template-view-mode", mode);
  }, []);
  
  const isFilteredMode = !!parentDocument && !showAllTemplates;
  const relevantTypes = parentDocument ? relatedTemplateTypes[parentDocument.type] || creatableTypes : creatableTypes;
  const availableTypes = isFilteredMode 
    ? relevantTypes.filter(t => creatableTypes.includes(t))
    : creatableTypes;
  
  useLayoutEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea || !selectedTemplateId) return;
    
    const activeItem = scrollArea.querySelector(`[data-template-id="${selectedTemplateId}"]`);
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedTemplateId]);
  
  const { aiRecommendedTemplates, allSystemTemplates, customFiltered, totalCount, systemCount, customCount } = useMemo(() => {
    const typeFilterFn = (t: DocumentTemplate) => {
      if (selectedType === "all") return availableTypes.includes(t.type);
      return t.type === selectedType;
    };
    const searchFilterFn = (t: DocumentTemplate) => {
      if (debouncedSearch === "") return true;
      const query = debouncedSearch.toLowerCase();
      return t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(query)) ||
        (t.keywords || []).some(kw => kw.toLowerCase().includes(query)) ||
        (t.useCases || []).some(uc => uc.toLowerCase().includes(query));
    };
    
    const systemBeforeSourceFilter = systemTemplates.filter(t => typeFilterFn(t) && searchFilterFn(t));
    const customBeforeSourceFilter = demoCustomTemplates.filter(t => typeFilterFn(t) && searchFilterFn(t));
    
    const showSystem = sourceFilter === "all" || sourceFilter === "system";
    const showCustom = sourceFilter === "all" || sourceFilter === "custom";
    
    let aiRecommended: Array<DocumentTemplate & { matchedTags?: string[] }> = [];
    if (aiSuggestedTags.length > 0 && showSystem) {
      const templatesWithScores = systemBeforeSourceFilter.map(t => ({
        template: t,
        result: calculateMatchScore(t, aiSuggestedTags),
      }));
      
      aiRecommended = templatesWithScores
        .filter(item => item.result.score > 0)
        .sort((a, b) => b.result.score - a.result.score)
        .slice(0, 3)
        .map(item => ({ ...item.template, matchedTags: item.result.matchedTags }));
    }
    
    const aiRecommendedIds = new Set(aiRecommended.map(t => t.id));
    const systemWithoutRecommended = showSystem 
      ? systemBeforeSourceFilter.filter(t => !aiRecommendedIds.has(t.id)) 
      : [];
    
    const sortedSystem = [...systemWithoutRecommended].sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return b.usageCount - a.usageCount;
    });
    
    return {
      aiRecommendedTemplates: aiRecommended,
      allSystemTemplates: sortedSystem,
      customFiltered: showCustom ? customBeforeSourceFilter : [],
      totalCount: aiRecommended.length + sortedSystem.length + (showCustom ? customBeforeSourceFilter.length : 0),
      systemCount: systemBeforeSourceFilter.length,
      customCount: customBeforeSourceFilter.length,
    };
  }, [selectedType, debouncedSearch, aiSuggestedTags, sourceFilter, availableTypes]);
  
  const allTemplatesList = useMemo(() => [...systemTemplates, ...demoCustomTemplates], []);
  
  const recentTemplates = useMemo(() => {
    if (recentIds.length === 0) return [];
    return recentIds
      .map(id => allTemplatesList.find(t => t.id === id))
      .filter((t): t is DocumentTemplate => !!t);
  }, [recentIds, allTemplatesList]);
  
  const visibleTemplates = useMemo(() => {
    const all: DocumentTemplate[] = [];
    if (recentTemplates.length > 0 && sourceFilter === "all" && !debouncedSearch) {
      all.push(...recentTemplates);
    }
    all.push(...aiRecommendedTemplates);
    all.push(...allSystemTemplates);
    all.push(...customFiltered);
    const seen = new Set<string>();
    return all.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [recentTemplates, aiRecommendedTemplates, allSystemTemplates, customFiltered, sourceFilter, debouncedSearch]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = visibleTemplates.findIndex(t => t.id === selectedTemplateId);
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (currentIndex < visibleTemplates.length - 1) {
          onSelectTemplate(visibleTemplates[currentIndex + 1]);
        } else if (currentIndex === -1 && visibleTemplates.length > 0) {
          onSelectTemplate(visibleTemplates[0]);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (currentIndex > 0) {
          onSelectTemplate(visibleTemplates[currentIndex - 1]);
        }
        break;
    }
  }, [selectedTemplateId, visibleTemplates, onSelectTemplate]);

  // Render template card
  const renderCard = (template: DocumentTemplate & { matchedTags?: string[] }, isRecommended = false) => (
    <TemplateRichCard
      key={template.id}
      template={template}
      isSelected={template.id === selectedTemplateId}
      onSelect={() => onSelectTemplate(template)}
      onPreview={() => setPreviewTemplate(template)}
      onUse={() => onUseTemplate(template)}
      isRecommended={isRecommended}
      matchedTags={template.matchedTags}
      viewMode={viewMode}
    />
  );
  
  return (
    <div 
      className={cn("flex flex-col h-full min-h-0 bg-background", className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={listRef}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background z-10 p-3 space-y-3 border-b">
        {/* Parent Document Context Banner */}
        {parentDocument && (
          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
            <Link2 className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                На основі: {documentTypeConfigs[parentDocument.type]?.label} {parentDocument.number}
              </p>
            </div>
            {!showAllTemplates && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setShowAllTemplates(true)}>
                Всі шаблони
              </Button>
            )}
            {showAllTemplates && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAllTemplates(false)}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
        
        {/* Search + Type Filter + Toggles (single line) */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Пошук..." 
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Type Filter */}
          <Select value={selectedType} onValueChange={(v) => onTypeChange(v as DocumentType | "all")}>
            <SelectTrigger className="h-9 text-xs w-auto min-w-[100px] max-w-[140px]">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-medium">Всі типи</SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-xs">
                  {documentTypeConfigs[type]?.label || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* View Mode Toggle */}
          <ViewModeToggle
            mode="templates"
            value={viewMode}
            onChange={handleViewModeChange}
          />
        </div>
        
        {/* Source Filter */}
        <ToggleGroup 
          type="single" 
          value={sourceFilter} 
          onValueChange={(v) => v && setSourceFilter(v as TemplateSource)}
          className="justify-start"
        >
          <ToggleGroupItem value="all" className="text-xs h-7 px-2.5 data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
            Всі ({systemCount + customCount})
          </ToggleGroupItem>
          <ToggleGroupItem value="system" className="text-xs h-7 px-2.5 data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
            Системні ({systemCount})
          </ToggleGroupItem>
          <ToggleGroupItem value="custom" className="text-xs h-7 px-2.5 data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
            Мої ({customCount})
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Scrollable List */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="p-3" role="listbox" aria-label="Список шаблонів">
          {/* Recently Used Section */}
          {recentTemplates.length > 0 && sourceFilter === "all" && !debouncedSearch && (
            <div className="mb-4">
              <div className="text-[10px] font-medium text-muted-foreground px-1 py-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Нещодавно використані
              </div>
              <div 
                className={cn(viewMode === "grid" ? "grid gap-3" : "flex flex-col gap-1")}
                style={viewMode === "grid" ? { gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" } : undefined}
              >
                {recentTemplates.map(t => renderCard(t))}
              </div>
              <Separator className="my-3" />
            </div>
          )}
          
          {/* AI Recommended Section */}
          {aiRecommendedTemplates.length > 0 && (
            <div className="mb-4 bg-primary/5 rounded-lg p-3">
              <div className="text-[10px] font-medium text-primary px-1 py-1 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3" />
                Рекомендовано для вашого запиту
              </div>
              <div 
                className={cn(viewMode === "grid" ? "grid gap-3" : "flex flex-col gap-1")}
                style={viewMode === "grid" ? { gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" } : undefined}
              >
                {aiRecommendedTemplates.map(t => renderCard(t, true))}
              </div>
            </div>
          )}
          
          {aiRecommendedTemplates.length > 0 && allSystemTemplates.length > 0 && (
            <Separator className="my-3" />
          )}
          
          {/* All Templates */}
          {allSystemTemplates.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-medium text-muted-foreground px-1 py-1.5 uppercase tracking-wider">
                Шаблони
              </div>
              <div 
                className={cn(viewMode === "grid" ? "grid gap-3" : "flex flex-col gap-1")}
                style={viewMode === "grid" ? { gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" } : undefined}
              >
                {allSystemTemplates.map(t => renderCard(t))}
              </div>
            </div>
          )}
          
          {/* Custom Templates */}
          {customFiltered.length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="mb-4">
                <div className="text-[10px] font-medium text-muted-foreground px-1 py-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                  Мої шаблони
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 ml-auto">
                    {customFiltered.length}
                  </Badge>
                </div>
                <div 
                  className={cn(viewMode === "grid" ? "grid gap-3" : "flex flex-col gap-1")}
                  style={viewMode === "grid" ? { gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" } : undefined}
                >
                  {customFiltered.map(t => renderCard(t))}
                </div>
              </div>
            </>
          )}
          
          {/* Empty state for "Мої" filter */}
          {sourceFilter === "custom" && customCount === 0 && (
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                У вас ще немає власних шаблонів
              </p>
              <p className="text-xs text-muted-foreground/70 mb-4">
                Створіть перший шаблон на основі ваших документів
              </p>
              {onCreateTemplate && (
                <Button variant="outline" size="sm" onClick={onCreateTemplate}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Створити шаблон
                </Button>
              )}
            </div>
          )}
          
          {/* General empty state */}
          {totalCount === 0 && sourceFilter !== "custom" && (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Нічого не знайдено" : "Немає шаблонів для цього типу"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Quick Preview Dialog */}
      <TemplatePreviewDialog
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onUseTemplate={onUseTemplate}
      />
    </div>
  );
}
