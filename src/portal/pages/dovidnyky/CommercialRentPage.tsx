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
import { Building2, FileText } from "lucide-react";
import {
  COMMERCIAL_RENT_ROWS,
  COMMERCIAL_RENT_CITIES,
  COMMERCIAL_RENT_AS_OF,
  RENT_SEGMENT_LABEL,
  RENT_CONTRACT_NOTES,
  type RentSegment,
} from "@/portal/data/commercialRent";

const SEGMENTS: RentSegment[] = ["office", "retail_street", "retail_mall", "warehouse", "coworking"];

const CommercialRentPage = () => {
  const [segmentFilter, setSegmentFilter] = useState<RentSegment | "all">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const segmentCounts = useMemo(() => {
    const c: Record<string, number> = { all: COMMERCIAL_RENT_ROWS.length };
    COMMERCIAL_RENT_ROWS.forEach((r) => (c[r.segment] = (c[r.segment] || 0) + 1));
    return c;
  }, []);

  const cityCounts = useMemo(() => {
    const c: Record<string, number> = { all: COMMERCIAL_RENT_ROWS.length };
    COMMERCIAL_RENT_ROWS.forEach((r) => (c[r.city] = (c[r.city] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return COMMERCIAL_RENT_ROWS.filter((r) => {
      if (segmentFilter !== "all" && r.segment !== segmentFilter) return false;
      if (cityFilter !== "all" && r.city !== cityFilter) return false;
      if (!q) return true;
      return (
        r.city.toLowerCase().includes(q) ||
        r.classOrZone.toLowerCase().includes(q) ||
        (r.notes ?? "").toLowerCase().includes(q)
      );
    });
  }, [segmentFilter, cityFilter, search]);

  const grouped = useMemo(() => {
    const g = new Map<RentSegment, typeof filtered>();
    filtered.forEach((r) => {
      const arr = g.get(r.segment) ?? [];
      arr.push(r);
      g.set(r.segment, arr);
    });
    return Array.from(g.entries());
  }, [filtered]);

  const activeFilters = (segmentFilter !== "all" ? 1 : 0) + (cityFilter !== "all" ? 1 : 0);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Сегмент">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: segmentCounts.all },
            ...SEGMENTS.map((s) => ({
              value: s,
              label: RENT_SEGMENT_LABEL[s],
              count: segmentCounts[s] || 0,
            })),
          ]}
          value={segmentFilter}
          onChange={(v) => setSegmentFilter(v as RentSegment | "all")}
        />
      </FilterSection>
      <FilterSection title="Місто / регіон">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: cityCounts.all },
            ...COMMERCIAL_RENT_CITIES.map((c) => ({
              value: c,
              label: c,
              count: cityCounts[c] || 0,
            })),
          ]}
          value={cityFilter}
          onChange={setCityFilter}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Комерційна оренда в Україні 2026 — офіси, рітейл, склади | FINTODO",
        description: `Ставки оренди офісів, стріт-рітейлу, ТРЦ, складів і коворкінгів у Києві, Львові, Дніпрі, Одесі, Харкові та західних хабах. USD/м²/міс, прайм/середня, вакантність. Snapshot ${COMMERCIAL_RENT_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/komertsiyna-orenda`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Комерційна оренда", url: `${SITE_URL}/dovidnyky/komertsiyna-orenda` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Комерційна оренда" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Комерційна оренда
            </h1>
            <p className="text-muted-foreground">
              Орендні ставки у USD/м²/місяць без ПДВ — для офісів класів A/B/C, стріт-рітейлу,
              ТРЦ, складів і коворкінгів у головних містах. Прайм, середня і вакантність.
              Snapshot {COMMERCIAL_RENT_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: клас A, Подол, склад..."
            resultCount={filtered.length}
            resultLabel="позицій"
            activeFilterCount={activeFilters}
            onResetFilters={() => {
              setSegmentFilter("all");
              setCityFilter("all");
            }}
          >
            <div className="space-y-4">
              {grouped.map(([segment, rows]) => (
                <Card key={segment} className="overflow-hidden">
                  <div className="p-3 border-b bg-muted/40 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {RENT_SEGMENT_LABEL[segment]}
                    </h3>
                    <Badge variant="outline" className="text-[10px]">{rows.length}</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Місто</TableHead>
                          <TableHead className="text-xs">Клас / локація</TableHead>
                          <TableHead className="text-xs text-right">Прайм</TableHead>
                          <TableHead className="text-xs text-right">Середня</TableHead>
                          <TableHead className="text-xs text-right">Вакантність</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="text-xs font-medium whitespace-nowrap">{r.city}</TableCell>
                            <TableCell className="text-xs">
                              <div>{r.classOrZone}</div>
                              {r.notes && (
                                <div className="text-[11px] text-muted-foreground mt-0.5">{r.notes}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-right tabular-nums font-semibold text-primary whitespace-nowrap">
                              ${r.primeUsd}
                              <div className="text-[10px] text-muted-foreground font-normal">
                                {segment === "coworking" ? "/desk/міс" : "/м²/міс"}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-right tabular-nums whitespace-nowrap">
                              ${r.avgUsd}
                            </TableCell>
                            <TableCell className="text-xs text-right tabular-nums whitespace-nowrap">
                              {r.vacancy}%
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

              <Card className="p-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Структура договору оренди — ключове
                </h3>
                <ul className="space-y-1.5 text-xs text-foreground/85">
                  {RENT_CONTRACT_NOTES.map((n, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary mt-0.5">·</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="komertsiyna-orenda" />
    </PortalLayout>
  );
};

export default CommercialRentPage;
