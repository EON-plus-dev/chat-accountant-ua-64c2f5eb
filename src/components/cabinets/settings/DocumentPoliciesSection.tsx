import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  Languages,
  Workflow,
  ArrowRight,
  Plus,
  Link,
  FileText,
  Edit,
  Trash2,
  RefreshCw,
  Bell,
  FileCheck,
  Info,
  Hash,
  Archive,
  Table as TableIcon,
  LayoutGrid,
  Copy,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { getAllTemplates, demoCustomTemplates, templateTypeFilters, type DocumentTemplate } from "@/config/documentTemplatesConfig";
import { useToast } from "@/hooks/use-toast";
import { DocumentNumberingConfig } from "./DocumentNumberingConfig";
import { TemplatesTable } from "./TemplatesTable";
import { 
  getProlongationPolicyForCabinet, 
  prolongationTypeLabels, 
  noticePeriodOptions,
  type ProlongationPolicy,
} from "@/config/settingsConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import UnifiedFilterPopover from "@/components/ui/UnifiedFilterPopover";
import { useIsMobile } from "@/hooks/use-mobile";
import { retentionCategories } from "@/config/complianceConfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText as FileTextIcon } from "lucide-react";

interface DocumentPoliciesSectionProps {
  cabinet: Cabinet;
  onNavigateToCreateTemplate?: () => void;
  onNavigateToTemplateDetail?: (templateId: string) => void;
}

