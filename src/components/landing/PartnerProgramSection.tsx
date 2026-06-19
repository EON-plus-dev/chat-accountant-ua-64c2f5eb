import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, GraduationCap, Search, Users, ArrowRight, Percent, TrendingUp, Wallet, User, Building2, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAudience } from "@/contexts/AudienceContext";

const steps = [
  { icon: UserPlus, title: "Реєстрація", text: "Створіть партнерський акаунт безкоштовно за 2 хвилини." },
  { icon: GraduationCap, title: "Сертифікація", text: "Пройдіть онлайн-курс і тест. Зазвичай 1-2 дні." },
  { icon: Briefcase, title: "Оберіть тариф", text: "Solo / Agency / Firm — від цього залежить % знижки клієнтам." },
  { icon: Users, title: "Підключайте клієнтів", text: "Кожен клієнт автоматично отримує −25/30/35% — або ви як revenue share." },
];

const advantages = [
  {
    title: "Ми не конкуруємо за клієнтів",
    text: "FINTODO — це SaaS-продукт. Ми не пропонуємо власні бухгалтерські послуги. Ваші клієнти — ваші назавжди.",
  },
  {
    title: "0% комісії з гонорарів",
    text: "Ви отримуєте 100% оплати від клієнта. Ми заробляємо лише на підписці клієнта на продукт.",
  },
  {
    title: "Reseller-економіка для портфоліо",
    text: "Авторизований Reseller FINTODO — ви даєте клієнтам відчутну знижку. Чим більший партнерський тариф — тим вища знижка.",
  },
];

type Tier = {
  id: "solo" | "agency" | "firm";
  name: string;
  who: string;
  seats: string;
  percent: 25 | 30 | 35;
  icon: typeof User;
  color: string;
};

const tiers: Tier[] = [
  { id: "solo", name: "Solo", who: "Приватний бухгалтер", seats: "1 кабінет (особистий)", percent: 25, icon: User, color: "bg-muted" },
  { id: "agency", name: "Agency", who: "Бухгалтерська агенція", seats: "до 5 кабінетів співробітників", percent: 30, icon: Users, color: "bg-primary/10 border-primary/40" },
  { id: "firm", name: "Firm", who: "Бухгалтерська компанія", seats: "від 6 кабінетів співробітників", percent: 35, icon: Building2, color: "bg-success/10 border-success/40" },
];

const PLAN_PRICE = 799; // Smart — найпопулярніший тариф клієнта

const ResellerCalculator = () => {
  const [tierId, setTierId] = useState<Tier["id"]>("agency");
  const [clients, setClients] = useState(10);
  const tier = useMemo(() => tiers.find((t) => t.id === tierId)!, [tierId]);

  const monthlyClientSavings = Math.round(PLAN_PRICE * (tier.percent / 100));
  const totalMonthly = monthlyClientSavings * clients;

  return (
    <Card className="p-5 md:p-6 border-primary/30">
      <div className="flex items-center gap-2 mb-4">
        <Percent className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Калькулятор Reseller-економіки</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <Label htmlFor="clients">Скільки у вас активних клієнтів</Label>
          <Input
            id="clients"
            type="number"
            min={1}
            max={500}
            value={clients}
            onChange={(e) => setClients(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
          />
          <p className="text-xs text-muted-foreground">
            Базовий тариф клієнта — Smart, {PLAN_PRICE} ₴/міс.
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Ваш партнерський тариф</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {tiers.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTierId(t.id)}
                className={`text-xs rounded-md border px-2 py-1.5 transition ${
                  tierId === t.id
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {t.name} −{t.percent}%
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ваш тариф</span>
            <Badge variant="outline">{tier.name} · −{tier.percent}%</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">На одного клієнта</span>
            <span className="font-semibold">−{monthlyClientSavings.toLocaleString()} ₴/міс</span>
          </div>
          <div className="flex items-baseline justify-between border-t pt-2">
            <span className="text-sm font-medium">Сумарна економія / revenue share</span>
            <span className="text-xl font-bold text-primary">−{totalMonthly.toLocaleString()} ₴/міс</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Ви обираєте: знижка йде клієнту або вам як revenue share.
          </p>
        </div>
      </div>
    </Card>
  );
};

export const PartnerProgramSection = () => {
  const { audience, businessMode } = useAudience();
  const isPro = audience === "business" && businessMode === "pro";

  if (!isPro) return null;

  return (
    <section
      id="partner-program"
      aria-labelledby="heading-partner-program"
      className="py-8 md:py-16 bg-muted/30 border-y border-border/40"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Як працює */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="text-center mb-6 md:mb-10 max-w-2xl mx-auto"
          >
            <h2
              id="heading-partner-program"
              className="text-2xl md:text-3xl font-bold text-foreground mb-2"
            >
              Як працює партнерська програма
            </h2>
            <p className="text-muted-foreground">
              Сертифікований партнер = авторизований Reseller FINTODO. Ваш партнерський тариф (Solo / Agency / Firm) визначає одразу і ваш робочий інструмент, і % Reseller-знижки для всіх ваших клієнтів.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                >
                  <Card className="p-5 h-full text-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Крок {i + 1}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.text}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Reseller тіри */}
        <div>
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              Партнерські тарифи та Reseller-знижка
            </h2>
            <p className="text-sm text-muted-foreground">
              Ваш партнерський тариф визначає одразу два: скільки кабінетів ваших співробітників включено
              та яку знижку отримують ваші клієнти на свої тарифи (Smart / Premium / Business).
              За замовчуванням знижка йде клієнту; у кабінеті ви можете перемкнути на <strong>revenue share</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {tiers.map((t) => {
              const Icon = t.icon;
              return (
                <Card key={t.id} className={`p-5 h-full border-2 ${t.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground">{t.name}</h3>
                    </div>
                    <Badge variant="outline">−{t.percent}%</Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{t.who}</p>
                  <p className="text-xs text-muted-foreground mb-3">{t.seats}</p>
                  <div className="text-3xl font-bold text-foreground mb-1">−{t.percent}%</div>
                  <p className="text-xs text-muted-foreground">
                    знижка клієнтам на тариф (Smart / Premium / Business)
                  </p>
                </Card>
              );
            })}
          </div>

          <ResellerCalculator />
          <div className="text-center mt-4">
            <Button asChild variant="link" className="gap-1">
              <Link to="/partners/program">
                Дивитися детальну економіку співпраці <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Чому партнерство */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6">
            Чому партнерство, а не аутсорс через нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {advantages.map((a) => (
              <Card key={a.title} className="p-5 h-full">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  {a.title.includes("Reseller") && <Wallet className="h-4 w-4 text-primary" />}
                  {a.title}
                </h3>
                <p className="text-sm text-muted-foreground">{a.text}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="gap-1">
            <Link to="/learn/certification">
              Стати партнером — безкоштовно <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Сертифікація — безкоштовна · 0% комісії · Reseller-знижка −25/30/35% для клієнтів
          </p>
        </div>
      </div>
    </section>
  );
};
