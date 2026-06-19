import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Briefcase,
  FileText,
  CreditCard,
  History,
  MoreHorizontal,
  CheckCircle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileQuestion,
  Pencil,
  XCircle,
  Ban,
  Trash2,
  RefreshCw,
  Lock,
  Info,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { toast } from "sonner";
import type { Cabinet } from "@/types/cabinet";
import { 
  getContractorsForCabinet, 
  type Contractor 
} from "@/config/settingsConfig";
import { getDocumentsForCabinet } from "@/config/documentFlowConfig";
import { getContractorPayments, getContractorHistory } from "@/config/contractorHistoryConfig";
import { calculateReliability, calculateContractorStats } from "@/lib/contractorReliability";
import { ContractorReliabilityCard } from "./ContractorReliabilityCard";
import { ContractorRequisitesCard } from "./ContractorRequisitesCard";
import { ContractorContactsCard } from "./ContractorContactsCard";
import { ContractorNotesCard } from "./ContractorNotesCard";
import { ContractorDocumentsSection } from "./ContractorDocumentsSection";
import { ContractorPaymentsSection } from "./ContractorPaymentsSection";
import { ContractorHistorySection } from "./ContractorHistorySection";
import { ContractorFormSheet } from "./ContractorFormSheet";
import { FinMonBadge } from "./FinMonBadge";
import { ContractorInteractionTab } from "./ContractorInteractionTab";
interface ContractorDetailPageProps {
  contractorId: string;
  cabinet: Cabinet;
  mode?: "page" | "sheet";
  onBack?: () => void;
  onClose?: () => void;
  onOpenFullPage?: () => void;
  onNavigateToDocument?: (documentId: string) => void;
  onAddDocument?: () => void;
}

