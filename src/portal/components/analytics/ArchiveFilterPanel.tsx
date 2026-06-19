import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArchiveCategory = "all" | "currency" | "indices" | "key" | "forecast";
export type ArchiveRange = "1y" | "3y" | "5y" | "10y" | "all";

export const CATEGORY_OPTIONS: { id: ArchiveCategory; label: string; emoji: string }[] = [
  { id: "all", label: "Усі", emoji: "🗂" },
  { id: "currency", label: "Валюти", emoji: "💱" },
  { id: "indices", label: "Індекси", emoji: "📊" },
  { id: "key", label: "Ключові цифри", emoji: "📌" },
  { id: "forecast", label: "Прогнози", emoji: "🔮" },
];

export const RANGE_OPTIONS: { id: ArchiveRange; label: string }[] = [
  { id: "1y", label: "1Р" },
  { id: "3y", label: "3Р" },
  { id: "5y", label: "5Р" },
  { id: "10y", label: "10Р" },
  { id: "all", label: "Усе" },
];

interface Props {
  category: ArchiveCategory;
  range: ArchiveRange;
  query: string;
  onCategory: (c: ArchiveCategory) => void;
  onRange: (r: ArchiveRange) => void;
  onQuery: (q: string) => void;
  onReset: () => void;
  counts: Record<ArchiveCategory, number>;
}

export function ArchiveFilterPanel({ category, range, query, onCategory, onRange, onQuery, onReset, counts }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Пошук</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Назва показника..."
            className="pl-8 h-9 text-sm"
          />
          {query && (
            <button onClick={() => onQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Категорія</Label>
        <RadioGroup value={category} onValueChange={(v) => onCategory(v as ArchiveCategory)} className="space-y-1">
          {CATEGORY_OPTIONS.map((o) => (
            <Label key={o.id} htmlFor={`cat-${o.id}`} className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-muted/60 transition-colors",
              category === o.id && "bg-muted text-foreground font-medium"
            )}>
              <RadioGroupItem id={`cat-${o.id}`} value={o.id} className="sr-only" />
              <span>{o.emoji}</span>
              <span className="flex-1">{o.label}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{counts[o.id]}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Період</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => onRange(r.id)}
              className={cn(
                "h-8 rounded-md border text-xs font-medium transition-colors",
                range === r.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onReset} className="w-full">Скинути фільтри</Button>
    </div>
  );
}
