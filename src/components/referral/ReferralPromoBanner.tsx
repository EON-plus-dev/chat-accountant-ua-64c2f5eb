import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  UserPlus, 
  Users, 
  CreditCard,
  ArrowRight,
  Gift,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatReferralCredits } from "@/config/referralConfig";
import { useNavigate } from "react-router-dom";

interface ReferralPromoBannerProps {
  creditsForContractor?: number;
  creditsForTeamMember?: number;
  creditsForConversion?: number;
  onInviteContractor?: () => void;
  onInviteTeamMember?: () => void;
  className?: string;
}

export const ReferralPromoBanner = ({
  creditsForContractor = 5000,
  creditsForTeamMember = 5000,
  creditsForConversion = 5000,
  onInviteContractor,
  onInviteTeamMember,
  className,
}: ReferralPromoBannerProps) => {
  const navigate = useNavigate();

  const handleViewFullDashboard = () => {
    navigate("/dashboard?tab=user-settings&subtab=earnings");
  };

  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-emerald-50/30 dark:to-emerald-950/10 overflow-hidden",
      className
    )}>
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-1.5">
                Запрошуйте партнерів
                <Sparkles className="h-4 w-4 text-amber-500" />
              </h3>
              <p className="text-xs text-muted-foreground">
                Заробляйте кредити за кожного запрошеного
              </p>
            </div>
          </div>
        </div>

        {/* Bonus Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 rounded-lg bg-card border border-border/50 space-y-1">
            <Badge variant="secondary" className="text-sm font-bold">
              {formatReferralCredits(creditsForContractor)}
            </Badge>
            <p className="text-xs text-muted-foreground">За контрагента</p>
            <UserPlus className="h-4 w-4 mx-auto text-primary" />
          </div>
          
          <div className="text-center p-3 rounded-lg bg-card border border-border/50 space-y-1">
            <Badge variant="secondary" className="text-sm font-bold">
              {formatReferralCredits(creditsForTeamMember)}
            </Badge>
            <p className="text-xs text-muted-foreground">За учасника</p>
            <Users className="h-4 w-4 mx-auto text-primary" />
          </div>
          
          <div className="text-center p-3 rounded-lg bg-card border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
            <Badge variant="success" className="text-sm font-bold">
              {formatReferralCredits(creditsForConversion)}
            </Badge>
            <p className="text-xs text-muted-foreground">За оплату</p>
            <CreditCard className="h-4 w-4 mx-auto text-emerald-600" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={onInviteContractor}
          >
            <UserPlus className="h-4 w-4" />
            Запросити контрагента
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={onInviteTeamMember}
          >
            <Users className="h-4 w-4" />
            Запросити учасника
          </Button>
        </div>

        {/* Link to full dashboard */}
        <div className="pt-2 border-t border-border/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full gap-2 text-xs h-8"
            onClick={handleViewFullDashboard}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Перейти до повної статистики заробітку
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralPromoBanner;
