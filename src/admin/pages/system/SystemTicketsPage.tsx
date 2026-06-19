import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_TICKETS } from "@/admin/system/data/mocks";
import { MessageSquare, Phone, Mail } from "lucide-react";

const CHANNEL_ICON = { chat: MessageSquare, voice: Phone, email: Mail } as const;
const PRIO: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  med: "bg-sky-500/15 text-sky-700 border-sky-500/30",
  high: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  urgent: "bg-rose-500/15 text-rose-700 border-rose-500/30",
};
const STATUS: Record<string, string> = {
  new: "Новий",
  in_progress: "В роботі",
  resolved: "Вирішений",
};

export default function SystemTicketsPage() {
  return (
    <SystemPageShell title="Тікети підтримки" description="Канали: чат / телефонія / email. Пріоритет і SLA, привʼязка до кабінету.">
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {MOCK_TICKETS.map((t) => {
              const Icon = CHANNEL_ICON[t.channel];
              return (
                <div key={t.id} className="flex items-center gap-3 p-3">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.subject}</div>
                    <div className="text-xs text-muted-foreground">{t.cabinet} · SLA {t.sla}</div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${PRIO[t.priority]}`}>{t.priority.toUpperCase()}</Badge>
                  <Badge variant="outline" className="text-[10px]">{STATUS[t.status]}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
