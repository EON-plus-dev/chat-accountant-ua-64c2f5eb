import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { getContractorsForCabinet } from "@/config/settingsConfig";
import { ContractorDetailPage } from "./ContractorDetailPage";

interface ContractorCardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractorCode: string | null;
  cabinet: Cabinet;
  onOpenFullPage?: (contractorId: string) => void;
  onNavigateToDocument?: (documentId: string) => void;
}

export const ContractorCardSheet = ({
  open,
  onOpenChange,
  contractorCode,
  cabinet,
  onOpenFullPage,
  onNavigateToDocument,
}: ContractorCardSheetProps) => {
  // Find contractor by code
  const contractor = useMemo(() => {
    if (!contractorCode) return null;
    const contractors = getContractorsForCabinet(cabinet);
    return contractors.find(c => c.code === contractorCode) || null;
  }, [contractorCode, cabinet]);

  const handleOpenFullPage = () => {
    if (contractor) {
      onOpenChange(false);
      onOpenFullPage?.(contractor.id);
    }
  };

  const handleNavigateToDocument = (docId: string) => {
    onOpenChange(false);
    onNavigateToDocument?.(docId);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="responsive-right" 
        className="p-0 overflow-hidden flex flex-col w-full sm:max-w-lg"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            {contractor?.name || "Картка контрагента"}
          </SheetTitle>
        </SheetHeader>
        
        {contractor ? (
          <>
            <div className="flex-1 overflow-auto">
              <ContractorDetailPage
                mode="sheet"
                contractorId={contractor.id}
                cabinet={cabinet}
                onNavigateToDocument={handleNavigateToDocument}
              />
            </div>
            
            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-background border-t p-4 pb-safe">
              <Button 
                className="w-full gap-2"
                onClick={handleOpenFullPage}
              >
                <ExternalLink className="h-4 w-4" />
                Відкрити повну картку
              </Button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Контрагента не знайдено</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
