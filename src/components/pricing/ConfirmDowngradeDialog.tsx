import { useNavigate } from "react-router-dom";
import { X, Check, AlertTriangle, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { comparisonFeatures, demoUserData, type PlanData } from "@/config/pricingData";

interface ConfirmDowngradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanData;
  newPlan: PlanData;
}

export const ConfirmDowngradeDialog = ({
  open,
  onOpenChange,
  currentPlan,
  newPlan,
}: ConfirmDowngradeDialogProps) => {
  const navigate = useNavigate();

  const lostFeatures = comparisonFeatures.filter((f) => {
    const currentHas = f[currentPlan.id as keyof typeof f] as boolean;
    const newHas = f[newPlan.id as keyof typeof f] as boolean;
    return currentHas && !newHas;
  });

  const keptFeatures = comparisonFeatures.filter((f) => {
    const newHas = f[newPlan.id as keyof typeof f] as boolean;
    return newHas;
  });

  const handleConfirm = () => {
    onOpenChange(false);
    navigate(`/checkout?plan=${newPlan.id}&mode=change`);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Підтвердження даунгрейду
          </AlertDialogTitle>
          <AlertDialogDescription>
            Ви переходите з тарифу «{currentPlan.name}» на «{newPlan.name}»
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Lost features */}
        {lostFeatures.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">
              Функції, які будуть деактивовані:
            </p>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1.5">
              {lostFeatures.map((f) => (
                <div key={f.feature} className="flex items-center gap-2 text-sm">
                  <X className="h-4 w-4 text-destructive shrink-0" />
                  <span>{f.feature}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Ці функції стануть недоступними після переходу на тариф «{newPlan.name}»
            </p>
          </div>
        )}

        <Separator />

        {/* Consequences summary */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Підсумок наслідків:</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span>
                Баланс <strong>{demoUserData.balance.toLocaleString()} кредитів</strong> збережеться
              </span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                При наступному списанні: <strong>{newPlan.credits.toLocaleString()}</strong> замість{" "}
                <strong>{currentPlan.credits.toLocaleString()}</strong> кредитів
              </span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Курс поповнення: 1 грн = <strong>{newPlan.topUpRate.toLocaleString()}</strong> замість{" "}
                <strong>{currentPlan.topUpRate.toLocaleString()}</strong>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>Зміна набуде чинності з наступного розрахункового періоду</span>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel>Залишитися на «{currentPlan.name}»</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Підтверджую даунгрейд
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
