import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronRight,
  Star,
  Pencil,
  EyeOff,
} from "lucide-react";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { 
  getExpenseCategoriesGrouped,
  isSystemCategory,
  type ExpenseCategory,
  EXPENSE_CATEGORIES,
} from "@/config/categoriesConfig";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExpenseCategorySheet } from "./categories/ExpenseCategorySheet";
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

interface ExpenseCategoriesContentProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ExpenseCategoriesContent = ({ 
  searchQuery, 
  onSearchChange 
}: ExpenseCategoriesContentProps) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    operational: true,
    administrative: true,
    financial: true,
    other: true,
  });
  const [localCategories, setLocalCategories] = useState<ExpenseCategory[]>(
    () => [...EXPENSE_CATEGORIES]
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ExpenseCategory | null>(null);

  const filteredGroups = useMemo(() => {
    const groupLabels: Record<string, string> = {
      operational: "Операційні",
      administrative: "Адміністративні",
      financial: "Фінансові",
      other: "Інші",
    };
    const groups = ["operational", "administrative", "financial", "other"];
    const active = localCategories.filter(c => c.isActive && !c.cabinetId);

    const result = groups.map(group => ({
      group,
      label: groupLabels[group] || group,
      categories: active.filter(c => c.group === group).sort((a, b) => a.sortOrder - b.sortOrder),
    }));

    if (!searchQuery) return result;
    
    const query = searchQuery.toLowerCase();
    return result.map(g => ({
      ...g,
      categories: g.categories.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.code.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      ),
    })).filter(g => g.categories.length > 0);
  }, [searchQuery, localCategories]);

  const existingCodes = useMemo(() => localCategories.map(c => c.code), [localCategories]);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setSheetOpen(true);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setSheetOpen(true);
  };

  const handleSave = (saved: ExpenseCategory) => {
    setLocalCategories(prev => {
      const exists = prev.find(c => c.id === saved.id);
      if (exists) {
        let updated = prev.map(c =>
          c.id === saved.id ? saved : (saved.isDefault ? { ...c, isDefault: false } : c)
        );
        return updated;
      }
      if (saved.isDefault) {
        return [...prev.map(c => ({ ...c, isDefault: false })), saved];
      }
      return [...prev, saved];
    });
    toast.success(editingCategory ? "Категорію оновлено" : "Категорію створено");
  };

  const handleDeactivate = (category: ExpenseCategory) => {
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
      
      <div className="space-y-3">
        {filteredGroups.map((group) => (
          <Collapsible
            key={group.group}
            open={openGroups[group.group]}
            onOpenChange={() => toggleGroup(group.group)}
          >
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
              {openGroups[group.group] ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">{group.label}</span>
              <Badge variant="secondary" className="ml-auto">
                {group.categories.length}
              </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 min-w-0 pl-6 pt-2">
                {group.categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={() => handleEdit(category)}
                    onDeactivate={() => handleDeactivate(category)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
      
      {filteredGroups.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Категорій не знайдено</p>
        </div>
      )}
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-emerald-500" />
          <span>Враховується у витратах</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-destructive/70" />
          <span>Не враховується</span>
        </div>
      </div>

      <ExpenseCategorySheet
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
  onDeactivate,
}: { 
  category: ExpenseCategory;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div 
      className="group relative rounded-lg border p-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer bg-card"
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

      <div className="flex items-start gap-2.5">
        <span className="text-xl">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="font-mono text-xs">
              {category.code}
            </Badge>
            {category.isDefault && (
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            )}
            {category.cabinetId && (
              <Badge variant="outline" className="text-[10px] px-1">
                кастомна
              </Badge>
            )}
          </div>
          <h4 className="font-medium mt-1 text-sm">{category.name}</h4>
          <div className="flex items-center gap-1 mt-1.5">
            {category.isDeductible ? (
              <CheckCircle className="h-3 w-3 text-emerald-500" />
            ) : (
              <XCircle className="h-3 w-3 text-destructive/70" />
            )}
            <span className="text-xs text-muted-foreground">
              {category.isDeductible ? "Враховується" : "Не враховується"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
