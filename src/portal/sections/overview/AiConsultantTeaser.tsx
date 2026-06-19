import { Link } from "react-router-dom";
import { Bot, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAudience } from "@/contexts/AudienceContext";
import { getAiSuggestions } from "@/portal/data/dailyDigest";

export const AiConsultantTeaser = () => {
  const { audience } = useAudience();
  const suggestions = getAiSuggestions(audience);

  return (
    <section>
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">AI-консультант</p>
              <p className="text-[10px] text-muted-foreground">Відповіді з посиланням на ПКУ</p>
            </div>
            <Badge className="ml-auto bg-chart-2/10 text-chart-2 border-chart-2/20 text-[10px]">Безкоштовно</Badge>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map(s => (
              <Link
                key={s}
                to="/consultant"
                className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>

          <Link to="/consultant" className="text-xs text-primary hover:underline flex items-center gap-1">
            Задати своє питання <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>
    </section>
  );
};
