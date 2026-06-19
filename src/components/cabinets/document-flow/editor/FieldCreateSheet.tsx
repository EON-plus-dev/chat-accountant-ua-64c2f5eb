/**
 * FieldCreateSheet - Sheet component for creating new template fields
 * Single-screen with cascading Combobox selectors for party and attribute
 */

import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles, Plus, Check, ChevronsUpDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnifiedTemplateField, FieldDataType } from "@/types/templateField";
import { mapDataTypeToFieldType, inferGroupFromKey } from "@/types/templateField";
import {
  PARTY_CONFIGS,
  getPartyConfig,
  getPartyAttributes,
  getAttributeById,
  getAttributeHint,
  getAutoModeBadge,
  type PartyType,
  type PartyAttribute,
} from "@/config/partyAttributesLibrary";

export type FieldPlacement = "replace" | "before" | "after";

interface FieldCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  onSave: (field: UnifiedTemplateField, placement?: FieldPlacement) => void;
}

const CUSTOM_ATTRIBUTE_ID = "_custom";

export const FieldCreateSheet = ({
  open,
  onOpenChange,
  selectedText,
  onSave,
}: FieldCreateSheetProps) => {
  // State
  const [selectedParty, setSelectedParty] = useState<PartyType | null>(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [fieldName, setFieldName] = useState("");
  const [placement, setPlacement] = useState<FieldPlacement>("replace");
  const [customAttributeDescription, setCustomAttributeDescription] = useState("");
  
  // Popover states
  const [partyOpen, setPartyOpen] = useState(false);
  const [attributeOpen, setAttributeOpen] = useState(false);

  // Derived data
  const selectedPartyConfig = selectedParty ? getPartyConfig(selectedParty) : null;
  const availableAttributes = selectedParty ? getPartyAttributes(selectedParty) : [];
  const isCustomAttribute = selectedAttributeId === CUSTOM_ATTRIBUTE_ID;
  const selectedAttribute = selectedParty && selectedAttributeId && !isCustomAttribute
    ? getAttributeById(selectedParty, selectedAttributeId) 
    : null;
  const attributeHint = selectedParty && selectedAttributeId && !isCustomAttribute
    ? getAttributeHint(selectedParty, selectedAttributeId) 
    : "";

  // Reset form when sheet opens with new text
  useEffect(() => {
    if (open) {
      setSelectedParty(null);
      setSelectedAttributeId(null);
      setFieldName(selectedText?.slice(0, 50) || "");
      setPlacement("replace");
      setCustomAttributeDescription("");
    }
  }, [open, selectedText]);

  // Auto-fill field name when attribute is selected
  useEffect(() => {
    if (isCustomAttribute && selectedPartyConfig) {
      // Don't override field name for custom
      return;
    }
    if (selectedAttribute && selectedPartyConfig) {
      const partyPrefix = selectedPartyConfig.id === "cabinet" ? "" : `${selectedPartyConfig.label}: `;
      setFieldName(`${partyPrefix}${selectedAttribute.label}`);
    }
  }, [selectedAttribute, selectedPartyConfig, isCustomAttribute]);

  // Reset attribute when party changes
  useEffect(() => {
    setSelectedAttributeId(null);
    setCustomAttributeDescription("");
  }, [selectedParty]);

  const handleCreate = () => {
    if (!selectedParty || !fieldName.trim()) return;
    if (!isCustomAttribute && !selectedAttribute) return;

    const partyConfig = getPartyConfig(selectedParty);
    if (!partyConfig) return;

    const newField: UnifiedTemplateField = {
      key: `field_${Date.now()}`,
      label: fieldName.trim(),
      partyType: selectedParty,
      source: partyConfig.technicalSource,
      sourceKey: isCustomAttribute ? "custom" : selectedAttribute!.sourceKey,
      dataType: isCustomAttribute ? "text" as FieldDataType : selectedAttribute!.dataType,
      fieldType: isCustomAttribute ? "text" : mapDataTypeToFieldType(selectedAttribute!.dataType),
      group: inferGroupFromKey(fieldName),
      order: 0,
      required: false,
      originalText: selectedText || undefined,
      computeFormula: isCustomAttribute ? undefined : selectedAttribute!.computeFormula,
      aiHint: isCustomAttribute ? customAttributeDescription || undefined : undefined,
    };

    onSave(newField, selectedText ? placement : undefined);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isValid = selectedParty && 
    (isCustomAttribute || selectedAttributeId) && 
    fieldName.trim().length > 0 &&
    (!isCustomAttribute || customAttributeDescription.trim().length > 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="responsive-right" 
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Нове поле
          </SheetTitle>
          <SheetDescription>
            Оберіть джерело даних та налаштуйте поле
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-5">
            {/* Selected text preview */}
            {selectedText && (
              <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Виділений текст:</p>
                <p className="text-sm font-mono truncate">"{selectedText}"</p>
              </div>
            )}

            {/* Placement selector - only when text is selected */}
            {selectedText && (
              <div className="space-y-2">
                <Label>Розміщення поля</Label>
                <RadioGroup
                  value={placement}
                  onValueChange={(v) => setPlacement(v as FieldPlacement)}
                  className="space-y-1.5"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="replace" id="placement-replace" />
                    <Label htmlFor="placement-replace" className="cursor-pointer font-normal">
                      В місці виділення
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="before" id="placement-before" />
                    <Label htmlFor="placement-before" className="cursor-pointer font-normal">
                      Перед виділенням
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="after" id="placement-after" />
                    <Label htmlFor="placement-after" className="cursor-pointer font-normal">
                      Після виділення
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Party Selector */}
            <div className="space-y-2">
              <Label>Сторона документа <span className="text-destructive">*</span></Label>
              <Popover open={partyOpen} onOpenChange={setPartyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={partyOpen}
                    className="w-full justify-between h-auto py-2.5"
                  >
                    {selectedPartyConfig ? (
                      <div className="flex items-center gap-2">
                        <selectedPartyConfig.icon className="w-4 h-4 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-medium">{selectedPartyConfig.label}</div>
                          <div className="text-xs text-muted-foreground">{selectedPartyConfig.description}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Оберіть сторону...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Пошук..." />
                    <CommandList>
                      <CommandEmpty>Нічого не знайдено</CommandEmpty>
                      <CommandGroup>
                        {PARTY_CONFIGS.map((party) => {
                          const Icon = party.icon;
                          return (
                            <CommandItem
                              key={party.id}
                              value={party.label}
                              onSelect={() => {
                                setSelectedParty(party.id);
                                setPartyOpen(false);
                              }}
                              className="flex items-center gap-2 py-2.5"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  selectedParty === party.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="font-medium">{party.label}</div>
                                <div className="text-xs text-muted-foreground">{party.description}</div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Attribute Selector */}
            <div className="space-y-2">
              <Label>Які саме дані? <span className="text-destructive">*</span></Label>
              <Popover open={attributeOpen} onOpenChange={setAttributeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={attributeOpen}
                    disabled={!selectedParty}
                    className="w-full justify-between"
                  >
                    {isCustomAttribute ? (
                      <span>Інше</span>
                    ) : selectedAttribute ? (
                      <div className="flex items-center gap-2">
                        <span>{selectedAttribute.label}</span>
                        {getAutoModeBadge(selectedAttribute.autoMode) && (
                          <Badge variant="secondary" size="sm">
                            {getAutoModeBadge(selectedAttribute.autoMode)}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {selectedParty ? "Оберіть тег..." : "Спочатку оберіть сторону"}
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Пошук тегу..." />
                    <CommandList>
                      <CommandEmpty>Нічого не знайдено</CommandEmpty>
                      <CommandGroup>
                        {availableAttributes.map((attr) => (
                          <CommandItem
                            key={attr.id}
                            value={attr.label}
                            onSelect={() => {
                              setSelectedAttributeId(attr.id);
                              setAttributeOpen(false);
                            }}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  selectedAttributeId === attr.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span>{attr.label}</span>
                            </div>
                            {getAutoModeBadge(attr.autoMode) && (
                              <Badge 
                                variant={attr.autoMode === "formula" ? "info" : "secondary"} 
                                size="sm"
                              >
                                {getAutoModeBadge(attr.autoMode)}
                              </Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <Separator />
                      <CommandGroup>
                        <CommandItem
                          value="Інше"
                          onSelect={() => {
                            setSelectedAttributeId(CUSTOM_ATTRIBUTE_ID);
                            setAttributeOpen(false);
                          }}
                          className="flex items-center gap-2 py-2"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              isCustomAttribute ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span>Інше</span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Attribute hint */}
              {attributeHint && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{attributeHint}</span>
                </div>
              )}

              {/* Custom attribute description */}
              {isCustomAttribute && (
                <div className="space-y-1.5">
                  <Input
                    value={customAttributeDescription}
                    onChange={(e) => setCustomAttributeDescription(e.target.value)}
                    placeholder="Опишіть джерело даних..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Вкажіть, звідки беруться дані для цього поля
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Field name */}
            <div className="space-y-2">
              <Label htmlFor="field-name">Назва поля</Label>
              <Input
                id="field-name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Наприклад: IBAN отримувача"
              />
              <p className="text-xs text-muted-foreground">
                Як це поле буде підписано в документі
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="shrink-0 border-t px-6 py-4 flex items-center justify-end gap-3 bg-background">
          <Button variant="outline" onClick={handleCancel}>
            Скасувати
          </Button>
          <Button onClick={handleCreate} disabled={!isValid}>
            <Plus className="w-4 h-4 mr-2" />
            Створити поле
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
