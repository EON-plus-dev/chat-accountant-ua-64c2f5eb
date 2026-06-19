import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, BadgeDollarSign, UserPlus, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAudience } from "@/contexts/AudienceContext";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Перевірені FINTODO",
    text: "Кожен партнер пройшов сертифікацію та підтвердив досвід роботи з ФОП і ТОВ.",
  },
  {
    icon: BadgeDollarSign,
    title: "Прозорі ціни",
    text: "Тариф вказаний у профілі. Ми не беремо комісію з гонорару бухгалтера.",
  },
  {
    icon: UserPlus,
    title: "Делегування у 1 клік",
    text: "Запросіть партнера у свій кабінет — він отримає доступ лише до потрібних розділів.",
  },
];

export const FindAccountantSection = () => {
  const { audience, businessMode } = useAudience();
  const isPro = audience === "business" && businessMode === "pro";

  // Показуємо лише в owner-режимі (не Pro)
  if (isPro) return null;

  return (
    <section
      id="find-accountant"
      aria-labelledby="heading-find-accountant"
      className="py-8 md:py-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6 md:mb-10 max-w-2xl mx-auto"
        >
          <h2
            id="heading-find-accountant"
            className="text-2xl md:text-3xl font-bold text-foreground mb-2"
          >
            Не хочете самі? Знайдіть сертифікованого партнера
          </h2>
          <p className="text-muted-foreground">
            FINTODO — це продукт, а не аутсорс-компанія. Якщо вам потрібен живий бухгалтер, оберіть з каталогу
            наших сертифікованих партнерів.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
              >
                <Card className="p-5 h-full">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.text}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="gap-1">
            <Link to="/dovidnyky/accountants">
              Перейти до каталогу <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            0% комісії · Делегований доступ до кабінету · Можна змінити будь-коли
          </p>
        </div>
      </div>
    </section>
  );
};
