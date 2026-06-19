import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Home,
  Plus,
  Search,
  FileCheck2,
  FileX2,
  CalendarDays,
  Pencil,
  Trash2,
  Lock,
  FileText,
  Globe,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, formatCurrency } from "@/lib/formatters";
import {
  DEMO_PROPERTY_OBJECTS,
  PROPERTY_TYPE_LABELS,
  ACQUISITION_METHOD_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_ICONS,
  DATA_SOURCE_LABELS,
  shareLabel,
  type PropertyObject,
  type PropertyDataSource,
} from "@/config/propertyRegistryConfig";
import { AddPropertySheet } from "./AddPropertySheet";
import { PropertyDetailSheet } from "./PropertyDetailSheet";
import { toast } from "sonner";

interface PropertyObjectsContentProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const PropertyObjectsContent = ({
  searchQuery: externalSearch,
  onSearchChange,
}: PropertyObjectsContentProps) => {
  const [properties, setProperties] = useState<PropertyObject[]>(DEMO_PROPERTY_OBJECTS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<PropertyObject | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<PropertyObject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [initialTab, setInitialTab] = useState<"upload" | "manual" | undefined>(undefined);
  const [targetChecklistItemId, setTargetChecklistItemId] = useState<string | null>(null);

  const search = externalSearch ?? localSearch;
  const setSearch = onSearchChange ?? setLocalSearch;

  const filtered = properties.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.description.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      PROPERTY_TYPE_LABELS[p.type].toLowerCase().includes(q)
    );
  });

  const handleAdd = (property: PropertyObject) => {
    setProperties((prev) => [...prev, property]);
    // Auto-open detail after adding
    setTimeout(() => {
      setSelectedProperty(property);
      setDetailOpen(true);
    }, 300);
  };

  const handleUpdate = (updated: PropertyObject) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProperty(updated);
  };

  const handleDelete = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    toast.success("Об'єкт видалено");
    setDeleteId(null);
  };

  const handleEdit = (property: PropertyObject) => {
    setEditProperty(property);
    setSheetOpen(true);
  };


  return (
    <div className="space-y-3">
      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук по майну..."
            className="pl-9 h-9"
          />
        </div>
        <Button size="sm" onClick={() => { setEditProperty(null); setSheetOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" />
          Додати об'єкт
        </Button>
      </div>

      {/* Property list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Home className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Об'єкти майна не знайдено</p>
          <p className="text-sm mt-1">Додайте перший об'єкт, завантаживши документ або вручну</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((prop) => {
            const Icon = PROPERTY_TYPE_ICONS[prop.type];
            const isSold = prop.status === "sold";
            const docsCount = prop.documents.length;

            return (
              <Card
                key={prop.id}
                className={`transition-colors cursor-pointer hover:border-primary/40 group ${isSold ? "opacity-70" : ""}`}
                onClick={() => { setSelectedProperty(prop); setDetailOpen(true); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 shrink-0 ${isSold ? "bg-muted" : "bg-primary/10"}`}>
                      <Icon className={`h-5 w-5 ${isSold ? "text-muted-foreground" : "text-primary"}`} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm">
                          {prop.description}
                        </h4>
                        <Badge variant="outline" className="text-xs pointer-events-none">
                          {PROPERTY_TYPE_LABELS[prop.type]}
                        </Badge>
                        <Badge variant={isSold ? "outline" : "secondary"} className="text-xs pointer-events-none">
                          {PROPERTY_STATUS_LABELS[prop.status]}
                          {prop.soldDate && ` ${formatDate(prop.soldDate)}`}
                        </Badge>
                        <Badge variant="outline" className="text-xs pointer-events-none">
                          Частка: {shareLabel(prop.ownershipShare)}
                        </Badge>
                        {/* Data source badge */}
                        <Badge
                          variant={prop.dataSource === "registry" ? "default" : "outline"}
                          className={`text-xs gap-1 pointer-events-none ${
                            prop.dataSource === "registry"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : prop.dataSource === "document"
                              ? "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                              : ""
                          }`}
                        >
                          {prop.dataSource === "registry" && <Lock className="h-3 w-3" />}
                          {prop.dataSource === "document" && <FileText className="h-3 w-3" />}
                          {prop.dataSource === "manual" && <Globe className="h-3 w-3" />}
                          {DATA_SOURCE_LABELS[prop.dataSource]}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground truncate">
                        {prop.address || prop.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {ACQUISITION_METHOD_LABELS[prop.acquisitionMethod]},{" "}
                          {formatDate(prop.acquisitionDate)}
                        </span>
                        {prop.estimatedValue && (
                          <span>~{formatCurrency(prop.estimatedValue)}</span>
                        )}
                        <span className="flex items-center gap-1">
                          {docsCount > 0 ? (
                            <>
                              <FileCheck2 className="h-3 w-3 text-emerald-500" />
                              {docsCount} док.
                            </>
                          ) : (
                            <>
                              <FileX2 className="h-3 w-3 text-amber-500" />
                              Без документів
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Hover actions */}
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(prop)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(prop.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddPropertySheet
        open={sheetOpen}
        onOpenChange={(v) => { setSheetOpen(v); if (!v) { setEditProperty(null); setInitialTab(undefined); setTargetChecklistItemId(null); } }}
        onAdd={handleAdd}
        editProperty={editProperty}
        onUpdate={handleUpdate}
        initialTab={initialTab}
        targetChecklistItemId={targetChecklistItemId}
      />

      <PropertyDetailSheet
        property={selectedProperty}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUploadDocument={(checklistItemId: string) => {
          if (selectedProperty) {
            setDetailOpen(false);
            setEditProperty(selectedProperty);
            setInitialTab("upload");
            setTargetChecklistItemId(checklistItemId);
            setTimeout(() => setSheetOpen(true), 300);
          }
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити об'єкт?</AlertDialogTitle>
            <AlertDialogDescription>
              Цю дію не можна скасувати. Об'єкт буде видалено з реєстру.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
