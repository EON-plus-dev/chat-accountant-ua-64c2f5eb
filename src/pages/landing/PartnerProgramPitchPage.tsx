import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/portal/seo/structuredData";

import { PartnerHeroPitch } from "@/components/landing/partners/PartnerHeroPitch";
import { PartnerEconomyCalculator } from "@/components/landing/partners/PartnerEconomyCalculator";
import { PartnerScenarios } from "@/components/landing/partners/PartnerScenarios";
import { PartnerHowItWorks } from "@/components/landing/partners/PartnerHowItWorks";
import { PartnerPitchFAQ } from "@/components/landing/partners/PartnerPitchFAQ";
import { PartnerFinalCTA } from "@/components/landing/partners/PartnerFinalCTA";


const PartnerProgramPitchPage = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const t = setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        100
      );
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "FINTODO Партнерська програма",
    description:
      "Партнерська програма FINTODO для бухгалтерів і бюро: Reseller-знижка −25/30/35% для клієнтів, 0% комісії з гонорару, marketplace-ліди, ROI ×2 з гарантією повернення коштів за 90 днів.",
    brand: { "@type": "Brand", name: "FINTODO" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "UAH",
      lowPrice: "499",
      highPrice: "3499",
      offerCount: 3,
    },
  };

  return (
    <PortalLayout
      meta={{
        title: "Економіка партнерської програми FINTODO — ROI ×2 для бухгалтера",
        description:
          "Калькулятор вигоди співпраці з FINTODO: економія часу −60%, додаткова виручка від нових клієнтів, Reseller-знижка −25/30/35%, 0% комісії з гонорару. Гарантія ROI за 90 днів.",
        canonical: `${SITE_URL}/partners/program`,
        ogImage: `${SITE_URL}/og-default.png`,
      }}
    >
      <JsonLd data={productSchema} />
      
      <PartnerHeroPitch />
      <PartnerEconomyCalculator />
      <PartnerScenarios />
      <PartnerHowItWorks />
      <PartnerPitchFAQ />
      <PartnerFinalCTA />
    </PortalLayout>
  );
};

export default PartnerProgramPitchPage;
