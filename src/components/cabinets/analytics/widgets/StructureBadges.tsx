import { cn } from "@/lib/utils";

export interface StructureBadgeItem {
  id: string;
  label: string;
  value: string;
  percent?: number;
}

interface StructureBadgesProps {
  items: StructureBadgeItem[];
  maxVisible?: number;
  className?: string;
}

export const StructureBadges = ({ items, maxVisible = 8, className }: StructureBadgesProps) => {
  if (items.length === 0) return null;

  const visible = items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visible.map((item) => (
        <div
          key={item.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border/70 text-xs"
        >
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-semibold tabular-nums">{item.value}</span>
          {item.percent !== undefined && (
            <span className="text-muted-foreground">({item.percent}%)</span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground">
          +{remaining} ще
        </div>
      )}
    </div>
  );
};
