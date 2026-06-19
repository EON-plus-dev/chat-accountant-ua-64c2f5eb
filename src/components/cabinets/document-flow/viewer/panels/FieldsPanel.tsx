/**
 * FieldsPanel - Вкладка "Поля і автозаповнення" бокової панелі
 * Показує всі змінні документа та їх джерела
 */

import { useMemo } from "react";
import { 
  FileText, Check, AlertCircle, HelpCircle,
  Building2, User, Settings, Pencil, ExternalLink
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type FieldSource = "profile" | "contractor" | "tax_settings" | "manual";
export type FieldStatus = "auto" | "needs_confirm" | "empty";

export interface DocumentField {
  id: string;
  name: string;        // Технічна назва (customer_name)
  label: string;       // Людська назва (Назва контрагента)
  value: string;       // Поточне значення
  source: FieldSource;
  status: FieldStatus;
  fragmentRef?: string; // Прив'язка до місця в тексті
}

interface FieldsPanelProps {
  fields: DocumentField[];
  onFieldClick?: (fieldId: string) => void;
  onFieldEdit?: (fieldId: string) => void;
  className?: string;
}

const sourceConfig: Record<FieldSource, { label: string; icon: typeof Building2; color: string }> = {
  profile: { 
    label: "Профіль кабінету", 
    icon: User,
    color: "text-blue-600 dark:text-blue-400" 
  },
  contractor: { 
    label: "Довідник контрагентів", 
    icon: Building2,
    color: "text-purple-600 dark:text-purple-400" 
  },
  tax_settings: { 
    label: "Податковий профіль", 
    icon: Settings,
    color: "text-orange-600 dark:text-orange-400" 
  },
  manual: { 
    label: "Введено вручну", 
    icon: Pencil,
    color: "text-muted-foreground" 
  },
};

const statusConfig: Record<FieldStatus, { label: string; icon: typeof Check; className: string }> = {
  auto: { 
    label: "Автозаповнено", 
    icon: Check,
    className: "text-emerald-600 dark:text-emerald-400" 
  },
  needs_confirm: { 
    label: "Потребує підтвердження", 
    icon: AlertCircle,
    className: "text-amber-600 dark:text-amber-400" 
  },
  empty: { 
    label: "Не заповнено", 
    icon: HelpCircle,
    className: "text-destructive" 
  },
};

// Демо-дані для полів
const generateDemoFields = (): DocumentField[] => [
  {
    id: "f1",
    name: "customer_name",
    label: "Назва контрагента",
    value: "ТОВ «Альфа Сервіс»",
    source: "contractor",
    status: "auto",
  },
  {
    id: "f2",
    name: "customer_edrpou",
    label: "ЄДРПОУ контрагента",
    value: "12345678",
    source: "contractor",
    status: "auto",
  },
  {
    id: "f3",
    name: "contract_amount",
    label: "Сума договору",
    value: "120 000,00 грн",
    source: "manual",
    status: "needs_confirm",
  },
  {
    id: "f4",
    name: "payment_terms",
    label: "Умови оплати",
    value: "Передоплата 50%, решта по факту",
    source: "manual",
    status: "auto",
  },
  {
    id: "f5",
    name: "our_company",
    label: "Наша компанія",
    value: "ФОП Мельник Олена",
    source: "profile",
    status: "auto",
  },
  {
    id: "f6",
    name: "our_iban",
    label: "Наш IBAN",
    value: "UA213223130000026007233566001",
    source: "profile",
    status: "auto",
  },
  {
    id: "f7",
    name: "tax_rate",
    label: "Ставка ЄП",
    value: "5%",
    source: "tax_settings",
    status: "auto",
  },
  {
    id: "f8",
    name: "signing_person",
    label: "Підписант",
    value: "",
    source: "manual",
    status: "empty",
  },
];

export const FieldsPanel = ({
  fields: propFields,
  onFieldClick,
  onFieldEdit,
  className,
}: FieldsPanelProps) => {
  // Використовуємо демо-дані якщо fields пусті
  const fields = propFields.length > 0 ? propFields : generateDemoFields();
  
  // Групування полів за статусом
  const groupedFields = useMemo(() => {
    const needsAttention = fields.filter(f => f.status === "empty" || f.status === "needs_confirm");
    const autoFilled = fields.filter(f => f.status === "auto");
    
    return { needsAttention, autoFilled };
  }, [fields]);
  
  const totalCount = fields.length;
  const autoCount = groupedFields.autoFilled.length;
  const attentionCount = groupedFields.needsAttention.length;
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Поля і автозаповнення
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {autoCount}/{totalCount} автозаповнено
          </Badge>
          {attentionCount > 0 && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
              {attentionCount} потребують уваги
            </Badge>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Потребують уваги */}
          {groupedFields.needsAttention.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Потребують уваги
              </h4>
              <div className="space-y-2">
                {groupedFields.needsAttention.map((field) => (
                  <FieldCard 
                    key={field.id} 
                    field={field}
                    onFieldClick={onFieldClick}
                    onFieldEdit={onFieldEdit}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Автозаповнені */}
          {groupedFields.autoFilled.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Автозаповнені
              </h4>
              <div className="space-y-2">
                {groupedFields.autoFilled.map((field) => (
                  <FieldCard 
                    key={field.id} 
                    field={field}
                    onFieldClick={onFieldClick}
                    onFieldEdit={onFieldEdit}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface FieldCardProps {
  field: DocumentField;
  onFieldClick?: (fieldId: string) => void;
  onFieldEdit?: (fieldId: string) => void;
}

const FieldCard = ({ field, onFieldClick, onFieldEdit }: FieldCardProps) => {
  const source = sourceConfig[field.source];
  const status = statusConfig[field.status];
  const SourceIcon = source.icon;
  const StatusIcon = status.icon;
  
  return (
    <TooltipProvider>
      <div 
        className={cn(
          "rounded-lg border p-3 transition-colors",
          field.status === "empty" && "border-destructive/50 bg-destructive/5",
          field.status === "needs_confirm" && "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
          field.fragmentRef && "cursor-pointer hover:bg-accent/50",
        )}
        onClick={() => field.fragmentRef && onFieldClick?.(field.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{field.label}</p>
            {field.value ? (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {field.value}
              </p>
            ) : (
              <p className="text-sm text-destructive mt-0.5 italic">
                Не заповнено
              </p>
            )}
          </div>
          
          {onFieldEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onFieldEdit(field.id);
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("flex items-center gap-1.5 text-xs", source.color)}>
                <SourceIcon className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{source.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Джерело: {source.label}</p>
            </TooltipContent>
          </Tooltip>
          
          <div className={cn("flex items-center gap-1 text-xs", status.className)}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{status.label}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
