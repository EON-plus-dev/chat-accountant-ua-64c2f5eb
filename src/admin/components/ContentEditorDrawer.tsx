import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Eye } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { renderMarkdown } from "@/lib/markdownRenderer";
import ContentPreview from "./ContentPreview";
import MarkdownToolbar from "./MarkdownToolbar";
import type { FieldSchema } from "@/admin/schemas/contentSchemas";

interface ContentEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Record<string, any> | null;
  schema: FieldSchema[];
  title: string;
  onSave?: (data: Record<string, any>) => void;
  previewType?: string;
}

export default function ContentEditorDrawer({ open, onOpenChange, data, schema, title, onSave, previewType }: ContentEditorDrawerProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState(false);
  const [markdownPreviewKeys, setMarkdownPreviewKeys] = useState<Set<string>>(new Set());
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const startEdit = () => {
    setFormData({ ...data });
    setEditing(true);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success("JSON скопійовано в буфер обміну");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    } else {
      navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
      toast.success("Оновлений JSON скопійовано — вставте в код");
    }
    setEditing(false);
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMarkdownPreview = (key: string) => {
    setMarkdownPreviewKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  if (!data) return null;

  const source = editing ? formData : data;

  const renderField = (field: FieldSchema) => {
    const value = source[field.key];

    if (!editing) {
      if (field.type === "boolean") return <span className="text-sm">{value ? "✅ Так" : "❌ Ні"}</span>;
      if (field.type === "tags" || field.type === "array") {
        const arr = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-1">
            {arr.map((item: any, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">{String(item)}</Badge>
            ))}
            {arr.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
          </div>
        );
      }
      if (field.type === "select" && field.options) {
        const opt = field.options.find((o) => o.value === value);
        return <Badge variant="secondary">{opt?.label || String(value ?? "—")}</Badge>;
      }
      if (field.type === "json") {
        const arr = Array.isArray(value) ? value : [];
        if (arr.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
        return <Badge variant="secondary">{arr.length} елементів</Badge>;
      }
      if (field.type === "markdown") {
        const text = String(value ?? "");
        if (!text) return <span className="text-sm text-muted-foreground">—</span>;
        const truncated = text.length > 300 ? text.slice(0, 300) + "…" : text;
        return (
          <div className="space-y-2">
            <div
              className="prose prose-sm dark:prose-invert max-w-none max-h-40 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(truncated) }}
            />
            {text.length > 300 && (
              <p className="text-xs text-muted-foreground">…ще {text.length - 300} символів</p>
            )}
          </div>
        );
      }
      return <span className="text-sm break-words">{String(value ?? "—")}</span>;
    }

    // Edit mode
    if (!field.editable) return <span className="text-sm text-muted-foreground">{String(value ?? "—")}</span>;

    if (field.type === "boolean") {
      return <Switch checked={!!value} onCheckedChange={(v) => updateField(field.key, v)} />;
    }
    if (field.type === "select" && field.options) {
      return (
        <Select value={String(value ?? "")} onValueChange={(v) => updateField(field.key, v)}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {field.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    if (field.type === "markdown") {
      const isPreview = markdownPreviewKeys.has(field.key);
      return (
        <div className="border rounded-md overflow-hidden">
          <MarkdownToolbar
            textareaRef={{ current: textareaRefs.current[field.key] } as React.RefObject<HTMLTextAreaElement>}
            onUpdate={(newVal) => updateField(field.key, newVal)}
            isPreview={isPreview}
            onTogglePreview={() => toggleMarkdownPreview(field.key)}
          />
          {isPreview ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none border-0 p-4 max-h-96 overflow-y-auto bg-background"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(String(value ?? "")) }}
            />
          ) : (
            <Textarea
              ref={(el) => { textareaRefs.current[field.key] = el; }}
              value={String(value ?? "")}
              onChange={(e) => updateField(field.key, e.target.value)}
              rows={12}
              className="font-mono text-xs leading-relaxed border-0 rounded-none resize-y"
            />
          )}
        </div>
      );
    }
    if (field.type === "json") {
      const jsonStr = typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2);
      return (
        <Textarea
          value={jsonStr}
          onChange={(e) => {
            try { updateField(field.key, JSON.parse(e.target.value)); } catch { updateField(field.key, e.target.value); }
          }}
          rows={8}
          className="font-mono text-xs resize-y"
          placeholder="[]"
        />
      );
    }
    if (field.type === "text") {
      return <Textarea value={String(value ?? "")} onChange={(e) => updateField(field.key, e.target.value)} rows={3} />;
    }
    if (field.type === "tags" || field.type === "array") {
      const arr = Array.isArray(value) ? value : [];
      return (
        <Textarea
          value={arr.join("\n")}
          onChange={(e) => updateField(field.key, e.target.value.split("\n").filter(Boolean))}
          rows={3}
          placeholder="По одному на рядок"
        />
      );
    }
    return <Input value={String(value ?? "")} onChange={(e) => updateField(field.key, e.target.value)} className="h-9" />;
  };

  const hasPreview = !!previewType;

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setEditing(false); }}>
      <SheetContent className={`w-full overflow-y-auto ${hasPreview ? "sm:max-w-4xl" : "sm:max-w-lg"}`}>
        <SheetHeader>
          <SheetTitle className="pr-8">{title}: {String(data.name || data.title || data.question || data.code || data.id || "")}</SheetTitle>
        </SheetHeader>

        {hasPreview ? (
          <Tabs defaultValue="fields" className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="fields" className="flex-1">Поля</TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">Попередній перегляд</TabsTrigger>
            </TabsList>
            <TabsContent value="fields">
              <div className="space-y-4 py-4">
                {schema.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <div className="py-4">
                <ContentPreview data={source} previewType={previewType} />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4 py-4">
            {schema.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</Label>
                {renderField(field)}
              </div>
            ))}
          </div>
        )}

        <SheetFooter className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={handleCopyJSON} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Скопійовано" : "Копіювати JSON"}
          </Button>
          {!editing ? (
            <Button size="sm" onClick={startEdit}>Редагувати</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Скасувати</Button>
              <Button size="sm" onClick={handleSave}>
                {onSave ? "Зберегти" : "Копіювати зміни"}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
