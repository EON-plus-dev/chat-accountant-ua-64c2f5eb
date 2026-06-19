import { useMemo } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, type LucideIcon } from "lucide-react";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";

type KPI = CabinetAnalyticsConfig["kpis"][number];

interface KPIGroup {
  label: string;
  icon: LucideIcon;
  kpis: KPI[];
}

interface KPIGroupedGridProps {
  kpis: KPI[];
  getKpiVariant: (s: string) => "success" | "danger" | "warning" | "default";
  onKpiClick: (kpiId: string) => void;
}

const INCOME_IDS = new Set(["income", "net-income", "limit-usage", "cashflow", "revenue"]);

function groupKpis(kpis: KPI[]): KPIGroup[] {
  const incomeGroup: KPI[] = [];
  const expenseGroup: KPI[] = [];
  const attentionGroup: KPI[] = [];

  for (const kpi of kpis) {
    if (INCOME_IDS.has(kpi.id) || kpi.semantic === "income") {
      incomeGroup.push(kpi);
    } else if (kpi.semantic === "expense" || kpi.semantic === "neutral") {
      expenseGroup.push(kpi);
    } else {
      attentionGroup.push(kpi);
    }
  }

  const groups: KPIGroup[] = [];
  if (incomeGroup.length > 0) groups.push({ label: "Доходи", icon: TrendingUp, kpis: incomeGroup });
  if (expenseGroup.length > 0) groups.push({ label: "Витрати та податки", icon: TrendingDown, kpis: expenseGroup });
  if (attentionGroup.length > 0) groups.push({ label: "Увага", icon: AlertTriangle, kpis: attentionGroup });
  return groups;
}

export const KPIGroupedGrid = ({ kpis, getKpiVariant, onKpiClick }: KPIGroupedGridProps) => {
  const groups = useMemo(() => groupKpis(kpis), [kpis]);

  const isZero = (v: KPI["value"]) => {
    if (typeof v === "number") return v === 0;
    const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
    return !Number.isFinite(n) || n === 0;
  };

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const allZero = group.kpis.every((k) => isZero(k.value));
        return (
          <div key={group.label} className="space-y-1.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <group.icon className="w-3.5 h-3.5" /> {group.label}
            </p>
            {allZero ? (
              <div className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
                Немає рухів за обраний період
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {group.kpis.map((kpi) => (
                  <UniversalKPICard
                    key={kpi.id}
                    title={kpi.title}
                    value={kpi.value}
                    format={kpi.format}
                    icon={kpi.icon}
                    trend={kpi.trend}
                    description={kpi.description}
                    variant={getKpiVariant(kpi.semantic)}
                    density="compact"
                    historicalData={kpi.historicalData}
                    onClick={() => onKpiClick(kpi.id)}
                    className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-shadow"
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
