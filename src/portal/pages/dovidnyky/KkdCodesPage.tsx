import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Sparkles, Info, Users } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { toast } from "@/hooks/use-toast";
import {
  KKD_ENTRIES,
  KKD_CLASS_LABEL,
  KKD_BUDGET_LABEL,
  KKD_AS_OF,
  type KkdClass,
  type KkdBudgetLevel,
} from "@/portal/data/kkdCodes";

const CLASSES: KkdClass[] = ['tax', 'non_tax', 'capital', 'transfer', 'official'];
const LEVELS: KkdBudgetLevel[] = ['state', 'local', 'both'];

const KkdCodesPage = () => {
  const [classFilter, setClassFilter] = useState<KkdClass | "all">("all");
  const [levelFilter, setLevelFilter] = useState<KkdBudgetLevel | "all">("all");
  const [search, setSearch] = useState("");

  const classCounts = useMemo(() => {
    const c: Record<string, number> = { all: KKD_ENTRIES.length };
    KKD_ENTRIES.forEach((e) => (c[e.class] = (c[e.class] || 0) + 1));
    return c;
  }, []);
  const levelCounts = useMemo(() => {
    const c: Record<string, number> = { all: KKD_ENTRIES.length };
    KKD_ENTRIES.forEach((e) => (c[e.budgetLevel] = (c[e.budgetLevel] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return KKD_ENTRIES.filter((e) => {
      if (classFilter !== "all" && e.class !== classFilter) return false;
      if (levelFilter !== "all" && e.budgetLevel !== levelFilter) return false;
      if (!q) return true;
      return (
        e.code.includes(q) ||
        e.name.toLowerCase().includes(q) ||
        (e.fullName?.toLowerCase().includes(q) ?? false) ||
        (e.taxKey?.toLowerCase().includes(q) ?? false)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [classFilter, levelFilter, search]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: `${label}: ${text}` });
  };

  const sidebar = (
    <>
      <FilterSection title="Клас доходів">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі класи", count: classCounts.all },
            ...CLASSES.map((c) => ({
              value: c,
              label: KKD_CLASS_LABEL[c],
              count: classCounts[c] || 0,
            })).filter((o) => o.count > 0),
          ]}
          value={classFilter}
          onChange={(v) => setClassFilter(v as KkdClass | "all")}
        />
      </FilterSection>
      <FilterSection title="Рівень бюджету">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі рівні", count: levelCounts.all },
            ...LEVELS.map((l) => ({
              value: l,
              label: KKD_BUDGET_LABEL[l],
              count: levelCounts[l] || 0,
            })).filter((o) => o.count > 0),
          ]}
          value={levelFilter}
          onChange={(v) => setLevelFilter(v as KkdBudgetLevel | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "ККД — коди класифікації доходів бюджету для платіжок | FINTODO",
        description: `Коди класифікації доходів бюджету (ККД) для сплати ПДФО, ВЗ, ЄП, ПДВ, ЄСВ, прибутку. ${KKD_ENTRIES.length} кодів за Наказом Мінфіну № 11. Для платіжних доручень разом з IBAN Казначейства.`,
        canonical: `${SITE_URL}/dovidnyky/kkd`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "ККД — коди доходів бюджету", url: `${SITE_URL}/dovidnyky/kkd` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "ККД" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              ККД — класифікація доходів бюджету
            </h1>
            <p className="text-muted-foreground">
              8-значні коди для платіжного доручення на сплату податків і зборів.
              Вказуються разом з IBAN бюджетного рахунку у полі «Призначення платежу».
              За Наказом Мінфіну № 11. Snapshot {KKD_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: код, ПДФО, ЄСВ, ВЗ..."
            resultCount={filtered.length}
            resultLabel="кодів"
            activeFilterCount={(classFilter !== "all" ? 1 : 0) + (levelFilter !== "all" ? 1 : 0)}
            onResetFilters={() => {
              setClassFilter("all");
              setLevelFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((e) => (
                <Card key={e.code} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="default" className="text-sm font-mono font-bold tabular-nums">
                          {e.code}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {KKD_CLASS_LABEL[e.class]}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {KKD_BUDGET_LABEL[e.budgetLevel]}
                        </Badge>
                        {e.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Часто
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{e.name}</h3>
                      {e.fullName && (
                        <p className="text-[11px] text-muted-foreground italic mt-1">
                          {e.fullName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1">
                    <div className="flex items-start gap-1.5">
                      <Users className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Хто сплачує: </span>
                        <span className="text-foreground">{e.payers.join('; ')}</span>
                      </div>
                    </div>
                  </div>

                  {e.note && (
                    <p className="text-[11px] text-muted-foreground italic mb-2 flex items-start gap-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{e.note}</span>
                    </p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] w-full"
                    onClick={() => copy(e.code, 'Код ККД')}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Копіювати код {e.code}
                  </Button>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
              <p className="text-foreground font-semibold">Як заповнити платіжку?</p>
              <ol className="space-y-1 ml-4 list-decimal">
                <li>Знайдіть код ККД для свого податку (наприклад, 18050300 — ЄП ФОП).</li>
                <li>Візьміть IBAN Казначейства за регіоном з розділу «Бюджетні рахунки».</li>
                <li>У полі «Призначення платежу» — стандартний формат:
                  <code className="block bg-muted px-2 py-1 rounded mt-1 text-[10px] break-all">
                    *;101;XXXXXXXX;Єдиний податок за травень 2026;;;
                  </code>
                  де XXXXXXXX — ваш ЄДРПОУ/ІПН.
                </li>
                <li>Сума, валюта UAH, отримувач — ГУ ДКС у вашій області.</li>
              </ol>
              <p className="pt-2 border-t border-border/60">
                Помилка в коді ККД = платіж зависає в нерозʼясненому надходженні. Перевіряйте код перед відправкою.
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="kkd" />
    </PortalLayout>
  );
};

export default KkdCodesPage;
