import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface EmailChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
  onEmailChanged?: (newEmail: string) => void;
}

type Step = "input" | "verify" | "success";

const EmailChangeDialog = ({ 
  open, 
  onOpenChange, 
  currentEmail,
  onEmailChanged 
}: EmailChangeDialogProps) => {
  const [step, setStep] = useState<Step>("input");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("input");
        setNewEmail("");
        setPassword("");
        setOtpCode("");
        setError(null);
        setResendCooldown(0);
      }, 200);
    }
  }, [open]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendCode = async () => {
    setError(null);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError("Невірний формат email");
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError("Новий email співпадає з поточним");
      return;
    }

    if (!password) {
      setError("Введіть пароль");
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to send verification code
      const { data, error: fnError } = await supabase.functions.invoke("send-email-verification", {
        body: {
          newEmail,
          password,
          currentEmail,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Помилка надсилання коду");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setStep("verify");
      setResendCooldown(60);
      toast.success("Код надіслано на нову адресу");
    } catch (err: any) {
      setError(err.message || "Помилка надсилання коду");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) {
      setError("Введіть 6-значний код");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-email-change", {
        body: {
          code: otpCode,
          newEmail,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Помилка верифікації");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setStep("success");
      onEmailChanged?.(newEmail);
    } catch (err: any) {
      setError(err.message || "Невірний код");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      const { error: fnError } = await supabase.functions.invoke("send-email-verification", {
        body: {
          newEmail,
          password,
          currentEmail,
          resend: true,
        },
      });

      if (fnError) throw fnError;

      setResendCooldown(60);
      toast.success("Код надіслано повторно");
    } catch (err: any) {
      toast.error(err.message || "Помилка надсилання");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === "success") {
      onOpenChange(false);
    } else if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {step === "success" ? "Email змінено" : "Зміна Email"}
          </DialogTitle>
          <DialogDescription>
            {step === "input" && "Введіть нову адресу та підтвердьте пароль"}
            {step === "verify" && "Введіть код підтвердження з листа"}
            {step === "success" && "Ваш email успішно оновлено"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Input new email */}
        {step === "input" && (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Поточний email</Label>
              <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                {currentEmail}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newEmail" className="text-sm">Новий email</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="new@example.com"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Поточний пароль</Label>
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
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Скасувати
              </Button>
              <Button onClick={handleSendCode} disabled={isLoading || !newEmail || !password}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Надіслати код
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === "verify" && (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Ми надіслали код підтвердження на:
              </p>
              <p className="font-medium">{newEmail}</p>
            </div>

            <div className="flex justify-center py-4">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(value) => {
                  setOtpCode(value);
                  setError(null);
                }}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Код дійсний 1 годину
            </p>

            <Button
              variant="link"
              className="w-full text-sm"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isLoading}
            >
              {resendCooldown > 0 
                ? `Надіслати ще раз (через ${resendCooldown} сек)` 
                : "Надіслати ще раз"}
            </Button>

            {error && (
              <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setStep("input")}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Назад
              </Button>
              <Button 
                onClick={handleVerifyCode} 
                disabled={isLoading || otpCode.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Підтвердити"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <p className="font-medium">Email успішно змінено!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ваша нова адреса: <span className="font-medium text-foreground">{newEmail}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Використовуйте нову адресу для входу.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button onClick={() => onOpenChange(false)}>
                Готово
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailChangeDialog;