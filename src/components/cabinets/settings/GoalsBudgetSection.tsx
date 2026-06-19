import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Info, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import type { CabinetGoals, GoalsMode } from "@/types/goals";
import { getEntityStyle } from "@/config/entityStyles";
import { cn } from "@/lib/utils";
import { fopIncomeLimits } from "@/config/incomeBookConfig";
import {
  getGoalsCardsForType,
  getDefaultGoals,
  goalsModeOptions,
  formatGoalValue,
  type GoalsCardConfig,
  type GoalFieldConfig,
} from "@/config/goalsConfig";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GoalsBudgetSectionProps {
  cabinet: Cabinet;
  onNavigateToTaxProfile?: () => void;
}

export const GoalsBudgetSection = ({ cabinet, onNavigateToTaxProfile }: GoalsBudgetSectionProps) => {
  const entityStyle = getEntityStyle(cabinet.type);
  
  // Demo state - would be persisted in real app
  const [goals, setGoals] = useState<Partial<CabinetGoals>>(() => 
    getDefaultGoals(cabinet.type, cabinet.monthlyIncome || 0)
  );

  // Computed auto-values
  const autoValues = useMemo(() => {
    const growthFactor = goals.growthFactor || 1.1;
    const currentMonthly = cabinet.monthlyIncome || 0;
    return {
      monthlyTarget: Math.round(currentMonthly * growthFactor),
      quarterlyTarget: Math.round(currentMonthly * growthFactor * 3),
    };
  }, [cabinet.monthlyIncome, goals.growthFactor]);

  // FOP limit data
  const fopLimitData = useMemo(() => {
    if (cabinet.type !== "fop" && cabinet.type !== "fop-group") return null;
    const group = cabinet.fopGroup || 3;
    const limit = fopIncomeLimits[group] || fopIncomeLimits[3];
    const yearlyIncome = cabinet.yearlyIncome || 0;
    const usedPercent = limit > 0 ? (yearlyIncome / limit) * 100 : 0;
    return { group, limit, yearlyIncome, usedPercent };
  }, [cabinet]);

  // Get applicable cards for this cabinet type
  const applicableCards = useMemo(() => 
    getGoalsCardsForType(cabinet.type),
    [cabinet.type]
  );

  const isAutoMode = goals.mode === "auto";

  const handleModeChange = (mode: GoalsMode) => {
    setGoals(prev => ({ ...prev, mode }));
  };

  const handleFieldChange = (fieldId: keyof CabinetGoals, value: number | boolean) => {
    setGoals(prev => ({ ...prev, [fieldId]: value }));
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("uk-UA").format(value);

  const renderField = (field: GoalFieldConfig, isReadOnly: boolean = false) => {
    const value = goals[field.id];
    const isDisabled = isAutoMode && !isReadOnly && field.id !== "growthFactor";

    // For auto mode, show auto-calculated values for income targets
    const displayValue = isAutoMode && field.id === "monthlyIncomeTarget" 
      ? autoValues.monthlyTarget
      : isAutoMode && field.id === "quarterlyIncomeTarget"
      ? autoValues.quarterlyTarget
      : value;

    if (field.inputType === "toggle") {
      return (
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
          <Switch
            id={field.id}
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            disabled={isDisabled}
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
          </Label>
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">{field.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          {field.prefix && (
            <span className="text-muted-foreground text-sm">{field.prefix}</span>
          )}
          <Input
            id={field.id}
            type="number"
            value={displayValue as number || ""}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            disabled={isDisabled}
            className={cn(
              "tabular-nums",
              field.inputType === "currency" && "font-medium"
            )}
          />
          {field.suffix && (
            <span className="text-muted-foreground text-sm whitespace-nowrap">{field.suffix}</span>
          )}
        </div>
      </div>
    );
  };

  const renderCard = (cardConfig: GoalsCardConfig) => {
    const Icon = cardConfig.icon;

    // Special handling for FOP limit card
    if (cardConfig.id === "fop-limit" && fopLimitData) {
      return (
        <Card key={cardConfig.id} className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-5 w-5", entityStyle.color)} />
                <CardTitle className="text-base">{cardConfig.title}</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono">
                {fopLimitData.group} група
              </Badge>
            </div>
            <CardDescription>
              Ліміт {formatCurrency(fopLimitData.limit)} ₴ на {new Date().getFullYear()} рік
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Використано</span>
                <span className={cn(
                  "font-medium tabular-nums",
                  fopLimitData.usedPercent >= 90 && "text-destructive",
                  fopLimitData.usedPercent >= 70 && fopLimitData.usedPercent < 90 && "text-warning"
                )}>
                  {fopLimitData.usedPercent.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(fopLimitData.usedPercent, 100)} 
                className={cn(
                  "h-2",
                  fopLimitData.usedPercent >= 90 && "[&>div]:bg-destructive",
                  fopLimitData.usedPercent >= 70 && fopLimitData.usedPercent < 90 && "[&>div]:bg-warning"
                )}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(fopLimitData.yearlyIncome)} ₴</span>
                <span>{formatCurrency(fopLimitData.limit)} ₴</span>
              </div>
            </div>

            {/* Threshold settings */}
            <div className="grid gap-4 sm:grid-cols-2">
              {cardConfig.fields.map((field) => (
                <div key={field.id}>
                  {renderField(field, false)}
                </div>
              ))}
            </div>

            {/* Link to tax profile */}
            {onNavigateToTaxProfile && (
              <button
                onClick={onNavigateToTaxProfile}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Змінити групу в Податковому профілі
              </button>
            )}
          </CardContent>
        </Card>
      );
    }

    // Special handling for income goals card
    if (cardConfig.id === "income-goals") {
      const currentMonthly = cabinet.monthlyIncome || 0;
      const targetMonthly = isAutoMode ? autoValues.monthlyTarget : (goals.monthlyIncomeTarget || 0);
      const progressPercent = targetMonthly > 0 ? (currentMonthly / targetMonthly) * 100 : 0;

      return (
        <Card key={cardConfig.id} className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5", entityStyle.color)} />
              <CardTitle className="text-base">{cardConfig.title}</CardTitle>
            </div>
            {cardConfig.description && (
              <CardDescription>{cardConfig.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {cardConfig.fields.map((field) => (
                <div key={field.id}>
                  {renderField(field, cardConfig.isReadOnly)}
                </div>
              ))}
            </div>

            {/* Auto-calculation info */}
            {isAutoMode && (
              <div className="rounded-lg border bg-primary/5 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">
                    Розраховано автоматично: поточний дохід ({formatCurrency(currentMonthly)} ₴) × {goals.growthFactor || 1.1} = <span className="font-medium text-foreground">{formatCurrency(autoValues.monthlyTarget)} ₴/міс</span>
                  </p>
                </div>
              </div>
            )}

            {/* Preview progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Прогрес до місячної цілі</span>
                <span className="font-medium tabular-nums">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={Math.min(progressPercent, 100)} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      );
    }

    // Default card rendering
    return (
      <Card key={cardConfig.id} className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", entityStyle.color)} />
            <CardTitle className="text-base">{cardConfig.title}</CardTitle>
            {cardConfig.isReadOnly && (
              <Badge variant="secondary" className="text-xs">read-only</Badge>
            )}
          </div>
          {cardConfig.description && (
            <CardDescription>{cardConfig.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn(
            "grid gap-4",
            cardConfig.fields.length > 1 && "sm:grid-cols-2"
          )}>
            {cardConfig.fields.map((field) => (
              <div key={field.id}>
                {renderField(field, cardConfig.isReadOnly)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      {/* Mode Selection Card */}
      <Card className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className={cn("h-5 w-5", entityStyle.color)} />
            <CardTitle className="text-base">Режим цілей</CardTitle>
          </div>
          <CardDescription>
            Оберіть як розраховувати цілі та бюджети
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={goals.mode}
            onValueChange={(value) => handleModeChange(value as GoalsMode)}
            className="space-y-3"
          >
            {goalsModeOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-start space-x-3 rounded-lg border p-4 transition-colors cursor-pointer",
                  goals.mode === option.value 
                    ? "border-primary bg-primary/5" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleModeChange(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                <div className="space-y-1">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                    {option.value === "auto" && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        рекомендовано
                      </Badge>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Dynamic Cards based on cabinet type */}
      {applicableCards.map(renderCard)}

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Зміни зберігаються в demo-режимі локально
        </p>
        <Button size="lg">Зберегти зміни</Button>
      </div>
    </div>
  );
};

export default GoalsBudgetSection;
