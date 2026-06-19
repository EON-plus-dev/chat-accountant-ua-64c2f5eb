import { Suspense, lazy, type ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink, Sparkles } from "lucide-react";

// Лінива мапа toolId → компонент калькулятора з tools-grid.
// Завантажуємо тільки той, який реально потрібен у поточному уроці.
const TOOL_COMPONENTS: Record<string, () => Promise<{ default: ComponentType<unknown> }>> = {
  "budget-503020":   () => import("@/portal/sections/tools-grid/Budget503020Calc").then(m => ({ default: m.Budget503020Calc as ComponentType<unknown> })),
  "net-worth":       () => import("@/portal/sections/tools-grid/NetWorthCalc").then(m => ({ default: m.NetWorthCalc as ComponentType<unknown> })),
  "emergency-fund":  () => import("@/portal/sections/tools-grid/EmergencyFundCalc").then(m => ({ default: m.EmergencyFundCalc as ComponentType<unknown> })),
  "debt-snowball":   () => import("@/portal/sections/tools-grid/DebtSnowballCalc").then(m => ({ default: m.DebtSnowballCalc as ComponentType<unknown> })),
  "fire-calc":       () => import("@/portal/sections/tools-grid/FireCalc").then(m => ({ default: m.FireCalc as ComponentType<unknown> })),
  "inflation-impact":() => import("@/portal/sections/tools-grid/InflationImpactCalc").then(m => ({ default: m.InflationImpactCalc as ComponentType<unknown> })),
  "goal-tracker":    () => import("@/portal/sections/tools-grid/GoalTrackerCalc").then(m => ({ default: m.GoalTrackerCalc as ComponentType<unknown> })),
  "rent-vs-buy":     () => import("@/portal/sections/tools-grid/RentVsBuyCalc").then(m => ({ default: m.RentVsBuyCalc as ComponentType<unknown> })),
  "invest-calc":     () => import("@/portal/sections/tools-grid/InvestCalc").then(m => ({ default: m.InvestCalc as ComponentType<unknown> })),
  "cashflow":        () => import("@/portal/sections/tools-grid/CashFlowWizard").then(m => ({ default: m.CashFlowWizard as ComponentType<unknown> })),
  "breakeven":       () => import("@/portal/sections/tools-grid/BreakevenCalc").then(m => ({ default: m.BreakevenCalc as ComponentType<unknown> })),
  "fop-vs-too":      () => import("@/portal/sections/tools-grid/FopVsTooCalc").then(m => ({ default: m.FopVsTooCalc as ComponentType<unknown> })),
  "runway-calc":     () => import("@/portal/sections/tools-grid/RunwayCalc").then(m => ({ default: m.RunwayCalc as ComponentType<unknown> })),
  "pricing-calc":    () => import("@/portal/sections/tools-grid/PricingCalc").then(m => ({ default: m.PricingCalc as ComponentType<unknown> })),
  "hire-roi":        () => import("@/portal/sections/tools-grid/HireRoiCalc").then(m => ({ default: m.HireRoiCalc as ComponentType<unknown> })),
  "unit-economy":    () => import("@/portal/sections/tools-grid/UnitEconomyCalc").then(m => ({ default: m.UnitEconomyCalc as ComponentType<unknown> })),
  "credit-calc":     () => import("@/portal/sections/tools-grid/CreditCalc").then(m => ({ default: m.CreditCalc as ComponentType<unknown> })),
  "deposit-calc":    () => import("@/portal/sections/tools-grid/DepositCalc").then(m => ({ default: m.DepositCalc as ComponentType<unknown> })),
  "vacation-calc":   () => import("@/portal/sections/tools-grid/VacationCalc").then(m => ({ default: m.VacationCalc as ComponentType<unknown> })),
  "insurance-calc":  () => import("@/portal/sections/tools-grid/InsuranceCalc").then(m => ({ default: m.InsuranceCalc as ComponentType<unknown> })),
  "kved":            () => import("@/portal/sections/tools-grid/KvedSearch").then(m => ({ default: m.KvedSearch as ComponentType<unknown> })),
  "counterparty":    () => import("@/portal/sections/tools-grid/CounterpartyCheck").then(m => ({ default: m.CounterpartyCheck as ComponentType<unknown> })),
  "calendar":        () => import("@/portal/sections/tools-grid/TaxCalendar").then(m => ({ default: m.TaxCalendar as ComponentType<unknown> })),
  "invoice":         () => import("@/portal/sections/tools-grid/InvoiceGenerator").then(m => ({ default: m.InvoiceGenerator as ComponentType<unknown> })),
};

interface LessonInlineToolProps {
  toolId: string;
}

export function LessonInlineTool({ toolId }: LessonInlineToolProps) {
  const loader = TOOL_COMPONENTS[toolId];

  if (!loader) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> Практикум: повна версія
          </div>
          <p className="text-sm text-muted-foreground">
            Цей інструмент відкриється на повній сторінці у новій вкладці — щоб ви могли продовжити урок без втрати прогресу.
          </p>
          <Button asChild variant="secondary" size="sm" className="gap-2">
            <Link to={`/tools/${toolId}`} target="_blank" rel="noopener noreferrer">
              Відкрити інструмент <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const Lazy = lazy(loader);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-primary font-medium">
          <Sparkles className="h-3.5 w-3.5" /> Практикум прямо в уроці
        </span>
        <span>Заповніть поля — результат розрахується миттєво. Дані залишаються у вас на пристрої.</span>
        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
          <Link to={`/tools/${toolId}`} target="_blank" rel="noopener noreferrer">
            Повна сторінка <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </div>
      <Suspense fallback={<div className="h-32 rounded-lg border border-dashed border-border animate-pulse" />}>
        <Lazy />
      </Suspense>
    </div>
  );
}

export const hasInlineTool = (toolId: string): boolean => toolId in TOOL_COMPONENTS;
