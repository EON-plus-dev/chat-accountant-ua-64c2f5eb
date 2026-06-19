import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { INSTITUTION_PROFILES, type FullInstitutionProfile } from "@/portal/data/institutionProfiles";
import {
  getBreadcrumbSchema, getFaqSchema, SITE_URL,
  getOrganizationSchema, getFinancialServiceReviewSchema, getLocalBusinessSchema,
} from "@/portal/seo/structuredData";
import { ProfileHero } from "@/portal/components/institution-profile/ProfileHero";
import { ProfileSidebar } from "@/portal/components/institution-profile/ProfileSidebar";
import { ProfileOverview } from "@/portal/components/institution-profile/ProfileOverview";
import { MarketContextStrip } from "@/portal/components/institution-profile/MarketContextStrip";
import { ProfileProducts } from "@/portal/components/institution-profile/ProfileProducts";
import { ProfileTrust } from "@/portal/components/institution-profile/ProfileTrust";
import { ProfileAbout } from "@/portal/components/institution-profile/ProfileAbout";


import { ProfileFaq } from "@/portal/components/institution-profile/ProfileFaq";
import { ProfileMethodology } from "@/portal/components/institution-profile/ProfileMethodology";
import { ProfileReviews } from "@/portal/components/institution-profile/ProfileReviews";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const getAnchorSections = (profile: FullInstitutionProfile) => {
  const hasReviews = profile.reviewThemes?.length > 0;
  const hasIssues = profile.knownIssues?.length > 0;
  const hasCompliance = profile.compliance?.nbu || profile.compliance?.aml || profile.compliance?.gdpr || profile.compliance?.dia;
  const hasAwards = profile.awards?.length > 0;
  const hasWar = !!profile.warPeriod;
  const hasTrust = hasReviews || hasIssues || hasCompliance || hasAwards || hasWar;


  const hasFaq = profile.faq?.length > 0;

  return [
    { id: "overview", label: "Огляд" },
    { id: "about", label: "Про компанію" },
    { id: "products", label: "Продукти" },
    
    ...(hasTrust ? [{ id: "trust", label: "Довіра" }] : []),
    { id: "reviews", label: "Відгуки" },
    ...(hasFaq ? [{ id: "faq", label: "FAQ" }] : []),
  ];
};

/** Template-based meta description */
const buildMetaDescription = (profile: FullInstitutionProfile) => {
  const bestFor = profile.editorial.bestFor[0]?.segment || "";
  return `${profile.name} — ${profile.editorial.oneLiner}. Рейтинг ${profile.ratings.fintodo.overall}/100. ${bestFor ? `Для ${bestFor}. ` : ""}Огляд ${profile.dataLastUpdated}.`;
};

const InstitutionProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const profile = INSTITUTION_PROFILES.find(p => p.slug === slug);

  if (!profile) return <Navigate to="/404" replace />;

  return <ProfileContent profile={profile} />;
};

