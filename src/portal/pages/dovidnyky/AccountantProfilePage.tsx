import { useParams, Link } from "react-router-dom";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import {
  ArrowRight, Star, MessageCircle, Mail, Phone, ExternalLink, Percent,
  CheckCircle2, Shield, FileSignature, Calendar, ThumbsUp, AlertCircle,
  FileText, Download, Eye,
} from "lucide-react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { ACCOUNTANTS } from "@/portal/data/accountants";
import { getAccountantExtras } from "@/portal/data/accountantProfileExtras";
import { EntryWithSiblingsLayout } from "@/portal/components/EntryWithSiblingsLayout";
import { EngagementRequestDialog } from "@/components/marketplace/EngagementRequestDialog";
import { AccountantSectionNav } from "@/portal/components/AccountantSectionNav";
import { AccountantHero } from "@/portal/components/AccountantHero";
import { AccountantBackground } from "@/portal/components/AccountantBackground";
import { useRef } from "react";

const buildTOC = (entityType: 'individual' | 'agency') => [
  { id: "about", label: entityType === 'agency' ? "Про компанію" : "Про себе" },
  { id: "packages", label: "Послуги та ціни" },
  { id: "reviews", label: "Відгуки і кейси" },
  { id: "trust", label: "Гарантії та договір" },
  { id: "availability", label: "Доступність" },
  { id: "process", label: "Процес роботи" },
  { id: "contact", label: "Контакти" },
];

const AccountantProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const acc = ACCOUNTANTS.find((a) => a.slug === slug);
  const heroRef = useRef<HTMLDivElement>(null);

  if (!acc)
    return (
      <PortalLayout meta={{ title: "Бухгалтер не знайдено", description: "", canonical: "" }}>
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <div className="text-5xl mb-3">👩‍💼</div>
          <h1 className="text-2xl font-semibold mb-2">Бухгалтер не знайдено</h1>
          <Link to="/dovidnyky/accountants" className="text-primary font-medium hover:underline">
            ← До каталогу бухгалтерів
          </Link>
        </div>
      </PortalLayout>
    );

  const extras = getAccountantExtras(acc);
  const TOC = buildTOC(acc.entityType);
  const similar = ACCOUNTANTS
    .filter(a => a.slug !== acc.slug && (a.city === acc.city || a.specializations.some(s => acc.specializations.includes(s))))
    .slice(0, 3);

  const availStatusCfg = {
    accepting: { label: "Приймає клієнтів", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    waitlist: { label: `Лист очікування — ${extras.availability.waitlistDays ?? "?"} дн.`, classes: "bg-amber-50 text-amber-700 border-amber-200" },
    closed: { label: "Не приймає нових клієнтів", classes: "bg-rose-50 text-rose-700 border-rose-200" },
  }[extras.availability.status];

  const tgUrl = acc.contactTelegram ? `https://t.me/${acc.contactTelegram.replace(/^@/, "")}` : undefined;

  return (
    <PortalLayout
      meta={{
        title: `${acc.name} — бухгалтер-аутсорсер ${acc.city} | FINTODO`,
        description: acc.description,
        canonical: `${SITE_URL}/dovidnyky/accountants/${acc.slug}`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Бухгалтери", url: `${SITE_URL}/dovidnyky/accountants` },
          { name: acc.name, url: `${SITE_URL}/dovidnyky/accountants/${acc.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: acc.name,
          description: acc.description,
          url: `${SITE_URL}/dovidnyky/accountants/${acc.slug}`,
          image: acc.photoUrl ? `${SITE_URL}${acc.photoUrl}` : undefined,
          address: { "@type": "PostalAddress", addressLocality: acc.city, addressRegion: acc.region, addressCountry: "UA" },
          areaServed: acc.isOnline ? "UA" : acc.region,
          priceRange: acc.priceTo ? `₴${acc.priceFrom}–${acc.priceTo}` : `від ₴${acc.priceFrom}`,
          serviceType: extras.serviceTypes,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: acc.rating,
            reviewCount: acc.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
          knowsLanguage: acc.languages,
          ...(extras.reviews && {
            review: extras.reviews.items.slice(0, 3).map(r => ({
              "@type": "Review",
              reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
              author: { "@type": "Person", name: r.authorLabel },
              datePublished: r.date,
              reviewBody: r.text,
            })),
          }),
        }}
      />

      <EntryWithSiblingsLayout
        items={[...ACCOUNTANTS]
          .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
          .map((a) => ({ slug: a.slug, label: a.name }))}
        currentSlug={acc.slug}
        basePath="/dovidnyky/accountants"
        title="Бухгалтери"
        backHref="/dovidnyky/accountants"
      >
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Бухгалтери", to: "/dovidnyky/accountants" },
            { label: acc.name },
          ]}
        />

        <div className="space-y-6 pb-24 lg:pb-16 pt-2">
          {/* Hero */}
          <div ref={heroRef}>
            <AccountantHero
              acc={acc}
              headlineTags={extras.headlineTags}
              availabilityLabel={availStatusCfg.label}
              availabilityClasses={availStatusCfg.classes}
              availabilityStatus={extras.availability.status}
              waitlistDays={extras.availability.waitlistDays}
            />
          </div>

          {/* Sticky scroll-spy TOC + desktop fixed mini-bar */}
          <AccountantSectionNav items={TOC} acc={acc} />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Досвід", value: `${acc.experience} років` },
              { label: "Клієнтів зараз", value: String(acc.clientCount) },
              { label: "Рейтинг", value: `${acc.rating} ★`, extra: `${acc.reviewCount} відгуків` },
              { label: "Відповідь", value: acc.responseTime.replace(/^до /, "≤ ") },
            ].map((s) => (
              <Card key={s.label} className="p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                {s.extra && <p className="text-[10px] text-muted-foreground">{s.extra}</p>}
              </Card>
            ))}
          </div>

          {/* About: unified description + audience + background */}
          <AccountantBackground
            background={extras.background}
            description={acc.description}
            specializations={acc.specializations}
            taxSystems={acc.taxSystems}
            industries={acc.industries}
            teamPhotoUrl={acc.teamPhotoUrl}
          />

          {/* === Packages === */}
          {extras.pricing && (
            <Card id="packages" className="p-5 space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-bold text-foreground">Послуги та ціни</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{extras.pricing.vatIncluded ? "Ціни з ПДВ" : "Ціни без ПДВ"}</span>
                  <span>·</span>
                  <span>{extras.pricing.paymentTerms}</span>
                  {extras.pricing.freeIntroMinutes && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">Безкоштовна консультація {extras.pricing.freeIntroMinutes} хв</span>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {extras.pricing.packages.map(p => {
                  const tpl = p.contractTemplateId ? extras.contractTemplates.find(t => t.id === p.contractTemplateId) : undefined;
                  return (
                  <div key={p.name} className={`rounded-lg border p-4 space-y-2 ${p.highlight ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <span className="text-sm font-bold text-foreground whitespace-nowrap">{p.priceDisplay}</span>
                    </div>
                    <ul className="space-y-1">
                      {p.features.map(f => (
                        <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {tpl && (
                      <a href={tpl.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline pt-1">
                        <FileText className="h-3.5 w-3.5" />
                        Зразок договору для цієї послуги
                      </a>
                    )}
                  </div>
                  );
                })}
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Разові послуги</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {extras.pricing.addOns.map(a => (
                    <div key={a.name} className="flex items-baseline justify-between text-xs gap-2 border-b border-dashed border-border pb-1">
                      <span className="text-muted-foreground truncate">{a.name}</span>
                      <span className="font-medium text-foreground whitespace-nowrap">{a.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* === Reviews === */}
          {extras.reviews && (
            <Card id="reviews" className="p-5 space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-bold text-foreground">Відгуки клієнтів</h2>
                <span className="flex items-center gap-1 text-xs text-emerald-700">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {extras.reviews.recommendPercent}% рекомендують колегам
                </span>
              </div>

              {/* Rating distribution */}
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 items-center">
                <div className="text-center sm:text-left">
                  <div className="text-3xl font-bold text-foreground">{acc.rating}</div>
                  <div className="flex items-center gap-0.5 justify-center sm:justify-start">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`h-4 w-4 ${n <= Math.round(acc.rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{acc.reviewCount} відгуків</p>
                </div>
                <div className="space-y-1">
                  {extras.reviews.distribution.map(d => (
                    <div key={d.stars} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-muted-foreground">{d.stars}★</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${d.percent}%` }} />
                      </div>
                      <span className="w-10 text-right font-mono text-muted-foreground">{d.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Individual reviews */}
              <div className="space-y-3">
                {extras.reviews.items.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-7 h-7 rounded-full bg-muted text-foreground font-medium text-[10px] flex items-center justify-center">
                        {r.authorInitials}
                      </div>
                      <span className="text-xs font-medium text-foreground">{r.authorLabel}</span>
                      <span className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`h-3 w-3 ${n <= r.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
                        ))}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{r.date}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{r.text}</p>
                    {r.reply && (
                      <div className="mt-2 pl-3 border-l-2 border-primary/30 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Відповідь бухгалтера: </span>{r.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Cases */}
              {extras.reviews.cases.length > 0 && (
                <>
                  <Separator />
                  <h3 className="font-semibold text-foreground text-sm">Кейси</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {extras.reviews.cases.map(c => (
                      <div key={c.title} className="rounded-lg border border-border p-3 space-y-1">
                        <p className="font-medium text-foreground text-sm">{c.title}</p>
                        <p className="text-[11px] text-muted-foreground"><strong>Контекст:</strong> {c.context}</p>
                        <p className="text-xs text-emerald-700"><strong>Результат:</strong> {c.result}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          )}

          {/* === Trust & Liability === */}
          <Card id="trust" className="p-5 space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">Гарантії та відповідальність</h2>
            </div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex gap-2">
                <FileSignature className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Договір</p>
                  <p className="text-xs text-muted-foreground">{extras.liability.contractParty}</p>
                </div>
              </li>
              {extras.liability.insurance && (
                <li className="flex gap-2">
                  <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Страхування професійної відповідальності</p>
                    <p className="text-xs text-muted-foreground">{extras.liability.insurance.provider}, ліміт {extras.liability.insurance.limit}</p>
                  </div>
                </li>
              )}
              <li className="flex gap-2">
                <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${extras.liability.ndaDefault ? "text-emerald-600" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-medium text-foreground">NDA</p>
                  <p className="text-xs text-muted-foreground">
                    {extras.liability.ndaDefault ? "Підписується за замовчуванням разом з договором." : "За запитом."}
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Захист даних</p>
                  <p className="text-xs text-muted-foreground">{extras.liability.dataStorage}</p>
                </div>
              </li>
              <li className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Хто платить за помилку</p>
                  <p className="text-xs text-muted-foreground">{extras.liability.liabilityClause}</p>
                </div>
              </li>
            </ul>

            {extras.contractTemplates.length > 0 && (
              <div className="pt-3 mt-1 border-t border-border space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Зразок договору про надання послуг</h3>
                </div>
                <ul className="space-y-2">
                  {extras.contractTemplates.map(t => (
                    <li key={t.id} className="rounded-lg border border-border p-3 flex items-start gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{t.title}</p>
                          <Badge variant="outline" className="text-[10px] uppercase">{t.scope === "primary" ? "Основний" : "Додаток"}</Badge>
                          <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">ЗРАЗОК</Badge>
                        </div>
                        {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          {t.format.toUpperCase()}{t.sizeKb ? ` · ${t.sizeKb} КБ` : ""} · оновлено {t.updatedAt}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button asChild size="sm" variant="outline">
                          <a href={t.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3.5 w-3.5 mr-1" /> Переглянути
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <a href={t.fileUrl} download>
                            <Download className="h-3.5 w-3.5 mr-1" /> Завантажити
                          </a>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted-foreground">
                  Зразок для ознайомлення. Це не публічна оферта — фактичні умови узгоджуються індивідуально та підписуються через КЕП у Fintodo.
                </p>
              </div>
            )}
          </Card>

          {/* === Availability === */}
          <Card id="availability" className="p-5 space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-foreground">Доступність</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Стан</p>
                <p className={`font-medium ${availStatusCfg.classes.replace(/bg-\S+|border-\S+/g, "").trim()}`}>{availStatusCfg.label}</p>
                {extras.availability.freeSlotsThisMonth && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Завантаження: {extras.availability.freeSlotsThisMonth.taken} / {extras.availability.freeSlotsThisMonth.total} клієнтів
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Робочі години</p>
                <p className="font-medium text-foreground text-sm">{extras.availability.workingHours}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{extras.availability.timezone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Час відповіді</p>
                <p className="font-medium text-foreground text-sm">{acc.responseTime}</p>
              </div>
            </div>
            {extras.availability.vacationNotice && (
              <div className="text-xs rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2">
                {extras.availability.vacationNotice}
              </div>
            )}
          </Card>

          {/* === Process === */}
          <Card id="process" className="p-5 space-y-4 scroll-mt-20">
            <h2 className="font-bold text-foreground">Як ми починаємо співпрацю</h2>
            <ol className="space-y-3">
              {extras.workflow.steps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="font-medium text-foreground text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Ритм комунікації</p>
                <p className="text-muted-foreground">{extras.workflow.reportCadence}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">SLA по дедлайнах</p>
                <p className="text-muted-foreground">{extras.workflow.deadlineSLA}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Що надаєте ви</p>
                <ul className="text-muted-foreground space-y-0.5">
                  {extras.workflow.clientProvides.map(c => <li key={c}>· {c}</li>)}
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Що робить бухгалтер</p>
                <ul className="text-muted-foreground space-y-0.5">
                  {extras.workflow.accountantHandles.map(c => <li key={c}>· {c}</li>)}
                </ul>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-5 space-y-3 border-primary/30 bg-primary/5">
            <h2 className="font-bold text-foreground">Готові співпрацювати?</h2>
            {acc.isFintodoCertified && (
              <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/5 p-3">
                <Percent className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <div className="text-xs text-foreground">
                  <strong>Бонус від партнера:</strong> як сертифікований Reseller FINTODO, цей партнер дає
                  своїм клієнтам знижку <strong>−25/30/35%</strong> на тариф — % визначається його партнерським тарифом (Solo / Agency / Firm).
                  Знижка застосується автоматично після прийняття запиту.
                </div>
              </div>
            )}
            <div className="hidden md:block">
              <EngagementRequestDialog accountantSlug={acc.slug} accountantName={acc.name} />
            </div>
          </Card>

          {/* === Contact === */}
          <Card id="contact" className="p-5 space-y-3 scroll-mt-20">
            <h2 className="font-bold text-foreground">Контакти</h2>
            <div className="flex flex-wrap gap-2">
              {tgUrl && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <a href={tgUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> Telegram
                  </a>
                </Button>
              )}
              {acc.contactEmail && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <a href={`mailto:${acc.contactEmail}`}>
                    <Mail className="h-4 w-4" /> Email
                  </a>
                </Button>
              )}
              {acc.contactPhone && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <a href={`tel:${acc.contactPhone.replace(/\s/g, "")}`}>
                    <Phone className="h-4 w-4" /> {acc.contactPhone}
                  </a>
                </Button>
              )}
              {acc.website && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <a href={acc.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Сайт
                  </a>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Час відповіді: {acc.responseTime} · Мови: {acc.languages.join(", ")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Рекомендуємо починати спілкування через FINTODO — так фіксуються умови договору і зберігається історія для випадку спорів.
            </p>
          </Card>

          {/* === Similar === */}
          {similar.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-foreground">Схожі бухгалтери</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similar.map(s => (
                  <Link key={s.id} to={`/dovidnyky/accountants/${s.slug}`}>
                    <Card className="p-3 h-full hover:border-primary/40 transition-colors">
                      <div className="flex items-start gap-2">
                        {s.photoUrl ? (
                          <img src={s.photoUrl} alt={s.name} width={36} height={36} loading="lazy"
                            className={`w-9 h-9 object-cover shrink-0 border border-border ${s.entityType === 'agency' ? 'rounded-md bg-white p-0.5' : 'rounded-full'}`} />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: s.initialsColor }}>
                            {s.initials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                          <p className="text-[11px] text-muted-foreground">{s.city} · {s.experience} р. · {s.priceDisplay}</p>
                          <div className="flex items-center gap-0.5 mt-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span className="text-[11px] text-muted-foreground">{s.rating} ({s.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <Link
            to="/dovidnyky/accountants"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← Всі бухгалтери
          </Link>
        </div>

        {/* Sticky mobile CTA */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur p-3 flex items-center gap-2 shadow-[0_-4px_12px_-4px_hsl(var(--foreground)/0.1)]">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground truncate">{acc.priceDisplay} · {availStatusCfg.label}</p>
          </div>
          {extras.availability.status === "closed" ? (
            <Button size="sm" disabled className="gap-1.5">Не приймає</Button>
          ) : (
            <EngagementRequestDialog accountantSlug={acc.slug} accountantName={acc.name} />
          )}
        </div>
      </EntryWithSiblingsLayout>
          <RelatedPartnersBlock directoryId="accountants" />
    </PortalLayout>
  );
};

export default AccountantProfilePage;
