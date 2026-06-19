import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, FileSearch, Building2, CreditCard, Calendar 
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { FieldConfidenceBreakdown } from './cards/FieldConfidenceBreakdown';
import type { DocumentSummary, ContractSummary, FieldConfidence } from '@/types/documentSummary';
import { formatCurrency } from '@/lib/formatters';

// Role labels
const roleLabels: Record<string, string> = {
  supplier: "Постачальник",
  buyer: "Замовник",
  executor: "Виконавець",
  client: "Клієнт",
  lessor: "Орендодавець",
  lessee: "Орендар",
  seller: "Продавець",
};

interface DocumentAnalysisPanelProps {
  summary?: DocumentSummary | ContractSummary;
  highlightedField?: FieldConfidence | null;
  hoveredField?: FieldConfidence | null;
  onFieldClick?: (field: FieldConfidence) => void;
  onFieldHover?: (field: FieldConfidence | null) => void;
  onSelectAlternative?: (fieldName: string, newValue: string) => void;
  onClearHighlight?: () => void;
  className?: string;
}

export const DocumentAnalysisPanel = ({
  summary,
  highlightedField,
  hoveredField,
  onFieldClick,
  onFieldHover,
  onSelectAlternative,
  onClearHighlight,
  className,
}: DocumentAnalysisPanelProps) => {
  const fieldConfidences = summary?.fieldConfidences || [];
  const parties = summary?.parties || [];
  const financials = summary?.financials;
  const keyDates = summary?.keyDates || [];

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-4 space-y-4">
        {/* Quick Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-sm">AI Аналіз документа</h3>
            {summary?.confidence && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {summary.confidence}% впевненість
              </Badge>
            )}
          </div>

          {summary?.shortSummary && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary.shortSummary}
            </p>
          )}
        </div>

        <Separator />

        {/* Parties */}
        {parties.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Сторони
            </h4>
            <div className="space-y-2">
              {parties.map((party, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{party.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabels[party.role] || party.role}
                      {party.code && ` · ${party.code}`}
                    </p>
                  </div>
                  {!party.isKnown && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      Невідомий
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financials */}
        {financials && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Фінанси
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Сума</p>
                <p className="font-semibold">
                  {formatCurrency(financials.amount)}
                </p>
              </div>
              {financials.paymentTerms && (
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Оплата</p>
                  <p className="font-medium text-sm">{financials.paymentTerms}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Dates */}
        {keyDates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Ключові дати
            </h4>
            <div className="space-y-1">
              {keyDates.slice(0, 4).map((date, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">{date.label}</span>
                  <span className="font-medium">
                    {new Date(date.date).toLocaleDateString('uk-UA')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Field Confidence Breakdown */}
        {fieldConfidences.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Деталі витягування
              </h4>
              <Badge variant="secondary" className="ml-auto text-xs">
                {fieldConfidences.length} полів
              </Badge>
            </div>
            
            <FieldConfidenceBreakdown
              fields={fieldConfidences}
              onSelectAlternative={onSelectAlternative}
              onFieldClick={onFieldClick}
              onFieldHover={onFieldHover}
              className="border rounded-lg"
            />

            {highlightedField && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs text-primary">
                  Виділено: {highlightedField.fieldLabel}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto h-6 text-xs"
                  onClick={onClearHighlight}
                >
                  Зняти
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!summary && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              AI аналіз недоступний для цього документа
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
