import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const SECTIONS_GRID = [
  {
    href: CTA_CHECKOUT_URL,
    emoji: "⚡",
    title: "Продукт FINTODO",
    description: "AI-автоматизація ЄСВ, звітності і дедлайнів для ФОП та МСБ",
    cta: "Спробувати безкоштовно →",
    isHighlighted: true,
  },
  {
    href: "/tools",
    emoji: "🛠",
    title: "Інструменти",
    description: "17 калькуляторів і генераторів для щоденної роботи",
    cta: "Всі інструменти",
  },
  {
    href: "/analytics",
    emoji: "📊",
    title: "Аналітика",
    description: "Курси валют, депозити, іпотека, ринок праці",
    cta: "Дивитись дані",
  },
  {
    href: "/dovidnyky",
    emoji: "📚",
    title: "Довідники",
    description: "Установи, КВЕД, закони, гранти, штрафи",
    cta: "До довідників",
  },
  {
    href: "/publications",
    emoji: "📰",
    title: "Публікації",
    description: "Новини, гайди, огляди, консультації, дайджест",
    cta: "Читати",
  },
  {
    href: "/learn",
    emoji: "🎓",
    title: "Навчання",
    description: "Курси для ФОП, бухгалтерів і IT-фрілансерів",
    cta: "Почати навчання",
    isNew: true,
  },
];

export const SectionsGrid = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`py-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <h2 className="text-xl font-bold text-foreground">Розділи платформи</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS_GRID.map((section) => (
            <Link key={section.href} to={section.href} className="group">
              <Card
                className={cn(
                  "h-full transition-all duration-200 group-hover:shadow-[var(--shadow-lg)] group-hover:-translate-y-0.5",
                  section.isHighlighted && "border-primary/40 bg-primary/[0.03]"
                )}
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img">{section.emoji}</span>
                    <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
                    {"isNew" in section && section.isNew && (
                      <Badge variant="success" size="sm">Нове</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.description}</p>
                  <span className="mt-auto text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    {section.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
