import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, RefreshCw, Info, Clock, Tag } from "lucide-react";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeoHead, BASE_URL } from "@/components/seo/SeoHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { ConsultationCard } from "@/components/landing/ConsultationCard";
import { PortalHeader } from "@/portal/layouts/PortalHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

import { BackToTop } from "@/portal/components/BackToTop";
import ConsultationHistory from "@/components/consultations/ConsultationHistory";
import { FollowUpChat } from "@/components/consultations/FollowUpChat";
import { EntrySiblingsSidebar, SiblingItem } from "@/portal/components/EntrySiblingsSidebar";
import { getRelevanceBadge } from "@/lib/relevanceBadge";
import { formatDate } from "@/lib/formatters";
import {
  renderMarkdown,
  createMetaDescription,
  stripMarkdown,
  extractTocItems,
} from "@/lib/markdownRenderer";
import { preprocessConsultationContent } from "@/lib/contentPreprocessor";
import type { MockConsultation } from "@/config/consultationMockData";

/* ── Props ── */

interface Props {
  item: MockConsultation;
  related: MockConsultation[];
  onTagClick: (tag: string) => void;
  siblings?: {
    items: SiblingItem[];
    currentSlug: string;
    basePath: string;
    title?: string;
    backHref?: string;
    backLabel?: string;
  };
}

/* ── Animation variants ── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

/* ── Helpers ── */

const calcReadingTime = (text: string): number =>
  Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));

/* ── Component ── */

