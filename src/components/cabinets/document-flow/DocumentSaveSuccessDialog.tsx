/**
 * DocumentSaveSuccessDialog Component
 * "Document Ready Hub" - Full preview with contextual actions
 * 
 * Features:
 * - Compact header (48px) with zoom controls
 * - Full A4 document preview (scrollable, zoomable 50-150%)
 * - Horizontal action footer (Sign, Send, Download)
 * - Pending contractor handling with notifications
 */

import { useState } from "react";
import { 
  CheckCircle, Send, Download, Clock, Bell, AlertCircle, 
  PenLine, ZoomIn, ZoomOut, UserPlus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Contractor } from "@/config/settingsConfig";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PendingContractorInfo {
  id: string;
  name: string;
  email: string;
}

interface DocumentPreviewData {
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
}

interface DocumentSaveSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentNumber: string;
  documentType: string;
  version: string;
  contractor: Contractor | null;
  // Pending contractor tracking
  isPendingContractor?: boolean;
  pendingContractorInfo?: PendingContractorInfo | null;
  // Document preview data
  documentPreviewData?: DocumentPreviewData | null;
  // Actions
  onSendToContractor?: () => void;
  onSign?: () => void;
  onSignAndSend?: () => void;
  onDownloadPDF?: () => void;
  onGoToList?: () => void;
  onConfigureNotifications?: () => void;
  onInviteAndSend?: () => void;
}

