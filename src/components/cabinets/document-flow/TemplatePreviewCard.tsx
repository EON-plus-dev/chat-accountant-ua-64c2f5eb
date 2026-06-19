import { FileText, Star, Clock, Check, Eye, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";

interface TemplatePreviewCardProps {
  template: DocumentTemplate;
  isSelected?: boolean;
  onSelect: (template: DocumentTemplate) => void;
  onPreview?: (template: DocumentTemplate) => void;
  onEdit?: (template: DocumentTemplate) => void;
}

export const TemplatePreviewCard = ({
  template,
  isSelected,
  onSelect,
  onPreview,
  onEdit,
}: TemplatePreviewCardProps) => {
  const Icon = template.icon || FileText;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={() => onSelect(template)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(template);
        }
      }}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 rounded-lg bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium truncate">{template.name}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {template.description}
              </p>
            </div>
          </div>
          
          {/* Selection indicator */}
          {isSelected && (
            <div className="shrink-0 rounded-full bg-primary p-1">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5 px-1.5",
              template.category === "system"
                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800"
            )}
          >
            {template.category === "system" ? "Системний" : "Мій"}
          </Badge>

          {template.isPopular && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
            >
              <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
              Популярний
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {template.usageCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {template.lastModified}
            </span>
          </div>

          {/* Actions (visible on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onPreview && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(template);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Переглянути</TooltipContent>
              </Tooltip>
            )}

            {template.category === "custom" && onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(template);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Редагувати</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
