import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { FieldSchema } from "@/admin/schemas/contentSchemas";

interface ContentCreatorDialogProps {
  schema: FieldSchema[];
  title: string;
  onSubmit?: (data: Record<string, any>) => void;
}

export default function ContentCreatorDialog({ schema, title, onSubmit }: ContentCreatorDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    const defaults: Record<string, any> = {};
    schema.forEach((f) => {
      if (f.type === "boolean") defaults[f.key] = false;
      else if (f.type === "tags" || f.type === "array" || f.type === "json") defaults[f.key] = [];
      else if (f.type === "number") defaults[f.key] = 0;
      else defaults[f.key] = "";
    });
    setFormData(defaults);
  };

  const handleOpen = (v: boolean) => {
    if (v) resetForm();
    setOpen(v);
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    // Auto-generate SEO if fields exist but are empty
    const hasSeoFields = schema.some((f) => f.key === "seoTitle");
    if (hasSeoFields && !formData.seoTitle && !formData.seoDescription) {
      try {
        const { generateSeoFields } = await import("@/admin/utils/generateSeo");
        const seo = await generateSeoFields({
          title: String(formData.title || formData.name || formData.question || ""),
          content: String(formData.content || formData.answer || formData.description || ""),
          tldr: String(formData.tldr || ""),
          type: String(formData.type || ""),
          audience: String(formData.audience || ""),
        });
        formData.seoTitle = seo.seoTitle;
        formData.seoDescription = seo.seoDescription;
        if (formData.slug === "" || formData.slug === undefined) {
          formData.slug = seo.slug;
        }
      } catch (e) {
        console.warn("Auto SEO generation failed:", e);
      }
    }

    if (onSubmit) {
      onSubmit(formData);
      toast.success("Запис створено");
    } else {
      navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
      setCopied(true);
      toast.success("JSON нового запису скопійовано — вставте в код");
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  };

  const renderField = (field: FieldSchema) => {
    if (!field.editable && field.editable !== undefined) {
      return <span className="text-sm text-muted-foreground">Автоматично</span>;
    }

    const value = formData[field.key];

    if (field.type === "boolean") {
      return <Switch checked={!!value} onCheckedChange={(v) => updateField(field.key, v)} />;
    }
    if (field.type === "select" && field.options) {
      return (
        <Select value={String(value ?? "")} onValueChange={(v) => updateField(field.key, v)}>
          <SelectTrigger className="h-9"><SelectValue placeholder={field.placeholder || `Оберіть ${field.label.toLowerCase()}`} /></SelectTrigger>
          <SelectContent>
            {field.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    if (field.type === "text") {
      return <Textarea value={String(value ?? "")} onChange={(e) => updateField(field.key, e.target.value)} rows={3} placeholder={field.placeholder} />;
    }
    if (field.type === "json") {
      const jsonStr = typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2);
      return (
        <Textarea
          value={jsonStr}
          onChange={(e) => {
            try { updateField(field.key, JSON.parse(e.target.value)); } catch { updateField(field.key, e.target.value); }
          }}
          rows={6}
          className="font-mono text-xs resize-y"
          placeholder="[]"
        />
      );
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
    return <Input value={String(value ?? "")} onChange={(e) => updateField(field.key, e.target.value)} className="h-9" placeholder={field.placeholder} />;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {schema.filter((f) => f.editable !== false).map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</Label>
              {renderField(field)}
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Скасувати</Button>
          <Button size="sm" onClick={handleCreate} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {onSubmit ? "Створити" : "Копіювати JSON"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
