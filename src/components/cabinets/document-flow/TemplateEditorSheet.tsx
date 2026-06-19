import { useState, useEffect } from "react";
import {
  FileText, Plus, Trash2, GripVertical, Image, Palette,
  Type, Save, Eye, ArrowLeft, Upload, X, Settings2
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { DocumentTemplate, TemplateVariable } from "@/config/documentTemplatesConfig";

interface TemplateEditorSheetProps {
  cabinet: Cabinet;
  template: DocumentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (template: DocumentTemplate) => void;
  isCreatingNew?: boolean;
}

interface TemplateStyles {
  primaryColor: string;
  fontFamily: string;
  fontSize: "small" | "medium" | "large";
  headerStyle: "simple" | "modern" | "classic";
  showLogo: boolean;
  logoPosition: "left" | "center" | "right";
  showBorder: boolean;
  showWatermark: boolean;
}

const defaultStyles: TemplateStyles = {
  primaryColor: "#1a56db",
  fontFamily: "sans-serif",
  fontSize: "medium",
  headerStyle: "modern",
  showLogo: true,
  logoPosition: "left",
  showBorder: true,
  showWatermark: false,
};

const fontOptions = [
  { value: "sans-serif", label: "Sans Serif (сучасний)" },
  { value: "serif", label: "Serif (класичний)" },
  { value: "monospace", label: "Monospace (технічний)" },
];

const fontSizeOptions = [
  { value: "small", label: "Малий (10pt)" },
  { value: "medium", label: "Середній (12pt)" },
  { value: "large", label: "Великий (14pt)" },
];

const headerStyleOptions = [
  { value: "simple", label: "Простий" },
  { value: "modern", label: "Сучасний" },
  { value: "classic", label: "Класичний" },
];

const variableSourceOptions = [
  { value: "cabinet", label: "З кабінету (автозаповнення)" },
  { value: "contractor", label: "Від контрагента" },
  { value: "manual", label: "Ручне введення" },
];

export const TemplateEditorSheet = ({
  cabinet,
  template,
  open,
  onOpenChange,
  onSave,
  isCreatingNew = false,
}: TemplateEditorSheetProps) => {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [styles, setStyles] = useState<TemplateStyles>(defaultStyles);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when template changes
  useEffect(() => {
    if (template && open) {
      setName(template.name);
      setDescription(template.description);
      setVariables(template.variables || []);
      // In real app, styles would come from template
      setStyles(defaultStyles);
    } else if (isCreatingNew && open) {
      setName("");
      setDescription("");
      setVariables([]);
      setStyles(defaultStyles);
      setLogoUrl(null);
    }
  }, [template, open, isCreatingNew]);

  // Add new variable
  const handleAddVariable = () => {
    const newVariable: TemplateVariable = {
      key: `field_${Date.now()}`,
      label: "Нове поле",
      source: "manual",
      defaultValue: "",
    };
    setVariables([...variables, newVariable]);
  };

  // Update variable
  const handleUpdateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    setVariables(variables.map((v, i) => 
      i === index ? { ...v, ...updates } : v
    ));
  };

  // Remove variable
  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  // Handle logo upload (mock)
  const handleLogoUpload = () => {
    // In real app, this would open file picker
    setLogoUrl("/placeholder.svg");
    toast({
      title: "Логотип завантажено",
      description: "Логотип додано до шаблону (демо)",
    });
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  // Update style
  const updateStyle = <K extends keyof TemplateStyles>(key: K, value: TemplateStyles[K]) => {
    setStyles(prev => ({ ...prev, [key]: value }));
  };

  // Handle save
  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Помилка",
        description: "Введіть назву шаблону",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    // Simulate save
    setTimeout(() => {
      const savedTemplate: DocumentTemplate = {
        id: template?.id || `custom-${Date.now()}`,
        name,
        description,
        type: template?.type || "invoice",
        category: "custom",
        icon: template?.icon || FileText,
        variables,
        usageCount: template?.usageCount || 0,
        lastModified: new Date().toISOString().split("T")[0],
        createdFrom: template?.createdFrom,
      };

      onSave?.(savedTemplate);
      setIsSaving(false);
      toast({
        title: isCreatingNew ? "Шаблон створено" : "Шаблон збережено",
        description: `"${name}" успішно ${isCreatingNew ? "створено" : "оновлено"}`,
      });
      onOpenChange(false);
    }, 800);
  };

  // Preview styles as CSS
  const previewStyles = {
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize === "small" ? "10px" : styles.fontSize === "large" ? "14px" : "12px",
    borderColor: styles.primaryColor,
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            {isCreatingNew ? "Новий шаблон" : "Редагування шаблону"}
          </SheetTitle>
          <SheetDescription>
            {isCreatingNew 
              ? "Створіть власний шаблон документа"
              : `Редагування "${template?.name}"`
            }
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="general" className="gap-1.5">
                <FileText className="h-4 w-4" />
                Загальне
              </TabsTrigger>
              <TabsTrigger value="fields" className="gap-1.5">
                <Type className="h-4 w-4" />
                Поля
              </TabsTrigger>
              <TabsTrigger value="styles" className="gap-1.5">
                <Palette className="h-4 w-4" />
                Стилі
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6">
            {/* General Tab */}
            <TabsContent value="general" className="mt-4 space-y-6">
              {/* Name & Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Назва шаблону *</Label>
                  <Input
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Наприклад: Рахунок IT-послуги"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-desc">Опис</Label>
                  <Textarea
                    id="template-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Короткий опис шаблону..."
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Logo */}
              <div className="space-y-4">
                <Label>Логотип компанії</Label>
                
                {logoUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                      <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" onClick={handleLogoUpload}>
                        <Upload className="h-4 w-4 mr-1.5" />
                        Замінити
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleRemoveLogo} className="text-destructive">
                        <X className="h-4 w-4 mr-1.5" />
                        Видалити
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handleLogoUpload}
                    className="w-full h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Натисніть для завантаження логотипу</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-logo" className="text-sm">Показувати логотип у документі</Label>
                  <Switch
                    id="show-logo"
                    checked={styles.showLogo}
                    onCheckedChange={(checked) => updateStyle("showLogo", checked)}
                  />
                </div>

                {styles.showLogo && (
                  <div className="space-y-2">
                    <Label>Позиція логотипу</Label>
                    <Select
                      value={styles.logoPosition}
                      onValueChange={(v) => updateStyle("logoPosition", v as "left" | "center" | "right")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Ліворуч</SelectItem>
                        <SelectItem value="center">По центру</SelectItem>
                        <SelectItem value="right">Праворуч</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Base template info */}
              {template?.createdFrom && (
                <>
                  <Separator />
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Створено на основі системного шаблону</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Fields Tab */}
            <TabsContent value="fields" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Поля шаблону</h4>
                  <p className="text-xs text-muted-foreground">
                    Налаштуйте поля, які будуть у документі
                  </p>
                </div>
                <Button size="sm" onClick={handleAddVariable} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Додати поле
                </Button>
              </div>

              {variables.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="p-6 text-center">
                    <Type className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Поля ще не додано</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleAddVariable}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Додати перше поле
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {variables.map((variable, index) => (
                    <AccordionItem
                      key={variable.key}
                      value={variable.key}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{variable.label}</span>
                          <Badge variant="outline" className="text-[10px] h-5">
                            {variable.source === "cabinet" ? "Автозаповнення" : 
                             variable.source === "contractor" ? "Контрагент" : "Ручне"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Назва поля</Label>
                            <Input
                              value={variable.label}
                              onChange={(e) => handleUpdateVariable(index, { label: e.target.value })}
                              placeholder="Назва поля"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ключ (ID)</Label>
                            <Input
                              value={variable.key}
                              onChange={(e) => handleUpdateVariable(index, { key: e.target.value })}
                              placeholder="field_name"
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Джерело даних</Label>
                          <Select
                            value={variable.source}
                            onValueChange={(v) => handleUpdateVariable(index, { source: v as "cabinet" | "contractor" | "manual" })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {variableSourceOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Значення за замовчуванням</Label>
                          <Input
                            value={variable.defaultValue || ""}
                            onChange={(e) => handleUpdateVariable(index, { defaultValue: e.target.value })}
                            placeholder="Опціонально..."
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveVariable(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Видалити поле
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>

            {/* Styles Tab */}
            <TabsContent value="styles" className="mt-4 space-y-6 pb-6">
              {/* Colors */}
              <div className="space-y-4">
                <Label>Основний колір</Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border cursor-pointer"
                    style={{ backgroundColor: styles.primaryColor }}
                    onClick={() => {
                      // In real app, open color picker
                    }}
                  />
                  <Input
                    value={styles.primaryColor}
                    onChange={(e) => updateStyle("primaryColor", e.target.value)}
                    placeholder="#1a56db"
                    className="font-mono w-32"
                  />
                  <div className="flex gap-1">
                    {["#1a56db", "#059669", "#dc2626", "#7c3aed", "#ea580c"].map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-6 h-6 rounded border-2 transition-all",
                          styles.primaryColor === color ? "border-foreground scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => updateStyle("primaryColor", color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Typography */}
              <div className="space-y-4">
                <h4 className="font-medium">Типографіка</h4>
                
                <div className="space-y-2">
                  <Label>Шрифт</Label>
                  <Select
                    value={styles.fontFamily}
                    onValueChange={(v) => updateStyle("fontFamily", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span style={{ fontFamily: opt.value }}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Розмір тексту</Label>
                  <Select
                    value={styles.fontSize}
                    onValueChange={(v) => updateStyle("fontSize", v as "small" | "medium" | "large")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Layout */}
              <div className="space-y-4">
                <h4 className="font-medium">Макет</h4>
                
                <div className="space-y-2">
                  <Label>Стиль заголовка</Label>
                  <Select
                    value={styles.headerStyle}
                    onValueChange={(v) => updateStyle("headerStyle", v as "simple" | "modern" | "classic")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {headerStyleOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-border">Рамка документа</Label>
                  <Switch
                    id="show-border"
                    checked={styles.showBorder}
                    onCheckedChange={(checked) => updateStyle("showBorder", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-watermark">Водяний знак "ЧЕРНЕТКА"</Label>
                  <Switch
                    id="show-watermark"
                    checked={styles.showWatermark}
                    onCheckedChange={(checked) => updateStyle("showWatermark", checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Preview */}
              <div className="space-y-3">
                <Label>Попередній перегляд стилів</Label>
                <Card
                  className="overflow-hidden"
                  style={{
                    fontFamily: styles.fontFamily,
                    borderColor: styles.showBorder ? styles.primaryColor : undefined,
                    borderWidth: styles.showBorder ? 2 : 1,
                  }}
                >
                  <div
                    className={cn(
                      "p-4",
                      styles.headerStyle === "modern" && "bg-gradient-to-r from-primary/10 to-transparent",
                      styles.headerStyle === "classic" && "border-b-2",
                    )}
                    style={{
                      borderColor: styles.primaryColor,
                    }}
                  >
                    <div className={cn(
                      "flex items-center gap-3",
                      styles.logoPosition === "center" && "justify-center flex-col",
                      styles.logoPosition === "right" && "flex-row-reverse",
                    )}>
                      {styles.showLogo && (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Image className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className={styles.logoPosition === "center" ? "text-center" : ""}>
                        <h3
                          className="font-bold"
                          style={{ 
                            color: styles.primaryColor,
                            fontSize: styles.fontSize === "small" ? "14px" : styles.fontSize === "large" ? "20px" : "16px",
                          }}
                        >
                          НАЗВА ДОКУМЕНТА
                        </h3>
                        <p className="text-xs text-muted-foreground">№ 001 від 01.01.2025</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 relative">
                    <p style={{ fontSize: previewStyles.fontSize }}>
                      Текст документа буде відображатися тут...
                    </p>
                    {styles.showWatermark && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-4xl font-bold text-muted-foreground/10 transform -rotate-45">
                          ЧЕРНЕТКА
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Скасувати
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="flex-1 gap-1.5"
          >
            {isSaving ? (
              <>Збереження...</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isCreatingNew ? "Створити" : "Зберегти"}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
