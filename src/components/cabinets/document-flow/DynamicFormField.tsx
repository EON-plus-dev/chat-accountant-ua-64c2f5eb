import { useState } from "react";
import { CheckCircle, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FormField } from "@/config/documentFormSchemas";
import type { Contractor } from "@/config/settingsConfig";

interface DynamicFormFieldProps {
  field: FormField;
  value: string | number | boolean;
  onChange: (key: string, value: string | number | boolean) => void;
  disabled?: boolean;
  // For combobox fields
  contractors?: Contractor[];
  onContractorSelect?: (contractor: Contractor) => void;
  onInviteContractor?: () => void;
  selectedContractor?: Contractor | null;
  // For employee fields
  employees?: Array<{ id: string; name: string; position: string; ipn?: string }>;
  onEmployeeSelect?: (employee: { id: string; name: string; position: string; ipn?: string }) => void;
}

export const DynamicFormField = ({
  field,
  value,
  onChange,
  disabled = false,
  contractors = [],
  onContractorSelect,
  onInviteContractor,
  selectedContractor,
  employees = [],
  onEmployeeSelect,
}: DynamicFormFieldProps) => {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const isAutofilled = field.source === "cabinet" || field.source === "computed";
  const isContractorField = field.source === "contractor";

  const getWidthClass = () => {
    switch (field.width) {
      case "third": return "col-span-4";
      case "half": return "col-span-6";
      default: return "col-span-12";
    }
  };

  const renderAutofillBadge = () => {
    if (!isAutofilled || !value) return null;
    return (
      <Badge 
        variant="outline" 
        className="text-[10px] h-5 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 shrink-0"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        Авто
      </Badge>
    );
  };

  const renderField = () => {
    switch (field.fieldType) {
      case "text":
      case "phone":
      case "email":
      case "iban":
      case "edrpou":
      case "ipn":
        return (
          <Input
            type={field.fieldType === "email" ? "email" : "text"}
            value={value as string || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled || isAutofilled}
            className={cn(
              "h-9",
              isAutofilled && "bg-muted/50"
            )}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value as number || ""}
            onChange={(e) => onChange(field.key, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            disabled={disabled || field.source === "computed"}
            className={cn(
              "h-9",
              field.source === "computed" && "bg-muted/50"
            )}
          />
        );

      case "currency":
        return (
          <div className="relative">
            <Input
              type="number"
              step="0.01"
              value={value as number || ""}
              onChange={(e) => onChange(field.key, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder || "0.00"}
              disabled={disabled || field.source === "computed"}
              className={cn(
                "h-9 pr-8",
                field.source === "computed" && "bg-muted/50"
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₴</span>
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            value={value as string || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            disabled={disabled}
            className="h-9"
          />
        );

      case "select":
        return (
          <Select
            value={value as string || ""}
            onValueChange={(v) => onChange(field.key, v)}
            disabled={disabled}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={field.placeholder || "Оберіть..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2 h-9">
            <Checkbox
              id={field.key}
              checked={value as boolean || false}
              onCheckedChange={(checked) => onChange(field.key, checked as boolean)}
              disabled={disabled}
            />
            <label
              htmlFor={field.key}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
          </div>
        );

      case "textarea":
        return (
          <Textarea
            value={value as string || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            rows={3}
            className="resize-none"
          />
        );

      case "combobox":
        if (isContractorField) {
          const filteredContractors = searchValue
            ? contractors.filter(c => 
                c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                c.code.includes(searchValue)
              )
            : contractors;

          return (
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className={cn(
                    "w-full justify-start text-left font-normal h-auto min-h-9 py-1.5",
                    !selectedContractor && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  {selectedContractor ? (
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-medium text-sm">{selectedContractor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedContractor.code.length === 8 ? "ЄДРПОУ" : "ІПН"}: {selectedContractor.code}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm">Оберіть контрагента...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Пошук за назвою або кодом..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-3 text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Не знайдено</p>
                        {onInviteContractor && (
                          <Button variant="outline" size="sm" onClick={onInviteContractor}>
                            <UserPlus className="w-4 h-4 mr-1.5" />
                            Запросити
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Контрагенти">
                      {filteredContractors.slice(0, 10).map((contractor) => (
                        <CommandItem
                          key={contractor.id}
                          value={contractor.id}
                          onSelect={() => {
                            onContractorSelect?.(contractor);
                            setComboboxOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{contractor.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {contractor.code.length === 8 ? "ЄДРПОУ" : "ІПН"}: {contractor.code}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {onInviteContractor && (
                      <CommandGroup>
                        <CommandItem onSelect={onInviteContractor} className="text-primary">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Запросити нового
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          );
        }
        // Default combobox for non-contractor fields
        return (
          <Input
            value={value as string || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className="h-9"
          />
        );

      case "employee":
        return (
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-start text-left font-normal h-9",
                  !value && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                {value || "Оберіть працівника..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Пошук працівника..." />
                <CommandList>
                  <CommandEmpty>Не знайдено</CommandEmpty>
                  <CommandGroup heading="Працівники">
                    {employees.map((emp) => (
                      <CommandItem
                        key={emp.id}
                        value={emp.id}
                        onSelect={() => {
                          onChange(field.key, emp.name);
                          onEmployeeSelect?.(emp);
                          setComboboxOpen(false);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{emp.name}</span>
                          <span className="text-xs text-muted-foreground">{emp.position}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );

      case "contract-ref":
        return (
          <Input
            value={value as string || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder || "№ договору від дати"}
            disabled={disabled}
            className="h-9"
          />
        );

      default:
        return (
          <Input
            value={value as string || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className="h-9"
          />
        );
    }
  };

  // For checkbox, render inline without separate label
  if (field.fieldType === "checkbox") {
    return (
      <div className={cn("space-y-1.5", getWidthClass())}>
        {renderField()}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5", getWidthClass())}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm flex items-center gap-1">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
        {renderAutofillBadge()}
      </div>
      {renderField()}
    </div>
  );
};
