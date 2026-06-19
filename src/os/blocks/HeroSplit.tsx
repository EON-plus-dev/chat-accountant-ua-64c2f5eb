// HeroSplit: asymmetric 55/45 hero — copy left, live product mockup right.
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudiencePillSwitcher } from "@/components/shared/AudiencePillSwitcher";
import { useAudience } from "@/contexts/AudienceContext";
import { osHero } from "@/os/config/osCopy";
import { HeroMockupRotation } from "@/os/mockups/CabinetMockups";
import { osLogos, osMetrics } from "@/os/config/osProof";

export const HeroSplit = () => {
  const { audience } = useAudience();
  const hero = {
    eyebrow: osHero.eyebrow[audience],
    title: osHero.title[audience],
    subtitle: osHero.subtitle[audience],
    cta1: osHero.primaryCta[audience],
    cta2: osHero.secondaryCta[audience],
    bullets: osHero.bullets[audience],
  };

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      {/* background ornaments */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-background to-background" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(hsl(var(--foreground))_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-16 pb-12 md:pb-20">
        {/* live status strip */}
        <div className="flex items-center justify-end mb-8 md:mb-12">
          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>1 247 кабінетів · 2.4M операцій / міс</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left: copy */}
          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-medium mb-4 flex items-center gap-2">
                <span className="inline-block w-6 h-px bg-primary/40" />
                {hero.eyebrow}
              </div>
              <h1 className="text-[44px] md:text-6xl lg:text-[64px] font-semibold tracking-tight leading-[1.02] mb-6">
                {hero.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                {hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Button asChild size="lg" className="rounded-full h-12 px-6 text-base shadow-lg shadow-primary/20">
                  <Link to={hero.cta1.href}>
                    {hero.cta1.label}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6 text-base">
                  <Link to={hero.cta2.href}>{hero.cta2.label}</Link>
                </Button>
              </div>
              <ul className="space-y-2">
                {hero.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          {/* Right: rotating product mockup */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={audience}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
              >
                <HeroMockupRotation audience={audience} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Metric strip + logos */}
        <div className="mt-14 md:mt-20 grid md:grid-cols-4 gap-6 pt-10 border-t border-border/40">
          {osMetrics.map((m) => (
            <div key={m.label}>
              <div className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">{m.value}</div>
              <div className="text-xs text-foreground mt-1">{m.label}</div>
              <div className="text-[11px] text-muted-foreground">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const LogoCloud = () => (
  <section className="border-b border-border/40 bg-muted/20">
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground text-center mb-6">
        Працюють у FINTODO OS
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-x-6 gap-y-4">
        {osLogos.slice(0, 12).map((name) => (
          <div
            key={name}
            className="h-10 flex items-center justify-center text-xs md:text-sm text-muted-foreground/70 font-medium tracking-tight hover:text-foreground transition-colors text-center"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  </section>
);
