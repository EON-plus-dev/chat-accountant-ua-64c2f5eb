/**
 * AddNomenclatureSheet - Responsive sheet for adding new nomenclature items
 * Mobile: Bottom sheet, Desktop: Right panel
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { NomenclatureForm, type NomenclatureFormData } from "./NomenclatureForm";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";

interface AddNomenclatureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (item: NomenclatureItemV2) => void;
  cabinetId: string;
}

export const AddNomenclatureSheet = ({
  open,
  onOpenChange,
  onSuccess,
  cabinetId,
}: AddNomenclatureSheetProps) => {
  const handleSuccess = (item: NomenclatureItemV2) => {
    onSuccess(item);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b mb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            ➕ Нова позиція номенклатури
          </SheetTitle>
          <SheetDescription>
            Заповніть обов'язкові поля та додаткову інформацію за потреби
          </SheetDescription>
        </SheetHeader>

        <NomenclatureForm
          cabinetId={cabinetId}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
};
