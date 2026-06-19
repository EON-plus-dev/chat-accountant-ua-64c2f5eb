import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { UserPlus, Link2, Sparkles, Lightbulb, ChevronRight, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

interface Step {
  step: number;
  title: string;
  desc: string;
  details: string[];
  benefit: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  {
    step: 1,
    title: "Зареєструйтесь",
    desc: "Email, Google або Дія — без картки, без зобов'язань",
    details: ["Email", "Google", "Дія"],
    benefit: "Жодних платежів на старті",
    icon: UserPlus,
  },
  {
    step: 2,
    title: "Підключіть дані",
    desc: "КЕП, Дія.Підпис або BankID — і система сама підтягне ваші реєстраційні дані, КВЕДи, податкову групу та ставки",
    details: ["КЕП", "Дія.Підпис", "BankID"],
    benefit: "Більше не потрібно шукати інформацію по кабінетах",
    icon: Link2,
  },
  {
    step: 3,
    title: "Платформа працює за вас",
    desc: "AI веде книгу обліку, формує декларації, нагадує про дедлайни, контролює ліміти доходу та відповідає на податкові питання 24/7",
    details: ["Авто-облік", "Декларації", "Нагадування", "AI-консультант"],
    benefit: "Як персональний бухгалтер, податковий консультант, фінансист, юрист — тільки в рази дешевше",
    icon: Sparkles,
  },
];

const StepCard = ({ s, i, isVisible }: { s: Step; i: number; isVisible: boolean }) => {
  const Icon = s.icon;
  return (
    <div
      className={`flex flex-col rounded-xl border border-border/40 bg-background p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-500 h-full ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: isVisible ? `${i * 150}ms` : "0ms" }}
    >
      {/* Header: icon + step label */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-primary/70">Крок {s.step}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">{s.desc}</p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {s.details.map((d) => (
          <Badge key={d} variant="outline" size="sm">{d}</Badge>
        ))}
      </div>

      {/* Separator + Benefit */}
      <div className="border-t border-border/30 pt-4 mt-auto">
        <div className="bg-primary/5 rounded-lg p-3 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-primary">{s.benefit}</p>
        </div>
      </div>
    </div>
  );
};

export const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`py-10 sm:py-16 bg-muted/30 border-y border-border/40 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      <div className="max-w-5xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Як це працює</h2>
          <p className="text-sm text-muted-foreground">Від реєстрації до автоматизації — за кілька хвилин</p>
        </div>

        {/* Desktop: 3 columns with arrow connectors */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
          {STEPS.map((s, i) => (
            <>
              <StepCard key={s.step} s={s} i={i} isVisible={isVisible} />
              {i < STEPS.length - 1 && (
                <div key={`arrow-${i}`} className="flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-primary/30" />
                </div>
              )}
            </>
          ))}
        </div>

        {/* Mobile: vertical stack with arrow connectors */}
        <div className="flex flex-col md:hidden gap-3">
          {STEPS.map((s, i) => (
            <div key={s.step}>
              <StepCard s={s} i={i} isVisible={isVisible} />
              {i < STEPS.length - 1 && (
                <div className="flex justify-center py-2">
                  <ChevronDown className="w-5 h-5 text-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Button asChild size="lg">
            <Link to={CTA_CHECKOUT_URL}>Створити акаунт — безкоштовно</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
