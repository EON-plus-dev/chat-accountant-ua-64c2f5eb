import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getDatasetSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CARD_OFFERS } from "@/portal/data/finder";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const FILTER_TABS = [
  { value: "all", label: "Всі" },
  { value: "debit", label: "Дебетові" },
  { value: "credit", label: "Кредитні" },
  { value: "business", label: "Для бізнесу" },
];

const PROFILES = [
  { id: "shopper", emoji: "🛒", label: "Активний покупець", recommendation: "Monobank — змінні категорії до 20% кешбеку. Обирайте категорії щомісяця для максимальної вигоди." },
  { id: "driver", emoji: "⛽", label: "Багато їздите", recommendation: "Monobank — категорія АЗС з підвищеним кешбеком. Також розгляньте ПУМБ для 3% на АЗС." },
  { id: "traveler", emoji: "✈️", label: "Часто за кордон", recommendation: "Monobank — 0% комісія за кордоном. Wise для великих переказів. Allianz для страхування." },
  { id: "business", emoji: "🏢", label: "Для бізнесу", recommendation: "Monobank Бізнес — безкоштовний рахунок ФОП, виписки XML для ДПС, корпоративна картка." },
];

export default function AnalyticsCardsPage() {
  const [filter, setFilter] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return CARD_OFFERS.offers;
    if (filter === "business") return CARD_OFFERS.offers.filter(c => c.audience === "business");
    return CARD_OFFERS.offers.filter(c => c.cardType === filter);
  }, [filter]);

  return (
    <PortalLayout meta={{
      title: "Порівняння банківських карток України 2025 | FINTODO",
      description: "Дебетові та кредитні картки з кешбеком. Порівняйте комісії, умови і переваги карток Monobank, Приватбанк, ПУМБ.",
      canonical: `${SITE_URL}/analytics/cards`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Аналітика", url: `${SITE_URL}/analytics` },
        { name: "Картки", url: `${SITE_URL}/analytics/cards` },
      ])} />
      <JsonLd data={getDatasetSchema({
        name: "Кешбек і тарифи дебетових/кредитних карток банків України",
        description: "Порівняння карткових продуктів банків України: кешбек, річне обслуговування, кредитні ліміти, валютні умови.",
        url: `${SITE_URL}/analytics/cards`,
        dateModified: new Date().toISOString().slice(0, 10),
        sourceName: "Офіційні сайти банків",
        sourceUrl: "https://bank.gov.ua/ua/statistic",
        keywords: ["картки", "кешбек", "дебетові картки", "кредитні картки", "банки України"],
        temporalCoverage: "2022/..",
      })} />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Аналітика", to: "/analytics" },
          { label: "Картки" },
        ]} />

        <header className="py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-3xl tracking-tight">Порівняння карток</h1>
          <p className="text-muted-foreground">Дебетові, кредитні та бізнес-картки з найкращими умовами</p>
          <p className="text-xs text-muted-foreground">Оновлено: {CARD_OFFERS.meta.lastUpdated}</p>
        </header>

        {/* Filters */}
        <div className="flex gap-2 pb-6">
          {FILTER_TABS.map(t => (
            <Button key={t.value} variant={filter === t.value ? "default" : "outline"} size="sm" onClick={() => setFilter(t.value)}>
              {t.label}
            </Button>
          ))}
        </div>

        {/* Card grid */}
        <div className="grid md:grid-cols-2 gap-4 pb-8">
          {filtered.map(c => (
            <Card key={c.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: c.bankColor }}>
                      {c.bankInitials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.cardName}</p>
                      <p className="text-xs text-muted-foreground">{c.bankName}</p>
                    </div>
                  </div>
                  {c.badge && <Badge variant="secondary" className="text-[10px] shrink-0">{c.badge}</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Обслуговування:</span> <span className="font-medium text-foreground">{c.annualFeeDisplay}</span></div>
                  <div><span className="text-muted-foreground">Кешбек:</span> <span className="font-medium text-foreground">{c.cashback}</span></div>
                  <div><span className="text-muted-foreground">За кордоном:</span> <span className="font-medium text-foreground">{c.foreignFee}</span></div>
                  <div><span className="text-muted-foreground">Банкомат:</span> <span className="font-medium text-foreground text-xs">{c.atmWithdrawal}</span></div>
                  {c.creditLimit && <div><span className="text-muted-foreground">Ліміт:</span> <span className="font-medium text-foreground">{c.creditLimit}</span></div>}
                  {c.gracePeriod && <div><span className="text-muted-foreground">Грейс:</span> <span className="font-medium text-foreground">{c.gracePeriod}</span></div>}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {c.highlights.map(h => (
                    <div key={h} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-chart-2" />
                      {h}
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href={c.ctaUrl} target="_blank" rel="noopener noreferrer">
                    Відкрити <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile matcher */}
        <Card className="mb-8">
          <CardContent className="p-5 space-y-4">
            <p className="font-semibold text-foreground">Яка картка підходить вам?</p>
            <div className="flex flex-wrap gap-2">
              {PROFILES.map(p => (
                <Button
                  key={p.id}
                  variant={selectedProfile === p.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProfile(p.id)}
                >
                  {p.emoji} {p.label}
                </Button>
              ))}
            </div>
            {selectedProfile && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-sm text-foreground">
                  {PROFILES.find(p => p.id === selectedProfile)?.recommendation}
                </CardContent>
              </Card>
            )}
            <Button variant="link" asChild className="p-0 h-auto text-sm">
              <Link to={CTA_CHECKOUT_URL}>Почати безкоштовно <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
