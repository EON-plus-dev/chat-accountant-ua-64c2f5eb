import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { ExternalLink, ArrowRight, Sparkles, Briefcase, Copy, GraduationCap, Wallet, Shield } from "lucide-react";
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
  PROFESII,
  PROFESIA_SECTION_LABEL,
  PROFESIA_SECTION_FULL_LABEL,
  getProfesiaBySlug,
} from "@/portal/data/profesii";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { toast } from "sonner";

const ProfesiaEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const p = slug ? getProfesiaBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!p) {
    return (
      <PortalLayout meta={{ title: "Професію не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">💼</div>
          <h1 className="text-2xl font-semibold mb-2">Професію не знайдено</h1>
          <Link to="/dovidnyky/profesii" className="text-primary font-medium hover:underline">
            ← До класифікатора
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/profesii/${p.slug}`;

  const copyCode = () => {
    navigator.clipboard.writeText(p.code);
    toast.success("Код скопійовано");
  };

  return (
    <PortalLayout
      meta={{
        title: p.seoTitle ?? `${p.name} — код ${p.code} ДК 003:2010 | FINTODO`,
        description: p.seoDescription ?? `Офіційний код професії «${p.name}» (${p.code}). ${p.description}`,
        canonical,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Класифікатор професій", url: `${SITE_URL}/dovidnyky/profesii` },
          { name: p.name, url: canonical },
        ])}
      />
      {p.faq && p.faq.length > 0 && (
        <JsonLd data={getFaqSchema(p.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={PROFESII.map((x) => ({
            slug: x.slug,
            label: x.name,
            group: `${x.section}. ${PROFESIA_SECTION_LABEL[x.section]}`,
            meta: x.code,
          }))}
          currentSlug={p.slug}
          basePath="/dovidnyky/profesii"
          backHref="/dovidnyky/profesii"
          title="Професії"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav
            items={[
              { label: "Головна", to: "/" },
              { label: "Довідники", to: "/dovidnyky" },
              { label: "Класифікатор професій", to: "/dovidnyky/profesii" },
              { label: p.name },
            ]}
          />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">Розділ {p.section}. {PROFESIA_SECTION_LABEL[p.section]}</Badge>
                {p.pensionList && p.pensionList !== "none" && (
                  <Badge variant="secondary">Пільгова пенсія, Список {p.pensionList}</Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-start gap-2">
                <Briefcase className="h-6 w-6 text-primary shrink-0 mt-1" />
                <span>{p.name}</span>
              </h1>
              {p.aliases && p.aliases.length > 0 && (
                <p className="text-sm text-muted-foreground italic">Також: {p.aliases.join(" · ")}</p>
              )}
            </div>

            <Card className="p-4 flex items-center justify-between gap-3 border-primary/30">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1">Код ДК 003:2010</div>
                <div className="font-mono text-xl font-semibold">{p.code}</div>
              </div>
              <Button size="sm" variant="outline" onClick={copyCode} className="shrink-0">
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Копіювати
              </Button>
            </Card>

            <TldrBox text={p.description} />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Розділ класифікатора</h2>
              <p className="text-sm text-foreground leading-relaxed">
                {PROFESIA_SECTION_FULL_LABEL[p.section]}
              </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="p-3 flex items-start gap-2">
                <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Необхідна освіта</div>
                  <div className="text-sm text-foreground">{p.requiredEducation}</div>
                </div>
              </Card>
              {p.typicalSalary && (
                <Card className="p-3 flex items-start gap-2">
                  <Wallet className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Орієнтовна зарплата</div>
                    <div className="text-sm text-foreground font-semibold">{p.typicalSalary}</div>
                  </div>
                </Card>
              )}
              {p.pensionList && p.pensionList !== "none" && (
                <Card className="p-3 flex items-start gap-2 sm:col-span-2 border-l-4 border-l-primary">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Право на пільгову пенсію</div>
                    <div className="text-sm text-foreground">
                      Професію включено до <strong>Списку {p.pensionList}</strong> виробництв і робіт зі шкідливими
                      умовами праці. Працівник має право на призначення пенсії за віком на пільгових умовах
                      (відповідно до ст. 13 ЗУ «Про пенсійне забезпечення»).
                    </div>
                  </div>
                </Card>
              )}
              {p.riskNotes && (
                <Card className="p-3 flex items-start gap-2 sm:col-span-2">
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Типові ризики</div>
                    <div className="text-sm text-foreground">{p.riskNotes}</div>
                  </div>
                </Card>
              )}
            </div>

            {p.typicalKvedCodes && p.typicalKvedCodes.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Типові КВЕД-коди</h2>
                <p className="text-sm text-muted-foreground">
                  Професія найчастіше зустрічається в бізнесах із такими видами економічної діяльності:
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.typicalKvedCodes.map((code) => (
                    <Link key={code} to={`/dovidnyky/kved/${code}`}>
                      <Badge variant="outline" className="hover:border-primary/40 hover:text-primary cursor-pointer font-mono">
                        {code}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Де використовується код</h2>
              <ul className="space-y-1 list-disc pl-5 text-sm text-foreground">
                <li>Наказ про прийняття на роботу — назва посади + код професії.</li>
                <li>Штатний розпис — таблиця посад із кодами ДК 003:2010.</li>
                <li>Трудовий договір / запис у трудовій книжці.</li>
                <li>Форма 1ДФ — графа «код за класифікатором професій».</li>
                <li>Звіт з ЄСВ — реквізит для кожного працівника.</li>
                <li>Статистична звітність про оплату праці (форма 1-ПВ).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Джерело</h2>
              <Card className="p-3 flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    Класифікатор професій ДК 003:2010 (наказ Держспоживстандарту № 327 від 28.07.2010)
                  </div>
                  <a
                    href="https://zakon.rada.gov.ua/rada/show/va327609-10"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all"
                  >
                    zakon.rada.gov.ua/rada/show/va327609-10
                  </a>
                </div>
              </Card>
            </section>

            {p.faq && p.faq.length > 0 && <FaqSection items={p.faq} />}

            <RelatedEntriesPanel category="profesii" slug={p.slug} />

            <div className="flex gap-2 flex-wrap">
              {p.tags.map((t) => (
                <Badge key={t} variant="secondary" className="py-1 px-3">{t}</Badge>
              ))}
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">FINTODO формує накази і штатний розпис</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                У кабінеті FINTODO коди професій ДК 003:2010 автоматично підставляються в накази про прийняття,
                штатні розписи, трудові договори та звіт з ЄСВ. Жодних ручних пошуків — обираєте назву посади, а
                код підтягується.
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
          <RelatedPartnersBlock directoryId="profesii" />
    </PortalLayout>
  );
};

export default ProfesiaEntryPage;
