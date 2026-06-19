import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getDatasetSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INSURANCE_OFFERS } from "@/portal/data/finder";
import { ExternalLink, Info, Check } from "lucide-react";

const TYPE_TABS = [
  { value: "ostsv", label: "ОСЦПВ" },
  { value: "dms", label: "ДМС" },
  { value: "travel", label: "Подорожі" },
];

const CAR_BRANDS = ["Toyota", "Volkswagen", "Hyundai", "Skoda", "Renault", "BMW", "Mercedes"];
const YEARS = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"];
const ENGINES = ["до 1600 куб.см", "1601-2000 куб.см", "2001-3000 куб.см", "понад 3000 куб.см"];

export default function AnalyticsInsurancePage() {
  const [activeType, setActiveType] = useState("ostsv");
  const [brand, setBrand] = useState("");
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");

  const filtered = useMemo(() =>
    INSURANCE_OFFERS.offers
      .filter(o => o.type === activeType)
      .sort((a, b) => a.priceMin - b.priceMin),
    [activeType]
  );

  const showCalculator = activeType === "ostsv" && brand && year && engine;

  return (
    <PortalLayout meta={{
      title: "Страхування в Україні 2025 — ОСЦПВ, ДМС, подорожі | FINTODO",
      description: "Порівняйте ціни на ОСЦПВ від 495 ₴, ДМС від 2800 ₴, страхування подорожей від 150 ₴.",
      canonical: `${SITE_URL}/analytics/insurance`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Аналітика", url: `${SITE_URL}/analytics` },
        { name: "Страхування", url: `${SITE_URL}/analytics/insurance` },
      ])} />
      <JsonLd data={getDatasetSchema({
        name: "Тарифи страхових компаній України",
        description: "Порівняння тарифів ОСЦПВ, КАСКО, медичного та майнового страхування у страхових компаніях України.",
        url: `${SITE_URL}/analytics/insurance`,
        dateModified: new Date().toISOString().slice(0, 10),
        sourceName: "Національний банк України (Реєстр СК)",
        sourceUrl: "https://bank.gov.ua/ua/supervision/nonbanks",
        keywords: ["страхування", "ОСЦПВ", "КАСКО", "медичне страхування", "СК України"],
        temporalCoverage: "2022/..",
      })} />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Аналітика", to: "/analytics" },
          { label: "Страхування" },
        ]} />

        <header className="py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-3xl tracking-tight">Страхування</h1>
          <p className="text-muted-foreground">ОСЦПВ, ДМС та страхування подорожей — порівняння пропозицій</p>
          <p className="text-xs text-muted-foreground">Оновлено: {INSURANCE_OFFERS.meta.lastUpdated}</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 pb-6">
          {TYPE_TABS.map(t => (
            <Button key={t.value} variant={activeType === t.value ? "default" : "outline"} size="sm" onClick={() => setActiveType(t.value)}>
              {t.label}
            </Button>
          ))}
        </div>

        {/* OSTSV Calculator */}
        {activeType === "ostsv" && (
          <Card className="mb-6">
            <CardContent className="p-5 space-y-4">
              <p className="font-semibold text-foreground">Розрахунок ОСЦПВ</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Марка авто</label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                    <SelectContent>{CAR_BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Рік випуску</label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                    <SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Об'єм двигуна</label>
                  <Select value={engine} onValueChange={setEngine}>
                    <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                    <SelectContent>{ENGINES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {showCalculator && (
                <p className="text-sm text-muted-foreground">
                  Орієнтовна вартість: <span className="font-mono font-semibold text-foreground">від 495 ₴/рік</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Offers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
          {filtered.map(o => (
            <Card key={o.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: o.insurerColor }}>
                      {o.insurerInitials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{o.productName}</p>
                      <p className="text-xs text-muted-foreground">{o.insurerName}</p>
                    </div>
                  </div>
                  {o.badge && <Badge variant="secondary" className="text-[10px] shrink-0">{o.badge}</Badge>}
                </div>

                <div className="space-y-1.5">
                  <p className="text-lg font-bold font-mono text-foreground">{o.priceDisplay}</p>
                  <p className="text-xs text-muted-foreground">Покриття: {o.coverage}</p>
                </div>

                <div className="space-y-1">
                  {o.keyFeatures.map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-chart-2 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href={o.ctaUrl} target="_blank" rel="noopener noreferrer">
                    {o.onlineAvailable ? "Оформити онлайн" : "Детальніше"} <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legal note */}
        <Card className="mb-8 border-info/30 bg-info/5">
          <CardContent className="p-5 flex gap-3">
            <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Ціна ОСЦПВ залежить від типу ТЗ, регіону і терміну. Точна ціна — на сайті страховика. Дані FINTODO — орієнтовні.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
