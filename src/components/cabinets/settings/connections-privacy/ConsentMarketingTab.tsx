import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Sparkles, BarChart3 } from "lucide-react";
import { useConsents, type GlobalConsents } from "@/modules/network/hooks/useConsentLog";

interface Row {
  key: keyof GlobalConsents;
  label: string;
  hint?: string;
  recommended?: boolean;
}

const NOTIFY: Row[] = [
  { key: "notifyVisitReminders", label: "Нагадування про візити", hint: "Важливе — рекомендовано", recommended: true },
  { key: "notifyMyPlacesPromos", label: "Промо від моїх закладів" },
  { key: "notifyNewPlacesPromos", label: "Промо нових закладів у каталозі" },
  { key: "notifyPlatformEmail", label: "Email-розсилка від платформи" },
];

const PERSONAL: Row[] = [
  { key: "aiAnalyzeOrders", label: "Дозволити AI аналізувати мої замовлення для рекомендацій" },
  { key: "showSimilarPlaces", label: "Показувати схожі заклади на основі підписок" },
];

const ANALYTICS: Row[] = [
  { key: "anonymousUsageStats", label: "Анонімна статистика використання", hint: "Допомагає покращити продукт" },
];

export function ConsentMarketingTab() {
  const { consents, set, log } = useConsents();

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Глобальні згоди — діють як «верхній рубильник» поверх дозволів окремих підписок.
        Зміни записуються у журнал згод (GDPR Art. 7).
      </div>

      <Section icon={<Bell className="h-4 w-4" />} title="Сповіщення" rows={NOTIFY} consents={consents} set={set} />
      <Section icon={<Sparkles className="h-4 w-4" />} title="Персоналізація" rows={PERSONAL} consents={consents} set={set} />
      <Section icon={<BarChart3 className="h-4 w-4" />} title="Аналітика" rows={ANALYTICS} consents={consents} set={set} />

      <Card className="border-border/70">
        <CardContent className="p-3 space-y-2">
          <div className="text-sm font-medium">Журнал згод</div>
          {log.length === 0 ? (
            <div className="text-xs text-muted-foreground">Поки що змін не було.</div>
          ) : (
            <ul className="space-y-1 text-xs text-muted-foreground max-h-48 overflow-y-auto">
              {log.slice(0, 20).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    <span className="text-foreground">{e.key}</span> → {e.value ? "увімкнено" : "вимкнено"}
                  </span>
                  <span className="shrink-0 tabular-nums">{fmt(e.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Section({
  icon, title, rows, consents, set,
}: {
  icon: React.ReactNode;
  title: string;
  rows: Row[];
  consents: GlobalConsents;
  set: (k: keyof GlobalConsents, v: boolean) => void;
}) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-primary">{icon}</span>
          {title}
        </div>
        <Separator />
        {rows.map((r) => (
          <label key={r.key} className="flex items-start justify-between gap-3 cursor-pointer">
            <div className="min-w-0">
              <div className="text-sm">{r.label}</div>
              {r.hint && <div className="text-[11px] text-muted-foreground">{r.hint}</div>}
            </div>
            <Switch checked={consents[r.key]} onCheckedChange={(v) => set(r.key, v)} />
          </label>
        ))}
      </CardContent>
    </Card>
  );
}

function fmt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch { return iso; }
}
