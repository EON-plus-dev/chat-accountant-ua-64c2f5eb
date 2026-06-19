import { useState, useMemo, useEffect, useRef } from "react";
import { useNotificationPreferences, ChannelKey, TypeKey, NotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useMessengerConnections, MessengerProvider } from "@/hooks/useMessengerConnections";
import { supabase } from "@/integrations/supabase/client";
import { Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell, Mail, Smartphone, Inbox, AlertTriangle, Brain, Link as LinkIcon, Clock,
  Send, MessageCircle, ExternalLink, Loader2, CheckCircle2, Copy,
  History, Search, Users, Sparkles, BellOff, Zap, CalendarClock, Info, MessageSquare
} from "lucide-react";
import {
  notificationChannels,
  NotificationChannel,
} from "@/config/userSettingsConfig";
import {
  notificationTypesConfig,
  notificationGroupLabels,
  notificationGroupDescriptions,
  type NotificationTypeGroup,
} from "@/config/notificationTypesConfig";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type LogRow = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  severity: string;
  cabinet_id: string | null;
  created_at: string;
  read_at: string | null;
};

const LEAD_OPTIONS: { days: number; label: string }[] = [
  { days: 14, label: "За 2 тижні" },
  { days: 7, label: "За 7 днів" },
  { days: 3, label: "За 3 дні" },
  { days: 1, label: "За 1 день" },
  { days: 0, label: "У день події" },
];

