import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Gauge, FileSpreadsheet, Receipt, PieChart, BarChart3, Home, Globe, Coins, CalendarDays, Users, Building, Building2, Bitcoin, BadgePercent, User, Bot, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { howItWorksSteps, howItWorksSubtitle, howItWorksSubtitleShort, scenarios, scenariosSectionSubtitle, howItWorksStepsPro, howItWorksSubtitlePro, howItWorksSubtitleShortPro, scenariosPro, scenariosSectionSubtitlePro } from "@/config/landingData";
import { useAudience } from "@/contexts/AudienceContext";
import { useIsMobile } from "@/hooks/use-mobile";


const scenarioIcons: Record<string, React.ElementType> = { Gauge, FileSpreadsheet, Receipt, PieChart, BarChart3, Home, Globe, Coins, CalendarDays, Users, Building, Building2, Bitcoin, BadgePercent };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export const HowItWorksSection = () => {
  const { audience, businessMode } = useAudience();
  const isPro = audience === "business" && businessMode === "pro";
  const [showAllScenarios, setShowAllScenarios] = useState(false);
  const isMobile = useIsMobile();
  const steps = isPro ? howItWorksStepsPro : howItWorksSteps[audience];
  const subtitle = isPro ? howItWorksSubtitlePro : howItWorksSubtitle[audience];
  const subtitleShort = isPro ? howItWorksSubtitleShortPro : howItWorksSubtitleShort[audience];
  const scens = isPro ? scenariosPro : scenarios[audience];
  const scenSubtitle = isPro ? scenariosSectionSubtitlePro : scenariosSectionSubtitle[audience];
  const visibleScens = showAllScenarios ? scens : scens.slice(0, 6);
  const modeKey = isPro ? "pro" : audience;

  useEffect(() => {
    setShowAllScenarios(false);
  }, [audience, businessMode]);

  const handleWriteToUs = () => {
    window.dispatchEvent(new CustomEvent("chat-prefill", { detail: { message: "Не знайшов потрібний сценарій, хочу обговорити мій випадок" } }));
    window.dispatchEvent(new CustomEvent("open-floating-chat"));
  };

  return (
    <section id="how-it-works" aria-labelledby="heading-how-it-works" className="py-8 md:py-16 bg-muted/50 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-3xl mx-auto">
          <h2 id="heading-how-it-works" className="text-xl md:text-4xl font-bold mb-2">Як це працює</h2>
          <p className="md:hidden text-base text-muted-foreground leading-snug">{subtitleShort}</p>
          <p className="hidden md:block text-lg text-muted-foreground">{subtitle}</p>
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div key={modeKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* Steps — heroic cards with primary left border */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {steps.map((s, i) => (
                <motion.div key={s.step} initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { delay: i * 0.1, duration: 0.5 } } }}>
                  <Card className="h-full border-l-4 border-l-primary border-t-0 border-r-0 border-b-0 shadow-none bg-card">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shrink-0">
                          {s.step}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{s.title}</div>
                          <div className="text-xs text-muted-foreground">{s.desc}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.details.map((d) => (
                          <Badge key={d} variant="secondary" size="sm">{d}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Scenarios section subtitle */}
            <div className="text-center max-w-2xl mx-auto pt-2">
              <h3 className="text-lg font-semibold">Сценарії використання</h3>
              <p className="text-sm text-muted-foreground mt-1">{scenSubtitle}</p>
            </div>

            {/* Scenarios — unified vertical flow cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleScens.map((s, i) => {
                const Icon = scenarioIcons[s.icon] || Gauge;
                return (
                  <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                    <div className="h-full rounded-lg border border-border/40 bg-background p-4 flex flex-col shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold leading-tight pt-1.5">{s.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
                      <div className="border-t border-border/30 pt-3 mt-auto flex items-start justify-between gap-1">
                        {s.flow.map((step, j) => {
                          const cfg = step.actor === "user"
                            ? { icon: User, color: "text-blue-600 dark:text-blue-400" }
                            : step.actor === "ai"
                            ? { icon: Bot, color: "text-primary" }
                            : { icon: CheckCircle2, color: "text-green-600 dark:text-green-400" };
                          const ActorIcon = cfg.icon;
                          return (
                            <div key={j} className="flex items-start gap-1 flex-1 min-w-0">
                              {j > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0 mt-0.5" />}
                              <div className="flex items-start gap-1 min-w-0">
                                <ActorIcon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cfg.color}`} />
                                <span className="text-[11px] leading-tight text-muted-foreground">{step.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {scens.length > 6 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllScenarios(!showAllScenarios)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {showAllScenarios ? "Згорнути" : `Більше сценаріїв (${scens.length - 6})`}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Не знайшли необхідний сценарій?{" "}
            <button onClick={handleWriteToUs} className="text-primary hover:underline font-medium">
              Напишіть нам
            </button>{" "}
            — підберемо рішення для вас.
          </p>
        </motion.div>
      </div>

    </section>
  );
};
