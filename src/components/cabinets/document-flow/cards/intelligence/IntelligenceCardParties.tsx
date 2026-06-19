import { Building2, User, CheckCircle2, Clock, AlertTriangle, HelpCircle, ChevronRight, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDocumentChat } from "@/contexts/DocumentChatContext";
import type { PartyInfo } from "@/types/documentSummary";
import type { IntelligenceCardPartiesProps } from "./types";
import { roleLabels } from "./types";

// Get validation icon for party (external contractors only)
const getValidationIcon = (status?: PartyInfo["validationStatus"]) => {
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

// Party Card component with Chat integration
const PartyCard = ({ 
  party, 
  icon: Icon, 
  onNavigate,
}: { 
  party: PartyInfo; 
  icon: typeof Building2;
  onNavigate?: (code: string) => void;
}) => {
  // Safe hook call - may be null if context not provided
  let sendCommand: ((cmd: any) => void) | undefined;
  try {
    const chatContext = useDocumentChat();
    sendCommand = chatContext?.sendCommand;
  } catch {
    // Context not available - that's ok
  }

  const handleCheckContractor = () => {
    if (party.code && sendCommand) {
      sendCommand({
        type: 'check_contractor',
        contractorCode: party.code,
        contractorName: party.name,
      });
    }
  };

  // Cabinet owner: simplified display without contractor actions
  if (party.isCabinetOwner) {
    return (
      <Card className="p-3 border-primary/30 bg-primary/5">
        <div className="flex items-start gap-2">
          <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
                Ви
              </Badge>
            </div>
            <p className="font-medium text-sm truncate">{party.name}</p>
            <p className="text-xs text-muted-foreground">
              {roleLabels[party.role] || party.role}
              {party.code && ` · ${party.code.length === 10 ? "ІПН" : "ЄДРПОУ"}: ${party.code}`}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // External contractor: full display with validation and actions
  return (
    <Card className={cn(
      "p-3",
      !party.isKnown && "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30",
      party.validationStatus === "pending" && party.isKnown && "border-amber-200 dark:border-amber-800"
    )}>
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            {getValidationIcon(party.validationStatus)}
            {(!party.isKnown || party.validationStatus !== "valid") && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {getValidationLabel(party)}
              </span>
            )}
          </div>
          <p className="font-medium text-sm truncate">{party.name}</p>
          <p className="text-xs text-muted-foreground">
            {roleLabels[party.role] || party.role}
            {party.code && ` · ${party.code.length === 10 ? "ІПН" : "ЄДРПОУ"}: ${party.code}`}
          </p>
          
          {/* Combined action: single button for contractor navigation or registry check */}
          <div className="flex items-center gap-2 mt-1.5">
            {party.code && onNavigate && party.validationStatus === "valid" && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => onNavigate(party.code!)}
              >
                <ChevronRight className="w-3 h-3 mr-0.5" />
                Картка контрагента
              </Button>
            )}
            {/* For unknown/pending contractors: check in registry */}
            {party.code && sendCommand && party.validationStatus !== "valid" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 gap-1"
                onClick={handleCheckContractor}
              >
                <ExternalLink className="w-3 h-3" />
                Перевірити в реєстрах
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const IntelligenceCardParties = ({
  supplier,
  buyer,
  documentType,
  onNavigateToContractor,
}: IntelligenceCardPartiesProps) => {
  // Hide for certain document types
  if (["prro-receipt", "bank-statement"].includes(documentType || "")) {
    return null;
  }
  
  if (!supplier && !buyer) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        Сторони
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {supplier && (
          <PartyCard 
            party={supplier} 
            icon={Building2} 
            onNavigate={onNavigateToContractor}
          />
        )}
        {buyer && (
          <PartyCard 
            party={buyer} 
            icon={Building2} 
            onNavigate={onNavigateToContractor}
          />
        )}
      </div>
    </div>
  );
};
