import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { AlertTriangle, ExternalLink } from "lucide-react";
import {
  CUSTOMS_SANCTIONS, RESTRICTION_LABEL, TARGET_COUNTRY_LABEL, CUSTOMS_SANCTIONS_AS_OF,
  type RestrictionType, type TargetCountry,
} from "@/portal/data/customsSanctions";

const RESTRICTIONS: RestrictionType[] = ["prohibited", "licensed", "dual_use", "sanctioned_origin", "quota"];
const COUNTRIES: TargetCountry[] = ["RU", "BY", "IR", "KP", "EU", "global"];

const RESTRICTION_COLOR: Record<RestrictionType, string> = {
  prohibited: "border-l-destructive bg-destructive/5",
  licensed: "border-l-amber-500 bg-amber-500/5",
  dual_use: "border-l-orange-500 bg-orange-500/5",
  sanctioned_origin: "border-l-destructive bg-destructive/5",
  quota: "border-l-blue-500 bg-blue-500/5",
};

const CustomsSanctionsPage = () => {
  const [restriction, setRestriction] = useState<RestrictionType | "all">("all");
  const [country, setCountry] = useState<TargetCountry | "all">("all");
  const [direction, setDirection] = useState<"all" | "import" | "export">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CUSTOMS_SANCTIONS.filter((s) => {
      if (restriction !== "all" && s.restrictionType !== restriction) return false;
      if (country !== "all" && !s.targetCountries.includes(country)) return false;
      if (direction !== "all" && s.direction !== direction && s.direction !== "both") return false;
      if (!q) return true;
      return s.description.toLowerCase().includes(q) || s.uktZedCode.includes(q);
    });
  }, [restriction, country, direction, search]);

  const activeFilters = (restriction !== "all" ? 1 : 0) + (country !== "all" ? 1 : 0) + (direction !== "all" ? 1 : 0);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Тип обмеження">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            ...RESTRICTIONS.map((r) => ({ value: r, label: RESTRICTION_LABEL[r] })),
          ]}
          value={restriction}
          onChange={(v) => setRestriction(v as RestrictionType | "all")}
        />
      </FilterSection>
      <FilterSection title="Юрисдикція">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            ...COUNTRIES.map((c) => ({ value: c, label: TARGET_COUNTRY_LABEL[c] })),
          ]}
          value={country}
          onChange={(v) => setCountry(v as TargetCountry | "all")}
        />
      </FilterSection>
      <FilterSection title="Напрямок">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            { value: "import", label: "Імпорт" },
            { value: "export", label: "Експорт" },
          ]}
          value={direction}
          onChange={(v) => setDirection(v as "all" | "import" | "export")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Санкційні товари за УКТ ЗЕД — заборони і dual-use 2026 | FINTODO",
        description: `Перелік заборонених та обмежених до експорту/імпорту товарів за УКТ ЗЕД: РФ, Білорусь, dual-use, ліцензовані категорії. Snapshot ${CUSTOMS_SANCTIONS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/sanktsiyni-tovary`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Санкційні товари", url: `${SITE_URL}/dovidnyky/sanktsiyni-tovary` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Санкційні товари" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Санкційні та обмежені товари
            </h1>
            <p className="text-muted-foreground">
              Заборони, ліцензії та dual-use за УКТ ЗЕД. Постанови КМУ № 1147, 187, 1807, регламенти ЄС 833/2014 і 2022/1269. Snapshot {CUSTOMS_SANCTIONS_AS_OF}. Перед операцією звіряйтесь з актуальними рішеннями РНБО і Держекспортконтролю.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: код або назва товару..."
            resultCount={filtered.length}
            resultLabel="обмежень"
            activeFilterCount={activeFilters}
            onResetFilters={() => { setRestriction("all"); setCountry("all"); setDirection("all"); }}
          >
            <div className="space-y-3">
              {filtered.map((s) => (
                <Card key={s.id} className={`p-4 border-l-4 ${RESTRICTION_COLOR[s.restrictionType]}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default" className="font-mono text-xs">{s.uktZedCode}</Badge>
                      <Badge variant="destructive" className="text-xs">{RESTRICTION_LABEL[s.restrictionType]}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {s.direction === "import" ? "Імпорт" : s.direction === "export" ? "Експорт" : "Імпорт + Експорт"}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">З {s.validFrom}{s.validUntil ? ` до ${s.validUntil}` : ""}</span>
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1.5">{s.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {s.targetCountries.map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px]">{TARGET_COUNTRY_LABEL[c]}</Badge>
                    ))}
                  </div>
                  {s.exemption && (
                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded p-2 mb-2">
                      <strong>Винятки:</strong> {s.exemption}
                    </div>
                  )}
                  <a href={s.legalBasisUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />{s.legalBasis}
                  </a>
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="sanktsiyni-tovary" />
    </PortalLayout>
  );
};

export default CustomsSanctionsPage;
