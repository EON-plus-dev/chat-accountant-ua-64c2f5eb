export type HubSectionType =
  | 'comparison-table'
  | 'calculator'
  | 'timeline'
  | 'checklist'
  | 'grants'
  | 'services'
  | 'info-banner'
  | 'topics'
  | 'eu-topics'
  | 'warning-bar'
  | 'key-numbers'
  | 'guide'
  | 'recent-changes';

export interface KeyNumberItem {
  value: string;
  label: string;
  sublabel?: string;
  trend?: 'up' | 'down' | 'stable';
  audience?: string;
}

export interface KeyNumbersData {
  items: KeyNumberItem[];
}

export interface GuideItem {
  title: string;
  subtitle?: string;
  steps: string[];
}

export interface GuideData {
  guides: GuideItem[];
}

export interface ComparisonTableData {
  headers: string[];
  rows: { label: string; values: string[] }[];
}

export interface CalculatorData {
  calcType: 'esv' | 'tax' | 'salary';
}

export interface TimelineData {
  taxType?: string;
  limit?: number;
}

export interface ChecklistData {
  items: string[];
  variant?: 'check' | 'numbered';
}

export interface GrantData {
  org: string;
  name: string;
  amount: string;
  deadline: string;
  type: 'grant' | 'loan';
}

export interface GrantsData {
  items: GrantData[];
}

export interface ServiceItem {
  emoji: string;
  name: string;
  desc: string;
  href: string;
}

export interface ServicesData {
  items: ServiceItem[];
  columns?: number;
}

export interface InfoBannerData {
  text: string;
  subtext: string;
  link: string;
  linkLabel: string;
}

export interface TopicsData {
  items: { label: string; slug: string; count?: number }[];
  linkPrefix?: string;
}

export interface EuTopicsData {
  items: { title: string; desc: string }[];
}

export interface WarningBarData {
  text: string;
  linkText: string;
  linkHref: string;
}

export interface RecentChangesData {
  category?: string;
  limit?: number;
}

export interface HubSection {
  id: string;
  type: HubSectionType;
  title: string;
  subtitle?: string;
  data:
    | ComparisonTableData
    | CalculatorData
    | TimelineData
    | ChecklistData
    | GrantsData
    | ServicesData
    | InfoBannerData
    | TopicsData
    | EuTopicsData
    | WarningBarData
    | KeyNumbersData
    | GuideData
    | RecentChangesData;
}

export interface AnchorCard {
  label: string;
  icon: string;
  sectionId: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FilterPill {
  value: string;
  label: string;
}

export interface HubSidebarConfig {
  deadlineWidget?: { taxType?: string };
  quickCalcWidget?: boolean;
  trendingWidget?: { category: string; limit?: number };
  relatedTools?: string[];
  relatedHubs?: string[];
  showNewsletter?: boolean;
  customLinks?: { label: string; sublabel: string; href: string; emoji: string }[];
}

export interface HubConfig {
  id: string;
  breadcrumbParent?: { label: string; to: string };
  slug: string;
  meta: {
    title: string;
    description: string;
    canonical: string;
  };
  breadcrumbLabel: string;
  title: string;
  subtitle: string;
  updatedAt: string;

  // Content
  anchorCards?: AnchorCard[];
  sections: HubSection[];
  faqItems?: FaqItem[];
  featuredArticleSlug?: string;

  // Sidebar
  sidebar: HubSidebarConfig;

  // CTA
  cta: {
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
  };

  // Articles filter
  articleFilter?: {
    category?: string;
    audience?: string;
    tag?: string;
    pills: FilterPill[];
  };

  // Stats
  stats?: { value: string; label: string }[];

  // Dark hero (for wartime)
  darkHero?: boolean;
}
