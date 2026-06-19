import { useState, useRef, useEffect, useCallback } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InlineFieldEditorProps {
  fieldKey: string;
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  isMultiline?: boolean;
  label?: string;
  className?: string;
}

// Fields that should use multiline textarea
const MULTILINE_FIELDS = ["notes", "additionalTerms", "paymentPurpose"];

export function InlineFieldEditor({
  fieldKey,
  initialValue,
  onSave,
  onCancel,
  isMultiline,
  label,
  className,
}: InlineFieldEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if multiline based on field key or prop
  const useMultiline = isMultiline ?? MULTILINE_FIELDS.includes(fieldKey);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    onSave(value.trim());
  }, [value, onSave]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      } else if (e.key === "Enter" && !e.shiftKey && !useMultiline) {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Enter" && e.metaKey) {
        // Cmd/Ctrl + Enter saves multiline
        e.preventDefault();
        handleSave();
      }
    },
    [handleCancel, handleSave, useMultiline]
  );

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleSave]);

  const placeholder = label ? `Введіть ${label.toLowerCase()}...` : "Введіть значення...";

  return (
    <div
      ref={containerRef}
      className={cn(
        "inline-field-editor relative flex items-start gap-1.5 bg-background",
        "border-2 border-primary rounded-md shadow-lg",
        "p-1.5 min-w-[200px] max-w-[400px]",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {useMultiline ? (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex-1 min-h-[60px] max-h-[120px] resize-none",
            "border-0 focus-visible:ring-0 p-1.5 text-sm"
          )}
          rows={3}
        />
      ) : (
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex-1 h-9 min-h-[44px]",
            "border-0 focus-visible:ring-0 p-1.5 text-sm"
          )}
        />
      )}

      <div className="flex flex-col gap-0.5 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="h-7 w-7 text-success hover:text-success hover:bg-success/10"
          title="Зберегти (Enter)"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Скасувати (Escape)"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
