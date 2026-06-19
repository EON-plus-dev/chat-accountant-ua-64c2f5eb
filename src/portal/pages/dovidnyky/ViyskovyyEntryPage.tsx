import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import {
  ExternalLink,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  FileText,
  User,
  AlertTriangle,
  CheckCircle2,
  Link as LinkIcon,
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
  VIYSKOVYY_OBLIK,
  VIYSKOVYY_TOPIC_LABEL,
  getViyskovyyEntryBySlug,
} from "@/portal/data/viyskovyyOblik";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const ViyskovyyEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const e = slug ? getViyskovyyEntryBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!e) {
    return (
      <PortalLayout meta={{ title: "Матеріал не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🛡️</div>
          <h1 className="text-2xl font-semibold mb-2">Матеріал не знайдено</h1>
          <Link to="/dovidnyky/viyskovyy-oblik" className="text-primary font-medium hover:underline">
            ← До військового обліку
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/viyskovyy-oblik/${e.slug}`;

  return (
    <PortalLayout
      meta={{
        title: e.seoTitle ?? `${e.title} | FINTODO`,
        description: e.seoDescription ?? e.summary.slice(0, 160),
        canonical,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Військовий облік", url: `${SITE_URL}/dovidnyky/viyskovyy-oblik` },
          { name: e.title, url: canonical },
        ])}
      />
      {e.faq && e.faq.length > 0 && (
        <JsonLd data={getFaqSchema(e.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={VIYSKOVYY_OBLIK.map((x) => ({
            slug: x.slug,
            label: x.title,
            group: VIYSKOVYY_TOPIC_LABEL[x.topic],
          }))}
          currentSlug={e.slug}
          basePath="/dovidnyky/viyskovyy-oblik"
          backHref="/dovidnyky/viyskovyy-oblik"
          title="Військовий облік"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav
            items={[
              { label: "Головна", to: "/" },
              { label: "Довідники", to: "/dovidnyky" },
              { label: "Військовий облік", to: "/dovidnyky/viyskovyy-oblik" },
              { label: e.title },
            ]}
          />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">{VIYSKOVYY_TOPIC_LABEL[e.topic]}</Badge>
                {e.audience === "business" && <Badge variant="secondary">Для роботодавця</Badge>}
                {e.audience === "personal" && <Badge variant="secondary">Для фізособи</Badge>}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-start gap-2">
                <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
                <span>{e.title}</span>
              </h1>
            </div>

            <TldrBox text={e.summary} />

            {e.steps && e.steps.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Покрокова інструкція
                </h2>
                <Card className="p-4">
                  <ol className="space-y-2 list-decimal pl-5 text-sm text-foreground">
                    {e.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </Card>
              </section>
            )}

            {e.deadlines && e.deadlines.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Строки виконання
                </h2>
                <Card className="divide-y divide-border">
                  {e.deadlines.map((d, i) => (
                    <div key={i} className="p-3 flex items-start justify-between gap-3">
                      <span className="text-sm text-foreground">{d.what}</span>
                      <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
                        {d.when}
                      </Badge>
                    </div>
                  ))}
                </Card>
              </section>
            )}

            {e.documents && e.documents.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Документи
                </h2>
                <Card className="p-4">
                  <ul className="space-y-1 list-disc pl-5 text-sm text-foreground">
                    {e.documents.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </Card>
              </section>
            )}

            {e.responsible && (
              <Card className="p-4 flex items-start gap-2">
                <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Хто відповідає</div>
                  <p className="text-sm text-foreground">{e.responsible}</p>
                </div>
              </Card>
            )}

            {e.penalties && e.penalties.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Штрафи за порушення
                </h2>
                <Card className="divide-y divide-border border-l-4 border-l-destructive">
                  {e.penalties.map((p, i) => (
                    <div key={i} className="p-3 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">{p.violation}</span>
                        <Badge variant="destructive" className="shrink-0 text-[11px] font-mono">
                          {p.amount}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{p.basis}</p>
                    </div>
                  ))}
                </Card>
              </section>
            )}

            {e.links && e.links.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  Корисні посилання
                </h2>
                <Card className="divide-y divide-border">
                  {e.links.map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 flex items-center gap-2 hover:bg-muted/40 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground flex-1">{l.label}</span>
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
            <RelatedEntriesPanel category="viyskovyy-oblik" slug={e.slug} />

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
                <h2 className="text-base font-bold text-foreground">FINTODO веде військовий облік за вас</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Кабінет FINTODO нагадає про строки звірки з ТЦК, сформує список персонального військового обліку, відстежить статуси бронювання й оновлення в Резерв+.
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
          <RelatedPartnersBlock directoryId="viyskovyy-oblik" />
    </PortalLayout>
  );
};

export default ViyskovyyEntryPage;
