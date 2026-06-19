import { useState } from "react";
import { Plug, MessageSquare, Calendar as CalendarIcon, Receipt, Rss, Users, RefreshCw, Lock, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { hasCapability } from "@/config/cabinetCapabilities";
import type { Cabinet } from "@/types/cabinet";
import { SectionShell } from "../shared/SectionShell";
import { getSettingsSectionLabel } from "@/core";

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  icon: typeof Plug;
  status: "connected" | "available" | "locked";
  lockHint?: string;
}

export function SalonIntegrationsSection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  const hasPrro = hasCapability(cabinet, "retail_prro");

  const integrations: IntegrationCard[] = [
    {
      id: "prro-master",
      name: "ПРРО ↔ Майстер",
      description: "Прив'язка фіскального чека до майстра, який виконав послугу. Потрібна для коректних винагород ФОП-орендарям.",
      icon: Receipt,
      status: hasPrro ? "connected" : "locked",
      lockHint: "Увімкніть модуль ПРРО у тарифі",
    },
    {
      id: "viber-bot",
      name: "Viber-бот для нагадувань",
      description: "Офіційний бот для нагадувань клієнтам. Дешевший за SMS, з можливістю діалогу.",
      icon: MessageSquare,
      status: "available",
    },
    {
      id: "telegram-bot",
      name: "Telegram-бот",
      description: "Канал для нагадувань і бронювань через чат.",
      icon: MessageSquare,
      status: "available",
    },
    {
      id: "google-calendar",
      name: "Google Calendar (експорт)",
      description: "Кожен майстер бачить свій графік у Google Calendar. Авто-синхронізація змін.",
      icon: CalendarIcon,
      status: "available",
    },
    {
      id: "ical-feed",
      name: "iCal-фід розкладу",
      description: "URL-фід у форматі iCal: підключається у Apple Calendar, Outlook, Mozilla Thunderbird.",
      icon: Rss,
      status: "available",
    },
  ];

  const label = getSettingsSectionLabel(cabinet, "integrations", {
    title: "Інтеграції салону",
    description: "Спеціалізовані інтеграції для салонної індустрії: ПРРО, месенджер-боти, експорт у календарі, синхронізація з зовнішньою CRM клієнтів.",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map((i) => {
          const Icon = i.icon;
          return (
            <Card key={i.id} className={i.status === "locked" ? "opacity-70" : ""}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{i.name}</div>
                    </div>
                  </div>
                  <StatusBadge status={i.status} />
                </div>

                <p className="text-[11px] text-muted-foreground leading-snug">{i.description}</p>

                {i.status === "locked" && i.lockHint && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">⚠ {i.lockHint}</p>
                )}

                <Button
                  size="sm"
                  variant={i.status === "connected" ? "outline" : "default"}
                  className="w-full h-8"
                  disabled={i.status === "locked"}
                  onClick={() => toast({ title: "Демо-режим", description: `${i.name} — у повній версії.` })}
                >
                  {i.status === "connected" ? "Налаштувати" : i.status === "locked" ? "Заблоковано" : "Підключити"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CrmClientsBlock />
    </SectionShell>
  );
}

// ───────── CRM clients block ─────────

type CrmProviderId = "altegio" | "keycrm" | "bitrix24" | "amocrm" | "hubspot";
interface CrmProvider {
  id: CrmProviderId;
  name: string;
  description: string;
  defaultMode: "pull-only" | "two-way";
}

const CRM_PROVIDERS: CrmProvider[] = [
  { id: "altegio", name: "Altegio", description: "Українська salon-CRM з онлайн-записом і кешем клієнтів.", defaultMode: "two-way" },
  { id: "keycrm", name: "KeyCRM", description: "Універсальна CRM з продажами та e-commerce. Sync контактів і угод.", defaultMode: "two-way" },
  { id: "bitrix24", name: "Bitrix24", description: "Корпоративна платформа: CRM, телефонія, задачі. REST API.", defaultMode: "pull-only" },
  { id: "amocrm", name: "amoCRM", description: "Воронкова CRM з акцентом на месенджери. Sync контактів.", defaultMode: "two-way" },
  { id: "hubspot", name: "HubSpot", description: "Глобальна CRM з marketing automation. Sync контактів і подій.", defaultMode: "pull-only" },
];

function CrmClientsBlock() {
  const { toast } = useToast();
  const [activeProvider, setActiveProvider] = useState<CrmProviderId | null>("altegio");
  const [syncMode, setSyncMode] = useState<"pull-only" | "push-only" | "two-way">("two-way");
  const [syncFreq, setSyncFreq] = useState<"manual" | "15min" | "hourly" | "daily">("hourly");
  const [conflictPolicy, setConflictPolicy] = useState<"local-wins" | "remote-wins" | "last-modified-wins">("last-modified-wins");

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-base font-semibold">CRM клієнтів</h3>
        <Badge variant="outline" className="text-[9px] uppercase">Демо</Badge>
      </div>
      <p className="text-xs text-muted-foreground max-w-2xl">
        Підʼєднайте зовнішню CRM, щоб клієнти, бонуси й історія візитів синхронізувалися автоматично.
        Поля, які мапляться, отримують замочок і не редагуються вручну.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CRM_PROVIDERS.map((p) => {
          const isActive = activeProvider === p.id;
          return (
            <Card key={p.id} className={isActive ? "border-primary/50 bg-primary/5" : ""}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{p.name}</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{p.description}</p>
                  </div>
                  {isActive ? (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0">Підключено</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] shrink-0">Доступно</Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isActive ? "outline" : "default"}
                  className="w-full h-8"
                  onClick={() => {
                    if (isActive) {
                      setActiveProvider(null);
                      toast({ title: `${p.name} відʼєднано (демо)` });
                    } else {
                      setActiveProvider(p.id);
                      setSyncMode(p.defaultMode);
                      toast({ title: `${p.name} підключено (демо)`, description: "Замочки на синхронізованих полях зʼявляться в картках клієнтів." });
                    }
                  }}
                >
                  {isActive ? "Відʼєднати" : "Підʼєднати"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeProvider && (
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium">Параметри sync — {CRM_PROVIDERS.find((p) => p.id === activeProvider)?.name}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Напрямок</Label>
                <Select value={syncMode} onValueChange={(v) => setSyncMode(v as typeof syncMode)}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pull-only" className="text-sm">Тільки тягнути (pull)</SelectItem>
                    <SelectItem value="push-only" className="text-sm">Тільки надсилати (push)</SelectItem>
                    <SelectItem value="two-way" className="text-sm">Двостороння</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Частота</Label>
                <Select value={syncFreq} onValueChange={(v) => setSyncFreq(v as typeof syncFreq)}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual" className="text-sm">Тільки вручну</SelectItem>
                    <SelectItem value="15min" className="text-sm">Кожні 15 хв</SelectItem>
                    <SelectItem value="hourly" className="text-sm">Щогодини</SelectItem>
                    <SelectItem value="daily" className="text-sm">Щодоби</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Конфлікти</Label>
                <Select value={conflictPolicy} onValueChange={(v) => setConflictPolicy(v as typeof conflictPolicy)}>
                  <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local-wins" className="text-sm">Перемагає наш кабінет</SelectItem>
                    <SelectItem value="remote-wins" className="text-sm">Перемагає CRM</SelectItem>
                    <SelectItem value="last-modified-wins" className="text-sm">Останній по часу (рекомендовано)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                Поля, що мапляться: ПІБ, телефон, email, дата народження, теги.
              </p>
              <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => toast({ title: "Sync запущено (демо)", description: "У повній версії: pull + push з CRM, опрацювання конфліктів." })}>
                <RefreshCw className="w-3.5 h-3.5" /> Sync now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: IntegrationCard["status"] }) {
  const map = {
    connected: { label: "Підключено", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    available: { label: "Доступно", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
    locked: { label: "Тариф", cls: "bg-muted text-muted-foreground border-border" },
  }[status];
  return (
    <Badge variant="outline" className={`${map.cls} text-[10px] font-medium shrink-0`}>
      {map.label}
    </Badge>
  );
}
