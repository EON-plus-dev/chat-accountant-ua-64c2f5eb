/**
 * TemplatePreviewArea - Read-only preview of template text with highlighted fields (VIEW mode)
 * Supports search highlighting and text selection popover
 */

import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Edit, Lightbulb } from "lucide-react";
import { TemplateSelectionPopover } from "./TemplateSelectionPopover";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UnifiedTemplateField } from "@/types/templateField";
import type { FieldGroup } from "@/config/documentFormSchemas";

// Helper functions for readable labels
function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    cabinet: "Мої дані (авто)",
    contractor: "Контрагент (авто)",
    computed: "Обчислюване (авто)",
    manual: "Ручне введення",
  };
  return labels[source] || source;
}

function getDataTypeLabel(dataType?: string): string {
  if (!dataType) return "Текст";
  const labels: Record<string, string> = {
    text: "Текст",
    number: "Число",
    currency: "Сума",
    date: "Дата",
    iban: "IBAN",
    edrpou: "ЄДРПОУ",
    phone: "Телефон",
    email: "Email",
  };
  return labels[dataType] || dataType;
}

// Group order for consistent numbering
const GROUP_ORDER: FieldGroup[] = [
  "header", "supplier", "buyer", "employee", 
  "positions", "totals", "terms", "transport", "signatures"
];

interface TemplatePreviewAreaProps {
  documentText: string;
  fields: UnifiedTemplateField[];
  onFieldClick?: (fieldKey: string) => void;
  highlightedFieldKey?: string | null;
  zoom?: number;
  searchQuery?: string;
  onSearchResultsChange?: (count: number) => void;
  currentSearchIndex?: number;
  // Selection popover callbacks
  onCreateField?: (selectedText: string) => void;
  onFindSimilar?: (selectedText: string) => void;
  className?: string;
}

/**
 * Highlight search matches in text
 */
