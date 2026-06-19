import { 
  FileSignature, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Shield,
  User,
  Calendar,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { SignatureVerification, SignatureLevel } from "@/types/documentAuthenticity";
import type { SignatureStatus as DocSignatureStatus } from "@/config/documentFlowConfig";

interface HistorySignaturesBlockProps {
  documentId: string;
  signatureStatus?: DocSignatureStatus;
  signatures?: SignatureVerification[];
  requiredSignatures?: number;
  className?: string;
}

// Demo signatures generator
const generateDemoSignatures = (documentId: string, status?: DocSignatureStatus): SignatureVerification[] => {
  if (!status || status === "pending-both" || status === "not-required") {
    return [];
  }

  const baseSignatures: SignatureVerification[] = [];
  const now = new Date();

  // Our signature
  if (status === "signed-our" || status === "fully-signed") {
    baseSignatures.push({
      id: `sig-our-${documentId}`,
      signerName: "Петренко Іван Васильович",
      signerPosition: "Директор",
      signerOrganization: "ТОВ «Альфа-Сервіс»",
      signerCode: "12345678",
      signatureLevel: "QES" as SignatureLevel,
      status: "valid",
      signedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      verifiedAt: now.toISOString(),
      certificate: {
        serialNumber: "04A1B2C3D4E5F6",
        issuer: "АЦСК ДПС України",
        issuerShort: "АЦСК ДПС",
        subject: "Петренко Іван Васильович",
        subjectEDRPOU: "12345678",
        validFrom: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(now.getTime() + 185 * 24 * 60 * 60 * 1000).toISOString(),
        isQualified: true,
        algorithm: "ДСТУ 4145-2002",
        keyUsage: ["digitalSignature", "nonRepudiation"],
      },
      hashAlgorithm: "ГОСТ 34.311-95",
      signatureValue: "3082...truncated",
    });
  }

  // Counterparty signature
  if (status === "signed-counterparty" || status === "fully-signed") {
    baseSignatures.push({
      id: `sig-counter-${documentId}`,
      signerName: "Шевченко Олена Михайлівна",
      signerPosition: "Головний бухгалтер",
      signerOrganization: "ТОВ «Контрагент»",
      signerCode: "87654321",
      signatureLevel: "QES" as SignatureLevel,
      status: "valid",
      signedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      verifiedAt: now.toISOString(),
      certificate: {
        serialNumber: "04F6E5D4C3B2A1",
        issuer: "АЦСК ПАТ «ПриватБанк»",
        issuerShort: "Приват24",
        subject: "Шевченко Олена Михайлівна",
        subjectEDRPOU: "87654321",
        validFrom: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        validTo: new Date(now.getTime() + 275 * 24 * 60 * 60 * 1000).toISOString(),
        isQualified: true,
        algorithm: "ДСТУ 4145-2002",
        keyUsage: ["digitalSignature", "nonRepudiation"],
      },
      hashAlgorithm: "ГОСТ 34.311-95",
      signatureValue: "3082...truncated",
    });
  }

  return baseSignatures;
};

// Pending signers generator
const getPendingSigners = (status?: DocSignatureStatus): string[] => {
  if (!status) return ["Директор (наш підпис)", "Контрагент"];
  switch (status) {
    case "pending-both":
      return ["Директор (наш підпис)", "Контрагент"];
    case "pending-our":
      return ["Директор (наш підпис)"];
    case "pending-counterparty":
      return ["Контрагент"];
    case "signed-our":
      return ["Контрагент"];
    case "signed-counterparty":
      return ["Директор (наш підпис)"];
    default:
      return [];
  }
};

const getSignatureLevelBadge = (level: SignatureLevel) => {
  switch (level) {
    case "QES":
      return { label: "QES", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" };
    case "AES":
      return { label: "AES", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" };
    case "SES":
      return { label: "SES", color: "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400" };
    default:
      return { label: level, color: "bg-muted text-muted-foreground" };
  }
};

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

export const HistorySignaturesBlock = ({
  documentId,
  signatureStatus,
  signatures: propSignatures,
  requiredSignatures = 2,
  className,
}: HistorySignaturesBlockProps) => {
  // Use provided signatures or generate demo
  const signatures = propSignatures?.length 
    ? propSignatures 
    : generateDemoSignatures(documentId, signatureStatus);
  
  const pendingSigners = getPendingSigners(signatureStatus);
  const signedCount = signatures.length;
  const isFullySigned = signatureStatus === "fully-signed";

  return (
    <Card 
      className={cn("overflow-hidden", className)}
      data-section="document-history-signatures"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-muted-foreground" />
            Підписи та КЕП
          </CardTitle>
          <Badge 
            variant={isFullySigned ? "default" : "secondary"}
            className={cn(
              "text-xs",
              isFullySigned && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
            )}
          >
            {signedCount}/{requiredSignatures} підписано
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Signed signatures */}
        {signatures.length > 0 ? (
          <div className="space-y-3">
            {signatures.map((sig) => {
              const levelBadge = getSignatureLevelBadge(sig.signatureLevel);
              return (
                <div 
                  key={sig.id}
                  className={cn(
                    "rounded-lg border p-3",
                    sig.status === "valid" 
                      ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                      : sig.status === "expired"
                      ? "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                      : "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <SignatureStatusIcon status={sig.status} />
                      <div className="min-w-0 flex-1 space-y-1">
                        {/* Signer name */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{sig.signerName}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] px-1.5 py-0", levelBadge.color)}
                          >
                            {levelBadge.label}
                          </Badge>
                        </div>

                        {/* Position and organization */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{sig.signerPosition}</span>
                          {sig.signerOrganization && (
                            <>
                              <span>•</span>
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">{sig.signerOrganization}</span>
                            </>
                          )}
                        </div>

                        {/* Signed date */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(sig.signedAt), "dd.MM.yyyy HH:mm", { locale: uk })}</span>
                        </div>

                        {/* Certificate info */}
                        {sig.certificate && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                            <Shield className="w-3 h-3" />
                            <span>Сертифікат: {sig.certificate.issuerShort}</span>
                            <span>•</span>
                            <span>до {format(new Date(sig.certificate.validTo), "dd.MM.yyyy")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant={sig.status === "valid" ? "outline" : sig.status === "expired" ? "secondary" : "destructive"}
                            className={cn(
                              "text-[10px] cursor-help shrink-0",
                              sig.status === "valid" && "bg-emerald-100 text-emerald-700 border-emerald-200"
                            )}
                          >
                            {sig.status === "valid" ? "КЕП Дійсний" : 
                             sig.status === "expired" ? "Прострочено" : "Недійсний"}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[280px]">
                          <div className="space-y-1.5 text-xs">
                            <p>Рівень підпису: {sig.signatureLevel === "QES" ? "Кваліфікований" : sig.signatureLevel}</p>
                            {sig.certificate && (
                              <>
                                <Separator />
                                <p>Видавець: {sig.certificate.issuer}</p>
                                <p>Серійний №: {sig.certificate.serialNumber}</p>
                                <p>Дійсний до: {format(new Date(sig.certificate.validTo), "dd.MM.yyyy")}</p>
                              </>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-dashed">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Документ ще не підписано</span>
          </div>
        )}

        {/* Pending signatures */}
        {pendingSigners.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Очікується підпис:</span>
              </div>
              <div className="space-y-1.5 pl-5">
                {pendingSigners.map((signer, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{signer}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
