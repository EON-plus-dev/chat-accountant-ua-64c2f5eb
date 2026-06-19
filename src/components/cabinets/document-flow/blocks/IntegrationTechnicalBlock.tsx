/**
 * IntegrationTechnicalBlock — Блок 5: "Технічні дані" (згорнутий)
 * Показує технічну інформацію для підтримки
 */

import { useState } from "react";
import { 
  Wrench, ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { TechnicalData } from "@/config/documentFlowConfig";

interface IntegrationTechnicalBlockProps {
  technicalData?: TechnicalData;
  documentId: string;
  className?: string;
}

interface TechnicalRowProps {
  label: string;
  value?: string;
}

const TechnicalRow = ({ label, value }: TechnicalRowProps) => {
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
  const displayValue = value.length > 40 
    ? `${value.substring(0, 20)}...${value.substring(value.length - 15)}`
    : value;
  
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <code className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded truncate max-w-[200px]">
          {displayValue}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-600" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
    </div>
  );
};

export const IntegrationTechnicalBlock = ({
  technicalData,
  documentId,
  className,
}: IntegrationTechnicalBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use provided technical data or create minimal fallback
  const data: TechnicalData = technicalData || {
    internalId: documentId,
  };

  return (
    <Card className={cn("border-border/50", className)} data-section="document-integration-technical">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-0">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
            >
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                Технічні дані
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{isOpen ? "Приховати" : "Показати деталі"}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-4">
            <div className="space-y-1 divide-y divide-border/30">
              <TechnicalRow 
                label="ID документа в системі" 
                value={data.internalId} 
              />
              <TechnicalRow 
                label="ID у зовнішній системі" 
                value={data.externalDocumentId} 
              />
              <TechnicalRow 
                label="ID повідомлення ЕДО" 
                value={data.externalMessageId} 
              />
              <TechnicalRow 
                label="Hash контенту" 
                value={data.contentHash} 
              />
              <TechnicalRow 
                label="Сховище" 
                value={data.storageLocation} 
              />
              <TechnicalRow 
                label="ID синхронізації" 
                value={data.lastSyncJobId} 
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