export function DocumentSaveSuccessDialog({
  open,
  onOpenChange,
  documentNumber,
  documentType,
  version,
  contractor,
  isPendingContractor = false,
  pendingContractorInfo,
  documentPreviewData,
  onSendToContractor,
  onSign,
  onSignAndSend,
  onDownloadPDF,
  onGoToList,
  onConfigureNotifications,
  onInviteAndSend,
}: DocumentSaveSuccessDialogProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [zoom, setZoom] = useState(75);
  
  const canSend = contractor && contractor.email && !contractor.isPending && !isPendingContractor;
  const needsInvite = !contractor || !contractor.email;

  const zoomIn = () => setZoom(z => Math.min(150, z + 25));
  const zoomOut = () => setZoom(z => Math.max(50, z - 25));

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

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      setIsGeneratingPDF(false);
      toast({
        title: "PDF завантажено",
        description: `${documentType} ${documentNumber}.pdf`,
      });
      onDownloadPDF?.();
      // Закрити діалог та перейти до списку
      onOpenChange(false);
      onGoToList?.();
    }, 1500);
  };

  const handleSendToContractor = () => {
    onSendToContractor?.();
    onOpenChange(false);
  };

  const handleSign = () => {
    onSign?.();
  };

  const handleSignAndSend = () => {
    onSignAndSend?.();
  };

  const handleConfigureNotifications = () => {
    onConfigureNotifications?.();
    toast({
      title: "Сповіщення налаштовано",
      description: "Ви отримаєте сповіщення коли контрагент зареєструється",
    });
  };

  const handleGoToList = () => {
    onGoToList?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[90vh] p-0 flex flex-col">
        {/* Compact Header - 48px */}
        <div className="px-4 py-2 border-b flex items-center justify-between shrink-0 h-12">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              isPendingContractor 
                ? "bg-warning/20" 
                : "bg-success/20"
            )}>
              {isPendingContractor ? (
                <Clock className="h-4 w-4 text-warning" />
              ) : (
                <CheckCircle className="h-4 w-4 text-success" />
              )}
            </div>
            <DialogTitle className="text-sm font-medium truncate">
              {documentType} {documentNumber} {isPendingContractor ? "збережено" : "готовий"}
            </DialogTitle>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 mr-8">
            {/* Zoom controls FIRST - далі від кнопки закриття */}
            {documentPreviewData && (
              <div className="flex items-center gap-0.5 border rounded-md px-1 bg-muted/30">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={zoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-xs w-10 text-center font-medium">{zoom}%</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={zoomIn}
                  disabled={zoom >= 150}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {/* Version Badge AFTER zoom - ближче до кнопки закриття */}
            <Badge variant="outline" className="text-xs">
              {version}
            </Badge>
          </div>
        </div>

        {/* Preview Area - Flexible height */}
        {documentPreviewData ? (
          <ScrollArea className="flex-1 bg-muted/50" orientation="both">
              <div className="p-4 flex justify-center" style={{ minWidth: zoom > 100 ? `${595 * (zoom / 100) + 32}px` : 'auto' }}>
                {/* A4 Document */}
                <div
                  className="bg-card text-card-foreground shadow-lg border rounded relative"
                  style={{
                    width: `${595 * (zoom / 100)}px`,
                    minHeight: `${842 * (zoom / 100)}px`,
                    padding: `${40 * (zoom / 100)}px`,
                    fontSize: `${12 * (zoom / 100)}px`,
                    lineHeight: 1.5,
                  }}
                >
                  {/* Document Header */}
                  <div className="text-center mb-6">
                    <h1
                      className="font-bold uppercase"
                      style={{ fontSize: `${16 * (zoom / 100)}px` }}
                    >
                      {documentPreviewData.documentData.type}
                    </h1>
                    <p className="mt-2" style={{ fontSize: `${12 * (zoom / 100)}px` }}>
                      № {documentPreviewData.documentData.number} від {documentPreviewData.documentData.date}
                    </p>
                  </div>

                  {/* Parties */}
                  <div
                    className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b"
                  >
                    <div>
                      <p className="font-semibold mb-1" style={{ fontSize: `${11 * (zoom / 100)}px` }}>
                        Постачальник:
                      </p>
                      <p>{documentPreviewData.documentData.supplier.name}</p>
                      {documentPreviewData.documentData.supplier.code && (
                        <p className="text-muted-foreground" style={{ fontSize: `${10 * (zoom / 100)}px` }}>
                          ЄДРПОУ: {documentPreviewData.documentData.supplier.code}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ fontSize: `${11 * (zoom / 100)}px` }}>
                        Покупець:
                      </p>
                      <p>{documentPreviewData.documentData.buyer.name || "—"}</p>
                      {documentPreviewData.documentData.buyer.code && (
                        <p className="text-muted-foreground" style={{ fontSize: `${10 * (zoom / 100)}px` }}>
                          ЄДРПОУ: {documentPreviewData.documentData.buyer.code}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div
                    className="whitespace-pre-wrap mb-6 text-muted-foreground"
                    style={{ fontSize: `${11 * (zoom / 100)}px` }}
                  >
                    {documentPreviewData.bodyText}
                  </div>

                  {/* Amount */}
                  {documentPreviewData.documentData.amount && documentPreviewData.documentData.amount > 0 && (
                    <div className="py-3 mb-6 border-y">
                      <p className="font-semibold" style={{ fontSize: `${12 * (zoom / 100)}px` }}>
                        Загальна сума:{" "}
                        {formatAmount(documentPreviewData.documentData.amount, documentPreviewData.documentData.currency)}
                      </p>
                    </div>
                  )}

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t">
                    <div style={{ fontSize: `${10 * (zoom / 100)}px` }}>
                      <p className="font-semibold mb-4">Постачальник:</p>
                      <p className="text-muted-foreground/50">__________________ / ПІБ /</p>
                    </div>
                    <div style={{ fontSize: `${10 * (zoom / 100)}px` }}>
                      <p className="font-semibold mb-4">Покупець:</p>
                      <p className="text-muted-foreground/50">__________________ / ПІБ /</p>
                    </div>
                  </div>
                </div>
              </div>
          </ScrollArea>
        ) : (
          /* No preview - show placeholder */
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <p className="text-muted-foreground text-sm">Попередній перегляд недоступний</p>
          </div>
        )}

        {/* Pending Contractor Banner */}
        {isPendingContractor && pendingContractorInfo && (
          <div className="px-4 py-3 border-t bg-warning/10 shrink-0">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  Очікуємо реєстрацію: {pendingContractorInfo.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ви отримаєте сповіщення коли контрагент зареєструється
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={handleConfigureNotifications}
              >
                <Bell className="h-3.5 w-3.5" />
                Сповіщення
              </Button>
            </div>
          </div>
        )}

        {/* Horizontal Action Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between bg-background shrink-0">
          <Button variant="ghost" size="sm" onClick={handleGoToList}>
            До списку
          </Button>
          
          <div className="flex items-center gap-2">
            {/* Download PDF */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              {isGeneratingPDF ? "..." : "PDF"}
            </Button>

            {/* Invite & Send (if no contractor or no email) */}
            {needsInvite && !isPendingContractor && onInviteAndSend && (
              <Button
                variant="outline"
                size="sm"
                onClick={onInviteAndSend}
                className="gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                Запросити та відправити
              </Button>
            )}

            {/* Send (if contractor available) */}
            {canSend && onSendToContractor && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendToContractor}
                className="gap-1.5"
              >
                <Send className="h-4 w-4" />
                Надіслати
              </Button>
            )}

            {/* Sign & Send (primary if available) */}
            {canSend && onSignAndSend && (
              <Button
                size="sm"
                onClick={handleSignAndSend}
                className="gap-1.5"
              >
                <PenLine className="h-4 w-4" />
                Підписати та надіслати
              </Button>
            )}

            {/* Sign only (if no Sign&Send or no contractor) */}
            {onSign && (!canSend || !onSignAndSend) && (
              <Button
                size="sm"
                onClick={handleSign}
                className="gap-1.5"
              >
                <PenLine className="h-4 w-4" />
                Підписати
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Re-export types for backward compatibility
export type { DocumentPreviewData as DocumentSaveSuccessDialogPreviewData };
