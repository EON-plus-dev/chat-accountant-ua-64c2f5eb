import { useState } from "react";
import { 
  History, 
  CheckCircle, 
  Clock, 
  Eye, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  User,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  X,
  Edit3,
  Plus,
  Minus,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getVersionsForDocument,
  formatVersionDate,
  fieldLabels,
  versionSourceLabels,
  addAuditEntry,
  type DocumentVersion,
} from "@/config/documentVersioningConfig";
import { VersionDiffViewer } from "./VersionDiffViewer";

interface DocumentVersionsSectionProps {
  documentId: string;
  currentVersion?: number;
  onRestoreVersion?: (versionId: string, version: DocumentVersion) => void;
  onViewVersion?: (versionId: string) => void;
  onCompareVersions?: (leftVersion: DocumentVersion, rightVersion: DocumentVersion) => void;
}

export const DocumentVersionsSection = ({
  documentId,
  currentVersion = 1,
  onRestoreVersion,
  onViewVersion,
  onCompareVersions,
}: DocumentVersionsSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<DocumentVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Diff viewer state
  const [diffViewerOpen, setDiffViewerOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    left: DocumentVersion;
    right: DocumentVersion;
  } | null>(null);
  
  // Selection mode for comparing any two versions
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedVersionIds, setSelectedVersionIds] = useState<string[]>([]);
  
  const versions = getVersionsForDocument(documentId);
  
  const displayedVersions = expanded ? versions : versions.slice(0, 3);
  const hasMoreVersions = versions.length > 3;

  const handleViewVersion = (version: DocumentVersion) => {
    if (onViewVersion) {
      onViewVersion(version.id);
    } else {
      toast({
        title: "Перегляд версії",
        description: `Відкривається ${version.versionLabel} (демо)`,
      });
    }
  };

  const handleRestoreClick = (version: DocumentVersion) => {
    setVersionToRestore(version);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = () => {
    if (!versionToRestore) return;
    
    setIsRestoring(true);
    
    // Simulate restore delay
    setTimeout(() => {
      // Add audit entry for restore
      addAuditEntry(documentId, "version-restored", {
        comment: `Відновлено ${versionToRestore.versionLabel}`,
      });
      
      if (onRestoreVersion) {
        onRestoreVersion(versionToRestore.id, versionToRestore);
      }
      
      toast({
        title: "Версію відновлено",
        description: `Документ відновлено до ${versionToRestore.versionLabel}`,
      });
      
      setIsRestoring(false);
      setRestoreDialogOpen(false);
      setVersionToRestore(null);
    }, 600);
  };

  const handleRestoreCancel = () => {
    setRestoreDialogOpen(false);
    setVersionToRestore(null);
  };

  // Handle compare with previous version
  const handleCompareClick = (version: DocumentVersion, index: number) => {
    const previousVersion = versions[index + 1];
    if (!previousVersion) return;
    
    setCompareVersions({
      left: previousVersion,
      right: version,
    });
    setDiffViewerOpen(true);
    
    if (onCompareVersions) {
      onCompareVersions(previousVersion, version);
    }
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedVersionIds([]);
    } else {
      setSelectionMode(true);
    }
  };

  // Handle version selection
  const handleVersionSelect = (versionId: string, checked: boolean) => {
    if (checked) {
      if (selectedVersionIds.length < 2) {
        setSelectedVersionIds([...selectedVersionIds, versionId]);
      }
    } else {
      setSelectedVersionIds(selectedVersionIds.filter(id => id !== versionId));
    }
  };

  // Compare selected versions
  const handleCompareSelected = () => {
    if (selectedVersionIds.length !== 2) return;
    
    const selectedVersions = versions.filter(v => selectedVersionIds.includes(v.id));
    // Sort by version number to ensure correct order (older first)
    selectedVersions.sort((a, b) => a.versionNumber - b.versionNumber);
    
    setCompareVersions({
      left: selectedVersions[0],
      right: selectedVersions[1],
    });
    setDiffViewerOpen(true);
    setSelectionMode(false);
    setSelectedVersionIds([]);
    
    if (onCompareVersions) {
      onCompareVersions(selectedVersions[0], selectedVersions[1]);
    }
  };

  const latestVersion = versions[0];

  return (
    <>
      <section className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <History className="w-4 h-4" />
            Версії документа
          </h3>
          <div className="flex items-center gap-2">
            {versions.length >= 2 && (
              <Button
                variant={selectionMode ? "secondary" : "ghost"}
                size="sm"
                className="h-6 text-xs gap-1"
                onClick={toggleSelectionMode}
              >
                {selectionMode ? (
                  <>
                    <X className="w-3 h-3" />
                    Скасувати
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-3 h-3" />
                    Обрати для порівняння
                  </>
                )}
              </Button>
            )}
            <Badge variant="outline" className="font-mono text-xs">
              {latestVersion?.versionLabel || `v${currentVersion}`}
            </Badge>
          </div>
        </div>

        {/* Selection mode info */}
        {selectionMode && (
          <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
            <span className="text-xs text-muted-foreground">
              Обрано: {selectedVersionIds.length}/2 версій
            </span>
            <Button
              size="sm"
              className="h-6 text-xs gap-1"
              disabled={selectedVersionIds.length !== 2}
              onClick={handleCompareSelected}
            >
              <ArrowLeftRight className="w-3 h-3" />
              Порівняти обрані
            </Button>
          </div>
        )}

        {/* Versions Timeline */}
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />
          
          <div className="space-y-3">
            {displayedVersions.map((version, index) => {
              const isCurrent = index === 0;
              const isSelected = selectedVersionIds.includes(version.id);
              const canSelect = selectedVersionIds.length < 2 || isSelected;
              
              return (
                <div key={version.id} className="relative">
                  {/* Timeline dot or Checkbox */}
                  {selectionMode ? (
                    <div className="absolute -left-6 top-1">
                      <Checkbox
                        checked={isSelected}
                        disabled={!canSelect}
                        onCheckedChange={(checked) => 
                          handleVersionSelect(version.id, checked as boolean)
                        }
                        className="h-4 w-4"
                      />
                    </div>
                  ) : (
                    <div 
                      className={cn(
                        "absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        isCurrent 
                          ? "bg-primary border-primary" 
                          : "bg-background border-muted-foreground/30"
                      )}
                    >
                      {isCurrent ? (
                        <CheckCircle className="w-2.5 h-2.5 text-primary-foreground" />
                      ) : (
                        <Clock className="w-2 h-2 text-muted-foreground" />
                      )}
                    </div>
                  )}

                  {/* Version content */}
                  <div 
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      isCurrent 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-muted/30 border-border hover:bg-muted/50",
                      selectionMode && isSelected && "ring-2 ring-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {/* Version header */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono font-semibold text-sm">
                            {version.versionLabel}
                          </span>
                          {isCurrent && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              Поточна
                            </Badge>
                          )}
                          {version.source && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                              {versionSourceLabels[version.source]}
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-foreground mb-1.5">
                          {version.changeDescription}
                        </p>

                        {/* Change details (field-level diff) */}
                        {version.changeDetails && version.changeDetails.length > 0 && (
                          <div className="space-y-1 mb-2 pl-2 border-l-2 border-muted">
                            {version.changeDetails.map((detail, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs flex-wrap">
                                <span className="font-medium text-muted-foreground min-w-[70px]">
                                  {detail.fieldLabel}:
                                </span>
                                <span className="line-through text-destructive/70">
                                  {detail.previousValue}
                                </span>
                                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                                <span className="text-success font-medium">
                                  {detail.newValue}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Changed fields tags (fallback if no changeDetails) */}
                        {(!version.changeDetails || version.changeDetails.length === 0) && 
                         version.fieldsChanged.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {version.fieldsChanged.map((field) => (
                              <Badge 
                                key={field} 
                                variant="secondary" 
                                className="text-[10px] px-1.5 py-0"
                              >
                                {fieldLabels[field] || field}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Edit statistics */}
                        {(version.editCount !== undefined || version.linesAdded || version.linesRemoved) && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            {version.editCount !== undefined && version.editCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                {version.editCount} правок
                              </span>
                            )}
                            {version.linesAdded !== undefined && version.linesAdded > 0 && (
                              <span className="flex items-center gap-0.5 text-success">
                                <Plus className="w-3 h-3" />
                                {version.linesAdded}
                              </span>
                            )}
                            {version.linesRemoved !== undefined && version.linesRemoved > 0 && (
                              <span className="flex items-center gap-0.5 text-destructive">
                                <Minus className="w-3 h-3" />
                                {version.linesRemoved}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Author & Date (enhanced) */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="font-medium">{version.createdBy}</span>
                            {version.createdByRole && (
                              <Badge variant="outline" className="text-[9px] px-1 h-4">
                                {version.createdByRole}
                              </Badge>
                            )}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatVersionDate(version.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleViewVersion(version)}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Переглянути</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Compare button - not for the oldest version */}
                        {index < versions.length - 1 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleCompareClick(version, index)}
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Порівняти з {versions[index + 1]?.versionLabel}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {!isCurrent && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleRestoreClick(version)}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Відновити</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Show more/less */}
        {hasMoreVersions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-muted-foreground hover:text-foreground gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Згорнути
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ще {versions.length - 3} версій
              </>
            )}
          </Button>
        )}
      </section>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Відновити версію?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Ви збираєтесь відновити документ до версії{" "}
                  <span className="font-semibold text-foreground">
                    {versionToRestore?.versionLabel}
                  </span>
                </p>
                
                {versionToRestore && (
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Опис: </span>
                      <span className="text-foreground">{versionToRestore.changeDescription}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Автор: </span>
                      <span className="text-foreground">{versionToRestore.createdBy}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Дата: </span>
                      <span className="text-foreground">{formatVersionDate(versionToRestore.createdAt)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 text-sm text-warning-foreground bg-warning/20 rounded-md p-2.5 border border-warning/50">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Поточна версія буде збережена в історії. Ви зможете повернутися до неї пізніше.
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRestoreCancel} disabled={isRestoring}>
              Скасувати
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Відновлення...
                </>
              ) : (
                "Відновити"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Version Diff Viewer */}
      {compareVersions && (
        <VersionDiffViewer
          leftVersion={compareVersions.left}
          rightVersion={compareVersions.right}
          open={diffViewerOpen}
          onClose={() => {
            setDiffViewerOpen(false);
            setCompareVersions(null);
          }}
        />
      )}
    </>
  );
};
