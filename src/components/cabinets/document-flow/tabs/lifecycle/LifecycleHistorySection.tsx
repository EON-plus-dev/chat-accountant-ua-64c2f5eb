/**
 * LifecycleHistorySection — Підрозділ "Історія"
 * 
 * Містить:
 * - Перемикач: Хронологія / Версії
 * - Фільтри подій (чіпи)
 * - Timeline або VersionsList
 */

import { useState, useMemo } from "react";
import { 
  Clock, GitCompare, GitBranch, Filter, Download, User, Zap, Bot, FileSignature, 
  AlertTriangle, CheckCircle2, ArrowRight, Send, FileText, Link2,
  RefreshCw, Calendar, Edit3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { HistoryVersionsBlock } from "../../blocks/HistoryVersionsBlock";

import type { DocumentVersion } from "@/config/documentVersioningConfig";
import { versionSourceLabels } from "@/config/documentVersioningConfig";
import type { 
  Document as FlowDocument,
  DocumentHistoryEntry,
  ExternalIntegration,
  InternalLink,
  AutomationRule
} from "@/config/documentFlowConfig";

// ============================================
// TYPES
// ============================================

// Removed separate "versions" mode - versions are now integrated into timeline
type HistoryFilter = "all" | "users" | "integrations" | "ai" | "signing" | "risks" | "versions";
type PeriodFilter = "7days" | "30days" | "all";

interface TimelineEvent {
  id: string;
  type: "user" | "integration" | "ai" | "signing" | "status" | "creation" | "risk" | "version";
  timestamp: string;
  actor: string;
  actorType: "user" | "system" | "integration" | "ai";
  eventType: string;
  description: string;
  details?: string;
  status?: "success" | "warning" | "error" | "info";
  versionData?: {
    versionLabel: string;
    versionId: string;
    source?: "manual" | "auto-save" | "import" | "restore";
    createdByRole?: string;
    editCount?: number;
  };
}

const filterConfig: { id: HistoryFilter; label: string; shortLabel: string }[] = [
  { id: "all", label: "Усі", shortLabel: "Усі" },
  { id: "users", label: "Користувачі", shortLabel: "Корист." },
  { id: "versions", label: "Версії", shortLabel: "Верс." },
  { id: "integrations", label: "Інтеграції", shortLabel: "Інтегр." },
  { id: "ai", label: "AI", shortLabel: "AI" },
  { id: "signing", label: "Підписання", shortLabel: "Підпис" },
  { id: "risks", label: "Ризики", shortLabel: "Ризик" },
];

interface LifecycleHistorySectionProps {
  document: FlowDocument;
  history?: DocumentHistoryEntry[];
  automationRules?: AutomationRule[];
  externalIntegrations?: ExternalIntegration[];
  internalLinks?: InternalLink[];
  versions?: DocumentVersion[];
  currentVersion?: number;
  onRestoreVersion?: (versionId: string, version: DocumentVersion) => void;
  onViewVersion?: (versionId: string) => void;
  onCompareVersions?: (left: DocumentVersion, right: DocumentVersion) => void;
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
  return format(date, "dd MMMM yyyy", { locale: uk });
};

const getEventIcon = (event: TimelineEvent) => {
  switch (event.type) {
    case "user":
      return User;
    case "integration":
      return Link2;
    case "ai":
      return Bot;
    case "signing":
      return FileSignature;
    case "risk":
      return AlertTriangle;
    case "creation":
      return FileText;
    case "version":
      return GitBranch;
    default:
      return ArrowRight;
  }
};

const getEventColor = (event: TimelineEvent): string => {
  switch (event.status) {
    case "success":
      return "text-emerald-600 dark:text-emerald-400";
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    case "error":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-primary";
  }
};

const getEventBadgeVariant = (eventType: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (eventType) {
    case "Створено":
    case "Зареєстровано":
    case "Підписано":
      return "default";
    case "Помилка":
    case "Ризик":
      return "destructive";
    default:
      return "secondary";
  }
};

// Build timeline events from various sources
const buildTimelineEvents = (
  doc: FlowDocument,
  history?: DocumentHistoryEntry[],
  automationRules?: AutomationRule[],
  externalIntegrations?: ExternalIntegration[],
  internalLinks?: InternalLink[],
  versions?: DocumentVersion[]
): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  // Add creation event
  events.push({
    id: `creation-${doc.id}`,
    type: "creation",
    timestamp: doc.createdAt || doc.date,
    actor: doc.createdBy || "Система",
    actorType: doc.createdBy ? "user" : "system",
    eventType: "Створено",
    description: `Документ створено${doc.source === "edo" ? " через ЕДО" : doc.source === "generated" ? " в системі" : ""}`,
    status: "success",
  });

  // Add history entries (using actual DocumentHistoryEntry structure: action, actor, comment)
  if (history) {
    history.forEach((entry, idx) => {
      const actionLabels: Record<string, string> = {
        created: "Створено",
        edited: "Змінено",
        "status-changed": "Статус змінено",
        signed: "Підписано",
        sent: "Надіслано",
        received: "Отримано",
        paid: "Оплачено",
        archived: "Архівовано",
        cancelled: "Скасовано",
        confirmed: "Підтверджено",
      };
      
      events.push({
        id: `history-${idx}`,
        type: entry.action === "signed" ? "signing" : 
              entry.action === "edited" || entry.action === "created" ? "user" : "status",
        timestamp: entry.timestamp,
        actor: entry.actor || "Система",
        actorType: entry.actor ? "user" : "system",
        eventType: actionLabels[entry.action] || entry.action,
        description: entry.comment || `${actionLabels[entry.action] || entry.action}${entry.newValue ? `: ${entry.newValue}` : ""}`,
        details: entry.previousValue ? `Було: ${entry.previousValue}` : undefined,
        status: entry.action === "signed" || entry.action === "confirmed" ? "success" : "info",
      });
    });
  }

  // Add automation rule executions
  if (automationRules) {
    automationRules.forEach((rule, idx) => {
      if (rule.lastRunAt) {
        events.push({
          id: `automation-${idx}`,
          type: rule.ruleName.includes("AI") ? "ai" : "integration",
          timestamp: rule.lastRunAt,
          actor: rule.ruleName,
          actorType: "system",
          eventType: rule.ruleName.includes("AI") ? "AI-аналіз" : "Автоматизація",
          description: rule.actionsSummary || rule.ruleName,
          status: rule.lastResult === "success" ? "success" : 
                  rule.lastResult === "warning" ? "warning" : 
                  rule.lastResult === "error" ? "error" : "info",
        });
      }
    });
  }

  // Add external integration events
  if (externalIntegrations) {
    externalIntegrations.forEach((integration, idx) => {
      if (integration.lastSyncAt) {
        const systemNames: Record<string, string> = {
          medoc: "M.E.Doc",
          vchasno: "Vchasno",
          erpn: "ЄРПН",
          "1c": "1С",
          monobank: "Monobank",
          tax_cabinet: "Кабінет платника",
        };
        
        events.push({
          id: `integration-${idx}`,
          type: "integration",
          timestamp: integration.lastSyncAt,
          actor: systemNames[integration.system] || integration.system,
          actorType: "integration",
          eventType: integration.status === "registered" ? "Зареєстровано" :
                     integration.status === "received" ? "Отримано" :
                     integration.status === "sent" ? "Надіслано" :
                     integration.status === "processed" ? "Оброблено" :
                     integration.status === "error" ? "Помилка" : "Синхронізація",
          description: `${systemNames[integration.system] || integration.system}: ${
            integration.externalId ? `ID ${integration.externalId}` : integration.status
          }`,
          status: integration.status === "error" ? "error" : 
                  integration.status === "registered" || integration.status === "processed" ? "success" : "info",
        });
      }
    });
  }

  // Add AI risk analysis if present
  if (doc.aiRisks && doc.aiRisks.length > 0) {
    events.push({
      id: `ai-risks-${doc.id}`,
      type: "risk",
      timestamp: doc.createdAt || doc.date,
      actor: "AI-аналізатор",
      actorType: "ai",
      eventType: "Ризики виявлено",
      description: `Знайдено ${doc.aiRisks.length} потенційних ризиків`,
      status: "warning",
    });
  }

  // Add version events (integrated into timeline)
  if (versions && versions.length > 0) {
    versions.forEach((version, idx) => {
      events.push({
        id: `version-${version.id}`,
        type: "version",
        timestamp: version.createdAt,
        actor: version.createdBy || "Система",
        actorType: version.createdBy ? "user" : "system",
        eventType: `Версія ${version.versionLabel}`,
        description: version.changeDescription || `Створено версію ${version.versionLabel}`,
        status: idx === 0 ? "success" : "info",
        versionData: {
          versionLabel: version.versionLabel,
          versionId: version.id,
          source: version.source,
          createdByRole: version.createdByRole,
          editCount: version.editCount,
        },
      });
    });
  }

  // Sort by timestamp (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ============================================
// MAIN COMPONENT
// ============================================

export const LifecycleHistorySection = ({
  document,
  history,
  automationRules,
  externalIntegrations,
  internalLinks,
  versions,
  currentVersion = 1,
  onRestoreVersion,
  // Note: Versions are now integrated into the timeline, mode toggle removed
  onViewVersion,
  onCompareVersions,
  onExportAudit,
  className,
}: LifecycleHistorySectionProps) => {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  // Build and filter timeline events (including versions)
  const allEvents = useMemo(() => 
    buildTimelineEvents(document, history, automationRules, externalIntegrations, internalLinks, versions),
    [document, history, automationRules, externalIntegrations, internalLinks, versions]
  );

  const filteredEvents = useMemo(() => {
    let events = allEvents;

    // Apply type filter
    if (activeFilter !== "all") {
      const filterMapping: Record<HistoryFilter, TimelineEvent["type"][]> = {
        all: [],
        users: ["user", "creation"],
        versions: ["version"],
        integrations: ["integration"],
        ai: ["ai"],
        signing: ["signing"],
        risks: ["risk"],
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
        description: "Експорт історії доступний у повній версії",
      });
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filters - unified view (versions integrated as filter) */}
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
              <div className="relative pl-6 space-y-4">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

                {events.map((event, eventIdx) => {
                  const Icon = getEventIcon(event);
                  const iconColor = getEventColor(event);
                  
                  // Find previous version for comparison
                  const previousVersionData = event.type === "version" && versions 
                    ? (() => {
                        const currentIdx = versions.findIndex(v => v.id === event.versionData?.versionId);
                        return currentIdx >= 0 && currentIdx < versions.length - 1 
                          ? versions[currentIdx + 1] 
                          : null;
                      })()
                    : null;

                  return (
                    <div key={event.id} className="relative flex gap-3">
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute -left-6 w-[22px] h-[22px] rounded-full bg-background border-2 flex items-center justify-center",
                        event.status === "success" && "border-emerald-500",
                        event.status === "warning" && "border-amber-500",
                        event.status === "error" && "border-destructive",
                        event.status === "info" && "border-primary"
                      )}>
                        <Icon className={cn("w-3 h-3", iconColor)} />
                      </div>

                      {/* Event Card */}
                      <Card className="flex-1 overflow-hidden">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={getEventBadgeVariant(event.eventType)} className="text-[10px]">
                                  {event.eventType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(event.timestamp), "HH:mm", { locale: uk })}
                                </span>
                                {/* Source badge for versions */}
                                {event.type === "version" && event.versionData?.source && (
                                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                    {versionSourceLabels[event.versionData.source]}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{event.description}</p>
                              <p className="text-xs text-muted-foreground flex items-center flex-wrap gap-1">
                                {event.actorType === "user" && <User className="w-3 h-3" />}
                                {event.actorType === "integration" && <Link2 className="w-3 h-3" />}
                                {event.actorType === "ai" && <Bot className="w-3 h-3" />}
                                {event.actorType === "system" && <RefreshCw className="w-3 h-3" />}
                                <span>{event.actor}</span>
                                {/* Role badge for versions */}
                                {event.type === "version" && event.versionData?.createdByRole && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                    {event.versionData.createdByRole}
                                  </Badge>
                                )}
                              </p>
                              {/* Edit count for versions */}
                              {event.type === "version" && event.versionData?.editCount != null && event.versionData.editCount > 0 && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Edit3 className="w-3 h-3" />
                                  Правок: {event.versionData.editCount}
                                </p>
                              )}
                              {/* Details for non-version events */}
                              {event.type !== "version" && event.details && (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  {event.details}
                                </p>
                              )}
                              
                              {/* Version comparison button */}
                              {event.type === "version" && previousVersionData && onCompareVersions && (
                                <div className="mt-2 pt-2 border-t border-border/50">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1.5"
                                    onClick={() => {
                                      const currentVersion = versions?.find(v => v.id === event.versionData?.versionId);
                                      if (currentVersion && previousVersionData) {
                                        onCompareVersions(previousVersionData, currentVersion);
                                      }
                                    }}
                                  >
                                    <GitCompare className="w-3.5 h-3.5" />
                                    Порівняти з попередньою
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
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
