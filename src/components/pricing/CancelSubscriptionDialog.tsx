import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { toast } from "sonner";
import { UserSubscriptionStatus, plans } from "@/config/pricingData";

const CANCEL_REASONS = [
  { id: "expensive", label: "Занадто дорого для мого обсягу" },
  { id: "unused", label: "Не використовую достатньо функцій" },
  { id: "switched", label: "Перейшов на інший сервіс" },
  { id: "pause", label: "Тимчасова пауза, поверну пізніше" },
  { id: "other", label: "Інше" },
] as const;

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: UserSubscriptionStatus;
  onConfirmCancel: () => void;
  onDowngrade?: () => void;
}

export const CancelSubscriptionDialog = ({
  open,
  onOpenChange,
  subscription,
  onConfirmCancel,
  onDowngrade,
}: CancelSubscriptionDialogProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<string>("");

  const billingDate = format(new Date(subscription.nextBillingDate), "d MMMM yyyy", { locale: uk });

  // Find a cheaper plan for retention offer
  const currentPlan = plans.find(p => p.id === subscription.planId);
  const cheaperPlan = plans
    .filter(p => currentPlan && p.price < currentPlan.price)
    .sort((a, b) => b.price - a.price)[0];

  const showRetention = reason === "expensive" && cheaperPlan;

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setStep(1);
      setReason("");
    }, 200);
  };

  const handleConfirm = () => {
    onConfirmCancel();
    handleClose();
    toast("Підписку скасовано", {
      description: `Тариф залишиться активним до ${format(new Date(subscription.nextBillingDate), "d MMMM", { locale: uk })}.`,
    });
  };

  const handleDowngrade = () => {
    handleClose();
    onDowngrade?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        {step === 1 ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Чому ви хочете скасувати підписку?</AlertDialogTitle>
              <AlertDialogDescription>
                Ваша відповідь допоможе нам покращити сервіс.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <RadioGroup value={reason} onValueChange={setReason} className="space-y-3 py-2">
              {CANCEL_REASONS.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
                >
                  <RadioGroupItem value={r.id} />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </RadioGroup>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Передумав</AlertDialogCancel>
              <Button disabled={!reason} onClick={() => setStep(2)}>
                Продовжити
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Підтвердження скасування підписки</AlertDialogTitle>
            </AlertDialogHeader>

            <div className="space-y-4 py-2">
              <Alert className="border-destructive/30 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription>
                  <ul className="space-y-2 text-sm mt-1">
                    <li>
                      Тариф <strong>«{subscription.planName}»</strong> залишиться активним до <strong>{billingDate}</strong>
                    </li>
                    <li>
                      Після закінчення: нові кредити <strong>не нараховуватимуться</strong>
                    </li>
                    <li>
                      Невикористані <strong>{subscription.currentBalance.toLocaleString()} кредитів</strong> збережуться на балансі
                    </li>
                    <li>
                      Доступ до створення документів, звітів та платежів буде <strong>обмежено</strong>
                    </li>
                    <li>
                      Перегляд існуючих даних залишиться доступним
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              {showRetention && (
                <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                  <p className="text-sm font-medium">
                    Можливо, вам підійде тариф «{cheaperPlan.name}» за {cheaperPlan.price} грн/міс?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cheaperPlan.credits.toLocaleString()} кредитів, ~{cheaperPlan.actions} дій на місяць
                  </p>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDowngrade}>
                    Перейти на «{cheaperPlan.name}»
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Залишитися</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleConfirm}
              >
                Так, скасувати підписку
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
