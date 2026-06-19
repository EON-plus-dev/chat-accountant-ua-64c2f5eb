import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CourseAudience } from "@/portal/data/learn";
import { LearnFilterPanel } from "./LearnFilterPanel";
import { DEFAULT_FILTERS, type LearnFilters } from "./LearnToolbar";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: LearnFilters;
  onChange: (next: LearnFilters) => void;
  resultsCount: number;
  audienceCounts: Record<CourseAudience, number>;
}

export const LearnFilterSheet = ({
  open,
  onOpenChange,
  filters,
  onChange,
  resultsCount,
  audienceCounts,
}: Props) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0 flex flex-col">
        <SheetHeader className="px-4 pt-2 pb-3 border-b border-border/60">
          <SheetTitle className="text-base">Фільтри</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <LearnFilterPanel
            filters={filters}
            onChange={onChange}
            resultsCount={resultsCount}
            audienceCounts={audienceCounts}
            showSort
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border/60 bg-background">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            Скинути
          </Button>
          <Button size="sm" className="flex-[2]" onClick={() => onOpenChange(false)}>
            Показати {resultsCount}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
