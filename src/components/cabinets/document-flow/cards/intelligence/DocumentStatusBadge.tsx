import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  FileSignature,
  ChevronDown,
  ChevronUp,
  Lock,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

export interface SignatureInfo {
  name: string;
  position?: string;
  date: string;
  isValid: boolean;
}

export interface DocumentStatusBadgeProps {
  signaturesCount: number;
  requiredSignatures: number;
  signatures?: SignatureInfo[];
  isIntegrityVerified: boolean;
  hasLegalHold?: boolean;
  legalHoldReason?: string;
  className?: string;
}

export const DocumentStatusBadge = ({
  signaturesCount,
  requiredSignatures,
  signatures = [],
  isIntegrityVerified,
  hasLegalHold = false,
  legalHoldReason,
  className,
}: DocumentStatusBadgeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const allSigned = signaturesCount >= requiredSignatures && requiredSignatures > 0;
  const isFullyLegal = allSigned && isIntegrityVerified && !hasLegalHold;

  // Simple status text
  const getSignatureStatus = () => {
    if (signaturesCount === 0) {
      return { text: "Очікує підпису", icon: Clock, color: "text-muted-foreground" };
    }
    if (allSigned) {
      return { text: `Підписано (${signaturesCount}/${requiredSignatures})`, icon: CheckCircle2, color: "text-emerald-600" };
    }
    return { text: `${signaturesCount}/${requiredSignatures} підпис(ів)`, icon: Clock, color: "text-amber-600" };
  };

  const signatureStatus = getSignatureStatus();
  const SignatureIcon = signatureStatus.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className={className}>
      <div className={cn(
        "rounded-lg border",
        isFullyLegal 
          ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" 
          : hasLegalHold
          ? "bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          : "bg-card"
      )}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full p-3 hover:bg-accent/30 transition-colors rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className={cn(
                "w-4 h-4",
                isFullyLegal ? "text-emerald-500" : hasLegalHold ? "text-red-500" : "text-muted-foreground"
              )} />
              <span className="font-medium text-sm">Юридичний статус</span>
              {isFullyLegal && (
                <Badge variant="outline" className="text-[10px] bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                  ✓ Підтверджено
                </Badge>
              )}
              {hasLegalHold && (
                <Badge variant="destructive" className="text-[10px]">
                  <Lock className="w-3 h-3 mr-1" />
                  Legal Hold
                </Badge>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {/* Signatures - Human Language */}
            <div className="flex items-center gap-2 py-1.5">
              <SignatureIcon className={cn("w-4 h-4", signatureStatus.color)} />
              <span className={cn("text-sm", signatureStatus.color)}>
                Підписи: {signatureStatus.text}
              </span>
              {signatures.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Info className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[280px]">
                      <div className="space-y-1.5 text-xs">
                        <p className="font-medium">Підписанти:</p>
                        {signatures.map((sig, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            {sig.isValid ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5" />
                            )}
                            <div>
                              <p className="font-medium">{sig.name}</p>
                              {sig.position && <p className="text-muted-foreground">{sig.position}</p>}
                              <p className="text-muted-foreground">
                                {format(new Date(sig.date), "dd.MM.yyyy HH:mm", { locale: uk })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Integrity - Human Language */}
            <div className="flex items-center gap-2 py-1.5">
              {isIntegrityVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-600">Цілісність: Документ не змінювався</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-600">Цілісність: Потребує перевірки</span>
                </>
              )}
            </div>

            {/* Legal Hold Warning */}
            {hasLegalHold && (
              <div className="p-2 rounded-md bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Документ заблоковано</span>
                </div>
                {legalHoldReason && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{legalHoldReason}</p>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
