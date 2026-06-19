import { useState } from "react";
import { SystemPageShell } from "./SystemPageShell";
import { MOCK_REGULATORY, MOCK_REGULATORY_PROPOSALS, type RegulatoryUpdateMock } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, XCircle, FlaskConical, Rocket, ShieldAlert, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LIFECYCLE = [
  "Виявлено зміну",
  "AI запропонував",
  "На перевірці",
  "Погоджено",
  "Тестування",
  "Готово",
  "Розгорнуто",
] as const;

const STAGE_IDX: Record<RegulatoryUpdateMock["stage"], number> = {
  detected: 0, ai_proposed: 1, in_review: 2, approved: 3, testing: 4, ready: 5, deployed: 6,
};

const ROLLOUT = ["Пісочниця", "Пілотна група", "Поступове", "Повний реліз"] as const;
const RISK_CLASS = { low: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", medium: "bg-amber-500/15 text-amber-700 border-amber-500/30", high: "bg-rose-500/15 text-rose-700 border-rose-500/30" };

export default function SystemRulesAssistantPage() {
  const [selected, setSelected] = useState<RegulatoryUpdateMock>(MOCK_REGULATORY[0]);
  const [rollout, setRollout] = useState(0);
  const proposal = MOCK_REGULATORY_PROPOSALS[selected.id];
  const stageIdx = STAGE_IDX[selected.stage];

  return (
    <SystemPageShell
      title="AI Rules Assistant"
      description="AI пропонує правила за нормативними оновленнями, методолог затверджує, запускається тест і staged rollout."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Стрічка регуляторики */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Стрічка регуляторики</div>
          {MOCK_REGULATORY.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className={`w-full text-left rounded-lg border p-3 transition-all ${selected.id === r.id ? "border-primary/60 bg-primary/5" : "border-border/60 hover:border-primary/30"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-3 w-3 text-amber-600" />
                <Badge variant="outline" className={`text-[10px] ${RISK_CLASS[r.riskLevel]}`}>{r.riskLevel}</Badge>
                <Badge variant="outline" className="text-[10px] ml-auto">v.{r.stage}</Badge>
              </div>
              <div className="text-sm font-medium">{r.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(r.date).toLocaleDateString("uk-UA")} · {r.affects.join(", ").toUpperCase()}</div>
            </button>
          ))}
        </div>

        {/* Деталі пропозиції */}
        <div className="space-y-4">
          {/* Lifecycle */}
          <Card>
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-muted-foreground mb-3">Життєвий цикл</div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {LIFECYCLE.map((s, i) => (
                  <div key={s} className="flex items-center gap-1 shrink-0">
                    <div className={`px-2 py-1 rounded text-[11px] ${i <= stageIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
                    {i < LIFECYCLE.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Опис зміни</div>
                <div className="text-sm">{selected.summary}</div>
              </div>

              {proposal && (
                <>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Змінювані параметри</div>
                    <ul className="text-sm space-y-0.5">
                      {proposal.affectedParams.map((p) => <li key={p}>· {p}</li>)}
                    </ul>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Проєкт правила (diff)</div>
                    <div className="rounded-md border bg-muted/30 p-2 font-mono text-[11px] space-y-1">
                      <div className="text-rose-600">− {proposal.ruleDiff.before}</div>
                      <div className="text-emerald-600">+ {proposal.ruleDiff.after}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {proposal.recommendedSafeMode && (
                      <Badge variant="outline" className="bg-sky-500/15 text-sky-700 border-sky-500/30">
                        <ShieldAlert className="h-3 w-3 mr-1" /> Рекомендований Safe-mode
                      </Badge>
                    )}
                    <span className="text-muted-foreground">Вплив на UI: {proposal.uiImpact}</span>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Запропоновані тест-кейси</div>
                    <ul className="text-sm space-y-0.5">
                      {proposal.testCases.map((t) => <li key={t}>· {t}</li>)}
                    </ul>
                  </div>
                </>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button size="sm" onClick={() => toast({ title: "Погоджено методологом", description: selected.title })}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Погодити
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Відхилено", description: selected.title, variant: "destructive" })}>
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Відхилити
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Тести запущено в Test Lab" })}>
                  <FlaskConical className="h-3.5 w-3.5 mr-1" /> Запустити тести
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Staged rollout */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground">Staged rollout</div>
              <div className="flex items-center gap-1">
                {ROLLOUT.map((r, i) => (
                  <div key={r} className="flex items-center gap-1 flex-1">
                    <button
                      onClick={() => setRollout(i)}
                      className={`flex-1 px-2 py-1.5 rounded text-[11px] border ${i <= rollout ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}
                    >
                      {r}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Поточна стадія: <b>{ROLLOUT[rollout]}</b></span>
                <Button size="sm" onClick={() => { setRollout(Math.min(rollout + 1, 3)); toast({ title: `Перехід → ${ROLLOUT[Math.min(rollout + 1, 3)]}` }); }} disabled={rollout >= 3}>
                  <Rocket className="h-3.5 w-3.5 mr-1" /> Перейти на наступний етап
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SystemPageShell>
  );
}
