import { useMemo } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/portal/seo/structuredData";
import { SITE_URL } from "@/portal/seo/structuredData";
import { ToolsGrid } from "@/portal/sections/tools-grid/ToolsGrid";
import { TaxWizard } from "@/portal/sections/tax-wizard/TaxWizard";
import { ContextualCta } from "@/portal/components/ContextualCta";
import { Badge } from "@/components/ui/badge";
import { TOOLS } from "@/portal/data/tools";
import { Users, BarChart3 } from "lucide-react";

const ToolsHub = () => {
  const { totalTools, totalUsage } = useMemo(() => {
    const total = TOOLS.reduce((s, t) => s + t.usageCount, 0);
    return {
      totalTools: TOOLS.length,
      totalUsage: total >= 1000 ? `${(total / 1000).toFixed(1).replace(/\.0$/, "")} тис` : String(total),
    };
  }, []);

  return (
    <PortalLayout
      meta={{
        title: "Інструменти для бізнесу",
        description: "Калькулятори, конструктори та довідники для бухгалтерів і підприємців.",
        canonical: `${SITE_URL}/tools`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Інструменти", url: `${SITE_URL}/tools` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Інструменти" }]} />

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-b from-primary/5 to-transparent p-4 sm:p-6 lg:p-6 mb-6">
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-3xl font-bold text-foreground tracking-tight">
            Фінансові інструменти для бізнесу
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
            Калькулятори, довідники та генератори з актуальними даними 2026 року.
            Безкоштовно, без реєстрації.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="font-mono text-xs gap-1.5">
              <BarChart3 className="h-3 w-3" />
              {totalTools} інструментів
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs gap-1.5">
              <Users className="h-3 w-3" />
              {totalUsage} розрахунків
            </Badge>
          </div>
        </div>

        {/* All tools (sorted by popularity by default) */}
        <ToolsGrid />

        {/* Tax Wizard */}
        <TaxWizard />

        {/* CTA */}
        <div className="pb-16 pt-4">
          <ContextualCta
            title="Автоматизуйте рутинні розрахунки"
            body="FINTODO допомагає бухгалтерам та підприємцям автоматизувати податковий облік, формувати звітність та стежити за дедлайнами."
            ctaLabel="Спробувати безкоштовно →"
            ctaHref="/register"
          />
        </div>
      </div>
    </PortalLayout>
  );
};

export default ToolsHub;
