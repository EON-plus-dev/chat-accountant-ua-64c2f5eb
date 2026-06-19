import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { FixedAsset } from "@/config/fixedAssetsConfig";

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: FixedAsset;
  onConfirm: (data: {
    saleDate: string;
    salePrice: number;
    saleBuyer: string;
    saleContractNumber: string;
  }) => void;
}

export const SaleDialog = ({ open, onOpenChange, asset, onConfirm }: SaleDialogProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [price, setPrice] = useState<number>(0);
  const [buyer, setBuyer] = useState("");
  const [contractNumber, setContractNumber] = useState("");

  const canSubmit = price > 0 && buyer.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm({
      saleDate: date.toISOString().split("T")[0],
      salePrice: price,
      saleBuyer: buyer.trim(),
      saleContractNumber: contractNumber.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Продаж основного засобу</DialogTitle>
          <DialogDescription>{asset.name} ({asset.inventoryNumber})</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Ця дія незворотна. Проданий ОЗ не може бути повернений в експлуатацію.
            </AlertDescription>
          </Alert>

          <div className="space-y-1.5">
            <Label>Дата продажу</Label>
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
            <Label>Ціна продажу, ₴ *</Label>
            <Input
              type="number"
              min={0}
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Покупець *</Label>
            <Input
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              placeholder="Назва покупця"
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Номер договору купівлі-продажу</Label>
            <Input
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              placeholder="ДКП-001/2026"
              maxLength={50}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>Оформити продаж</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
