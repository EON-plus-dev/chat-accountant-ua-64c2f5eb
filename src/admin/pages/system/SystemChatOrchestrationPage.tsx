import { SystemPageShell } from "./SystemPageShell";
import { MOCK_CHAT_SCENARIOS } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";

const TONE_LABEL = { formal: "Формальний", friendly: "Дружній", neutral: "Нейтральний" } as const;

export default function SystemChatOrchestrationPage() {
  const [globalSafe, setGlobalSafe] = useState(false);
  const [tone, setTone] = useState<"formal" | "friendly" | "neutral">("friendly");

  return (
    <SystemPageShell
      title="Chat-оркестрація"
      description="Каталог сценаріїв AI-чату: інтент → дія → вкладка UI. Глобальні політики тону і Safe-mode."
    >
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <div>
                <Label className="text-sm">Глобальний Safe-mode</Label>
                <div className="text-xs text-muted-foreground">AI лише пропонує дії, не виконує автоматично</div>
              </div>
            </div>
            <Switch checked={globalSafe} onCheckedChange={setGlobalSafe} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-sm">Тон голосу:</Label>
            {(["formal", "friendly", "neutral"] as const).map((t) => (
              <Badge
                key={t}
                variant="outline"
                className={`cursor-pointer ${tone === t ? "bg-primary text-primary-foreground border-primary" : ""}`}
                onClick={() => setTone(t)}
              >
                {TONE_LABEL[t]}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm font-semibold mt-4">Сценарії оркестратора (Intent → UI-вкладка)</div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {MOCK_CHAT_SCENARIOS.map((s) => (
              <div key={s.id} className="p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{s.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{s.intent}</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/30">{s.uiTab}</Badge>
                  {s.safeMode && (
                    <Badge variant="outline" className="text-[10px] bg-sky-500/15 text-sky-700 border-sky-500/30 ml-auto">
                      Safe-mode
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">{TONE_LABEL[s.tone]}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Тригери: {s.triggers.map((t) => <code key={t} className="bg-muted px-1 rounded mr-1">{t}</code>)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
