import { ReactNode } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getFaqSchema } from "@/portal/seo/structuredData";
import { ContextualCta } from "@/portal/components/ContextualCta";
import { Badge } from "@/components/ui/badge";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface StatItem {
  label: string;
  value: string;
}

interface CtaConfig {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface LegacyHubLayoutProps {
  meta: {
    title: string;
    description: string;
    canonical: string;
  };
  breadcrumbs: BreadcrumbItem[];
  breadcrumbSchema: { name: string; url: string }[];
  title: string;
  subtitle: string;
  stats?: StatItem[];
  faqItems?: FaqItem[];
  sidebar?: ReactNode;
  cta?: CtaConfig;
  children: ReactNode;
  topContent?: ReactNode;
}

/**
 * Legacy HubLayout for pages that haven't migrated to config-based HubLayout.
 * Used by ToolsHub, RankingsPage, etc.
 */
export const LegacyHubLayout = ({
  meta,
  breadcrumbs,
  breadcrumbSchema,
  title,
  subtitle,
  stats,
  faqItems,
  sidebar,
  cta,
  children,
  topContent,
}: LegacyHubLayoutProps) => {
  return (
    <PortalLayout meta={meta}>
      <JsonLd data={getBreadcrumbSchema(breadcrumbSchema)} />
      {faqItems && faqItems.length > 0 && <JsonLd data={getFaqSchema(faqItems)} />}

      <div className="max-w-7xl mx-auto px-4">
        <BreadcrumbNav items={breadcrumbs} />

        {/* Header */}
        <header className="py-4 sm:py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-4xl tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>
          {stats && stats.length > 0 && (
            <div className="flex gap-2 pt-1">
              {stats.map((s) => (
                <Badge key={s.label} variant="secondary" className="font-mono text-xs">
                  <span className="font-semibold text-foreground mr-1">{s.value}</span>
                  {s.label}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Top content (filters, pills) */}
        {topContent && <div className="pb-6">{topContent}</div>}

        {/* Main grid */}
        {sidebar ? (
          <div className="grid lg:grid-cols-[1fr_300px] gap-8 pb-12">
            <div className="min-w-0">{children}</div>
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-5">{sidebar}</div>
            </aside>
          </div>
        ) : (
          <div className="pb-12">{children}</div>
        )}

        {/* CTA */}
        {cta && (
          <div className="pb-16">
            <ContextualCta {...cta} />
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
