import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Sparkles, Globe, Clock, DollarSign, BookOpen, ShieldCheck, Building2, User } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  CERTIFICATIONS,
  CERT_CATEGORY_LABEL,
  CERT_CATEGORY_SCOPE,
  CERT_SCOPE_LABEL,
  CERTS_AS_OF,
  type CertCategory,
  type CertScope,
  type Certification,
} from "@/portal/data/certifications";

const PROFESSIONAL_CATS: CertCategory[] = ['finance', 'project', 'it', 'security', 'data', 'service'];
const BUSINESS_CATS: CertCategory[] = ['quality', 'food', 'product', 'esg', 'privacy', 'industry'];

const CAT_BADGE: Record<CertCategory, string> = {
  finance:  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  project:  'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  it:       'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  security: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30',
  data:     'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  service:  'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30',
  quality:  'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30',
  food:     'bg-lime-500/15 text-lime-700 dark:text-lime-400 border border-lime-500/30',
  product:  'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30',
  esg:      'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30',
  privacy:  'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-500/30',
  industry: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30',
};

const getScope = (c: Certification): CertScope => c.scope ?? CERT_CATEGORY_SCOPE[c.category];

const CertificationsPage = () => {
  const [scopeFilter, setScopeFilter] = useState<CertScope | "all">("all");
  const [catFilter, setCatFilter] = useState<CertCategory | "all">("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const cat: Record<string, number> = { all: CERTIFICATIONS.length };
    const scope: Record<string, number> = { all: CERTIFICATIONS.length, professional: 0, business: 0 };
    CERTIFICATIONS.forEach((o) => {
      cat[o.category] = (cat[o.category] || 0) + 1;
      scope[getScope(o)] += 1;
    });
    return { cat, scope };
  }, []);

  // Які категорії показати в фільтрі залежно від обраного scope
  const visibleCats = useMemo<CertCategory[]>(() => {
    if (scopeFilter === "professional") return PROFESSIONAL_CATS;
    if (scopeFilter === "business") return BUSINESS_CATS;
    return [...PROFESSIONAL_CATS, ...BUSINESS_CATS];
  }, [scopeFilter]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CERTIFICATIONS.filter((o) => {
      if (scopeFilter !== "all" && getScope(o) !== scopeFilter) return false;
      if (catFilter !== "all" && o.category !== catFilter) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.issuer.toLowerCase().includes(q) ||
        o.tagline.toLowerCase().includes(q) ||
        (o.applicableTo?.toLowerCase().includes(q) ?? false)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }, [scopeFilter, catFilter, search]);

  const activeFilters = (scopeFilter !== "all" ? 1 : 0) + (catFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Кому">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: counts.scope.all },
            { value: "professional", label: "Для людини", count: counts.scope.professional },
            { value: "business", label: "Для компанії", count: counts.scope.business },
          ]}
          value={scopeFilter}
          onChange={(v) => {
            setScopeFilter(v as CertScope | "all");
            setCatFilter("all");
          }}
        />
      </FilterSection>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі", count: visibleCats.reduce((s, c) => s + (counts.cat[c] || 0), 0) },
            ...visibleCats.map((k) => ({
              value: k,
              label: CERT_CATEGORY_LABEL[k],
              count: counts.cat[k] || 0,
            })),
          ]}
          value={catFilter}
          onChange={(v) => setCatFilter(v as CertCategory | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Сертифікації для людини і бізнесу 2026 — ACCA, PMP, ISO 9001, HACCP, B Corp, SOC 2 | FINTODO`,
        description: `Каталог ${CERTIFICATIONS.length}+ сертифікацій: професійні (ACCA, CIMA, CFA, PMP, AWS, CISSP) і бізнесові (ISO 9001/14001/27001, HACCP, CE, FDA, B Corp, EcoVadis, SOC 2, PCI DSS, GMP). Передумови, вартість у ₴/$, акредитовані органи в Україні. Snapshot ${CERTS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/sertyfikatsii`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Сертифікації", url: `${SITE_URL}/dovidnyky/sertyfikatsii` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Сертифікації" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Сертифікації для людини і бізнесу
            </h1>
            <p className="text-muted-foreground">
              {CERTIFICATIONS.length} сертифікацій: <strong>{counts.scope.professional} професійних</strong> (для фахівців — ACCA, PMP, AWS, CISSP)
              та <strong>{counts.scope.business} бізнесових</strong> (для компанії — ISO 9001/14001/27001, HACCP, CE, B Corp, SOC 2, GMP).
              Передумови, тривалість, вартість у ₴/$, акредитовані органи в Україні. Snapshot {CERTS_AS_OF}.
            </p>

            {/* Scope segment switcher — duplicated up here for mobile-friendly access */}
            <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
              <Button
                size="sm"
                variant={scopeFilter === "all" ? "default" : "ghost"}
                onClick={() => { setScopeFilter("all"); setCatFilter("all"); }}
              >
                Усі ({counts.scope.all})
              </Button>
              <Button
                size="sm"
                variant={scopeFilter === "professional" ? "default" : "ghost"}
                onClick={() => { setScopeFilter("professional"); setCatFilter("all"); }}
                className="gap-1.5"
              >
                <User className="h-3.5 w-3.5" /> Для людини ({counts.scope.professional})
              </Button>
              <Button
                size="sm"
                variant={scopeFilter === "business" ? "default" : "ghost"}
                onClick={() => { setScopeFilter("business"); setCatFilter("all"); }}
                className="gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5" /> Для компанії ({counts.scope.business})
              </Button>
            </div>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: ACCA, PMP, ISO 9001, HACCP, CE, B Corp..."
            resultCount={filtered.length}
            resultLabel="сертифікацій"
            activeFilterCount={activeFilters}
            onResetFilters={() => { setScopeFilter("all"); setCatFilter("all"); }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((o) => {
                const scope = getScope(o);
                const isBiz = scope === "business";
                return (
                <Card key={o.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <Badge className={`text-[10px] ${isBiz ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'}`}>
                          {isBiz ? <Building2 className="h-2.5 w-2.5 inline mr-1" /> : <User className="h-2.5 w-2.5 inline mr-1" />}
                          {CERT_SCOPE_LABEL[scope]}
                        </Badge>
                        <Badge className={`text-[10px] ${CAT_BADGE[o.category]}`}>
                          {CERT_CATEGORY_LABEL[o.category]}
                        </Badge>
                        {o.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                        {o.mandatoryFor && (
                          <Badge className="text-[10px] bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30 gap-0.5">
                            <ShieldCheck className="h-3 w-3" /> Обовʼязково
                          </Badge>
                        )}
                        {o.validityYears && !isBiz && (
                          <Badge variant="outline" className="text-[10px]">
                            Поновл. кожні {o.validityYears} р.
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-foreground leading-snug flex items-center gap-2 flex-wrap">
                        <span className="text-lg leading-none">{o.emoji}</span>
                        <span className="font-mono text-primary">{o.code}</span>
                        <span className="text-muted-foreground font-normal text-[11px] truncate">— {o.issuer}</span>
                      </h3>
                      <p className="text-[12px] text-foreground/80 mt-1">{o.name}</p>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/80 mb-2">{o.tagline}</p>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {isBiz ? 'Впровадження' : 'Тривалість'}</div>
                      <div className="text-[11px] font-semibold text-foreground">{o.duration}</div>
                    </div>
                    <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><BookOpen className="h-2.5 w-2.5" /> {isBiz ? 'Аудит' : 'Іспитів'}</div>
                      <div className="text-[11px] font-semibold text-foreground">
                        {isBiz ? (o.auditCycle ? o.auditCycle.split(',')[0] : 'аудит') : o.examsCount}
                      </div>
                    </div>
                    <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><DollarSign className="h-2.5 w-2.5" /> Вартість</div>
                      <div className="text-[11px] font-semibold text-foreground">{o.costUsd}</div>
                    </div>
                  </div>

                  {isBiz && o.applicableTo && (
                    <div className="text-[11px] mb-1">
                      <span className="text-muted-foreground">Кому: </span>
                      <span className="text-foreground">{o.applicableTo}</span>
                    </div>
                  )}
                  {!isBiz && (
                    <div className="text-[11px] mb-1">
                      <span className="text-muted-foreground">Передумови: </span>
                      <span className="text-foreground">{o.prerequisites}</span>
                    </div>
                  )}
                  <div className="text-[11px] mb-2 flex items-center gap-1">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Визнання:</span>
                    <span className="text-foreground">{o.recognizedIn}</span>
                  </div>

                  <div className="mb-2">
                    <div className="text-[10px] text-muted-foreground mb-1">
                      {isBiz ? 'Акредитовані органи в Україні:' : 'Готують в Україні:'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(isBiz && o.ukrainianBodies ? o.ukrainianBodies : o.uaPartners).slice(0, 5).map((p) => (
                        <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/5 border border-primary/15 text-foreground">
                          {p}
                        </span>
                      ))}
                      {((isBiz && o.ukrainianBodies ? o.ukrainianBodies : o.uaPartners).length > 5) && (
                        <span className="text-[10px] text-muted-foreground">+{(isBiz && o.ukrainianBodies ? o.ukrainianBodies : o.uaPartners).length - 5}</span>
                      )}
                    </div>
                  </div>

                  {o.legalBasis && (
                    <div className="text-[10px] text-muted-foreground mb-2">
                      <span className="font-medium">Нормативка:</span> {o.legalBasis}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border text-[11px]">
                    <a href={o.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Globe className="h-3 w-3" /> Офіційний сайт
                    </a>
                  </div>
                </Card>
              );})}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="sertyfikatsii" />
    </PortalLayout>
  );
};

export default CertificationsPage;
