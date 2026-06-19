import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { TldrBox } from "@/portal/components/TldrBox";
import { WarningBlock } from "@/portal/components/WarningBlock";
import { PracticalExampleBlock } from "@/portal/components/PracticalExampleBlock";
import { ConsequencesBlock } from "@/portal/components/ConsequencesBlock";
import { FaqSection } from "@/portal/components/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getGovernmentServiceSchema, SITE_URL } from "@/portal/seo/structuredData";
import { REGISTERS } from "@/portal/data/registers";
import { EntryWithSiblingsLayout } from "@/portal/components/EntryWithSiblingsLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink, CheckCircle2, ListOrdered,
  Clock, Scale, Search, Link as LinkIcon,
  XCircle, Users, Building2, Sparkles, ArrowRight,
} from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const AUDIENCE_LABELS: Record<string, string> = {
  business: "Для бізнесу",
  personal: "Для фізосіб",
  both: "Для всіх",
};

const RegisterEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const register = REGISTERS.find((r) => r.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!register)
    return (
      <PortalLayout meta={{ title: "Реєстр не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h1 className="text-2xl font-semibold mb-2">Реєстр не знайдено</h1>
          <Link to="/dovidnyky/reestry" className="text-primary font-medium hover:underline">
            ← До каталогу реєстрів
          </Link>
        </div>
      </PortalLayout>
    );

  const related = register.relatedRegisters
    ?.map((s) => REGISTERS.find((r) => r.slug === s))
    .filter(Boolean) ?? [];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Коли потрібен ${register.shortName}?`,
        acceptedAnswer: { "@type": "Answer", text: register.whenNeeded },
      },
      ...(register.legalBasis
        ? [{
            "@type": "Question",
            name: `Яка правова основа для ${register.shortName}?`,
            acceptedAnswer: { "@type": "Answer", text: register.legalBasis },
          }]
        : []),
    ],
  };

  return (
    <PortalLayout
      meta={{
        title: `${register.shortName} — державний реєстр | FINTODO`,
        description: register.description,
        canonical: `${SITE_URL}/dovidnyky/reestry/${register.slug}`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Реєстри", url: `${SITE_URL}/dovidnyky/reestry` },
          { name: register.shortName, url: `${SITE_URL}/dovidnyky/reestry/${register.slug}` },
        ])}
      />
      <JsonLd
        data={getGovernmentServiceSchema({
          name: register.name,
          description: register.description,
          url: `${SITE_URL}/dovidnyky/reestry/${register.slug}`,
          serviceUrl: register.url,
          providerName: register.operator,
        })}
      />
      <JsonLd data={faqSchema} />

      <EntryWithSiblingsLayout
        items={[...REGISTERS]
          .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
          .map((r) => ({ slug: r.slug, label: r.name }))}
        currentSlug={register.slug}
        basePath="/dovidnyky/reestry"
        title="Державні реєстри"
        backHref="/dovidnyky/reestry"
      >
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Реєстри", to: "/dovidnyky/reestry" },
            { label: register.shortName },
          ]}
        />

        <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16 pt-2">
          {/* Header */}
          <header className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {register.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    <Building2 className="w-3 h-3 mr-1" /> {register.operator}
                  </Badge>
                  {register.isFree ? (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Безкоштовно
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" /> Платний
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    <Users className="w-3 h-3 mr-1" /> {AUDIENCE_LABELS[register.audience]}
                  </Badge>
                </div>
              </div>
            </div>
          </header>

          {/* TldrBox */}
          <TldrBox text={register.description} />

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Оператор</p>
              <p className="text-sm font-semibold text-foreground">{register.operator}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Вартість</p>
              <p className="text-sm font-semibold text-foreground">{register.isFree ? "Безкоштовно" : "Платний"}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Аудиторія</p>
              <p className="text-sm font-semibold text-foreground">{AUDIENCE_LABELS[register.audience]}</p>
            </Card>
          </div>

          {/* Description */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">📋 Опис реєстру</h2>
            <Card className="p-4 sm:p-5">
              {register.fullDescription.split('\n\n').map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed mt-2 first:mt-0">{p}</p>
              ))}
            </Card>
          </section>

          {/* When needed */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Коли потрібен цей реєстр</h2>
            </div>
            <Card className="p-4 sm:p-5">
              <p className="text-sm text-muted-foreground">{register.whenNeeded}</p>
            </Card>
          </section>

          {/* What to check */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Що можна перевірити</h2>
            </div>
            <Card className="p-4 sm:p-5">
              <ul className="space-y-2">
                {register.whatToCheck.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* How to use */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Як користуватися</h2>
            </div>
            <Card className="p-4 sm:p-5">
              <ol className="space-y-1.5">
                {register.howToUse.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </section>

          {/* Tips */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Поради та лайфхаки</h2>
            </div>
            <Card className="p-4 sm:p-5">
              <ul className="space-y-2">
                {register.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Legal basis */}
          {register.legalBasis && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Правова основа</h2>
              </div>
              <Card className="p-4 sm:p-5">
                <p className="text-sm text-muted-foreground">{register.legalBasis}</p>
              </Card>
            </section>
          )}

          {/* Warnings */}
          {register.warnings && register.warnings.length > 0 && (
            <WarningBlock items={register.warnings} />
          )}

          {/* Practical Example */}
          {register.practicalExample && (
            <PracticalExampleBlock text={register.practicalExample} />
          )}

          {/* Consequences */}
          {register.consequences && (
            <ConsequencesBlock text={register.consequences} />
          )}

          {/* FAQ */}
          {register.faq && register.faq.length > 0 && (
            <FaqSection items={register.faq} />
          )}

          {/* CTA — register link + AI */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Перейти до реєстру</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Відкрийте офіційний сайт {register.shortName} для перевірки даних.
              {!register.isFree && " Зверніть увагу: деякі функції реєстру є платними."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <a href={register.url} target="_blank" rel="noopener noreferrer">
                  Перейти до {register.shortName} <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/consultant?ctx=register&id=${register.slug}`}>
                  🤖 Запитати AI про реєстр
                </Link>
              </Button>
            </div>
          </section>

          {/* FINTODO help */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">FINTODO допомагає</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-консультант допоможе перевірити контрагента, пояснить дані з реєстру та підкаже, на що звернути увагу.
            </p>
            <Link to={CTA_CHECKOUT_URL}>
              <Button size="sm">Почати безкоштовно <ArrowRight className="ml-2 h-3 w-3" /></Button>
            </Link>
          </section>

          {/* Related registers */}
          {related.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Пов'язані реєстри</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {related.map((r) => r && (
                  <Link key={r.id} to={`/dovidnyky/reestry/${r.slug}`}>
                    <Card className="p-4 hover:border-primary/40 transition-colors h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Search className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm leading-tight">{r.shortName}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back */}
          <Link
            to="/dovidnyky/reestry"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← Всі реєстри
          </Link>
        </div>
      </EntryWithSiblingsLayout>
          <RelatedPartnersBlock directoryId="reestry" />
    </PortalLayout>
  );
};

export default RegisterEntryPage;
