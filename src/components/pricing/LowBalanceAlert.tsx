import { AlertTriangle, Zap, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CreditForecast } from "@/hooks/useCreditForecast";

interface LowBalanceAlertProps {
  forecast: CreditForecast;
  currentBalance: number;
  topUpRate: number;
  onTopUp?: () => void;
  onUpgrade?: () => void;
}

export const LowBalanceAlert = ({
  forecast,
  currentBalance,
  topUpRate,
  onTopUp,
  onUpgrade,
}: LowBalanceAlertProps) => {
  if (forecast.status === "sufficient") return null;

  const isCritical = forecast.status === "critical";
  const topUpCredits = topUpRate * 10;

  return (
    <Alert 
      variant="destructive" 
      className={`${
        isCritical 
          ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" 
          : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
      }`}
    >
      <AlertTriangle className={`h-4 w-4 ${isCritical ? "text-red-600" : "text-amber-600"}`} />
      <AlertTitle className={`${isCritical ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200"}`}>
        {isCritical ? "Низький баланс кредитів" : "Баланс наближається до кінця"}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className={`text-sm ${isCritical ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}`}>
          Залишилось {currentBalance.toLocaleString()} кредитів (~{forecast.daysRemaining} {
            forecast.daysRemaining === 1 ? "день" : 
            forecast.daysRemaining < 5 ? "дні" : "днів"
          }).{" "}
          {forecast.recommendation}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant={isCritical ? "default" : "outline"}
            className={isCritical ? "bg-red-600 hover:bg-red-700" : ""}
            onClick={onTopUp}
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Поповнити 10 грн (+{topUpCredits.toLocaleString()})
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onUpgrade}
          >
            Перейти на Преміум
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
