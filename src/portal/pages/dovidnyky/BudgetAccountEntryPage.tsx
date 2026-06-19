import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, ArrowRight, Sparkles, Copy, Check, Landmark, AlertCircle } from "lucide-react";
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
  BUDGET_ACCOUNTS,
  BUDGET_TAX_LABEL,
  BUDGET_TAX_FULL_LABEL,
  BUDGET_REGION_LABEL,
  getBudgetAccountBySlug,
} from "@/portal/data/budgetAccounts";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const CopyableField = ({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} скопійовано`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  };
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className={`text-sm font-semibold text-foreground break-all ${mono ? "font-mono" : ""}`}>
            {value}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </Card>
  );
};

const BudgetAccountEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const a = slug ? getBudgetAccountBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!a) {
    return (
      <PortalLayout meta={{ title: "Рахунок не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🏦</div>
          <h1 className="text-2xl font-semibold mb-2">Бюджетний рахунок не знайдено</h1>
          <Link to="/dovidnyky/biudzhetni-rakhunky" className="text-primary font-medium hover:underline">
            ← До переліку рахунків
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/biudzhetni-rakhunky/${a.slug}`;

  return (
    <PortalLayout
      meta={{
        title: a.seoTitle ?? `${a.title} — IBAN, реквізити Казначейства | FINTODO`,
        description: a.seoDescription ?? a.summary,
        canonical,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Бюджетні рахунки", url: `${SITE_URL}/dovidnyky/biudzhetni-rakhunky` },
          { name: a.title, url: canonical },
        ])}
      />
      {a.faq && a.faq.length > 0 && (
        <JsonLd data={getFaqSchema(a.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={BUDGET_ACCOUNTS.map((x) => ({
            slug: x.slug,
            label: BUDGET_TAX_LABEL[x.taxType],
            group: BUDGET_REGION_LABEL[x.region],
            meta: x.title,
          }))}
          currentSlug={a.slug}
          basePath="/dovidnyky/biudzhetni-rakhunky"
          backHref="/dovidnyky/biudzhetni-rakhunky"
          title="Бюджетні рахунки"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav
            items={[
              { label: "Головна", to: "/" },
              { label: "Довідники", to: "/dovidnyky" },
              { label: "Бюджетні рахунки", to: "/dovidnyky/biudzhetni-rakhunky" },
              { label: a.title },
            ]}
          />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">{BUDGET_TAX_LABEL[a.taxType]}</Badge>
                <Badge variant="outline">{BUDGET_REGION_LABEL[a.region]}</Badge>
                <Badge variant="secondary" className="text-[10px]">Актуально на {a.asOf}</Badge>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-start gap-2">
                <Landmark className="h-6 w-6 text-primary shrink-0 mt-1" />
                <span>{a.title}</span>
              </h1>
              <p className="text-sm text-muted-foreground">{BUDGET_TAX_FULL_LABEL[a.taxType]}</p>
            </div>

            <TldrBox text={a.summary} />

            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">Звірте з ДПС перед платежем.</strong> Рахунок міг змінитися. Офіційне джерело:{" "}
                <a href={a.officialUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  tax.gov.ua
                </a>
                .
              </p>
            </div>

            {/* Реквізити */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Реквізити для платежу</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <CopyableField label="IBAN" value={a.iban} />
                <CopyableField label="ЄДРПОУ отримувача" value={a.recipientEdrpou} />
                <CopyableField label="Отримувач" value={a.recipientName} mono={false} />
                <CopyableField label="Банк отримувача" value={a.bankName} mono={false} />
                <CopyableField label="Код класифікації доходів" value={a.budgetCode} />
                {a.budgetSettlementCode && (
                  <CopyableField label="Код бюджету" value={a.budgetSettlementCode} />
                )}
              </div>
            </section>

            {/* Призначення платежу */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Призначення платежу</h2>
              <Card className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <code className="text-xs sm:text-sm font-mono text-foreground break-all flex-1">
                    {a.paymentPurposeTemplate}
                  </code>
                </div>
              </Card>
              <p className="text-xs text-muted-foreground">
                Формат відповідає наказу Мінфіну № 666: <code>*;101;[код платника];призначення; ;</code>
              </p>
            </section>

            {/* Терміни і штрафи */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {a.paymentDeadline && (
                <Card className="p-3 border-l-4 border-l-primary">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Термін сплати</h3>
                  <p className="text-sm text-foreground">{a.paymentDeadline}</p>
                </Card>
              )}
              {a.latePenalty && (
                <Card className="p-3 border-l-4 border-l-destructive">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Штраф за прострочення</h3>
                  <p className="text-sm text-foreground">{a.latePenalty}</p>
                </Card>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" asChild>
                <a href={a.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Реквізити на сайті ДПС
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://cabinet.tax.gov.ua/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Електронний кабінет ДПС
                </a>
              </Button>
            </div>

            {a.faq && a.faq.length > 0 && <FaqSection items={a.faq} />}

            <RelatedEntriesPanel category="biudzhetni-rakhunky" slug={a.slug} />

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
                <h2 className="text-base font-bold text-foreground">FINTODO платить автоматично</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                У кабінеті FINTODO достатньо натиснути «Сплатити» — система сама підставить актуальний IBAN,
                призначення платежу і код бюджету. Жодних помилок з реквізитами і прострочених платежів.
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
          <RelatedPartnersBlock directoryId="biudzhetni-rakhunky" />
    </PortalLayout>
  );
};

export default BudgetAccountEntryPage;
