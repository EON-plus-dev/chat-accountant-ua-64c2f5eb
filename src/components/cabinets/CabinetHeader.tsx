import { Home, BarChart3, Briefcase, Settings, ArrowLeft, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Cabinet } from "@/types/cabinet";
import { cn } from "@/lib/utils";
import { getEntityStyle } from "@/config/entityStyles";
import { getFirstOperationsSubTab } from "@/config/operationsConfig";

export type CabinetTabType =
  | "overview"
  | "operations"
  | "event-journal"
  | "analytics"
  | "settings"
  | "profile"
  // Legacy individual top-tabs — kept in type for backwards compatibility
  // (some routes/links may still reference these). They no longer appear in
  // the header; their content moved into operations sub-tabs.
  | "work-center"
  | "orders"
  | "documents"
  | "savings"
  | "network"
  | "ai-center";

interface CabinetHeaderProps {
  cabinet: Cabinet;
  activeTab: CabinetTabType;
  onTabChange: (tab: CabinetTabType) => void;
  onBackToCabinets?: () => void;
  onSubTabChange?: (subTab: string) => void;
}

// Unified 5-tab layout for ALL cabinet types (business / fop / individual).
// Individual cabinets used to have 11 top-tabs (Robochyi tsentr, Zamovlennia,
// Dokumenty, Zaoshchadzhennia, Merezha, AI-tsentr) — those moved INTO the
// operations sub-tab strip to keep the header consistent and free of clutter.
const defaultTabs = [
  { id: "overview" as CabinetTabType, label: "Огляд", icon: Home },
  { id: "operations" as CabinetTabType, label: "Управління", icon: Briefcase },
  { id: "event-journal" as CabinetTabType, label: "Події", icon: ScrollText },
  { id: "analytics" as CabinetTabType, label: "Аналітика", icon: BarChart3 },
  { id: "settings" as CabinetTabType, label: "Налаштування", icon: Settings },
];

const CabinetHeader = ({
  cabinet,
  activeTab,
  onTabChange,
  onBackToCabinets,
  onSubTabChange,
}: CabinetHeaderProps) => {
  const entityStyle = getEntityStyle(cabinet.type);
  const tabs = defaultTabs;
  
  return (
    <div className="bg-sidebar text-sidebar-foreground flex-shrink-0 w-full flex flex-col">
      <div className="flex items-center gap-1 px-2 h-10 overflow-x-auto scrollbar-hide">
        {/* Inline Tab Navigation */}
        <nav className="flex items-center gap-0.5 flex-nowrap" role="tablist" aria-label="Секції кабінету">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => {
                onTabChange(tab.id);
                // Auto-select first sub-tab when switching to operations
                if (tab.id === "operations") {
                  const firstSubTab = getFirstOperationsSubTab(cabinet.type);
                  onSubTabChange?.(firstSubTab);
                }
              }}
              className={cn(
                "gap-1.5 h-8 px-3 rounded-md text-sm font-medium transition-colors relative",
                activeTab === tab.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {/* Active tab accent indicator */}
              {activeTab === tab.id && (
                <span className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-full",
                  entityStyle.accentBorder
                )} />
              )}
            </Button>
          ))}
        </nav>
      </div>
      
      {/* Accent border line under header */}
      <div className={cn("h-0.5 rounded-full", entityStyle.accentBorder)} />
    </div>
  );
};

export default CabinetHeader;
