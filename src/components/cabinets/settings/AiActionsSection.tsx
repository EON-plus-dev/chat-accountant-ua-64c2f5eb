import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bot, 
  Zap, 
  Bell, 
  Target, 
  FileCheck,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  Lightbulb,
  AlertTriangle,
  CalendarClock,
  Send,
  Eye,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { 
  getAiActionLogForCabinet, 
  type AiActionLogEntry,
  generationTimeOptions,
  notificationTimeOptions,
  fallbackBehaviorOptions,
  getReportAutomationSettingsForCabinet,
} from "@/config/settingsConfig";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { useState } from "react";

interface AiActionsSectionProps {
  cabinet: Cabinet;
}

const logStatusConfig: Record<AiActionLogEntry["status"], { label: string; variant: "default" | "secondary" | "outline"; icon: typeof CheckCircle }> = {
  auto: { label: "Автоматично", variant: "default", icon: Zap },
  suggested: { label: "Запропоновано", variant: "secondary", icon: Lightbulb },
  rejected: { label: "Відхилено", variant: "outline", icon: XCircle },
};

export const AiActionsSection = ({ cabinet }: AiActionsSectionProps) => {
  const actionLog = getAiActionLogForCabinet(cabinet);
  const defaultSettings = getReportAutomationSettingsForCabinet(cabinet);
  
  const [settings, setSettings] = useState(defaultSettings);

  // Demo queue stats
  const queueStats = {
    pending: 3,
    completed: 12,
    review: 1,
  };

  return (
    <div className="space-y-5">
      {/* Automation Level */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Рівень автоматизації</CardTitle>
          </div>
          <CardDescription>
            Оберіть ступінь участі AI у вашій роботі
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="drafts" className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-all">
              <RadioGroupItem value="hints" id="hints" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="hints" className="font-medium">Підказки</Label>
                <p className="text-sm text-muted-foreground">
                  AI лише пропонує дії, нічого не виконує автоматично
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border p-4 border-primary hover:bg-muted/50 transition-all">
              <RadioGroupItem value="drafts" id="drafts" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="drafts" className="font-medium">Чернетки</Label>
                <p className="text-sm text-muted-foreground">
                  AI створює чернетки документів та категоризацій для вашого підтвердження
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-all">
              <RadioGroupItem value="auto" id="auto" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="auto" className="font-medium">Автозаповнення</Label>
                <p className="text-sm text-muted-foreground">
                  AI автоматично заповнює типові поля та категоризує операції
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* AI Features Toggles */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base">AI-функції</CardTitle>
          </div>
          <CardDescription>
            Увімкніть або вимкніть окремі функції автоматизації
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Автокатегоризація банківських операцій</p>
                <p className="text-xs text-muted-foreground">Автоматичне визначення категорії за описом</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Зіставлення операцій з документами</p>
                <p className="text-xs text-muted-foreground">Прив'язка оплат до рахунків та актів</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Авто-підготовка звітів/декларацій</p>
                <p className="text-xs text-muted-foreground">Створення чернеток звітності</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">AI-нагадування</p>
                <p className="text-xs text-muted-foreground">Сповіщення про дедлайни та важливі події</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          {cabinet.type === "fop" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <TrendingUp className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-sm">AI-контроль лімітів ФОП</p>
                  <p className="text-xs text-muted-foreground">Моніторинг наближення до ліміту доходу</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">AI-перевірка відповідності КВЕДам</p>
                <p className="text-xs text-muted-foreground">Аналіз операцій на відповідність видам діяльності</p>
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Report Automation Settings */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Автогенерація звітів</CardTitle>
            <Badge variant="outline" className="text-xs">Авто-режим</Badge>
          </div>
          <CardDescription>
            Налаштування автоматичної генерації та подання звітів
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Автоматична генерація</p>
                <p className="text-xs text-muted-foreground">
                  AI автоматично формує звіти при вході в розділ Звіти
                </p>
              </div>
            </div>
            <Switch 
              checked={settings.autoGenerationEnabled !== false}
              onCheckedChange={(v) => setSettings(s => ({ ...s, autoGenerationEnabled: v }))}
            />
          </div>
          
          {/* Час генерації */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Час генерації
            </Label>
            <RadioGroup 
              value={settings.generationDaysBefore.toString()}
              onValueChange={(v) => setSettings(s => ({ ...s, generationDaysBefore: parseInt(v) as 10 | 7 | 5 | 3 }))}
              className="grid gap-2"
            >
              {generationTimeOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-all ${
                    settings.generationDaysBefore === option.value ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <RadioGroupItem value={option.value.toString()} id={`gen-${option.value}`} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={`gen-${option.value}`} className="font-medium text-sm cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Час нотифікації */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Нотифікувати про готовність</Label>
            <Select 
              value={settings.notificationDaysBefore.toString()}
              onValueChange={(v) => setSettings(s => ({ ...s, notificationDaysBefore: parseInt(v) as 7 | 5 | 3 | 1 }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Оберіть час" />
              </SelectTrigger>
              <SelectContent>
                {notificationTimeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Автоподання */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Send className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-sm">Автоматичне подання</p>
                  <p className="text-xs text-muted-foreground">
                    Подавати звіти без підтвердження
                  </p>
                </div>
              </div>
              <Switch 
                checked={settings.autoSubmitEnabled}
                onCheckedChange={(v) => setSettings(s => ({ ...s, autoSubmitEnabled: v }))}
              />
            </div>
            
            {settings.autoSubmitEnabled && (
              <div className="flex items-center gap-2 pl-4">
                <Checkbox 
                  id="perfect-score"
                  checked={settings.autoSubmitOnlyIfPerfectScore}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, autoSubmitOnlyIfPerfectScore: !!v }))}
                />
                <Label htmlFor="perfect-score" className="text-sm cursor-pointer">
                  Тільки при 100% Data Quality Score
                </Label>
              </div>
            )}
          </div>

          {/* Fallback поведінка */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              При помилці генерації
            </Label>
            <Select 
              value={settings.fallbackBehavior}
              onValueChange={(v) => setSettings(s => ({ ...s, fallbackBehavior: v as "pause" | "retry" | "notify-only" }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fallbackBehaviorOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span>{opt.label}</span>
                      <span className="text-xs text-muted-foreground">— {opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Queue status preview */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Статус черги</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold tabular-nums">{queueStats.pending}</p>
                <p className="text-xs text-muted-foreground">У черзі</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-green-600">{queueStats.completed}</p>
                <p className="text-xs text-muted-foreground">Завершено</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-warning">{queueStats.review}</p>
                <p className="text-xs text-muted-foreground">На перевірку</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* AI Action Log */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Журнал AI-дій</CardTitle>
          </div>
          <CardDescription>
            Останні дії, виконані або запропоновані AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {actionLog.map((entry) => {
              const status = logStatusConfig[entry.status];
              const StatusIcon = status.icon;

              return (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-4 w-4 ${
                      entry.status === "auto" ? "text-primary" :
                      entry.status === "suggested" ? "text-warning" : "text-muted-foreground"
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{entry.action}</span>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.result}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: uk })}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <CardTitle className="text-base">Статистика AI за місяць</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-primary">127</p>
              <p className="text-sm text-muted-foreground">Автодій</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-green-600">92%</p>
              <p className="text-sm text-muted-foreground">Точність</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">4.2</p>
              <p className="text-sm text-muted-foreground">Год. зекономлено</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-warning">5</p>
              <p className="text-sm text-muted-foreground">Попереджень</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">Зберегти зміни</Button>
      </div>
    </div>
  );
};