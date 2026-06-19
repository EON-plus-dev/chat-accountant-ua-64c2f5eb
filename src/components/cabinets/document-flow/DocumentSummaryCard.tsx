import { useState } from "react";
import { 
  Sparkles, ChevronDown, ChevronUp, Building2, User, Calendar, 
  AlertTriangle, CheckCircle2, Clock, HelpCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { DocumentSummary, ContractSummary, PartyInfo, KeyDate } from "@/types/documentSummary";
import { documentTypeConfigs } from "@/config/documentFlowConfig";

interface DocumentSummaryCardProps {
  summary: DocumentSummary | ContractSummary;
  compact?: boolean;
  className?: string;
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50";
  if (confidence >= 75) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50";
};

const getValidationIcon = (status: PartyInfo["validationStatus"]) => {
  switch (status) {
    case "valid": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    case "pending": return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    case "invalid": return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
    default: return <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />;
  }
};

const getValidationLabel = (party: PartyInfo) => {
  if (party.isKnown && party.validationStatus === "valid") return "В системі";
  if (!party.isKnown) return "Невідомий";
  if (party.validationStatus === "pending") return "Перевіряється";
  return "Помилка";
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("uk-UA", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
};

const PartyCard = ({ party, icon: Icon }: { party: PartyInfo; icon: typeof Building2 }) => (
  <Card className={cn(
    "p-3",
    !party.isKnown && "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30"
  )}>
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          {getValidationIcon(party.validationStatus)}
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {getValidationLabel(party)}
          </span>
        </div>
        <p className="font-medium text-sm truncate">{party.name}</p>
        <p className="text-xs text-muted-foreground">
          {party.code.length === 10 ? "ІПН" : "ЄДРПОУ"}: {party.code}
        </p>
      </div>
    </div>
  </Card>
);

const KeyDateItem = ({ keyDate }: { keyDate: KeyDate }) => (
  <div className={cn(
    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm",
    keyDate.isOverdue 
      ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300" 
      : "bg-muted/50"
  )}>
    <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    <span className="text-muted-foreground text-xs">{keyDate.label}:</span>
    <span className="font-medium">{formatDate(keyDate.date)}</span>
    {keyDate.daysUntil !== undefined && keyDate.daysUntil <= 30 && (
      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
        {keyDate.daysUntil} дн.
      </Badge>
    )}
  </div>
);

export function DocumentSummaryCard({ summary, compact = false, className }: DocumentSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const typeConfig = documentTypeConfigs[summary.documentType];
  
  const supplier = summary.parties.find(p => 
    ["supplier", "executor", "lessor", "seller"].includes(p.role)
  );
  const buyer = summary.parties.find(p => 
    ["buyer", "client", "lessee", "principal"].includes(p.role)
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">AI-аналіз</span>
              <Badge variant="secondary" className="text-xs">
                {typeConfig?.label || summary.documentType}
              </Badge>
            </div>
          </div>
          <Badge className={cn("text-xs", getConfidenceColor(summary.confidence))}>
            {summary.confidence}%
          </Badge>
        </div>

        {/* Short Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary.shortSummary}
        </p>

        {/* Compliance Warnings */}
        {summary.compliance.warnings && summary.compliance.warnings.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              {summary.compliance.warnings.map((warning, i) => (
                <p key={i} className="text-sm text-amber-800 dark:text-amber-200">{warning}</p>
              ))}
            </div>
          </div>
        )}

        {/* Parties */}
        {supplier && buyer && (
          <div className="grid grid-cols-2 gap-3">
            <PartyCard party={supplier} icon={Building2} />
            <PartyCard party={buyer} icon={User} />
          </div>
        )}

        {/* Financials */}
        {summary.financials && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">Сума</span>
            <div className="text-right">
              <span className="text-lg font-bold">
                {summary.financials.amount.toLocaleString("uk-UA")} {summary.financials.currency === "UAH" ? "₴" : summary.financials.currency}
              </span>
              {summary.financials.vatIncluded && (
                <p className="text-xs text-muted-foreground">в т.ч. ПДВ</p>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full gap-2">
              {isExpanded ? (
                <>Згорнути <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Детальніше <ChevronDown className="w-4 h-4" /></>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            {/* Key Dates */}
            {summary.keyDates.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Ключові дати
                </p>
                <div className="space-y-1.5">
                  {summary.keyDates.map((kd, i) => (
                    <KeyDateItem key={i} keyDate={kd} />
                  ))}
                </div>
              </div>
            )}

            {/* Key Terms */}
            {summary.keyTerms && summary.keyTerms.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Ключові умови
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {summary.keyTerms.map((term, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Full Summary */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Повний опис
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {summary.fullSummary}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
