import type { Cabinet } from "@/types/cabinet";
import {
  getOperationsSubTabs,
  getOperationsSubTabsForPassive,
} from "@/config/operationsConfig";
import { CabinetLauncherShell } from "./shared/CabinetLauncherShell";
import { buildOperationsLauncherGroups } from "./shared/launcherGrouping";

interface Props {
  cabinet: Cabinet;
  onOpenModule: (subtab: string) => void;
}

/**
 * Картковий хаб «Управління» для business / fop (та fop-group fallback).
 * Замінює горизонтальні pill-tabs на згруповану сітку тайлів — патерн взято з individual.
 */
export function CabinetManagementHub({ cabinet, onOpenModule }: Props) {
  const isPassive = cabinet.accessMode === "passive";
  const subtabs = isPassive
    ? getOperationsSubTabsForPassive(cabinet.type)
    : getOperationsSubTabs(cabinet);

  const groups = buildOperationsLauncherGroups(cabinet.type, subtabs);

  return (
    <CabinetLauncherShell
      title="Управління"
      subtitleFallback={
        isPassive ? "Режим контрагента — доступні розділи" : "Усі робочі розділи кабінету"
      }
      groups={groups}
      onOpenModule={onOpenModule}
    />
  );
}

export default CabinetManagementHub;
