/**
 * QUICK ORDER CARD
 * 
 * CTA для швидкого формування замовлення на основі типових позицій
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingCart } from "lucide-react";

interface QuickOrderCardProps {
  hasProducts: boolean;
  onCreateOrder?: () => void;
}

export const QuickOrderCard = ({
  hasProducts,
  onCreateOrder,
}: QuickOrderCardProps) => {
  if (!hasProducts) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 hidden sm:flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">Швидке замовлення</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              На основі типових позицій та історії можна автоматично сформувати
              замовлення. Система запропонує оптимальну кількість.
            </p>
          </div>
          <Button onClick={onCreateOrder} className="gap-2 shrink-0 w-full sm:w-auto">
            <ShoppingCart className="h-4 w-4" />
            Створити замовлення
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
