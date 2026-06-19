import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getDatasetSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FEE_COMPARISONS } from "@/portal/data/finder";
import { ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const categories = [...new Set(FEE_COMPARISONS.comparisons.map(c => c.category))];

const ratingBg = (rating: string) => {
  if (rating === 'best') return 'bg-chart-2/10 text-chart-2 font-semibold';
  if (rating === 'expensive') return 'bg-warning/10 text-warning';
  return '';
};

export default function AnalyticsFeesPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [calcVolume, setCalcVolume] = useState(100000);
  const [calcCount, setCalcCount] = useState(20);

  const activeFees = useMemo(() =>
    FEE_COMPARISONS.comparisons.filter(c => c.category === activeCategory),
    [activeCategory]
  );

  // Simple cost estimate (assumes percentage fee)
  const estimatedCost = (calcVolume * 0.005); // 0.5% average
  const yearlyCost = estimatedCost * 12;

  return (
    <PortalLayout meta={{
      title: "Тарифи і комісії банків України 2026 | FINTODO",
      description: "Порівняння комісій за перекази, обслуговування рахунку ФОП, еквайринг. Знайдіть найвигідніший банк.",
      canonical: `${SITE_URL}/analytics/fees`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Аналітика", url: `${SITE_URL}/analytics` },
        { name: "Тарифи і комісії", url: `${SITE_URL}/analytics/fees` },
      ])} />
      <JsonLd data={getDatasetSchema({
        name: "Банківські комісії і тарифи України",
        description: "Порівняння комісій за перекази, обслуговування рахунку ФОП, еквайринг у банках України.",
        url: `${SITE_URL}/analytics/fees`,
        dateModified: FEE_COMPARISONS.meta.lastUpdated,
        sourceName: "Офіційні тарифи банків",
        sourceUrl: "https://bank.gov.ua/ua/statistic",
        keywords: ["банківські комісії", "тарифи", "переказ", "еквайринг", "ФОП"],
        temporalCoverage: "2022/..",
      })} />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Аналітика", to: "/analytics" },
          { label: "Тарифи і комісії" },
        ]} />

        <header className="py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-3xl tracking-tight">Тарифи і комісії</h1>
          <p className="text-muted-foreground">Порівняння банківських тарифів: перекази, обслуговування, еквайринг</p>
          <p className="text-xs text-muted-foreground">Оновлено: {FEE_COMPARISONS.meta.lastUpdated}</p>
        </header>

        {/* Category tabs */}
        <div className="flex gap-2 pb-6 overflow-x-auto scrollbar-hide">
          {categories.map(c => (
            <Button key={c} variant={activeCategory === c ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(c)} className="shrink-0">
              {c}
            </Button>
          ))}
        </div>

        {/* Comparison tables */}
        {activeFees.map(fee => (
          <Card key={fee.id} className="mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="px-5 py-3 border-b border-border/50">
                <p className="text-sm font-semibold text-foreground">{fee.subCategory}</p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Банк</TableHead>
                      <TableHead>Комісія</TableHead>
                      <TableHead>Умови</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fee.banks.map(b => (
                      <TableRow key={b.bankId}>
                        <TableCell className="font-medium">{b.bankName}</TableCell>
                        <TableCell className={cn("font-mono", ratingBg(b.rating))}>{b.fee}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{b.conditions ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {fee.fintodoTip && (
                <div className="px-5 py-3 border-t border-border/50 flex items-start gap-2 bg-primary/5">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{fee.fintodoTip}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Cost calculator */}
        <Card className="mb-8">
          <CardContent className="p-5 space-y-4">
            <p className="font-semibold text-foreground">Розрахуйте свої витрати</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Обсяг переказів/міс (₴)</label>
                <Input type="number" value={calcVolume} onChange={e => setCalcVolume(Number(e.target.value))} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Кількість переказів</label>
                <Input type="number" value={calcCount} onChange={e => setCalcCount(Number(e.target.value))} className="font-mono" />
              </div>
            </div>
            <div className="flex flex-wrap gap-6 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Витрати на місяць (≈0.5%)</p>
                <p className="text-xl font-bold font-mono text-foreground">{estimatedCost.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">На рік</p>
                <p className="text-xl font-bold font-mono text-foreground">{yearlyCost.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴</p>
              </div>
            </div>
            <Button variant="link" asChild className="p-0 h-auto text-sm">
              <Link to={CTA_CHECKOUT_URL}>FINTODO — автоматичний облік комісій <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
