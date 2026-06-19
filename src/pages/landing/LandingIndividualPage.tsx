import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteGraphSchema, SITE_URL } from "@/portal/seo/structuredData";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ForWhoSection } from "@/components/landing/ForWhoSection";
import { WhySection } from "@/components/landing/WhySection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { PricingSection } from "@/components/landing/PricingSection";
import { LandingFAQSection } from "@/components/landing/LandingFAQSection";
import { LandingFinalCTA } from "@/components/landing/FinalCTASection";

const LandingIndividualPage = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  return (
    <PortalLayout
      meta={{
        title: "AI-помічник для фізосіб: декларація, ПДФО, оренда | FINTODO",
        description: "Декларації фізосіб, ПДФО, оренда, інвестиції, повернення податку — автоматично через чат з AI.",
        canonical: `${SITE_URL}/individuals`,
        ogImage: `${SITE_URL}/og-default.png`,
      }}
    >
      <JsonLd data={getSiteGraphSchema()} />

      <HeroSection />
      <HowItWorksSection />
      <ForWhoSection />
      <WhySection />
      <SecuritySection />
      <PricingSection />
      <LandingFAQSection />
      <LandingFinalCTA />
    </PortalLayout>
  );
};

export default LandingIndividualPage;
