/**
 * NOMENCLATURE DOCUMENTS SECTION
 * 
 * Список пов'язаних документів для позиції номенклатури:
 * - Рахунки
 * - Акти
 * - Накладні
 * - Фільтрація за типом
 * - Клік для переходу до документа
 */

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Receipt, 
  FileCheck, 
  Truck,
  ExternalLink,
  Plus,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import { formatNomenclaturePrice } from "@/config/nomenclatureConfig";

interface NomenclatureDocumentsSectionProps {
  item: NomenclatureItemV2;
  onNavigateToDocument?: (documentId: string) => void;
  onAddDocument?: () => void;
}

type DocumentType = "all" | "invoice" | "act" | "waybill";

interface RelatedDocument {
  id: string;
  type: "invoice" | "act" | "waybill";
  number: string;
  date: string;
  contractor: string;
  quantity: number;
  amount: number;
  status: "draft" | "signed" | "sent" | "paid";
}

const documentTypeLabels: Record<string, { label: string; icon: typeof FileText }> = {
  invoice: { label: "Рахунок", icon: Receipt },
  act: { label: "Акт", icon: FileCheck },
  waybill: { label: "Накладна", icon: Truck },
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Чернетка", variant: "secondary" },
  signed: { label: "Підписано", variant: "outline" },
  sent: { label: "Надіслано", variant: "outline" },
  paid: { label: "Оплачено", variant: "default" },
};

// Mock data generator
const generateMockDocuments = (itemId: string): RelatedDocument[] => {
  const baseNum = Math.abs(itemId.charCodeAt(0) % 50);
  const types: Array<"invoice" | "act" | "waybill"> = ["invoice", "act", "waybill"];
  const statuses: Array<"draft" | "signed" | "sent" | "paid"> = ["draft", "signed", "sent", "paid"];
  const contractors = ["ТОВ \"Альфа\"", "ФОП Іваненко І.І.", "ТОВ \"Бета-Сервіс\"", "ТОВ \"Гамма Трейд\""];
  
  return Array.from({ length: 5 + (baseNum % 4) }, (_, i) => ({
    id: `doc-${itemId}-${i}`,
    type: types[i % types.length],
    number: `${types[i % types.length].toUpperCase().slice(0, 3)}-${2025}${String(baseNum + i).padStart(4, "0")}`,
    date: new Date(2025, 0, 28 - i * 3).toLocaleDateString("uk-UA"),
    contractor: contractors[i % contractors.length],
    quantity: 1 + (i % 5),
    amount: (1000 + baseNum * 100 + i * 500) * (1 + (i % 3)),
    status: statuses[(baseNum + i) % statuses.length],
  }));
};

export const NomenclatureDocumentsSection = ({
  item,
  onNavigateToDocument,
  onAddDocument,
}: NomenclatureDocumentsSectionProps) => {
  const [filter, setFilter] = useState<DocumentType>("all");
  
  const allDocuments = useMemo(() => generateMockDocuments(item.id), [item.id]);
  
  const filteredDocuments = useMemo(() => {
    if (filter === "all") return allDocuments;
    return allDocuments.filter(doc => doc.type === filter);
  }, [allDocuments, filter]);
  
  const stats = useMemo(() => ({
    total: allDocuments.length,
    invoices: allDocuments.filter(d => d.type === "invoice").length,
    acts: allDocuments.filter(d => d.type === "act").length,
    waybills: allDocuments.filter(d => d.type === "waybill").length,
  }), [allDocuments]);

  return (
    <div className="space-y-4">
      {/* Header with filter */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Select value={filter} onValueChange={(v) => setFilter(v as DocumentType)}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Тип документа" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Усі ({stats.total})
              </span>
            </SelectItem>
            <SelectItem value="invoice">
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Рахунки ({stats.invoices})
              </span>
            </SelectItem>
            <SelectItem value="act">
              <span className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Акти ({stats.acts})
              </span>
            </SelectItem>
            <SelectItem value="waybill">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Накладні ({stats.waybills})
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Button size="sm" onClick={onAddDocument}>
          <Plus className="h-4 w-4 mr-1" />
          Створити
        </Button>
      </div>
      
      {/* Documents Table */}
      {filteredDocuments.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px]">Тип</TableHead>
                <TableHead>Номер</TableHead>
                <TableHead className="w-[100px]">Дата</TableHead>
                <TableHead>Контрагент</TableHead>
                <TableHead className="w-[60px] text-center">К-ть</TableHead>
                <TableHead className="w-[100px] text-right">Сума</TableHead>
                <TableHead className="w-[100px]">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => {
                const TypeIcon = documentTypeLabels[doc.type]?.icon || FileText;
                const statusInfo = statusLabels[doc.status];
                
                return (
                  <TableRow 
                    key={doc.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onNavigateToDocument?.(doc.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{documentTypeLabels[doc.type]?.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{doc.number}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {doc.date}
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]">
                      {doc.contractor}
                    </TableCell>
                    <TableCell className="text-center">
                      {doc.quantity}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNomenclaturePrice(doc.amount, item.pricing.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Документів не знайдено</p>
          {filter !== "all" && (
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setFilter("all")}
            >
              Показати всі документи
            </Button>
          )}
        </div>
      )}
      
      {/* Footer hint */}
      <p className="text-xs text-muted-foreground">
        💡 Натисніть на документ для переходу до детального перегляду
      </p>
    </div>
  );
};
