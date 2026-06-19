/**
 * Об'єднаний таб "Зв'язки" — поєднує функціонал "Пакет документа" та "Пов'язані"
 * 
 * Структура:
 * 1. Package Structure — Ієрархія пакета документа (додатки, ДУ, акти розбіжностей)
 * 2. Semantic Links — Семантичні групи зв'язків (Ієрархія, Фінансові, Версії, Посилання)
 * 3. View Toggle — Перемикач List/Graph view
 * 4. Graph View — Візуалізація графу зв'язків
 */

import { useState, useMemo } from "react";
import { 
  Building2, CreditCard, BookOpen, FileText, FolderCheck, 
  ExternalLink, ChevronRight, Link2, AlertCircle, FileSearch, Plus,
  TrendingUp, TrendingDown, Banknote, Wallet, Receipt,
  ArrowUp, ArrowDown, FileEdit, Paperclip, CheckCircle, RefreshCw, 
  Archive as ArchiveIcon, GitBranch, Link as LinkIcon, AlertTriangle,
  Package, Info, FilePen, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type Document, documentTypeConfigs, documentStatusConfigs } from "@/config/documentFlowConfig";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  getAuditsForDocument, 
  auditTypeConfig, 
  auditStatusConfig, 
  type TaxAudit 
} from "@/config/taxAuditsConfig";
import { demoIncomeRecords as incomeBookRecords, type IncomeBookRecord } from "@/config/incomeBookConfig";
import { DocumentRelationshipGraph } from "../graph";
import { 
  type LinkType, 
  type LinkGroup,
  linkTypeConfig, 
  linkTypeToGroup, 
  linkGroupConfig,
} from "@/types/documentLinks";

// ============================================
// PACKAGE STRUCTURE TYPES & LOGIC
// ============================================

type PackageCategory = "annexes" | "amendments" | "discrepancyActs";

interface PackageStructure {
  mainDocument: Document;
  annexes: Document[];
  amendments: Document[];
  discrepancyActs: Document[];
}

const classifyDocumentForPackage = (mainDoc: Document, linkedDoc: Document): PackageCategory | null => {
  const title = linkedDoc.title?.toLowerCase() || "";
  const number = linkedDoc.number?.toLowerCase() || "";
  
  if (title.includes("додаток") || number.includes("додаток") || number.includes("-a") || number.includes("прил")) {
    return "annexes";
  }
  
  if (title.includes("додаткова угода") || number.includes("ду") || number.includes("дод.угода") || number.includes("-du")) {
    return "amendments";
  }
  
  if (title.includes("акт розбіжност") || title.includes("розбіжності") || linkedDoc.type === "discrepancy-act") {
    return "discrepancyActs";
  }
  
  return null;
};

const buildPackageStructure = (document: Document, linkedDocuments: Document[]): PackageStructure => {
  const structure: PackageStructure = {
    mainDocument: document,
    annexes: [],
    amendments: [],
    discrepancyActs: [],
  };
  
  linkedDocuments.forEach(linkedDoc => {
    const category = classifyDocumentForPackage(document, linkedDoc);
    if (category) {
      structure[category].push(linkedDoc);
    }
  });
  
  return structure;
};

// ============================================
// LINK TYPE LOGIC
// ============================================

const determineLinkType = (sourceDoc: Document, targetDoc: Document): LinkType => {
  if (targetDoc.type === sourceDoc.type && 
      new Date(targetDoc.date) > new Date(sourceDoc.date) &&
      targetDoc.contractor?.id === sourceDoc.contractor?.id) {
    return "amendment";
  }
  
  if (sourceDoc.type === "invoice" && targetDoc.type === "act") {
    return "child";
  }
  if (sourceDoc.type === "contract" && ["invoice", "act"].includes(targetDoc.type)) {
    return "child";
  }
  if (targetDoc.type === "contract" && ["invoice", "act"].includes(sourceDoc.type)) {
    return "parent";
  }
  
  if (sourceDoc.type === "invoice" && targetDoc.type === "payment-order") {
    return "payment-basis";
  }
  if (sourceDoc.type === "payment-order" && targetDoc.type === "invoice") {
    return "payment-confirm";
  }
  
  if (targetDoc.number?.includes("Додаток") || targetDoc.title?.includes("Додаток")) {
    return "annex";
  }
  
  return "related";
};

// ============================================
// HELPER COMPONENTS
// ============================================

