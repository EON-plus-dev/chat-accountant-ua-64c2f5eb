import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreditForecastCard } from "./CreditForecastCard";
import { CreditUsageAnalytics } from "./CreditUsageAnalytics";
import { CreditForecast } from "@/hooks/useCreditForecast";
import { CreditUsageEntry } from "@/config/pricingData";

interface CreditInsightsCardProps {
  forecast: CreditForecast;
  nextBillingDate: string;
  entries: CreditUsageEntry[];
}

export const CreditInsightsCard = ({ 
  forecast, 
  nextBillingDate, 
  entries 
}: CreditInsightsCardProps) => {
  return (
    <Card>
      <Tabs defaultValue="forecast">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Прогноз та аналітика</CardTitle>
            </div>
            <TabsList className="h-8">
              <TabsTrigger value="forecast" className="text-xs px-3 h-6">
                Прогноз
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs px-3 h-6">
                Аналітика
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <TabsContent value="forecast" className="mt-0">
            <CreditForecastCard 
              forecast={forecast} 
              nextBillingDate={nextBillingDate}
              standalone={false}
            />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <CreditUsageAnalytics 
              entries={entries}
              standalone={false}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
