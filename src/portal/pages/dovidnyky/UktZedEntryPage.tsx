import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useEffect } from "react";
import { ExternalLink, ArrowRight, Sparkles, Ship, Copy, AlertTriangle, FileCheck } from "lucide-react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { TldrBox } from "@/portal/components/TldrBox";
import { FaqSection } from "@/portal/components/FaqSection";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getFaqSchema, SITE_URL } from "@/portal/seo/structuredData";
import { UKT_ZED, UKT_SECTION_LABEL, getUktZedBySlug } from "@/portal/data/uktZed";
import { EntrySiblingsSidebar } from "@/portal/components/EntrySiblingsSidebar";
import { RelatedEntriesPanel } from "@/portal/components/RelatedEntriesPanel";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { toast } from "sonner";

const UktZedEntryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const u = slug ? getUktZedBySlug(slug) : undefined;

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [slug]);

  if (!u) {
    return (
      <PortalLayout meta={{ title: "Код УКТ ЗЕД не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">🚢</div>
          <h1 className="text-2xl font-semibold mb-2">Код не знайдено</h1>
          <Link to="/dovidnyky/ukt-zed" className="text-primary font-medium hover:underline">← До УКТ ЗЕД</Link>
        </div>
      </PortalLayout>
    );
  }

  const canonical = `${SITE_URL}/dovidnyky/ukt-zed/${u.slug}`;
  const copyCode = () => { navigator.clipboard.writeText(u.codeRaw); toast.success("Код скопійовано"); };

  return (
    <PortalLayout
      meta={{
        title: u.seoTitle ?? `УКТ ЗЕД ${u.code} — ${u.name} | FINTODO`,
        description: u.seoDescription ?? `Код УКТ ЗЕД ${u.code} «${u.name}». Мито ${u.duty.importRate}, ПДВ ${u.duty.vatRate}${u.duty.excise ? `, акциз ${u.duty.excise}` : ""}.`,
        canonical,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "УКТ ЗЕД", url: `${SITE_URL}/dovidnyky/ukt-zed` },
        { name: u.name, url: canonical },
      ])} />
      {u.faq && u.faq.length > 0 && <JsonLd data={getFaqSchema(u.faq.map((f) => ({ question: f.q, answer: f.a })))} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:gap-8">
        <EntrySiblingsSidebar
          items={UKT_ZED.map((x) => ({
            slug: x.slug,
            label: x.name,
            group: `${x.section}. ${UKT_SECTION_LABEL[x.section]}`,
            meta: x.code,
          }))}
          currentSlug={u.slug}
          basePath="/dovidnyky/ukt-zed"
          backHref="/dovidnyky/ukt-zed"
          title="УКТ ЗЕД"
        />

        <div className="flex-1 min-w-0 lg:max-w-4xl">
          <BreadcrumbNav items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "УКТ ЗЕД", to: "/dovidnyky/ukt-zed" },
            { label: u.name },
          ]} />

          <div className="space-y-5 sm:space-y-8 pb-10 sm:pb-16">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default">Розділ {u.section}. {UKT_SECTION_LABEL[u.section]}</Badge>
                {u.duty.excise && <Badge variant="secondary">Підакцизний</Badge>}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-start gap-2">
                <Ship className="h-6 w-6 text-primary shrink-0 mt-1" />
                <span>{u.name}</span>
              </h1>
              {u.aliases && u.aliases.length > 0 && (
                <p className="text-sm text-muted-foreground italic">Також: {u.aliases.join(" · ")}</p>
              )}
            </div>

            <Card className="p-4 flex items-center justify-between gap-3 border-primary/30">
              <div><div className="text-xs text-muted-foreground mb-1">Код УКТ ЗЕД</div><div className="font-mono text-xl font-semibold">{u.code}</div></div>
              <Button size="sm" variant="outline" onClick={copyCode}><Copy className="h-3.5 w-3.5 mr-1.5" />Копіювати</Button>
            </Card>

            <TldrBox text={u.description} />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Митні ставки</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Ввізне мито</div><div className="text-lg font-bold text-foreground">{u.duty.importRate}</div></Card>
                <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">ПДВ при імпорті</div><div className="text-lg font-bold text-foreground">{u.duty.vatRate}</div></Card>
                {u.duty.excise && (
                  <Card className="p-4 border-l-4 border-l-orange-500 sm:col-span-1 col-span-2"><div className="text-xs text-muted-foreground mb-1">Акциз</div><div className="text-sm font-bold text-foreground">{u.duty.excise}</div></Card>
                )}
                {u.duty.exportRate && (
                  <Card className="p-4"><div className="text-xs text-muted-foreground mb-1">Вивізне мито</div><div className="text-lg font-bold text-foreground">{u.duty.exportRate}</div></Card>
                )}
              </div>
            </section>

            {u.permits && u.permits.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" />Необхідні дозволи</h2>
                <Card className="p-4">
                  <ul className="space-y-1 list-disc pl-5 text-sm text-foreground">
                    {u.permits.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </Card>
              </section>
            )}

            {u.restrictions && (
              <Card className="p-4 border-l-4 border-l-destructive bg-destructive/5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div><div className="text-xs font-semibold text-destructive mb-1">Обмеження</div><p className="text-sm text-foreground">{u.restrictions}</p></div>
                </div>
              </Card>
            )}

            {u.examples && u.examples.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Приклади товарів у позиції</h2>
                <div className="flex flex-wrap gap-2">
                  {u.examples.map((x) => <Badge key={x} variant="outline" className="py-1 px-3">{x}</Badge>)}
                </div>
              </section>
            )}

            {u.relatedKvedCodes && u.relatedKvedCodes.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Дотичні КВЕД</h2>
                <div className="flex flex-wrap gap-2">
                  {u.relatedKvedCodes.map((c) => (
                    <Link key={c} to={`/dovidnyky/kved/${c}`}>
                      <Badge variant="outline" className="hover:border-primary/40 hover:text-primary cursor-pointer font-mono">{c}</Badge>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Джерело</h2>
              <Card className="p-3 flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">УКТ ЗЕД — Закон України № 674-IX від 04.06.2020 (HS 2022)</div>
                  <a href="https://customs.gov.ua/uktzed" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all">customs.gov.ua/uktzed</a>
                </div>
              </Card>
            </section>

            {u.faq && u.faq.length > 0 && <FaqSection items={u.faq} />}
            <RelatedEntriesPanel category="ukt-zed" slug={u.slug} />

            <div className="flex gap-2 flex-wrap">
              {u.tags.map((t) => <Badge key={t} variant="secondary" className="py-1 px-3">{t}</Badge>)}
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="text-base font-bold text-foreground">FINTODO рахує розмитнення</h2></div>
              <p className="text-sm text-muted-foreground">Кабінет FINTODO рахує мито, ПДВ і акциз для імпорту за кодом УКТ ЗЕД, формує податковий кредит з ПДВ і нагадує про дозволи.</p>
              <Link to={CTA_CHECKOUT_URL}><Button size="sm">Спробувати безкоштовно <ArrowRight className="ml-2 h-3 w-3" /></Button></Link>
            </section>
          </div>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="ukt-zed" />
    </PortalLayout>
  );
};

export default UktZedEntryPage;
