import { useState } from "react";
import {
  AlertTriangle, XCircle, Scale, Shield, Lock, Gavel,
  CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ContractSummary } from "@/types/documentSummary";

// Legal sections configuration
const legalSectionsConfig = [
  { key: "penalties", title: "Штрафні санкції", icon: AlertTriangle },
  { key: "termination", title: "Умови розірвання", icon: XCircle },
  { key: "disputes", title: "Вирішення спорів", icon: Scale },
  { key: "forceMajeure", title: "Форс-мажор", icon: Shield },
  { key: "liability", title: "Обмеження відповідальності", icon: Scale },
  { key: "confidentiality", title: "Конфіденційність", icon: Lock },
  { key: "governingLaw", title: "Застосовне право", icon: Gavel },
];

type SectionStatus = "missing" | "warning" | "ok";

interface SectionInfo {
  key: string;
  title: string;
  status: SectionStatus;
  label?: string;
  icon: typeof AlertTriangle;
}

interface LegalSummary {
  defined: number;
  total: number;
  warnings: Array<{ section: string; label: string; key: string }>;
  missing: Array<{ section: string; key: string }>;
  sections: SectionInfo[];
}

// Helper constants for legal clause labels
const penaltyTypeLabels: Record<string, string> = {
  "late-payment": "Прострочення оплати",
  "non-delivery": "Невиконання поставки",
  "quality": "Порушення якості",
  "other": "Інші порушення",
};

const disputeMethodLabels: Record<string, string> = {
  court: "Судовий порядок",
  arbitration: "Арбітраж",
  mediation: "Медіація",
  negotiation: "Переговори",
};

interface LegalAnalysisSectionProps {
  legalSummary: LegalSummary;
  contractData: ContractSummary["contract"] | null;
  autoExpandedSections: string[];
}

export const LegalAnalysisSection = ({
  legalSummary,
  contractData,
  autoExpandedSections,
}: LegalAnalysisSectionProps) => {
  const allLegalSectionKeys = legalSectionsConfig.map(s => s.key);
  const [expandedSections, setExpandedSections] = useState<string[]>(autoExpandedSections);
  
  const allExpanded = expandedSections.length === allLegalSectionKeys.length;

  const toggleAllSections = () => {
    if (allExpanded) {
      setExpandedSections([]);
    } else {
      setExpandedSections(allLegalSectionKeys);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          Юридичний аналіз
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          onClick={toggleAllSections}
        >
          {allExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Згорнути
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Розгорнути
            </>
          )}
        </Button>
      </div>

      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="space-y-1"
      >
        {legalSummary.sections.map(section => {
          const SectionIcon = section.icon;
          return (
            <AccordionItem
              key={section.key}
              value={section.key}
              className="border rounded-lg px-3 py-0 data-[state=open]:bg-muted/30"
            >
              <AccordionTrigger className="py-2.5 hover:no-underline">
                <div className="flex items-center gap-2 flex-1 text-left">
                  <SectionIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-normal">{section.title}</span>
                  {section.status === "warning" && section.label && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400 ml-auto mr-2"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {section.label}
                    </Badge>
                  )}
                  {section.status === "ok" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto mr-2" />
                  )}
                  {section.status === "missing" && (
                    <span className="text-xs text-muted-foreground italic ml-auto mr-2">
                      не визначено
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3 pt-0">
                {/* Section-specific content */}
                {section.key === "penalties" && contractData?.penalties && contractData.penalties.length > 0 && (
                  <div className="space-y-2 text-sm">
                    {section.status === "warning" && (
                      <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 text-xs">
                        ⚠ Підвищений ризик: Ставка штрафу за прострочення оплати ≥0.5% за день перевищує типові ринкові умови
                      </div>
                    )}
                    {contractData.penalties.map((p, i) => (
                      <div key={i} className="flex justify-between text-muted-foreground">
                        <span>• {penaltyTypeLabels[p.type] || p.type}</span>
                        <span className="font-medium text-foreground">{p.rate}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.key === "termination" && contractData?.termination && (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Термін повідомлення:</span>
                      <span>{contractData.termination.noticePeriod} днів</span>
                    </div>
                    {contractData.termination.grounds && contractData.termination.grounds.length > 0 && (
                      <div className="pt-1">
                        <span className="text-muted-foreground text-xs">Підстави:</span>
                        <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                          {contractData.termination.grounds.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {section.key === "disputes" && contractData?.disputes && (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Метод:</span>
                      <span>{disputeMethodLabels[contractData.disputes.method] || contractData.disputes.method}</span>
                    </div>
                    {contractData.disputes.jurisdiction && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Юрисдикція:</span>
                        <span>{contractData.disputes.jurisdiction}</span>
                      </div>
                    )}
                  </div>
                )}

                {section.key === "forceMajeure" && contractData?.forceMajeure && contractData.forceMajeure.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground text-xs">Включено:</span>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                      {contractData.forceMajeure.map((fm, i) => (
                        <li key={i}>{fm}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.key === "liability" && contractData?.liability && (
                  <div className="space-y-1.5 text-sm">
                    {contractData.liability.maxAmount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Максимальна відповідальність:</span>
                        <span>{contractData.liability.maxAmount}</span>
                      </div>
                    )}
                    {contractData.liability.exclusions && contractData.liability.exclusions.length > 0 && (
                      <div className="pt-1">
                        <span className="text-muted-foreground text-xs">Виключення:</span>
                        <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                          {contractData.liability.exclusions.map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {section.key === "confidentiality" && contractData?.confidentiality && (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Термін дії:</span>
                      <span>{contractData.confidentiality.duration}</span>
                    </div>
                    {contractData.confidentiality.scope && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Обсяг:</span>
                        <span>{contractData.confidentiality.scope}</span>
                      </div>
                    )}
                  </div>
                )}

                {section.key === "governingLaw" && contractData?.governingLaw && (
                  <p className="text-sm">{contractData.governingLaw}</p>
                )}

                {section.status === "missing" && (
                  <p className="text-xs text-muted-foreground italic">
                    Ця секція не визначена в договорі. Рекомендовано уточнити умови з контрагентом.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
