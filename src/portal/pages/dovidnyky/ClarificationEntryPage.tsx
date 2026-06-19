import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { ExternalLink, ArrowRight, Sparkles, FileText, AlertTriangle } from "lucide-react";
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
  CLARIFICATIONS,
  CLARIFICATION_KIND_LABEL,
  CLARIFICATION_KIND_FULL_LABEL,
  CLARIFICATION_TOPIC_LABEL,
  CLARIFICATION_STATUS_LABEL,
  getClarificationBySlug,
} from "@/portal/data/taxClarifications";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const STATUS_VARIANT: Record<string, "default" | "destructive" | "warning" | "secondary"> = {
  active: "default",
  cancelled: "destructive",
  outdated: "warning",
  superseded: "secondary",
};

const ClarificationEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const c = slug ? getClarificationBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!c) {
    return (
      <PortalLayout meta={{ title: "Розʼяснення не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">📄</div>
          <h1 className="text-2xl font-semibold mb-2">Розʼяснення не знайдено</h1>
          <Link to="/dovidnyky/rozyasnennia" className="text-primary font-medium hover:underline">
            ← До бази розʼяснень
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/rozyasnennia/${c.slug}`;

  return (
    <PortalLayout
      meta={{
        title: c.seoTitle ?? `${c.title} | Розʼяснення ДПС FINTODO`,
        description: c.seoDescription ?? c.summary,
        canonical,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Розʼяснення ДПС", url: `${SITE_URL}/dovidnyky/rozyasnennia` },
          { name: c.title, url: canonical },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LegalDocument",
          name: c.title,
          identifier: c.docNumber,
          dateCreated: c.docDate,
          author: { "@type": "GovernmentOrganization", name: c.issuer },
          about: CLARIFICATION_TOPIC_LABEL[c.topic],
          url: canonical,
          sameAs: c.sourceUrl,
          description: c.summary,
        }}
      />
      {c.faq && c.faq.length > 0 && (
        <JsonLd data={getFaqSchema(c.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={[...CLARIFICATIONS]
            .sort((a, b) => b.docDate.localeCompare(a.docDate))
            .map((cs) => ({
              slug: cs.slug,
              label: cs.title,
              group: CLARIFICATION_TOPIC_LABEL[cs.topic],
              meta: `${CLARIFICATION_KIND_LABEL[cs.kind]} · ${cs.docDate}`,
            }))}
          currentSlug={c.slug}
          basePath="/dovidnyky/rozyasnennia"
          backHref="/dovidnyky/rozyasnennia"
          title="Розʼяснення ДПС"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav
            items={[
              { label: "Головна", to: "/" },
              { label: "Довідники", to: "/dovidnyky" },
              { label: "Розʼяснення ДПС", to: "/dovidnyky/rozyasnennia" },
              { label: c.title },
            ]}
          />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{CLARIFICATION_KIND_FULL_LABEL[c.kind]}</Badge>
                <Badge variant="secondary">{CLARIFICATION_TOPIC_LABEL[c.topic]}</Badge>
                <Badge variant={STATUS_VARIANT[c.status]}>{CLARIFICATION_STATUS_LABEL[c.status]}</Badge>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{c.title}</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {c.docNumber} · {c.docDate} · {c.issuer}
              </p>
            </div>

            <TldrBox text={c.summary} />

            {c.status !== "active" && (
              <Card className="p-4 border-l-4 border-l-warning bg-warning/5">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <h2 className="text-base font-bold text-foreground">
                    Увага: статус — {CLARIFICATION_STATUS_LABEL[c.status]}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Цей документ більше не є чинним або застарів через зміни законодавства. Звіряйтеся з актуальними
                  розʼясненнями і нормами ПКУ.
                </p>
              </Card>
            )}

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Питання платника</h2>
              <p className="text-sm text-muted-foreground leading-relaxed italic">«{c.question}»</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Позиція {c.issuer}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{c.position}</p>
            </section>

            <Card className="p-4 border-l-4 border-l-primary bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">Що це означає на практиці</h2>
              </div>
              <p className="text-sm text-foreground whitespace-pre-line">{c.practicalImpact}</p>
            </Card>

            {c.warnings && c.warnings.length > 0 && (
              <Card className="p-4 border-l-4 border-l-destructive bg-destructive/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h2 className="text-base font-bold text-foreground">Ризики та застереження</h2>
                </div>
                <ul className="text-sm text-foreground space-y-1.5 list-disc pl-5">
                  {c.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </Card>
            )}

            {c.faq && c.faq.length > 0 && <FaqSection items={c.faq} />}

            <RelatedEntriesPanel category="rozyasnennia" slug={c.slug} />

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
                  href={c.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Першоджерело
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/consultant?ctx=clarification&id=${c.slug}`}>
                  🤖 Запитати AI про це розʼяснення
                </Link>
              </Button>
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">FINTODO застосовує це автоматично</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-консультант FINTODO враховує офіційні розʼяснення ДПС і Мінфіну при підготовці звітності,
                розрахунку податків і відповідях на ваші питання.
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
          <RelatedPartnersBlock directoryId="rozyasnennia" />
    </PortalLayout>
  );
};

export default ClarificationEntryPage;
