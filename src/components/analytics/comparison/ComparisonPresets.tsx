import { TrendingUp, Users, BarChart3, Calendar, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { ComparisonState, ComparisonItem, ComparisonPreset } from "@/types/comparison";
import { COMPARISON_COLORS } from "@/types/comparison";

interface ComparisonPresetsProps {
  cabinets: Cabinet[];
  onApplyPreset: (state: Partial<ComparisonState>) => void;
}

const presets: ComparisonPreset[] = [
  {
    id: "yoy-all",
    label: "YoY: Всі кабінети",
    description: "2024 vs 2023",
    icon: "calendar",
    getState: (cabinets) => ({
      mode: "cabinets",
      basePeriod: { year: 2024, label: "2024" },
      comparePeriod: { year: 2023, label: "2023" },
      items: cabinets
        .filter(c => c.status === "active")
        .slice(0, 5)
        .map((c, i) => ({
          id: `cabinet-${c.id}`,
          label: c.name,
          type: "cabinet" as const,
          cabinetId: c.id,
          color: COMPARISON_COLORS[i % COMPARISON_COLORS.length],
        })),
      metrics: ["income", "taxes", "taxBurden"],
    }),
  },
  {
    id: "top3-income",
    label: "Топ-3 за доходом",
    description: "Лідери портфеля",
    icon: "trending",
    getState: (cabinets) => ({
      mode: "cabinets",
      basePeriod: { year: 2024, label: "2024" },
      items: cabinets
        .filter(c => c.status === "active")
        .sort((a, b) => (b.monthlyIncome || 0) - (a.monthlyIncome || 0))
        .slice(0, 3)
        .map((c, i) => ({
          id: `cabinet-${c.id}`,
          label: c.name,
          type: "cabinet" as const,
          cabinetId: c.id,
          color: COMPARISON_COLORS[i % COMPARISON_COLORS.length],
        })),
      metrics: ["income", "taxes", "salary"],
    }),
  },
  {
    id: "fop-benchmark",
    label: "Benchmark: ФОП",
    description: "Порівняння всіх ФОП",
    icon: "users",
    getState: (cabinets) => ({
      mode: "cabinets",
      basePeriod: { year: 2024, label: "2024" },
      items: cabinets
        .filter(c => c.status === "active" && c.type === "fop")
        .slice(0, 5)
        .map((c, i) => ({
          id: `cabinet-${c.id}`,
          label: c.name,
          type: "cabinet" as const,
          cabinetId: c.id,
          color: COMPARISON_COLORS[i % COMPARISON_COLORS.length],
        })),
      metrics: ["income", "taxBurden", "employees"],
    }),
  },
  {
    id: "qoq",
    label: "Q4 vs Q3 2024",
    description: "Квартальне порівняння",
    icon: "chart",
    getState: (cabinets) => {
      const activeCabinet = cabinets.find(c => c.status === "active");
      if (!activeCabinet) return { mode: "periods", items: [] };
      
      return {
        mode: "periods",
        basePeriod: { year: 2024, label: "2024" },
        items: [
          {
            id: `cabinet-${activeCabinet.id}`,
            label: activeCabinet.name,
            type: "cabinet" as const,
            cabinetId: activeCabinet.id,
            color: COMPARISON_COLORS[0],
          },
          {
            id: "period-q4-2024",
            label: "Q4 2024",
            type: "period" as const,
            period: { year: 2024, quarter: 4, label: "Q4 2024" },
            color: COMPARISON_COLORS[1],
          },
          {
            id: "period-q3-2024",
            label: "Q3 2024",
            type: "period" as const,
            period: { year: 2024, quarter: 3, label: "Q3 2024" },
            color: COMPARISON_COLORS[2],
          },
        ],
        metrics: ["income", "taxes"],
      };
    },
  },
  {
    id: "industry-benchmark",
    label: "Benchmark: Галузь",
    description: "Порівняти з галуззю",
    icon: "factory",
    getState: (cabinets) => ({
      mode: "cabinets",
      basePeriod: { year: 2024, label: "2024" },
      items: cabinets
        .filter(c => c.status === "active")
        .slice(0, 3)
        .map((c, i) => ({
          id: `cabinet-${c.id}`,
          label: c.name,
          type: "cabinet" as const,
          cabinetId: c.id,
          color: COMPARISON_COLORS[i % COMPARISON_COLORS.length],
        })),
      metrics: ["taxBurden", "laborCost"],
      showBenchmarks: true,
      benchmarkIndustry: "trade",
    }),
  },
];

const iconMap = {
  calendar: Calendar,
  trending: TrendingUp,
  users: Users,
  chart: BarChart3,
  factory: Factory,
};

export function ComparisonPresets({ cabinets, onApplyPreset }: ComparisonPresetsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => {
        const Icon = iconMap[preset.icon as keyof typeof iconMap] || BarChart3;
        return (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            className="gap-2 h-auto py-2 px-3"
            onClick={() => onApplyPreset(preset.getState(cabinets))}
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div className="text-left">
              <div className="text-sm font-medium">{preset.label}</div>
              <div className="text-xs text-muted-foreground">{preset.description}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
