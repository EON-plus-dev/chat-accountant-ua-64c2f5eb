import { useState } from "react";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatValue } from "@/lib/formatters";
import { EvidenceSheet } from "./EvidenceSheet";

export interface Driver {
  id: string;
  text: string;
  impact: string;
  direction: "positive" | "negative";
  evidence?: string[];
}

interface DriversSectionProps {
  drivers: Driver[];
  className?: string;
}

export const DriversSection = ({ drivers, className }: DriversSectionProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [evidenceDriver, setEvidenceDriver] = useState<Driver | null>(null);

  if (drivers.length === 0) return null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-medium text-muted-foreground px-1">Чому так?</p>
      {drivers.map((d) => {
        const isOpen = expanded === d.id;
        const Icon = d.direction === "positive" ? TrendingUp : TrendingDown;
        return (
          <div key={d.id} className="rounded-lg bg-card border border-border/70 overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : d.id)}
              className="w-full flex items-center gap-2 p-3 text-left min-h-[44px]"
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", d.direction === "positive" ? "text-success" : "text-destructive")} />
              <span className="text-sm flex-1 min-w-0">{d.text}</span>
              <span className={cn(
                "text-xs font-semibold tabular-nums flex-shrink-0",
                d.direction === "positive" ? "text-success" : "text-destructive"
              )}>
                {d.impact}
              </span>
              {d.evidence && d.evidence.length > 0 && (
                isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {isOpen && d.evidence && d.evidence.length > 0 && (
              <div className="px-3 pb-3 space-y-1 border-t border-border/50 pt-2">
                {d.evidence.slice(0, 3).map((e, i) => (
                  <p key={i} className="text-xs text-muted-foreground pl-6">• {e}</p>
                ))}
                {d.evidence.length > 3 && (
                  <button
                    onClick={() => setEvidenceDriver(d)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline pl-6 pt-1 min-h-[44px] md:min-h-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Всі {d.evidence.length} записів
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {evidenceDriver && (
        <EvidenceSheet
          open={!!evidenceDriver}
          onOpenChange={(v) => !v && setEvidenceDriver(null)}
          driverText={evidenceDriver.text}
          evidence={evidenceDriver.evidence ?? []}
        />
      )}
    </div>
  );
};
