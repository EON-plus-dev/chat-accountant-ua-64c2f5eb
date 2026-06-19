import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkles, Copy, Loader2, CheckCircle, AlertTriangle, Download, FileCode, RefreshCw, Eye, ChevronDown } from "lucide-react";
import { generateSeoFields } from "@/admin/utils/generateSeo";
import { useToast } from "@/hooks/use-toast";

import { ARTICLES } from "@/portal/data/articles";
import { mockConsultations } from "@/config/consultationMockData";
import { aiConsultations } from "@/config/aiConsultationMockData";
import { GRANTS } from "@/portal/data/grants";
import { PENALTIES } from "@/portal/data/penalties";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import { LAWS } from "@/portal/data/laws";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { COURSES } from "@/portal/data/learn";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { RANKINGS } from "@/portal/data/rankings";
import { REGISTERS } from "@/portal/data/registers";
import { RATE_TABLES } from "@/portal/data/rates";
import { TEMPLATES } from "@/portal/data/templates";
import { LICENSES } from "@/portal/data/licenses";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { ACCOUNTANTS } from "@/portal/data/accountants";

interface ContentSource {
  key: string;
  label: string;
  exportName: string;
  filePath: string;
  items: { id?: string; code?: string; title?: string; name?: string; term?: string; slug?: string; seoTitle?: string; seoDescription?: string; description?: string; tldr?: string; shortDefinition?: string; excerpt?: string }[];
}

const SOURCES: ContentSource[] = [
  { key: "articles", label: "Статті", exportName: "ARTICLES", filePath: "src/portal/data/articles.ts", items: ARTICLES },
  { key: "consultations", label: "Консультації", exportName: "mockConsultations", filePath: "src/config/consultationMockData.ts", items: mockConsultations as any[] },
  { key: "ai-consultations", label: "AI-конс.", exportName: "aiConsultations", filePath: "src/config/aiConsultationMockData.ts", items: aiConsultations as any[] },
  { key: "grants", label: "Гранти", exportName: "GRANTS", filePath: "src/portal/data/grants.ts", items: GRANTS },
  { key: "penalties", label: "Штрафи", exportName: "PENALTIES", filePath: "src/portal/data/penalties.ts", items: PENALTIES },
  { key: "knowledge", label: "Словник", exportName: "KNOWLEDGE", filePath: "src/portal/data/knowledge.ts", items: KNOWLEDGE },
  { key: "laws", label: "Закони", exportName: "LAWS", filePath: "src/portal/data/laws.ts", items: LAWS },
  { key: "kved", label: "КВЕД", exportName: "KVED_ENTRIES", filePath: "src/portal/data/kved.ts", items: KVED_ENTRIES },
  { key: "courses", label: "Курси", exportName: "COURSES", filePath: "src/portal/data/learn.ts", items: COURSES },
  { key: "institutions", label: "Установи", exportName: "INSTITUTION_PROFILES", filePath: "src/portal/data/institutionProfiles.ts", items: INSTITUTION_PROFILES },
  { key: "rankings", label: "Рейтинги", exportName: "RANKINGS", filePath: "src/portal/data/rankings.ts", items: RANKINGS },
  { key: "registers", label: "Реєстри", exportName: "REGISTERS", filePath: "src/portal/data/registers.ts", items: REGISTERS },
  { key: "rates", label: "Ставки", exportName: "RATE_TABLES", filePath: "src/portal/data/rates.ts", items: RATE_TABLES },
  { key: "templates", label: "Шаблони", exportName: "TEMPLATES", filePath: "src/portal/data/templates.ts", items: TEMPLATES as any[] },
  { key: "licenses", label: "Ліцензії", exportName: "LICENSES", filePath: "src/portal/data/licenses.ts", items: LICENSES as any[] },
  { key: "business-forms", label: "Форми", exportName: "BUSINESS_FORMS", filePath: "src/portal/data/businessForms.ts", items: BUSINESS_FORMS as any[] },
  { key: "accountants", label: "Бухгалтери", exportName: "ACCOUNTANTS", filePath: "src/portal/data/accountants.ts", items: ACCOUNTANTS as any[] },
];

