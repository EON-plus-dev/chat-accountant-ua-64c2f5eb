import { useState, useMemo, useRef } from "react";
import { ArrowLeftRight, Columns, AlignJustify, Plus, Minus, RefreshCw, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { type DocumentVersion, formatVersionDate } from "@/config/documentVersioningConfig";

type DiffMode = "side-by-side" | "unified";

interface DiffLine {
  type: "unchanged" | "added" | "deleted" | "modified";
  leftLine?: string;
  rightLine?: string;
  lineNumber: {
    left?: number;
    right?: number;
  };
}

interface VersionDiffViewerProps {
  leftVersion: DocumentVersion;
  rightVersion: DocumentVersion;
  open: boolean;
  onClose: () => void;
}

// Calculate diff between two texts
const calculateDiff = (leftText: string, rightText: string): DiffLine[] => {
  const leftLines = leftText.split("\n");
  const rightLines = rightText.split("\n");
  const result: DiffLine[] = [];
  
  const maxLength = Math.max(leftLines.length, rightLines.length);
  
  for (let i = 0; i < maxLength; i++) {
    const left = leftLines[i];
    const right = rightLines[i];
    
    if (left === undefined && right !== undefined) {
      result.push({
        type: "added",
        rightLine: right,
        lineNumber: { right: i + 1 },
      });
    } else if (left !== undefined && right === undefined) {
      result.push({
        type: "deleted",
        leftLine: left,
        lineNumber: { left: i + 1 },
      });
    } else if (left !== right) {
      result.push({
        type: "modified",
        leftLine: left,
        rightLine: right,
        lineNumber: { left: i + 1, right: i + 1 },
      });
    } else {
      result.push({
        type: "unchanged",
        leftLine: left,
        rightLine: right,
        lineNumber: { left: i + 1, right: i + 1 },
      });
    }
  }
  
  return result;
};

// Calculate statistics
const calculateStats = (diffLines: DiffLine[]) => {
  let added = 0;
  let deleted = 0;
  let modified = 0;
  
  diffLines.forEach(line => {
    if (line.type === "added") added++;
    else if (line.type === "deleted") deleted++;
    else if (line.type === "modified") modified++;
  });
  
  return { added, deleted, modified };
};

// Generate AI summary of changes in plain language
const generateAISummary = (
  leftVersion: DocumentVersion, 
  rightVersion: DocumentVersion, 
  diffLines: DiffLine[],
  stats: { added: number; deleted: number; modified: number }
): string[] => {
  const summaryPoints: string[] = [];
  
  // Analyze modified lines for specific changes
  const modifiedLines = diffLines.filter(l => l.type === "modified");
  
  modifiedLines.forEach(line => {
    const left = line.leftLine || "";
    const right = line.rightLine || "";
    
    // Detect amount changes
    const amountPatternLeft = left.match(/(\d[\d\s]*[,.]?\d*)\s*₴/);
    const amountPatternRight = right.match(/(\d[\d\s]*[,.]?\d*)\s*₴/);
    if (amountPatternLeft && amountPatternRight) {
      const oldAmount = amountPatternLeft[1].replace(/\s/g, "");
      const newAmount = amountPatternRight[1].replace(/\s/g, "");
      if (oldAmount !== newAmount) {
        summaryPoints.push(`💰 Сума змінена з ${amountPatternLeft[0]} на ${amountPatternRight[0]}`);
      }
    }
    
    // Detect date changes
    const datePatternLeft = left.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/);
    const datePatternRight = right.match(/(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/);
    if (datePatternLeft && datePatternRight && datePatternLeft[1] !== datePatternRight[1]) {
      if (left.toLowerCase().includes("термін") || left.toLowerCase().includes("оплат")) {
        summaryPoints.push(`📅 Термін оплати перенесено з ${datePatternLeft[1]} на ${datePatternRight[1]}`);
      } else {
        summaryPoints.push(`📅 Дату змінено з ${datePatternLeft[1]} на ${datePatternRight[1]}`);
      }
    }
    
    // Detect contractor changes
    if (left.toLowerCase().includes("контрагент") || left.toLowerCase().includes("тов") || left.toLowerCase().includes("фоп")) {
      const leftName = left.match(/[«"]([^»"]+)[»"]/)?.[1] || left.match(/ТОВ\s+(.+)/i)?.[1];
      const rightName = right.match(/[«"]([^»"]+)[»"]/)?.[1] || right.match(/ТОВ\s+(.+)/i)?.[1];
      if (leftName && rightName && leftName !== rightName) {
        summaryPoints.push(`🏢 Контрагента змінено з «${leftName}» на «${rightName}»`);
      }
    }
    
    // Detect VAT/PDV changes
    if (left.toLowerCase().includes("пдв") || right.toLowerCase().includes("пдв")) {
      const pdvLeft = left.match(/(\d[\d\s]*[,.]?\d*)\s*₴/);
      const pdvRight = right.match(/(\d[\d\s]*[,.]?\d*)\s*₴/);
      if (pdvLeft && pdvRight && pdvLeft[1] !== pdvRight[1]) {
        summaryPoints.push(`📊 ПДВ перераховано: ${pdvLeft[0]} → ${pdvRight[0]}`);
      }
    }
  });
  
  // Add general stats summary if no specific changes detected
  if (summaryPoints.length === 0) {
    if (stats.modified > 0) {
      summaryPoints.push(`✏️ Внесено ${stats.modified} ${stats.modified === 1 ? "зміну" : stats.modified < 5 ? "зміни" : "змін"} до тексту документа`);
    }
    if (stats.added > 0) {
      summaryPoints.push(`➕ Додано ${stats.added} ${stats.added === 1 ? "новий рядок" : stats.added < 5 ? "нові рядки" : "нових рядків"}`);
    }
    if (stats.deleted > 0) {
      summaryPoints.push(`➖ Видалено ${stats.deleted} ${stats.deleted === 1 ? "рядок" : stats.deleted < 5 ? "рядки" : "рядків"}`);
    }
  }
  
  // Add version context
  if (rightVersion.changeDescription && !summaryPoints.some(s => s.includes(rightVersion.changeDescription))) {
    summaryPoints.unshift(`📝 ${rightVersion.changeDescription}`);
  }
  
  return summaryPoints.length > 0 ? summaryPoints : ["Змін не виявлено"];
};

export const VersionDiffViewer = ({
  leftVersion,
  rightVersion,
  open,
  onClose,
}: VersionDiffViewerProps) => {
  const [mode, setMode] = useState<DiffMode>("side-by-side");
  const [aiSummaryOpen, setAiSummaryOpen] = useState(true);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  
  const leftContent = leftVersion.contentSnapshot || "";
  const rightContent = rightVersion.contentSnapshot || "";
  
  const diffLines = useMemo(() => calculateDiff(leftContent, rightContent), [leftContent, rightContent]);
  const stats = useMemo(() => calculateStats(diffLines), [diffLines]);
  const aiSummary = useMemo(
    () => generateAISummary(leftVersion, rightVersion, diffLines, stats), 
    [leftVersion, rightVersion, diffLines, stats]
  );
  
  // Synchronize scroll in side-by-side mode
  const handleLeftScroll = () => {
    if (rightScrollRef.current && leftScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
  };
  
  const handleRightScroll = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  };
  
  const getLineClassName = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return "bg-success/15 border-l-2 border-success";
      case "deleted":
        return "bg-destructive/15 border-l-2 border-destructive";
      case "modified":
        return "bg-warning/15 border-l-2 border-warning";
      default:
        return "";
    }
  };
  
  const getLineIcon = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return <Plus className="w-3 h-3 text-success" />;
      case "deleted":
        return <Minus className="w-3 h-3 text-destructive" />;
      case "modified":
        return <RefreshCw className="w-3 h-3 text-warning" />;
      default:
        return null;
    }
  };
  
  const renderSideBySide = () => (
    <div className="flex flex-1 min-h-0 overflow-hidden border-t">
      {/* Left panel - Old version */}
      <div className="w-1/2 border-r flex flex-col min-h-0 overflow-hidden">
        <div className="px-3 py-2 border-b bg-muted/50 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {leftVersion.versionLabel} (стара)
            </span>
            <Badge variant="outline" className="text-[10px]">
              {formatVersionDate(leftVersion.createdAt)}
            </Badge>
          </div>
        </div>
        <div 
          ref={leftScrollRef}
          className="flex-1 min-h-0 overflow-auto"
          onScroll={handleLeftScroll}
        >
          <div className="p-3 space-y-0">
            {diffLines.map((line, index) => (
              <div
                key={`left-${index}`}
                className={cn(
                  "flex items-start gap-2 py-0.5 px-2 -mx-2 font-mono text-xs",
                  line.type === "deleted" || line.type === "modified" 
                    ? getLineClassName(line.type === "modified" ? "deleted" : line.type)
                    : line.type === "added" ? "opacity-30" : ""
                )}
              >
                <span className="w-6 text-right text-muted-foreground/50 select-none shrink-0">
                  {line.lineNumber.left || ""}
                </span>
                <span className="w-4 shrink-0">
                  {line.type === "deleted" && <Minus className="w-3 h-3 text-destructive" />}
                  {line.type === "modified" && <RefreshCw className="w-3 h-3 text-warning" />}
                </span>
                <pre className="whitespace-pre-wrap flex-1">
                  {line.leftLine ?? (line.type === "added" ? "" : "\u00A0")}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right panel - New version */}
      <div className="w-1/2 flex flex-col min-h-0 overflow-hidden">
        <div className="px-3 py-2 border-b bg-muted/50 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {rightVersion.versionLabel} (нова)
            </span>
            <Badge variant="outline" className="text-[10px]">
              {formatVersionDate(rightVersion.createdAt)}
            </Badge>
          </div>
        </div>
        <div 
          ref={rightScrollRef}
          className="flex-1 min-h-0 overflow-auto"
          onScroll={handleRightScroll}
        >
          <div className="p-3 space-y-0">
            {diffLines.map((line, index) => (
              <div
                key={`right-${index}`}
                className={cn(
                  "flex items-start gap-2 py-0.5 px-2 -mx-2 font-mono text-xs",
                  line.type === "added" || line.type === "modified" 
                    ? getLineClassName(line.type === "modified" ? "added" : line.type)
                    : line.type === "deleted" ? "opacity-30" : ""
                )}
              >
                <span className="w-6 text-right text-muted-foreground/50 select-none shrink-0">
                  {line.lineNumber.right || ""}
                </span>
                <span className="w-4 shrink-0">
                  {line.type === "added" && <Plus className="w-3 h-3 text-success" />}
                  {line.type === "modified" && <RefreshCw className="w-3 h-3 text-warning" />}
                </span>
                <pre className="whitespace-pre-wrap flex-1">
                  {line.rightLine ?? (line.type === "deleted" ? "" : "\u00A0")}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderUnified = () => (
    <div className="flex-1 min-h-0 overflow-auto border-t">
      <div className="p-4 space-y-0">
        {diffLines.map((line, index) => {
          if (line.type === "modified") {
            // Show both old and new for modified lines
            return (
              <div key={`unified-${index}`}>
                <div className={cn(
                  "flex items-start gap-2 py-0.5 px-2 -mx-2 font-mono text-xs",
                  getLineClassName("deleted")
                )}>
                  <span className="w-6 text-right text-muted-foreground/50 select-none shrink-0">
                    {line.lineNumber.left}
                  </span>
                  <span className="w-4 shrink-0">
                    <Minus className="w-3 h-3 text-destructive" />
                  </span>
                  <pre className="whitespace-pre-wrap flex-1 line-through opacity-70">
                    {line.leftLine}
                  </pre>
                </div>
                <div className={cn(
                  "flex items-start gap-2 py-0.5 px-2 -mx-2 font-mono text-xs",
                  getLineClassName("added")
                )}>
                  <span className="w-6 text-right text-muted-foreground/50 select-none shrink-0">
                    {line.lineNumber.right}
                  </span>
                  <span className="w-4 shrink-0">
                    <Plus className="w-3 h-3 text-success" />
                  </span>
                  <pre className="whitespace-pre-wrap flex-1">
                    {line.rightLine}
                  </pre>
                </div>
              </div>
            );
          }
          
          return (
            <div
              key={`unified-${index}`}
              className={cn(
                "flex items-start gap-2 py-0.5 px-2 -mx-2 font-mono text-xs",
                getLineClassName(line.type)
              )}
            >
              <span className="w-6 text-right text-muted-foreground/50 select-none shrink-0">
                {line.lineNumber.left || line.lineNumber.right}
              </span>
              <span className="w-4 shrink-0">
                {getLineIcon(line.type)}
              </span>
              <pre className="whitespace-pre-wrap flex-1">
                {line.type === "deleted" ? line.leftLine : line.rightLine || "\u00A0"}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ArrowLeftRight className="w-4 h-4" />
            Порівняння версій
          </SheetTitle>
        </SheetHeader>
        
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {leftVersion.versionLabel} → {rightVersion.versionLabel}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="flex items-center gap-2 text-xs">
              {stats.added > 0 && (
                <span className="flex items-center gap-1 text-success">
                  <Plus className="w-3 h-3" />
                  {stats.added}
                </span>
              )}
              {stats.deleted > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <Minus className="w-3 h-3" />
                  {stats.deleted}
                </span>
              )}
              {stats.modified > 0 && (
                <span className="flex items-center gap-1 text-warning">
                  <RefreshCw className="w-3 h-3" />
                  {stats.modified}
                </span>
              )}
            </div>
            
            {/* Mode toggle */}
            <ToggleGroup 
              type="single" 
              value={mode} 
              onValueChange={(v) => v && setMode(v as DiffMode)}
              className="border rounded-md"
            >
              <ToggleGroupItem value="side-by-side" size="sm" className="h-7 px-2 text-xs gap-1">
                <Columns className="w-3 h-3" />
                Поруч
              </ToggleGroupItem>
              <ToggleGroupItem value="unified" size="sm" className="h-7 px-2 text-xs gap-1">
                <AlignJustify className="w-3 h-3" />
                Злито
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        {/* AI Summary */}
        {leftContent && rightContent && (
          <div className="shrink-0 max-h-[40%] flex flex-col overflow-hidden">
            <Collapsible open={aiSummaryOpen} onOpenChange={setAiSummaryOpen} className="flex flex-col min-h-0">
              <div className="border-b bg-gradient-to-r from-primary/5 to-transparent shrink-0">
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">AI-підсумок змін</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {aiSummary.length} {aiSummary.length === 1 ? "пункт" : aiSummary.length < 5 ? "пункти" : "пунктів"}
                      </Badge>
                    </div>
                    {aiSummaryOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="flex-1 min-h-0 overflow-hidden">
                <div className="px-4 pb-3 space-y-1.5 overflow-auto max-h-full">
                  {aiSummary.map((point, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-2 text-sm text-muted-foreground bg-background/50 rounded-md px-3 py-2 border border-border/50"
                    >
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {(!leftContent || !rightContent) ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <ArrowLeftRight className="w-12 h-12 mx-auto text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Контент версій недоступний для порівняння
                </p>
              </div>
            </div>
          ) : (
            mode === "side-by-side" ? renderSideBySide() : renderUnified()
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/30 shrink-0">
          <span className="text-xs text-muted-foreground">Легенда:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success/30 border-l-2 border-success rounded-sm" />
            <span className="text-xs">Додано</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive/30 border-l-2 border-destructive rounded-sm" />
            <span className="text-xs">Видалено</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-warning/30 border-l-2 border-warning rounded-sm" />
            <span className="text-xs">Змінено</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
