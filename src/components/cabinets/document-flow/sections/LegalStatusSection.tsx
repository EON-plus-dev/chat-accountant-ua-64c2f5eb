import { useState } from "react";
import {
  FileSignature,
  Shield,
  FileCheck,
  Scale,
  Lock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Info,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { Document } from "@/config/documentFlowConfig";
import type { SignatureVerification, IntegrityCheck, SourceVerification } from "@/types/documentAuthenticity";
import { getSignatureStatusBadge, getIntegrityStatusBadge } from "@/types/documentAuthenticity";

// ============================================
// DEMO DATA
// ============================================

interface LegalStatusSectionProps {
  document: Document;
  signatures?: SignatureVerification[];
  integrity?: IntegrityCheck;
  source?: SourceVerification;
  erpnRegistration?: {
    number: string;
    date: string;
    status: "registered" | "pending" | "rejected";
  };
  notarization?: {
    required: boolean;
    completed: boolean;
    notaryName?: string;
    date?: string;
    registryNumber?: string;
  };
  legalHold?: {
    isActive: boolean;
    reason?: string;
    since?: string;
    caseNumber?: string;
  };
  className?: string;
}

const SignatureStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "valid":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "expired":
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case "revoked":
    case "invalid":
    case "error":
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

export const LegalStatusSection = ({
  document,
  signatures = [],
  integrity,
  source,
  erpnRegistration,
  notarization,
  legalHold,
  className,
}: LegalStatusSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Determine overall legal status
  const hasValidSignatures = signatures.length > 0 && signatures.every(s => s.status === "valid");
  const hasIntegrity = integrity?.status === "verified";
  const isFullyLegal = hasValidSignatures && hasIntegrity && !legalHold?.isActive;
  const hasWarnings = signatures.some(s => s.status === "expired") || integrity?.status === "warning";
  const hasErrors = signatures.some(s => ["revoked", "invalid"].includes(s.status)) || integrity?.status === "broken";

  // Show section for signed documents or documents requiring legal verification
  const shouldShow = document.status !== "draft" || 
    document.type === "tax-invoice" || 
    document.type === "power-of-attorney" ||
    notarization?.required;

  if (!shouldShow) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* CRITICAL: Legal Hold Banner */}
      {legalHold?.isActive && (
        <Alert variant="destructive" className="border-2 border-red-500 bg-red-50 dark:bg-red-950/50">
          <Lock className="h-5 w-5" />
          <AlertTitle className="flex items-center gap-2 text-base font-semibold">
            <span>Legal Hold активний</span>
            <Badge variant="destructive" className="text-[10px] gap-1">
              <Ban className="w-3 h-3" />
              ЗАБОРОНЕНО ВИДАЛЯТИ / РЕДАГУВАТИ
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-1.5">
            {legalHold.reason && (
              <p className="font-medium text-red-800 dark:text-red-200">{legalHold.reason}</p>
            )}
            <div className="text-xs text-red-700 dark:text-red-300 space-y-0.5">
              {legalHold.caseNumber && <p>Справа: {legalHold.caseNumber}</p>}
              {legalHold.since && (
                <p>Діє з: {format(new Date(legalHold.since), "dd.MM.yyyy", { locale: uk })}</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="rounded-lg border bg-card">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full p-3 hover:bg-accent/50 transition-colors rounded-t-lg">
              <div className="flex items-center gap-2">
                <Shield className={cn(
                  "w-4 h-4",
                  hasErrors ? "text-red-500" :
                  hasWarnings ? "text-amber-500" :
                  isFullyLegal ? "text-emerald-500" :
                  "text-muted-foreground"
                )} />
                <span className="font-medium text-sm">Юридична сила</span>
                {isFullyLegal && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                    ✓ Підтверджено
                  </Badge>
                )}
                {hasWarnings && !hasErrors && (
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                    ⚠ Увага
                  </Badge>
                )}
                {hasErrors && (
                  <Badge variant="destructive" className="text-[10px]">
                    ✗ Проблеми
                  </Badge>
                )}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-4">
              <Separator />

            {/* KEP Signatures */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <FileSignature className="w-3.5 h-3.5" />
                Електронні підписи (КЕП)
              </div>
              
              {signatures.length > 0 ? (
                <div className="space-y-2">
                  {signatures.map((sig, index) => {
                    const badge = getSignatureStatusBadge(sig.status);
                    return (
                      <div 
                        key={sig.id || index}
                        className={cn(
                          "flex items-start justify-between p-2.5 rounded-md border",
                          sig.status === "valid" 
                            ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                            : sig.status === "expired"
                            ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                            : "bg-muted/50 border-border"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <SignatureStatusIcon status={sig.status} />
                          <div>
                            <p className="font-medium text-sm">{sig.signerName}</p>
                            {sig.signerPosition && (
                              <p className="text-xs text-muted-foreground">{sig.signerPosition}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(sig.signedAt), "dd.MM.yyyy HH:mm", { locale: uk })}
                            </p>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant={badge.status === "valid" ? "outline" : badge.status === "error" ? "destructive" : "secondary"}
                                className={cn(
                                  "text-[10px] cursor-help",
                                  badge.status === "valid" && "bg-emerald-100 text-emerald-700 border-emerald-200"
                                )}
                              >
                                {badge.label}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <div className="space-y-1 text-xs">
                                <p>{badge.tooltip}</p>
                                {sig.certificate && (
                                  <>
                                    <Separator />
                                    <p>Видавець: {sig.certificate.issuerShort}</p>
                                    <p>Дійсний до: {format(new Date(sig.certificate.validTo), "dd.MM.yyyy")}</p>
                                  </>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border border-dashed">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Документ ще не підписано</span>
                </div>
              )}
            </div>

            {/* ERPN Registration (for tax invoices) */}
            {erpnRegistration && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                  <FileCheck className="w-3.5 h-3.5" />
                  Реєстрація ЄРПН
                </div>
                <div className={cn(
                  "flex items-center justify-between p-2.5 rounded-md border",
                  erpnRegistration.status === "registered"
                    ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : erpnRegistration.status === "rejected"
                    ? "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                    : "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                )}>
                  <div>
                    <p className="font-medium text-sm">№ {erpnRegistration.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(erpnRegistration.date), "dd.MM.yyyy HH:mm", { locale: uk })}
                    </p>
                  </div>
                  <Badge 
                    variant={erpnRegistration.status === "registered" ? "outline" : erpnRegistration.status === "rejected" ? "destructive" : "secondary"}
                    className={cn(
                      "text-[10px]",
                      erpnRegistration.status === "registered" && "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {erpnRegistration.status === "registered" ? "✓ Зареєстровано" :
                     erpnRegistration.status === "rejected" ? "✗ Відхилено" : "⏳ В обробці"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Notarization (for power of attorney, certain contracts) */}
            {notarization && notarization.required && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                  <Scale className="w-3.5 h-3.5" />
                  Нотаріальне завірення
                </div>
                <div className={cn(
                  "p-2.5 rounded-md border",
                  notarization.completed
                    ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                )}>
                  {notarization.completed ? (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{notarization.notaryName}</p>
                        <p className="text-xs text-muted-foreground">
                          Реєстр № {notarization.registryNumber}
                        </p>
                        {notarization.date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(notarization.date), "dd.MM.yyyy", { locale: uk })}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700">
                        ✓ Завірено
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">Потребує нотаріального завірення</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legal Hold */}
            {legalHold?.isActive && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                  <Lock className="w-3.5 h-3.5" />
                  Legal Hold
                </div>
                <div className="p-2.5 rounded-md bg-red-50/50 border border-red-200 dark:bg-red-950/20 dark:border-red-800">
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-red-700 dark:text-red-400">
                        Документ заблоковано
                      </p>
                      {legalHold.reason && (
                        <p className="text-xs text-red-600 dark:text-red-400">{legalHold.reason}</p>
                      )}
                      {legalHold.caseNumber && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Справа: {legalHold.caseNumber}
                        </p>
                      )}
                      {legalHold.since && (
                        <p className="text-xs text-muted-foreground">
                          З: {format(new Date(legalHold.since), "dd.MM.yyyy", { locale: uk })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hash Chain / Integrity - simplified for users */}
            {integrity && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                  <Shield className="w-3.5 h-3.5" />
                  Цілісність документа
                </div>
                <div className={cn(
                  "p-2.5 rounded-md border",
                  integrity.status === "verified"
                    ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : integrity.status === "warning"
                    ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                    : "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <SignatureStatusIcon status={integrity.status} />
                      <div>
                        <p className="text-sm">
                          {integrity.status === "verified" 
                            ? "✓ Документ не змінювався після підписання"
                            : integrity.status === "warning"
                            ? "⚠ Виявлено незначні зміни"
                            : "✗ Виявлено несанкціоновані зміни"}
                        </p>
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                            <Info className="w-3 h-3" />
                            <span className="hidden sm:inline">Деталі</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[280px]">
                          <div className="space-y-1.5 text-xs">
                            <p className="font-medium">Технічні деталі</p>
                            <div className="space-y-0.5 text-muted-foreground">
                              <p>Криптографічний захист: {integrity.algorithm}</p>
                              <p>Записів у ланцюжку: {integrity.entriesCount}</p>
                            </div>
                            <Separator className="my-1" />
                            <p className="font-mono text-[10px] break-all text-muted-foreground">
                              Hash: {integrity.currentHash.slice(0, 24)}...
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            )}

            {/* Source Verification */}
            {source && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Джерело: {source.sourceLabel}</span>
                {source.edoProvider && (
                  <Badge variant="outline" className="text-[10px]">
                    {source.edoProvider}
                  </Badge>
                )}
              </div>
            )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};
