import { useMemo } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
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
  User,
  Tag,
  MessageSquare,
  FileDown,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  auditActionLabels,
  fieldLabels,
  type AuditEntry,
  type AuditAction,
} from "@/config/documentVersioningConfig";
import {
  groupEntriesByDate,
  isMilestoneAction,
  findPreviousMilestone,
  calculateDeviation,
  formatTime,
  type DeviationResult,
} from "@/lib/timelineUtils";
import { TimelineAISummary } from "./TimelineAISummary";

type HistoryFilter = "all" | "sign" | "approval" | "send" | "ai";

interface DocumentTimelineViewProps {
  documentId: string;
  entries: AuditEntry[];
  filter?: HistoryFilter;
  documentType?: string;
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

// Milestone colors (more prominent)
const milestoneColors: Partial<Record<AuditAction, string>> = {
  created: "bg-emerald-500 text-white border-emerald-500",
  signed: "bg-blue-500 text-white border-blue-500",
  sent: "bg-cyan-500 text-white border-cyan-500",
  received: "bg-teal-500 text-white border-teal-500",
  paid: "bg-green-500 text-white border-green-500",
  archived: "bg-slate-500 text-white border-slate-500",
};

// Regular action colors
const actionColors: Record<AuditAction, string> = {
  created: "border-emerald-400 text-emerald-600",
  edited: "border-blue-400 text-blue-600",
  "status-changed": "border-purple-400 text-purple-600",
  signed: "border-blue-400 text-blue-600",
  sent: "border-cyan-400 text-cyan-600",
  received: "border-teal-400 text-teal-600",
  paid: "border-green-400 text-green-600",
  archived: "border-slate-400 text-slate-600",
  cancelled: "border-red-400 text-red-600",
  viewed: "border-gray-300 text-gray-500",
  downloaded: "border-indigo-400 text-indigo-600",
  printed: "border-orange-400 text-orange-600",
  shared: "border-pink-400 text-pink-600",
  "version-created": "border-violet-400 text-violet-600",
  "version-restored": "border-amber-400 text-amber-600",
  "field-changed": "border-blue-400 text-blue-600",
  "permission-changed": "border-yellow-400 text-yellow-600",
  "kep-verified": "border-emerald-400 text-emerald-600",
  "hash-chain-verified": "border-emerald-400 text-emerald-600",
  "retention-warning": "border-amber-400 text-amber-600",
  "gdpr-export": "border-blue-400 text-blue-600",
  assigned: "border-violet-400 text-violet-600",
  "tags-changed": "border-pink-400 text-pink-600",
  "note-added": "border-amber-400 text-amber-600",
};

// Filter mapping
const filterActionMap: Record<HistoryFilter, AuditAction[]> = {
  all: [],
  sign: ["signed", "kep-verified"],
  approval: ["status-changed", "permission-changed"],
  send: ["sent", "received", "shared"],
  ai: ["created", "field-changed", "edited"],
};

// Deviation badge component
const DeviationBadge = ({ deviation }: { deviation: DeviationResult }) => {
  if (deviation.type === "on-time") {
    return (
      <Badge 
        variant="outline" 
        className="text-[10px] px-1.5 py-0 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
      >
        <CheckCircle2 className="w-3 h-3" />
        В термін
      </Badge>
    );
  }
  
  if (deviation.type === "early") {
    return (
      <Badge 
        variant="outline" 
        className="text-[10px] px-1.5 py-0 gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
      >
        <Clock className="w-3 h-3" />
        На {deviation.days} дн. раніше
      </Badge>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0 gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
          >
            <AlertTriangle className="w-3 h-3" />
            Затримка: +{deviation.days} дн.
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p>Очікувалось: {format(deviation.expectedDate, "d MMM", { locale: uk })}</p>
            <p>Фактично: {format(deviation.actualDate, "d MMM", { locale: uk })}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const DocumentTimelineView = ({
  documentId,
  entries,
  filter = "all",
  documentType = "Документ",
}: DocumentTimelineViewProps) => {
  // Apply filter
  const filteredEntries = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter(entry => filterActionMap[filter].includes(entry.action));
  }, [entries, filter]);

  // Group by date
  const groupedEntries = useMemo(
    () => groupEntriesByDate(filteredEntries),
    [filteredEntries]
  );

  // Calculate deviations for each entry
  const getDeviation = (entry: AuditEntry, index: number, allEntries: AuditEntry[]): DeviationResult | null => {
    if (!isMilestoneAction(entry.action)) return null;
    
    // Find all entries (not filtered) for milestone calculation
    const entryIndexInAll = entries.findIndex(e => e.id === entry.id);
    const previousMilestone = findPreviousMilestone(entries, entryIndexInAll);
    
    return calculateDeviation(entry, previousMilestone);
  };

  const renderEntry = (entry: AuditEntry, index: number, allEntriesInGroup: AuditEntry[]) => {
    const isMilestone = isMilestoneAction(entry.action);
    const Icon = auditActionIcons[entry.action];
    const deviation = getDeviation(entry, index, allEntriesInGroup);

    return (
      <div key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
        {/* Timeline dot */}
        <div className="relative flex flex-col items-center">
          {/* Dot */}
          <div
            className={cn(
              "relative z-10 flex items-center justify-center rounded-full border-2 bg-background",
              isMilestone
                ? cn("w-7 h-7 sm:w-8 sm:h-8", milestoneColors[entry.action])
                : cn("w-5 h-5 sm:w-6 sm:h-6", actionColors[entry.action])
            )}
          >
            {isMilestone ? (
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
          </div>
          
          {/* Connecting line (hidden for last item) */}
          {index < allEntriesInGroup.length - 1 && (
            <div className="absolute top-7 sm:top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Time and action */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {formatTime(entry.timestamp)}
            </span>
            <span className={cn(
              "font-medium text-sm",
              isMilestone && "text-foreground"
            )}>
              {isMilestone ? "MILESTONE: " : ""}
              {auditActionLabels[entry.action]}
            </span>
          </div>

          {/* Actor */}
          <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
            <span>{entry.actor}</span>
            {entry.actorRole && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {entry.actorRole}
              </Badge>
            )}
          </div>

          {/* Deviation badge for milestones */}
          {deviation && (
            <div className="mt-1.5">
              <DeviationBadge deviation={deviation} />
            </div>
          )}

          {/* Field change details */}
          {entry.fieldName && entry.previousValue && entry.newValue && (
            <div className="mt-1.5 text-sm p-2 rounded-md bg-muted/50">
              <span className="text-muted-foreground">
                [{fieldLabels[entry.fieldName] || entry.fieldName}]
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
        </div>
      </div>
    );
  };

  if (filteredEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Clock className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Немає записів для обраного фільтра</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Summary at top */}
      <TimelineAISummary
        documentId={documentId}
        entries={entries}
        documentType={documentType}
      />

      {groupedEntries.map((group) => (
        <div key={group.fullDate} className="space-y-3">
          {/* Date header */}
          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-medium text-muted-foreground px-2 bg-background cursor-default">
                    {group.dateLabel}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {group.fullDate}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Entries for this date */}
          <div className="pl-1 sm:pl-2">
            {group.entries.map((entry, index) => 
              renderEntry(entry, index, group.entries)
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
