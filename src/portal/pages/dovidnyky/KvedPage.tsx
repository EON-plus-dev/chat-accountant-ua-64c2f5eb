import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup, FilterCheckboxGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { KVED_ENTRIES } from "@/portal/data/kved";

const SCENARIOS = [
  { id: "it", emoji: "💻", label: "IT", codes: ["62.01", "62.02", "63.11", "63.12"] },
  { id: "trade", emoji: "🛒", label: "Торгівля", codes: ["47.91", "45.20", "46.90"] },
  { id: "services", emoji: "🔧", label: "Послуги", codes: ["96.01", "96.02", "74.10", "73.11"] },
  { id: "education", emoji: "📚", label: "Освіта", codes: ["85.59", "85.51", "85.60"] },
  { id: "creative", emoji: "🎨", label: "Креатив", codes: ["74.10", "73.11", "59.11"] },
  { id: "medicine", emoji: "🏥", label: "Медицина", codes: ["86.21", "86.23", "86.90", "75.00"] },
  { id: "transport", emoji: "🚛", label: "Транспорт", codes: ["49.41", "49.32", "52.29", "53.20"] },
  { id: "construction", emoji: "🏗️", label: "Будівництво", codes: ["43.21", "41.20", "43.29", "43.34"] },
  { id: "realestate", emoji: "🏠", label: "Нерухомість", codes: ["68.20", "68.31", "68.10"] },
  { id: "agriculture", emoji: "🌾", label: "С/г", codes: ["01.11", "01.13", "01.47", "01.50"] },
  { id: "food", emoji: "🍞", label: "Харчова", codes: ["10.11", "10.71", "10.39", "11.07"] },
  { id: "horeca", emoji: "🍽️", label: "HoReCa", codes: ["55.10", "56.10", "56.21", "56.29"] },
  { id: "legal", emoji: "⚖️", label: "Юристи", codes: ["69.10", "69.20", "70.22"] },
  { id: "beauty", emoji: "💅", label: "Краса", codes: ["96.02", "96.04", "93.13"] },
  { id: "entertainment", emoji: "🎭", label: "Розваги", codes: ["90.01", "90.03", "93.29"] },
];

const SECTION_DESCRIPTIONS: Record<string, string> = {
  "A — Сільське господарство": "Рослинництво, тваринництво, змішане господарство",
  "C — Переробна промисловість": "Харчова промисловість, виробництво, переробка",
  "F — Будівництво": "Будівельні, електромонтажні та ремонтні роботи",
  "G — Торгівля": "Роздрібна та оптова торгівля, маркетплейси, авто",
  "H — Транспорт": "Вантажні та пасажирські перевезення, логістика",
  "I — Харчування": "Ресторани, кафе, кейтеринг, фуд-бізнес",
  "J — Інформація та телекомунікації": "IT, розробка, телеком, медіа",
  "L — Нерухомість": "Оренда, управління, агентства нерухомості",
  "M — Професійна діяльність": "Юристи, бухгалтери, дизайнери, консалтинг",
  "P — Освіта": "Курси, тренінги, репетиторство, онлайн-освіта",
  "Q — Охорона здоров'я": "Медична практика, стоматологія, терапія",
  "R — Мистецтво та розваги": "Фітнес, розваги, мистецтво, концертна діяльність",
  "S — Інші послуги": "Перукарні, салони краси, SPA, побутові послуги",
};

