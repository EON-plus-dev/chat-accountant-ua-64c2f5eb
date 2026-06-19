import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { KeyNumbersData } from "@/portal/types/hub";

interface Props {
  data: KeyNumbersData;
}

const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
  if (!trend) return null;
  const icons = {
    up: <TrendingUp className="w-3.5 h-3.5 text-destructive" />,
    down: <TrendingDown className="w-3.5 h-3.5 text-primary" />,
    stable: <Minus className="w-3.5 h-3.5 text-muted-foreground" />,
  };
  return icons[trend];
};

export const KeyNumbersSection = ({ data }: Props) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {data.items.map((item, i) => (
        <Card key={i} className="p-4 text-center space-y-1 border-border/60">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-2xl font-bold font-mono text-primary tracking-tight">
              {item.value}
            </span>
            <TrendIcon trend={item.trend} />
          </div>
          <p className="text-xs font-medium text-foreground">{item.label}</p>
          {item.sublabel && (
            <p className="text-[10px] text-muted-foreground leading-tight">{item.sublabel}</p>
          )}
          {item.audience && (
            <span className="inline-block text-[9px] font-medium text-primary/80 bg-primary/10 rounded-full px-2 py-0.5 mt-1">
              {item.audience}
            </span>
          )}
        </Card>
      ))}
    </div>
  );
};
