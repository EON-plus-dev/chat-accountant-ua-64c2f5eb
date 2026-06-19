/**
 * IndividualPaymentsPage — auto-generated tax payment orders
 * from confirmed Financial Monitoring records
 */

import { useMemo, useState } from "react";
import { CreditCard, Landmark, ArrowRight, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getDemoFinMonitoringForCabinet } from "@/config/demoCabinets/getters";
import { finCategoryConfig, formatUAH } from "@/config/finMonitoringConfig";
import { generatePaymentOrders, type GeneratedPayment, type PaymentStatus } from "@/lib/generatePaymentOrders";
import { AttentionInbox, type AttentionItem } from "@/components/cabinets/shared/attention-inbox";
import type { Cabinet } from "@/types/cabinet";

interface IndividualPaymentsPageProps {
  cabinet: Cabinet;
  onNavigateToFinMonitoring?: (tabId: string) => void;
}

const statusConfig: Record<PaymentStatus, { label: string; icon: React.ElementType; badgeClass: string }> = {
  "not-created": {
    label: "Не створено",
    icon: AlertCircle,
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  created: {
    label: "Створено",
    icon: Clock,
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  paid: {
    label: "Сплачено",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
};

const KpiCard = ({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) => (
  <Card className="flex-1 min-w-[140px]">
    <CardContent className="p-3 md:p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm md:text-base font-semibold tabular-nums mt-0.5", valueClass)}>{value}</p>
    </CardContent>
  </Card>
);

export const IndividualPaymentsPage = ({ cabinet, onNavigateToFinMonitoring }: IndividualPaymentsPageProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedPayment, setSelectedPayment] = useState<GeneratedPayment | null>(null);

  const records = useMemo(() => getDemoFinMonitoringForCabinet(cabinet.id), [cabinet.id]);
  const payments = useMemo(() => generatePaymentOrders(records), [records]);

  const kpi = useMemo(() => {
    const total = payments.reduce((s, p) => s + p.amount, 0);
    const paid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const pending = total - paid;
    const pendingCount = payments.filter((p) => p.status !== "paid").length;
    return { total, paid, pending, pendingCount };
  }, [payments]);

  const handleCreatePayment = (payment: GeneratedPayment) => {
    toast({ title: "Демо-режим", description: `Формування платіжки «${payment.name}» буде доступне після запуску` });
  };

  // AttentionInbox items: aggregate not-created tax orders
  const attentionItems = useMemo<AttentionItem[]>(() => {
    const notCreated = payments.filter((p) => p.status === "not-created");
    if (notCreated.length === 0) return [];
    const total = notCreated.reduce((s, p) => s + p.amount, 0);
    return [
      {
        id: "individual-payments:not-created",
        priority: "attention",
        icon: AlertCircle,
        title: `${notCreated.length} ${notCreated.length === 1 ? "платіж не сформовано" : "платежів не сформовано"}`,
        meta: `Усього: ${formatUAH(total)}`,
        badge: { text: String(notCreated.length), tone: "count" },
        primaryAction: {
          label: "Сформувати",
          onClick: () => handleCreatePayment(notCreated[0]),
        },
      },
    ];
  }, [payments]);

  return (
    <div className="space-y-4">
      {/* Section-scoped action inbox */}
      <AttentionInbox sectionKey={`individual-payments:${cabinet.id}`} items={attentionItems} />

      {/* KPI */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        <KpiCard label="Усього до сплати" value={formatUAH(kpi.total)} />
        <KpiCard
          label="Сплачено"
          value={formatUAH(kpi.paid)}
          valueClass="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          label="Очікує"
          value={`${formatUAH(kpi.pending)} (${kpi.pendingCount})`}
          valueClass={kpi.pending > 0 ? "text-amber-600 dark:text-amber-400" : undefined}
        />
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">
        <Landmark className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-muted-foreground">
          Платежі автоматично сформовано з підтверджених записів Фін. моніторинга
        </span>
      </div>

      {/* Table */}
      {isMobile ? (
        <div className="space-y-2">
          {payments.map((p) => {
            const sc = statusConfig[p.status];
            const StatusIcon = sc.icon;
            const catCfg = finCategoryConfig[p.sourceCategory];
            return (
              <Card key={p.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedPayment(p)}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn("rounded-lg p-2 shrink-0", catCfg.badgeClass)}>
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">до {p.dueDate}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{formatUAH(p.amount)}</p>
                    <Badge variant="secondary" size="sm" className={cn("text-[10px]", sc.badgeClass)}>
                      {sc.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border border-border/70 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/80">
                <TableHead compact style={{ width: "35%" }}>Призначення</TableHead>
                <TableHead compact style={{ width: "12%" }}>Тип</TableHead>
                <TableHead compact numeric style={{ width: "18%" }}>Сума</TableHead>
                <TableHead compact style={{ width: "15%" }}>До сплати</TableHead>
                <TableHead compact style={{ width: "15%" }}>Статус</TableHead>
                <TableHead compact style={{ width: "5%" }} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const sc = statusConfig[p.status];
                return (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelectedPayment(p)}>
                    <TableCell compact className="text-sm font-medium">{p.name}</TableCell>
                    <TableCell compact className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        {p.taxType === "pdfo" ? "ПДФО" : "ВЗ"}
                      </Badge>
                    </TableCell>
                    <TableCell compact numeric className="text-sm font-semibold tabular-nums">
                      {formatUAH(p.amount)}
                    </TableCell>
                    <TableCell compact className="text-sm text-muted-foreground">{p.dueDate}</TableCell>
                    <TableCell compact className="text-sm">
                      <Badge variant="secondary" size="sm" className={cn("font-medium", sc.badgeClass)}>
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell compact>
                      {p.status === "not-created" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); handleCreatePayment(p); }}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter sticky>
              <TableRow className="hover:bg-transparent">
                <TableCell compact colSpan={2} className="text-sm font-medium">
                  Усього платежів: {payments.length}
                </TableCell>
                <TableCell compact numeric className="text-sm font-bold tabular-nums">
                  {formatUAH(kpi.total)}
                </TableCell>
                <TableCell compact colSpan={3} className="text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400 tabular-nums mr-3">✓ {formatUAH(kpi.paid)}</span>
                  {kpi.pending > 0 && <span className="text-amber-600 dark:text-amber-400 tabular-nums">⏳ {formatUAH(kpi.pending)}</span>}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" variant="default" onClick={() => handleCreatePayment(payments[0])} className="gap-1.5">
          <CreditCard className="w-3.5 h-3.5" /> Сформувати платіжку
        </Button>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedPayment} onOpenChange={(open) => { if (!open) setSelectedPayment(null); }}>
        <SheetContent side="responsive-right" className="flex flex-col">
          {selectedPayment && (() => {
            const sc = statusConfig[selectedPayment.status];
            const catCfg = finCategoryConfig[selectedPayment.sourceCategory];
            const CatIcon = catCfg.icon;
            return (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn("rounded-lg p-2.5 shrink-0", catCfg.badgeClass)}>
                      <CatIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <SheetTitle className="text-base">{selectedPayment.name}</SheetTitle>
                      <SheetDescription className="mt-1 flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs">{selectedPayment.taxType === "pdfo" ? "ПДФО" : "ВЗ"}</Badge>
                        <Badge variant="secondary" size="sm" className={sc.badgeClass}>{sc.label}</Badge>
                      </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>
                <div className="flex-1 space-y-5 py-4 overflow-y-auto">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Сума</p>
                    <p className="text-xl font-bold tabular-nums">{formatUAH(selectedPayment.amount)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Дедлайн</p>
                    <p className="text-sm">{selectedPayment.dueDate}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Категорія</p>
                    <p className="text-sm">{catCfg.label}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Записи-джерела ({selectedPayment.sourceRecordIds.length})</p>
                    <ul className="space-y-1">
                      {selectedPayment.sourceRecordIds.map((id) => (
                        <li key={id}>
                          <button
                            onClick={() => {
                              setSelectedPayment(null);
                              onNavigateToFinMonitoring?.("fin-monitoring");
                            }}
                            className="text-sm text-primary hover:underline underline-offset-2 flex items-center gap-1.5"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" />
                            {id}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <SheetFooter className="border-t border-border pt-4 gap-2 sm:justify-end">
                  {selectedPayment.status === "not-created" && (
                    <Button variant="default" size="sm" className="h-8 gap-1.5" onClick={() => handleCreatePayment(selectedPayment)}>
                      <CreditCard className="h-3.5 w-3.5" /> Сформувати платіжку
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelectedPayment(null)}>
                    Закрити
                  </Button>
                </SheetFooter>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default IndividualPaymentsPage;
