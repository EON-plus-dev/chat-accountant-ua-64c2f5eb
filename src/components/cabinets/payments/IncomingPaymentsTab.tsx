import React, { useState, useMemo } from "react";
import { 
  ArrowDownLeft, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CreditCard,
  Banknote,
  Wallet,
  Building2,
  Filter
} from "lucide-react";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { useIncomingPaymentsKPIs } from "./useIncomingPaymentsKPIs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  IncomeBookRecord, 
  demoIncomeRecords,
  formatCurrency,
  getPaymentTypeLabel,
} from "@/config/incomeBookConfig";
import { 
  Document, 
  getDocumentsForCabinet,
} from "@/config/documentFlowConfig";
import { 
  getUnpaidDocuments,
  calculateSyncAnalytics,
} from "@/lib/documentPaymentSync";
import { Cabinet } from "@/types/cabinet";

type IncomingMode = "expected" | "received";

interface PendingInvoice {
  id: string;
  number: string;
  date: string;
  dueDate?: string;
  contractor?: string;
  contractorCode?: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  documentType: string;
}

interface IncomingPaymentsTabProps {
  cabinet: Cabinet;
  onOpenDocument?: (documentId: string) => void;
  onOpenRecord?: (record: IncomeBookRecord) => void;
  onNavigateToIncomeBook?: () => void;
  onChatPromptInsert?: (prompt: string) => void;
}

const getPaymentTypeIcon = (type: string) => {
  switch (type) {
    case "cash": return <Wallet className="h-3.5 w-3.5" />;
    case "bank": return <Building2 className="h-3.5 w-3.5" />;
    case "card": return <CreditCard className="h-3.5 w-3.5" />;
    case "prro": return <Banknote className="h-3.5 w-3.5" />;
    default: return <CreditCard className="h-3.5 w-3.5" />;
  }
};

