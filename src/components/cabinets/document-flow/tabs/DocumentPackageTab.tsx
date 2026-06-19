/**
 * Вкладка "Пакет документа" — відображає ієрархічну структуру 
 * документа з усіма додатками, додатковими угодами та пов'язаними документами.
 * 
 * ⚠️ НЕ ПЛУТАТИ з "Пакетом для перевірки" (audit-package):
 * - Пакет документа — структура контракту (договір + додатки + ДУ)
 * - Пакет аудиту — набір документів для податкової перевірки
 * 
 * @see DocumentRelatedTab — для загального огляду всіх зв'язків
 * @see AddToAuditPackageSheet — для пакетів аудиту
 */

import { useMemo, useState } from "react";
import { 
  FileText, 
  Paperclip, 
  FilePen, 
  AlertTriangle, 
  ChevronDown,
  ChevronRight,
  Package,
  Plus,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { 
  type Document, 
  documentTypeConfigs, 
  documentStatusConfigs 
} from "@/config/documentFlowConfig";


// ============================================
// TYPES
// ============================================

type PackageCategory = "annexes" | "amendments" | "discrepancyActs";

interface PackageStructure {
  mainDocument: Document;
  annexes: Document[];           // Додатки (annex)
  amendments: Document[];        // Додаткові угоди (amendment)
  discrepancyActs: Document[];   // Акти розбіжностей
}

interface DocumentPackageTabProps {
  document: Document;
  linkedDocumentsResolved: Document[];
  onNavigateToDocument?: (docId: string) => void;
  onAddDocumentToPackage?: () => void;
  className?: string;
}

// ============================================
// CLASSIFICATION LOGIC
// ============================================

const classifyDocument = (mainDoc: Document, linkedDoc: Document): PackageCategory => {
  const title = linkedDoc.title?.toLowerCase() || "";
  const number = linkedDoc.number?.toLowerCase() || "";
  
  // Додаток - check by title/number pattern
  if (
    title.includes("додаток") ||
    number.includes("додаток") ||
    number.includes("-a") ||
    number.includes("прил")
  ) {
    return "annexes";
  }
  
  // Додаткова угода - check by title/number pattern
  if (
    title.includes("додаткова угода") ||
    number.includes("ду") ||
    number.includes("дод.угода") ||
    number.includes("-du")
  ) {
    return "amendments";
  }
  
  // Акт розбіжностей - check by title pattern
  if (
    title.includes("акт розбіжност") ||
    title.includes("розбіжності")
  ) {
    return "discrepancyActs";
  }
  
  // Всі інші — не включаємо в Пакет (вони в табі Зв'язки)
  return null;
};

const buildPackageStructure = (
  document: Document, 
  linkedDocuments: Document[]
): PackageStructure => {
  const structure: PackageStructure = {
    mainDocument: document,
    annexes: [],
    amendments: [],
    discrepancyActs: [],
  };
  
  linkedDocuments.forEach(linkedDoc => {
    const category = classifyDocument(document, linkedDoc);
    if (category) {
      structure[category].push(linkedDoc);
    }
  });
  
  return structure;
};

// ============================================
// SUB-COMPONENTS
// ============================================

interface PackageDocumentItemProps {
  document: Document;
  onClick?: () => void;
}

const PackageDocumentItem = ({ document, onClick }: PackageDocumentItemProps) => {
  const typeConfig = documentTypeConfigs[document.type];
  const statusConfig = documentStatusConfigs[document.status];
  
  // Format amount with proper call signature
  const formattedAmount = document.amount 
    ? `${formatCurrency(document.amount)} ${document.currency && document.currency !== "UAH" ? `(${document.currency})` : ""}`
    : null;
  
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg",
        "hover:bg-muted/50 cursor-pointer group transition-colors"
      )}
      onClick={onClick}
    >
      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {document.title || typeConfig?.label || document.type}
        </p>
        <p className="text-xs text-muted-foreground">
          {document.number} · {format(new Date(document.date), "dd.MM.yy", { locale: uk })}
          {formattedAmount && ` · ${formattedAmount}`}
        </p>
      </div>
      <Badge variant="secondary" className={cn("text-[10px] h-5", statusConfig?.color)}>
        {statusConfig?.label}
      </Badge>
      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

interface PackageSectionProps {
  icon: React.ReactNode;
  label: string;
  items: Document[];
  defaultOpen?: boolean;
  emptyMessage?: string;
  onNavigateToDocument?: (docId: string) => void;
}

