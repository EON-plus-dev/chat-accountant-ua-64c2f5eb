import { Link } from "react-router-dom";
import { TOOLS } from "@/portal/data/tools";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const FEATURES = [
  { icon: "📋", text: "ЄСВ і ЄП розраховуються самі" },
  { icon: "📅", text: "Нагадування до кожного дедлайну" },
  { icon: "📊", text: "Звіти і виписки в PDF/XML" },
  { icon: "🔗", text: "Інтеграція з Monobank і Checkbox" },
];

const STATS = [
  { value: String(TOOLS.length) + "+", label: "інструментів" },
  { value: "2025-2026", label: "актуальні ставки" },
  { value: "₴0", label: "безкоштовний старт" },
];

export const ProductCTASection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`py-10 sm:py-16 bg-muted/30 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-center">
          {/* Left */}
          <div className="space-y-6">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Все що ви знайшли на порталі — FINTODO робить автоматично
            </p>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Перестаньте витрачати годину на місяць на облік
            </h2>

            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-foreground">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm">{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to={CTA_CHECKOUT_URL}>Почати безкоштовно</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/#pricing">Переглянути ціни</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Безкоштовний тариф Start — 300 кредитів/міс · Без картки · від 399 ₴/міс на платних
            </p>
          </div>

          {/* Right — stats */}
          <div className="grid grid-cols-1 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.value} className="space-y-1">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
