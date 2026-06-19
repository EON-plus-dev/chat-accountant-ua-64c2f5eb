/**
 * InlinePrintPreview - Inline preview of document for print/PDF
 * 
 * Replaces the editor area when user clicks "Перегляд" in Edit mode.
 * Shows a PDF-like preview with:
 * - A4 proportioned document view
 * - "ЧЕРНЕТКА" (DRAFT) watermark
 * - NO internal header (zoom controls moved to parent header)
 */

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface InlinePrintPreviewProps {
  bodyText: string;
  documentData: {
    type: string;
    number: string;
    date: string;
    supplier: { name: string; code: string };
    buyer: { name: string; code: string };
    amount?: number;
    currency?: string;
    keyTerms?: string[];
  };
  /** Zoom level controlled by parent */
  zoom?: number;
  className?: string;
}

export const InlinePrintPreview = ({
  bodyText,
  documentData,
  zoom = 100,
  className,
}: InlinePrintPreviewProps) => {
  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return null;
    return (
      new Intl.NumberFormat("uk-UA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) +
      " " +
      (currency || "₴")
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Document Preview Area - no internal header */}
      <ScrollArea className="flex-1 bg-muted/30">
        <div className="p-6 flex justify-center">
          <div
            className="bg-white text-black shadow-lg relative border"
            style={{
              width: `${595 * (zoom / 100)}px`,
              minHeight: `${842 * (zoom / 100)}px`,
              padding: `${40 * (zoom / 100)}px`,
              fontSize: `${12 * (zoom / 100)}px`,
              lineHeight: 1.5,
            }}
          >
            {/* Draft Watermark */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              style={{ opacity: 0.08 }}
            >
              <span
                className="font-bold text-gray-500 rotate-[-30deg] uppercase tracking-widest"
                style={{ fontSize: `${72 * (zoom / 100)}px` }}
              >
                Чернетка
              </span>
            </div>

            {/* Header */}
            <div className="text-center mb-6 relative">
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
              style={{ borderBottom: "1px solid #e5e5e5" }}
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
            <div className="whitespace-pre-wrap mb-6">{bodyText}</div>

            {/* Amount */}
            {documentData.amount && (
              <div
                className="py-3 mb-6"
                style={{
                  borderTop: "1px solid #e5e5e5",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                <p className="font-semibold">
                  Загальна сума:{" "}
                  {formatAmount(documentData.amount, documentData.currency)}
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
              style={{ borderTop: "1px solid #e5e5e5" }}
            >
              <div>
                <p className="font-semibold mb-4">Постачальник:</p>
                <p className="mb-2">
                  __________________ /{" "}
                  {documentData.supplier.name.split(" ").slice(0, 2).join(" ")} /
                </p>
                <p className="text-gray-500">М.П.</p>
              </div>
              <div>
                <p className="font-semibold mb-4">Покупець:</p>
                <p className="mb-2">
                  __________________ /{" "}
                  {documentData.buyer.name.split(" ").slice(0, 2).join(" ")} /
                </p>
                <p className="text-gray-500">М.П.</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
