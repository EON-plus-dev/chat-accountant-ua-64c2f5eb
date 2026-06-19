import { CheckCircle, AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DataSource } from "@/config/cabinetAnalyticsConfig";

interface DataTrustWidgetProps {
  dataSources: DataSource[];
  onNavigateToSettings?: () => void;
}

function getFreshnessLabel(lastSync?: string): { label: string; status: "fresh" | "aging" | "stale" } {
  if (!lastSync) return { label: "Невідомо", status: "stale" };
  const lower = lastSync.toLowerCase();
  if (lower.includes("хв") || lower.includes("min")) return { label: lastSync, status: "fresh" };
  if (lower.includes("год") || lower.includes("hour") || lower.includes("день") || lower.includes("day")) return { label: lastSync, status: "aging" };
  if (lower.includes("помилк") || lower.includes("error")) return { label: lastSync, status: "stale" };
  if (lower.includes("синхроніз")) return { label: lastSync, status: "fresh" };
  return { label: lastSync, status: "aging" };
}

function getStatusIcon(status: string) {
  switch (status) {
    case "connected": return <CheckCircle className="w-3.5 h-3.5 text-success" />;
    case "syncing": return <RefreshCw className="w-3.5 h-3.5 text-warning animate-spin" />;
    default: return <AlertTriangle className="w-3.5 h-3.5 text-destructive" />;
  }
}

export const DataTrustWidget = ({ dataSources, onNavigateToSettings }: DataTrustWidgetProps) => {
  const connected = dataSources.filter(s => s.status === "connected").length;
  const total = dataSources.length;
  const hasErrors = dataSources.some(s => s.status === "error");
  const coverage = total > 0 ? Math.round((connected / total) * 100) : 0;

  return (
    <div className="space-y-2">
      {dataSources.map((source) => {
        const freshness = getFreshnessLabel(source.lastSync);
        return (
          <div 
            key={source.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getStatusIcon(source.status)}
              <source.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium truncate">{source.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {freshness.label}
              </span>
              {source.status === "error" && onNavigateToSettings && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={onNavigateToSettings}>
                  <Settings className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
