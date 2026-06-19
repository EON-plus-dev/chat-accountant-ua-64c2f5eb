import { useState } from "react";
import {
  Tags,
  Building2,
  FolderKanban,
  Hash,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  ExternalLink,
  Edit2,
  Save,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Document } from "@/config/documentFlowConfig";
import type { DocumentClassification } from "@/types/documentClassification";
import {
  documentCategoryConfig,
  legalWeightConfig,
  evidentiaryValueConfig,
} from "@/types/documentClassification";

// ============================================
// DEMO DEPARTMENTS & PROJECTS
// ============================================

const demoDepartments = [
  { id: "accounting", label: "Бухгалтерія" },
  { id: "legal", label: "Юридичний відділ" },
  { id: "operations", label: "Операційний відділ" },
  { id: "hr", label: "HR" },
  { id: "sales", label: "Продажі" },
];

const demoProjects = [
  { id: "main", label: "Основна діяльність" },
  { id: "project-a", label: "Проект A" },
  { id: "project-b", label: "Проект B" },
];

const demoCostCenters = [
  { id: "cc-100", label: "CC-100 Адміністрація" },
  { id: "cc-200", label: "CC-200 Виробництво" },
  { id: "cc-300", label: "CC-300 Логістика" },
];

// ============================================
// COMPONENT
// ============================================

interface DocumentMetadataSectionProps {
  document: Document;
  classification?: DocumentClassification;
  onClassificationUpdate?: (updates: Partial<DocumentClassification>) => void;
  isEditable?: boolean;
  className?: string;
}

export const DocumentMetadataSection = ({
  document,
  classification,
  onClassificationUpdate,
  isEditable = true,
  className,
}: DocumentMetadataSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  // Local state for editing
  const [localDepartment, setLocalDepartment] = useState(classification?.department || "");
  const [localProject, setLocalProject] = useState(classification?.project || "");
  const [localCostCenter, setLocalCostCenter] = useState(classification?.costCenter || "");
  const [localTags, setLocalTags] = useState<string[]>(classification?.customTags || []);

  const handleAddTag = () => {
    if (newTag.trim() && !localTags.includes(newTag.trim())) {
      setLocalTags([...localTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setLocalTags(localTags.filter(t => t !== tag));
  };

  const handleSave = () => {
    onClassificationUpdate?.({
      department: localDepartment || undefined,
      project: localProject || undefined,
      costCenter: localCostCenter || undefined,
      customTags: localTags,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalDepartment(classification?.department || "");
    setLocalProject(classification?.project || "");
    setLocalCostCenter(classification?.costCenter || "");
    setLocalTags(classification?.customTags || []);
    setIsEditing(false);
  };

  const allTags = [...(classification?.autoTags || []), ...localTags];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("rounded-lg border bg-card", className)}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full p-3 hover:bg-accent/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-2">
              <Tags className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Метадані та індексація</span>
              {allTags.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {allTags.length} тегів
                </Badge>
              )}
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-4">
            <Separator />

            {/* Edit toggle */}
            {isEditable && !isEditing && (
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-3 h-3" />
                  Редагувати
                </Button>
              </div>
            )}

            {/* Classification (read-only) */}
            {classification && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Автоматична класифікація
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-md bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Категорія</p>
                    <p className="text-sm font-medium">
                      {documentCategoryConfig[classification.category]?.labelUk}
                    </p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Юридична вага</p>
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3 h-3 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {legalWeightConfig[classification.legalWeight]?.labelUk}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-md bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Доказова цінність</p>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {evidentiaryValueConfig[classification.evidentiaryValue]?.labelUk}
                      </p>
                    </div>
                  </div>
                  {classification.confidentialityLevel && (
                    <div className="p-2 rounded-md bg-muted/50">
                      <p className="text-[10px] text-muted-foreground">Конфіденційність</p>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {classification.confidentialityLevel === "public" ? "Публічний" :
                         classification.confidentialityLevel === "internal" ? "Внутрішній" :
                         classification.confidentialityLevel === "confidential" ? "Конфіденційний" :
                         "Обмежений"}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags Section */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Теги</p>
              <div className="flex flex-wrap gap-1.5">
                {/* Auto-generated tags */}
                {classification?.autoTags?.map(tag => (
                  <Badge 
                    key={`auto-${tag}`} 
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                
                {/* Custom tags */}
                {localTags.map(tag => (
                  <Badge 
                    key={`custom-${tag}`} 
                    variant="outline"
                    className="text-xs gap-1"
                  >
                    {tag}
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-0.5 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}

                {/* Add tag input */}
                {isEditing && (
                  <div className="flex items-center gap-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Новий тег..."
                      className="h-6 w-24 text-xs px-2"
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={handleAddTag}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Department / Project / Cost Center */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Організаційна структура</p>
              
              {isEditing ? (
                <div className="grid gap-3">
                  {/* Department */}
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Select value={localDepartment} onValueChange={setLocalDepartment}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Оберіть відділ" />
                      </SelectTrigger>
                      <SelectContent>
                        {demoDepartments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project */}
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Select value={localProject} onValueChange={setLocalProject}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Оберіть проект" />
                      </SelectTrigger>
                      <SelectContent>
                        {demoProjects.map(proj => (
                          <SelectItem key={proj.id} value={proj.id}>
                            {proj.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cost Center */}
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Select value={localCostCenter} onValueChange={setLocalCostCenter}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Центр витрат" />
                      </SelectTrigger>
                      <SelectContent>
                        {demoCostCenters.map(cc => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Відділ</p>
                    <p className="font-medium">
                      {demoDepartments.find(d => d.id === localDepartment)?.label || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Проект</p>
                    <p className="font-medium">
                      {demoProjects.find(p => p.id === localProject)?.label || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Центр витрат</p>
                    <p className="font-medium">
                      {demoCostCenters.find(c => c.id === localCostCenter)?.label || "—"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* External IDs */}
            {classification?.externalIds && Object.keys(classification.externalIds).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Зовнішні ідентифікатори</p>
                <div className="space-y-1">
                  {Object.entries(classification.externalIds).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{value}</code>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save/Cancel buttons when editing */}
            {isEditing && (
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Скасувати
                </Button>
                <Button size="sm" onClick={handleSave} className="gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  Зберегти
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
