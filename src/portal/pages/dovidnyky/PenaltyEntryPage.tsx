import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect, useMemo } from "react";
import { ExternalLink, ArrowRight, Sparkles, CheckCircle2, ShieldAlert, Bot, AlertTriangle, Search, CalendarDays } from "lucide-react";
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
import { PENALTIES } from "@/portal/data/penalties";
import { DEADLINES } from "@/portal/data/deadlines";
import { DeadlineCard } from "@/portal/components/DeadlineCard";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { EntryWithSiblingsLayout } from "@/portal/components/EntryWithSiblingsLayout";

const SEVERITY_LABEL: Record<string, string> = {
  critical: "КРИТИЧНО",
  high: "СЕРЙОЗНО",
  medium: "СЕРЕДНЄ",
  low: "НЕЗНАЧНО",
};

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

const PenaltyEntryPage = () => {
  const { id } = useParams<{ id: string }>();
  const penalty = PENALTIES.find((p) => p.slug === id);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  if (!penalty)
    return (
      <PortalLayout meta={{ title: "Штраф не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">⚠️</div>
          <h1 className="text-2xl font-semibold mb-2">Штраф не знайдено</h1>
          <Link
            to="/dovidnyky/penalties"
            className="text-primary font-medium hover:underline"
          >
            ← До довідника штрафів
          </Link>
        </div>
      </PortalLayout>
    );

  const faqItems = [
    { question: `Який штраф за: ${penalty.title}?`, answer: penalty.penaltyAmount },
    {
      question: `Як уникнути штрафу: ${penalty.title}?`,
      answer: penalty.howToAvoid.join(". "),
    },
  ];

  return (
    <PortalLayout
      meta={{
        title: `${penalty.title} — штраф і як уникнути | FINTODO`,
        description: `${penalty.penaltyAmount}. ${penalty.description}`,
        canonical: `${SITE_URL}/dovidnyky/penalties/${penalty.slug}`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Штрафи і санкції", url: `${SITE_URL}/dovidnyky/penalties` },
          {
            name: penalty.title,
            url: `${SITE_URL}/dovidnyky/penalties/${penalty.slug}`,
          },
        ])}
      />
      <JsonLd data={getFaqSchema(faqItems)} />

      <EntryWithSiblingsLayout
        items={[...PENALTIES]
          .sort((a, b) => a.title.localeCompare(b.title, 'uk'))
          .map((p) => ({
            slug: p.slug,
            label: p.title,
            group: p.category,
          }))}
        currentSlug={penalty.slug}
        basePath="/dovidnyky/penalties"
        title="Штрафи"
        backHref="/dovidnyky/penalties"
      >
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Штрафи", to: "/dovidnyky/penalties" },
            { label: penalty.title },
          ]}
        />

        <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16 pt-2">
          {/* Header */}
          <header className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={SEVERITY_VARIANT[penalty.severity]}>
                {SEVERITY_LABEL[penalty.severity]}
              </Badge>
              <Badge variant="outline">{penalty.category}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
              {penalty.title}
            </h1>
            <p className="text-muted-foreground">{penalty.description}</p>
          </header>

          {/* TldrBox */}
          <TldrBox text={`Штраф: ${penalty.penaltyAmount}. ${penalty.howToAvoid[0]}`} />

          {/* Penalty amounts */}
          <Card className="p-4 sm:p-5 space-y-2 sm:space-y-3 border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-bold text-foreground">Розмір штрафу</h2>
            </div>
            <p className="text-lg font-mono font-semibold text-destructive">
              {penalty.penaltyAmount}
            </p>
            {penalty.penaltyAmountSecond && (
              <p className="text-sm font-mono text-destructive/80">
                Повторно: {penalty.penaltyAmountSecond}
              </p>
            )}
          </Card>

          {/* Legal basis */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Правова основа</h2>
            <Card className="p-4 sm:p-5 space-y-2">
              <p className="text-sm text-muted-foreground">{penalty.legalBasis}</p>
              <a
                href={penalty.legalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Відкрити текст закону <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Card>
          </section>

          {/* How to avoid */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Як уникнути</h2>
            <Card className="p-4 sm:p-5">
              <ul className="space-y-2">
                {penalty.howToAvoid.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* What to do if fined */}
          {penalty.whatToDoIfFined && penalty.whatToDoIfFined.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-foreground">Що робити, якщо штраф отримано</h2>
              </div>
              <Card className="p-4 sm:p-5">
                <ol className="space-y-2">
                  {penalty.whatToDoIfFined.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </section>
          )}

          {/* How to check */}
          {penalty.howToCheck && penalty.howToCheck.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Як перевірити наявність штрафу</h2>
              </div>
              <Card className="p-4 sm:p-5">
                <ul className="space-y-2">
                  {penalty.howToCheck.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {/* Warnings */}
          {penalty.warnings && penalty.warnings.length > 0 && (
            <WarningBlock items={penalty.warnings} title="На що звернути увагу" />
          )}

          {/* Practical Example */}
          {penalty.practicalExample && (
            <PracticalExampleBlock text={penalty.practicalExample} title="Як це працює на практиці" />
          )}

          {/* Consequences */}
          {penalty.consequences && (
            <ConsequencesBlock text={penalty.consequences} title="Що буде, якщо нічого не зробити" />
          )}

          {/* FAQ */}
          {penalty.faq && penalty.faq.length > 0 && (
            <FaqSection items={penalty.faq} />
          )}

          {/* Related deadlines */}
          {penalty.relatedDeadlinePattern && (() => {
            const pattern = new RegExp(penalty.relatedDeadlinePattern, 'i');
            const related = DEADLINES
              .filter(d => pattern.test(d.id))
              .sort((a, b) => a.daysLeft - b.daysLeft)
              .filter(d => d.daysLeft >= 0)
              .slice(0, 4);
            if (related.length === 0) return null;
            return (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Пов'язані дедлайни з календаря</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {related.map(d => (
                    <DeadlineCard key={d.id} deadline={d} />
                  ))}
                </div>
                <Link
                  to="/dovidnyky/kalendar"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Весь календар <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </section>
            );
          })()}

          {/* AI button */}
          <Link to="/ai">
            <Button variant="outline" className="w-full gap-2">
              <Bot className="h-4 w-4" />
              Запитати AI про «{penalty.title}»
            </Button>
          </Link>

          {/* FINTODO help */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Як FINTODO допоможе</h2>
            </div>
            <p className="text-sm text-muted-foreground">{penalty.fintodoHelp}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={CTA_CHECKOUT_URL}>
                <Button>
                  Почати безкоштовно <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {penalty.relatedToolId && (
                <Link to={`/tools/${penalty.relatedToolId}`}>
                  <Button variant="outline">Відкрити інструмент →</Button>
                </Link>
              )}
            </div>
          </section>

          {/* Back */}
          <Link
            to="/dovidnyky/penalties"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← Всі штрафи
          </Link>
        </div>
      </EntryWithSiblingsLayout>
          <RelatedPartnersBlock directoryId="penalties" />
    </PortalLayout>
  );
};

export default PenaltyEntryPage;
