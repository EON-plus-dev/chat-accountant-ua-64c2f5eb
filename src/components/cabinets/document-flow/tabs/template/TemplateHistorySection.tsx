/**
 * TemplateHistorySection — Timeline-based history view for templates
 * 
 * Features:
 * - Timeline view with date grouping (Today/Yesterday/date)
 * - Chip filters (All/Versions/Field changes/AI)
 * - Period filter (7 days/30 days/All time)
 * - Version diff comparison
 * - Version restore functionality
 * - Export audit trail
 */

import { useState, useMemo } from "react";
import { 
  Clock, GitBranch, Download, User, Bot, Calendar,
  Plus, Minus, Edit3, RefreshCw, Eye, GitCompare,
  Sparkles, FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { uk } from "date-fns/locale";

import type { DocumentTemplate } from "@/config/documentTemplatesConfig";
import {
  type TemplateVersion,
  type TemplateAuditEntry,
  getVersionsForTemplate,
  getAuditForTemplate,
  templateSourceLabels,
  templateAuditActionLabels,
  formatTemplateRelativeDate,
} from "@/config/templateVersioningConfig";

// ============================================
// TYPES
// ============================================

type HistoryFilter = "all" | "versions" | "field-changes" | "ai";
type PeriodFilter = "7days" | "30days" | "all";

interface TimelineEvent {
  id: string;
  type: "version" | "field-change" | "ai" | "creation" | "audit";
  timestamp: string;
  actor: string;
  actorRole?: string;
  eventType: string;
  description: string;
  status: "success" | "warning" | "info";
  versionData?: {
    versionLabel: string;
    versionId: string;
    source?: string;
    fieldsAdded: number;
    fieldsRemoved: number;
    fieldsModified: number;
    editCount?: number;
  };
  auditData?: TemplateAuditEntry;
}

const filterConfig: { id: HistoryFilter; label: string; shortLabel: string }[] = [
  { id: "all", label: "Усі", shortLabel: "Усі" },
  { id: "versions", label: "Версії", shortLabel: "Верс." },
  { id: "field-changes", label: "Зміни полів", shortLabel: "Поля" },
  { id: "ai", label: "AI", shortLabel: "AI" },
];

interface TemplateHistorySectionProps {
  template: DocumentTemplate;
  onViewVersion?: (versionId: string) => void;
  onCompareVersions?: (left: TemplateVersion, right: TemplateVersion) => void;
  onRestoreVersion?: (versionId: string, version: TemplateVersion) => void;
  onExportAudit?: () => void;
  className?: string;
}

// ============================================
// HELPERS
// ============================================

const formatDateGroup = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Сьогодні";
  if (isYesterday(date)) return "Вчора";
  return format(date, "d MMMM yyyy", { locale: uk });
};

const getEventIcon = (event: TimelineEvent) => {
  switch (event.type) {
    case "version":
      return GitBranch;
    case "field-change":
      return Edit3;
    case "ai":
      return Bot;
    case "creation":
      return FileText;
    default:
      return Clock;
  }
};

const getEventColor = (event: TimelineEvent): string => {
  switch (event.status) {
    case "success":
      return "text-emerald-600 dark:text-emerald-400";
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-primary";
  }
};

const buildTimelineEvents = (
  versions: TemplateVersion[],
  auditEntries: TemplateAuditEntry[]
): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // Add version events
  versions.forEach((version, idx) => {
    events.push({
      id: `version-${version.id}`,
      type: "version",
      timestamp: version.createdAt,
      actor: version.createdBy,
      actorRole: version.createdByRole,
      eventType: `Версія ${version.versionLabel}`,
      description: version.changeDescription,
      status: idx === 0 ? "success" : "info",
      versionData: {
        versionLabel: version.versionLabel,
        versionId: version.id,
        source: version.source,
        fieldsAdded: version.fieldsAdded,
        fieldsRemoved: version.fieldsRemoved,
        fieldsModified: version.fieldsModified,
        editCount: version.editCount,
      },
    });
  });

  // Add audit events (that are not version-created, to avoid duplicates)
  auditEntries
    .filter(entry => entry.action !== "version-created")
    .forEach((entry) => {
      const isFieldChange = ["field-added", "field-removed", "field-modified", "formula-changed"].includes(entry.action);
      const isAI = entry.action.startsWith("ai-");
      
      events.push({
        id: `audit-${entry.id}`,
        type: isAI ? "ai" : isFieldChange ? "field-change" : "audit",
        timestamp: entry.timestamp,
        actor: entry.actor,
        actorRole: entry.actorRole,
        eventType: templateAuditActionLabels[entry.action] || entry.action,
        description: entry.details || templateAuditActionLabels[entry.action],
        status: isAI ? "warning" : "info",
        auditData: entry,
      });
    });

  // Sort by timestamp (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ============================================
