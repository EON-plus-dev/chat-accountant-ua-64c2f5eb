import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DocumentNodeData {
  label: string;
  number?: string;
  status?: string;
  statusColor?: string;
  typeLabel?: string;
  amount?: string;
  onClick?: () => void;
}

interface DocumentNodeProps {
  data: DocumentNodeData;
}

export const DocumentNode = memo(({ data }: DocumentNodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2" />
      <div 
        className={cn(
          "px-4 py-3 rounded-xl border-2 border-primary bg-background shadow-lg",
          "min-w-[180px] cursor-pointer transition-all hover:shadow-xl hover:scale-105",
          "ring-4 ring-primary/10"
        )}
        onClick={data.onClick}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {data.typeLabel || "Документ"}
          </span>
        </div>
        <p className="text-sm font-semibold truncate mb-1">{data.label}</p>
        {data.number && (
          <p className="text-xs text-muted-foreground truncate">{data.number}</p>
        )}
        <div className="flex items-center justify-between mt-2 gap-2">
          {data.status && (
            <Badge 
              variant="secondary" 
              className={cn("text-[10px] h-5", data.statusColor)}
            >
              {data.status}
            </Badge>
          )}
          {data.amount && (
            <span className="text-xs font-semibold text-primary">{data.amount}</span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
    </>
  );
});

DocumentNode.displayName = "DocumentNode";
