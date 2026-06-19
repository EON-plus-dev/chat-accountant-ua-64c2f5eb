import { ShieldCheck, Clock, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { RegistrySource } from "@/types/cabinet";

interface RegistrySyncBannerProps {
  sources: RegistrySource[];
  lastSync?: string;
  variant?: 'default' | 'compact';
  className?: string;
  changeAction?: {
    label: string;
    url: string;
  };
}

const sourceLabels: Record<RegistrySource, string> = {
  'edr': 'ЄДР',
  'vat-registry': 'Реєстр ПДВ',
  'tax-cabinet': 'Електронного кабінету платника',
  'pension-fund': 'ПФУ',
};

const formatLastSync = (isoString?: string): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'сьогодні';
  if (diffDays === 1) return 'вчора';
  if (diffDays < 7) return `${diffDays} днів тому`;
  
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
};

export const RegistrySyncBanner = ({
  sources,
  lastSync,
  variant = 'default',
  className,
  changeAction,
}: RegistrySyncBannerProps) => {
  const formattedSources = sources.map(s => sourceLabels[s]).join(', ');
  const syncTime = formatLastSync(lastSync);
  
  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className
      )}>
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        <span>
          Дані з {formattedSources}
          {syncTime && <> · оновлено {syncTime}</>}
        </span>
      </div>
    );
  }
  
  return (
    <Alert className={cn(
      "border-primary/30 bg-primary/5 dark:border-primary/40 dark:bg-primary/10",
      className
    )}>
      <ShieldCheck className="h-4 w-4 text-primary" />
      <AlertDescription className="text-sm">
        <div className="flex flex-col gap-1.5">
          <span className="text-foreground">
            Дані синхронізовано з державними реєстрами ({formattedSources})
          </span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {syncTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Оновлено: {syncTime}
              </span>
            )}
            {changeAction && (
              <a 
                href={changeAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                {changeAction.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
