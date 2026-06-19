import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, ClipboardCheck, AlertTriangle } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type FixedAsset,
  type InventoryResult,
  inventoryResultLabels,
} from "@/config/fixedAssetsConfig";

interface InventorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: FixedAsset[];
  onSave: (results: { assetId: string; result: InventoryResult }[], date: string, orderNumber: string) => void;
}

export const InventorySheet = ({ open, onOpenChange, assets, onSave }: InventorySheetProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [orderNumber, setOrderNumber] = useState("");
  const [results, setResults] = useState<Record<string, InventoryResult>>({});

  const activeAssets = useMemo(
    () => assets.filter((a) => a.status === "active" || a.status === "under-repair"),
    [assets]
  );

  const updateResult = (assetId: string, result: InventoryResult) => {
    setResults((prev) => ({ ...prev, [assetId]: result }));
  };

  const stats = useMemo(() => {
    const vals = Object.values(results);
    return {
      total: activeAssets.length,
      checked: vals.length,
      found: vals.filter((v) => v === "found").length,
      missing: vals.filter((v) => v === "missing").length,
      damaged: vals.filter((v) => v === "damaged").length,
    };
  }, [results, activeAssets]);

  const handleSave = () => {
    if (stats.checked === 0) {
      toast.error("Відмітьте результат хоча б для одного ОЗ");
      return;
    }
    const entries = Object.entries(results).map(([assetId, result]) => ({ assetId, result }));
    onSave(entries, date.toISOString().split("T")[0], orderNumber);
    toast.success(`Інвентаризацію збережено: ${stats.checked} ОЗ перевірено`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col p-0 sm:max-w-lg">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Інвентаризація основних засобів
          </SheetTitle>
          <SheetDescription>Перевірте наявність та стан кожного ОЗ</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {/* Header fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Дата інвентаризації</Label>
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
                <Label>Номер наказу</Label>
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="НК-001/2026"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Всього: {stats.total}</Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Наявні: {stats.found}</Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700">Відсутні: {stats.missing}</Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700">Пошкоджені: {stats.damaged}</Badge>
              <Badge variant="outline" className="text-muted-foreground">Не перевірено: {stats.total - stats.checked}</Badge>
            </div>

            {/* Asset list */}
            <div className="space-y-2">
              {activeAssets.map((asset) => (
                <div key={asset.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{asset.inventoryNumber}</p>
                    <p className="text-xs text-muted-foreground">{asset.location}</p>
                  </div>
                  <Select
                    value={results[asset.id] || ""}
                    onValueChange={(v) => updateResult(asset.id, v as InventoryResult)}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-sm">
                      <SelectValue placeholder="Результат" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(inventoryResultLabels) as [InventoryResult, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {activeAssets.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">Немає активних ОЗ для інвентаризації</p>
              )}
            </div>

            {/* Warning for missing/damaged */}
            {(stats.missing > 0 || stats.damaged > 0) && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Виявлено {stats.missing + stats.damaged} ОЗ з проблемами. Після збереження ви зможете оформити списання для відсутніх або пошкоджених засобів.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-4 flex gap-2 justify-end bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button onClick={handleSave} disabled={stats.checked === 0}>
            Зберегти результати ({stats.checked}/{stats.total})
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