export const DocumentPoliciesSection = ({
  cabinet, 
  onNavigateToCreateTemplate, 
  onNavigateToTemplateDetail 
}: DocumentPoliciesSectionProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("templates");
  
  // Templates state
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());
  
  // Prolongation policy state
  const cabinetPolicy = getProlongationPolicyForCabinet(cabinet);
  const [prolongationPolicy, setProlongationPolicy] = useState<ProlongationPolicy>(cabinetPolicy);

  // Approval routes for TOV
  const approvalRoutes = cabinet.type === "tov" ? [
    { id: "1", name: "Договір", steps: ["Юрист", "Бухгалтер", "Директор"], active: true },
    { id: "2", name: "Рахунок >50k", steps: ["Бухгалтер", "Директор"], active: true },
    { id: "3", name: "Внутрішні документи", steps: ["Керівник відділу"], active: false },
  ] : null;

  // Combine all templates from centralized source
  const allTemplates = useMemo(() => getAllTemplates(), []);

  // Template counts by category
  const systemCount = useMemo(() => 
    allTemplates.filter(t => t.category === "system").length, 
  [allTemplates]);

  const customCount = useMemo(() => 
    allTemplates.filter(t => t.category === "custom").length, 
  [allTemplates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(templateSearchQuery.toLowerCase());
      
      const matchesCategory = activeCategoryFilter === "all" || t.category === activeCategoryFilter;
      
      const matchesType = activeTypeFilter === "all" || t.type === activeTypeFilter || 
        (activeTypeFilter === "contract" && ["contract", "rental-agreement", "sale-agreement", "supply-contract", "fop-service-contract"].includes(t.type)) ||
        (activeTypeFilter === "hr" && ["employment-order", "dismissal-order", "vacation-order"].includes(t.type));
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [allTemplates, templateSearchQuery, activeCategoryFilter, activeTypeFilter]);

  // Active filters count (both category and type)
  const activeFiltersCount = 
    (activeTypeFilter !== "all" ? 1 : 0) + 
    (activeCategoryFilter !== "all" ? 1 : 0);

  const handleResetFilters = () => {
    setActiveTypeFilter("all");
    setActiveCategoryFilter("all");
  };

  const handleDeleteTemplate = (templateId: string) => {
    toast({
      title: "Демо-режим",
      description: "Видалення шаблонів буде доступне після запуску",
    });
  };

  const handleEditTemplate = (templateId: string) => {
    toast({
      title: "Демо-режим",
      description: "Редагування шаблонів буде доступне після запуску",
    });
  };

  const handleDuplicateTemplate = (templateId: string) => {
    toast({
      title: "Демо-режим",
      description: "Дублювання шаблонів буде доступне після запуску",
    });
  };

  const handleBatchDelete = () => {
    toast({
      title: "Демо-режим",
      description: `Видалення ${selectedTemplateIds.size} шаблонів буде доступне після запуску`,
    });
    setSelectedTemplateIds(new Set());
  };

  const handleBatchDuplicate = () => {
    toast({
      title: "Демо-режим",
      description: `Дублювання ${selectedTemplateIds.size} шаблонів буде доступне після запуску`,
    });
    setSelectedTemplateIds(new Set());
  };

  // Filter sections for popover
  const filterSections = [
    {
      id: "category",
      label: "Категорія",
      options: [
        { value: "all", label: `Всі (${allTemplates.length})` },
        { value: "system", label: `Системні (${systemCount})` },
        { value: "custom", label: `Мої (${customCount})` },
      ],
      value: activeCategoryFilter,
      onChange: setActiveCategoryFilter,
    },
    {
      id: "type",
      label: "Тип документа",
      options: [
        ...templateTypeFilters.map(f => ({ value: f.id, label: f.label })),
        { value: "hr", label: "HR/Кадри" },
      ],
      value: activeTypeFilter,
      onChange: setActiveTypeFilter,
    },
  ];

  // Render templates content
  const renderTemplatesContent = () => (
    <div className="space-y-4">
      {/* Batch actions */}
      {selectedTemplateIds.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">Обрано: {selectedTemplateIds.size}</span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={handleBatchDuplicate}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Дублювати
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-destructive hover:text-destructive"
            onClick={handleBatchDelete}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Видалити
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setSelectedTemplateIds(new Set())}
          >
            Скасувати
          </Button>
        </div>
      )}

      {/* Templates list */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Шаблонів не знайдено</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs">
            Спробуйте змінити параметри пошуку або фільтри
          </p>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Скинути фільтри
            </Button>
          )}
        </div>
      ) : viewMode === "table" || isMobile ? (
        <TemplatesTable
          templates={filteredTemplates}
          selectedIds={selectedTemplateIds}
          onSelectionChange={setSelectedTemplateIds}
          onNavigateToDetail={onNavigateToTemplateDetail}
          onEdit={handleEditTemplate}
          onDuplicate={handleDuplicateTemplate}
          onDelete={handleDeleteTemplate}
        />
      ) : (
        // Card view (grouped)
        <div className="space-y-4">
          {/* Custom templates first */}
          {filteredTemplates.filter(t => t.category === "custom").length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Мої шаблони</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredTemplates.filter(t => t.category === "custom").map((template) => {
                  const TemplateIcon = template.icon;
                  return (
                    <div 
                      key={template.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
                      onClick={() => onNavigateToTemplateDetail?.(template.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                          <TemplateIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{template.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); handleEditTemplate(template.id); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* System templates */}
          {filteredTemplates.filter(t => t.category === "system").length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Системні шаблони</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredTemplates.filter(t => t.category === "system").map((template) => {
                  const TemplateIcon = template.icon;
                  return (
                    <div 
                      key={template.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
                      onClick={() => onNavigateToTemplateDetail?.(template.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-lg bg-muted p-2 shrink-0">
                          <TemplateIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{template.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render retention policies content
  const renderRetentionContent = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Терміни зберігання документів</CardTitle>
        </div>
        <CardDescription>
          Автоматична архівація та видалення документів відповідно до законодавства
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Категорія</TableHead>
                <TableHead className="w-[120px]">Термін</TableHead>
                <TableHead className="hidden md:table-cell">Правова основа</TableHead>
                <TableHead className="w-[100px] text-right">Автоархівація</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(retentionCategories).map(([key, config]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium">{config.labelUk}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {Math.floor(config.days / 365)} років
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {config.legalBasis}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch defaultChecked />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  // Render prolongation content
  const renderProlongationContent = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Правила пролонгації договорів</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Ці правила застосовуються, якщо в тексті договору не вказано умови пролонгації. 
                  AI спершу спробує витягти умови з тексту.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Налаштування за замовчуванням для автоматичного продовження договорів
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Default prolongation type */}
        <div className="space-y-2">
          <Label htmlFor="prolongationType">Тип пролонгації за замовчуванням</Label>
          <Select 
            value={prolongationPolicy.defaultType}
            onValueChange={(value: ProlongationPolicy["defaultType"]) => 
              setProlongationPolicy(prev => ({ ...prev, defaultType: value }))
            }
          >
            <SelectTrigger id="prolongationType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(prolongationTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notice period */}
        <div className="space-y-2">
          <Label htmlFor="noticePeriod">Попереджати про закінчення за</Label>
          <Select 
            value={String(prolongationPolicy.noticePeriodDays)}
            onValueChange={(value) => 
              setProlongationPolicy(prev => ({ ...prev, noticePeriodDays: Number(value) }))
            }
          >
            <SelectTrigger id="noticePeriod">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {noticePeriodOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto reminder switch */}
        <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Автоматичні нагадування</p>
              <p className="text-xs text-muted-foreground">
                Система автоматично створить нагадування за вказаний термін до закінчення договору
              </p>
            </div>
          </div>
          <Switch 
            checked={prolongationPolicy.autoSetReminder}
            onCheckedChange={(checked) => 
              setProlongationPolicy(prev => ({ ...prev, autoSetReminder: checked }))
            }
          />
        </div>

        {/* Priority hierarchy info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
          <p className="text-xs font-medium text-primary flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5" />
            Ієрархія визначення умов пролонгації
          </p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li><strong>Текст договору</strong> — AI витягує умови з тексту (найвищий пріоритет)</li>
            <li><strong>Політика кабінету</strong> — ці налаштування</li>
            <li><strong>Системні правила</strong> — якщо нічого не налаштовано</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );

  // Render approval routes content
  const renderApprovalRoutesContent = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Маршрути погодження</CardTitle>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Новий маршрут
          </Button>
        </div>
        <CardDescription>
          Ланцюжки погодження для різних типів документів
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {approvalRoutes?.map((route) => (
          <div 
            key={route.id}
            className={`rounded-lg border p-4 hover:shadow-md transition-all ${!route.active ? "opacity-60" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="font-medium">{route.name}</p>
                <Badge variant={route.active ? "default" : "secondary"}>
                  {route.active ? "Активний" : "Неактивний"}
                </Badge>
              </div>
              <Switch defaultChecked={route.active} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {route.steps.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <Badge variant="outline">{step}</Badge>
                  {index < route.steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // Render language settings content  
  const renderLanguageContent = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Мовні налаштування</CardTitle>
        </div>
        <CardDescription>
          Налаштування мови документів за замовчуванням
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="docLanguage">Мова документів за замовчуванням</Label>
          <Select defaultValue="uk">
            <SelectTrigger id="docLanguage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uk">Українська</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="font-medium text-sm">Двомовні документи</p>
            <p className="text-xs text-muted-foreground">
              Генерувати документи двома мовами (основна + переклад)
            </p>
          </div>
          <Switch />
        </div>

        <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Прив'язка реквізитів</span>
            </div>
            <Badge variant="outline">Активна</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Автозаповнення реквізитів з профілю кабінету та контрагентів
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Tabs navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="templates" className="gap-1.5">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Шаблони</span>
          </TabsTrigger>
          <TabsTrigger value="numbering" className="gap-1.5">
            <Hash className="h-4 w-4" />
            <span className="hidden sm:inline">Нумерація</span>
          </TabsTrigger>
          {cabinet.type === "tov" && (
            <TabsTrigger value="approval" className="gap-1.5">
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">Маршрути</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="retention" className="gap-1.5">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Зберігання</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">Інше</span>
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4 space-y-4">
          <UnifiedToolbar
            searchValue={templateSearchQuery}
            onSearchChange={setTemplateSearchQuery}
            searchPlaceholder="Пошук шаблонів..."
            filterSlot={
              <UnifiedFilterPopover
                sections={filterSections}
                activeFiltersCount={activeFiltersCount}
                onReset={handleResetFilters}
                title="Фільтри шаблонів"
                triggerLabel="Фільтри"
                isMobile={isMobile}
              />
            }
            mobileFilterContent={
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Категорія</Label>
                  <Select value={activeCategoryFilter} onValueChange={setActiveCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Категорія" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі ({allTemplates.length})</SelectItem>
                      <SelectItem value="system">Системні ({systemCount})</SelectItem>
                      <SelectItem value="custom">Мої ({customCount})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Тип документа</Label>
                  <Select value={activeTypeFilter} onValueChange={setActiveTypeFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Тип документа" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypeFilters.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                      ))}
                      <SelectItem value="hr">HR/Кадри</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetFilters}
                    className="w-full"
                  >
                    Скинути фільтри
                  </Button>
                )}
              </div>
            }
            viewMode={viewMode === "table" ? "list" : "grid"}
            onViewModeChange={(mode) => setViewMode(mode === "list" ? "table" : "cards")}
            actions={
              <Button size="sm" onClick={onNavigateToCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Шаблон
              </Button>
            }
          />
          {renderTemplatesContent()}
        </TabsContent>

        {/* Numbering Tab */}
        <TabsContent value="numbering" className="mt-4">
          <DocumentNumberingConfig cabinetId={cabinet.id} />
        </TabsContent>

        {/* Approval Routes Tab (TOV only) */}
        {cabinet.type === "tov" && (
          <TabsContent value="approval" className="mt-4 space-y-4">
            {renderApprovalRoutesContent()}
          </TabsContent>
        )}

        {/* Retention Tab */}
        <TabsContent value="retention" className="mt-4 space-y-4">
          {renderRetentionContent()}
          {renderProlongationContent()}
        </TabsContent>

        {/* Other Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          {renderLanguageContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentPoliciesSection;
