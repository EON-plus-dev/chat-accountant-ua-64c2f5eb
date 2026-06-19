import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CheckoutError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "smart";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Оплата не пройшла</h1>
          <p className="text-muted-foreground">
            Щось пішло не так. Оплата не була завершена. Спробуйте ще раз або використайте інший спосіб оплати.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => navigate(`/checkout?plan=${planId}`)}>
            Спробувати ще раз
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard?tab=user-settings&subtab=tariff&section=tariffs")}>
            Повернутися до тарифів
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutError;
