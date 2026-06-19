import { useState } from "react";
import { CreditCard, FileText, Building2, Calendar, DollarSign } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { type Document, documentTypeConfigs } from "@/config/documentFlowConfig";
import { formatCurrency } from "@/lib/formatters";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreatePaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  onCreatePayment: (payment: PaymentFormData) => void;
}

export interface PaymentFormData {
  type: "contractor" | "tax" | "salary";
  amount: number;
  currency: string;
  description: string;
  dueDate: string;
  sourceDocumentId: string;
  contractorName?: string;
  contractorCode?: string;
}

type PaymentType = "contractor" | "tax" | "salary";

const paymentTypeConfig: Record<PaymentType, { label: string; description: string }> = {
  contractor: { label: "Контрагенту", description: "Оплата постачальнику або підряднику" },
  tax: { label: "Податок", description: "Сплата податків та зборів" },
  salary: { label: "Зарплата", description: "Виплата заробітної плати" },
};

export const CreatePaymentSheet = ({
  open,
  onOpenChange,
  document,
  onCreatePayment,
}: CreatePaymentSheetProps) => {
  const isMobile = useIsMobile();
  const [paymentType, setPaymentType] = useState<PaymentType>("contractor");
  const [amount, setAmount] = useState(document.amount?.toString() || "");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(document.dueDate || "");

  const docConfig = documentTypeConfigs[document.type];
  const DocIcon = docConfig?.icon || FileText;

  const handleSubmit = () => {
    const paymentData: PaymentFormData = {
      type: paymentType,
      amount: parseFloat(amount) || 0,
      currency: document.currency || "UAH",
      description: description || `Оплата за ${docConfig?.label || "документ"} ${document.number}`,
      dueDate,
      sourceDocumentId: document.id,
      contractorName: document.contractor?.name,
      contractorCode: document.contractor?.code,
    };
    
    onCreatePayment(paymentData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[85vh]" : ""}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Створити платіж
          </SheetTitle>
          <SheetDescription>
            Створення платежу на основі документа
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Source Document Info */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-xs text-muted-foreground mb-2">Документ-підстава</p>
            <div className="flex items-center gap-2">
              <DocIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">{document.number}</span>
              <Badge variant="outline" className="text-[10px]">
                {docConfig?.label}
              </Badge>
            </div>
            {document.contractor && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                {document.contractor.name}
              </div>
            )}
          </div>

          {/* Payment Type */}
          <div className="space-y-2">
            <Label>Тип платежу</Label>
            <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PaymentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col items-start">
                      <span>{config.label}</span>
                      <span className="text-xs text-muted-foreground">{config.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Сума
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1"
              />
              <Badge variant="secondary" className="h-10 px-4 flex items-center">
                {document.currency || "UAH"}
              </Badge>
            </div>
            {document.amount && (
              <p className="text-xs text-muted-foreground">
                Сума документа: {formatCurrency(document.amount)}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Дата оплати
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Призначення платежу</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Оплата за ${docConfig?.label?.toLowerCase() || "документ"} ${document.number}`}
              className="min-h-[80px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Скасувати
            </Button>
            <Button onClick={handleSubmit} className="flex-1 gap-2">
              <CreditCard className="w-4 h-4" />
              Створити платіж
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
