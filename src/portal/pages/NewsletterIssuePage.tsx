import { useState, useEffect, useMemo, FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CalendarDays, Clock, Users, Tag, Share2, Check,
  ExternalLink, Mail, Loader2, BookOpen, Wrench, Lightbulb, ChevronLeft, ChevronRight,
} from "lucide-react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  getNewsletterIssueById,
  getAdjacentIssues,
  getRelatedIssues,
  type NewsletterIssue,
} from "@/portal/data/newsletter";
import { ARTICLES } from "@/portal/data/articles";
import { createSubscription } from "@/portal/services/subscriptions";
import { analytics } from "@/portal/services/analytics";
import { useToast } from "@/hooks/use-toast";

const InlineSubscribe = ({ compact = false }: { compact?: boolean }) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Введіть коректний email"); return; }
    setError("");
    setSubmitting(true);
    const res = await createSubscription({ email, source: "lead_magnet", topics: ["all"] });
    setSubmitting(false);
    if (res.success) {
      setDone(true);
      analytics.subscriptionCompleted("newsletter_issue");
    } else {
      setError(res.error || "Помилка. Спробуйте ще раз.");
    }
  };

  if (done) {
    return (
      <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-sm text-foreground">Підписка оформлена. Наступний випуск — у понеділок о 9:00.</p>
      </Card>
    );
  }

  return (
    <Card className={compact ? "p-4" : "p-5 sm:p-6"}>
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Отримуйте такі випуски на пошту</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="your@email.ua"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={submitting} className="shrink-0">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Зберігаємо…</> : "Підписатись"}
        </Button>
      </form>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      <p className="text-xs text-muted-foreground mt-2">Щопонеділка о 9:00 · 5 хв читання · скасування в 1 клік</p>
    </Card>
  );
};

