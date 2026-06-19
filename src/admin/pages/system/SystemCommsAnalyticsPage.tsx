import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_COMMS_ANALYTICS } from "@/admin/system/data/mocks";
import { Flame } from "lucide-react";

export default function SystemCommsAnalyticsPage() {
  const { topQueries, selfResolved, escalated, hotTopics } = MOCK_COMMS_ANALYTICS;
  return (
    <SystemPageShell title="Аналітика комунікацій" description="Топ-запити, % самовирішень, % ескалацій, гарячі теми.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Самовирішено AI</div><div className="text-2xl font-semibold mt-1">{selfResolved}%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Ескалації</div><div className="text-2xl font-semibold mt-1">{escalated}%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Топ-канал</div><div className="text-2xl font-semibold mt-1">Chat</div></CardContent></Card>
      </div>

      <div className="text-sm font-semibold mt-4">Топ-запити</div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {topQueries.map((q) => (
              <div key={q.q} className="flex items-center gap-3 p-3">
                <Badge variant="outline" className="text-[10px]">{q.channel}</Badge>
                <div className="flex-1 text-sm">{q.q}</div>
                <div className="text-sm font-mono tabular-nums">{q.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm font-semibold mt-4">Гарячі теми тижня</div>
      <Card>
        <CardContent className="p-3 flex flex-wrap gap-2">
          {hotTopics.map((t) => (
            <Badge key={t} variant="outline" className="text-xs bg-amber-500/15 text-amber-700 border-amber-500/30">
              <Flame className="h-3 w-3 mr-1" /> {t}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
