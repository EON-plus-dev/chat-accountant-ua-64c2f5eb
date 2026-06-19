import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

export const PlatformBridge = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn(
        "py-8 sm:py-10 transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 sm:p-8 text-center space-y-4">
          {/* Decorative icon */}
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            Все це — безкоштовна частина FINTODO
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Калькулятори, довідники, AI-консультант, курси НБУ та дедлайни — доступні без реєстрації.
            Увімкніть автоматизацію — і платформа веде облік, формує декларації та контролює ліміти за вас.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Дізнатись більше про продукт
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
