import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { ExternalLink, ArrowRight, Sparkles, Phone, Globe, Mail, MapPin, MessageCircle, AlertTriangle, Lightbulb, Building2 } from "lucide-react";
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
  AGENCIES,
  AGENCY_CATEGORY_LABEL,
  getAgencyBySlug,
  type AgencyContact,
} from "@/portal/data/agencies";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const CONTACT_ICON: Record<AgencyContact["type"], typeof Phone> = {
  hotline: Phone,
  chatbot: MessageCircle,
  email: Mail,
  cabinet: Globe,
  address: MapPin,
  social: Globe,
};

const AgencyEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const a = slug ? getAgencyBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!a) {
    return (
      <PortalLayout meta={{ title: "Орган не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🏛️</div>
          <h1 className="text-2xl font-semibold mb-2">Держорган не знайдено</h1>
          <Link to="/dovidnyky/derzhorgany" className="text-primary font-medium hover:underline">
            ← До переліку держорганів
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/derzhorgany/${a.slug}`;

  return (
    <PortalLayout
      meta={{
        title: a.seoTitle ?? `${a.shortName} (${a.fullName}) — контакти, послуги, кабінет | FINTODO`,
        description: a.seoDescription ?? a.summary,
        canonical,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Держоргани", url: `${SITE_URL}/dovidnyky/derzhorgany` },
          { name: a.shortName, url: canonical },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "GovernmentOrganization",
          name: a.fullName,
          alternateName: a.shortName,
          url: a.website,
          identifier: a.edrpou,
          description: a.summary,
          sameAs: a.website,
        }}
      />
      {a.faq && a.faq.length > 0 && (
        <JsonLd data={getFaqSchema(a.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={AGENCIES.map((x) => ({
            slug: x.slug,
            label: x.shortName,
            group: AGENCY_CATEGORY_LABEL[x.category],
            meta: x.fullName,
          }))}
          currentSlug={a.slug}
          basePath="/dovidnyky/derzhorgany"
          backHref="/dovidnyky/derzhorgany"
          title="Держоргани"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav
            items={[
              { label: "Головна", to: "/" },
              { label: "Довідники", to: "/dovidnyky" },
              { label: "Держоргани", to: "/dovidnyky/derzhorgany" },
              { label: a.shortName },
            ]}
          />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{AGENCY_CATEGORY_LABEL[a.category]}</Badge>
                {a.edrpou && <Badge variant="secondary" className="font-mono">ЄДРПОУ {a.edrpou}</Badge>}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{a.fullName}</h1>
              <p className="text-sm text-muted-foreground">
                Скорочена назва: <span className="font-semibold text-foreground">{a.shortName}</span>
                {a.head && <> · {a.head}</>}
              </p>
            </div>

            <TldrBox text={a.summary} />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Місія</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.mission}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Що регулює</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.jurisdiction}</p>
            </section>

            {/* Contacts */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Контакти і кабінети
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {a.contacts.map((c, i) => {
                  const Icon = CONTACT_ICON[c.type];
                  const content = (
                    <Card className="p-3 hover:border-primary/40 transition-colors h-full">
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-muted-foreground">{c.label}</div>
                          <div className="text-sm font-semibold text-foreground break-words font-mono">
                            {c.value}
                          </div>
                          {c.schedule && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">{c.schedule}</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                  return c.url ? (
                    <a key={i} href={c.url} target="_blank" rel="noopener noreferrer">
                      {content}
                    </a>
                  ) : (
                    <div key={i}>{content}</div>
                  );
                })}
              </div>
              <div className="pt-2">
                <Button variant="outline" asChild size="sm">
                  <a href={a.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Офіційний сайт: {a.website.replace(/^https?:\/\//, "")}
                  </a>
                </Button>
              </div>
            </section>

            {/* Services */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Ключові послуги</h2>
              <div className="space-y-2">
                {a.services.map((s, i) => (
                  <Card key={i} className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground">{s.name}</h3>
                      {s.cost && (
                        <Badge variant={s.cost.toLowerCase().includes("безкошт") ? "default" : "secondary"} size="sm">
                          {s.cost}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{s.description}</p>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                      {s.timeline && (
                        <span>
                          ⏱️ <span className="font-medium text-foreground">{s.timeline}</span>
                        </span>
                      )}
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Перейти <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {a.tips && a.tips.length > 0 && (
              <Card className="p-4 border-l-4 border-l-primary bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Лайфхаки взаємодії</h2>
                </div>
                <ul className="text-sm text-foreground space-y-1.5 list-disc pl-5">
                  {a.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </Card>
            )}

            {a.warnings && a.warnings.length > 0 && (
              <Card className="p-4 border-l-4 border-l-destructive bg-destructive/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h2 className="text-base font-bold text-foreground">Червоні прапори</h2>
                </div>
                <ul className="text-sm text-foreground space-y-1.5 list-disc pl-5">
                  {a.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </Card>
            )}

            {a.faq && a.faq.length > 0 && <FaqSection items={a.faq} />}

            <RelatedEntriesPanel category="derzhorgany" slug={a.slug} />

            <div className="flex gap-2 flex-wrap">
              {a.tags.map((t) => (
                <Badge key={t} variant="secondary" className="py-1 px-3">
                  {t}
                </Badge>
              ))}
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">FINTODO інтегрує цей орган у ваш робочий день</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Кабінети FINTODO автоматично готують звітність, нагадують про дедлайни і пропонують найшвидший
                сценарій взаємодії з цим органом.
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
          <RelatedPartnersBlock directoryId="derzhorgany" />
    </PortalLayout>
  );
};

export default AgencyEntryPage;
