import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { ExternalLink, ArrowRight, Sparkles, BookOpen, Copy } from "lucide-react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { TldrBox } from "@/portal/components/TldrBox";
import { FaqSection } from "@/portal/components/FaqSection";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getFaqSchema, SITE_URL } from "@/portal/seo/structuredData";
import { PLAN_RAKHUNKIV, ACCOUNT_CLASS_LABEL, ACCOUNT_TYPE_LABEL, getPlanRakhunkuBySlug } from "@/portal/data/planRakhunkiv";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { toast } from "sonner";

const PlanRakhunkuEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const e = slug ? getPlanRakhunkuBySlug(slug) : undefined;

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [slug]);

  if (!e) {
    return (
      <PortalLayout meta={{ title: "Рахунок не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">📒</div>
          <h1 className="text-2xl font-semibold mb-2">Рахунок не знайдено</h1>
          <Link to="/dovidnyky/plan-rakhunkiv" className="text-primary font-medium hover:underline">← До Плану рахунків</Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/plan-rakhunkiv/${e.slug}`;
  const copyCode = () => { navigator.clipboard.writeText(e.code); toast.success("Код скопійовано"); };

  return (
    <PortalLayout
      meta={{
        title: e.seoTitle ?? `Рахунок ${e.code} «${e.name}» — План рахунків | FINTODO`,
        description: e.seoDescription ?? `${ACCOUNT_TYPE_LABEL[e.type]} рахунок ${e.code} «${e.name}». ${e.description.slice(0, 120)}`,
        canonical,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "План рахунків", url: `${SITE_URL}/dovidnyky/plan-rakhunkiv` },
        { name: `${e.code} ${e.name}`, url: canonical },
      ])} />
      {e.faq && e.faq.length > 0 && <JsonLd data={getFaqSchema(e.faq.map((f) => ({ question: f.q, answer: f.a })))} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={PLAN_RAKHUNKIV.map((x) => ({
            slug: x.slug,
            label: `${x.code} ${x.name}`,
            group: `Клас ${x.class}. ${ACCOUNT_CLASS_LABEL[x.class]}`,
          }))}
          currentSlug={e.slug}
          basePath="/dovidnyky/plan-rakhunkiv"
          backHref="/dovidnyky/plan-rakhunkiv"
          title="Рахунки"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "План рахунків", to: "/dovidnyky/plan-rakhunkiv" },
            { label: `${e.code} ${e.name}` },
          ]} />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">Клас {e.class}. {ACCOUNT_CLASS_LABEL[e.class]}</Badge>
                <Badge variant="secondary">{ACCOUNT_TYPE_LABEL[e.type]}</Badge>
                {e.inSimplifiedPlan && <Badge variant="outline">Спрощений план</Badge>}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-start gap-2">
                <BookOpen className="h-6 w-6 text-primary shrink-0 mt-1" />
                <span><span className="font-mono text-primary">{e.code}</span> — {e.name}</span>
              </h1>
            </div>

            <Card className="p-4 flex items-center justify-between gap-3 border-primary/30">
              <div><div className="text-xs text-muted-foreground mb-1">Код рахунку</div><div className="font-mono text-xl font-semibold">{e.code}</div></div>
              <Button size="sm" variant="outline" onClick={copyCode}><Copy className="h-3.5 w-3.5 mr-1.5" />Копіювати</Button>
            </Card>

            <TldrBox text={e.description} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="p-4 border-l-4 border-l-green-500">
                <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Дебет (Дт)</div>
                <p className="text-sm text-foreground">{e.debit}</p>
              </Card>
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Кредит (Кт)</div>
                <p className="text-sm text-foreground">{e.credit}</p>
              </Card>
            </div>

            {e.subaccounts && e.subaccounts.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Субрахунки</h2>
                <Card className="divide-y divide-border">
                  {e.subaccounts.map((s) => (
                    <div key={s.code} className="p-3 flex items-baseline gap-3">
                      <span className="font-mono text-sm font-semibold text-primary shrink-0">{s.code}</span>
                      <span className="text-sm text-foreground">{s.name}</span>
                    </div>
                  ))}
                </Card>
              </section>
            )}

            {e.typicalEntries && e.typicalEntries.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Типові проводки</h2>
                <Card className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs text-muted-foreground">
                      <tr><th className="text-left p-3">Господарська операція</th><th className="text-center p-3 w-20">Дт</th><th className="text-center p-3 w-20">Кт</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {e.typicalEntries.map((t, i) => (
                        <tr key={i}>
                          <td className="p-3 text-foreground">{t.description}</td>
                          <td className="p-3 text-center font-mono font-semibold text-green-700 dark:text-green-400">{t.dt}</td>
                          <td className="p-3 text-center font-mono font-semibold text-blue-700 dark:text-blue-400">{t.kt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </section>
            )}

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Джерело</h2>
              <Card className="p-3 flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">План рахунків бухобліку — наказ Мінфіну № 291 від 30.11.1999</div>
                  <a href="https://zakon.rada.gov.ua/laws/show/z0892-99" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all">zakon.rada.gov.ua/laws/show/z0892-99</a>
                </div>
              </Card>
            </section>

            {e.faq && e.faq.length > 0 && <FaqSection items={e.faq} />}
            <RelatedEntriesPanel category="plan-rakhunkiv" slug={e.slug} />

            <div className="flex gap-2 flex-wrap">
              {e.tags.map((t) => <Badge key={t} variant="secondary" className="py-1 px-3">{t}</Badge>)}
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="text-base font-bold text-foreground">FINTODO формує проводки автоматично</h2></div>
              <p className="text-sm text-muted-foreground">Кабінет FINTODO формує господарські операції з готовими проводками за обраним рахунком, із субрахунками, ПДВ і ЄСВ. Жодних довідників під рукою — все підставляється.</p>
              <Link to={CTA_CHECKOUT_URL}><Button size="sm">Спробувати безкоштовно <ArrowRight className="ml-2 h-3 w-3" /></Button></Link>
            </section>
          </div>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="plan-rakhunkiv" />
    </PortalLayout>
  );
};

export default PlanRakhunkuEntryPage;
