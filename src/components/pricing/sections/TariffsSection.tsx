import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Clock, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { plans, individualPlans, type PlanData } from "@/config/pricingData";
import { useAudience } from "@/contexts/AudienceContext";
import { AudiencePillSwitcher } from "@/components/shared/AudiencePillSwitcher";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

const renderPlanCard = (plan: PlanData, navigate: ReturnType<typeof useNavigate>) => (
  <Card key={plan.id} className={`flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}>
    <CardContent className="flex flex-col h-full p-4 md:p-6">
      {/* Zone 1: Header */}
      <div className="md:min-h-[60px]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{plan.name}</h3>
          {plan.popular && <Badge>Популярний</Badge>}
        </div>
        <Badge variant="secondary" className="w-fit mt-1">{plan.badge}</Badge>
      </div>

      {/* Zone 2: Price */}
      <div className="md:min-h-[80px] pt-3">
        <div>
          <span className="text-3xl font-bold">{plan.price}</span>
          <span className="text-muted-foreground"> грн/міс</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm">{plan.credits.toLocaleString()} кредитів · ~{plan.actions} дій</span>
        </div>
      </div>

      {/* Zone 3: Description + Savings */}
      <div className="md:min-h-[120px] border-t border-border/50 pt-3">
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        {plan.savings && (
          <div className="p-2 bg-success/10 rounded-md text-xs text-success mt-2">
            {plan.savings}
          </div>
        )}
      </div>

      {/* Zone 4: Features (flex-1) */}
      <div className="flex-1 pt-3">
        <p className="text-sm font-medium mb-2">
          {plan.inheritFrom ? `Усі функції тарифу «${plan.inheritFrom}», плюс:` : "Що входить:"}
        </p>
        <ul className="space-y-1">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Zone 5: Support */}
      <div className="md:min-h-[56px] flex items-start gap-2 pt-3 border-t border-border/50">
        <Headphones className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">{plan.support}</p>
      </div>

      {/* Zone 6: Top-up + CTA */}
      <div className="pt-3 border-t border-border/50">
        <p className="text-sm mb-3">
          <span className="text-muted-foreground">Поповнення: </span>
          <span className="font-medium">1 грн = {plan.topUpRate.toLocaleString()} кредитів</span>
        </p>
        {(() => {
          const isFreeStart = plan.id === "start" || plan.id === "free";
          if (isFreeStart) {
            return (
              <Button
                className="w-full gap-2"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => navigate(`/checkout?plan=${plan.id}`)}
              >
                Почати безкоштовно
              </Button>
            );
          }
          return (
            <div className="space-y-2">
              <Button
                className="w-full gap-2"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => navigate(`/checkout?plan=${plan.id}&trial=true`)}
              >
                <Clock className="h-4 w-4" />
                Спробувати 14 днів
              </Button>
              <button
                onClick={() => navigate(`/checkout?plan=${plan.id}`)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                або купити одразу за {plan.price} грн/міс
              </button>
            </div>
          );
        })()}
      </div>
    </CardContent>
  </Card>
);

const TariffsSectionInner = () => {
  const navigate = useNavigate();
  const { audience } = useAudience();
  const currentPlans = audience === "business" ? plans : individualPlans;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / currentPlans.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(idx);
  }, [currentPlans.length]);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [audience]);

  return (
    <section id="tariffs" className="space-y-6 scroll-mt-20">
      <div className="flex justify-center mb-6">
        <AudiencePillSwitcher />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={audience}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Desktop grid */}
          <div className="hidden sm:grid gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentPlans.map((plan) => renderPlanCard(plan, navigate))}
          </div>

          {/* Mobile carousel */}
          <div className="sm:hidden space-y-4">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4"
              style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            >
              {currentPlans.map((plan) => (
                <div key={plan.id} className="min-w-[82vw] snap-center">
                  {renderPlanCard(plan, navigate)}
                </div>
              ))}
            </div>
            {/* Dot indicators */}
            <div className="flex justify-center gap-2">
              {currentPlans.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Картка ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${i === activeIndex ? "bg-primary" : "bg-border"}`}
                  onClick={() => {
                    const el = scrollRef.current;
                    if (!el) return;
                    const cardWidth = el.scrollWidth / currentPlans.length;
                    el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export const TariffsSection = () => <TariffsSectionInner />;
