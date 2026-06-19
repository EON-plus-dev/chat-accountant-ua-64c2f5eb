import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Home, BarChart3, Briefcase, Settings, ScrollText, Building2 } from "lucide-react";
import type { TabType } from "./WorkspacePanel";
import type { Cabinet } from "@/types/cabinet";
import { getOperationsSubTabs } from "@/config/operationsConfig";
import { getSettingsSubTabs } from "@/config/settingsConfig";
import { cn } from "@/lib/utils";
import { individualLauncherGroups } from "./individualLauncherNav";

interface NavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeCabinet?: Cabinet | null;
  onBackToCabinets?: () => void;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  cabinets?: Cabinet[];
  onCabinetEnter?: (cabinet: Cabinet) => void;
  onViewAllCabinets?: () => void;
}

const getTabsForContext = (hasCabinet: boolean) => {
  if (hasCabinet) {
    return [
      { id: "overview" as TabType, label: "Огляд", icon: Home },
      { id: "operations" as TabType, label: "Управління", icon: Briefcase },
      { id: "event-journal" as TabType, label: "Події", icon: ScrollText },
      { id: "analytics" as TabType, label: "Аналітика", icon: BarChart3 },
      { id: "settings" as TabType, label: "Налаштування", icon: Settings },
    ];
  }
  return [
    { id: "cabinets" as TabType, label: "Кабінети", icon: Building2 },
    { id: "analytics" as TabType, label: "Аналітика", icon: BarChart3 },
  ];
};

