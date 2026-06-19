import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { UserSubscriptionStatus, CreditUsageEntry } from "@/config/pricingData";

export interface CreditForecast {
  avgDailyUsage: number;
  daysRemaining: number;
  daysToNextBilling: number;
  status: "sufficient" | "warning" | "critical";
  recommendation?: string;
  percentRemaining: number;
}

export const useCreditForecast = (
  subscription: UserSubscriptionStatus,
  usageHistory: CreditUsageEntry[]
): CreditForecast => {
  return useMemo(() => {
    const now = new Date();
    
    // Filter last 7 days of usage
    const last7Days = usageHistory.filter(e => 
      differenceInDays(now, new Date(e.date)) <= 7
    );
    
    // Calculate total used in last 7 days
    const totalUsed = last7Days.reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const avgDailyUsage = last7Days.length > 0 ? totalUsed / 7 : 0;
    
    // Calculate days remaining
    const daysRemaining = avgDailyUsage > 0 
      ? Math.floor(subscription.currentBalance / avgDailyUsage)
      : 999;
      
    // Days to next billing
    const daysToNextBilling = differenceInDays(
      new Date(subscription.nextBillingDate),
      now
    );
    
    // Calculate percent remaining
    const percentRemaining = Math.round(
      (subscription.currentBalance / subscription.periodCredits) * 100
    );
    
    // Determine status
    let status: CreditForecast["status"] = "sufficient";
    let recommendation: string | undefined;
    
    if (daysRemaining < 7 || percentRemaining < 10) {
      status = "critical";
      recommendation = "Рекомендуємо поповнити баланс зараз, щоб уникнути перерви в роботі.";
    } else if (daysRemaining < daysToNextBilling || percentRemaining < 20) {
      status = "warning";
      recommendation = "Баланс може закінчитися до наступного поповнення. Розгляньте поповнення.";
    }
    
    return { 
      avgDailyUsage: Math.round(avgDailyUsage), 
      daysRemaining, 
      daysToNextBilling, 
      status,
      recommendation,
      percentRemaining
    };
  }, [subscription, usageHistory]);
};
