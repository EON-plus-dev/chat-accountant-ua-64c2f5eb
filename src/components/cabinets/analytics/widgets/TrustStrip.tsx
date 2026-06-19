import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import type { DataSource } from "@/config/cabinetAnalyticsConfig";
import { cn } from "@/lib/utils";

interface TrustStripProps {
  dataSources: DataSource[];
  className?: string;
}

export const TrustStrip = ({ dataSources, className }: TrustStripProps) => {
  const total = dataSources.length;
  if (total === 0) return null;

  const connected = dataSources.filter(s => s.status === "connected").length;
  const hasErrors = dataSources.some(s => s.status === "error");
  const hasSyncing = dataSources.some(s => s.status === "syncing");
  const coverage = Math.round((connected / total) * 100);

  // Freshness — find most recent sync
  const freshLabel = (() => {
    const connectedSources = dataSources.filter(s => s.lastSync && s.status === "connected");
    if (connectedSources.length === 0) return { text: "Невідомо", status: "stale" as const };
    const first = connectedSources[0].lastSync!;
    if (first.includes("хв") || first.includes("min")) return { text: first, status: "fresh" as const };
    if (first.includes("год") || first.includes("hour")) return { text: first, status: "aging" as const };
    return { text: first, status: "aging" as const };
  })();

  const pills = [
    {
      label: "Свіжість",
      value: freshLabel.text,
      icon: Clock,
      status: freshLabel.status,
    },
    {
      label: "Покриття",
      value: `${connected}/${total}`,
      icon: CheckCircle,
      status: coverage === 100 ? "fresh" as const : coverage >= 50 ? "aging" as const : "stale" as const,
    },
    ...(hasErrors ? [{
      label: "Розбіжності",
      value: `${dataSources.filter(s => s.status === "error").length} помилок`,
      icon: AlertTriangle,
      status: "stale" as const,
    }] : []),
  ];

  const statusColors = {
    fresh: "text-success bg-success/10 border-success/20",
    aging: "text-warning bg-warning/10 border-warning/20",
    stale: "text-destructive bg-destructive/10 border-destructive/20",
  };

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto scrollbar-none", className)}>
      {pills.map((pill) => (
        <div
          key={pill.label}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap",
            statusColors[pill.status]
          )}
        >
          <pill.icon className="w-3 h-3" />
          <span className="opacity-70">{pill.label}:</span>
          <span>{pill.value}</span>
        </div>
      ))}
    </div>
  );
};
