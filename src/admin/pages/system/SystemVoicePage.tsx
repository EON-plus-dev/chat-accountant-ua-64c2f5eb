import { SystemPageShell } from "./SystemPageShell";
import { MOCK_VOICE_SCENARIOS } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PhoneCall, Languages, Mic } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function SystemVoicePage() {
  const [recordAll, setRecordAll] = useState(true);

  return (
    <SystemPageShell
      title="AI-Телефонія"
      description="IVR-сценарії з AI: ліміти ФОП, банк, декларації. Тестовий дзвінок (демо), запис розмов і комплаєнс."
    >
      <Card>
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Mic className="h-4 w-4 text-rose-600" />
            <div>
              <div className="text-sm font-medium">Запис усіх дзвінків (демо)</div>
              <div className="text-xs text-muted-foreground">Інформування абонента + транскрипти зберігаються 90 днів</div>
            </div>
          </div>
          <Switch checked={recordAll} onCheckedChange={setRecordAll} />
        </CardContent>
      </Card>

      <div className="text-sm font-semibold mt-4">Сценарії дзвінків</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MOCK_VOICE_SCENARIOS.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{s.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-mono">{s.intent}</Badge>
                <Badge variant="outline" className="text-[10px]"><Languages className="h-2.5 w-2.5 mr-1" />{s.language}</Badge>
                {s.recordCall && <Badge variant="outline" className="text-[10px] bg-rose-500/15 text-rose-700 border-rose-500/30">REC</Badge>}
              </div>
              <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                {s.steps.map((st) => <li key={st}>{st}</li>)}
              </ol>
              <Button size="sm" variant="outline" className="w-full" onClick={() => toast({ title: "Запущено тестовий дзвінок (демо)", description: s.name })}>
                <PhoneCall className="h-3.5 w-3.5 mr-1" /> Тестовий дзвінок
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </SystemPageShell>
  );
}
