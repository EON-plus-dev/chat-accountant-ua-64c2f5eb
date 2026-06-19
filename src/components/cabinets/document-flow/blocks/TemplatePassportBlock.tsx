/**
 * TemplatePassportBlock — Паспорт шаблону з метаданими
 * Відображає основну інформацію про шаблон у форматі key-value grid
 */

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileText,
  Hash,
  FolderOpen,
  GitBranch,
  Calendar,
  Clock,
  BarChart3,
  Building2,
  Tag,
  Copy,
  Check,
  IdCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";

interface TemplatePassportBlockProps {
  template: DocumentTemplate;
  className?: string;
}

// Локалізовані назви типів документів
const documentTypeLabels: Record<string, string> = {
  invoice: "Рахунок",
  act: "Акт",
  contract: "Договір",
  "tax-invoice": "Податкова накладна",
  waybill: "ТТН",
  ttn: "ТТН",
  order: "Наказ",
  "employment-order": "Наказ про прийняття",
  "vacation-order": "Наказ про відпустку",
  "dismissal-order": "Наказ про звільнення",
  "power-of-attorney": "Довіреність",
  nda: "NDA",
  "bank-statement": "Виписка",
  reconciliation: "Акт звірки",
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("uk-UA").format(num);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: uk });
  } catch {
    return "";
  }
};

interface PassportRow {
  id: string;
  icon: typeof FileText;
  label: string;
  mobileLabel?: string;
  value: React.ReactNode;
  copyValue?: string;
}

export const TemplatePassportBlock = ({
  template,
  className,
}: TemplatePassportBlockProps) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldId);
      toast({
        title: "Скопійовано",
        description: value,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Помилка",
        description: "Не вдалось скопіювати",
        variant: "destructive",
      });
    }
  };

  const TemplateIcon = template.icon || FileText;
  const documentTypeLabel = documentTypeLabels[template.type] || template.type;
  const categoryLabel = template.category === "system" ? "Системний" : "Користувацький";
  const categoryVariant = template.category === "system" ? "secondary" : "default";

  // Calculate version from lastModified (simplified)
  const version = useMemo(() => {
    const baseVersion = "1.0";
    // In real app, this would come from version history
    return `v${baseVersion}`;
  }, [template]);

  const rows: PassportRow[] = useMemo(() => [
    {
      id: "name",
      icon: FileText,
      label: "Назва",
      value: <span className="font-medium">{template.name}</span>,
    },
    {
      id: "id",
      icon: Hash,
      label: "ID шаблону",
      mobileLabel: "ID",
      value: (
        <div className="flex items-center gap-2 min-w-0">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono truncate max-w-[100px] sm:max-w-none">
            {template.id}
          </code>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleCopy(template.id, "id")}
                >
                  {copiedField === "id" ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Копіювати ID</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      copyValue: template.id,
    },
    {
      id: "type",
      icon: TemplateIcon,
      label: "Тип документа",
      mobileLabel: "Тип",
      value: (
        <div className="flex items-center gap-2">
          <TemplateIcon className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <span className="truncate">{documentTypeLabel}</span>
        </div>
      ),
    },
    {
      id: "category",
      icon: FolderOpen,
      label: "Категорія",
      value: (
        <Badge variant={categoryVariant} className="text-xs">
          <span className="hidden sm:inline">{template.category === "system" ? "🏢 " : "👤 "}</span>
          {categoryLabel}
        </Badge>
      ),
    },
    {
      id: "version",
      icon: GitBranch,
      label: "Версія",
      value: <Badge variant="outline" className="text-xs">{version}</Badge>,
    },
    {
      id: "created",
      icon: Calendar,
      label: "Створено",
      value: <span className="text-sm">{formatDate(template.lastModified)}</span>,
    },
    {
      id: "updated",
      icon: Clock,
      label: "Оновлено",
      mobileLabel: "Зміни",
      value: (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{formatDate(template.lastModified)}</span>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {formatRelativeDate(template.lastModified)}
          </span>
        </div>
      ),
    },
    {
      id: "usage",
      icon: BarChart3,
      label: "Використань",
      mobileLabel: "Викор.",
      value: (
        <span className="font-medium text-primary text-sm">
          {formatNumber(template.usageCount)}
        </span>
      ),
    },
  ], [template, version, copiedField, handleCopy, TemplateIcon, documentTypeLabel, categoryLabel, categoryVariant]);

  // Optional rows based on template data
  const optionalRows: PassportRow[] = useMemo(() => {
    const additional: PassportRow[] = [];

    if (template.applicableTo && template.applicableTo.length > 0) {
      additional.push({
        id: "applicableTo",
        icon: Building2,
        label: "Застосовується до",
        mobileLabel: "Для",
        value: (
          <div className="flex flex-wrap gap-1">
            {template.applicableTo.map(type => (
              <Badge key={type} variant="outline" className="text-xs">
                {type === "fop" ? "ФОП" : "ТОВ"}
              </Badge>
            ))}
          </div>
        ),
      });
    }

    if (template.tags && template.tags.length > 0) {
      additional.push({
        id: "tags",
        icon: Tag,
        label: "Теги",
        value: (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        ),
      });
    }

    return additional;
  }, [template]);

  const allRows = [...rows, ...optionalRows];

  return (
    <Card className={cn("overflow-hidden", className)} data-section="template-passport">
      <CardHeader className="px-3 sm:px-6 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <IdCard className="w-4 h-4 text-primary" />
          <span className="sm:hidden">Паспорт</span>
          <span className="hidden sm:inline">Паспорт шаблону</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3">
          {allRows.map(row => (
            <div key={row.id} className="flex items-start gap-2 sm:gap-3 py-1 sm:py-1.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0 mt-0.5">
                <row.icon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">
                  <span className="sm:hidden">{row.mobileLabel || row.label}</span>
                  <span className="hidden sm:inline">{row.label}</span>
                </p>
                <div className="text-sm">{row.value}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
