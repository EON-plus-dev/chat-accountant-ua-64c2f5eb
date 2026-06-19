import { FileText, Clock, RefreshCw, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { prolongationTypeLabels } from "@/config/settingsConfig";
import type { ResolvedProlongation } from "@/config/settingsConfig";

interface DocumentTermsSectionProps {
  keyTerms: string[];
  prolongation?: ResolvedProlongation | null;
  paymentTerms?: string;
  duration?: string;
  className?: string;
}

export const DocumentTermsSection = ({
  keyTerms,
  prolongation,
  paymentTerms,
  duration,
  className,
}: DocumentTermsSectionProps) => {
  // Don't show if nothing to display
  if (keyTerms.length === 0 && !prolongation && !paymentTerms && !duration) {
    return null;
  }

  // Extract common terms from keyTerms array
  const parsedTerms = {
    duration: duration || keyTerms.find(t => t.toLowerCase().includes("термін") || t.toLowerCase().includes("місяц")),
    payment: paymentTerms || keyTerms.find(t => t.toLowerCase().includes("оплата") || t.toLowerCase().includes("грн")),
    penalty: keyTerms.find(t => t.toLowerCase().includes("штраф") || t.toLowerCase().includes("%")),
    notice: keyTerms.find(t => t.toLowerCase().includes("розірван") || t.toLowerCase().includes("повідомлен")),
  };

  return (
    <div className={cn("rounded-lg border bg-card p-3", className)}>
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-sm">Умови</span>
      </div>

      <div className="space-y-1.5 text-sm">
        {/* Compact terms row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          {parsedTerms.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {parsedTerms.duration}
            </span>
          )}
          {parsedTerms.payment && (
            <span>•</span>
          )}
          {parsedTerms.payment && (
            <span>{parsedTerms.payment}</span>
          )}
        </div>

        {/* Prolongation */}
        {prolongation && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <RefreshCw className="w-3 h-3" />
            <span>
              Пролонгація: {prolongationTypeLabels[prolongation.type]}
              {prolongation.noticePeriodDays && (
                <span className="ml-1">(попередити за {prolongation.noticePeriodDays} днів)</span>
              )}
            </span>
          </div>
        )}

        {/* Reminder date if exists */}
        {prolongation?.reminderDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Нагадування: {prolongation.reminderDate}</span>
          </div>
        )}

        {/* Other key terms as badges */}
        {keyTerms.filter(t => 
          !parsedTerms.duration?.includes(t) && 
          !parsedTerms.payment?.includes(t)
        ).slice(0, 3).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {keyTerms.filter(t => 
              !parsedTerms.duration?.includes(t) && 
              !parsedTerms.payment?.includes(t)
            ).slice(0, 3).map((term, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal">
                {term}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
