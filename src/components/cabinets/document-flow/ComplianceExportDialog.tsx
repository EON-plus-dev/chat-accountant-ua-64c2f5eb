import { useState } from "react";
import {
  FileDown,
  FileJson,
  FileSpreadsheet,
  Shield,
  FileSignature,
  Clock,
  CheckCircle2,
  Copy,
  QrCode,
  AlertTriangle,
  Hash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  type ComplianceExportOptions,
  type ComplianceStatus,
  defaultExportOptions,
  retentionCategories,
} from "@/config/complianceConfig";
import { type AuditEntry, auditActionLabels } from "@/config/documentVersioningConfig";

interface ComplianceExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  complianceStatus: ComplianceStatus;
  auditEntries: AuditEntry[];
}

type ExportFormat = "pdf" | "json" | "csv";

const formatIcons: Record<ExportFormat, typeof FileDown> = {
  pdf: FileDown,
  json: FileJson,
  csv: FileSpreadsheet,
};

const formatLabels: Record<ExportFormat, string> = {
  pdf: "PDF звіт",
  json: "JSON дані",
  csv: "CSV таблиця",
};

export const ComplianceExportDialog = ({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  complianceStatus,
  auditEntries,
}: ComplianceExportDialogProps) => {
  const [options, setOptions] = useState<ComplianceExportOptions>(defaultExportOptions);
  const [activeFormat, setActiveFormat] = useState<ExportFormat>("pdf");

  const retentionConfig = retentionCategories[complianceStatus.retention.category];
  
  const handleExport = () => {
    toast({
      title: `Експорт ${formatLabels[activeFormat]}`,
      description: `Звіт аудиту документа "${documentTitle}" буде завантажено (демо)`,
    });
    onOpenChange(false);
  };

  const handleCopyJson = () => {
    const exportData = {
      documentId,
      documentTitle,
      exportedAt: new Date().toISOString(),
      compliance: complianceStatus,
      auditEntries: options.includeHashChain 
        ? auditEntries 
        : auditEntries.map(({ ...e }) => e),
    };
    
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    toast({
      title: "Скопійовано",
      description: "JSON дані скопійовано в буфер обміну",
    });
  };

  const toggleOption = (key: keyof Omit<ComplianceExportOptions, "format">) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            Експорт аудит-звіту
          </DialogTitle>
          <DialogDescription>
            Документ: {documentTitle} (ID: {documentId.slice(0, 8)}...)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeFormat} onValueChange={(v) => setActiveFormat(v as ExportFormat)}>
            {/* Format Tabs */}
            <TabsList className="w-full">
              {(Object.keys(formatIcons) as ExportFormat[]).map((format) => {
                const Icon = formatIcons[format];
                return (
                  <TabsTrigger 
                    key={format} 
                    value={format}
                    className="flex-1 gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {formatLabels[format]}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* PDF Preview */}
            <TabsContent value="pdf" className="mt-4">
              <ScrollArea className="h-[350px] rounded-lg border bg-muted/30 p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="border-b pb-3 space-y-1">
                    <h3 className="text-lg font-semibold">Аудит-звіт документа</h3>
                    <p className="text-sm text-muted-foreground">{documentTitle}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        ID: {documentId}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Експорт: {new Date().toLocaleString("uk-UA")}
                      </Badge>
                    </div>
                  </div>

                  {/* Compliance Summary */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Статус compliance
                    </h4>
                    
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center justify-between p-2 rounded bg-card">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Цілісність
                        </span>
                        <Badge variant="default" className="text-xs">
                          Підтверджено
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded bg-card">
                        <span className="flex items-center gap-2">
                          <FileSignature className="w-4 h-4 text-primary" />
                          КЕП підписи
                        </span>
                        <span>{complianceStatus.signatures.count} підписів</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded bg-card">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          Зберігання
                        </span>
                        <span>
                          {retentionConfig.labelUk} ({retentionConfig.days} дн.)
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Audit Entries Preview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Журнал подій ({auditEntries.length})
                    </h4>
                    
                    <div className="space-y-1">
                      {auditEntries.slice(0, 5).map((entry) => (
                        <div 
                          key={entry.id} 
                          className="flex items-center justify-between p-2 rounded bg-card text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {auditActionLabels[entry.action]}
                            </span>
                            <span className="text-muted-foreground">
                              — {entry.actor}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString("uk-UA")}
                          </span>
                        </div>
                      ))}
                      {auditEntries.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          ... та ще {auditEntries.length - 5} записів
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>QR-код для верифікації</p>
                        <p className="font-mono">audit.example.com/verify/{documentId.slice(0, 8)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Shield className="w-3 h-3" />
                      eIDAS Compliant
                    </Badge>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* JSON Preview */}
            <TabsContent value="json" className="mt-4">
              <ScrollArea className="h-[350px] rounded-lg border bg-muted/30">
                <pre className="p-4 text-xs font-mono">
{JSON.stringify({
  documentId,
  documentTitle,
  exportedAt: new Date().toISOString(),
  compliance: {
    integrity: complianceStatus.integrity,
    signatures: complianceStatus.signatures,
    retention: {
      category: complianceStatus.retention.category,
      daysRemaining: complianceStatus.retention.daysRemaining,
    },
  },
  auditEntriesCount: auditEntries.length,
  "...": "повний список подій",
}, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>

            {/* CSV Preview */}
            <TabsContent value="csv" className="mt-4">
              <ScrollArea className="h-[350px] rounded-lg border bg-muted/30">
                <div className="p-4 text-xs font-mono space-y-1">
                  <p className="font-semibold">timestamp,action,actor,role,field,previous,new,ip</p>
                  {auditEntries.slice(0, 8).map((entry) => (
                    <p key={entry.id} className="text-muted-foreground">
                      {entry.timestamp},{entry.action},{entry.actor},{entry.actorRole || ""},
                      {entry.fieldName || ""},{entry.previousValue || ""},{entry.newValue || ""},
                      {options.includeIpAddresses ? entry.ipAddress : "***"}
                    </p>
                  ))}
                  <p className="text-muted-foreground">...</p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Export Options */}
          <div className="mt-4 space-y-3 p-3 rounded-lg border bg-muted/30">
            <h4 className="text-sm font-medium">Опції експорту</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeIp"
                  checked={options.includeIpAddresses}
                  onCheckedChange={() => toggleOption("includeIpAddresses")}
                />
                <Label 
                  htmlFor="includeIp" 
                  className="text-sm flex items-center gap-2 cursor-pointer"
                >
                  Включити IP-адреси
                  <Badge variant="outline" className="text-xs gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    GDPR
                  </Badge>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHash"
                  checked={options.includeHashChain}
                  onCheckedChange={() => toggleOption("includeHashChain")}
                />
                <Label htmlFor="includeHash" className="text-sm cursor-pointer">
                  Включити hash-ланцюжок
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCert"
                  checked={options.includeCertificateDetails}
                  onCheckedChange={() => toggleOption("includeCertificateDetails")}
                />
                <Label htmlFor="includeCert" className="text-sm cursor-pointer">
                  Включити деталі сертифікатів КЕП
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {activeFormat === "json" && (
            <Button variant="outline" onClick={handleCopyJson} className="gap-2">
              <Copy className="w-4 h-4" />
              Копіювати JSON
            </Button>
          )}
          <Button onClick={handleExport} className="gap-2">
            {(() => {
              const Icon = formatIcons[activeFormat];
              return <Icon className="w-4 h-4" />;
            })()}
            Завантажити {formatLabels[activeFormat]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
