import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import {
  ExternalLink,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
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
  ATSK_PROVIDERS,
  ATSK_CATEGORY_LABEL,
  KEP_MEDIUM_LABEL,
  getAtskBySlug,
} from "@/portal/data/atskProviders";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const COMPATIBILITY_LABEL: Record<string, string> = {
  diia: "Дія",
  kabinetDps: "Електронний кабінет ДПС",
  medoc: "M.E.Doc / Soneta",
  privat24: "Приват24",
  sodit: "Електронний суд",
  bankId: "BankID НБУ",
};

const AtskEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const a = slug ? getAtskBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!a) {
    return (
      <PortalLayout meta={{ title: "АЦСК не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-semibold mb-2">Надавача КЕП не знайдено</h1>
          <Link to="/dovidnyky/atsk-kep" className="text-primary font-medium hover:underline">
            ← До переліку АЦСК
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/atsk-kep/${a.slug}`;

  return (
    <PortalLayout
      meta={{
        title: a.seoTitle ?? `${a.shortName} — як отримати КЕП, тарифи, сумісність | FINTODO`,
        description: a.seoDescription ?? a.summary,
        canonical,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "АЦСК та КЕП", url: `${SITE_URL}/dovidnyky/atsk-kep` },
          { name: a.shortName, url: canonical },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: a.fullName,
          alternateName: a.shortName,
          url: a.website,
          identifier: a.edrpou,
          description: a.summary,
          telephone: a.supportPhone,
          email: a.supportEmail,
          address: a.officeAddress,
        }}
      />
      {a.faq && a.faq.length > 0 && (
        <JsonLd data={getFaqSchema(a.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={ATSK_PROVIDERS.map((x) => ({
            slug: x.slug,
            label: x.shortName,
            group: ATSK_CATEGORY_LABEL[x.category],
            meta: x.fullName,
          }))}
          currentSlug={a.slug}
          basePath="/dovidnyky/atsk-kep"
          backHref="/dovidnyky/atsk-kep"
          title="АЦСК та КЕП"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav
            items={[
              { label: "Головна", to: "/" },
              { label: "Довідники", to: "/dovidnyky" },
              { label: "АЦСК та КЕП", to: "/dovidnyky/atsk-kep" },
              { label: a.shortName },
            ]}
          />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">{ATSK_CATEGORY_LABEL[a.category]}</Badge>
                {a.edrpou && <Badge variant="secondary" className="font-mono">ЄДРПОУ {a.edrpou}</Badge>}
                {a.mediums.map((m) => (
                  <Badge key={m} variant="outline" className="text-[10px]">{KEP_MEDIUM_LABEL[m]}</Badge>
                ))}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-start gap-2">
                <KeyRound className="h-6 w-6 text-primary shrink-0 mt-1" />
                <span>{a.fullName}</span>
              </h1>
            </div>

            <TldrBox text={a.summary} />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Що це за надавач</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>
            </section>

            {/* Тарифи */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Тарифи</h2>
              <div className="space-y-2">
                {a.fees.map((f, i) => (
                  <Card key={i} className="p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{f.service}</div>
                      {f.validity && (
                        <div className="text-xs text-muted-foreground">Дія: {f.validity}</div>
                      )}
                    </div>
                    <Badge
                      variant={f.price.toLowerCase().includes("безкошт") ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {f.price}
                    </Badge>
                  </Card>
                ))}
              </div>
            </section>

            {/* Як отримати */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Як отримати — покроково</h2>
              <ol className="space-y-2 list-decimal pl-5">
                {a.howToGet.map((step, i) => (
                  <li key={i} className="text-sm text-foreground leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            {/* Документи */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Необхідні документи</h2>
              <ul className="space-y-1 list-disc pl-5">
                {a.requiredDocs.map((doc, i) => (
                  <li key={i} className="text-sm text-foreground">{doc}</li>
                ))}
              </ul>
            </section>

            {/* Сумісність */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Сумісність із сервісами
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(a.compatibility) as [keyof typeof a.compatibility, boolean][]).map(
                  ([key, ok]) => (
                    <Card key={key} className="p-2.5 flex items-center gap-2">
                      {ok ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-xs ${ok ? "text-foreground" : "text-muted-foreground line-through"}`}>
                        {COMPATIBILITY_LABEL[key]}
                      </span>
                    </Card>
                  ),
                )}
              </div>
            </section>

            {/* Pros / Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="p-3 border-l-4 border-l-primary">
                <h3 className="text-sm font-bold text-foreground mb-2">Переваги</h3>
                <ul className="space-y-1 text-sm text-foreground list-disc pl-4">
                  {a.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </Card>
              <Card className="p-3 border-l-4 border-l-muted-foreground">
                <h3 className="text-sm font-bold text-foreground mb-2">Обмеження</h3>
                <ul className="space-y-1 text-sm text-foreground list-disc pl-4">
                  {a.cons.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </Card>
            </div>

            {/* Контакти */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Контакти</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {a.supportPhone && (
                  <Card className="p-3 flex items-start gap-2">
                    <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Підтримка</div>
                      <div className="text-sm font-mono font-semibold">{a.supportPhone}</div>
                    </div>
                  </Card>
                )}
                {a.supportEmail && (
                  <Card className="p-3 flex items-start gap-2">
                    <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="text-sm font-mono">{a.supportEmail}</div>
                    </div>
                  </Card>
                )}
                {a.officeAddress && (
                  <Card className="p-3 flex items-start gap-2 sm:col-span-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Адреса</div>
                      <div className="text-sm">{a.officeAddress}</div>
                    </div>
                  </Card>
                )}
              </div>
              <div className="flex gap-2 flex-wrap pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={a.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Офіційний сайт
                  </a>
                </Button>
                {a.czoRegistryUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={a.czoRegistryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Реєстр ЦЗО
                    </a>
                  </Button>
                )}
              </div>
            </section>

            {a.faq && a.faq.length > 0 && <FaqSection items={a.faq} />}

            <RelatedEntriesPanel category="atsk-kep" slug={a.slug} />

            <div className="flex gap-2 flex-wrap">
              {a.tags.map((t) => (
                <Badge key={t} variant="secondary" className="py-1 px-3">{t}</Badge>
              ))}
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">FINTODO підписує документи за вас</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                У кабінеті FINTODO інтеграція з усіма провайдерами КЕП — від Дія.Підпис до корпоративних
                токенів. Налаштуйте автопідпис рутинних звітів і забудьте про ручне підписання кожного
                документа.
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
          <RelatedPartnersBlock directoryId="atsk-kep" />
    </PortalLayout>
  );
};

export default AtskEntryPage;
