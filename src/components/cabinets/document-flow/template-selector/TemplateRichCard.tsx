/**
 * TemplateRichCard - Enterprise-level template card with functional badges
 * Features: Tax/Feature badges, data source icons, always-visible mobile actions
 */

import { Eye, Star, Building2, Users, PenLine, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";
import type { TemplateViewMode } from "@/components/ui/view-mode-toggle";
import { TemplateBadges } from "./TemplateBadges";

interface TemplateRichCardProps {
  template: DocumentTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onUse: () => void;
  isRecommended?: boolean;
  matchedTags?: string[];
  viewMode: TemplateViewMode;
}

export function TemplateRichCard({
  template,
  isSelected,
  onSelect,
  onPreview,
  onUse,
  isRecommended = false,
  matchedTags = [],
  viewMode,
}: TemplateRichCardProps) {
  const Icon = template.icon || FileText;
  
  // Calculate field counts by source - use fields (new) or variables (deprecated) with fallback
  const fieldsOrVariables = template.fields || template.variables || [];
  const cabinetCount = fieldsOrVariables.filter(v => v.source === "cabinet").length;
  const contractorCount = fieldsOrVariables.filter(v => v.source === "contractor").length;
  const manualCount = fieldsOrVariables.filter(v => v.source === "manual").length;
  
  // Grid mode - optimal card layout
  if (viewMode === "grid") {
    return (
      <div
        role="option"
        aria-selected={isSelected}
        data-template-id={template.id}
        onClick={onUse}
        className={cn(
          "group relative flex flex-col rounded-lg border cursor-pointer transition-all duration-150",
          "p-3 w-full max-w-[320px]",         // 12px padding + max-width constraint
          "min-h-0 sm:min-h-[112px]",         // auto mobile, compact fixed rhythm desktop
          "hover:border-primary/30 hover:shadow-sm active:scale-[0.99]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          isSelected && "border-primary/50 bg-primary/5 shadow-sm",
          isRecommended && !isSelected && "border-primary/20 bg-primary/[0.02]"
        )}
      >
        {/* Quick Preview Button - always visible */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 z-10 hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          title="Швидкий перегляд"
        >
          <Eye className="w-4 h-4" />
        </Button>
        
        {/* Header */}
        <div className="flex items-start gap-2.5 pr-8 mb-1.5">
          <div className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
            isSelected 
              ? "bg-primary/20 text-primary" 
              : isRecommended
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
          )}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className={cn(
                "text-sm font-medium line-clamp-1",
                isSelected && "text-primary"
              )}>
                {template.name}
              </h4>
              {template.isPopular && (
                <Star className="w-3 h-3 fill-warning text-warning shrink-0" />
              )}
            </div>
          </div>
        </div>
        
        {/* Description - always visible, 2 lines */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5 min-h-[2rem]">
          {template.description}
        </p>
        
        {/* Footer: Data Sources + Badges (combined row) */}
        <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
          <DataSourceIndicators 
            cabinetCount={cabinetCount}
            contractorCount={contractorCount}
            manualCount={manualCount}
          />
          <TemplateBadges
            taxType={template.taxType}
            features={template.features}
            isRecommended={isRecommended}
            matchedTags={matchedTags}
            isCustom={template.category === "custom"}
            maxVisible={3}
            size="sm"
          />
        </div>
      </div>
    );
  }
  
  // List mode - compact horizontal layout with always-visible actions on mobile
  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-template-id={template.id}
      onClick={onUse}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150",
        "hover:bg-muted/70 active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isSelected && "bg-primary/10 ring-1 ring-primary/30",
        isRecommended && !isSelected && "bg-primary/5"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
        isSelected 
          ? "bg-primary/20 text-primary" 
          : isRecommended
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
      )}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-sm font-medium truncate",
            isSelected && "text-primary"
          )}>
            {template.name}
          </span>
          {template.isPopular && (
            <Star className="w-3 h-3 fill-warning text-warning shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <DataSourceIndicators 
            cabinetCount={cabinetCount}
            contractorCount={contractorCount}
            manualCount={manualCount}
          />
          <TemplateBadges
            taxType={template.taxType}
            features={template.features}
            isRecommended={isRecommended}
            matchedTags={matchedTags}
            isCustom={template.category === "custom"}
            maxVisible={2}
            size="sm"
          />
        </div>
      </div>
      
      {/* Actions - only preview, always visible */}
      <div className="flex items-center shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          title="Швидкий перегляд"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Compact data source indicators with tooltips
function DataSourceIndicators({ 
  cabinetCount, 
  contractorCount, 
  manualCount,
}: { 
  cabinetCount: number; 
  contractorCount: number; 
  manualCount: number;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5 text-[10px]">
        {cabinetCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-success-foreground flex items-center gap-0.5 cursor-help">
                <Building2 className="w-3 h-3" />
                {cabinetCount}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {cabinetCount} поле з кабінету (автозаповнення)
            </TooltipContent>
          </Tooltip>
        )}
        {contractorCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-info-foreground flex items-center gap-0.5 cursor-help">
                <Users className="w-3 h-3" />
                {contractorCount}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {contractorCount} поле контрагента (автозаповнення)
            </TooltipContent>
          </Tooltip>
        )}
        {manualCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-warning-foreground flex items-center gap-0.5 cursor-help">
                <PenLine className="w-3 h-3" />
                {manualCount}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {manualCount} поле для заповнення вручну
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
