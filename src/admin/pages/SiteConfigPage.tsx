import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  MINIMUM_WAGE, SUBSISTENCE_MINIMUM, CURRENT_TAX_YEAR,
  TAX_RATES, FOP_INCOME_LIMITS, FOP_LIMIT_MULTIPLIERS,
  ESV_MONTHLY, ESV_QUARTERLY, ESV_YEARLY, EP_FIXED,
  MINIMUM_WAGE_HISTORY,
} from "@/config/taxConstantsConfig";
import { Settings, Calculator, Calendar, TrendingUp, Info, History, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

function fmt(v: number): string {
  return v.toLocaleString("uk-UA");
}

function pct(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}

export default function SiteConfigPage() {
  const [openHistory, setOpenHistory] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Конфігурація порталу</h1>
        <p className="text-muted-foreground">
          Податкові ставки та константи ({CURRENT_TAX_YEAR} рік) — read-only перегляд
        </p>
      </div>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Константи визначені у коді
              </p>
              <p className="text-muted-foreground mt-1">
                Для зміни податкових ставок відредагуйте файл{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  src/config/taxConstantsConfig.ts
                </code>
                . Зміни застосуються автоматично до всіх калькуляторів і сторінок.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Base Constants */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Базові показники
            </CardTitle>
            <CardDescription>Мінімальна зарплата та прожитковий мінімум</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfigRow label="Податковий рік" value={String(CURRENT_TAX_YEAR)} />
            <ConfigRow label="МЗП (мінімальна зарплата)" value={`${fmt(MINIMUM_WAGE)} ₴`} highlight />
            <ConfigRow label="Прожитковий мінімум" value={`${fmt(SUBSISTENCE_MINIMUM)} ₴`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              ЄСВ (соціальний внесок)
            </CardTitle>
            <CardDescription>Розраховано на основі МЗП × {pct(TAX_RATES.esv)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfigRow label="Ставка ЄСВ" value={pct(TAX_RATES.esv)} />
            <ConfigRow label="Місячний ЄСВ" value={`${fmt(ESV_MONTHLY)} ₴`} highlight />
            <ConfigRow label="Квартальний ЄСВ" value={`${fmt(ESV_QUARTERLY)} ₴`} />
            <ConfigRow label="Річний ЄСВ" value={`${fmt(ESV_YEARLY)} ₴`} />
          </CardContent>
        </Card>
      </div>

      {/* Tax Rates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Ставки податків
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <RateCard title="ЄП Група 1" rate={pct(TAX_RATES.epGroup1)} base={`${fmt(SUBSISTENCE_MINIMUM)} ₴ (ПМ)`} result={`${fmt(EP_FIXED.group1)} ₴/міс`} />
            <RateCard title="ЄП Група 2" rate={pct(TAX_RATES.epGroup2)} base={`${fmt(MINIMUM_WAGE)} ₴ (МЗП)`} result={`${fmt(EP_FIXED.group2)} ₴/міс`} />
            <RateCard title="ЄП Група 3 (без ПДВ)" rate={pct(TAX_RATES.epGroup3_withoutVat)} base="від доходу" />
            <RateCard title="ЄП Група 3 (з ПДВ)" rate={pct(TAX_RATES.epGroup3_withVat)} base="від доходу" />
            <RateCard title="ПДФО" rate={pct(TAX_RATES.personalIncomeTax)} base="від доходу" />
            <RateCard title="Військовий збір" rate={pct(TAX_RATES.militaryTax)} base="від доходу" />
            <RateCard title="ПДВ" rate={pct(TAX_RATES.vat)} base="від вартості" />
          </div>
        </CardContent>
      </Card>

      {/* Income Limits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Ліміти доходу ФОП
          </CardTitle>
          <CardDescription>Розраховані як множник × МЗП ({fmt(MINIMUM_WAGE)} ₴)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {([1, 2, 3] as const).map((g) => (
              <div key={g} className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">Група {g}</p>
                <p className="text-xl font-bold mt-1">{fmt(FOP_INCOME_LIMITS[g])} ₴</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {FOP_LIMIT_MULTIPLIERS[`group${g}` as keyof typeof FOP_LIMIT_MULTIPLIERS]} × МЗП
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MZP History */}
      <Collapsible open={openHistory} onOpenChange={setOpenHistory}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Історія змін МЗП
                <Badge variant="outline" className="ml-auto">{MINIMUM_WAGE_HISTORY.length} періодів</Badge>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-2">
                {MINIMUM_WAGE_HISTORY.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div>
                      <p className="text-sm font-medium">{p.note}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.startDate} — {p.endDate || "зараз"}
                      </p>
                    </div>
                    <Badge variant={i === 0 ? "default" : "secondary"}>
                      {fmt(p.minimumWage)} ₴
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

function ConfigRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${highlight ? "font-bold text-foreground" : "text-foreground/80"}`}>
        {value}
      </span>
    </div>
  );
}

function RateCard({ title, rate, base, result }: { title: string; rate: string; base: string; result?: string }) {
  return (
    <div className="p-4 rounded-lg border bg-muted/30 space-y-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-primary">{rate}</p>
      <p className="text-xs text-muted-foreground">{base}</p>
      {result && <p className="text-sm font-semibold mt-1">{result}</p>}
    </div>
  );
}
