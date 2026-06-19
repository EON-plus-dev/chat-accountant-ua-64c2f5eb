import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface ContentFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll?: () => void;
}

export default function ContentFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Пошук...",
  filters,
  filterValues,
  onFilterChange,
  onClearAll,
}: ContentFiltersProps) {
  const hasActiveFilters = searchValue || Object.values(filterValues).some(v => v && v !== "all");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9 h-9"
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={filterValues[filter.key] || "all"}
          onValueChange={(v) => onFilterChange(filter.key, v)}
        >
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі {filter.label.toLowerCase()}</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActiveFilters && onClearAll && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="h-9 gap-1 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Скинути
        </Button>
      )}
    </div>
  );
}
