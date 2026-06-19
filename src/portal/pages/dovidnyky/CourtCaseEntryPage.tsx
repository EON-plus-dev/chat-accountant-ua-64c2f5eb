import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { ExternalLink, ArrowRight, Sparkles, Gavel } from "lucide-react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { TldrBox } from "@/portal/components/TldrBox";
import { FaqSection } from "@/portal/components/FaqSection";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getFaqSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  COURT_CASES,
  COURT_INSTANCE_LABEL,
  COURT_TOPIC_LABEL,
  COURT_OUTCOME_LABEL,
  getCourtCaseBySlug,
} from "@/portal/data/courtCases";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const OUTCOME_VARIANT: Record<string, "default" | "destructive" | "warning" | "secondary"> = {
  plaintiff: "default",
  defendant: "destructive",
  partial: "warning",
  remanded: "secondary",
};

const CourtCaseEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const c = slug ? getCourtCaseBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!c) {
    return (
      <PortalLayout meta={{ title: "Рішення не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">⚖️</div>
          <h1 className="text-2xl font-semibold mb-2">Рішення не знайдено</h1>
          <Link to="/dovidnyky/sudy" className="text-primary font-medium hover:underline">
            ← До судової практики
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/sudy/${c.slug}`;

  return (
    <PortalLayout
      meta={{
        title: c.seoTitle ?? `${c.title} | Судова практика FINTODO`,
        description: c.seoDescription ?? c.summary,
        canonical,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Судова практика", url: `${SITE_URL}/dovidnyky/sudy` },
          { name: c.title, url: canonical },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LegalDocument",
          name: c.title,
          identifier: c.caseNumber,
          dateCreated: c.decisionDate,
          author: { "@type": "GovernmentOrganization", name: c.court },
          about: COURT_TOPIC_LABEL[c.topic],
          url: canonical,
          sameAs: c.registryUrl,
          description: c.summary,
        }}
      />
      {c.faq && c.faq.length > 0 && (
        <JsonLd data={getFaqSchema(c.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={[...COURT_CASES]
            .sort((a, b) => b.decisionDate.localeCompare(a.decisionDate))
            .map((cs) => ({
              slug: cs.slug,
              label: cs.title,
              group: COURT_TOPIC_LABEL[cs.topic],
              meta: `${cs.caseNumber} · ${cs.decisionDate}`,
            }))}
          currentSlug={c.slug}
          basePath="/dovidnyky/sudy"
          backHref="/dovidnyky/sudy"
          title="Судова практика"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav
            items={[
              { label: "Головна", to: "/" },
              { label: "Довідники", to: "/dovidnyky" },
              { label: "Судова практика", to: "/dovidnyky/sudy" },
              { label: c.title },
            ]}
          />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{COURT_TOPIC_LABEL[c.topic]}</Badge>
                <Badge variant="secondary">{COURT_INSTANCE_LABEL[c.instance]}</Badge>
                <Badge variant={OUTCOME_VARIANT[c.outcome]}>{COURT_OUTCOME_LABEL[c.outcome]}</Badge>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{c.title}</h1>
              <p className="text-xs text-muted-foreground font-mono">
                Справа № {c.caseNumber} · {c.decisionDate} · {c.court}
              </p>
            </div>

            <TldrBox text={c.summary} />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Фабула справи</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.facts}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Мотивувальна частина</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.reasoning}</p>
            </section>

            <Card className="p-4 border-l-4 border-l-primary bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <Gavel className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">Рішення суду</h2>
              </div>
              <p className="text-sm text-foreground">{c.outcomeDetail}</p>
            </Card>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Що це означає для бізнесу</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.practicalImpact}</p>
            </section>

            {c.faq && c.faq.length > 0 && <FaqSection items={c.faq} />}

            <RelatedEntriesPanel category="sudy" slug={c.slug} />

            <div className="flex gap-2 flex-wrap">
              {c.tags.map((t) => (
                <Badge key={t} variant="secondary" className="py-1 px-3">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <Button variant="outline" asChild>
                <a
                  href={c.registryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Повний текст у ЄДРСР
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/consultant?ctx=court&id=${c.slug}`}>🤖 Запитати AI про це рішення</Link>
              </Button>
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">FINTODO допомагає</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-консультант FINTODO відстежує практику Верховного Суду і попереджає, коли ваша ситуація має
                ризики на основі прецедентів.
              </p>
              <Link to={CTA_CHECKOUT_URL}>
                <Button size="sm">
                  Спробувати безкоштовно <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </section>
          </div>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="sudy" />
    </PortalLayout>
  );
};

export default CourtCaseEntryPage;
