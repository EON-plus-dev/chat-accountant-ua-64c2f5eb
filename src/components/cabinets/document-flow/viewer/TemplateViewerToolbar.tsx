/**
 * TemplateViewerToolbar - Toolbar for Template viewer tab
 * View/Edit mode toggle with Search, Zoom, Reset and Next button
 * Unified exit logic with DocumentToolbar (no Step Indicator, no Back button)
 */

import { useState, useRef, useEffect } from "react";
import { 
  Eye, Pencil, ArrowRight, ArrowLeft, Search, 
  ZoomIn, RotateCcw, ChevronUp, ChevronDown,
  X, FileText, Sparkles, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Zoom presets
const ZOOM_PRESETS = [50, 75, 100, 125, 150];

interface TemplateViewerToolbarProps {
  mode: "view" | "edit";
  onModeChange: (mode: "view" | "edit") => void;
  canEdit: boolean;
  
  // Search
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchResultCount?: number;
  currentSearchIndex?: number;
  onSearchPrev?: () => void;
  onSearchNext?: () => void;
  
  // Zoom
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  
  // Reset action
  onReset?: () => void;
  hasUnsavedChanges?: boolean;
  
  // Back navigation
  onBack?: () => void;
  backLabel?: string;
  showBack?: boolean;
  
  // Next step action
  onNext?: () => void;
  nextLabel?: string;
  
  // Draft version
  draftVersion?: number;
  
  // Field stats for View mode
  fieldStats?: {
    total: number;
    auto: number;
    manual: number;
  };
  
  className?: string;
}

export const TemplateViewerToolbar = ({
  mode,
  onModeChange,
  canEdit,
  searchQuery = "",
  onSearchChange,
  searchResultCount = 0,
  currentSearchIndex = 0,
  onSearchPrev,
  onSearchNext,
  zoom = 100,
  onZoomChange,
  onReset,
  hasUnsavedChanges = false,
  onBack,
  backLabel,
  showBack = false,
  onNext,
  nextLabel = "Тестувати",
  draftVersion = 1,
  fieldStats,
  className,
}: TemplateViewerToolbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);
  
  // Handle search toggle
  const toggleSearch = () => {
    if (isSearchOpen) {
      onSearchChange?.("");
      setIsSearchOpen(false);
    } else {
      setIsSearchOpen(true);
    }
  };
  
  // Handle Escape key in search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onSearchChange?.("");
      setIsSearchOpen(false);
    } else if (e.key === "Enter") {
      if (e.shiftKey) {
        onSearchPrev?.();
      } else {
        onSearchNext?.();
      }
    }
  };
  
  return (
    <div 
      className={cn(
        "flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2",
        "border-b border-border/70 bg-subtab-shelf",
        className
      )}
    >
      {/* Left side: Mode toggle + Search + Stats */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* View/Edit toggle - ToggleGroup with pulse indicators */}
        <ToggleGroup 
          type="single" 
          value={mode}
          onValueChange={(value) => {
            if (value === "view") {
              onModeChange("view");
            } else if (value === "edit" && canEdit) {
              onModeChange("edit");
            }
          }}
          className="h-9 bg-muted/60 rounded-lg p-0.5 border border-border/50"
        >
          <ToggleGroupItem 
            value="view"
            className={cn(
              "h-8 px-3 gap-1.5 text-sm font-medium rounded-md",
              "data-[state=on]:bg-background data-[state=on]:shadow-sm",
              "transition-all duration-150"
            )}
          >
            {mode === "view" && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Перегляд</span>
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="edit"
            disabled={!canEdit}
            className={cn(
              "h-8 px-3 gap-1.5 text-sm font-medium rounded-md",
              "data-[state=on]:bg-background data-[state=on]:shadow-sm",
              "transition-all duration-150",
              mode === "edit" && "data-[state=on]:text-amber-700 dark:data-[state=on]:text-amber-400",
              !canEdit && "opacity-50 cursor-not-allowed"
            )}
            title={!canEdit ? "Системні шаблони не можна редагувати. Використайте 'Дублювати'." : undefined}
          >
            {mode === "edit" && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            )}
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Редагування</span>
          </ToggleGroupItem>
        </ToggleGroup>


      {/* Search - between toggle and badge */}
      {isSearchOpen ? (
        <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Пошук..."
              className="h-8 w-[100px] sm:w-[160px] pl-7 pr-1.5 text-xs"
            />
          </div>
          
          {searchQuery && searchResultCount > 0 && (
            <>
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                {currentSearchIndex + 1}/{searchResultCount}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onSearchPrev}
                disabled={searchResultCount === 0}
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onSearchNext}
                disabled={searchResultCount === 0}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleSearch}
            title="Закрити пошук"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSearch}
          title="Пошук (Ctrl+F)"
        >
          <Search className="w-4 h-4" />
        </Button>
      )}

      {/* Draft badge in edit mode - compact on mobile */}
      {mode === "edit" && (
        <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 h-5 sm:h-6 shrink-0">
          <span className="hidden sm:inline">Чернетка </span>
          v{draftVersion}.0
        </Badge>
      )}
      
      {/* Field stats in view mode - ALWAYS visible, compact */}
      {mode === "view" && fieldStats && (
        <Badge 
          variant="outline" 
          className="text-[10px] sm:text-xs gap-0.5 sm:gap-1 h-5 sm:h-6 px-1.5 sm:px-2 shrink-0"
        >
          <FileText className="w-3 h-3 shrink-0" />
          <span>{fieldStats.total}</span>
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {fieldStats.auto}
          </span>
          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
            <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {fieldStats.manual}
          </span>
        </Badge>
      )}
    </div>

    {/* Spacer */}
    <div className="flex-1" />

    {/* Right side: Zoom + Actions */}
    <div className="flex items-center gap-2">
      {/* Zoom dropdown (View mode only) */}
      {mode === "view" && onZoomChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5">
              <ZoomIn className="w-4 h-4" />
              <span className="text-xs">{zoom}%</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Масштаб
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ZOOM_PRESETS.map((preset) => (
              <DropdownMenuItem
                key={preset}
                onClick={() => onZoomChange(preset)}
                className={cn(zoom === preset && "bg-accent")}
              >
                {preset}%
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Reset button - Edit mode only */}
      {mode === "edit" && hasUnsavedChanges && onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground h-8"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Скинути</span>
        </Button>
      )}
      
      {/* Back button - Edit mode only */}
      {mode === "edit" && showBack && onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">{backLabel || "Назад"}</span>
        </Button>
      )}
      
      {/* Next/Save button - Edit mode only */}
      {mode === "edit" && onNext && (
        <Button size="sm" className="h-8" onClick={onNext}>
          {nextLabel}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  </div>
);
};
