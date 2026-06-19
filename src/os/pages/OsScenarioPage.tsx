// /os/scenarios/:id — case-study формат:
// Hero → Before → Setup → After → Cabinet preview → CTA.
import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, AlertCircle, Check, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { osScenariosById, osScenariosByAudience } from "@/os/config/osScenarios";
import { useAudience } from "@/contexts/AudienceContext";
import { Section } from "@/os/blocks/SectionShell";
import { MorningBriefMockup, PaymentsMockup } from "@/os/mockups/CabinetMockups";

export default function OsScenarioPage() {
  const { id } = useParams();
  const s = id ? osScenariosById[id] : undefined;
  const { setAudience } = useAudience();

  useEffect(() => { if (s) setAudience(s.audience); }, [s, setAudience]);

  if (!s) return <Navigate to="/os/scenarios" replace />;

  const related = osScenariosByAudience(s.audience).filter((x) => x.id !== s.id).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.04] via-background to-background" />
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-14 md:pt-14 md:pb-20">
          <Link to="/os/scenarios" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" /> Усі сценарії
          </Link>
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-medium mb-4 flex items-center gap-2">
                <span className="inline-block w-6 h-px bg-primary/40" /> {s.vertical} · кейс
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.05] mb-5">
                {s.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-7 max-w-xl">{s.persona}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full h-12 px-6 shadow-lg shadow-primary/20">
                  <Link to={s.demoHref}>Відкрити демо-кабінет <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6">
                  <Link to={s.audience === "business" ? "/checkout?plan=start" : "/checkout?plan=free"}>
                    Створити свій
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <MorningBriefMockup audience={s.audience} />
              <div className="absolute -inset-6 -z-10 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Before / After */}
      <Section eyebrow="До → Після" title="Що змінюється у щоденній роботі">
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="p-7 md:p-8 border-amber-500/20 bg-amber-500/[0.02]">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-amber-600">
              <AlertCircle className="w-4 h-4" /> Болі сьогодні
            </div>
            <ul className="space-y-3">
              {s.pains.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="inline-block w-1 h-1 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-7 md:p-8 border-primary/20 bg-primary/[0.02]">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-primary">
              <Sparkles className="w-4 h-4" /> З FINTODO OS
            </div>
            <ul className="space-y-3">
              {s.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-2 text-sm leading-relaxed">
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* Setup */}
      <Section eyebrow="Setup · 1 день" title="Що підключаємо та налаштовуємо">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { n: "01", t: "Кабінет", d: "Створюємо кабінет та підключаємо КЕП або Дія.Підпис." },
            { n: "02", t: "Джерела", d: "Sync банків, ПРРО, імпорт історії з 1С/Excel/Monobank." },
            { n: "03", t: "Модулі", d: "Включаємо лише ті модулі, що потрібні цьому сценарію." },
            { n: "04", t: "Делегації", d: "Запрошуємо команду, бухгалтера або родину з межами доступу." },
          ].map((step) => (
            <div key={step.n}>
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-sm font-semibold mb-4">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="font-mono text-[10px] text-primary/60 mb-1">{step.n}</div>
              <div className="font-semibold text-sm mb-1.5">{step.t}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{step.d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Cabinet preview */}
      <Section eyebrow="Дивіться зсередини" title="Демо-кабінет з реальними даними">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.04] via-background to-background">
          <div className="p-6 md:p-10 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center">
            <div>
              <div className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                Цей сценарій — у живому демо
              </div>
              <p className="text-muted-foreground mb-6">
                Реальні дані, реальні модулі, реальні делегації. Без реєстрації, без оплат, без шкоди.
                Перемикайтесь між кабінетами у дропдауні.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full">
                  <Link to={s.demoHref}>Відкрити демо <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to={s.audience === "business" ? "/checkout?plan=start" : "/checkout?plan=free"}>
                    Створити свій кабінет
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <PaymentsMockup audience={s.audience} />
            </div>
          </div>
        </Card>
      </Section>

      {/* Related scenarios */}
      <Section eyebrow="Дивіться також" title="Інші кейси">
        <div className="grid md:grid-cols-3 gap-4">
          {related.map((r) => (
            <Link
              key={r.id}
              to={`/os/scenarios/${r.id}`}
              className="block p-6 rounded-2xl border border-border/40 hover:border-primary/40 hover:bg-muted/20 transition-all"
            >
              <div className="text-[11px] uppercase tracking-widest text-primary/80 font-medium mb-2">{r.vertical}</div>
              <div className="font-semibold mb-1.5">{r.title}</div>
              <div className="text-xs text-muted-foreground">{r.persona}</div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
