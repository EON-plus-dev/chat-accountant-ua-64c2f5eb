import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Copy, Sparkles, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { toast } from "@/hooks/use-toast";
import {
  CURRENCIES,
  CURRENCY_GROUP_LABEL,
  NBU_CLASS_LABEL,
  CURRENCIES_AS_OF,
  type CurrencyGroup,
} from "@/portal/data/currencies";

const GROUPS: CurrencyGroup[] = ['g10', 'eu', 'asia', 'mena', 'americas', 'cis', 'metals', 'crypto'];

const CurrenciesPage = () => {
  const [groupFilter, setGroupFilter] = useState<CurrencyGroup | "all">("all");
  const [classFilter, setClassFilter] = useState<'1' | '2' | '3' | "all">("all");
  const [search, setSearch] = useState("");

  const groupCounts = useMemo(() => {
    const c: Record<string, number> = { all: CURRENCIES.length };
    CURRENCIES.forEach((cu) => (c[cu.group] = (c[cu.group] || 0) + 1));
    return c;
  }, []);
  const classCounts = useMemo(() => ({
    all: CURRENCIES.length,
    '1': CURRENCIES.filter((c) => c.nbuClass === '1').length,
    '2': CURRENCIES.filter((c) => c.nbuClass === '2').length,
    '3': CURRENCIES.filter((c) => c.nbuClass === '3').length,
  }), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CURRENCIES.filter((c) => {
      if (groupFilter !== "all" && c.group !== groupFilter) return false;
      if (classFilter !== "all" && c.nbuClass !== classFilter) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.numeric.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [groupFilter, classFilter, search]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: `${label}: ${text}` });
  };

  const sidebar = (
    <>
      <FilterSection title="Група">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: groupCounts.all },
            ...GROUPS.map((g) => ({
              value: g,
              label: CURRENCY_GROUP_LABEL[g],
              count: groupCounts[g] || 0,
            })),
          ]}
          value={groupFilter}
          onChange={(v) => setGroupFilter(v as CurrencyGroup | "all")}
        />
      </FilterSection>
      <FilterSection title="Класифікатор НБУ">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: classCounts.all },
            { value: "1", label: "Група 1 — вільноконв.", count: classCounts['1'] },
            { value: "2", label: "Група 2", count: classCounts['2'] },
            { value: "3", label: "Група 3 — неконв.", count: classCounts['3'] },
          ]}
          value={classFilter}
          onChange={(v) => setClassFilter(v as '1' | '2' | '3' | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Коди валют ISO 4217 — довідник для ЗЕД і бухобліку | FINTODO",
        description: `Літерні та цифрові коди валют ISO 4217: USD, EUR, PLN, GBP, CNY, AED, ${CURRENCIES.length}+ позицій. Класифікатор НБУ, мінорні одиниці, символи. Для контрактів ЗЕД, інвойсів, SWIFT.`,
        canonical: `${SITE_URL}/dovidnyky/valyuty`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Валюти ISO 4217", url: `${SITE_URL}/dovidnyky/valyuty` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Валюти ISO 4217" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              Коди валют ISO 4217
            </h1>
            <p className="text-muted-foreground">
              Літерні (3 літери) і цифрові (3 цифри) коди валют для ЗЕД-контрактів, інвойсів,
              SWIFT MT103 і обліку курсових різниць за П(С)БО 21. Прив\'язка до Класифікатора
              іноземних валют НБУ. Snapshot {CURRENCIES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: USD, 840, євро, юань..."
            resultCount={filtered.length}
            resultLabel="валют"
            activeFilterCount={(groupFilter !== "all" ? 1 : 0) + (classFilter !== "all" ? 1 : 0)}
            onResetFilters={() => {
              setGroupFilter("all");
              setClassFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((c) => (
                <Card key={c.code} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="default" className="text-sm font-bold tabular-nums">
                          {c.code}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono tabular-nums">
                          {c.numeric}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {CURRENCY_GROUP_LABEL[c.group]}
                        </Badge>
                        {c.nbuClass && (
                          <Badge variant="outline" className="text-[10px]">
                            НБУ гр. {c.nbuClass}
                          </Badge>
                        )}
                        {c.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ ЗЕД
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        <span className="mr-1">{c.flag}</span>
                        {c.name}
                        <span className="text-muted-foreground font-normal"> — {c.nameEn}</span>
                      </h3>
                      <p className="text-[11px] text-muted-foreground">{c.country}</p>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] grid grid-cols-2 gap-x-3 gap-y-1">
                    <div>
                      <span className="text-muted-foreground">Символ: </span>
                      <span className="font-semibold text-foreground">{c.symbol}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Знаків після коми: </span>
                      <span className="font-mono text-foreground">{c.minorUnits}</span>
                    </div>
                    {c.nbuClass && (
                      <div className="col-span-2 text-muted-foreground italic">
                        {NBU_CLASS_LABEL[c.nbuClass]}
                      </div>
                    )}
                  </div>

                  {c.note && (
                    <p className="text-[11px] text-muted-foreground italic mb-2 flex items-start gap-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{c.note}</span>
                    </p>
                  )}

                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] flex-1"
                      onClick={() => copy(c.code, 'Літерний код')}
                    >
                      <Copy className="h-3 w-3 mr-1" /> {c.code}
                    </Button>
                    {c.numeric !== '—' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] flex-1"
                        onClick={() => copy(c.numeric, 'Цифровий код')}
                      >
                        <Copy className="h-3 w-3 mr-1" /> {c.numeric}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
              <p className="text-foreground font-semibold">Де використовувати коди ISO 4217?</p>
              <ul className="space-y-1 ml-3 list-disc">
                <li><span className="text-foreground">ЗЕД-контракти</span> — обовʼязкове зазначення валюти ціни і платежу (Закон № 959-XII).</li>
                <li><span className="text-foreground">SWIFT MT103</span> — поле 32A (Value Date/Currency/Amount) — лише 3-літерний код.</li>
                <li><span className="text-foreground">Бухоблік</span> — субрахунки 312, 314 за валютами; курсові різниці за П(С)БО 21.</li>
                <li><span className="text-foreground">Декларація ЄП</span> — інвалютний дохід перераховується за курсом НБУ на дату надходження.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="valyuty" />
    </PortalLayout>
  );
};

export default CurrenciesPage;