const NewsletterIssuePage = () => {
  const { issueId } = useParams<{ issueId: string }>();
  const { toast } = useToast();

  const issue = useMemo(() => (issueId ? getNewsletterIssueById(issueId) : undefined), [issueId]);
  const { newer, older } = useMemo(
    () => (issueId ? getAdjacentIssues(issueId) : { newer: undefined, older: undefined }),
    [issueId],
  );
  const related = useMemo(() => (issueId ? getRelatedIssues(issueId, 3) : []), [issueId]);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Скрол вгору при зміні випуску
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [issueId]);

  // Sticky-бар підписки після 60% сторінки
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? window.scrollY / total : 0;
      setShowStickyBar(ratio > 0.5 && ratio < 0.95);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!issue) return <Navigate to="/newsletter" replace />;

  const url = `${SITE_URL}/newsletter/${issue.id}`;

  const handleShare = async () => {
    const shareData = { title: issue.title, text: issue.summary, url };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Посилання скопійовано", description: "Поділіться випуском з колегами." });
      }
    } catch {
      // користувач скасував — нічого не робимо
    }
  };

  return (
    <PortalLayout
      meta={{
        title: `Випуск #${issue.issue}: ${issue.title} — Дайджест FINTODO`,
        description: issue.summary,
        canonical: url,
      }}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: issue.title,
          description: issue.summary,
          datePublished: issue.publishedAt,
          author: { "@type": "Organization", name: issue.authorName || "FINTODO" },
          publisher: { "@type": "Organization", name: "FINTODO", url: SITE_URL },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          articleSection: issue.category,
        }}
      />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Публікації", url: `${SITE_URL}/publications` },
          { name: "Дайджест", url: `${SITE_URL}/newsletter` },
          { name: `Випуск #${issue.issue}`, url },
        ])}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-16">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Публікації", to: "/publications" },
            { label: "Дайджест", to: "/newsletter" },
            { label: `Випуск #${issue.issue}` },
          ]}
        />

        {/* HEADER */}
        <header className="pt-4 pb-8 space-y-5 border-b border-border/40">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">Випуск #{issue.issue}</Badge>
            {issue.category && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary uppercase tracking-wide">
                <Tag className="h-3 w-3" />
                {issue.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {issue.date}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {issue.readingTime} хв читання
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight">
            {issue.title}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            {issue.summary}
          </p>

          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {issue.subscribersAtTime.toLocaleString("uk-UA")} підписників
              </span>
              {issue.authorName && (
                <>
                  <span className="text-border">·</span>
                  <span>{issue.authorName}</span>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
              <Share2 className="h-3.5 w-3.5" />
              Поділитись
            </Button>
          </div>
        </header>

        {/* HIGHLIGHTS HERO */}
        <Card className="my-8 p-5 sm:p-6 bg-gradient-to-br from-primary/[0.04] to-transparent border-primary/15">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Головне у випуску
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {issue.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-snug">{h}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* INLINE CTA */}
        <div className="mb-10">
          <InlineSubscribe />
        </div>

        {/* INTRO */}
        <section className="mb-10">
          <p className="text-base sm:text-lg leading-relaxed text-foreground/90">
            {issue.intro}
          </p>
        </section>

        {/* SECTIONS */}
        <div className="space-y-12">
          {issue.sections.map((s, idx) => {
            const linkedArticle = s.articleId ? ARTICLES.find(a => a.id === s.articleId) : undefined;
            return (
              <section key={idx} className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none mt-0.5">{s.icon}</span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                    {s.title}
                  </h2>
                </div>

                <p className="text-base leading-relaxed text-foreground/90">
                  {s.body}
                </p>

                {s.takeaway && (
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-md px-4 py-3 flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                        Що робити
                      </p>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {s.takeaway}
                      </p>
                    </div>
                  </div>
                )}

                {s.sources && s.sources.length > 0 && (
                  <div className="text-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Першоджерела
                    </p>
                    <ul className="space-y-1">
                      {s.sources.map((src, i) => (
                        <li key={i}>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {src.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  {linkedArticle && (
                    <Link
                      to={`/articles/${linkedArticle.slug}`}
                      className="flex-1 inline-flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 hover:border-primary/40 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Повний гайд
                          </p>
                          <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {linkedArticle.title}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                    </Link>
                  )}
                  {s.toolSlug && s.toolLabel && (
                    <Link
                      to={`/tools/${s.toolSlug}`}
                      className="sm:w-auto inline-flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 hover:border-primary/40 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start gap-2.5">
                        <Wrench className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Інструмент
                          </p>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {s.toolLabel}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                    </Link>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* EDITOR NOTE */}
        {issue.editorNote && (
          <Card className="mt-12 p-5 sm:p-6 bg-muted/30 border-dashed">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                {(issue.authorName || "FT").slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1.5 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Від редакції
                </p>
                <p className="text-base italic text-foreground/90 leading-relaxed">
                  «{issue.editorNote}»
                </p>
                {issue.authorName && (
                  <p className="text-xs text-muted-foreground">
                    — {issue.authorName}{issue.authorRole ? `, ${issue.authorRole}` : ""}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* BETWEEN-ISSUES NAV */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12 pt-8 border-t border-border/40">
          {older ? (
            <Link
              to={`/newsletter/${older.id}`}
              className="group rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                <ChevronLeft className="h-3 w-3" /> Старіший випуск
              </p>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                #{older.issue} · {older.title}
              </p>
            </Link>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground flex items-center">
              Це найстаріший випуск
            </div>
          )}
          {newer ? (
            <Link
              to={`/newsletter/${newer.id}`}
              className="group rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all sm:text-right"
            >
              <p className="flex items-center sm:justify-end gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Новіший випуск <ChevronRight className="h-3 w-3" />
              </p>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                #{newer.issue} · {newer.title}
              </p>
            </Link>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground flex items-center sm:justify-end">
              Це найсвіжіший випуск
            </div>
          )}
        </nav>

        {/* RELATED */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold mb-4">Інші випуски</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map(r => (
                <Link
                  key={r.id}
                  to={`/newsletter/${r.id}`}
                  className="group rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-2 text-[10px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">#{r.issue}</Badge>
                    {r.category && <span className="uppercase tracking-wide">{r.category}</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {r.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2">{r.date} · {r.readingTime} хв</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* BACK TO ARCHIVE */}
        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/newsletter">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Усі випуски дайджесту
            </Link>
          </Button>
        </div>
      </div>

      {/* STICKY MOBILE SUBSCRIBE BAR */}
      {showStickyBar && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border shadow-lg p-3 animate-in slide-in-from-bottom-2 duration-300">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <p className="text-xs font-medium text-foreground flex-1 leading-tight">
              Сподобалось? Отримуйте такі випуски на пошту.
            </p>
            <Button
              size="sm"
              onClick={() => document.getElementById("issue-subscribe-anchor")?.scrollIntoView({ behavior: "smooth", block: "center" })}
              asChild
            >
              <Link to="/newsletter">Підписатись</Link>
            </Button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default NewsletterIssuePage;
