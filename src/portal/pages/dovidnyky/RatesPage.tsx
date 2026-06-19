import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { RATE_TABLES, RATE_CATEGORIES } from "@/portal/data/rates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RatesPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: RATE_TABLES.length };
    RATE_TABLES.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, []);

  const yearOptions = useMemo(() => {
    const yearSet = new Set<number>();
    RATE_TABLES.forEach((t) => t.rows.forEach((r) => yearSet.add(r.year)));
    const sorted = Array.from(yearSet).sort((a, b) => b - a);
    const yearCounts: Record<number, number> = {};
    sorted.forEach((y) => {
      yearCounts[y] = RATE_TABLES.filter((t) => t.rows.some((r) => r.year === y)).length;
    });
    return [
      { value: "all", label: "Всі роки", count: RATE_TABLES.length },
      ...sorted.map((y) => ({ value: String(y), label: String(y), count: yearCounts[y] })),
    ];
  }, []);

  const filtered = useMemo(() => {
    return RATE_TABLES.filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (yearFilter !== "all" && !t.rows.some((r) => r.year === Number(yearFilter))) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, categoryFilter, yearFilter]);

  const activeFilterCount = (categoryFilter !== "all" ? 1 : 0) + (yearFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: categoryCounts.all },
            ...RATE_CATEGORIES.map((c) => ({
              value: c.id,
              label: `${c.emoji} ${c.label}`,
              count: categoryCounts[c.id] || 0,
            })),
          ]}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </FilterSection>
      <FilterSection title="Рік">
        <FilterRadioGroup options={yearOptions} value={yearFilter} onChange={setYearFilter} />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Ставки та показники 2024-2026 — МЗП, ЄСВ, податки | FINTODO",
        description: "Довідкові таблиці: мінімальна зарплата, ЄСВ, ставки податків, прожитковий мінімум, ліміти ФОП по роках.",
        canonical: `${SITE_URL}/dovidnyky/stavky`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Ставки та показники", url: `${SITE_URL}/dovidnyky/stavky` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Ставки та показники" },
        ]} />

        <div className="space-y-6 pb-16">
          <div>
            <h1 className="text-2xl font-bold">📊 Ставки та показники</h1>
            <p className="text-muted-foreground mt-1">Ключові фінансові показники України — МЗП, ЄСВ, ставки податків по роках</p>
          </div>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук показника..."
            resultCount={filtered.length}
            resultLabel="таблиць"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => { setCategoryFilter("all"); setYearFilter("all"); }}
          >
            <div className="space-y-6">
              {filtered.map((table) => (
                <Link key={table.id} to={`/dovidnyky/stavky/${table.slug}`} className="block group">
                  <Card className="overflow-hidden group-hover:border-primary/40 transition-colors">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{table.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{table.description}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Рік</TableHead>
                            {table.rows.some(r => r.period) && <TableHead className="text-xs">Період / Тип</TableHead>}
                            <TableHead className="text-xs">Значення</TableHead>
                            <TableHead className="text-xs">Примітка</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.rows.map((row, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs font-medium">{row.year}</TableCell>
                              {table.rows.some(r => r.period) && <TableCell className="text-xs">{row.period || "—"}</TableCell>}
                              <TableCell className="text-xs font-semibold text-primary">{row.value}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{row.note || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="stavky" />
    </PortalLayout>
  );
};

export default RatesPage;
