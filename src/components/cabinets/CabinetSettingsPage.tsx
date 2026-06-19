import type { Cabinet } from "@/types/cabinet";
import { 
  getSettingsSubTabs, 
  getFirstSettingsSubTab, 
  getSettingsSubTabsForPassive, 
  getFirstSettingsSubTabForPassive 
} from "@/config/settingsConfig";
import { ProfileRequisitesSection } from "./settings/ProfileRequisitesSection";
import { TaxProfileSection } from "./settings/TaxProfileSection";
import { GoalsBudgetSection } from "./settings/GoalsBudgetSection";
import { KvedLicensingSection } from "./settings/KvedLicensingSection";
import { KepSignaturesSection } from "./settings/KepSignaturesSection";
import { SignatureLogPage } from "./signing/SignatureLogPage";
import { ConnectionsSection } from "./settings/ConnectionsSection";
import { DocumentPoliciesSection } from "./settings/DocumentPoliciesSection";
import { AiActionsSection } from "./settings/AiActionsSection";
import { CabinetNotificationsSection } from "./settings/CabinetNotificationsSection";
import { TeamAccessSection } from "./settings/TeamAccessSection";
import { NetworkPartnersSection } from "./settings/NetworkPartnersSection";
import { ConnectionsPrivacySection } from "./settings/ConnectionsPrivacySection";
import { ReferencesSection } from "./settings/ReferencesSection";
import { PassiveCabinetBanner } from "./PassiveCabinetBanner";
import { SalonSettingsSection } from "./settings/bookings/SalonSettingsSection";
import IndividualSettingsHub from "./individual/IndividualSettingsHub";
import CabinetSettingsHub from "./management/CabinetSettingsHub";
import { DrillStackProvider, DrillStackHost } from "@/components/shared/drill-stack";
import {
  HubBreadcrumbProvider,
  useHubBreadcrumb,
  type HubCrumb,
} from "./shared/hub-breadcrumb/HubBreadcrumbContext";
import { HubBreadcrumbBar } from "./shared/hub-breadcrumb/HubBreadcrumbBar";

interface CabinetSettingsPageProps {
  cabinet: Cabinet;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onNavigateToCreateTemplate?: () => void;
  onNavigateToTemplateDetail?: (templateId: string) => void;
  activeReferenceCategory?: string | null;
  onReferenceCategoryChange?: (category: string | null) => void;
  // In-place reference detail navigation
  selectedContractorId?: string | null;
  selectedNomenclatureId?: string | null;
  selectedFixedAssetId?: string | null;
  onSelectContractor?: (id: string | null) => void;
  onSelectNomenclature?: (id: string | null) => void;
  onSelectFixedAsset?: (id: string | null) => void;
}

export const CabinetSettingsPage = (props: CabinetSettingsPageProps) => {
  const { cabinet, activeSubTab } = props;
  const isPassive = cabinet.accessMode === "passive";

  const availableTabs = isPassive
    ? getSettingsSubTabsForPassive(cabinet.type)
    : getSettingsSubTabs(cabinet.type, cabinet);

  const defaultTab = isPassive
    ? getFirstSettingsSubTabForPassive(cabinet.type)
    : getFirstSettingsSubTab(cabinet.type, cabinet);

  const currentTab = activeSubTab || defaultTab;
  const isHub = currentTab === "__hub__" || currentTab === "hub";
  const isTabAllowed = isHub || availableTabs.some((tab) => tab.id === currentTab);
  const effectiveTab = isTabAllowed ? currentTab : defaultTab;

  return (
    <DrillStackProvider>
      <HubBreadcrumbProvider resetKey={effectiveTab}>
        <SettingsContent {...props} effectiveTab={effectiveTab} availableTabs={availableTabs} />
      </HubBreadcrumbProvider>
      <DrillStackHost cabinetId={cabinet.id} />
    </DrillStackProvider>
  );
};

interface ContentProps extends CabinetSettingsPageProps {
  effectiveTab: string;
  availableTabs: ReturnType<typeof getSettingsSubTabs>;
}

