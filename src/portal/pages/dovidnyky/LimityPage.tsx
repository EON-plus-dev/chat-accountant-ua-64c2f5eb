import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, AlertTriangle, BookOpen, Target } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  LIMITY,
  LIMIT_CATEGORY_LABEL,
  LIMITY_AS_OF,
  type LimitCategory,
} from "@/portal/data/limity";

const CATEGORIES: LimitCategory[] = [
  "minimums",
  "fop",
  "rro",
  "cash",
  "finmon",
  "card2card",
  "gifts",
  "employer",
];

const LimityPage = () => {
  const [catFilter, setCatFilter] = useState<LimitCategory | "all">("all");
  const [search, setSearch] = useState("");

  const catCounts = useMemo(() => {
    const c: Record<string, number> = { all: LIMITY.length };
    LIMITY.forEach((l) => (c[l.category] = (c[l.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return LIMITY.filter((l) => {
      if (catFilter !== "all" && l.category !== catFilter) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.value.toLowerCase().includes(q) ||
        l.basis.toLowerCase().includes(q) ||
        l.appliesTo.toLowerCase().includes(q) ||
        (l.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [catFilter, search]);

  const sidebar = (
    <FilterSection title="Категорія">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Усі категорії", count: catCounts.all },
          ...CATEGORIES.filter((c) => (catCounts[c] || 0) > 0).map((c) => ({
            value: c,
            label: LIMIT_CATEGORY_LABEL[c],
            count: catCounts[c] || 0,
          })),
        ]}
        value={catFilter}
        onChange={(v) => setCatFilter(v as LimitCategory | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: "Ліміти і пороги для бізнесу — ФОП, РРО, готівка, фінмон | FINTODO",
        description: `Шпаргалка ключових лімітів: обіг ФОП, РРО з 220 тис., готівка 10/50 тис., фінмон 400 тис., card-to-card. ${LIMITY.length} лімітів станом на ${LIMITY_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/limity`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Ліміти і пороги", url: `${SITE_URL}/dovidnyky/limity` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Ліміти і пороги" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Gauge className="h-6 w-6 text-primary" />
              Ліміти і пороги для бізнесу
            </h1>
            <p className="text-muted-foreground">
              Одна шпаргалка: коли треба переходити на іншу групу, ставити РРО, реєструватися
              платником ПДВ, ділити платіж навпіл, чекати фінмону. Snapshot на {LIMITY_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: ФОП, РРО, ПДВ, готівка, ЄСВ..."
            resultCount={filtered.length}
            resultLabel="лімітів"
            activeFilterCount={catFilter !== "all" ? 1 : 0}
            onResetFilters={() => setCatFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((l) => (
                <Card key={l.id} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="text-[10px] mb-1">
                        {LIMIT_CATEGORY_LABEL[l.category]}
                      </Badge>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">
                        {l.title}
                      </h3>
                    </div>
                  </div>

                  <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 mb-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-base tabular-nums">
                      <Target className="h-4 w-4 shrink-0" />
                      {l.value}
                    </div>
                    {l.baseFormula && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Формула: {l.baseFormula}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        <span className="text-foreground">Підстава:</span> {l.basis}
                      </span>
                    </div>
                    <div className="text-foreground">
                      <span className="text-muted-foreground">Застосовується: </span>
                      {l.appliesTo}
                    </div>
                    {l.consequence && (
                      <div className="flex items-start gap-2 pt-1 mt-1 border-t border-border/50">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          <span className="text-foreground">Наслідки:</span> {l.consequence}
                        </span>
                      </div>
                    )}
                    {l.notes?.map((n, i) => (
                      <p key={i} className="text-muted-foreground italic">
                        {n}
                      </p>
                    ))}
                  </div>

                  {l.tags && l.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
                      {l.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="limity" />
    </PortalLayout>
  );
};

export default LimityPage;
