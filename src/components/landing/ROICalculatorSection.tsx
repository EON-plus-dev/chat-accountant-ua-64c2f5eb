import { motion } from "framer-motion";
import { ROICalculator } from "@/components/marketing/ROICalculator";
import { useAudience } from "@/contexts/AudienceContext";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export const ROICalculatorSection = () => {
  const { audience } = useAudience();

  const subtitle = audience === "business"
    ? "Налаштуйте параметри під ваш бізнес і побачте потенційну економію часу та грошей."
    : "Оберіть ваш сценарій декларування та побачте потенційну економію часу та грошей.";

  return (
    <section id="roi-calculator" aria-labelledby="heading-roi-calculator" className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center">
          <h2 id="heading-roi-calculator" className="text-3xl md:text-4xl font-bold mb-2">Розрахуйте вашу вигоду</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="max-w-5xl mx-auto space-y-4">
          <ROICalculator
            initialDocuments={15}
            initialPayments={8}
            initialTurnover={150000}
          />
        </motion.div>
      </div>
    </section>
  );
};
