import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Save, Trash2, Bot } from "lucide-react";
import { toast } from "sonner";

/**
 * Глобальні ключі/значення в cms_settings.
 * Filter дозволяє рендерити лише підмножину ключів у різних розділах Налаштувань.
 */
interface CmsSetting {
  key: string;
  value: unknown;
  scope: string;
  updated_at: string;
}

export type CmsCoreSettingsFilter = "ai" | "seo" | "monitoring" | "consultant" | "competitors" | "all";

interface CmsCoreSettingsProps {
  filter?: CmsCoreSettingsFilter;
  title?: string;
  description?: string;
}

const KNOWN_KEYS: {
  key: string;
  label: string;
  description: string;
  template: unknown;
  group: Exclude<CmsCoreSettingsFilter, "all">;
}[] = [
  {
    key: "ai_generation",
    label: "AI-генерація контенту",
    description: "Модель і параметри для авто-генерації статей.",
    template: { default_model: "openai/gpt-5-mini", temperature: 0.6, max_articles_per_day: 5, system_prompt: "" },
    group: "ai",
  },
  {
    key: "seo_defaults",
    label: "SEO за замовчуванням",
    description: "Дефолтні title-шаблон, опис, og-картинка, llms.txt header.",
    template: { title_template: "%title% | FINTODO", description: "", og_image: "", llms_header: "", canonical_base: "https://fintodo.com.ua" },
    group: "seo",
  },
  {
    key: "content_monitoring",
    label: "Моніторинг контенту",
    description: "Розклад перевірок, пороги для алертів.",
    template: { audit_frequency_hours: 24, low_traffic_threshold: 10 },
    group: "monitoring",
  },
  {
    key: "ai_consultant",
    label: "AI-консультант (публічний)",
    description: "System prompt, модель, ліміти, заборонені теми.",
    template: {
      model: "google/gemini-2.5-flash",
      system_prompt: "Ти — AI-консультант з фінансів і податків України.",
      free_messages_per_day: 3,
      premium_competencies: [],
      banned_topics: [],
      show_disclaimer: true,
    },
    group: "consultant",
  },
  {
    key: "competitor_domains",
    label: "Домени конкурентів",
    description: "Список доменів для аналітики ринку.",
    template: { domains: [] },
    group: "competitors",
  },
];

function matchesFilter(key: string, filter: CmsCoreSettingsFilter): boolean {
  if (filter === "all") return true;
  const known = KNOWN_KEYS.find((k) => k.key === key);
  if (!known) return false; // невідомі ключі — лише в "all"
  return known.group === filter;
}

export default function CmsCoreSettings({ filter = "all", title, description }: CmsCoreSettingsProps) {
  const [settings, setSettings] = useState<CmsSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cms_settings")
      .select("key, value, scope, updated_at")
      .eq("scope", "global")
      .order("key");
    if (error) {
      toast.error("Не вдалось завантажити налаштування: " + error.message);
    } else {
      setSettings(data ?? []);
      const ds: Record<string, string> = {};
      (data ?? []).forEach((s) => {
        ds[s.key] = JSON.stringify(s.value, null, 2);
      });
      setDrafts(ds);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (key: string) => {
    const raw = drafts[key] ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      toast.error(`Невалідний JSON у ключі ${key}`);
      return;
    }
    setSavingKey(key);
    const { error } = await supabase
      .from("cms_settings")
      .upsert([{ key, value: parsed as never, scope: "global" }], { onConflict: "key" });
    setSavingKey(null);
    if (error) {
      toast.error("Не вдалось зберегти: " + error.message);
    } else {
      toast.success(`Налаштування "${key}" збережено`);
      load();
    }
  };

  const remove = async (key: string) => {
    if (!confirm(`Видалити налаштування "${key}"?`)) return;
    const { error } = await supabase.from("cms_settings").delete().eq("key", key);
    if (error) toast.error("Помилка: " + error.message);
    else {
      toast.success("Видалено");
      load();
    }
  };

  const addTemplate = async (key: string, template: unknown) => {
    if (settings.some((s) => s.key === key)) {
      toast.info("Цей ключ уже існує");
      return;
    }
    const { error } = await supabase
      .from("cms_settings")
      .insert([{ key, value: template as never, scope: "global" }]);
    if (error) toast.error("Помилка: " + error.message);
    else {
      toast.success(`Створено "${key}"`);
      load();
    }
  };

  const addBlankKey = async () => {
    const key = newKey.trim();
    if (!key) return;
    if (settings.some((s) => s.key === key)) {
      toast.info("Такий ключ уже існує");
      return;
    }
    const { error } = await supabase
      .from("cms_settings")
      .insert([{ key, value: {} as never, scope: "global" }]);
    if (error) toast.error("Помилка: " + error.message);
    else {
      setNewKey("");
      toast.success(`Створено "${key}"`);
      load();
    }
  };

  const visibleSettings = settings.filter((s) => matchesFilter(s.key, filter));
  const visibleTemplates = KNOWN_KEYS.filter(
    (k) => (filter === "all" || k.group === filter) && !settings.some((s) => s.key === k.key),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" /> {title ?? "Глобальні налаштування"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {description ?? (
            <>Параметри з таблиці <code>cms_settings</code>. AI-агент читає їх через <code>cms_settings_get</code>.</>
          )}
        </p>
      </header>

      {visibleTemplates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Швидке додавання шаблонів</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {visibleTemplates.map((t) => (
              <Button
                key={t.key}
                variant="outline"
                size="sm"
                onClick={() => addTemplate(t.key, t.template)}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> {t.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {visibleSettings.length === 0 && visibleTemplates.length === 0 && (
        <div className="text-sm text-muted-foreground">Немає ключів у цій категорії.</div>
      )}

      {visibleSettings.map((s) => {
        const known = KNOWN_KEYS.find((k) => k.key === s.key);
        const isSaving = savingKey === s.key;
        return (
          <Card key={s.key}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <code className="text-sm">{s.key}</code>
                    <Badge variant="outline" className="text-[10px]">{s.scope}</Badge>
                  </CardTitle>
                  {known && <p className="text-xs text-muted-foreground mt-1">{known.description}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(s.key)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                value={drafts[s.key] ?? ""}
                onChange={(e) => setDrafts({ ...drafts, [s.key]: e.target.value })}
                rows={8}
                className="font-mono text-xs"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Оновлено: {new Date(s.updated_at).toLocaleString("uk-UA")}
                </span>
                <Button size="sm" onClick={() => save(s.key)} disabled={isSaving} className="gap-1.5">
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Зберегти
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {filter === "all" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Додати ключ вручну</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Label htmlFor="new-key" className="sr-only">Ключ</Label>
              <Input
                id="new-key"
                placeholder="назва_ключа"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={addBlankKey} disabled={!newKey.trim()} size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Додати
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
