import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import {
  ExternalLink,
  ArrowRight,
  Sparkles,
  Percent,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Copy,
} from "lucide-react";
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
  PDV_PILHY,
  PDV_PILHA_TYPE_LABEL,
  PDV_SECTOR_LABEL,
  getPdvPilhaBySlug,
} from "@/portal/data/pdvPilhy";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { toast } from "sonner";

const PdvPilhaEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const e = slug ? getPdvPilhaBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!e) {
    return (
      <PortalLayout meta={{ title: "Пільгу не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🧾</div>
          <h1 className="text-2xl font-semibold mb-2">Пільгу не знайдено</h1>
          <Link to="/dovidnyky/pdv-pilhy" className="text-primary font-medium hover:underline">
            ← До пільг з ПДВ
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/pdv-pilhy/${e.slug}`;
  const copyCode = () => {
    if (!e.benefitCode) return;
    navigator.clipboard.writeText(e.benefitCode);
    toast.success("Код пільги скопійовано");
  };

  return (
    <PortalLayout
      meta={{
        title: e.seoTitle ?? `${e.title} — ${e.articleRef} | FINTODO`,
        description:
          e.seoDescription ??
          `${PDV_PILHA_TYPE_LABEL[e.type]}: ${e.summary.slice(0, 130)}`,
        canonical,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Пільги з ПДВ", url: `${SITE_URL}/dovidnyky/pdv-pilhy` },
          { name: e.title, url: canonical },
        ])}
      />
      {e.faq && e.faq.length > 0 && (
        <JsonLd data={getFaqSchema(e.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={PDV_PILHY.map((x) => ({
            slug: x.slug,
            label: x.title,
            group: PDV_SECTOR_LABEL[x.sector],
            meta: x.articleRef,
          }))}
          currentSlug={e.slug}
          basePath="/dovidnyky/pdv-pilhy"
          backHref="/dovidnyky/pdv-pilhy"
          title="Пільги з ПДВ"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav
            items={[
              { label: "Головна", to: "/" },
              { label: "Довідники", to: "/dovidnyky" },
              { label: "Пільги з ПДВ", to: "/dovidnyky/pdv-pilhy" },
              { label: e.title },
            ]}
          />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">{PDV_PILHA_TYPE_LABEL[e.type]}</Badge>
                <Badge variant="secondary">{PDV_SECTOR_LABEL[e.sector]}</Badge>
                <Badge variant="outline" className="font-mono">{e.articleRef}</Badge>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-start gap-2">
                <Percent className="h-6 w-6 text-primary shrink-0 mt-1" />
                <span>{e.title}</span>
              </h1>
            </div>

            {e.benefitCode && (
              <Card className="p-4 flex items-center justify-between gap-3 border-primary/30">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Код пільги (додаток 5 декларації)</div>
                  <div className="font-mono text-xl font-semibold">{e.benefitCode}</div>
                </div>
                <Button size="sm" variant="outline" onClick={copyCode}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Копіювати
                </Button>
              </Card>
            )}

            <TldrBox text={e.summary} />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Що звільняється
              </h2>
              <Card className="p-4">
                <p className="text-sm text-foreground whitespace-pre-line">{e.scope}</p>
              </Card>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {e.conditions && e.conditions.length > 0 && (
                <Card className="p-4 border-l-4 border-l-green-500">
                  <div className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Умови застосування
                  </div>
                  <ul className="space-y-1 list-disc pl-5 text-sm text-foreground">
                    {e.conditions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </Card>
              )}
              {e.exclusions && e.exclusions.length > 0 && (
                <Card className="p-4 border-l-4 border-l-destructive">
                  <div className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> НЕ підпадає під пільгу
                  </div>
                  <ul className="space-y-1 list-disc pl-5 text-sm text-foreground">
                    {e.exclusions.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            <Card
              className={`p-4 border-l-4 ${
                e.hasInputCredit ? "border-l-green-500 bg-green-500/5" : "border-l-amber-500 bg-amber-500/5"
              }`}
            >
              <div className="flex items-start gap-2">
                {e.hasInputCredit ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">
                    {e.hasInputCredit
                      ? "Право на податковий кредит зберігається"
                      : "Право на податковий кредит ВТРАЧАЄТЬСЯ"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {e.hasInputCredit
                      ? "Вхідний ПДВ за товарами і послугами для цієї операції можна включити до ПК (ст. 198 ПКУ)."
                      : "Вхідний ПДВ за товарами і послугами, що використані для пільгової операції, не включається до ПК — або підлягає компенсуючому нарахуванню ПЗ (п. 198.5 ПКУ)."}
                  </p>
                </div>
              </div>
            </Card>

            {e.secondaryActs && e.secondaryActs.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Підзаконні акти</h2>
                <Card className="divide-y divide-border">
                  {e.secondaryActs.map((a, i) => (
                    <a
                      key={i}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 flex items-center gap-2 hover:bg-muted/40 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground flex-1">{a.name}</span>
                    </a>
                  ))}
                </Card>
              </section>
            )}

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Нормативна основа</h2>
              <Card className="p-3 flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{e.legalBasis}</div>
                  <a
                    href={e.legalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all"
                  >
                    {e.legalUrl.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </Card>
            </section>

            {e.faq && e.faq.length > 0 && <FaqSection items={e.faq} />}
            <RelatedEntriesPanel category="pdv-pilhy" slug={e.slug} />

            <div className="flex gap-2 flex-wrap">
              {e.tags.map((t) => (
                <Badge key={t} variant="secondary" className="py-1 px-3">
                  {t}
                </Badge>
              ))}
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">FINTODO підставляє код пільги автоматично</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Кабінет FINTODO визначає тип операції, ставку ПДВ, право на ПК і автоматично заповнює додаток 5 декларації з ПДВ — без пошуку коду пільги вручну.
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
          <RelatedPartnersBlock directoryId="pdv-pilhy" />
    </PortalLayout>
  );
};

export default PdvPilhaEntryPage;
