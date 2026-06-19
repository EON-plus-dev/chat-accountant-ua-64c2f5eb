import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { ExternalLink, ArrowRight, Sparkles, CheckCircle2, ScrollText, Bot, Clock, Banknote, Building2, CalendarCheck } from "lucide-react";
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
import { LICENSES } from "@/portal/data/licenses";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { EntryWithSiblingsLayout } from "@/portal/components/EntryWithSiblingsLayout";

const LicenseEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const license = LICENSES.find((l) => l.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!license)
    return (
      <PortalLayout meta={{ title: "Ліцензію не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">📜</div>
          <h1 className="text-2xl font-semibold mb-2">Ліцензію не знайдено</h1>
          <Link to="/dovidnyky/litsenziyi" className="text-primary font-medium hover:underline">
            ← До каталогу ліцензій
          </Link>
        </div>
      </PortalLayout>
    );

  const faqItems = license.faq || [];

  return (
    <PortalLayout
      meta={{
        title: `${license.name} — ліцензія, вартість, як отримати | FINTODO`,
        description: `${license.cost}. ${license.description}`,
        canonical: `${SITE_URL}/dovidnyky/litsenziyi/${license.slug}`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Ліцензії та дозволи", url: `${SITE_URL}/dovidnyky/litsenziyi` },
        { name: license.name, url: `${SITE_URL}/dovidnyky/litsenziyi/${license.slug}` },
      ])} />
      {faqItems.length > 0 && <JsonLd data={getFaqSchema(faqItems.map(f => ({ question: f.q, answer: f.a })))} />}

      <EntryWithSiblingsLayout
        items={[...LICENSES]
          .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
          .map((l) => ({
            slug: l.slug,
            label: l.name,
            group: l.category,
          }))}
        currentSlug={license.slug}
        basePath="/dovidnyky/litsenziyi"
        title="Ліцензії"
        backHref="/dovidnyky/litsenziyi"
      >
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Ліцензії", to: "/dovidnyky/litsenziyi" },
          { label: license.name },
        ]} />

        <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16 pt-2">
          {/* Header */}
          <header className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{license.category}</Badge>
              <Badge variant="secondary">{license.issuingAuthority}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
              {license.name}
            </h1>
            <p className="text-muted-foreground">{license.description}</p>
          </header>

          {/* TldrBox */}
          <TldrBox text={`Вартість: ${license.cost}. Термін отримання: ${license.processingTime}. Орган видачі: ${license.issuingAuthority}.`} />

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Banknote, label: "Вартість", value: license.cost },
              { icon: Clock, label: "Термін отримання", value: license.processingTime },
              { icon: Building2, label: "Орган видачі", value: license.issuingAuthority },
              { icon: CalendarCheck, label: "Термін дії", value: license.validity },
            ].map((m) => (
              <Card key={m.label} className="p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <m.icon className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase tracking-wider font-medium">{m.label}</span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-tight">{m.value}</p>
              </Card>
            ))}
          </div>

          {license.costDetails && (
            <Card className="p-4 bg-muted/50 border-dashed">
              <p className="text-sm text-muted-foreground">{license.costDetails}</p>
            </Card>
          )}

          {/* Required Documents */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Необхідні документи</h2>
            <Card className="p-4 sm:p-5">
              <ul className="space-y-2">
                {license.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* KVED codes */}
          {license.kvedCodes.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Пов'язані коди КВЕД</h2>
              <div className="flex gap-2 flex-wrap">
                {license.kvedCodes.map((code) => (
                  <Link key={code} to={`/dovidnyky/kved/${code}`}>
                    <Badge variant="outline" className="font-mono hover:bg-primary/10 cursor-pointer">{code}</Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Legal basis */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Правова основа</h2>
            <Card className="p-4 sm:p-5 space-y-2">
              <p className="text-sm text-muted-foreground">{license.legalBasis}</p>
              <a href={license.legalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                Відкрити текст закону <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Card>
          </section>

          {/* Warnings */}
          {license.warnings && license.warnings.length > 0 && (
            <WarningBlock items={license.warnings} title="На що звернути увагу" />
          )}

          {/* Practical Example */}
          {license.practicalExample && (
            <PracticalExampleBlock text={license.practicalExample} title="Як це працює на практиці" />
          )}

          {/* Consequences */}
          {license.consequences && (
            <ConsequencesBlock text={license.consequences} title="Що буде без ліцензії" />
          )}

          {/* FAQ */}
          {faqItems.length > 0 && <FaqSection items={faqItems} />}

          {/* AI button */}
          <Link to="/ai">
            <Button variant="outline" className="w-full gap-2">
              <Bot className="h-4 w-4" />
              Запитати AI про «{license.name}»
            </Button>
          </Link>

          {/* FINTODO CTA */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Як FINTODO допоможе</h2>
            </div>
            <p className="text-sm text-muted-foreground">{license.fintodoHelp}</p>
            <Link to={CTA_CHECKOUT_URL}>
              <Button>Почати безкоштовно <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </section>

          {/* Back */}
          <Link to="/dovidnyky/litsenziyi" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            ← Всі ліцензії
          </Link>
        </div>
      </EntryWithSiblingsLayout>
          <RelatedPartnersBlock directoryId="litsenziyi" />
    </PortalLayout>
  );
};

export default LicenseEntryPage;
