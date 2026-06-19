import { useState } from "react";
import { FileText, ZoomIn, ZoomOut, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";

interface TemplatePreviewDialogProps {
  template: DocumentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate?: (template: DocumentTemplate) => void;
}

// Mock document preview based on template type
const getTemplatePreviewContent = (template: DocumentTemplate) => {
  const commonHeader = {
    companyName: "ТОВ «Ваша Компанія»",
    companyCode: "12345678",
    companyAddress: "м. Київ, вул. Хрещатик, 1",
    companyPhone: "+380 44 123 45 67",
  };

  switch (template.type) {
    case "invoice":
      return {
        title: "РАХУНОК-ФАКТУРА",
        number: "№ _____ від «__» ________ 20__ р.",
        sections: [
          { label: "Постачальник", value: `${commonHeader.companyName}\nЄДРПОУ: ${commonHeader.companyCode}\n${commonHeader.companyAddress}` },
          { label: "Покупець", value: "[Назва контрагента]\nЄДРПОУ/ІПН: [код]\n[Адреса]" },
          { label: "Призначення платежу", value: "Оплата за товари/послуги згідно рахунку" },
        ],
        hasTable: true,
        tableHeaders: ["№", "Найменування", "Од.", "К-ть", "Ціна", "Сума"],
        tableRows: [
          ["1", "[Найменування товару/послуги]", "шт", "1", "0.00", "0.00"],
          ["", "", "", "", "Разом:", "0.00 грн"],
          ["", "", "", "", "ПДВ:", "0.00 грн"],
          ["", "", "", "", "До сплати:", "0.00 грн"],
        ],
        footer: "Рахунок дійсний протягом 5 банківських днів",
      };

    case "act":
      return {
        title: "АКТ ВИКОНАНИХ РОБІТ",
        number: "№ _____ від «__» ________ 20__ р.",
        sections: [
          { label: "Виконавець", value: `${commonHeader.companyName}\nЄДРПОУ: ${commonHeader.companyCode}` },
          { label: "Замовник", value: "[Назва контрагента]\nЄДРПОУ/ІПН: [код]" },
          { label: "Підстава", value: "Договір № ___ від «__» ________ 20__ р." },
        ],
        hasTable: true,
        tableHeaders: ["№", "Найменування робіт/послуг", "Од.", "К-ть", "Ціна", "Сума"],
        tableRows: [
          ["1", "[Опис виконаних робіт]", "послуга", "1", "0.00", "0.00"],
          ["", "", "", "", "Разом:", "0.00 грн"],
        ],
        footer: "Роботи виконані в повному обсязі та в строк. Сторони претензій не мають.",
        signatures: ["Виконавець: _____________", "Замовник: _____________"],
      };

    case "contract":
      return {
        title: "ДОГОВІР",
        number: "№ _____ від «__» ________ 20__ р.",
        subtitle: "на надання послуг",
        sections: [
          { label: "1. СТОРОНИ ДОГОВОРУ", value: `${commonHeader.companyName} (надалі - "Виконавець") та [Назва контрагента] (надалі - "Замовник")` },
          { label: "2. ПРЕДМЕТ ДОГОВОРУ", value: "Виконавець зобов'язується надати, а Замовник прийняти та оплатити послуги згідно з цим Договором." },
          { label: "3. ВАРТІСТЬ ТА ПОРЯДОК ОПЛАТИ", value: "Вартість послуг за цим Договором складає _________ грн." },
          { label: "4. СТРОК ДІЇ ДОГОВОРУ", value: "Цей Договір набуває чинності з моменту підписання і діє до «__» ________ 20__ р." },
        ],
        footer: "ПІДПИСИ СТОРІН",
        signatures: ["Виконавець: _____________", "Замовник: _____________"],
      };

    case "waybill":
      return {
        title: "ВИДАТКОВА НАКЛАДНА",
        number: "№ _____ від «__» ________ 20__ р.",
        sections: [
          { label: "Постачальник", value: `${commonHeader.companyName}\nЄДРПОУ: ${commonHeader.companyCode}` },
          { label: "Отримувач", value: "[Назва контрагента]\nЄДРПОУ/ІПН: [код]" },
        ],
        hasTable: true,
        tableHeaders: ["№", "Найменування", "Од.", "К-ть", "Ціна", "Сума"],
        tableRows: [
          ["1", "[Найменування товару]", "шт", "1", "0.00", "0.00"],
          ["", "", "", "", "Разом:", "0.00 грн"],
        ],
        footer: "Відпустив: _____________ Отримав: _____________",
      };

    default:
      return {
        title: template.name.toUpperCase(),
        number: "№ _____ від «__» ________ 20__ р.",
        sections: [
          { label: "Сторона 1", value: `${commonHeader.companyName}\nЄДРПОУ: ${commonHeader.companyCode}` },
          { label: "Сторона 2", value: "[Контрагент]" },
        ],
        footer: "Підписи сторін",
      };
  }
};

export const TemplatePreviewDialog = ({
  template,
  open,
  onOpenChange,
  onUseTemplate,
}: TemplatePreviewDialogProps) => {
  const [zoom, setZoom] = useState(75);

  if (!template) return null;

  const preview = getTemplatePreviewContent(template);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));


  const handleDownload = () => {
    toast({
      title: "Завантаження",
      description: `${template.name}.pdf завантажено (демо)`,
    });
  };

  const handleUse = () => {
    if (onUseTemplate) {
      onUseTemplate(template);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0 pr-12">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">{template.name}</DialogTitle>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] h-5",
                template.category === "system"
                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400"
                  : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400"
              )}
            >
              {template.category === "system" ? "Системний" : "Мій"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <ScrollArea className="flex-1 bg-muted/50" orientation="both">
          <div className="p-8 flex justify-center min-w-max">
            {/* A4 Document Preview */}
            <div
              className="bg-card shadow-xl rounded border border-border transition-transform origin-top"
              style={{
                width: `${(595 * zoom) / 100}px`,
                minHeight: `${(842 * zoom) / 100}px`,
                padding: `${(40 * zoom) / 100}px`,
                transform: `scale(1)`,
              }}
            >
              {/* Document Content */}
              <div
                className="font-serif text-card-foreground space-y-4"
                style={{ fontSize: `${(12 * zoom) / 100}px` }}
              >
                {/* Header */}
                <div className="text-center space-y-1">
                  <h1
                    className="font-bold"
                    style={{ fontSize: `${(18 * zoom) / 100}px` }}
                  >
                    {preview.title}
                  </h1>
                  {preview.subtitle && (
                    <p style={{ fontSize: `${(14 * zoom) / 100}px` }}>
                      {preview.subtitle}
                    </p>
                  )}
                  <p className="text-muted-foreground">{preview.number}</p>
                </div>

                <Separator className="my-4" />

                {/* Sections */}
                <div className="space-y-4">
                  {preview.sections.map((section, idx) => (
                    <div key={idx}>
                      <p className="font-semibold mb-1">{section.label}:</p>
                      <p className="whitespace-pre-line text-muted-foreground">{section.value}</p>
                    </div>
                  ))}
                </div>

                {/* Table */}
                {preview.hasTable && (
                  <div className="mt-6">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          {preview.tableHeaders?.map((header, idx) => (
                            <th
                              key={idx}
                              className="border border-border px-2 py-1 text-left font-semibold"
                              style={{ fontSize: `${(11 * zoom) / 100}px` }}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.tableRows?.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {row.map((cell, cellIdx) => (
                                <td
                                  key={cellIdx}
                                  className={cn(
                                    "border border-border px-2 py-1",
                                  cellIdx >= 4 && "text-right"
                                )}
                                style={{ fontSize: `${(11 * zoom) / 100}px` }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer */}
                {preview.footer && (
                  <div className="mt-8 pt-4 border-t border-border">
                    <p className="text-muted-foreground italic">{preview.footer}</p>
                  </div>
                )}

                {/* Signatures */}
                {preview.signatures && (
                  <div className="mt-8 flex justify-between">
                    {preview.signatures.map((sig, idx) => (
                      <div key={idx} className="text-center">
                        <p className="border-t border-border pt-1 px-4">{sig}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Watermark for demo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <span
                      className="font-bold text-card-foreground transform -rotate-45"
                    style={{ fontSize: `${(80 * zoom) / 100}px` }}
                  >
                    ШАБЛОН
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-between bg-background">
          <div className="text-xs text-muted-foreground">
            Використано: {template.usageCount} разів
          </div>
          {onUseTemplate && (
            <Button size="lg" onClick={handleUse} className="gap-2">
              Використати шаблон
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
