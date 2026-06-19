import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterPill {
  value: string;
  label: string;
  count?: number;
}

interface Props {
  pills: FilterPill[];
  activeValue: string;
  onPillChange: (value: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  resultCount?: number;
  resultLabel?: string;
  children?: ReactNode;
}

export const StickyFilterBar = ({
  pills,
  activeValue,
  onPillChange,
  search,
  onSearchChange,
  searchPlaceholder = "Пошук...",
  resultCount,
  resultLabel = "результатів",
}: Props) => {
  return (
    <div className="sticky top-14 z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/40 transition-shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        {/* Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
          {pills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => onPillChange(pill.value)}
              className={`
                shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                transition-colors whitespace-nowrap
                ${activeValue === pill.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }
              `}
            >
              {pill.label}
              {pill.count !== undefined && (
                <span className={`font-mono text-[10px] ${activeValue === pill.value ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                  {pill.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Result count */}
        {resultCount !== undefined && (
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            {resultCount} {resultLabel}
          </span>
        )}

        {/* Search */}
        {onSearchChange && (
          <div className="relative w-full sm:w-48 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pl-8 text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
};
