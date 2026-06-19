import { motion } from "framer-motion";
import { Shield, ScrollText, Brain, LifeBuoy, ShieldCheck, FileText, Key, LogIn, Lock, Database, HardDrive, ChevronDown, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { securityDataFlow, complianceBadges, securityMetrics, securitySubtitle, securitySubtitleShort } from "@/config/landingData";
import { useAudience } from "@/contexts/AudienceContext";

const iconMap: Record<string, React.ElementType> = { Shield, ScrollText, Brain, LifeBuoy, FileText, Key, LogIn, Lock, Database, HardDrive };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export const SecuritySection = () => {
  const { audience } = useAudience();
  const badges = complianceBadges[audience];
  const dataFlow = securityDataFlow[audience];
  const metrics = securityMetrics[audience];
  const subtitle = securitySubtitle[audience];
  const subtitleShort = securitySubtitleShort[audience];

  const panelRows = audience === "business"
    ? [
        { label: "Активних делегацій", detail: "2 — бухгалтер, помічник" },
        { label: "Авто-підпис", detail: "Вимкнено" },
        { label: "Найближчі дедлайни", detail: "ЄСВ 19.01 · ЄП 20.01 · 4ДФ 09.02" },
        { label: "Журнал дій", detail: "Готовий до експорту за період" },
        { label: "Розділ «Перевірки»", detail: "0 нових листів від ДПС" },
        { label: "Експорт даних", detail: "Доступний" },
        { label: "Резервна копія", detail: "Щодня" },
      ]
    : [
        { label: "Вхід", detail: "Дія.Підпис активний" },
        { label: "Авто-дії", detail: "Вимкнено" },
        { label: "Чернетки декларацій", detail: "1 готова до підпису" },
        { label: "Декларацій підписано", detail: "1 (за 2025)" },
        { label: "Експорт даних", detail: "Доступний" },
        { label: "Резервна копія", detail: "Щодня" },
      ];

  const panelTitle = audience === "business" ? "Статус кабінету ФОП" : "Стан вашого кабінету";
  const accordionHeading = audience === "business"
    ? "Хто й що може робити у вашому кабінеті"
    : "Ви залишаєтеся єдиним, хто підписує";
  const trustBarCols = metrics.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-4";

  return (
    <section id="security" aria-labelledby="heading-security" className="py-8 md:py-16 bg-muted/50 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center max-w-3xl mx-auto">
          <h2 id="heading-security" className="text-xl md:text-4xl font-bold mb-2">Безпека та контроль</h2>
          <p className="md:hidden text-base text-muted-foreground leading-snug">{subtitleShort}</p>
          <p className="hidden md:block text-lg text-muted-foreground">{subtitle}</p>
        </motion.div>

        {/* Trust Bar — key metrics */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <div className={`grid ${trustBarCols} gap-3 max-w-2xl mx-auto rounded-xl border border-primary/20 bg-primary/5 p-4`}>
            {metrics.map((m, i) => (
              <div key={i} className="text-center">
                <span className="text-xl font-bold text-primary">{m.value}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sub-block: Compliance + security panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">{accordionHeading}</h3>
          <div className="grid lg:grid-cols-[1fr_auto] gap-4">
            {/* Compliance accordion */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {badges.map((b, i) => {
                    const Icon = iconMap[b.icon] || Shield;
                    return (
                      <AccordionItem key={b.label} value={`compliance-${i}`} className="border-b last:border-0 px-5">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-semibold text-sm">{b.label}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-11">
                          {b.desc}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>

            {/* Security panel mockup */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="lg:w-72">
              <Card className="h-full overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/60">
                    <span className="text-sm font-semibold">{panelTitle}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <Badge variant="success" size="sm">Захищено</Badge>
                    </div>
                  </div>
                  <div className="divide-y divide-border/30">
                    {panelRows.map((item) => (
                      <div key={item.label} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-success" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
};