const highlightSearchMatches = (
  text: string,
  searchQuery: string,
  currentIndex: number,
  startOffset: number
): { node: React.ReactNode; matchCount: number; matchIndexes: number[] } => {
  if (!searchQuery || !text) {
    return { node: text, matchCount: 0, matchIndexes: [] };
  }
  
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  const matchIndexes: number[] = [];
  let matchIdx = 0;
  
  const nodes = parts.map((part, i) => {
    if (part.toLowerCase() === searchQuery.toLowerCase()) {
      const isCurrentMatch = matchIdx === currentIndex;
      matchIndexes.push(startOffset + text.indexOf(part));
      matchIdx++;
      return (
        <mark
          key={i}
          className={cn(
            "px-0.5 rounded",
            isCurrentMatch
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
          )}
          data-search-match={isCurrentMatch ? "current" : "other"}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
  
  return { 
    node: <>{nodes}</>, 
    matchCount: matchIdx,
    matchIndexes 
  };
};

/**
 * Parse document text and replace field markers with interactive badges
 */
const parseTextWithFields = (
  text: string,
  fields: UnifiedTemplateField[],
  fieldToGroupIndex: Map<string, number>,
  onFieldClick?: (fieldKey: string) => void,
  highlightedFieldKey?: string | null,
  searchQuery?: string,
  currentSearchIndex?: number
): { nodes: React.ReactNode[]; searchMatchCount: number } => {
  if (!text) return { nodes: [], searchMatchCount: 0 };
  
  // Create a map of field labels to field data
  const fieldByLabel = new Map<string, UnifiedTemplateField>();
  fields.forEach(field => {
    // Match both [Label] and [OriginalText] patterns
    fieldByLabel.set(field.label, field);
    if (field.originalText) {
      // Strip brackets if present
      const cleanLabel = field.originalText.replace(/^\[|\]$/g, '');
      fieldByLabel.set(cleanLabel, field);
    }
  });
  
  // Regex to find [field] patterns
  const fieldPattern = /\[([^\]]+)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let totalSearchMatches = 0;
  let globalMatchIndex = 0;
  
  while ((match = fieldPattern.exec(text)) !== null) {
    // Add text before the match (with search highlighting)
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      const { node, matchCount } = highlightSearchMatches(
        beforeText, 
        searchQuery || "", 
        (currentSearchIndex || 0) - globalMatchIndex,
        lastIndex
      );
      parts.push(<span key={`text-${lastIndex}`}>{node}</span>);
      totalSearchMatches += matchCount;
      globalMatchIndex += matchCount;
    }
    
    const fieldLabel = match[1];
    const field = fieldByLabel.get(fieldLabel);
    const isHighlighted = field?.key === highlightedFieldKey;
    const groupIndex = field ? fieldToGroupIndex.get(field.key) : undefined;
    const isAutoFill = field?.source === "cabinet" || field?.source === "contractor";
    
    if (field) {
      // Add interactive field badge with tooltip
      parts.push(
        <TooltipProvider key={`field-${match.index}`} delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onFieldClick?.(field.key)}
                data-field-key={field.key}
                className={cn(
                  "inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md text-sm font-medium transition-all",
                  isAutoFill 
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" 
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
                  "hover:opacity-80 cursor-pointer",
                  isHighlighted && "ring-2 ring-primary ring-offset-2 animate-pulse"
                )}
              >
                {field.label}
                {isAutoFill ? (
                  <Sparkles className="w-3 h-3 ml-1.5 shrink-0" />
                ) : (
                  <Edit className="w-3 h-3 ml-1.5 shrink-0" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px]">
              <div className="space-y-1">
                <p className="font-medium">{field.label}</p>
                <p className="text-xs text-muted-foreground">
                  Джерело: {getSourceLabel(field.source)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Тип: {getDataTypeLabel(field.dataType)}
                </p>
                {field.aiHint && (
                  <p className="text-xs text-muted-foreground italic">
                    {field.aiHint}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else {
      // Unknown field - show as muted badge
      parts.push(
        <span
          key={`unknown-${match.index}`}
          className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md text-sm font-medium bg-muted text-muted-foreground border border-border/50"
        >
          {fieldLabel}
        </span>
      );
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text (with search highlighting)
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    const { node, matchCount } = highlightSearchMatches(
      remainingText, 
      searchQuery || "", 
      (currentSearchIndex || 0) - globalMatchIndex,
      lastIndex
    );
    parts.push(<span key={`text-end`}>{node}</span>);
    totalSearchMatches += matchCount;
  }
  
  return { nodes: parts, searchMatchCount: totalSearchMatches };
};

export const TemplatePreviewArea = ({
  documentText,
  fields,
  onFieldClick,
  highlightedFieldKey,
  zoom = 100,
  searchQuery = "",
  onSearchResultsChange,
  currentSearchIndex = 0,
  onCreateField,
  onFindSimilar,
  className,
}: TemplatePreviewAreaProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [totalSearchMatches, setTotalSearchMatches] = useState(0);
  
  // Selection state for popover
  const [selection, setSelection] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  
  // Handle text selection
  const handleMouseUp = useCallback(() => {
    const selectionObj = window.getSelection();
    const selectedText = selectionObj?.toString().trim();
    
    // Minimum 3 characters to show popover (avoid accidental clicks)
    if (selectedText && selectedText.length >= 3 && cardRef.current) {
      const range = selectionObj?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        const containerRect = cardRef.current.getBoundingClientRect();
        
        setSelection({
          text: selectedText,
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top - containerRect.top - 10,
        });
      }
    }
  }, []);
  
  // Close selection on click outside or when selection is cleared
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click was inside popover
      const popover = document.querySelector('[data-template-selection-popover]');
      if (popover && popover.contains(e.target as Node)) {
        return;
      }
      
      setTimeout(() => {
        const selectionObj = window.getSelection();
        if (!selectionObj?.toString().trim()) {
          setSelection(null);
        }
      }, 100);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Clear selection helper
  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);
  
  // Build fieldKey -> groupIndex map for consistent numbering
  const fieldToGroupIndex = useMemo(() => {
    const map = new Map<string, number>();
    
    // Group fields by their group
    const grouped: Record<string, UnifiedTemplateField[]> = {};
    fields.forEach(f => {
      const g = f.group || "terms";
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(f);
    });
    
    // Assign group indices based on GROUP_ORDER
    let groupNumber = 1;
    GROUP_ORDER.forEach(group => {
      if (grouped[group]?.length > 0) {
        grouped[group].forEach(f => map.set(f.key, groupNumber));
        groupNumber++;
      }
    });
    
    return map;
  }, [fields]);
  
  // Count search matches in entire document
  const searchMatchCount = useMemo(() => {
    if (!searchQuery) return 0;
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = documentText.match(regex);
    return matches?.length || 0;
  }, [documentText, searchQuery]);
  
  // Report search results count
  useEffect(() => {
    onSearchResultsChange?.(searchMatchCount);
    setTotalSearchMatches(searchMatchCount);
  }, [searchMatchCount, onSearchResultsChange]);
  
  // Scroll to current search match
  useEffect(() => {
    if (searchQuery && contentRef.current) {
      const currentMatch = contentRef.current.querySelector(
        '[data-search-match="current"]'
      );
      currentMatch?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentSearchIndex, searchQuery]);
  
  // Auto-scroll to highlighted field
  useEffect(() => {
    if (highlightedFieldKey && contentRef.current) {
      const fieldElement = contentRef.current.querySelector(
        `[data-field-key="${highlightedFieldKey}"]`
      );
      fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedFieldKey]);
  
  // Split by newlines for paragraph rendering
  const lines = documentText.split('\n');
  
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="p-4 sm:p-6">
        <Card 
          ref={cardRef}
          className="p-6 sm:p-8 relative"
          onMouseUp={handleMouseUp}
        >
          <div 
            ref={contentRef}
            className="prose prose-sm dark:prose-invert max-w-none"
            style={{ 
              fontSize: `${zoom}%`,
              lineHeight: 1.8,
            }}
          >
            {/* Render line by line to preserve formatting */}
            {lines.map((line, idx) => {
              if (!line.trim()) {
                return <br key={idx} />;
              }
              
              const { nodes: lineParts } = parseTextWithFields(
                line, 
                fields, 
                fieldToGroupIndex, 
                onFieldClick, 
                highlightedFieldKey,
                searchQuery,
                currentSearchIndex
              );
              
              // Check if line looks like a header (all caps, short, or ends with :)
              const isHeader = line.length < 60 && (
                line === line.toUpperCase() ||
                line.endsWith(':') ||
                line.startsWith('РАХУНОК') ||
                line.startsWith('ДОГОВІР') ||
                line.startsWith('АКТ')
              );
              
              if (isHeader) {
                return (
                  <p key={idx} className="font-semibold text-foreground mb-4 mt-6 first:mt-0">
                    {lineParts}
                  </p>
                );
              }
              
              return (
                <p key={idx} className="text-foreground/90 mb-2">
                  {lineParts}
                </p>
              );
            })}
          </div>
          
          {/* Selection Popover */}
          {selection && (
            <div data-template-selection-popover>
              <TemplateSelectionPopover
                selectedText={selection.text}
                position={{ x: selection.x, y: selection.y }}
                onCreateField={() => {
                  onCreateField?.(selection.text);
                  clearSelection();
                }}
                onFindSimilar={() => {
                  onFindSimilar?.(selection.text);
                  clearSelection();
                }}
                onCopy={() => {
                  navigator.clipboard.writeText(selection.text);
                  toast({ 
                    title: "Скопійовано", 
                    description: selection.text.length > 50 
                      ? selection.text.slice(0, 50) + "..." 
                      : selection.text 
                  });
                  clearSelection();
                }}
                onClose={clearSelection}
              />
            </div>
          )}
        </Card>
        
        {/* Footer with field count and hint */}
        <div className="mt-4 text-center space-y-1.5">
          <p className="text-sm text-muted-foreground">
            {fields.length} полів визначено в шаблоні
          </p>
          
          {/* Hint footer - updated text */}
          <p className="text-xs text-muted-foreground/70 flex items-center justify-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Виділіть текст для створення поля або пошуку
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};