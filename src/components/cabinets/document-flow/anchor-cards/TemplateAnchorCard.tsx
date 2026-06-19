/**
 * TemplateAnchorCard Component
 * Card for selecting document template with grouped dropdown
 */

import { useState, useMemo } from "react";
import { FileBox, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { type DocumentTemplate, systemTemplates, demoCustomTemplates } from "@/config/documentTemplatesConfig";
import { type DocumentType } from "@/config/documentFlowConfig";
import { AnchorCard, type AnchorCardStatus } from "./AnchorCard";

interface TemplateAnchorCardProps {
  value: DocumentTemplate | null;
  documentType: DocumentType;
  onChange: (template: DocumentTemplate) => void;
  highlightedCardId: string | null;
  onHover?: (id: string | null) => void;
  onNavigate?: () => void;
  onCreateNew?: () => void;
  disabled?: boolean;
}

export function TemplateAnchorCard({
  value,
  documentType,
  onChange,
  highlightedCardId,
  onHover,
  onNavigate,
  onCreateNew,
  disabled,
}: TemplateAnchorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const status: AnchorCardStatus = disabled ? "locked" : (value ? "filled" : "empty");

  // Filter templates by type and search
  const { systemFiltered, customFiltered } = useMemo(() => {
    const filterFn = (t: DocumentTemplate) =>
      t.type === documentType &&
      t.name.toLowerCase().includes(search.toLowerCase());

    return {
      systemFiltered: systemTemplates.filter(filterFn),
      customFiltered: demoCustomTemplates.filter(filterFn),
    };
  }, [documentType, search]);

  const handleSelect = (template: DocumentTemplate) => {
    onChange(template);
    setIsOpen(false);
    setSearch("");
  };

  // If disabled (locked), render without popover
  if (disabled) {
    return (
      <AnchorCard
        id="template"
        icon={FileBox}
        label="Шаблон"
        value={value?.name || "Оберіть"}
        status={status}
        isHighlighted={highlightedCardId === "template"}
        onHover={onHover}
        onNavigate={onNavigate}
        disabled
      />
    );
  }

  return (
    <AnchorCard
      id="template"
      icon={FileBox}
      label="Шаблон"
      value={value?.name || "Оберіть"}
      status={status}
      isHighlighted={highlightedCardId === "template"}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onHover={onHover}
      onNavigate={onNavigate}
    >
      <Command className="border-0">
        <CommandInput
          placeholder="Пошук шаблону..."
          value={search}
          onValueChange={setSearch}
          className="h-10"
        />
        <CommandList className="max-h-[280px]">
          <CommandEmpty>Шаблони не знайдено</CommandEmpty>
          
          {/* System templates */}
          {systemFiltered.length > 0 && (
            <CommandGroup heading="Системні">
              {systemFiltered.map((template) => (
                <CommandItem
                  key={template.id}
                  value={template.id}
                  onSelect={() => handleSelect(template)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 cursor-pointer",
                    "min-h-[44px]",
                    value?.id === template.id && "bg-accent"
                  )}
                >
                  <FileBox className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{template.name}</span>
                      {template.isPopular && (
                        <Star className="w-3 h-3 text-warning shrink-0 fill-warning" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {template.description}
                    </p>
                  </div>
                  {value?.id === template.id && (
                    <span className="text-xs text-primary shrink-0">✓</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Custom templates */}
          {customFiltered.length > 0 && (
            <CommandGroup heading="Мої шаблони">
              {customFiltered.map((template) => (
                <CommandItem
                  key={template.id}
                  value={template.id}
                  onSelect={() => handleSelect(template)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 cursor-pointer",
                    "min-h-[44px]",
                    value?.id === template.id && "bg-accent"
                  )}
                >
                  <FileBox className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{template.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        Мій
                      </Badge>
                    </div>
                  </div>
                  {value?.id === template.id && (
                    <span className="text-xs text-primary shrink-0">✓</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Create new */}
          {onCreateNew && (
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setIsOpen(false);
                  onCreateNew();
                }}
                className="flex items-center gap-2 px-3 py-2.5 cursor-pointer min-h-[44px] text-primary"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Створити новий шаблон</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </AnchorCard>
  );
}
