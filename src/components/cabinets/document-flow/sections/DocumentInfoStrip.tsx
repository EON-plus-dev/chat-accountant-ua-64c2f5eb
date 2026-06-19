import { Building2, Calendar, DollarSign, FileInput, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Document, documentTypeConfigs } from "@/config/documentFlowConfig";
import { formatCurrency } from "@/lib/formatters";

interface InfoChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
  onClick?: () => void;
  statusBadge?: { text: string; variant: "default" | "success" | "warning" | "destructive" };
  className?: string;
}

const InfoChip = ({ icon, label, value, description, onClick, statusBadge, className }: InfoChipProps) => {
  const Wrapper = onClick ? Button : "div";
  const wrapperProps = onClick ? { variant: "ghost" as const, onClick } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "flex flex-col items-start gap-0.5 p-3 rounded-lg border bg-card/50 min-w-[140px] h-auto",
        onClick && "cursor-pointer hover:bg-accent hover:border-accent",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold truncate">{value}</span>
        {onClick && <span className="text-muted-foreground">›</span>}
      </div>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
      {statusBadge && (
        <Badge 
          variant={statusBadge.variant === "success" ? "default" : statusBadge.variant === "warning" ? "secondary" : "destructive"}
          className={cn(
            "mt-1 text-[10px] px-1.5 py-0",
            statusBadge.variant === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          )}
        >
          {statusBadge.text}
        </Badge>
      )}
    </Wrapper>
  );
};

interface DocumentInfoStripProps {
  document: Document;
  cabinetName?: string;
  onContractorClick?: () => void;
  isMobile?: boolean;
  className?: string;
}

export const DocumentInfoStrip = ({
  document,
  cabinetName,
  onContractorClick,
  isMobile = false,
  className,
}: DocumentInfoStripProps) => {
  const typeConfig = documentTypeConfigs[document.type];

  // Calculate payment status
  const getPaymentStatus = () => {
    if (!document.amount) return null;
    if (document.status === "paid") return { text: "Оплачено", variant: "success" as const };
    if (document.paidAmount && document.paidAmount > 0) {
      const percent = Math.round((document.paidAmount / document.amount) * 100);
      return { text: `Оплачено ${percent}%`, variant: "warning" as const };
    }
    if (document.dueDate) {
      const dueDate = new Date(document.dueDate);
      const now = new Date();
      if (dueDate < now) return { text: "Прострочено", variant: "destructive" as const };
      const days = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { text: `Дедлайн: ${days} дн.`, variant: "warning" as const };
    }
    return { text: "Не оплачено", variant: "warning" as const };
  };

  // Determine contract validity period
  const getValidityPeriod = () => {
    if (document.type !== "contract") return null;
    // Demo data - in real app would come from document metadata
    return {
      start: document.date,
      end: "31.12.2025",
      prolongation: true,
    };
  };

  const paymentStatus = typeConfig.hasAmount ? getPaymentStatus() : null;
  const validity = getValidityPeriod();

  // Contractor status (demo)
  const getContractorStatus = () => {
    if (!document.contractor) return null;
    // Demo logic
    return { text: "Перевірено", variant: "success" as const };
  };

  const contractorStatus = getContractorStatus();

  return (
    <div className={cn(
      "flex flex-wrap gap-2 p-2 border-b bg-muted/30",
      className
    )}>
      {/* Amount */}
      {document.amount && (
        <InfoChip
          icon={<DollarSign className="w-3.5 h-3.5" />}
          label="Сума"
          value={formatCurrency(document.amount)}
          description="без ПДВ"
        />
      )}

      {/* Contractor */}
      {document.contractor && (
        <InfoChip
          icon={<Building2 className="w-3.5 h-3.5" />}
          label="Контрагент"
          value={document.contractor.name}
          statusBadge={contractorStatus || undefined}
          onClick={onContractorClick}
        />
      )}

      {/* Validity Period (for contracts) */}
      {validity && (
        <InfoChip
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Строк дії"
          value={`${validity.start} – ${validity.end}`}
          description={validity.prolongation ? "Пролонгація: Так" : undefined}
        />
      )}

      {/* Document Source */}
      <InfoChip
        icon={<FileInput className="w-3.5 h-3.5" />}
        label="Джерело"
        value={document.files?.length ? "Завантажено" : "Створено"}
        description="AI проаналізовано"
      />

      {/* Payment Status (for financial documents) */}
      {typeConfig.hasAmount && paymentStatus && (
        <InfoChip
          icon={<Wallet className="w-3.5 h-3.5" />}
          label="Оплата"
          value={paymentStatus.text}
          statusBadge={paymentStatus}
        />
      )}
    </div>
  );
};