export function IncomingPaymentsTab({
  cabinet,
  onOpenDocument,
  onOpenRecord,
  onNavigateToIncomeBook,
  onChatPromptInsert,
}: IncomingPaymentsTabProps) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<IncomingMode>("expected");
  const [periodFilter, setPeriodFilter] = useState("current-month");
  const [contractorFilter, setContractorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Get documents for cabinet
  const allDocuments = useMemo(() => {
    return getDocumentsForCabinet({ type: cabinet.type });
  }, [cabinet.type]);

  // Pending invoices from Document Flow
  const pendingInvoices: PendingInvoice[] = useMemo(() => {
    const unpaidDocs = getUnpaidDocuments(allDocuments as any);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return unpaidDocs
      .filter(doc => doc.type === "invoice" || doc.type === "contract")
      .map(doc => {
        const dueDate = doc.dueDate ? new Date(doc.dueDate) : null;
        return {
          id: doc.id,
          number: doc.number,
          date: doc.date,
          dueDate: doc.dueDate,
          contractor: doc.contractor?.name,
          contractorCode: doc.contractor?.code,
          amount: doc.amount || 0,
          paidAmount: doc.paidAmount || 0,
          remainingAmount: (doc.amount || 0) - (doc.paidAmount || 0),
          status: doc.status,
          isOverdue: dueDate ? dueDate < now : false,
          isDueSoon: dueDate ? dueDate > now && dueDate < sevenDaysFromNow : false,
          documentType: doc.type,
        };
      });
  }, [allDocuments]);

  // Received payments from Income Book
  const receivedPayments = useMemo(() => {
    return demoIncomeRecords
      .filter(r => r.status === "income" || r.status === "return")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  // Sync analytics
  const syncAnalytics = useMemo(() => {
    return calculateSyncAnalytics(allDocuments, demoIncomeRecords);
  }, [allDocuments]);

  // Filter logic for period
  const filterByPeriod = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const quarter = Math.floor(month / 3);

    switch (periodFilter) {
      case "current-month":
        return year === currentYear && month === currentMonth;
      case "prev-month":
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return year === prevYear && month === prevMonth;
      case "q1":
        return year === currentYear && quarter === 0;
      case "q2":
        return year === currentYear && quarter === 1;
      case "q3":
        return year === currentYear && quarter === 2;
      case "q4":
        return year === currentYear && quarter === 3;
      default:
        return year === currentYear;
    }
  };

  // Filtered pending invoices
  const filteredInvoices = useMemo(() => {
    return pendingInvoices.filter(inv => {
      if (!filterByPeriod(inv.date)) return false;
      if (contractorFilter !== "all" && inv.contractor !== contractorFilter) return false;
      if (statusFilter === "overdue" && !inv.isOverdue) return false;
      if (statusFilter === "due-soon" && !inv.isDueSoon) return false;
      if (statusFilter === "waiting" && (inv.isOverdue || inv.isDueSoon)) return false;
      return true;
    });
  }, [pendingInvoices, periodFilter, contractorFilter, statusFilter]);

  // Filtered received payments
  const filteredReceived = useMemo(() => {
    return receivedPayments.filter(r => {
      if (!filterByPeriod(r.date)) return false;
      if (contractorFilter !== "all" && r.contractor !== contractorFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (paymentTypeFilter !== "all" && r.paymentType !== paymentTypeFilter) return false;
      return true;
    });
  }, [receivedPayments, periodFilter, contractorFilter, statusFilter, paymentTypeFilter]);

  // Unique contractors for filter
  const uniqueContractors = useMemo(() => {
    const contractors = new Set<string>();
    pendingInvoices.forEach(inv => inv.contractor && contractors.add(inv.contractor));
    receivedPayments.forEach(r => r.contractor && contractors.add(r.contractor));
    return Array.from(contractors).sort();
  }, [pendingInvoices, receivedPayments]);

  // KPI calculations for expected
  const expectedStats = useMemo(() => {
    const total = filteredInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const overdueCount = filteredInvoices.filter(inv => inv.isOverdue).length;
    const dueSoonCount = filteredInvoices.filter(inv => inv.isDueSoon).length;
    const overdueAmount = filteredInvoices.filter(inv => inv.isOverdue).reduce((sum, inv) => sum + inv.remainingAmount, 0);
    return { total, overdueCount, dueSoonCount, overdueAmount };
  }, [filteredInvoices]);

  // KPI calculations for received
  const receivedStats = useMemo(() => {
    const incomeRecords = filteredReceived.filter(r => r.status === "income");
    const returnRecords = filteredReceived.filter(r => r.status === "return");
    const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalReturns = returnRecords.reduce((sum, r) => sum + (r.returnAmount || r.amount), 0);
    return {
      totalIncome,
      totalReturns,
      netIncome: totalIncome - totalReturns,
      incomeCount: incomeRecords.length,
      returnsCount: returnRecords.length,
    };
  }, [filteredReceived]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatShortAmount = (amount: number) => {
    if (amount >= 1000000) return `₴ ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₴ ${(amount / 1000).toFixed(0)}K`;
    return `₴ ${amount.toLocaleString("uk-UA")}`;
  };

  // Mode toggle component
  const ModeToggle = () => (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={mode === "expected" ? "default" : "ghost"}
        size="sm"
        onClick={() => setMode("expected")}
        className="h-8 px-3 text-sm"
      >
        <Clock className="h-3.5 w-3.5 mr-1.5" />
        Очікувані
        {pendingInvoices.length > 0 && (
          <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
            {pendingInvoices.length}
          </Badge>
        )}
      </Button>
      <Button
        variant={mode === "received" ? "default" : "ghost"}
        size="sm"
        onClick={() => setMode("received")}
        className="h-8 px-3 text-sm"
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
        Отримані
      </Button>
    </div>
  );

  // KPI definitions — state metrics only. Alerts (overdue, due-soon) live in PaymentsAttentionInbox.
  const incomingKpis = useIncomingPaymentsKPIs({ mode, expectedStats, receivedStats });

  // Filters Section
  const FiltersSection = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={periodFilter} onValueChange={setPeriodFilter}>
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue placeholder="Період" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Весь рік</SelectItem>
          <SelectItem value="current-month">Поточний місяць</SelectItem>
          <SelectItem value="prev-month">Попередній місяць</SelectItem>
          <SelectItem value="q1">I квартал</SelectItem>
          <SelectItem value="q2">II квартал</SelectItem>
          <SelectItem value="q3">III квартал</SelectItem>
          <SelectItem value="q4">IV квартал</SelectItem>
        </SelectContent>
      </Select>

      <Select value={contractorFilter} onValueChange={setContractorFilter}>
        <SelectTrigger className="w-[160px] h-8">
          <SelectValue placeholder="Контрагент" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Усі контрагенти</SelectItem>
          {uniqueContractors.map(c => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {mode === "expected" ? (
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Усі статуси</SelectItem>
            <SelectItem value="overdue">Прострочені</SelectItem>
            <SelectItem value="due-soon">До 7 днів</SelectItem>
            <SelectItem value="waiting">Очікують</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <>
          <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Тип оплати" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі типи</SelectItem>
              <SelectItem value="cash">Готівка</SelectItem>
              <SelectItem value="bank">Безготівковий</SelectItem>
              <SelectItem value="card">Картка</SelectItem>
              <SelectItem value="prro">ПРРО</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі статуси</SelectItem>
              <SelectItem value="income">Надходження</SelectItem>
              <SelectItem value="return">Повернення</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      {onNavigateToIncomeBook && mode === "received" && (
        <Button
          variant="outline"
          size="sm"
          onClick={onNavigateToIncomeBook}
          className="h-8 ml-auto"
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          Книга доходів
        </Button>
      )}
    </div>
  );

  // Expected invoices table (desktop)
  const ExpectedTable = () => (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table containerClassName="md:max-h-[calc(100vh-340px)] md:overflow-auto">
        <TableHeader className="sticky top-0 bg-card z-10 shadow-[0_1px_3px_0_hsl(var(--foreground)/0.05),0_4px_6px_-2px_hsl(var(--foreground)/0.08)]">
          <TableRow>
            <TableHead className="w-[100px]">Дата</TableHead>
            <TableHead>Документ</TableHead>
            <TableHead>Контрагент</TableHead>
            <TableHead className="text-right">Сума</TableHead>
            <TableHead className="w-[100px]">Дедлайн</TableHead>
            <TableHead className="w-[100px]">Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Немає очікуваних платежів за обраний період
              </TableCell>
            </TableRow>
          ) : (
            filteredInvoices.map((inv) => (
              <TableRow 
                key={inv.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onOpenDocument?.(inv.id)}
              >
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(inv.date)}
                </TableCell>
                <TableCell>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDocument?.(inv.id);
                    }}
                    className="flex items-center gap-2 hover:underline text-primary"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{inv.number}</span>
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[200px]">{inv.contractor || "—"}</span>
                    {inv.contractorCode && (
                      <span className="text-xs text-muted-foreground">{inv.contractorCode}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold">{formatCurrency(inv.remainingAmount)}</span>
                    {inv.paidAmount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        з {formatCurrency(inv.amount)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {inv.dueDate ? (
                    <span className={inv.isOverdue ? "text-destructive font-medium" : inv.isDueSoon ? "text-amber-600" : ""}>
                      {formatDate(inv.dueDate)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {inv.isOverdue ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Прострочено
                    </Badge>
                  ) : inv.isDueSoon ? (
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                      ⏰ Скоро
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Очікує
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {filteredInvoices.length > 0 && (
          <TableFooter className="sticky bottom-0 bg-muted">
            <TableRow>
              <TableCell colSpan={3} className="font-medium">
                Усього: {filteredInvoices.length} документів
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(expectedStats.total)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );

  // Received payments table (desktop)
  const ReceivedTable = () => (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table containerClassName="md:max-h-[calc(100vh-340px)] md:overflow-auto">
        <TableHeader className="sticky top-0 bg-card z-10 shadow-[0_1px_3px_0_hsl(var(--foreground)/0.05),0_4px_6px_-2px_hsl(var(--foreground)/0.08)]">
          <TableRow>
            <TableHead className="w-[100px]">Дата</TableHead>
            <TableHead>Контрагент</TableHead>
            <TableHead>Призначення</TableHead>
            <TableHead className="w-[100px]">Тип</TableHead>
            <TableHead className="text-right">Сума</TableHead>
            <TableHead className="w-[80px]">Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReceived.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Немає отриманих платежів за обраний період
              </TableCell>
            </TableRow>
          ) : (
            filteredReceived.map((record) => (
              <TableRow 
                key={record.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onOpenRecord?.(record)}
              >
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(record.date)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[200px]">{record.contractor || "—"}</span>
                    {record.contractorCode && (
                      <span className="text-xs text-muted-foreground">{record.contractorCode}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="truncate max-w-[250px] block">{record.description}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs gap-1">
                    {getPaymentTypeIcon(record.paymentType)}
                    {getPaymentTypeLabel(record.paymentType)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${record.status === "return" ? "text-rose-600" : "text-emerald-600"}`}>
                    {record.status === "return" ? "-" : "+"}{formatCurrency(record.status === "return" ? (record.returnAmount || record.amount) : record.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  {record.status === "income" ? (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Дохід
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/30">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Поверн.
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {filteredReceived.length > 0 && (
          <TableFooter className="sticky bottom-0 bg-muted">
            <TableRow>
              <TableCell colSpan={4} className="font-medium">
                Усього: {filteredReceived.length} операцій
              </TableCell>
              <TableCell className="text-right font-semibold text-emerald-600">
                {formatCurrency(receivedStats.netIncome)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );

  // Mobile cards for expected
  const ExpectedMobileCards = () => (
    <div className="space-y-3">
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Немає очікуваних платежів
          </CardContent>
        </Card>
      ) : (
        filteredInvoices.map((inv) => (
          <Card 
            key={inv.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onOpenDocument?.(inv.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{inv.number}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{inv.contractor || "—"}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{formatDate(inv.date)}</span>
                    {inv.dueDate && (
                      <>
                        <span>•</span>
                        <span className={inv.isOverdue ? "text-destructive" : inv.isDueSoon ? "text-amber-600" : ""}>
                          до {formatDate(inv.dueDate)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">{formatCurrency(inv.remainingAmount)}</p>
                  {inv.isOverdue ? (
                    <Badge variant="destructive" className="text-xs mt-1">Прострочено</Badge>
                  ) : inv.isDueSoon ? (
                    <Badge variant="outline" className="text-xs mt-1 bg-amber-500/10 text-amber-600">Скоро</Badge>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  // Mobile cards for received
  const ReceivedMobileCards = () => (
    <div className="space-y-3">
      {filteredReceived.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Немає отриманих платежів
          </CardContent>
        </Card>
      ) : (
        filteredReceived.map((record) => (
          <Card 
            key={record.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onOpenRecord?.(record)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{record.contractor || "—"}</p>
                  <p className="text-sm text-muted-foreground truncate">{record.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{formatDate(record.date)}</span>
                    <Badge variant="outline" className="text-xs gap-1">
                      {getPaymentTypeIcon(record.paymentType)}
                      {getPaymentTypeLabel(record.paymentType)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold ${record.status === "return" ? "text-rose-600" : "text-emerald-600"}`}>
                    {record.status === "return" ? "-" : "+"}{formatCurrency(record.status === "return" ? (record.returnAmount || record.amount) : record.amount)}
                  </p>
                  {record.status === "return" && (
                    <Badge variant="outline" className="text-xs mt-1 bg-rose-500/10 text-rose-600">
                      Повернення
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <ModeToggle />
      </div>

      {/* KPI grid — unified UniversalKPICard pattern (compact density) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {incomingKpis.map((kpi) => (
          <UniversalKPICard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            format={kpi.format}
            icon={kpi.icon}
            variant={kpi.variant}
            description={kpi.description}
            density="compact"
          />
        ))}
      </div>

      {/* Filters */}
      <FiltersSection />

      {/* Content */}
      {isMobile ? (
        mode === "expected" ? <ExpectedMobileCards /> : <ReceivedMobileCards />
      ) : (
        mode === "expected" ? <ExpectedTable /> : <ReceivedTable />
      )}
    </div>
  );
}
