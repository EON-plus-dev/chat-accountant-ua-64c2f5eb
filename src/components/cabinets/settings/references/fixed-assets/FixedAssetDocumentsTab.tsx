import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, FileCheck, FileX, ShieldCheck, Car, ScrollText, KeyRound } from "lucide-react";
import type { FixedAsset } from "@/config/fixedAssetsConfig";

interface Document {
  id: string;
  name: string;
  date: string;
  status: "signed" | "draft" | "archived";
  icon: React.ElementType;
}

const statusLabels: Record<string, string> = {
  signed: "Підписаний",
  draft: "Чернетка",
  archived: "Архів",
};

const statusColors: Record<string, string> = {
  signed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function generateDocuments(asset: FixedAsset): Document[] {
  const docs: Document[] = [
    {
      id: "doc-1",
      name: "Акт введення в експлуатацію",
      date: asset.purchaseDate,
      status: "signed",
      icon: FileCheck,
    },
    {
      id: "doc-2",
      name: "Акт прийому-передачі",
      date: asset.purchaseDate,
      status: "signed",
      icon: FileText,
    },
  ];

  // Category-specific documents
  if (asset.category === "transport") {
    docs.push(
      {
        id: "doc-transport-1",
        name: "Свідоцтво про реєстрацію ТЗ",
        date: asset.purchaseDate,
        status: "signed",
        icon: Car,
      },
      {
        id: "doc-transport-2",
        name: "Страховий поліс ОСАЦВ",
        date: asset.purchaseDate,
        status: asset.status === "active" ? "signed" : "archived",
        icon: ShieldCheck,
      },
    );
  }

  if (asset.category === "equipment") {
    docs.push({
      id: "doc-equip-1",
      name: "Паспорт обладнання",
      date: asset.purchaseDate,
      status: "archived",
      icon: ScrollText,
    });
    docs.push({
      id: "doc-equip-2",
      name: "Гарантійний талон",
      date: asset.purchaseDate,
      status: "archived",
      icon: ShieldCheck,
    });
  }

  if (asset.category === "intangible") {
    docs.push({
      id: "doc-intang-1",
      name: "Ліцензійний договір",
      date: asset.purchaseDate,
      status: "signed",
      icon: KeyRound,
    });
  }

  if (asset.status === "written-off") {
    docs.push({
      id: "doc-wo",
      name: "Акт списання",
      date: asset.writeOffDate || (() => {
        const d = new Date(asset.purchaseDate);
        d.setMonth(d.getMonth() + asset.usefulLifeMonths);
        return d.toISOString().split("T")[0];
      })(),
      status: "signed",
      icon: FileX,
    });
  }

  if (asset.status === "sold") {
    docs.push({
      id: "doc-sale",
      name: "Договір купівлі-продажу",
      date: asset.saleDate || new Date().toISOString().split("T")[0],
      status: "signed",
      icon: FileText,
    });
  }

  return docs;
}

interface FixedAssetDocumentsTabProps {
  asset: FixedAsset;
}

export const FixedAssetDocumentsTab = ({ asset }: FixedAssetDocumentsTabProps) => {
  const docs = useMemo(() => generateDocuments(asset), [asset]);

  return (
    <div className="space-y-2">
      {docs.map((doc) => {
        const Icon = doc.icon;
        return (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="shrink-0 h-9 w-9 rounded-md bg-muted flex items-center justify-center">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(doc.date).toLocaleDateString("uk-UA")}
              </p>
            </div>
            <Badge className={statusColors[doc.status]}>{statusLabels[doc.status]}</Badge>
          </div>
        );
      })}
      {docs.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">Документів не знайдено</p>
      )}
    </div>
  );
};
