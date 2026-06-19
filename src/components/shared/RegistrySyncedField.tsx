import { Lock, ExternalLink, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RegistrySyncBadge } from "./RegistrySyncBadge";
import type { RegistrySource } from "@/types/cabinet";

interface RegistrySyncedFieldProps {
  id: string;
  label: string;
  value: string | number | React.ReactNode;
  source: RegistrySource;
  isVerified?: boolean;
  lastSync?: string;
  required?: boolean;
  helperText?: string;
  helperLink?: { text: string; url: string };
  editAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'default' | 'compact';
}

export const RegistrySyncedField = ({
  id,
  label,
  value,
  source,
  isVerified = true,
  lastSync,
  required = false,
  helperText,
  helperLink,
  editAction,
  className,
  size = 'default',
}: RegistrySyncedFieldProps) => {
  const isLocked = isVerified;
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <div className="flex items-center gap-1.5">
          <RegistrySyncBadge source={source} lastSync={lastSync} variant="compact" />
          {isLocked && (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {/* Value display */}
      <div 
        id={id}
        className={cn(
          "flex items-center justify-between rounded-md border bg-muted/30",
          "text-sm",
          size === 'default' ? "min-h-10 px-3 py-2" : "min-h-8 px-2.5 py-1.5",
          isLocked && "cursor-not-allowed opacity-80"
        )}
      >
        <span className={cn(
          "font-medium text-foreground",
          size === 'compact' && "text-sm"
        )}>
          {value}
        </span>
        {isLocked && (
          <Lock className="h-4 w-4 text-muted-foreground/60 flex-shrink-0 ml-2" />
        )}
      </div>
      
      {/* Helper text */}
      {(helperText || helperLink) && (
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            {helperText}
            {helperLink && (
              <a 
                href={helperLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:underline inline-flex items-center gap-0.5"
              >
                {helperLink.text}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </span>
        </div>
      )}
      
      {/* Edit action (usually "Submit application") */}
      {editAction && (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs text-primary"
          onClick={editAction.onClick}
        >
          {editAction.label}
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
};
