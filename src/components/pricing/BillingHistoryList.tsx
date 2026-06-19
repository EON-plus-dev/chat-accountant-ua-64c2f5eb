import { useState, useMemo } from "react";
import { ChevronDown, Receipt, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { operationTypeVariants } from "@/config/semanticStyles";
import { PaymentReceiptDialog } from "./PaymentReceiptDialog";
import { toast } from "sonner";

const operationFilterOptions = [
  { value: "all", label: "Усі операції" },
  { value: "subscription", label: "Підписка" },
  { value: "topup", label: "Поповнення" },
  { value: "plan_change", label: "Зміна тарифу" },
];

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

interface BillingHistoryListProps {
  items: BillingHistoryItem[];
  initialCount?: number;
  standalone?: boolean;
  searchable?: boolean;
  filterable?: boolean;
}

export const BillingHistoryList = ({ 
  items, 
  initialCount = 5,
  standalone = true,
  searchable = false,
  filterable = false,
}: BillingHistoryListProps) => {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [receiptItem, setReceiptItem] = useState<BillingHistoryItem | null>(null);

  const filteredItems = useMemo(() => {
    let result = items;
    if (filterable && filterType !== "all") {
      result = result.filter(item => item.type === filterType);
    }
    if (searchable && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.plan?.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        format(new Date(item.date), "d MMM yyyy", { locale: uk }).toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, filterType, searchQuery, searchable, filterable]);

  const displayedItems = showAll ? filteredItems : filteredItems.slice(0, initialCount);
  const hasMore = filteredItems.length > initialCount;

  const totalSpent = items
    .filter(i => i.status === "success")
    .reduce((sum, i) => sum + i.amount, 0);

  const toolbar = (searchable || filterable) ? (
    <div className="mb-3">
      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Пошук операцій..."
        filterOptions={filterable ? operationFilterOptions : undefined}
        filterValue={filterType}
        onFilterChange={setFilterType}
        filterPlaceholder="Тип операції"
        resultsCount={{ shown: filteredItems.length, total: items.length }}
        sticky={false}
      />
    </div>
  ) : null;

  const content = (
    <>
      {toolbar}

      {/* Desktop: Table view */}
      <div className="hidden md:block">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left font-medium text-muted-foreground px-3 py-2">Дата</th>
                <th className="text-left font-medium text-muted-foreground px-3 py-2">Операція</th>
                <th className="text-left font-medium text-muted-foreground px-3 py-2">Тариф</th>
                <th className="text-right font-medium text-muted-foreground px-3 py-2">Сума</th>
                <th className="text-right font-medium text-muted-foreground px-3 py-2">Кредити</th>
                <th className="text-center font-medium text-muted-foreground px-3 py-2">Статус</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item) => {
                const opType = operationTypeVariants[item.type] || { label: item.type, variant: "default" as const };
                const isSuccess = item.status === "success";
                
                return (
                  <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors group">
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums whitespace-nowrap">
                      {format(new Date(item.date), "d MMM yyyy", { locale: uk })}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={opType.variant} size="sm" className="pointer-events-none">
                        {opType.label}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {item.type === "plan_change" && item.fromPlan && item.toPlan ? (
                        <span className="flex items-center gap-1 text-xs">
                          <span className="text-muted-foreground">{item.fromPlan}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{item.toPlan}</span>
                        </span>
                      ) : (
                        <span className="text-sm">{item.plan || "—"}</span>
                      )}
                    </td>
                    <td className={cn(
                      "px-3 py-2.5 text-right font-medium tabular-nums",
                      item.type === "plan_change" && "text-success"
                    )}>
                      {item.amount > 0 ? (item.type === "plan_change" ? `+${item.amount} грн` : `${item.amount} грн`) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                      {item.credits > 0 ? `+${item.credits.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge variant={isSuccess ? "success" : "error"} size="sm">
                        {isSuccess ? "✓" : "✗"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {isSuccess && item.type !== "plan_change" && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setReceiptItem(item)}>
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("Завантаження PDF буде доступне найближчим часом")}>
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: Cards view */}
      <div className="md:hidden space-y-2">
        {displayedItems.map((item) => {
          const opType = operationTypeVariants[item.type] || { label: item.type, variant: "default" as const };
          const isSuccess = item.status === "success";
          
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                "hover:bg-muted/30 transition-colors"
              )}
            >
              <div className={cn(
                "w-1 h-10 rounded-full shrink-0",
                isSuccess ? "bg-success" : "bg-destructive"
              )} />
              
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={opType.variant} size="sm" className="pointer-events-none">
                    {opType.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.date), "d MMM", { locale: uk })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {item.type === "plan_change" && item.fromPlan && item.toPlan ? (
                      <span>{item.fromPlan} → {item.toPlan}</span>
                    ) : (
                      item.plan || "Поповнення"
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {item.amount > 0 && (
                      <div className="font-semibold tabular-nums text-sm">
                        {item.amount} грн
                      </div>
                    )}
                    {item.credits > 0 && (
                      <div className="text-xs text-muted-foreground tabular-nums">
                        +{item.credits.toLocaleString()} кр.
                      </div>
                    )}
                  </div>
                </div>
                {isSuccess && item.type !== "plan_change" && (
                  <div className="flex gap-2 sm:justify-end">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-initial h-7 text-xs gap-1.5" onClick={() => setReceiptItem(item)}>
                      <FileText className="h-3 w-3" />
                      Квитанція
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-initial h-7 text-xs gap-1.5" onClick={() => toast.info("Завантаження PDF буде доступне найближчим часом")}>
                      <Download className="h-3 w-3" />
                      Завантажити
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          className="w-full gap-2 mt-3"
          onClick={() => setShowAll(!showAll)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
          {showAll ? "Згорнути" : `Показати ще ${filteredItems.length - initialCount}`}
        </Button>
      )}

      <PaymentReceiptDialog
        item={receiptItem}
        open={!!receiptItem}
        onOpenChange={(open) => !open && setReceiptItem(null)}
      />
    </>
  );

  if (!standalone) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Всього: <span className="font-medium text-foreground tabular-nums">{totalSpent.toFixed(2)} грн</span>
        </p>
        {content}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Історія оплат</CardTitle>
            <p className="text-sm text-muted-foreground">
              Всього: <span className="font-medium text-foreground tabular-nums">{totalSpent.toFixed(2)} грн</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{content}</CardContent>
    </Card>
  );
};
