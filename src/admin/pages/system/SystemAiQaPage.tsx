import { useState } from "react";
import { SystemPageShell } from "./SystemPageShell";
import { MOCK_AI_QA, type AiQaDialogMock } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Phone, Flag, CheckCircle2, Wrench } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const FLAG_LABEL: Record<string, string> = {
  fact_error: "Помилка факту",
  missing_context: "Не вистачає контексту",
  risky: "Ризикована рекомендація",
  bad_tone: "Поганий тон",
};

export default function SystemAiQaPage() {
  const [items, setItems] = useState<AiQaDialogMock[]>(MOCK_AI_QA);
  const [filter, setFilter] = useState<"all" | "needs_fix" | "pending">("all");

  const list = items.filter((i) => filter === "all" || i.status === filter);
  const counts = {
    all: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    needs_fix: items.filter((i) => i.status === "needs_fix").length,
  };

  const mark = (id: string, next: AiQaDialogMock["status"]) => {
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, status: next } : x)));
    toast({ title: "Статус оновлено", description: "Демо-маркування зафіксовано локально." });
  };

  return (
    <SystemPageShell
      title="AI QA — Якість діалогів"
      description="Черга діалогів чату й телефонії з маркуванням «помилка факту / контекст / ризик / тон» і ескалацією до бази знань."
    >
      <div className="flex items-center gap-2">
        {(["all", "pending", "needs_fix"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="h-8"
          >
            {f === "all" ? "Усі" : f === "pending" ? "На перевірці" : "Потребують виправлення"}
            <Badge variant="secondary" className="ml-2 text-[10px]">{counts[f]}</Badge>
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map((d) => {
          const ChannelIcon = d.channel === "voice" ? Phone : Bot;
          return (
            <Card key={d.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <ChannelIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{d.channel === "voice" ? "Voice" : "Chat"}</span>
                  <Badge variant="outline" className="text-[10px]">{d.intent}</Badge>
                  <Badge variant="outline" className="text-[10px]">кабінет {d.cabinetId}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(d.createdAt).toLocaleString("uk-UA")}</span>
                </div>
                <p className="text-sm">{d.preview}</p>
                {d.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {d.flags.map((f) => (
                      <Badge key={f} className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                        <Flag className="h-2.5 w-2.5 mr-1" />
                        {FLAG_LABEL[f]}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <Badge
                    className={`text-[10px] ${
                      d.status === "ok"
                        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                        : d.status === "needs_fix"
                          ? "bg-rose-500/15 text-rose-700 border-rose-500/30"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {d.status === "ok" ? "OK" : d.status === "needs_fix" ? "До виправлення" : "На перевірці"}
                  </Badge>
                  <div className="ml-auto flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => mark(d.id, "ok")}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> OK
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => mark(d.id, "needs_fix")}>
                      <Wrench className="h-3 w-3 mr-1" /> Передати в базу знань
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SystemPageShell>
  );
}
