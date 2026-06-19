import { TrendingUp, Clock, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditForecast } from "@/hooks/useCreditForecast";
import { format, addDays } from "date-fns";
import { uk } from "date-fns/locale";

interface CreditForecastCardProps {
  forecast: CreditForecast;
  nextBillingDate: string;
  standalone?: boolean;
}

export const CreditForecastCard = ({ 
  forecast, 
  nextBillingDate,
  standalone = true 
}: CreditForecastCardProps) => {
  const exhaustionDate = addDays(new Date(), forecast.daysRemaining);
  const billingDate = new Date(nextBillingDate);
  
  const progressValue = Math.min(
    (forecast.daysRemaining / forecast.daysToNextBilling) * 100,
    100
  );

  const statusConfig = {
    sufficient: {
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      progressColor: "bg-emerald-500",
      message: "Балансу вистачить до кінця періоду",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      progressColor: "bg-amber-500",
      message: "Баланс може закінчитися до поповнення",
    },
    critical: {
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      progressColor: "bg-red-500",
      message: "Баланс закінчується — поповніть зараз",
    },
  };

  const config = statusConfig[forecast.status];
  const StatusIcon = config.icon;

  const content = (
    <div className="space-y-4">
      {/* Average Usage */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Середнє використання:</span>
        <span className="font-medium tabular-nums">~{forecast.avgDailyUsage.toLocaleString()} кредитів/день</span>
      </div>

      {/* Days Remaining Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Вистачить на:</span>
          </div>
          <span className="font-semibold tabular-nums">
            ~{forecast.daysRemaining > 99 ? "99+" : forecast.daysRemaining} {
              forecast.daysRemaining === 1 ? "день" : 
              forecast.daysRemaining < 5 ? "дні" : "днів"
            }
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className={`h-full transition-all ${
              forecast.status === 'sufficient' ? 'bg-emerald-500' : 
              forecast.status === 'warning' ? 'bg-amber-500' : 
              'bg-red-500'
            }`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Орієнтовно до {format(exhaustionDate, "d MMMM", { locale: uk })}</span>
          <span>Списання {format(billingDate, "d MMMM", { locale: uk })}</span>
        </div>
      </div>

      {/* Status Message */}
      <div className={`flex items-center gap-2 p-3 rounded-lg ${config.bgColor}`}>
        <StatusIcon className={`h-4 w-4 shrink-0 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.message}
        </span>
      </div>

      {/* Tip */}
      {forecast.status === "sufficient" && (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Перехід на "Преміум" дасть +10% кредитів та кращі умови поповнення.
          </p>
        </div>
      )}
    </div>
  );

  if (!standalone) {
    return content;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Прогноз використання</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};