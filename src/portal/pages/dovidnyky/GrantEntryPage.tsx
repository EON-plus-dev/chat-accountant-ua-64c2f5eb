import { useState, useEffect } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, CheckCircle2, Mail, ArrowRight, Sparkles, ThumbsUp, ThumbsDown, FileText, Clock } from "lucide-react";
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
import { GRANTS, GRANT_STATUS_MAP, GRANT_TYPE_MAP, GRANT_ORG_TYPE_MAP } from "@/portal/data/grants";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { EntryWithSiblingsLayout } from "@/portal/components/EntryWithSiblingsLayout";

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "default"> = {
  active: "success",
  upcoming: "warning",
  closed: "secondary",
  announced: "default",
};

const PROGRESS_STEPS = [
  "Перевірте вимоги",
  "Підготуйте документи",
  "Подайте заявку",
  "Дочекайтесь рішення",
];

const GrantEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const grant = GRANTS.find((g) => g.slug === slug);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    if (grant) {
      const saved = localStorage.getItem(`grant_${grant.id}_step`);
      if (saved) setCurrentStep(parseInt(saved, 10));
    }
  }, [grant]);

  const toggleStep = (step: number) => {
    if (!grant) return;
    const next = currentStep === step + 1 ? step : step + 1;
    setCurrentStep(next);
    localStorage.setItem(`grant_${grant.id}_step`, String(next));
  };

  if (!grant) return (
    <PortalLayout meta={{ title: "Грант не знайдено", description: "", canonical: "" }}>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="text-5xl mb-3">🎯</div>
        <h1 className="text-2xl font-semibold mb-2">Програму не знайдено</h1>
        <Link to="/dovidnyky/granty" className="text-primary font-medium hover:underline">← До грантів</Link>
      </div>
    </PortalLayout>
  );

  return (
    <PortalLayout
      meta={{
        title: `${grant.name} — ${grant.amount} | FINTODO`,
        description: grant.description,
        canonical: `${SITE_URL}/dovidnyky/granty/${grant.slug}`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Гранти", url: `${SITE_URL}/dovidnyky/granty` },
        { name: grant.name, url: `${SITE_URL}/dovidnyky/granty/${grant.slug}` },
      ])} />

      <EntryWithSiblingsLayout
        items={[...GRANTS]
          .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
          .map((g) => ({ slug: g.slug, label: g.name, group: GRANT_STATUS_MAP[g.status], meta: g.organization }))}
        currentSlug={grant.slug}
        basePath="/dovidnyky/granty"
        title="Гранти"
        backHref="/dovidnyky/granty"
      >
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Гранти", to: "/dovidnyky/granty" },
          { label: grant.name },
        ]} />

        <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{grant.name}</h1>
              <Badge variant={STATUS_VARIANT[grant.status]}>{GRANT_STATUS_MAP[grant.status]}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span>{grant.organization}</span>
              <Badge variant="outline" size="sm">{GRANT_ORG_TYPE_MAP[grant.orgType]}</Badge>
              <Badge variant="outline" size="sm">{GRANT_TYPE_MAP[grant.type]}</Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-mono text-2xl font-bold text-primary">{grant.amount}</p>
              {grant.amountNote && <span className="text-sm text-muted-foreground">({grant.amountNote})</span>}
            </div>
          </div>

          <TldrBox text={grant.description} />

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Дедлайн</p>
              <p className="text-sm font-semibold text-foreground">{grant.deadline}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Час розгляду</p>
              <p className="text-sm font-semibold text-foreground">{grant.timeline}</p>
            </Card>
            {grant.successRate && (
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Успішність</p>
                <p className="text-sm font-semibold text-foreground">{grant.successRate}</p>
              </Card>
            )}
            {grant.avgAmount && (
              <Card className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Середня сума</p>
                <p className="text-sm font-semibold text-foreground">{grant.avgAmount}</p>
              </Card>
            )}
          </div>

          {/* Progress tracker */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Ваш прогрес</h2>
            <div className="grid grid-cols-2 sm:flex gap-2">
              {PROGRESS_STEPS.map((step, i) => (
                <button
                  key={i}
                  onClick={() => toggleStep(i)}
                  className={`flex-1 p-2.5 sm:p-3 rounded-lg border text-center text-xs transition-colors ${
                    i < currentStep
                      ? "bg-primary/10 border-primary/30 text-primary font-medium"
                      : i === currentStep
                      ? "bg-accent border-border text-foreground font-medium"
                      : "bg-muted/30 border-border text-muted-foreground"
                  }`}
                >
                  <div className="text-lg mb-1">{i < currentStep ? "✓" : i + 1}</div>
                  {step}
                </button>
              ))}
            </div>
          </section>

          {/* Requirements */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Вимоги до заявника</h2>
            <ul className="space-y-2">
              {grant.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Кроки подачі заявки</h2>
            <ol className="space-y-2">
              {grant.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          {/* Documents */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" /> Необхідні документи
            </h2>
            <ul className="space-y-1.5">
              {grant.documents.map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
          </section>

          {/* Timeline */}
          <Card className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Час розгляду</p>
              <p className="text-sm text-muted-foreground">{grant.timeline}</p>
            </div>
          </Card>

          {/* Pros / Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-emerald-600" />
                <h3 className="font-semibold text-foreground text-sm">Переваги</h3>
              </div>
              <ul className="space-y-1.5">
                {grant.pros.map((p, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <span className="text-emerald-600 shrink-0">+</span> {p}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-destructive/70" />
                <h3 className="font-semibold text-foreground text-sm">Недоліки</h3>
              </div>
              <ul className="space-y-1.5">
                {grant.cons.map((c, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <span className="text-destructive/70 shrink-0">−</span> {c}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Warnings */}
          {grant.warnings && grant.warnings.length > 0 && (
            <WarningBlock items={grant.warnings} title="Часті помилки при подачі" />
          )}

          {/* Practical Example */}
          {grant.practicalExample && (
            <PracticalExampleBlock text={grant.practicalExample} title="Реальний приклад отримання" />
          )}

          {/* Consequences */}
          {grant.consequences && (
            <ConsequencesBlock text={grant.consequences} title="Що буде, якщо не скористатися" />
          )}

          {/* FAQ */}
          {grant.faq && grant.faq.length > 0 && (
            <FaqSection items={grant.faq} />
          )}

          {/* FINTODO help */}
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">FINTODO допомагає</h2>
            </div>
            <p className="text-sm text-muted-foreground">{grant.fintodoHelp}</p>
            <Link to={CTA_CHECKOUT_URL}>
              <Button size="sm">Почати безкоштовно <ArrowRight className="ml-2 h-3 w-3" /></Button>
            </Link>
          </section>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {grant.applicationUrl && (
              <Button asChild>
                <a href={grant.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Подати заявку
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href={grant.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Сайт програми
              </a>
            </Button>
            {grant.contactEmail && (
              <Button variant="outline" asChild>
                <a href={`mailto:${grant.contactEmail}`} className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {grant.contactEmail}
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to={`/consultant?ctx=grant&id=${grant.slug}`}>
                🤖 AI допоможе з подачею →
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dovidnyky/granty">← Всі програми</Link>
            </Button>
          </div>
        </div>
      </EntryWithSiblingsLayout>
          <RelatedPartnersBlock directoryId="granty" />
    </PortalLayout>
  );
};

export default GrantEntryPage;
