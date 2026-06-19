import { useState } from "react";
import { Check, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { RiskFactor } from "./RiskScoreBadge";

export interface ConfirmableRiskFactor extends RiskFactor {
  confirmed?: boolean;
  disputed?: boolean;
  disputeReason?: string;
}

interface RiskFactorConfirmationProps {
  factor: ConfirmableRiskFactor;
  onConfirm: (factorName: string) => void;
  onDispute: (factorName: string, reason: string) => void;
  compact?: boolean;
}

export const RiskFactorConfirmation = ({ 
  factor, 
  onConfirm, 
  onDispute,
  compact = false,
}: RiskFactorConfirmationProps) => {
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  
  const handleConfirm = () => {
    onConfirm(factor.name);
  };
  
  const handleDispute = () => {
    if (disputeReason.trim()) {
      onDispute(factor.name, disputeReason);
      setShowDisputeInput(false);
      setDisputeReason("");
    }
  };
  
  // Already resolved state
  if (factor.confirmed) {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
        <Check className="w-3 h-3" />
        Підтверджено
      </Badge>
    );
  }
  
  if (factor.disputed) {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
        <MessageSquare className="w-3 h-3" />
        Оскаржено
      </Badge>
    );
  }
  
  // Pending confirmation
  return (
    <div className="flex items-center gap-1">
      <Button 
        size="icon" 
        variant="ghost" 
        className={cn("text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50", compact ? "h-5 w-5" : "h-6 w-6")}
        onClick={handleConfirm}
        title="Підтвердити ризик"
      >
        <Check className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
      </Button>
      
      <Popover open={showDisputeInput} onOpenChange={setShowDisputeInput}>
        <PopoverTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost" 
            className={cn("text-red-600 hover:text-red-700 hover:bg-red-50", compact ? "h-5 w-5" : "h-6 w-6")}
            title="Оскаржити ризик"
          >
            <X className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Чому цей ризик не актуальний?</p>
            <Input
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Причина оскарження..."
              className="h-8 text-xs"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 h-7 text-xs"
                onClick={() => setShowDisputeInput(false)}
              >
                Скасувати
              </Button>
              <Button 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={handleDispute}
                disabled={!disputeReason.trim()}
              >
                Оскаржити
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Hook for managing risk factor confirmations
export const useRiskFactorConfirmations = () => {
  const [confirmations, setConfirmations] = useState<Record<string, { 
    confirmed?: boolean; 
    disputed?: boolean; 
    disputeReason?: string;
    timestamp: string;
  }>>({});
  
  const confirmFactor = (factorName: string) => {
    setConfirmations(prev => ({
      ...prev,
      [factorName]: {
        confirmed: true,
        timestamp: new Date().toISOString(),
      },
    }));
  };
  
  const disputeFactor = (factorName: string, reason: string) => {
    setConfirmations(prev => ({
      ...prev,
      [factorName]: {
        disputed: true,
        disputeReason: reason,
        timestamp: new Date().toISOString(),
      },
    }));
  };
  
  const getFactorStatus = (factorName: string) => {
    return confirmations[factorName] || { confirmed: false, disputed: false };
  };
  
  const applyConfirmationsToFactors = (factors: RiskFactor[]): ConfirmableRiskFactor[] => {
    return factors.map(factor => ({
      ...factor,
      ...getFactorStatus(factor.name),
    }));
  };
  
  return {
    confirmFactor,
    disputeFactor,
    getFactorStatus,
    applyConfirmationsToFactors,
    confirmations,
  };
};
