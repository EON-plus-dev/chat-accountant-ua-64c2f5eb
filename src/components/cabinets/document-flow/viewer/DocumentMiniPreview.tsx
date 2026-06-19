/**
 * DocumentMiniPreview - Compact document preview for success dialog
 * 
 * Scaled-down A4 preview with paper effect for embedding in dialogs.
 * Uses 60-70% zoom for compact display while maintaining readability.
 */

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface DocumentMiniPreviewProps {
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
  /** Zoom level (default: 60%) */
  zoom?: number;
  className?: string;
}

export const DocumentMiniPreview = ({
  bodyText,
  documentData,
  zoom = 60,
  className,
}: DocumentMiniPreviewProps) => {
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
    <div className={cn("relative", className)}>
      {/* Paper effect wrapper */}
      <div className="rounded-lg border shadow-lg bg-white dark:bg-gray-900 overflow-hidden">
        <ScrollArea className="max-h-[300px]">
          <div className="p-3 flex justify-center bg-muted/30">
            <div
              className="bg-white text-black shadow-sm relative border"
              style={{
                width: `${595 * (zoom / 100)}px`,
                minHeight: `${400 * (zoom / 100)}px`,
                padding: `${30 * (zoom / 100)}px`,
                fontSize: `${11 * (zoom / 100)}px`,
                lineHeight: 1.4,
              }}
            >
              {/* Header */}
              <div className="text-center mb-4 relative">
                <h1
                  className="font-bold uppercase"
                  style={{ fontSize: `${14 * (zoom / 100)}px` }}
                >
                  {documentData.type}
                </h1>
                <p className="mt-1" style={{ fontSize: `${10 * (zoom / 100)}px` }}>
                  № {documentData.number} від {documentData.date}
                </p>
              </div>

              {/* Parties - Compact */}
              <div
                className="grid grid-cols-2 gap-3 mb-4 pb-3"
                style={{ borderBottom: "1px solid #e5e5e5" }}
              >
                <div>
                  <p className="font-semibold" style={{ fontSize: `${9 * (zoom / 100)}px` }}>Постачальник:</p>
                  <p style={{ fontSize: `${9 * (zoom / 100)}px` }}>{documentData.supplier.name}</p>
                  {documentData.supplier.code && (
                    <p className="text-gray-500" style={{ fontSize: `${8 * (zoom / 100)}px` }}>
                      ЄДРПОУ: {documentData.supplier.code}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-semibold" style={{ fontSize: `${9 * (zoom / 100)}px` }}>Покупець:</p>
                  <p style={{ fontSize: `${9 * (zoom / 100)}px` }}>
                    {documentData.buyer.name || "—"}
                  </p>
                  {documentData.buyer.code && (
                    <p className="text-gray-500" style={{ fontSize: `${8 * (zoom / 100)}px` }}>
                      ЄДРПОУ: {documentData.buyer.code}
                    </p>
                  )}
                </div>
              </div>

              {/* Body - Truncated */}
              <div
                className="whitespace-pre-wrap mb-4 text-gray-700"
                style={{
                  fontSize: `${9 * (zoom / 100)}px`,
                  maxHeight: `${120 * (zoom / 100)}px`,
                  overflow: "hidden",
                }}
              >
                {bodyText.split("\n").slice(0, 5).join("\n")}
                {bodyText.split("\n").length > 5 && (
                  <span className="text-muted-foreground">...</span>
                )}
              </div>

              {/* Amount */}
              {documentData.amount && documentData.amount > 0 && (
                <div
                  className="py-2 mb-3"
                  style={{
                    borderTop: "1px solid #e5e5e5",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  <p className="font-semibold" style={{ fontSize: `${10 * (zoom / 100)}px` }}>
                    Загальна сума:{" "}
                    {formatAmount(documentData.amount, documentData.currency)}
                  </p>
                </div>
              )}

              {/* Signatures - Compact */}
              <div
                className="grid grid-cols-2 gap-4 mt-4 pt-3"
                style={{ borderTop: "1px solid #e5e5e5" }}
              >
                <div style={{ fontSize: `${8 * (zoom / 100)}px` }}>
                  <p className="font-semibold mb-2">Постачальник:</p>
                  <p className="text-gray-400">__________________ / ПІБ /</p>
                </div>
                <div style={{ fontSize: `${8 * (zoom / 100)}px` }}>
                  <p className="font-semibold mb-2">Покупець:</p>
                  <p className="text-gray-400">__________________ / ПІБ /</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
