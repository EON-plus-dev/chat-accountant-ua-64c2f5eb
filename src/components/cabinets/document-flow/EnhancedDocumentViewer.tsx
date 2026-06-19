import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Printer, ZoomIn, ZoomOut, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { FieldConfidence } from '@/types/documentSummary';

interface DocumentPDFData {
  type: string;
  number: string;
  date: string;
  supplier: { name: string; code: string };
  buyer: { name: string; code: string };
  amount?: number;
  currency?: string;
  keyTerms?: string[];
  bodyText?: string;
}

interface EnhancedDocumentViewerProps {
  documentData: DocumentPDFData;
  highlightedField?: FieldConfidence | null;
  hoveredField?: FieldConfidence | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  className?: string;
  showToolbar?: boolean;
}

// Simulated bounding boxes for demo purposes - in production, these come from the AI extraction
const getSimulatedBoundingBox = (fieldName: string, zoom: number): { x: number; y: number; width: number; height: number } | null => {
  const boxes: Record<string, { x: number; y: number; width: number; height: number }> = {
    "parties.executor.name": { x: 40, y: 165, width: 200, height: 18 },
    "parties.executor.code": { x: 210, y: 185, width: 80, height: 14 },
    "parties.client.name": { x: 330, y: 165, width: 180, height: 18 },
    "financials.amount": { x: 40, y: 500, width: 180, height: 18 },
    "contract.subject": { x: 40, y: 250, width: 480, height: 36 },
    "keyDates.validUntil": { x: 200, y: 135, width: 80, height: 14 },
    "contract.prolongation.noticePeriod": { x: 40, y: 380, width: 120, height: 14 },
    "contract.penalties.latePayment": { x: 40, y: 420, width: 150, height: 14 },
  };

  const box = boxes[fieldName];
  if (!box) return null;

  return {
    x: box.x * (zoom / 100),
    y: box.y * (zoom / 100),
    width: box.width * (zoom / 100),
    height: box.height * (zoom / 100),
  };
};

