import { useState } from "react";
import { 
  History,
  FilePlus,
  Pencil,
  RefreshCw,
  FileSignature,
  Send,
  Eye,
  Download,
  Printer,
  Share2,
  GitBranch,
  RotateCcw,
  Shield,
  Lock,
  Archive,
  XCircle,
  CreditCard,
  ChevronDown,
  User,
  Tag,
  MessageSquare,
  ChevronUp,
  FileDown,
  List,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getAuditForDocument,
  formatAuditTimestamp,
  auditActionLabels,
  fieldLabels,
  type AuditEntry,
  type AuditAction,
} from "@/config/documentVersioningConfig";
import { DocumentTimelineView } from "./DocumentTimelineView";

type HistoryFilter = "all" | "sign" | "approval" | "send" | "ai";
type ViewMode = "list" | "timeline";

// Import DocumentHistoryEntry from documentFlowConfig
import type { DocumentHistoryEntry } from "@/config/documentFlowConfig";

interface DocumentAuditSectionProps {
  documentId: string;
  filter?: HistoryFilter;
  history?: DocumentHistoryEntry[]; // Real history from document
  onExportAudit?: () => void;
}

interface DocumentAuditSectionProps {
  documentId: string;
  filter?: HistoryFilter;
  history?: DocumentHistoryEntry[]; // Real history from document
  onExportAudit?: () => void;
}

// Icon mapping for audit actions
const auditActionIcons: Record<AuditAction, LucideIcon> = {
  created: FilePlus,
  edited: Pencil,
  "status-changed": RefreshCw,
  signed: FileSignature,
  sent: Send,
  received: Download,
  paid: CreditCard,
  archived: Archive,
  cancelled: XCircle,
  viewed: Eye,
  downloaded: Download,
  printed: Printer,
  shared: Share2,
  "version-created": GitBranch,
  "version-restored": RotateCcw,
  "field-changed": Pencil,
  "permission-changed": Lock,
  "kep-verified": Shield,
  "hash-chain-verified": Shield,
  "retention-warning": Shield,
  "gdpr-export": FileDown,
  assigned: User,
  "tags-changed": Tag,
  "note-added": MessageSquare,
};

// Color mapping for audit actions
const auditActionColors: Record<AuditAction, string> = {
  created: "text-green-600 bg-green-100 dark:bg-green-900/30",
  edited: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  "status-changed": "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  signed: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  sent: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30",
  received: "text-teal-600 bg-teal-100 dark:bg-teal-900/30",
  paid: "text-green-600 bg-green-100 dark:bg-green-900/30",
  archived: "text-slate-600 bg-slate-100 dark:bg-slate-900/30",
  cancelled: "text-red-600 bg-red-100 dark:bg-red-900/30",
  viewed: "text-gray-500 bg-gray-100 dark:bg-gray-900/30",
  downloaded: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
  printed: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  shared: "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
  "version-created": "text-violet-600 bg-violet-100 dark:bg-violet-900/30",
  "version-restored": "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  "field-changed": "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  "permission-changed": "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
  "kep-verified": "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  "hash-chain-verified": "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  "retention-warning": "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  "gdpr-export": "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  assigned: "text-violet-600 bg-violet-100 dark:bg-violet-900/30",
  "tags-changed": "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
  "note-added": "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
};

// Filter mapping for audit actions
const filterActionMap: Record<HistoryFilter, AuditAction[]> = {
  all: [],
  sign: ["signed", "kep-verified"],
  approval: ["status-changed", "permission-changed"],
  send: ["sent", "received", "shared"],
  ai: ["created", "field-changed", "edited"],
};

