import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { aiNotificationsConfig, aiCategoryLabels, aiCategoryDescriptions, type AiNotificationCategory } from "@/config/aiNotificationsConfig";
import { reportNotificationTemplates, type ReportNotificationEventType } from "@/config/reportNotificationsConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  Brain, 
  Moon,
  Info,
  Calendar,
  TrendingUp,
  Users,
  Wallet,
  Mail,
  FileText,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Send,
  Loader2,
  Bot,
  XCircle,
  HelpCircle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import type { Cabinet } from "@/types/cabinet";

interface CabinetNotificationsSectionProps {
  cabinet: Cabinet;
}

interface DeadlineReminder {
  id: string;
  label: string;
  enabled: boolean;
}

interface RiskLevel {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
}

interface AiNotification {
  id: string;
  label: string;
  enabled: boolean;
  cabinetTypes?: string[];
}

interface ReportNotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

type DigestFrequency = "none" | "daily" | "weekly" | "monthly";

interface DigestSettings {
  enabled: boolean;
  frequency: DigestFrequency;
  dayOfWeek: number; // 0-6 for weekly
  dayOfMonth: number; // 1-28 for monthly
  time: string;
  includeOperations: boolean;
  includeAnalytics: boolean;
  includeDeadlines: boolean;
  includeAiInsights: boolean;
}

