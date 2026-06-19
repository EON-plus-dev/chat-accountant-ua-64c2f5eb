import { Link, useLocation } from "react-router-dom";
import { AudiencePillSwitcher } from "@/components/shared/AudiencePillSwitcher";
import { useAudience } from "@/contexts/AudienceContext";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_BUSINESS = [
  { to: "/os", label: "Огляд" },
  { to: "/os/modules", label: "Модулі" },
  { to: "/os/scenarios", label: "Кейси бізнесу" },
  { to: "/os/pricing", label: "Тарифи" },
  { to: "/os/security", label: "Безпека даних" },
];

const NAV_INDIVIDUAL = [
  { to: "/os", label: "Огляд" },
  { to: "/os/modules", label: "Що всередині" },
  { to: "/os/scenarios", label: "Життєві сценарії" },
  { to: "/os/pricing", label: "Тарифи" },
  { to: "/os/security", label: "Приватність" },
];

export const OsHeader = () => {
  const { pathname } = useLocation();
  const { audience } = useAudience();
  const ctaHref = audience === "business" ? "/checkout?plan=start" : "/checkout?plan=free";
  const ctaLabel = audience === "business" ? "Старт" : "Безкоштовно";
  const nav = audience === "business" ? NAV_BUSINESS : NAV_INDIVIDUAL;

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      {/* Row 1 — logo · centered switcher · CTA */}
      <div className="max-w-6xl mx-auto h-16 px-4 flex items-center gap-3">
        <div className="flex-1 flex items-center min-w-0">
          <Link to="/os" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/15 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="tracking-tight hidden xs:inline">
              FINTODO <span className="text-primary">OS</span>
            </span>
          </Link>
        </div>

        <div className="flex-shrink-0">
          <AudiencePillSwitcher size="hero" />
        </div>

        <div className="flex-1 flex items-center justify-end">
          <Button asChild size="sm" className="rounded-full h-9 px-4 text-sm shadow-md shadow-primary/20">
            <Link to={ctaHref}>
              <span className="hidden sm:inline">{ctaLabel}</span>
              <span className="sm:hidden">{audience === "business" ? "Старт" : "Безк."}</span>
              <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Row 2 — audience-specific page nav */}
      <div className="border-t border-border/30 bg-background/60">
        <div className="max-w-6xl mx-auto px-4 h-11 flex items-center justify-center gap-1 overflow-x-auto no-scrollbar">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/os" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
