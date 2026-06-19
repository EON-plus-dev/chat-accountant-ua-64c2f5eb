import { Lock, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PlanType = "start" | "smart" | "premium";

const planLabels: Record<PlanType, string> = {
  start: "Старт",
  smart: "Смарт",
  premium: "Преміум",
};

const planColors: Record<PlanType, string> = {
  start: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  smart: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

interface LockedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  benefit: string;
  planRequired: PlanType;
  onUnlock: () => void;
  className?: string;
}

export const LockedFeatureCard = ({
  icon: Icon,
  title,
  description,
  benefit,
  planRequired,
  onUnlock,
  className,
}: LockedFeatureCardProps) => {
  return (
    <Card 
      className={cn(
        "border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/30 transition-colors",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Lock icon */}
          <div className="p-2 rounded-lg bg-muted shrink-0">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title with feature icon */}
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
            </div>
            
            {/* Description */}
            <p className="text-xs text-muted-foreground/80">{description}</p>
            
            {/* Benefit badge */}
            <Badge variant="secondary" className="text-xs font-normal">
              💡 {benefit}
            </Badge>
            
            {/* CTA */}
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full mt-2 h-8 text-xs gap-1.5"
              onClick={onUnlock}
            >
              Розблокувати на плані 
              <Badge 
                variant="secondary" 
                size="sm"
                className={cn("ml-1", planColors[planRequired])}
              >
                {planLabels[planRequired]}
              </Badge>
              <ArrowRight className="h-3 w-3 ml-auto" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LockedFeatureCard;
