import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAudience } from "@/contexts/AudienceContext";
import { getPopularTools, getToolBenefit } from "@/portal/data/dailyDigest";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const ToolsCarousel = () => {
  const { audience } = useAudience();
  const tools = getPopularTools(audience, 6);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Інструменти</h2>
        <Link to="/tools" className="text-xs text-primary hover:underline flex items-center gap-1">
          Всі інструменти <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3">
          {tools.map(tool => {
            const benefit = getToolBenefit(tool.id) ?? tool.description;
            return (
              <Link key={tool.id} to={`/tools/${tool.slug}`} className="shrink-0 w-[220px]">
                <Card className="h-full hover:shadow-[var(--shadow-lg)] transition-all">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{tool.emoji}</span>
                      {tool.isNew && <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-[10px]">NEW</Badge>}
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{tool.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">{benefit}</p>
                    {tool.usageCount > 0 && (
                      <p className="text-[10px] text-muted-foreground">{tool.usageLabel}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};
