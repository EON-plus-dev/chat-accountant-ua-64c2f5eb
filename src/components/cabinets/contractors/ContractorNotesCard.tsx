import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  StickyNote,
  Tag,
  FileText,
  Plus,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Contractor } from "@/config/settingsConfig";

interface ContractorNotesCardProps {
  contractor: Contractor;
}

export const ContractorNotesCard = ({
  contractor,
}: ContractorNotesCardProps) => {
  const [notes, setNotes] = useState(contractor.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tags, setTags] = useState<string[]>(contractor.tags || []);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    toast.success("Примітки збережено");
  };

  const handleAddTag = () => {
    const trimmed = newTagValue.trim();
    if (!trimmed) {
      toast.error("Введіть назву мітки");
      return;
    }
    if (tags.includes(trimmed)) {
      toast.error("Така мітка вже існує");
      return;
    }
    setTags([...tags, trimmed]);
    setNewTagValue("");
    setIsAddingTag(false);
    toast.success("Мітку додано");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    toast.success("Мітку видалено");
  };

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Примітки та мітки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tags */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Мітки
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs group gap-1 pr-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <span className="sr-only">Видалити</span>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              !isAddingTag && (
                <span className="text-sm text-muted-foreground">Немає міток</span>
              )
            )}
            {isAddingTag ? (
              <div className="flex items-center gap-1">
                <Input
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  placeholder="Нова мітка"
                  className="h-7 w-28 text-xs px-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTag();
                    if (e.key === "Escape") {
                      setIsAddingTag(false);
                      setNewTagValue("");
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={handleAddTag}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setIsAddingTag(false);
                    setNewTagValue("");
                  }}
                >
                  <span className="sr-only">Скасувати</span>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsAddingTag(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Додати
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Примітки
            </p>
            {!isEditingNotes && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsEditingNotes(true)}
              >
                Редагувати
              </Button>
            )}
          </div>
          {isEditingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Додайте примітки про контрагента..."
                className="min-h-[80px] text-sm"
              />
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNotes(contractor.notes || "");
                    setIsEditingNotes(false);
                  }}
                >
                  Скасувати
                </Button>
                <Button size="sm" onClick={handleSaveNotes}>
                  Зберегти
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {notes || "Немає приміток"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
