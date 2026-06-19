import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FINANCIAL_INDICES, CURRENCY_RATES } from "@/portal/data/finder";
import { PERSONAL_FINHEALTH_INDICES, BUSINESS_FINHEALTH_INDICES } from "@/portal/data/categoryIndices";
import { TrendingUp, TrendingDown, Minus, ArrowRight, DollarSign, Landmark, CreditCard, Shield, Receipt, BarChart3, Users, Home, History } from "lucide-react";
import { IndicesDeepDive } from "@/portal/sections/analytics/IndicesDeepDive";
import { KeyFiguresHistory } from "@/portal/sections/analytics/KeyFiguresHistory";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { SNAPSHOT_AS_OF } from "@/portal/data/knowledge/registry";
import { formatAsOf } from "@/portal/data/knowledge/resolvers";
import { Badge } from "@/components/ui/badge";

const NAV_CARDS = [
  { title: "Курси валют", desc: "Порівняння курсів 10+ банків", icon: DollarSign, href: "/analytics/currency", emoji: "💱" },
  { title: "Депозити", desc: "Ставки та ОВДП без ПДФО", icon: Landmark, href: "/analytics/deposits", emoji: "🏦" },
  { title: "Картки", desc: "Кешбек, комісії, умови", icon: CreditCard, href: "/analytics/cards", emoji: "💳" },
  { title: "Страхування", desc: "ОСЦПВ, ДМС, подорожі", icon: Shield, href: "/analytics/insurance", emoji: "🛡" },
  { title: "Тарифи і комісії", desc: "Перекази, обслуговування, еквайринг", icon: Receipt, href: "/analytics/fees", emoji: "📋" },
  { title: "Фінансові індекси", desc: "Облікова ставка, інфляція, мінзарплата", icon: BarChart3, href: "/analytics/indices", emoji: "📊" },
  { title: "Ринок праці", desc: "Зарплатні бенчмарки", icon: Users, href: "/analytics/labor", emoji: "👥" },
  { title: "Іпотека", desc: "єОселя і ринкові ставки", icon: Home, href: "/analytics/mortgage", emoji: "🏠" },
  { title: "Архів і прогнози", desc: "Історія курсів, індексів, цін та прогнози НБУ/Мінфіну", icon: History, href: "/analytics/archive", emoji: "🗄" },
];

const trendIcon = (trend: string) => {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
};

// Семантика «↑ = погано» для індексів, де зростання шкодить користувачу
const NEGATIVE_WHEN_UP = new Set(['inflation', 'cpi', 'unemployment', 'fuel-a95', 'usd-cash-spread']);
const trendColor = (id: string, trend: string) => {
  if (trend === 'stable') return 'text-muted-foreground';
  const negativeUp = NEGATIVE_WHEN_UP.has(id);
  if (negativeUp) return trend === 'up' ? 'text-destructive' : 'text-chart-2';
  return trend === 'down' ? 'text-destructive' : 'text-chart-2';
};

