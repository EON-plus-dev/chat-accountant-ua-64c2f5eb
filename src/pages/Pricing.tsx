import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, User, LayoutGrid, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MyPlanTab } from "@/components/pricing";
import ProfileEarningsSection from "@/components/user-settings/ProfileEarningsSection";
import {
  PricingHeroSection,
  FeaturesSection,
  TariffsSection,
  
  FAQSection,
  ContractorOfferSection,
} from "@/components/pricing/sections";

interface PricingProps {
  onBack?: () => void;
  onTabChange?: (tab: string, section?: string) => void;
  onSubTabChange?: (subTab: string) => void;
  embedded?: boolean;
}

const Pricing = ({ onBack, onTabChange, onSubTabChange, embedded }: PricingProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const sectionParam = searchParams.get("section");
  const sectionsInAllPlans = ["tariffs", "faq", "features", "credits"];
  const earningsSections = ["earnings"];
  const initialTab = sectionParam && sectionsInAllPlans.includes(sectionParam) 
    ? "all-plans" 
    : sectionParam && earningsSections.includes(sectionParam)
      ? "earnings"
      : "my-plan";
  const [activeTab, setActiveTab] = useState<"my-plan" | "all-plans" | "earnings">(initialTab);
  
  const isFromPassive = searchParams.get("source")?.includes("passive") || 
                        searchParams.get("from") === "contractor";
  const partnerName = searchParams.get("partner") || "Ваш партнер";
  const partnerPlan = searchParams.get("plan") || "Смарт";

  const scrollToSectionWithRetry = (id: string, maxAttempts = 15, highlight = false) => {
    let attempts = 0;
    const tryScroll = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        if (highlight) {
          element.classList.add("highlight-section");
          setTimeout(() => element.classList.remove("highlight-section"), 2000);
        }
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryScroll, 150);
      }
    };
    tryScroll();
  };

  const scrollToSection = (id: string) => {
    scrollToSectionWithRetry(id, 5, false);
  };

  useEffect(() => {
    const section = searchParams.get('section');
    if (section && sectionsInAllPlans.includes(section) && activeTab !== "all-plans") {
      setActiveTab("all-plans");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => {
        scrollToSectionWithRetry(sectionId, 15, true);
      }, 200);
      return;
    }
    
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      setTimeout(() => {
        scrollToSectionWithRetry(sectionParam, 15, true);
      }, 200);
    }
  }, [location.hash, searchParams]);

  const recommendedPlan = useMemo(() => {
    try {
      const needs = JSON.parse(localStorage.getItem('user_needs') || '[]');
      if (needs.includes('payroll')) return 'premium';
      if (needs.includes('analytics') || needs.length >= 3) return 'smart';
      if (needs.includes('taxes')) return 'smart';
      return 'smart';
    } catch {
      return 'smart';
    }
  }, []);

  return (
    <div className={embedded ? "flex flex-col" : "h-full flex flex-col"}>
      {!embedded && (
        <div className="px-4 md:px-6 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack || (() => navigate(-1))} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg md:text-xl font-bold">Тарифи та кредити</h1>
          </div>
        </div>
      )}

      <div className={embedded ? "space-y-8 w-full" : "px-4 md:px-6 py-6 space-y-8 w-full"}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "my-plan" | "all-plans" | "earnings")} className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 h-12">
              <TabsTrigger value="my-plan" className="gap-2 text-sm">
                <User className="h-4 w-4" />
                Мій тариф
              </TabsTrigger>
              <TabsTrigger value="all-plans" className="gap-2 text-sm">
                <LayoutGrid className="h-4 w-4" />
                Усі тарифи
              </TabsTrigger>
              <TabsTrigger value="earnings" className="gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                Заробіток
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-plan" className="mt-8 animate-fade-in">
              <MyPlanTab onSwitchToPlans={() => setActiveTab("all-plans")} />
            </TabsContent>

            <TabsContent value="all-plans" className="mt-8 space-y-16 animate-fade-in">
              <PricingHeroSection />

              {isFromPassive && (
                <ContractorOfferSection 
                  partnerName={partnerName}
                  partnerPlan={partnerPlan}
                  onScrollToSection={scrollToSection}
                />
              )}

              
              <TariffsSection />
              <FeaturesSection />
              <FAQSection />
            </TabsContent>

            <TabsContent value="earnings" className="mt-8 animate-fade-in">
              <ProfileEarningsSection />
            </TabsContent>
          </Tabs>
      </div>
    </div>
  );
};

export default Pricing;
