import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { 
  Inbox, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  EdoIncomingDocument,
  demoEdoIncomingDocuments,
  getNewEdoDocumentsCount,
} from "@/config/edoIntegrationConfig";
import { EdoDocumentCard } from "./EdoDocumentCard";
import { ProcessEdoDocumentSheet } from "./ProcessEdoDocumentSheet";
import type { TaxAudit } from "@/config/taxAuditsConfig";

interface EdoInboxSectionProps {
  existingAudits: TaxAudit[];
  onAuditCreated?: (audit: TaxAudit) => void;
  onRequestAdded?: (auditId: string, request: any) => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  variant?: "standalone" | "embedded";
}

const typeFilterOptions: { value: string; label: string }[] = [
  { value: "all", label: "Усі типи" },
  { value: "audit-order", label: "Накази" },
  { value: "audit-notification", label: "Повідомлення" },
  { value: "audit-request", label: "Запити" },
  { value: "audit-act", label: "Акти" },
  { value: "info-letter", label: "Інформаційні" },
];

const statusFilterOptions: { value: string; label: string }[] = [
  { value: "all", label: "Усі" },
  { value: "new", label: "Нові" },
  { value: "processed", label: "Оброблені" },
];

export const EdoInboxSection = ({ 
  existingAudits,
  onAuditCreated,
  onRequestAdded,
  collapsible = true,
  defaultExpanded = true,
  variant = "standalone",
}: EdoInboxSectionProps) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<EdoIncomingDocument[]>(demoEdoIncomingDocuments);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<EdoIncomingDocument | null>(null);

  const newCount = useMemo(() => getNewEdoDocumentsCount(documents), [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (typeFilter !== "all" && doc.documentType !== typeFilter) return false;
      if (statusFilter !== "all" && doc.status !== statusFilter) return false;
      
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches = 
          doc.subject.toLowerCase().includes(query) ||
          doc.senderName.toLowerCase().includes(query) ||
          doc.registrationNumber.toLowerCase().includes(query);
        if (!matches) return false;
      }
      
      return true;
    });
  }, [documents, typeFilter, statusFilter, searchQuery]);

  const handleSync = async () => {
    setIsSyncing(true);
    
    // Імітація API запиту
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Синхронізовано з ДПС",
      description: "Нових документів не отримано",
    });
    
    setIsSyncing(false);
  };

  const handleProcessDocument = (document: EdoIncomingDocument) => {
    setSelectedDocument(document);
  };

  const handleViewDocument = (document: EdoIncomingDocument) => {
    setSelectedDocument(document);
  };

  const handleDocumentProcessed = (documentId: string, action: string, auditId?: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: "processed" as const, 
              processedAt: new Date().toISOString(),
              processedAction: action as any,
              createdAuditId: auditId,
            } 
          : doc
      )
    );
    setSelectedDocument(null);
    
    toast({
      title: "Документ оброблено",
      description: action === "created-audit" 
        ? "Створено нову перевірку" 
        : action === "added-request"
        ? "Додано запит до перевірки"
        : "Позначено як інформаційний",
    });
  };

  // Type filter dropdown for filter slot
  const typeFilterSlot = (
    <Select value={typeFilter} onValueChange={setTypeFilter}>
      <SelectTrigger className="w-[130px] h-9 text-sm">
        <SelectValue placeholder="Тип" />
      </SelectTrigger>
      <SelectContent>
        {typeFilterOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // Mobile filter content
  const mobileTypeFilterContent = (
    <Select value={typeFilter} onValueChange={setTypeFilter}>
      <SelectTrigger className="w-full h-9">
        <SelectValue placeholder="Тип документа" />
      </SelectTrigger>
      <SelectContent>
        {typeFilterOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // Embedded variant - no Card wrapper, compact cards
  if (variant === "embedded") {
    return (
      <>
        {/* Toolbar with sync button */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <UnifiedToolbar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filterOptions={statusFilterOptions}
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              filterPlaceholder="Статус"
              resultsCount={{ shown: filteredDocuments.length, total: documents.length }}
              sticky={false}
              className="px-0"
              filterSlot={typeFilterSlot}
              mobileFilterContent={mobileTypeFilterContent}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-1.5 shrink-0"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
            {isSyncing ? "..." : "Оновити"}
          </Button>
        </div>

        {/* Compact documents list */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Mail className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                    ? "Документів за вашим фільтром не знайдено"
                    : "Немає вхідних документів"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((document) => (
              <EdoDocumentCard
                key={document.id}
                document={document}
                onProcess={handleProcessDocument}
                onView={handleViewDocument}
                compact={true}
              />
            ))}
          </div>
        )}

        {/* Process Document Sheet */}
        <ProcessEdoDocumentSheet
          document={selectedDocument}
          existingAudits={existingAudits}
          open={!!selectedDocument}
          onOpenChange={(open) => !open && setSelectedDocument(null)}
          onProcessed={handleDocumentProcessed}
        />
      </>
    );
  }

  // Standalone variant - with Card wrapper
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div 
              className={cn(
                "flex items-center gap-2",
                collapsible && "cursor-pointer"
              )}
              onClick={() => collapsible && setExpanded(!expanded)}
            >
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50">
                <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">Листи від ДПС</CardTitle>
              {newCount > 0 && (
                <Badge className="bg-blue-600 hover:bg-blue-700">
                  {newCount} нов{newCount === 1 ? "ий" : "их"}
                </Badge>
              )}
              {collapsible && (
                expanded 
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="gap-1.5"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                {isSyncing ? "Синхронізація..." : "Синхронізувати"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent className="pt-0">
            {/* Toolbar */}
            <UnifiedToolbar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filterOptions={statusFilterOptions}
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              filterPlaceholder="Статус"
              resultsCount={{ shown: filteredDocuments.length, total: documents.length }}
              sticky={false}
              className="px-0 mb-4"
              filterSlot={typeFilterSlot}
              mobileFilterContent={mobileTypeFilterContent}
            />

            {/* Documents list */}
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                    ? "Документів за вашим фільтром не знайдено"
                    : "Немає вхідних документів"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((document) => (
                  <EdoDocumentCard
                    key={document.id}
                    document={document}
                    onProcess={handleProcessDocument}
                    onView={handleViewDocument}
                  />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Process Document Sheet */}
      <ProcessEdoDocumentSheet
        document={selectedDocument}
        existingAudits={existingAudits}
        open={!!selectedDocument}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
        onProcessed={handleDocumentProcessed}
      />
    </>
  );
};
