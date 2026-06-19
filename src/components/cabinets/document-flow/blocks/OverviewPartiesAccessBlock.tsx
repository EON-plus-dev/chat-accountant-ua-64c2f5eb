/**
 * OverviewPartiesAccessBlock — Блок "Сторони та доступ"
 * Відображає сторони документа та їх системний доступ
 */

import { Users, Building2, User, Shield, ExternalLink, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Document as FlowDocument, DocumentParty, DocumentContractor } from "@/config/documentFlowConfig";

interface OverviewPartiesAccessBlockProps {
  document: FlowDocument;
  parties?: DocumentParty[];
  contractor?: DocumentContractor;
  onNavigateToContractor?: (code: string) => void;
  className?: string;
}

// Demo access data
interface AccessUser {
  id: string;
  name: string;
  role: string;
  accessLevel: "full" | "edit" | "view" | "none";
}

const demoAccessUsers: AccessUser[] = [
  { id: "1", name: "Власник", role: "owner", accessLevel: "full" },
  { id: "2", name: "Бухгалтер", role: "accountant", accessLevel: "edit" },
  { id: "3", name: "Юрист", role: "lawyer", accessLevel: "view" },
];

const accessLevelLabels: Record<string, string> = {
  full: "Повний доступ",
  edit: "Редагування",
  view: "Перегляд",
  none: "Без доступу",
};

interface PartyCardProps {
  name: string;
  role: string;
  code?: string;
  isOwner?: boolean;
  isVerified?: boolean;
  onNavigate?: () => void;
}

const PartyCard = ({ name, role, code, isOwner, isVerified, onNavigate }: PartyCardProps) => (
  <div className={cn(
    "p-3 rounded-lg border bg-card",
    isOwner && "border-primary/30 bg-primary/5"
  )}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isOwner ? (
            <User className="w-4 h-4 text-primary shrink-0" />
          ) : (
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <span className="font-medium text-sm truncate">{name}</span>
          {isOwner && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">
              Ви
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
        {code && (
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {code.length === 10 ? "ІПН" : "ЄДРПОУ"}: {code}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {isVerified && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        )}
        {onNavigate && !isOwner && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={onNavigate}
            data-action="navigate-contractor"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  </div>
);

export const OverviewPartiesAccessBlock = ({
  document,
  parties,
  contractor,
  onNavigateToContractor,
  className,
}: OverviewPartiesAccessBlockProps) => {
  // Build parties list from either new parties array or legacy contractor
  const displayParties: Array<{
    name: string;
    role: string;
    code?: string;
    isOwner: boolean;
    isVerified: boolean;
  }> = [];

  if (parties && parties.length > 0) {
    parties.forEach(party => {
      displayParties.push({
        name: party.name,
        role: party.semanticRole || (party.isCabinetOwner ? "Наша сторона" : "Контрагент"),
        code: party.code,
        isOwner: party.isCabinetOwner,
        isVerified: party.isVerified,
      });
    });
  } else {
    // Legacy: use cabinetName and contractor
    if (document.cabinetName) {
      displayParties.push({
        name: document.cabinetName,
        role: "Наша сторона",
        isOwner: true,
        isVerified: true,
      });
    }
    
    if (contractor) {
      displayParties.push({
        name: contractor.name,
        role: "Контрагент",
        code: contractor.code,
        isOwner: false,
        isVerified: contractor.validationStatus === "valid",
      });
    }
  }

  if (displayParties.length === 0) {
    return null;
  }

  // Check if contractor has system access (demo)
  const contractorHasAccess = false;

  return (
    <Card className={cn("overflow-hidden", className)} data-section="parties-access">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Сторони та доступ
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayParties.map((party, index) => (
            <PartyCard
              key={index}
              name={party.name}
              role={party.role}
              code={party.code}
              isOwner={party.isOwner}
              isVerified={party.isVerified}
              onNavigate={
                !party.isOwner && party.code && onNavigateToContractor
                  ? () => onNavigateToContractor(party.code!)
                  : undefined
              }
            />
          ))}
        </div>
        
        {/* System Access (Demo) */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Доступ у системі
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {demoAccessUsers.map(user => (
              <Badge
                key={user.id}
                variant="outline"
                className="text-xs px-2 py-0.5 font-normal"
              >
                {user.name} · {accessLevelLabels[user.accessLevel]}
              </Badge>
            ))}
            
            {contractor && (
              <Badge
                variant={contractorHasAccess ? "default" : "secondary"}
                className="text-xs px-2 py-0.5 font-normal"
              >
                {contractor.name.split(" ")[0]} · {contractorHasAccess ? "Підключений як партнер" : "Без доступу"}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
