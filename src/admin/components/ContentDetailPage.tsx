import { useState, useRef, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ExternalLink, Copy, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { renderMarkdown } from "@/lib/markdownRenderer";
import ContentPreview from "./ContentPreview";
import MarkdownToolbar from "./MarkdownToolbar";
import type { FieldSchema } from "@/admin/schemas/contentSchemas";
import { FIELD_GROUP_LABELS } from "@/admin/schemas/contentSchemas";

interface ContentDetailPageProps {
  data: Record<string, any>;
  schema: FieldSchema[];
  title: string;
  previewType?: string;
  portalPath?: string;
  allItems?: Record<string, any>[];
  onNavigate?: (item: Record<string, any>) => void;
  backPath: string;
  backLabel: string;
}

export default function ContentDetailPage({
  data, schema, title, previewType, portalPath, allItems, onNavigate, backPath, backLabel,
}: ContentDetailPageProps) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState(false);
  const [markdownPreviewKeys, setMarkdownPreviewKeys] = useState<Set<string>>(new Set());
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const source = editing ? formData : data;

  // Helper for nested keys like "company.foundedYear"
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    if (keys.length === 1) return { ...obj, [keys[0]]: value };
    return { ...obj, [keys[0]]: setNestedValue(obj[keys[0]] || {}, keys.slice(1).join('.'), value) };
  };

  const startEdit = () => { setFormData({ ...data }); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const handleSave = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    toast.success("Оновлений JSON скопійовано — вставте в код");
    setEditing(false);
  };
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success("JSON скопійовано");
    setTimeout(() => setCopied(false), 2000);
  };

  const updateField = (key: string, value: any) => {
    if (key.includes('.')) {
      setFormData((prev) => setNestedValue(prev, key, value));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Group schema fields
  const groupedFields = useMemo(() => {
    const groups: Record<string, FieldSchema[]> = {};
    const fullWidthFields: FieldSchema[] = [];

    schema.forEach((field) => {
      if (field.fullWidth) {
        fullWidthFields.push(field);
      } else {
        const g = field.group || "main";
        if (!groups[g]) groups[g] = [];
        groups[g].push(field);
      }
    });

    return { groups, fullWidthFields };
  }, [schema]);

  // Navigation
  const currentIndex = allItems?.findIndex((item) => {
    const idKey = schema[0]?.key || "id";
    return item[idKey] === data[idKey];
  }) ?? -1;

  const canPrev = currentIndex > 0;
  const canNext = allItems ? currentIndex < allItems.length - 1 : false;
  const goPrev = () => { if (canPrev && allItems && onNavigate) onNavigate(allItems[currentIndex - 1]); };
  const goNext = () => { if (canNext && allItems && onNavigate) onNavigate(allItems[currentIndex + 1]); };

  const renderFieldValue = (field: FieldSchema) => {
    const value = field.key.includes('.') ? getNestedValue(source, field.key) : source[field.key];

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
      if (field.type === "markdown") {
        const text = String(value ?? "");
        if (!text) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="space-y-2">
            <div className="prose prose-sm dark:prose-invert max-w-none rounded border p-4 bg-background overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
            />
            <Button variant="outline" size="sm" className="gap-1.5" onClick={startEdit}>
              Редагувати контент
            </Button>
          </div>
        );
      }
      if (field.type === "json") {
        const arr = Array.isArray(value) ? value : [];
        if (arr.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="space-y-2">
            <Badge variant="secondary">{arr.length} елементів</Badge>
            <Collapsible defaultOpen={arr.length <= 8}>
              <CollapsibleTrigger className="text-xs text-primary hover:underline">
                {arr.length > 8 ? "Показати всі ▾" : "Згорнути ▴"}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1.5 mt-1.5">
                  {arr.map((item: any, i: number) => (
                    <div key={i} className="text-xs border rounded p-2 bg-muted/30">
                      {item.name && item.tagline ? (
                        <><span className="font-medium">{item.name}</span> — <span className="text-muted-foreground">{item.tagline}</span>{item.benefits && <span className="text-muted-foreground ml-1">({item.benefits.length} benefits)</span>}</>
                      ) : item.name ? (
                        <span className="font-medium">{item.name}</span>
                      ) : item.category && item.score !== undefined ? (
                        <><span className="font-medium">{item.category}:</span> {item.score}/10</>
                      ) : item.question ? (
                        <><span className="font-medium">Q:</span> {item.question}</>
                      ) : item.issue ? (
                        <><span className="font-medium">{item.issue}</span>{item.status && <Badge variant="outline" className="ml-2 text-[10px]">{item.status}</Badge>}</>
                      ) : item.title ? (
                        <span className="font-medium">{item.title}</span>
                      ) : (
                        <span>{JSON.stringify(item).slice(0, 120)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      }
      if (field.type === "text") {
        const text = String(value ?? "—");
        return <p className="text-sm break-words whitespace-pre-wrap">{text}</p>;
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
            onTogglePreview={() => setMarkdownPreviewKeys((prev) => {
              const next = new Set(prev);
              if (next.has(field.key)) next.delete(field.key); else next.add(field.key);
              return next;
            })}
          />
          {isPreview ? (
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 max-h-[500px] overflow-y-auto bg-background"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(String(value ?? "")) }}
            />
          ) : (
            <Textarea
              ref={(el) => { textareaRefs.current[field.key] = el; }}
              value={String(value ?? "")}
              onChange={(e) => updateField(field.key, e.target.value)}
              rows={20}
              className="font-mono text-xs leading-relaxed border-0 rounded-none resize-y min-h-[300px]"
            />
          )}
        </div>
      );
    }
    if (field.type === "json") {
      const jsonStr = typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2);
      return (
        <Textarea
          autoResize
          value={jsonStr}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateField(field.key, parsed);
            } catch {
              updateField(field.key, e.target.value);
            }
          }}
          rows={12}
          className="font-mono text-xs leading-relaxed"
          placeholder="[]"
        />
      );
    }
    if (field.type === "text") {
      return <Textarea autoResize value={String(value ?? "")} onChange={(e) => updateField(field.key, e.target.value)} rows={field.fullWidth ? 8 : 6} />;
    }
    if (field.type === "tags" || field.type === "array") {
      const arr = Array.isArray(value) ? value : [];
      return (
        <Textarea
          value={arr.join("\n")}
          onChange={(e) => updateField(field.key, e.target.value.split("\n").filter(Boolean))}
          rows={4}
          placeholder="По одному на рядок"
          className="text-sm"
        />
      );
    }
    return <Input value={String(value ?? "")} onChange={(e) => updateField(field.key, e.target.value)} className="h-9" />;
  };

  const displayTitle = String(data.title || data.name || data.question || data.code || data.id || "");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" onClick={() => navigate(backPath)}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{title}</p>
            <h1 className="text-sm font-semibold truncate">{displayTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {allItems && (
            <div className="flex items-center gap-1 mr-2">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={!canPrev} onClick={goPrev}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {currentIndex + 1} / {allItems.length}
              </span>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={!canNext} onClick={goNext}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {portalPath && (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={portalPath} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Портал
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleCopyJSON} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            JSON
          </Button>
          {!editing ? (
            <Button size="sm" onClick={startEdit}>Редагувати</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>Скасувати</Button>
              <Button size="sm" onClick={handleSave}>Зберегти</Button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex">
        {/* Sidebar — metadata fields */}
        <ScrollArea className="w-[380px] shrink-0 border-r h-[calc(100vh-57px)]">
          <div className="p-4 space-y-1">
            {Object.entries(groupedFields.groups).map(([groupKey, fields]) => (
              <Collapsible key={groupKey} defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                  {FIELD_GROUP_LABELS[groupKey] || groupKey}
                  <ChevronDown className="h-3.5 w-3.5" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pb-4">
                  {groupKey === "seo" && editing && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs gap-1.5"
                      onClick={async () => {
                        const { generateSeoFields } = await import("@/admin/utils/generateSeo");
                        const { toast } = await import("sonner");
                        toast.promise(
                          generateSeoFields({
                            title: String(formData.title || formData.name || formData.question || ""),
                            content: String(formData.content || formData.answer || formData.description || getNestedValue(formData, 'editorial.shortTake') || getNestedValue(formData, 'company.story') || ""),
                            tldr: String(formData.tldr || formData.seoDescription || getNestedValue(formData, 'editorial.oneLiner') || ""),
                            type: String(formData.type || ""),
                            audience: String(formData.audience || ""),
                          }).then((seo) => {
                            setFormData((prev) => ({
                              ...prev,
                              seoTitle: seo.seoTitle,
                              seoDescription: seo.seoDescription,
                              ...(prev.slug !== undefined ? { slug: seo.slug } : {}),
                            }));
                          }),
                          { loading: "Генерація SEO…", success: "SEO згенеровано!", error: "Помилка генерації" }
                        );
                      }}
                    >
                      ✨ Згенерувати AI SEO
                    </Button>
                  )}
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{field.label}</Label>
                      {renderFieldValue(field)}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>

        {/* Main area */}
        <div className="flex-1 min-w-0 h-[calc(100vh-57px)] overflow-y-auto">
          {groupedFields.fullWidthFields.length > 0 || previewType ? (
            <Tabs defaultValue={groupedFields.fullWidthFields.length > 0 ? "content" : "preview"} className="h-full flex flex-col">
              <div className="border-b px-6 pt-2">
                <TabsList>
                  {groupedFields.fullWidthFields.length > 0 && (
                    <TabsTrigger value="content">Контент</TabsTrigger>
                  )}
                  {previewType && <TabsTrigger value="preview">Попередній перегляд</TabsTrigger>}
                </TabsList>
              </div>

              {groupedFields.fullWidthFields.length > 0 && (
                <TabsContent value="content" className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
                  {groupedFields.fullWidthFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-sm font-medium">{field.label}</Label>
                      {renderFieldValue(field)}
                    </div>
                  ))}
                </TabsContent>
              )}

              {previewType && (
                <TabsContent value="preview" className="flex-1 min-h-0 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto">
                    {/* SEO Preview */}
                    <div className="mb-8 p-4 border rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Google Preview</p>
                      <div className="space-y-1">
                        <p className="text-[#1a0dab] text-lg font-normal leading-tight truncate">
                          {source.seoTitle || source.title || source.question || source.name || "Заголовок сторінки"}
                        </p>
                        <p className="text-[#006621] text-sm truncate">
                          fintodo.com.ua{portalPath || `/${source.slug || "..."}`}
                        </p>
                        <p className="text-sm text-[#545454] line-clamp-2">
                          {source.seoDescription || source.excerpt || source.cardDescription || "Опис сторінки для пошукових систем..."}
                        </p>
                      </div>
                    </div>
                    <ContentPreview data={source} previewType={previewType} />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <div className="p-6">
              <p className="text-muted-foreground text-sm">Виберіть вкладку для перегляду контенту.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
