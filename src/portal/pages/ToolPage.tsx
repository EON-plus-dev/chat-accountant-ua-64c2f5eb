import { useParams, Navigate, Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getHowToSchema, getSoftwareApplicationSchema, SITE_URL } from "@/portal/seo/structuredData";
import { FaqAccordion } from "@/portal/components/FaqAccordion";
import { ContextualCta } from "@/portal/components/ContextualCta";
import { InlineCalculator } from "@/portal/components/InlineCalculator";
import { TaxCalendar } from "@/portal/sections/tools-grid/TaxCalendar";
import { KvedSearch } from "@/portal/sections/tools-grid/KvedSearch";
import { CounterpartyCheck } from "@/portal/sections/tools-grid/CounterpartyCheck";
import { CashFlowWizard } from "@/portal/sections/tools-grid/CashFlowWizard";
import { BreakevenCalc } from "@/portal/sections/tools-grid/BreakevenCalc";
import { VacationCalc } from "@/portal/sections/tools-grid/VacationCalc";
import { InvoiceGenerator } from "@/portal/sections/tools-grid/InvoiceGenerator";
import { HireRoiCalc } from "@/portal/sections/tools-grid/HireRoiCalc";
import { CreditCalc } from "@/portal/sections/tools-grid/CreditCalc";
import { DepositCalc } from "@/portal/sections/tools-grid/DepositCalc";
import { InvestCalc } from "@/portal/sections/tools-grid/InvestCalc";
import { InsuranceCalc } from "@/portal/sections/tools-grid/InsuranceCalc";
import { Budget503020Calc } from "@/portal/sections/tools-grid/Budget503020Calc";
import { EmergencyFundCalc } from "@/portal/sections/tools-grid/EmergencyFundCalc";
import { InflationImpactCalc } from "@/portal/sections/tools-grid/InflationImpactCalc";
import { DebtSnowballCalc } from "@/portal/sections/tools-grid/DebtSnowballCalc";
import { RentVsBuyCalc } from "@/portal/sections/tools-grid/RentVsBuyCalc";
import { FireCalc } from "@/portal/sections/tools-grid/FireCalc";
import { GoalTrackerCalc } from "@/portal/sections/tools-grid/GoalTrackerCalc";
import { NetWorthCalc } from "@/portal/sections/tools-grid/NetWorthCalc";
import { UnitEconomyCalc } from "@/portal/sections/tools-grid/UnitEconomyCalc";
import { PricingCalc } from "@/portal/sections/tools-grid/PricingCalc";
import { RunwayCalc } from "@/portal/sections/tools-grid/RunwayCalc";
import { FopVsTooCalc } from "@/portal/sections/tools-grid/FopVsTooCalc";
import { ImportTcoCalc } from "@/portal/sections/tools-grid/ImportTcoCalc";
import { VehicleCustomsCalc } from "@/portal/sections/tools-grid/VehicleCustomsCalc";
import { VinDecoderCalc } from "@/portal/sections/tools-grid/VinDecoderCalc";
import { TOOLS } from "@/portal/data/tools";
import { getToolEnrichment } from "@/portal/data/toolEnrichments";
import { getInstitutionBySlug } from "@/portal/data/institutionProfiles";
import { Building2, Star, ArrowRight, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const renderTool = (slug: string) => {
  switch (slug) {
    case "esv-calc": return <InlineCalculator type="esv" />;
    case "tax-calc": return <InlineCalculator type="tax" />;
    case "salary-calc": return <InlineCalculator type="salary" />;
    case "calendar": return <TaxCalendar />;
    case "kved": return <KvedSearch />;
    case "counterparty": return <CounterpartyCheck />;
    case "cashflow": return <CashFlowWizard />;
    case "breakeven": return <BreakevenCalc />;
    case "vacation-calc": return <VacationCalc />;
    case "invoice": return <InvoiceGenerator />;
    case "hire-roi": return <HireRoiCalc />;
    case "credit-calc": return <CreditCalc />;
    case "deposit-calc": return <DepositCalc />;
    case "invest-calc": return <InvestCalc />;
    case "insurance-calc": return <InsuranceCalc />;
    case "budget-503020": return <Budget503020Calc />;
    case "emergency-fund": return <EmergencyFundCalc />;
    case "inflation-impact": return <InflationImpactCalc />;
    case "debt-snowball": return <DebtSnowballCalc />;
    case "rent-vs-buy": return <RentVsBuyCalc />;
    case "fire-calc": return <FireCalc />;
    case "goal-tracker": return <GoalTrackerCalc />;
    case "net-worth": return <NetWorthCalc />;
    case "unit-economy": return <UnitEconomyCalc />;
    case "pricing-calc": return <PricingCalc />;
    case "runway-calc": return <RunwayCalc />;
    case "fop-vs-too": return <FopVsTooCalc />;
    case "import-tco": return <ImportTcoCalc />;
    case "vehicle-customs": return <VehicleCustomsCalc />;
    case "vin-decoder": return <VinDecoderCalc />;
    default: return (
      <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center">
        <p className="text-lg font-semibold text-foreground">Скоро буде доступно</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Цей інструмент зараз у розробці. Слідкуйте за оновленнями!
        </p>
      </div>
    );
  }
};

const isWideLayout = (slug: string) => ["calendar", "cashflow", "invoice", "hire-roi", "credit-calc", "deposit-calc", "invest-calc", "insurance-calc"].includes(slug);

const ToolPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = TOOLS.find((t) => t.slug === slug);

  if (!tool) return <Navigate to="/tools" replace />;

  const enrichment = getToolEnrichment(tool.slug);
  const relatedInstitutions = enrichment?.relatedInstitutionSlugs
    .map(s => getInstitutionBySlug(s))
    .filter(Boolean) ?? [];
  const relatedTools = enrichment?.relatedToolSlugs
    .map(s => TOOLS.find(t => t.slug === s))
    .filter(Boolean) ?? [];

  const faqJsonLd = enrichment?.faq?.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: enrichment.faq.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } : null;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Посилання скопійовано");
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  };

  return (
    <PortalLayout
      meta={{
        title: tool.name,
        description: enrichment?.heroSubtitle || tool.description,
        canonical: `${SITE_URL}/tools/${tool.slug}`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Інструменти", url: `${SITE_URL}/tools` },
          { name: tool.name, url: `${SITE_URL}/tools/${tool.slug}` },
        ])}
      />
      <JsonLd
        data={getSoftwareApplicationSchema({
          name: tool.name,
          description: enrichment?.heroSubtitle || tool.description,
          url: `${SITE_URL}/tools/${tool.slug}`,
          applicationCategory: "FinanceApplication",
        })}
      />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <div className={`mx-auto px-4 py-6 sm:py-8 ${isWideLayout(tool.slug) ? "max-w-5xl" : "max-w-3xl"}`}>
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Інструменти", to: "/tools" },
            { label: tool.name },
          ]}
        />

        {/* Compact Hero */}
        <div className="mb-5">
          {enrichment?.updatedDate && (
            <p className="text-xs text-muted-foreground">
              Оновлено: {enrichment.updatedDate}
            </p>
          )}
          <h1 className="mt-2 text-2xl font-bold text-foreground">{tool.name}</h1>

          {/* Social proof */}
          {tool.usageLabel && (
            <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>{tool.usageLabel}</span>
            </div>
          )}

          {/* Value proposition */}
          {enrichment?.valueProp ? (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl">
              {enrichment.valueProp}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl line-clamp-2">
              {enrichment?.heroDescription || tool.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {enrichment?.features?.map((feature) => (
              <span key={feature} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {feature}
              </span>
            ))}
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 ml-auto text-muted-foreground" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Поділитися</span>
            </Button>
          </div>
        </div>

        {/* How it works */}
        {enrichment?.howItWorks && enrichment.howItWorks.length === 3 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Як це працює</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {enrichment.howItWorks.map((step, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-snug">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculator with wrapper */}
        <div className="rounded-2xl border border-border/50 p-4 sm:p-6">
          <p className="mb-3 text-xs uppercase tracking-wider font-medium text-muted-foreground">
            Розрахуйте зараз
          </p>
          {renderTool(tool.slug)}
        </div>

        {tool.slug === "kved" && (
          <div className="mt-6 text-center">
            <Link to="/dovidnyky/kved" className="text-sm font-medium text-primary hover:underline">
              Повний каталог КВЕД →
            </Link>
          </div>
        )}


        {/* Combined Resources */}
        {(relatedInstitutions.length > 0 || relatedTools.length > 0) && (
          <div className="mt-10 space-y-5">
            <h2 className="text-lg font-bold text-foreground">
              {enrichment?.resourcesTitle || "Корисні ресурси"}
            </h2>

            {relatedInstitutions.length > 0 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                {relatedInstitutions.map((inst) => inst && (
                  <Link
                    key={inst.slug}
                    to={`/dovidnyky/ustanovy/profile/${inst.slug}`}
                    className="group flex-shrink-0 w-40 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors"
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white mb-2"
                      style={{ backgroundColor: inst.logo.color }}
                    >
                      {inst.logo.initials}
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate">{inst.shortName || inst.name}</p>
                    {inst.ratings?.fintodo?.overall && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-medium text-muted-foreground">{inst.ratings.fintodo.overall}/10</span>
                      </div>
                    )}
                    <span className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] text-primary font-medium">
                      Профіль <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {relatedTools.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {relatedTools.map((rt) => rt && (
                  <Link
                    key={rt.slug}
                    to={`/tools/${rt.slug}`}
                    className="group rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{rt.emoji}</span>
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{rt.name}</span>
                      <ArrowRight className="h-3 w-3 ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{rt.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ */}
        {enrichment?.faq && enrichment.faq.length > 0 && (
          <div className="mt-8 rounded-xl bg-muted/20 p-4 sm:p-6">
            <FaqAccordion items={enrichment.faq.map(f => ({ question: f.q, answer: f.a }))} />
          </div>
        )}

        {/* CTA */}
        {enrichment && (
          <div className="mt-8">
            <ContextualCta
              title={enrichment.ctaTitle}
              body={enrichment.ctaBody}
              ctaLabel="Спробувати безкоштовно →"
              ctaHref={CTA_CHECKOUT_URL}
            />
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default ToolPage;