const PackageSection = ({ 
  icon, 
  label, 
  items, 
  defaultOpen = true,
  emptyMessage = "Немає документів",
  onNavigateToDocument 
}: PackageSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen && items.length > 0);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2.5 hover:bg-muted/30 rounded-lg px-2 transition-colors">
        <div className="flex items-center gap-2 flex-1">
          {icon}
          <span className="font-medium text-sm">{label}</span>
          <Badge variant="outline" className="ml-auto text-xs">
            {items.length}
          </Badge>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {items.length > 0 ? (
          <div className="space-y-0.5 pl-6 border-l-2 border-muted ml-3 mt-1">
            {items.map(doc => (
              <PackageDocumentItem 
                key={doc.id}
                document={doc}
                onClick={() => onNavigateToDocument?.(doc.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground pl-8 py-2">{emptyMessage}</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const DocumentPackageTab = ({
  document,
  linkedDocumentsResolved,
  onNavigateToDocument,
  onAddDocumentToPackage,
  className,
}: DocumentPackageTabProps) => {
  // Build package structure
  const packageStructure = useMemo(() => 
    buildPackageStructure(document, linkedDocumentsResolved),
    [document, linkedDocumentsResolved]
  );
  
  // Get main document configs
  const docTypeConfig = documentTypeConfigs[document.type];
  const docStatusConfig = documentStatusConfigs[document.status];
  
  // Calculate totals for package - only structure documents (not related)
  const packageStats = useMemo(() => {
    const { annexes, amendments, discrepancyActs } = packageStructure;
    const total = annexes.length + amendments.length + discrepancyActs.length;
    return {
      total,
      annexes: annexes.length,
      amendments: amendments.length,
      discrepancyActs: discrepancyActs.length,
    };
  }, [packageStructure]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Info Alert */}
      <Alert className="bg-muted/30 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Пакет документа</strong> — це структура договору з усіма додатками та змінами. 
          Не плутайте з «Пакетом для перевірки» (аудит), який використовується для податкових перевірок.
        </AlertDescription>
      </Alert>
      
      {/* Main Document Card */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-1.5 text-[10px] bg-primary/10 text-primary border-0">
                Головний документ
              </Badge>
              <h3 className="font-semibold text-base">
                {document.title || docTypeConfig?.label}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {document.number} · {format(new Date(document.date), "dd MMMM yyyy", { locale: uk })}
              </p>
              {document.amount && (
                <p className="text-sm font-medium text-primary mt-1">
                  {formatCurrency(document.amount)}
                </p>
              )}
            </div>
            <Badge className={cn("text-xs", docStatusConfig?.color)}>
              {docStatusConfig?.label}
            </Badge>
          </div>
          
          {/* Package Stats */}
          {packageStats.total > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                {packageStats.annexes} додатків
              </span>
              <span className="flex items-center gap-1">
                <FilePen className="w-3.5 h-3.5" />
                {packageStats.amendments} ДУ
              </span>
              {packageStats.discrepancyActs > 0 && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {packageStats.discrepancyActs} АР
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Document Button */}
      {onAddDocumentToPackage && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs gap-1.5"
            onClick={onAddDocumentToPackage}
          >
            <Plus className="w-3.5 h-3.5" />
            Додати документ
          </Button>
        </div>
      )}
      
      <Separator />
      
      {/* Package Sections - List View Only */}
      <div className="space-y-2">
        {/* Annexes Section */}
        <PackageSection
          icon={<Paperclip className="w-4 h-4 text-purple-600" />}
          label="Додатки"
          items={packageStructure.annexes}
          emptyMessage="Немає додатків"
          onNavigateToDocument={onNavigateToDocument}
        />
        
        {/* Amendments Section */}
        <PackageSection
          icon={<FilePen className="w-4 h-4 text-amber-600" />}
          label="Додаткові угоди"
          items={packageStructure.amendments}
          emptyMessage="Немає додаткових угод"
          onNavigateToDocument={onNavigateToDocument}
        />
        
        {/* Discrepancy Acts Section */}
        <PackageSection
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
          label="Акти розбіжностей"
          items={packageStructure.discrepancyActs}
          defaultOpen={false}
          emptyMessage="Немає актів розбіжностей"
          onNavigateToDocument={onNavigateToDocument}
        />
      </div>
      
      {/* Empty State */}
      {packageStats.total === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Пакет документа порожній</p>
          <p className="text-xs mt-1">
            Додайте додатки або додаткові угоди
          </p>
          {onAddDocumentToPackage && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 gap-1.5"
              onClick={onAddDocumentToPackage}
            >
              <Plus className="w-4 h-4" />
              Додати перший документ
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
