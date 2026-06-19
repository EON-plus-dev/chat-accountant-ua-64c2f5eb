import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { finalCTA, finalCTAPro } from "@/config/landingData";
import { useAudience } from "@/contexts/AudienceContext";
import { PreRegistrationModal } from "./PreRegistrationModal";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export const LandingFinalCTA = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { audience, businessMode } = useAudience();
  const isPro = audience === "business" && businessMode === "pro";
  const data = isPro ? finalCTAPro : finalCTA[audience];

  return (
    <>
      <section className="py-8 md:py-16 bg-gradient-to-b from-primary/5 to-background border-t border-border/40">
        <div className="max-w-2xl mx-auto px-4 md:px-6 text-center space-y-6">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-xl md:text-4xl font-bold">
            {data.title}
          </motion.h2>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="space-y-2 text-muted-foreground">
            {(data as any).lineShort && (
              <p className="md:hidden text-base leading-snug">{(data as any).lineShort}</p>
            )}
            <div className="hidden md:block space-y-2">
              {data.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <Button size="lg" className="h-12" onClick={() => setModalOpen(true)}>
              Попередня реєстрація →
            </Button>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-primary" />
            <span>Кількість місць для раннього доступу обмежена</span>
          </motion.div>
        </div>
      </section>

      <PreRegistrationModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
};
