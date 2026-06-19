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
import { BUSINESS_FORMS, type FopGroup } from "@/portal/data/businessForms";
import { EntryWithSiblingsLayout } from "@/portal/components/EntryWithSiblingsLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import {
  CheckCircle2, XCircle, ThumbsUp, ThumbsDown,
  Clock, Scale, Sparkles, ArrowRight, Link as LinkIcon,
  Shield, Landmark, Timer, BookOpen,
} from "lucide-react";

const COMPLEXITY_LABEL: Record<string, string> = {
  low: "Низька",
  medium: "Середня",
  high: "Висока",
};

const BusinessFormEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const form = BUSINESS_FORMS.find((f) => f.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!form)
    return (
      <PortalLayout meta={{ title: "Форму не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🏢</div>
          <h1 className="text-2xl font-semibold mb-2">Форму бізнесу не знайдено</h1>
          <Link to="/dovidnyky/formy-biznesu" className="text-primary font-medium hover:underline">
            ← До каталогу форм бізнесу
          </Link>
        </div>
      </PortalLayout>
    );

  const related = form.relatedForms
    ?.map((s) => BUSINESS_FORMS.find((f) => f.slug === s))
    .filter(Boolean) ?? [];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Що таке ${form.name} (${form.fullName})?`,
        acceptedAnswer: { "@type": "Answer", text: form.description },
      },
      {
        "@type": "Question",
        name: `Коли обирати ${form.name}?`,
        acceptedAnswer: { "@type": "Answer", text: form.whenBest },
      },
    ],
  };

  return (
    <PortalLayout
      meta={{
        title: `${form.name} (${form.fullName}) — реєстрація, податки, переваги | FINTODO`,
        description: form.description,
        canonical: `${SITE_URL}/dovidnyky/formy-biznesu/${form.slug}`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Форми бізнесу", url: `${SITE_URL}/dovidnyky/formy-biznesu` },
          { name: form.name, url: `${SITE_URL}/dovidnyky/formy-biznesu/${form.slug}` },
        ])}
      />
      <JsonLd data={faqSchema} />

      <EntryWithSiblingsLayout
        items={[...BUSINESS_FORMS]
          .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
          .map((f) => ({ slug: f.slug, label: f.name, meta: f.fullName }))}
        currentSlug={form.slug}
        basePath="/dovidnyky/formy-biznesu"
        title="Форми бізнесу"
        backHref="/dovidnyky/formy-biznesu"
      >
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Форми бізнесу", to: "/dovidnyky/formy-biznesu" },
            { label: form.name },
          ]}
        />

        <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16 pt-2">
          {/* Header */}
          <header className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xl sm:text-2xl">
                {form.emoji}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {form.name}
                </h1>
                <p className="text-muted-foreground mt-1">{form.fullName}</p>
              </div>
            </div>
          </header>

          {/* TldrBox */}
          <TldrBox text={form.description} />

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3 text-center space-y-1">
              <Shield className="w-4 h-4 text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Відповідальність</p>
              <p className="text-xs font-semibold text-foreground leading-tight">{form.liability.split('—')[0].trim()}</p>
            </Card>
            <Card className="p-3 text-center space-y-1">
              <Landmark className="w-4 h-4 text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Мін. капітал</p>
              <p className="text-xs font-semibold text-foreground">{form.minCapital}</p>
            </Card>
            <Card className="p-3 text-center space-y-1">
              <Timer className="w-4 h-4 text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Час реєстрації</p>
              <p className="text-xs font-semibold text-foreground">{form.registrationTime}</p>
            </Card>
            <Card className="p-3 text-center space-y-1">
              <BookOpen className="w-4 h-4 text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Складність обліку</p>
              <p className="text-xs font-semibold text-foreground">{COMPLEXITY_LABEL[form.accountingComplexity]}</p>
            </Card>
          </div>

          {/* Description */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">📋 Детальний опис</h2>
            <Card className="p-4 sm:p-5">
              {form.fullDescription.split('\n\n').map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed mt-2 first:mt-0">{p}</p>
              ))}
            </Card>
          </section>

          {/* Pros / Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 sm:p-5 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Переваги</h2>
              </div>
              <ul className="space-y-2">
                {form.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4 sm:p-5 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-destructive/70" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Недоліки</h2>
              </div>
              <ul className="space-y-2">
                {form.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive/60 shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* When best */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Коли обирати {form.name}</h2>
            </div>
            <Card className="p-4 sm:p-5">
              <p className="text-sm text-muted-foreground">{form.whenBest}</p>
            </Card>
          </section>

          {/* Best for */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">👥 Найкраще підходить для</h2>
            <div className="flex flex-wrap gap-2">
              {form.bestFor.map((b) => (
                <Badge key={b} variant="secondary" className="py-1.5 px-3">{b}</Badge>
              ))}
            </div>
          </section>

          {/* Tax details */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">💰 Оподаткування</h2>
            <Card className="p-4 sm:p-5 space-y-2 sm:space-y-3">
              <p className="text-sm text-muted-foreground">{form.taxDetails}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {form.taxOptions.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            </Card>
          </section>

          {/* FOP Groups Comparison */}
          {form.fopGroups && form.fopGroups.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">📊 Групи єдиного податку ФОП</h2>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-semibold text-foreground">Параметр</th>
                      {form.fopGroups.map((g) => (
                        <th key={g.group} className="text-left p-3 font-semibold text-foreground">Група {g.group}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { label: 'Ліміт доходу', key: 'maxRevenue' as const },
                      { label: 'Ставка ЄП', key: 'taxRate' as const },
                      { label: 'Працівники', key: 'maxEmployees' as const },
                      { label: 'Діяльність', key: 'allowedActivities' as const },
                    ].map((row) => (
                      <tr key={row.key} className="even:bg-muted/20">
                        <td className="p-3 font-medium text-foreground text-xs">{row.label}</td>
                        {form.fopGroups!.map((g) => (
                          <td key={g.group} className="p-3 text-xs text-muted-foreground">{g[row.key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {form.fopGroups.map((g) => (
                  <Card key={g.group} className="p-4 space-y-2">
                    <h3 className="font-semibold text-foreground">Група {g.group}</h3>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Ліміт доходу</span><span className="font-medium text-foreground text-right">{g.maxRevenue}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Ставка ЄП</span><span className="font-medium text-foreground text-right max-w-[55%]">{g.taxRate}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Працівники</span><span className="font-medium text-foreground">{g.maxEmployees}</span></div>
                      <p className="text-muted-foreground pt-1">{g.allowedActivities}</p>
                    </div>
                    {g.restrictions.length > 0 && (
                      <ul className="space-y-1 pt-1">
                        {g.restrictions.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <XCircle className="w-3 h-3 text-destructive/60 shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                ))}
              </div>

              {/* Recommendation */}
              <Card className="p-4 sm:p-5 bg-primary/5 border-primary/20 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">💡 Яку групу обрати?</h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li><strong className="text-foreground">Група 1</strong> — дрібна роздрібна торгівля на ринку, перукарня, ремонт одягу</li>
                  <li><strong className="text-foreground">Група 2</strong> — кафе, автосервіс, послуги іншим ФОП та населенню</li>
                  <li><strong className="text-foreground">Група 3</strong> — IT-фрілансер, інтернет-магазин, експорт послуг, будь-який бізнес до 8.3 млн ₴/рік</li>
                </ul>
              </Card>
            </section>
          )}

          {/* Registration steps */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">📝 Кроки реєстрації</h2>
            <Card className="p-4 sm:p-5">
              <ol className="space-y-2">
                {form.registrationSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </section>

          {/* Legal basis */}
          {form.legalBasis && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Правова основа</h2>
              </div>
              <Card className="p-4 sm:p-5">
                <p className="text-sm text-muted-foreground">{form.legalBasis}</p>
              </Card>
            </section>
          )}

          {/* Warnings */}
          {form.warnings && form.warnings.length > 0 && (
            <WarningBlock items={form.warnings} />
          )}

          {/* Practical Example */}
          {form.practicalExample && (
            <PracticalExampleBlock text={form.practicalExample} />
          )}

          {/* Consequences */}
          {form.consequences && (
            <ConsequencesBlock text={form.consequences} />
          )}

          {/* FAQ */}
          {form.faq && form.faq.length > 0 && (
            <FaqSection items={form.faq} />
          )}

          {/* FINTODO CTA */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">FINTODO допомагає</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Tax Wizard підбере оптимальну форму бізнесу та систему оподаткування під ваші потреби. AI-консультант відповість на всі питання.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={CTA_CHECKOUT_URL}>
                <Button size="sm">Почати безкоштовно <ArrowRight className="ml-2 h-3 w-3" /></Button>
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/consultant?ctx=business-form&id=${form.slug}`}>
                  🤖 Запитати AI про {form.name}
                </Link>
              </Button>
            </div>
          </section>

          {/* Related forms */}
          {related.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Пов'язані форми</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {related.map((r) => r && (
                  <Link key={r.id} to={`/dovidnyky/formy-biznesu/${r.slug}`}>
                    <Card className="p-4 hover:border-primary/40 transition-colors h-full">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                          {r.emoji}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm leading-tight">{r.name} — {r.fullName}</h3>
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
            to="/dovidnyky/formy-biznesu"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← Всі форми бізнесу
          </Link>
        </div>
      </EntryWithSiblingsLayout>
          <RelatedPartnersBlock directoryId="formy-biznesu" />
    </PortalLayout>
  );
};

export default BusinessFormEntryPage;
