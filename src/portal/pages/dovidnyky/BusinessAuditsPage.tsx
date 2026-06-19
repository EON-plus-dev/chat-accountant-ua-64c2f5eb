import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Sparkles, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  BUSINESS_AUDITS,
  AUDIT_KIND_LABEL,
  BUSINESS_AUDITS_AS_OF,
  type AuditEntryKind,
} from "@/portal/data/businessAudits";

const KINDS: AuditEntryKind[] = [
  "tax_audit", "labor_audit", "consumer_audit", "fire_audit", "eco_audit", "amcu_audit",
  "rights", "moratorium", "checklist", "appeal",
];

const KIND_BADGE_CLASS: Record<AuditEntryKind, string> = {
  tax_audit: "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30",
  labor_audit: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30",
  consumer_audit: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
  fire_audit: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30",
  eco_audit: "bg-lime-500/15 text-lime-700 dark:text-lime-400 border border-lime-500/30",
  amcu_audit: "bg-pink-500/15 text-pink-700 dark:text-pink-400 border border-pink-500/30",
  rights: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30",
  moratorium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
  checklist: "bg-primary/15 text-primary border border-primary/30",
  appeal: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-500/30",
};

const BusinessAuditsPage = () => {
  const [kindFilter, setKindFilter] = useState<AuditEntryKind | "all">("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: BUSINESS_AUDITS.length };
    BUSINESS_AUDITS.forEach((e) => (c[e.kind] = (c[e.kind] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return BUSINESS_AUDITS.filter((e) => {
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.legalRef.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [kindFilter, search]);

  const sidebar = (
    <FilterSection title="Тип запису">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Усі", count: counts.all },
          ...KINDS.map((k) => ({ value: k, label: AUDIT_KIND_LABEL[k], count: counts[k] || 0 })),
        ]}
        value={kindFilter}
        onChange={(v) => setKindFilter(v as AuditEntryKind | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `Перевірки бізнесу — ДПС, Держпраці, ДСНС, мораторії, оскарження | FINTODO`,
        description: `Усі типи перевірок: камеральна, документальна планова/позапланова, фактична ДПС, Держпраці, Держспоживслужба, ДСНС, АМКУ. Мораторії 2026, права платника, чек-листи, оскарження ППР.`,
        canonical: `${SITE_URL}/dovidnyky/perevirky-biznesu`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Перевірки бізнесу", url: `${SITE_URL}/dovidnyky/perevirky-biznesu` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Перевірки бізнесу" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-primary" />
              Перевірки бізнесу — типи, права, оскарження
            </h1>
            <p className="text-muted-foreground">
              Камеральні, документальні, фактичні перевірки ДПС; Держпраці, ДСНС, АМКУ. Мораторії
              воєнного часу, права платника при перевірці, чек-листи готовності і строки оскарження.
              Snapshot {BUSINESS_AUDITS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: камеральна, мораторій, ППР, оскарження..."
            resultCount={filtered.length}
            resultLabel="записів"
            activeFilterCount={kindFilter !== "all" ? 1 : 0}
            onResetFilters={() => setKindFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((e) => (
                <Card key={e.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-[10px] ${KIND_BADGE_CLASS[e.kind]}`}>
                          {AUDIT_KIND_LABEL[e.kind]}
                        </Badge>
                        {e.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{e.name}</h3>
                    </div>
                  </div>

                  <p className="text-[12px] text-foreground/90 mb-2">{e.description}</p>

                  <div className="text-[11px] text-muted-foreground italic mb-2">{e.legalRef}</div>

                  {e.details && e.details.length > 0 && (
                    <ul className="text-[11px] space-y-0.5 ml-3 list-disc text-muted-foreground mb-2">
                      {e.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}

                  {e.practicalNote && (
                    <div className="flex items-start gap-1.5 text-[11px] text-foreground/80 bg-muted/40 rounded-md px-2 py-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                      <span>{e.practicalNote}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Що робити при перевірці
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>Вимагайте службове + наказ/направлення — без цього НЕ допускайте.</li>
                <li>Не давайте оригіналів — лише засвідчені копії з описом.</li>
                <li>Призначте відповідального (бухгалтера, юриста) для супроводу.</li>
                <li>Письмово фіксуйте всі дії інспектора у журналі реєстрації перевірок.</li>
                <li>Заперечення на акт — 10 робочих днів, скарга на ППР — 10 робочих днів.</li>
                <li>Судове оскарження ППР — 1095 днів, зупиняє стягнення.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="perevirky-biznesu" />
    </PortalLayout>
  );
};

export default BusinessAuditsPage;
