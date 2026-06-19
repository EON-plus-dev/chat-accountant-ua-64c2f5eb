import { useState } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldAlert, ShieldCheck, Search, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { supabase } from "@/integrations/supabase/client";
import { SANCTIONS_SOURCES, SANCTIONS_AS_OF } from "@/portal/data/sanctionsSources";

type CheckType = "name" | "edrpou" | "ipn" | "passport";

interface Match {
  source: string;
  sourceLabel: string;
  name: string;
  type: string;
  matchScore: number;
  addedAt?: string;
  reason?: string;
  identifiers?: string[];
  sourceUrl: string;
}

interface CheckResult {
  query: string;
  type: CheckType;
  asOf: string;
  sourcesChecked: string[];
  sourceErrors: Record<string, string>;
  totalMatches: number;
  matches: Match[];
}

const SanctionsPage = () => {
  const [type, setType] = useState<CheckType>("name");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheck = async () => {
    if (query.trim().length < 3) {
      setError("Введіть мінімум 3 символи");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("sanctions-check", {
        body: { query: query.trim(), type },
      });
      if (fnError) throw fnError;
      setResult(data as CheckResult);
    } catch (e) {
      setError((e as Error).message || "Помилка перевірки. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout
      meta={{
        title: `Перевірка санкцій — РНБО, OFAC, EU, UK | FINTODO`,
        description: `Швидка перевірка контрагента в санкційних реєстрах: РНБО (НАЗК), OFAC SDN, EU CFSP, UK OFSI. Пошук за назвою, ЄДРПОУ, ІПН, паспортом. KYC за ЗУ № 361-IX.`,
        canonical: `${SITE_URL}/dovidnyky/sanctions`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Санкції", url: `${SITE_URL}/dovidnyky/sanctions` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Санкції" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Перевірка санкцій — РНБО, OFAC, EU, UK
            </h1>
            <p className="text-muted-foreground">
              Перевірка контрагента (фізособи або юрособи) у 4 ключових санкційних реєстрах. Дані з
              офіційних публічних джерел, кеш 24 год. KYC — ст. 17 ЗУ № 361-IX «Про запобігання
              легалізації». Snapshot {SANCTIONS_AS_OF}.
            </p>
          </header>

          {/* Search form */}
          <Card className="p-4 sm:p-6 space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Тип запиту</Label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as CheckType)}
                className="flex flex-wrap gap-3"
              >
                {[
                  { v: "name", l: "Назва / ПІБ" },
                  { v: "edrpou", l: "ЄДРПОУ" },
                  { v: "ipn", l: "ІПН" },
                  { v: "passport", l: "Паспорт" },
                ].map((o) => (
                  <div key={o.v} className="flex items-center gap-2">
                    <RadioGroupItem value={o.v} id={`s-${o.v}`} />
                    <Label htmlFor={`s-${o.v}`} className="text-sm cursor-pointer">{o.l}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                placeholder={
                  type === "name"
                    ? 'Напр., "Іванов Іван Іванович" або "ТОВ Альфа"'
                    : type === "edrpou"
                    ? "8-значний код ЄДРПОУ"
                    : type === "ipn"
                    ? "10-значний ІПН"
                    : "Серія і номер паспорта"
                }
                className="flex-1"
              />
              <Button onClick={handleCheck} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Перевірити
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </Card>

          {/* Result */}
          {result && (
            <Card className="p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                {result.totalMatches > 0 ? (
                  <ShieldAlert className="h-8 w-8 text-destructive shrink-0" />
                ) : (
                  <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-500 shrink-0" />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {result.totalMatches > 0
                      ? `Знайдено ${result.totalMatches} ${result.totalMatches === 1 ? "збіг" : "збіги"}`
                      : "Збігів не знайдено"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Запит: «{result.query}» · Перевірено: {result.sourcesChecked.length} джерел ·{" "}
                    {new Date(result.asOf).toLocaleString("uk-UA")}
                  </p>
                </div>
              </div>

              {result.matches.length > 0 && (
                <div className="space-y-2">
                  {result.matches.map((m, i) => (
                    <div
                      key={i}
                      className="border border-destructive/30 bg-destructive/5 rounded-md p-3 space-y-1.5"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="destructive" className="text-[10px]">{m.sourceLabel}</Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {m.type === "person" ? "Фізособа" : m.type === "entity" ? "Юрособа" : "Невідомо"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Збіг {Math.round(m.matchScore * 100)}%
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold text-foreground">{m.name}</div>
                      {m.reason && <div className="text-xs text-muted-foreground">{m.reason}</div>}
                      {m.identifiers && m.identifiers.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          ID: {m.identifiers.join(", ")}
                        </div>
                      )}
                      <a
                        href={m.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Офіційне джерело <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {Object.keys(result.sourceErrors).length > 0 && (
                <div className="text-xs text-muted-foreground italic">
                  Деякі джерела тимчасово недоступні:{" "}
                  {Object.entries(result.sourceErrors)
                    .map(([k, v]) => `${k} (${v})`)
                    .join(", ")}
                  . Спробуйте перевірку напряму на офіційному сайті.
                </div>
              )}
            </Card>
          )}

          {/* Sources catalog */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Джерела санкційних даних</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {SANCTIONS_SOURCES.map((s) => (
                <Card key={s.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="text-[10px] bg-primary/15 text-primary border border-primary/30">
                      {s.shortLabel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{s.jurisdiction}</span>
                  </div>
                  <h3 className="text-sm font-semibold">{s.fullLabel}</h3>
                  <p className="text-[12px] text-foreground/90">{s.description}</p>
                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <div><span className="text-foreground">Орган: </span>{s.authority}</div>
                    <div><span className="text-foreground">Оновлення: </span>{s.updateFrequency}</div>
                    <div><span className="text-foreground">Правова основа: </span>{s.legalBasis}</div>
                  </div>
                  <div className="flex gap-3 pt-1 text-xs">
                    <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      Сайт <ExternalLink className="h-3 w-3" />
                    </a>
                    <a href={s.searchUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      Офіційний пошук <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-1.5">
            <p className="text-foreground font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Важливо
            </p>
            <ul className="space-y-1 ml-3 list-disc">
              <li>FINTODO — не є офіційним джерелом. Завжди звіряйте критичні знахідки на сайтах органів.</li>
              <li>Fuzzy-match за іменем може давати помилкові збіги для популярних ПІБ — перевіряйте додатково ЄДРПОУ/ІПН.</li>
              <li>Перевірка обов'язкова при укладанні договорів &gt; 400 000 ₴ (ст. 17 ЗУ № 361-IX «Про запобігання легалізації»).</li>
              <li>Відсутність збігів НЕ гарантує відсутність ризиків — використовуйте додаткові due-diligence процедури.</li>
            </ul>
          </div>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="sanctions" />
    </PortalLayout>
  );
};

export default SanctionsPage;