const ProfileContent = ({ profile }: { profile: FullInstitutionProfile }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [showMiniBar, setShowMiniBar] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const ANCHOR_SECTIONS = getAnchorSections(profile);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setShowMiniBar(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const els = ANCHOR_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      entries => { for (const e of entries) { if (e.isIntersecting) setActiveSection(e.target.id); } },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const reviewSchemas = getFinancialServiceReviewSchema(profile);
  const localBiz = getLocalBusinessSchema(profile);

  return (
    <PortalLayout
      meta={{
        title: `${profile.name} — огляд, відгуки, тарифи ${new Date().getFullYear()} | FINTODO`,
        description: buildMetaDescription(profile),
        canonical: `${SITE_URL}/dovidnyky/ustanovy/profile/${profile.slug}`,
      }}
    >
      {/* JSON-LD */}
      <JsonLd data={getOrganizationSchema(profile)} />
      {reviewSchemas.map((s, i) => <JsonLd key={`rs-${i}`} data={s} />)}
      <JsonLd data={getFaqSchema(profile.faq.map(f => ({ question: f.question, answer: f.answer })))} />
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Установи", url: `${SITE_URL}/dovidnyky/ustanovy` },
        { name: profile.ratings.fintodo.parentCategoryName, url: `${SITE_URL}/dovidnyky/ustanovy/${profile.ratings.fintodo.parentCategorySlug}` },
        { name: profile.shortName || profile.name, url: `${SITE_URL}/dovidnyky/ustanovy/profile/${profile.slug}` },
      ])} />
      {localBiz && (Array.isArray(localBiz) ? localBiz : [localBiz]).map((s, i) => <JsonLd key={`lb-${i}`} data={s as Record<string, unknown>} />)}

      {/* Sticky Mini-Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm transition-transform duration-300 ${showMiniBar ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-6xl mx-auto px-4 h-[48px] flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: profile.logo.color }}>
            {profile.logo.initials}
          </div>
          <span className="font-semibold text-foreground text-sm truncate">{profile.name}</span>
          <span className="text-muted-foreground text-xs hidden sm:inline">·</span>
          <span className="font-mono text-sm font-bold text-primary hidden sm:inline">{profile.ratings.fintodo.overall}/100</span>
          <div className="hidden md:flex gap-1 ml-2 overflow-x-auto no-scrollbar">
            {ANCHOR_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-2 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  activeSection === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        {/* Breadcrumb */}
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Установи", to: "/dovidnyky/ustanovy" },
          { label: profile.ratings.fintodo.parentCategoryName, to: `/dovidnyky/ustanovy/${profile.ratings.fintodo.parentCategorySlug}` },
          { label: profile.shortName || profile.name },
        ]} />

        {/* Hero */}
        <ProfileHero profile={profile} heroRef={heroRef} />

        {/* Anchor Navigation */}
        <div className={`sticky z-40 bg-background/95 backdrop-blur border-b border-border -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mt-6 ${showMiniBar ? "top-12 md:hidden" : "top-0"}`}>
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {ANCHOR_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeSection === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid md:grid-cols-[1fr_300px] gap-6 mt-2">
          {/* Main Content — 6 sections */}
          <div className="min-w-0">
            <ProfileOverview profile={profile} />
            <MarketContextStrip
              categorySlug={profile.ratings.fintodo.categorySlug}
              categoryName={profile.ratings.fintodo.parentCategoryName}
              profile={profile}
            />
            <ProfileAbout profile={profile} />
            <ProfileProducts profile={profile} />
            
            <ProfileTrust profile={profile} />
            <ProfileReviews slug={profile.slug} />
            <ProfileFaq profile={profile} />
            <ProfileMethodology profile={profile} />

            {/* Bottom CTA */}
            <div className="mt-8 flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-foreground flex-1">
                {(() => {
                  if (profile.cta.primary.isInternal) return "Готові почати?";
                  const cs = profile.ratings?.fintodo?.categorySlug || '';
                  if (cs.startsWith('banks') || cs.startsWith('accounting') || cs.startsWith('digital'))
                    return `FINTODO інтегрується з ${profile.name} — автоматичний облік.`;
                  if (cs.startsWith('legal'))
                    return `Порівняйте юридичні послуги ${profile.name} з аналогами для вашого бізнесу.`;
                  if (cs.startsWith('logistics'))
                    return `Порівняйте тарифи доставки ${profile.name} з іншими операторами.`;
                  if (cs.startsWith('grants'))
                    return `Порівняйте грантові програми ${profile.name} з іншими можливостями.`;
                  if (cs.startsWith('fintech') || cs.startsWith('payments'))
                    return `Порівняйте комісії та функціонал ${profile.name} з іншими сервісами.`;
                  if (cs.startsWith('insurance'))
                    return `Порівняйте умови страхування ${profile.name} з іншими компаніями.`;
                  return `Порівняйте ${profile.name} з аналогами у категорії.`;
                })()}
              </p>
              <Button size="sm" asChild>
                {profile.cta.primary.isInternal ? (
                  <Link to={profile.cta.primary.href}>{profile.cta.primary.label} →</Link>
                ) : (
                  <Link to={CTA_CHECKOUT_URL}>Почати безкоштовно →</Link>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <ProfileSidebar profile={profile} />
        </div>
      </div>

      {/* Floating mobile CTA */}
      {showMiniBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border p-3 flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground truncate">{profile.name}</span>
          {profile.products[0]?.price && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              від {profile.products[0].price.monthly || profile.products[0].price.perTransaction || "0 ₴"}
            </span>
          )}
          <Button size="sm" className="ml-auto shrink-0" asChild>
            <a href={profile.cta.primary.href} target={profile.cta.primary.isInternal ? undefined : "_blank"} rel="noopener noreferrer">
              {profile.cta.primary.label} →
            </a>
          </Button>
        </div>
      )}
    </PortalLayout>
  );
};

export default InstitutionProfilePage;
