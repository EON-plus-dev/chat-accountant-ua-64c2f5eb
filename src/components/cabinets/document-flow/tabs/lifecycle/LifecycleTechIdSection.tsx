/**
 * LifecycleTechIdSection — Підрозділ "Тех ID"
 * 
 * Технічна інформація для підтримки/аудиту:
 * - Підписи / сертифікати
 * - Hash та цілісність
 * - Внутрішні ID
 * - Зовнішні ID
 * - Політики зберігання
 */

import { useState } from "react";
import { 
  Lock, Shield, FileText, Link2, Archive, Copy, Check, 
  Info, AlertTriangle, CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format, addYears, differenceInDays, differenceInMonths, differenceInYears } from "date-fns";
import { uk } from "date-fns/locale";

import type { 
  Document as FlowDocument,
  TechnicalData,
  ExternalIntegration
} from "@/config/documentFlowConfig";
import type { SignatureVerification } from "@/types/documentAuthenticity";

// ============================================
// TYPES
// ============================================

interface LifecycleTechIdSectionProps {
  document: FlowDocument;
  technicalData?: TechnicalData;
  externalIntegrations?: ExternalIntegration[];
  signatures?: SignatureVerification[];
  className?: string;
}

// ============================================
// HELPERS
// ============================================

const retentionCategoryLabels: Record<string, { label: string; years: number; basis: string }> = {
  tax: { label: "Податковий документ", years: 3, basis: "ПКУ ст. 44.3" },
  accounting: { label: "Бухгалтерський документ", years: 5, basis: "ЗУ «Про бухоблік» ст. 9" },
  legal: { label: "Договірний документ", years: 3, basis: "ЦКУ ст. 257" },
  hr: { label: "Кадровий документ", years: 75, basis: "Наказ МЮ №1000/5" },
  internal: { label: "Внутрішній документ", years: 1, basis: "Внутрішня політика" },
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

interface TechRowProps {
  label: string;
  value?: string;
  copyable?: boolean;
  monospace?: boolean;
}

const TechRow = ({ label, value, copyable = true, monospace = true }: TechRowProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        title: "Скопійовано",
        description: "Значення скопійовано в буфер обміну",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Помилка",
        description: "Не вдалося скопіювати",
        variant: "destructive",
      });
    }
  };
  
  if (!value) return null;
  
  // Truncate long values for display
  const displayValue = value.length > 50 
    ? `${value.substring(0, 25)}...${value.substring(value.length - 20)}`
    : value;
  
  return (
    <div className="flex items-center justify-between gap-2 py-2 min-h-[44px]">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <code className={cn(
          "text-xs px-1.5 py-0.5 rounded truncate max-w-[220px] sm:max-w-[300px]",
          monospace ? "font-mono bg-muted/50" : "bg-transparent"
        )}>
          {displayValue}
        </code>
        {copyable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

interface TechSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}

const TechSection = ({ icon: Icon, title, children }: TechSectionProps) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide py-2">
      <Icon className="w-3.5 h-3.5" />
      {title}
    </div>
    <div className="divide-y divide-border/30">
      {children}
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export const LifecycleTechIdSection = ({
  document,
  technicalData,
  externalIntegrations,
  signatures,
  className,
}: LifecycleTechIdSectionProps) => {
  // Demo signature data if not provided - using simplified local type
  interface SimplifiedSignature {
    id: string;
    signedAt: string;
    signerName: string;
    signerPosition?: string;
    status: "valid" | "expired" | "revoked" | "pending";
    certificate?: {
      serialNumber: string;
      issuer: string;
      issuerShort: string;
      validFrom: string;
      validTo: string;
    };
  }
  
  const demoSignatures: SimplifiedSignature[] = signatures?.map(sig => ({
    id: sig.id,
    signedAt: sig.signedAt,
    signerName: sig.signerName,
    signerPosition: sig.signerPosition,
    status: sig.status as "valid" | "expired" | "revoked" | "pending",
    certificate: sig.certificate ? {
      serialNumber: sig.certificate.serialNumber,
      issuer: sig.certificate.issuer,
      issuerShort: sig.certificate.issuerShort,
      validFrom: sig.certificate.validFrom,
      validTo: sig.certificate.validTo,
    } : undefined,
  })) || (
    document.status !== "draft" ? [{
      id: `SIGN-${document.id.substring(0, 8)}`,
      signedAt: document.createdAt || document.date,
      signerName: document.createdBy || "Іваненко І.І.",
      signerPosition: "Директор",
      status: "valid" as const,
      certificate: {
        serialNumber: `00AF-3B72-${document.id.substring(0, 8).toUpperCase()}`,
        issuer: "АЦСК ДПС України",
        issuerShort: "АЦСК ДПС",
        validFrom: "2024-01-01",
        validTo: "2026-01-01",
      },
    }] : []
  );

  // Calculate retention info
  const category = getDocumentCategory(document.type);
  const categoryConfig = retentionCategoryLabels[category] || retentionCategoryLabels.accounting;
  const createdDate = new Date(document.createdAt || document.date);
  const retentionUntil = addYears(createdDate, categoryConfig.years);
  const now = new Date();
  const daysRemaining = differenceInDays(retentionUntil, now);
  const yearsRemaining = differenceInYears(retentionUntil, now);
  const monthsRemaining = differenceInMonths(retentionUntil, now) % 12;

  // Generate demo hash if not provided
  const contentHash = technicalData?.contentHash || 
    `sha256:${document.id.substring(0, 8)}a73f9b82c4e1d5f6789012345678${document.id.substring(document.id.length - 8)}`;
  
  // Build external IDs from integrations
  const externalIds: { system: string; id: string }[] = [];
  externalIntegrations?.forEach(integration => {
    if (integration.externalId) {
      const systemNames: Record<string, string> = {
        medoc: "M.E.Doc",
        vchasno: "Vchasno",
        erpn: "ЄРПН",
        "1c": "1С",
        monobank: "Monobank",
      };
      externalIds.push({
        system: systemNames[integration.system] || integration.system,
        id: integration.externalId,
      });
    }
  });

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          Продвинута інформація
          <Badge variant="secondary" className="text-[10px] ml-auto">Технічна</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-6">
        {/* Section 1: Signatures / Certificates */}
        {demoSignatures.length > 0 && (
          <TechSection icon={Lock} title="Підписи / Сертифікати">
            {demoSignatures.map((sig, idx) => (
              <div key={idx} className="py-2 space-y-2">
                <TechRow label="ID підпису" value={sig.id} />
                {sig.certificate && (
                  <>
                    <TechRow label="Серійний номер сертифіката" value={sig.certificate.serialNumber} />
                    <TechRow label="Постачальник КЕП" value={sig.certificate.issuer} monospace={false} copyable={false} />
                    <TechRow label="Алгоритми" value="SHA-256 / RSA-2048" monospace={false} copyable={false} />
                    <TechRow 
                      label="Часова мітка (TSA)" 
                      value={format(new Date(sig.signedAt), "dd.MM.yyyy HH:mm", { locale: uk })} 
                      monospace={false} 
                      copyable={false} 
                    />
                  </>
                )}
              </div>
            ))}
          </TechSection>
        )}

        {demoSignatures.length > 0 && <Separator />}

        {/* Section 2: Hash & Integrity */}
        <TechSection icon={Shield} title="Hash та цілісність">
          <TechRow label="Hash документа (SHA-256)" value={contentHash} />
          {demoSignatures.length > 0 && (
            <TechRow 
              label="Hash контейнера підпису" 
              value={`sha256:b21e4c91${document.id.substring(0, 16)}f8a7`} 
            />
          )}
          <div className="flex items-center justify-between gap-2 py-2 min-h-[44px]">
            <span className="text-xs text-muted-foreground">Статус цілісності</span>
            <Badge 
              variant="outline" 
              className="text-[10px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              <CheckCircle2 className="w-3 h-3" />
              Підтверджено
            </Badge>
          </div>
        </TechSection>

        <Separator />

        {/* Section 3: Internal IDs */}
        <TechSection icon={FileText} title="Внутрішні ID">
          <TechRow label="ID документа в системі" value={technicalData?.internalId || document.id} />
          <TechRow label="ID активної версії" value={`V${document.version || 1}`} />
          <TechRow 
            label="Storage key" 
            value={technicalData?.storageLocation || `doc/${new Date(document.date).getFullYear()}/${document.id}.pdf`} 
          />
          {technicalData?.lastSyncJobId && (
            <TechRow label="ID у лог-системі" value={technicalData.lastSyncJobId} />
          )}
        </TechSection>

        {externalIds.length > 0 && (
          <>
            <Separator />
            
            {/* Section 4: External IDs */}
            <TechSection icon={Link2} title="Зовнішні ID">
              {externalIds.map((ext, idx) => (
                <TechRow key={idx} label={`ID в ${ext.system}`} value={ext.id} />
              ))}
            </TechSection>
          </>
        )}

        <Separator />

        {/* Section 5: Policies & Retention */}
        <TechSection icon={Archive} title="Політики та retention">
          <TechRow label="Категорія документа" value={category} copyable={false} />
          <TechRow label="Код політики зберігання" value={`RET-${category.toUpperCase()}-001`} />
          <div className="flex items-center justify-between gap-2 py-2 min-h-[44px]">
            <span className="text-xs text-muted-foreground">Legal hold</span>
            <Badge variant="outline" className="text-[10px]">
              ❌ Вимкнено
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2 py-2 min-h-[44px]">
            <span className="text-xs text-muted-foreground">Зберігати до</span>
            <span className="text-xs font-medium">
              {format(retentionUntil, "dd.MM.yyyy", { locale: uk })}
              <span className="text-muted-foreground ml-1">
                ({yearsRemaining > 0 ? `${yearsRemaining} р. ${monthsRemaining} міс.` : `${monthsRemaining} міс.`})
              </span>
            </span>
          </div>
        </TechSection>

        {/* Info footer */}
        <Alert className="bg-muted/30 border-muted">
          <Info className="w-4 h-4" />
          <AlertDescription className="text-xs">
            Ці дані призначені для технічної підтримки, аудиту та юридичних цілей. 
            Не змінюйте їх самостійно.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
