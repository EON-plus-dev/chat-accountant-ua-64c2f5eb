import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getFaqSchema, SITE_URL } from "@/portal/seo/structuredData";
import { ContextualCta } from "@/portal/components/ContextualCta";

import { Card } from "@/components/ui/card";
import { HubSidebar } from "@/portal/components/HubSidebar";
import { DeadlineWidget } from "@/portal/components/sidebar-widgets/DeadlineWidget";
import { QuickCalcWidget } from "@/portal/components/sidebar-widgets/QuickCalcWidget";
import { TrendingWidget } from "@/portal/components/sidebar-widgets/TrendingWidget";
import { RelatedToolsWidget } from "@/portal/components/sidebar-widgets/RelatedToolsWidget";
import { RelatedHubsWidget } from "@/portal/components/sidebar-widgets/RelatedHubsWidget";
import { AlertWidget } from "@/portal/components/sidebar-widgets/AlertWidget";
import { HubSectionRenderer } from "@/portal/components/hub-sections/HubSectionRenderer";
import { ArticlesSection } from "@/portal/components/hub-sections/ArticlesSection";
import { FaqAccordion } from "@/portal/components/FaqAccordion";
import { ARTICLES } from "@/portal/data/articles";
import type { HubConfig, AnchorCard } from "@/portal/types/hub";

interface HubLayoutProps {
  config: HubConfig;
  children?: ReactNode;
}

const scrollTo = (sectionId: string) => {
  const el = document.getElementById(sectionId);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
};

const buildSidebar = (config: HubConfig) => {
  const { sidebar } = config;
  const widgets: ReactNode[] = [];

  if (sidebar.deadlineWidget) {
    widgets.push(<DeadlineWidget key="deadline" taxType={sidebar.deadlineWidget.taxType} />);
  }
  if (sidebar.quickCalcWidget) {
    widgets.push(<QuickCalcWidget key="calc" />);
  }
  if (sidebar.trendingWidget) {
    widgets.push(
      <TrendingWidget key="trending" category={sidebar.trendingWidget.category} limit={sidebar.trendingWidget.limit ?? 3} />
    );
  }
  if (sidebar.relatedTools?.length) {
    widgets.push(<RelatedToolsWidget key="tools" toolIds={sidebar.relatedTools} />);
  }
  if (sidebar.relatedHubs?.length) {
    widgets.push(<RelatedHubsWidget key="hubs" hubIds={sidebar.relatedHubs} />);
  }
  if (sidebar.showNewsletter) {
    widgets.push(<AlertWidget key="alert" category={config.breadcrumbLabel} />);
  }
  if (sidebar.customLinks?.length) {
    sidebar.customLinks.forEach((cl, i) => {
      widgets.push(
        <Link
          key={`custom-${i}`}
          to={cl.href}
          className="block p-3 rounded-lg border border-border hover:border-primary/40 transition-colors"
        >
          <p className="text-sm font-semibold text-foreground">{cl.label}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{cl.sublabel}</p>
        </Link>
      );
    });
  }

  if (widgets.length === 0) return undefined;
  return <HubSidebar>{widgets}</HubSidebar>;
};

export const HubLayout = ({ config, children }: HubLayoutProps) => {
  const breadcrumbs = [
    { label: "Головна", to: "/" },
    ...(config.breadcrumbParent ? [{ label: config.breadcrumbParent.label, to: config.breadcrumbParent.to }] : []),
    { label: config.breadcrumbLabel },
  ];
  const breadcrumbSchema = [
    { name: "Головна", url: `${SITE_URL}/` },
    ...(config.breadcrumbParent ? [{ name: config.breadcrumbParent.label, url: `${SITE_URL}${config.breadcrumbParent.to}` }] : []),
    { name: config.breadcrumbLabel, url: config.meta.canonical },
  ];
  const sidebar = buildSidebar(config);

  // Hoist a leading warning-bar into the hero zone so it sits directly under H1
  const heroAlert = config.sections[0]?.type === "warning-bar" ? config.sections[0] : null;
  const restSections = heroAlert ? config.sections.slice(1) : config.sections;

  // Featured article
  const featuredArticle = config.featuredArticleSlug
    ? ARTICLES.find((a) => a.slug === config.featuredArticleSlug)
    : undefined;

  return (
    <PortalLayout meta={config.meta}>
      <JsonLd data={getBreadcrumbSchema(breadcrumbSchema)} />
      {config.faqItems && config.faqItems.length > 0 && (
        <JsonLd data={getFaqSchema(config.faqItems)} />
      )}

      <div className="max-w-7xl mx-auto px-4">
        <BreadcrumbNav items={breadcrumbs} />

        {/* Header */}
        <header className="py-4 sm:py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-4xl tracking-tight">
            {config.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">{config.subtitle}</p>
          <span className="text-[10px] text-muted-foreground/60 font-mono block pt-1">
            Оновлено: {formatDate(config.updatedAt)}
          </span>
        </header>

        {/* Hero alert (hoisted leading warning-bar) */}
        {heroAlert && (
          <div className="pb-4">
            <HubSectionRenderer sections={[heroAlert]} />
          </div>
        )}

        {/* Anchor cards */}
        {config.anchorCards && config.anchorCards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pb-6">
            {config.anchorCards.map((c) => (
              <Card
                key={c.sectionId}
                className="p-2 sm:p-3 cursor-pointer hover:border-primary/40 transition-colors text-center"
                onClick={() => scrollTo(c.sectionId)}
              >
                <span className="text-lg">{c.icon}</span>
                <p className="font-semibold text-xs text-foreground mt-1">{c.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Main grid */}
        {sidebar ? (
          <div className="grid lg:grid-cols-[1fr_300px] gap-8 pb-12">
            <div className="min-w-0">
              {/* Auto-rendered sections */}
              <HubSectionRenderer sections={restSections} />

              {/* Articles section */}
              {config.articleFilter && (
                <ArticlesSection
                  pills={config.articleFilter.pills}
                  category={config.articleFilter.category}
                  audience={config.articleFilter.audience}
                  tag={config.articleFilter.tag}
                />
              )}

              {/* Custom children */}
              {children}

              {/* FAQ */}
              {config.faqItems && config.faqItems.length > 0 && (
                <section className="pb-4">
                  <FaqAccordion items={config.faqItems} />
                </section>
              )}
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-5">{sidebar}</div>
            </aside>
          </div>
        ) : (
          <div className="pb-12">
            <HubSectionRenderer sections={restSections} />
            {config.articleFilter && (
              <ArticlesSection
                pills={config.articleFilter.pills}
                category={config.articleFilter.category}
                audience={config.articleFilter.audience}
                tag={config.articleFilter.tag}
              />
            )}
            {children}
            {config.faqItems && config.faqItems.length > 0 && (
              <section className="pb-4">
                <FaqAccordion items={config.faqItems} />
              </section>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="pb-16">
          <ContextualCta {...config.cta} />
        </div>
      </div>
    </PortalLayout>
  );
};