const KvedPage = () => {
  const [search, setSearch] = useState("");
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState("all");
  const [fopGroupFilter, setFopGroupFilter] = useState<string[]>([]);
  const [licenseFilter, setLicenseFilter] = useState("all");

  const sections = useMemo(() => {
    const sectionSet = new Set(KVED_ENTRIES.map(k => k.section));
    return Array.from(sectionSet).sort();
  }, []);

  const sectionOptions = useMemo(() => [
    { value: "all", label: "Всі секції", count: KVED_ENTRIES.length },
    ...sections.map(s => ({
      value: s,
      label: s.split(" — ")[0],
      count: KVED_ENTRIES.filter(k => k.section === s).length,
    })),
  ], [sections]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const scenarioCodes = activeScenario
      ? SCENARIOS.find(s => s.id === activeScenario)?.codes || []
      : [];

    return KVED_ENTRIES.filter((k) => {
      if (activeScenario && !scenarioCodes.includes(k.code)) return false;
      if (sectionFilter !== "all" && k.section !== sectionFilter) return false;
      if (fopGroupFilter.length > 0 && !fopGroupFilter.some(g => k.fopGroups.includes(Number(g) as 1 | 2 | 3))) return false;
      if (licenseFilter === "yes" && !k.requiresLicense) return false;
      if (licenseFilter === "no" && k.requiresLicense) return false;
      return !q || k.code.includes(q) || k.name.toLowerCase().includes(q) || k.description.toLowerCase().includes(q);
    });
  }, [search, activeScenario, sectionFilter, fopGroupFilter, licenseFilter]);

  const filteredGroups = useMemo(() => {
    const groups: Record<string, typeof KVED_ENTRIES> = {};
    filtered.forEach((k) => {
      if (!groups[k.section]) groups[k.section] = [];
      groups[k.section].push(k);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleScenarioClick = (id: string) => {
    setActiveScenario(prev => prev === id ? null : id);
    setSearch("");
    setSectionFilter("all");
    setFopGroupFilter([]);
    setLicenseFilter("all");
  };

  const activeFilterCount =
    (sectionFilter !== "all" ? 1 : 0) +
    fopGroupFilter.length +
    (licenseFilter !== "all" ? 1 : 0) +
    (activeScenario ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Секція">
        <FilterRadioGroup options={sectionOptions} value={sectionFilter} onChange={(v) => { setSectionFilter(v); setActiveScenario(null); }} />
      </FilterSection>
      <FilterSection title="Група ФОП">
        <FilterCheckboxGroup
          options={[
            { value: "1", label: "1 група" },
            { value: "2", label: "2 група" },
            { value: "3", label: "3 група" },
          ]}
          values={fopGroupFilter}
          onChange={(v) => { setFopGroupFilter(v); setActiveScenario(null); }}
        />
      </FilterSection>
      <FilterSection title="Ліцензія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі" },
            { value: "yes", label: "Потрібна", count: KVED_ENTRIES.filter(k => k.requiresLicense).length },
            { value: "no", label: "Не потрібна", count: KVED_ENTRIES.filter(k => !k.requiresLicense).length },
          ]}
          value={licenseFilter}
          onChange={(v) => { setLicenseFilter(v); setActiveScenario(null); }}
        />
      </FilterSection>
    </>
  );

  const scenariosToolbar = (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          onClick={() => handleScenarioClick(s.id)}
          className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border text-sm transition-all ${
            activeScenario === s.id
              ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
              : "border-border bg-card hover:border-primary/40 text-foreground"
          }`}
        >
          <span className="text-lg">{s.emoji}</span>
          <span className="text-xs font-medium">{s.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: `КВЕД — ${KVED_ENTRIES.length} кодів видів діяльності для ФОП | FINTODO`,
        description: `Повний довідник ${KVED_ENTRIES.length} кодів КВЕД з дозволеними групами ФОП, вимогами ліцензування та прикладами бізнесів.`,
        canonical: `${SITE_URL}/dovidnyky/kved`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "КВЕД", url: `${SITE_URL}/dovidnyky/kved` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "КВЕД" },
        ]} />

        <div className="space-y-6 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-foreground">КВЕД — класифікатор видів діяльності</h1>
            <p className="text-muted-foreground">Для кожного коду: дозволені групи ФОП, ліцензії та приклади бізнесів</p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={(v) => { setSearch(v); setActiveScenario(null); }}
            searchPlaceholder="Код або назва..."
            resultCount={filtered.length}
            resultLabel="кодів"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => { setActiveScenario(null); setSectionFilter("all"); setFopGroupFilter([]); setLicenseFilter("all"); }}
            toolbar={scenariosToolbar}
          >
            <div className="space-y-6">
              {filteredGroups.map(([section, entries]) => (
                <section key={section} className="space-y-2">
                  <div className="border-b border-border pb-1.5">
                    <h2 className="text-sm font-semibold text-foreground">{section}</h2>
                    {SECTION_DESCRIPTIONS[section] && (
                      <p className="text-xs text-muted-foreground mt-0.5">{SECTION_DESCRIPTIONS[section]}</p>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {entries.map((entry) => (
                      <Link key={entry.code} to={`/dovidnyky/kved/${entry.code}`}>
                        <Card className="p-3 flex flex-col gap-1.5 hover:border-primary/40 transition-colors cursor-pointer h-full">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-mono text-xs font-bold text-primary">{entry.code}</span>
                              <h3 className="text-sm font-semibold text-foreground mt-0.5 line-clamp-1">{entry.name}</h3>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {entry.isPopular && <Badge variant="success" size="sm" className="text-[10px]">⭐</Badge>}
                              {entry.requiresLicense && <Badge variant="warning" size="sm" className="text-[10px]">📄</Badge>}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{entry.description}</p>
                          <div className="flex gap-1">
                            {entry.fopGroups.map((g) => (
                              <Badge key={g} variant="outline" size="sm" className="text-[10px]">Гр.{g}</Badge>
                            ))}
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}

              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-6">
                  Нічого не знайдено{search ? ` за запитом «${search}»` : ""}
                </p>
              )}

              <Card className="p-5 border-primary/20 bg-primary/5 space-y-2">
                <h2 className="text-base font-bold text-foreground">Не знаєте яку групу ФОП обрати?</h2>
                <p className="text-sm text-muted-foreground">Tax Wizard підбере оптимальну систему оподаткування за 2 хвилини.</p>
                <Link to="/tools/tax-wizard">
                  <Button size="sm">Пройти Tax Wizard <ArrowRight className="ml-2 h-3.5 w-3.5" /></Button>
                </Link>
              </Card>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="kved" />
    </PortalLayout>
  );
};

export default KvedPage;
