import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteGraphSchema, SITE_URL } from "@/portal/seo/structuredData";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PartnerProgramSection } from "@/components/landing/PartnerProgramSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { PricingSection } from "@/components/landing/PricingSection";
import { LandingFAQSection } from "@/components/landing/LandingFAQSection";
import { LandingFinalCTA } from "@/components/landing/FinalCTASection";
import { LoggedInPartnerBanner } from "@/components/landing/LoggedInPartnerBanner";

const LandingPartnersPage = () => {
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
        title: "FINTODO для бухгалтерів: Reseller-програма −25/30/35% | FINTODO",
        description: "Сертифікована партнерська програма: тарифи Solo / Agency / Firm, Reseller-знижка −25/30/35% на тарифи ваших клієнтів, marketplace без комісій з гонорару.",
        canonical: `${SITE_URL}/partners`,
        ogImage: `${SITE_URL}/og-default.png`,
      }}
    >
      <JsonLd data={getSiteGraphSchema()} />

      <LoggedInPartnerBanner />
      <HeroSection />
      <HowItWorksSection />
      <PartnerProgramSection />
      <SecuritySection />
      <PricingSection />
      <LandingFAQSection />
      <LandingFinalCTA />
    </PortalLayout>
  );
};

export default LandingPartnersPage;
