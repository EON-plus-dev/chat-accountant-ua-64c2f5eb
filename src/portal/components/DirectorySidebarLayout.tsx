import { ReactNode, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Props {
  sidebar: ReactNode;
  children: ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  resultCount?: number;
  resultLabel?: string;
  activeFilterCount?: number;
  onResetFilters?: () => void;
  toolbar?: ReactNode;
}

export const DirectorySidebarLayout = ({
  sidebar,
  children,
  search,
  onSearchChange,
  searchPlaceholder = "Пошук...",
  resultCount,
  resultLabel = "результатів",
  activeFilterCount = 0,
  onResetFilters,
  toolbar,
}: Props) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search bar + mobile filter trigger */}
      <div className="flex items-center gap-2">
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 h-9 text-sm"
            />
          </div>
        )}

        {/* Mobile filter trigger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden shrink-0 h-9 gap-1.5">
              <SlidersHorizontal className="h-4 w-4" />
              Фільтри
              {activeFilterCount > 0 && (
                <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-sm font-semibold">Фільтри</SheetTitle>
                {activeFilterCount > 0 && onResetFilters && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={onResetFilters}>
                    <X className="h-3 w-3 mr-1" />Скинути
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-5rem)]">
              {sidebar}
            </div>
          </SheetContent>
        </Sheet>

        {resultCount !== undefined && (
          <span className="text-xs text-muted-foreground font-mono shrink-0 hidden sm:inline">
            {resultCount} {resultLabel}
          </span>
        )}
      </div>

      {toolbar}

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-20 space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            {activeFilterCount > 0 && onResetFilters && (
              <Button variant="ghost" size="sm" className="h-7 w-full justify-start px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5" onClick={onResetFilters}>
                <X className="h-3 w-3" />Скинути фільтри
              </Button>
            )}
            {sidebar}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
};

/* Reusable filter section for sidebar */
export const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="space-y-2">
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
    {children}
  </div>
);

/* Reusable radio-style filter list */
export const FilterRadioGroup = ({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-0.5">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
          value === opt.value
            ? "bg-primary/10 text-primary font-medium"
            : "text-foreground hover:bg-muted"
        }`}
      >
        <span>{opt.label}</span>
        {opt.count !== undefined && (
          <span className={`font-mono text-[10px] ${value === opt.value ? "text-primary/70" : "text-muted-foreground"}`}>
            {opt.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

/* Reusable checkbox filter list */
export const FilterCheckboxGroup = ({
  options,
  values,
  onChange,
}: {
  options: { value: string; label: string; count?: number }[];
  values: string[];
  onChange: (values: string[]) => void;
}) => (
  <div className="space-y-0.5">
    {options.map((opt) => {
      const checked = values.includes(opt.value);
      return (
        <button
          key={opt.value}
          onClick={() =>
            onChange(
              checked
                ? values.filter((v) => v !== opt.value)
                : [...values, opt.value]
            )
          }
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
            checked
              ? "bg-primary/10 text-primary font-medium"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
              checked ? "bg-primary border-primary text-primary-foreground" : "border-border"
            }`}>
              {checked && "✓"}
            </span>
            {opt.label}
          </span>
          {opt.count !== undefined && (
            <span className="font-mono text-[10px] text-muted-foreground">{opt.count}</span>
          )}
        </button>
      );
    })}
  </div>
);
