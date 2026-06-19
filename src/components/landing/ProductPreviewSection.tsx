import { motion } from "framer-motion";
import { FileText, MessageSquare, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const previews = [
  {
    icon: FileText,
    title: "Документи",
    desc: "Автоматична класифікація актів, рахунків та договорів. AI сортує і зіставляє з платежами.",
  },
  {
    icon: MessageSquare,
    title: "AI-чат",
    desc: "Задайте питання природною мовою — отримайте відповідь з посиланням на конкретні дані.",
  },
  {
    icon: BarChart3,
    title: "Дашборд",
    desc: "Фінансова картина у реальному часі: доходи, витрати, податки, дедлайни.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const ProductPreviewSection = () => (
  <section aria-label="Огляд продукту" className="py-10 md:py-14">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.p
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6"
      >
        Як виглядає система
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {previews.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                ...fadeUp,
                show: { ...fadeUp.show, transition: { delay: i * 0.1, duration: 0.45 } },
              }}
            >
              <Card className="h-full border-dashed">
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  <span className="text-xs text-muted-foreground/60 italic mt-auto">Скріншот скоро</span>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);
