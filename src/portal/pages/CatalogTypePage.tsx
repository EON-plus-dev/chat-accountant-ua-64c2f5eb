import { useParams, Link } from "react-router-dom";
import { ExternalLink as ExternalLinkIcon, BookOpen, Wrench, CheckCircle2, ArrowRight } from "lucide-react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { CATALOG_CATEGORIES } from "@/portal/data/catalog";
import { ARTICLES } from "@/portal/data/articles";
import { TOOLS } from "@/portal/data/tools";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { analytics } from "@/portal/services/analytics";
import type { ExternalLink } from "@/portal/data/catalog";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const AUDIENCE_LABELS: Record<string, string> = {
  business: '🏢 Бізнес',
  personal: '👤 Фізособи',
  both: '🏢👤 Бізнес і фізособи',
};

const BADGE_COLORS: Record<ExternalLink['type'], string> = {
  official: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  register: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  service: 'bg-primary/10 text-primary',
  info: 'bg-muted text-muted-foreground',
};

const BADGE_LABELS: Record<ExternalLink['type'], string> = {
  official: 'Офіц.',
  register: 'Реєстр',
  service: 'Сервіс',
  info: 'Інфо',
};

const CatalogTypePage = () => {
  const { categorySlug, typeSlug } = useParams<{ categorySlug: string; typeSlug: string }>();
  const category = CATALOG_CATEGORIES.find((c) => c.slug === categorySlug);
  const type = category?.types.find((t) => t.slug === typeSlug);

  if (!category || !type) return (
    <PortalLayout meta={{ title: "Не знайдено", description: "", canonical: "" }}>
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="text-5xl mb-3">🔍</div>
        <h1 className="text-2xl font-semibold mb-2">Сторінку не знайдено</h1>
        <a href="/dovidnyky/ustanovy" className="text-primary font-medium hover:underline">← До довідника</a>
      </div>
    </PortalLayout>
  );

  const relatedArticles = ARTICLES.filter((a) => type.relatedArticleIds.includes(a.id));
  const relatedTools = TOOLS.filter((t) => type.relatedToolIds.includes(t.id));
  const showFintodoHelp = type.fintodoHelp !== "Не пов'язано напряму.";
  const siblingTypes = category.types.filter((t) => t.slug !== type.slug);

  return (
    <PortalLayout
      meta={{
        title: `${type.name} — коли потрібна і як взаємодіяти | FINTODO`,
        description: `${type.description} Коли потрібна, що підготувати і корисні ресурси.`,
        canonical: `${SITE_URL}/dovidnyky/ustanovy/${category.slug}/${type.slug}`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Установи", url: `${SITE_URL}/dovidnyky/ustanovy` },
          { name: category.name, url: `${SITE_URL}/dovidnyky/ustanovy/${category.slug}` },
          { name: type.shortName, url: `${SITE_URL}/dovidnyky/ustanovy/${category.slug}/${type.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "GovernmentService",
          name: type.name,
          description: type.description,
          serviceType: category.name,
          areaServed: {
            "@type": "Country",
            name: "Україна",
          },
          url: `${SITE_URL}/dovidnyky/ustanovy/${category.slug}/${type.slug}`,
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Установи", to: "/dovidnyky/ustanovy" },
            { label: category.name, to: `/dovidnyky/ustanovy/${category.slug}` },
            { label: type.shortName },
          ]}
        />

        {/* Header */}
        <header className="py-5 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{type.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-foreground lg:text-3xl tracking-tight">{type.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px]">
                  {AUDIENCE_LABELS[type.audience]}
                </Badge>
                {type.legalBasis && (
                  <span className="text-[10px] text-muted-foreground italic">{type.legalBasis}</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{type.description}</p>
        </header>

        {/* Block 1: When you need it */}
        {type.whenYouNeedIt.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-2">Коли вам знадобиться</h2>
            <ol className="space-y-1 list-decimal list-inside">
              {type.whenYouNeedIt.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground pl-1">{item}</li>
              ))}
            </ol>
          </section>
        )}

        {/* Block 2: What to prepare */}
        <section className="mb-6">
          <h2 className="text-base font-semibold text-foreground mb-2">Що підготувати заздалегідь</h2>
          {type.whatToPrepare.length > 0 ? (
            <ul className="space-y-1">
              {type.whatToPrepare.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">Спеціальної підготовки не потрібно</p>
          )}
        </section>

        {/* Block 3: Key Facts — compact definition list */}
        {type.keyFacts.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-2">Ключові факти і цифри</h2>
            <dl className="divide-y divide-border/50">
              {type.keyFacts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between py-2 gap-4">
                  <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                  <dd className="text-sm font-semibold font-mono text-foreground text-right">
                    {fact.value}
                    {fact.note && <span className="block text-[10px] font-normal text-muted-foreground">{fact.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Block 4: FINTODO help (conditional) */}
        {showFintodoHelp && (
          <section className="mb-6 rounded-lg border-l-4 border-primary bg-primary/5 p-4 space-y-2">
            <p className="font-semibold text-foreground text-sm">💡 Як FINTODO допомагає</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{type.fintodoHelp}</p>
            <Button asChild size="sm" onClick={() => analytics.ctaClick('catalog_type_cta')}>
              <Link to={CTA_CHECKOUT_URL}>Почати безкоштовно →</Link>
            </Button>
          </section>
        )}

        {/* Block 5: External links — inline compact */}
        {type.externalLinks.length > 0 && (
          <section className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-2">Офіційні ресурси</h2>
            <div className="space-y-1.5">
              {type.externalLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-1 text-sm text-primary hover:underline"
                >
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium ${BADGE_COLORS[link.type]}`}>
                    {BADGE_LABELS[link.type]}
                  </span>
                  <span className="truncate">{link.label}</span>
                  <ExternalLinkIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Block 6: Related articles & tools — compact */}
        {(relatedArticles.length > 0 || relatedTools.length > 0) && (
          <section className="mb-6">
            {relatedArticles.length > 0 && (
              <div className="mb-3">
                <h2 className="text-base font-semibold text-foreground mb-2">Читайте також</h2>
                <div className="space-y-1">
                  {relatedArticles.map((a) => (
                    <Link
                      key={a.id}
                      to={`/articles/${a.slug}`}
                      className="flex items-center gap-2 py-1.5 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{a.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {relatedTools.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-2">Корисні інструменти</h2>
                <div className="space-y-1">
                  {relatedTools.map((t) => (
                    <Link
                      key={t.id}
                      to={`/tools/${t.slug}`}
                      className="flex items-center gap-2 py-1.5 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <Wrench className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{t.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Block 6b: Related institution profiles */}
        {(() => {
          const relatedProfiles = INSTITUTION_PROFILES.filter(p =>
            p.types.some(t => t === type.slug || t === category.slug)
          );
          if (!relatedProfiles.length) return null;
          return (
            <section className="mb-6">
              <h2 className="text-base font-semibold text-foreground mb-2">Профілі установ</h2>
              <div className="space-y-1.5">
                {relatedProfiles.map(p => (
                  <Link
                    key={p.slug}
                    to={`/dovidnyky/ustanovy/profile/${p.slug}`}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: p.logo.color }}
                    >
                      {p.logo.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.legal.legalForm} · {p.verified ? '✓ Верифіковано' : ''}</p>
                    </div>
                    <span className="text-xs text-primary shrink-0">Профіль →</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Sibling navigation */}
        {siblingTypes.length > 0 && (
          <section className="pt-6 border-t border-border/40">
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">
              Інші в «{category.name}»
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {siblingTypes.map((s) => (
                <Link
                  key={s.slug}
                  to={`/dovidnyky/ustanovy/${category.slug}/${s.slug}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  {s.emoji} {s.shortName}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PortalLayout>
  );
};

export default CatalogTypePage;
