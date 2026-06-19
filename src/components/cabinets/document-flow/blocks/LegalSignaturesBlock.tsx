/**
 * LegalSignaturesBlock — Блок "Юридична сила та підписи (КЕП)"
 * 
 * UX-оптимізована структура (v3):
 * - Завжди collapsed за замовчуванням
 * - Компактний summary line з лічильником сторін
 * - Кнопки завантаження підписаного документа та протоколу
 * - Підтримка N сторін
 */

import { useState } from "react";
import {
  Shield, FileSignature, CheckCircle2, AlertTriangle, Clock,
  ChevronDown, ChevronUp, Lock, Scale, Archive, ExternalLink,
  Download, FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, differenceInDays, differenceInMonths, differenceInYears, addYears } from "date-fns";
import { uk } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import type { SignatureVerification, IntegrityCheck } from "@/types/documentAuthenticity";

// ============================================
// TYPES
// ============================================

interface LegalSignaturesBlockProps {
  document: FlowDocument;
  signatures?: SignatureVerification[];
  integrity?: IntegrityCheck;
  legalHold?: {
    isActive: boolean;
    reason?: string;
    since?: string;
    caseNumber?: string;
  };
  retentionCategory?: string;
  retentionYears?: number;
  onNavigateToTechId?: () => void;
  className?: string;
}

// ============================================
// HELPERS
// ============================================

const signStatusLabels: Record<string, string> = {
  "not-signed": "Без підписів",
  "pending-our": "Очікує нашого підпису",
  "pending-counterparty": "Очікує підпису контрагента",
  "pending-both": "Очікує обох підписів",
  "signed-our": "Підписано нами",
  "signed-counterparty": "Підписано контрагентом",
  "signed": "Підписано",
  "partially-signed": "Частково підписано",
  "fully-signed": "Повністю підписано",
  "not-required": "Не потребує підпису",
};

const retentionCategoryLabels: Record<string, { label: string; years: number; basis: string }> = {
  "tax": { label: "Податковий документ", years: 3, basis: "ПКУ ст. 44.3" },
  "accounting": { label: "Бухгалтерський документ", years: 5, basis: "ЗУ «Про бухоблік» ст. 9" },
  "legal": { label: "Договірний документ", years: 3, basis: "ЦКУ ст. 257" },
  "hr": { label: "Кадровий документ", years: 75, basis: "Наказ МЮ №1000/5" },
  "internal": { label: "Внутрішній документ", years: 1, basis: "Внутрішня політика" },
};

const getSignatureStatus = (doc: FlowDocument): string => {
  if (doc.signatureStatus) return doc.signatureStatus;
  if (doc.status === "signed" || doc.status === "sent") return "signed";
  if (doc.status === "pending-sign") return "pending-our";
  if (doc.status === "draft") return "not-signed";
  return "not-required";
};

const getRetentionInfo = (doc: FlowDocument, category?: string) => {
  const docCategory = category || getDocumentCategory(doc.type);
  const config = retentionCategoryLabels[docCategory] || retentionCategoryLabels["accounting"];
  const createdDate = new Date(doc.date || doc.createdAt);
  const retentionUntil = addYears(createdDate, config.years);
  const now = new Date();
  const daysRemaining = differenceInDays(retentionUntil, now);
  const monthsRemaining = differenceInMonths(retentionUntil, now);
  const yearsRemaining = differenceInYears(retentionUntil, now);
  
  let remainingText = "";
  if (yearsRemaining > 0) {
    remainingText = `${yearsRemaining} р. ${monthsRemaining % 12} міс.`;
  } else if (monthsRemaining > 0) {
    remainingText = `${monthsRemaining} міс.`;
  } else if (daysRemaining > 0) {
    remainingText = `${daysRemaining} дн.`;
  } else {
    remainingText = "Завершено";
  }

  const progress = Math.max(0, Math.min(100, ((config.years * 365 - daysRemaining) / (config.years * 365)) * 100));

  return {
    category: config.label,
    basis: config.basis,
    years: config.years,
    retentionUntil,
    remainingText,
    progress,
    isExpired: daysRemaining <= 0,
  };
};

