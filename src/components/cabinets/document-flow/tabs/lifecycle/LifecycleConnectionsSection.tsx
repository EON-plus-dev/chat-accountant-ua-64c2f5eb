/**
 * LifecycleConnectionsSection — Підрозділ "Зв'язки"
 * 
 * Містить:
 * - Блок "Як документ потрапив у систему"
 * - Блок "Пов'язані документи"
 * - Блок "Модулі системи"
 * - Блок "Інтеграції"
 */

import { useState } from "react";
import { 
  Download, Upload, FileText, ArrowUpRight, ArrowDownLeft, Building2,
  Link2, ExternalLink, RefreshCw, Settings, CheckCircle2, AlertTriangle,
  Clock, ChevronDown, ChevronUp, BookOpen, Calculator, FileBarChart,
  PackageCheck, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

import type { 
  Document as FlowDocument,
  ExternalIntegration,
  InternalLink,
  InternalModule
} from "@/config/documentFlowConfig";
import type { CabinetType, Cabinet } from "@/types/cabinet";

// ============================================
// TYPES
// ============================================

type SourceType = "UPLOAD" | "EXTERNAL_INTEGRATION" | "GENERATED" | "INTERNAL_RECEIVED" | "INTERNAL_CREATED";
type Direction = "incoming" | "outgoing" | "internal";

interface LifecycleConnectionsSectionProps {
  document: FlowDocument;
  cabinet: Cabinet;
  cabinetType: CabinetType;
  linkedDocumentsResolved?: FlowDocument[];
  externalIntegrations?: ExternalIntegration[];
  internalLinks?: InternalLink[];
  sourceType?: SourceType;
  sourceChannel?: string;
  direction?: Direction;
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToModule?: (module: InternalModule, entityId: string) => void;
  className?: string;
}

// ============================================
// HELPERS
// ============================================

const documentTypeLabels: Record<string, string> = {
  contract: "Договір",
  invoice: "Рахунок",
  act: "Акт",
  waybill: "Накладна",
  "tax-invoice": "Податкова накладна",
  ttn: "ТТН",
  "power-of-attorney": "Довіреність",
  "supply-contract": "Договір постачання",
  "rental-agreement": "Договір оренди",
  "fop-service-contract": "Договір на послуги",
  "bank-statement": "Виписка",
  "prro-receipt": "Чек ПРРО",
};

const linkTypeLabels: Record<string, string> = {
  parent: "Основний документ",
  child: "Дочірній документ",
  amendment: "Додаткова угода",
  annex: "Додаток",
  invoice_to_contract: "Рахунок до договору",
  act_to_contract: "Акт до договору",
  payment_basis: "Підстава для оплати",
  payment_confirmation: "Підтвердження оплати",
  supersedes: "Замінює",
  superseded_by: "Замінено на",
};

const moduleLabels: Partial<Record<InternalModule, { label: string; icon: React.ComponentType<{ className?: string }> }>> = {
  incomeBook: { label: "Книга доходів", icon: BookOpen },
  operations: { label: "Фінансові операції", icon: Calculator },
  reports: { label: "Звіти / декларації", icon: FileBarChart },
  payments: { label: "Платежі", icon: Zap },
  auditPackages: { label: "Пакети перевірок", icon: PackageCheck },
  inventory: { label: "Склад", icon: PackageCheck },
  payroll: { label: "Зарплата", icon: Calculator },
};

const systemLabels: Record<string, { label: string; type: string }> = {
  medoc: { label: "M.E.Doc", type: "ЕДО" },
  vchasno: { label: "Vchasno", type: "ЕДО" },
  erpn: { label: "ЄРПН", type: "Податкова" },
  tax_cabinet: { label: "Кабінет платника", type: "Податкова" },
  "1c": { label: "1С", type: "ERP" },
  monobank: { label: "Monobank", type: "Банк" },
  privatbank: { label: "ПриватБанк", type: "Банк" },
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  registered: { label: "Зареєстровано", variant: "default" },
  received: { label: "Отримано", variant: "default" },
  sent: { label: "Надіслано", variant: "default" },
  processed: { label: "Оброблено", variant: "default" },
  queued: { label: "У черзі", variant: "secondary" },
  pending: { label: "Очікує", variant: "secondary" },
  not_connected: { label: "Не підключено", variant: "outline" },
  error: { label: "Помилка", variant: "destructive" },
};

// ============================================
// SUB-COMPONENTS
// ============================================

const SourceBlock = ({ 
  sourceType, 
  sourceChannel, 
  direction, 
  createdBy 
}: { 
  sourceType: SourceType; 
  sourceChannel?: string; 
  direction: Direction;
  createdBy?: string;
}) => {
  const getSourceInfo = () => {
    switch (sourceType) {
      case "EXTERNAL_INTEGRATION":
        return {
          icon: Download,
          label: `Отримано через ${sourceChannel || "ЕДО"}`,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-950/30",
        };
      case "GENERATED":
        return {
          icon: FileText,
          label: "Створено в AI-Бухгалтер",
          color: "text-primary",
          bg: "bg-primary/5",
        };
      default:
        return {
          icon: Upload,
          label: "Завантажено користувачем",
          color: "text-muted-foreground",
          bg: "bg-muted/50",
        };
    }
  };

  const directionLabels: Record<Direction, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    incoming: { label: "Вхідний", icon: ArrowDownLeft },
    outgoing: { label: "Вихідний", icon: ArrowUpRight },
    internal: { label: "Внутрішній", icon: FileText },
  };

  const source = getSourceInfo();
  const dirInfo = directionLabels[direction];
  const DirIcon = dirInfo.icon;
  const SourceIcon = source.icon;

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg shrink-0", source.bg)}>
            <SourceIcon className={cn("w-5 h-5", source.color)} />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{source.label}</span>
              <Badge variant="outline" className="text-[10px] gap-1">
                <DirIcon className="w-3 h-3" />
                {dirInfo.label}
              </Badge>
            </div>
            {createdBy && (
              <p className="text-xs text-muted-foreground">
                Ініціатор: {createdBy}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LinkedDocumentsBlock = ({
  documents,
  parentDocument,
  onNavigate,
}: {
  documents?: FlowDocument[];
  parentDocument: FlowDocument;
  onNavigate?: (docId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!documents || documents.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            Пов'язані документи
            <Badge variant="secondary" className="text-[10px] ml-auto">0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground text-center py-4">
            Немає пов'язаних документів
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              Пов'язані документи
              <Badge variant="secondary" className="text-[10px] ml-auto mr-2">{documents.length}</Badge>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Desktop: Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Тип</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Номер</TableHead>
                    <TableHead className="w-[100px]">Дата</TableHead>
                    <TableHead className="text-right w-[100px]">Сума</TableHead>
                    <TableHead className="w-[100px]">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow 
                      key={doc.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onNavigate?.(doc.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs">{documentTypeLabels[doc.type] || doc.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        Пов'язаний
                      </TableCell>
                      <TableCell className="text-xs">{doc.number}</TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(doc.date), "dd.MM.yy")}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {doc.amount ? `${doc.amount.toLocaleString("uk-UA")} ₴` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {doc.status === "signed" ? "Підписано" :
                           doc.status === "sent" ? "Надіслано" :
                           doc.status === "draft" ? "Чернетка" :
                           doc.status === "archived" ? "Архів" : doc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: Cards */}
            <div className="md:hidden space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onNavigate?.(doc.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium">
                          {documentTypeLabels[doc.type] || doc.type}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {doc.status === "signed" ? "Підписано" : doc.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {doc.number} • {format(new Date(doc.date), "dd.MM.yyyy")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Пов'язаний
                      </p>
                    </div>
                    {doc.amount && (
                      <span className="text-sm font-medium shrink-0">
                        {doc.amount.toLocaleString("uk-UA")} ₴
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const ModulesBlock = ({
  links,
  onNavigate,
}: {
  links?: InternalLink[];
  onNavigate?: (module: InternalModule, entityId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!links || links.length === 0) return null;

  // Group by module
  const grouped = links.reduce((acc, link) => {
    if (!acc[link.module]) acc[link.module] = [];
    acc[link.module].push(link);
    return acc;
  }, {} as Record<InternalModule, InternalLink[]>);

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Зв'язки з модулями системи
              <Badge variant="secondary" className="text-[10px] ml-auto mr-2">{links.length}</Badge>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {Object.entries(grouped).map(([module, moduleLinks]) => {
              const moduleInfo = moduleLabels[module as InternalModule];
              const Icon = moduleInfo?.icon || FileText;
              
              return (
                <div key={module} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />
                    {moduleInfo?.label || module}
                  </div>
                  {moduleLinks.map((link, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors group"
                      onClick={() => onNavigate?.(link.module, link.linkedEntity.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm">{link.linkedEntity.label}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge 
                            variant={link.linkedEntity.status === "posted" ? "default" : "secondary"} 
                            className="text-[10px]"
                          >
                            {link.linkedEntity.status === "posted" ? "Проведено" :
                             link.linkedEntity.status === "pending" ? "Очікує" :
                             link.linkedEntity.status === "draft" ? "Чернетка" :
                             link.linkedEntity.status === "active" ? "Активний" : link.linkedEntity.status}
                          </Badge>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const IntegrationsBlock = ({
  integrations,
}: {
  integrations?: ExternalIntegration[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!integrations || integrations.length === 0) return null;

  const handleRefresh = (system: string) => {
    toast({
      title: "Оновлення статусу",
      description: `Оновлення статусу з ${systemLabels[system]?.label || system} (демо)`,
    });
  };

  const handleOpenExternal = (system: string) => {
    toast({
      title: "Відкриття",
      description: `Відкриття в ${systemLabels[system]?.label || system} (демо)`,
    });
  };

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              Інтеграції
              <Badge variant="secondary" className="text-[10px] ml-auto mr-2">{integrations.length}</Badge>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Desktop: Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Система</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Остання подія</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map((integration, idx) => {
                    const sysInfo = systemLabels[integration.system] || { label: integration.system, type: "—" };
                    const statusInfo = statusLabels[integration.status] || { label: integration.status, variant: "outline" as const };
                    
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-sm">{sysInfo.label}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{sysInfo.type}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="text-[10px] gap-1">
                            {integration.status === "error" && <AlertTriangle className="w-3 h-3" />}
                            {integration.status === "registered" && <CheckCircle2 className="w-3 h-3" />}
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {integration.lastSyncAt 
                            ? format(new Date(integration.lastSyncAt), "dd.MM.yy HH:mm")
                            : "—"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {integration.actions?.includes("refresh") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleRefresh(integration.system)}
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {integration.actions?.includes("open_external") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleOpenExternal(integration.system)}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {integration.actions?.includes("configure") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => toast({ title: "Налаштування", description: "Налаштування інтеграції (демо)" })}
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: Cards */}
            <div className="md:hidden space-y-2">
              {integrations.map((integration, idx) => {
                const sysInfo = systemLabels[integration.system] || { label: integration.system, type: "—" };
                const statusInfo = statusLabels[integration.status] || { label: integration.status, variant: "outline" as const };
                
                return (
                  <div key={idx} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{sysInfo.label}</span>
                          <Badge variant="outline" className="text-[10px]">{sysInfo.type}</Badge>
                        </div>
                        <Badge variant={statusInfo.variant} className="text-[10px] gap-1">
                          {integration.status === "error" && <AlertTriangle className="w-3 h-3" />}
                          {statusInfo.label}
                        </Badge>
                        {integration.lastSyncAt && (
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(integration.lastSyncAt), "dd.MM.yyyy HH:mm")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {integration.actions?.includes("refresh") && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRefresh(integration.system)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Для деталей по кожній інтеграційній події скористайтесь вкладкою "Історія".
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const LifecycleConnectionsSection = ({
  document,
  cabinet,
  cabinetType,
  linkedDocumentsResolved,
  externalIntegrations,
  internalLinks,
  sourceType = "UPLOAD",
  sourceChannel,
  direction = "outgoing",
  onNavigateToDocument,
  onNavigateToModule,
  className,
}: LifecycleConnectionsSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Block 1: How document entered the system */}
      <SourceBlock
        sourceType={sourceType}
        sourceChannel={sourceChannel}
        direction={direction}
        createdBy={document.createdBy}
      />

      {/* Block 2: Related documents */}
      <LinkedDocumentsBlock
        documents={linkedDocumentsResolved}
        parentDocument={document}
        onNavigate={onNavigateToDocument}
      />

      {/* Block 3: System modules */}
      <ModulesBlock
        links={internalLinks}
        onNavigate={onNavigateToModule}
      />

      {/* Block 4: External integrations */}
      <IntegrationsBlock
        integrations={externalIntegrations}
      />
    </div>
  );
};