const NotificationsSection = () => {
  const { prefs, loading: prefsLoading, saving: prefsSaving, update: updatePrefs } = useNotificationPreferences();

  const {
    connections: messengerConnections,
    busyProvider,
    startPairing,
    disconnect: disconnectMessenger,
  } = useMessengerConnections();
  const [pairingDialog, setPairingDialog] = useState<{
    provider: MessengerProvider;
    code: string;
    expiresAt: string;
  } | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<Record<string, { at: string; ok: boolean }>>({});

  // Real channel checks
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">("default");
  const [emailVerified, setEmailVerified] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  // Delivery log
  const [deliveryLog, setDeliveryLog] = useState<LogRow[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [logStatusFilter, setLogStatusFilter] = useState<string>("all");
  const [logCabinetFilter, setLogCabinetFilter] = useState<string>("all");
  const [logSearch, setLogSearch] = useState("");

  // Push permission
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPushPermission("unsupported");
      return;
    }
    setPushPermission(Notification.permission);
  }, []);

  // Auth & email verified
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const u = data.user;
      setUserId(u?.id ?? null);
      setUserEmail(u?.email ?? "");
      setEmailVerified(!!u?.email_confirmed_at);
    })();
    return () => { mounted = false; };
  }, []);

  // Delivery log load + realtime
  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    (async () => {
      setLogLoading(true);
      const { data, error } = await supabase
        .from("user_notifications")
        .select("id, title, body, type, severity, cabinet_id, created_at, read_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!mounted) return;
      if (error) console.error("[delivery-log] load", error);
      setDeliveryLog((data ?? []) as LogRow[]);
      setLogLoading(false);
    })();

    const ch = supabase
      .channel(`profile-delivery-log-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_notifications", filter: `user_id=eq.${userId}` },
        (payload) => setDeliveryLog((prev) => [payload.new as LogRow, ...prev].slice(0, 50))
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as LogRow;
          setDeliveryLog((prev) => prev.map((x) => (x.id === n.id ? n : x)));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [userId]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = (patch: Parameters<typeof updatePrefs>[0]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const res = await updatePrefs(patch);
      if (!res.error) toast.success("Збережено");
      else toast.error("Не вдалося зберегти");
    }, 500);
  };

  const toHHMM = (t?: string) => (t ? t.slice(0, 5) : "");

  const toggleChannel = async (id: ChannelKey) => {
    if (!prefs) return;
    const next = { ...prefs.channels, [id]: !prefs.channels[id] };
    const r = await updatePrefs({ channels: next });
    if (!r.error) toast.success("Збережено");
  };

  const toggleType = async (id: TypeKey) => {
    if (!prefs) return;
    const next = { ...prefs.types, [id]: !prefs.types[id] };
    const r = await updatePrefs({ types: next });
    if (!r.error) toast.success("Збережено");
  };

  const toggleLeadDay = async (day: number) => {
    if (!prefs) return;
    const set = new Set(prefs.deadline_lead_days);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    const next = Array.from(set).sort((a, b) => b - a);
    const r = await updatePrefs({ deadline_lead_days: next });
    if (!r.error) toast.success("Збережено");
  };

  // Preset with toast-undo (Gmail-style)
  const applyPreset = async (preset: "all" | "critical" | "silence") => {
    if (!prefs) return;
    const snapshot: Pick<NotificationPreferences, "types" | "channels" | "quiet_hours_enabled" | "critical_overrides_quiet_hours"> = {
      types: { ...prefs.types },
      channels: { ...prefs.channels },
      quiet_hours_enabled: prefs.quiet_hours_enabled,
      critical_overrides_quiet_hours: prefs.critical_overrides_quiet_hours,
    };
    let patch: Parameters<typeof updatePrefs>[0] = {};
    let label = "";
    if (preset === "all") {
      label = "Усе ввімкнено";
      patch = {
        types: { system: true, deadlines: true, events: true, ai: true, risks: true, team: true, mentions: true, tasks: true, integrations: true },
        channels: { ...prefs.channels, internal: true },
      };
    } else if (preset === "critical") {
      label = "Тільки критичне";
      patch = {
        types: { system: true, deadlines: true, events: true, ai: false, risks: true, team: false, mentions: false, tasks: false, integrations: false },
        critical_overrides_quiet_hours: true,
      };
    } else {
      label = "Тиша";
      patch = {
        types: { system: false, deadlines: false, events: false, ai: false, risks: false, team: false, mentions: false, tasks: false, integrations: false },
        quiet_hours_enabled: true,
      };
    }
    const r = await updatePrefs(patch);
    if (r.error) return;
    toast.success(`Пресет «${label}» застосовано`, {
      duration: 5000,
      action: {
        label: "Відмінити",
        onClick: async () => {
          const back = await updatePrefs(snapshot);
          if (!back.error) toast.success("Повернуто попередні налаштування");
        },
      },
    });
  };

  // Real test for internal channel via INSERT
  const handleTestChannel = async (channelId: string) => {
    if (channelId !== "internal") return;
    if (!userId) {
      toast.error("Потрібно авторизуватись");
      return;
    }
    setTestingChannel(channelId);
    const { error } = await supabase.from("user_notifications").insert({
      user_id: userId,
      type: "system",
      severity: "info",
      title: "Тестове сповіщення",
      body: "Якщо ви це бачите — внутрішній канал працює.",
    } as never);
    setTestingChannel(null);
    if (error) {
      toast.error("Не вдалося надіслати тест");
      setLastTest((p) => ({ ...p, [channelId]: { at: new Date().toISOString(), ok: false } }));
      return;
    }
    setLastTest((p) => ({ ...p, [channelId]: { at: new Date().toISOString(), ok: true } }));
    toast.success("Тестове сповіщення надіслано — перевірте дзвіночок у хедері");
  };

  const requestPushPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const res = await Notification.requestPermission();
    setPushPermission(res);
    if (res === "granted") toast.success("Push-сповіщення дозволено");
    else if (res === "denied") toast.error("Дозвіл не надано — змініть у налаштуваннях браузера");
  };

  const handleStartPairing = async (provider: MessengerProvider) => {
    const res = await startPairing(provider);
    if (res.error) {
      toast.error("Не вдалося згенерувати код");
      return;
    }
    if (res.code && res.expiresAt) {
      setPairingDialog({ provider, code: res.code, expiresAt: res.expiresAt });
    }
  };

  const handleDisconnectMessenger = async (provider: MessengerProvider) => {
    const res = await disconnectMessenger(provider);
    if (res.error) toast.error("Не вдалося відключити");
    else toast.success("Відключено");
  };

  const handleCopyPairingCode = async () => {
    if (!pairingDialog) return;
    try {
      await navigator.clipboard.writeText(pairingDialog.code);
      toast.success("Код скопійовано");
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  };

  const getChannelIcon = (id: string) => {
    switch (id) {
      case "email": return <Mail className="w-4 h-4" />;
      case "push": return <Smartphone className="w-4 h-4" />;
      case "internal": return <Inbox className="w-4 h-4" />;
      case "telegram": return <Send className="w-4 h-4 text-[#0088cc]" />;
      case "viber": return <MessageCircle className="w-4 h-4 text-[#7360f2]" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (id: string) => {
    switch (id) {
      case "system": return <Bell className="w-4 h-4" />;
      case "deadlines": return <Clock className="w-4 h-4" />;
      case "events":
      case "event_reminder": return <CalendarClock className="w-4 h-4" />;
      case "ai": return <Brain className="w-4 h-4" />;
      case "risks": return <AlertTriangle className="w-4 h-4" />;
      case "team": return <Users className="w-4 h-4" />;
      case "mentions": return <MessageSquare className="w-4 h-4" />;
      case "tasks": return <CheckCircle2 className="w-4 h-4" />;
      case "integrations": return <LinkIcon className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const formatRelativeTime = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "щойно";
    if (minutes < 60) return `${minutes} хв тому`;
    if (hours < 24) return `${hours} год тому`;
    if (days === 1) return "вчора";
    if (days < 7) return `${days} дн тому`;
    return new Date(isoDate).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
  };

  // Real channel status resolver
  const resolveChannelMeta = (channel: NotificationChannel) => {
    if (channel.id === "internal") {
      return { status: "connected" as const, label: "Підключено", color: "bg-green-500", note: null as string | null, disabled: false };
    }
    if (channel.id === "push") {
      if (pushPermission === "unsupported") return { status: "error" as const, label: "Браузер не підтримує", color: "bg-destructive", note: null, disabled: true };
      if (pushPermission === "granted") return { status: "connected" as const, label: "Дозволено браузером", color: "bg-green-500", note: null, disabled: false };
      if (pushPermission === "denied") return { status: "error" as const, label: "Заблоковано в браузері", color: "bg-destructive", note: "Дозвольте сповіщення у налаштуваннях сайту в браузері", disabled: true };
      return { status: "not_connected" as const, label: "Дозвіл не надано", color: "bg-muted-foreground/30", note: null, disabled: false };
    }
    if (channel.id === "email") {
      if (!emailVerified) return { status: "error" as const, label: "Email не підтверджено", color: "bg-destructive", note: "Підтвердіть email у розділі «Безпека»", disabled: true };
      return { status: "connected" as const, label: userEmail || "Підключено", color: "bg-green-500", note: null, disabled: false };
    }
    // messengers — derive status from DB-backed connections
    const conn = messengerConnections[channel.id as MessengerProvider] ?? null;
    const dbStatus = conn?.status ?? "disconnected";
    if (dbStatus === "connected") {
      return {
        status: "connected" as const,
        label: conn?.external_username ? `@${conn.external_username}` : "Підключено",
        color: "bg-green-500",
        note: null,
        disabled: false,
      };
    }
    if (dbStatus === "pending") {
      return {
        status: "not_connected" as const,
        label: "Очікує підключення",
        color: "bg-warning",
        note: "Завершіть підключення в обраному месенджері або згенеруйте код знову",
        disabled: false,
      };
    }
    if (dbStatus === "error") {
      return {
        status: "error" as const,
        label: "Помилка підключення",
        color: "bg-destructive",
        note: "Спробуйте підключити заново",
        disabled: false,
      };
    }
    return {
      status: "not_connected" as const,
      label: "Не підключено",
      color: "bg-muted-foreground/30",
      note: null,
      disabled: false,
    };
  };

  const renderChannelCard = (channel: NotificationChannel) => {
    const isMessenger = channel.type === "messenger";
    const meta = resolveChannelMeta(channel);
    const enabled = prefs?.channels?.[channel.id as ChannelKey] ?? false;
    const isTesting = testingChannel === channel.id;
    const test = lastTest[channel.id];
    const switchDisabled = prefsLoading || meta.disabled || (isMessenger && meta.status === "not_connected");

    return (
      <div key={channel.id} className="flex flex-col gap-2 p-3 rounded-lg border bg-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isMessenger ? "bg-background border" : "bg-muted")}>
              {getChannelIcon(channel.id)}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-medium">{channel.label}</span>
                {channel.comingSoon && <Badge variant="secondary" className="text-[11px] px-1.5 py-0">Скоро</Badge>}
                {channel.isDemo && !channel.comingSoon && <Badge variant="secondary" className="text-[11px] px-1.5 py-0">Демо</Badge>}
              </div>
              {channel.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{channel.description}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", meta.color)} />
                <span>{meta.label}</span>
                {test?.ok && (
                  <span className="flex items-center gap-0.5">
                    · <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Тест {formatRelativeTime(test.at)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {channel.id === "push" && pushPermission === "default" && (
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={requestPushPermission}>
                Дозволити
              </Button>
            )}
            {isMessenger && (() => {
              const provider = channel.id as MessengerProvider;
              const conn = messengerConnections[provider];
              const dbStatus = conn?.status ?? "disconnected";
              const isBusy = busyProvider === provider;
              if (dbStatus === "connected") {
                return (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleDisconnectMessenger(provider)} disabled={isBusy}>
                    {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Відключити"}
                  </Button>
                );
              }
              if (dbStatus === "pending" && conn?.pairing_code) {
                return (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPairingDialog({ provider, code: conn.pairing_code!, expiresAt: conn.pairing_code_expires_at ?? "" })}>
                    Показати код
                  </Button>
                );
              }
              return (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleStartPairing(provider)}
                  disabled={isBusy}
                >
                  {isBusy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ExternalLink className="h-3 w-3 mr-1" />}
                  Підключити
                </Button>
              );
            })()}
            {channel.id === "internal" && meta.status === "connected" && (
              <Button variant="ghost" size="sm" onClick={() => handleTestChannel(channel.id)} disabled={isTesting} className="h-7 text-xs">
                {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Тест"}
              </Button>
            )}
            <Switch
              checked={enabled}
              onCheckedChange={() => toggleChannel(channel.id as ChannelKey)}
              disabled={switchDisabled}
            />
          </div>
        </div>

        {meta.note && (
          <p className="text-xs text-muted-foreground pl-10">{meta.note}</p>
        )}
        {isMessenger && meta.status === "not_connected" && channel.connectionHint && !meta.note && (
          <p className="text-xs text-muted-foreground pl-10">{channel.connectionHint}</p>
        )}
      </div>
    );
  };

  const basicChannels = notificationChannels.filter((c) => c.type === "basic");
  const messengerChannels = notificationChannels.filter((c) => c.type === "messenger");

  // Group types
  const groupedTypes = useMemo(() => {
    const groups: Record<NotificationTypeGroup, typeof notificationTypesConfig> = {
      work: [], ai_risks: [], team: [], system: [],
    };
    notificationTypesConfig.forEach((t) => groups[t.group].push(t));
    return groups;
  }, []);

  // Soft warnings
  const allTypesOff = useMemo(
    () => prefs ? Object.values(prefs.types).every((v) => !v) : false,
    [prefs]
  );
  const deadlinesOffButLeadSet = useMemo(
    () => prefs ? !prefs.types.deadlines && prefs.deadline_lead_days.length > 0 : false,
    [prefs]
  );
  const quietWithoutCriticalOverride = useMemo(
    () => prefs ? prefs.quiet_hours_enabled && !prefs.critical_overrides_quiet_hours : false,
    [prefs]
  );

  // Distinct cabinets in log
  const cabinetOptions = useMemo(() => {
    const set = new Set<string>();
    deliveryLog.forEach((e) => { if (e.cabinet_id) set.add(e.cabinet_id); });
    return Array.from(set);
  }, [deliveryLog]);

  // Filtered log
  const filteredLog = useMemo(() => {
    return deliveryLog.filter((e) => {
      const matchesStatus =
        logStatusFilter === "all" ||
        (logStatusFilter === "delivered") ||
        (logStatusFilter === "read" && !!e.read_at) ||
        (logStatusFilter === "unread" && !e.read_at);
      const matchesCabinet =
        logCabinetFilter === "all" ||
        (logCabinetFilter === "none" && !e.cabinet_id) ||
        e.cabinet_id === logCabinetFilter;
      const matchesSearch = !logSearch ||
        e.title.toLowerCase().includes(logSearch.toLowerCase()) ||
        (e.body ?? "").toLowerCase().includes(logSearch.toLowerCase());
      return matchesStatus && matchesCabinet && matchesSearch;
    });
  }, [deliveryLog, logStatusFilter, logCabinetFilter, logSearch]);

  return (
    <div className="space-y-4">
      {/* Onboarding banner */}
      <div className="flex gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
        <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-medium text-foreground">Що тут налаштовується?</p>
          <p className="text-muted-foreground leading-relaxed">
            Ці налаштування — <strong>персональні</strong> та діють у всіх ваших кабінетах: канали доставки, типи сповіщень, тихі години та lead-time дедлайнів.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Деталізація AI та командні події</strong> налаштовуються окремо в кожному кабінеті: <em>Кабінет → Налаштування → Сповіщення</em>.
          </p>
        </div>
      </div>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Швидкі пресети</CardTitle>
          <p className="text-xs text-muted-foreground">Застосуйте готовий профіль за 1 клік. Дію можна відмінити з тоста.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="outline" size="sm" disabled={!prefs || prefsSaving} onClick={() => applyPreset("all")} className="justify-start">
            <Sparkles className="w-4 h-4" />
            Усе ввімкнено
          </Button>
          <Button variant="outline" size="sm" disabled={!prefs || prefsSaving} onClick={() => applyPreset("critical")} className="justify-start">
            <Zap className="w-4 h-4" />
            Тільки критичне
          </Button>
          <Button variant="outline" size="sm" disabled={!prefs || prefsSaving} onClick={() => applyPreset("silence")} className="justify-start">
            <BellOff className="w-4 h-4" />
            Тиша
          </Button>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Тихі години
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Не турбувати у вказаний період. Стосується push, email та внутрішніх нагадувань.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-md border">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Не турбувати у вказаний період</span>
              {prefs?.quiet_hours_enabled && (
                <span className="text-xs text-muted-foreground">
                  З {toHHMM(prefs.quiet_hours_start)} до {toHHMM(prefs.quiet_hours_end)} нагадування не надсилаються
                </span>
              )}
            </div>
            <Switch
              checked={!!prefs?.quiet_hours_enabled}
              disabled={prefsLoading}
              onCheckedChange={(v) => {
                if (!prefs) return;
                updatePrefs({ quiet_hours_enabled: v }).then((r) => {
                  if (!r.error) toast.success(v ? "Тихі години увімкнено" : "Тихі години вимкнено");
                });
              }}
            />
          </div>

          {prefs?.quiet_hours_enabled && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Початок</label>
                  <Input
                    type="time"
                    value={toHHMM(prefs.quiet_hours_start)}
                    onChange={(e) => scheduleSave({ quiet_hours_start: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Кінець</label>
                  <Input
                    type="time"
                    value={toHHMM(prefs.quiet_hours_end)}
                    onChange={(e) => scheduleSave({ quiet_hours_end: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Часовий пояс</label>
                  <Select value={prefs.timezone} disabled>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Kyiv">Europe/Kyiv (GMT+2/+3)</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-[11px] text-muted-foreground">Інші часові пояси — скоро</span>
                </div>
              </div>

              <label className="flex items-start gap-2 p-2.5 rounded-md border cursor-pointer hover:bg-muted/50">
                <Checkbox
                  checked={!!prefs.critical_overrides_quiet_hours}
                  onCheckedChange={(v) => {
                    updatePrefs({ critical_overrides_quiet_hours: !!v }).then((r) => {
                      if (!r.error) toast.success("Збережено");
                    });
                  }}
                  className="mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Пропускати тихі години для критичних</span>
                  <span className="text-xs text-muted-foreground">
                    Терміни сплати податків та інші критичні події (≤15 хв до дедлайну) приходитимуть навіть у тихий період
                  </span>
                </div>
              </label>

              {quietWithoutCriticalOverride && (
                <Alert className="border-warning/40 bg-warning/5">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <AlertDescription className="text-xs">
                    Тихі години увімкнено, але критичні події не пропускаються. Ви можете пропустити термінову подію (наприклад, дедлайн ДПС за 15 хв).
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
          {prefsSaving && <p className="text-[11px] text-muted-foreground">Збереження…</p>}
        </CardContent>
      </Card>

      {/* Basic channels */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Канали сповіщень</CardTitle>
          <p className="text-xs text-muted-foreground">Куди доставляти сповіщення. Статус показує реальну готовність каналу.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {basicChannels.map(renderChannelCard)}
        </CardContent>
      </Card>

      {/* Messengers */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Месенджери</CardTitle>
            <Badge variant="outline" className="text-xs font-normal">Рекомендовано</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Отримуйте сповіщення миттєво у звичних месенджерах</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {messengerChannels.map(renderChannelCard)}
        </CardContent>
      </Card>

      {/* Notification Types — grouped */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Типи сповіщень</CardTitle>
          <p className="text-xs text-muted-foreground">Вимкнені типи не приходитимуть жодним каналом</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {allTypesOff && (
            <Alert className="border-warning/40 bg-warning/5">
              <BellOff className="w-4 h-4 text-warning" />
              <AlertDescription className="text-xs">
                Усі типи вимкнено — ви не отримуватимете жодних сповіщень. Це нормально?
              </AlertDescription>
            </Alert>
          )}
          {deadlinesOffButLeadSet && (
            <Alert className="border-warning/40 bg-warning/5">
              <Info className="w-4 h-4 text-warning" />
              <AlertDescription className="text-xs">
                Тип «Дедлайни» вимкнено, але lead-time налаштовано — ці нагадування не надсилатимуться.
              </AlertDescription>
            </Alert>
          )}

          {(Object.keys(groupedTypes) as NotificationTypeGroup[]).map((group) => {
            const list = groupedTypes[group];
            if (!list.length) return null;
            return (
              <div key={group} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-semibold">{notificationGroupLabels[group]}</h4>
                  <span className="text-[11px] text-muted-foreground">{notificationGroupDescriptions[group]}</span>
                </div>
                <div className="space-y-1.5">
                  {list.map((type) => {
                    const enabled = prefs?.types?.[type.id as TypeKey] ?? true;
                    const isDeadlines = type.id === "deadlines";
                    const isAi = type.id === "ai";
                    return (
                      <div key={type.id} className="rounded-md border">
                        <div className="flex items-start justify-between gap-3 p-2.5">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                              {getTypeIcon(type.id)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium">{type.label}</div>
                              <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                              {isAi && (
                                <button
                                  type="button"
                                  onClick={() => { window.location.href = "/dashboard?tab=cabinets"; }}
                                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                                >
                                  Деталізація AI у кабінетах
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <Switch
                            checked={enabled}
                            disabled={prefsLoading}
                            onCheckedChange={() => toggleType(type.id as TypeKey)}
                          />
                        </div>

                        {isDeadlines && enabled && prefs && (
                          <div className="px-2.5 pb-2.5 pt-1 border-t bg-muted/30">
                            <div className="flex items-baseline justify-between mb-1.5">
                              <p className="text-[11px] text-muted-foreground">Коли нагадувати про дедлайн:</p>
                              <p className="text-[11px] text-muted-foreground">
                                Обрано {prefs.deadline_lead_days.length} → {prefs.deadline_lead_days.length} нагадувань на кожен дедлайн
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {LEAD_OPTIONS.map((opt) => {
                                const active = prefs.deadline_lead_days.includes(opt.days);
                                return (
                                  <button
                                    key={opt.days}
                                    type="button"
                                    onClick={() => toggleLeadDay(opt.days)}
                                    className={cn(
                                      "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                                      active
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-muted border-border"
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Delivery Log */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              Журнал сповіщень
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {filteredLog.length} з {deliveryLog.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Останні 50 внутрішніх сповіщень — оновлюються в реальному часі</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Пошук..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Select value={logStatusFilter} onValueChange={setLogStatusFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі</SelectItem>
                <SelectItem value="delivered">Доставлено</SelectItem>
                <SelectItem value="unread">Непрочитані</SelectItem>
                <SelectItem value="read">Прочитані</SelectItem>
              </SelectContent>
            </Select>
            {cabinetOptions.length > 0 && (
              <Select value={logCabinetFilter} onValueChange={setLogCabinetFilter}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue placeholder="Кабінет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі кабінети</SelectItem>
                  <SelectItem value="none">Без кабінету</SelectItem>
                  {cabinetOptions.map((cid) => (
                    <SelectItem key={cid} value={cid}>{cid}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <ScrollArea className="h-[280px]">
            <div className="space-y-2 pr-3">
              {logLoading ? (
                <div className="text-center py-8 text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Завантаження…
                </div>
              ) : filteredLog.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Сповіщень ще немає
                </div>
              ) : (
                filteredLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-1 p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <Inbox className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{entry.title}</p>
                          {entry.body && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{entry.body}</p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[11px] px-1.5 py-0 gap-1 shrink-0",
                          entry.read_at
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {entry.read_at ? "Прочитано" : "Нове"}
                      </Badge>
                    </div>
                    <div className="pl-9 text-[11px] text-muted-foreground">
                      {formatRelativeTime(entry.created_at)}
                      {entry.severity === "critical" && (
                        <span className="ml-2 text-destructive">· критичне</span>
                      )}
                      {entry.cabinet_id && (
                        <span className="ml-2">· кабінет {entry.cabinet_id}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Info Note + deep-link */}
      <div className="flex items-start gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
        <Bell className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>
            <span className="font-medium text-foreground">Примітка:</span>{" "}
            Тут — глобальні налаштування. Деталі (кому з команди, в які кабінетні чати) — у налаштуваннях кабінету.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs shrink-0"
            onClick={() => {
              window.location.href = "/dashboard?tab=cabinets";
            }}
          >
            Відкрити список кабінетів
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Pairing dialog */}
      <Dialog open={!!pairingDialog} onOpenChange={(open) => { if (!open) setPairingDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Підключення {pairingDialog?.provider === "telegram" ? "Telegram" : "Viber"}
            </DialogTitle>
            <DialogDescription>
              Надішліть цей одноразовий код нашому боту, щоб завершити підключення. Код діє 15 хвилин.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4 flex items-center justify-between gap-3">
              <code className="text-2xl font-mono font-semibold tracking-widest">{pairingDialog?.code}</code>
              <Button variant="outline" size="sm" onClick={handleCopyPairingCode}>
                <Copy className="w-4 h-4 mr-1" />
                Копіювати
              </Button>
            </div>
            <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Що робити далі:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                {pairingDialog?.provider === "telegram" ? (
                  <>
                    <li>Відкрийте бота <span className="font-medium">@AIBuhgalterBot</span> у Telegram</li>
                    <li>Надішліть команду <code className="px-1 rounded bg-muted">/start {pairingDialog?.code}</code></li>
                    <li>Сторінка оновиться автоматично після підключення</li>
                  </>
                ) : (
                  <>
                    <li>Відкрийте паблік-акаунт <span className="font-medium">aibuhgalter</span> у Viber</li>
                    <li>Надішліть код повідомленням</li>
                    <li>Сторінка оновиться автоматично після підключення</li>
                  </>
                )}
              </ol>
              <p className="pt-1 text-[11px]">
                Бот-flow для месенджерів у розробці — поки що рядок створено в БД, але автоматичне підтвердження буде додано пізніше.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (pairingDialog) handleDisconnectMessenger(pairingDialog.provider);
                setPairingDialog(null);
              }}
            >
              Скасувати
            </Button>
            <Button onClick={() => setPairingDialog(null)}>Готово</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsSection;
