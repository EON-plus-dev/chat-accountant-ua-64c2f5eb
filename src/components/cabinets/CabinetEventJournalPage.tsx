import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { format, isToday, isYesterday, isSameDay, startOfDay, subDays, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from "date-fns";
import { uk } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MyEventsTab from "./MyEventsTab";
import UnifiedFilterPopover, { FilterSection } from "@/components/ui/UnifiedFilterPopover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { formatCurrency } from "@/lib/formatters";
import type { Cabinet } from "@/types/cabinet";
import {
  getEventJournalConfig,
  eventTypeConfig,
  priorityConfig,
  dateRangePresets,
  PASSIVE_CABINET_EVENT_TYPES,
  type JournalEvent,
  type EventType,
  type EventPriority
} from "@/config/eventJournalConfig";

interface CabinetEventJournalPageProps {
  cabinet: Cabinet;
  onBack?: () => void;
  onEventSelect?: (eventId: string) => void;
  onScroll?: (isScrolled: boolean) => void;
  /** Deep-link: highlight a specific user event row in the "Мої події" tab. */
  highlightUserEventId?: string | null;
  onClearHighlightUserEventId?: () => void;
}

type ViewMode = "timeline" | "calendar";
type DateRangePreset = "today" | "week" | "month" | "quarter" | "year" | "all" | "custom";

const SystemEventsView = ({ cabinet, onBack, onEventSelect, onScroll }: CabinetEventJournalPageProps) => {
  const isPassive = cabinet.accessMode === "passive";
  const allEvents = useMemo(() => getEventJournalConfig(cabinet.type, isPassive), [cabinet.type, isPassive]);
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("month");
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [selectedEventType, setSelectedEventType] = useState<EventType | "all">("all");
  const [selectedPriority, setSelectedPriority] = useState<EventPriority | "all">("all");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [floatingDate, setFloatingDate] = useState<string | null>(null);
  const [showFloatingIndicator, setShowFloatingIndicator] = useState(false);
  
  // Refs for intersection observer
  const containerRef = useRef<HTMLDivElement>(null);
  const dateGroupRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Calculate date range based on preset
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (dateRangePreset) {
      case "today": return { from: startOfDay(now), to: now };
      case "week": return { from: startOfWeek(now, { locale: uk }), to: now };
      case "month": return { from: startOfMonth(now), to: now };
      case "quarter": return { from: startOfQuarter(now), to: now };
      case "year": return { from: startOfYear(now), to: now };
      case "custom": return customDateRange;
      default: return { from: undefined, to: undefined };
    }
  }, [dateRangePreset, customDateRange]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch = 
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.metadata?.relatedEntity?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Date range filter
      if (dateRange.from && event.date < dateRange.from) return false;
      if (dateRange.to && event.date > dateRange.to) return false;
      
      // Event type filter
      if (selectedEventType !== "all" && event.type !== selectedEventType) return false;
      
      // Priority filter
      if (selectedPriority !== "all" && event.priority !== selectedPriority) return false;
      
      return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [allEvents, debouncedSearch, dateRange, selectedEventType, selectedPriority]);

  // Group events by date for timeline
  const groupedEvents = useMemo(() => {
    const groups: { date: Date; label: string; events: JournalEvent[] }[] = [];
    
    filteredEvents.forEach(event => {
      const eventDate = startOfDay(event.date);
      const existingGroup = groups.find(g => isSameDay(g.date, eventDate));
      
      if (existingGroup) {
        existingGroup.events.push(event);
      } else {
        let label: string;
        if (isToday(eventDate)) {
          label = "Сьогодні";
        } else if (isYesterday(eventDate)) {
          label = "Вчора";
        } else {
          label = format(eventDate, "d MMMM yyyy", { locale: uk });
        }
        groups.push({ date: eventDate, label, events: [event] });
      }
    });
    
    return groups;
  }, [filteredEvents]);

  // Calendar data - events per day
  const calendarData = useMemo(() => {
    const data: Map<string, { count: number; events: JournalEvent[]; hasHigh: boolean }> = new Map();
    
    filteredEvents.forEach(event => {
      const dateKey = format(event.date, "yyyy-MM-dd");
      const existing = data.get(dateKey);
      if (existing) {
        existing.count++;
        existing.events.push(event);
        if (event.priority === "high") existing.hasHigh = true;
      } else {
        data.set(dateKey, { 
          count: 1, 
          events: [event], 
          hasHigh: event.priority === "high" 
        });
      }
    });
    
    return data;
  }, [filteredEvents]);

  // Events for selected calendar date
  const selectedDateEvents = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return filteredEvents.filter(e => isSameDay(e.date, selectedCalendarDate));
  }, [filteredEvents, selectedCalendarDate]);

  // Active filters count (for popover only - type and priority)
  const popoverFiltersCount = [
    selectedEventType !== "all",
    selectedPriority !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedEventType("all");
    setSelectedPriority("all");
    setDateRangePreset("all");
    setSelectedCalendarDate(undefined);
  };

  const clearPopoverFilters = () => {
    setSelectedEventType("all");
    setSelectedPriority("all");
  };

  // Filter event types for passive cabinets
  const availableEventTypes = useMemo(() => {
    if (isPassive) {
      return Object.entries(eventTypeConfig).filter(([key]) => 
        PASSIVE_CABINET_EVENT_TYPES.includes(key as EventType)
      );
    }
    return Object.entries(eventTypeConfig);
  }, [isPassive]);

  // Filter sections for UnifiedFilterPopover
  const filterSections: FilterSection[] = [
    {
      id: "event-type",
      label: "Тип події",
      options: [
        { value: "all", label: "Усі типи" },
        ...availableEventTypes.map(([key, config]) => ({ value: key, label: config.label }))
      ],
      value: selectedEventType,
      onChange: (v) => setSelectedEventType(v as EventType | "all"),
      placeholder: "Оберіть тип",
    },
    {
      id: "event-priority",
      label: "Пріоритет",
      options: [
        { value: "all", label: "Усі" },
        ...Object.entries(priorityConfig).map(([key, config]) => ({ value: key, label: config.label }))
      ],
      value: selectedPriority,
      onChange: (v) => setSelectedPriority(v as EventPriority | "all"),
      placeholder: "Оберіть пріоритет",
    },
  ];

  const formatEventTime = (date: Date) => format(date, "HH:mm", { locale: uk });

  const formatAmount = (amount: number) => formatCurrency(amount);

  // Render single event
  const renderEvent = (event: JournalEvent, showDate = false) => {
    const typeConfig = eventTypeConfig[event.type];
    const prioConfig = priorityConfig[event.priority];
    
    const handleClick = () => {
      if (onEventSelect) {
        onEventSelect(event.id);
      }
    };
    
    return (
      <div 
        key={event.id}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
      >
        {/* Timeline dot */}
        <div className="relative flex flex-col items-center">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            typeConfig.bgColor
          )}>
            <event.icon className={cn("w-4 h-4", typeConfig.color)} />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatEventTime(event.date)}
                </span>
                {showDate && (
                  <span className="text-xs text-muted-foreground">
                    · {format(event.date, "d MMM", { locale: uk })}
                  </span>
                )}
                {event.priority === "high" && (
                  <Badge variant="destructive" size="sm">
                    Важливо
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium mt-0.5">{event.title}</p>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {event.description}
                </p>
              )}
              {event.metadata && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {event.metadata.amount && (
                    <span className="text-xs font-medium text-success tabular-nums">
                      {formatAmount(event.metadata.amount)}
                    </span>
                  )}
                  {event.metadata.documentNumber && (
                    <span className="text-xs text-muted-foreground">
                      №{event.metadata.documentNumber}
                    </span>
                  )}
                  {event.metadata.relatedEntity && (
                    <span className="text-xs text-muted-foreground">
                      {event.metadata.relatedEntity}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Badge variant="outline" size="sm" className={cn("flex-shrink-0", prioConfig.color)}>
              {typeConfig.label}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  // Intersection Observer for floating date indicator
  useEffect(() => {
    if (viewMode !== "timeline" || groupedEvents.length === 0) {
      setShowFloatingIndicator(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible group from top
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries[0];
          const label = topEntry.target.getAttribute('data-date-label');
          if (label) {
            setFloatingDate(label);
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: '-80px 0px -50% 0px',
        threshold: 0
      }
    );

    // Observe all date group elements
    dateGroupRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [viewMode, groupedEvents]);

  // Handle scroll for floating indicator visibility
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    onScroll?.(scrollTop > 10);
    setShowFloatingIndicator(scrollTop > 100 && viewMode === "timeline");
  }, [onScroll, viewMode]);

  // Ref callback for date groups
  const setDateGroupRef = useCallback((label: string) => (el: HTMLDivElement | null) => {
    if (el) {
      dateGroupRefs.current.set(label, el);
    } else {
      dateGroupRefs.current.delete(label);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-full md:overflow-auto flex flex-col pb-16 md:pb-0 relative"
      onScroll={handleScroll}
    >
      {/* Header - sticky with opaque background (NN/g guideline) */}
      <div className="sticky top-0 z-20 bg-card px-4 md:px-6 pt-5 pb-4 space-y-2 border-b border-border/50 shadow-sm">
        {/* Toolbar */}
        <UnifiedToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Пошук за назвою, описом..."

          filterSlot={
            <div className="flex items-center gap-2">
              <Select
                value={dateRangePreset}
                onValueChange={(v) => {
                  const preset = v as DateRangePreset;
                  setDateRangePreset(preset);
                  if (preset !== "custom") setSelectedCalendarDate(undefined);
                  if (preset === "today") setSelectedCalendarDate(new Date());
                }}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs shrink-0" aria-label="Період">
                  <SelectValue placeholder="Період" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Сьогодні</SelectItem>
                  <SelectItem value="week">Тиждень</SelectItem>
                  <SelectItem value="month">Місяць</SelectItem>
                  <SelectItem value="quarter">Квартал</SelectItem>
                  <SelectItem value="year">Рік</SelectItem>
                  <SelectItem value="all">Увесь час</SelectItem>
                  {dateRangePreset === "custom" && (
                    <SelectItem value="custom">
                      {selectedCalendarDate ? format(selectedCalendarDate, "d MMM yyyy", { locale: uk }) : "Дата"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-8 gap-1.5"
                    aria-label="Обрати дату"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {selectedCalendarDate && (
                      <span className="text-xs hidden sm:inline">
                        {format(selectedCalendarDate, "d MMM", { locale: uk })}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={(date) => {
                      setSelectedCalendarDate(date);
                      if (date) setDateRangePreset("custom");
                    }}
                    className="rounded-md pointer-events-auto"
                    modifiers={{
                      hasEvents: (date) => {
                        const key = format(date, "yyyy-MM-dd");
                        return calendarData.has(key);
                      },
                      hasHighPriority: (date) => {
                        const key = format(date, "yyyy-MM-dd");
                        return calendarData.get(key)?.hasHigh ?? false;
                      }
                    }}
                    modifiersClassNames={{
                      hasEvents: "bg-primary/10 font-medium",
                      hasHighPriority: "bg-destructive/10 text-destructive font-medium"
                    }}
                  />
                </PopoverContent>
              </Popover>

              <UnifiedFilterPopover
                sections={filterSections}
                activeFiltersCount={popoverFiltersCount}
                onReset={clearPopoverFilters}
              />
            </div>
          }
          mobileFilterContent={
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Період</Label>
                <Select
                  value={dateRangePreset}
                  onValueChange={(v) => {
                    const preset = v as DateRangePreset;
                    setDateRangePreset(preset);
                    if (preset !== "custom") setSelectedCalendarDate(undefined);
                    if (preset === "today") setSelectedCalendarDate(new Date());
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Період" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Сьогодні</SelectItem>
                    <SelectItem value="week">Тиждень</SelectItem>
                    <SelectItem value="month">Місяць</SelectItem>
                    <SelectItem value="quarter">Квартал</SelectItem>
                    <SelectItem value="year">Рік</SelectItem>
                    <SelectItem value="all">Увесь час</SelectItem>
                    {dateRangePreset === "custom" && (
                      <SelectItem value="custom">
                        {selectedCalendarDate ? format(selectedCalendarDate, "d MMM yyyy", { locale: uk }) : "Дата"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Конкретна дата</Label>
                <Calendar
                  mode="single"
                  selected={selectedCalendarDate}
                  onSelect={(date) => {
                    setSelectedCalendarDate(date);
                    if (date) setDateRangePreset("custom");
                  }}
                  className="rounded-md border pointer-events-auto"
                  modifiers={{
                    hasEvents: (date) => {
                      const key = format(date, "yyyy-MM-dd");
                      return calendarData.has(key);
                    },
                    hasHighPriority: (date) => {
                      const key = format(date, "yyyy-MM-dd");
                      return calendarData.get(key)?.hasHigh ?? false;
                    }
                  }}
                  modifiersClassNames={{
                    hasEvents: "bg-primary/10 font-medium",
                    hasHighPriority: "bg-destructive/10 text-destructive font-medium"
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Тип події</Label>
                <Select value={selectedEventType} onValueChange={(v) => setSelectedEventType(v as EventType | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Усі типи</SelectItem>
                    {Object.entries(eventTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Пріоритет</Label>
                <Select value={selectedPriority} onValueChange={(v) => setSelectedPriority(v as EventPriority | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть пріоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Усі</SelectItem>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
          
          activeChips={[
            searchQuery && { key: "search", label: `"${searchQuery}"`, onRemove: () => setSearchQuery("") },
            dateRangePreset !== "month" && dateRangePreset !== "all" && dateRangePreset !== "custom" && { 
              key: "date", 
              label: dateRangePresets.find(p => p.id === dateRangePreset)?.label || dateRangePreset, 
              onRemove: () => setDateRangePreset("month") 
            },
            selectedCalendarDate && { 
              key: "calendar", 
              label: format(selectedCalendarDate, "d MMM", { locale: uk }), 
              onRemove: () => { setSelectedCalendarDate(undefined); setDateRangePreset("month"); }
            },
            selectedEventType !== "all" && { key: "type", label: eventTypeConfig[selectedEventType].label, onRemove: () => setSelectedEventType("all") },
            selectedPriority !== "all" && { key: "priority", label: priorityConfig[selectedPriority].label, onRemove: () => setSelectedPriority("all") },
          ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[]}
          onClearAllFilters={clearFilters}
          
          resultsCount={
            (searchQuery !== "" || selectedEventType !== "all" || selectedPriority !== "all" || dateRangePreset !== "month" || selectedCalendarDate)
              ? { shown: filteredEvents.length, total: allEvents.length }
              : undefined
          }
          sticky={false}
          className="mb-4"
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 pb-4 pt-4">
        {filteredEvents.length === 0 ? (
          /* Empty State */
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Подій не знайдено</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Змініть параметри фільтрації або оберіть інший період
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Скинути фільтри
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "timeline" ? (
          /* Timeline View */
          <div className="relative">
            {/* Floating Date Indicator - outside space-y-4 for proper positioning */}
            {showFloatingIndicator && floatingDate && (
              <div className="sticky top-0 z-10 flex justify-center pointer-events-none py-2">
                <Badge 
                  variant="secondary" 
                  className="shadow-lg bg-background/95 backdrop-blur-sm border px-3 py-1.5 text-sm font-medium pointer-events-auto"
                >
                  <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  {floatingDate}
                </Badge>
              </div>
            )}
            <div className="space-y-4">
              {groupedEvents.map(group => (
              <div 
                key={group.label} 
                ref={setDateGroupRef(group.label)}
                data-date-label={group.label}
                className="relative"
              >
                {/* Date header - non-sticky, inline with content */}
                <div className="flex items-center gap-2 mb-2 bg-muted/50 rounded-lg px-3 py-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">{group.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {group.events.length}
                  </Badge>
                </div>
                
                {/* Events list with timeline */}
                <div className="relative pl-4 border-l-2 border-border ml-3 space-y-1">
                  {group.events.map(event => renderEvent(event))}
                </div>
              </div>
            ))}
            </div>
          </div>
        ) : (
          /* Calendar View */
          <div className="h-full flex flex-col gap-4">
            {/* Mobile: Events list for selected date */}
            <div className="lg:hidden">
              {selectedCalendarDate ? (
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      {format(selectedCalendarDate, "d MMMM yyyy", { locale: uk })}
                      <Badge variant="secondary" className="ml-auto">
                        {selectedDateEvents.length} подій
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {selectedDateEvents.length > 0 ? (
                      <div className="divide-y">
                        {selectedDateEvents.map(event => renderEvent(event, false))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Подій на цю дату немає
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CalendarIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Оберіть дату в панелі навігації вище
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Desktop: Full Calendar */}
            <div className="hidden lg:flex flex-row gap-4 h-full">
              <Card className="flex-shrink-0">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCalendarMonth(prev => subDays(prev, 30))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      {format(calendarMonth, "LLLL yyyy", { locale: uk })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCalendarMonth(prev => {
                        const next = new Date(prev);
                        next.setMonth(next.getMonth() + 1);
                        return next;
                      })}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Calendar
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={setSelectedCalendarDate}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    className="rounded-md pointer-events-auto"
                    modifiers={{
                      hasEvents: (date) => {
                        const key = format(date, "yyyy-MM-dd");
                        return calendarData.has(key);
                      },
                      hasHighPriority: (date) => {
                        const key = format(date, "yyyy-MM-dd");
                        return calendarData.get(key)?.hasHigh ?? false;
                      }
                    }}
                    modifiersClassNames={{
                      hasEvents: "bg-primary/10 font-medium",
                      hasHighPriority: "bg-destructive/10 text-destructive font-medium"
                    }}
                    components={{
                      DayContent: ({ date }) => {
                        const key = format(date, "yyyy-MM-dd");
                        const data = calendarData.get(key);
                        return (
                          <div className="relative flex flex-col items-center">
                            <span>{date.getDate()}</span>
                            {data && (
                              <div className="absolute -bottom-1 flex gap-0.5">
                                <span className={cn(
                                  "w-1 h-1 rounded-full",
                                  data.hasHigh ? "bg-destructive" : "bg-primary"
                                )} />
                              </div>
                            )}
                          </div>
                        );
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Selected date events - Desktop */}
              <Card className="flex-1 min-h-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {selectedCalendarDate 
                      ? format(selectedCalendarDate, "d MMMM yyyy", { locale: uk })
                      : "Оберіть день"}
                  </CardTitle>
                  {selectedDateEvents.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedDateEvents.length} подій
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {selectedCalendarDate ? (
                    selectedDateEvents.length > 0 ? (
                      <div className="h-[calc(100vh-380px)] overflow-auto">
                        <div className="space-y-1 pr-4">
                          {selectedDateEvents.map(event => renderEvent(event, true))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Немає подій у цей день</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Натисніть на день для перегляду подій</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

import { IndividualEventsBoard } from "./individual/IndividualEventsBoard";

const CabinetEventJournalPage = (props: CabinetEventJournalPageProps) => {
  const [tab, setTab] = useState<string>("my");

  // Individual cabinets → new agenda-first board
  if (props.cabinet.type === "individual" && props.cabinet.accessMode !== "passive") {
    return <IndividualEventsBoard cabinet={props.cabinet} />;
  }


  // Deep-link: when a user event id is provided, jump to "Мої події" tab
  useEffect(() => {
    if (props.highlightUserEventId) {
      setTab("my");
    }
  }, [props.highlightUserEventId]);

  return (
    <div className="h-full md:overflow-auto flex flex-col pb-16 md:pb-0">
      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
        <div className="px-4 md:px-6 pt-4 pb-3 bg-card border-b border-border/50">
          <TabsList>
            <TabsTrigger value="my">Мої події</TabsTrigger>
            <TabsTrigger value="system">Системний журнал</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="system" className="flex-1 mt-0 focus-visible:ring-0">
          <SystemEventsView {...props} />
        </TabsContent>
        <TabsContent value="my" className="flex-1 mt-0 p-4 md:p-6 focus-visible:ring-0">
          <MyEventsTab
            cabinet={props.cabinet}
            onOpenSystemEvent={(eventId) => {
              setTab("system");
              props.onEventSelect?.(eventId);
            }}
            highlightId={props.highlightUserEventId ?? null}
            onClearHighlight={props.onClearHighlightUserEventId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CabinetEventJournalPage;

