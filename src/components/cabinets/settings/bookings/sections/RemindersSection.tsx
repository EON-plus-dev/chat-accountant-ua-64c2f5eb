import { useState } from "react";
import { Bell, MessageSquare, Phone, Cake, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Cabinet } from "@/types/cabinet";
import { getSettingsSectionLabel } from "@/core";
import { SectionShell, ComingSoonNote } from "../shared/SectionShell";

const PLACEHOLDERS = ["{ім'я}", "{послуга}", "{майстер}", "{час}", "{дата}", "{адреса}"];

interface Template {
  id: string;
  label: string;
  hint: string;
  enabled: boolean;
  body: string;
  icon: typeof Bell;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "reminder-24h",
    label: "Нагадування за 24 год",
    hint: "Запит підтвердження запису",
    enabled: true,
    body: "Доброго дня, {ім'я}! Нагадуємо: {дата} о {час} — {послуга} у {майстер}. Підтвердіть, будь ласка: так/ні.",
    icon: Bell,
  },
  {
    id: "reminder-2h",
    label: "Нагадування за 2 год",
    hint: "Фінальне нагадування",
    enabled: true,
    body: "{ім'я}, чекаємо вас за 2 години — {час}. Адреса: {адреса}. До зустрічі!",
    icon: Bell,
  },
  {
    id: "birthday",
    label: "Привітання з ДН",
    hint: "−20% на послугу протягом тижня",
    enabled: true,
    body: "З Днем Народження, {ім'я}! 🎉 Дарунок від салону — −20% на будь-яку послугу протягом тижня.",
    icon: Cake,
  },
  {
    id: "reactivation",
    label: "Реактивація «60+ днів»",
    hint: "Клієнт не приходив > 60 днів",
    enabled: false,
    body: "{ім'я}, ми скучили! Запрошуємо на улюблену послугу — і −10% від нас.",
    icon: Heart,
  },
];

export function RemindersSection({ cabinet }: { cabinet: Cabinet }) {
  const [channel, setChannel] = useState<"sms" | "viber" | "telegram">("viber");
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);

  const label = getSettingsSectionLabel(cabinet, "reminders", {
    title: "Нагадування клієнтам",
    description: "Автоматичні повідомлення для клієнтів. Шаблони з плейсхолдерами заповнюються даними запису.",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
    >
      <Card>
        <CardContent className="p-3 space-y-2">
          <Label className="text-sm font-medium">Канал відправки</Label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "sms", label: "SMS", icon: Phone },
              { id: "viber", label: "Viber-бот", icon: MessageSquare },
              { id: "telegram", label: "Telegram-бот", icon: MessageSquare },
            ].map((c) => {
              const Icon = c.icon;
              const active = channel === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChannel(c.id as typeof channel)}
                  className={`px-3 h-9 rounded-md border text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted/60 border-border"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {c.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Підключення каналу — у розділі «Інтеграції салону».
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Шаблони</h4>
        {templates.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.id}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <Label className="text-sm font-medium">{t.label}</Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t.hint}</p>
                    </div>
                  </div>
                  <Switch
                    checked={t.enabled}
                    onCheckedChange={(v) =>
                      setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, enabled: v } : x)))
                    }
                  />
                </div>
                {t.enabled && (
                  <Textarea
                    value={t.body}
                    onChange={(e) =>
                      setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, body: e.target.value } : x)))
                    }
                    rows={2}
                    className="text-sm resize-none"
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-md bg-muted/30 border">
        <span className="text-[11px] text-muted-foreground mr-1">Доступні плейсхолдери:</span>
        {PLACEHOLDERS.map((p) => (
          <Badge key={p} variant="outline" className="text-[10px] font-mono">
            {p}
          </Badge>
        ))}
      </div>
    </SectionShell>
  );
}
