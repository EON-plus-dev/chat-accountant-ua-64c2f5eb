import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { plans } from "@/config/pricingData";

export const TopUpTableSection = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Якщо кредитів не вистачило — просто поповніть</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          У пікові періоди (звітність, хвиля виплат ФОП, закриття місяця) ви можете докупити кредити. Чим вищий тариф — тим більше кредитів ви отримуєте за ті ж гроші.
        </p>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-4">
              <div className="font-semibold mb-2">{plan.name}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">1 грн:</span>
                  <span className="tabular-nums font-medium">{plan.topUpRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">5 грн:</span>
                  <span className="tabular-nums font-medium">{(plan.topUpRate * 5).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">10 грн:</span>
                  <span className="tabular-nums font-medium">{(plan.topUpRate * 10).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">20 грн:</span>
                  <span className="tabular-nums font-medium">{(plan.topUpRate * 20).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Тариф</TableHead>
              <TableHead className="text-right">1 грн</TableHead>
              <TableHead className="text-right">5 грн</TableHead>
              <TableHead className="text-right">10 грн</TableHead>
              <TableHead className="text-right">20 грн</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell className="text-right tabular-nums">{plan.topUpRate.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{(plan.topUpRate * 5).toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{(plan.topUpRate * 10).toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{(plan.topUpRate * 20).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        На «Смарт» і «Преміум» ви отримуєте більше кредитів за ту саму гривню, ніж на «Старт».
      </p>

      <div className="text-center">
        <Button className="min-h-[44px]" onClick={() => navigate("/top-up")}>Поповнити кредити</Button>
      </div>
    </section>
  );
};
