import { useState } from "react";
import { BarChart3, Lightbulb, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BenchmarkGauge } from "@/components/analytics/comparison/BenchmarkGauge";
import { BenchmarkSelector } from "@/components/analytics/comparison/BenchmarkSelector";
import { BenchmarkTrendChart } from "@/components/analytics/comparison/BenchmarkTrendChart";
import { getIndustryBenchmark, INDUSTRY_BENCHMARKS } from "@/config/industryBenchmarks";
import type { Cabinet } from "@/types/cabinet";
import type { Industry, BenchmarkComparison, BenchmarkHistoryPoint } from "@/types/comparison";

interface BenchmarkSectionProps {
  cabinet: Cabinet;
  taxBurden: number;
  laborCost: number;
  defaultIndustry?: Industry;
  onChatPromptInsert?: (prompt: string) => void;
  benchmarkHistory?: BenchmarkHistoryPoint[];
}

// Suggest industry based on cabinet data
function suggestIndustry(cabinet: Cabinet): Industry {
  const name = cabinet.name.toLowerCase();
  
  if (name.includes("it") || name.includes("софт") || name.includes("tech") || name.includes("dev")) {
    return "it";
  }
  if (name.includes("торг") || name.includes("shop") || name.includes("магаз")) {
    return "trade";
  }
  if (name.includes("консалт") || name.includes("аудит") || name.includes("юрид")) {
    return "consulting";
  }
  if (name.includes("виробн") || name.includes("завод") || name.includes("фабрик")) {
    return "manufacturing";
  }
  
  // Default based on cabinet type
  if (cabinet.type === "fop") {
    return "consulting";
  }
  
  return "services";
}

function calculateBenchmarkComparison(
  value: number,
  metric: "taxBurden" | "laborCost",
  industry: Industry
): BenchmarkComparison | null {
  const industryData = getIndustryBenchmark(industry);
  if (!industryData) return null;
  
  const benchmark = industryData.benchmarks[metric];
  const { low, optimal, high } = benchmark;
  
  let status: "below" | "optimal" | "above";
  if (value < low) status = "below";
  else if (value > high) status = "above";
  else status = "optimal";
  
  const range = high - low;
  const percentile = Math.max(0, Math.min(100, ((value - low) / range) * 100));
  
  let recommendation: string | undefined;
  if (status === "above") {
    if (metric === "taxBurden") {
      recommendation = "Розгляньте можливості оптимізації податкового навантаження через перегляд структури витрат.";
    } else {
      recommendation = "Проаналізуйте ефективність персоналу та можливості автоматизації процесів.";
    }
  }
  
  return {
    metric,
    value,
    industry,
    benchmark,
    status,
    percentile,
    recommendation,
  };
}

// Inner content without Card wrapper — for use inside CollapsibleAnalyticsSection
export function BenchmarkSectionContent({
  cabinet,
  taxBurden,
  laborCost,
  defaultIndustry,
  onChatPromptInsert,
  benchmarkHistory,
}: BenchmarkSectionProps) {
  const [industry, setIndustry] = useState<Industry>(
    defaultIndustry || cabinet.industry || suggestIndustry(cabinet)
  );
  
  const taxComparison = calculateBenchmarkComparison(taxBurden, "taxBurden", industry);
  const laborComparison = calculateBenchmarkComparison(laborCost, "laborCost", industry);
  
  const industryLabel = INDUSTRY_BENCHMARKS.find(b => b.id === industry)?.label || industry;
  
  const benchmarkPrompts = [
    `Як оптимізувати Tax Burden для ${industryLabel}?`,
    `Порівняй мої показники з конкурентами в галузі ${industryLabel}`,
    `Які витрати можна скоротити для покращення Labor Cost?`,
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <BenchmarkSelector value={industry} onChange={setIndustry} compact />
      </div>

      {taxComparison && (
        <BenchmarkGauge comparison={taxComparison} showRecommendation />
      )}
      
      {laborComparison && laborCost > 0 && (
        <BenchmarkGauge comparison={laborComparison} showRecommendation />
      )}
      
      {laborCost === 0 && (
        <div className="text-sm text-muted-foreground italic">
          Labor Cost: 0% — немає даних про витрати на персонал
        </div>
      )}
      
      {benchmarkHistory && benchmarkHistory.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Динаміка за 12 місяців</span>
          </div>
          <BenchmarkTrendChart history={benchmarkHistory} industry={industry} metric="taxBurden" />
          {laborCost > 0 && (
            <div className="mt-4">
              <BenchmarkTrendChart history={benchmarkHistory} industry={industry} metric="laborCost" />
            </div>
          )}
        </div>
      )}

      {onChatPromptInsert && (
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Запитайте AI:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {benchmarkPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onChatPromptInsert(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone version with Card wrapper (backward compatibility)
export function BenchmarkSection({
  cabinet,
  taxBurden,
  laborCost,
  defaultIndustry,
  onChatPromptInsert,
  benchmarkHistory,
}: BenchmarkSectionProps) {
  const [industry, setIndustry] = useState<Industry>(
    defaultIndustry || cabinet.industry || suggestIndustry(cabinet)
  );
  
  const taxComparison = calculateBenchmarkComparison(taxBurden, "taxBurden", industry);
  const laborComparison = calculateBenchmarkComparison(laborCost, "laborCost", industry);
  
  const industryLabel = INDUSTRY_BENCHMARKS.find(b => b.id === industry)?.label || industry;
  
  const benchmarkPrompts = [
    `Як оптимізувати Tax Burden для ${industryLabel}?`,
    `Порівняй мої показники з конкурентами в галузі ${industryLabel}`,
    `Які витрати можна скоротити для покращення Labor Cost?`,
  ];
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-primary" />
            Порівняння з галуззю
          </CardTitle>
          <BenchmarkSelector 
            value={industry} 
            onChange={setIndustry} 
            compact 
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tax Burden Gauge */}
        {taxComparison && (
          <BenchmarkGauge comparison={taxComparison} showRecommendation />
        )}
        
        {/* Labor Cost Gauge */}
        {laborComparison && laborCost > 0 && (
          <BenchmarkGauge comparison={laborComparison} showRecommendation />
        )}
        
        {laborCost === 0 && (
          <div className="text-sm text-muted-foreground italic">
            Labor Cost: 0% — немає даних про витрати на персонал
          </div>
        )}
        
        {/* Historical Trend */}
        {benchmarkHistory && benchmarkHistory.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Динаміка за 12 місяців</span>
            </div>
            <BenchmarkTrendChart 
              history={benchmarkHistory}
              industry={industry}
              metric="taxBurden"
            />
            {laborCost > 0 && (
              <div className="mt-4">
                <BenchmarkTrendChart 
                  history={benchmarkHistory}
                  industry={industry}
                  metric="laborCost"
                />
              </div>
            )}
          </div>
        )}
        {/* AI Prompts */}
        {onChatPromptInsert && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Запитайте AI:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {benchmarkPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => onChatPromptInsert(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
