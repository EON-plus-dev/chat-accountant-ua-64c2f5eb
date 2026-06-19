import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Check, X, ExternalLink, CheckCircle, MinusCircle, XCircle, Info, Star, BadgeCheck } from "lucide-react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RankingCard } from "@/portal/components/RankingCard";
import { FaqAccordion } from "@/portal/components/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RANKING_CATEGORIES, RANKINGS } from "@/portal/data/rankings";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { getBreadcrumbSchema, getReviewSchema, getFaqSchema, getAggregateRatingSchema, SITE_URL } from "@/portal/seo/structuredData";
import { formatDate } from "@/lib/formatters";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const scoreColor = (score: number, maxScore: number) => {
  const pct = (score / maxScore) * 100;
  if (pct >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

const progressColor = (score: number, maxScore: number) => {
  const pct = (score / maxScore) * 100;
  if (pct >= 85) return "[&>div]:bg-emerald-500";
  if (pct >= 70) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
};

const METHODOLOGY_LABELS: Record<string, { label: string; weight: string }> = {
  functionality: { label: "Функціонал", weight: "40%" },
  price: { label: "Ціна", weight: "25%" },
  support: { label: "Підтримка", weight: "20%" },
  ux: { label: "UX", weight: "15%" },
};

const ANCHOR_SECTIONS = [
  { id: "position", label: "Позиція редакції" },
  { id: "testing", label: "Тестування" },
  { id: "bestfor", label: "Для кого" },
  { id: "methodology", label: "Оцінка" },
  { id: "proscons", label: "Переваги" },
  { id: "features", label: "Функції" },
  { id: "pricing", label: "Тарифи" },
  { id: "faq", label: "FAQ" },
  { id: "reviews", label: "Відгуки" },
  { id: "alternatives", label: "Альтернативи" },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        className={`w-4 h-4 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const weightDot = (w: 'critical' | 'major' | 'minor') => {
  if (w === 'critical') return "w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5";
  if (w === 'major') return "w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1.5";
  return "w-2.5 h-2.5 rounded-full border border-muted-foreground shrink-0 mt-1.5";
};

const featureIcon = (status: 'yes' | 'partial' | 'no') => {
  if (status === 'yes') return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
  if (status === 'partial') return <MinusCircle className="w-4 h-4 text-amber-500 shrink-0" />;
  return <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />;
};

// ── Rich Review Layout ──
const RichReviewPage = ({ item, category }: { item: typeof RANKINGS[0]; category: typeof RANKING_CATEGORIES[0] }) => {
  const review = item.review!;
  const heroRef = useRef<HTMLDivElement>(null);
  const [showMiniBar, setShowMiniBar] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Sticky mini-bar observer
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setShowMiniBar(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Scroll spy for anchor nav
  useEffect(() => {
    const sectionEls = ANCHOR_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!sectionEls.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sectionEls.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const alternatives = review.alternatives
    .map(a => RANKINGS.find(r => r.id === a.itemId || r.slug === a.itemId))
    .filter(Boolean) as typeof RANKINGS;

  return (
    <PortalLayout
      meta={{
        title: `${item.name} — огляд і рейтинг 2025 | FINTODO`,
        description: review.oneLiner.slice(0, 155),
        canonical: `${SITE_URL}/publications/ratings/${category.slug}/${item.slug}`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Публікації", url: `${SITE_URL}/publications` },
        { name: "Дослідження і рейтинги", url: `${SITE_URL}/publications/ratings` },
        { name: category.name, url: `${SITE_URL}/publications/ratings/${category.slug}` },
        { name: item.name, url: `${SITE_URL}/publications/ratings/${category.slug}/${item.slug}` },
      ])} />
      <JsonLd data={getReviewSchema(item, category.name)} />
      <JsonLd data={getFaqSchema(review.faq.map(f => ({ question: f.q, answer: f.a })))} />
      {review.userReviews && review.userReviews.length > 0 && (() => {
        const schema = getAggregateRatingSchema(item, category.name, review.userReviews);
        return schema ? <JsonLd data={schema} /> : null;
      })()}

      {/* SECTION 0 — Sticky Mini-Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm transition-transform duration-300 ${showMiniBar ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-5xl mx-auto px-4 h-[52px] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: item.initialsColor }}>
            {item.initials}
          </div>
          <span className="font-semibold text-foreground text-sm truncate">{item.name}</span>
          <span className="text-muted-foreground text-xs hidden sm:inline">·</span>
          <span className="font-mono text-sm font-bold text-primary hidden sm:inline">{item.score}/100</span>
          <Progress value={item.score} className="h-1.5 w-20 hidden sm:block" />
          <span className="text-xs text-muted-foreground hidden md:inline">#{item.rank} {category.name}</span>
          <div className="ml-auto">
            <Button size="sm" asChild>
              <Link to={item.href}>{review.pricing.plans[0]?.ctaLabel || "Спробувати"} →</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Breadcrumb */}
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Публікації", to: "/publications" },
          { label: "Дослідження і рейтинги", to: "/publications/ratings" },
          { label: category.name, to: `/publications/ratings/${category.slug}` },
          { label: item.name },
        ]} />

        {/* SECTION 1 — Hero */}
        <div ref={heroRef} className="grid lg:grid-cols-[1fr_340px] gap-8 mt-2">
          {/* Left */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-3xl font-bold text-primary">#{item.rank}</span>
              {item.badge && <Badge variant="success">{item.badge}</Badge>}
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ backgroundColor: item.initialsColor }}>
                {item.initials}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{item.name}</h1>
                <p className="text-sm text-muted-foreground">{category.name}</p>
              </div>
            </div>

            {/* Score */}
            <div className="mt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Загальна оцінка</p>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-5xl sm:text-6xl font-bold text-primary">{item.score}</span>
                <span className="text-lg sm:text-xl text-muted-foreground">/ 100</span>
              </div>
              <Progress value={item.score} className="h-2 mt-3" />
            </div>

            {/* Sub-scores */}
            <div className="space-y-3 mt-6">
              {review.methodology.weights.map(w => (
                <div key={w.criterion} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-28 shrink-0">
                    {w.criterion} <span className="text-xs">({w.weight}%)</span>
                  </span>
                  <Progress
                    value={(w.score / w.maxScore) * 100}
                    className={`h-2 flex-1 ${progressColor(w.score, w.maxScore)}`}
                  />
                  <span className={`font-mono text-sm font-bold w-12 text-right ${scoreColor(w.score, w.maxScore)}`}>
                    {w.score}/{w.maxScore}
                  </span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              {item.tags.map(tag => <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>)}
            </div>

            <p className="text-xs text-muted-foreground mt-4 font-mono">
              Перевірено: {review.testedDate} · {review.testedHours} год тестування · {review.testedBy}
            </p>
          </div>

          {/* Right — Sticky Action Card */}
          <div className="lg:sticky lg:top-20 self-start">
            <Card className="p-6 space-y-4">
              <div>
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{category.name}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">від {review.pricing.plans[0]?.monthlyPrice}</p>
              <hr className="border-border" />
              <ul className="space-y-2 text-sm">
                {review.pricing.freeTrialDays && (
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {review.pricing.freeTrialDays} днів безкоштовно</li>
                )}
                {!review.pricing.requiresCard && (
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Картка не потрібна</li>
                )}
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Скасування в будь-який момент</li>
              </ul>
              <Button className="w-full" asChild>
                <Link to={item.href}>{review.pricing.plans[0]?.ctaLabel || "Спробувати"} →</Link>
              </Button>
              <Button variant="ghost" className="w-full text-sm" onClick={() => scrollTo("pricing")}>
                Переглянути тарифи ↓
              </Button>
              {(() => {
                const profile = INSTITUTION_PROFILES.find(p => p.slug === item.slug);
                return profile ? (
                  <Button variant="outline" className="w-full text-sm" asChild>
                    <Link to={`/dovidnyky/ustanovy/profile/${profile.slug}`}>
                      🏛 Повний профіль установи →
                    </Link>
                  </Button>
                ) : null;
              })()}
              <hr className="border-border" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Перевірено: {review.testedDate}</p>
                <p>Оновлено: {review.lastVerified}</p>
                <p>{review.testedBy}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* SECTION 2 — Anchor Navigation */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mt-8">
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {ANCHOR_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3 — Editorial Position */}
        <section id="position" className="mt-10 scroll-mt-20">
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6">
            <p className="text-sm font-medium text-primary mb-3">📝 Позиція редакції</p>
            <p className="text-lg text-foreground leading-relaxed">{review.editorialPosition}</p>
            <hr className="border-border/50 my-4 border-dashed" />
            <p className="text-foreground">
              <span className="font-semibold">💡 Коротко: </span>
              {review.oneLiner}
            </p>
          </div>
        </section>

        {/* SECTION 4 — Testing Narrative */}
        <section id="testing" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground">🔬 Як ми тестували</h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">{review.testingNarrative}</p>

          <h3 className="font-semibold text-foreground mt-6 mb-4">Ключові висновки тестування</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {review.keyFindings.map((finding, i) => {
              const parts = finding.match(/^(.+?)(\s—\s|\s–\s)(.+)$/);
              return (
                <Card key={i} className="p-4">
                  {parts ? (
                    <>
                      <p className="font-mono text-xl font-bold text-primary">{parts[1]}</p>
                      <p className="text-sm text-muted-foreground mt-1">{parts[3]}</p>
                    </>
                  ) : (
                    <p className="text-sm text-foreground">{finding}</p>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* SECTION 5 — Best For / Not For */}
        <section id="bestfor" className="mt-12 scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" /> Для кого підходить
              </h3>
              <div className="space-y-3">
                {review.bestFor.map((b, i) => (
                  <div key={i} className="border-l-4 border-emerald-500/50 pl-4">
                    <p className="font-medium text-foreground">{b.emoji} {b.segment}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{b.reason}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <X className="w-5 h-5 text-amber-500" /> Коли краще обрати інше рішення
              </h3>
              <div className="space-y-3">
                {review.notFor.map((n, i) => (
                  <div key={i} className="border-l-4 border-amber-500/50 pl-4">
                    <p className="font-medium text-foreground">{n.segment}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">→ {n.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — Score Breakdown / Methodology */}
        <section id="methodology" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground">Як ми оцінювали</h2>
          <p className="text-muted-foreground mt-2 leading-relaxed">{review.methodology.approach}</p>

          <Accordion type="single" collapsible className="mt-6">
            {review.methodology.weights.map((w, i) => (
              <AccordionItem key={i} value={`crit-${i}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1 mr-4">
                    <span className="font-medium text-foreground">{w.criterion} ({w.weight}%)</span>
                    <Progress
                      value={(w.score / w.maxScore) * 100}
                      className={`h-2 flex-1 max-w-32 ${progressColor(w.score, w.maxScore)}`}
                    />
                    <span className={`font-mono text-sm font-bold ${scoreColor(w.score, w.maxScore)}`}>
                      {w.score}/{w.maxScore}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Чому такий відсоток:</p>
                    <p className="text-sm text-muted-foreground">{w.rationale}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Що ми перевіряли:</p>
                    <ul className="mt-1 space-y-1">
                      {w.whatWeTested.map((t, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Чому саме такий бал:</p>
                    <p className="text-sm text-muted-foreground">{w.howWeScored}</p>
                  </div>
                  {w.penaltyReasons && w.penaltyReasons.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground">Що зменшило бал:</p>
                      <ul className="mt-1 space-y-1">
                        {w.penaltyReasons.map((p, j) => (
                          <li key={j} className="text-sm text-amber-600 dark:text-amber-400">— {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-6 rounded-lg bg-muted p-4 text-sm font-mono text-muted-foreground">
            Загальна оцінка: {review.methodology.totalFormula}
          </div>

          <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{review.methodology.editorialIndependence}</p>
          </div>
        </section>

        {/* SECTION 7 — Detailed Pros & Cons */}
        <section id="proscons" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground">Переваги</h2>
          <div className="space-y-6 mt-4">
            {review.detailedPros.map((p, i) => (
              <div key={i} className="flex gap-3">
                <div className={weightDot(p.weight)} />
                <div className="flex-1">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {p.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{p.detail}</p>
                  <p className="text-xs font-mono text-primary mt-2">🔍 Доказ: {p.proofPoint}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10">Недоліки</h2>
          <div className="space-y-6 mt-4">
            {review.detailedCons.map((c, i) => (
              <div key={i} className="flex gap-3">
                <div className={weightDot(c.weight)} />
                <div className="flex-1">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <X className="w-4 h-4 text-amber-500 shrink-0" /> {c.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{c.detail}</p>
                  {c.workaround && (
                    <p className="text-sm text-muted-foreground mt-2 italic">💡 Як обійти: {c.workaround}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 8 — Feature Matrix */}
        <section id="features" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground">Що включено</h2>
          <Tabs defaultValue={review.features[0]?.category} className="mt-4">
            <TabsList className="flex-wrap h-auto gap-1">
              {review.features.map(fc => (
                <TabsTrigger key={fc.category} value={fc.category} className="text-xs sm:text-sm">
                  {fc.category}
                </TabsTrigger>
              ))}
            </TabsList>
            {review.features.map(fc => (
              <TabsContent key={fc.category} value={fc.category}>
                <div className="border border-border rounded-lg overflow-hidden mt-2">
                  {fc.items.map((fi, j) => (
                    <div key={j} className={`flex items-center gap-3 px-4 py-3 text-sm ${j % 2 === 1 ? "bg-muted/30" : ""} ${j < fc.items.length - 1 ? "border-b border-border/50" : ""}`}>
                      {featureIcon(fi.status)}
                      <span className="flex-1 text-foreground">{fi.name}</span>
                      {fi.note && <span className="text-xs text-muted-foreground hidden sm:block max-w-48 text-right">{fi.note}</span>}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* SECTION 9 — Pricing */}
        <section id="pricing" className="mt-12 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground">Тарифи і ціни</h2>
          <p className="text-sm text-muted-foreground mt-1">{review.pricing.note}</p>

          {review.pricing.annualDiscount && (
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${billingCycle === 'monthly' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                Місячна оплата
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${billingCycle === 'annual' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                Річна оплата {review.pricing.annualDiscount}
              </button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {review.pricing.plans.map(plan => (
              <Card key={plan.name} className={`p-5 flex flex-col ${plan.isRecommended ? "border-2 border-primary" : ""}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  {plan.isRecommended && <Badge variant="info">Рекомендовано</Badge>}
                </div>
                <p className="font-mono text-2xl font-bold text-foreground mt-2">
                  {billingCycle === 'annual' && plan.annualPrice ? plan.annualPrice : plan.monthlyPrice}
                </p>
                <p className="text-xs text-muted-foreground">{plan.billingNote}</p>
                {plan.recommendedFor && (
                  <p className="text-xs text-primary mt-1">{plan.recommendedFor}</p>
                )}
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                  {plan.limitations?.map(l => (
                    <li key={l} className="flex items-start gap-2 text-sm">
                      <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground/70">{l}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.isRecommended ? "default" : "outline"} size="sm" className="mt-4 w-full" asChild>
                  <Link to={plan.ctaHref}>{plan.ctaLabel} →</Link>
                </Button>
              </Card>
            ))}
          </div>

          {review.pricing.freeTrialDays && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {review.pricing.freeTrialDays} днів безкоштовно · {review.pricing.requiresCard ? "Потрібна картка" : "Картка не потрібна"} · Скасування в будь-який момент
            </p>
          )}
        </section>

        {/* SECTION 10 — FAQ */}
        <section id="faq" className="mt-12 scroll-mt-20">
          <FaqAccordion items={review.faq.map(f => ({ question: f.q, answer: f.a }))} />
        </section>

        {/* SECTION 10.5 — User Reviews */}
        {review.userReviews && review.userReviews.length > 0 && (() => {
          const avgRating = review.userReviews.reduce((s, r) => s + r.rating, 0) / review.userReviews.length;
          return (
            <section id="reviews" className="mt-12 scroll-mt-20">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <h2 className="text-2xl font-bold text-foreground">Відгуки користувачів</h2>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="font-mono font-bold text-foreground">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({review.userReviews.length} відгуків)</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {review.userReviews.map((r, i) => (
                  <Card key={i} className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{r.author}</span>
                          {r.verified && (
                            <Badge variant="success" size="sm" className="gap-0.5">
                              <BadgeCheck className="w-3 h-3" /> Підтверджений
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.role}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(r.date)}</span>
                    </div>
                    <StarRating rating={r.rating} />
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                  </Card>
                ))}
              </div>
            </section>
          );
        })()}

        {/* SECTION 11 — Alternatives */}
        {alternatives.length > 0 && (
          <section id="alternatives" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-foreground mb-6">Порівняйте з альтернативами</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              {/* Current item row */}
              <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 text-sm">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: item.initialsColor }}>
                  {item.initials}
                </div>
                <span className="font-medium text-foreground flex-1">{item.name} #{item.rank}</span>
                <span className="font-mono font-bold text-primary">{item.score}</span>
                <span className="text-xs text-muted-foreground">(поточна сторінка)</span>
              </div>
              {/* Alternative rows */}
              {review.alternatives.map((alt, i) => {
                const altItem = RANKINGS.find(r => r.id === alt.itemId || r.slug === alt.itemId);
                if (!altItem) return null;
                return (
                  <Link
                    key={i}
                    to={`/publications/ratings/${category.slug}/${altItem.slug}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm border-t border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: altItem.initialsColor }}>
                      {altItem.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">{altItem.name} #{altItem.rank}</span>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{alt.whenToPick}</p>
                    </div>
                    <span className={`font-mono font-bold ${scoreColor(altItem.score, 100)}`}>{altItem.score}</span>
                  </Link>
                );
              })}
            </div>
             <Link to={`/publications/ratings/${category.slug}`} className="inline-block mt-4 text-sm text-primary font-medium hover:underline">
              Переглянути повний рейтинг →
            </Link>
          </section>
        )}

        {/* SECTION 12 — Ukraine Note */}
        {review.ukraineNote && (
          <section className="mt-12">
            <Card className="p-5 border-l-4 border-blue-500">
              <p className="font-medium text-foreground mb-2">🇺🇦 Робота в умовах воєнного стану</p>
              <p className="text-sm text-muted-foreground">{review.ukraineNote}</p>
              {review.warDiscount && (
                <p className="text-sm text-foreground mt-2 font-medium">Спеціальні умови: {review.warDiscount}</p>
              )}
            </Card>
          </section>
        )}

        {/* SECTION 13 — Bottom CTA */}
        <section className="mt-12">
          {item.isOurProduct ? (
            <Card className="p-8 border-2 border-primary bg-primary/5 text-center space-y-4">
              <p className="text-xl font-bold text-foreground">Перевірте {item.name} самі</p>
              <p className="text-muted-foreground">
                {review.pricing.freeTrialDays} днів безкоштовно · Без картки · Скасування в 1 клік
              </p>
              <Button size="lg" asChild><Link to={CTA_CHECKOUT_URL}>Спробувати {item.name} безкоштовно →</Link></Button>
              <div>
                <Button variant="ghost" size="sm" onClick={() => scrollTo("pricing")}>
                  або переглянути тарифи ↑
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-muted/50 text-center space-y-4">
              <p className="text-lg font-semibold text-foreground">Шукаєте AI-альтернативу?</p>
              <p className="text-muted-foreground text-sm">
                FINTODO автоматизує ЄСВ і єдиний податок — без ваших дій. Оцінка редакції: 96/100.
              </p>
              <Button variant="outline" asChild>
                 <Link to={`/publications/ratings/${category.slug}/fintodo`}>Читати огляд FINTODO →</Link>
              </Button>
            </Card>
          )}
        </section>
      </div>
    </PortalLayout>
  );
};

// ── Legacy Fallback Layout ──
const LegacyReviewPage = ({ item, category }: { item: typeof RANKINGS[0]; category: typeof RANKING_CATEGORIES[0] }) => {
  const review = item.fullReview;
  const alternatives = review.alternatives
    .map((slug) => RANKINGS.find((r) => r.slug === slug || r.id === slug))
    .filter(Boolean) as typeof RANKINGS;

  const totalFormula = `(${review.methodology.functionality.score}×0.4) + (${review.methodology.price.score}×0.25) + (${review.methodology.support.score}×0.2) + (${review.methodology.ux.score}×0.15)`;

  return (
    <PortalLayout
      meta={{
        title: `${item.name} — огляд та рейтинг 2025 | FINTODO`,
        description: review.summary.slice(0, 155),
        canonical: `${SITE_URL}/publications/ratings/${category.slug}/${item.slug}`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Публікації", url: `${SITE_URL}/publications` },
        { name: "Дослідження і рейтинги", url: `${SITE_URL}/publications/ratings` },
        { name: category.name, url: `${SITE_URL}/publications/ratings/${category.slug}` },
        { name: item.name, url: `${SITE_URL}/publications/ratings/${category.slug}/${item.slug}` },
      ])} />
      <JsonLd data={getReviewSchema(item, category.name)} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Публікації", to: "/publications" },
          { label: "Дослідження і рейтинги", to: "/publications/ratings" },
          { label: category.name, to: `/publications/ratings/${category.slug}` },
          { label: item.name },
        ]} />

        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <span className="font-mono text-3xl font-bold text-primary">#{item.rank}</span>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: item.initialsColor }}>
            {item.initials}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{item.name}</h1>
          {item.badge && <Badge variant="success">{item.badge}</Badge>}
          {item.isOurProduct && <Badge variant="info">Наш продукт</Badge>}
        </div>

        <div className="flex items-baseline gap-2 mt-4">
          <span className={`font-mono text-4xl sm:text-5xl font-bold ${item.score >= 85 ? "text-emerald-600 dark:text-emerald-400" : item.score >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
            {item.score}
          </span>
          <span className="text-lg sm:text-xl text-muted-foreground">/ 100</span>
        </div>
        <Progress value={item.score} className="h-3 mt-2" />

        <div className="flex flex-wrap gap-1.5 mt-4">
          {item.tags.map(tag => <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>)}
        </div>

        <p className="text-lg text-muted-foreground mt-4 leading-relaxed">{review.summary}</p>
        <p className="text-xs text-muted-foreground mt-2 font-mono">Перевірено: {review.lastTested} · Редакція FINTODO</p>

        <div className="flex gap-3 mt-6 flex-wrap">
          {item.isOurProduct ? (
            <>
              <Button asChild><Link to={review.ctaHref}>{review.ctaLabel} →</Link></Button>
              <Button variant="outline" asChild><a href="#pricing">Переглянути тарифи ↓</a></Button>
            </>
          ) : (
            <Button variant="secondary" asChild>
              <a href={review.ctaHref} target="_blank" rel="noopener noreferrer">
                {review.ctaLabel} <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>

        {/* Score Breakdown */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">Як ми оцінювали</h2>
          <p className="text-sm text-muted-foreground mt-1">Методологія редакції FINTODO: тестування у {review.lastTested.toLowerCase()}.</p>
          <div className="space-y-6 mt-6">
            {(Object.entries(review.methodology) as [string, { score: number; maxScore: number; notes: string }][]).map(([key, m]) => {
              const meta = METHODOLOGY_LABELS[key];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{meta.label} <span className="text-muted-foreground text-sm">(вага {meta.weight})</span></span>
                    <span className={`font-mono font-bold ${scoreColor(m.score, m.maxScore)}`}>{m.score} / {m.maxScore}</span>
                  </div>
                  <Progress value={(m.score / m.maxScore) * 100} className={`h-2.5 ${progressColor(m.score, m.maxScore)}`} />
                  <p className="text-sm text-muted-foreground mt-1.5">{m.notes}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm font-mono text-muted-foreground">
            Загальна оцінка = {totalFormula} = <span className="font-bold text-foreground">{item.score} / 100</span>
          </div>
        </section>

        {/* Pros & Cons */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">Переваги та недоліки</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> Переваги</h3>
              {review.detailedPros.map(p => (
                <div key={p.title} className="border-l-4 border-emerald-500/50 pl-4">
                  <p className="font-medium text-foreground">{p.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><X className="w-5 h-5 text-amber-500" /> Недоліки</h3>
              {review.detailedCons.map(c => (
                <div key={c.title} className="border-l-4 border-amber-500/50 pl-4">
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mt-12" id="pricing">
          <h2 className="text-2xl font-bold text-foreground">Тарифи</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {review.pricing.map(plan => (
              <Card key={plan.name} className={`p-5 flex flex-col ${plan.isRecommended ? "border-2 border-primary" : ""}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  {plan.isRecommended && <Badge variant="info">Рекомендовано</Badge>}
                </div>
                <p className="font-mono text-2xl font-bold text-foreground mt-2">{plan.price}</p>
                <p className="text-xs text-muted-foreground">{plan.period === 'month' ? '/місяць' : plan.period === 'year' ? '/рік' : 'одноразово'}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.isRecommended ? "default" : "outline"} size="sm" className="mt-4 w-full" asChild>
                  <Link to={review.ctaHref}>Обрати тариф →</Link>
                </Button>
              </Card>
            ))}
          </div>
          {item.isOurProduct && <p className="text-sm text-muted-foreground mt-4">Доступний 14-денний безкоштовний тріал без картки</p>}
        </section>

        {/* Ideal For */}
        <section className="mt-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Підходить для:</h3>
              <ul className="space-y-2">
                {review.idealFor.map(i => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-foreground">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Не підходить для:</h3>
              <ul className="space-y-2">
                {review.notIdealFor.map(n => (
                  <li key={n} className="flex items-center gap-2 text-sm">
                    <X className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Verdict */}
        <section className="mt-12">
          <Card className="bg-muted/50 border-l-4 border-primary p-6">
            <p className="font-mono text-sm text-primary font-medium mb-2">📝 Вердикт редакції</p>
            <p className="text-foreground leading-relaxed">{review.verdict}</p>
            <p className="text-xs text-muted-foreground mt-3 font-mono">Редакція FINTODO · {review.lastTested}</p>
          </Card>
        </section>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Альтернативи</h2>
            <div className="space-y-4">
              {alternatives.map(alt => <RankingCard key={alt.id} item={alt} categorySlug={category.slug} />)}
            </div>
            <Link to={`/publications/ratings/${category.slug}`} className="inline-block mt-4 text-sm text-primary font-medium hover:underline">
              Повний рейтинг {category.name} →
            </Link>
          </section>
        )}

        {/* CTA */}
        <section className="mt-12">
          {item.isOurProduct ? (
            <Card className="p-6 border-2 border-primary bg-primary/5 text-center space-y-4">
              <p className="text-xl font-bold text-foreground">Спробуйте {item.name} безкоштовно</p>
              <p className="text-muted-foreground">14 днів без обмежень. Картка не потрібна.</p>
              <Button asChild size="lg"><Link to={CTA_CHECKOUT_URL}>Розпочати безкоштовно →</Link></Button>
            </Card>
          ) : (
            <Card className="p-6 bg-muted/50 text-center space-y-4">
              <p className="text-lg font-semibold text-foreground">Шукаєте українську AI-альтернативу?</p>
              <p className="text-muted-foreground text-sm">FINTODO автоматизує бухоблік та нагадує про дедлайни</p>
              <Button variant="outline" asChild>
                <Link to={`/publications/ratings/${category.slug}/fintodo`}>Читати огляд FINTODO →</Link>
              </Button>
            </Card>
          )}
        </section>
      </div>
    </PortalLayout>
  );
};

// ── Main Component ──
const RankingItemPage = () => {
  const { categorySlug, itemSlug } = useParams<{ categorySlug: string; itemSlug: string }>();
  const category = RANKING_CATEGORIES.find((c) => c.slug === categorySlug);
  const item = RANKINGS.find((r) => r.slug === itemSlug && r.category === category?.id);

  if (!category || !item) {
    return (
      <PortalLayout meta={{ title: "Не знайдено", description: "", canonical: "" }}>
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-2xl font-semibold mb-2">Сервіс не знайдено</h1>
          <p className="text-muted-foreground mb-6">Можливо, він був переміщений або видалений</p>
          <a href="/rankings" className="text-primary font-medium hover:underline">← До рейтингів</a>
        </div>
      </PortalLayout>
    );
  }

  // Rich review layout when `review` field exists
  if (item.review) {
    return <RichReviewPage item={item} category={category} />;
  }

  // Legacy fallback
  return <LegacyReviewPage item={item} category={category} />;
};

export default RankingItemPage;