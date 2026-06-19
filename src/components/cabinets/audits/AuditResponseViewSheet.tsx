import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CheckCircle2,
  Clock,
  FileText,
  Send,
  ShieldCheck,
  FileDown,
  User,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import type { AuditRequest } from "@/config/taxAuditsConfig";
import { useToast } from "@/hooks/use-toast";

interface AuditResponseViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AuditRequest | null;
}

export const AuditResponseViewSheet = ({
  open,
  onOpenChange,
  request,
}: AuditResponseViewSheetProps) => {
  const { toast } = useToast();

  if (!request) return null;

  const handleViewLog = () => {
    toast({
      title: "Демо-режим",
      description: "Лог відправки до Електронного кабінету ДПС буде доступний після інтеграції",
    });
  };

  const handleDownloadPdf = () => {
    toast({
      title: "Демо-режим",
      description: `Завантаження PDF-копії відповіді на запит ${request.number} буде доступне після запуску`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Відповідь на запит
          </SheetTitle>
          <SheetDescription>
            Запит {request.number} • Надано відповідь
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Original request summary */}
          <div className="p-4 rounded-lg border bg-muted/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5" />
              Запит від ДПС
            </div>
            <h4 className="font-medium text-sm">{request.subject}</h4>
            <p className="text-xs text-muted-foreground">{request.description}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
              <span className="inline-flex items-center gap-1">
                <Send className="w-3 h-3" />
                Надіслано: {format(parseISO(request.date), "dd.MM.yyyy", { locale: uk })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Дедлайн: {format(parseISO(request.deadline), "dd.MM.yyyy", { locale: uk })}
              </span>
            </div>

            {request.documentsRequested && request.documentsRequested.length > 0 && (
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground">Запитувані документи:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.documentsRequested.map((doc, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs font-normal">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Response block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-semibold">Відповідь платника</Label>
              <Badge
                variant="outline"
                className="gap-1 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40"
              >
                <CheckCircle2 className="w-3 h-3" />
                Надіслано до ДПС
              </Badge>
            </div>

            {request.responseDate && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  Дата відповіді: {" "}
                  <span className="font-medium text-foreground">
                    {format(parseISO(request.responseDate), "dd MMMM yyyy", { locale: uk })}
                  </span>
                </span>
                {request.respondedBy && (
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Підписав: <span className="font-medium text-foreground">{request.respondedBy}</span>
                  </span>
                )}
              </div>
            )}

            {request.responseText ? (
              <div className="p-3 rounded-lg border bg-background">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{request.responseText}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Текст відповіді не збережено</p>
            )}
          </div>

          {/* Attached documents */}
          {request.responseDocumentIds && request.responseDocumentIds.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Прикріплені документи ({request.responseDocumentIds.length})
              </Label>
              <div className="space-y-1.5">
                {request.responseDocumentIds.map((docId) => (
                  <div
                    key={docId}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate font-mono">
                      {docId.replace("doc-", "DOC-")}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                      <FileDown className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={handleViewLog}
            >
              <ShieldCheck className="w-4 h-4" />
              Відкрити лог відправки до ДПС
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={handleDownloadPdf}
            >
              <FileDown className="w-4 h-4" />
              Завантажити PDF копію відповіді
            </Button>
          </div>

          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Закрити
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
