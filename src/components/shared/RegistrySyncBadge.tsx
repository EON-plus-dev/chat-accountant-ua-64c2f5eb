import { Building2, Receipt, Landmark, Shield, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RegistrySource } from "@/types/cabinet";

interface RegistrySyncBadgeProps {
  source: RegistrySource;
  lastSync?: string;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

const sourceConfig: Record<RegistrySource, { label: string; fullLabel: string; Icon: typeof Building2; url?: string }> = {
  'edr': { 
    label: 'ЄДР', 
    fullLabel: 'Єдиний державний реєстр', 
    Icon: Building2,
    url: 'https://usr.minjust.gov.ua/' 
  },
  'vat-registry': { 
    label: 'Реєстр ПДВ', 
    fullLabel: 'Реєстр платників ПДВ', 
    Icon: Receipt,
    url: 'https://cabinet.tax.gov.ua/' 
  },
  'tax-cabinet': { 
    label: 'Кабінет платника', 
    fullLabel: 'Електронний кабінет платника', 
    Icon: Landmark,
    url: 'https://cabinet.tax.gov.ua/' 
  },
  'pension-fund': { 
    label: 'ПФУ', 
    fullLabel: 'Пенсійний фонд України', 
    Icon: Shield,
    url: 'https://www.pfu.gov.ua/' 
  },
};

const formatLastSync = (isoString?: string): string => {
  if (!isoString) return 'Дата невідома';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `${diffMins} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays === 1) return 'Вчора';
  if (diffDays < 7) return `${diffDays} днів тому`;
  
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const RegistrySyncBadge = ({ 
  source, 
  lastSync,
  variant = 'default',
  className,
}: RegistrySyncBadgeProps) => {
  const config = sourceConfig[source];
  const { Icon } = config;
  
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-normal bg-muted/50 text-muted-foreground border-muted-foreground/20 cursor-help",
                className
              )}
            >
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{config.fullLabel}</p>
              {lastSync && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Синхронізовано: {formatLastSync(lastSync)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (variant === 'inline') {
    return (
      <span className={cn("inline-flex items-center text-xs text-muted-foreground", className)}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  }
  
  // Default variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-medium bg-primary/10 text-primary border-primary/30",
              "dark:bg-primary/20 dark:text-primary dark:border-primary/40",
              "cursor-help",
              className
            )}
          >
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{config.fullLabel}</p>
            {lastSync && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Синхронізовано: {formatLastSync(lastSync)}
              </p>
            )}
            {config.url && (
              <a 
                href={config.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Відкрити джерело
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
