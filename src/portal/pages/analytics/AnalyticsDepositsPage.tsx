import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, getDatasetSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPOSIT_OFFERS } from "@/portal/data/finder";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const TERM_OPTIONS = [
  { value: "all", label: "Будь-який" },
  { value: "1", label: "1 міс" },
  { value: "3", label: "3 міс" },
  { value: "6", label: "6 міс" },
  { value: "12", label: "12 міс" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Всі" },
  { value: "deposit", label: "Депозити" },
  { value: "ovdp", label: "ОВДП" },
];

export default function AnalyticsDepositsPage() {
  const [termFilter, setTermFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [roiAmount, setRoiAmount] = useState(50000);
  const [roiTerm, setRoiTerm] = useState(12);
  const [roiProduct, setRoiProduct] = useState("d1");

  const filtered = useMemo(() => {
    let items = [...DEPOSIT_OFFERS.offers];
    if (termFilter !== "all") {
      const t = Number(termFilter);
      items = items.filter(d => d.termMonths.includes(t));
    }
    if (typeFilter === "deposit") items = items.filter(d => !d.bankId.includes("ovdp"));
    if (typeFilter === "ovdp") items = items.filter(d => d.bankId.includes("ovdp"));
    return items.sort((a, b) => b.rateMax - a.rateMax);
  }, [termFilter, typeFilter]);

  const selectedProduct = DEPOSIT_OFFERS.offers.find(d => d.id === roiProduct);
  const roiGross = selectedProduct ? (roiAmount * selectedProduct.rateMax / 100 * roiTerm / 12) : 0;
  const isOvdp = selectedProduct?.bankId.includes("ovdp");
  const roiNet = isOvdp ? roiGross : roiGross * (1 - 0.18 - 0.05);

  return (
    <PortalLayout meta={{
      title: "Найкращі депозити в Україні 2025 — порівняти ставки | FINTODO",
      description: "Ставки депозитів до 15% річних. ОВДП 14.2% без ПДФО. Порівняти 15+ банків.",
      canonical: `${SITE_URL}/analytics/deposits`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Аналітика", url: `${SITE_URL}/analytics` },
        { name: "Депозити", url: `${SITE_URL}/analytics/deposits` },
      ])} />
      <JsonLd data={getDatasetSchema({
        name: "Депозитні ставки банків України",
        description: "Порівняння депозитних ставок у банках України — гривневі та валютні вклади, різні строки.",
        url: `${SITE_URL}/analytics/deposits`,
        dateModified: new Date().toISOString().slice(0, 10),
        sourceName: "Національний банк України",
        sourceUrl: "https://bank.gov.ua/ua/statistic",
        keywords: ["депозити", "вклади", "ставки", "банки України", "НБУ"],
        temporalCoverage: "2020/..",
      })} />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Аналітика", to: "/analytics" },
          { label: "Депозити" },
        ]} />

        <header className="py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-3xl tracking-tight">Порівняння депозитів</h1>
          <p className="text-muted-foreground">Найкращі ставки депозитів та ОВДП в Україні</p>
          <p className="text-xs text-muted-foreground">Оновлено: {DEPOSIT_OFFERS.meta.lastUpdated}</p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 pb-6">
          <div className="flex gap-2">
            {TERM_OPTIONS.map(t => (
              <Button key={t.value} variant={termFilter === t.value ? "default" : "outline"} size="sm" onClick={() => setTermFilter(t.value)}>
                {t.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map(t => (
              <Button key={t.value} variant={typeFilter === t.value ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(t.value)}>
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Банк</TableHead>
                  <TableHead>Продукт</TableHead>
                  <TableHead className="text-right">Ставка</TableHead>
                  <TableHead className="text-right">Ефективна</TableHead>
                  <TableHead>Термін</TableHead>
                  <TableHead>Від</TableHead>
                  <TableHead>Особливості</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d, i) => (
                  <TableRow key={d.id} className={d.bankId.includes("ovdp") ? "bg-chart-2/5" : ""}>
                    <TableCell className="font-medium">{d.bankName}</TableCell>
                    <TableCell className="text-sm">{d.productName}</TableCell>
                    <TableCell className={cn("text-right font-mono font-semibold", i === 0 && "text-chart-2")}>{d.rateMax}%</TableCell>
                    <TableCell className="text-right font-mono text-sm">{d.effectiveRate}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.termMonths.join(', ')} міс</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.minAmountDisplay}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {d.badge && <Badge variant="secondary" className="text-[10px]">{d.badge}</Badge>}
                        {d.earlyTermination && <Badge variant="outline" className="text-[10px]">Дострокове</Badge>}
                        {d.capitalization && <Badge variant="outline" className="text-[10px]">Капіталізація</Badge>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Effective rate note */}
        <Card className="mb-6 border-warning/30 bg-warning/5">
          <CardContent className="p-5 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-semibold text-foreground">Після сплати ПДФО 18% + ВЗ 5%:</p>
              <p className="text-muted-foreground">Депозит 15% → реальна дохідність 11.6%</p>
              <p className="text-muted-foreground">ОВДП 14.2% → реальна дохідність 14.2% (звільнено від оподаткування!)</p>
            </div>
          </CardContent>
        </Card>

        {/* ROI Calculator */}
        <Card className="mb-8">
          <CardContent className="p-5 space-y-4">
            <p className="font-semibold text-foreground">Калькулятор дохідності</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Сума вкладу</label>
                <Input type="number" value={roiAmount} onChange={e => setRoiAmount(Number(e.target.value))} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Термін (міс)</label>
                <Input type="number" value={roiTerm} onChange={e => setRoiTerm(Number(e.target.value))} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Продукт</label>
                <Select value={roiProduct} onValueChange={setRoiProduct}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEPOSIT_OFFERS.offers.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.bankName} — {d.productName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Дохід (до оподаткування)</p>
                <p className="text-xl font-bold font-mono text-foreground">{roiGross.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Після податків</p>
                <p className={cn("text-xl font-bold font-mono", isOvdp ? "text-chart-2" : "text-foreground")}>
                  {roiNet.toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴
                  {isOvdp && <span className="text-sm font-normal ml-1">(ОВДП — без податку)</span>}
                </p>
              </div>
            </div>
            <Button variant="link" asChild className="p-0 h-auto text-sm">
              <Link to={CTA_CHECKOUT_URL}>Почати безкоштовно <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
