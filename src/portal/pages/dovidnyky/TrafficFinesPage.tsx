import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { AlertOctagon, ExternalLink } from "lucide-react";
import {
  TRAFFIC_FINES, TRAFFIC_FINES_AS_OF, TRAFFIC_FINE_CATEGORY_LABEL,
  type TrafficFineCategory,
} from "@/portal/data/trafficFines";

const CATEGORIES: TrafficFineCategory[] = [
  "speeding", "drunk_driving", "parking", "documents", "phone", "seatbelt_helmet", "lights", "tech_state", "insurance", "passenger_freight",
];

const fmt = (n: number) => n.toLocaleString("uk-UA");

const TrafficFinesPage = () => {
  const [category, setCategory] = useState<TrafficFineCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TRAFFIC_FINES.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (!q) return true;
      return f.violation.toLowerCase().includes(q);
    });
  }, [category, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            ...CATEGORIES.map((c) => ({ value: c, label: TRAFFIC_FINE_CATEGORY_LABEL[c] })),
          ]}
          value={category}
          onChange={(v) => setCategory(v as TrafficFineCategory | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Штрафи ПДР України 2026 — повний довідник з знижкою 50% | FINTODO",
        description: `Актуальні розміри штрафів ПДР: швидкість, сп'яніння, паркування, документи, телефон. КУпАП глава 9. Знижка 50% при сплаті за 10 днів. Snapshot ${TRAFFIC_FINES_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/shtrafy-pdr`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Штрафи ПДР", url: `${SITE_URL}/dovidnyky/shtrafy-pdr` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Штрафи ПДР" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <AlertOctagon className="h-6 w-6 text-destructive" />
              Штрафи ПДР
            </h1>
            <p className="text-muted-foreground">
              Розміри штрафів за порушення Правил дорожнього руху, передбачені КУпАП. Сплачуючи протягом 10 днів — знижка 50% (крім окремих статей). Snapshot {TRAFFIC_FINES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук порушення..."
            resultCount={filtered.length}
            resultLabel="порушень"
            activeFilterCount={category !== "all" ? 1 : 0}
            onResetFilters={() => setCategory("all")}
          >
            <div className="grid gap-2.5">
              {filtered.map((f) => (
                <Card key={f.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{f.violation}</h3>
                      <Badge variant="outline" className="text-[10px] mt-1">{TRAFFIC_FINE_CATEGORY_LABEL[f.category]}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono font-bold text-destructive">{fmt(f.fineAmount)} ₴</div>
                      {f.discountedAmount && (
                        <div className="text-[11px] text-emerald-600">−50%: {fmt(f.discountedAmount)} ₴</div>
                      )}
                    </div>
                  </div>
                  {f.alternative && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 mb-1">{f.alternative}</div>
                  )}
                  {f.repeatPenalty && (
                    <div className="text-[11px] text-muted-foreground"><strong>Повторне:</strong> {f.repeatPenalty}</div>
                  )}
                  {f.notes && <div className="text-[11px] text-muted-foreground mt-1">{f.notes}</div>}
                  <a href={f.legalBasisUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1.5">
                    <ExternalLink className="h-3 w-3" />{f.legalBasis}
                  </a>
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="shtrafy-pdr" />
    </PortalLayout>
  );
};

export default TrafficFinesPage;
