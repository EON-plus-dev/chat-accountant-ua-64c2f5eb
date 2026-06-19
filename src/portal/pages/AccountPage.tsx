import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Bell, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { ArticleCard } from "@/portal/components/ArticleCard";
import { DeadlineCard } from "@/portal/components/DeadlineCard";
import { AudienceToggle, type AudienceFilter } from "@/portal/components/AudienceToggle";
import { ContextualCta } from "@/portal/components/ContextualCta";
import { useSavedArticles } from "@/portal/hooks/useSavedArticles";
import { ARTICLES } from "@/portal/data/articles";
import { DEADLINES } from "@/portal/data/deadlines";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const AUDIENCE_LABELS: Record<string, string> = {
  business: "Для бізнесу",
  personal: "Для фізосіб",
  accountant: "Для бухгалтерів",
  all: "Всі матеріали",
};

const TOPICS = ["ФОП", "ПДВ", "Зарплата", "Корпоративне", "Ліцензії"];
const FOP_GROUPS = ["ФОП 1", "ФОП 2", "ФОП 3", "ТОВ", "Фізособа"];
const CITIES = ["Київ", "Харків", "Одеса", "Дніпро", "Львів", "Інше"];
const BANKS = ["Monobank", "ПриватБанк", "ПУМБ", "Ощадбанк", "Інший"];

const AccountPage = () => {
  const userName = localStorage.getItem("fint_user_name");
  const { saved, count } = useSavedArticles();

  const [audience, setAudience] = useState<AudienceFilter>(() => {
    const stored = localStorage.getItem("fint_audience");
    return (stored as AudienceFilter) || "all";
  });

  const [selectedTopics, setSelectedTopics] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("fint_alert_topics") || "[]"); }
    catch { return []; }
  });

  const [fopGroup, setFopGroup] = useState<string>(() => localStorage.getItem("fint_fop_group") || "");
  const [city, setCity] = useState<string>(() => localStorage.getItem("fint_city") || "");
  const [bank, setBank] = useState<string>(() => localStorage.getItem("fint_bank") || "");

  const handleAudienceChange = (v: AudienceFilter) => {
    setAudience(v);
    localStorage.setItem("fint_audience", v);
  };

  const toggleTopic = (topic: string) => {
    const next = selectedTopics.includes(topic)
      ? selectedTopics.filter((t) => t !== topic)
      : [...selectedTopics, topic];
    setSelectedTopics(next);
    localStorage.setItem("fint_alert_topics", JSON.stringify(next));
  };

  const handleFopGroup = (v: string) => { setFopGroup(v === fopGroup ? "" : v); localStorage.setItem("fint_fop_group", v === fopGroup ? "" : v); };
  const handleCity = (v: string) => { setCity(v === city ? "" : v); localStorage.setItem("fint_city", v === city ? "" : v); };
  const handleBank = (v: string) => { setBank(v === bank ? "" : v); localStorage.setItem("fint_bank", v === bank ? "" : v); };

  // Saved articles
  const savedArticles = ARTICLES.filter((a) => saved.includes(a.id)).slice(0, 4);

  // Deadlines filtered by audience
  const relevantDeadlines = DEADLINES
    .filter((d) => {
      if (audience === "business") return true;
      if (audience === "personal") return d.taxType === "all";
      return true;
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  return (
    <PortalLayout
      meta={{
        title: "Мій кабінет — FINTODO",
        description: "Збережені матеріали, підписки та персональний дашборд.",
        canonical: "https://fintodo.com.ua/account",
      }}
    >
      <JsonLd data={getBreadcrumbSchema([{ name: "Головна", url: SITE_URL }, { name: "Мій кабінет", url: `${SITE_URL}/account` }])} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Мій кабінет" }]} />

        {/* Section 1 — Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
            {userName ? userName[0].toUpperCase() : "?"}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {userName ? `Вітаємо, ${userName}!` : "Мій кабінет"}
            </h1>
            <p className="text-muted-foreground text-sm">Персональний фінансовий дашборд</p>
          </div>
        </div>

        {/* Section 2 — Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
          <Card className="p-4 text-center space-y-1">
            <Bookmark className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">Збережених матеріалів</p>
          </Card>
          <Card className="p-4 text-center space-y-1">
            <Users className="h-5 w-5 mx-auto text-primary" />
            <p className="text-sm font-semibold text-foreground">{AUDIENCE_LABELS[audience]}</p>
            <p className="text-xs text-muted-foreground">Аудиторія</p>
          </Card>
          <Card className="p-4 text-center space-y-1">
            <Bell className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold text-foreground">{selectedTopics.length}</p>
            <p className="text-xs text-muted-foreground">Теми</p>
          </Card>
        </div>

        {/* Section 3 — Saved articles */}
        <section className="py-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Збережені матеріали</h2>
          {savedArticles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 gap-1">
                {savedArticles.map((a) => (
                  <ArticleCard key={a.id} article={a} size="compact" />
                ))}
              </div>
              <Link to="/saved" className="text-sm font-medium text-primary hover:underline">
                Всі збережені ({count}) →
              </Link>
            </>
          ) : (
            <Card className="p-8 text-center space-y-3">
              <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Зберігайте цікаві статті кнопкою 🔖</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/taxes">Перейти до статей →</Link>
              </Button>
            </Card>
          )}
        </section>

        {/* Section 4 — Deadlines */}
        <section className="py-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Найближчі дедлайни
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {relevantDeadlines.map((d) => (
              <div key={d.id} className="min-w-[220px] flex-1">
                <DeadlineCard deadline={d} />
              </div>
            ))}
          </div>
          <Link to="/tools/calendar" className="text-sm font-medium text-primary hover:underline">
            Відкрити повний календар →
          </Link>
        </section>

        {/* Section 5 — Settings */}
        <section className="py-6 space-y-6 border-t border-border">
          <h2 className="text-lg font-semibold text-foreground">Налаштування</h2>

          {/* Audience */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Аудиторія контенту</p>
            <AudienceToggle value={audience} onChange={handleAudienceChange} />
            <p className="text-xs text-muted-foreground">
              Налаштування застосовується до стрічки статей на головній
            </p>
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Теми сповіщень</p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => {
                const active = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Зміни зберігаються автоматично</p>
          </div>

          {/* FOP Group */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Група ФОП / тип</p>
            <div className="flex flex-wrap gap-2">
              {FOP_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => handleFopGroup(g)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    fopGroup === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Місто</p>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCity(c)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    city === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Bank */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Банк</p>
            <div className="flex flex-wrap gap-2">
              {BANKS.map((b) => (
                <button
                  key={b}
                  onClick={() => handleBank(b)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    bank === b
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Ці дані покращують якість відповідей AI-консультанта</p>
          </div>
        </section>

        {/* Section 6 — Recommended */}
        <section className="py-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Рекомендовано для вас</h2>
          <div className="space-y-1">
            {ARTICLES
              .filter((a) =>
                audience === "all" ? true : a.audience === audience || a.audience === "both"
              )
              .sort((a, b) => b.views - a.views)
              .slice(0, 3)
              .map((a) => (
                <ArticleCard key={a.id} article={a} size="compact" />
              ))}
          </div>
        </section>

        {/* Section 7 — CTA */}
        <section className="py-6">
          <ContextualCta
            title="Автоматизуйте весь облік у FINTODO"
            body="Розрахунки ЄСВ, єдиного податку, нагадування дедлайнів — все автоматично."
            ctaLabel="Відкрити FINTODO →"
            ctaHref={CTA_CHECKOUT_URL}
          />
        </section>
      </div>
    </PortalLayout>
  );
};

export default AccountPage;

