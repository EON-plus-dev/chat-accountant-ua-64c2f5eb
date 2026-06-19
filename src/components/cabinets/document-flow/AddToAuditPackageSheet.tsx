import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderPlus, FileSearch, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getActiveAudits, auditTypeConfig, auditStatusConfig, type TaxAudit } from "@/config/taxAuditsConfig";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface AddToAuditPackageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentNumber: string;
  documentId: string;
  onAdd?: (auditId: string, packageType: "request" | "response" | "evidence") => void;
}

const packageTypeLabels: Record<"request" | "response" | "evidence", { label: string; description: string }> = {
  request: { label: "Запитані документи", description: "Документ запитаний інспектором" },
  response: { label: "Відповідь на запит", description: "Документ у складі відповіді" },
  evidence: { label: "Докази", description: "Документ як доказова база" },
};

export const AddToAuditPackageSheet = ({
  open,
  onOpenChange,
  documentNumber,
  documentId,
  onAdd,
}: AddToAuditPackageSheetProps) => {
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [selectedPackageType, setSelectedPackageType] = useState<"request" | "response" | "evidence">("response");
  
  const activeAudits = getActiveAudits();

  const handleAdd = () => {
    if (!selectedAuditId) {
      toast({
        title: "Оберіть перевірку",
        description: "Необхідно обрати перевірку для додавання документа",
        variant: "destructive",
      });
      return;
    }

    const selectedAudit = activeAudits.find(a => a.id === selectedAuditId);
    
    if (onAdd) {
      onAdd(selectedAuditId, selectedPackageType);
    }
    
    toast({
      title: "Документ додано до перевірки",
      description: `${documentNumber} додано до "${selectedAudit?.orderNumber}" як "${packageTypeLabels[selectedPackageType].label}"`,
    });
    
    onOpenChange(false);
    setSelectedAuditId(null);
    setSelectedPackageType("response");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            Додати до перевірки
          </SheetTitle>
          <SheetDescription>
            Додайте документ <span className="font-medium">{documentNumber}</span> до пакету перевірки
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Active Audits List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Активні перевірки</Label>
            {activeAudits.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Немає активних перевірок</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px] pr-2">
                <div className="space-y-2">
                  {activeAudits.map((audit) => {
                    const typeConfig = auditTypeConfig[audit.type];
                    const statusConfig = auditStatusConfig[audit.status];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div
                        key={audit.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedAuditId === audit.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedAuditId(audit.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileSearch className="w-4 h-4 text-muted-foreground shrink-0" />
                              <p className="text-sm font-medium truncate">{audit.orderNumber}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{typeConfig.label}</p>
                            <p className="text-xs text-muted-foreground">
                              Період: {audit.period}
                            </p>
                          </div>
                          <Badge className={cn("shrink-0 text-[10px]", statusConfig.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        {audit.responseDeadline && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Дедлайн: {format(new Date(audit.responseDeadline), "dd.MM.yyyy", { locale: uk })}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Package Type Selection */}
          {selectedAuditId && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Тип пакету</Label>
              <RadioGroup
                value={selectedPackageType}
                onValueChange={(value) => setSelectedPackageType(value as typeof selectedPackageType)}
                className="space-y-2"
              >
                {(Object.entries(packageTypeLabels) as [keyof typeof packageTypeLabels, { label: string; description: string }][]).map(([type, { label, description }]) => (
                  <div
                    key={type}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedPackageType === type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedPackageType(type)}
                  >
                    <RadioGroupItem value={type} id={type} className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor={type} className="text-sm font-medium cursor-pointer">
                        {label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Action Button */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Скасувати
            </Button>
            <Button
              className="flex-1"
              onClick={handleAdd}
              disabled={!selectedAuditId}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Додати
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
