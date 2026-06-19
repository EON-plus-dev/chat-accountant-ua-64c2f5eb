import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, X } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { toast } from "sonner";
import { operationTypeVariants } from "@/config/semanticStyles";

interface ReceiptItem {
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

interface PaymentReceiptDialogProps {
  item: ReceiptItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentReceiptDialog = ({ item, open, onOpenChange }: PaymentReceiptDialogProps) => {
  if (!item) return null;

  const opType = operationTypeVariants[item.type] || { label: item.type, variant: "default" as const };
  const formattedDate = format(new Date(item.date), "d MMMM yyyy, HH:mm", { locale: uk });
  const receiptNumber = `RCP-${item.id.slice(0, 8).toUpperCase()}`;

  const handleDownloadPdf = () => {
    toast.info("Завантаження PDF буде доступне найближчим часом", {
      description: "Ми працюємо над цією функцією",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Платіжний документ</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Номер квитанції</p>
              <p className="font-mono text-sm font-medium">{receiptNumber}</p>
            </div>
            <Badge variant={opType.variant} className="pointer-events-none">
              {opType.label}
            </Badge>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-3">
            <DetailRow label="Дата" value={formattedDate} />
            {item.type === "plan_change" && item.fromPlan && item.toPlan ? (
              <DetailRow label="Тариф" value={`${item.fromPlan} → ${item.toPlan}`} />
            ) : item.plan ? (
              <DetailRow label="Тариф" value={item.plan} />
            ) : null}
            {item.amount > 0 && (
              <DetailRow label="Сума" value={`${item.amount.toFixed(2)} грн`} bold />
            )}
            {item.credits > 0 && (
              <DetailRow label="Кредити" value={`+${item.credits.toLocaleString()}`} />
            )}
            <DetailRow
              label="Статус"
              value={
                <Badge variant={item.status === "success" ? "success" : "error"} size="sm">
                  {item.status === "success" ? "Оплачено" : "Помилка"}
                </Badge>
              }
            />
          </div>

          <Separator />

          {/* Footer */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4" />
              Завантажити PDF
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Закрити
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className={bold ? "font-semibold tabular-nums" : "tabular-nums"}>{value}</span>
  </div>
);
