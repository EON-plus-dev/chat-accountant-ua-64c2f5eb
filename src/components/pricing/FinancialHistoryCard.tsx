import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BillingHistoryList } from "./BillingHistoryList";
import { CreditUsageList } from "./CreditUsageList";
import { CreditUsageEntry } from "@/config/pricingData";

interface BillingHistoryItem {
  id: string;
  date: string;
  type: "subscription" | "topup" | "plan_change";
  plan?: string;
  fromPlan?: string;
  toPlan?: string;
  amount: number;
  credits: number;
  status: "success" | "failed" | "error";
}

interface FinancialHistoryCardProps {
  billingItems: BillingHistoryItem[];
  creditUsageEntries: CreditUsageEntry[];
}

export const FinancialHistoryCard = ({ 
  billingItems, 
  creditUsageEntries 
}: FinancialHistoryCardProps) => {
  return (
    <Card id="financial-history" className="scroll-mt-20">
      <Tabs defaultValue="billing">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Фінансова історія</CardTitle>
            </div>
            <TabsList className="h-8">
              <TabsTrigger value="billing" className="text-xs px-3 h-6">
                Оплати
              </TabsTrigger>
              <TabsTrigger value="usage" className="text-xs px-3 h-6">
                Списання кредитів
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <TabsContent value="billing" className="mt-0">
            <BillingHistoryList 
              items={billingItems}
              standalone={false}
              searchable
              filterable
            />
          </TabsContent>
          <TabsContent value="usage" className="mt-0">
            <CreditUsageList 
              entries={creditUsageEntries}
              standalone={false}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
