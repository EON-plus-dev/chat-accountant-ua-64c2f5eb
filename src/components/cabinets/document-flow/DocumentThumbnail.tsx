import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentThumbnailProps {
  documentData: {
    type: string;
    number: string;
    date?: string;
    supplier?: string;
    buyer?: string;
    amount?: number;
  };
  onClick?: () => void;
  className?: string;
}

export const DocumentThumbnail = ({ documentData, onClick, className }: DocumentThumbnailProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('uk-UA').format(amount);
  };

  return (
    <div 
      className={cn(
        "relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg border border-border/70 bg-white dark:bg-card shadow-sm overflow-hidden cursor-pointer group shrink-0",
        "hover:shadow-md hover:border-primary/50 transition-all",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Переглянути ${documentData.type}`}
    >
      {/* Document miniature content */}
      <div className="absolute inset-0 p-1.5 sm:p-2 flex flex-col">
        {/* Header */}
        <div className="text-center border-b border-border/50 pb-1 mb-1">
          <div className="font-semibold text-[6px] sm:text-[7px] leading-tight truncate text-foreground">
            {documentData.type.toUpperCase()}
          </div>
          <div className="text-[5px] sm:text-[6px] text-muted-foreground truncate">
            № {documentData.number}
          </div>
        </div>
        
        {/* Parties */}
        <div className="flex-1 space-y-0.5 text-[5px] sm:text-[6px] text-muted-foreground overflow-hidden">
          {documentData.supplier && (
            <div className="truncate leading-tight">
              <span className="text-foreground/70">Від:</span> {documentData.supplier}
            </div>
          )}
          {documentData.buyer && (
            <div className="truncate leading-tight">
              <span className="text-foreground/70">До:</span> {documentData.buyer}
            </div>
          )}
        </div>
        
        {/* Amount */}
        {documentData.amount && (
          <div className="mt-auto pt-1 border-t border-border/50 text-right">
            <span className="font-bold text-[7px] sm:text-[8px] text-foreground">
              {formatAmount(documentData.amount)} ₴
            </span>
          </div>
        )}
      </div>
      
      {/* Hover overlay with eye icon */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-card rounded-full p-1.5 shadow-lg">
          <Eye className="w-4 h-4 text-primary" />
        </div>
      </div>
      
      {/* A4 indicator */}
      <div className="absolute bottom-0.5 left-1 text-[6px] sm:text-[7px] text-muted-foreground/40 font-medium">
        A4
      </div>
    </div>
  );
};
