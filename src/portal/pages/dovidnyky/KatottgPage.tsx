import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  KATOTTG_ENTRIES,
  KATOTTG_LEVEL_LABEL,
  KATOTTG_OBLASTS,
  type KatottgLevel,
} from "@/portal/data/katottg";

const KatottgPage = () => {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<KatottgLevel | "all">("all");
  const [oblastFilter, setOblastFilter] = useState<string>("all");

  const levelCounts = useMemo(() => {
    const c: Record<string, number> = { all: KATOTTG_ENTRIES.length };
    KATOTTG_ENTRIES.forEach((e) => (c[e.level] = (c[e.level] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return KATOTTG_ENTRIES.filter((e) => {
      if (levelFilter !== "all" && e.level !== levelFilter) return false;
      if (oblastFilter !== "all" && e.oblast !== oblastFilter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.oblast.toLowerCase().includes(q) ||
        (e.postalCode?.includes(q) ?? false)
      );
    });
  }, [search, levelFilter, oblastFilter]);

  const activeFilterCount = (levelFilter !== "all" ? 1 : 0) + (oblastFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Рівень одиниці">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: levelCounts.all },
            ...(Object.entries(KATOTTG_LEVEL_LABEL) as [KatottgLevel, string][])
              .filter(([v]) => (levelCounts[v] || 0) > 0)
              .map(([v, l]) => ({ value: v, label: l, count: levelCounts[v] || 0 })),
          ]}
          value={levelFilter}
          onChange={(v) => setLevelFilter(v as KatottgLevel | "all")}
        />
      </FilterSection>
      <FilterSection title="Область">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі області" },
            ...KATOTTG_OBLASTS.map((o) => ({ value: o, label: o })),
          ]}
          value={oblastFilter}
          onChange={setOblastFilter}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `КАТОТТГ — коди адміністративно-територіальних одиниць України | FINTODO`,
        description: `Кодифікатор КАТОТТГ (наказ Мінрозвитку громад № 290): коди областей, міст, громад для форми 1ДФ, ЄСВ, єдиного податку. ${KATOTTG_ENTRIES.length} найзатребуваніших одиниць.`,
        canonical: `${SITE_URL}/dovidnyky/katottg`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "КАТОТТГ", url: `${SITE_URL}/dovidnyky/katottg` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "КАТОТТГ" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              КАТОТТГ — адмін-територіальні коди
            </h1>
            <p className="text-muted-foreground">
              Кодифікатор адміністративно-територіальних одиниць та територій територіальних громад. Обовʼязковий
              у формі 1ДФ, ЄСВ, єдиному податку — замінив старий КОАТУУ з 2022 року.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за назвою, кодом або індексом..."
            resultCount={filtered.length}
            resultLabel="одиниць"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => {
              setLevelFilter("all");
              setOblastFilter("all");
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((e) => (
                <Link key={e.id} to={`/dovidnyky/katottg/${e.slug}`}>
                  <Card className="p-4 h-full hover:border-primary/40 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {e.name}
                      </h3>
                      <Badge variant="outline" size="sm" className="text-[10px] shrink-0">
                        {KATOTTG_LEVEL_LABEL[e.level]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize mb-2">{e.unitType} · {e.oblast}</p>
                    <div className="font-mono text-[11px] text-foreground bg-muted/40 rounded px-2 py-1 mb-2 break-all">
                      {e.code}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {e.postalCode && <span>Індекс: {e.postalCode}</span>}
                      {e.population && <span>{e.population} тис. осіб</span>}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Повний кодифікатор</strong> містить понад 30 000 одиниць. У
                FINTODO опубліковано підмножину найзатребуваніших. Для пошуку інших одиниць використовуйте{" "}
                <a
                  href="https://decentralization.gov.ua/areas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  офіційний реєстр Мінрегіону
                </a>
                .
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="katottg" />
    </PortalLayout>
  );
};

export default KatottgPage;
