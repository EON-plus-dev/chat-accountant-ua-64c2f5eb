import { useState } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Megaphone,
  Users,
  Eye,
  Target,
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  Mail,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface Format {
  id: string;
  title: string;
  description: string;
  spec: string;
  priceFrom: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FORMATS: Format[] = [
  {
    id: "native-article",
    title: "Нативна стаття",
    description:
      "Експертна стаття від вашого бренду в розділі «Публікації». Залишається назавжди, генерує SEO-трафік.",
    spec: "до 8 000 знаків · 1 CTA · UTM-розмітка · індексація Google",
    priceFrom: "від 24 000 ₴",
    badge: "Топ ROI",
    icon: GraduationCap,
  },
  {
    id: "directory-premium",
    title: "Premium-картка в довідниках",
    description:
      "Підняття у каталозі бухгалтерів, банків, страхових. Бейдж «Перевірений партнер» + лід-форма.",
    spec: "позиція 1–3 · бейдж · форма заявок · аналітика переглядів",
    priceFrom: "від 8 000 ₴/міс",
    icon: Building2,
  },
  {
    id: "newsletter",
    title: "Інтеграція в дайджест",
    description:
      "Блок у тижневому дайджесті FINTODO. Аудиторія — власники ФОП, ТОВ, бухгалтери.",
    spec: "1 випуск · 35K+ підписників · open rate ~38%",
    priceFrom: "від 12 000 ₴",
    icon: Mail,
  },
  {
    id: "calculator-sponsor",
    title: "Спонсорство калькулятора",
    description:
      "Логотип і CTA на сторінці профільного калькулятора (іпотека, депозит, автокредит).",
    spec: "1 калькулятор · 30 днів · логотип + CTA + посилання",
    priceFrom: "від 18 000 ₴",
    icon: Target,
  },
  {
    id: "webinar",
    title: "Спільний вебінар",
    description:
      "Спікер від вас + наша аудиторія. Запис залишається в Навчальному центрі назавжди.",
    spec: "60 хв · промо · повтор у дайджесті · запис у бібліотеці",
    priceFrom: "від 35 000 ₴",
    badge: "Лідогенерація",
    icon: Briefcase,
  },
  {
    id: "ticker",
    title: "Breaking-стрічка",
    description:
      "Анонс у верхній стрічці на 24–72 години. Видно на головній і ключових хабах.",
    spec: "до 80 знаків · 1 посилання · до 72 год",
    priceFrom: "від 6 000 ₴",
    icon: Megaphone,
  },
];

const AUDIENCE_STATS = [
  { value: "180K+", label: "візитів на місяць" },
  { value: "62%", label: "власники ФОП/ТОВ" },
  { value: "21%", label: "бухгалтери та фінансисти" },
  { value: "17%", label: "фізособи з активами" },
];

const ReklamaPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const contact = String(form.get("contact") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (name.length < 2 || contact.length < 3) {
      toast.error("Заповніть ім'я та контакт");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("partner_leads").insert({
        name,
        contact,
        message: message || null,
        source: "reklama_portal",
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Заявку надіслано — звʼяжемося протягом 1 робочого дня");
    } catch (err) {
      console.error(err);
      toast.error("Не вдалося надіслати. Спробуйте email: ads@fintodo.ua");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout
      meta={{
        title: "Реклама на FINTODO — нативні формати для фінтех і бізнесу",
        description:
          "Розмістіть рекламу на найбільшому фінансово-податковому порталі України. Нативні статті, premium-картки в довідниках, дайджест, калькулятори та вебінари.",
        canonical: `${SITE_URL}/reklama`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Реклама", url: `${SITE_URL}/reklama` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Реклама" }]} />

        <div className="space-y-10 pb-16">
          {/* Hero */}
          <header className="space-y-4">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" /> Партнерська реклама
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground max-w-3xl">
              Реклама, яку ваша аудиторія справді читає
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              FINTODO — найбільший фінансово-податковий портал України. Ми не показуємо банери —
              ми робимо нативні формати, що працюють у довгу.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <a href="#brief">Залишити заявку <ArrowRight className="ml-2 w-4 h-4" /></a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="mailto:ads@fintodo.ua">ads@fintodo.ua</a>
              </Button>
            </div>
          </header>

          {/* Audience stats */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Хто наша аудиторія
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AUDIENCE_STATS.map((s) => (
                <Card key={s.label} className="p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </Card>
              ))}
            </div>
          </section>

          {/* Formats */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> Формати розміщення
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FORMATS.map((f) => {
                const Icon = f.icon;
                return (
                  <Card key={f.id} className="p-5 space-y-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground">{f.title}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{f.description}</p>
                        </div>
                      </div>
                      {f.badge && <Badge>{f.badge}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground border-t border-border/50 pt-3">
                      {f.spec}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{f.priceFrom}</span>
                      <Button asChild variant="ghost" size="sm">
                        <a href="#brief">Замовити</a>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Why us */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Чому це працює</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Контекст замість шуму",
                  text: "Ваш продукт зʼявляється там, де користувач уже шукає рішення — у калькуляторі, гайді, довіднику.",
                },
                {
                  title: "Платоспроможна аудиторія",
                  text: "Власники бізнесу, фінансисти, бухгалтери. Середній чек рішень, що вони купують — від 5 000 ₴.",
                },
                {
                  title: "Прозора аналітика",
                  text: "Щомісячний звіт: покази, кліки, ліди, UTM. Без чорних скриньок.",
                },
              ].map((b) => (
                <Card key={b.title} className="p-4 space-y-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.text}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Brief */}
          <section id="brief" className="scroll-mt-20">
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              {submitted ? (
                <div className="text-center space-y-3 py-6">
                  <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                  <h2 className="text-xl font-semibold">Дякуємо! Заявку отримано</h2>
                  <p className="text-sm text-muted-foreground">
                    Менеджер звʼяжеться з вами протягом 1 робочого дня з медіа-кітом і прикладами.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-1">Брифінг за 60 секунд</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Розкажіть, що рекламуємо — менеджер підготує підбірку форматів і медіа-кіт.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="name">Імʼя / Компанія</Label>
                        <Input id="name" name="name" required maxLength={100} />
                      </div>
                      <div>
                        <Label htmlFor="contact">Email або телефон</Label>
                        <Input id="contact" name="contact" required maxLength={200} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="message">Що рекламуємо (необов'язково)</Label>
                      <Textarea id="message" name="message" maxLength={2000} rows={3} placeholder="Продукт, цільова аудиторія, бюджет..." />
                    </div>
                    <Button type="submit" disabled={submitting} size="lg" className="w-full sm:w-auto">
                      {submitting ? "Надсилаємо…" : "Отримати медіа-кіт"}
                    </Button>
                  </form>
                </>
              )}
            </Card>
          </section>

          <div className="text-center text-sm text-muted-foreground">
            Партнер? <Link to="/partners" className="text-primary hover:underline">Окрема програма для бухгалтерів та агенцій →</Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default ReklamaPage;
