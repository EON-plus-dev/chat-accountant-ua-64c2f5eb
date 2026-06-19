import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { plans } from "@/config/pricingData";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "smart";
  
  const plan = plans.find(p => p.id === planId) || plans[1];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Підписку успішно оформлено</h1>
          <p className="text-muted-foreground">
            Дякуємо! Ваша підписка активована. Кредити вже доступні у вашому акаунті.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Тариф:</span>
              <Badge variant="secondary">{plan.name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Місячна ціна:</span>
              <span className="font-semibold">{plan.price} грн</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Нараховано кредитів:</span>
              <span className="font-semibold tabular-nums">{plan.credits.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Перейти в кабінет
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard?tab=user-settings&subtab=tariff&section=financial-history")}>
            Переглянути історію оплат
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
