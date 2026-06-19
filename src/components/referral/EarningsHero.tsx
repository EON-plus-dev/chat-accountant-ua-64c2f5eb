import { TrendingUp, Users, Target, ArrowRight, Info, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  referralTiers, 
  type ReferralStats,
  formatReferralCredits,
  creditsToUah,
} from "@/config/referralConfig";
import { useNavigate } from "react-router-dom";

interface EarningsHeroProps {
  stats: ReferralStats;
  totalReferrals: number;
  className?: string;
  onNavigateToPricing?: () => void;
}

export const EarningsHero = ({ stats, totalReferrals, className, onNavigateToPricing }: EarningsHeroProps) => {
  const navigate = useNavigate();
  const estimatedUah = creditsToUah(stats.totalCreditsEarned);
  
  const handleLearnMore = () => {
    if (onNavigateToPricing) {
      onNavigateToPricing();
    } else {
      navigate("/dashboard?tab=pricing&section=referral-program");
    }
  };
  
  // Calculate referrals needed for next tier
  const referralsToNextTier = stats.nextTier 
    ? stats.nextTier.minReferrals - totalReferrals 
    : 0;

  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-emerald-50/30 dark:to-emerald-950/10 overflow-hidden",
      className
    )}>
      <CardContent className="p-4 space-y-4">
        {/* Main Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Earned */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Banknote className="h-4 w-4 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-600 tabular-nums">
                {estimatedUah > 0 ? `~${estimatedUah} грн` : "0 грн"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Зароблено</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-[10px] gap-1 cursor-help">
                  {formatReferralCredits(stats.totalCreditsEarned, false)}
                  <Info className="h-2.5 w-2.5" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Загальна сума зароблених кредитів</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Conversions */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold tabular-nums">
                {stats.paidConversions}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Конверсій</p>
            <Badge variant="secondary" className="text-[10px]">
              з {totalReferrals} рефералів
            </Badge>
          </div>
          
          {/* Next Goal */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-amber-500" />
              <span className="text-lg font-semibold">
                {stats.nextTier ? stats.nextTier.name : "Максимум"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Наступна ціль</p>
            {stats.nextTier && (
              <Badge variant="outline" className="text-[10px]">
                {referralsToNextTier} рефералів
              </Badge>
            )}
          </div>
        </div>
        
        {/* Horizontal Tier Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {referralTiers.map((tier, index) => {
              const isActive = tier.level === stats.currentTier.level;
              const isPast = tier.level < stats.currentTier.level;
              const isNext = tier.level === stats.currentTier.level + 1;
              
              return (
                <div key={tier.level} className="flex items-center flex-1">
                  {/* Tier point */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "relative flex flex-col items-center cursor-help",
                        index > 0 && "flex-1"
                      )}>
                        {/* Connecting line */}
                        {index > 0 && (
                          <div className={cn(
                            "absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2",
                            isPast || isActive ? "bg-primary" : "bg-border"
                          )} />
                        )}
                        
                        {/* Point */}
                        <div className={cn(
                          "relative z-10 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                          isActive && "ring-4 ring-primary/20 bg-primary text-primary-foreground scale-110",
                          isPast && "bg-primary/80 text-primary-foreground",
                          !isActive && !isPast && "bg-muted border-2 border-border text-muted-foreground",
                          isNext && "animate-pulse border-primary/50"
                        )}>
                          {tier.badge || tier.level}
                        </div>
                        
                        {/* Label */}
                        <span className={cn(
                          "text-[10px] mt-1 whitespace-nowrap",
                          isActive ? "font-semibold text-primary" : "text-muted-foreground"
                        )}>
                          {tier.name}
                        </span>
                        
                        {/* "You are here" indicator */}
                        {isActive && (
                          <span className="text-[9px] text-primary font-medium">
                            ви тут
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{tier.name}</p>
                        <p className="text-xs">від {tier.minReferrals} рефералів</p>
                        <p className="text-xs">+{formatReferralCredits(tier.creditsPerReferral, false)} за реферала</p>
                        {tier.bonus && <p className="text-xs text-emerald-500">{tier.bonus}</p>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </div>
          
          {/* Progress to next tier */}
          {stats.nextTier && (
            <div className="space-y-1">
              <Progress value={stats.progressToNextTier} className="h-1.5" />
              <p className="text-xs text-muted-foreground text-center">
                {stats.nextTier.bonus && (
                  <span className="text-amber-600 dark:text-amber-400">
                    До "{stats.nextTier.bonus}" — {referralsToNextTier} рефералів
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
        
        {/* CTA to learn more */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full gap-2 text-xs h-8"
          onClick={handleLearnMore}
        >
          Дізнатися більше про програму
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default EarningsHero;
