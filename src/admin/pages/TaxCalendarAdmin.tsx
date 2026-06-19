import { useState, useMemo, useEffect } from "react";
import { DEADLINES } from "@/portal/data/deadlines";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { deadlineSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Calendar, ChevronDown, Bell, Brain, Save, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import type { Deadline } from "@/portal/data/deadlines";

const STORAGE_KEY = "fintodo_tax_calendar_settings";

const TAX_TYPE_LABELS: Record<string, string> = {
  fop1: "ФОП 1-2", fop2: "ФОП 2", fop3: "ФОП 3", tov: "ТОВ", all: "Всі",
};

interface TaxCalendarSettings {
  monitoring: {
    trackPkuChanges: boolean;
    trackRateChanges: boolean;
    trackPenaltyChanges: boolean;
    checkInterval: string;
    emailNotify: boolean;
  };
  reminders: {
    enabled: boolean;
    daysBefore: number[];
    email: boolean;
    push: boolean;
  };
}

const defaultSettings: TaxCalendarSettings = {
  monitoring: { trackPkuChanges: true, trackRateChanges: true, trackPenaltyChanges: false, checkInterval: "daily", emailNotify: true },
  reminders: { enabled: true, daysBefore: [7, 3, 1], email: true, push: false },
};

const columns: ColumnDef<Deadline, any>[] = [
  { accessorKey: "date", header: "Дата", cell: ({ row }) => <span className="font-medium whitespace-nowrap">{row.original.date}</span> },
  { accessorKey: "title", header: "Назва", cell: ({ row }) => (
    <div className="flex items-center gap-2">
      {row.original.isCritical && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
      <span className="text-sm">{row.original.title}</span>
    </div>
  )},
  { accessorKey: "type", header: "Тип", cell: ({ row }) => <Badge variant={row.original.type === "payment" ? "default" : "secondary"} className="text-xs">{row.original.type === "payment" ? "Оплата" : "Звіт"}</Badge> },
  { accessorKey: "taxType", header: "Платник", cell: ({ row }) => <Badge variant="outline" className="text-xs">{TAX_TYPE_LABELS[row.original.taxType] || row.original.taxType}</Badge> },
  { accessorKey: "quarter", header: "Q", cell: ({ row }) => <span className="text-muted-foreground text-sm">Q{row.original.quarter}</span> },
  { accessorKey: "daysLeft", header: "Днів", cell: ({ row }) => {
    const d = row.original;
    const color = d.urgency === "urgent" ? "text-destructive font-bold" : d.urgency === "upcoming" ? "text-yellow-600 dark:text-yellow-400 font-medium" : "text-muted-foreground";
    return <span className={`text-sm ${color}`}>{d.daysLeft < 0 ? "Минув" : d.daysLeft}</span>;
  }},
  { id: "penalty", header: "Штраф", enableSorting: false, cell: ({ row }) => (
    <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="text-xs text-muted-foreground cursor-help underline decoration-dotted">{row.original.legalBasis}</span></TooltipTrigger><TooltipContent><p>{row.original.penalty}</p></TooltipContent></Tooltip></TooltipProvider>
  )},
];

export default function TaxCalendarAdmin() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ quarter: "all", type: "all", taxType: "all" });
  const [selectedItem, setSelectedItem] = useState<Deadline | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<TaxCalendarSettings>(defaultSettings);
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSettings(JSON.parse(saved));
    } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success("Налаштування календаря збережено");
  };

  const updateMonitoring = (key: keyof TaxCalendarSettings["monitoring"], value: any) => {
    setSettings(s => ({ ...s, monitoring: { ...s.monitoring, [key]: value } }));
  };

  const updateReminders = (key: keyof TaxCalendarSettings["reminders"], value: any) => {
    setSettings(s => ({ ...s, reminders: { ...s.reminders, [key]: value } }));
  };

  const filtered = useMemo(() => {
    return DEADLINES.filter(d => {
      if (filters.quarter !== "all" && String(d.quarter) !== filters.quarter) return false;
      if (filters.type !== "all" && d.type !== filters.type) return false;
      if (filters.taxType !== "all" && d.taxType !== filters.taxType) return false;
      return true;
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [filters]);

  const urgentCount = DEADLINES.filter(d => d.urgency === "urgent").length;
  const upcomingCount = DEADLINES.filter(d => d.urgency === "upcoming").length;
  const totalQ = [1, 2, 3, 4].map(q => DEADLINES.filter(d => d.quarter === q).length);

  const changesLog = [
    { date: "15.04.2026", text: "Оновлено ставку ЄСВ — 1760 грн мін." },
    { date: "10.04.2026", text: "Зміни у строках подання ПДВ-декларації" },
    { date: "02.04.2026", text: "Новий штраф за несвоєчасну реєстрацію ПН" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" /> Податковий календар
          </h1>
          <p className="text-sm text-muted-foreground">{DEADLINES.length} подій · {urgentCount} термінових · {upcomingCount} найближчих</p>
        </div>
        <ContentCreatorDialog schema={deadlineSchema} title="Додати подію" />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {totalQ.map((count, i) => (
          <Card key={i}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">Q{i + 1}</p>
              </div>
              <Badge variant={i === Math.floor((new Date().getMonth()) / 3) ? "default" : "outline"} className="text-xs">
                {i === Math.floor((new Date().getMonth()) / 3) ? "Поточний" : `Q${i + 1}`}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Monitoring & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Monitoring */}
        <Card>
          <Collapsible open={monitoringOpen} onOpenChange={setMonitoringOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Моніторинг</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${monitoringOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Відстеження змін ПКУ</Label>
                  <Switch checked={settings.monitoring.trackPkuChanges} onCheckedChange={v => updateMonitoring("trackPkuChanges", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Зміни ставок податків</Label>
                  <Switch checked={settings.monitoring.trackRateChanges} onCheckedChange={v => updateMonitoring("trackRateChanges", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Зміни штрафів</Label>
                  <Switch checked={settings.monitoring.trackPenaltyChanges} onCheckedChange={v => updateMonitoring("trackPenaltyChanges", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Інтервал перевірки</Label>
                  <Select value={settings.monitoring.checkInterval} onValueChange={v => updateMonitoring("checkInterval", v)}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Щодня</SelectItem>
                      <SelectItem value="weekly">Щотижня</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Email-сповіщення</Label>
                  <Switch checked={settings.monitoring.emailNotify} onCheckedChange={v => updateMonitoring("emailNotify", v)} />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Reminders */}
        <Card>
          <Collapsible open={remindersOpen} onOpenChange={setRemindersOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-amber-500" /> Нагадування</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${remindersOpen ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Автонагадування</Label>
                  <Switch checked={settings.reminders.enabled} onCheckedChange={v => updateReminders("enabled", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Email-нагадування</Label>
                  <Switch checked={settings.reminders.email} onCheckedChange={v => updateReminders("email", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Push-сповіщення</Label>
                  <Switch checked={settings.reminders.push} onCheckedChange={v => updateReminders("push", v)} />
                </div>
                <div>
                  <Label className="text-sm">Нагадувати за (днів)</Label>
                  <div className="flex gap-2 mt-1.5">
                    {[1, 3, 7, 14].map(d => (
                      <Badge
                        key={d}
                        variant={settings.reminders.daysBefore.includes(d) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = settings.reminders.daysBefore;
                          updateReminders("daysBefore", current.includes(d) ? current.filter(x => x !== d) : [...current, d].sort((a, b) => a - b));
                        }}
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Save settings */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="sm" className="gap-1.5">
          <Save className="h-4 w-4" /> Зберегти налаштування
        </Button>
      </div>

      {/* Changes log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Останні зміни в законодавстві
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {changesLog.map((c, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border/30 last:border-0">
                <Badge variant="outline" className="text-[10px] shrink-0">{c.date}</Badge>
                <span className="text-sm text-foreground">{c.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <ContentFilters
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук подій..."
        filters={[
          { key: "quarter", label: "Квартал", options: [{ value: "1", label: "Q1" }, { value: "2", label: "Q2" }, { value: "3", label: "Q3" }, { value: "4", label: "Q4" }] },
          { key: "type", label: "Тип", options: [{ value: "payment", label: "Оплата" }, { value: "report", label: "Звіт" }] },
          { key: "taxType", label: "Платник", options: [{ value: "fop1", label: "ФОП 1-2" }, { value: "fop3", label: "ФОП 3" }, { value: "all", label: "Всі типи" }] },
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ quarter: "all", type: "all", taxType: "all" }); }}
      />

      <ContentTable data={filtered} columns={columns} globalFilter={search} pageSize={20}
        onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }}
      />

      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={deadlineSchema} title="Подія" />
    </div>
  );
}
