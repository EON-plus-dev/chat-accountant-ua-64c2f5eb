import { useState } from "react";
import { Search, CheckCircle, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

interface DemoResult {
  code: string;
  name: string;
  status: "active" | "inactive";
  registeredDate: string;
  director: string;
  address: string;
  mainKved: string;
  taxStatus: string;
  taxDebts: boolean;
  courtCases: number;
  isInStopList: boolean;
  overallRisk: "low" | "medium" | "high";
}

const makeDemoResult = (input: string): DemoResult => ({
  code: /^\d{8}$/.test(input.trim()) ? input.trim() : "12345678",
  name: 'ТОВ "ДЕМО ПАРТНЕР"',
  status: "active",
  registeredDate: "15.03.2019",
  director: "Петренко Іван Васильович",
  address: "м. Київ, вул. Хрещатик, 1",
  mainKved: "62.01 — Комп'ютерне програмування",
  taxStatus: "Платник ПДВ",
  taxDebts: false,
  courtCases: 0,
  isInStopList: false,
  overallRisk: "low",
});

const CHECKLIST = [
  "Запросіть оригінал витягу з ЄДР у контрагента",
  "Перевірте директора в реєстрі дискваліфікованих осіб",
  "Переконайтесь що КВЕД відповідає предмету договору",
  "Перевірте чи компанія не перебуває у процесі ліквідації",
];

export const CounterpartyCheck = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);

  const isValid = /^\d{8}$/.test(input.trim()) || input.trim().length >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(makeDemoResult(input));
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ЄДРПОУ або назва компанії..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={!isValid || loading}>
          {loading ? "Перевірка..." : "Перевірити →"}
        </Button>
      </form>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          {/* Status header */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="font-semibold text-foreground text-lg">Компанія активна</p>
                  <p className="text-xs text-muted-foreground">ЄДРПОУ: {result.code} · Зареєстровано: {result.registeredDate}</p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid gap-3 text-sm">
                {[
                  ["Назва", result.name],
                  ["Директор", result.director],
                  ["Адреса", result.address],
                  ["Основний КВЕД", result.mainKved],
                  ["Статус платника", result.taxStatus],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { ok: !result.taxDebts, label: "Немає боргів ДПС", bad: "Є борги ДПС" },
              { ok: result.courtCases === 0, label: "0 судових справ", bad: `${result.courtCases} судових справ` },
              { ok: !result.isInStopList, label: "Не в стоп-листі", bad: "В стоп-листі" },
            ].map((indicator, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-3">
                  {indicator.ok ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                  <span className={cn("text-sm font-medium", indicator.ok ? "text-emerald-700 dark:text-emerald-400" : "text-destructive")}>
                    {indicator.ok ? `✓ ${indicator.label}` : indicator.bad}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Risk verdict */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Низький ризик — контрагент виглядає надійним</AlertTitle>
            <AlertDescription>
              Рекомендуємо також перевірити договір перед підписанням.
            </AlertDescription>
          </Alert>

          {/* API disclaimer */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Демо-режим</AlertTitle>
            <AlertDescription>
              Для реальної перевірки за ЄДРПОУ підключіться до офіційного API або використайте повну версію FINTODO.{" "}
              <Link to={CTA_CHECKOUT_URL} className="text-primary hover:underline font-medium">
                Почати безкоштовно →
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Checklist — always visible */}
      <Card>
        <CardContent className="p-5">
          <p className="font-semibold text-foreground mb-3">Що ще перевірити перед підписанням договору:</p>
          <ul className="space-y-2">
            {CHECKLIST.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 text-primary">•</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/articles/perevirka-kontrahenta"
            className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline font-medium"
          >
            Читати повний гайд <ExternalLink className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
