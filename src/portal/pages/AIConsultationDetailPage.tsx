import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { useAiQueryBySlug, useMergedForumData } from "@/hooks/useAiChatQueries";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Badge } from "@/components/ui/badge";
import { FollowUpChat } from "@/components/consultations/FollowUpChat";
import { ActionBar } from "@/portal/components/ActionBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, getBreadcrumbSchema } from "@/portal/seo/structuredData";
import { stripMarkdown } from "@/lib/markdownRenderer";
import { timeAgo } from "@/lib/timeAgo";
import { TldrBox } from "@/portal/components/TldrBox";
import { useRecentlyViewed } from "@/portal/components/RecentlyViewedSidebar";
import {
  Bot,
  Briefcase,
  User,
  MessageSquare,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

/** Extract law/source links from markdown answer */
const extractSourceLinks = (markdown: string) => {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const links: { label: string; url: string }[] = [];
  let match;
  while ((match = linkRegex.exec(markdown)) !== null) {
    const [, label, url] = match;
    if (url.includes("zakon.rada.gov.ua") || url.includes("tax.gov.ua") || url.includes("diia.gov.ua")) {
      links.push({ label, url });
    }
  }
  return links;
};

/** Collapsible answer body for long answers */
const COLLAPSE_THRESHOLD = 600;

const AnswerBody = ({ answer }: { answer: string }) => {
  const isLong = answer.length > COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(!isLong);

  return (
    <div className="p-5 sm:p-6 space-y-4">
      <div className={expanded ? undefined : "relative max-h-48 overflow-hidden"}>
        <div className="prose prose-sm dark:prose-invert max-w-none prose-callouts">
          <ReactMarkdown>
            {expanded ? answer : answer.slice(0, 400) + "…"}
          </ReactMarkdown>
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>
      {isLong && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          Показати повну відповідь
        </button>
      )}
    </div>
  );
};

const AIConsultationDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: consultation, isLoading } = useAiQueryBySlug(slug);
  const { items: allItems } = useMergedForumData();

  useRecentlyViewed(slug);

  const related = useMemo(() => {
    if (!consultation) return [];
    return allItems
      .filter((c) => c.id !== consultation.id && c.tags.some((t) => consultation.tags.includes(t)))
      .slice(0, 4);
  }, [consultation, allItems]);

  if (isLoading) {
    return (
      <PortalLayout meta={{ title: "Завантаження... — FINTODO", description: "Завантаження консультації", canonical: `${SITE_URL}/ai-consultations` }}>
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20 text-center">
          <p className="text-muted-foreground text-sm">Завантаження...</p>
        </div>
      </PortalLayout>
    );
  }

  if (!consultation) {
    return (
      <PortalLayout meta={{ title: "Консультацію не знайдено — FINTODO", description: "Консультацію не знайдено", canonical: `${SITE_URL}/ai-consultations` }}>
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h1 className="text-xl font-bold text-foreground mb-2">Консультацію не знайдено</h1>
          <p className="text-muted-foreground text-sm mb-6">Можливо, вона була видалена або переміщена.</p>
          <Button asChild variant="outline">
            <Link to="/consultant?tab=forum">← Назад до форуму</Link>
          </Button>
        </div>
      </PortalLayout>
    );
  }

  const c = consultation;
  const plainAnswer = stripMarkdown(c.answer);
  const score = Math.round(c.viewCount / 10);
  const sourceLinks = extractSourceLinks(c.answer);
  const summary = plainAnswer.slice(0, 160).replace(/\s+\S*$/, "…");
  const pageUrl = `${SITE_URL}/ai-consultations/${c.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: c.question,
    text: plainAnswer.slice(0, 300),
    datePublished: c.date,
    ...(c.updatedDate && { dateModified: c.updatedDate }),
    url: pageUrl,
    author: { "@type": "Organization", name: "FINTODO" },
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/ViewAction", userInteractionCount: c.viewCount },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: c.followUpCount },
    ],
  };

  const qaSchema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: c.question,
      text: c.question,
      dateCreated: c.date,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: plainAnswer.slice(0, 500),
        dateCreated: c.date,
        ...(c.updatedDate && { dateModified: c.updatedDate }),
        url: pageUrl,
        author: { "@type": "Organization", name: "FINTODO", url: SITE_URL },
      },
    },
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Головна", url: SITE_URL },
    { name: "АІ-форум", url: `${SITE_URL}/ai-consultations` },
    { name: c.question.length > 60 ? c.question.slice(0, 60) + "…" : c.question, url: pageUrl },
  ]);

  return (
    <PortalLayout
      meta={{
        title: `${c.question} — AI-консультація FINTODO`,
        description: plainAnswer.slice(0, 155),
        canonical: pageUrl,
        type: 'article',
        publishedAt: c.date,
        updatedAt: c.updatedDate || c.date,
        authorName: "FINTODO AI",
        ogImage: `${SITE_URL}/og-ai-consultation.svg`,
      }}
    >
      <JsonLd data={schema} />
      <JsonLd data={qaSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "АІ-форум", to: "/consultant?tab=forum" },
            { label: c.question.length > 50 ? c.question.slice(0, 50) + "…" : c.question },
          ]}
        />

        <div className="mt-5 flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* OP Post — unified card */}
            <article className="rounded-xl border border-border/60 bg-card overflow-hidden">
              {/* Question header */}
              <div className="p-5 sm:p-6 pb-0 space-y-3">
                <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                  {c.question}
                </h1>

                {/* Meta row: avatar + author + time + audience + tags */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap pb-3 border-b border-border/40">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium text-foreground/80">FINTODO AI</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                    <Bot className="w-2.5 h-2.5" />
                    AI
                  </Badge>
                  <span>·</span>
                  <span>{timeAgo(c.updatedDate || c.date)}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5">
                    {c.audience === "business" ? <Briefcase className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {c.audience === "business" ? "Бізнес" : "Фізособи"}
                  </span>
                  {c.tags.map((t) => (
                    <Link key={t} to={`/consultant?tab=forum&tag=${encodeURIComponent(t)}`}>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 cursor-pointer hover:bg-muted">
                        {t}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              {/* TL;DR summary */}
              <div className="px-5 sm:px-6 pt-4">
                <TldrBox text={summary} />
              </div>

              {/* Answer body with collapsible */}
              <AnswerBody answer={c.answer} />

              {/* Source badges */}
              {sourceLinks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-5 sm:px-6 pb-4 pt-3 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider self-center mr-1">
                    Джерела:
                  </span>
                  {sourceLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 text-[11px] font-medium text-foreground/80 hover:bg-muted hover:text-primary transition-colors"
                    >
                      📜 {link.label}
                      <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}

              {/* Actions footer — Reddit-style below content */}
              <div className="px-5 sm:px-6 py-3 border-t border-border/40">
                <ActionBar
                  id={c.id}
                  score={score}
                  commentCount={c.followUpCount}
                  variant="full-width"
                />
              </div>
            </article>

            {/* Follow-up as comments */}
            <FollowUpChat
              consultationId={c.id}
              consultationQuestion={c.question}
              consultationAnswer={c.answer}
              audience={c.audience}
            />

            {/* Related on mobile */}
            {related.length > 0 && (
              <div className="lg:hidden space-y-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Пов'язані
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/ai-consultations/${r.slug}`}
                      className="group flex-none w-56 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors snap-start"
                    >
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {r.question}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <span>▲ {Math.round(r.viewCount / 10)}</span>
                        <span className="inline-flex items-center gap-0.5">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {r.followUpCount}
                        </span>
                        <span className="inline-flex items-center gap-0.5 ml-auto">
                          {r.audience === "business" ? <Briefcase className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — related (desktop only) */}
          {related.length > 0 && (
            <aside className="hidden lg:block lg:w-72 xl:w-80 shrink-0 space-y-3 lg:sticky lg:top-20 lg:self-start">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Пов'язані
              </h2>
              <div className="space-y-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/ai-consultations/${r.slug}`}
                    className="group flex items-start gap-2.5 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                      ▲ {Math.round(r.viewCount / 10)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {r.question}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5">
                        <MessageSquare className="w-2.5 h-2.5" />
                        {r.followUpCount}
                        <span className="inline-flex items-center gap-0.5">
                          {r.audience === "business" ? <Briefcase className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                          {r.audience === "business" ? "Бізнес" : "Фіз."}
                        </span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default AIConsultationDetailPage;