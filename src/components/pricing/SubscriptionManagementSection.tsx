import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { toast } from "sonner";
import { UserSubscriptionStatus } from "@/config/pricingData";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";

interface SubscriptionManagementSectionProps {
  subscription: UserSubscriptionStatus;
  planPrice: number;
  onToggleAutoRenew: (enabled: boolean) => void;
  onCancelSubscription: () => void;
  onReactivate: () => void;
  onDowngrade?: () => void;
}

export const SubscriptionManagementSection = ({
  subscription,
  planPrice,
  onToggleAutoRenew,
  onCancelSubscription,
  onReactivate,
  onDowngrade,
}: SubscriptionManagementSectionProps) => {
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const billingDate = format(new Date(subscription.nextBillingDate), "d MMMM yyyy", { locale: uk });
  const billingDateShort = format(new Date(subscription.nextBillingDate), "d MMMM", { locale: uk });

  const handleAutoRenewToggle = (checked: boolean) => {
    if (!checked) {
      setShowDisableDialog(true);
    } else {
      onToggleAutoRenew(true);
      toast.success(`Автоподовження увімкнено. Наступне списання ${billingDateShort}.`);
    }
  };

  const handleConfirmDisable = () => {
    onToggleAutoRenew(false);
    setShowDisableDialog(false);
    toast("Автоподовження вимкнено", {
      description: `Підписка залишиться активною до ${billingDateShort}.`,
    });
  };

  if (subscription.status === "cancelled") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Settings className="h-4 w-4" />
          Керування підпискою
        </div>
        <Alert className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-sm">
            Ваша підписка активна до <strong>{billingDate}</strong>. Після цього доступ буде обмежено: 
            ви зможете переглядати дані, але створювати документи, звіти та платежі буде неможливо.
          </AlertDescription>
        </Alert>
        <Button className="w-full gap-2" onClick={onReactivate}>
          <RefreshCw className="h-4 w-4" />
          Поновити підписку
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Settings className="h-4 w-4" />
        Керування підпискою
      </div>

      {/* Auto-renewal toggle */}
      <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30 border">
        <div className="space-y-0.5">
          <label htmlFor="auto-renew" className="text-sm font-medium cursor-pointer">
            Автоподовження
          </label>
          <p className="text-xs text-muted-foreground">
            {subscription.autoRenew
              ? `Підписка продовжиться автоматично ${billingDateShort} за ${planPrice} грн`
              : `Підписка завершиться ${billingDateShort}. Кредити збережуться, але нові не нарахуються.`}
          </p>
        </div>
        <Switch
          id="auto-renew"
          checked={subscription.autoRenew}
          onCheckedChange={handleAutoRenewToggle}
        />
      </div>

      {/* Cancel subscription button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setShowCancelDialog(true)}
      >
        Скасувати підписку
      </Button>

      {/* Disable auto-renewal confirmation */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вимкнути автоподовження?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Зверніть увагу на наслідки:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    Ваш тариф <strong>«{subscription.planName}»</strong> залишиться активним до <strong>{billingDate}</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    Після цієї дати нові кредити <strong>не нараховуватимуться</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    Невикористані кредити збережуться, але система перейде в <strong>обмежений режим</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    Ви зможете увімкнути автоподовження назад у <strong>будь-який момент</strong>
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Залишити увімкненим</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDisable}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Вимкнути
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel subscription dialog */}
      <CancelSubscriptionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        subscription={subscription}
        onConfirmCancel={onCancelSubscription}
        onDowngrade={onDowngrade}
      />
    </div>
  );
};
