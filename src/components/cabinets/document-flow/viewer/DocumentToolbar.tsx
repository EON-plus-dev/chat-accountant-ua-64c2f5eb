/**
 * DocumentToolbar - Верхня панель інструментів вкладки "Документ"
 * 
 * Simplified layout (Progressive Disclosure):
 * - Primary: Режим View/Edit, Version badge
 * - Secondary (overflow): Zoom, Layout (for PDF)
 * - Search: Icon-only trigger
 */

import { useState } from "react";
import { 
  Search, X, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Pencil, MoreHorizontal,
  Minus, Plus, Maximize, FileText, Printer, ChevronLeft as BackIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import type { DocumentVersion } from "@/config/documentVersioningConfig";

export type ViewLayoutMode = "continuous" | "paginated";

export interface DocumentToolbarProps {
  // Режим перегляд/редагування
  mode: "view" | "edit";
  onModeChange: (mode: "view" | "edit") => void;
  canEdit: boolean;
  
  // Пошук
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchMatchCount: number;
  currentMatchIndex: number;
  onNavigateMatch: (direction: "prev" | "next") => void;
  
  // Вигляд
  viewLayout: ViewLayoutMode;
  onViewLayoutChange: (layout: ViewLayoutMode) => void;
  showViewLayoutToggle?: boolean; // Для PDF
  
  // Масштаб
  zoom: number;
  onZoomChange: (zoom: number) => void;
  
  // Версії
  versions: DocumentVersion[];
  currentVersionLabel: string;
  onVersionChange: (versionId: string) => void;
  
  // Print preview toggle (Edit mode only)
  showPrintPreview?: boolean;
  onPrintPreviewToggle?: () => void;
  
  className?: string;
}

const ZOOM_PRESETS = [
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "100%", value: 100 },
  { label: "125%", value: 125 },
  { label: "150%", value: 150 },
  { label: "200%", value: 200 },
];

