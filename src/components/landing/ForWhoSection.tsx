import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Calculator, TrendingUp, Users, User, Wallet, BarChart3, Home, Globe, UserCheck, Landmark, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { forWhoBusiness, forWhoIndividual, forWhoSubtitle, forWhoSubtitleShort, forWhoIdentify, forWhoBusinessPro, forWhoIdentifyPro, forWhoSubtitlePro, forWhoSubtitleShortPro } from "@/config/landingData";
import { useAudience } from "@/contexts/AudienceContext";

import { InlineCTA } from "./InlineCTA";

const iconMap: Record<string, React.ElementType> = { Briefcase, Calculator, TrendingUp, Users, User, Wallet, BarChart3, Home, Globe, UserCheck, Landmark };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };


const PersonaCards = ({ items }: { items: typeof forWhoBusiness }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-5xl mx-auto">
    {items.map((p, i) => {
      const Icon = iconMap[p.icon] || User;
      return (
        <motion.div key={p.title} initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { delay: i * 0.05, duration: 0.4 } } }}>
          <Card className="h-full">
            <CardContent className="p-4 flex gap-3 items-start">
              <Icon className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-semibold leading-tight">{p.title}</span>
                <p className="text-sm text-muted-foreground leading-snug">{p.desc}</p>
                {p.features && p.features.length > 0 && (
                  <ul className="list-disc ml-4 mt-1 space-y-0.5">
                    {p.features.map((f) => (
                      <li key={f} className="text-xs text-muted-foreground leading-snug">{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    })}
  </div>
);

export const ForWhoSection = () => {
  const { audience, businessMode } = useAudience();
  const isPro = audience === "business" && businessMode === "pro";

  const items = isPro ? forWhoBusinessPro : (audience === "business" ? forWhoBusiness : forWhoIndividual);
  const subtitle = isPro ? forWhoSubtitlePro : forWhoSubtitle[audience];
  const subtitleShort = isPro ? forWhoSubtitleShortPro : forWhoSubtitleShort[audience];
  const identifyItems = isPro ? forWhoIdentifyPro : (forWhoIdentify[audience] || []);
  const modeKey = isPro ? "pro" : audience;

  const handleWriteToUs = () => {
    window.dispatchEvent(new CustomEvent("chat-prefill", { detail: { message: "Не знайшов свій випадок у списку, потрібна консультація" } }));
    window.dispatchEvent(new CustomEvent("open-floating-chat"));
  };

  return (
    <section id="for-who" aria-labelledby="heading-for-who" className="py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-3xl mx-auto">
          <h2 id="heading-for-who" className="text-xl md:text-4xl font-bold mb-2">Кому підходить</h2>
          <p className="md:hidden text-base text-muted-foreground leading-snug">{subtitleShort}</p>
          <p className="hidden md:block text-lg text-muted-foreground">{subtitle}</p>
        </motion.div>
        {/* Self-identification checklist */}
        <motion.div key={`identify-${modeKey}`} initial="hidden" animate="show" variants={fadeUp} className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-x-6 gap-y-2 max-w-3xl mx-auto w-fit sm:w-auto">
          {identifyItems.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground leading-snug">{item}</span>
            </div>
          ))}
        </motion.div>

        {/* Persona cards */}
        <AnimatePresence mode="wait">
          <motion.div key={`cards-${modeKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <PersonaCards items={items} />
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center pt-1">
          <p className="text-sm text-muted-foreground">
            Не знайшли свій випадок?{" "}
            <button onClick={handleWriteToUs} className="text-primary hover:underline font-medium">
              Напишіть нам
            </button>{" "}
            — підберемо рішення для вас.
          </p>
        </motion.div>

        <InlineCTA text={isPro ? "Впізнали своє бюро?" : "Впізнали себе?"} />
      </div>

    </section>
  );
};