export const DocumentAuditSection = ({
  documentId,
  filter = "all",
  history,
  onExportAudit,
}: DocumentAuditSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  
  // Convert DocumentHistoryEntry to AuditEntry if history is provided
  const historyToAudit = (entries: DocumentHistoryEntry[]): AuditEntry[] => {
    return entries.map(h => ({
      id: h.id,
      documentId,
      action: h.action as AuditAction,
      actor: h.actor,
      timestamp: h.timestamp,
      comment: h.comment,
      previousValue: h.previousValue,
      newValue: h.newValue,
    }));
  };
  
  // Use real history if provided, otherwise fallback to demo data
  const allEntries = history ? historyToAudit(history) : getAuditForDocument(documentId);
  
  // Apply filter
  const auditEntries = filter === "all" 
    ? allEntries 
    : allEntries.filter(entry => filterActionMap[filter].includes(entry.action));
  
  const displayedEntries = expanded ? auditEntries : auditEntries.slice(0, 5);
  const hasMoreEntries = auditEntries.length > 5;

  const handleExport = () => {
    if (onExportAudit) {
      onExportAudit();
    } else {
      toast({
        title: "Експорт аудиту",
        description: "Звіт буде завантажено у форматі PDF (демо)",
      });
    }
  };

  const renderEntryContent = (entry: AuditEntry) => {
    const Icon = auditActionIcons[entry.action];
    const colorClass = auditActionColors[entry.action];

    return (
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("p-1.5 rounded-full shrink-0 mt-0.5", colorClass)}>
          <Icon className="w-3 h-3" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Action and Actor */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {auditActionLabels[entry.action]}
            </span>
            <span className="text-sm text-muted-foreground">
              — {entry.actor}
            </span>
            {entry.actorRole && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {entry.actorRole}
              </Badge>
            )}
          </div>

          {/* Field change details */}
          {entry.fieldName && entry.previousValue && entry.newValue && (
            <div className="mt-1 text-sm">
              <span className="text-muted-foreground">
                {fieldLabels[entry.fieldName] || entry.fieldName}:
              </span>{" "}
              <span className="line-through text-muted-foreground/60">
                {entry.previousValue}
              </span>
              <span className="mx-1.5 text-muted-foreground">→</span>
              <span className="font-medium">{entry.newValue}</span>
            </div>
          )}

          {/* Comment */}
          {entry.comment && (
            <p className="mt-1 text-sm text-muted-foreground italic">
              {entry.comment}
            </p>
          )}

          {/* Timestamp and IP */}
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/70">
            <span>{formatAuditTimestamp(entry.timestamp)}</span>
            {entry.ipAddress && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">• IP: {entry.ipAddress}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    IP-адреса: {entry.ipAddress}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-3">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <History className="w-4 h-4" />
            Історія змін
          </h3>
          
          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 rounded-md border p-0.5">
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-6 w-6 p-0"
            >
              <List className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant={viewMode === "timeline" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("timeline")}
              className="h-6 w-6 p-0"
            >
              <Clock className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="text-[10px] px-2 py-0.5 gap-1"
          >
            <Shield className="w-3 h-3" />
            Hash-ланцюжок
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-7 px-2 text-xs gap-1"
          >
            <FileDown className="w-3.5 h-3.5" />
            Експорт
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "timeline" ? (
        <ScrollArea className={cn("pr-3", expanded ? "max-h-[400px]" : "max-h-[320px]")}>
          <DocumentTimelineView
            documentId={documentId}
            entries={auditEntries}
            filter={filter}
          />
        </ScrollArea>
      ) : (
        /* List View */
        <ScrollArea className={cn("pr-3", expanded ? "max-h-[400px]" : "max-h-[250px]")}>
          <div className="relative pl-3">
            {/* Vertical timeline line */}
            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-border" />

            <div className="space-y-4">
              {displayedEntries.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className={cn(
                    "relative",
                    index === 0 && "animate-in fade-in-0 slide-in-from-top-2 duration-300"
                  )}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-3 top-2.5 w-1.5 h-1.5 rounded-full bg-border" />
                  
                  {/* Entry content */}
                  <div className="pl-3">
                    {renderEntryContent(entry)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}

      {/* Show more/less (only for list view) */}
      {viewMode === "list" && hasMoreEntries && (
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
              Ще {auditEntries.length - 5} записів
            </>
          )}
        </Button>
      )}
    </section>
  );
};