interface SeoResult {
  id: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
}

const STORAGE_KEY = "bulk-seo-results";

function loadResults(): Record<string, SeoResult[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function saveResults(results: Record<string, SeoResult[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

function getItemId(item: any): string {
  return item.id || item.code || item.slug || "";
}

function isTemplateSeo(item: any): boolean {
  if (!item.seoTitle) return false;
  return item.seoTitle.endsWith("| FINTODO") || item.seoTitle.length < 40;
}

function mergeSeoIntoItems(items: any[], seoResults: SeoResult[], forceOverwrite = false): any[] {
  const seoMap = new Map(seoResults.map(r => [r.id, r]));
  return items.map((item, idx) => {
    const id = getItemId(item) || String(idx);
    const seo = seoMap.get(id);
    if (seo && (forceOverwrite || !item.seoTitle)) {
      return { ...item, seoTitle: seo.seoTitle, seoDescription: seo.seoDescription };
    }
    return item;
  });
}

function serializeToTs(items: any[], exportName: string): string {
  const json = JSON.stringify(items, null, 2);
  // Convert JSON to TS-friendly format: unquote simple keys
  const ts = json.replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, '$1:');
  return `export const ${exportName} = ${ts};\n`;
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/typescript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function BulkSeoGenerator() {
  const { toast } = useToast();
  const [results, setResults] = useState<Record<string, SeoResult[]>>(loadResults);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ currentSource: 0, totalSources: 0, label: "" });
  const [regenerateMode, setRegenerateMode] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ sourceKey: string; idx: number; field: 'seoTitle' | 'seoDescription' } | null>(null);
  const abortRef = useRef(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const updateResult = useCallback((sourceKey: string, idx: number, field: 'seoTitle' | 'seoDescription', value: string) => {
    setResults(prev => {
      const arr = [...(prev[sourceKey] || [])];
      if (arr[idx]) arr[idx] = { ...arr[idx], [field]: value };
      const next = { ...prev, [sourceKey]: arr };
      saveResults(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (editingCell && editInputRef.current) editInputRef.current.focus();
  }, [editingCell]);

  const getTitle = (item: any) => item.title || item.name || item.term || item.shortName || item.code || "—";
  const getContent = (item: any) => item.tldr || item.description || item.shortDefinition || item.excerpt || item.fullDescription || "";

  const generateForSource = useCallback(async (source: ContentSource) => {
    const needsSeo = regenerateMode
      ? source.items.filter(i => !i.seoTitle || isTemplateSeo(i))
      : source.items.filter(i => !i.seoTitle);
    if (needsSeo.length === 0) {
      toast({ title: `${source.label}: всі елементи вже мають SEO` });
      return;
    }

    abortRef.current = false;
    setActiveKey(source.key);
    setProgress({ current: 0, total: needsSeo.length });
    const generated: SeoResult[] = [];

    for (let i = 0; i < needsSeo.length; i++) {
      if (abortRef.current) break;
      const item = needsSeo[i];
      const title = getTitle(item);
      try {
        const seo = await generateSeoFields({ title, content: getContent(item), type: source.key });
        generated.push({
          id: item.id || item.code || item.slug || String(i),
          title,
          seoTitle: seo.seoTitle,
          seoDescription: seo.seoDescription,
          slug: seo.slug,
        });
        } catch (e: any) {
        console.warn(`SEO generation failed for "${title}":`, e);
      }
      setProgress({ current: i + 1, total: needsSeo.length });
    }

    setResults(prev => {
      const next = { ...prev, [source.key]: [...(prev[source.key] || []), ...generated] };
      saveResults(next);
      return next;
    });
    setActiveKey(null);
    toast({ title: `${source.label}: згенеровано ${generated.length} SEO записів` });
  }, [toast, regenerateMode]);

  const copyJson = (key: string) => {
    const data = results[key];
    if (!data?.length) return;
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json);
    toast({ title: "JSON скопійовано в буфер обміну" });
  };

  const clearResults = (key: string) => {
    setResults(prev => {
      const next = { ...prev };
      delete next[key];
      saveResults(next);
      return next;
    });
  };

  const handleDownloadTs = (source: ContentSource) => {
    const seoData = results[source.key];
    if (!seoData?.length) return;
    const merged = mergeSeoIntoItems([...source.items], seoData, regenerateMode);
    const content = serializeToTs(merged, source.exportName);
    const filename = source.filePath.split("/").pop() || `${source.key}.ts`;
    downloadFile(content, filename);
    toast({ title: `${filename} завантажено` });
  };

  const handleCopyFullFile = (source: ContentSource) => {
    const seoData = results[source.key];
    if (!seoData?.length) return;
    const merged = mergeSeoIntoItems([...source.items], seoData, regenerateMode);
    const content = serializeToTs(merged, source.exportName);
    navigator.clipboard.writeText(content);
    toast({ title: `Вміст ${source.exportName} скопійовано` });
  };

  const generateAll = useCallback(async () => {
    const pending = regenerateMode
      ? SOURCES.filter(s => s.items.some(i => !i.seoTitle || isTemplateSeo(i)))
      : SOURCES.filter(s => s.items.some(i => !i.seoTitle));
    if (pending.length === 0) {
      toast({ title: "Всі джерела вже мають SEO" });
      return;
    }
    setBulkRunning(true);
    abortRef.current = false;
    setBulkProgress({ currentSource: 0, totalSources: pending.length, label: "" });

    for (let si = 0; si < pending.length; si++) {
      if (abortRef.current) break;
      const source = pending[si];
      setBulkProgress({ currentSource: si + 1, totalSources: pending.length, label: source.label });
      await generateForSource(source);
    }

    setBulkRunning(false);
    if (!abortRef.current) {
      toast({ title: `Генерацію завершено для ${pending.length} джерел` });
    }
  }, [generateForSource, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Bulk-генерація SEO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Regeneration toggle + Generate All */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Switch id="regenerate-mode" checked={regenerateMode} onCheckedChange={setRegenerateMode} />
            <Label htmlFor="regenerate-mode" className="text-sm flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Перегенерувати шаблонні
            </Label>
          </div>
          <Button
            disabled={!!activeKey}
            onClick={generateAll}
            className="gap-2"
          >
            {bulkRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {bulkRunning ? "Генерація..." : "🚀 Генерувати все"}
          </Button>
          {bulkRunning && (
            <>
              <span className="text-sm text-muted-foreground">
                {bulkProgress.label} ({bulkProgress.currentSource}/{bulkProgress.totalSources} джерел)
              </span>
              <Button size="sm" variant="outline" onClick={() => { abortRef.current = true; }}>
                Зупинити все
              </Button>
            </>
          )}
        </div>

        {activeKey && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Генерація: {SOURCES.find(s => s.key === activeKey)?.label}
              </span>
              <span className="text-muted-foreground">
                {progress.current}/{progress.total}
              </span>
            </div>
            <Progress value={(progress.current / progress.total) * 100} className="h-2" />
            <Button size="sm" variant="outline" onClick={() => { abortRef.current = true; }}>
              Зупинити
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {SOURCES.map(source => {
            const noSeo = source.items.filter(i => !i.seoTitle).length;
            const templateSeo = source.items.filter(i => isTemplateSeo(i)).length;
            const needsSeo = regenerateMode ? noSeo + templateSeo : noSeo;
            const generated = results[source.key]?.length || 0;
            const isRunning = activeKey === source.key;

            return (
              <Collapsible key={source.key} open={expandedKey === source.key} onOpenChange={(open) => setExpandedKey(open ? source.key : null)}>
                <div className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24">{source.label}</span>
                    <Badge variant={needsSeo === 0 ? "default" : "secondary"} className="text-xs">
                      {needsSeo === 0 ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Готово</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3 mr-1" /> {needsSeo} {regenerateMode ? "до оновлення" : "без SEO"}</>
                      )}
                    </Badge>
                    {regenerateMode && templateSeo > 0 && (
                      <Badge variant="outline" className="text-xs text-orange-600">
                        <RefreshCw className="h-3 w-3 mr-1" /> {templateSeo} шаблонних
                      </Badge>
                    )}
                    {generated > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {generated} згенеровано
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {generated > 0 && (
                      <>
                        <CollapsibleTrigger asChild>
                          <Button size="sm" variant="outline" title="Переглянути SEO">
                            <Eye className="h-3 w-3 mr-1" />
                            <ChevronDown className={`h-3 w-3 transition-transform ${expandedKey === source.key ? "rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadTs(source)} title="Завантажити оновлений .ts файл">
                          <Download className="h-3 w-3 mr-1" /> .ts
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCopyFullFile(source)} title="Копіювати весь файл">
                          <FileCode className="h-3 w-3 mr-1" /> Файл
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyJson(source.key)} title="Копіювати лише SEO JSON">
                          <Copy className="h-3 w-3 mr-1" /> JSON
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => clearResults(source.key)}>
                          ✕
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      disabled={!!activeKey || needsSeo === 0}
                      onClick={() => generateForSource(source)}
                    >
                      {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      Генерувати
                    </Button>
                  </div>
                </div>
                <CollapsibleContent>
                  {generated > 0 && (
                    <ScrollArea className="max-h-80 border rounded-md my-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[180px]">Назва</TableHead>
                            <TableHead>SEO Title</TableHead>
                            <TableHead>SEO Description</TableHead>
                            <TableHead className="w-[140px]">Slug</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results[source.key]?.map((r, idx) => (
                            <TableRow key={idx}>
                              <TableCell compact className="font-medium truncate max-w-[180px]" title={r.title}>{r.title}</TableCell>
                              <TableCell compact>
                                {editingCell?.sourceKey === source.key && editingCell.idx === idx && editingCell.field === 'seoTitle' ? (
                                  <Input
                                    ref={editInputRef}
                                    defaultValue={r.seoTitle}
                                    className="h-7 text-xs"
                                    onBlur={(e) => { updateResult(source.key, idx, 'seoTitle', e.target.value); setEditingCell(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingCell(null); }}
                                  />
                                ) : (
                                  <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setEditingCell({ sourceKey: source.key, idx, field: 'seoTitle' })} title="Натисніть для редагування">
                                    <span className="truncate max-w-[200px]">{r.seoTitle}</span>
                                    <Badge variant="outline" size="sm" className={r.seoTitle.length <= 60 ? "text-emerald-600 border-emerald-300" : "text-amber-600 border-amber-300"}>
                                      {r.seoTitle.length}
                                    </Badge>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell compact>
                                {editingCell?.sourceKey === source.key && editingCell.idx === idx && editingCell.field === 'seoDescription' ? (
                                  <Input
                                    ref={editInputRef}
                                    defaultValue={r.seoDescription}
                                    className="h-7 text-xs"
                                    onBlur={(e) => { updateResult(source.key, idx, 'seoDescription', e.target.value); setEditingCell(null); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingCell(null); }}
                                  />
                                ) : (
                                  <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setEditingCell({ sourceKey: source.key, idx, field: 'seoDescription' })} title="Натисніть для редагування">
                                    <span className="truncate max-w-[250px]">{r.seoDescription}</span>
                                    <Badge variant="outline" size="sm" className={r.seoDescription.length <= 155 ? "text-emerald-600 border-emerald-300" : "text-amber-600 border-amber-300"}>
                                      {r.seoDescription.length}
                                    </Badge>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell compact className="truncate max-w-[140px] text-muted-foreground" title={r.slug}>{r.slug}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {Object.entries(results).some(([, v]) => v.length > 0) && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              📥 <strong>.ts</strong> — завантажити оновлений файл для заміни в проєкті · 
              📋 <strong>Файл</strong> — скопіювати весь вміст · 
              📋 <strong>JSON</strong> — лише SEO-дані
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
