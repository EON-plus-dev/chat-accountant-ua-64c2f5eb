/**
 * IntegrationExternalSystemsBlock — Блок 2: "Зовнішні інтеграції"
 * Показує стан документа у зовнішніх системах
 */

import { 
  Link2, RefreshCw, ExternalLink, AlertCircle, Settings, Check, Clock, 
  Send, Download, XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import type { 
  ExternalIntegration, 
  IntegrationStatus,
  externalSystemLabels,
  integrationTypeLabels 
} from "@/config/documentFlowConfig";

interface IntegrationExternalSystemsBlockProps {
  integrations?: ExternalIntegration[];
  onRefreshStatus?: (system: string) => void;
  onOpenExternal?: (system: string, externalId?: string) => void;
  onConfigureIntegration?: (system: string) => void;
  onResend?: (system: string) => void;
  className?: string;
}

const systemLabels: Record<string, string> = {
  medoc: "M.E.Doc",
  vchasno: "Vchasno",
  "1c": "1С",
  email: "Email",
  prro: "ПРРО",
  bank: "Клієнт-банк",
  checkbox: "Checkbox",
  tax_cabinet: "Кабінет платника",
  erpn: "ЄРПН",
  monobank: "Monobank",
  privat24: "Приват24",
  wayforpay: "WayForPay",
  liqpay: "LiqPay",
  other: "Інше",
};

const typeLabels: Record<string, string> = {
  edo: "ЕДО",
  tax: "Податкова",
  bank: "Банк",
  erp: "ERP",
  prro: "ПРРО",
  payment: "Платіжна система",
};

const statusConfig: Record<IntegrationStatus, {
  label: string;
  icon: typeof Check;
  color: string;
  bgColor: string;
}> = {
  not_connected: {
    label: "Не підключено",
    icon: XCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  queued: {
    label: "У черзі",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
  },
  sent: {
    label: "Надіслано",
    icon: Send,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
  },
  received: {
    label: "Отримано",
    icon: Download,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  registered: {
    label: "Зареєстровано",
    icon: Check,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  processed: {
    label: "Опрацьовано",
    icon: Check,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  error: {
    label: "Помилка",
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};

export const IntegrationExternalSystemsBlock = ({
  integrations = [],
  onRefreshStatus,
  onOpenExternal,
  onConfigureIntegration,
  onResend,
  className,
}: IntegrationExternalSystemsBlockProps) => {
  const handleAction = (action: string, system: string, externalId?: string) => {
    switch (action) {
      case "refresh":
        onRefreshStatus?.(system);
        toast({
          title: "Оновлення статусу",
          description: `Оновлюємо статус у ${systemLabels[system] || system}...`,
        });
        break;
      case "open_external":
        onOpenExternal?.(system, externalId);
        toast({
          title: "Зовнішня система",
          description: `Відкриваємо ${systemLabels[system] || system}... (демо)`,
        });
        break;
      case "configure":
        onConfigureIntegration?.(system);
        toast({
          title: "Налаштування",
          description: `Налаштування інтеграції ${systemLabels[system] || system}... (демо)`,
        });
        break;
      case "resend":
        onResend?.(system);
        toast({
          title: "Повторна відправка",
          description: `Повторюємо відправку до ${systemLabels[system] || system}... (демо)`,
        });
        break;
    }
  };

  if (integrations.length === 0) {
    return (
      <Card className={cn("border-border/50", className)} data-section="document-integration-external">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link2 className="w-4 h-4 text-primary" />
            Зовнішні інтеграції
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Документ не пов'язаний із зовнішніми системами
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50", className)} data-section="document-integration-external">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Link2 className="w-4 h-4 text-primary" />
          Зовнішні інтеграції
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {integrations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {integrations.map((integration, index) => {
            const status = statusConfig[integration.status];
            const StatusIcon = status.icon;
            const systemLabel = systemLabels[integration.system] || integration.system;
            const typeLabel = typeLabels[integration.integrationType] || integration.integrationType;
            
            return (
              <div 
                key={`${integration.system}-${index}`}
                className="px-4 py-3 flex items-center gap-3"
              >
                {/* System & Type */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{systemLabel}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {typeLabel}
                    </Badge>
                  </div>
                  {integration.lastSyncAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(integration.lastSyncAt), "dd.MM.yy HH:mm", { locale: uk })}
                    </p>
                  )}
                </div>
                
                {/* Status badge */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "gap-1 border-0 shrink-0",
                          status.color,
                          status.bgColor
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{status.label}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{status.label}</p>
                      {integration.message && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {integration.message}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {integration.actions?.includes("refresh") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleAction("refresh", integration.system)}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {integration.actions?.includes("resend") && integration.status === "error" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleAction("resend", integration.system)}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {integration.actions?.includes("open_external") && integration.externalId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleAction("open_external", integration.system, integration.externalId)}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {integration.status === "not_connected" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleAction("configure", integration.system)}
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
