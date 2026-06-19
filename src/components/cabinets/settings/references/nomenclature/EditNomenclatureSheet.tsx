/**
 * EditNomenclatureSheet - Responsive sheet for editing nomenclature items
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { NomenclatureForm } from "./NomenclatureForm";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";

interface EditNomenclatureSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: NomenclatureItemV2;
  onSuccess: (item: NomenclatureItemV2) => void;
  cabinetId: string;
}

export const EditNomenclatureSheet = ({
  open,
  onOpenChange,
  item,
  onSuccess,
  cabinetId,
}: EditNomenclatureSheetProps) => {
  const handleSuccess = (updatedItem: NomenclatureItemV2) => {
    onSuccess(updatedItem);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b mb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            ✏️ Редагування позиції
          </SheetTitle>
          <SheetDescription>
            Внесіть зміни та збережіть
          </SheetDescription>
        </SheetHeader>

        <NomenclatureForm
          cabinetId={cabinetId}
          initialData={item}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
};