// MAIN COMPONENT
// ============================================

export const TemplateHistorySection = ({
  template,
  onViewVersion,
  onCompareVersions,
  onRestoreVersion,
  onExportAudit,
  className,
}: TemplateHistorySectionProps) => {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  // Get versioning data
  const versions = useMemo(() => getVersionsForTemplate(template.id), [template.id]);
  const auditEntries = useMemo(() => getAuditForTemplate(template.id), [template.id]);

  // Build and filter timeline events
  const allEvents = useMemo(() => 
    buildTimelineEvents(versions, auditEntries),
    [versions, auditEntries]
  );

  const filteredEvents = useMemo(() => {
    let events = allEvents;

    // Apply type filter
    if (activeFilter !== "all") {
      const filterMapping: Record<HistoryFilter, TimelineEvent["type"][]> = {
        all: [],
        versions: ["version"],
        "field-changes": ["field-change"],
        ai: ["ai"],
      };
      const allowedTypes = filterMapping[activeFilter];
      if (allowedTypes.length > 0) {
        events = events.filter(e => allowedTypes.includes(e.type));
      }
    }

    // Apply period filter
    if (periodFilter !== "all") {
      const now = new Date();
      const daysLimit = periodFilter === "7days" ? 7 : 30;
      events = events.filter(e => differenceInDays(now, new Date(e.timestamp)) <= daysLimit);
    }

    return events;
  }, [allEvents, activeFilter, periodFilter]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    filteredEvents.forEach(event => {
      const dateKey = format(new Date(event.timestamp), "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredEvents]);

  const handleExport = () => {
    if (onExportAudit) {
      onExportAudit();
    } else {
      toast({
        title: "Експорт історії",
        description: "Історію шаблону буде експортовано",
      });
    }
  };

  const handleViewVersion = (versionId: string) => {
    if (onViewVersion) {
      onViewVersion(versionId);
    } else {
      toast({
        title: "Перегляд версії",
        description: `Версію ${versionId} буде відкрито`,
      });
    }
  };

  const handleCompareVersions = (versionId: string) => {
    const currentVersion = versions.find(v => v.id === versionId);
    const currentIdx = versions.findIndex(v => v.id === versionId);
    const previousVersion = currentIdx < versions.length - 1 ? versions[currentIdx + 1] : null;

    if (onCompareVersions && currentVersion && previousVersion) {
      onCompareVersions(currentVersion, previousVersion);
    } else {
      toast({
        title: "Порівняння версій",
        description: currentVersion 
          ? `Порівняння ${currentVersion.versionLabel} з попередньою версією`
          : "Версію не знайдено",
      });
    }
  };

  const handleRestoreVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (onRestoreVersion && version) {
      onRestoreVersion(versionId, version);
    } else {
      toast({
        title: "Відновлення версії",
        description: version 
          ? `Версію ${version.versionLabel} буде відновлено`
          : "Версію не знайдено",
      });
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filters Bar */}
      <div className="flex items-center gap-2 animate-fade-in">
        {/* Event Type Filters */}
        <ScrollArea className="flex-1 min-w-0" orientation="horizontal">
          <div className="flex items-center gap-1 py-0.5">
            {filterConfig.map((filter) => (
              <Badge
                key={filter.id}
                size="sm"
                variant={activeFilter === filter.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer hover:bg-accent transition-colors shrink-0 h-6 text-xs",
                  activeFilter === filter.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.shortLabel}</span>
              </Badge>
            ))}
          </div>
        </ScrollArea>

        {/* Period Filter */}
        <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
          <SelectTrigger className="w-[90px] shrink-0 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 днів</SelectItem>
            <SelectItem value="30days">30 днів</SelectItem>
            <SelectItem value="all">Увесь час</SelectItem>
          </SelectContent>
        </Select>

        {/* Export Button */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-7 w-7"
          onClick={handleExport}
          title="Експорт історії"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Timeline Content */}
      <div className="space-y-6">
        {groupedEvents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Немає подій за обраний період</p>
            </CardContent>
          </Card>
        ) : (
          groupedEvents.map(([dateKey, events]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {formatDateGroup(dateKey)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Events for this date */}
              <div className="relative pl-5 sm:pl-6 space-y-3 sm:space-y-4">
                {/* Vertical line */}
                <div className="absolute left-[9px] sm:left-[11px] top-2 bottom-2 w-px bg-border" />

                {events.map((event) => {
                  const Icon = getEventIcon(event);
                  const iconColor = getEventColor(event);
                  const isVersion = event.type === "version";
                  const isCurrentVersion = isVersion && event.versionData?.versionId === versions[0]?.id;
                  
                  // Find previous version for this version event
                  const currentVersionIdx = isVersion 
                    ? versions.findIndex(v => v.id === event.versionData?.versionId)
                    : -1;
                  const hasPreviousVersion = currentVersionIdx >= 0 && currentVersionIdx < versions.length - 1;

                  return (
                    <div key={event.id} className="relative flex gap-3">
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute -left-5 sm:-left-6 w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full bg-background border-2 flex items-center justify-center",
                        event.status === "success" && "border-emerald-500",
                        event.status === "warning" && "border-amber-500",
                        event.status === "info" && "border-primary"
                      )}>
                        <Icon className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3", iconColor)} />
                      </div>

                      {/* Event Card */}
                      <Card className={cn(
                        "flex-1 transition-shadow hover:shadow-md",
                        isCurrentVersion && "ring-1 ring-primary/20 bg-primary/5"
                      )}>
                        <CardContent className="p-2 sm:p-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              <Badge 
                                variant={isCurrentVersion ? "default" : "secondary"} 
                                className="text-[10px] sm:text-xs px-1.5 sm:px-2"
                              >
                                {/* Short label on mobile, full on desktop */}
                                <span className="sm:hidden">{event.versionData?.versionLabel || event.eventType}</span>
                                <span className="hidden sm:inline">{event.eventType}</span>
                              </Badge>
                              {isCurrentVersion && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 text-primary border-primary/30">
                                  <span className="sm:hidden">Пот.</span>
                                  <span className="hidden sm:inline">Поточна</span>
                                </Badge>
                              )}
                              {event.versionData?.source && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2">
                                  {templateSourceLabels[event.versionData.source] || event.versionData.source}
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(event.timestamp), "HH:mm")}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">{event.description}</p>

                          {/* Actor info */}
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">
                            <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span>{event.actor}</span>
                            {event.actorRole && event.actorRole !== "Система" && (
                              <>
                                <span>·</span>
                                <span>{event.actorRole}</span>
                              </>
                            )}
                          </div>

                          {/* Version stats */}
                          {event.versionData && (
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-2 sm:mb-3">
                              {event.versionData.fieldsAdded > 0 && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-1.5 h-5 sm:h-6 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                  {event.versionData.fieldsAdded}
                                </Badge>
                              )}
                              {event.versionData.fieldsModified > 0 && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-1.5 h-5 sm:h-6 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                                  <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                  {event.versionData.fieldsModified}
                                </Badge>
                              )}
                              {event.versionData.fieldsRemoved > 0 && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs px-1 sm:px-1.5 h-5 sm:h-6 text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30">
                                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                  {event.versionData.fieldsRemoved}
                                </Badge>
                              )}
                              {/* Edit count — hidden on mobile */}
                              {event.versionData.editCount !== undefined && event.versionData.editCount > 0 && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:flex">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  {event.versionData.editCount} правок
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Field change details */}
                          {event.auditData?.previousValue && event.auditData?.newValue && (
                            <div className="bg-muted/50 rounded-md p-1.5 sm:p-2 text-[10px] sm:text-xs font-mono mb-2 sm:mb-3">
                              <div className="text-red-600 dark:text-red-400">
                                - {event.auditData.previousValue}
                              </div>
                              <div className="text-emerald-600 dark:text-emerald-400">
                                + {event.auditData.newValue}
                              </div>
                            </div>
                          )}

                          {/* Action buttons for versions — icons-only on mobile */}
                          {isVersion && event.versionData && (
                            <div className="flex items-center gap-1 sm:gap-2 pt-1.5 sm:pt-2 border-t border-border/50">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 sm:h-7 sm:w-auto sm:px-2"
                                onClick={() => handleViewVersion(event.versionData!.versionId)}
                                title="Перегляд"
                              >
                                <Eye className="w-3 h-3 sm:mr-1" />
                                <span className="hidden sm:inline text-xs">Перегляд</span>
                              </Button>
                              {hasPreviousVersion && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 sm:h-7 sm:w-auto sm:px-2"
                                  onClick={() => handleCompareVersions(event.versionData!.versionId)}
                                  title="Порівняти з попередньою"
                                >
                                  <GitCompare className="w-3 h-3 sm:mr-1" />
                                  <span className="hidden sm:inline text-xs">Diff</span>
                                </Button>
                              )}
                              {!isCurrentVersion && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 sm:h-7 sm:w-auto sm:px-2"
                                  onClick={() => handleRestoreVersion(event.versionData!.versionId)}
                                  title="Відновити версію"
                                >
                                  <RefreshCw className="w-3 h-3 sm:mr-1" />
                                  <span className="hidden sm:inline text-xs">Відновити</span>
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