/** Update ?inner search param without triggering a route re-render. */
const setInnerParam = (inner?: string) => {
  const sp = new URLSearchParams(window.location.search);
  if (inner) sp.set("inner", inner);
  else sp.delete("inner");
  const qs = sp.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${qs ? `?${qs}` : ""}`,
  );
};

const NavigationDrawer = ({
  open,
  onOpenChange,
  activeTab,
  onTabChange,
  activeCabinet,
  activeSubTab,
  onSubTabChange,
  onViewAllCabinets,
}: NavigationDrawerProps) => {
  const operationsSubTabs = activeCabinet
    ? getOperationsSubTabs(activeCabinet)
    : [];
  const settingsSubTabs = activeCabinet
    ? getSettingsSubTabs(activeCabinet.type, activeCabinet)
    : [];

  const isIndividualOps =
    activeCabinet?.type === "individual" && activeTab === "operations";

  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);

    if (tab === "operations" && (operationsSubTabs.length > 0 || activeCabinet?.type === "individual")) {
      if (activeCabinet?.type !== "individual") {
        if (!activeSubTab || !operationsSubTabs.some((s) => s.id === activeSubTab)) {
          onSubTabChange?.(operationsSubTabs[0].id);
        }
      }
      return; // keep drawer open so user can pick subtab
    }
    if (tab === "settings" && settingsSubTabs.length > 0) {
      if (!activeSubTab || !settingsSubTabs.some((s) => s.id === activeSubTab)) {
        onSubTabChange?.(settingsSubTabs[0].id);
      }
      return;
    }
    onOpenChange(false);
  };

  const handleSubTabSelect = (subTabId: string) => {
    onSubTabChange?.(subTabId);
    onOpenChange(false);
  };

  const handleLauncherTile = (target: string, inner?: string) => {
    setInnerParam(inner);
    onSubTabChange?.(target);
    onOpenChange(false);
  };

  const tabs = getTabsForContext(!!activeCabinet);

  // Plain flat sub-tabs for non-individual cabinets
  const flatSubTabs =
    activeTab === "operations" && !isIndividualOps
      ? operationsSubTabs
      : activeTab === "settings"
        ? settingsSubTabs
        : [];

  const flatSectionLabel =
    activeTab === "operations"
      ? "Управління"
      : activeTab === "settings"
        ? "Налаштування"
        : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-safe">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Навігація</DrawerTitle>
        </DrawerHeader>

        {/* TOP: Sections grid */}
        <div className="px-3 pt-4 pb-2">
          <div
            className={cn(
              "grid gap-1.5",
              tabs.length >= 5 ? "grid-cols-5" : tabs.length === 4 ? "grid-cols-4" : "grid-cols-2"
            )}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-start gap-1.5 px-1 py-2.5 rounded-2xl transition-all min-h-[76px] active:scale-[0.97]",
                    isActive
                      ? "bg-primary/10 ring-1 ring-primary/50"
                      : "bg-muted/40 hover:bg-muted/70"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background text-muted-foreground"
                    )}
                  >
                    <tab.icon className="w-[18px] h-[18px]" />
                  </span>
                  <span
                    className={cn(
                      "text-[11px] leading-[1.15] tracking-tight text-center break-words hyphens-auto",
                      isActive ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM (individual / Управління): 14 модулів у 5 групах */}
        {isIndividualOps && (
          <div className="px-3 pt-2 pb-3 border-t border-border/40 mt-1 max-h-[58vh] overflow-y-auto">
            {individualLauncherGroups.map((group) => (
              <div key={group.id} className="mb-3 last:mb-0">
                <div className="flex items-center gap-2 px-1 pb-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.1em]">
                    {group.title}
                  </span>
                  <div className="h-px bg-border/50 flex-1" />
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                    {group.tiles.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.tiles.map((tile) => {
                    const Icon = tile.icon;
                    const isActive =
                      activeSubTab === tile.target &&
                      (tile.inner
                        ? new URLSearchParams(window.location.search).get("inner") === tile.inner
                        : true);
                    return (
                      <button
                        key={tile.id}
                        onClick={() => handleLauncherTile(tile.target, tile.inner)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-xl transition-all min-h-[48px] text-left active:scale-[0.97]",
                          isActive
                            ? "bg-card ring-1 ring-primary shadow-sm"
                            : "bg-muted/40 hover:bg-muted/70"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-colors",
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "bg-background text-muted-foreground"
                          )}
                        >
                          <Icon className="w-[15px] h-[15px]" />
                        </span>
                        <span
                          className={cn(
                            "text-[12px] leading-tight truncate",
                            isActive
                              ? "text-foreground font-semibold"
                              : "text-foreground/85 font-medium"
                          )}
                        >
                          {tile.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM (інші типи): плоский список підрозділів */}
        {!isIndividualOps && flatSubTabs.length > 0 && flatSectionLabel && (
          <div className="px-3 pt-2 pb-3 border-t border-border/40 mt-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-[0.1em] px-1 pb-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              {flatSectionLabel}
              <span className="text-muted-foreground/40 font-normal">/</span>
              <span className="font-normal">підрозділи</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {flatSubTabs.map((subTab, idx) => {
                const Icon = subTab.icon;
                const isActive = activeSubTab === subTab.id;
                const isLastOdd = idx === flatSubTabs.length - 1 && flatSubTabs.length % 2 === 1;
                return (
                  <button
                    key={subTab.id}
                    onClick={() => handleSubTabSelect(subTab.id)}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-xl transition-all min-h-[52px] active:scale-[0.97] text-left",
                      isActive
                        ? "bg-card ring-1 ring-primary shadow-sm"
                        : "bg-muted/40 hover:bg-muted/70",
                      isLastOdd && "col-span-2"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-colors",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-background text-muted-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span
                      className={cn(
                        "text-[12.5px] leading-tight truncate",
                        isActive ? "text-foreground font-semibold" : "text-foreground/85 font-medium"
                      )}
                    >
                      {subTab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER: Усі кабінети — завжди доступно */}
        {onViewAllCabinets && (
          <div className="px-3 pt-2 pb-3 border-t border-border/40 mt-1">
            <button
              onClick={() => {
                onViewAllCabinets();
                onOpenChange(false);
              }}
              className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 hover:bg-muted/80 active:scale-[0.98] transition-all min-h-[52px] text-left"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-background text-muted-foreground shrink-0">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="flex-1 text-[13px] font-semibold text-foreground">
                Усі кабінети
              </span>
              <span className="text-muted-foreground/60 text-lg leading-none">›</span>
            </button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default NavigationDrawer;
