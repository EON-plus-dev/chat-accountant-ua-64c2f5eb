import { useState } from "react";
import { SystemPageShell } from "./SystemPageShell";
import { MOCK_EVENTS, MOCK_RULES, type PlatformRuleMock } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, Shield, GitBranch, Sparkles, CheckCircle2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { toast } from "@/hooks/use-toast";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  disabled: "bg-muted text-muted-foreground",
};

export default function SystemRulesLabPage() {
  const [selectedRule, setSelectedRule] = useState<PlatformRuleMock>(MOCK_RULES[0]);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const runTest = () => {
    setRunning(true);
    setLog([]);
    const trigger = MOCK_EVENTS.find((e) => e.id === selectedRule.trigger);
    const steps = [
      `→ Тригер: ${trigger?.name ?? selectedRule.trigger}`,
      `→ Payload: ${JSON.stringify(trigger?.examplePayload ?? {})}`,
      `→ Перевірка умов (${selectedRule.conditions.length})…`,
      ...selectedRule.conditions.map((c) => `   ✓ ${c}`),
      `→ Виконання дій (${selectedRule.actions.length})…`,
      ...selectedRule.actions.map((a) => `   ✓ ${a}`),
      selectedRule.safeMode ? "⚠ Safe-mode: AI лише пропонує, без автогенерації." : "✓ Дії виконано.",
      "✅ Симуляцію завершено успішно.",
    ];
    let i = 0;
    const t = setInterval(() => {
      setLog((arr) => [...arr, steps[i]]);
      i++;
      if (i >= steps.length) {
        clearInterval(t);
        setRunning(false);
        toast({ title: "Тест успішний", description: `Правило «${selectedRule.name}» симульовано без помилок.` });
      }
    }, 220);
  };

  return (
    <SystemPageShell
      title="Rules & Testing Studio"
      description="IF→THEN правила оркестратора з версіонуванням, safe-mode і тестовою лабораторією. AI Rules Assistant для нормативних оновлень — в окремому розділі."
      actions={
        <NavLink to="/admin/system/rules/assistant">
          <Button size="sm" variant="outline">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> AI Rules Assistant
          </Button>
        </NavLink>
      }
    >
      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Правила ({MOCK_RULES.length})</TabsTrigger>
          <TabsTrigger value="events">Події ({MOCK_EVENTS.length})</TabsTrigger>
          <TabsTrigger value="lab">Test Lab</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-2 mt-4">
          {MOCK_RULES.map((r) => (
            <Card key={r.id} className={selectedRule.id === r.id ? "border-primary/60" : ""}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{r.name}</span>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[r.status]}`}>{r.status}</Badge>
                  {r.safeMode && (
                    <Badge variant="outline" className="text-[10px] bg-sky-500/15 text-sky-700 border-sky-500/30">
                      <Shield className="h-2.5 w-2.5 mr-1" /> Safe-mode
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    <GitBranch className="h-2.5 w-2.5 mr-1" /> v{r.version}
                  </Badge>
                  <Button
                    size="sm"
                    variant={selectedRule.id === r.id ? "default" : "outline"}
                    className="h-7 ml-auto"
                    onClick={() => setSelectedRule(r)}
                  >
                    Обрати для тесту
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Тригер: <code className="text-[11px] bg-muted px-1 rounded">{r.trigger}</code> · Кабінети: {r.appliesTo.join(", ")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-medium mb-1">Умови:</div>
                    <ul className="space-y-0.5 ml-1">
                      {r.conditions.map((c) => <li key={c}>· {c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Дії:</div>
                    <ul className="space-y-0.5 ml-1">
                      {r.actions.map((a) => <li key={a}>· {a}</li>)}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-2 mt-4">
          {MOCK_EVENTS.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] capitalize">{e.category}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.description}</div>
                </div>
                <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{e.id}</code>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="lab" className="mt-4 space-y-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm">Обране правило:</span>
                <Badge variant="outline" className="text-xs">{selectedRule.name}</Badge>
                <Button size="sm" onClick={runTest} disabled={running} className="ml-auto">
                  <Play className="h-3.5 w-3.5 mr-1" />
                  {running ? "Виконується…" : "Запустити тест"}
                </Button>
              </div>
              <div className="rounded-md border bg-muted/30 p-3 font-mono text-[11px] min-h-[160px] whitespace-pre-wrap">
                {log.length === 0 ? (
                  <span className="text-muted-foreground">Натисніть «Запустити тест», щоб симулювати правило з прикладом payload.</span>
                ) : (
                  log.map((line, i) => <div key={i}>{line}</div>)
                )}
              </div>
              {!running && log.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Можна запропонувати staged rollout у AI Rules Assistant.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SystemPageShell>
  );
}
