import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Banknote, CheckCircle2, Loader2 } from "lucide-react";
import { TAX_DISCOUNT_CATEGORIES, getAllBankKeywords } from "@/config/taxDiscountCategoriesConfig";
import { useToast } from "@/hooks/use-toast";

interface FoundTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryId: string;
  categoryEmoji: string;
  categoryName: string;
  selected: boolean;
}

interface BankDiscountScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Demo bank transactions that match tax discount keywords
const DEMO_BANK_TRANSACTIONS: FoundTransaction[] = [
  { id: "bt-1", date: "15.03.2025", description: "КНУ ІМ. ШЕВЧЕНКА оплата за навчання", amount: 42000, categoryId: "education-child", categoryEmoji: "📚", categoryName: "Навчання дитини", selected: true },
  { id: "bt-2", date: "20.01.2025", description: "ТОВ ДІДЖИТАЛ АКАДЕМІЯ курс UI/UX", amount: 33000, categoryId: "education", categoryEmoji: "📚", categoryName: "Навчання", selected: true },
  { id: "bt-3", date: "10.06.2025", description: "ТОВ ДІДЖИТАЛ АКАДЕМІЯ 2 семестр", amount: 33000, categoryId: "education", categoryEmoji: "📚", categoryName: "Навчання", selected: true },
  { id: "bt-4", date: "05.02.2025", description: "КЛІНІКА ДОБРОБУТ стоматологія", amount: 18500, categoryId: "medical", categoryEmoji: "🏥", categoryName: "Лікування", selected: true },
  { id: "bt-5", date: "28.04.2025", description: "БФ ПОВЕРНИСЬ ЖИВИМ благодійний внесок", amount: 12000, categoryId: "charity", categoryEmoji: "🤝", categoryName: "Благодійність", selected: true },
  { id: "bt-6", date: "15.08.2025", description: "БФ ПОВЕРНИСЬ ЖИВИМ щомісячний внесок", amount: 12000, categoryId: "charity", categoryEmoji: "🤝", categoryName: "Благодійність", selected: true },
  { id: "bt-7", date: "01.03.2025", description: "МЕТЛАЙФ СТРАХУВАННЯ річний внесок", amount: 15000, categoryId: "insurance", categoryEmoji: "🛡️", categoryName: "Страхування", selected: true },
  { id: "bt-8", date: "10.09.2025", description: "ЛАБОРАТОРІЯ СИНЕВО аналізи", amount: 2400, categoryId: "medical", categoryEmoji: "🏥", categoryName: "Лікування", selected: false },
  { id: "bt-9", date: "25.11.2025", description: "АПТЕКА ПОДОРОЖНИК ліки", amount: 850, categoryId: "medical", categoryEmoji: "🏥", categoryName: "Лікування", selected: false },
];

export const BankDiscountScanner = ({ open, onOpenChange }: BankDiscountScannerProps) => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [transactions, setTransactions] = useState<FoundTransaction[]>([]);

  const selectedTxns = useMemo(() => transactions.filter(t => t.selected), [transactions]);

  const totalAmount = useMemo(
    () => selectedTxns.reduce((sum, t) => sum + t.amount, 0),
    [selectedTxns]
  );

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, { emoji: string; name: string; txns: FoundTransaction[]; total: number }> = {};
    selectedTxns.forEach(t => {
      if (!groups[t.categoryId]) {
        groups[t.categoryId] = { emoji: t.categoryEmoji, name: t.categoryName, txns: [], total: 0 };
      }
      groups[t.categoryId].txns.push(t);
      groups[t.categoryId].total += t.amount;
    });
    return Object.entries(groups);
  }, [selectedTxns]);

  const handleScan = () => {
    setScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setTransactions(DEMO_BANK_TRANSACTIONS);
      setScanning(false);
      setScanned(true);
    }, 2000);
  };

  const toggleTransaction = (id: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleApply = () => {
    toast({
      title: "Транзакції додано!",
      description: `${selectedTxns.length} транзакцій на суму ${totalAmount.toLocaleString("uk-UA")} ₴ додано до податкової знижки`,
    });
    onOpenChange(false);
    setScanned(false);
    setTransactions([]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Banknote className="h-5 w-5 text-primary" />
            Сканер банківських витрат
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Автоматичний пошук транзакцій, що можуть бути витратами для податкової знижки
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {/* Pre-scan state */}
          {!scanning && !scanned && (
            <div className="py-6 space-y-4">
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-3">
                <h3 className="font-semibold text-sm">Як це працює?</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                  <li>Ми скануємо ваші банківські транзакції за 2025 рік</li>
                  <li>Шукаємо платежі навчальним закладам, клінікам, благодійним фондам тощо</li>
                  <li>Ви обираєте, які транзакції додати до знижки</li>
                  <li>Система автоматично розрахує повернення ПДФО</li>
                </ol>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>🔍 Пошук за {getAllBankKeywords().length} ключовими словами</p>
                <p>📂 {TAX_DISCOUNT_CATEGORIES.length} категорій знижки</p>
                <p>🔒 Дані не передаються третім сторонам</p>
              </div>
            </div>
          )}

          {/* Scanning animation */}
          {scanning && (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Скануємо транзакції за 2025 рік...</p>
              <Progress value={65} className="w-48 h-1.5" />
              <p className="text-xs text-muted-foreground">Перевірено 847 з 1 203 транзакцій</p>
            </div>
          )}

          {/* Results */}
          {scanned && (
            <div className="py-4 space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Знайдено {transactions.length} транзакцій
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Оберіть, які додати до податкової знижки
                  </p>
                </div>
              </div>

              {/* Transaction list */}
              <div className="space-y-1.5">
                {transactions.map(txn => (
                  <div
                    key={txn.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => toggleTransaction(txn.id)}
                  >
                    <Checkbox
                      checked={txn.selected}
                      onCheckedChange={() => toggleTransaction(txn.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{txn.categoryEmoji}</span>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {txn.categoryName}
                        </Badge>
                      </div>
                      <p className="text-sm truncate">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.date}</p>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {txn.amount.toLocaleString("uk-UA")} ₴
                    </span>
                  </div>
                ))}
              </div>

              {/* Grouped summary */}
              {groupedByCategory.length > 0 && (
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <h4 className="text-sm font-medium">Підсумок обраних:</h4>
                  {groupedByCategory.map(([catId, group]) => (
                    <div key={catId} className="flex items-center justify-between text-sm">
                      <span>{group.emoji} {group.name} ({group.txns.length})</span>
                      <span className="font-medium">{group.total.toLocaleString("uk-UA")} ₴</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-semibold">
                    <span>Всього</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {totalAmount.toLocaleString("uk-UA")} ₴
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Потенційне повернення ПДФО: ~{Math.round(totalAmount * 0.18).toLocaleString("uk-UA")} ₴
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Закрити
          </Button>
          {!scanned && !scanning && (
            <Button onClick={handleScan}>
              <Search className="h-4 w-4 mr-1" /> Сканувати виписку
            </Button>
          )}
          {scanned && selectedTxns.length > 0 && (
            <Button onClick={handleApply}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Додати {selectedTxns.length} транзакцій
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