export const EnhancedDocumentViewer = ({
  documentData,
  highlightedField,
  hoveredField,
  zoom,
  onZoomChange,
  className,
  showToolbar = true,
}: EnhancedDocumentViewerProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => onZoomChange(Math.min(zoom + 25, 200));
  const handleZoomOut = () => onZoomChange(Math.max(zoom - 25, 50));

  const handleDownload = () => {
    toast.success('Завантаження PDF...', {
      description: 'Документ буде збережено на ваш пристрій',
    });
  };

  const handlePrint = () => {
    toast.info('Друк документа...', {
      description: 'Відкривається діалог друку',
    });
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return null;
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ' + (currency || '₴');
  };

  // Scroll to highlighted field when it changes
  useEffect(() => {
    if (highlightedField && highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [highlightedField]);

  const defaultBodyText = `1. ПРЕДМЕТ ДОГОВОРУ
1.1. Виконавець зобов'язується надати Замовнику послуги згідно з умовами цього Договору, а Замовник зобов'язується прийняти та оплатити такі послуги.

2. ВАРТІСТЬ ТА ПОРЯДОК РОЗРАХУНКІВ
2.1. Загальна вартість послуг за цим Договором складає ${formatAmount(documentData.amount, documentData.currency) || '___________'}.
2.2. Оплата здійснюється шляхом безготівкового перерахування коштів на поточний рахунок Виконавця.

3. ПРАВА ТА ОБОВ'ЯЗКИ СТОРІН
3.1. Виконавець зобов'язується надати послуги якісно та у встановлені строки.
3.2. Замовник зобов'язується своєчасно оплатити надані послуги.

4. СТРОК ДІЇ ДОГОВОРУ
4.1. Цей Договір набирає чинності з моменту його підписання та діє до повного виконання Сторонами своїх зобов'язань.

5. ІНШІ УМОВИ
5.1. Усі спори вирішуються шляхом переговорів, а у разі недосягнення згоди — у судовому порядку.`;

  // Get bounding box for highlighted field
  const boundingBox = highlightedField 
    ? (highlightedField.boundingBox 
        ? {
            x: highlightedField.boundingBox.x * (zoom / 100),
            y: highlightedField.boundingBox.y * (zoom / 100),
            width: highlightedField.boundingBox.width * (zoom / 100),
            height: highlightedField.boundingBox.height * (zoom / 100),
          }
        : getSimulatedBoundingBox(highlightedField.fieldName, zoom))
    : null;

  // Get bounding box for hovered field (only if not already highlighted)
  const hoverBoundingBox = hoveredField && !highlightedField
    ? (hoveredField.boundingBox 
        ? {
            x: hoveredField.boundingBox.x * (zoom / 100),
            y: hoveredField.boundingBox.y * (zoom / 100),
            width: hoveredField.boundingBox.width * (zoom / 100),
            height: hoveredField.boundingBox.height * (zoom / 100),
          }
        : getSimulatedBoundingBox(hoveredField.fieldName, zoom))
    : null;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>Превʼю документа</span>
            {highlightedField && (
              <Badge variant="secondary" className="text-xs gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                {highlightedField.fieldLabel}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
            </Button>
            <Button size="sm" className="gap-2" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Document Preview with Highlight Overlay */}
      <ScrollArea className="flex-1 bg-muted/30">
        <div className="p-6 flex justify-center">
          <div
            ref={contentRef}
            className="bg-white text-black shadow-lg relative"
            style={{
              width: `${595 * (zoom / 100)}px`,
              minHeight: `${842 * (zoom / 100)}px`,
              padding: `${40 * (zoom / 100)}px`,
              fontSize: `${12 * (zoom / 100)}px`,
              lineHeight: 1.5,
            }}
          >
            {/* Watermark */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity: 0.06 }}
            >
              <span
                className="font-bold text-gray-500 rotate-[-30deg]"
                style={{ fontSize: `${80 * (zoom / 100)}px` }}
              >
                ПРЕВʼЮ
              </span>
            </div>

            {/* Hover Highlight Overlay (lighter style, no scroll) */}
            {hoveredField && hoverBoundingBox && !highlightedField && (
              <div
                className="absolute pointer-events-none z-[5] transition-opacity duration-150"
                style={{
                  left: `${hoverBoundingBox.x}px`,
                  top: `${hoverBoundingBox.y}px`,
                  width: `${hoverBoundingBox.width}px`,
                  height: `${hoverBoundingBox.height}px`,
                  border: "1.5px dashed hsl(var(--muted-foreground) / 0.5)",
                  backgroundColor: "hsl(var(--muted) / 0.2)",
                  borderRadius: "3px",
                }}
              />
            )}

            {/* Field Highlight Overlay (click - stronger style with animation) */}
            {highlightedField && boundingBox && (
              <TooltipProvider>
                <Tooltip open>
                  <TooltipTrigger asChild>
                    <div
                      ref={highlightRef}
                      className="absolute pointer-events-none z-10 animate-pulse"
                      style={{
                        left: `${boundingBox.x}px`,
                        top: `${boundingBox.y}px`,
                        width: `${boundingBox.width}px`,
                        height: `${boundingBox.height}px`,
                        border: "2px solid hsl(var(--primary))",
                        backgroundColor: "hsl(var(--primary) / 0.15)",
                        borderRadius: "4px",
                        boxShadow: "0 0 16px hsl(var(--primary) / 0.4)",
                      }}
                    >
                      {/* Field label badge */}
                      <span 
                        className="absolute -top-6 left-0 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded whitespace-nowrap"
                        style={{ fontSize: `${10 * (zoom / 100)}px` }}
                      >
                        {highlightedField.fieldLabel}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{highlightedField.fieldLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        Впевненість: {highlightedField.confidence}%
                      </p>
                      {highlightedField.needsReview && (
                        <Badge variant="secondary" className="text-xs">
                          Потребує перевірки
                        </Badge>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <h1
                className="font-bold uppercase"
                style={{ fontSize: `${16 * (zoom / 100)}px` }}
              >
                {documentData.type}
              </h1>
              <p className="mt-2">
                № {documentData.number} від {documentData.date}
              </p>
            </div>

            {/* Parties */}
            <div
              className="grid grid-cols-2 gap-4 mb-6 pb-4"
              style={{ borderBottom: '1px solid #e5e5e5' }}
            >
              <div>
                <p className="font-semibold mb-1">Постачальник:</p>
                <p>{documentData.supplier.name}</p>
                <p className="text-gray-600">
                  Код ЄДРПОУ/ІПН: {documentData.supplier.code}
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Покупець:</p>
                <p>{documentData.buyer.name}</p>
                <p className="text-gray-600">
                  Код ЄДРПОУ/ІПН: {documentData.buyer.code}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="whitespace-pre-wrap mb-6">
              {documentData.bodyText || defaultBodyText}
            </div>

            {/* Amount */}
            {documentData.amount && (
              <div
                className="py-3 mb-6"
                style={{
                  borderTop: '1px solid #e5e5e5',
                  borderBottom: '1px solid #e5e5e5',
                }}
              >
                <p className="font-semibold">
                  Загальна сума: {formatAmount(documentData.amount, documentData.currency)}
                </p>
              </div>
            )}

            {/* Key Terms */}
            {documentData.keyTerms && documentData.keyTerms.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold mb-2">Ключові умови:</p>
                <ul className="list-disc pl-5">
                  {documentData.keyTerms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signatures */}
            <div
              className="grid grid-cols-2 gap-8 mt-8 pt-4"
              style={{ borderTop: '1px solid #e5e5e5' }}
            >
              <div>
                <p className="font-semibold mb-4">Постачальник:</p>
                <p className="mb-2">__________________ / {documentData.supplier.name.split(' ').slice(0, 2).join(' ')} /</p>
                <p className="text-gray-500">М.П.</p>
              </div>
              <div>
                <p className="font-semibold mb-4">Покупець:</p>
                <p className="mb-2">__________________ / {documentData.buyer.name.split(' ').slice(0, 2).join(' ')} /</p>
                <p className="text-gray-500">М.П.</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
