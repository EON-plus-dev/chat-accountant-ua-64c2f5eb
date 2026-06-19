// /os/scenarios — галерея кейсів.
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { osScenariosByAudience } from "@/os/config/osScenarios";
import { useAudience } from "@/contexts/AudienceContext";
import { Section } from "@/os/blocks/SectionShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OsScenariosIndexPage() {
  const { audience } = useAudience();
  const items = osScenariosByAudience(audience);
  return (
    <>
      <Section
        eyebrow="Сценарії"
        title={audience === "business" ? "Готові набори під ваш бізнес" : "Готові набори під ваше життя"}
        intro="Не «лист можливостей», а конкретні ролі з реальними даними у демо-кабінеті. Відкривайте — і дивіться зсередини."
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((s) => (
            <Card
              key={s.id}
              className="group flex flex-col overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="relative h-32 bg-gradient-to-br from-primary/[0.08] via-primary/[0.04] to-transparent border-b border-border/40 flex items-end p-5">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-primary/80 font-medium mb-1">{s.vertical}</div>
                  <div className="font-semibold text-lg tracking-tight">{s.title}</div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs text-muted-foreground mb-4">{s.persona}</div>
                <ul className="space-y-1.5 mb-5 flex-1">
                  {s.outcomes.slice(0, 3).map((o) => (
                    <li key={o} className="flex items-start gap-1.5 text-xs">
                      <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <Link to={`/os/scenarios/${s.id}`} className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline">
                    Відкрити кейс <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to={s.demoHref} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Демо →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Card className="p-8 md:p-10 bg-gradient-to-br from-primary/[0.06] via-background to-background border-primary/20 text-center">
          <div className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Не знайшли свій сценарій?
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            FINTODO OS — це конструктор. Якщо є вертикаль, що не покрита — напишіть, і ми зберемо демо.
          </p>
          <Button asChild className="rounded-full">
            <Link to={audience === "business" ? "/checkout?plan=start" : "/checkout?plan=free"}>
              Створити свій кабінет <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </Button>
        </Card>
      </Section>
    </>
  );
}