export const DocumentToolbar = ({
  mode,
  onModeChange,
  canEdit,
  searchQuery,
  onSearchChange,
  searchMatchCount,
  currentMatchIndex,
  onNavigateMatch,
  viewLayout,
  onViewLayoutChange,
  showViewLayoutToggle = false,
  zoom,
  onZoomChange,
  versions,
  currentVersionLabel,
  onVersionChange,
  showPrintPreview,
  onPrintPreviewToggle,
  className,
}: DocumentToolbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const currentVersion = versions.find(v => v.versionLabel === currentVersionLabel);
  const isLatestVersion = versions.length > 0 && currentVersionLabel === versions[0]?.versionLabel;
  
  const handleZoomIn = () => onZoomChange(Math.min(zoom + 25, 200));
  const handleZoomOut = () => onZoomChange(Math.max(zoom - 25, 50));
  const handlePrint = () => window.print();
  
  return (
    <div 
      className={cn(
        "flex items-center justify-between px-6 py-2.5 border-b bg-muted/30 gap-3",
        className
      )}
      data-section="document-toolbar"
    >
      {/* Ліва частина: Mode + Search */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Режим Перегляд / Редагування - Enhanced Segmented Control */}
        <ToggleGroup 
          type="single" 
          value={mode} 
          onValueChange={(v) => v && onModeChange(v as "view" | "edit")}
          className="h-9 bg-muted/60 rounded-lg p-0.5 border border-border/50"
        >
          <ToggleGroupItem 
            value="view" 
            size="sm"
            className={cn(
              "gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium",
              "data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
              "data-[state=on]:border data-[state=on]:border-primary/30",
              "data-[state=on]:shadow-sm"
            )}
          >
            {mode === "view" && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Перегляд</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="edit" 
            size="sm"
            disabled={!canEdit}
            className={cn(
              "gap-1.5 h-8 px-3 text-xs rounded-md transition-all font-medium",
              "data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700",
              "data-[state=on]:border data-[state=on]:border-amber-300",
              "data-[state=on]:shadow-sm",
              "dark:data-[state=on]:bg-amber-900/30 dark:data-[state=on]:text-amber-400",
              "dark:data-[state=on]:border-amber-700"
            )}
          >
            {mode === "edit" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Редагування</span>
          </ToggleGroupItem>
        </ToggleGroup>
        
        {/* Пошук - icon only or expanded */}
        {isSearchOpen ? (
          <div className="relative flex items-center gap-1 animate-in slide-in-from-left-2">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Пошук..."
              className="pl-8 h-8 w-32 sm:w-40 text-xs"
              autoFocus
            />
            {searchQuery && searchMatchCount > 0 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="min-h-[40px] min-w-[40px] h-auto w-auto rounded-lg"
                  onClick={() => onNavigateMatch("prev")}
                  aria-label="Попередній результат"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap tabular-nums">
                  {currentMatchIndex + 1}/{searchMatchCount}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="min-h-[40px] min-w-[40px] h-auto w-auto rounded-lg"
                  onClick={() => onNavigateMatch("next")}
                  aria-label="Наступний результат"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="min-h-[40px] min-w-[40px] h-auto w-auto rounded-lg" 
              onClick={() => { setIsSearchOpen(false); onSearchChange(""); }}
              aria-label="Закрити пошук"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="min-h-[40px] min-w-[40px] h-auto w-auto rounded-lg"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Пошук в документі"
          >
            <Search className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Права частина: Контекстно залежить від mode */}
      <div className="flex items-center gap-1.5 shrink-0">
        {mode === "view" ? (
          <>
            {/* VIEW MODE: Версії + Overflow menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 gap-1 text-xs font-medium px-2",
                    !isLatestVersion && "text-amber-600 dark:text-amber-400"
                  )}
                >
                  <span>{currentVersionLabel}</span>
                  {!isLatestVersion && (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-400">
                      стара
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[260px]">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Версії документа
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {versions.map((version, idx) => (
                  <DropdownMenuItem
                    key={version.id}
                    onClick={() => onVersionChange(version.id)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 py-2",
                      version.versionLabel === currentVersionLabel && "bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium text-xs">{version.versionLabel}</span>
                      {idx === 0 && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                          активна
                        </Badge>
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {new Date(version.createdAt).toLocaleDateString("uk-UA")}
                      </span>
                    </div>
                    {version.changeDescription && (
                      <p className="text-[10px] text-muted-foreground truncate max-w-full">
                        {version.changeDescription}
                      </p>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Overflow menu with Zoom, Layout, Print */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="min-h-[40px] min-w-[40px] h-auto w-auto rounded-lg" aria-label="Додаткові опції">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                {/* Zoom section */}
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Масштаб
                </DropdownMenuLabel>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-xs font-medium min-w-[50px] text-center">
                    {zoom}%
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                {/* Zoom presets */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs">
                    <Maximize className="w-3.5 h-3.5 mr-2" />
                    Вибрати масштаб
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {ZOOM_PRESETS.map((preset) => (
                      <DropdownMenuItem 
                        key={preset.value}
                        onClick={() => onZoomChange(preset.value)}
                        className={cn(
                          "text-xs",
                          zoom === preset.value && "bg-accent"
                        )}
                      >
                        {preset.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Layout toggle (for PDF) */}
                {showViewLayoutToggle && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Вигляд
                    </DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => onViewLayoutChange("continuous")}
                      className={cn("text-xs", viewLayout === "continuous" && "bg-accent")}
                    >
                      Безперервний
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onViewLayoutChange("paginated")}
                      className={cn("text-xs", viewLayout === "paginated" && "bg-accent")}
                    >
                      По сторінках
                    </DropdownMenuItem>
                  </>
                )}
                
                {/* Print option */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePrint} className="text-xs">
                  <Printer className="w-3.5 h-3.5 mr-2" />
                  Друк
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          /* EDIT MODE: Toggle "Друк-версія" ↔ "Редагувати" */
          <Button 
            variant={showPrintPreview ? "secondary" : "outline"}
            size="sm" 
            className={cn(
              "h-8 gap-1.5 text-xs font-medium px-3",
              showPrintPreview && "bg-primary/10 border-primary/30"
            )}
            onClick={onPrintPreviewToggle}
          >
            {showPrintPreview ? (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Редагувати</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Друк-версія</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};