function SettingsContent({
  cabinet,
  effectiveTab,
  availableTabs,
  onSubTabChange,
  onNavigateToCreateTemplate,
  onNavigateToTemplateDetail,
  activeReferenceCategory,
  onReferenceCategoryChange,
  selectedContractorId,
  selectedNomenclatureId,
  selectedFixedAssetId,
  onSelectContractor,
  onSelectNomenclature,
  onSelectFixedAsset,
}: ContentProps) {
  const { extraCrumbs } = useHubBreadcrumb();
  const isIndividual = cabinet.type === "individual";
  const hubSentinel = isIndividual ? "hub" : "__hub__";
  const isHubView = effectiveTab === "hub" || effectiveTab === "__hub__";
  const currentTabLabel = availableTabs.find((t) => t.id === effectiveTab)?.label;

  // Скидає всі відкриті extras (категорія/сутність) — щоб клік по верхній
  // крихті завжди повертав на чистий рівень незалежно від глибини deep-link'у.
  const resetExtras = () => {
    for (const c of extraCrumbs) c.onSelect?.();
    onReferenceCategoryChange?.(null);
    onSelectContractor?.(null);
    onSelectNomenclature?.(null);
    onSelectFixedAsset?.(null);
  };

  const trail: HubCrumb[] = [
    { id: hubSentinel, label: "Налаштування", onSelect: () => { resetExtras(); onSubTabChange?.(hubSentinel); } },
    ...(!isHubView && currentTabLabel
      ? [
          {
            id: effectiveTab,
            label: currentTabLabel,
            onSelect: () => {
              // На випадок Довідників — повертаємось до сітки категорій
              if (effectiveTab === "references") {
                onReferenceCategoryChange?.(null);
                onSelectContractor?.(null);
                onSelectNomenclature?.(null);
                onSelectFixedAsset?.(null);
              }
              onSubTabChange?.(effectiveTab);
            },
          },
        ]
      : []),
    ...extraCrumbs,
  ];

  const renderContent = () => {
    switch (effectiveTab) {
      case "hub":
        return <IndividualSettingsHub cabinet={cabinet} onSubTabChange={onSubTabChange} />;
      case "__hub__":
        return <CabinetSettingsHub cabinet={cabinet} onSubTabChange={onSubTabChange} />;
      case "profile-requisites":
        return <ProfileRequisitesSection cabinet={cabinet} />;
      case "tax-profile":
        return <TaxProfileSection cabinet={cabinet} />;
      case "goals-budget":
        return (
          <GoalsBudgetSection
            cabinet={cabinet}
            onNavigateToTaxProfile={() => onSubTabChange?.("tax-profile")}
          />
        );
      case "kved-licensing":
        return <KvedLicensingSection cabinet={cabinet} />;
      case "kep-signatures":
        return <KepSignaturesSection cabinet={cabinet} />;
      case "signature-log":
        return <SignatureLogPage cabinet={cabinet} />;
      case "connections":
      case "integrations":
      case "data-sources":
        return <ConnectionsSection cabinet={cabinet} />;
      case "document-policies":
        return (
          <DocumentPoliciesSection
            cabinet={cabinet}
            onNavigateToCreateTemplate={onNavigateToCreateTemplate}
            onNavigateToTemplateDetail={onNavigateToTemplateDetail}
          />
        );
      case "ai-actions":
        return <AiActionsSection cabinet={cabinet} />;
      case "notifications":
        return <CabinetNotificationsSection cabinet={cabinet} />;
      case "team-access":
        return <TeamAccessSection cabinet={cabinet} />;
      case "network-partners":
        return <NetworkPartnersSection cabinet={cabinet} />;
      case "connections-privacy": {
        const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
        return (
          <ConnectionsPrivacySection
            cabinet={cabinet}
            initialInnerTab={params.get("inner") ?? undefined}
            initialSubscriptionId={params.get("subId")}
          />
        );
      }
      case "salon":
        return <SalonSettingsSection cabinet={cabinet} />;
      case "references":
        return (
          <ReferencesSection
            cabinet={cabinet}
            defaultCategory={activeReferenceCategory}
            onCategoryChange={onReferenceCategoryChange}
            selectedContractorId={selectedContractorId}
            selectedNomenclatureId={selectedNomenclatureId}
            selectedFixedAssetId={selectedFixedAssetId}
            onSelectContractor={onSelectContractor}
            onSelectNomenclature={onSelectNomenclature}
            onSelectFixedAsset={onSelectFixedAsset}
          />
        );
      default:
        return <ProfileRequisitesSection cabinet={cabinet} />;
    }
  };

  return (
    <div className="min-h-[400px] px-4 md:px-6 py-4 space-y-4 min-w-0 overflow-x-hidden">
      <PassiveCabinetBanner cabinet={cabinet} />
      {!isHubView && <HubBreadcrumbBar crumbs={trail} />}
      {renderContent()}
    </div>
  );
}

export default CabinetSettingsPage;
