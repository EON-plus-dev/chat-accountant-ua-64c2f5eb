import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  type FixedAsset,
  type WriteOffReason,
  writeOffReasonLabels,
  calculateResidualValue,
  formatCurrency,
} from "@/config/fixedAssetsConfig";

interface WriteOffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: FixedAsset;
  onConfirm: (data: {
    writeOffDate: string;
    writeOffReason: WriteOffReason;
    writeOffActNumber: string;
    writeOffCommission: string;
  }) => void;
}

function generateActNumber(): string {
  const num = Math.floor(Math.random() * 99999999).toString().padStart(8, "0");
  return `АС-${num}`;
}

export const WriteOffDialog = ({ open, onOpenChange, asset, onConfirm }: WriteOffDialogProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [reason, setReason] = useState<string>("");
  const [actNumber] = useState(generateActNumber);
  const [commission, setCommission] = useState("");

  const residual = calculateResidualValue(asset);

  const canSubmit = reason !== "" && commission.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm({
      writeOffDate: date.toISOString().split("T")[0],
      writeOffReason: reason as WriteOffReason,
      writeOffActNumber: actNumber,
      writeOffCommission: commission.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Списання основного засобу</DialogTitle>
          <DialogDescription>{asset.name} ({asset.inventoryNumber})</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ця дія незворотна. Списаний ОЗ не може бути повернений в експлуатацію.
            </AlertDescription>
          </Alert>

          <div className="space-y-1.5">
            <Label>Причина списання *</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as WriteOffReason)}>
              <SelectTrigger><SelectValue placeholder="Оберіть причину" /></SelectTrigger>
              <SelectContent>
                {(Object.entries(writeOffReasonLabels) as [WriteOffReason, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Дата списання</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "dd.MM.yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label>Номер акту списання</Label>
            <Input value={actNumber} readOnly className="font-mono bg-muted cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <Label>Залишкова вартість на момент списання</Label>
            <Input value={formatCurrency(residual)} readOnly className="font-mono bg-muted cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <Label>Висновок комісії *</Label>
            <Textarea
              rows={3}
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="Опишіть висновок комісії щодо стану ОЗ та обґрунтування списання..."
              maxLength={1000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!canSubmit}>Списати</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
