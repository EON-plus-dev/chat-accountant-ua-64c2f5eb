/**
 * SalonMasterDrillView — обгортка MasterProfilePage у DrillSheet (kind="salon-master").
 *
 * Викликається з:
 *   - MastersGrid (картка майстра у Бронюваннях)
 *   - MastersSettingsSection (кнопка «Профіль»)
 *   - MasterDelegationsSection (клік на ім'я)
 *   - DiaryPage (кнопка «Мій профіль»)
 */

import { useMemo } from "react";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { salonMasters } from "@/config/demoCabinets/salonData";
import {
  MasterProfilePage,
  type MasterProfileMode,
} from "@/components/cabinets/masters/MasterProfilePage";

interface Props {
  masterId: string;
  cabinetId?: string;
  mode?: MasterProfileMode;
  sourceLabel?: string;
  onEditInSettings?: (masterId: string) => void;
}

export function SalonMasterDrillView({
  masterId,
  cabinetId,
  mode = "salon-admin",
  sourceLabel,
  onEditInSettings,
}: Props) {
  const { popAll } = useDrillStack();
  const master = useMemo(() => salonMasters.find((m) => m.id === masterId), [masterId]);

  return (
    <DrillSheet
      matchKind="salon-master"
      matchId={masterId}
      title={master?.fullName ?? "Профіль майстра"}
      sourceLabel={sourceLabel}
      contentClassName="sm:max-w-3xl"
    >
      <div className="-mx-6 -my-4">
        <MasterProfilePage
          masterId={masterId}
          cabinetId={cabinetId}
          mode={mode}
          onEditInSettings={
            onEditInSettings
              ? (id) => {
                  popAll();
                  onEditInSettings(id);
                }
              : undefined
          }
        />
      </div>
    </DrillSheet>
  );
}
