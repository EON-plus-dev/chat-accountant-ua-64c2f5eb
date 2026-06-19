import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship, Plane, Sparkles, Truck, ShieldCheck, FileCheck, AlertTriangle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  INCOTERMS_2020,
  INCOTERM_GROUP_LABEL,
  INCOTERMS_2020_AS_OF,
  type IncotermGroup,
  type IncotermMode,
} from "@/portal/data/incoterms";

const GROUPS: IncotermGroup[] = ["E", "F", "C", "D"];

const partyLabel = (p: 'seller' | 'buyer' | 'none_required' | 'na') => {
  if (p === 'seller') return { text: 'Продавець', cls: 'text-emerald-600' };
  if (p === 'buyer') return { text: 'Покупець', cls: 'text-amber-600' };
  if (p === 'none_required') return { text: 'Не обовʼязково', cls: 'text-muted-foreground' };
  return { text: '—', cls: 'text-muted-foreground' };
};

const IncotermsPage = () => {
  const [groupFilter, setGroupFilter] = useState<IncotermGroup | "all">("all");
  const [modeFilter, setModeFilter] = useState<IncotermMode | "all">("all");
  const [search, setSearch] = useState("");

  const groupCounts = useMemo(() => {
    const c: Record<string, number> = { all: INCOTERMS_2020.length };
    INCOTERMS_2020.forEach((i) => (c[i.group] = (c[i.group] || 0) + 1));
    return c;
  }, []);
  const modeCounts = useMemo(() => ({
    all: INCOTERMS_2020.length,
    any: INCOTERMS_2020.filter((i) => i.mode === 'any').length,
    sea: INCOTERMS_2020.filter((i) => i.mode === 'sea').length,
  }), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return INCOTERMS_2020.filter((i) => {
      if (groupFilter !== "all" && i.group !== groupFilter) return false;
      if (modeFilter !== "all" && i.mode !== modeFilter) return false;
      if (!q) return true;
      return (
        i.code.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.nameEn.toLowerCase().includes(q) ||
        i.shortDescription.toLowerCase().includes(q)
      );
    });
  }, [groupFilter, modeFilter, search]);

  const sidebar = (
    <>
      <FilterSection title="Група">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі групи", count: groupCounts.all },
            ...GROUPS.map((g) => ({
              value: g,
              label: INCOTERM_GROUP_LABEL[g],
              count: groupCounts[g] || 0,
            })),
          ]}
          value={groupFilter}
          onChange={(v) => setGroupFilter(v as IncotermGroup | "all")}
        />
      </FilterSection>
      <FilterSection title="Транспорт">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі види", count: modeCounts.all },
            { value: "any", label: "Будь-який", count: modeCounts.any },
            { value: "sea", label: "Тільки морський", count: modeCounts.sea },
          ]}
          value={modeFilter}
          onChange={(v) => setModeFilter(v as IncotermMode | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Incoterms 2020 — 11 термінів ICC для контрактів | FINTODO",
        description: `Incoterms 2020: EXW, FCA, FAS, FOB, CPT, CIP, CFR, CIF, DAP, DPU, DDP. Розподіл відповідальності між продавцем і покупцем за перевезення, страхування, митні платежі. ${INCOTERMS_2020.length} термінів.`,
        canonical: `${SITE_URL}/dovidnyky/incoterms`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Incoterms 2020", url: `${SITE_URL}/dovidnyky/incoterms` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Incoterms 2020" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Ship className="h-6 w-6 text-primary" />
              Incoterms 2020
            </h1>
            <p className="text-muted-foreground">
              11 стандартних термінів ICC для ЗЕД-контрактів: хто оплачує перевезення і страхування,
              хто оформлює експорт/імпорт, де переходить ризик. Чинні з 01.01.2020.
              Snapshot {INCOTERMS_2020_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: EXW, FCA, DDP, фрахт..."
            resultCount={filtered.length}
            resultLabel="термінів"
            activeFilterCount={(groupFilter !== "all" ? 1 : 0) + (modeFilter !== "all" ? 1 : 0)}
            onResetFilters={() => {
              setGroupFilter("all");
              setModeFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((i) => {
                const carriage = partyLabel(i.split.carriageMain);
                const insurance = partyLabel(i.split.insurance);
                const exp = partyLabel(i.split.exportClearance);
                const imp = partyLabel(i.split.importClearance);
                const unload = partyLabel(i.split.unloadingAtDestination);
                return (
                  <Card key={i.id} className="p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="default" className="text-sm font-bold tabular-nums">
                            {i.code}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {INCOTERM_GROUP_LABEL[i.group]}
                          </Badge>
                          {i.mode === 'sea' ? (
                            <Badge variant="secondary" className="text-[10px] gap-1">
                              <Ship className="h-3 w-3" /> Морський
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] gap-1">
                              <Truck className="h-3 w-3" />
                              <Plane className="h-3 w-3" /> Будь-який
                            </Badge>
                          )}
                          {i.newIn2020 && (
                            <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                              <Sparkles className="h-3 w-3" /> Зміна 2020
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {i.name} <span className="text-muted-foreground font-normal">— {i.nameEn}</span>
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 mb-2">{i.shortDescription}</p>

                    <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        <div><span className="text-muted-foreground">Перевезення:</span> <span className={carriage.cls + ' font-medium'}>{carriage.text}</span></div>
                        <div><span className="text-muted-foreground">Страхування:</span> <span className={insurance.cls + ' font-medium'}>{insurance.text}</span></div>
                        <div><span className="text-muted-foreground">Експорт:</span> <span className={exp.cls + ' font-medium'}>{exp.text}</span></div>
                        <div><span className="text-muted-foreground">Імпорт:</span> <span className={imp.cls + ' font-medium'}>{imp.text}</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground">Розвантаження в пункті призначення:</span> <span className={unload.cls + ' font-medium'}>{unload.text}</span></div>
                      </div>
                      <div className="pt-1 mt-1 border-t border-border/60 flex items-start gap-1.5">
                        <ShieldCheck className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          <span className="text-foreground">Перехід ризику:</span> {i.split.riskTransferPoint}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] space-y-1">
                      <div className="flex items-start gap-1.5">
                        <FileCheck className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          <span className="text-foreground">Підходить для:</span> {i.bestFor.join(', ')}
                        </span>
                      </div>
                      {i.notes?.map((n, k) => (
                        <div key={k} className="flex items-start gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground italic">{n}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-1">
              <p className="text-foreground font-semibold">Як правильно вказати в контракті?</p>
              <p>
                <code className="bg-muted px-1.5 py-0.5 rounded">«CIP Київ, склад покупця, Incoterms 2020»</code>.
                Завжди вказуйте версію (2020) і конкретне географічне місце з адресою.
              </p>
              <p>
                Для української ЗЕД-практики найбезпечніший вибір для експортера-початківця — <strong>FCA</strong>{' '}
                (продавець оформлює МД експорту, але не несе ризику доставки).
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="incoterms" />
    </PortalLayout>
  );
};

export default IncotermsPage;
