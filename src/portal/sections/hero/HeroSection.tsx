import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TOOLS } from "@/portal/data/tools";

const PROOF_STATS = [
  { value: String(TOOLS.length) + "+", label: "інструментів" },
  { value: "Авто", label: "звіти й нагадування" },
  { value: "24/7", label: "AI-консультант" },
  { value: "₴0", label: "безкоштовний старт" },
];

export const HeroSection = () => {
  const scrollToCapabilities = () => {
    document.getElementById("platform-capabilities")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-10 sm:py-16 lg:py-24 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="max-w-3xl mx-auto px-4 text-center space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground leading-tight">
            AI-управління обліком і фінансами — платформа, яка навчає і&nbsp;автоматизує
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            Розрахунки, декларації, моніторинг, аналітика і прогнозування — все в одній системі для ФОП і фізичних осіб
          </p>
          {/* Identity line */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-medium text-primary/70">
            <span>Податки й облік</span>
            <span className="text-border">·</span>
            <span>AI-автоматизація</span>
            <span className="text-border">·</span>
            <span>Єдина платформа</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/checkout?plan=start">Почати безкоштовно</Link>
          </Button>
          <Button variant="outline" size="lg" onClick={scrollToCapabilities}>
            Можливості платформи ↓
          </Button>
        </div>

        {/* Inline social proof */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-10 pt-2">
          {PROOF_STATS.map((s) => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold font-mono text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
