import React, { useMemo } from "react";
import { Scale, CheckCircle2, AlertTriangle, FileText, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import type { ContractSummary, DocumentSummary, PenaltyClause } from "@/types/documentSummary";
import { LegalAnalysisSection } from "../cards/LegalAnalysisSection";
import { RegulatoryBadges, extractRegulatoryStatus } from "../cards/RegulatoryBadges";
import type { CabinetType } from "@/types/cabinet";

// Document types that support legal analysis
const LEGAL_ANALYSIS_TYPES = [
  "contract",
  "rental-agreement",
  "supply-contract",
  "fop-service-contract",
  "service-agreement",
  "nda",
  "license-agreement",
  "framework-agreement",
];

// Helper to check if summary is a ContractSummary
function isContractSummary(summary: DocumentSummary | undefined): summary is ContractSummary {
  return !!summary && 'contract' in summary;
}

// Helper to build LegalSummary from ContractDetails
function buildLegalSummary(contract: ContractSummary['contract'] | undefined) {
  if (!contract) {
    return {
      defined: 0,
      total: 7,
      warnings: [],
      missing: [
        { section: "Штрафні санкції", key: "penalties" },
        { section: "Умови розірвання", key: "termination" },
        { section: "Вирішення спорів", key: "disputes" },
        { section: "Форс-мажор", key: "forceMajeure" },
        { section: "Обмеження відповідальності", key: "liability" },
        { section: "Конфіденційність", key: "confidentiality" },
        { section: "Застосовне право", key: "governingLaw" },
      ],
      sections: [],
    };
  }

  const sections = [
    { key: "penalties", title: "Штрафні санкції", icon: AlertTriangle, data: contract.penalties },
    { key: "termination", title: "Умови розірвання", icon: AlertTriangle, data: contract.termination },
    { key: "disputes", title: "Вирішення спорів", icon: Scale, data: contract.disputes },
    { key: "forceMajeure", title: "Форс-мажор", icon: AlertTriangle, data: contract.forceMajeure },
    { key: "liability", title: "Обмеження відповідальності", icon: Scale, data: contract.liability },
    { key: "confidentiality", title: "Конфіденційність", icon: AlertTriangle, data: contract.confidentiality },
    { key: "governingLaw", title: "Застосовне право", icon: Scale, data: contract.governingLaw },
  ];

  let defined = 0;
  const warnings: Array<{ section: string; label: string; key: string }> = [];
  const missing: Array<{ section: string; key: string }> = [];
  const sectionInfos: Array<{
    key: string;
    title: string;
    status: "missing" | "warning" | "ok";
    label?: string;
    icon: typeof AlertTriangle;
  }> = [];

  for (const section of sections) {
    const hasData = section.data !== undefined && 
      (Array.isArray(section.data) ? section.data.length > 0 : true);
    
    if (hasData) {
      defined++;
      
      // Check for warnings (high penalties)
      if (section.key === "penalties" && Array.isArray(section.data)) {
        const penaltyData = section.data as PenaltyClause[];
        const highPenalty = penaltyData.find((p) => {
          const rate = parseFloat(p.rate || "0");
          return rate >= 0.5;
        });
        if (highPenalty) {
          warnings.push({ section: section.title, label: "Підвищені штрафи", key: section.key });
          sectionInfos.push({ ...section, status: "warning", label: "Підвищені штрафи" });
        } else {
          sectionInfos.push({ ...section, status: "ok" });
        }
      } else {
        sectionInfos.push({ ...section, status: "ok" });
      }
    } else {
      missing.push({ section: section.title, key: section.key });
      sectionInfos.push({ ...section, status: "missing" });
    }
  }

  return {
    defined,
    total: 7,
    warnings,
    missing,
    sections: sectionInfos,
  };
}

interface DocumentLegalTabProps {
  document: FlowDocument;
  summary?: DocumentSummary;
  cabinetType: CabinetType;
  cabinetTaxId?: string;
  className?: string;
}

export const DocumentLegalTab: React.FC<DocumentLegalTabProps> = ({
  document,
  summary,
  cabinetType,
  cabinetTaxId,
  className,
}) => {
  // Check if document type supports legal analysis
  const supportsLegalAnalysis = useMemo(() => {
    return LEGAL_ANALYSIS_TYPES.includes(document.type);
  }, [document.type]);

  // Get contract data if available
  const contractData = useMemo(() => {
    if (isContractSummary(summary)) {
      return summary.contract;
    }
    return undefined;
  }, [summary]);

  // Build legal summary from contract data
  const legalSummary = useMemo(() => {
    return buildLegalSummary(contractData);
  }, [contractData]);

  // Get regulatory status
  const regulatoryStatus = useMemo(() => {
    return extractRegulatoryStatus(
      cabinetType,
      cabinetTaxId,
      summary?.compliance
    );
  }, [cabinetType, cabinetTaxId, summary?.compliance]);

  // If document doesn't support legal analysis
  if (!supportsLegalAnalysis) {
    return (
      <div className={cn("space-y-6", className)}>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Цей тип документа ({document.type}) не потребує детального юридичного аналізу. 
            Юридичний аналіз доступний для договорів та угод.
          </AlertDescription>
        </Alert>

        {/* Still show regulatory status if available */}
        {(regulatoryStatus.kved || regulatoryStatus.license || regulatoryStatus.taxRegime) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="w-4 h-4 text-primary" />
                Регуляторний статус
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegulatoryBadges status={regulatoryStatus} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="w-4 h-4 text-primary" />
            Огляд юридичного аналізу
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Defined sections */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                legalSummary.defined === legalSummary.total 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-muted text-muted-foreground"
              )}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {legalSummary.defined}/{legalSummary.total} секцій
                </p>
                <p className="text-xs text-muted-foreground">Визначено в документі</p>
              </div>
            </div>

            <Separator orientation="vertical" className="h-10 hidden sm:block" />

            {/* Warnings */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                legalSummary.warnings.length > 0 
                  ? "bg-amber-100 text-amber-700" 
                  : "bg-emerald-100 text-emerald-700"
              )}>
                {legalSummary.warnings.length > 0 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {legalSummary.warnings.length > 0 ? `${legalSummary.warnings.length} попередження` : "Все в нормі"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {legalSummary.warnings.length > 0 ? "Потребує уваги" : "Стандартні умови"}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="ml-auto flex items-center">
              <Badge 
                variant={legalSummary.warnings.length > 0 ? "outline" : "secondary"}
                className={cn(
                  legalSummary.warnings.length > 0 
                    ? "border-amber-500 text-amber-700 bg-amber-50" 
                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                )}
              >
                {legalSummary.warnings.length > 0 ? "Перегляньте умови" : "Стандартний договір"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Legal Analysis Section */}
      <LegalAnalysisSection
        legalSummary={legalSummary}
        contractData={contractData || null}
        autoExpandedSections={legalSummary.warnings.length > 0 ? ["penalties", "termination"] : []}
      />

      {/* Regulatory Status Card */}
      {(regulatoryStatus.kved || regulatoryStatus.license || regulatoryStatus.taxRegime) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="w-4 h-4 text-primary" />
              Регуляторний статус
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Відповідність нормативним вимогам для вашого кабінету
            </p>
          </CardHeader>
          <CardContent>
            <RegulatoryBadges status={regulatoryStatus} />
          </CardContent>
        </Card>
      )}

      {/* Compliance Warnings */}
      {summary?.compliance?.warnings && summary.compliance.warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              Попередження щодо відповідності
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.compliance.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="text-amber-600 mt-0.5">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};