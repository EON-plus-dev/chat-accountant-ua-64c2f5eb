/**
 * NomenclatureFormTagsSection - Tags and category (collapsible)
 */

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Tag, X, Plus, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { NomenclatureFormData } from "./NomenclatureForm";

interface NomenclatureFormTagsSectionProps {
  form: UseFormReturn<NomenclatureFormData>;
}

const SUGGESTED_TAGS = [
  "Новинка",
  "Топ продажів",
  "Акція",
  "Знижка",
  "Ексклюзив",
  "Преміум",
  "Економ",
  "Імпорт",
];

export const NomenclatureFormTagsSection = ({ form }: NomenclatureFormTagsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  const currentTags = form.watch("tags") || [];
  const isFavorite = form.watch("isFavorite");
  const isActive = form.watch("isActive");

  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    const trimmedTag = tag.trim();
    if (!currentTags.includes(trimmedTag)) {
      form.setValue("tags", [...currentTags, trimmedTag]);
    }
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue("tags", currentTags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(newTag);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">🏷️ Теги та налаштування</span>
          {currentTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {currentTags.length}
            </Badge>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-4 pb-4 space-y-4 border border-t-0 rounded-b-lg">
        <div className="pt-4 space-y-4">
          {/* Tags Input */}
          <FormItem>
            <FormLabel>Теги</FormLabel>
            <div className="flex gap-2">
              <Input 
                placeholder="Введіть тег..." 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Current Tags */}
            {currentTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {currentTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Suggested Tags */}
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Запропоновані:</p>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TAGS.filter(t => !currentTags.includes(t)).slice(0, 5).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => addTag(tag)}
                  >
                    + {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </FormItem>

          {/* Favorite & Active toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
            <FormField
              control={form.control}
              name="isFavorite"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <Star className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
                      Обране
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Часто використовувана позиція
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <FormLabel>Активна</FormLabel>
                    <FormDescription className="text-xs">
                      Доступна для вибору в документах
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
