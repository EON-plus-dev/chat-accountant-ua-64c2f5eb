import { useState, useMemo } from "react";
import { MoreHorizontal, FileText, User, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  type SalaryPayment,
  salaryTypeConfig,
  paymentStatusConfig,
} from "@/config/paymentsConfig";
import { getBadgeColorClasses } from "@/config/semanticStyles";

interface SalaryPaymentsTabProps {
  payments: SalaryPayment[];
  onOpenPayment: (payment: SalaryPayment) => void;
  onNavigateToEmployee?: (employeeId: string) => void;
}

const monthOptions = [
  { value: "all", label: "Усі місяці" },
  { value: "2025-08", label: "Серпень 2025" },
  { value: "2025-07", label: "Липень 2025" },
  { value: "2025-06", label: "Червень 2025" },
  { value: "2025-05", label: "Травень 2025" },
];

const statusOptions = [
  { value: "all", label: "Усі статуси" },
  { value: "scheduled", label: "Заплановано" },
  { value: "paid", label: "Виплачено" },
  { value: "overdue", label: "Прострочено" },
];

export function SalaryPaymentsTab({ payments, onOpenPayment, onNavigateToEmployee }: SalaryPaymentsTabProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [monthFilter, setMonthFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique employees from payments
  const employeeOptions = useMemo(() => {
    const uniqueEmployees = new Map<string, string>();
    payments.forEach((p) => {
      uniqueEmployees.set(p.employeeId, p.employeeName);
    });
    return [
      { value: "all", label: "Усі працівники" },
      ...Array.from(uniqueEmployees.entries()).map(([id, name]) => ({
        value: id,
        label: name.split(" ").slice(0, 2).join(" "), // Shortened name
      })),
    ];
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (monthFilter !== "all") {
        const periodLower = p.period.toLowerCase();
        const [year, month] = monthFilter.split("-");
        const monthNames: Record<string, string> = {
          "01": "січ", "02": "лют", "03": "бер", "04": "квіт",
          "05": "трав", "06": "черв", "07": "лип", "08": "серп",
          "09": "верес", "10": "жовт", "11": "листоп", "12": "груд",
        };
        if (!periodLower.includes(monthNames[month]) || !periodLower.includes(year)) return false;
      }
      if (employeeFilter !== "all" && p.employeeId !== employeeFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [payments, monthFilter, employeeFilter, statusFilter]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("uk-UA").format(amount) + " ₴";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
  };

  const handleCreatePaymentOrder = (payment: SalaryPayment) => {
    toast({
      title: "Демо-режим",
      description: `Платіжне доручення для ${payment.employeeName} буде сформовано`,
    });
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cards */}
        {filteredPayments.length === 0 ? (
          <TableEmptyState title="Немає виплат" description="Виплати за обраний період відсутні" />
        ) : (
          <div className="space-y-2">
            {filteredPayments.map((payment) => {
              const StatusIcon = paymentStatusConfig[payment.status].icon;
              const salaryConfig = salaryTypeConfig[payment.salaryType];
              
              return (
                <Card 
                  key={payment.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onOpenPayment(payment)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{payment.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{payment.employeePosition}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold tabular-nums">{formatAmount(payment.amount)}</p>
                          {payment.grossAmount && (
                            <p className="text-xs text-muted-foreground">
                              брутто: {formatAmount(payment.grossAmount)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getBadgeColorClasses(salaryConfig.color, false)}>
                          {salaryConfig.label}
                        </Badge>
                        <Badge variant="secondary" className={cn("text-xs", paymentStatusConfig[payment.status].className)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {payment.statusLabel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{payment.period}</span>
                      </div>
                      {/* Податки */}
                      {payment.pdfoAmount && (
                        <div className="flex gap-3 text-xs text-muted-foreground pt-1 border-t border-border/50">
                          <span>ПДФО: {formatAmount(payment.pdfoAmount)}</span>
                          <span>ВЗ: {formatAmount(payment.militaryTaxAmount || 0)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-36 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
          <SelectTrigger className="w-40 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {employeeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredPayments.length === 0 ? (
        <div className="border border-border/70 rounded-lg">
          <TableEmptyState title="Немає виплат" description="Виплати за обраний період відсутні" />
        </div>
      ) : (
        <TooltipProvider>
          <div className="border border-border/70 rounded-lg overflow-hidden">
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead compact style={{ width: "10%" }}>Дата</TableHead>
                  <TableHead compact style={{ width: "25%" }}>Працівник</TableHead>
                  <TableHead compact style={{ width: "15%" }}>Тип виплати</TableHead>
                  <TableHead compact numeric style={{ width: "18%" }}>Сума (нетто)</TableHead>
                  <TableHead compact style={{ width: "17%" }}>Статус</TableHead>
                  <TableHead compact style={{ width: "15%" }}></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const StatusIcon = paymentStatusConfig[payment.status].icon;
                  const salaryConfig = salaryTypeConfig[payment.salaryType];
                  
                  return (
                    <TableRow 
                      key={payment.id}
                      className="cursor-pointer"
                      onClick={() => onOpenPayment(payment)}
                    >
                      <TableCell compact className="text-sm">
                        {formatDate(payment.scheduledDate)}
                      </TableCell>
                      <TableCell compact>
                        <div>
                          <p className="text-sm font-medium">{payment.employeeName.split(" ").slice(0, 2).join(" ")}</p>
                          <p className="text-xs text-muted-foreground">{payment.employeePosition}</p>
                        </div>
                      </TableCell>
                      <TableCell compact>
                        <Badge className={getBadgeColorClasses(salaryConfig.color, false)}>
                          {salaryConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell compact numeric>
                        <Tooltip>
                          <TooltipTrigger className="cursor-help">
                            <span className="font-medium tabular-nums">{formatAmount(payment.amount)}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs space-y-1">
                              <p>Брутто: {payment.grossAmount ? formatAmount(payment.grossAmount) : "—"}</p>
                              <p>ПДФО: −{payment.pdfoAmount ? formatAmount(payment.pdfoAmount) : "0 ₴"}</p>
                              <p>ВЗ: −{payment.militaryTaxAmount ? formatAmount(payment.militaryTaxAmount) : "0 ₴"}</p>
                              <p className="font-medium border-t pt-1 mt-1">Нетто: {formatAmount(payment.amount)}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell compact>
                        <Badge variant="secondary" className={cn("text-xs", paymentStatusConfig[payment.status].className)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {payment.statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell compact>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onOpenPayment(payment)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Деталі
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onNavigateToEmployee?.(payment.employeeId)}>
                              <User className="h-4 w-4 mr-2" />
                              Картка працівника
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCreatePaymentOrder(payment)}>
                              Сформувати платіжне доручення
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
