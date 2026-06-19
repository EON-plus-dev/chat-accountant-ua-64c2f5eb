import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";

const PAIN_POINTS = [
  {
    painEmoji: "😰",
    pain: "Забуваю дедлайни — отримую штрафи",
    cost: "Штраф від 340 до 3 400 ₴ за кожен пропущений звіт",
    solutionEmoji: "📅",
    solution: "Авто-нагадування за 7, 3 та 1 день до дедлайну",
    toolLabel: "Календар дедлайнів",
    href: "/analytics/deadlines",
  },
  {
    painEmoji: "😓",
    pain: "Рахую податки вручну — бо не вмію",
    cost: "Помилка = переплата або донарахування від ДПС",
    solutionEmoji: "🧮",
    solution: "Калькулятори з актуальними ставками + авто-розрахунок",
    toolLabel: "Калькулятори",
    href: "/tools",
  },
  {
    painEmoji: "😵",
    pain: "Не розумію що змінилось в законах",
    cost: "Ризик порушення через незнання нових вимог",
    solutionEmoji: "🤖",
    solution: "AI-консультант відповість за 30 секунд",
    toolLabel: "Запитати AI",
    href: "#qa-hub",
  },
  {
    painEmoji: "😟",
    pain: "Не знаю як задекларувати доходи",
    cost: "Штраф 25 500 ₴ за неподання декларації",
    solutionEmoji: "📚",
    solution: "Покрокові довідники + авто-заповнення декларації",
    toolLabel: "Довідник",
    href: "/taxes",
  },
];


export const PainPointsSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      id="pain-points"
      className={`py-10 sm:py-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      <div className="max-w-5xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Знайомі проблеми?
          </h2>
          <p className="text-muted-foreground text-sm">
            Кожна з них коштує грошей та нервів. Ми створили інструменти, щоб їх вирішити
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {PAIN_POINTS.map((item) => {
            const isAnchor = item.href.startsWith("#");
            const handleClick = isAnchor
              ? (e: React.MouseEvent) => {
                  e.preventDefault();
                  document.getElementById(item.href.slice(1))?.scrollIntoView({ behavior: "smooth" });
                }
              : undefined;

            const content = (
              <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full">
                {/* Problem */}
                <p className="text-sm font-medium text-destructive/80 flex items-center gap-2">
                  <span className="text-lg">{item.painEmoji}</span>
                  {item.pain}
                </p>

                {/* Cost of error */}
                <p className="text-xs text-muted-foreground bg-destructive/5 rounded-lg px-3 py-1.5 border border-destructive/10">
                  💸 Ціна помилки: <span className="font-medium text-destructive/70">{item.cost}</span>
                </p>

                {/* Arrow */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </div>

                {/* Solution */}
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  <span className="text-lg">{item.solutionEmoji}</span>
                  {item.solution}
                </p>

                {/* Tool link */}
                <p className="text-xs font-medium text-primary/80 flex items-center gap-1 mt-auto">
                  <ExternalLink className="h-3 w-3" />
                  {item.toolLabel} →
                </p>
              </div>
            );

            return isAnchor ? (
              <a key={item.pain} href={item.href} onClick={handleClick} className="block">
                {content}
              </a>
            ) : (
              <Link key={item.pain} to={item.href} className="block">
                {content}
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
