import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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
import { 
  Plus, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { 
  getBankRulesForCabinet,
  type BankCategorizationRule,
} from "@/config/bankCategorizationRulesConfig";
import { getExpenseCategoryByCode, getIncomeCategoryByCode } from "@/config/categoriesConfig";
import type { Cabinet } from "@/types/cabinet";
import { toast } from "sonner";
import { BankRuleSheet } from "./bank-rules/BankRuleSheet";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BankRulesContentProps {
  cabinet: Cabinet;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const BankRulesContent = ({ 
  cabinet,
  searchQuery, 
  onSearchChange 
}: BankRulesContentProps) => {
  const [rules, setRules] = useState(() => getBankRulesForCabinet(cabinet.id));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BankCategorizationRule | null>(null);
  const [deleteRule, setDeleteRule] = useState<BankCategorizationRule | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredRules = useMemo(() => {
    if (!searchQuery) return rules;
    const query = searchQuery.toLowerCase();
    return rules.filter(r => 
      r.name.toLowerCase().includes(query) || 
      r.conditions.descriptionContains?.some(k => k.toLowerCase().includes(query)) ||
      r.action.categoryCode.toLowerCase().includes(query)
    );
  }, [rules, searchQuery]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ));
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      toast.success(rule.isActive ? "Правило вимкнено" : "Правило увімкнено");
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    setSheetOpen(true);
  };

  const handleEdit = (rule: BankCategorizationRule) => {
    setEditingRule(rule);
    setSheetOpen(true);
  };

  const handleSave = (saved: BankCategorizationRule) => {
    setRules(prev => {
      const exists = prev.find(r => r.id === saved.id);
      if (exists) {
        return prev.map(r => r.id === saved.id ? saved : r).sort((a, b) => b.priority - a.priority);
      }
      return [...prev, { ...saved, cabinetId: cabinet.id }].sort((a, b) => b.priority - a.priority);
    });
    toast.success(editingRule ? "Правило оновлено" : "Правило створено");
  };

  const confirmDelete = () => {
    if (!deleteRule) return;
    setRules(prev => prev.filter(r => r.id !== deleteRule.id));
    toast.success("Правило видалено");
    setDeleteRule(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setRules(prev => {
      const oldIndex = prev.findIndex(r => r.id === active.id);
      const newIndex = prev.findIndex(r => r.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      // Recalculate priorities: top = 100, step = -10
      return reordered.map((r, i) => ({ ...r, priority: Math.max(100 - i * 10, 1) }));
    });
    toast.success("Порядок правил змінено");
  };

  return (
    <div className="space-y-4">
      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Пошук правил..."
        sticky={false}
        actions={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Нове правило
          </Button>
        }
      />
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredRules.map(r => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <SortableRuleCard
                key={rule.id}
                rule={rule}
                onToggle={() => toggleRule(rule.id)}
                onEdit={() => handleEdit(rule)}
                onDelete={() => setDeleteRule(rule)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {filteredRules.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Правил не знайдено</p>
        </div>
      )}
      
      <Card className="bg-muted/50">
        <CardContent className="p-3 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Як працюють правила?</p>
            <p className="mt-1">
              Правила застосовуються за пріоритетом (від вищого до нижчого). 
              Перше правило, що збігається — виграє. Транзакції з автопідтвердженням 
              не потребують ручної перевірки. Перетягуйте правила для зміни пріоритету.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sheet for create/edit */}
      <BankRuleSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        rule={editingRule}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteRule} onOpenChange={v => !v && setDeleteRule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити правило?</AlertDialogTitle>
            <AlertDialogDescription>
              Правило «{deleteRule?.name}» буде видалено назавжди. Цю дію неможливо скасувати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function getCategoryName(code: string): string {
  const expense = getExpenseCategoryByCode(code);
  if (expense) return `${expense.icon || ""} ${expense.name}`.trim();
  const income = getIncomeCategoryByCode(code);
  if (income) return `${income.icon || ""} ${income.name}`.trim();
  return code;
}

function SortableRuleCard({ rule, onToggle, onEdit, onDelete }: {
  rule: BankCategorizationRule;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`transition-all ${rule.isActive ? "hover:shadow-md" : "opacity-60"}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-0.5 shrink-0 touch-none">
              <GripVertical className="h-5 w-5 text-muted-foreground/50" />
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-medium">{rule.name}</span>
                <Badge variant="outline" className="text-xs">
                  #{rule.priority}
                </Badge>
                {rule.conditions.transactionType && (
                  <Badge variant={rule.conditions.transactionType === "income" ? "default" : "secondary"} className="text-xs">
                    {rule.conditions.transactionType === "income" ? "Дохід" : "Витрата"}
                  </Badge>
                )}
              </div>
              
              {/* Conditions */}
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground/70">Якщо опис містить:</span>{" "}
                <span className="font-mono text-xs">
                  {rule.conditions.descriptionContains?.slice(0, 3).join(", ")}
                  {(rule.conditions.descriptionContains?.length || 0) > 3 && "..."}
                </span>
              </div>
              
              {/* Action */}
              <div className="flex items-center gap-3 flex-wrap text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Категорія:</span>
                  <Badge variant="secondary">
                    {getCategoryName(rule.action.categoryCode)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  {rule.action.autoConfirm ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Автопідтвердження</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs text-amber-600 dark:text-amber-400">Потребує підтвердження</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Збігів: <strong>{rule.matchCount}</strong></span>
                {rule.lastMatchedAt && (
                  <span>Останній: {formatDate(rule.lastMatchedAt)}</span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Switch 
                checked={rule.isActive} 
                onCheckedChange={onToggle}
                aria-label={rule.isActive ? "Вимкнути правило" : "Увімкнути правило"}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
