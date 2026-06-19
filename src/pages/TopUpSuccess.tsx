import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demoUserData } from "@/config/pricingData";

const TopUpSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = parseFloat(searchParams.get("amount") || "10");
  const credits = parseInt(searchParams.get("credits") || "110000");
  
  const newBalance = demoUserData.balance + credits;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Кредити успішно поповнено</h1>
          <p className="text-muted-foreground">
            Поповнення пройшло успішно. Новий баланс уже доступний у вашому акаунті.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Сума поповнення:</span>
              <span className="font-semibold">{amount} грн</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Нараховано кредитів:</span>
              <span className="font-semibold tabular-nums">{credits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="text-muted-foreground">Новий баланс:</span>
              <span className="font-bold text-lg tabular-nums">{newBalance.toLocaleString()} кредитів</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Повернутися в кабінет
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard?tab=user-settings&subtab=tariff&section=financial-history")}>
            Переглянути історію оплат
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopUpSuccess;
