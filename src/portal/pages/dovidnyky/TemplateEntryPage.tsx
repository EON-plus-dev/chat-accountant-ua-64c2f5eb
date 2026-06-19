import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { TldrBox } from "@/portal/components/TldrBox";
import { WarningBlock } from "@/portal/components/WarningBlock";
import { PracticalExampleBlock } from "@/portal/components/PracticalExampleBlock";
import { FaqSection } from "@/portal/components/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/portal/data/templates";
import { EntryWithSiblingsLayout } from "@/portal/components/EntryWithSiblingsLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import {
  FileText, CheckCircle2, ListOrdered,
  Clock, Scale, Sparkles, Download, Link as LinkIcon,
} from "lucide-react";

const AUDIENCE_LABELS: Record<string, string> = {
  business: "Для бізнесу",
  personal: "Для фізосіб",
  both: "Для всіх",
};

const TemplateEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const template = TEMPLATES.find((t) => t.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!template)
    return (
      <PortalLayout meta={{ title: "Шаблон не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">📄</div>
          <h1 className="text-2xl font-semibold mb-2">Шаблон не знайдено</h1>
          <Link to="/dovidnyky/templates" className="text-primary font-medium hover:underline">
            ← До каталогу шаблонів
          </Link>
        </div>
      </PortalLayout>
    );

  const category = TEMPLATE_CATEGORIES.find((c) => c.id === template.category);
  const related = template.relatedTemplates
    ?.map((s) => TEMPLATES.find((t) => t.slug === s))
    .filter(Boolean) ?? [];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Коли потрібен ${template.name}?`,
        acceptedAnswer: { "@type": "Answer", text: template.whenNeeded },
      },
      ...(template.legalBasis
        ? [{
            "@type": "Question",
            name: `Яка правова основа для ${template.name}?`,
            acceptedAnswer: { "@type": "Answer", text: template.legalBasis },
          }]
        : []),
    ],
  };

  return (
    <PortalLayout
      meta={{
        title: `${template.name} — шаблон документа | FINTODO`,
        description: template.description,
        canonical: `${SITE_URL}/dovidnyky/templates/${template.slug}`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Шаблони", url: `${SITE_URL}/dovidnyky/templates` },
          { name: template.name, url: `${SITE_URL}/dovidnyky/templates/${template.slug}` },
        ])}
      />
      <JsonLd data={faqSchema} />

      <EntryWithSiblingsLayout
        items={[...TEMPLATES]
          .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
          .map((t) => ({
            slug: t.slug,
            label: t.name,
            group: TEMPLATE_CATEGORIES.find((c) => c.id === t.category)?.label ?? t.category,
          }))}
        currentSlug={template.slug}
        basePath="/dovidnyky/templates"
        title="Шаблони документів"
        backHref="/dovidnyky/templates"
      >
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Шаблони", to: "/dovidnyky/templates" },
            { label: template.name },
          ]}
        />

        <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16 pt-2">
          {/* Header */}
          <header className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {template.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {category && (
                    <Badge variant="outline" className="text-xs">
                      {category.emoji} {category.label}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">{template.format}</Badge>
                  <Badge variant="secondary" className="text-xs">{AUDIENCE_LABELS[template.audience]}</Badge>
                  {template.isPopular && (
                    <Badge className="text-xs bg-accent text-accent-foreground">Популярний</Badge>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* TldrBox */}
          <TldrBox text={template.description} />

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Формат</p>
              <p className="text-sm font-semibold text-foreground">{template.format}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Аудиторія</p>
              <p className="text-sm font-semibold text-foreground">{AUDIENCE_LABELS[template.audience]}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Категорія</p>
              <p className="text-sm font-semibold text-foreground">{category ? `${category.emoji} ${category.label}` : "—"}</p>
            </Card>
          </div>

          {/* Description */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">📄 Опис документа</h2>
            <Card className="p-4 sm:p-5">
              {template.fullDescription.split('\n\n').map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed mt-2 first:mt-0">{p}</p>
              ))}
            </Card>
          </section>

          {/* When needed */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Коли потрібен цей документ</h2>
            </div>
            <Card className="p-4 sm:p-5">
              <p className="text-sm text-muted-foreground">{template.whenNeeded}</p>
            </Card>
          </section>

          {/* Sections */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Структура документа</h2>
            </div>
            <Card className="p-4 sm:p-5">
              <ol className="space-y-1.5">
                {template.sections.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </section>

          {/* Tips */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Поради щодо заповнення</h2>
            </div>
            <Card className="p-4 sm:p-5">
              <ul className="space-y-2">
                {template.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Legal basis */}
          {template.legalBasis && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Правова основа</h2>
              </div>
              <Card className="p-4 sm:p-5">
                <p className="text-sm text-muted-foreground">{template.legalBasis}</p>
              </Card>
            </section>
          )}

          {/* Warnings */}
          {template.warnings && template.warnings.length > 0 && (
            <WarningBlock items={template.warnings} title="Типові помилки при заповненні" />
          )}

          {/* Practical Example */}
          {template.practicalExample && (
            <PracticalExampleBlock text={template.practicalExample} />
          )}

          {/* FAQ */}
          {template.faq && template.faq.length > 0 && (
            <FaqSection items={template.faq} />
          )}

          {/* Download CTA */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Завантажити шаблон</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              FINTODO PRO включає генератор документів з автозаповненням реквізитів — створіть {template.name.toLowerCase()} за 30 секунд.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Button asChild>
                <a href={CTA_CHECKOUT_URL}>
                  <Download className="w-4 h-4 mr-2" /> Завантажити шаблон
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={CTA_CHECKOUT_URL}>
                  <Sparkles className="w-4 h-4 mr-2" /> Генерувати з автозаповненням
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/consultant?ctx=template&id=${template.slug}`}>
                  🤖 Запитати AI про документ
                </Link>
              </Button>
            </div>
          </section>

          {/* Related templates */}
          {related.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Пов'язані шаблони</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {related.map((t) => t && (
                  <Link key={t.id} to={`/dovidnyky/templates/${t.slug}`}>
                    <Card className="p-4 hover:border-primary/40 transition-colors h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm leading-tight">{t.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
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
            to="/dovidnyky/templates"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← Всі шаблони
          </Link>
        </div>
      </EntryWithSiblingsLayout>
          <RelatedPartnersBlock directoryId="templates" />
    </PortalLayout>
  );
};

export default TemplateEntryPage;
