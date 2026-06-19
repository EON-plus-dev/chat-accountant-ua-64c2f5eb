import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { commonFaq, businessFaq, individualFaq, proFaq } from "@/config/pricingData";
import { JsonLd } from "@/components/seo/JsonLd";
import { useAudience } from "@/contexts/AudienceContext";


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const LandingFAQSection = () => {
  const { audience, businessMode } = useAudience();
  const isPro = audience === "business" && businessMode === "pro";

  const faqItems = useMemo(
    () => {
      if (isPro) return [...proFaq, ...commonFaq];
      return audience === "business"
        ? [...businessFaq, ...commonFaq]
        : [...individualFaq, ...commonFaq];
    },
    [audience, isPro]
  );

  const subtitle = isPro
    ? "Відповіді на питання бухгалтерів і бюро про FINTODO."
    : audience === "business"
      ? "Відповіді на найпоширеніші питання про облік та тарифи."
      : "Відповіді на найпоширеніші питання про декларування та тарифи.";

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    }),
    [faqItems]
  );

  return (
    <section
      id="faq"
      aria-labelledby="heading-faq"
      className="py-8 md:py-16"
    >
      <JsonLd data={faqSchema} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center"
        >
          <h2
            id="heading-faq"
            className="text-xl md:text-4xl font-bold mb-2"
          >
            Часті запитання
          </h2>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </motion.div>
        {/* Accordion */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={`${audience}-${i}`} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA */}
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center text-sm text-muted-foreground"
        >
          Маєте ще питання?{" "}
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-floating-chat"))
            }
            className="text-primary hover:underline font-medium"
          >
            Запитайте AI-консультанта
          </button>
        </motion.p>
      </div>
    </section>
  );
};
