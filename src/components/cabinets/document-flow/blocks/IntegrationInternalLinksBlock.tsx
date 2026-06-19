/**
 * IntegrationInternalLinksBlock — Блок 3: "Зв'язки всередині системи"
 * Показує зв'язки документа з внутрішніми модулями
 */

import { 
  Link, BookOpen, Wallet, FileBarChart, Users, Package, CheckSquare,
  ArrowRight, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { InternalLink, InternalModule } from "@/config/documentFlowConfig";

interface IntegrationInternalLinksBlockProps {
  links?: InternalLink[];
  onNavigateToModule?: (module: InternalModule, entityId: string) => void;
  className?: string;
}

const moduleConfig: Record<InternalModule, {
  label: string;
  icon: typeof BookOpen;
  color: string;
}> = {
  incomeBook: {
    label: "Книга доходів",
    icon: BookOpen,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  operations: {
    label: "Фінансові операції",
    icon: Wallet,
    color: "text-blue-600 dark:text-blue-400",
  },
  payments: {
    label: "Платежі",
    icon: Wallet,
    color: "text-purple-600 dark:text-purple-400",
  },
  reports: {
    label: "Звіти / Декларації",
    icon: FileBarChart,
    color: "text-amber-600 dark:text-amber-400",
  },
  payroll: {
    label: "Зарплата / Працівники",
    icon: Users,
    color: "text-pink-600 dark:text-pink-400",
  },
  inventory: {
    label: "Склад",
    icon: Package,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  auditPackages: {
    label: "Пакети перевірок",
    icon: CheckSquare,
    color: "text-orange-600 dark:text-orange-400",
  },
};

const statusConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  draft: {
    label: "Чернетка",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
  posted: {
    label: "Проведено",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  submitted: {
    label: "Подано",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
  },
  pending: {
    label: "У процесі",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
  },
  active: {
    label: "Активний",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
  },
};

export const IntegrationInternalLinksBlock = ({
  links = [],
  onNavigateToModule,
  className,
}: IntegrationInternalLinksBlockProps) => {
  // Group links by module
  const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.module]) {
      acc[link.module] = [];
    }
    acc[link.module].push(link);
    return acc;
  }, {} as Record<InternalModule, InternalLink[]>);

  const handleNavigate = (module: InternalModule, entityId: string, label: string) => {
    if (onNavigateToModule) {
      onNavigateToModule(module, entityId);
    } else {
      toast({
        title: "Навігація",
        description: `Перехід до: ${label} (демо)`,
      });
    }
  };

  if (links.length === 0) {
    return (
      <Card className={cn("border-border/50", className)} data-section="document-integration-internal">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link className="w-4 h-4 text-primary" />
            Зв'язки всередині системи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Документ не пов'язаний з іншими модулями
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50", className)} data-section="document-integration-internal">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Link className="w-4 h-4 text-primary" />
          Зв'язки всередині системи
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {links.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedLinks).map(([module, moduleLinks]) => {
          const config = moduleConfig[module as InternalModule];
          if (!config) return null;
          
          const ModuleIcon = config.icon;
          
          return (
            <div key={module} className="space-y-2">
              {/* Module header */}
              <div className="flex items-center gap-2">
                <ModuleIcon className={cn("w-4 h-4", config.color)} />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              
              {/* Links under this module */}
              <div className="ml-6 space-y-1.5">
                {moduleLinks.map((link, index) => {
                  const statusInfo = statusConfig[link.linkedEntity.status || "pending"];
                  
                  return (
                    <Button
                      key={`${link.linkedEntity.id}-${index}`}
                      variant="ghost"
                      className="w-full justify-start h-auto py-2 px-2 text-left hover:bg-muted/50"
                      onClick={() => handleNavigate(
                        link.module, 
                        link.linkedEntity.id,
                        link.linkedEntity.label
                      )}
                    >
                      <div className="flex items-center gap-2 w-full min-w-0">
                        <span className="text-sm truncate flex-1">
                          {link.linkedEntity.label}
                        </span>
                        {statusInfo && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] border-0 shrink-0",
                              statusInfo.color,
                              statusInfo.bgColor
                            )}
                          >
                            {statusInfo.label}
                          </Badge>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
