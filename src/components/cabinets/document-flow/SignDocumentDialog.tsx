import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  KeyRound, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  FileSignature,
  Calendar,
  Building2,
  User
} from "lucide-react";
import { Cabinet } from "@/types/cabinet";
import { getKepCertificatesForCabinet, KepCertificate } from "@/config/settingsConfig";
import { cn } from "@/lib/utils";

// Base document type for signing - requires only essential fields
interface SignableDocumentBase {
  id: string;
  type: string;
  number: string;
  date: string;
  status?: string;
  contractor?: unknown;
  amount?: number;
}

interface SignDocumentDialogProps<T extends SignableDocumentBase = SignableDocumentBase> {
  cabinet: Cabinet;
  document: T | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentSigned?: (document: T, certificate: KepCertificate) => void;
}

type SigningStep = "select" | "confirm" | "signing" | "success" | "error";

const SignDocumentDialog: React.FC<SignDocumentDialogProps> = ({
  cabinet,
  document,
  open,
  onOpenChange,
  onDocumentSigned,
}) => {
  const [step, setStep] = useState<SigningStep>("select");
  const [selectedCertificateId, setSelectedCertificateId] = useState<string>("");
  const [agreedToSign, setAgreedToSign] = useState(false);
  const [signingProgress, setSigningProgress] = useState(0);
  const [wasAutoSelected, setWasAutoSelected] = useState(false);

  const certificates = getKepCertificatesForCabinet(cabinet);
  const activeCertificates = certificates.filter(c => c.status === "valid");
  const selectedCertificate = certificates.find(c => c.id === selectedCertificateId);

  // Auto-select single certificate and skip to confirm step
  useEffect(() => {
    if (open) {
      if (activeCertificates.length === 1) {
        // Only one active certificate — auto-select and go to confirm
        setSelectedCertificateId(activeCertificates[0].id);
        setStep("confirm");
        setWasAutoSelected(true);
      } else {
        // Multiple or no certificates — show selection
        setStep("select");
        setSelectedCertificateId("");
        setWasAutoSelected(false);
      }
      // Reset other states
      setAgreedToSign(false);
      setSigningProgress(0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetDialog = () => {
    // Don't reset step here — useEffect handles it on next open
    setSelectedCertificateId("");
    setAgreedToSign(false);
    setSigningProgress(0);
    setWasAutoSelected(false);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const handleProceedToConfirm = () => {
    if (selectedCertificateId) {
      setStep("confirm");
    }
  };

  const handleSign = async () => {
    setStep("signing");
    setSigningProgress(0);

    // Simulate signing process
    const steps = [
      { progress: 20, delay: 500 },
      { progress: 45, delay: 800 },
      { progress: 70, delay: 600 },
      { progress: 90, delay: 400 },
      { progress: 100, delay: 300 },
    ];

    for (const s of steps) {
      await new Promise(resolve => setTimeout(resolve, s.delay));
      setSigningProgress(s.progress);
    }

    // Random success/error for demo (90% success rate)
    if (Math.random() > 0.1) {
      setStep("success");
      if (document && selectedCertificate && onDocumentSigned) {
        onDocumentSigned(document, selectedCertificate);
      }
    } else {
      setStep("error");
    }
  };

  const getCertificateStatusBadge = (status: KepCertificate["status"]) => {
    switch (status) {
      case "valid":
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0">Активний</Badge>;
      case "expiring":
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-0">Закінчується</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-0">Прострочений</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            Підписання документа КЕП
          </DialogTitle>
          {document && step === "select" && (
            <DialogDescription>
              {document.type} №{document.number} від {formatDate(document.date)}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Step: Select Signer */}
        {step === "select" && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Оберіть підписанта</Label>
            
            {activeCertificates.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
                <div>
                  <p className="font-medium">Немає активних сертифікатів</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Додайте KEP-сертифікат у налаштуваннях кабінету
                  </p>
                </div>
              </div>
            ) : (
              <RadioGroup
                value={selectedCertificateId}
                onValueChange={setSelectedCertificateId}
                className="space-y-2"
              >
                {activeCertificates.map((cert) => (
                  <label
                    key={cert.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedCertificateId === cert.id
                        ? "border-primary bg-primary/5"
                        : "border-border/70 hover:bg-muted/50"
                    )}
                  >
                    <RadioGroupItem value={cert.id} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm">{cert.owner}</span>
                        {getCertificateStatusBadge(cert.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate">{cert.issuer}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Дійсний до {formatDate(cert.validTo)}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            )}
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && selectedCertificate && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <KeyRound className="h-4 w-4 text-primary" />
                <span className="font-medium">Підписант:</span>
                <span>{selectedCertificate.owner}</span>
              </div>
              {document && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Документ:</span>
                    <span>{document.type} №{document.number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Дата:</span>
                    <span>{formatDate(document.date)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="agree-sign"
                checked={agreedToSign}
                onCheckedChange={(checked) => setAgreedToSign(checked === true)}
              />
              <label htmlFor="agree-sign" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                Я підтверджую, що ознайомлений зі змістом документа та погоджуюсь накласти електронний підпис
              </label>
            </div>
          </div>
        )}

        {/* Step: Signing in progress */}
        {step === "signing" && (
          <div className="py-8 space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <ShieldCheck className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">Підписання документа...</p>
              <p className="text-sm text-muted-foreground">
                {signingProgress < 30 && "Встановлення з'єднання..."}
                {signingProgress >= 30 && signingProgress < 60 && "Перевірка сертифіката..."}
                {signingProgress >= 60 && signingProgress < 90 && "Формування підпису..."}
                {signingProgress >= 90 && "Завершення..."}
              </p>
            </div>
            <Progress value={signingProgress} className="h-2" />
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="font-medium text-lg">Документ підписано!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Електронний підпис успішно накладено
              </p>
            </div>
            {selectedCertificate && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{selectedCertificate.owner}</span>
              </div>
            )}
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <p className="font-medium text-lg">Помилка підписання</p>
              <p className="text-sm text-muted-foreground mt-1">
                Не вдалося накласти електронний підпис. Спробуйте ще раз.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "select" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Скасувати
              </Button>
              <Button 
                onClick={handleProceedToConfirm} 
                disabled={!selectedCertificateId}
              >
                Далі
              </Button>
            </>
          )}

          {step === "confirm" && (
            <>
              {/* Show "Back" only if there are multiple certificates */}
              {!wasAutoSelected && activeCertificates.length > 1 && (
                <Button variant="outline" onClick={() => setStep("select")}>
                  Назад
                </Button>
              )}
              {/* If single cert (auto-selected), show "Cancel" instead */}
              {wasAutoSelected && (
                <Button variant="outline" onClick={handleClose}>
                  Скасувати
                </Button>
              )}
              <Button 
                onClick={handleSign} 
                disabled={!agreedToSign}
                className="gap-2"
              >
                <KeyRound className="h-4 w-4" />
                Підписати
              </Button>
            </>
          )}

          {step === "success" && (
            <Button onClick={handleClose} className="w-full">
              Готово
            </Button>
          )}

          {step === "error" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Закрити
              </Button>
              <Button onClick={() => setStep("confirm")}>
                Спробувати ще
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignDocumentDialog;
