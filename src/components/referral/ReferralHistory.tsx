import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  CreditCard, 
  Award, 
  Clock,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type ReferralTransaction } from "@/config/referralConfig";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

interface ReferralHistoryProps {
  transactions: ReferralTransaction[];
  className?: string;
}

export const ReferralHistory = ({
  transactions,
  className,
}: ReferralHistoryProps) => {
  const formatCredits = (credits: number) => {
    if (credits >= 1000) {
      return `${(credits / 1000).toFixed(0)}K`;
    }
    return credits.toString();
  };

  const getTransactionIcon = (type: ReferralTransaction["type"]) => {
    switch (type) {
      case "referral":
        return <User className="h-4 w-4 text-primary" />;
      case "paid_conversion":
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case "tier_bonus":
        return <Award className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransactionBadgeVariant = (type: ReferralTransaction["type"]) => {
    switch (type) {
      case "referral":
        return "secondary";
      case "paid_conversion":
        return "success";
      case "tier_bonus":
        return "warning";
      default:
        return "outline";
    }
  };

  if (transactions.length === 0) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="p-6 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Ще немає нарахувань
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Запросіть першого реферала!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Останні нарахування
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-2">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              {/* Icon */}
              <div className="shrink-0 p-1.5 rounded-full bg-background">
                {getTransactionIcon(transaction.type)}
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {transaction.description}
                  {transaction.referralName && (
                    <span className="text-muted-foreground">
                      : {transaction.referralName}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(transaction.date, {
                    addSuffix: true,
                    locale: uk,
                  })}
                </p>
              </div>

              {/* Amount */}
              <Badge 
                variant={getTransactionBadgeVariant(transaction.type) as any}
                className="shrink-0"
              >
                {transaction.type === "tier_bonus" 
                  ? "Бонус" 
                  : `+${formatCredits(transaction.amount)}`}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralHistory;
