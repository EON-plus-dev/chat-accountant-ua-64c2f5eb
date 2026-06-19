import { useState, useMemo } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import {
  SALARY_BENCHMARKS,
  LABOR_CATEGORIES,
  LABOR_REGIONS,
  type SalaryBenchmark,
} from "@/portal/data/laborMarket";

const EXPERIENCE_LEVELS = [
  { value: "all", label: "Всі" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Middle" },
  { value: "senior", label: "Senior" },
] as const;

function formatSalary(amount: number, currency: string) {
  if (currency === "USD") return `$${amount.toLocaleString("uk-UA")}`;
  return `${amount.toLocaleString("uk-UA")} ₴`;
}

function TrendIndicator({ trend, percent }: { trend: SalaryBenchmark["trend"]; percent: number }) {
  if (trend === "up")
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
        <TrendingUp className="h-3.5 w-3.5" />↑{percent}% за рік
      </span>
    );
  if (trend === "down")
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-destructive">
        <TrendingDown className="h-3.5 w-3.5" />↓{Math.abs(percent)}% за рік
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />Стабільно
    </span>
  );
}

function DemandBadge({ level }: { level: SalaryBenchmark["demandLevel"] }) {
  const config = {
    high: { label: "Високий попит", dot: "bg-emerald-500" },
    medium: { label: "Середній попит", dot: "bg-amber-500" },
    low: { label: "Низький попит", dot: "bg-red-500" },
  };
  const { label, dot } = config[level];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function SalaryRangeBar({ min, median, max }: { min: number; median: number; max: number }) {
  const medianPos = ((median - min) / (max - min)) * 100;
  return (
    <div className="space-y-1">
      <div className="relative h-2 w-full rounded-full bg-secondary">
        <div
          className="absolute h-full rounded-full bg-primary/30"
          style={{ left: 0, width: "100%" }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-primary"
          style={{ left: `${medianPos}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsLaborPage() {
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");
  const [experience, setExperience] = useState("all");

  const filtered = useMemo(() => {
    return SALARY_BENCHMARKS.filter((b) => {
      if (category !== "all" && b.category !== category) return false;
      if (region !== "all" && b.region !== region) return false;
      if (experience !== "all" && b.experienceLevel !== experience) return false;
      return true;
    });
  }, [category, region, experience]);

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Зарплатні бенчмарки України 2025",
    url: `${SITE_URL}/analytics/labor`,
    dateModified: "2025-03-01",
    creator: { "@type": "Organization", name: "FINTODO" },
  };

  return (
    <PortalLayout
      meta={{
        title: "Ринок праці — зарплатні бенчмарки 2025 | FINTODO",
        description:
          "Актуальні зарплати по посадах і регіонах. Медіана, мін і макс для бухгалтерів, IT, HR, менеджерів.",
        canonical: `${SITE_URL}/analytics/labor`,
      }}
    >
      <JsonLd data={datasetSchema} />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Аналітика", url: `${SITE_URL}/analytics` },
          { name: "Ринок праці", url: `${SITE_URL}/analytics/labor` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Аналітика", to: "/analytics" },
            { label: "Ринок праці" },
          ]}
        />

        <header className="py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-3xl tracking-tight">
            Ринок праці — зарплатні бенчмарки 2025
          </h1>
          <p className="text-muted-foreground">
            Медіанні зарплати за посадами, регіонами та рівнем досвіду
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Категорія" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі категорії</SelectItem>
              {LABOR_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Регіон" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі регіони</SelectItem>
              {LABOR_REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            {EXPERIENCE_LEVELS.map((lvl) => (
              <Button
                key={lvl.value}
                size="sm"
                variant={experience === lvl.value ? "default" : "outline"}
                onClick={() => setExperience(lvl.value)}
              >
                {lvl.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {filtered.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{b.position}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.region} · {b.experienceLevel.charAt(0).toUpperCase() + b.experienceLevel.slice(1)}
                    </p>
                  </div>
                  <TrendIndicator trend={b.trend} percent={b.trendPercent} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatSalary(b.salaryMin, b.currency)}</span>
                    <span>{formatSalary(b.salaryMax, b.currency)}</span>
                  </div>
                  <SalaryRangeBar min={b.salaryMin} median={b.salaryMedian} max={b.salaryMax} />
                  <p className="text-center text-sm font-medium text-foreground">
                    Медіана: {formatSalary(b.salaryMedian, b.currency)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {b.topSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <DemandBadge level={b.demandLevel} />
                  <span className="text-muted-foreground">Джерело: {b.source}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Немає даних за обраними фільтрами
          </p>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mb-8 max-w-2xl">
          Дані агреговані з відкритих джерел (Work.ua, Djinni, Rabota.ua). Є орієнтовними і не
          замінюють індивідуальну оцінку. Оновлено: Березень 2025.
        </p>

        {/* CTA */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <p className="font-semibold text-foreground text-lg">Наймаєте бухгалтера?</p>
            <p className="text-sm text-muted-foreground">
              FINTODO рахує зарплату, ЄСВ і формує Д4 автоматично.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to={CTA_CHECKOUT_URL}>
                  Почати безкоштовно <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/tools">Порахувати вартість найму</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
