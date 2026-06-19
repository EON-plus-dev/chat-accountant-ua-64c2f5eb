import { useState, useMemo } from "react";
import { MoreHorizontal, FileText, Building2, ExternalLink, Copy } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  type ContractorPayment, 
  paymentStatusConfig,
  paymentPurposeTypeConfig,
  formatIban,
} from "@/config/paymentsConfig";

interface ContractorPaymentsTabProps {
  payments: ContractorPayment[];
  onOpenPayment: (payment: ContractorPayment) => void;
  onNavigateToContractor?: (contractorId: string) => void;
  onNavigateToDocument?: (documentId: string) => void;
}

const statusOptions = [
  { value: "all", label: "Усі статуси" },
  { value: "scheduled", label: "Заплановано" },
  { value: "created", label: "Сформовано" },
  { value: "paid", label: "Оплачено" },
];

const purposeTypeOptions = [
  { value: "all", label: "Усі типи" },
  { value: "services", label: "За послуги" },
  { value: "goods", label: "За товар" },
  { value: "rent", label: "Оренда" },
  { value: "works", label: "За роботи" },
];

export function ContractorPaymentsTab({ 
  payments, 
  onOpenPayment,
  onNavigateToContractor,
  onNavigateToDocument,
}: ContractorPaymentsTabProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeTypeFilter, setPurposeTypeFilter] = useState("all");
  const [contractorFilter, setContractorFilter] = useState("all");

  // Get unique contractors from payments
  const contractorOptions = useMemo(() => {
    const uniqueContractors = new Map<string, string>();
    payments.forEach((p) => {
      if (p.contractorId) {
        uniqueContractors.set(p.contractorId, p.contractor);
      }
    });
    return [
      { value: "all", label: "Усі контрагенти" },
      ...Array.from(uniqueContractors.entries()).map(([id, name]) => ({
        value: id,
        label: name.length > 20 ? name.substring(0, 20) + "..." : name,
      })),
    ];
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (purposeTypeFilter !== "all" && p.paymentPurposeType !== purposeTypeFilter) return false;
      if (contractorFilter !== "all" && p.contractorId !== contractorFilter) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, statusFilter, purposeTypeFilter, contractorFilter]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("uk-UA").format(amount) + " ₴";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    toast({
      title: "Скопійовано",
      description: "IBAN скопійовано в буфер обміну",
    });
  };

  const handleCreatePaymentOrder = (payment: ContractorPayment) => {
    toast({
      title: "Демо-режим",
      description: `Платіжне доручення для "${payment.contractor}" буде сформовано`,
    });
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
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
          
          <Select value={purposeTypeFilter} onValueChange={setPurposeTypeFilter}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {purposeTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {payments.length === 0 ? (
          <TableEmptyState title="Немає платежів" description="Платежі контрагентам відсутні" />
        ) : filteredPayments.length === 0 ? (
          <TableEmptyState title="Немає результатів" description="Змініть фільтри для перегляду платежів" />
        ) : (
          <div className="space-y-2">
            {filteredPayments.map((payment) => {
              const StatusIcon = paymentStatusConfig[payment.status].icon;
              const purposeConfig = paymentPurposeTypeConfig[payment.paymentPurposeType];
              
              return (
                <Card 
                  key={payment.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onOpenPayment(payment)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{payment.contractor}</p>
                          <p className="text-xs text-muted-foreground truncate">{payment.purpose}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-lg font-semibold tabular-nums">{formatAmount(payment.amount)}</p>
                          {payment.vatAmount && (
                            <p className="text-xs text-muted-foreground">
                              ПДВ: {formatAmount(payment.vatAmount)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {purposeConfig?.label}
                        </Badge>
                        <Badge variant="secondary" className={cn("text-xs", paymentStatusConfig[payment.status].className)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {payment.statusLabel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(payment.date)}</span>
                      </div>
                      {payment.recipientIban && (
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {formatIban(payment.recipientIban)}
                        </p>
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
        <Select value={contractorFilter} onValueChange={setContractorFilter}>
          <SelectTrigger className="w-44 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {contractorOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={purposeTypeFilter} onValueChange={setPurposeTypeFilter}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {purposeTypeOptions.map((opt) => (
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

      {payments.length === 0 ? (
        <div className="border border-border/70 rounded-lg">
          <TableEmptyState title="Немає платежів" description="Платежі контрагентам відсутні" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="border border-border/70 rounded-lg">
          <TableEmptyState title="Немає результатів" description="Змініть фільтри для перегляду платежів" />
        </div>
      ) : (
        <TooltipProvider>
          <div className="border border-border/70 rounded-lg overflow-hidden">
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead compact style={{ width: "10%" }}>Дата</TableHead>
                  <TableHead compact style={{ width: "18%" }}>Контрагент</TableHead>
                  <TableHead compact style={{ width: "10%" }}>Тип</TableHead>
                  <TableHead compact style={{ width: "18%" }}>IBAN</TableHead>
                  <TableHead compact numeric style={{ width: "12%" }}>Сума</TableHead>
                  <TableHead compact style={{ width: "12%" }}>Статус</TableHead>
                  <TableHead compact style={{ width: "12%" }}>Документ</TableHead>
                  <TableHead compact style={{ width: "8%" }}></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const StatusIcon = paymentStatusConfig[payment.status].icon;
                  const purposeConfig = paymentPurposeTypeConfig[payment.paymentPurposeType];
                  
                  return (
                    <TableRow 
                      key={payment.id}
                      className="cursor-pointer"
                      onClick={() => onOpenPayment(payment)}
                    >
                      <TableCell compact className="text-sm">
                        {formatDate(payment.date)}
                      </TableCell>
                      <TableCell compact>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[160px]">{payment.contractor}</p>
                          {payment.contractorCode && (
                            <p className="text-xs text-muted-foreground">ЄДРПОУ: {payment.contractorCode}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell compact>
                        <Badge variant="outline" className="text-xs">
                          {purposeConfig?.label}
                        </Badge>
                      </TableCell>
                      <TableCell compact>
                        {payment.recipientIban ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 font-mono text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyIban(payment.recipientIban!);
                                }}
                              >
                                {payment.recipientIban.substring(0, 8)}...
                                <Copy className="h-3 w-3 ml-1 opacity-50" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-mono text-xs">{formatIban(payment.recipientIban)}</p>
                              {payment.recipientBankName && (
                                <p className="text-xs text-muted-foreground mt-1">{payment.recipientBankName}</p>
                              )}
                              <p className="text-xs mt-1">Натисніть для копіювання</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground text-xs">Не вказано</span>
                        )}
                      </TableCell>
                      <TableCell compact numeric>
                        <div>
                          <span className="font-medium tabular-nums">{formatAmount(payment.amount)}</span>
                          {payment.vatAmount && (
                            <p className="text-xs text-muted-foreground">
                              ПДВ: {formatAmount(payment.vatAmount)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell compact>
                        <Badge variant="secondary" className={cn("text-xs", paymentStatusConfig[payment.status].className)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {payment.statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell compact>
                        {payment.relatedDocumentNumber || payment.invoiceNumber || payment.actNumber ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (payment.relatedDocumentId) {
                                    onNavigateToDocument?.(payment.relatedDocumentId);
                                  }
                                }}
                              >
                                {payment.relatedDocumentNumber || payment.invoiceNumber || payment.actNumber}
                                {payment.relatedDocumentId && <ExternalLink className="h-3 w-3 ml-1 opacity-50" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {payment.contractNumber && <p>Договір: {payment.contractNumber}</p>}
                              {payment.invoiceNumber && <p>Рахунок: {payment.invoiceNumber}</p>}
                              {payment.actNumber && <p>Акт: {payment.actNumber}</p>}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
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
                            {payment.contractorId && (
                              <DropdownMenuItem onClick={() => onNavigateToContractor?.(payment.contractorId!)}>
                                <Building2 className="h-4 w-4 mr-2" />
                                Картка контрагента
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCreatePaymentOrder(payment)}>
                              Сформувати платіжне доручення
                            </DropdownMenuItem>
                            {payment.recipientIban && (
                              <DropdownMenuItem onClick={() => handleCopyIban(payment.recipientIban!)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Копіювати IBAN
                              </DropdownMenuItem>
                            )}
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
