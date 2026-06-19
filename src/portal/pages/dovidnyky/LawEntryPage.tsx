import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { TldrBox } from "@/portal/components/TldrBox";
import { WarningBlock } from "@/portal/components/WarningBlock";
import { PracticalExampleBlock } from "@/portal/components/PracticalExampleBlock";
import { ConsequencesBlock } from "@/portal/components/ConsequencesBlock";
import { FaqSection } from "@/portal/components/FaqSection";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getFaqSchema, SITE_URL } from "@/portal/seo/structuredData";
import { LAWS, LAW_CATEGORY_MAP, LAW_TYPE_MAP } from "@/portal/data/laws";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";

const IMPACT_COLOR: Record<string, string> = {
  high: "border-destructive/40 bg-destructive/5",
  medium: "border-amber-500/40 bg-amber-500/5",
  low: "border-border bg-muted/30",
};

const IMPACT_BADGE: Record<string, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

const LawEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const law = LAWS.find((l) => l.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!law) return (
    <PortalLayout meta={{ title: "Закон не знайдено", description: "", canonical: "" }}>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="text-5xl mb-3">⚖️</div>
        <h1 className="text-2xl font-semibold mb-2">Закон не знайдено</h1>
        <Link to="/dovidnyky/zakony" className="text-primary font-medium hover:underline">← До довідника законів</Link>
      </div>
    </PortalLayout>
  );

  const faqItems = law.keyPoints.map((kp) => {
    const [question, ...rest] = kp.split(' — ');
    return { question: question || kp, answer: rest.join(' — ') || kp };
  });

  return (
    <PortalLayout
      meta={{
        title: `${law.shortName} — огляд і зміни 2025 | FINTODO`,
        description: law.description,
        canonical: `${SITE_URL}/dovidnyky/zakony/${law.slug}`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Законодавство", url: `${SITE_URL}/dovidnyky/zakony` },
        { name: law.shortName, url: `${SITE_URL}/dovidnyky/zakony/${law.slug}` },
      ])} />
      <JsonLd data={getFaqSchema(faqItems)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={[...LAWS]
            .sort((a, b) => a.shortName.localeCompare(b.shortName, 'uk'))
            .map((l) => ({
              slug: l.slug,
              label: l.shortName,
              group: LAW_CATEGORY_MAP[l.category],
              meta: LAW_TYPE_MAP[l.type],
            }))}
          currentSlug={law.slug}
          basePath="/dovidnyky/zakony"
          backHref="/dovidnyky/zakony"
          title="Законодавство"
        />
        <div className="flex-1 min-w-0 lg:max-w-4xl">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Законодавство", to: "/dovidnyky/zakony" },
          { label: law.shortName },
        ]} />

        <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{LAW_TYPE_MAP[law.type]}</Badge>
              <Badge variant="secondary">{LAW_CATEGORY_MAP[law.category]}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{law.shortName}</h1>
            <p className="text-muted-foreground">{law.fullName}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {law.number} · Прийнятий: {law.adoptedDate} · Останні зміни: {law.lastAmendedDate}
            </p>
          </div>

          <TldrBox text={law.description} />

          {/* Key points */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Ключові положення</h2>
            <ol className="space-y-2 list-decimal list-inside">
              {law.keyPoints.map((kp, i) => (
                <li key={i} className="text-sm text-muted-foreground leading-relaxed pl-1">
                  {kp}
                </li>
              ))}
            </ol>
          </section>

          {/* Business impact */}
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Вплив на бізнес</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{law.businessImpact}</p>
          </section>

          {/* Recent changes */}
          {law.recentChanges.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Останні зміни</h2>
              <div className="space-y-3">
                {law.recentChanges.map((rc, i) => (
                  <Card key={i} className={`p-4 border-l-4 ${IMPACT_COLOR[rc.impact]}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{rc.date}</span>
                      <Badge variant={IMPACT_BADGE[rc.impact]} size="sm">
                        {rc.impact === 'high' ? 'Важливо' : rc.impact === 'medium' ? 'Помірно' : 'Низький вплив'}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{rc.change}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Warnings */}
          {law.warnings && law.warnings.length > 0 && (
            <WarningBlock items={law.warnings} title="На що звернути увагу" />
          )}

          {/* Practical Example */}
          {law.practicalExample && (
            <PracticalExampleBlock text={law.practicalExample} />
          )}

          {/* Consequences */}
          {law.consequences && (
            <ConsequencesBlock text={law.consequences} title="Ризики незнання закону" />
          )}

          {/* FAQ */}
          {law.faq && law.faq.length > 0 && (
            <FaqSection items={law.faq} />
          )}

          {/* FINTODO help */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">FINTODO допомагає</h2>
            </div>
            <p className="text-sm text-muted-foreground">{law.fintodoHelp}</p>
            <Link to={CTA_CHECKOUT_URL}>
              <Button size="sm">Почати безкоштовно <ArrowRight className="ml-2 h-3 w-3" /></Button>
            </Link>
          </section>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {law.tags.map((t) => (
              <Badge key={t} variant="secondary" className="py-1 px-3">{t}</Badge>
            ))}
          </div>

          {/* Official source + AI link */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Button variant="outline" asChild>
              <a href={law.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Переглянути на Zakon.rada.gov.ua
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/consultant?ctx=law&id=${law.slug}`}>
                🤖 Запитати AI про {law.shortName}
              </Link>
            </Button>
          </div>
        </div>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="zakony" />
    </PortalLayout>
  );
};

export default LawEntryPage;
