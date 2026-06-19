import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Hash, Edit, Settings2, Eye, RefreshCw, CheckCircle, Info, Zap, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  defaultNumberingRules,
  documentTypeLabels,
  yearFormatLabels,
  resetPolicyLabels,
  lockAfterLabels,
  formatNumberPreview,
  type NumberingRule,
  type YearFormat,
  type ResetPolicy,
  type LockAfterStatus,
} from "@/config/documentNumberingConfig";

interface DocumentNumberingConfigProps {
  cabinetId: string;
}

export const DocumentNumberingConfig = ({ cabinetId }: DocumentNumberingConfigProps) => {
  const { toast } = useToast();
  const [rules, setRules] = useState<NumberingRule[]>(defaultNumberingRules);
  const [editingRule, setEditingRule] = useState<NumberingRule | null>(null);
  const [gaplessNumbering, setGaplessNumbering] = useState(true);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [ruleToReset, setRuleToReset] = useState<string | null>(null);

  const handleEditRule = (rule: NumberingRule) => {
    setEditingRule({ ...rule });
  };

  const handleSaveRule = () => {
    if (!editingRule) return;
    
    setRules(prev => prev.map(r => 
      r.documentType === editingRule.documentType ? editingRule : r
    ));
    setEditingRule(null);
    
    toast({
      title: "Правило збережено",
      description: `Нумерація для "${documentTypeLabels[editingRule.documentType]}" оновлена`,
    });
  };

  const handleResetSequence = (documentType: string) => {
    setRules(prev => prev.map(r => 
      r.documentType === documentType 
        ? { ...r, currentSequence: r.startNumber - 1, lastResetDate: new Date().toISOString() }
        : r
    ));
    setResetDialogOpen(false);
    setRuleToReset(null);
    
    toast({
      title: "Лічильник скинуто",
      description: "Нумерація почнеться з початкового номера",
    });
  };

  const openResetDialog = (documentType: string) => {
    setRuleToReset(documentType);
    setResetDialogOpen(true);
  };

  // Group rules by category
  const financialRules = rules.filter(r => 
    ["invoice", "act", "waybill", "ttn", "tax-invoice"].includes(r.documentType)
  );
  const contractRules = rules.filter(r => 
    ["contract", "rental-agreement", "sale-agreement", "supply-contract", "fop-service-contract"].includes(r.documentType)
  );
  const hrRules = rules.filter(r => 
    ["employment-order", "dismissal-order", "vacation-order"].includes(r.documentType)
  );
  const internalRules = rules.filter(r => 
    ["power-of-attorney", "reconciliation"].includes(r.documentType)
  );

  // Calculate sequence progress (for visual indicator)
  const getSequenceProgress = (rule: NumberingRule) => {
    const maxSequence = Math.pow(10, rule.sequencePadding) - 1;
    return Math.min((rule.currentSequence / maxSequence) * 100, 100);
  };

  const renderRulesTable = (rulesGroup: NumberingRule[], title: string) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[180px]">Тип документа</TableHead>
              <TableHead className="w-[100px]">Префікс</TableHead>
              <TableHead className="w-[160px]">Приклад номера</TableHead>
              <TableHead className="w-[120px]">Поточний №</TableHead>
              <TableHead className="w-[80px]">Скидання</TableHead>
              <TableHead className="w-[100px] text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rulesGroup.map((rule) => (
              <TableRow key={rule.documentType} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {documentTypeLabels[rule.documentType]}
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      <Zap className="w-2.5 h-2.5 mr-0.5" />
                      Auto
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {rule.prefix}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {formatNumberPreview(rule)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">
                        #{rule.currentSequence.toString().padStart(rule.sequencePadding, '0')}
                      </span>
                    </div>
                    <Progress 
                      value={getSequenceProgress(rule)} 
                      className="h-1 w-16"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {resetPolicyLabels[rule.resetPolicy]}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => openResetDialog(rule.documentType)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Скинути лічильник</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleEditRule(rule)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      <div className="rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Система нумерації активна
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
              Автоматична генерація номерів документів працює. Всі номери унікальні та відповідають налаштованим правилам.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Захист від дублікатів</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Атомарна генерація</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Глобальні налаштування</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <Label htmlFor="gapless">Безперервна нумерація</Label>
                <p className="text-sm text-muted-foreground">
                  Забороняти пропуски в послідовності номерів
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    При скасуванні документа номер буде зарезервовано. Нові документи отримають наступний номер.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch 
              id="gapless" 
              checked={gaplessNumbering}
              onCheckedChange={setGaplessNumbering}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <Label htmlFor="duplicates">Перевірка дублікатів</Label>
                <p className="text-sm text-muted-foreground">
                  Блокувати створення документів з однаковими номерами
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    Система перевірятиме унікальність номера перед збереженням документа.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch 
              id="duplicates" 
              checked={checkDuplicates}
              onCheckedChange={setCheckDuplicates}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rules by Category */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Правила нумерації по типах</CardTitle>
          </div>
          <CardDescription>
            Налаштуйте формат номерів для кожного типу документів
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderRulesTable(financialRules, "Фінансові документи")}
          {renderRulesTable(contractRules, "Договори")}
          {renderRulesTable(hrRules, "HR/Кадрові документи")}
          {renderRulesTable(internalRules, "Внутрішні документи")}
        </CardContent>
      </Card>

      {/* Edit Rule Sheet */}
      <Sheet open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
        <SheetContent className="sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Налаштування нумерації
            </SheetTitle>
            <SheetDescription>
              {editingRule && documentTypeLabels[editingRule.documentType]}
            </SheetDescription>
          </SheetHeader>

          {editingRule && (
            <div className="space-y-6 py-6">
              {/* Live Preview */}
              <div className="rounded-lg border bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Приклад номера</p>
                <p className="text-2xl font-mono font-semibold">
                  {formatNumberPreview(editingRule)}
                </p>
              </div>

              {/* Prefix */}
              <div className="space-y-2">
                <Label htmlFor="prefix">Префікс</Label>
                <Input 
                  id="prefix"
                  value={editingRule.prefix}
                  onChange={(e) => setEditingRule({ ...editingRule, prefix: e.target.value.toUpperCase() })}
                  placeholder="INV"
                  className="font-mono"
                  maxLength={6}
                />
              </div>

              {/* Branch Code */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="branchCode">Код філії/відділу</Label>
                  <Switch 
                    id="includeBranch"
                    checked={editingRule.includeBranchCode}
                    onCheckedChange={(checked) => setEditingRule({ 
                      ...editingRule, 
                      includeBranchCode: checked 
                    })}
                  />
                </div>
                {editingRule.includeBranchCode && (
                  <Input 
                    id="branchCode"
                    value={editingRule.branchCode || ""}
                    onChange={(e) => setEditingRule({ ...editingRule, branchCode: e.target.value.toUpperCase() })}
                    placeholder="KYV"
                    className="font-mono"
                    maxLength={4}
                  />
                )}
              </div>

              {/* Year Format */}
              <div className="space-y-2">
                <Label>Формат року</Label>
                <Select 
                  value={editingRule.yearFormat}
                  onValueChange={(value) => setEditingRule({ 
                    ...editingRule, 
                    yearFormat: value as YearFormat 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(yearFormatLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sequence Padding */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Кількість цифр у номері</Label>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {"0".repeat(editingRule.sequencePadding - 1)}1
                  </span>
                </div>
                <Slider
                  value={[editingRule.sequencePadding]}
                  onValueChange={([value]) => setEditingRule({ 
                    ...editingRule, 
                    sequencePadding: value 
                  })}
                  min={3}
                  max={8}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3 цифри</span>
                  <span>8 цифр</span>
                </div>
              </div>

              {/* Separator */}
              <div className="space-y-2">
                <Label>Розділювач</Label>
                <div className="flex gap-2">
                  {["-", "/", "_", "."].map((sep) => (
                    <Button
                      key={sep}
                      variant={editingRule.separator === sep ? "default" : "outline"}
                      size="sm"
                      className="w-12 font-mono"
                      onClick={() => setEditingRule({ ...editingRule, separator: sep })}
                    >
                      {sep}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reset Policy */}
              <div className="space-y-2">
                <Label>Політика скидання</Label>
                <Select 
                  value={editingRule.resetPolicy}
                  onValueChange={(value) => setEditingRule({ 
                    ...editingRule, 
                    resetPolicy: value as ResetPolicy 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(resetPolicyLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Коли лічильник повертається до початкового номера
                </p>
              </div>

              {/* Start Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startNumber">Початковий номер</Label>
                  <Input 
                    id="startNumber"
                    type="number"
                    value={editingRule.startNumber}
                    onChange={(e) => setEditingRule({ 
                      ...editingRule, 
                      startNumber: parseInt(e.target.value) || 1 
                    })}
                    min={1}
                    className="tabular-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Поточний номер</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={editingRule.currentSequence}
                      disabled
                      className="tabular-nums bg-muted"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleResetSequence(editingRule.documentType)}
                      title="Скинути лічильник"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lock After */}
              <div className="space-y-2">
                <Label>Заблокувати редагування номера</Label>
                <Select 
                  value={editingRule.lockAfter}
                  onValueChange={(value) => setEditingRule({ 
                    ...editingRule, 
                    lockAfter: value as LockAfterStatus 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(lockAfterLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Manual Override */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="manualOverride">Дозволити ручне введення</Label>
                  <p className="text-sm text-muted-foreground">
                    Можливість вказати номер вручну при створенні
                  </p>
                </div>
                <Switch 
                  id="manualOverride"
                  checked={editingRule.allowManualOverride}
                  onCheckedChange={(checked) => setEditingRule({ 
                    ...editingRule, 
                    allowManualOverride: checked 
                  })}
                />
              </div>

              {/* Save Button */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditingRule(null)}
                >
                  Скасувати
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSaveRule}
                >
                  Зберегти
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Скинути лічильник?</AlertDialogTitle>
            <AlertDialogDescription>
              {ruleToReset && (
                <>
                  Лічильник для "{documentTypeLabels[ruleToReset]}" буде скинуто до початкового значення. 
                  Ця дія не вплине на існуючі документи, але нові документи будуть нумеруватися з початку.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => ruleToReset && handleResetSequence(ruleToReset)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Скинути
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
