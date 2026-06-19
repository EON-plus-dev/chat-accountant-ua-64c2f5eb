import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Star, CheckCircle, Pencil, EyeOff } from "lucide-react";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { 
  getIncomeCategoriesForCabinet,
  isSystemCategory,
  type IncomeCategory,
} from "@/config/categoriesConfig";
import { IncomeCategorySheet } from "./categories/IncomeCategorySheet";
import { toast } from "sonner";
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

interface IncomeCategoriesContentProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const taxGroupLabels: Record<string, string> = {
  services: "Послуги",
  goods: "Товари",
  other: "Інше",
};

export const IncomeCategoriesContent = ({ 
  searchQuery, 
  onSearchChange 
}: IncomeCategoriesContentProps) => {
  const [localCategories, setLocalCategories] = useState<IncomeCategory[]>(() =>
    getIncomeCategoriesForCabinet()
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IncomeCategory | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<IncomeCategory | null>(null);

  const categories = useMemo(() => {
    const active = localCategories.filter(c => c.isActive);
    if (!searchQuery) return active;
    const query = searchQuery.toLowerCase();
    return active.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.code.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    );
  }, [searchQuery, localCategories]);

  const existingCodes = useMemo(() => localCategories.map(c => c.code), [localCategories]);

  const handleCreate = () => {
    setEditingCategory(null);
    setSheetOpen(true);
  };

  const handleEdit = (category: IncomeCategory) => {
    setEditingCategory(category);
    setSheetOpen(true);
  };

  const handleSave = (saved: IncomeCategory) => {
    setLocalCategories(prev => {
      const exists = prev.find(c => c.id === saved.id);
      if (exists) {
        // If setting as default, unset previous default
        let updated = prev.map(c =>
          c.id === saved.id ? saved : (saved.isDefault ? { ...c, isDefault: false } : c)
        );
        return updated;
      }
      // New category — unset previous default if needed
      if (saved.isDefault) {
        return [...prev.map(c => ({ ...c, isDefault: false })), saved];
      }
      return [...prev, saved];
    });
    toast.success(editingCategory ? "Категорію оновлено" : "Категорію створено");
  };

  const handleDeactivate = (category: IncomeCategory) => {
    setDeactivateTarget(category);
  };

  const confirmDeactivate = () => {
    if (!deactivateTarget) return;
    setLocalCategories(prev =>
      prev.map(c => c.id === deactivateTarget.id ? { ...c, isActive: false } : c)
    );
    toast.success(`Категорію "${deactivateTarget.name}" деактивовано`);
    setDeactivateTarget(null);
  };

  return (
    <div className="space-y-4">
      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Пошук категорій..."
        sticky={false}
        actions={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Додати
          </Button>
        }
      />
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={() => handleEdit(category)}
            onDeactivate={() => handleDeactivate(category)}
          />
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Категорій не знайдено</p>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground pt-2 border-t">
        💡 Категорії використовуються для класифікації доходів у Книзі доходів та звітності
      </div>

      <IncomeCategorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={editingCategory}
        existingCodes={existingCodes}
        onSave={handleSave}
        isSystemCategory={editingCategory ? isSystemCategory(editingCategory) : false}
      />

      <AlertDialog open={!!deactivateTarget} onOpenChange={(v) => !v && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Деактивувати категорію?</AlertDialogTitle>
            <AlertDialogDescription>
              Категорія "{deactivateTarget?.name}" буде прихована з усіх Select-ів, але існуючі записи не постраждають.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>Деактивувати</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function CategoryCard({ 
  category, 
  onEdit, 
  onDeactivate 
}: { 
  category: IncomeCategory;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const isSystem = isSystemCategory(category);

  return (
    <div 
      className="group relative rounded-lg border p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer bg-card"
      onClick={onEdit}
    >
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1 rounded hover:bg-muted"
          title="Редагувати"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeactivate(); }}
          className="p-1 rounded hover:bg-muted"
          title="Деактивувати"
        >
          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <span className="text-2xl">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {category.code}
            </Badge>
            {category.isDefault && (
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            )}
            {category.cabinetId && (
              <Badge variant="outline" className="text-[10px] px-1">
                кастомна
              </Badge>
            )}
          </div>
          <h4 className="font-medium mt-1 text-sm">{category.name}</h4>
          {category.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {category.description}
            </p>
          )}
          {category.taxGroup && (
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {taxGroupLabels[category.taxGroup]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