export const ContractorDetailPage = ({
  contractorId,
  cabinet,
  mode = "page",
  onBack,
  onClose,
  onOpenFullPage,
  onNavigateToDocument,
  onAddDocument,
}: ContractorDetailPageProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("requisites");
  const [confirmDialog, setConfirmDialog] = useState<{ type: "deactivate" | "block" | "delete"; open: boolean }>({ type: "delete", open: false });
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  // Get contractor data
  const contractors = getContractorsForCabinet(cabinet);
  const contractor = contractors.find(c => c.id === contractorId);

  // Get documents for this contractor
  const allDocuments = getDocumentsForCabinet(cabinet);
  const contractorDocuments = allDocuments.filter(
    doc => doc.contractor?.code === contractor?.code
  );

  // Get payments and history for reliability calculation
  const payments = contractorId ? getContractorPayments(contractorId) : [];
  const history = contractorId ? getContractorHistory(contractorId) : [];

  // Calculate statistics
  const stats = calculateContractorStats(contractorDocuments, contractor);

  // Calculate dynamic reliability score
  const reliabilityResult = useMemo(() => 
    calculateReliability(contractor, contractorDocuments, payments, history),
    [contractor, contractorDocuments, payments, history]
  );

  // Action handlers
  const handleEdit = () => {
    setEditSheetOpen(true);
  };

  const handleToggleStatus = () => {
    setConfirmDialog({ type: "deactivate", open: true });
  };

  const handleBlock = () => {
    setConfirmDialog({ type: "block", open: true });
  };

  const handleDelete = () => {
    setConfirmDialog({ type: "delete", open: true });
  };

  const confirmAction = () => {
    switch (confirmDialog.type) {
      case "deactivate":
        toast.success(contractor?.status === "active" ? "Контрагента деактивовано" : "Контрагента активовано");
        break;
      case "block":
        toast.success("Контрагента заблоковано");
        break;
      case "delete":
        toast.success("Контрагента видалено");
        onBack?.();
        break;
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  if (!contractor) {
    if (mode === "sheet") {
      return (
        <div className="p-4 text-center py-12">
          <p className="text-muted-foreground">Контрагента не знайдено</p>
        </div>
      );
    }
    return (
      <div className="p-4 md:p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Контрагента не знайдено</p>
        </div>
      </div>
    );
  }

  const getTypeIcon = () => {
    switch (contractor.type) {
      case "legal":
        return <Building2 className="h-5 w-5" />;
      case "fop":
        return <Briefcase className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const content = (
    <div className={cn("space-y-4 md:space-y-6", mode === "sheet" && "p-4 sm:p-6")}>
      {/* Header */}
      <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {getTypeIcon()}
              <h1 className={cn("text-lg md:text-xl font-bold truncate", mode !== "sheet" && "hidden sm:block")}>
                {contractor.name}
              </h1>
              {contractor.status === "active" && (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-200 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Активний
                </Badge>
              )}
              {contractor.linkedCabinetId && (
                <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30 text-xs">
                  <RefreshCw className="h-3 w-3" />
                  Синхронізовано
                </Badge>
              )}
              {contractor.isEdrsVerified && !contractor.linkedCabinetId && (
                <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200 text-xs">
                  <Shield className="h-3 w-3" />
                  ЄДРС
                </Badge>
              )}
              {contractor.tags?.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {contractor.type === "legal" ? "ЄДРПОУ" : "ІПН"}: {contractor.code}
            </p>
          </div>
          
          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!contractor.linkedCabinetId && !contractor.isEdrsVerified ? (
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Редагувати
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <Lock className="h-4 w-4 mr-2" />
                  {contractor.linkedCabinetId 
                    ? "Дані керуються контрагентом"
                    : "Захищено даними з ЄДР"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleToggleStatus}>
                {contractor.status === "active" ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Деактивувати
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Активувати
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBlock} className="text-orange-600 focus:text-orange-600">
                <Ban className="h-4 w-4 mr-2" />
                Заблокувати
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Видалити
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Stats - Optimized: removed duplicate rating */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-lg border p-2.5 text-center hover:shadow-sm transition-all">
            <p className={cn(
              "text-lg font-bold",
              stats.balance > 0 ? "text-green-600 dark:text-green-400" : 
              stats.balance < 0 ? "text-destructive" : ""
            )}>
              {stats.balance > 0 ? "+" : ""}{stats.balance.toLocaleString("uk-UA")} ₴
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">баланс</p>
          </div>
          <div className="rounded-lg border p-2.5 text-center hover:shadow-sm transition-all">
            <p className="text-lg font-bold">{contractorDocuments.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">документів</p>
          </div>
          <div className="rounded-lg border p-2.5 text-center hover:shadow-sm transition-all">
            <p className="text-lg font-bold">{contractor.activeContractsCount || 0}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">договорів</p>
          </div>
          <div className="rounded-lg border p-2.5 text-center hover:shadow-sm transition-all min-w-0">
            <p className="text-sm font-medium truncate">
              {contractor.lastActivityDate 
                ? formatDistanceToNow(new Date(contractor.lastActivityDate), { locale: uk })
                : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">остання дія</p>
          </div>
        </div>

      {/* Reliability Card - Using dynamic calculation */}
      <ContractorReliabilityCard
        score={reliabilityResult.score}
        previousScore={reliabilityResult.previousScore}
        breakdown={reliabilityResult.breakdown}
        scoreHistory={reliabilityResult.scoreHistory}
      />

        {/* Tabs - 5 tabs now */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "w-full grid grid-cols-5 max-w-2xl",
            isMobile && "sticky top-0 z-10 bg-background border-b"
          )}>
            <TabsTrigger value="requisites" className="gap-1.5">
              <User className="h-4 w-4" />
              <span className={cn(isMobile && "sr-only")}>Реквізити</span>
            </TabsTrigger>
            <TabsTrigger value="interaction" className="gap-1.5">
              <Package className="h-4 w-4" />
              <span className={cn(isMobile && "sr-only")}>Взаємодія</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span className={cn(isMobile && "sr-only")}>Документи</span>
              {contractorDocuments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 hidden sm:inline-flex">
                  {contractorDocuments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5">
              <CreditCard className="h-4 w-4" />
              <span className={cn(isMobile && "sr-only")}>Оплати</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              <span className={cn(isMobile && "sr-only")}>Історія</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requisites" className="mt-4 space-y-4">
            <ContractorRequisitesCard contractor={contractor} onEdit={handleEdit} />
            <ContractorContactsCard contractor={contractor} />
            
            {/* Financial Monitoring Section */}
            {contractor.finMonStatus && contractor.finMonStatus !== "not-required" && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Фінансовий моніторинг
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <FinMonBadge 
                      status={contractor.finMonStatus} 
                      dueDate={contractor.finMonDueDate}
                      showLabel 
                    />
                    {contractor.finMonCompletedAt && (
                      <span className="text-xs text-muted-foreground">
                        Анкета від {new Date(contractor.finMonCompletedAt).toLocaleDateString("uk-UA")}
                      </span>
                    )}
                  </div>
                  {contractor.finMonStatus === "pending" && (
                    <Button size="sm" className="mt-3 w-full gap-2">
                      <FileQuestion className="h-4 w-4" />
                      Надіслати анкету
                    </Button>
                  )}
                  {contractor.finMonStatus === "expired" && (
                    <Button size="sm" variant="destructive" className="mt-3 w-full gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      Оновити анкету
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            
            <ContractorNotesCard contractor={contractor} />
          </TabsContent>

          <TabsContent value="interaction" className="mt-4">
            <ContractorInteractionTab
              contractor={contractor}
              onNavigateToDocument={onNavigateToDocument}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <ContractorDocumentsSection
              documents={contractorDocuments}
              onDocumentClick={onNavigateToDocument}
              onAddDocument={onAddDocument}
            />
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <ContractorPaymentsSection 
              stats={stats} 
              contractorId={contractorId}
              cabinet={cabinet}
              contractor={contractor}
              onNavigateToDocument={onNavigateToDocument}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ContractorHistorySection 
              contractorId={contractorId}
              onNavigateToDocument={onNavigateToDocument}
            />
          </TabsContent>
        </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <div className="h-full overflow-auto p-4 pb-20">
        {content}
        
        {/* Confirmation Dialogs */}
        <ConfirmationDialog 
          type={confirmDialog.type}
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          onConfirm={confirmAction}
          contractorName={contractor.name}
        />
        
        {/* Edit Sheet */}
        <ContractorFormSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          contractor={contractor}
          onSuccess={() => {
            // In real app, would refresh data
          }}
        />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {content}
        
        {/* Confirmation Dialogs */}
        <ConfirmationDialog 
          type={confirmDialog.type}
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          onConfirm={confirmAction}
          contractorName={contractor.name}
        />
        
        {/* Edit Sheet */}
        <ContractorFormSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          contractor={contractor}
          onSuccess={() => {
            // In real app, would refresh data
          }}
        />
      </div>
    </ScrollArea>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({
  type,
  open,
  onOpenChange,
  onConfirm,
  contractorName,
}: {
  type: "deactivate" | "block" | "delete";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  contractorName: string;
}) => {
  const config = {
    deactivate: {
      title: "Деактивувати контрагента?",
      description: `Контрагент "${contractorName}" буде позначений як неактивний. Ви зможете активувати його пізніше.`,
      action: "Деактивувати",
      variant: "default" as const,
    },
    block: {
      title: "Заблокувати контрагента?",
      description: `Контрагент "${contractorName}" буде заблокований. Нові документи та операції будуть недоступні.`,
      action: "Заблокувати",
      variant: "default" as const,
    },
    delete: {
      title: "Видалити контрагента?",
      description: `Контрагент "${contractorName}" буде видалений назавжди. Цю дію неможливо скасувати.`,
      action: "Видалити",
      variant: "destructive" as const,
    },
  };

  const { title, description, action, variant } = config[type];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Скасувати</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}>
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
