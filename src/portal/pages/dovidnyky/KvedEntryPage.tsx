import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { CheckCircle2, XCircle, ArrowRight, Star, Bot, ScrollText } from "lucide-react";
import { LICENSES } from "@/portal/data/licenses";
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
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { EntryWithSiblingsLayout } from "@/portal/components/EntryWithSiblingsLayout";

const ALL_GROUPS = [1, 2, 3] as const;

const KvedEntryPage = () => {
  const { code } = useParams<{ code: string }>();
  const entry = KVED_ENTRIES.find((k) => k.code === code);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [code]);

  const relatedCodes = entry
    ? KVED_ENTRIES.filter((k) => k.section === entry.section && k.code !== entry.code).slice(0, 5)
    : [];

  const sectionLetter = entry?.section?.match(/^([A-Z])/)?.[1] || "";
  const divisionCode = entry?.code?.split(".")[0] || "";

  if (!entry) return (
    <PortalLayout meta={{ title: "КВЕД не знайдено", description: "", canonical: "" }}>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="text-5xl mb-3">📋</div>
        <h1 className="text-2xl font-semibold mb-2">Код КВЕД {code} не знайдено</h1>
        <p className="text-muted-foreground mb-6">Перевірте правильність коду</p>
        <Link to="/dovidnyky/kved" className="text-primary font-medium hover:underline">← До довідника КВЕД</Link>
      </div>
    </PortalLayout>
  );

  return (
    <PortalLayout
      meta={{
        title: `КВЕД ${entry.code} — ${entry.name} | FINTODO`,
        description: `${entry.description} Дозволено для ФОП груп: ${entry.fopGroups.join(', ')}.`,
        canonical: `${SITE_URL}/dovidnyky/kved/${entry.code}`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "КВЕД", url: `${SITE_URL}/dovidnyky/kved` },
        { name: entry.code, url: `${SITE_URL}/dovidnyky/kved/${entry.code}` },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: `КВЕД ${entry.code} — ${entry.name}`,
        description: entry.description,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: "КВЕД України",
          url: `${SITE_URL}/dovidnyky/kved`,
        },
      }} />
      {entry.faq && entry.faq.length > 0 && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: entry.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }} />
      )}

      <EntryWithSiblingsLayout
        items={[...KVED_ENTRIES]
          .sort((a, b) => a.code.localeCompare(b.code))
          .map((k) => ({ slug: k.code, label: `${k.code} — ${k.name}`, group: k.section }))}
        currentSlug={entry.code}
        basePath="/dovidnyky/kved"
        title="КВЕД"
        backHref="/dovidnyky/kved"
      >
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "КВЕД", to: "/dovidnyky/kved" },
          { label: entry.code },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 sm:gap-8 pb-10 sm:pb-16">
          <div className="space-y-5 sm:space-y-8">
            {/* KVED hierarchy breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium">Секція {sectionLetter}</span>
              <span className="text-muted-foreground/50">›</span>
              <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium">Розділ {divisionCode}</span>
              <span className="text-muted-foreground/50">›</span>
              <span className="bg-primary/10 px-2 py-0.5 rounded text-xs font-mono font-semibold text-primary">{entry.code}</span>
            </div>

            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-2xl font-bold text-primary">{entry.code}</span>
                {entry.isPopular && <Badge variant="success">Популярний</Badge>}
                {entry.requiresLicense && <Badge variant="warning">Потребує ліцензії</Badge>}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{entry.name}</h1>
              <p className="text-sm text-muted-foreground">{entry.section}</p>
            </div>

            {/* Mobile-only compact metrics */}
            <div className="flex flex-wrap gap-2 lg:hidden">
              <div className="flex items-center gap-1.5 text-xs bg-muted/50 px-2.5 py-1.5 rounded-lg">
                <span className="text-muted-foreground">Групи ФОП:</span>
                <span className="font-semibold text-foreground">{entry.fopGroups.join(", ")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-muted/50 px-2.5 py-1.5 rounded-lg">
                <span className="text-muted-foreground">Ліцензія:</span>
                <span className={`font-semibold ${entry.requiresLicense ? "text-amber-600" : "text-emerald-600"}`}>
                  {entry.requiresLicense ? "Потрібна" : "Ні"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-muted/50 px-2.5 py-1.5 rounded-lg">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-3 w-3 ${i <= (entry.isPopular ? 4 : 2) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
            </div>

            <TldrBox text={entry.description} />

            {/* Full description */}
            {entry.fullDescription && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">📝 Детальний опис</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{entry.fullDescription}</p>
              </section>
            )}

            {/* FOP group compatibility */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Для яких груп ФОП</h2>
              <div className="space-y-2">
                {ALL_GROUPS.map((g) => {
                  const allowed = entry.fopGroups.includes(g);
                  return (
                    <div key={g} className={`flex items-center gap-2 text-sm p-3 rounded-lg ${allowed ? "bg-emerald-500/5" : "bg-muted/50"}`}>
                      {allowed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive/60 shrink-0" />
                      )}
                      <span className={allowed ? "text-foreground font-medium" : "text-muted-foreground"}>
                        Група {g} — {allowed ? "дозволено" : "заборонено"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* License */}
            {entry.requiresLicense && entry.licenseInfo && (
              <section className="rounded-lg border-l-4 border-amber-500 bg-amber-500/5 p-4 space-y-1">
                <p className="font-semibold text-foreground text-sm">⚠️ Ліцензування</p>
                <p className="text-sm text-muted-foreground">{entry.licenseInfo}</p>
              </section>
            )}

            {/* Tax notes */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Податкові особливості</h2>
              <p className="text-sm text-muted-foreground">{entry.taxNotes}</p>
            </section>

            {/* Warnings */}
            {entry.warnings && entry.warnings.length > 0 && (
              <WarningBlock items={entry.warnings} />
            )}

            {/* Practical example */}
            {entry.practicalExample && (
              <PracticalExampleBlock text={entry.practicalExample} />
            )}

            {/* Consequences */}
            {entry.consequences && (
              <ConsequencesBlock text={entry.consequences} />
            )}

            {/* Examples */}
            {entry.examples.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">Приклади бізнесів</h2>
                <div className="flex flex-wrap gap-2">
                  {entry.examples.map((ex) => (
                    <Badge key={ex} variant="secondary" className="py-1.5 px-3">{ex}</Badge>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            {entry.faq && entry.faq.length > 0 && (
              <FaqSection items={entry.faq} />
            )}

            {/* Required licenses */}
            {(() => {
              const relatedLicenses = LICENSES.filter(l => l.kvedCodes.includes(entry.code));
              if (relatedLicenses.length > 0) {
                return (
                  <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">📜 Необхідні ліцензії та дозволи</h2>
                    <div className="space-y-2">
                      {relatedLicenses.map((lic) => (
                        <Link
                          key={lic.slug}
                          to={`/dovidnyky/litsenziyi/${lic.slug}`}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 transition-colors group"
                        >
                          <ScrollText className="h-5 w-5 text-amber-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{lic.name}</p>
                            <p className="text-xs text-muted-foreground">{lic.issuingAuthority} · {lic.cost} · {lic.processingTime}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              }
              if (entry.requiresLicense) {
                return (
                  <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">📜 Ліцензування може бути необхідним</p>
                    <p className="text-xs text-muted-foreground">Для цього виду діяльності може знадобитись ліцензія або дозвіл.</p>
                    <Link to="/dovidnyky/litsenziyi" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
                      Переглянути каталог ліцензій <ArrowRight className="h-3 w-3" />
                    </Link>
                  </section>
                );
              }
              return null;
            })()}

            {/* Related KVED codes */}
            {relatedCodes.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">Схожі КВЕД</h2>
                <div className="space-y-2">
                  {relatedCodes.map((k) => (
                    <Link
                      key={k.code}
                      to={`/dovidnyky/kved/${k.code}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
                    >
                      <span className="font-mono text-sm font-semibold text-primary">{k.code}</span>
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1">{k.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* AI button */}
            <Link to="/ai">
              <Button variant="outline" className="w-full gap-2">
                <Bot className="h-4 w-4" />
                Запитати AI про КВЕД {entry.code}
              </Button>
            </Link>

            {/* CTA */}
            <Card className="p-4 sm:p-6 border-primary/20 bg-primary/5 space-y-2 sm:space-y-3">
              <h2 className="text-lg font-bold text-foreground">Обрали КВЕД? Визначте оптимальну групу ФОП</h2>
              <p className="text-sm text-muted-foreground">Tax Wizard підбере найвигіднішу систему оподаткування за 2 хвилини.</p>
              <Link to="/tools/tax-wizard">
                <Button>Пройти Tax Wizard <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </Card>
          </div>

          {/* Sidebar with all metrics */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-20 space-y-4">
              <Card className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Інформація</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Код</span>
                    <span className="font-mono font-semibold text-foreground">{entry.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Секція</span>
                    <span className="font-medium text-foreground">{sectionLetter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Розділ</span>
                    <span className="font-medium text-foreground">{divisionCode}</span>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <p className="text-muted-foreground mb-1.5">Дозволені групи ФОП</p>
                    <div className="flex gap-1">
                      {entry.fopGroups.map((g) => (
                        <Badge key={g} variant="default" className="text-[10px] px-2 py-0.5">Група {g}</Badge>
                      ))}
                    </div>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ліцензія</span>
                    <span className={`font-semibold ${entry.requiresLicense ? "text-amber-600" : "text-emerald-600"}`}>
                      {entry.requiresLicense ? "⚠️ Потрібна" : "✓ Не потрібна"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Популярність</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i <= (entry.isPopular ? 4 : 2) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground">Зареєстрованих ФОП з цим кодом</p>
                <p className="text-2xl font-bold text-foreground">{(entry.isPopular ? "12 400+" : "2 100+")}</p>
                <p className="text-[10px] text-muted-foreground">Орієнтовні дані</p>
              </Card>
            </div>
          </aside>
        </div>
      </EntryWithSiblingsLayout>
          <RelatedPartnersBlock directoryId="kved" />
    </PortalLayout>
  );
};

export default KvedEntryPage;
