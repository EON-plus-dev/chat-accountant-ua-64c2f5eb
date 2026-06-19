import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Clock, Gauge, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAudience } from "@/contexts/AudienceContext";
import { whySectionData, whySectionDataPro } from "@/config/landingData";

import { Heart, TrendingUp } from "lucide-react";
import { InlineCTA } from "./InlineCTA";

const icons: Record<string, React.ElementType> = { Clock, Gauge, ShieldCheck, Heart, TrendingUp };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ── Counter hook ── */
const useCounter = (end: number, duration = 1.2, inView: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration, inView]);
  return count;
};

/* ── Animated metric ── */
const AnimatedMetric = ({ value, suffix, label, inView }: {
  value: number; suffix: string; label: string; inView: boolean;
}) => {
  const counted = useCounter(value, 1.2, inView);
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold tabular-nums text-primary">
        {value === 0 ? "0" : counted.toLocaleString("uk-UA")}{suffix}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
};

/* ── Pillar Card ── */
const PillarCard = ({ pillar, index, inView }: {
  pillar: typeof whySectionData.business.pillars[0];
  index: number;
  inView: boolean;
}) => {
  const Icon = icons[pillar.icon] || Clock;

  return (
    <motion.div
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { delay: index * 0.15, duration: 0.5 } } }}
      className="md:row-span-5 md:grid md:grid-rows-subgrid"
    >
      <Card className="h-full md:row-span-5 md:grid md:grid-rows-subgrid">
        <CardContent className="p-5 flex flex-col gap-4 md:row-span-5 md:grid md:grid-rows-subgrid">
          {/* Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{pillar.title}</h3>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">{pillar.description}</p>

          {/* Metrics */}
          <div className="flex items-center justify-around gap-2 py-2 bg-muted/40 rounded-lg">
            {pillar.metrics.map((m, i) => (
              <AnimatedMetric key={i} value={m.value} suffix={m.suffix} label={m.label} inView={inView} />
            ))}
          </div>

          {/* Benefits */}
          <ul className="space-y-1.5">
            {pillar.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* Key Result */}
          <div className="pt-3 border-t border-border/50 mt-auto md:mt-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-xl font-bold text-primary leading-tight">{pillar.caseStudy.metric}</div>
                <span className="text-xs text-muted-foreground">{pillar.caseStudy.metricLabel}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const WhySection = () => {
  const { audience, businessMode } = useAudience();
  const isPro = audience === "business" && businessMode === "pro";
  const data = isPro ? whySectionDataPro : whySectionData[audience];
  const modeKey = isPro ? "pro" : audience;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="why" aria-labelledby="heading-why" className="py-8 md:py-16 bg-muted/30 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={modeKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-6 md:mb-10"
          >
            <h2 id="heading-why" className="text-2xl md:text-3xl font-bold text-foreground mb-2">{data.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{data.subtitle}</p>
          </motion.div>
        </AnimatePresence>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[repeat(5,auto)] gap-5 lg:gap-6">
          <AnimatePresence mode="wait">
            {data.pillars.map((pillar, i) => (
              <PillarCard key={`${modeKey}-${i}`} pillar={pillar} index={i} inView={inView} />
            ))}
          </AnimatePresence>
        </div>

        <InlineCTA text="Переконались у вигоді?" />
      </div>
    </section>
  );
};
