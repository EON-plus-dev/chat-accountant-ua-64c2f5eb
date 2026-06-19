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
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { RATE_TABLES, RATE_CATEGORIES } from "@/portal/data/rates";
import { EntryWithSiblingsLayout } from "@/portal/components/EntryWithSiblingsLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2, Clock, Scale, Link as LinkIcon, BarChart3,
  Sparkles, ArrowRight,
} from "lucide-react";

const RateEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const rate = RATE_TABLES.find((r) => r.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!rate)
    return (
      <PortalLayout meta={{ title: "Показник не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h1 className="text-2xl font-semibold mb-2">Показник не знайдено</h1>
          <Link to="/dovidnyky/stavky" className="text-primary font-medium hover:underline">
            ← До каталогу показників
          </Link>
        </div>
      </PortalLayout>
    );

  const category = RATE_CATEGORIES.find((c) => c.id === rate.category);
  const related = rate.relatedRates
    ?.map((s) => RATE_TABLES.find((r) => r.slug === s))
    .filter(Boolean) ?? [];

  // Get latest value from the rows
  const latestRow = rate.rows[rate.rows.length - 1];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Коли потрібен показник «${rate.name}»?`,
        acceptedAnswer: { "@type": "Answer", text: rate.whenNeeded },
      },
      ...(rate.legalBasis
        ? [{
            "@type": "Question",
            name: `Яка правова основа для «${rate.name}»?`,
            acceptedAnswer: { "@type": "Answer", text: rate.legalBasis },
          }]
        : []),
    ],
  };

  return (
    <PortalLayout
      meta={{
        title: `${rate.name} — ставки та показники | FINTODO`,
        description: rate.description,
        canonical: `${SITE_URL}/dovidnyky/stavky/${rate.slug}`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Ставки та показники", url: `${SITE_URL}/dovidnyky/stavky` },
          { name: rate.name, url: `${SITE_URL}/dovidnyky/stavky/${rate.slug}` },
        ])}
      />
      <JsonLd data={faqSchema} />

      <EntryWithSiblingsLayout
        items={[...RATE_TABLES]
          .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
          .map((r) => ({
            slug: r.slug,
            label: r.name,
            group: RATE_CATEGORIES.find((c) => c.id === r.category)?.label ?? r.category,
          }))}
        currentSlug={rate.slug}
        basePath="/dovidnyky/stavky"
        title="Ставки і показники"
        backHref="/dovidnyky/stavky"
      >
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Ставки", to: "/dovidnyky/stavky" },
            { label: rate.name },
          ]}
        />

        <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16 pt-2">
          {/* Header */}
          <header className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {rate.name}
                </h1>
                {category && (
                  <Badge variant="secondary" className="text-xs mt-2">
                    {category.emoji} {category.label}
                  </Badge>
                )}
              </div>
            </div>
          </header>

          {/* TldrBox */}
          <TldrBox text={rate.description} />

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Актуальне значення</p>
              <p className="text-sm font-semibold text-primary">{latestRow?.value ?? "—"}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Категорія</p>
              <p className="text-sm font-semibold text-foreground">{category ? category.label : "—"}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Записів</p>
              <p className="text-sm font-semibold text-foreground">{rate.rows.length}</p>
            </Card>
          </div>

          {/* Description */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">📋 Опис показника</h2>
            <Card className="p-4 sm:p-5">
              {rate.fullDescription.split('\n\n').map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed mt-2 first:mt-0">{p}</p>
              ))}
            </Card>
          </section>

          {/* When needed */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Коли потрібен цей показник</h2>
            </div>
            <Card className="p-4 sm:p-5">
              <p className="text-sm text-muted-foreground">{rate.whenNeeded}</p>
            </Card>
          </section>

          {/* Values table */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">📊 Значення по роках</h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Рік</TableHead>
                      {rate.rows.some(r => r.period) && <TableHead className="text-xs">Період / Тип</TableHead>}
                      <TableHead className="text-xs">Значення</TableHead>
                      <TableHead className="text-xs">Примітка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rate.rows.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-medium">{row.year}</TableCell>
                        {rate.rows.some(r => r.period) && <TableCell className="text-xs">{row.period || "—"}</TableCell>}
                        <TableCell className="text-xs font-semibold text-primary">{row.value}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.note || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
                {rate.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Legal basis */}
          {rate.legalBasis && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Правова основа</h2>
              </div>
              <Card className="p-4 sm:p-5">
                <p className="text-sm text-muted-foreground">{rate.legalBasis}</p>
              </Card>
            </section>
          )}

          {/* Warnings */}
          {rate.warnings && rate.warnings.length > 0 && (
            <WarningBlock items={rate.warnings} />
          )}

          {/* Practical Example */}
          {rate.practicalExample && (
            <PracticalExampleBlock text={rate.practicalExample} />
          )}

          {/* Consequences */}
          {rate.consequences && (
            <ConsequencesBlock text={rate.consequences} />
          )}

          {/* FAQ */}
          {rate.faq && rate.faq.length > 0 && (
            <FaqSection items={rate.faq} />
          )}

          {/* FINTODO CTA */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">FINTODO допомагає</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-консультант розрахує податки з актуальними ставками та пояснить, як застосувати цей показник у вашій ситуації.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={CTA_CHECKOUT_URL}>
                <Button size="sm">Почати безкоштовно <ArrowRight className="ml-2 h-3 w-3" /></Button>
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/consultant?ctx=rate&id=${rate.slug}`}>
                  🤖 Запитати AI про показник
                </Link>
              </Button>
            </div>
          </section>

          {/* Related rates */}
          {related.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Пов'язані показники</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {related.map((r) => r && (
                  <Link key={r.id} to={`/dovidnyky/stavky/${r.slug}`}>
                    <Card className="p-4 hover:border-primary/40 transition-colors h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BarChart3 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm leading-tight">{r.name}</h3>
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
            to="/dovidnyky/stavky"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← Всі показники
          </Link>
        </div>
      </EntryWithSiblingsLayout>
          <RelatedPartnersBlock directoryId="stavky" />
    </PortalLayout>
  );
};

export default RateEntryPage;
