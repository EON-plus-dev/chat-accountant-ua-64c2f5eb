import { Crown, Calendar, Zap, ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { UserSubscriptionStatus, plans, demoCreditUsageHistory, CreditUsageEntry } from "@/config/pricingData";
import { useCreditForecast } from "@/hooks/useCreditForecast";
import { LowBalanceAlert } from "./LowBalanceAlert";
import { SubscriptionManagementSection } from "./SubscriptionManagementSection";

interface SubscriptionStatusCardProps {
  subscription: UserSubscriptionStatus;
  onChangePlan?: () => void;
  onTopUp?: () => void;
  onToggleAutoRenew?: (enabled: boolean) => void;
  onCancelSubscription?: () => void;
  onReactivate?: () => void;
}

export const SubscriptionStatusCard = ({
  subscription,
  onChangePlan,
  onTopUp,
  onToggleAutoRenew,
  onCancelSubscription,
  onReactivate,
}: SubscriptionStatusCardProps) => {
  const plan = plans.find(p => p.id === subscription.planId);
  const usagePercent = Math.round((subscription.usedCredits / subscription.periodCredits) * 100);
  const estimatedActions = Math.floor(subscription.currentBalance / (plan?.credits ? plan.credits / plan.actions : 100));
  
  // Calculate forecast
  const forecast = useCreditForecast(subscription, demoCreditUsageHistory);
  
  const statusColors = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    trial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    expired: "bg-muted text-muted-foreground",
  };

  const statusLabels = {
    active: "Активний",
    trial: "Пробний період",
    cancelled: "Скасовано",
    expired: "Закінчився",
  };

  // Dynamic progress bar color based on remaining percentage
  const getProgressColor = () => {
    const remaining = 100 - usagePercent;
    if (remaining > 50) return "bg-emerald-500";
    if (remaining > 20) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Тариф «{subscription.planName}»</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {plan?.price && (
                  <p className="text-sm text-muted-foreground font-medium">
                    {plan.price.toLocaleString()} грн / місяць
                  </p>
                )}
                <Badge className={statusColors[subscription.status]} size="sm">
                  {statusLabels[subscription.status]}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onChangePlan}>
            Змінити тариф
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Low Balance Alert */}
        <LowBalanceAlert 
          forecast={forecast}
          currentBalance={subscription.currentBalance}
          topUpRate={subscription.topUpRate}
          onTopUp={onTopUp}
          onUpgrade={onChangePlan}
        />

        {/* Balance & Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-xl bg-background/80 border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Zap className="h-4 w-4" />
              Баланс
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {subscription.currentBalance.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">кредитів</div>
          </div>

          <div className="p-4 rounded-xl bg-background/80 border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Орієнтовно
            </div>
            <div className="text-2xl font-bold tabular-nums">
              ~{estimatedActions}
            </div>
            <div className="text-xs text-muted-foreground">дій у системі</div>
          </div>

          <div className="p-4 rounded-xl bg-background/80 border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="h-4 w-4" />
              Наступне списання
            </div>
            <div className="text-lg font-semibold">
              {format(new Date(subscription.nextBillingDate), "d MMMM", { locale: uk })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(subscription.nextBillingDate), "yyyy", { locale: uk })}
            </div>
          </div>
        </div>

        {/* Usage Progress with Dynamic Color */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Використано за період</span>
            <span className="font-medium tabular-nums">{usagePercent}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full transition-all ${getProgressColor()}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Витрачено <span className="font-medium text-foreground">{subscription.usedCredits.toLocaleString()}</span> з {subscription.periodCredits.toLocaleString()} кредитів
            </span>
          </div>
        </div>

        {/* Forecast Summary */}
        {forecast.avgDailyUsage > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Прогноз:</span>
              <span className="font-medium">
                ~{forecast.daysRemaining > 99 ? "99+" : forecast.daysRemaining} {
                  forecast.daysRemaining === 1 ? "день" : 
                  forecast.daysRemaining < 5 ? "дні" : "днів"
                }
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 pl-6">
              ~{forecast.avgDailyUsage.toLocaleString()} кр./день · до {format(new Date(subscription.nextBillingDate), "d MMMM", { locale: uk })}
            </p>
          </div>
        )}

        {/* Subscription Management */}
        {onToggleAutoRenew && onCancelSubscription && onReactivate && (
          <SubscriptionManagementSection
            subscription={subscription}
            planPrice={plan?.price ?? 0}
            onToggleAutoRenew={onToggleAutoRenew}
            onCancelSubscription={onCancelSubscription}
            onReactivate={onReactivate}
            onDowngrade={onChangePlan}
          />
        )}

        {/* Action */}
        {subscription.status === "cancelled" ? null : (
          <Button className="w-full gap-2" onClick={onTopUp}>
            <Zap className="h-4 w-4" />
            Поповнити кредити
          </Button>
        )}
      </CardContent>
    </Card>
  );
};