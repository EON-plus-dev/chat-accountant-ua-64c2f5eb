import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const InlineCTA = ({ text = "Готові спробувати?" }: { text?: string }) => {
  const handleClick = () => {
    const heroEmail = document.querySelector<HTMLInputElement>("#hero-email");
    if (heroEmail) {
      heroEmail.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => heroEmail.focus(), 600);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={fadeUp}
      className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
    >
      <span className="text-sm text-muted-foreground">{text}</span>
      <Button size="sm" onClick={handleClick} className="gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        Спробувати безкоштовно
      </Button>
    </motion.div>
  );
};
