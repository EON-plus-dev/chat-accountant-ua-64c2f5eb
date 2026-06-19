/**
 * DocumentActionSelector - Unified step combining Method + Relation selection
 * 2×2 grid layout for document creation actions
 */

import { FileEdit, Upload, Link2, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export type DocumentAction = 
  | "create-new"      // Створити новий
  | "create-linked"   // Створити до документу  
  | "upload-new"      // Завантажити новий
  | "upload-linked";  // Завантажити до документу

interface DocumentActionSelectorProps {
  onSelect: (action: DocumentAction) => void;
}

const actions = [
  {
    id: "create-new" as const,
    icon: FileEdit,
    title: "Створити новий",
    description: "Обрати шаблон та заповнити документ",
    badge: null,
    primary: true,
  },
  {
    id: "upload-new" as const,
    icon: Upload,
    title: "Завантажити файл",
    description: "PDF, DOCX для AI-аналізу",
    badge: null,
    primary: true,
  },
  {
    id: "create-linked" as const,
    icon: Link2,
    title: "Створити до документу",
    description: "Акт, додаток до існуючого",
    badge: "Пов'язаний",
    primary: false,
  },
  {
    id: "upload-linked" as const,
    icon: Paperclip,
    title: "Завантажити до документу",
    description: "Файл як додаток",
    badge: "Пов'язаний",
    primary: false,
  },
];

export function DocumentActionSelector({ onSelect }: DocumentActionSelectorProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-2xl space-y-4">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            Оберіть спосіб додавання документа в систему
          </p>
        </div>

        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-1" : "grid-cols-2"
        )}>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onSelect(action.id)}
                className={cn(
                  "w-full p-5 rounded-xl border-2 text-left transition-all",
                  "hover:border-primary hover:bg-primary/5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "flex items-start gap-4",
                  action.primary 
                    ? "border-border" 
                    : "border-dashed border-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  action.primary 
                    ? "bg-primary/10" 
                    : "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    action.primary ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{action.title}</p>
                    {action.badge && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
