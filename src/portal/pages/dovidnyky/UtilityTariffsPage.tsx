import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Zap } from "lucide-react";
import {
  UTILITY_TARIFFS,
  UTILITY_KIND_LABEL,
  SEGMENT_LABEL,
  UTILITY_TARIFFS_AS_OF,
  type UtilityKind,
  type ConsumerSegment,
} from "@/portal/data/utilityTariffs";

const KINDS: UtilityKind[] = [
  "electricity", "gas", "heating", "hot_water", "cold_water", "sewage", "waste", "internet",
];

const UtilityTariffsPage = () => {
  const [kindFilter, setKindFilter] = useState<UtilityKind | "all">("all");
  const [segmentFilter, setSegmentFilter] = useState<ConsumerSegment | "all">("all");
  const [search, setSearch] = useState("");

  const kindCounts = useMemo(() => {
    const c: Record<string, number> = { all: UTILITY_TARIFFS.length };
    UTILITY_TARIFFS.forEach((t) => (c[t.kind] = (c[t.kind] || 0) + 1));
    return c;
  }, []);

  const segmentCounts = useMemo(() => {
    const c: Record<string, number> = { all: UTILITY_TARIFFS.length };
    UTILITY_TARIFFS.forEach((t) => (c[t.segment] = (c[t.segment] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return UTILITY_TARIFFS.filter((t) => {
      if (kindFilter !== "all" && t.kind !== kindFilter) return false;
      if (segmentFilter !== "all" && t.segment !== segmentFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.provider.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q) ||
        (t.notes ?? "").toLowerCase().includes(q)
      );
    });
  }, [kindFilter, segmentFilter, search]);

  // Group by kind for nicer presentation
  const grouped = useMemo(() => {
    const g = new Map<UtilityKind, typeof filtered>();
    filtered.forEach((t) => {
      const arr = g.get(t.kind) ?? [];
      arr.push(t);
      g.set(t.kind, arr);
    });
    return Array.from(g.entries());
  }, [filtered]);

  const activeFilters = (kindFilter !== "all" ? 1 : 0) + (segmentFilter !== "all" ? 1 : 0);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Послуга">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: kindCounts.all },
            ...KINDS.map((k) => ({
              value: k,
              label: UTILITY_KIND_LABEL[k],
              count: kindCounts[k] || 0,
            })),
          ]}
          value={kindFilter}
          onChange={(v) => setKindFilter(v as UtilityKind | "all")}
        />
      </FilterSection>
      <FilterSection title="Споживач">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: segmentCounts.all },
            { value: "household", label: SEGMENT_LABEL.household, count: segmentCounts.household || 0 },
            { value: "business", label: SEGMENT_LABEL.business, count: segmentCounts.business || 0 },
          ]}
          value={segmentFilter}
          onChange={(v) => setSegmentFilter(v as ConsumerSegment | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Комунальні тарифи України 2026 — електрика, газ, тепло, вода | FINTODO",
        description: `Чинні тарифи на електроенергію, газ, тепло, гарячу/холодну воду, водовідведення, сміття та інтернет для населення і бізнесу. Snapshot ${UTILITY_TARIFFS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/komunalni-taryfy`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Комунальні тарифи", url: `${SITE_URL}/dovidnyky/komunalni-taryfy` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Комунальні тарифи" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Комунальні тарифи
            </h1>
            <p className="text-muted-foreground">
              Чинні роздрібні тарифи: електроенергія, газ, тепло, гаряча і холодна вода,
              водовідведення, ТПВ та інтернет. Окремо для населення та бізнесу. Snapshot {UTILITY_TARIFFS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: Київ, Нафтогаз, Гкал..."
            resultCount={filtered.length}
            resultLabel="тарифів"
            activeFilterCount={activeFilters}
            onResetFilters={() => {
              setKindFilter("all");
              setSegmentFilter("all");
            }}
          >
            <div className="space-y-4">
              {grouped.map(([kind, rows]) => (
                <Card key={kind} className="overflow-hidden">
                  <div className="p-3 border-b bg-muted/40 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {UTILITY_KIND_LABEL[kind]}
                    </h3>
                    <Badge variant="outline" className="text-[10px]">{rows.length}</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Назва / умови</TableHead>
                          <TableHead className="text-xs">Регіон / постачальник</TableHead>
                          <TableHead className="text-xs">Споживач</TableHead>
                          <TableHead className="text-xs text-right">Ціна</TableHead>
                          <TableHead className="text-xs">З дати</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="text-xs">
                              <div className="font-medium text-foreground">{r.name}</div>
                              {r.notes && (
                                <div className="text-[11px] text-muted-foreground mt-0.5">{r.notes}</div>
                              )}
                              {r.basis && (
                                <div className="text-[10px] text-muted-foreground italic mt-0.5">{r.basis}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              <div>{r.region}</div>
                              <div className="text-[10px]">{r.provider}</div>
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge variant="outline" className="text-[10px]">
                                {SEGMENT_LABEL[r.segment]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-right tabular-nums font-semibold text-primary whitespace-nowrap">
                              {r.price.toLocaleString("uk-UA", { maximumFractionDigits: 2 })}
                              <div className="text-[10px] text-muted-foreground font-normal">{r.unit}</div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {r.effectiveFrom}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
              )}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="komunalni-taryfy" />
    </PortalLayout>
  );
};

export default UtilityTariffsPage;
