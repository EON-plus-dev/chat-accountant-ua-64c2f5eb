import { useMemo } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { commonFaq, businessFaq, individualFaq } from "@/config/pricingData";
import { useAudience } from "@/contexts/AudienceContext";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export const PricingFAQSection = () => {
  const { audience } = useAudience();

  const faqItems = useMemo(
    () =>
      audience === "business"
        ? [...businessFaq, ...commonFaq]
        : [...individualFaq, ...commonFaq],
    [audience]
  );

  const subtitle =
    audience === "business"
      ? "Відповіді на найпоширеніші питання про оплату, кредити та тарифи для бізнесу."
      : "Відповіді на найпоширеніші питання про оплату, кредити та тарифи для фізичних осіб.";

  return (
    <section id="pricing-faq" aria-labelledby="heading-pricing-faq" className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <h2 id="heading-pricing-faq" className="text-3xl md:text-4xl font-bold mb-2">Часті питання про тарифи</h2>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={`${audience}-${i}`} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
