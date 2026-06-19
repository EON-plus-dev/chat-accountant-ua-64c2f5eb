import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Cabinet } from "@/types/cabinet";
import { UnifiedContractorSearch } from "./UnifiedContractorSearch";

interface AddContractorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinet: Cabinet;
  onSuccess?: () => void;
  onNavigateToContractor?: (contractorId: string) => void;
}

export const AddContractorSheet = ({
  open,
  onOpenChange,
  cabinet,
  onSuccess,
  onNavigateToContractor,
}: AddContractorSheetProps) => {
  const isMobile = useIsMobile();

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const handleNavigateToContractor = (contractor: { id: string }) => {
    onOpenChange(false);
    onNavigateToContractor?.(contractor.id);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col p-0",
          isMobile ? "h-[90dvh] rounded-t-2xl" : "w-full sm:max-w-lg"
        )}
      >
        <SheetHeader className="px-4 py-4 sm:px-6 border-b shrink-0">
          <SheetTitle>Додати контрагента</SheetTitle>
          <SheetDescription>
            Введіть код для пошуку в базі, системі та реєстрах
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0">
          <UnifiedContractorSearch
            cabinet={cabinet}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
            onNavigateToContractor={handleNavigateToContractor}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
