import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ExternalLink, Building2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  REGIONAL_OFFICES,
  REGIONAL_AUTHORITY_LABEL,
  REGIONAL_AUTHORITY_FULL,
  REGIONAL_OBLASTS,
  REGIONAL_OFFICES_AS_OF,
  type RegionalAuthority,
  type RegionalOblast,
} from "@/portal/data/regionalOffices";

const AUTHORITIES: RegionalAuthority[] = ["dps", "pfu", "tck", "labor", "customs"];

const AUTHORITY_VARIANT: Record<RegionalAuthority, "default" | "secondary" | "outline" | "destructive"> = {
  dps: "default",
  pfu: "secondary",
  tck: "destructive",
  labor: "outline",
  customs: "secondary",
};

const RegionalContactsPage = () => {
  const [authFilter, setAuthFilter] = useState<RegionalAuthority | "all">("all");
  const [oblastFilter, setOblastFilter] = useState<RegionalOblast | "all">("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const authCounts = useMemo(() => {
    const c: Record<string, number> = { all: REGIONAL_OFFICES.length };
    REGIONAL_OFFICES.forEach((o) => (c[o.authority] = (c[o.authority] || 0) + 1));
    return c;
  }, []);
  const oblastCounts = useMemo(() => {
    const c: Record<string, number> = { all: REGIONAL_OFFICES.length };
    REGIONAL_OFFICES.forEach((o) => (c[o.oblast] = (c[o.oblast] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return REGIONAL_OFFICES.filter((o) => {
      if (authFilter !== "all" && o.authority !== authFilter) return false;
      if (oblastFilter !== "all" && o.oblast !== oblastFilter) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        (o.phone?.toLowerCase().includes(q) ?? false) ||
        (o.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [authFilter, oblastFilter, search]);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Скопійовано");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const sidebar = (
    <>
      <FilterSection title="Орган">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі органи", count: authCounts.all },
            ...AUTHORITIES.filter((a) => (authCounts[a] || 0) > 0).map((a) => ({
              value: a,
              label: REGIONAL_AUTHORITY_LABEL[a],
              count: authCounts[a] || 0,
            })),
          ]}
          value={authFilter}
          onChange={(v) => setAuthFilter(v as RegionalAuthority | "all")}
        />
      </FilterSection>
      <FilterSection title="Область">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі області", count: oblastCounts.all },
            ...REGIONAL_OBLASTS.filter((o) => (oblastCounts[o] || 0) > 0).map((o) => ({
              value: o,
              label: o,
              count: oblastCounts[o] || 0,
            })),
          ]}
          value={oblastFilter}
          onChange={(v) => setOblastFilter(v as RegionalOblast | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Контакти держорганів по областях — ДПС, ТЦК, Держпраці, митниці | FINTODO",
        description: `Регіональний довідник: адреси, телефони, e-mail обласних офісів ДПС, ПФУ, ТЦК, Держпраці, митниць. ${REGIONAL_OFFICES.length} офісів станом на ${REGIONAL_OFFICES_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/regionalni-kontakty`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Регіональні контакти", url: `${SITE_URL}/dovidnyky/regionalni-kontakty` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Регіональні контакти" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Контакти держорганів по областях
            </h1>
            <p className="text-muted-foreground">
              Робочий телефонний довідник: куди дзвонити в обласне управління ДПС, ТЦК, Держпраці, митницю.
              Адреси, e-mail, графіки прийому. Snapshot станом на {REGIONAL_OFFICES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за назвою, адресою, телефоном..."
            resultCount={filtered.length}
            resultLabel="офісів"
            activeFilterCount={(authFilter !== "all" ? 1 : 0) + (oblastFilter !== "all" ? 1 : 0)}
            onResetFilters={() => {
              setAuthFilter("all");
              setOblastFilter("all");
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((o) => (
                <Card key={o.id} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <Badge variant={AUTHORITY_VARIANT[o.authority]} className="text-[10px] mb-1">
                        {REGIONAL_AUTHORITY_LABEL[o.authority]}
                      </Badge>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{o.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-foreground">
                        {o.postalCode && <span className="text-muted-foreground">{o.postalCode}, </span>}
                        {o.address}
                      </span>
                    </div>

                    {o.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <a href={`tel:${o.phone.replace(/\D/g, "")}`} className="text-foreground hover:text-primary tabular-nums">
                          {o.phone}
                        </a>
                        <button
                          onClick={() => copy(o.phone!, `phone-${o.id}`)}
                          className="text-muted-foreground hover:text-primary"
                          aria-label="Копіювати"
                        >
                          {copiedId === `phone-${o.id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}

                    {o.additionalPhones?.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 pl-5">
                        <span className="text-muted-foreground">{p.label}:</span>
                        <a href={`tel:${p.value.replace(/\D/g, "")}`} className="text-foreground hover:text-primary tabular-nums">
                          {p.value}
                        </a>
                      </div>
                    ))}

                    {o.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <a href={`mailto:${o.email}`} className="text-foreground hover:text-primary break-all">
                          {o.email}
                        </a>
                      </div>
                    )}

                    {o.schedule && (
                      <div className="text-muted-foreground pl-5">{o.schedule}</div>
                    )}

                    {o.url && (
                      <a
                        href={o.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline pl-5 mt-1"
                      >
                        Сайт <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {o.notes && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                      {o.notes}
                    </p>
                  )}
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Загальні гарячі лінії:</strong> ДПС — 0 800 501 007 ·
                ПФУ — 0 800 503 753 · Держпраці — 0 800 308 558 · Резерв+ — через mobile-додаток.
              </p>
              <p className="text-sm text-muted-foreground">
                <Link to="/dovidnyky/derzhorgany" className="text-primary hover:underline">
                  Загальний довідник держорганів →
                </Link>
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="regionalni-kontakty" />
    </PortalLayout>
  );
};

export default RegionalContactsPage;
