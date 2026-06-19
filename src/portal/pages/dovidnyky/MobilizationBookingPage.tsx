import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Shield, AlertTriangle, ExternalLink, ClipboardCheck } from "lucide-react";
import {
  MOBILIZATION_ENTRIES, MOBILIZATION_AS_OF, MOBILIZATION_TOPIC_LABEL,
  type MobilizationTopic,
} from "@/portal/data/mobilizationBooking";

const TOPICS: MobilizationTopic[] = ["registration", "reservation", "summons", "mobilized_employee", "exemptions", "penalties"];

const MobilizationBookingPage = () => {
  const [topic, setTopic] = useState<MobilizationTopic | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MOBILIZATION_ENTRIES.filter((e) => {
      if (topic !== "all" && e.topic !== topic) return false;
      if (!q) return true;
      return e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q);
    });
  }, [topic, search]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Тема">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            ...TOPICS.map((t) => ({ value: t, label: MOBILIZATION_TOPIC_LABEL[t] })),
          ]}
          value={topic}
          onChange={(v) => setTopic(v as MobilizationTopic | "all")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Мобілізація і бронювання працівників 2026 — гід роботодавця | FINTODO",
        description: `Військовий облік на підприємстві, бронювання критично важливих, дії при повістці, гарантії мобілізованим, відстрочки, штрафи. Закон № 3633-IX, Постанова № 76. Snapshot ${MOBILIZATION_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/mobilizatsiya-bronyuvannya`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Мобілізація і бронювання", url: `${SITE_URL}/dovidnyky/mobilizatsiya-bronyuvannya` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Мобілізація і бронювання" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Мобілізація і бронювання працівників
            </h1>
            <p className="text-muted-foreground">
              Що зобов'язаний роботодавець: вести військовий облік, реагувати на повістки, зберігати робоче місце мобілізованим, бронювати критично важливих. ЗУ № 3633-IX, Постанова КМУ № 76, оновлення 2024–2026. Snapshot {MOBILIZATION_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: бронювання, повістка, відстрочка..."
            resultCount={filtered.length}
            resultLabel="тем"
            activeFilterCount={topic !== "all" ? 1 : 0}
            onResetFilters={() => setTopic("all")}
          >
            <div className="grid gap-3">
              {filtered.map((e) => (
                <Card key={e.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="text-base font-bold text-foreground">{e.title}</h3>
                    <Badge variant="outline" className="text-[10px]">{MOBILIZATION_TOPIC_LABEL[e.topic]}</Badge>
                  </div>

                  <p className="text-sm text-foreground">{e.summary}</p>

                  <div className="bg-muted/40 rounded p-2.5">
                    <div className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                      <ClipboardCheck className="h-3 w-3" />Покрокова інструкція
                    </div>
                    <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal pl-4">
                      {e.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </div>

                  {e.documents.length > 0 && (
                    <div className="text-[11px]">
                      <strong className="text-foreground">Документи:</strong>{" "}
                      <span className="text-muted-foreground">{e.documents.join(", ")}</span>
                    </div>
                  )}

                  {e.whoEligible && (
                    <div className="text-[11px]">
                      <strong className="text-foreground">Кого стосується:</strong>{" "}
                      <span className="text-muted-foreground">{e.whoEligible}</span>
                    </div>
                  )}

                  <div className="text-[11px]">
                    <strong className="text-foreground">Строки:</strong>{" "}
                    <span className="text-muted-foreground">{e.deadlines}</span>
                  </div>

                  {e.penalties && (
                    <div className="text-[11px] bg-destructive/5 border border-destructive/20 rounded p-2 flex items-start gap-1.5">
                      <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                      <div><strong className="text-destructive">Відповідальність:</strong> <span className="text-foreground/80">{e.penalties}</span></div>
                    </div>
                  )}

                  <a href={e.legalBasisUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />{e.legalBasis}
                  </a>
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="mobilizatsiya-bronyuvannya" />
    </PortalLayout>
  );
};

export default MobilizationBookingPage;
