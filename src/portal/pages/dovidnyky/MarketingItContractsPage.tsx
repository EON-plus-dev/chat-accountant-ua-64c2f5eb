import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { FileText, ShieldCheck, AlertTriangle, Package } from "lucide-react";
import {
  CONTRACT_TEMPLATES,
  CONTRACT_CATEGORY_LABEL,
  CONTRACT_BUNDLES,
  CONTRACTS_AS_OF,
  type ContractCategory,
} from "@/portal/data/marketingItContracts";

const CATS: ContractCategory[] = ["ip","services","confidential","saas","marketing","team"];

const MarketingItContractsPage = () => {
  const [cat, setCat] = useState<ContractCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CONTRACT_TEMPLATES.filter((c) => {
      if (cat !== "all" && c.category !== cat) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
    });
  }, [cat, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, ...CATS.map((c) => ({ value: c, label: CONTRACT_CATEGORY_LABEL[c] }))]}
          value={cat}
          onChange={(v) => setCat(v as ContractCategory | "all")}
        />
      </FilterSection>
    </div>
  );

  const findById = (id: string) => CONTRACT_TEMPLATES.find((t) => t.id === id);

  return (
    <PortalLayout
      meta={{
        title: "Юридичні шаблони IT і маркетингу 2026: NDA, IP, MSA, SaaS | FINTODO",
        description: "Усе необхідне для IT-стартапу та агенції: NDA, IP Assignment, MSA, договори з ФОП, SaaS TOS, Privacy Policy, DPA, договори з інфлюенсерами. Snapshot " + CONTRACTS_AS_OF + ".",
        canonical: `${SITE_URL}/dovidnyky/it-shablony-dohovoriv`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Шаблони договорів IT/маркетинг", url: `${SITE_URL}/dovidnyky/it-shablony-dohovoriv` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Шаблони договорів IT/маркетинг" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Юридичні шаблони для IT і маркетингу
            </h1>
            <p className="text-muted-foreground">
              Покривають весь життєвий цикл проекту: переговори (NDA) → робота з підрядниками (MSA + IP) → запуск SaaS (TOS + Privacy + DPA) → маркетинг (інфлюенсери, PPC, контент). Snapshot {CONTRACTS_AS_OF}.
            </p>
          </header>

          {/* Пакети */}
          <Card className="p-4 space-y-3 bg-primary/5 border-primary/20">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Готові пакети
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {CONTRACT_BUNDLES.map((b) => (
                <div key={b.id} className="bg-background rounded p-3 border border-border space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground">{b.name}</h3>
                    <Badge variant="default" className="text-[10px] font-mono shrink-0">{b.priceUah.toLocaleString("uk-UA")} ₴</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {b.templates.map((tid) => {
                      const t = findById(tid);
                      return t ? (
                        <Badge key={tid} variant="outline" className="text-[10px]">{t.name}</Badge>
                      ) : null;
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">{b.whoFor}</p>
                </div>
              ))}
            </div>
          </Card>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="NDA, MSA, GDPR..."
            resultCount={filtered.length}
            resultLabel="шаблонів"
            activeFilterCount={cat !== "all" ? 1 : 0}
            onResetFilters={() => setCat("all")}
          >
            <div className="grid gap-3">
              {filtered.map((t) => (
                <Card key={t.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-primary" />
                          {t.name}
                        </h3>
                        {t.isNew && <Badge variant="default" className="text-[10px]">Новий</Badge>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">{CONTRACT_CATEGORY_LABEL[t.category]}</Badge>
                        {t.formats.map((f) => (
                          <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-muted-foreground">У юриста ~</div>
                      <div className="text-sm font-bold font-mono text-foreground">{t.estimateLawyerUah.toLocaleString("uk-UA")} ₴</div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{t.summary}</p>

                  <div className="text-xs bg-muted/40 rounded p-2.5">
                    <span className="font-semibold text-foreground">Хто потребує:</span>{" "}
                    <span className="text-muted-foreground">{t.whoNeeds}</span>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground mb-1.5">Ключові положення</div>
                    <ul className="text-xs text-foreground space-y-1 list-disc pl-4">
                      {t.keyClauses.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <div className="bg-muted/40 rounded p-2.5">
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">Правова база</div>
                      <ul className="text-[11px] text-foreground space-y-0.5">
                        {t.laws.map((l, i) => <li key={i}>· {l}</li>)}
                      </ul>
                    </div>
                    <div className="bg-destructive/5 border border-destructive/20 rounded p-2.5">
                      <div className="text-[10px] uppercase text-destructive mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />Ризик без договору
                      </div>
                      <p className="text-[11px] text-foreground">{t.riskWithout}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="it-shablony-dohovoriv" />
    </PortalLayout>
  );
};

export default MarketingItContractsPage;
