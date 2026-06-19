import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, Search, Shield, Activity, Bell, ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "fintodo_ai_cms_settings";

const defaultSettings = {
  autoContent: {
    enabled: true,
    frequency: "daily",
    maxArticles: 3,
    autoPublish: false,
    model: "gemini-flash",
  },
  seo: {
    autoMeta: true,
    autoSlug: true,
    autoAlt: true,
    titleTemplate: "{title} | FINTODO",
    descriptionTemplate: "{tldr} — Дізнайтеся більше на FINTODO",
    minDescLength: 140,
  },
  moderation: {
    autoModerate: false,
    spamFilter: false,
    spamThreshold: 70,
    sentimentAnalysis: false,
    stopWords: "",
  },
  monitoring: {
    staleData: false,
    staleInterval: "weekly",
    lawChanges: false,
    ratesUpdate: false,
    emailNotify: false,
  },
  reminders: {
    taxDeadlines: false,
    personalTriggers: false,
    emailReminders: false,
    daysBefore: 7,
  },
};

type Settings = typeof defaultSettings;

function SectionCard({
  icon: Icon,
  title,
  description,
  planned = false,
  defaultOpen = true,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  planned?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={planned ? "secondary" : "default"}>
                  {planned ? "Заплановано" : "Активно"}
                </Badge>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className={planned ? "opacity-60 pointer-events-none" : ""}>
            <div className="space-y-4">{children}</div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-foreground">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function AiCmsAdmin() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const update = <K extends keyof Settings>(section: K, patch: Partial<Settings[K]>) =>
    setSettings((s) => ({ ...s, [section]: { ...s[section], ...patch } }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success("Налаштування AI збережено");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Агент CMS</h1>
        <p className="text-muted-foreground mt-1">Центр управління AI-процесами контент-менеджменту</p>
      </div>

      <div className="space-y-4">
        {/* 1. Автоконтент */}
        <SectionCard icon={Sparkles} title="Автоконтент" description="Генерація статей, дайджестів та оглядів на основі AI">
          <Row label="Увімкнути автогенерацію">
            <Switch checked={settings.autoContent.enabled} onCheckedChange={(v) => update("autoContent", { enabled: v })} />
          </Row>
          <Row label="Частота генерації">
            <Select value={settings.autoContent.frequency} onValueChange={(v) => update("autoContent", { frequency: v })}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Щодня</SelectItem>
                <SelectItem value="weekly">Щотижня</SelectItem>
                <SelectItem value="manual">Вручну</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Макс. статей за раз">
            <Input type="number" min={1} max={10} className="w-20" value={settings.autoContent.maxArticles} onChange={(e) => update("autoContent", { maxArticles: Number(e.target.value) })} />
          </Row>
          <Row label="Авто-публікація чернеток">
            <Switch checked={settings.autoContent.autoPublish} onCheckedChange={(v) => update("autoContent", { autoPublish: v })} />
          </Row>
          <Row label="Модель генерації">
            <Select value={settings.autoContent.model} onValueChange={(v) => update("autoContent", { model: v })}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-flash">Gemini Flash</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                <SelectItem value="gpt-5-mini">GPT-5 Mini</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </SectionCard>

        {/* 2. SEO */}
        <SectionCard icon={Search} title="SEO-оптимізація" description="Автоматичне створення мета-тегів, alt-текстів та slug">
          <Row label="Авто-SEO при збереженні">
            <Switch checked={settings.seo.autoMeta} onCheckedChange={(v) => update("seo", { autoMeta: v })} />
          </Row>
          <Row label="Авто-slug (транслітерація)">
            <Switch checked={settings.seo.autoSlug} onCheckedChange={(v) => update("seo", { autoSlug: v })} />
          </Row>
          <Row label="Авто-alt для зображень">
            <Switch checked={settings.seo.autoAlt} onCheckedChange={(v) => update("seo", { autoAlt: v })} />
          </Row>
          <div className="space-y-1.5">
            <label className="text-sm text-foreground">Шаблон title</label>
            <Input value={settings.seo.titleTemplate} onChange={(e) => update("seo", { titleTemplate: e.target.value })} placeholder="{title} | FINTODO" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-foreground">Шаблон description</label>
            <Input value={settings.seo.descriptionTemplate} onChange={(e) => update("seo", { descriptionTemplate: e.target.value })} placeholder="{tldr} — Дізнайтеся більше на FINTODO" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-foreground">Мін. довжина description: {settings.seo.minDescLength} символів</label>
            <Slider min={100} max={200} step={10} value={[settings.seo.minDescLength]} onValueChange={([v]) => update("seo", { minDescLength: v })} />
          </div>
        </SectionCard>

        {/* 3. Модерація (planned) */}
        <SectionCard icon={Shield} title="Модерація" description="Фільтрація відгуків, коментарів та AI-відповідей" planned defaultOpen={false}>
          <Row label="Авто-модерація відгуків">
            <Switch checked={settings.moderation.autoModerate} />
          </Row>
          <Row label="Фільтр спаму">
            <Switch checked={settings.moderation.spamFilter} />
          </Row>
          <div className="space-y-1.5">
            <label className="text-sm text-foreground">Поріг спаму: {settings.moderation.spamThreshold}%</label>
            <Slider min={0} max={100} step={5} value={[settings.moderation.spamThreshold]} />
          </div>
          <Row label="Аналіз тональності">
            <Switch checked={settings.moderation.sentimentAnalysis} />
          </Row>
          <div className="space-y-1.5">
            <label className="text-sm text-foreground">Стоп-слова (через кому)</label>
            <Textarea value={settings.moderation.stopWords} rows={3} placeholder="спам, реклама, казино" />
          </div>
        </SectionCard>

        {/* 4. Моніторинг (planned) */}
        <SectionCard icon={Activity} title="Моніторинг" description="Перевірка актуальності даних, ставок та законодавства" planned defaultOpen={false}>
          <Row label="Перевірка застарілих даних">
            <Switch checked={settings.monitoring.staleData} />
          </Row>
          <Row label="Інтервал перевірки">
            <Select value={settings.monitoring.staleInterval}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Щодня</SelectItem>
                <SelectItem value="weekly">Щотижня</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Відстеження змін законів">
            <Switch checked={settings.monitoring.lawChanges} />
          </Row>
          <Row label="Оновлення ставок">
            <Switch checked={settings.monitoring.ratesUpdate} />
          </Row>
          <Row label="Email-сповіщення адміну">
            <Switch checked={settings.monitoring.emailNotify} />
          </Row>
        </SectionCard>

        {/* 5. Нагадування (planned) */}
        <SectionCard icon={Bell} title="Нагадування" description="Тригери та сповіщення для користувачів порталу" planned defaultOpen={false}>
          <Row label="Податкові дедлайни">
            <Switch checked={settings.reminders.taxDeadlines} />
          </Row>
          <Row label="Персональні тригери">
            <Switch checked={settings.reminders.personalTriggers} />
          </Row>
          <Row label="Email-нагадування">
            <Switch checked={settings.reminders.emailReminders} />
          </Row>
          <Row label="За скільки днів до дедлайну">
            <Input type="number" min={1} max={30} className="w-20" value={settings.reminders.daysBefore} />
          </Row>
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Зберегти налаштування
        </Button>
      </div>
    </div>
  );
}
