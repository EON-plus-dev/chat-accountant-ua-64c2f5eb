import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreditCard, 
  ArrowRight,
  Building2,
  Wallet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatReferralCredits, creditsToUah } from "@/config/referralConfig";
import { toast } from "sonner";

interface OwnedCabinet {
  id: string;
  name: string;
  currentCredits: number;
}

interface CreditConversionCardProps {
  availableCredits: number;
  ownedCabinets: OwnedCabinet[];
  onConvert?: (cabinetId: string, amount: number) => void;
  className?: string;
}

export const CreditConversionCard = ({
  availableCredits,
  ownedCabinets,
  onConvert,
  className,
}: CreditConversionCardProps) => {
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>(
    ownedCabinets.length > 0 ? ownedCabinets[0].id : ""
  );
  const [conversionAmount, setConversionAmount] = useState<number>(
    Math.min(10000, availableCredits)
  );
  const [isConverting, setIsConverting] = useState(false);

  const selectedCabinet = ownedCabinets.find(c => c.id === selectedCabinetId);
  const estimatedUah = creditsToUah(conversionAmount);

  const handleConvert = async () => {
    if (!selectedCabinetId || conversionAmount <= 0) return;

    setIsConverting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(
      `${formatReferralCredits(conversionAmount, false)} конвертовано в "${selectedCabinet?.name}"`,
      { description: "Кредити будуть доступні протягом кількох хвилин" }
    );
    
    onConvert?.(selectedCabinetId, conversionAmount);
    setIsConverting(false);
  };

  // Empty state - no owned cabinets
  if (ownedCabinets.length === 0) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Конвертація кредитів
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Немає кабінетів для конвертації
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Ви можете конвертувати кредити тільки в кабінети, де ви є власником. 
                Створіть власний кабінет або отримайте права власника в існуючому.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No available credits
  if (availableCredits <= 0) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Конвертація кредитів
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
            <Wallet className="h-5 w-5" />
            <span className="text-sm">Немає доступних кредитів для конвертації</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          Конвертація кредитів
          <Badge variant="secondary" className="ml-auto">
            {formatReferralCredits(availableCredits, false)} доступно
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Cabinet Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Обрати кабінет
          </label>
          <Select value={selectedCabinetId} onValueChange={setSelectedCabinetId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Оберіть кабінет" />
            </SelectTrigger>
            <SelectContent>
              {ownedCabinets.map((cabinet) => (
                <SelectItem key={cabinet.id} value={cabinet.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{cabinet.name}</span>
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {formatReferralCredits(cabinet.currentCredits, false)}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Сума для конвертації
            </label>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums">
                {formatReferralCredits(conversionAmount, false)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                ~{estimatedUah} грн
              </p>
            </div>
          </div>
          <Slider
            value={[conversionAmount]}
            onValueChange={(value) => setConversionAmount(value[0])}
            min={1000}
            max={availableCredits}
            step={1000}
            className="py-2"
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>1K</span>
            <span>{formatReferralCredits(availableCredits, false)}</span>
          </div>
        </div>

        {/* Summary */}
        {selectedCabinet && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Поточний баланс кабінету:</span>
              <span className="font-medium">
                {formatReferralCredits(selectedCabinet.currentCredits, false)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Після конвертації:</span>
              <span className="font-medium text-emerald-600">
                {formatReferralCredits(selectedCabinet.currentCredits + conversionAmount, false)}
              </span>
            </div>
          </div>
        )}

        {/* Convert Button */}
        <Button 
          className="w-full gap-2" 
          onClick={handleConvert}
          disabled={isConverting || !selectedCabinetId || conversionAmount <= 0}
        >
          {isConverting ? (
            <>Конвертуємо...</>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Конвертувати {formatReferralCredits(conversionAmount, false)}
            </>
          )}
        </Button>

        {/* Help text */}
        <p className="text-[10px] text-muted-foreground text-center">
          Конвертовані кредити можна використовувати для оплати послуг в обраному кабінеті
        </p>
      </CardContent>
    </Card>
  );
};

export default CreditConversionCard;
