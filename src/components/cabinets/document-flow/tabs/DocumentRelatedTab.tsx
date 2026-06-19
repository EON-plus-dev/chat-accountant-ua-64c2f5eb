import { useState, useMemo } from "react";
import { 
  Building2, CreditCard, BookOpen, FileText, FolderCheck, 
  ExternalLink, ChevronRight, Link2, AlertCircle, FileSearch, Plus,
  TrendingUp, TrendingDown, Banknote, Wallet, Receipt,
  ArrowUp, ArrowDown, FileEdit, Paperclip, CheckCircle, RefreshCw, 
  Archive as ArchiveIcon, GitBranch, Link as LinkIcon, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Helper function for income status icons
const getIncomeStatusIcon = (status: string) => {
  switch (status) {
    case "income":
      return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case "return":
      return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    case "clarification":
      return <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    default:
      return <TrendingUp className="w-4 h-4 text-muted-foreground" />;
  }
};

// Helper function for payment type icons
const getPaymentTypeIcon = (paymentType: string) => {
  switch (paymentType) {
    case "bank":
      return <Banknote className="w-3.5 h-3.5" />;
    case "cash":
      return <Wallet className="w-3.5 h-3.5" />;
    case "prro":
      return <Receipt className="w-3.5 h-3.5" />;
    default:
      return <CreditCard className="w-3.5 h-3.5" />;
  }
};

// Helper function for payment type labels
const getPaymentTypeLabel = (paymentType: string) => {
  switch (paymentType) {
    case "bank":
      return "Банк";
    case "cash":
      return "Готівка";
    case "prro":
      return "ПРРО";
    case "card":
      return "Картка";
    default:
      return paymentType;
  }
};

interface RelatedPayment {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  status: "completed" | "pending" | "scheduled";
  description?: string;
}

interface RelatedReport {
  id: string;
  name: string;
  period: string;
  status: "draft" | "prepared" | "submitted";
}

// Generate dynamic reports based on document date
const generateReportsForDocument = (docDate: string): RelatedReport[] => {
  const date = new Date(docDate);
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();
  
  // Determine quarter
  const quarter = Math.floor(month / 3) + 1;
  const quarterLabel = `${quarter} кв. ${year}`;
  
  // Month name for ЄСВ
  const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", 
                      "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
  const monthLabel = `${monthNames[month]} ${year}`;
  
  return [
    { id: "r1", name: "Єдиний податок", period: quarterLabel, status: "prepared" },
    { id: "r2", name: "ЄСВ", period: monthLabel, status: "submitted" },
  ];
};

/**
 * Визначає тип зв'язку між документами на основі їх типів та дат
 */
const determineLinkType = (sourceDoc: Document, targetDoc: Document): LinkType => {
  // Amendment detection: same contractor, same type group, later date
  if (targetDoc.type === sourceDoc.type && 
      new Date(targetDoc.date) > new Date(sourceDoc.date) &&
      targetDoc.contractor?.id === sourceDoc.contractor?.id) {
    return "amendment";
  }
  
  // Payment chain: invoice → act → payment
  if (sourceDoc.type === "invoice" && targetDoc.type === "act") {
    return "child";
  }
  if (sourceDoc.type === "contract" && ["invoice", "act"].includes(targetDoc.type)) {
    return "child";
  }
  if (targetDoc.type === "contract" && ["invoice", "act"].includes(sourceDoc.type)) {
    return "parent";
  }
  
  // Financial links
  if (sourceDoc.type === "invoice" && targetDoc.type === "payment-order") {
    return "payment-basis";
  }
  if (sourceDoc.type === "payment-order" && targetDoc.type === "invoice") {
    return "payment-confirm";
  }
  
  // Annex detection
  if (targetDoc.number?.includes("Додаток") || targetDoc.title?.includes("Додаток")) {
    return "annex";
  }
  
  // Default to related
  return "related";
};

/**
 * Іконка напрямку зв'язку з tooltip
 */
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

interface DocumentRelatedTabProps {
  document: Document;
  cabinetType?: "fop" | "tov";
  // Resolved linked documents (full Document objects, not just IDs)
  linkedDocumentsResolved?: Document[];
  // Contractor validation status from summary.parties
  contractorValidationStatus?: "valid" | "pending" | "invalid" | "unknown";
  onNavigateToContractor?: () => void;
  onNavigateToPayments?: () => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToAudit?: (auditId: string) => void;
  onAddToAuditPackage?: () => void;
  onCreatePayment?: () => void;
  className?: string;
}

export const DocumentRelatedTab = ({
  document,
  cabinetType = "fop",
  linkedDocumentsResolved,
  contractorValidationStatus: contractorValidationStatusProp,
  onNavigateToContractor,
  onNavigateToPayments,
  onNavigateToIncomeBook,
  onNavigateToReports,
  onNavigateToDocument,
  onNavigateToAudit,
  onAddToAuditPackage,
  onCreatePayment,
  className,
}: DocumentRelatedTabProps) => {
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  
  // Payment creation is handled via DocumentDetailHeader dropdown

  const getPaymentStatusBadge = (status: RelatedPayment["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]">Виконано</Badge>;
      case "pending":
        return <Badge variant="secondary" className="text-[10px]">Очікує</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-[10px]">Заплановано</Badge>;
    }
  };

  const getReportStatusBadge = (status: RelatedReport["status"]) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]">Подано</Badge>;
      case "prepared":
        return <Badge variant="secondary" className="text-[10px]">Підготовлено</Badge>;
      case "draft":
        return <Badge variant="outline" className="text-[10px]">Чернетка</Badge>;
    }
  };

  // Use real linked payments from document
  const payments: RelatedPayment[] = (document.linkedPayments || []).map(lp => ({
    id: lp.id,
    date: lp.date,
    amount: lp.amount,
    type: "income" as const,
    status: "completed" as const,
    description: lp.source || "Оплата за документом",
  }));
  
  const hasNoPayments = payments.length === 0;

  // Calculate total from linked payments
  const linkedAmount = document.linkedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  // Get resolved linked documents or use IDs
  const linkedDocs = linkedDocumentsResolved || [];
  const hasLinkedDocuments = linkedDocs.length > 0 || (document.linkedDocuments && document.linkedDocuments.length > 0);

  // Generate dynamic reports based on document date
  const reports = generateReportsForDocument(document.date);
  
  // Calculate income book period from document date
  const docDate = new Date(document.date);
  const incomeBookMonth = `${(docDate.getMonth() + 1).toString().padStart(2, "0")}.${docDate.getFullYear()}`;

  // Find income book records linked to this document via documentFlowId
  const linkedIncomeBookRecords = incomeBookRecords.filter(
    r => r.documentFlowId === document.id
  );

  // Get contractor validation status from props or default to pending if contractor exists
  const contractorValidationStatus = contractorValidationStatusProp ?? (document.contractor ? "pending" : undefined);

  // Get audits for graph view
  const documentAudits = getAuditsForDocument(document.id);

  // Групування документів за типом зв'язку
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
      const linkType = determineLinkType(document, linkedDoc);
      const group = linkTypeToGroup[linkType];
      groups[group].push({ doc: linkedDoc, linkType });
    });
    
    // Фільтруємо порожні групи та сортуємо по order
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .sort(([a], [b]) => linkGroupConfig[a as LinkGroup].order - linkGroupConfig[b as LinkGroup].order)
      .reduce((acc, [group, items]) => {
        acc[group as LinkGroup] = items;
        return acc;
      }, {} as Record<LinkGroup, Array<{ doc: Document; linkType: LinkType }>>);
  }, [document, linkedDocs]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <ViewModeToggle 
          value={viewMode} 
          onChange={setViewMode}
        />
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
      {/* Linked Documents Section - Grouped by Link Type */}
      {hasLinkedDocuments && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              Пов'язані документи
              <Badge variant="secondary" className="text-[10px]">
                {linkedDocs.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TooltipProvider>
              {(Object.entries(groupedLinks) as [LinkGroup, Array<{ doc: Document; linkType: LinkType }>][]).map(([group, items]) => {
                const groupConfig = linkGroupConfig[group];
                
                return (
                  <div key={group} className="space-y-2">
                    {/* Group Header */}
                    <div className="flex items-center gap-2 pb-1 border-b border-dashed">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {groupConfig.labelUk}
                      </span>
                      <Badge variant="outline" className="text-[10px] h-4">
                        {items.length}
                      </Badge>
                    </div>
                    
                    {/* Group Items */}
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
                            {/* Link Direction Icon */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                <LinkDirectionIcon linkType={linkType} />
                              </div>
                              
                              {/* Document Info */}
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium truncate">
                                      {config?.label || linkedDoc.type}
                                    </p>
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-[10px] h-5 shrink-0", statusConfig?.color)}
                                    >
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
                            
                            {/* Link Type Badge + Arrow */}
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge 
                                variant="secondary" 
                                className="text-[10px] gap-1 hidden sm:flex"
                              >
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
            
            {/* Empty state fallback for unresolved IDs */}
            {linkedDocs.length === 0 && document.linkedDocuments && document.linkedDocuments.length > 0 && (
              <div className="space-y-1.5">
                {document.linkedDocuments.map((docId) => (
                  <div 
                    key={docId}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => onNavigateToDocument?.(docId)}
                  >
                    <div className="flex items-center gap-2">
                      <FileSearch className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{docId}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payments Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            Платежі / операції
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {hasNoPayments ? (
            <div className="text-center py-6 text-muted-foreground">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Немає пов'язаних платежів</p>
              <p className="text-xs mt-1">Створіть платіж для цього документа</p>
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
                      <TableCell className="py-2 text-sm font-medium">
                        {payment.type === "income" ? "+" : "-"}{formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="py-2">
                        {getPaymentStatusBadge(payment.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-3 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full gap-1 text-xs"
                  onClick={onNavigateToPayments}
                >
                  Всі платежі
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Income Book Section (for FOP) */}
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
                      record.status === "income" && "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30",
                      record.status === "return" && "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/30"
                    )}
                    onClick={() => onNavigateToIncomeBook?.()}
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {getIncomeStatusIcon(record.status)}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">
                          {record.documentNumber || record.txnId || record.id}
                        </p>
                        <Badge variant="secondary" className="text-[10px] gap-1 h-5">
                          {getPaymentTypeIcon(record.paymentType)}
                          {getPaymentTypeLabel(record.paymentType)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {format(new Date(record.date), "dd.MM.yyyy", { locale: uk })} · {record.description}
                      </p>
                      {record.source && (
                        <p className="text-xs text-muted-foreground">
                          Джерело: {record.source === "monobank" ? "Monobank" : 
                                   record.source === "prro" ? "ПРРО" : 
                                   record.source === "privat24" ? "Приват24" : record.source}
                        </p>
                      )}
                    </div>
                    
                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        "text-sm font-semibold",
                        record.status === "income" ? "text-emerald-600 dark:text-emerald-400" : 
                        record.status === "return" ? "text-red-600 dark:text-red-400" : ""
                      )}>
                        {record.status === "return" ? "-" : "+"}{formatCurrency(record.inIncomeBook)}
                      </p>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
                
                {/* Summary row with visual accent */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-dashed">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">Всього в книзі:</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(linkedIncomeBookRecords.reduce((sum, r) => 
                        r.status === "return" ? sum - r.inIncomeBook : sum + r.inIncomeBook, 0
                      ))}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 gap-1"
                      onClick={onNavigateToIncomeBook}
                    >
                      Відкрити
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : linkedAmount > 0 ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">
                    Включено до Книги доходів за{" "}
                    <span className="font-medium">{incomeBookMonth}</span>
                  </p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(linkedAmount)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 gap-1"
                  onClick={onNavigateToIncomeBook}
                >
                  Перейти
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Ще не внесено до Книги доходів
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 gap-1"
                  onClick={onNavigateToIncomeBook}
                >
                  Перейти
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Accounting Section (for TOV) */}
      {cabinetType === "tov" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Облік
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Проведено в обліку</p>
                <p className="text-xs text-muted-foreground">
                  Рахунок 361 · Дебет · {formatCurrency(document.amount || 0)}
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                Проведено
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Звіти / декларації
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              onClick={onNavigateToReports}
            >
              <div>
                <p className="text-sm font-medium">{report.name}</p>
                <p className="text-xs text-muted-foreground">{report.period}</p>
              </div>
              {getReportStatusBadge(report.status)}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Audit Packages Section - Dynamic */}
      {(() => {
        // Get audits that include this document
        const documentAudits = getAuditsForDocument(document.id);
        const hasAudits = documentAudits.length > 0;

        return (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderCheck className="w-4 h-4 text-muted-foreground" />
                  Пакети перевірок
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 gap-1 text-xs"
                  onClick={onAddToAuditPackage}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Додати
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!hasAudits ? (
                <div className="text-center py-6 text-muted-foreground">
                  <FolderCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Документ не включено до жодної перевірки</p>
                  <p className="text-xs mt-1">Додайте документ до пакету перевірки</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documentAudits.map((audit: TaxAudit) => {
                    const typeConfig = auditTypeConfig[audit.type];
                    const statusConfig = auditStatusConfig[audit.status];
                    const StatusIcon = statusConfig.icon;
                    
                    // Find package type for this document in this audit
                    const auditPackageRef = document.auditPackages?.find(ap => ap.auditId === audit.id);
                    const packageTypeLabel = auditPackageRef?.packageType === "request" 
                      ? "Запитаний" 
                      : auditPackageRef?.packageType === "evidence" 
                        ? "Доказ" 
                        : "Відповідь";

                    return (
                      <div 
                        key={audit.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
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
                          {audit.responseDeadline && audit.status === "response-required" && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Дедлайн: {format(new Date(audit.responseDeadline), "dd.MM.yyyy", { locale: uk })}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={cn("shrink-0 text-[10px]", statusConfig.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {packageTypeLabel}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}
        </>
      )}
    </div>
  );
};