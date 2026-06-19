import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminTopUpError = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Поповнення не вдалося</h1>
          <p className="text-muted-foreground">
            Оплата не була завершена. Спробуйте ще раз або оберіть інший спосіб оплати.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => navigate("/admin/top-up")}>
            Спробувати ще раз
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/editorial-settings")}>
            Повернутися до налаштувань
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminTopUpError;
