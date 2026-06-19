import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Wallet, ExternalLink } from "lucide-react";
import {
  SALARY_GRIDS, SALARY_GRIDS_AS_OF, SALARY_SECTOR_LABEL, MIN_WAGE_2026,
  type SalaryGridSector,
} from "@/portal/data/salaryGrids";

const SECTORS: SalaryGridSector[] = ["it", "finance", "healthcare", "education", "civil_service", "military", "industry", "retail"];

const fmt = (n: number) => n.toLocaleString("uk-UA");

const SalaryGridsPage = () => {
  const [sector, setSector] = useState<SalaryGridSector | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return SALARY_GRIDS.filter((s) => {
      if (sector !== "all" && s.sector !== sector) return false;
      if (!q) return true;
      return s.position.toLowerCase().includes(q) || (s.level ?? "").toLowerCase().includes(q);
    });
  }, [sector, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Сектор">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            ...SECTORS.map((s) => ({ value: s, label: SALARY_SECTOR_LABEL[s] })),
          ]}
          value={sector}
          onChange={(v) => setSector(v as SalaryGridSector | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Зарплати в Україні 2026 — бюджетники, IT, фінанси, ЗСУ | FINTODO",
        description: `Орієнтовні зарплатні вилки за секторами: ЄТС держбюджету, контракти ЗСУ, ринкові ставки IT, фінансів, ритейлу. Мінімальна ЗП ${fmt(MIN_WAGE_2026)} ₴. Snapshot ${SALARY_GRIDS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/zarplaty`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Зарплати", url: `${SITE_URL}/dovidnyky/zarplaty` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Зарплати" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Зарплатні вилки України
            </h1>
            <p className="text-muted-foreground">
              Базові оклади держсектору (ЄТС), контрактні виплати ЗСУ, ринкові ставки приватного сектору. Мінімальна зарплата — {fmt(MIN_WAGE_2026)} ₴. Snapshot {SALARY_GRIDS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: посада, рівень..."
            resultCount={filtered.length}
            resultLabel="позицій"
            activeFilterCount={sector !== "all" ? 1 : 0}
            onResetFilters={() => setSector("all")}
          >
            <div className="grid gap-2.5">
              {filtered.map((s) => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{s.position}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{SALARY_SECTOR_LABEL[s.sector]}</Badge>
                        {s.level && <span className="text-[11px] text-muted-foreground">{s.level}</span>}
                        {s.region && <span className="text-[11px] text-muted-foreground">· {s.region}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono font-bold text-foreground">{fmt(s.medianSalary)} ₴</div>
                      <div className="text-[10px] text-muted-foreground">медіана/міс</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2 bg-muted/40 rounded p-2">
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">мін</div>
                      <div className="text-xs font-mono">{fmt(s.minSalary)} ₴</div>
                    </div>
                    <div className="text-center border-x border-border/50">
                      <div className="text-[10px] text-muted-foreground">медіана</div>
                      <div className="text-xs font-mono font-semibold">{fmt(s.medianSalary)} ₴</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">макс</div>
                      <div className="text-xs font-mono">{fmt(s.maxSalary)} ₴</div>
                    </div>
                  </div>

                  {s.notes && <p className="text-[11px] text-muted-foreground">{s.notes}</p>}
                  {s.legalBasisUrl && (
                    <a href={s.legalBasisUrl} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1.5">
                      <ExternalLink className="h-3 w-3" />{s.legalBasis}
                    </a>
                  )}
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="zarplaty" />
    </PortalLayout>
  );
};

export default SalaryGridsPage;