const LinkDirectionIcon = ({ linkType, className }: { linkType: LinkType; className?: string }) => {
  const config = linkTypeConfig[linkType];
  
  const iconMap: Record<LinkType, React.ReactNode> = {
    "parent": <ArrowUp className={cn("w-3.5 h-3.5", config.color, className)} />,
    "child": <ArrowDown className={cn("w-3.5 h-3.5", config.color, className)} />,
    "amendment": <FileEdit className={cn("w-3.5 h-3.5", config.color, className)} />,
    "annex": <Paperclip className={cn("w-3.5 h-3.5", config.color, className)} />,
    "payment-basis": <CreditCard className={cn("w-3.5 h-3.5", config.color, className)} />,
    "payment-confirm": <CheckCircle className={cn("w-3.5 h-3.5", config.color, className)} />,
    "supersedes": <RefreshCw className={cn("w-3.5 h-3.5", config.color, className)} />,
    "superseded-by": <ArchiveIcon className={cn("w-3.5 h-3.5", config.color, className)} />,
    "version-of": <GitBranch className={cn("w-3.5 h-3.5", config.color, className)} />,
    "reference": <LinkIcon className={cn("w-3.5 h-3.5", config.color, className)} />,
    "related": <Link2 className={cn("w-3.5 h-3.5", config.color, className)} />,
    "bundle": <FolderCheck className={cn("w-3.5 h-3.5", config.color, className)} />,
    "audit-package": <FolderCheck className={cn("w-3.5 h-3.5", config.color, className)} />,
    "discrepancy-act": <AlertTriangle className={cn("w-3.5 h-3.5", config.color, className)} />,
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{iconMap[linkType] || iconMap["related"]}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">{config.labelUk}</p>
        <p className="text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Payment & Income helpers
const getPaymentStatusBadge = (status: "completed" | "pending" | "scheduled") => {
  switch (status) {
    case "completed":
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]">Виконано</Badge>;
    case "pending":
      return <Badge variant="secondary" className="text-[10px]">Очікує</Badge>;
    case "scheduled":
      return <Badge variant="outline" className="text-[10px]">Заплановано</Badge>;
  }
};

const getIncomeStatusIcon = (status: string) => {
  switch (status) {
    case "income":
      return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case "return":
      return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    default:
      return <TrendingUp className="w-4 h-4 text-muted-foreground" />;
  }
};

const getPaymentTypeIcon = (paymentType: string) => {
  switch (paymentType) {
    case "bank": return <Banknote className="w-3.5 h-3.5" />;
    case "cash": return <Wallet className="w-3.5 h-3.5" />;
    case "prro": return <Receipt className="w-3.5 h-3.5" />;
    default: return <CreditCard className="w-3.5 h-3.5" />;
  }
};

const getPaymentTypeLabel = (paymentType: string) => {
  switch (paymentType) {
    case "bank": return "Банк";
    case "cash": return "Готівка";
    case "prro": return "ПРРО";
    case "card": return "Картка";
    default: return paymentType;
  }
};

// Package Section Sub-component
interface PackageSectionProps {
  icon: React.ReactNode;
  label: string;
  items: Document[];
  defaultOpen?: boolean;
  emptyMessage?: string;
  onNavigateToDocument?: (docId: string) => void;
}

const PackageSection = ({ 
  icon, label, items, defaultOpen = true, emptyMessage = "Немає документів", onNavigateToDocument 
}: PackageSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen && items.length > 0);
  
  if (items.length === 0) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/30 rounded-lg px-2 transition-colors">
        <div className="flex items-center gap-2 flex-1">
          {icon}
          <span className="font-medium text-sm">{label}</span>
          <Badge variant="outline" className="ml-auto text-xs">{items.length}</Badge>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 pl-6 border-l-2 border-muted ml-3 mt-1">
          {items.map(doc => {
            const typeConfig = documentTypeConfigs[doc.type];
            const statusConfig = documentStatusConfigs[doc.status];
            return (
              <div 
                key={doc.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors"
                onClick={() => onNavigateToDocument?.(doc.id)}
              >
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title || typeConfig?.label || doc.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.number} · {format(new Date(doc.date), "dd.MM.yy", { locale: uk })}
                    {doc.amount && ` · ${formatCurrency(doc.amount)}`}
                  </p>
                </div>
                <Badge variant="secondary" className={cn("text-[10px] h-5", statusConfig?.color)}>{statusConfig?.label}</Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

interface DocumentRelationshipsTabProps {
  document: Document;
  cabinetType?: "fop" | "tov";
  linkedDocumentsResolved?: Document[];
  onNavigateToContractor?: () => void;
  onNavigateToPayments?: () => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToAudit?: (auditId: string) => void;
  onAddToAuditPackage?: () => void;
  onAddDocumentToPackage?: () => void;
  className?: string;
}

export const DocumentRelationshipsTab = ({
  document,
  cabinetType = "fop",
  linkedDocumentsResolved,
  onNavigateToContractor,
  onNavigateToPayments,
  onNavigateToIncomeBook,
  onNavigateToReports,
  onNavigateToDocument,
  onNavigateToAudit,
  onAddToAuditPackage,
  onAddDocumentToPackage,
  className,
}: DocumentRelationshipsTabProps) => {
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  
  const linkedDocs = linkedDocumentsResolved || [];
  const hasLinkedDocuments = linkedDocs.length > 0;
  
  // Build package structure
  const packageStructure = useMemo(() => buildPackageStructure(document, linkedDocs), [document, linkedDocs]);
  
  // Package stats
  const packageStats = useMemo(() => {
    const { annexes, amendments, discrepancyActs } = packageStructure;
    return {
      total: annexes.length + amendments.length + discrepancyActs.length,
      annexes: annexes.length,
      amendments: amendments.length,
      discrepancyActs: discrepancyActs.length,
    };
  }, [packageStructure]);
  
  // Group semantic links (excluding package items)
  const groupedLinks = useMemo(() => {
    if (!linkedDocs.length) return {};
    
    const groups: Record<LinkGroup, Array<{ doc: Document; linkType: LinkType }>> = {
      hierarchy: [],
      financial: [],
      versions: [],
      references: [],
      packages: [],
    };
    
    linkedDocs.forEach((linkedDoc) => {
      // Skip items already in package structure
      const isInPackage = classifyDocumentForPackage(document, linkedDoc) !== null;
      if (isInPackage) return;
      
      const linkType = determineLinkType(document, linkedDoc);
      const group = linkTypeToGroup[linkType];
      groups[group].push({ doc: linkedDoc, linkType });
    });
    
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .sort(([a], [b]) => linkGroupConfig[a as LinkGroup].order - linkGroupConfig[b as LinkGroup].order)
      .reduce((acc, [group, items]) => {
        acc[group as LinkGroup] = items;
        return acc;
      }, {} as Record<LinkGroup, Array<{ doc: Document; linkType: LinkType }>>);
  }, [document, linkedDocs]);
  
  const hasSemanticLinks = Object.keys(groupedLinks).length > 0;
  
  // Payments
  const payments = (document.linkedPayments || []).map(lp => ({
    id: lp.id,
    date: lp.date,
    amount: lp.amount,
    type: "income" as const,
    status: "completed" as const,
    description: lp.source || "Оплата за документом",
  }));
  
  // Income book records
  const linkedIncomeBookRecords = incomeBookRecords.filter(r => r.documentFlowId === document.id);
  
  // Audits
  const documentAudits = getAuditsForDocument(document.id);
  
  // Document configs
  const docTypeConfig = documentTypeConfigs[document.type];
  const docStatusConfig = documentStatusConfigs[document.status];

  return (
    <div className={cn("space-y-6", className)}>
      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Graph View */}
      {viewMode === "graph" && (
        <DocumentRelationshipGraph
          document={document}
          linkedDocuments={linkedDocs}
          incomeBookRecords={linkedIncomeBookRecords}
          audits={documentAudits}
          onNavigateToDocument={onNavigateToDocument}
          onNavigateToContractor={onNavigateToContractor}
          onNavigateToPayments={onNavigateToPayments}
          onNavigateToIncomeBook={onNavigateToIncomeBook}
          onNavigateToAudit={onNavigateToAudit}
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          {/* 1. Package Structure Card */}
          {(packageStats.total > 0 || ["contract", "supply-contract", "rental-agreement"].includes(document.type)) && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Пакет документа
                    {packageStats.total > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{packageStats.total}</Badge>
                    )}
                  </CardTitle>
                  {onAddDocumentToPackage && (
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={onAddDocumentToPackage}>
                      <Plus className="w-3.5 h-3.5" />
                      Додати
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Main document summary */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <Package className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{document.title || docTypeConfig?.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {document.number} · {format(new Date(document.date), "dd.MM.yy", { locale: uk })}
                    </p>
                  </div>
                  <Badge className="text-[10px] bg-primary/10 text-primary border-0">Головний</Badge>
                </div>
                
                {/* Package sections */}
                {packageStats.total > 0 ? (
                  <div className="space-y-1">
                    <PackageSection
                      icon={<Paperclip className="w-4 h-4 text-purple-600" />}
                      label="Додатки"
                      items={packageStructure.annexes}
                      onNavigateToDocument={onNavigateToDocument}
                    />
                    <PackageSection
                      icon={<FilePen className="w-4 h-4 text-amber-600" />}
                      label="Додаткові угоди"
                      items={packageStructure.amendments}
                      onNavigateToDocument={onNavigateToDocument}
                    />
                    <PackageSection
                      icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
                      label="Акти розбіжностей"
                      items={packageStructure.discrepancyActs}
                      defaultOpen={false}
                      onNavigateToDocument={onNavigateToDocument}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Додатків та додаткових угод поки немає
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 2. Semantic Links Card */}
          {hasSemanticLinks && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  Пов'язані документи
                  <Badge variant="secondary" className="text-[10px]">
                    {Object.values(groupedLinks).flat().length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TooltipProvider>
                  {(Object.entries(groupedLinks) as [LinkGroup, Array<{ doc: Document; linkType: LinkType }>][]).map(([group, items]) => {
                    const groupConfig = linkGroupConfig[group];
                    
                    return (
                      <div key={group} className="space-y-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-dashed">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {groupConfig.labelUk}
                          </span>
                          <Badge variant="outline" className="text-[10px] h-4">{items.length}</Badge>
                        </div>
                        
                        <div className="space-y-1.5">
                          {items.map(({ doc: linkedDoc, linkType }) => {
                            const config = documentTypeConfigs[linkedDoc.type];
                            const statusConfig = documentStatusConfigs[linkedDoc.status];
                            const Icon = config?.icon || FileText;
                            const linkConfig = linkTypeConfig[linkType];
                            
                            return (
                              <div 
                                key={linkedDoc.id}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer group border border-transparent hover:border-muted-foreground/10"
                                onClick={() => onNavigateToDocument?.(linkedDoc.id)}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <LinkDirectionIcon linkType={linkType} />
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-medium truncate">{config?.label || linkedDoc.type}</p>
                                        <Badge variant="outline" className={cn("text-[10px] h-5 shrink-0", statusConfig?.color)}>
                                          {statusConfig?.label}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {linkedDoc.number} · {format(new Date(linkedDoc.date), "dd.MM.yyyy", { locale: uk })}
                                        {linkedDoc.amount && ` · ${formatCurrency(linkedDoc.amount)}`}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge variant="secondary" className="text-[10px] gap-1 hidden sm:flex">
                                    {linkConfig.labelUk}
                                  </Badge>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </TooltipProvider>
              </CardContent>
            </Card>
          )}

          {/* 3. Payments Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Платежі
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Немає пов'язаних платежів</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs">Дата</TableHead>
                        <TableHead className="h-8 text-xs">Сума</TableHead>
                        <TableHead className="h-8 text-xs">Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="py-2 text-sm">{payment.date}</TableCell>
                          <TableCell className="py-2 text-sm font-medium">+{formatCurrency(payment.amount)}</TableCell>
                          <TableCell className="py-2">{getPaymentStatusBadge(payment.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-3 border-t">
                    <Button variant="ghost" size="sm" className="w-full gap-1 text-xs" onClick={onNavigateToPayments}>
                      Всі платежі
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 4. Income Book (FOP) */}
          {cabinetType === "fop" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  Книга доходів
                </CardTitle>
              </CardHeader>
              <CardContent>
                {linkedIncomeBookRecords.length > 0 ? (
                  <div className="space-y-2">
                    {linkedIncomeBookRecords.map((record) => (
                      <div 
                        key={record.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                          record.status === "income" && "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                        )}
                        onClick={() => onNavigateToIncomeBook?.()}
                      >
                        {getIncomeStatusIcon(record.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium truncate">{record.documentNumber || record.id}</p>
                            <Badge variant="secondary" className="text-[10px] gap-1 h-5">
                              {getPaymentTypeIcon(record.paymentType)}
                              {getPaymentTypeLabel(record.paymentType)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {format(new Date(record.date), "dd.MM.yyyy", { locale: uk })} · {record.description}
                          </p>
                        </div>
                        <p className={cn("text-sm font-semibold", "text-emerald-600 dark:text-emerald-400")}>
                          +{formatCurrency(record.inIncomeBook)}
                        </p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Ще не внесено до Книги доходів</p>
                    <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={onNavigateToIncomeBook}>
                      Перейти
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 5. Audit Packages */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderCheck className="w-4 h-4 text-muted-foreground" />
                  Пакети перевірок
                </CardTitle>
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onAddToAuditPackage}>
                  <Plus className="w-3.5 h-3.5" />
                  Додати
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documentAudits.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <FolderCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Документ не включено до жодної перевірки</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documentAudits.map((audit: TaxAudit) => {
                    const typeConfig = auditTypeConfig[audit.type];
                    const statusConfig = auditStatusConfig[audit.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div 
                        key={audit.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => onNavigateToAudit?.(audit.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileSearch className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm font-medium truncate">{audit.orderNumber}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {typeConfig.label} • {audit.period}
                          </p>
                        </div>
                        <Badge className={cn("shrink-0 text-[10px]", statusConfig.color)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
