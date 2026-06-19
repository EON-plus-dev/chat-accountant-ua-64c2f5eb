import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AdminTopUpSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = parseFloat(searchParams.get("amount") || "100");
  const credits = parseInt(searchParams.get("credits") || "1100000");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Баланс поповнено!</h1>
          <p className="text-muted-foreground">
            Кредити нараховано. Можете продовжувати генерацію контенту.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Сума:</span>
              <span className="font-semibold">{amount} грн</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Нараховано кредитів:</span>
              <span className="font-semibold tabular-nums">{credits.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => navigate("/admin/editorial-settings")}>
            Повернутися до налаштувань
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/autocontent")}>
            Перейти до генерації
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminTopUpSuccess;