export default function AnalyticsPage() {
  return (
    <PortalLayout meta={{
      title: "Аналітика — курси, ставки, індекси | FINTODO",
      description: "Актуальні курси валют, ставки депозитів, зарплатні бенчмарки, іпотека та фінансові індекси України.",
      canonical: `${SITE_URL}/analytics`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Аналітика", url: `${SITE_URL}/analytics` },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Аналітика — курси, ставки, індекси",
        description: "Хаб фінансової аналітики FINTODO: курси валют, депозити, картки, страхування, тарифи, індекси, ринок праці, іпотека.",
        url: `${SITE_URL}/analytics`,
        isPartOf: { "@type": "WebSite", url: SITE_URL, name: "FINTODO" },
        hasPart: [
          { "@type": "Dataset", name: "Курси валют", url: `${SITE_URL}/analytics/currency` },
          { "@type": "Dataset", name: "Депозити", url: `${SITE_URL}/analytics/deposits` },
          { "@type": "Dataset", name: "Картки", url: `${SITE_URL}/analytics/cards` },
          { "@type": "Dataset", name: "Страхування", url: `${SITE_URL}/analytics/insurance` },
          { "@type": "Dataset", name: "Тарифи і комісії", url: `${SITE_URL}/analytics/fees` },
          { "@type": "Dataset", name: "Фінансові індекси", url: `${SITE_URL}/analytics/indices` },
          { "@type": "Dataset", name: "Ринок праці", url: `${SITE_URL}/analytics/labor` },
          { "@type": "Dataset", name: "Іпотека", url: `${SITE_URL}/analytics/mortgage` },
        ],
      }} />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Аналітика" }]} />

        {/* Hero */}
        <header className="py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-3xl tracking-tight">Аналітика</h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Актуальні курси, ставки та тарифи — ухвалюйте фінансові рішення на основі даних
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Snapshot: {formatAsOf(SNAPSHOT_AS_OF)}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Дані-знімок</Badge>
            <span className="hidden sm:inline">·</span>
            <span>Єдине джерело правди — реєстр знань порталу (використовується AI-консультантом)</span>
          </div>
        </header>

        {/* Top indices */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-6">
          {FINANCIAL_INDICES.indices.map(idx => (
            <Link key={idx.id} to="/analytics/indices" className="shrink-0">
              <Card className="w-[140px] hover:border-primary/30 transition-colors">
                <CardContent className="p-3 space-y-1">
                  <p className="text-xs text-muted-foreground truncate">{idx.shortName}</p>
                  <p className="text-lg font-bold font-mono text-foreground">{idx.value}</p>
                  {idx.change !== undefined && idx.change !== 0 && (
                    <div className={`flex items-center gap-1 text-xs ${trendColor(idx.id, idx.trend)}`}>
                      {trendIcon(idx.trend)}
                      <span>{idx.change > 0 ? '+' : ''}{idx.change}</span>
                    </div>
                  )}
                  {(idx.change === 0 || idx.change === undefined) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Minus className="h-3.5 w-3.5" />
                      <span>без змін</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Indices Deep Dive */}
        <IndicesDeepDive />

        {/* Key Figures History */}
        <div className="py-8">
          <KeyFiguresHistory />
        </div>

        {/* Navigation cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {NAV_CARDS.map(c => (
            <Link key={c.href} to={c.href}>
              <Card className="h-full hover:border-primary/40 transition-all hover:shadow-md group">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick previews — поглинуто блоком «Куди покласти гроші зараз» вище */}

        {/* Personal & Business Financial Health */}
        <section className="pb-10 space-y-8">
          {[
            { title: "Особисті фінанси: ваше фін-здоровʼя", subtitle: "6 ключових показників фізособи з бенчмарками і калькуляторами", items: PERSONAL_FINHEALTH_INDICES, course: "/learn/personal/personal-finlit-free", courseLabel: "Безкоштовний курс для фізосіб" },
            { title: "Здоровʼя бізнесу", subtitle: "6 показників, на які варто дивитись щомісяця", items: BUSINESS_FINHEALTH_INDICES, course: "/learn/business/business-finlit-free", courseLabel: "Безкоштовний курс для бізнесу" },
          ].map((block) => (
            <div key={block.title}>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">{block.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</p>
                </div>
                <Link to={block.course} className="text-xs font-medium text-primary hover:underline shrink-0">
                  {block.courseLabel} →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {block.items.map((idx) => (
                  <Link key={idx.id} to={idx.href}>
                    <Card className="h-full hover:border-primary/40 transition-colors">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{idx.icon}</span>
                          <p className="text-xs text-muted-foreground truncate">{idx.label}</p>
                        </div>
                        <p className="text-lg font-bold font-mono text-foreground">{idx.value}</p>
                        {idx.contextLabel && (
                          <p className="text-[10px] text-muted-foreground truncate">{idx.contextLabel}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* FINTODO CTA */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-foreground">💡 Як FINTODO пов'язаний з цими даними</p>
              <p className="text-sm text-muted-foreground">
                FINTODO автоматично використовує офіційний курс НБУ для перерахунку валютних надходжень і завжди актуальні ставки ЄСВ.
              </p>
            </div>
            <Button asChild>
              <Link to={CTA_CHECKOUT_URL}>
                Почати безкоштовно <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