const getDocumentCategory = (type: string): string => {
  if (["tax-invoice", "prro-receipt"].includes(type)) return "tax";
  if (["employment-order", "vacation-order", "dismissal-order"].includes(type)) return "hr";
  if (["contract", "supply-contract", "rental-agreement", "fop-service-contract", "nda"].includes(type)) return "legal";
  return "accounting";
};

// ============================================
// SUB-COMPONENTS
// ============================================

const SignatureRow = ({ signature }: { signature: SignatureVerification }) => {
  const isValid = signature.status === "valid";
  const isExpired = signature.status === "expired";
  const isRevoked = signature.status === "revoked";
  const isPending = signature.status === "pending";

  return (
    <div className={cn(
      "p-3 rounded-md border",
      isValid && "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800",
      isExpired && "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
      isRevoked && "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
      isPending && "bg-muted/40 border-dashed border-border"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {isValid && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
          {isExpired && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
          {isRevoked && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
          {isPending && <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
          <div className="min-w-0">
            <p className={cn("font-medium text-sm truncate", isPending && "text-muted-foreground")}>{signature.signerName}</p>
            {signature.signerPosition && (
              <p className="text-xs text-muted-foreground">{signature.signerPosition}</p>
            )}
            {!isPending && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(signature.signedAt), "dd.MM.yyyy HH:mm", { locale: uk })}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge 
            variant={isValid ? "outline" : isPending ? "secondary" : isExpired ? "secondary" : "destructive"}
            className={cn(
              "text-[10px]",
              isValid && "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400",
              isPending && "bg-muted text-muted-foreground"
            )}
          >
            {isValid ? "КЕП OK" : isPending ? "Очікує" : isExpired ? "Прострочений" : "Відкликаний"}
          </Badge>
          {signature.certificate && !isPending && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[10px] text-muted-foreground cursor-help">
                    {signature.certificate.issuerShort}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <div className="text-xs space-y-1">
                    <p>Видавець: {signature.certificate.issuer}</p>
                    <p>Дійсний до: {format(new Date(signature.certificate.validTo), "dd.MM.yyyy")}</p>
                    <p>Рівень: QES (Кваліфікований)</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const LegalSignaturesBlock = ({
  document,
  signatures = [],
  integrity,
  legalHold,
  retentionCategory,
  onNavigateToTechId,
  className,
}: LegalSignaturesBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const signStatus = getSignatureStatus(document);
  const retentionInfo = getRetentionInfo(document, retentionCategory);
  
  // Party/signature counting
  const validCount = signatures.filter(s => s.status === "valid").length;
  const totalParties = document.parties?.length || signatures.length || 0;
  const hasValidSignatures = signatures.length > 0 && signatures.every(s => s.status === "valid");
  const hasIntegrity = integrity?.status === "verified";
  const isFullyLegal = hasValidSignatures && hasIntegrity && !legalHold?.isActive;
  const hasWarnings = signatures.some(s => s.status === "expired");
  const hasErrors = signatures.some(s => s.status === "revoked") || integrity?.status === "broken";
  const canDownload = signStatus === "signed" || signStatus === "fully-signed" || signStatus === "signed-our" || signStatus === "signed-counterparty";

  // Don't show for drafts
  if (document.status === "draft") return null;

  // Download handlers (demo)
  const handleDownloadSigned = () => {
    toast({ title: "Завантаження", description: "Підписаний документ (.pdf.p7s) буде завантажено" });
  };
  const handleDownloadProtocol = () => {
    toast({ title: "Завантаження", description: "Протокол підпису (.p7s) буде завантажено" });
  };

  // Build compact summary
  const summaryParts: string[] = [];
  summaryParts.push(signStatusLabels[signStatus] || "Статус невідомий");
  if (integrity) {
    summaryParts.push(integrity.status === "verified" ? "Цілісність OK" : "⚠ Цілісність");
  }
  summaryParts.push(`Зберігати ${retentionInfo.remainingText}`);

  return (
    <Card className={cn("overflow-hidden", className)} data-section="legal-signatures">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Compact Header with Summary */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <Scale className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-semibold shrink-0">Юридична сила</span>
              <div className="flex items-center gap-2 min-w-0">
                {/* Status badge */}
                {legalHold?.isActive && (
                  <Badge variant="destructive" className="text-[10px] gap-1">
                    <Lock className="w-3 h-3" />
                    Legal Hold
                  </Badge>
                )}
                {isFullyLegal && !legalHold?.isActive && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" />
                    Все OK
                  </Badge>
                )}
                {hasWarnings && !hasErrors && !isFullyLegal && (
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400">
                    Увага
                  </Badge>
                )}
                {hasErrors && (
                  <Badge variant="destructive" className="text-[10px]">
                    Проблеми
                  </Badge>
                )}
                {/* Summary text — desktop */}
                <span className="text-sm text-muted-foreground sm:inline hidden">
                  {summaryParts.join(" · ")}
                </span>
                {/* Summary text — mobile: show party counter */}
                <span className="text-xs text-muted-foreground sm:hidden inline truncate">
                  {totalParties > 0
                    ? `${validCount}/${totalParties} підписано`
                    : signStatusLabels[signStatus] || "Статус невідомий"
                  }
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-4 border-t border-border/50">
            {/* Legal Hold Alert */}
            {legalHold?.isActive && (
              <div className="p-3 rounded-md bg-red-50 border-2 border-red-300 dark:bg-red-950/30 dark:border-red-800 mt-4">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-red-700 dark:text-red-400">
                      Legal Hold активний
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                      Заборонено видаляти та редагувати
                    </p>
                    {legalHold.reason && (
                      <p className="text-xs text-muted-foreground mt-1">{legalHold.reason}</p>
                    )}
                    {legalHold.caseNumber && (
                      <p className="text-xs text-muted-foreground">Справа: {legalHold.caseNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Signatures Section */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <FileSignature className="w-3.5 h-3.5" />
                Підписи (КЕП)
                {totalParties > 0 && (
                  <Badge variant="secondary" className="text-[10px] ml-auto">
                    {validCount}/{totalParties} підписано
                  </Badge>
                )}
              </div>

              {signatures.length > 0 ? (
                <div className="space-y-2">
                  {signatures.map((sig, index) => (
                    <SignatureRow key={sig.id || index} signature={sig} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border border-dashed">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Документ ще не підписано</span>
                </div>
              )}

              {/* Download buttons */}
              {signatures.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 h-8"
                    disabled={!canDownload}
                    onClick={handleDownloadSigned}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Завантажити підписаний
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 h-8"
                    disabled={!canDownload}
                    onClick={handleDownloadProtocol}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Протокол .p7s
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Integrity Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <Shield className="w-3.5 h-3.5" />
                Цілісність документа
              </div>

              <div className={cn(
                "p-2.5 rounded-md border",
                integrity?.status === "verified" 
                  ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                  : integrity?.status === "warning"
                  ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                  : "bg-muted/50 border-border"
              )}>
                <div className="flex items-center gap-2">
                  {integrity?.status === "verified" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  {integrity?.status === "warning" && (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  {integrity?.status === "broken" && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  {!integrity && <Shield className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm">
                    {integrity?.status === "verified" && "✓ Документ не змінювався"}
                    {integrity?.status === "warning" && "⚠ Виявлено незначні зміни"}
                    {integrity?.status === "broken" && "✗ Несанкціоновані зміни"}
                    {!integrity && "Перевірка не проводилась"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Retention Section - Compact */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <Archive className="w-3.5 h-3.5" />
                Зберігання
              </div>

              <div className="p-2.5 rounded-md bg-muted/50 border">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{retentionInfo.category}</span>
                  <span className="font-medium text-xs">
                    до {format(retentionInfo.retentionUntil, "dd.MM.yyyy")}
                  </span>
                </div>
                <Progress value={retentionInfo.progress} className="h-1.5" />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{retentionInfo.basis}</span>
                  <span className="text-[10px] text-muted-foreground">{retentionInfo.remainingText}</span>
                </div>
              </div>
            </div>

            {/* Link to Tech ID section */}
            {onNavigateToTechId && (
              <Button
                variant="link"
                className="text-muted-foreground hover:text-foreground gap-1.5 p-0 h-auto text-xs mt-2"
                onClick={onNavigateToTechId}
              >
                <ExternalLink className="w-3 h-3" />
                Технічні дані та деталі підпису
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};