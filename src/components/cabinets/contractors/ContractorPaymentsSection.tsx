import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buildUrlWithTrail } from "@/hooks/useBackTrail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Scale,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { getContractorPayments } from "@/config/contractorHistoryConfig";
import { ReconciliationActDialog } from "./ReconciliationActDialog";
import UnifiedFilterPopover, { type FilterSection } from "@/components/ui/UnifiedFilterPopover";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Cabinet } from "@/types/cabinet";
import type { Contractor } from "@/config/settingsConfig";

interface PaymentStats {
  totalAmount: number;
  paidAmount: number;
  balance: number;
  avgPaymentDays: number;
  overduePayments: number;
  lastPaymentDate?: string;
}

interface ContractorPaymentsSectionProps {
  stats: PaymentStats;
  contractorId?: string;
  cabinet?: Cabinet;
  contractor?: Contractor;
  onNavigateToDocument?: (documentId: string) => void;
}

export const ContractorPaymentsSection = ({
  stats,
  contractorId,
  cabinet,
  contractor,
  onNavigateToDocument,
}: ContractorPaymentsSectionProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showReconciliationDialog, setShowReconciliationDialog] = useState(false);
  const [pageSize] = useState(5);
  const [showAll, setShowAll] = useState(false);
  const [directionFilter, setDirectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const allPayments = contractorId ? getContractorPayments(contractorId) : [];

  // Apply filters
  const filteredPayments = useMemo(() => {
    return allPayments.filter((p) => {
      if (directionFilter !== "all" && p.direction !== directionFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [allPayments, directionFilter, statusFilter]);

  // Paginate
  const payments = showAll ? filteredPayments : filteredPayments.slice(0, pageSize);
  const hasMore = filteredPayments.length > pageSize && !showAll;
  const activeFiltersCount =
    (directionFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  const paidPercent =
    stats.totalAmount > 0
      ? Math.round((stats.paidAmount / stats.totalAmount) * 100)
      : 0;

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    return `${amount < 0 ? "-" : ""}${absAmount.toLocaleString("uk-UA")} ₴`;
  };

  const getBalanceColor = () => {
    if (stats.balance > 0) return "text-green-600 dark:text-green-400";
    if (stats.balance < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const filterSections: FilterSection[] = [
    {
      id: "direction",
      label: "Напрям",
      options: [
        { value: "all", label: "Всі" },
        { value: "incoming", label: "Вхідні" },
        { value: "outgoing", label: "Вихідні" },
      ],
      value: directionFilter,
      onChange: setDirectionFilter,
    },
    {
      id: "status",
      label: "Статус",
      options: [
        { value: "all", label: "Всі" },
        { value: "completed", label: "Виконано" },
        { value: "pending", label: "В обробці" },
        { value: "failed", label: "Помилка" },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ];

  const handleResetFilters = () => {
    setDirectionFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Статистика оплат
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  // Тип 3: повна навігація → додаємо back-trail для повернення на контрагента.
                  const target = contractor?.id
                    ? `/dashboard?tab=operations&subtab=payments&contractor=${contractor.id}`
                    : "/dashboard?tab=operations&subtab=payments";
                  navigate(
                    buildUrlWithTrail(target, {
                      label: contractor?.name ? `Контрагент: ${contractor.name}` : "Контрагент",
                      url: window.location.pathname + window.location.search,
                    }),
                  );
                }}
              >
                <ArrowRight className="h-4 w-4" />
                <span className="hidden sm:inline">Перейти до платежів</span>
                <span className="sm:hidden">Платежі</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowReconciliationDialog(true)}
                disabled={!cabinet || !contractor}
              >
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">Акт звірки</span>
                <span className="sm:hidden">Звірка</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Payment progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Оплачено</span>
              <span className="font-medium">{paidPercent}%</span>
            </div>
            <Progress value={paidPercent} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(stats.paidAmount)}</span>
              <span>з {formatCurrency(stats.totalAmount)}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Balance */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stats.balance > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : stats.balance < 0 ? (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                ) : (
                  <CheckCircle className="h-3 w-3" />
                )}
                Поточний баланс
              </p>
              <p className={cn("text-lg font-semibold", getBalanceColor())}>
                {stats.balance > 0 ? "+" : ""}
                {formatCurrency(stats.balance)}
              </p>
              {stats.balance !== 0 && (
                <p className="text-xs text-muted-foreground">
                  {stats.balance > 0 ? "Нам винні" : "Ми винні"}
                </p>
              )}
            </div>

            {/* Overdue payments */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Прострочені
              </p>
              <p
                className={cn(
                  "text-lg font-semibold",
                  stats.overduePayments > 0 && "text-destructive"
                )}
              >
                {stats.overduePayments}
              </p>
              {stats.overduePayments > 0 && (
                <p className="text-xs text-destructive">Потребує уваги</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {allPayments.length > 0 && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                Історія оплат
                <Badge variant="secondary">{filteredPayments.length}</Badge>
              </CardTitle>

              <UnifiedFilterPopover
                sections={filterSections}
                activeFiltersCount={activeFiltersCount}
                onReset={handleResetFilters}
                title="Фільтри оплат"
                isMobile={isMobile}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-muted-foreground">
                  Оплат за вказаними фільтрами не знайдено
                </p>
                <Button variant="link" size="sm" onClick={handleResetFilters} className="mt-2">
                  Скинути фільтри
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() =>
                      payment.linkedDocumentId &&
                      onNavigateToDocument?.(payment.linkedDocumentId)
                    }
                  >
                    <div
                      className={cn(
                        "rounded-full p-2 shrink-0",
                        payment.direction === "incoming"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                          : "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                      )}
                    >
                      {payment.direction === "incoming" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {payment.paymentPurpose ||
                          (payment.direction === "incoming"
                            ? "Вхідна оплата"
                            : "Вихідна оплата")}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(payment.date), "d MMM yyyy", { locale: uk })}
                        </span>
                        {payment.linkedDocumentNumber && (
                          <Badge variant="outline" className="text-[10px] h-4">
                            {payment.linkedDocumentNumber}
                          </Badge>
                        )}
                        {payment.bankName && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            · {payment.bankName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          "font-semibold tabular-nums",
                          payment.direction === "incoming"
                            ? "text-green-600"
                            : "text-orange-600"
                        )}
                      >
                        {payment.direction === "incoming" ? "+" : "-"}
                        {payment.amount.toLocaleString("uk-UA")} ₴
                      </p>
                      <Badge
                        variant={payment.status === "completed" ? "outline" : "secondary"}
                        className={cn(
                          "text-[10px] h-4 mt-0.5",
                          payment.status === "completed" && "text-green-600 border-green-200"
                        )}
                      >
                        {payment.status === "completed"
                          ? "Виконано"
                          : payment.status === "pending"
                            ? "В обробці"
                            : "Помилка"}
                      </Badge>
                    </div>
                  </div>
                ))}

                {/* Show more button */}
                {hasMore && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full gap-1.5 text-muted-foreground"
                      onClick={() => setShowAll(true)}
                    >
                      <ChevronDown className="h-4 w-4" />
                      Показати ще ({filteredPayments.length - pageSize})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reconciliation Act Dialog */}
      {cabinet && contractor && (
        <ReconciliationActDialog
          open={showReconciliationDialog}
          onOpenChange={setShowReconciliationDialog}
          cabinet={cabinet}
          contractor={contractor}
          payments={allPayments}
          openingBalance={stats.balance}
        />
      )}
    </div>
  );
};
