import { Link } from "react-router-dom";
import { Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAudience } from "@/contexts/AudienceContext";
import { getDailyTip } from "@/portal/data/dailyDigest";

export const DailyTip = () => {
  const { audience } = useAudience();
  const tip = getDailyTip(audience);

  return (
    <section>
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Порада дня</p>
              <p className="text-sm text-foreground leading-relaxed">{tip.text}</p>
              <Link to={tip.href} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                {tip.cta} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
