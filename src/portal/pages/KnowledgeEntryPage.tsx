import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { TldrBox } from "@/portal/components/TldrBox";
import { WarningBlock } from "@/portal/components/WarningBlock";
import { PracticalExampleBlock } from "@/portal/components/PracticalExampleBlock";
import { FaqSection } from "@/portal/components/FaqSection";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getDefinedTermSchema, SITE_URL } from "@/portal/seo/structuredData";
import { KNOWLEDGE, type KnowledgeEntry } from "@/portal/data/knowledge";
import { ARTICLES } from "@/portal/data/articles";
import { TOOLS } from "@/portal/data/tools";
import { ArrowRight, Bot } from "lucide-react";

const CATEGORY_MAP: Record<KnowledgeEntry["category"], string> = {
  tax: "Податки",
  accounting: "Облік",
  law: "Право",
  finance: "Фінанси",
};

const KnowledgeEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const entry = KNOWLEDGE.find((k) => k.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!entry) return (
    <PortalLayout meta={{ title: "Термін не знайдено", description: "", canonical: "" }}>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="text-5xl mb-3">📖</div>
        <h1 className="text-2xl font-semibold mb-2">Термін не знайдено</h1>
        <p className="text-muted-foreground mb-6">Можливо, він був переміщений або видалений</p>
        <Link to="/dovidnyky/slovnyk" className="text-primary font-medium hover:underline">← До словника</Link>
      </div>
    </PortalLayout>
  );

  const relatedTerms = entry.relatedTermSlugs
    .map((s) => KNOWLEDGE.find((k) => k.slug === s))
    .filter(Boolean) as KnowledgeEntry[];

  const relatedArticles = entry.relatedArticleIds
    .map((id) => ARTICLES.find((a) => a.id === id))
    .filter(Boolean);

  const relatedTools = entry.relatedToolIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <PortalLayout
      meta={{
        title: `${entry.term} — що це таке`,
        description: entry.shortDefinition,
        canonical: `${SITE_URL}/dovidnyky/slovnyk/${entry.slug}`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Словник", url: `${SITE_URL}/dovidnyky/slovnyk` },
        { name: entry.term, url: `${SITE_URL}/dovidnyky/slovnyk/${entry.slug}` },
      ])} />
      <JsonLd data={getDefinedTermSchema(entry)} />
      {entry.faq && entry.faq.length > 0 && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: entry.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }} />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Словник", to: "/dovidnyky/slovnyk" },
          { label: entry.term },
        ]} />

        <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{entry.term}</h1>
              <Badge variant="outline">{CATEGORY_MAP[entry.category]}</Badge>
            </div>
          </div>

          <TldrBox text={entry.shortDefinition} />

          {/* Full definition */}
          {entry.fullDefinition && (
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">📝 Детальне пояснення</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                {entry.fullDefinition.split('\n\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {/* Warnings */}
          {entry.warnings && entry.warnings.length > 0 && (
            <WarningBlock items={entry.warnings} />
          )}

          {/* Practical example */}
          {entry.practicalExample && (
            <PracticalExampleBlock text={entry.practicalExample} />
          )}

          {/* FAQ */}
          {entry.faq && entry.faq.length > 0 && (
            <FaqSection items={entry.faq} />
          )}

          {/* Related terms */}
          {relatedTerms.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Пов'язані терміни</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
                {relatedTerms.map((t) => (
                  <Link
                    key={t.id}
                    to={`/dovidnyky/slovnyk/${t.slug}`}
                    className="snap-start shrink-0 w-56"
                  >
                    <Card className="p-4 h-full hover:border-primary/50 transition-colors">
                      <h3 className="font-semibold text-foreground">{t.term}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {t.shortDefinition}
                      </p>
                      <span className="text-xs font-medium text-primary mt-2 inline-flex items-center gap-1">
                        Детальніше <ArrowRight className="h-3 w-3" />
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Статті по темі</h2>
              <div className="space-y-3">
                {relatedArticles.map((a) => a && (
                  <Link
                    key={a.id}
                    to={`/articles/${a.slug}`}
                    className="flex items-start gap-3 group"
                  >
                    <Badge variant="outline" size="sm">{a.categoryLabel}</Badge>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                      {a.title}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related tools */}
          {relatedTools.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Корисні інструменти</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {relatedTools.map((t) => t && (
                  <Link key={t.id} to={`/tools/${t.slug}`}>
                    <Card className="p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.emoji}</span>
                        <div>
                          <h3 className="font-medium text-foreground text-sm">{t.name}</h3>
                          <p className="text-xs text-muted-foreground">{t.description}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* AI button */}
          <Link to="/ai">
            <Button variant="outline" className="w-full gap-2">
              <Bot className="h-4 w-4" />
              Запитати AI про «{entry.term}»
            </Button>
          </Link>

          {/* FINTODO CTA */}
          <Card className="p-4 sm:p-6 border-primary/20 bg-primary/5 space-y-2 sm:space-y-3">
            <h2 className="text-lg font-bold text-foreground">Потрібна допомога з «{entry.term}»?</h2>
            <p className="text-sm text-muted-foreground">FINTODO автоматично враховує всі податкові нюанси та нагадує про дедлайни.</p>
            <Link to="/tools/tax-wizard">
              <Button>Спробувати FINTODO <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default KnowledgeEntryPage;