export const CabinetNotificationsSection = ({ cabinet }: CabinetNotificationsSectionProps) => {
  // Deadline reminders state
  const [deadlineReminders, setDeadlineReminders] = useState<DeadlineReminder[]>([
    { id: "days14", label: "За 14 днів до дедлайну", enabled: true },
    { id: "days7", label: "За 7 днів до дедлайну", enabled: true },
    { id: "days3", label: "За 3 дні до дедлайну", enabled: true },
    { id: "dayOf", label: "В день дедлайну", enabled: true },
    { id: "dailyLastWeek", label: "Щоденно в останній тиждень", enabled: false },
  ]);

  // Risk levels state
  const [riskLevels, setRiskLevels] = useState<RiskLevel[]>([
    { id: "critical", label: "Критичні (блокуючі)", color: "bg-destructive", enabled: true },
    { id: "high", label: "Високі", color: "bg-orange-500", enabled: true },
    { id: "medium", label: "Середні", color: "bg-yellow-500", enabled: false },
    { id: "low", label: "Низькі (інформаційні)", color: "bg-green-500", enabled: false },
  ]);

  // AI notifications - sourced from config, filtered by cabinet type
  const visibleAiConfigs = aiNotificationsConfig.filter(
    n => !n.cabinetTypes || n.cabinetTypes.includes(cabinet.type)
  );
  const [aiEnabled, setAiEnabled] = useState<Record<string, boolean>>(
    () => visibleAiConfigs.reduce((acc, n) => ({ ...acc, [n.id]: n.defaultEnabled }), {} as Record<string, boolean>)
  );
  const aiByCategory = visibleAiConfigs.reduce((acc, n) => {
    (acc[n.category] ||= []).push(n);
    return acc;
  }, {} as Record<AiNotificationCategory, typeof visibleAiConfigs>);

  // Report notification settings (for FOP/TOV only)
  const [reportNotificationSettings, setReportNotificationSettings] = useState<ReportNotificationSetting[]>([
    { 
      id: "generation_started", 
      label: "Початок генерації звіту",
      description: "Коли AI розпочинає формування звіту",
      enabled: true 
    },
    { 
      id: "ready_for_review", 
      label: "Звіт готовий до перевірки",
      description: "Коли звіт сформовано і очікує перевірки",
      enabled: true 
    },
    { 
      id: "approved", 
      label: "Звіт підтверджено",
      description: "Коли ви підтвердили звіт",
      enabled: true 
    },
    { 
      id: "submitted", 
      label: "Звіт подано до ДПС",
      description: "Коли звіт успішно відправлено",
      enabled: true 
    },
    { 
      id: "rejected", 
      label: "Звіт відхилено",
      description: "Коли ДПС відхилила звіт",
      enabled: true 
    },
    { 
      id: "generation_failed", 
      label: "Помилка генерації",
      description: "Коли AI не зміг сформувати звіт",
      enabled: true 
    },
  ]);

  const showReportNotifications = cabinet.type === "fop" || cabinet.type === "tov" || cabinet.type === "fop-group";

  // Quiet hours state
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursFrom, setQuietHoursFrom] = useState("20:00");
  const [quietHoursTo, setQuietHoursTo] = useState("09:00");

  // Email digest state
  const [digestSettings, setDigestSettings] = useState<DigestSettings>({
    enabled: false,
    frequency: "weekly",
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    time: "09:00",
    includeOperations: true,
    includeAnalytics: true,
    includeDeadlines: true,
    includeAiInsights: true,
  });

  const [isSendingTestDigest, setIsSendingTestDigest] = useState(false);
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmailOption, setTestEmailOption] = useState<"current" | "custom">("current");
  const [customTestEmail, setCustomTestEmail] = useState("");
  const currentUserEmail = "user@example.com"; // Demo email

  const daysOfWeek = [
    { value: 0, label: "Неділя" },
    { value: 1, label: "Понеділок" },
    { value: 2, label: "Вівторок" },
    { value: 3, label: "Середа" },
    { value: 4, label: "Четвер" },
    { value: 5, label: "П'ятниця" },
    { value: 6, label: "Субота" },
  ];

  const toggleDeadlineReminder = (id: string) => {
    setDeadlineReminders(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  };

  const toggleRiskLevel = (id: string) => {
    setRiskLevels(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  };

  const toggleAiNotification = (id: string) => {
    setAiEnabled(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Risk level presets with toast-undo
  const applyRiskPreset = (preset: "recommended" | "all") => {
    const prevState = riskLevels;
    const next = riskLevels.map(r => {
      if (preset === "all") return { ...r, enabled: true };
      const on = r.id === "critical" || r.id === "high";
      return { ...r, enabled: on };
    });
    setRiskLevels(next);
    toast.success(
      preset === "recommended" ? "Застосовано пресет «Рекомендовано»" : "Увімкнено всі рівні",
      {
        action: { label: "Відмінити", onClick: () => setRiskLevels(prevState) },
        duration: 5000,
      }
    );
  };

  // Soft-warning: lower level ON while higher is OFF
  const riskOrder = ["critical", "high", "medium", "low"] as const;
  const riskMap = Object.fromEntries(riskLevels.map(r => [r.id, r.enabled]));
  const riskInversion = (() => {
    for (let i = riskOrder.length - 1; i > 0; i--) {
      if (riskMap[riskOrder[i]] && !riskMap[riskOrder[i - 1]]) {
        return { lower: riskOrder[i], higher: riskOrder[i - 1] };
      }
    }
    return null;
  })();

  // Map report priority → badge variant + label
  const reportPriorityBadge = (id: string): { variant: "destructive" | "secondary" | "outline"; label: string } | null => {
    const tpl = reportNotificationTemplates[id as ReportNotificationEventType];
    if (!tpl) return null;
    if (tpl.priority === "urgent") return { variant: "destructive", label: "Рекомендовано" };
    if (tpl.priority === "high") return { variant: "secondary", label: "Важливе" };
    return { variant: "outline", label: "Інформаційне" };
  };

  // Group report settings: process / submission / errors
  const reportGroups: Record<"process" | "submission" | "errors", string[]> = {
    process: ["generation_started", "ready_for_review"],
    submission: ["approved", "submitted"],
    errors: ["rejected", "generation_failed"],
  };
  const reportGroupLabels = {
    process: "Процес генерації",
    submission: "Подання до ДПС",
    errors: "Помилки та відмови",
  };

  const toggleReportNotification = (id: string) => {
    setReportNotificationSettings(prev =>
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    );
  };

  const getReportNotificationIcon = (id: string) => {
    switch (id) {
      case "generation_started": return <Loader2 className="h-4 w-4 text-muted-foreground" />;
      case "ready_for_review": return <Eye className="h-4 w-4 text-muted-foreground" />;
      case "approved": return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      case "submitted": return <Send className="h-4 w-4 text-muted-foreground" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      case "generation_failed": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Bot className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const updateDigestSettings = (updates: Partial<DigestSettings>) => {
    setDigestSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSendTestDigest = async () => {
    const targetEmail = testEmailOption === "current" ? currentUserEmail : customTestEmail;
    
    if (testEmailOption === "custom" && !customTestEmail.trim()) {
      toast.error("Введіть email-адресу");
      return;
    }
    
    if (testEmailOption === "custom" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customTestEmail)) {
      toast.error("Невірний формат email-адреси");
      return;
    }
    
    setIsSendingTestDigest(true);
    setTestEmailDialogOpen(false);
    
    // Simulate sending (demo)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSendingTestDigest(false);
    
    toast.success("Тестовий дайджест надіслано", {
      description: `Лист відправлено на ${targetEmail}`
    });
  };

  return (
    <div className="space-y-4">
      {/* Deadline Reminders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Правила нагадувань про дедлайни</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Коли отримувати сповіщення про наближення дедлайнів
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {deadlineReminders.map((reminder) => (
            <div 
              key={reminder.id}
              className="flex items-center justify-between p-2.5 rounded-md border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{reminder.label}</span>
              </div>
              <Checkbox
                checked={reminder.enabled}
                onCheckedChange={() => toggleDeadlineReminder(reminder.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Levels */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Рівні ризиків для сповіщень</CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyRiskPreset("recommended")}>
                Рекомендовано
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => applyRiskPreset("all")}>
                Все
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Кожне сповіщення має рівень терміновості. Вимкнення нижчого рівня не приховує критичні події.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Alert className="py-2 px-3 bg-muted/40 border-muted">
            <Shield className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs ml-1">
              Налаштування діють тільки для кабінету «{cabinet.name}». Глобальні правила —{" "}
              <Link to="/profile?tab=notifications" className="underline underline-offset-2 text-primary hover:text-primary/80">
                Профіль → Сповіщення
              </Link>.
            </AlertDescription>
          </Alert>

          {(() => {
            const riskExamples: Record<string, string> = {
              critical: "Блокують роботу. Напр.: перевищення ліміту ФОП, прострочений звіт ДПС, відмова банку.",
              high: "Потребують уваги цього тижня. Напр.: дедлайн за 3 дні, розбіжність даних > 5%, відсутність КВЕДу.",
              medium: "Інформативні, реагування за бажанням. Напр.: незвичайна активність, концентрація доходу > 70%.",
              low: "Пасивна аналітика. Напр.: тижневий підсумок, рекомендації з оптимізації.",
            };
            return riskLevels.map((level) => (
              <div
                key={level.id}
                className="flex items-start justify-between p-2.5 rounded-md border hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${level.color} mt-1 shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{level.label}</span>
                      {level.id === "critical" && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">Рекомендовано</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{riskExamples[level.id]}</p>
                  </div>
                </div>
                <Checkbox
                  checked={level.enabled}
                  onCheckedChange={() => toggleRiskLevel(level.id)}
                  className="mt-1"
                />
              </div>
            ));
          })()}

          {riskInversion && (
            <Alert variant="default" className="py-2 px-3 border-warning/40 bg-warning/5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              <AlertDescription className="text-xs ml-1">
                Незвичайна конфігурація: ви отримуватимете сповіщення нижчого рівня, але пропустите більш термінові. Увімкніть вищий рівень, щоб не пропустити критичне.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">AI-сповіщення цього кабінету</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Автоматичні підказки та рекомендації від AI на основі ваших даних. Не плутати зі сповіщеннями від ДПС.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["realtime", "periodic"] as AiNotificationCategory[]).map((cat) => {
            const items = aiByCategory[cat];
            if (!items?.length) return null;
            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xs font-semibold text-foreground">{aiCategoryLabels[cat]}</h4>
                  <span className="text-[11px] text-muted-foreground">{aiCategoryDescriptions[cat]}</span>
                </div>
                {items.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className="flex items-start justify-between p-2.5 rounded-md border hover:bg-muted/30 transition-colors gap-3"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-sm">{notification.label}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={!!aiEnabled[notification.id]}
                        onCheckedChange={() => toggleAiNotification(notification.id)}
                        className="mt-1"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Report Notifications - Only for FOP/TOV */}
      {showReportNotifications && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Сповіщення про звіти</CardTitle>
              <HoverCard openDelay={150}>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-1.5 gap-1 text-xs" aria-label="Що таке Авто-режим">
                    <Badge variant="outline" className="text-xs gap-1">
                      Авто-режим
                      <HelpCircle className="h-3 w-3" />
                    </Badge>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 text-xs" side="top">
                  <p className="font-semibold mb-1">Авто-режим</p>
                  <p className="text-muted-foreground">
                    AI самостійно формує звіт за розкладом. Ви отримуєте сповіщення тільки на ключових етапах і завжди підтверджуєте подання вручну.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <CardDescription className="text-xs">
              Налаштування сповіщень про автоматичну генерацію та подання звітів
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(reportGroups) as Array<keyof typeof reportGroups>).map((groupKey) => {
              const ids = reportGroups[groupKey];
              const groupSettings = reportNotificationSettings.filter(s => ids.includes(s.id));
              if (!groupSettings.length) return null;
              return (
                <div key={groupKey} className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground">{reportGroupLabels[groupKey]}</h4>
                  {groupSettings.map((setting) => {
                    const badge = reportPriorityBadge(setting.id);
                    return (
                      <div
                        key={setting.id}
                        className="flex items-start justify-between p-2.5 rounded-md border hover:bg-muted/30 transition-colors gap-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          {getReportNotificationIcon(setting.id)}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm">{setting.label}</span>
                              {badge && (
                                <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0 h-4">
                                  {badge.label}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={setting.enabled}
                          onCheckedChange={() => toggleReportNotification(setting.id)}
                          className="mt-1"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quiet Hours */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Тихі години</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Не турбувати у вказаний час (критичні сповіщення все одно надсилаються)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-md border">
            <div className="flex items-center gap-2.5">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Увімкнути тихі години</span>
            </div>
            <Switch
              checked={quietHoursEnabled}
              onCheckedChange={setQuietHoursEnabled}
            />
          </div>
          
          {quietHoursEnabled && (
            <div className="flex items-center gap-3 pl-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="from" className="text-xs text-muted-foreground">Від:</Label>
                <Input
                  id="from"
                  type="time"
                  value={quietHoursFrom}
                  onChange={(e) => setQuietHoursFrom(e.target.value)}
                  className="w-24 h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="to" className="text-xs text-muted-foreground">До:</Label>
                <Input
                  id="to"
                  type="time"
                  value={quietHoursTo}
                  onChange={(e) => setQuietHoursTo(e.target.value)}
                  className="w-24 h-8 text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Digest */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Email-дайджест</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Періодичний звіт про стан кабінету на вашу пошту
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-md border">
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Отримувати email-дайджест</span>
            </div>
            <Switch
              checked={digestSettings.enabled}
              onCheckedChange={(enabled) => updateDigestSettings({ enabled })}
            />
          </div>
          
          {digestSettings.enabled && (
            <div className="space-y-3 pl-2">
              {/* Frequency */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Частота:</Label>
                  <Select
                    value={digestSettings.frequency}
                    onValueChange={(value: DigestFrequency) => updateDigestSettings({ frequency: value })}
                  >
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Щоденно</SelectItem>
                      <SelectItem value="weekly">Щотижня</SelectItem>
                      <SelectItem value="monthly">Щомісяця</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {digestSettings.frequency === "weekly" && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">День:</Label>
                    <Select
                      value={digestSettings.dayOfWeek.toString()}
                      onValueChange={(value) => updateDigestSettings({ dayOfWeek: parseInt(value) })}
                    >
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {digestSettings.frequency === "monthly" && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Число:</Label>
                    <Select
                      value={digestSettings.dayOfMonth.toString()}
                      onValueChange={(value) => updateDigestSettings({ dayOfMonth: parseInt(value) })}
                    >
                      <SelectTrigger className="w-20 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Час:</Label>
                  <Input
                    type="time"
                    value={digestSettings.time}
                    onChange={(e) => updateDigestSettings({ time: e.target.value })}
                    className="w-24 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Content options */}
              <div className="space-y-2 pt-1">
                <Label className="text-xs text-muted-foreground">Що включати у звіт:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-md border">
                    <Checkbox
                      id="includeOperations"
                      checked={digestSettings.includeOperations}
                      onCheckedChange={(checked) => updateDigestSettings({ includeOperations: !!checked })}
                    />
                    <Label htmlFor="includeOperations" className="text-xs cursor-pointer">
                      Операції за період
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md border">
                    <Checkbox
                      id="includeAnalytics"
                      checked={digestSettings.includeAnalytics}
                      onCheckedChange={(checked) => updateDigestSettings({ includeAnalytics: !!checked })}
                    />
                    <Label htmlFor="includeAnalytics" className="text-xs cursor-pointer">
                      Аналітика
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md border">
                    <Checkbox
                      id="includeDeadlines"
                      checked={digestSettings.includeDeadlines}
                      onCheckedChange={(checked) => updateDigestSettings({ includeDeadlines: !!checked })}
                    />
                    <Label htmlFor="includeDeadlines" className="text-xs cursor-pointer">
                      Найближчі дедлайни
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md border">
                    <Checkbox
                      id="includeAiInsights"
                      checked={digestSettings.includeAiInsights}
                      onCheckedChange={(checked) => updateDigestSettings({ includeAiInsights: !!checked })}
                    />
                    <Label htmlFor="includeAiInsights" className="text-xs cursor-pointer">
                      AI-рекомендації
                    </Label>
                  </div>
                </div>
              </div>
              {/* Preview & Test buttons */}
              <div className="pt-2 flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      Попередній перегляд
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Попередній перегляд дайджесту
                      </DialogTitle>
                    </DialogHeader>
                    
                    {/* Email Preview */}
                    <div className="border rounded-lg overflow-hidden bg-background">
                      {/* Email Header */}
                      <div className="bg-primary/10 p-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">AI-Бухгалтер</h3>
                            <p className="text-xs text-muted-foreground">
                              {digestSettings.frequency === "daily" && "Щоденний звіт"}
                              {digestSettings.frequency === "weekly" && "Щотижневий звіт"}
                              {digestSettings.frequency === "monthly" && "Щомісячний звіт"}
                              {" · "}{cabinet.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="p-4 space-y-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Вітаємо!</p>
                          <p className="mt-1">
                            Ось ваш {digestSettings.frequency === "daily" ? "щоденний" : digestSettings.frequency === "weekly" ? "щотижневий" : "щомісячний"} звіт 
                            по кабінету <span className="font-medium">{cabinet.name}</span>:
                          </p>
                        </div>

                        {/* Operations Section */}
                        {digestSettings.includeOperations && (
                          <div className="border rounded-lg p-3 space-y-2">
                            <h4 className="text-xs font-semibold flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              Операції за період
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1.5 text-green-600">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>Надходження: ₴ 45 200</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-destructive">
                                <ArrowDownRight className="h-3 w-3" />
                                <span>Витрати: ₴ 12 800</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              12 нових операцій · 3 очікують категоризації
                            </p>
                          </div>
                        )}

                        {/* Analytics Section */}
                        {digestSettings.includeAnalytics && (
                          <div className="border rounded-lg p-3 space-y-2">
                            <h4 className="text-xs font-semibold flex items-center gap-1.5">
                              <TrendingUp className="h-3.5 w-3.5 text-primary" />
                              Аналітика
                            </h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Дохід за місяць:</span>
                                <span className="font-medium">₴ 128 500</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Порівняно з минулим:</span>
                                <span className="text-green-600 font-medium">+12.5%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Deadlines Section */}
                        {digestSettings.includeDeadlines && (
                          <div className="border rounded-lg p-3 space-y-2">
                            <h4 className="text-xs font-semibold flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              Найближчі дедлайни
                            </h4>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive" className="text-[11px] px-1.5 py-0">3 дні</Badge>
                                <span>Подача декларації ЄП</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[11px] px-1.5 py-0">7 днів</Badge>
                                <span>Сплата ЄСВ</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AI Insights Section */}
                        {digestSettings.includeAiInsights && (
                          <div className="border rounded-lg p-3 space-y-2 bg-primary/5">
                            <h4 className="text-xs font-semibold flex items-center gap-1.5">
                              <Brain className="h-3.5 w-3.5 text-primary" />
                              AI-рекомендації
                            </h4>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                                <span>Рекомендуємо оптимізувати витрати на категорію "Офіс" — вони зросли на 25%</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                                <span>3 операції потребують категоризації для коректної звітності</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="pt-2 border-t text-center">
                          <Button variant="default" size="sm" className="text-xs">
                            Відкрити кабінет
                          </Button>
                          <p className="text-[11px] text-muted-foreground mt-2">
                            Цей лист надіслано автоматично · Налаштувати сповіщення
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Це демо-версія листа. Реальний вміст залежатиме від даних кабінету.
                    </p>
                  </DialogContent>
                </Dialog>

                <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs gap-1.5"
                      disabled={isSendingTestDigest}
                    >
                      {isSendingTestDigest ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Надсилання...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Надіслати тестовий
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-base">
                        <Send className="h-4 w-4" />
                        Надіслати тестовий дайджест
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                      <RadioGroup 
                        value={testEmailOption} 
                        onValueChange={(value) => setTestEmailOption(value as "current" | "custom")}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2 p-2.5 rounded-md border hover:bg-muted/30 transition-colors">
                          <RadioGroupItem value="current" id="current" />
                          <Label htmlFor="current" className="flex-1 cursor-pointer">
                            <span className="text-sm">Моя поточна адреса</span>
                            <span className="block text-xs text-muted-foreground">{currentUserEmail}</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2.5 rounded-md border hover:bg-muted/30 transition-colors">
                          <RadioGroupItem value="custom" id="custom" />
                          <Label htmlFor="custom" className="text-sm cursor-pointer">
                            Інша адреса
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      {testEmailOption === "custom" && (
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={customTestEmail}
                          onChange={(e) => setCustomTestEmail(e.target.value)}
                          className="h-9 text-sm"
                        />
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setTestEmailDialogOpen(false)}
                      >
                        Скасувати
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSendTestDigest}
                        disabled={isSendingTestDigest}
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Надіслати
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Note */}
      <div className="flex items-start gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
        <p>
          <span className="font-medium text-foreground">Примітка:</span>{" "}
          Канали сповіщень (Email, Push) налаштовуються в{" "}
          <span className="font-medium text-foreground">Налаштуваннях профілю → Сповіщення</span>.
        </p>
      </div>
    </div>
  );
};

export default CabinetNotificationsSection;
