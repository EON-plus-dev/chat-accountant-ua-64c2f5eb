import { useState, useMemo } from "react";
import { ArrowLeft, Copy, Maximize2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { type Cabinet } from "@/types/cabinet";
import { EditableDocumentText } from "./EditableDocumentText";
import { DocumentPDFPreview } from "./DocumentPDFPreview";
import { DocumentActionsBlock } from "./blocks/DocumentActionsBlock";
import { useDocumentEditing, getDocumentById } from "./hooks/useDocumentEditing";

interface DocumentFullViewerPageProps {
  documentId: string;
  cabinet: Cabinet;
  mode?: "view" | "edit";
  onBack: () => void;
  onChatPromptInsert?: (prompt: string) => void;
  onDocumentUpdate?: (docId: string, updates: any) => void;
}

export const DocumentFullViewerPage = ({
  documentId,
  cabinet,
  mode = "view",
  onBack,
  onChatPromptInsert,
  onDocumentUpdate,
}: DocumentFullViewerPageProps) => {
  const isMobile = useIsMobile();
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  
  const doc = useMemo(() => getDocumentById(cabinet.type, documentId), [cabinet.type, documentId]);
  
  const {
    isEditing,
    bodyText,
    canEdit,
    startEdit,
    cancelEdit,
    saveEdit,
    handleTextChange,
  } = useDocumentEditing({
    document: doc,
    cabinet,
    onDocumentUpdate,
  });

  // Auto-start edit mode if requested
  useState(() => {
    if (mode === "edit" && canEdit) {
      startEdit();
    }
  });

  if (!doc) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Документ не знайдено</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(bodyText);
    toast({
      title: "Скопійовано",
      description: "Текст документа скопійовано в буфер обміну",
    });
  };

  const handleAIChipClick = (prompt: string) => {
    onChatPromptInsert?.(prompt);
    toast({
      title: "Запит надіслано",
      description: "Чат обробляє ваш запит",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 md:px-6 py-3 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {!isMobile && "Назад"}
        </Button>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{doc.number}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCopyText}>
            <Copy className="w-3.5 h-3.5" />
            {!isMobile && "Копіювати"}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setPdfPreviewOpen(true)}>
            <Maximize2 className="w-3.5 h-3.5" />
            {!isMobile && "PDF"}
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 min-h-0">
        <EditableDocumentText
          originalText={bodyText}
          isEditing={isEditing}
          onTextChange={handleTextChange}
          className="h-full"
        />
      </div>

      {/* AI Chips Footer */}
      <DocumentActionsBlock
        document={doc}
        onAIChipClick={handleAIChipClick}
        variant="footer"
      />

      {/* PDF Preview */}
      <DocumentPDFPreview
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        documentData={{
          type: doc.type,
          number: doc.number,
          date: doc.date,
          supplier: { name: cabinet.name, code: "" },
          buyer: doc.contractor || { name: "", code: "" },
          amount: doc.amount,
          currency: doc.currency,
          bodyText: bodyText,
        }}
      />
    </div>
  );
};
