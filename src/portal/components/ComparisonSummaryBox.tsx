import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import type { ComparisonData } from "@/portal/data/comparisons";

export const ComparisonSummaryBox = ({ leftTitle, rightTitle, leftItems, rightItems }: ComparisonData) => (
  <Card className="p-6 mt-4">
    <h3 className="text-lg font-bold text-foreground mb-4">⚖️ Порівняння</h3>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <p className="font-semibold text-foreground border-b border-border pb-2">{leftTitle}</p>
        {leftItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            {item.type === 'pro' ? (
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <X className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            )}
            <span className={item.type === 'pro' ? 'text-foreground' : 'text-muted-foreground'}>{item.text}</span>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <p className="font-semibold text-foreground border-b border-border pb-2">{rightTitle}</p>
        {rightItems.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            {item.type === 'pro' ? (
              <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <X className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            )}
            <span className={item.type === 'pro' ? 'text-foreground' : 'text-muted-foreground'}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  </Card>
);
