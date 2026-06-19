import { TrendingUp, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapsibleAnalyticsSection } from "./widgets/CollapsibleAnalyticsSection";
import { AnalyticsExplorerShell } from "./AnalyticsExplorerShell";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";

interface PassiveModeViewProps {
  config: CabinetAnalyticsConfig;
  onChatPromptInsert?: (prompt: string) => void;
}

export const PassiveModeView = ({ config, onChatPromptInsert }: PassiveModeViewProps) => {
  return (
    <div className="space-y-4">
      {config.chartData.length > 0 && (
        <CollapsibleAnalyticsSection
          id="analytics-chart"
          title="Історія оборотів з партнером"
          icon={TrendingUp}
          defaultOpen
          badge={`${config.chartData.length} міс.`}
        >
          <div className="h-64 md:h-72">
            <AnalyticsExplorerShell
              datasets={[{
                id: "dynamics",
                label: "Динаміка",
                icon: TrendingUp,
                rows: config.chartData.map((item: any, idx: number) => ({
                  id: `dyn-${idx}`,
                  metric: item.month,
                  currentValue: item.income || 0,
                  previousValue: 0,
                  delta: 0,
                  deltaPercent: 0,
                  direction: "stable" as const,
                  format: "currency" as const,
                  semantic: "positive-up" as const,
                })),
                chartData: config.chartData.map((item: any) => ({
                  category: item.month,
                  current: item.income || 0,
                  previous: 0,
                })),
                currentLabel: "Оборот",
                previousLabel: "—",
                chartType: "bar",
              }]}
            />
          </div>
        </CollapsibleAnalyticsSection>
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-5 h-5 text-primary" />
            Спробуй запитати в AI-Бухгалтера
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea orientation="horizontal" className="w-full">
            <div className="flex gap-2 pb-2">
              {config.chatPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
                  onClick={() => onChatPromptInsert?.(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
