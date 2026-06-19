/**
 * VersionCard - Compact expandable card for document versions with diff preview
 * Used in horizontal Context Shelf for View mode
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  History, 
  ArrowLeftRight, 
  RotateCcw, 
  Eye,
  User,
  Plus,
  Minus,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DocumentVersion } from "@/config/documentVersioningConfig";
import { formatVersionDate, fieldLabels, versionSourceLabels } from "@/config/documentVersioningConfig";

interface VersionCardProps {
  version: DocumentVersion;
  previousVersion?: DocumentVersion;
  isCurrent?: boolean;
  isHighlighted?: boolean;
  onView?: (versionId: string) => void;
  onCompare?: (version: DocumentVersion, previousVersion: DocumentVersion) => void;
  onRestore?: (version: DocumentVersion) => void;
  className?: string;
}

export const VersionCard = ({
  version,
  previousVersion,
  isCurrent = false,
  isHighlighted = false,
  onView,
  onCompare,
  onRestore,
  className,
}: VersionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasChanges = version.fieldsChanged?.length > 0;
  const hasChangeDetails = version.changeDetails && version.changeDetails.length > 0;
  const canCompare = !!previousVersion;
  const canRestore = !isCurrent;
  
  // Use real data from version or fallback
  const addedLines = version.linesAdded ?? 0;
  const removedLines = version.linesRemoved ?? 0;
  const editCount = version.editCount ?? 0;
  
  return (
    <div
      data-version-card-id={version.id}
      className={cn(
        // Fixed width for horizontal scroll (unified)
        "w-[220px] shrink-0 snap-center",
        // Flex layout to pin footer
        "flex flex-col",
        // Card styling
        "rounded-lg border bg-card p-3",
        // Current version highlight
        isCurrent && "border-primary/40 bg-primary/5",
        // States
        "transition-all duration-200",
        "hover:shadow-md",
        isHighlighted && "ring-2 ring-primary/50",
        className
      )}
      style={{
        height: isExpanded ? 240 : 140,
        transition: 'height 250ms ease-in-out',
      }}
    >
      {/* Content area - flexible */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Header: Version label + current badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center",
              isCurrent 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
              {isCurrent ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <History className="w-3 h-3" />
              )}
            </div>
            <span className="font-mono font-semibold text-xs">
              {version.versionLabel}
            </span>
          </div>
          
          <div className="flex items-center gap-1 flex-wrap">
            {isCurrent && (
              <Badge variant="default" className="text-[9px] px-1.5 h-4">
                Поточна
              </Badge>
            )}
            {version.source && (
              <Badge variant="outline" className="text-[9px] px-1 h-4 text-muted-foreground">
                {versionSourceLabels[version.source]}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className={cn(
          "mb-2",
          isExpanded && "max-h-[40px] overflow-y-auto"
        )}>
          <p className={cn(
            "text-xs text-foreground break-words",
            !isExpanded && "line-clamp-1"
          )}>
            {version.changeDescription}
          </p>
        </div>
        
        {/* Changed fields tags */}
        {hasChanges && (
          <div className={cn(
            "flex flex-wrap gap-1 mb-2",
            isExpanded && "max-h-[50px] overflow-y-auto"
          )}>
            {version.fieldsChanged.slice(0, isExpanded ? 10 : 2).map((field) => (
              <Badge 
                key={field} 
                variant="secondary" 
                className="text-[9px] px-1 h-4"
              >
                {fieldLabels[field] || field}
              </Badge>
            ))}
            {!isExpanded && version.fieldsChanged.length > 2 && (
              <Badge variant="outline" className="text-[9px] px-1 h-4">
                +{version.fieldsChanged.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        {/* Diff stats - real data */}
        {(addedLines > 0 || removedLines > 0 || editCount > 0) && (
          <div className="flex items-center gap-2 mb-2 text-[10px]">
            {addedLines > 0 && (
              <span className="flex items-center gap-0.5 text-success">
                <Plus className="w-2.5 h-2.5" />
                {addedLines}
              </span>
            )}
            {removedLines > 0 && (
              <span className="flex items-center gap-0.5 text-destructive">
                <Minus className="w-2.5 h-2.5" />
                {removedLines}
              </span>
            )}
            {editCount > 0 && (
              <span className="text-muted-foreground">
                ({editCount} правок)
              </span>
            )}
          </div>
        )}
        
        {/* Author with role badge */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
          <User className="w-2.5 h-2.5" />
          <span className="truncate max-w-[60px]">{version.createdBy}</span>
          {version.createdByRole && (
            <Badge variant="outline" className="text-[8px] px-1 h-3">
              {version.createdByRole}
            </Badge>
          )}
        </div>
        <div className="text-[9px] text-muted-foreground mb-2">
          {formatVersionDate(version.createdAt)}
        </div>
      </div>
      
      {/* Action buttons - always visible */}
      <div className="flex items-center gap-1 mt-auto pt-2 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] gap-1 flex-1 px-2"
                onClick={() => onView?.(version.id)}
              >
                <Eye className="w-2.5 h-2.5" />
                Перегляд
              </Button>
            </TooltipTrigger>
            <TooltipContent>Переглянути версію</TooltipContent>
          </Tooltip>
          
          {canCompare && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] gap-1 flex-1 px-2"
                  onClick={() => previousVersion && onCompare?.(version, previousVersion)}
                >
                  <ArrowLeftRight className="w-2.5 h-2.5" />
                  Diff
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Порівняти з {previousVersion?.versionLabel}
              </TooltipContent>
            </Tooltip>
          )}
          
          {canRestore && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onRestore?.(version)}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Відновити</TooltipContent>
            </Tooltip>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setIsExpanded(prev => !prev)}
          >
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </Button>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default VersionCard;
