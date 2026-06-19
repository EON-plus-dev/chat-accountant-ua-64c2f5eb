import { useState, useRef, useEffect } from "react";
import { FeatureComparisonTable } from "@/components/landing/FeatureComparisonTable";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, Headphones, Sparkles, CreditCard, RefreshCw, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { plans, individualPlans, businessProPlans } from "@/config/pricingData";
import { useAudience } from "@/contexts/AudienceContext";

import { cn } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export const PricingSection = () => {
  const [yearly, setYearly] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { audience, businessMode } = useAudience();
  const isPro = audience === "business" && businessMode === "pro";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.scrollWidth / currentPlans.length;
      setActiveCard(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  });

  const discount = 0.8;
  const currentPlans = isPro ? businessProPlans : (audience === "business" ? plans : individualPlans);

  const subtitle = isPro
    ? "Робочі тарифи для сертифікованих партнерів FINTODO. Solo / Agency / Firm — обираєте за масштабом практики, кожен дає фіксовану Reseller-знижку (−25/30/35%) для тарифів ваших клієнтів.\nFINTODO не бере комісію з вашого гонорару. Сертифікація — 0 ₴."
    : audience === "business"
      ? "Базові функції доступні на кожному тарифі. Вищі тарифи додають нові інструменти, більше кредитів і кращі умови.\nКредити списуються автоматично за дії: створення документа, подача звіту, запит до AI тощо."
      : "Оберіть тариф залежно від кількості джерел доходу.\nКредити списуються автоматично за дії: розрахунок податку, формування декларації, запит до AI тощо.";

  const subtitleShort = isPro
    ? "Робочі тарифи партнера (Solo/Agency/Firm). Reseller-знижка −25/30/35% — клієнтам."
    : audience === "business"
      ? "Усі тарифи мають базові функції. Вищі — більше кредитів і інструментів."
      : "Оберіть тариф залежно від кількості джерел доходу.";

  return (
    <section id="pricing" aria-labelledby="heading-pricing" className="py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-3xl mx-auto space-y-3">
          <h2 id="heading-pricing" className="text-xl md:text-4xl font-bold mb-2">Тарифи</h2>
          <p className="md:hidden text-base text-muted-foreground leading-snug">{subtitleShort}</p>
          <p className="hidden md:block text-lg text-muted-foreground whitespace-pre-line">{subtitle}</p>
          <div role="tablist" aria-label="Період оплати" className="flex items-center justify-center gap-1 bg-muted rounded-full p-1 w-fit mx-auto">
            <button
              role="tab"
              aria-selected={!yearly}
              onClick={() => setYearly(false)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                !yearly ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Щомісяця
            </button>
            <button
              role="tab"
              aria-selected={yearly}
              onClick={() => setYearly(true)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                yearly ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Щорічно
              <Badge size="sm" className="bg-emerald-500 text-white border-0 text-xs">-20%</Badge>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards - Simplified 3 zones */}
        <div ref={scrollRef} className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto snap-x snap-mandatory pt-4 sm:pt-0 pb-4 sm:pb-0 sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
          {currentPlans.map((plan, i) => {
            const displayPrice = yearly ? Math.round(plan.price * discount) : plan.price;
            return (
              <motion.div key={plan.id} initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { delay: i * 0.1, duration: 0.5 } } }} className="min-w-[88vw] sm:min-w-[70vw] md:min-w-0 snap-center">
                <Card className={`h-full relative ${plan.popular ? "border-primary shadow-[var(--shadow-lg)] ring-2 ring-primary/20" : ""}`} aria-label={`Тариф ${plan.name}`}>
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Популярний</Badge>}
                    <CardContent className={`flex flex-col h-full ${plan.popular ? "p-4 md:p-7" : "p-4 md:p-6"}`}>
                     {/* Zone 1: Header + Price + Credits */}
                     <div className="md:min-h-[48px]">
                       <h3 className="text-xl font-bold">{plan.name}</h3>
                       <p className="text-xs text-muted-foreground mt-1">{plan.badge}</p>
                     </div>

                     <div className="pt-3 md:min-h-[120px]">
                       {yearly ? (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg line-through text-muted-foreground">{plan.price}</span>
                              <span className="text-2xl md:text-3xl font-bold">{displayPrice}</span>
                              <span className="text-sm text-muted-foreground">грн/міс</span>
                              <Badge variant="success" size="sm" className="text-xs font-semibold">-20%</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Оплата {(displayPrice * 12).toLocaleString()} грн/рік · Економія {((plan.price - displayPrice) * 12).toLocaleString()} грн
                            </p>
                          </div>
                       ) : (
                         <div className="flex items-baseline gap-1">
                           <span className="text-2xl md:text-3xl font-bold">{plan.price}</span>
                           <span className="text-sm text-muted-foreground"> грн/міс</span>
                         </div>
                       )}
                        <div className="flex items-center gap-2 mt-2">
                          <Sparkles className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">
                            {yearly
                              ? `${(plan.credits * 12).toLocaleString()} кредитів · ~${plan.actions * 12} дій на рік`
                              : `${plan.credits.toLocaleString()} кредитів · ~${plan.actions} дій`
                            }
                          </span>
                        </div>
                     </div>

                     {/* Zone 2: Key Features */}
                     <div className="flex-1 border-t border-border/50 pt-3 mt-3">
                       <p className="text-sm font-medium mb-2">
                         {plan.inheritFrom ? `Усе з «${plan.inheritFrom}», плюс:` : "Що входить:"}
                       </p>
                       <ul className="space-y-1.5">
                         {plan.features.map((f) => (
                           <li key={f} className="flex items-start gap-2 text-sm">
                             <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                             <span>{f}</span>
                           </li>
                         ))}
                       </ul>
                     </div>

                     {/* Zone 3: Single CTA */}
                     <div className="pt-4 mt-auto">
                        {(() => {
                          const isFreeStart = plan.id === "start" || plan.id === "free";
                          // Бізнес/Фізособа Start — безкоштовний тариф (без trial).
                          // Партнери (isPro) не мають free tier → trial доречний.
                          // Інші платні плани — trial як апсейл.
                          const useTrial = !isFreeStart;
                          const href = useTrial
                            ? `/checkout?plan=${plan.id}&trial=true`
                            : `/checkout?plan=${plan.id}`;
                          const labelLong = isFreeStart
                            ? "Почати безкоштовно"
                            : isPro
                              ? "Спробувати 14 днів"
                              : "Спробувати 14 днів безкоштовно";
                          const labelShort = isFreeStart ? "Почати" : "Спробувати";
                          return (
                            <Button
                              className="w-full gap-2 text-sm whitespace-normal"
                              variant={plan.popular ? "default" : "outline"}
                              onClick={() => navigate(href)}
                            >
                              {!isFreeStart && <Clock className="w-4 h-4 shrink-0 hidden sm:block" />}
                              <span className="hidden lg:inline">{labelLong}</span>
                              <span className="lg:hidden">{labelShort}</span>
                            </Button>
                          );
                        })()}
                     </div>
                   </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Scroll dots - mobile only */}
        <div className="flex sm:hidden justify-center gap-2 -mt-2">
          {currentPlans.map((plan, i) => (
            <span
              key={plan.id}
              className={cn("w-2 h-2 rounded-full transition-colors", i === activeCard ? "bg-primary" : "bg-border")}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Trust Bar - below cards */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="flex flex-wrap justify-center gap-3">
          {[
            { icon: Sparkles, label: "AI-асистент" },
            { icon: Check, label: "Безкоштовний тариф Start" },
            { icon: CreditCard, label: "Без картки" },
            { icon: Headphones, label: "Підтримка" },
            { icon: RefreshCw, label: "Скасувати будь-коли" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </motion.div>

        {/* Collapsible Feature Comparison Table */}
        <Collapsible open={tableOpen} onOpenChange={setTableOpen}>
          <div className="flex justify-center">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2">
                Порівняти всі функції детально
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", tableOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <FeatureComparisonTable />
          </CollapsibleContent>
        </Collapsible>

        {/* AI Consultant link */}
        <motion.p
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
          className="text-center text-sm text-muted-foreground"
        >
          Не впевнені, який тариф обрати?{" "}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("chat-prefill", {
                detail: { message: "__pricing_calculator__" }
              }));
              window.dispatchEvent(new CustomEvent("open-floating-chat"));
            }}
            className="text-primary hover:underline font-medium"
          >
            Запитайте AI-консультанта
          </button>
        </motion.p>

      </div>
    </section>
  );
};
