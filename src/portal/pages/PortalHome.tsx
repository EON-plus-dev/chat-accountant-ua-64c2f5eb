import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { getBreadcrumbSchema, getSiteGraphSchema, SITE_URL } from "@/portal/seo/structuredData";

import { DailyHero } from "@/portal/sections/overview/DailyHero";
import { LiveDataStrip } from "@/portal/sections/live-data/LiveDataStrip";
import { TopStories } from "@/portal/sections/overview/TopStories";
import { LegislationAlerts } from "@/portal/sections/overview/LegislationAlerts";
import { AiConsultantTeaser } from "@/portal/sections/overview/AiConsultantTeaser";
import { OverviewSidebar } from "@/portal/sections/overview/OverviewSidebar";
import { ThematicHubs } from "@/portal/sections/overview/ThematicHubs";
import { AlertSubscription } from "@/portal/sections/alert-subscription/AlertSubscription";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";

/* Scroll-reveal wrapper */
const RevealSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
    >
      {children}
    </div>
  );
};

const PortalHome = () => {
  return (
    <PortalLayout
      showTicker
      meta={{
        title: "Огляд дня — FINTODO | Податки, фінанси, бізнес",
        description: "Щоденний дайджест: зміни законодавства, дедлайни, курси валют, аналітика та інструменти для ФОП і фізичних осіб.",
        canonical: `${SITE_URL}/overview`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: `${SITE_URL}/` },
        { name: "Огляд", url: `${SITE_URL}/overview` },
      ])} />
      <JsonLd data={getSiteGraphSchema()} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Огляд" },
        ]} />
      </div>

      <DailyHero />
      <LiveDataStrip />

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Left — main content */}
          <div className="min-w-0 space-y-8">
            <RevealSection>
              <TopStories />
            </RevealSection>

            <RevealSection>
              <div className="border-t border-border/40" />
              <LegislationAlerts />
            </RevealSection>

            <RevealSection>
              <div className="border-t border-border/40" />
              <AiConsultantTeaser />
            </RevealSection>
          </div>

          {/* Right — sidebar */}
          <div className="hidden lg:block">
            <OverviewSidebar />
          </div>
        </div>
      </div>

      <ThematicHubs />
      <AlertSubscription />
    </PortalLayout>
  );
};

export default PortalHome;
