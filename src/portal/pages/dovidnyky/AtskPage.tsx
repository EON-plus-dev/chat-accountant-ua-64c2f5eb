import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { KeyRound, ShieldCheck, Globe } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  ATSK_PROVIDERS,
  ATSK_CATEGORY_LABEL,
  KEP_MEDIUM_LABEL,
  type AtskCategory,
  type KepMedium,
} from "@/portal/data/atskProviders";

const AtskPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AtskCategory | "all">("all");
  const [mediumFilter, setMediumFilter] = useState<KepMedium | "all">("all");
  const [audienceFilter, setAudienceFilter] = useState<"all" | "business" | "personal">("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: ATSK_PROVIDERS.length };
    ATSK_PROVIDERS.forEach((a) => (c[a.category] = (c[a.category] || 0) + 1));
    return c;
  }, []);

  const isFree = (a: (typeof ATSK_PROVIDERS)[number]) =>
    a.fees.some((f) => f.price.toLowerCase().includes("безкошт"));

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ATSK_PROVIDERS.filter((a) => {
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (mediumFilter !== "all" && !a.mediums.includes(mediumFilter)) return false;
      if (audienceFilter !== "all" && a.audience !== audienceFilter && a.audience !== "both") return false;
      if (priceFilter === "free" && !isFree(a)) return false;
      if (priceFilter === "paid" && isFree(a)) return false;
      if (!q) return true;
      return (
        a.shortName.toLowerCase().includes(q) ||
        a.fullName.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, categoryFilter, mediumFilter, audienceFilter, priceFilter]);

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (mediumFilter !== "all" ? 1 : 0) +
    (audienceFilter !== "all" ? 1 : 0) +
    (priceFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Тип АЦСК">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: categoryCounts.all },
            ...(Object.entries(ATSK_CATEGORY_LABEL) as [AtskCategory, string][])
              .filter(([v]) => (categoryCounts[v] || 0) > 0)
              .map(([v, l]) => ({ value: v, label: l, count: categoryCounts[v] || 0 })),
          ]}
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as AtskCategory | "all")}
        />
      </FilterSection>
      <FilterSection title="Тип носія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Будь-який" },
            ...(Object.entries(KEP_MEDIUM_LABEL) as [KepMedium, string][]).map(([v, l]) => ({
              value: v,
              label: l,
            })),
          ]}
          value={mediumFilter}
          onChange={(v) => setMediumFilter(v as KepMedium | "all")}
        />
      </FilterSection>
      <FilterSection title="Вартість">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Будь-яка" },
            { value: "free", label: "Безкоштовно" },
            { value: "paid", label: "Платно" },
          ]}
          value={priceFilter}
          onChange={(v) => setPriceFilter(v as "all" | "free" | "paid")}
        />
      </FilterSection>
      <FilterSection title="Кому корисно">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всім" },
            { value: "business", label: "Бізнесу / ФОП" },
            { value: "personal", label: "Фізособам" },
          ]}
          value={audienceFilter}
          onChange={(v) => setAudienceFilter(v as "all" | "business" | "personal")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `АЦСК та КЕП — ${ATSK_PROVIDERS.length} надавачів електронного підпису | FINTODO`,
        description: `Довідник акредитованих центрів сертифікації ключів. Дія.Підпис, АЦСК ДПС, ПриватБанк, Ощадбанк, Masterkey. Тарифи, сумісність, інструкції.`,
        canonical: `${SITE_URL}/dovidnyky/atsk-kep`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "АЦСК та КЕП", url: `${SITE_URL}/dovidnyky/atsk-kep` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "АЦСК та КЕП" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" />
              АЦСК та КЕП в Україні
            </h1>
            <p className="text-muted-foreground">
              Акредитовані центри сертифікації ключів кваліфікованого електронного підпису. Де отримати КЕП —
              безкоштовно або платно, для фізособи, ФОП чи юрособи.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за назвою або типом носія..."
            resultCount={filtered.length}
            resultLabel="надавачів"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => {
              setCategoryFilter("all");
              setMediumFilter("all");
              setAudienceFilter("all");
              setPriceFilter("all");
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((a) => {
                const free = isFree(a);
                return (
                  <Link key={a.id} to={`/dovidnyky/atsk-kep/${a.slug}`}>
                    <Card className="p-4 h-full hover:border-primary/40 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {a.shortName}
                        </h3>
                        {free && (
                          <Badge variant="default" size="sm" className="text-[10px] shrink-0">
                            Безкоштовно
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{a.fullName}</p>
                      <p className="text-sm text-foreground line-clamp-3 mb-3">{a.summary}</p>
                      <div className="flex items-center gap-2 flex-wrap text-[10px] border-t border-border pt-2">
                        <Badge variant="outline" size="sm" className="text-[10px]">
                          {ATSK_CATEGORY_LABEL[a.category]}
                        </Badge>
                        {a.mediums.slice(0, 3).map((m) => (
                          <Badge key={m} variant="secondary" size="sm" className="text-[10px]">
                            {KEP_MEDIUM_LABEL[m]}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-2">
                        {a.compatibility.diia && (
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-primary" /> Дія
                          </span>
                        )}
                        {a.compatibility.kabinetDps && (
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-primary" /> ЕК ДПС
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 ml-auto truncate">
                          <Globe className="h-3 w-3" />
                          {a.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="atsk-kep" />
    </PortalLayout>
  );
};

export default AtskPage;
