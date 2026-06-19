import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { ExternalLink, ArrowRight, Sparkles, MapPin, Copy } from "lucide-react";
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
  KATOTTG_ENTRIES,
  KATOTTG_LEVEL_LABEL,
  KATOTTG_LEVEL_FULL_LABEL,
  getKatottgBySlug,
} from "@/portal/data/katottg";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { toast } from "sonner";

const KatottgEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const e = slug ? getKatottgBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  if (!e) {
    return (
      <PortalLayout meta={{ title: "Одиницю КАТОТТГ не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">📍</div>
          <h1 className="text-2xl font-semibold mb-2">Одиницю не знайдено</h1>
          <Link to="/dovidnyky/katottg" className="text-primary font-medium hover:underline">
            ← До переліку КАТОТТГ
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/katottg/${e.slug}`;

  const copyCode = () => {
    navigator.clipboard.writeText(e.code);
    toast.success("Код скопійовано");
  };

  return (
    <PortalLayout
      meta={{
        title: e.seoTitle ?? `${e.name} — код КАТОТТГ ${e.code} | FINTODO`,
        description:
          e.seoDescription ??
          `Офіційний код КАТОТТГ ${e.code} для ${e.unitType}а ${e.name}. ${e.usageContext}`,
        canonical,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "КАТОТТГ", url: `${SITE_URL}/dovidnyky/katottg` },
          { name: e.name, url: canonical },
        ])}
      />
      {e.faq && e.faq.length > 0 && (
        <JsonLd data={getFaqSchema(e.faq.map((f) => ({ question: f.q, answer: f.a })))} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={KATOTTG_ENTRIES.map((x) => ({
            slug: x.slug,
            label: x.name,
            group: KATOTTG_LEVEL_LABEL[x.level],
            meta: x.oblast,
          }))}
          currentSlug={e.slug}
          basePath="/dovidnyky/katottg"
          backHref="/dovidnyky/katottg"
          title="КАТОТТГ"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav
            items={[
              { label: "Головна", to: "/" },
              { label: "Довідники", to: "/dovidnyky" },
              { label: "КАТОТТГ", to: "/dovidnyky/katottg" },
              { label: e.name },
            ]}
          />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">{KATOTTG_LEVEL_LABEL[e.level]}</Badge>
                <Badge variant="secondary">{e.oblast}</Badge>
                {e.postalCode && <Badge variant="outline">Індекс {e.postalCode}</Badge>}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-start gap-2">
                <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
                <span>{e.name} <span className="text-muted-foreground font-normal">— {e.unitType}</span></span>
              </h1>
            </div>

            <Card className="p-4 flex items-center justify-between gap-3 border-primary/30">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1">Код КАТОТТГ</div>
                <div className="font-mono text-base sm:text-lg font-semibold break-all">{e.code}</div>
              </div>
              <Button size="sm" variant="outline" onClick={copyCode} className="shrink-0">
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Копіювати
              </Button>
            </Card>

            <TldrBox text={e.usageContext} />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Що це за одиниця</h2>
              <p className="text-sm text-foreground leading-relaxed">
                <strong>{KATOTTG_LEVEL_FULL_LABEL[e.level]}.</strong> Код КАТОТТГ використовується в офіційній
                податковій, статистичній і фінансовій звітності — замінив попередній класифікатор КОАТУУ з 1 січня
                2022 року.
              </p>
              {e.population && (
                <p className="text-sm text-muted-foreground">
                  Орієнтовне населення: <strong className="text-foreground">{e.population} тис. осіб</strong>.
                </p>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Де використовується</h2>
              <ul className="space-y-1 list-disc pl-5 text-sm text-foreground">
                <li>Форма 1ДФ — поле «КАТОТТГ» податкової адреси платника та працівників.</li>
                <li>Звіт з ЄСВ — реквізит територіального розташування платника.</li>
                <li>Декларація платника єдиного податку — місце провадження діяльності.</li>
                <li>Декларація про доходи фізичної особи (форма 0500103).</li>
                <li>Реєстрація ФОП / ТОВ — у заяві про державну реєстрацію.</li>
                <li>Договори оренди землі та нерухомості.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Джерело</h2>
              <Card className="p-3 flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    Кодифікатор КАТОТТГ (наказ Мінрозвитку громад № 290 від 26.11.2020)
                  </div>
                  <a
                    href="https://decentralization.gov.ua/areas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all"
                  >
                    decentralization.gov.ua/areas
                  </a>
                </div>
              </Card>
            </section>

            {e.faq && e.faq.length > 0 && <FaqSection items={e.faq} />}

            <RelatedEntriesPanel category="katottg" slug={e.slug} />

            <div className="flex gap-2 flex-wrap">
              {e.tags.map((t) => (
                <Badge key={t} variant="secondary" className="py-1 px-3">{t}</Badge>
              ))}
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">FINTODO підтягує код КАТОТТГ автоматично</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                У кабінеті FINTODO коди КАТОТТГ автоматично проставляються у формі 1ДФ, звіті ЄСВ і декларації
                платника єдиного податку — на основі податкової адреси кабінету та працівників. Ніяких ручних
                пошуків.
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
          <RelatedPartnersBlock directoryId="katottg" />
    </PortalLayout>
  );
};

export default KatottgEntryPage;
