/**
 * PaymentQueueCard - "Smart Inbox" для платежів
 * Відображає готові до оплати платежі у форматі карток
 */

import { useState } from "react";
import { 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  AlertTriangle,
  Landmark,
  Users,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPaymentUrgency, generatePaymentExplanation } from "@/lib/paymentAI";
import type { TaxPayment, SalaryPayment, ContractorPayment } from "@/config/paymentsConfig";

interface PaymentQueueCardProps {
  taxPayments: TaxPayment[];
  salaryPayments: SalaryPayment[];
  contractorPayments?: ContractorPayment[];
  onApprovePayment?: (paymentId: string, type: "tax" | "salary" | "contractor") => void;
  onViewDetails?: (paymentId: string, type: "tax" | "salary" | "contractor") => void;
  onPostpone?: (paymentId: string) => void;
  className?: string;
}

interface QueueItem {
  id: string;
  type: "tax" | "salary" | "contractor";
  title: string;
  amount: number;
  deadline?: string;
  urgency: ReturnType<typeof getPaymentUrgency>;
  explanation: string;
  status: string;
  icon: typeof Landmark;
}

export function PaymentQueueCard({
  taxPayments,
  salaryPayments,
  contractorPayments = [],
  onApprovePayment,
  onViewDetails,
  onPostpone,
  className,
}: PaymentQueueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Збираємо всі pending платежі в єдину чергу
  const queue: QueueItem[] = [
    // Tax payments
    ...taxPayments
      .filter(p => p.status === "scheduled" || p.status === "created")
      .map(p => ({
        id: p.id,
        type: "tax" as const,
        title: `${p.taxTypeLabel} за ${p.period}`,
        amount: p.amountToPay,
        deadline: p.deadline,
        urgency: getPaymentUrgency(p.deadline),
        explanation: generatePaymentExplanation(p, p.calculatedFromIncome),
        status: p.status,
        icon: Landmark,
      })),
    // Salary payments
    ...salaryPayments
      .filter(p => p.status === "scheduled" || p.status === "created")
      .map(p => ({
        id: p.id,
        type: "salary" as const,
        title: `${p.salaryTypeLabel} — ${p.employeeName}`,
        amount: p.amount,
        deadline: p.scheduledDate,
        urgency: getPaymentUrgency(p.scheduledDate),
        explanation: `Виплата ${p.employeeName} за ${p.period}`,
        status: p.status,
        icon: Users,
      })),
    // Contractor payments
    ...contractorPayments
      .filter(p => p.status === "scheduled" || p.status === "created")
      .map(p => ({
        id: p.id,
        type: "contractor" as const,
        title: p.contractor,
        amount: p.amount,
        deadline: p.date,
        urgency: getPaymentUrgency(p.date),
        explanation: p.purpose,
        status: p.status,
        icon: Building2,
      })),
  ].sort((a, b) => {
    // Сортуємо за терміновістю
    const priorityOrder = { overdue: 0, urgent: 1, warning: 2, normal: 3 };
    return priorityOrder[a.urgency.level] - priorityOrder[b.urgency.level];
  });
  
  const totalAmount = queue.reduce((sum, item) => sum + item.amount, 0);
  const urgentCount = queue.filter(q => q.urgency.level === "urgent" || q.urgency.level === "overdue").length;
  
  // Показуємо тільки перші 3 або всі якщо expanded
  const visibleItems = isExpanded ? queue : queue.slice(0, 3);
  const hasMore = queue.length > 3;
  
  if (queue.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="py-6">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm font-medium">Немає платежів до сплати</p>
            <p className="text-xs text-muted-foreground">Усі платежі оплачені вчасно</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">
              Платежі до сплати
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {queue.length}
            </Badge>
            {urgentCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {urgentCount} термінов{urgentCount === 1 ? "ий" : "их"}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums">
              {new Intl.NumberFormat("uk-UA").format(totalAmount)} ₴
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-2">
        {visibleItems.map((item) => (
          <PaymentQueueItem
            key={item.id}
            item={item}
            onApprove={() => onApprovePayment?.(item.id, item.type)}
            onView={() => onViewDetails?.(item.id, item.type)}
            onPostpone={() => onPostpone?.(item.id)}
          />
        ))}
        
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Згорнути" : `Показати ще ${queue.length - 3}`}
            <ChevronRight className={cn(
              "h-4 w-4 ml-1 transition-transform",
              isExpanded && "rotate-90"
            )} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ========== QUEUE ITEM ==========

interface PaymentQueueItemProps {
  item: QueueItem;
  onApprove?: () => void;
  onView?: () => void;
  onPostpone?: () => void;
}

function PaymentQueueItem({ item, onApprove, onView, onPostpone }: PaymentQueueItemProps) {
  const Icon = item.icon;
  
  const urgencyStyles = {
    overdue: "border-l-destructive bg-destructive/5",
    urgent: "border-l-destructive bg-destructive/5",
    warning: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
    normal: "border-l-primary bg-muted/30",
  };
  
  return (
    <div
      className={cn(
        "relative border-l-4 rounded-r-lg p-3 transition-colors",
        urgencyStyles[item.urgency.level]
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          item.urgency.level === "urgent" || item.urgency.level === "overdue"
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {item.explanation}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-sm tabular-nums">
                {new Intl.NumberFormat("uk-UA").format(item.amount)} ₴
              </p>
              <div className={cn("flex items-center gap-1 text-xs mt-0.5", item.urgency.color)}>
                <Clock className="h-3 w-3" />
                <span>{item.urgency.message}</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs"
              onClick={onApprove}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Підтвердити
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={onView}
            >
              Деталі
            </Button>
            {item.urgency.level === "normal" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground"
                onClick={onPostpone}
              >
                Пізніше
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Badge */}
      {item.status === "created" && (
        <Badge 
          variant="outline" 
          className="absolute top-2 right-2 text-[10px] bg-background"
        >
          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
          AI
        </Badge>
      )}
    </div>
  );
}
