import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { plans } from "@/config/pricingData";

export const ComparisonTableSection = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Порівняння тарифів</h2>
      
      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.popular ? "border-primary" : ""}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{plan.name}</span>
                {plan.popular && <Badge size="sm">Популярний</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Ціна:</span>
                  <span className="ml-1 font-medium">{plan.price} грн/міс</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Кредитів:</span>
                  <span className="ml-1 font-medium tabular-nums">{plan.credits.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Дій:</span>
                  <span className="ml-1">~{plan.actions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Поповнення:</span>
                  <span className="ml-1">{plan.topUpRate.toLocaleString()} / 1 грн</span>
                </div>
              </div>
              <div className="text-sm text-success pt-1">
                {plan.id === "start" && "Базова ціна"}
                {plan.id === "smart" && "До 5% дешевше"}
                {plan.id === "premium" && "До 10% дешевше"}
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
              <TableHead>Ціна / міс</TableHead>
              <TableHead>Кредитів</TableHead>
              <TableHead>Дій / міс</TableHead>
              <TableHead>Поповнення 1 грн</TableHead>
              <TableHead>Вигода</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{plan.price} грн</TableCell>
                <TableCell className="tabular-nums">{plan.credits.toLocaleString()}</TableCell>
                <TableCell>~{plan.actions}</TableCell>
                <TableCell>{plan.topUpRate.toLocaleString()} кредитів</TableCell>
                <TableCell>
                  {plan.id === "start" && "Базова ціна"}
                  {plan.id === "smart" && "До 5% дешевше"}
                  {plan.id === "premium" && "До 10% дешевше"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        "Дія" — це, наприклад, AI-сесія, створення пакету документів, звіт, платіжний пакет тощо.
      </p>
    </section>
  );
};
