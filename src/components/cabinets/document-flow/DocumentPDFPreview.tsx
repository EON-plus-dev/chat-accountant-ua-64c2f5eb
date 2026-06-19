import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentPDFPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentData: {
    type: string;
    number: string;
    date: string;
    supplier: { name: string; code: string };
    buyer: { name: string; code: string };
    amount?: number;
    currency?: string;
    keyTerms?: string[];
    bodyText?: string;
  };
}

export const DocumentPDFPreview = ({
  open,
  onOpenChange,
  documentData,
}: DocumentPDFPreviewProps) => {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex-row items-center justify-between p-4 pr-14 border-b space-y-0">
          <DialogTitle className="text-base font-semibold">
            Превʼю документа
          </DialogTitle>
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
              Завантажити
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-muted/30">
          <div className="p-8 flex justify-center">
            <div
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
      </DialogContent>
    </Dialog>
  );
};
