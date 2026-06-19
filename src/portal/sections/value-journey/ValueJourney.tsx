import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

const JOURNEY = [
  {
    step: "01",
    title: "Дізнайтесь",
    description: "Актуальна інформація та довідники",
    items: [
      { emoji: "📰", label: "Публікації", href: "/publications" },
      { emoji: "📚", label: "Довідники", href: "/dovidnyky" },
      { emoji: "🎓", label: "Навчання", href: "/learn" },
      { emoji: "📝", label: "Декларування", href: "/taxes" },
    ],
    cta: { label: "Читати", href: "/publications" },
    highlight: false,
  },
  {
    step: "02",
    title: "Розрахуйте",
    description: "Калькулятори та інструменти перевірки",
    items: [
      { emoji: "🧮", label: "Калькулятори податків", href: "/tools/esv" },
      { emoji: "📅", label: "Дедлайни", href: "/analytics/deadlines" },
      { emoji: "🔍", label: "Перевірка", href: "/tools" },
    ],
    cta: { label: "Інструменти", href: "/tools" },
    highlight: false,
  },
  {
    step: "03",
    title: "Автоматизуйте",
    description: "Платформа робить це за вас",
    items: [
      { emoji: "⚡", label: "Авто-розрахунок", href: "/" },
      { emoji: "📋", label: "Авто-звіти", href: "/" },
      { emoji: "📝", label: "Авто-декларація", href: "/" },
      { emoji: "🔗", label: "Інтеграції", href: "/" },
    ],
    cta: { label: "Спробувати", href: "/" },
    highlight: true,
  },
];

const HUB_LINKS = [
  { emoji: "🏪", label: "ФОП", href: "/fop" },
  { emoji: "📋", label: "Оподаткування", href: "/taxes" },
  { emoji: "👤", label: "Фізособам", href: "/individual" },
  { emoji: "📊", label: "Бухоблік", href: "/accounting" },
  { emoji: "🇺🇦", label: "Під час війни", href: "/wartime" },
];

export const ValueJourney = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`py-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Один шлях — три рівні</h2>
          <p className="text-sm text-muted-foreground">Від інформації до повної автоматизації обліку</p>
        </div>

        {/* 3 journey cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {JOURNEY.map((col) => (
            <Card
              key={col.step}
              className={cn(
                "h-full transition-all duration-200 hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5",
                col.highlight && "border-primary/40 bg-primary/[0.03]"
              )}
            >
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-primary">{col.step}</span>
                  <h3 className="text-base font-semibold text-foreground">{col.title}</h3>
                  {col.highlight && <Badge variant="info" className="text-[10px]">AI</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{col.description}</p>

                <ul className="space-y-2 flex-1">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                      >
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  to={col.cta.href}
                  className="mt-auto text-sm font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all"
                >
                  {col.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hub links */}
        <div className="flex flex-wrap justify-center gap-3">
          {HUB_LINKS.map((h) => (
            <Link
              key={h.href}
              to={h.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {h.emoji} {h.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
