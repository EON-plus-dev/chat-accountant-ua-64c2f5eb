import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Copy, Globe, AlertTriangle, ExternalLink, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { toast } from "@/hooks/use-toast";
import {
  BANKS_MFO,
  BANK_STATUS_LABEL,
  BANK_TYPE_LABEL,
  BANKS_MFO_AS_OF,
  type BankStatus,
  type BankType,
} from "@/portal/data/banksMfo";

const STATUSES: BankStatus[] = ['active', 'liquidating', 'liquidated'];
const TYPES: BankType[] = ['state', 'commercial', 'foreign_subsidiary', 'cooperative'];

const BanksMfoPage = () => {
  const [statusFilter, setStatusFilter] = useState<BankStatus | "all">("active");
  const [typeFilter, setTypeFilter] = useState<BankType | "all">("all");
  const [search, setSearch] = useState("");

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: BANKS_MFO.length };
    BANKS_MFO.forEach((b) => (c[b.status] = (c[b.status] || 0) + 1));
    return c;
  }, []);
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = { all: BANKS_MFO.length };
    BANKS_MFO.forEach((b) => (c[b.type] = (c[b.type] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return BANKS_MFO.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (typeFilter !== "all" && b.type !== typeFilter) return false;
      if (!q) return true;
      return (
        b.mfo.includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.fullName.toLowerCase().includes(q) ||
        (b.swift?.toLowerCase().includes(q) ?? false) ||
        b.edrpou.includes(q) ||
        b.city.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      // Popular first within active
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.shortName.localeCompare(b.shortName, 'uk');
    });
  }, [statusFilter, typeFilter, search]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: `${label}: ${text}` });
  };

  const sidebar = (
    <>
      <FilterSection title="Статус">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: statusCounts.all },
            ...STATUSES.map((s) => ({
              value: s,
              label: BANK_STATUS_LABEL[s],
              count: statusCounts[s] || 0,
            })),
          ]}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as BankStatus | "all")}
        />
      </FilterSection>
      <FilterSection title="Тип">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі типи", count: typeCounts.all },
            ...TYPES.map((t) => ({
              value: t,
              label: BANK_TYPE_LABEL[t],
              count: typeCounts[t] || 0,
            })),
          ]}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as BankType | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "МФО і SWIFT українських банків — довідник для платіжок | FINTODO",
        description: `Коди МФО та SWIFT/BIC ${BANKS_MFO.length}+ українських банків: ПриватБанк, monobank, Ощадбанк, Райффайзен, ПУМБ. ЄДРПОУ, статус, тип. Для платіжних доручень і ЗЕД.`,
        canonical: `${SITE_URL}/dovidnyky/banky-mfo`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Банки: МФО і SWIFT", url: `${SITE_URL}/dovidnyky/banky-mfo` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Банки: МФО і SWIFT" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              МФО і SWIFT українських банків
            </h1>
            <p className="text-muted-foreground">
              Коди банків (МФО — позиції 5–10 IBAN UA), SWIFT/BIC, ЄДРПОУ та статус.
              Для заповнення платіжних доручень, перевірки реквізитів контрагентів і ЗЕД-платежів.
              Snapshot {BANKS_MFO_AS_OF}, джерело — реєстр НБУ.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: МФО, назва, SWIFT, ЄДРПОУ..."
            resultCount={filtered.length}
            resultLabel="банків"
            activeFilterCount={(statusFilter !== "active" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0)}
            onResetFilters={() => {
              setStatusFilter("active");
              setTypeFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((b) => (
                <Card key={b.mfo} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {BANK_TYPE_LABEL[b.type]}
                        </Badge>
                        {b.status !== 'active' && (
                          <Badge variant="destructive" className="text-[10px]">
                            {BANK_STATUS_LABEL[b.status]}
                          </Badge>
                        )}
                        {b.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Популярний
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {b.shortName}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {b.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted/40 border border-border px-3 py-2 mb-2 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-muted-foreground">МФО: </span>
                        <span className="font-mono font-semibold tabular-nums text-foreground">{b.mfo}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => copy(b.mfo, 'МФО')}
                      >
                        <Copy className="h-3 w-3 mr-1" /> Копіювати
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-muted-foreground">SWIFT: </span>
                        {b.swift ? (
                          <span className="font-mono font-semibold text-foreground">{b.swift}</span>
                        ) : (
                          <span className="text-muted-foreground italic">немає</span>
                        )}
                      </div>
                      {b.swift && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px]"
                          onClick={() => copy(b.swift!, 'SWIFT')}
                        >
                          <Copy className="h-3 w-3 mr-1" /> Копіювати
                        </Button>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">ЄДРПОУ: </span>
                      <span className="font-mono tabular-nums text-foreground">{b.edrpou}</span>
                      <span className="text-muted-foreground"> · {b.city}</span>
                    </div>
                  </div>

                  {b.note && (
                    <p className="text-[11px] text-muted-foreground italic mb-2">{b.note}</p>
                  )}

                  {b.website && (
                    <a
                      href={`https://${b.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" /> {b.website}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Як прочитати IBAN UA
              </p>
              <p className="text-muted-foreground font-mono text-[11px] break-all">
                UA<span className="text-foreground">XX</span> <span className="text-primary font-semibold">300465</span> 0000026005000000000
              </p>
              <ul className="text-muted-foreground space-y-0.5 ml-3 list-disc">
                <li><span className="text-foreground">UA</span> — код країни</li>
                <li><span className="text-foreground">XX</span> — контрольна сума (2 цифри)</li>
                <li><span className="text-primary font-semibold">300465</span> — МФО банку (6 цифр, у прикладі — ПриватБанк)</li>
                <li><span className="text-foreground">далі</span> — внутрішній номер рахунку (19 цифр)</li>
              </ul>
              <p className="text-muted-foreground pt-1 border-t border-border/60">
                Перевіряйте IBAN на сайті НБУ <a href="https://bank.gov.ua/ua/about/open-data-and-api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">bank.gov.ua</a>{' '}
                — там же повний реєстр діючих банків і їхній статус.
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="banky-mfo" />
    </PortalLayout>
  );
};

export default BanksMfoPage;
