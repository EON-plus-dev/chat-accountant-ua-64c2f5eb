import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Percent } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  PDV_PILHY,
  PDV_PILHA_TYPE_LABEL,
  PDV_PILHA_TYPE_SHORT,
  PDV_SECTOR_LABEL,
  PDV_SECTORS,
  type PdvPilhaSector,
  type PdvPilhaType,
} from "@/portal/data/pdvPilhy";

const TYPE_VARIANT: Record<PdvPilhaType, "default" | "secondary" | "outline"> = {
  "zero-rate": "default",
  exempt: "secondary",
  "out-of-scope": "outline",
};

const PdvPilhyPage = () => {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<PdvPilhaSector | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PdvPilhaType | "all">("all");

  const sectorCounts = useMemo(() => {
    const c: Record<string, number> = { all: PDV_PILHY.length };
    PDV_PILHY.forEach((e) => (c[e.sector] = (c[e.sector] || 0) + 1));
    return c;
  }, []);
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = { all: PDV_PILHY.length };
    PDV_PILHY.forEach((e) => (c[e.type] = (c[e.type] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PDV_PILHY.filter((e) => {
      if (sectorFilter !== "all" && e.sector !== sectorFilter) return false;
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.scope.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        (e.benefitCode?.includes(q) ?? false)
      );
    });
  }, [search, sectorFilter, typeFilter]);

  const sidebar = (
    <>
      <FilterSection title="Тип пільги">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі типи", count: typeCounts.all },
            ...(Object.entries(PDV_PILHA_TYPE_LABEL) as [PdvPilhaType, string][])
              .filter(([v]) => (typeCounts[v] || 0) > 0)
              .map(([v, l]) => ({ value: v, label: l, count: typeCounts[v] || 0 })),
          ]}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as PdvPilhaType | "all")}
        />
      </FilterSection>
      <FilterSection title="Галузь">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі галузі", count: sectorCounts.all },
            ...PDV_SECTORS.filter((s) => (sectorCounts[s] || 0) > 0).map((s) => ({
              value: s,
              label: PDV_SECTOR_LABEL[s],
              count: sectorCounts[s] || 0,
            })),
          ]}
          value={sectorFilter}
          onChange={(v) => setSectorFilter(v as PdvPilhaSector | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Пільги і звільнення з ПДВ — ст. 195, 196, 197 ПКУ | FINTODO",
        description: `Каталог пільг з ПДВ: 0%, звільнено, поза обʼєктом. Для кожної — стаття ПКУ, код пільги для додатка 5, умови застосування, право на ПК. ${PDV_PILHY.length} позицій станом на квітень 2026.`,
        canonical: `${SITE_URL}/dovidnyky/pdv-pilhy`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Пільги з ПДВ", url: `${SITE_URL}/dovidnyky/pdv-pilhy` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Пільги з ПДВ" },
          ]}
        />
        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Percent className="h-6 w-6 text-primary" />
              Пільги і звільнення з ПДВ
            </h1>
            <p className="text-muted-foreground">
              Структурований довідник за ст. 195 (0%), 196 (поза обʼєктом) і 197 (звільнено) Податкового кодексу. Для кожної пільги — код для додатка 5 декларації, умови застосування та право на податковий кредит.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за назвою, кодом пільги, статтею..."
            resultCount={filtered.length}
            resultLabel="пільг"
            activeFilterCount={(sectorFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0)}
            onResetFilters={() => {
              setSectorFilter("all");
              setTypeFilter("all");
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((e) => (
                <Link key={e.id} to={`/dovidnyky/pdv-pilhy/${e.slug}`}>
                  <Card className="p-4 h-full hover:border-primary/40 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {e.title}
                      </h3>
                      <Badge variant={TYPE_VARIANT[e.type]} size="sm" className="text-[10px] shrink-0">
                        {PDV_PILHA_TYPE_SHORT[e.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{e.summary}</p>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] border-t border-border pt-2">
                      <span className="text-muted-foreground">{PDV_SECTOR_LABEL[e.sector]}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-mono text-foreground">{e.articleRef}</span>
                      {e.benefitCode && (
                        <span className="text-[10px] text-primary ml-auto font-mono">код {e.benefitCode}</span>
                      )}
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
                <strong className="text-foreground">Важливо.</strong> Звільнення (ст. 197) — без права на податковий кредит з вхідного ПДВ. Нульова ставка (ст. 195) — з правом. «Не є обʼєктом» (ст. 196) — поза системою ПДВ.
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="pdv-pilhy" />
    </PortalLayout>
  );
};

export default PdvPilhyPage;
