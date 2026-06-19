// FINTODO OS — Homepage.
// Narrative arc: Hook → Proof → Pain → Method → AudienceSplit →
// Modules → How → Comparison → Scenarios → Testimonials → Security → Pricing → FAQ → Final CTA.

import { useEffect } from "react";
import { useAudience } from "@/contexts/AudienceContext";
import { HeroSplit, LogoCloud } from "@/os/blocks/HeroSplit";
import {
  PainBlock, MethodBlock, SolutionBlock,
  BentoModulesBlock, HowItWorksBlock, ComparisonBlock,
  ScenariosShowcaseBlock, TestimonialsBlock, SecurityStripBlock,
  PricingTeaserBlock, FaqBlock, FinalCtaBlock,
} from "@/os/blocks/CoreBlocks";

const TitleSync = () => {
  const { audience } = useAudience();
  useEffect(() => {
    const t = audience === "business"
      ? "FINTODO OS — операційна система малого бізнесу"
      : "FINTODO OS — операційна система вашого життя";
    document.title = t;
    const m = document.querySelector('meta[name="description"]');
    if (m) {
      m.setAttribute(
        "content",
        audience === "business"
          ? "Один кабінет замість 5 інструментів: фінанси, CRM, замовлення, бронювання, документи й AI-директор для ФОП і ТОВ."
          : "Один кабінет замість 10 застосунків: бюджет, документи, родина, інвестиції, податки й AI-помічник для вашого життя."
      );
    }
  }, [audience]);
  return null;
};

export default function OsHomePage() {
  return (
    <>
      <TitleSync />
      <HeroSplit />
      <LogoCloud />
      <PainBlock />
      <MethodBlock />
      <SolutionBlock />
      <BentoModulesBlock />
      <HowItWorksBlock />
      <ComparisonBlock />
      <ScenariosShowcaseBlock />
      <TestimonialsBlock />
      <SecurityStripBlock />
      <PricingTeaserBlock />
      <FaqBlock />
      <FinalCtaBlock />
    </>
  );
}
