import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "warning" | "password" | "confirm" | "processing" | "success";

const CONFIRM_TEXT = "ВИДАЛИТИ";

const DeleteAccountDialog = ({ open, onOpenChange }: DeleteAccountDialogProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("warning");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("warning");
        setPassword("");
        setConfirmText("");
        setError(null);
      }, 200);
    }
  }, [open]);

  const handleVerifyPassword = async () => {
    if (!password) {
      setError("Введіть пароль");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Verify password by attempting to sign in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Не вдалося отримати дані користувача");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (signInError) {
        throw new Error("Невірний пароль");
      }

      setStep("confirm");
    } catch (err: any) {
      setError(err.message || "Помилка перевірки пароля");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_TEXT) {
      setError(`Введіть "${CONFIRM_TEXT}" для підтвердження`);
      return;
    }

    setError(null);
    setIsLoading(true);
    setStep("processing");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("delete-account", {
        body: { password },
      });

      if (fnError) throw new Error(fnError.message || "Помилка видалення");
      if (data?.error) throw new Error(data.error);

      setStep("success");
      
      // Sign out and redirect after short delay
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Помилка видалення акаунту");
      setStep("confirm");
    } finally {
      setIsLoading(false);
    }
  };

  const isConfirmValid = confirmText === CONFIRM_TEXT;

  // Prevent closing during processing or success
  const handleOpenChange = (newOpen: boolean) => {
    if (step === "processing" || step === "success") return;
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            {step === "success" ? "Акаунт видалено" : "Видалення акаунту"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {step === "warning" && "Ця дія є незворотною. Всі ваші дані буде видалено."}
            {step === "password" && "Для безпеки підтвердьте вашу особу."}
            {step === "confirm" && "Останній крок: підтвердження видалення."}
            {step === "processing" && "Видалення акаунту..."}
            {step === "success" && "Ваш акаунт успішно видалено."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Step 1: Warning */}
        {step === "warning" && (
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="text-sm space-y-2">
                  <p className="font-medium text-destructive">Ви впевнені?</p>
                  <p className="text-muted-foreground">Це призведе до:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-1">
                    <li>Видалення всіх персональних даних</li>
                    <li>Виходу з усіх кабінетів</li>
                    <li>Втрати доступу до системи назавжди</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Дані кабінетів, де ви є власником, НЕ видаляються автоматично. 
                  Передайте право власності або видаліть кабінети вручну перед видаленням акаунту.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Скасувати
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setStep("password")}
              >
                Продовжити
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Password */}
        {step === "password" && (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">
                Введіть ваш поточний пароль
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="pr-10"
                  placeholder="••••••••"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setStep("warning")}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Назад
              </Button>
              <Button 
                variant="destructive"
                onClick={handleVerifyPassword} 
                disabled={isLoading || !password}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Підтвердити
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="confirmText" className="text-sm">
                Введіть <span className="font-mono font-bold">{CONFIRM_TEXT}</span> для підтвердження
              </Label>
              <Input
                id="confirmText"
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value.toUpperCase());
                  setError(null);
                }}
                disabled={isLoading}
                placeholder={CONFIRM_TEXT}
                className={cn(
                  "font-mono",
                  confirmText && (isConfirmValid ? "border-green-500" : "border-destructive")
                )}
                autoFocus
              />
              <div className="flex items-center gap-1.5 text-xs">
                {confirmText && (
                  isConfirmValid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-600">Підтверджено</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-destructive">Невірно</span>
                    </>
                  )
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setStep("password")}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Назад
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteAccount} 
                disabled={isLoading || !isConfirmValid}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Видалити назавжди
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Processing */}
        {step === "processing" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Видалення акаунту...</p>
            <p className="text-xs text-muted-foreground">Це може зайняти кілька секунд</p>
          </div>
        )}

        {/* Step 5: Success */}
        {step === "success" && (
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <p className="font-medium">Акаунт видалено</p>
              <p className="text-sm text-muted-foreground mt-1">
                Дякуємо за використання нашого сервісу.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Вас буде перенаправлено на головну сторінку...
              </p>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;