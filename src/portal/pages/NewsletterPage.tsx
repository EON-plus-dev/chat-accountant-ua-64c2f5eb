import { useState, useMemo, FormEvent } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Mail, Users, ArrowRight, CalendarDays, Compass, Link2, Wrench, Tag } from "lucide-react";
import { createSubscription } from "@/portal/services/subscriptions";
import { analytics } from "@/portal/services/analytics";
import { NEWSLETTER_ISSUES, type NewsletterCategory } from "@/portal/data/newsletter";
import { ARTICLES } from "@/portal/data/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";

const CATEGORIES: NewsletterCategory[] = ['Податки', 'ФОП', 'Звітність', 'Бізнес', 'Право'];

/** Найближчий понеділок від указаної дати (включно: якщо сьогодні Пн — повертає сьогодні). */
function getNextMonday(from: Date = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay(); // 0=Нд, 1=Пн, ...
  const diff = (1 - day + 7) % 7; // 0 якщо Пн
  d.setDate(d.getDate() + diff);
  return d;
}

const formatNextMonday = (d: Date) =>
  d.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });

const NewsletterPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const nextIssueDate = useMemo(() => formatNextMonday(getNextMonday()), []);
  const lastIssue = NEWSLETTER_ISSUES[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Введіть коректну email-адресу");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await createSubscription({
      email,
      source: "lead_magnet",
      topics: ["all"],
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitState("success");
      analytics.subscriptionCompleted("newsletter");
    } else {
      setSubmitState("error");
      setErrorMessage(result.error || "Помилка. Спробуйте ще раз.");
    }
  };

  return (
    <PortalLayout
      meta={{
        title: "Дайджест FINTODO — щотижневий огляд для ФОП, бухгалтерів і бізнесу",
        description: "Щопонеділка о 9:00 — головні зміни у податках, звітності та праві для ФОП, бухгалтерів і бізнесу. 5 хвилин читання, без води.",
        canonical: "https://fintodo.com.ua/newsletter",
      }}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Дайджест FINTODO",
          description: "Щотижневий огляд змін з оподаткування, звітності та права для ФОП, бухгалтерів і бізнесу в Україні.",
          url: "https://fintodo.com.ua/newsletter",
          audience: { "@type": "Audience", audienceType: "ФОП, бухгалтери, бізнес" },
        }}
      />
      <JsonLd data={getBreadcrumbSchema([{ name: "Головна", url: SITE_URL }, { name: "Публікації", url: `${SITE_URL}/publications` }, { name: "Дайджест", url: `${SITE_URL}/newsletter` }])} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Публікації", to: "/publications" }, { label: "Дайджест" }]} />

        {/* Header */}
        <div className="text-center py-8 space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Дайджест FINTODO
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Щотижня коротко і по суті: податки, звітність і важливі зміни для <strong className="text-foreground/90">ФОП, бухгалтерів і бізнесу</strong>. Щопонеділка о 9:00 — 5 хв читання.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {CATEGORIES.map((c) => (
              <Badge key={c} variant="outline" className="text-xs font-normal">{c}</Badge>
            ))}
          </div>
        </div>

        {/* Subscription Card */}
        <Card className="p-6 sm:p-6 mb-8">
          {submitState === "success" ? (
            <div className="text-center space-y-3 py-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold">Ви підписані!</h3>
              <p className="text-sm text-muted-foreground">
                Перший дайджест отримаєте в наступний понеділок, {nextIssueDate}.
              </p>
            </div>
          ) : (
            <>
              {/* Next-issue teaser */}
              <div className="flex items-start gap-2 mb-4 rounded-md bg-primary/5 border border-primary/15 px-3 py-2 text-xs">
                <CalendarDays className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-foreground">Наступний випуск — понеділок, {nextIssueDate}.</strong>
                  {lastIssue && <> Минулого тижня: «{lastIssue.title}».</>}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Підпишіться на дайджест</h2>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="your@email.ua"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSubmitting} className="shrink-0">
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Зберігаємо...</>
                  ) : (
                    "Підписатись"
                  )}
                </Button>
              </form>
              {errorMessage && (
                <p className="text-xs text-destructive mt-2">{errorMessage}</p>
              )}
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-foreground">Лише головне, без води — 5 хв читання щопонеділка</p>
                <p className="text-xs text-muted-foreground">1 840 підписників · Без спаму · Скасування в 1 клік</p>
              </div>

              {/* Що отримаєте */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/60">
                <div className="flex items-start gap-2">
                  <Compass className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">Швидкий огляд тижня</p>
                    <p className="text-xs text-muted-foreground">Усі ключові зміни за 5 хвилин</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Link2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">Першоджерела</p>
                    <p className="text-xs text-muted-foreground">Посилання на закони, листи, роз'яснення</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Wrench className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">Підказки до інструментів</p>
                    <p className="text-xs text-muted-foreground">Як застосувати у FINTODO відразу</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Archive */}
        <section className="pb-16">
          <h2 className="text-2xl font-bold mb-6">Архів дайджестів</h2>
          <div className="space-y-5">
            {NEWSLETTER_ISSUES.map((issue) => {
              const linkedArticles = issue.articleIds
                .map((id) => ARTICLES.find((a) => a.id === id))
                .filter((a): a is NonNullable<typeof a> => Boolean(a));
              const visibleHighlights = issue.highlights.slice(0, 3);

              return (
                <Card key={issue.id} className="p-5 sm:p-6 hover:border-primary/30 transition-colors">
                  {/* Compact meta row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="shrink-0 text-[11px]">
                        Випуск #{issue.issue}
                      </Badge>
                      {issue.category && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary uppercase tracking-wide">
                          <Tag className="h-3 w-3" />
                          {issue.category}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{issue.date}</span>
                  </div>

                  {/* Title — accent (clickable) */}
                  <Link
                    to={`/newsletter/${issue.id}`}
                    className="block hover:text-primary transition-colors"
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-snug mb-1">
                      {issue.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">{issue.summary}</p>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    {issue.readingTime} хв читання · {issue.sections.length} тем
                  </p>

                  {/* Highlights — компактні, по 1 рядку */}
                  <ul className="space-y-1 mb-4">
                    {visibleHighlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-foreground/90">
                        <span className="text-primary shrink-0 mt-0.5">▸</span>
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Linked articles — лівий акцент */}
                  {linkedArticles.length > 0 && (
                    <div className="border-l-2 border-primary/30 pl-3 mb-4">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Матеріали випуску
                      </p>
                      <div className="space-y-1">
                        {linkedArticles.map((article) => (
                          <Link
                            key={article.id}
                            to={`/articles/${article.slug}`}
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <span>→</span>
                            <span>{article.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {issue.subscribersAtTime.toLocaleString("uk-UA")} підписників
                    </span>
                    {linkedArticles.length > 0 && (
                      <Link
                        to={`/newsletter/${issue.id}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                      >
                        Читати випуск
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
};

export default NewsletterPage;
