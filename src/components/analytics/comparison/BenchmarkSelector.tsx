import { Monitor, ShoppingCart, Briefcase, Factory, Users } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Industry } from "@/types/comparison";
import { INDUSTRY_BENCHMARKS } from "@/config/industryBenchmarks";

interface BenchmarkSelectorProps {
  value?: Industry;
  onChange: (industry: Industry) => void;
  compact?: boolean;
}

const iconMap = {
  monitor: Monitor,
  "shopping-cart": ShoppingCart,
  briefcase: Briefcase,
  factory: Factory,
  users: Users,
};

export function BenchmarkSelector({ value, onChange, compact = false }: BenchmarkSelectorProps) {
  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex gap-1">
          {INDUSTRY_BENCHMARKS.map((industry) => {
            const Icon = iconMap[industry.icon as keyof typeof iconMap] || Briefcase;
            const isSelected = value === industry.id;
            
            return (
              <Tooltip key={industry.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onChange(industry.id)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">{industry.label}</p>
                  <p className="text-xs text-muted-foreground">{industry.description}</p>
                  <div className="mt-1 text-xs space-y-0.5">
                    <p>Tax Burden: {industry.benchmarks.taxBurden.low}-{industry.benchmarks.taxBurden.high}%</p>
                    <p>Labor Cost: {industry.benchmarks.laborCost.low}-{industry.benchmarks.laborCost.high}%</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as Industry)}
      className="flex flex-wrap gap-2"
    >
      {INDUSTRY_BENCHMARKS.map((industry) => {
        const Icon = iconMap[industry.icon as keyof typeof iconMap] || Briefcase;
        const isSelected = value === industry.id;
        
        return (
          <div key={industry.id}>
            <RadioGroupItem
              value={industry.id}
              id={`industry-${industry.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`industry-${industry.id}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{industry.label}</span>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