const UnifiedConsultationLayout = ({ item, related, onTagClick, siblings }: Props) => {
  /* Hub detection */
  const isHub =
    item.layout === "hub" ||
    item.answer.split(/\s+/).filter(Boolean).length > 800;

  /* Preprocessed answer with :::container blocks */
  const processedAnswer = useMemo(
    () => preprocessConsultationContent(item.answer, isHub, (item.audience as "business" | "individual") || "business"),
    [item.answer, isHub, item.audience],
  );

  /* TOC */
  const tocItems = useMemo(() => extractTocItems(processedAnswer), [processedAnswer]);
  const showToc = isHub && tocItems.length >= 3;

  /* Reading time */
  const wordCount = processedAnswer.split(/\s+/).filter(Boolean).length;
  const readingTime = calcReadingTime(processedAnswer);

  /* Rendered content HTML */
  const contentHtml = useMemo(() => renderMarkdown(processedAnswer), [processedAnswer]);

  /* Scroll progress (hub only) */
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    if (!isHub) return;
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress(
      docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
    );
  }, [isHub]);

  useEffect(() => {
    if (!isHub) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, isHub]);

  /* IntersectionObserver for active TOC item */
  useEffect(() => {
    if (!showToc) return;
    const elements = tocItems
      .map((t) => document.getElementById(t.id))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showToc, tocItems]);

  /* ── SEO ── */
  const canonical = `${BASE_URL}/consultations/${item.slug}`;
  const seoTitle = item.seoTitle || item.question;
  const metaDesc =
    item.seoDescription || createMetaDescription(item.answer);

  /* Display title for H1 */
  const displayTitle = item.heroTitle || item.question;

  /* Breadcrumb schema (always) */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Бібліотека",
        item: `${BASE_URL}/consultant?tab=forum`,
      },
      { "@type": "ListItem", position: 3, name: item.question },
    ],
  };

  /* Main schema: Article (hub) or QAPage (standard) */
  const mainSchema = isHub
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: seoTitle,
        description: metaDesc,
        datePublished: item.date,
        dateModified: item.updatedDate || item.date,
        inLanguage: "uk",
        url: canonical,
        wordCount,
        publisher: {
          "@type": "Organization",
          name: "FINTODO",
          url: BASE_URL,
        },
        ...(item.headerBadges && {
          about: item.headerBadges.slice(0, 3).map((b) => ({
            "@type": "Thing",
            name: b,
          })),
        }),
      }
    : {
        "@context": "https://schema.org",
        "@type": "QAPage",
        url: canonical,
        datePublished: item.date,
        dateModified: item.updatedDate || item.date,
        publisher: {
          "@type": "Organization",
          name: "FINTODO",
          url: BASE_URL,
        },
        mainEntity: {
          "@type": "Question",
          name: item.question,
          dateCreated: item.date,
          ...(item.updatedDate && { dateModified: item.updatedDate }),
          answerCount: 1,
          acceptedAnswer: {
            "@type": "Answer",
            text: stripMarkdown(item.answer),
            dateCreated: item.date,
            ...(item.updatedDate && { dateModified: item.updatedDate }),
            author: { "@type": "Organization", name: "FINTODO" },
          },
        },
      };

  /* FAQ schema (hub with faqItems) */
  const faqSchema =
    item.faqItems && item.faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: item.faqItems.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  /* CTA text */
  const ctaTitle =
    item.ctaTitle || "Потрібна допомога з цим питанням?";
  const ctaDescription =
    item.ctaDescription ||
    "AI-бухгалтер FINTODO розрахує податки та підготує декларацію автоматично";

  return (
    <>
      <SeoHead
        title={`${seoTitle} | FINTODO`}
        description={metaDesc}
        canonical={canonical}
        ogType="article"
        publishedTime={item.date}
        modifiedTime={item.updatedDate || item.date}
        locale={isHub ? "uk_UA" : undefined}
        keywords={item.seoKeywords}
      />
      <JsonLd data={mainSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* ── Progress bar (hub only) ── */}
      {isHub && (
        <div className="kved-progress-bar" aria-hidden="true">
          <Progress
            value={scrollProgress}
            className="h-[3px] rounded-none bg-transparent [&>div]:bg-primary"
          />
        </div>
      )}

      <PortalHeader />
      

      <main className="min-h-screen bg-muted/30 dark:bg-background">
        <div className={siblings ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8 pt-8 sm:pt-12" : ""}>
          {siblings && (
            <EntrySiblingsSidebar
              items={siblings.items}
              currentSlug={siblings.currentSlug}
              basePath={siblings.basePath}
              title={siblings.title ?? "Консультації"}
              backHref={siblings.backHref ?? "/publications/consultations"}
              backLabel={siblings.backLabel}
            />
          )}
          <div className="flex-1 min-w-0">
            {/* ── Breadcrumbs (outside kved-article to avoid style leaking) ── */}
            <div className={siblings ? "max-w-5xl" : "max-w-5xl mx-auto px-4 pt-8 sm:pt-12"}>
              <BreadcrumbNav items={[
                { label: "Головна", to: "/" },
                { label: "Публікації", to: "/publications" },
                { label: "Консультації", to: "/publications/consultations" },
                { label: item.question },
              ]} />
            </div>

            <div className="kved-article">
              <div className="page-wrap">
            {/* ── Hero Header ── */}
            <motion.header
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="py-10 px-[var(--kved-pad)] bg-muted/50 border-b border-border/40"
              itemScope
              itemType={
                isHub
                  ? "https://schema.org/Article"
                  : "https://schema.org/Question"
              }
            >
              {item.headerBadges && item.headerBadges.length > 0 && (
                <motion.div
                  variants={fadeUp}
                  className="flex gap-2 flex-wrap mb-4"
                >
                  {item.headerBadges.map((badge, i) => (
                    <Badge
                      key={badge}
                      variant={i === 0 ? "secondary" : "outline"}
                      className="text-[11px] uppercase tracking-widest font-medium"
                    >
                      {badge}
                    </Badge>
                  ))}
                </motion.div>
              )}
              <motion.h1
                variants={fadeUp}
                itemProp={isHub ? "headline" : "name"}
                className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3"
              >
                {displayTitle}
              </motion.h1>
              {item.subtitle && (
                <motion.p
                  variants={fadeUp}
                  className="text-base text-muted-foreground leading-relaxed"
                >
                  {item.subtitle}
                </motion.p>
              )}
            </motion.header>

            {/* ── Meta Row ── */}
            <div className="kved-meta-row">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Опубліковано:{" "}
                  <time dateTime={item.date}>{formatDate(item.date)}</time>
                </span>
              </div>
              {item.updatedDate && item.updatedDate !== item.date && (
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    Оновлено:{" "}
                    <time dateTime={item.updatedDate}>
                      {formatDate(item.updatedDate)}
                    </time>
                  </span>
                </div>
              )}
              {(isHub || readingTime >= 3) && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{readingTime} хв читання</span>
                </div>
              )}
              <Badge
                variant={
                  getRelevanceBadge(item.date, item.updatedDate).variant
                }
                size="sm"
              >
                {getRelevanceBadge(item.date, item.updatedDate).label}
              </Badge>
              <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                {item.audience === "business"
                  ? "Для бізнесу"
                  : "Для фізосіб"}
              </span>
            </div>

            {/* ── Relevance Note ── */}
            {item.relevanceNote && (
              <div className="kved-relevance-note">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{item.relevanceNote}</span>
              </div>
            )}

            {/* ── Sticky TOC (hub only) ── */}
            {showToc && (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="mx-[var(--kved-pad)] mt-7 kved-sticky-toc bg-muted/50">
                  <CardContent className="p-5">
                    <div className="toc-title">Зміст консультації</div>
                    <ol className="kved-toc-list">
                      {tocItems.map((tocItem) => (
                        <li
                          key={tocItem.id}
                          className={
                            activeSection === tocItem.id ? "toc-active" : ""
                          }
                        >
                          <a href={`#${tocItem.id}`}>{tocItem.label}</a>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── Article Content ── */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div
                className="content"
                itemProp={isHub ? "articleBody" : "text"}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </motion.div>

            {/* ── Update History ── */}
            {item.history && item.history.length > 0 && (
              <div className="px-[var(--kved-pad)]">
                <ConsultationHistory
                  currentDate={item.updatedDate || item.date}
                  history={item.history}
                />
              </div>
            )}

            {/* ── Follow-up Chat ── */}
            <div className="px-[var(--kved-pad)]">
              <FollowUpChat
                consultationId={item.id}
                consultationQuestion={item.question}
                consultationAnswer={item.answer}
                audience={(item.audience as "business" | "individual") || "business"}
              />
            </div>

            {/* ── CTA + Tags + Related + Back ── */}
            <div className="px-[var(--kved-pad)] pb-8">
              {/* CTA */}
              <motion.div
                className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {ctaTitle}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {ctaDescription}
                </p>
                <Link
                  to="/#pricing"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Спробувати 14 днів безкоштовно
                </Link>
              </motion.div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/consultant?tab=forum&tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-border"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <motion.section
                className="px-[var(--kved-pad)] pb-8 border-t border-border"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">
                  Схожі консультації
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <ConsultationCard
                      key={r.id}
                      item={r}
                      onTagClick={onTagClick}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Back link */}
            <div className="px-[var(--kved-pad)] pb-8">
              <Link
                to="/consultations"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Повернутися до всіх консультацій
              </Link>
            </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
      <BackToTop />
    </>
  );
};

export default UnifiedConsultationLayout;
