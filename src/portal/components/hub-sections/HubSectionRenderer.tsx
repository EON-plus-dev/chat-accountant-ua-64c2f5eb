import type { HubSection, HubSectionType, ComparisonTableData, CalculatorData, TimelineData, ChecklistData, GrantsData, ServicesData, InfoBannerData, TopicsData, EuTopicsData, WarningBarData, KeyNumbersData, GuideData, RecentChangesData } from "@/portal/types/hub";
import { ComparisonTableSection } from "./ComparisonTableSection";
import { CalculatorSection } from "./CalculatorSection";
import { TimelineSection } from "./TimelineSection";
import { ChecklistSection } from "./ChecklistSection";
import { GrantsSection } from "./GrantsSection";
import { ServicesSection } from "./ServicesSection";
import { InfoBannerSection } from "./InfoBannerSection";
import { TopicsSection } from "./TopicsSection";
import { EuTopicsSection } from "./EuTopicsSection";
import { WarningBarSection } from "./WarningBarSection";
import { KeyNumbersSection } from "./KeyNumbersSection";
import { GuideSection } from "./GuideSection";
import { RecentChangesSection } from "./RecentChangesSection";

/** Canonical rendering order — hubs may skip types but never reorder them */
const SECTION_ORDER: HubSectionType[] = [
  'warning-bar',
  'info-banner',
  'key-numbers',
  'comparison-table',
  'topics',
  'guide',
  'checklist',
  'calculator',
  'recent-changes',
  'timeline',
  'grants',
  'eu-topics',
  'services',
];

interface Props {
  sections: HubSection[];
}

const SectionContent = ({ section }: { section: HubSection }) => {
  switch (section.type) {
    case 'comparison-table':
      return <ComparisonTableSection data={section.data as ComparisonTableData} />;
    case 'calculator':
      return <CalculatorSection data={section.data as CalculatorData} />;
    case 'timeline':
      return <TimelineSection data={section.data as TimelineData} />;
    case 'checklist':
      return <ChecklistSection data={section.data as ChecklistData} />;
    case 'grants':
      return <GrantsSection data={section.data as GrantsData} />;
    case 'services':
      return <ServicesSection data={section.data as ServicesData} />;
    case 'info-banner':
      return <InfoBannerSection data={section.data as InfoBannerData} />;
    case 'topics':
      return <TopicsSection data={section.data as TopicsData} />;
    case 'eu-topics':
      return <EuTopicsSection data={section.data as EuTopicsData} />;
    case 'warning-bar':
      return <WarningBarSection data={section.data as WarningBarData} />;
    case 'key-numbers':
      return <KeyNumbersSection data={section.data as KeyNumbersData} />;
    case 'guide':
      return <GuideSection data={section.data as GuideData} />;
    case 'recent-changes':
      return <RecentChangesSection data={section.data as RecentChangesData} />;
    default:
      return null;
  }
};

/** Sort sections by canonical order, preserving relative order for same-type sections */
const sortSections = (sections: HubSection[]): HubSection[] => {
  return [...sections].sort((a, b) => {
    const idxA = SECTION_ORDER.indexOf(a.type);
    const idxB = SECTION_ORDER.indexOf(b.type);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });
};

export const HubSectionRenderer = ({ sections }: Props) => {
  const sorted = sortSections(sections);

  return (
    <>
      {sorted.map((section) => {
        // Warning bar and info-banner render without section wrapper
        if (section.type === 'warning-bar' || section.type === 'info-banner') {
          return (
            <div key={section.id} id={section.id} className="pb-6">
              <SectionContent section={section} />
            </div>
          );
        }

        return (
          <section key={section.id} id={section.id} className="pb-8 space-y-4">
            <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
            {section.subtitle && (
              <p className="text-sm text-muted-foreground">{section.subtitle}</p>
            )}
            <SectionContent section={section} />
          </section>
        );
      })}
    </>
  );
};
