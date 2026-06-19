import { useState, useMemo } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  MORTGAGE_PROGRAMS,
  calcMonthlyPayment,
  type MortgageProgram,
} from "@/portal/data/mortgageRates";

function formatUAH(n: number) {
  return n.toLocaleString("uk-UA") + " ₴";
}

function ProgramCard({ program }: { program: MortgageProgram }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-foreground">{program.name}</p>
            <p className="text-xs text-muted-foreground">{program.bank}</p>
          </div>
          <div className="flex gap-1.5">
            {program.badge && (
              <Badge variant="default" className="text-xs whitespace-nowrap">
                {program.badge}
              </Badge>
            )}
            {program.isOpen ? (
              <Badge variant="secondary" className="text-xs">Відкрита</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Закрита</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-primary">{program.rateDisplay}</p>
            <p className="text-xs text-muted-foreground">Ставка</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">від {program.minDownPayment}%</p>
            <p className="text-xs text-muted-foreground">Перший внесок</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">до {program.maxTermYears} р.</p>
            <p className="text-xs text-muted-foreground">Термін</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Для кого:</p>
          <div className="flex flex-wrap gap-1">
            {program.targetAudience.map((a) => (
              <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Вимоги:</p>
          <ul className="space-y-1">
            {program.requirements.map((r) => (
              <li key={r} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {program.note && (
          <p className="text-xs text-muted-foreground italic">{program.note}</p>
        )}

        <Button size="sm" variant="outline" asChild className="w-full">
          <a href={program.applyUrl} target="_blank" rel="noopener noreferrer">
            Подати заявку <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function MortgageCalculator() {
  const [propertyValue, setPropertyValue] = useState(2000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [termYears, setTermYears] = useState(20);
  const [ratePercent, setRatePercent] = useState(7);

  const result = useMemo(
    () => calcMonthlyPayment({ propertyValue, downPaymentPercent, termYears, ratePercent }),
    [propertyValue, downPaymentPercent, termYears, ratePercent]
  );

  const termOptions = [10, 15, 20];
  const ratePresets = [
    { label: "єОселя 3%", value: 3 },
    { label: "єОселя 7%", value: 7 },
    { label: "Ринкова ~16%", value: 16 },
  ];

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <p className="font-semibold text-foreground text-lg">Калькулятор іпотеки</p>

        {/* Property Value */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Вартість нерухомості</span>
            <span className="font-medium text-foreground">{formatUAH(propertyValue)}</span>
          </div>
          <Slider
            value={[propertyValue]}
            onValueChange={([v]) => setPropertyValue(v)}
            min={500000}
            max={10000000}
            step={100000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>500 000 ₴</span>
            <span>10 000 000 ₴</span>
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Перший внесок</span>
            <span className="font-medium text-foreground">
              {downPaymentPercent}% ({formatUAH(Math.round(propertyValue * downPaymentPercent / 100))})
            </span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={([v]) => setDownPaymentPercent(v)}
            min={10}
            max={50}
            step={5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Term */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Термін кредиту</p>
          <div className="flex gap-2">
            {termOptions.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={termYears === t ? "default" : "outline"}
                onClick={() => setTermYears(t)}
              >
                {t} років
              </Button>
            ))}
          </div>
        </div>

        {/* Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ставка</span>
            <span className="font-medium text-foreground">{ratePercent}% річних</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {ratePresets.map((p) => (
              <Button
                key={p.value}
                size="sm"
                variant={ratePercent === p.value ? "default" : "outline"}
                onClick={() => setRatePercent(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div className="col-span-2 text-center">
            <p className="text-sm text-muted-foreground">Щомісячний платіж</p>
            <p className="text-3xl font-bold text-primary">{formatUAH(result.monthlyPayment)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Сума кредиту</p>
            <p className="text-lg font-semibold text-foreground">{formatUAH(result.loanAmount)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Переплата</p>
            <p className="text-lg font-semibold text-foreground">{formatUAH(result.totalInterest)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsMortgagePage() {
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    if (tab === "state") return MORTGAGE_PROGRAMS.filter((p) => p.type === "state");
    if (tab === "commercial") return MORTGAGE_PROGRAMS.filter((p) => p.type === "commercial");
    return MORTGAGE_PROGRAMS;
  }, [tab]);

  return (
    <PortalLayout
      meta={{
        title: "Іпотека 2025 — єОселя і ставки банків | FINTODO",
        description:
          "Порівняння іпотечних програм: єОселя 3%, 7% і комерційні банки. Калькулятор щомісячного платежу.",
        canonical: `${SITE_URL}/analytics/mortgage`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Аналітика", url: `${SITE_URL}/analytics` },
          { name: "Іпотека", url: `${SITE_URL}/analytics/mortgage` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Аналітика", to: "/analytics" },
            { label: "Іпотека" },
          ]}
        />

        <header className="py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-3xl tracking-tight">
            Іпотека в Україні 2026 — програми і ставки
          </h1>
          <p className="text-muted-foreground">
            єОселя та ринкові ставки — порівняння іпотечних програм
          </p>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Всі програми</TabsTrigger>
            <TabsTrigger value="state">Державні (єОселя)</TabsTrigger>
            <TabsTrigger value="commercial">Комерційні</TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {filtered.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Calculator */}
        <div className="mb-8">
          <MortgageCalculator />
        </div>

        {/* CTA */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <p className="font-semibold text-foreground text-lg">
              Відсотки по іпотеці зменшують ваш ПДФО
            </p>
            <p className="text-sm text-muted-foreground">
              FINTODO допоможе правильно задекларувати податкову знижку за іпотечними відсотками.
            </p>
            <Button asChild>
              <Link to="/taxes">
                Дізнатись як <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
