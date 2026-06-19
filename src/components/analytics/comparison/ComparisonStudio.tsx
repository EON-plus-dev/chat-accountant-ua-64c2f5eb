import { useState, useMemo } from "react";
import { 
  GitCompare, 
  Plus, 
  X, 
  Table2, 
  LineChart as LineChartIcon,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Download,
  Building2,
  User,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { ComparisonState, ComparisonMode, ComparisonMetric, ComparisonItem, Industry } from "@/types/comparison";
import { COMPARISON_COLORS, METRIC_CONFIGS, PERIOD_OPTIONS } from "@/types/comparison";
import { useComparisonData } from "@/hooks/useComparisonData";
import { ComparisonPresets } from "./ComparisonPresets";
import { ComparisonTable } from "./ComparisonTable";
import { ComparisonChart } from "./ComparisonChart";
import { BenchmarkSelector } from "./BenchmarkSelector";

interface ComparisonStudioProps {
  cabinets: Cabinet[];
  onCabinetSelect?: (cabinet: Cabinet) => void;
  onInsightClick?: (insight: string) => void;
  defaultExpanded?: boolean;
}

const typeIcons: Record<string, typeof Building2> = {
  fop: User,
  tov: Building2,
  individual: Users,
  "fop-group": Users,
};

export function ComparisonStudio({ 
  cabinets, 
  onCabinetSelect,
  onInsightClick,
  defaultExpanded = false,
}: ComparisonStudioProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [state, setState] = useState<ComparisonState>({
    mode: "cabinets",
    items: [],
    metrics: ["income", "taxes", "taxBurden"],
    viewType: "table",
    basePeriod: { year: 2024, label: "2024" },
  });
  
  const activeCabinets = useMemo(
    () => cabinets.filter(c => c.status === "active"),
    [cabinets]
  );
  
  const comparisonResult = useComparisonData(cabinets, state);
  
  const availableCabinets = useMemo(
    () => activeCabinets.filter(c => !state.items.some(item => item.cabinetId === c.id)),
    [activeCabinets, state.items]
  );
  
  const addCabinet = (cabinetId: string) => {
    const cabinet = activeCabinets.find(c => c.id === cabinetId);
    if (cabinet && state.items.length < 5) {
      const newItem: ComparisonItem = {
        id: `cabinet-${cabinet.id}`,
        label: cabinet.name,
        type: "cabinet",
        cabinetId: cabinet.id,
        color: COMPARISON_COLORS[state.items.length % COMPARISON_COLORS.length],
      };
      setState(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  };
  
  const addPeriod = (periodLabel: string) => {
    const period = PERIOD_OPTIONS.find(p => p.label === periodLabel);
    if (period && state.items.length < 5) {
      const newItem: ComparisonItem = {
        id: `period-${period.label}`,
        label: period.label,
        type: "period",
        period,
        color: COMPARISON_COLORS[state.items.length % COMPARISON_COLORS.length],
      };
      setState(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  };
  
  const removeItem = (itemId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };
  
  const toggleMetric = (metricId: ComparisonMetric) => {
    setState(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId],
    }));
  };
  
  const applyPreset = (presetState: Partial<ComparisonState>) => {
    setState(prev => ({ ...prev, ...presetState }));
  };
  
  const handleItemClick = (itemId: string) => {
    const item = state.items.find(i => i.id === itemId);
    if (item?.cabinetId) {
      const cabinet = cabinets.find(c => c.id === item.cabinetId);
      if (cabinet) onCabinetSelect?.(cabinet);
    }
  };
  
  const handleExportCSV = () => {
    // Generate CSV
    const headers = ["Показник", ...comparisonResult.dataPoints.map(dp => dp.itemLabel)];
    const rows = METRIC_CONFIGS
      .filter(m => state.metrics.includes(m.id))
      .map(metric => [
        metric.label,
        ...comparisonResult.dataPoints.map(dp => dp.metrics[metric.id].toString()),
      ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comparison.csv";
    a.click();
  };
  
  return (
    <Card className="overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GitCompare className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">Comparison Studio</CardTitle>
                  <CardDescription className="text-xs">
                    Порівняння кабінетів та періодів
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {state.items.length > 0 && (
                  <Badge variant="secondary">{state.items.length} обрано</Badge>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Presets */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Швидкі порівняння:</p>
              <ComparisonPresets cabinets={cabinets} onApplyPreset={applyPreset} />
            </div>
            
            {/* Mode selector */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Режим:</span>
                <ToggleGroup 
                  type="single" 
                  value={state.mode} 
                  onValueChange={(v) => v && setState(prev => ({ ...prev, mode: v as ComparisonMode }))}
                  size="sm"
                >
                  <ToggleGroupItem value="cabinets" className="text-xs">Кабінети</ToggleGroupItem>
                  <ToggleGroupItem value="periods" className="text-xs">Періоди</ToggleGroupItem>
                  <ToggleGroupItem value="mixed" className="text-xs">Мікс</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {/* Base period */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Період:</span>
                <Select 
                  value={state.basePeriod.label} 
                  onValueChange={(v) => {
                    const period = PERIOD_OPTIONS.find(p => p.label === v);
                    if (period) setState(prev => ({ ...prev, basePeriod: period }));
                  }}
                >
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.filter(p => !p.quarter).map(period => (
                      <SelectItem key={period.label} value={period.label} className="text-xs">
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Compare period (for YoY) */}
              {state.mode === "cabinets" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">vs:</span>
                  <Select 
                    value={state.comparePeriod?.label || "none"} 
                    onValueChange={(v) => {
                      if (v === "none") {
                        setState(prev => ({ ...prev, comparePeriod: undefined }));
                      } else {
                        const period = PERIOD_OPTIONS.find(p => p.label === v);
                        if (period) setState(prev => ({ ...prev, comparePeriod: period }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">—</SelectItem>
                      {PERIOD_OPTIONS.filter(p => !p.quarter && p.label !== state.basePeriod.label).map(period => (
                        <SelectItem key={period.label} value={period.label} className="text-xs">
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {/* Selected items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">
                  Обрані елементи ({state.items.length}/5):
                </p>
                {state.items.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={() => setState(prev => ({ ...prev, items: [] }))}
                  >
                    Очистити
                  </Button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {state.items.map(item => {
                  const TypeIcon = item.type === "cabinet" && item.cabinetId
                    ? typeIcons[cabinets.find(c => c.id === item.cabinetId)?.type || "fop"] || User
                    : null;
                  
                  return (
                    <Badge 
                      key={item.id} 
                      variant="secondary" 
                      className="gap-1.5 pr-1"
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      {TypeIcon && <TypeIcon className="h-3 w-3" />}
                      <span className="max-w-[100px] truncate">{item.label}</span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-0.5 hover:bg-muted rounded-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                
                {/* Add cabinet */}
                {state.items.length < 5 && availableCabinets.length > 0 && (
                  <Select onValueChange={addCabinet}>
                    <SelectTrigger className="w-auto h-7 text-xs gap-1 border-dashed">
                      <Plus className="h-3 w-3" />
                      <span>Кабінет</span>
                    </SelectTrigger>
                    <SelectContent>
                      {availableCabinets.map(cabinet => {
                        const TypeIcon = typeIcons[cabinet.type] || User;
                        return (
                          <SelectItem key={cabinet.id} value={cabinet.id} className="text-xs">
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-3 w-3" />
                              <span>{cabinet.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Add period (for periods/mixed mode) */}
                {state.items.length < 5 && (state.mode === "periods" || state.mode === "mixed") && (
                  <Select onValueChange={addPeriod}>
                    <SelectTrigger className="w-auto h-7 text-xs gap-1 border-dashed">
                      <Plus className="h-3 w-3" />
                      <span>Період</span>
                    </SelectTrigger>
                    <SelectContent>
                      {PERIOD_OPTIONS
                        .filter(p => !state.items.some(item => item.period?.label === p.label))
                        .map(period => (
                          <SelectItem key={period.label} value={period.label} className="text-xs">
                            {period.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            {/* Metrics selector */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Метрики:</p>
              <div className="flex flex-wrap gap-2">
                {METRIC_CONFIGS.map(metric => (
                  <button
                    key={metric.id}
                    onClick={() => toggleMetric(metric.id)}
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium transition-colors border",
                      state.metrics.includes(metric.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {metric.shortLabel}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Benchmark toggle */}
            <div className="flex items-center gap-4 py-2 px-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Switch 
                  id="benchmark-toggle"
                  checked={state.showBenchmarks || false}
                  onCheckedChange={(checked) => 
                    setState(prev => ({ 
                      ...prev, 
                      showBenchmarks: checked,
                      benchmarkIndustry: checked ? (prev.benchmarkIndustry || "trade") : prev.benchmarkIndustry 
                    }))
                  }
                />
                <Label htmlFor="benchmark-toggle" className="text-sm cursor-pointer">
                  Порівняти з галуззю
                </Label>
              </div>
              
              {state.showBenchmarks && (
                <BenchmarkSelector
                  value={state.benchmarkIndustry}
                  onChange={(industry) => setState(prev => ({ ...prev, benchmarkIndustry: industry }))}
                  compact
                />
              )}
            </div>
            
            {/* View type toggle + Export */}
            <div className="flex items-center justify-between">
              <ToggleGroup 
                type="single" 
                value={state.viewType} 
                onValueChange={(v) => v && setState(prev => ({ ...prev, viewType: v as "table" | "chart" }))}
                size="sm"
              >
                <ToggleGroupItem value="table" className="gap-1.5">
                  <Table2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Таблиця</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="chart" className="gap-1.5">
                  <LineChartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Графік</span>
                </ToggleGroupItem>
              </ToggleGroup>
              
              {comparisonResult.dataPoints.length > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV}>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">CSV</span>
                </Button>
              )}
            </div>
            
            {/* Results */}
            {state.items.length > 0 && (
              <div className="border rounded-lg p-4">
                {state.viewType === "table" ? (
                  <ComparisonTable 
                    dataPoints={comparisonResult.dataPoints}
                    metrics={state.metrics}
                    showDeltas={!!state.comparePeriod}
                    showBenchmarks={state.showBenchmarks}
                    benchmarkIndustry={state.benchmarkIndustry}
                    onItemClick={handleItemClick}
                  />
                ) : (
                  <ComparisonChart 
                    chartData={comparisonResult.chartData}
                    dataPoints={comparisonResult.dataPoints}
                  />
                )}
              </div>
            )}
            
            {/* Insights */}
            {comparisonResult.insights.length > 0 && (
              <div className="space-y-2">
                {comparisonResult.insights.map(insight => (
                  <Alert 
                    key={insight.id}
                    variant={insight.type === "warning" ? "destructive" : "default"}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      insight.type === "success" && "border-success/50 bg-success/5"
                    )}
                    onClick={() => onInsightClick?.(insight.title)}
                  >
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle className="text-sm">{insight.title}</AlertTitle>
                    <AlertDescription className="text-xs">
                      {insight.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
