import { Eye, Pencil, Download, FileText, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentThumbnail } from "../DocumentThumbnail";
import { type Document, documentTypeConfigs } from "@/config/documentFlowConfig";
import { cn } from "@/lib/utils";

interface DocumentPreviewBlockProps {
  document: Document;
  cabinetName: string;
  version?: number;
  canEdit: boolean;
  isLocked: boolean;
  onViewClick: () => void;
  onEditClick: () => void;
  onDownloadClick?: () => void;
  className?: string;
}

export const DocumentPreviewBlock = ({
  document,
  cabinetName,
  version = 1,
  canEdit,
  isLocked,
  onViewClick,
  onEditClick,
  onDownloadClick,
  className,
}: DocumentPreviewBlockProps) => {
  const typeConfig = documentTypeConfigs[document.type];
  
  // Calculate mock file info
  const pageCount = Math.ceil((document.title?.length || 50) / 25) + 1;
  const fileSize = ((document.amount || 1000) / 1000 * 0.3 + 0.5).toFixed(1);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Документ
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            v{(version / 10).toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thumbnail + Info */}
        <div className="flex gap-4">
          <DocumentThumbnail
            documentData={{
              type: typeConfig.label,
              number: document.number,
              date: document.date,
              supplier: cabinetName,
              buyer: document.contractor?.name,
              amount: document.amount,
            }}
            onClick={onViewClick}
            className="shrink-0"
          />
          
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h3 className="font-semibold text-sm truncate">
                {document.title || `${typeConfig.label} № ${document.number}`}
              </h3>
              <p className="text-xs text-muted-foreground">
                від {new Date(document.date).toLocaleDateString("uk-UA")}
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Сторінок: {pageCount}</span>
              <span>•</span>
              <span>{fileSize} MB</span>
              <span>•</span>
              <span>PDF</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5"
            onClick={onViewClick}
          >
            <Eye className="w-3.5 h-3.5" />
            Переглянути
          </Button>
          
          {canEdit && !isLocked && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1.5"
              onClick={onEditClick}
            >
              <Pencil className="w-3.5 h-3.5" />
              Редагувати
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0"
            onClick={onDownloadClick}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
