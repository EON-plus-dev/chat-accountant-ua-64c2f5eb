import { useState, useEffect, useMemo } from "react";
import { SubtabShelf } from "@/components/ui/SubtabShelf";
import {
  Settings, Sparkles, Newspaper, BookOpen, ClipboardList,
  CalendarDays, RotateCcw, Check, X, Clock, Search,
  BarChart3, ListTodo, PenLine, Shield, Target,
  FileText, Globe, TrendingUp, CheckCircle2,
  ChevronDown, ChevronRight, Save, Loader2, Plus, Database, Zap,
  ArrowRight, Trash2, GripVertical, Copy, Activity, Users,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { demoUserSubscription } from "@/config/pricingData";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

// ─── Types ───

interface ContentTypeConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  prompt: string;
  audience: string;
}

type SourceType = "official" | "analytical" | "reference" | "grant" | "custom";

const sourceTypeLabels: Record<SourceType, string> = {
  official: "Офіційні",
  analytical: "Аналітичні",
  reference: "Довідникові",
  grant: "Грантові",
  custom: "Кастомні",
};

interface DataSource {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  description: string;
  type: SourceType;
  url: string;
  frequency: number;
  isCustom: boolean;
}

interface AIVerificationSettings {
  checks: {
    brandVoice: boolean;
    uniqueness: boolean;
    facts: boolean;
    seo: boolean;
    structure: boolean;
  };
  verificationModel: string;
}

interface AutonomyDetailSettings {
  ideasPerDay: string;
  ideaSources: { trends: boolean; competitors: boolean; userQueries: boolean };
  verifyThreshold: number[];
  rejectThreshold: number[];
  notifyReady: boolean;
  notifyDigest: boolean;
  autoApproveThreshold: number[];
  dailyPubLimit: string;
}

interface TemplateConfig {
  id: string;
  label: string;
  sections: string[];
}

// ─── Constants ───

const audiences = ["fop", "accountant", "director", "personal"];
const audienceLabels: Record<string, string> = {
  fop: "ФОП", accountant: "Бухгалтер", director: "Керівник", personal: "Фізособа",
};

const initialContentTypeConfigs: ContentTypeConfig[] = [
  { id: "news", label: "Новини", icon: Newspaper, enabled: true, prompt: "Напиши новину про останні зміни в податковому законодавстві України...", audience: "fop" },
  { id: "guide", label: "Гайди", icon: BookOpen, enabled: true, prompt: "Створи покроковий гайд для підприємців...", audience: "fop" },
  { id: "analysis", label: "Аналітика", icon: TrendingUp, enabled: true, prompt: "Проведи аналіз поточної ситуації...", audience: "accountant" },
  { id: "review", label: "Огляди", icon: ClipboardList, enabled: false, prompt: "Напиши огляд фінансового продукту...", audience: "fop" },
  { id: "digest", label: "Дайджест", icon: CalendarDays, enabled: false, prompt: "Підсумуй ключові фінансові події тижня...", audience: "accountant" },
  { id: "dps", label: "ДПС", icon: FileText, enabled: false, prompt: "Напиши роз'яснення позиції ДПС щодо оподаткування...", audience: "accountant" },
  { id: "change", label: "Зміни", icon: RotateCcw, enabled: false, prompt: "Опиши зміни в законодавстві та їх вплив на бізнес...", audience: "fop" },
];

const initialDataSources: DataSource[] = [
  { id: "dps", label: "ДПС України", icon: FileText, enabled: true, description: "Податкові роз'яснення, ІПК, листи", type: "official", url: "https://tax.gov.ua", frequency: 6, isCustom: false },
  { id: "nbu", label: "НБУ", icon: TrendingUp, enabled: true, description: "Курси валют, облікова ставка, регуляція", type: "official", url: "https://bank.gov.ua", frequency: 12, isCustom: false },
  { id: "rada", label: "Верховна Рада", icon: FileText, enabled: true, description: "Закони, законопроєкти, постанови", type: "official", url: "https://rada.gov.ua", frequency: 12, isCustom: false },
  { id: "minfin", label: "Мінфін", icon: TrendingUp, enabled: false, description: "Бюджет, держборг, фіскальна політика", type: "official", url: "https://minfin.gov.ua", frequency: 24, isCustom: false },
  { id: "minjust", label: "Мін'юст", icon: FileText, enabled: false, description: "Реєстри, нормативні акти", type: "official", url: "https://minjust.gov.ua", frequency: 24, isCustom: false },
  { id: "minfin_portal", label: "Мінфін (портал)", icon: BarChart3, enabled: true, description: "Курси, депозити, кредити, індекси", type: "analytical", url: "https://minfin.com.ua", frequency: 6, isCustom: false },
  { id: "opendatabot", label: "Opendatabot", icon: BarChart3, enabled: false, description: "Реєстраційні дані, судові рішення", type: "analytical", url: "https://opendatabot.ua", frequency: 12, isCustom: false },
  { id: "youcontrol", label: "YouControl", icon: BarChart3, enabled: false, description: "Аналітика компаній, ризики", type: "analytical", url: "https://youcontrol.com.ua", frequency: 24, isCustom: false },
  { id: "kved", label: "КВЕД / класифікатори", icon: Target, enabled: true, description: "Коди діяльності, довідники", type: "reference", url: "https://kved.ukrstat.gov.ua", frequency: 168, isCustom: false },
  { id: "zakon_rada", label: "Законодавство України", icon: FileText, enabled: true, description: "Повнотекстова база нормативних актів", type: "reference", url: "https://zakon.rada.gov.ua", frequency: 24, isCustom: false },
  { id: "drsu", label: "Реєстр судових рішень", icon: FileText, enabled: false, description: "Рішення суддів з податкових та господарських справ", type: "reference", url: "https://reyestr.court.gov.ua", frequency: 24, isCustom: false },
  { id: "diia_business", label: "Дія.Бізнес", icon: Sparkles, enabled: true, description: "Гранти, мікрокредити, програми підтримки", type: "grant", url: "https://business.diia.gov.ua", frequency: 24, isCustom: false },
  { id: "eu4business", label: "EU4Business", icon: Sparkles, enabled: false, description: "Програми ЄС для українського бізнесу", type: "grant", url: "https://eu4business.org.ua", frequency: 48, isCustom: false },
  { id: "usaid", label: "USAID", icon: Sparkles, enabled: false, description: "Американські програми підтримки", type: "grant", url: "https://usaid.gov/ukraine", frequency: 48, isCustom: false },
];

// Fallback labels for template types not in initialContentTypeConfigs
const templateLabelFallback: Record<string, string> = {
  podcast: "Подкаст",
  video: "Відео",
  consultation: "Консультація",
};

const defaultTemplateSections: Record<string, string[]> = {
  news: ["## Заголовок", ":::intro — Контекст", "## Основні зміни", ":::container — Деталі", ":::conclusion — Висновок"],
  guide: ["## Вступ", ":::intro — Для кого", "## Крок 1–N (покрокові інструкції)", ":::container — Поради", "## FAQ", ":::conclusion — Підсумок"],
  analysis: ["## Огляд ситуації", "## Аналіз даних (таблиці)", ":::container — Ключові цифри", "## Прогноз", ":::conclusion — Висновок"],
  review: ["## Вступ", "## Порівняльна таблиця", "## Детальний огляд", ":::conclusion — Рекомендація"],
  digest: ["## Головне за тиждень", "## Законодавство", "## Ринок", ":::conclusion — Підсумок"],
  dps: ["## Суть роз'яснення", ":::intro — Контекст", "## Позиція ДПС", ":::container — Цитата з листа/ІПК", "## Практичні наслідки", ":::conclusion — Рекомендація"],
  change: ["## Що змінилось", ":::intro — Контекст змін", "## Деталі змін", ":::container — Порівняння до/після", "## На кого впливає", ":::conclusion — Дії"],
  podcast: ["## Тема випуску", ":::intro — Про що говоримо", "## Основні тези", ":::container — Ключові цитати", "## Корисні посилання", ":::conclusion — Підсумок"],
  video: ["## Назва відео", ":::intro — Тизер", "## Сценарій (таймкоди)", ":::container — Ключові кадри", "## CTA", ":::conclusion — Заклик до дії"],
  consultation: ["## Питання", ":::intro — Контекст ситуації", "## Відповідь спеціаліста", ":::container — Нормативна база", "## Практичні кроки", ":::conclusion — Рекомендація"],
};

// Step 1: Tab order — Sources → Generation → Templates → Autonomy
const subtabs = [
  { id: "sources", label: "Джерела", icon: Database },
  { id: "generation", label: "Генерація", icon: PenLine },
  { id: "templates", label: "Шаблони", icon: FileText },
  { id: "autonomy", label: "Автономність", icon: Zap },
  { id: "ai-credits", label: "AI та витрати", icon: Sparkles },
  { id: "authors", label: "Автори", icon: Users },
];

// ─── AI & Credits Types ───

interface AISettings {
  generationModel: string;
  verificationModel: string;
  temperature: number[];
  lengthPreset: string;
  systemPromptOverride: string;
}

const defaultAISettings: AISettings = {
  generationModel: "gemini-2.5-flash",
  verificationModel: "gemini-2.5-flash-lite",
  temperature: [0.7],
  lengthPreset: "standard",
  systemPromptOverride: "",
};

interface CreditLimits {
  dailyLimit: string;
  weeklyLimit: string;
  alertThreshold: string;
  pauseOnLimit: boolean;
  emailAlert: boolean;
}

const defaultCreditLimits: CreditLimits = {
  dailyLimit: "50",
  weeklyLimit: "250",
  alertThreshold: "100",
  pauseOnLimit: true,
  emailAlert: true,
};

const limitPresets = ["25", "50", "100", "150", "200", "300", "500"];
const alertPresets = ["50", "100", "150", "200", "300"];

const lengthPresets = [
  { value: "short", label: "Коротка", tokens: 1024, words: "~500 слів" },
  { value: "standard", label: "Стандарт", tokens: 4096, words: "~2000 слів" },
  { value: "extended", label: "Розгорнута", tokens: 8192, words: "~4000 слів" },
];

const aiModelTiers = [
  {
    tier: "economy", label: "Економ", description: "Швидко і дешево",
    qualityBadge: "Базова якість",
    useCase: "Новини, дайджести, прості тексти",
    borderColor: "border-emerald-500/40", bgColor: "bg-emerald-500/5", badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    models: [
      { value: "gemini-2.5-flash-lite", label: "Flash Lite", costPerKTokens: 0.5, avgResponseTime: "1.2с" },
      { value: "gpt-5-nano", label: "GPT-5 Nano", costPerKTokens: 0.5, avgResponseTime: "1.5с" },
    ],
  },
  {
    tier: "balanced", label: "Баланс", description: "Оптимальний вибір",
    qualityBadge: "Висока точність",
    useCase: "Гайди, огляди, експертний контент",
    borderColor: "border-blue-500/40", bgColor: "bg-blue-500/5", badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    models: [
      { value: "gemini-2.5-flash", label: "Flash", costPerKTokens: 1.0, avgResponseTime: "2.5с" },
      { value: "gpt-5-mini", label: "GPT-5 Mini", costPerKTokens: 1.2, avgResponseTime: "3.0с" },
    ],
  },
  {
    tier: "premium", label: "Преміум", description: "Найвища якість",
    qualityBadge: "Найкраща для аналітики",
    useCase: "Аналітика, складні розрахунки, юридичні тексти",
    borderColor: "border-amber-500/40", bgColor: "bg-amber-500/5", badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    models: [
      { value: "gemini-2.5-pro", label: "Pro", costPerKTokens: 2.0, avgResponseTime: "5.0с" },
      { value: "gpt-5", label: "GPT-5", costPerKTokens: 2.5, avgResponseTime: "6.0с" },
    ],
  },
];

const calcCostPerArticle = (costPerKTokens: number, tokens: number) => Math.ceil(costPerKTokens * (tokens / 1000));
const calcVerCost = (costPerKTokens: number) => Math.ceil(costPerKTokens * 0.7);

const allAiModels = aiModelTiers.flatMap(t => t.models.map(m => ({ ...m, tier: t.tier })));

// Mock credit data
const mockCreditHistory = [
  { date: "2026-04-15", operation: "Генерація: 3 статті", credits: -12, type: "generation" },
  { date: "2026-04-14", operation: "Верифікація: 5 статей", credits: -5, type: "verification" },
  { date: "2026-04-14", operation: "Аналіз джерел: ДПС, НБУ", credits: -3, type: "analysis" },
  { date: "2026-04-13", operation: "Генерація: 2 статті", credits: -8, type: "generation" },
  { date: "2026-04-13", operation: "Верифікація: 4 статті", credits: -4, type: "verification" },
  { date: "2026-04-12", operation: "Генерація: 3 статті", credits: -12, type: "generation" },
  { date: "2026-04-12", operation: "Аналіз джерел: Рада, Мінфін", credits: -2, type: "analysis" },
  { date: "2026-04-11", operation: "Генерація: 1 стаття", credits: -4, type: "generation" },
  { date: "2026-04-10", operation: "Поповнення балансу", credits: 200, type: "topup" },
  { date: "2026-04-10", operation: "Верифікація: 3 статті", credits: -3, type: "verification" },
];

const mockDailyUsage = [
  { day: "Пн", credits: 15 }, { day: "Вт", credits: 22 }, { day: "Ср", credits: 18 },
  { day: "Чт", credits: 25 }, { day: "Пт", credits: 12 }, { day: "Сб", credits: 5 }, { day: "Нд", credits: 8 },
];

// ─── Pipeline Step Indicator ───

interface PipelineStep {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const generationSteps: PipelineStep[] = [
  { id: "what", number: 1, title: "Що генерувати", subtitle: "Типи, аудиторія", icon: FileText },
  { id: "how", number: 2, title: "Як генерувати", subtitle: "Brand Voice, модель", icon: PenLine },
  { id: "plan", number: 3, title: "Контент-план", subtitle: "Розклад, хаби", icon: ListTodo },
];

interface ContentPlanSettings {
  frequency: string;
  ideasPerCycle: string;
  priorityHubs: string[];
  priorityTypes: string[];
  autoMonitoring: boolean;
  deduplicationDays: string;
  seoRanking: boolean;
}

const defaultContentPlanSettings: ContentPlanSettings = {
  frequency: "12h",
  ideasPerCycle: "5",
  priorityHubs: ["taxes", "fop"],
  priorityTypes: ["news", "guides"],
  autoMonitoring: true,
  deduplicationDays: "14",
  seoRanking: true,
};

const HUBS = [
  { id: "taxes", label: "Податки" },
  { id: "fop", label: "ФОП" },
  { id: "law", label: "Право" },
  { id: "accounting", label: "Бухгалтерія" },
  { id: "finance", label: "Фінанси" },
  { id: "wartime", label: "Воєнний час" },
];

const CONTENT_TYPES = [
  { id: "news", label: "Новини" },
  { id: "guides", label: "Гайди" },
  { id: "analytics", label: "Аналітика" },
  { id: "digest", label: "Дайджест" },
];

function StepIndicator({ activeStep, onStepClick, steps }: { activeStep: string; onStepClick: (id: string) => void; steps: PipelineStep[] }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const isActive = activeStep === step.id;
        return (
          <div key={step.id} className="flex items-center shrink-0">
            <button
              onClick={() => onStepClick(step.id)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all text-left",
                isActive ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/60"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold shrink-0 transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {step.number}
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold leading-tight", isActive ? "text-foreground" : "text-muted-foreground")}>{step.title}</p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">{step.subtitle}</p>
              </div>
            </button>
            {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/40 mx-1 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Generation Tab — Step 5: removed autoApproveThreshold/autoVerify, kept checks only
// Step 6: Guardrails moved here
// ═════════════════════════════════════════════════════════════

function GenerationTab({
  types, setTypes, model, setModel, tone, setTone,
  brandVoice, setBrandVoice, verificationSettings, setVerificationSettings,
  guardrails, setGuardrails,
  brandDo, setBrandDo, brandDont, setBrandDont,
  contentPlanSettings, setContentPlanSettings,
}: {
  types: ContentTypeConfig[];
  setTypes: React.Dispatch<React.SetStateAction<ContentTypeConfig[]>>;
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  tone: string;
  setTone: React.Dispatch<React.SetStateAction<string>>;
  brandVoice: string;
  setBrandVoice: React.Dispatch<React.SetStateAction<string>>;
  verificationSettings: AIVerificationSettings;
  setVerificationSettings: React.Dispatch<React.SetStateAction<AIVerificationSettings>>;
  guardrails: string;
  setGuardrails: React.Dispatch<React.SetStateAction<string>>;
  brandDo: string;
  setBrandDo: React.Dispatch<React.SetStateAction<string>>;
  brandDont: string;
  setBrandDont: React.Dispatch<React.SetStateAction<string>>;
  contentPlanSettings: ContentPlanSettings;
  setContentPlanSettings: React.Dispatch<React.SetStateAction<ContentPlanSettings>>;
}) {
  const [activeStep, setActiveStep] = useState("what");
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const enabledCount = types.filter(t => t.enabled).length;

  return (
    <div className="space-y-4">
      <StepIndicator activeStep={activeStep} onStepClick={setActiveStep} steps={generationSteps} />

      <div className="min-h-[400px]">
        {/* Step 1: ЩО генерувати */}
        {activeStep === "what" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">1</div>
              <div>
                <h3 className="text-base font-semibold">Що генерувати</h3>
                <p className="text-xs text-muted-foreground">Оберіть типи контенту та налаштуйте промпти для кожного типу</p>
              </div>
            </div>

            <div className="grid gap-2">
              {types.map((t, i) => {
                const TypeIcon = initialContentTypeConfigs.find(ct => ct.id === t.id)?.icon ?? Newspaper;
                const isExpanded = expandedType === t.id;
                return (
                  <Card key={t.id} className={cn("transition-all", t.enabled ? "border-primary/30 bg-primary/[0.02]" : "opacity-60")}>
                    <CardContent className="py-3 space-y-0">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setExpandedType(isExpanded ? null : t.id)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center transition-colors", t.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            <TypeIcon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{t.label}</p>
                            <p className="text-xs text-muted-foreground">Аудиторія: {audienceLabels[t.audience]}</p>
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        <Switch checked={t.enabled} onCheckedChange={(v) => setTypes(prev => prev.map((x, j) => j === i ? { ...x, enabled: v } : x))} />
                      </div>

                      {isExpanded && t.enabled && (
                        <div className="mt-3 space-y-3 pt-3 border-t border-border/50">
                          <div>
                            <Label className="text-xs text-muted-foreground">Системний промпт</Label>
                            <Textarea value={t.prompt} rows={2} className="text-xs mt-1"
                              onChange={(e) => setTypes(prev => prev.map((x, j) => j === i ? { ...x, prompt: e.target.value } : x))} />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Цільова аудиторія</Label>
                            <Select value={t.audience} onValueChange={(v) => setTypes(prev => prev.map((x, j) => j === i ? { ...x, audience: v } : x))}>
                              <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>{audiences.map(a => <SelectItem key={a} value={a}>{audienceLabels[a]}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Увімкнено: {enabledCount} з {types.length} типів</p>
          </div>
        )}

        {/* Step 2: ЯК генерувати */}
        {activeStep === "how" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">2</div>
              <div>
                <h3 className="text-base font-semibold">Як генерувати</h3>
                <p className="text-xs text-muted-foreground">Визначте голос бренду, оберіть AI-модель та налаштуйте стиль контенту</p>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Brand Voice Profile
                </CardTitle>
                <CardDescription className="text-xs">Визначає стиль, тон та характер всього контенту</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Опис голосу бренду</Label>
                  <Textarea value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} rows={3} className="mt-1 text-sm" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> DO — Рекомендації
                    </Label>
                    <Textarea value={brandDo} onChange={(e) => setBrandDo(e.target.value)} rows={4} className="mt-1 text-xs border-green-200 dark:border-green-900" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-red-700 dark:text-red-400 flex items-center gap-1">
                      <X className="h-3 w-3" /> DON'T — Заборони
                    </Label>
                    <Textarea value={brandDont} onChange={(e) => setBrandDont(e.target.value)} rows={4} className="mt-1 text-xs border-red-200 dark:border-red-900" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 6: Guardrails moved from Sources to here */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Guardrails — правила безпеки
                </CardTitle>
                <CardDescription className="text-xs">Заборонені теми, обов'язкові перевірки, fact-checking</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea value={guardrails} onChange={(e) => setGuardrails(e.target.value)} rows={3} className="text-sm" />
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Модель AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-flash">Gemini 3 Flash (швидкий)</SelectItem>
                      <SelectItem value="gemini-pro">Gemini 2.5 Pro (точний)</SelectItem>
                      <SelectItem value="gpt-5">GPT-5 (потужний)</SelectItem>
                      <SelectItem value="gpt-5-mini">GPT-5 Mini (економний)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Модель впливає на якість, швидкість та вартість генерації</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-primary" />
                    Тон та стиль
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Професійний</SelectItem>
                      <SelectItem value="friendly">Дружній</SelectItem>
                      <SelectItem value="formal">Формальний</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Загальний тон для всіх типів контенту</p>
                </CardContent>
              </Card>
            </div>

            {/* Step 5: Verification — only checks list + model, NO thresholds */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  AI Верифікація — перевірки
                </CardTitle>
                <CardDescription className="text-xs">Які перевірки виконуються після генерації. Пороги якості — у вкладці «Автономність».</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Перевірки</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {([
                      { key: "brandVoice" as const, label: "Brand Voice відповідність", icon: Globe },
                      { key: "uniqueness" as const, label: "Унікальність тексту", icon: FileText },
                      { key: "facts" as const, label: "Перевірка фактів", icon: CheckCircle2 },
                      { key: "seo" as const, label: "SEO оптимізація", icon: TrendingUp },
                      { key: "structure" as const, label: "Структура шаблону", icon: ListTodo },
                    ]).map(check => {
                      const CheckIcon = check.icon;
                      return (
                        <div key={check.key} className="flex items-center justify-between rounded-lg border p-2.5">
                          <div className="flex items-center gap-2">
                            <CheckIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium">{check.label}</span>
                          </div>
                          <Switch
                            checked={verificationSettings.checks[check.key]}
                            onCheckedChange={(v) => setVerificationSettings(p => ({ ...p, checks: { ...p.checks, [check.key]: v } }))}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">AI-модель для перевірки</Label>
                  <Select value={verificationSettings.verificationModel} onValueChange={(v) => setVerificationSettings(p => ({ ...p, verificationModel: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-flash">Gemini 3 Flash (швидкий)</SelectItem>
                      <SelectItem value="gemini-pro">Gemini 2.5 Pro (точний)</SelectItem>
                      <SelectItem value="gpt-5">GPT-5 (потужний)</SelectItem>
                      <SelectItem value="gpt-5-mini">GPT-5 Mini (економний)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Може відрізнятися від моделі генерації для кращої якості перевірки</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Контент-план */}
        {activeStep === "plan" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">3</div>
              <div>
                <h3 className="text-base font-semibold">Контент-план</h3>
                <p className="text-xs text-muted-foreground">Розклад генерації ідей, пріоритетні хаби та типи контенту</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Розклад генерації
                  </CardTitle>
                  <CardDescription className="text-xs">Як часто AI шукає нові ідеї</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Частота перевірки</Label>
                    <Select value={contentPlanSettings.frequency} onValueChange={(v) => setContentPlanSettings(p => ({ ...p, frequency: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Щогодини</SelectItem>
                        <SelectItem value="6h">Кожні 6 годин</SelectItem>
                        <SelectItem value="12h">Кожні 12 годин</SelectItem>
                        <SelectItem value="daily">Раз на добу</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ідей за цикл</Label>
                    <Select value={contentPlanSettings.ideasPerCycle} onValueChange={(v) => setContentPlanSettings(p => ({ ...p, ideasPerCycle: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 ідеї</SelectItem>
                        <SelectItem value="5">5 ідей</SelectItem>
                        <SelectItem value="10">10 ідей</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-primary" />
                    Дедуплікація
                  </CardTitle>
                  <CardDescription className="text-xs">Уникати повторних тем</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Вікно перевірки</Label>
                    <Select value={contentPlanSettings.deduplicationDays} onValueChange={(v) => setContentPlanSettings(p => ({ ...p, deduplicationDays: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 днів</SelectItem>
                        <SelectItem value="14">14 днів</SelectItem>
                        <SelectItem value="30">30 днів</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">AI не запропонує тему, якщо схожа вже була за цей період</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Пріоритетні хаби
                </CardTitle>
                <CardDescription className="text-xs">Фокус моніторингу на обраних тематиках</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-3">
                  {HUBS.map(hub => (
                    <div key={hub.id} className="flex items-center gap-2 rounded-lg border p-2.5">
                      <Checkbox
                        checked={contentPlanSettings.priorityHubs.includes(hub.id)}
                        onCheckedChange={(checked) => {
                          setContentPlanSettings(p => ({
                            ...p,
                            priorityHubs: checked
                              ? [...p.priorityHubs, hub.id]
                              : p.priorityHubs.filter(h => h !== hub.id),
                          }));
                        }}
                      />
                      <span className="text-xs font-medium">{hub.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-primary" />
                  Пріоритетні типи контенту
                </CardTitle>
                <CardDescription className="text-xs">Які типи генерувати частіше</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CONTENT_TYPES.map(ct => (
                    <div key={ct.id} className="flex items-center gap-2 rounded-lg border p-2.5">
                      <Checkbox
                        checked={contentPlanSettings.priorityTypes.includes(ct.id)}
                        onCheckedChange={(checked) => {
                          setContentPlanSettings(p => ({
                            ...p,
                            priorityTypes: checked
                              ? [...p.priorityTypes, ct.id]
                              : p.priorityTypes.filter(t => t !== ct.id),
                          }));
                        }}
                      />
                      <span className="text-xs font-medium">{ct.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Автоматизація
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-2.5">
                  <div>
                    <span className="text-xs font-medium">AI-моніторинг джерел</span>
                    <p className="text-xs text-muted-foreground">Автоматичний пошук актуальних тем у підключених джерелах</p>
                  </div>
                  <Switch
                    checked={contentPlanSettings.autoMonitoring}
                    onCheckedChange={(v) => setContentPlanSettings(p => ({ ...p, autoMonitoring: v }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-2.5">
                  <div>
                    <span className="text-xs font-medium">SEO-пріоритет</span>
                    <p className="text-xs text-muted-foreground">Враховувати пошукові запити при ранжуванні ідей</p>
                  </div>
                  <Switch
                    checked={contentPlanSettings.seoRanking}
                    onCheckedChange={(v) => setContentPlanSettings(p => ({ ...p, seoRanking: v }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Sources Tab — Step 6: Guardrails removed from here
// ═════════════════════════════════════════════════════════════

function SourcesTab({
  sources, setSources,
}: {
  sources: DataSource[];
  setSources: React.Dispatch<React.SetStateAction<DataSource[]>>;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({ label: "", url: "", type: "custom" as SourceType, description: "", frequency: 12 });

  const enabledSourcesCount = sources.filter(s => s.enabled).length;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sources.length };
    sources.forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1; });
    return counts;
  }, [sources]);

  const filtered = useMemo(() => {
    return sources.filter(s => {
      if (search && !s.label.toLowerCase().includes(search.toLowerCase()) && !s.url.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeCategory !== "all" && s.type !== activeCategory) return false;
      if (statusFilter === "enabled" && !s.enabled) return false;
      if (statusFilter === "disabled" && s.enabled) return false;
      return true;
    });
  }, [sources, search, activeCategory, statusFilter]);

  const groupedSources = useMemo(() => {
    if (activeCategory !== "all") return { [activeCategory]: filtered };
    const groups: Record<string, DataSource[]> = {};
    filtered.forEach(s => {
      if (!groups[s.type]) groups[s.type] = [];
      groups[s.type].push(s);
    });
    return groups;
  }, [filtered, activeCategory]);

  const addCustomSource = () => {
    if (!newSource.label.trim() || !newSource.url.trim()) {
      toast.error("Вкажіть назву та URL");
      return;
    }
    const id = `custom_${Date.now()}`;
    setSources(prev => [...prev, { ...newSource, id, icon: Globe, enabled: true, isCustom: true }]);
    setNewSource({ label: "", url: "", type: "custom", description: "", frequency: 12 });
    setShowAddForm(false);
    toast.success("Джерело додано");
  };

  const deleteSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
    toast.success("Джерело видалено");
  };

  const categoryTabs: { key: string; label: string }[] = [
    { key: "all", label: "Всі" },
    ...Object.entries(sourceTypeLabels).map(([k, l]) => ({ key: k, label: l })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Джерела даних</h3>
            <p className="text-xs text-muted-foreground">
              Увімкнено: {enabledSourcesCount} з {sources.length} джерел
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Додати джерело
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Нове джерело</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Назва</Label>
                <Input value={newSource.label} onChange={e => setNewSource(p => ({ ...p, label: e.target.value }))} placeholder="Назва джерела" className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL</Label>
                <Input value={newSource.url} onChange={e => setNewSource(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Тип</Label>
                <Select value={newSource.type} onValueChange={v => setNewSource(p => ({ ...p, type: v as SourceType }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(sourceTypeLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Частота моніторингу</Label>
                <Select value={String(newSource.frequency)} onValueChange={v => setNewSource(p => ({ ...p, frequency: Number(v) }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Щогодини</SelectItem>
                    <SelectItem value="6">Кожні 6 год</SelectItem>
                    <SelectItem value="12">Кожні 12 год</SelectItem>
                    <SelectItem value="24">Раз на добу</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Опис</Label>
              <Input value={newSource.description} onChange={e => setNewSource(p => ({ ...p, description: e.target.value }))} placeholder="Короткий опис джерела" className="h-9 text-sm" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Скасувати</Button>
              <Button size="sm" onClick={addCustomSource}>Зберегти</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {categoryTabs.map(tab => (
          <Button
            key={tab.key}
            variant={activeCategory === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(tab.key)}
            className="h-8 text-xs gap-1"
          >
            {tab.label}
            <span className={cn(
              "ml-0.5 text-[10px] rounded-full px-1.5 py-0.5 leading-none font-semibold",
              activeCategory === tab.key
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {categoryCounts[tab.key] || 0}
            </span>
          </Button>
        ))}
      </div>

      {/* Search + status filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Пошук за назвою або URL..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі статуси</SelectItem>
            <SelectItem value="enabled">Увімкнені</SelectItem>
            <SelectItem value="disabled">Вимкнені</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sources list */}
      {Object.entries(groupedSources).map(([type, items]) => (
        <div key={type}>
          {activeCategory === "all" && (
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-1">
              {sourceTypeLabels[type as SourceType]} ({items.length})
            </div>
          )}
          <div className="border rounded-lg divide-y">
            {items.map(s => {
              const SourceIcon = s.icon;
              const idx = sources.findIndex(x => x.id === s.id);
              return (
                <div key={s.id} className={cn(
                  "flex items-center gap-3 px-3 py-2 transition-colors group",
                  s.enabled ? "bg-primary/[0.02]" : "opacity-60"
                )}>
                  <SourceIcon className={cn("h-4 w-4 shrink-0", s.enabled ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-medium truncate min-w-0 flex-shrink-0 max-w-[180px]">{s.label}</span>
                  <span className="text-xs text-muted-foreground truncate min-w-0 flex-1">{s.url}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                    <Clock className="h-2.5 w-2.5" />
                    {s.frequency < 24 ? `${s.frequency} год` : `${s.frequency / 24} д`}
                  </span>
                  {s.isCustom && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => deleteSource(s.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                  <Switch checked={s.enabled} onCheckedChange={(v) => setSources(prev => prev.map((x, j) => j === idx ? { ...x, enabled: v } : x))} className="shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(groupedSources).length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">Нічого не знайдено</div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Templates Tab — Step 7: fixed labels with fallback
// ═════════════════════════════════════════════════════════════

function TemplatesTab({
  templates, setTemplates,
}: {
  templates: TemplateConfig[];
  setTemplates: React.Dispatch<React.SetStateAction<TemplateConfig[]>>;
}) {
  const [activeTemplate, setActiveTemplate] = useState(templates[0]?.id || "news");
  const [newSectionText, setNewSectionText] = useState("");

  const current = templates.find(t => t.id === activeTemplate);

  const addSection = () => {
    if (!newSectionText.trim() || !current) return;
    setTemplates(prev => prev.map(t =>
      t.id === activeTemplate ? { ...t, sections: [...t.sections, newSectionText.trim()] } : t
    ));
    setNewSectionText("");
  };

  const removeSection = (index: number) => {
    setTemplates(prev => prev.map(t =>
      t.id === activeTemplate ? { ...t, sections: t.sections.filter((_, i) => i !== index) } : t
    ));
  };

  const duplicateTemplate = () => {
    if (!current) return;
    const newId = `${current.id}_copy_${Date.now()}`;
    setTemplates(prev => [...prev, { id: newId, label: `${current.label} (копія)`, sections: [...current.sections] }]);
    setActiveTemplate(newId);
    toast.success("Шаблон скопійовано");
  };

  const addTemplate = () => {
    const newId = `custom_${Date.now()}`;
    setTemplates(prev => [...prev, { id: newId, label: "Новий шаблон", sections: ["## Заголовок", ":::intro — Вступ", ":::conclusion — Висновок"] }]);
    setActiveTemplate(newId);
  };

  const deleteTemplate = (id: string) => {
    if (Object.keys(defaultTemplateSections).includes(id)) {
      toast.error("Не можна видалити базовий шаблон");
      return;
    }
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (activeTemplate === id) setActiveTemplate(templates[0]?.id || "news");
    toast.success("Шаблон видалено");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Шаблони публікацій</h3>
            <p className="text-xs text-muted-foreground">Структура секцій для кожного типу контенту</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={addTemplate} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Додати шаблон
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit">
          <CardContent className="p-2 space-y-0.5">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group",
                  activeTemplate === t.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                )}
              >
                <span className="truncate">{t.label}</span>
                <Badge variant="secondary" className="text-xs ml-2 shrink-0">{t.sections.length}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {current && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm">{current.label}</CardTitle>
                  <CardDescription className="text-xs">{current.sections.length} секцій</CardDescription>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" onClick={duplicateTemplate} className="gap-1 h-7 text-xs">
                    <Copy className="h-3 w-3" /> Копіювати
                  </Button>
                  {!Object.keys(defaultTemplateSections).includes(current.id) && (
                    <Button size="sm" variant="ghost" onClick={() => deleteTemplate(current.id)} className="gap-1 h-7 text-xs text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" /> Видалити
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!Object.keys(defaultTemplateSections).includes(current.id) && (
                <div>
                  <Label className="text-xs text-muted-foreground">Назва шаблону</Label>
                  <Input
                    value={current.label}
                    onChange={(e) => setTemplates(prev => prev.map(t => t.id === current.id ? { ...t, label: e.target.value } : t))}
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              )}

              <div className="space-y-1">
                {current.sections.map((section, si) => (
                  <div key={si} className="flex items-center gap-2 group">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    <span className="text-muted-foreground w-5 text-right text-xs shrink-0">{si + 1}.</span>
                    <code className="bg-muted/30 px-2 py-1.5 rounded border border-border/50 text-xs flex-1">{section}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => removeSection(si)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/50">
                <Input
                  value={newSectionText}
                  onChange={(e) => setNewSectionText(e.target.value)}
                  placeholder="## Нова секція або :::container — Опис"
                  className="h-8 text-xs flex-1"
                  onKeyDown={(e) => e.key === "Enter" && addSection()}
                />
                <Button size="sm" variant="outline" onClick={addSection} className="h-8 gap-1 text-xs" disabled={!newSectionText.trim()}>
                  <Plus className="h-3 w-3" /> Додати
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Autonomy Tab — Step 2: receives autonomyDetails as props (persisted)
// ═════════════════════════════════════════════════════════════

function AutonomyTab({
  frequency, setFrequency, articlesPerBatch, setArticlesPerBatch,
  autoLaunch, setAutoLaunch, autonomyLevel, setAutonomyLevel,
  autonomyDetails, setAutonomyDetails,
}: {
  frequency: string;
  setFrequency: React.Dispatch<React.SetStateAction<string>>;
  articlesPerBatch: string;
  setArticlesPerBatch: React.Dispatch<React.SetStateAction<string>>;
  autoLaunch: boolean;
  setAutoLaunch: React.Dispatch<React.SetStateAction<boolean>>;
  autonomyLevel: string;
  setAutonomyLevel: React.Dispatch<React.SetStateAction<string>>;
  autonomyDetails: AutonomyDetailSettings;
  setAutonomyDetails: React.Dispatch<React.SetStateAction<AutonomyDetailSettings>>;
}) {
  const pipelineSteps = [
    { label: "Збір ідей", key: "ideas" },
    { label: "Генерація статті", key: "generate" },
    { label: "Верифікація (факт.)", key: "verify" },
    { label: "Модерація", key: "moderate" },
    { label: "Публікація", key: "publish" },
  ];

  const autoSteps: Record<string, string[]> = {
    ideas: ["ideas"],
    generate: ["ideas", "generate", "verify"],
    autopilot: ["ideas", "generate", "verify", "moderate", "publish"],
  };

  const levels = [
    { id: "ideas", label: "Тільки ідеї", icon: "💡", comingSoon: false },
    { id: "generate", label: "Генерація + модерація", icon: "⚙️", comingSoon: false },
    { id: "autopilot", label: "Повний автопілот", icon: "🚀", comingSoon: true },
  ];

  const updateDetail = <K extends keyof AutonomyDetailSettings>(key: K, value: AutonomyDetailSettings[K]) => {
    setAutonomyDetails(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Автономність</h3>
          <p className="text-xs text-muted-foreground">Оберіть рівень автономності AI та налаштуйте деталі</p>
        </div>
      </div>

      <div className="grid gap-3">
        {levels.map(level => {
          const isActive = autonomyLevel === level.id;
          const currentAutoSteps = autoSteps[level.id] || [];
          return (
            <Card
              key={level.id}
              className={cn(
                "transition-all",
                isActive ? "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20" : "hover:border-border/80",
                level.comingSoon && "opacity-60"
              )}
            >
              <CardContent
                className={cn("py-4 cursor-pointer", level.comingSoon && "cursor-not-allowed")}
                onClick={() => !level.comingSoon && setAutonomyLevel(level.id)}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{level.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{level.label}</p>
                      {level.comingSoon && <Badge variant="outline" className="text-xs">Coming Soon</Badge>}
                    </div>
                  </div>
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                    isActive ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )}>
                    {isActive && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </div>
              </CardContent>

              {isActive && (
                <div className="px-6 pb-5 space-y-4 border-t border-border/50 pt-4">
                  {/* Pipeline stepper */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Етапи pipeline</p>
                    <div className="space-y-1">
                      {pipelineSteps.map((step, i) => {
                        const isAuto = currentAutoSteps.includes(step.key);
                        return (
                          <div key={step.key} className="flex items-center gap-2.5">
                            <div className="flex flex-col items-center w-5">
                              <div className={cn(
                                "h-4 w-4 rounded-full flex items-center justify-center text-[10px]",
                                isAuto ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              )}>
                                {isAuto ? "✓" : (i + 1)}
                              </div>
                              {i < pipelineSteps.length - 1 && (
                                <div className={cn("w-0.5 h-3", isAuto ? "bg-primary/40" : "bg-border")} />
                              )}
                            </div>
                            <span className="text-sm">{step.label}</span>
                            <span className={cn(
                              "text-xs ml-auto",
                              isAuto ? "text-primary font-medium" : "text-muted-foreground"
                            )}>
                              {isAuto ? "автоматично" : "вручну"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Level-specific settings */}
                  {level.id === "ideas" && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Ідей на день</Label>
                        <Select value={autonomyDetails.ideasPerDay} onValueChange={(v) => updateDetail("ideasPerDay", v)}>
                          <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Джерела ідей</p>
                        <div className="space-y-1.5">
                          {([
                            { key: "trends" as const, label: "Тренди та новини" },
                            { key: "competitors" as const, label: "Аналіз конкурентів" },
                            { key: "userQueries" as const, label: "Запити користувачів" },
                          ]).map(s => (
                            <div key={s.key} className="flex items-center gap-2">
                              <Checkbox
                                checked={autonomyDetails.ideaSources[s.key]}
                                onCheckedChange={(v) => updateDetail("ideaSources", { ...autonomyDetails.ideaSources, [s.key]: !!v })}
                              />
                              <span className="text-sm">{s.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {level.id === "generate" && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Мін. поріг верифікації</Label>
                          <span className="text-xs font-semibold text-primary">{autonomyDetails.verifyThreshold[0]}%</span>
                        </div>
                        <Slider value={autonomyDetails.verifyThreshold} onValueChange={(v) => updateDetail("verifyThreshold", [Math.max(v[0], autonomyDetails.rejectThreshold[0])])} min={60} max={100} step={5} className="mt-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Автовідхилення нижче</Label>
                          <span className="text-xs font-semibold text-destructive">{autonomyDetails.rejectThreshold[0]}%</span>
                        </div>
                        <Slider value={autonomyDetails.rejectThreshold} onValueChange={(v) => updateDetail("rejectThreshold", [Math.min(v[0], autonomyDetails.verifyThreshold[0])])} min={30} max={80} step={5} className="mt-2" />
                      </div>
                      <p className="text-[11px] text-muted-foreground italic">Поріг відхилення не може перевищувати поріг верифікації</p>
                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs text-muted-foreground font-medium">Сповіщення</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email коли контент готовий до модерації</span>
                          <Switch checked={autonomyDetails.notifyReady} onCheckedChange={(v) => updateDetail("notifyReady", v)} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Щоденний дайджест створеного</span>
                          <Switch checked={autonomyDetails.notifyDigest} onCheckedChange={(v) => updateDetail("notifyDigest", v)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {level.id === "autopilot" && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Поріг автозатвердження</Label>
                          <span className="text-xs font-semibold text-primary">{autonomyDetails.autoApproveThreshold[0]}%</span>
                        </div>
                        <Slider value={autonomyDetails.autoApproveThreshold} onValueChange={(v) => updateDetail("autoApproveThreshold", v)} min={80} max={100} step={1} className="mt-2" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Ліміт публікацій на день</Label>
                        <Select value={autonomyDetails.dailyPubLimit} onValueChange={(v) => updateDetail("dailyPubLimit", v)}>
                          <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                        Fallback: якщо контент нижче порогу {autonomyDetails.autoApproveThreshold[0]}% — автоматично надсилається на ручну модерацію.
                      </div>
                    </div>
                  )}

                  {/* Schedule integrated into level card */}
                  <div className="border-t border-border/50 pt-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Розклад:</span>
                        <Select value={frequency} onValueChange={setFrequency}>
                          <SelectTrigger className="h-7 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Щодня</SelectItem>
                            <SelectItem value="weekly">Щотижня</SelectItem>
                            <SelectItem value="manual">Вручну</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Батч:</span>
                        <Select value={articlesPerBatch} onValueChange={setArticlesPerBatch}>
                          <SelectTrigger className="h-7 w-[60px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-xs text-muted-foreground">Автозапуск</span>
                        <Switch checked={autoLaunch} onCheckedChange={setAutoLaunch} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// AI & Credits — Unified Tab
// ═════════════════════════════════════════════════════════════

function AIAndCreditsTab({
  aiSettings, setAISettings, creditLimits, setCreditLimits,
}: {
  aiSettings: AISettings;
  setAISettings: React.Dispatch<React.SetStateAction<AISettings>>;
  creditLimits: CreditLimits;
  setCreditLimits: React.Dispatch<React.SetStateAction<CreditLimits>>;
}) {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [batchSize, setBatchSize] = useState(3);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      const model = allAiModels.find(m => m.value === aiSettings.generationModel);
      setTestResult(`✅ З'єднання успішне. Модель: ${model?.label || aiSettings.generationModel}. Відповідь: ${model?.avgResponseTime || "2.5с"}.`);
    }, 1500);
  };

  const selectedGenModel = allAiModels.find(m => m.value === aiSettings.generationModel);
  const selectedVerModel = allAiModels.find(m => m.value === aiSettings.verificationModel);
  const selectedLength = lengthPresets.find(p => p.value === aiSettings.lengthPreset) || lengthPresets[1];
  const temperatureLabel = aiSettings.temperature[0] <= 0.3 ? "📋 Точний" : aiSettings.temperature[0] <= 0.7 ? "✨ Збалансований" : "🎨 Креативний";

  // Cost calculations — dynamic based on model + length
  const costPerArticle = calcCostPerArticle(selectedGenModel?.costPerKTokens || 1.0, selectedLength.tokens);
  const verCostPerArticle = calcVerCost(selectedVerModel?.costPerKTokens || 0.5);
  const genCost = costPerArticle * batchSize;
  const verCost = verCostPerArticle * batchSize;
  const totalBatchCost = genCost + verCost;

  // Credit data
  const CREDIT_RATE = 11_000; // credits per 1 UAH
  const planName = demoUserSubscription.planName;
  const totalMonthly = demoUserSubscription.periodCredits;
  const balance = demoUserSubscription.currentBalance;
  const nextBillingDate = demoUserSubscription.nextBillingDate.split("-").reverse().join(".");
  const percentRemaining = Math.round((balance / totalMonthly) * 100);

  // Monthly forecast based on planner inputs
  const monitoringPerDay = 3; // approximate analysis/monitoring credits
  const dailyCost = genCost + verCost + monitoringPerDay;
  const monthlyCost = dailyCost * 30;
  const surplusCredits = monthlyCost - totalMonthly;
  const surplusUah = surplusCredits > 0 ? Math.ceil(surplusCredits / CREDIT_RATE) : 0;
  const fitsInTariff = surplusCredits <= 0;
  const maxArticlesInTariff = totalBatchCost > 0
    ? Math.floor((totalMonthly / 30 - monitoringPerDay) / (costPerArticle + verCostPerArticle))
    : 99;

  // Forecast
  const totalWeekUsage = mockDailyUsage.reduce((s, d) => s + d.credits, 0);
  const avgDaily = Math.round(totalWeekUsage / 7);
  const daysRemaining = avgDaily > 0 ? Math.floor(balance / avgDaily) : 99;
  const forecastStatus = daysRemaining < 7 ? "critical" : daysRemaining < 14 ? "warning" : "sufficient";

  // Limits
  const todayUsed = 12;
  const weekUsed = totalWeekUsage;
  const dailyLimitNum = parseInt(creditLimits.dailyLimit) || 50;
  const weeklyLimitNum = parseInt(creditLimits.weeklyLimit) || 250;

  const historyEntries = showAllHistory ? mockCreditHistory : mockCreditHistory.slice(0, 5);
  const getRelativeDate = (dateStr: string) => {
    const today = "2026-04-15";
    const yesterday = "2026-04-14";
    if (dateStr === today) return "Сьогодні";
    if (dateStr === yesterday) return "Вчора";
    const d = new Date(dateStr);
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  const historyIcon = (type: string) => {
    switch (type) {
      case "generation": return <Sparkles className="h-3.5 w-3.5 text-primary" />;
      case "verification": return <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />;
      case "analysis": return <Search className="h-3.5 w-3.5 text-amber-500" />;
      case "topup": return <Plus className="h-3.5 w-3.5 text-emerald-500" />;
      default: return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Budget Planner (replaces old Balance + Calculator) ── */}
      <Card className="border-primary/30 bg-primary/[0.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Планувальник бюджету
          </CardTitle>
          <CardDescription className="text-xs">Розрахуйте місячну вартість автогенерації та порівняйте з тарифом</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inputs row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Статей на день</Label>
              <Input
                type="number" min={1} max={20} value={batchSize}
                onChange={e => setBatchSize(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="h-8 text-sm text-center"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Довжина</Label>
              <Select value={aiSettings.lengthPreset} onValueChange={v => setAISettings(prev => ({ ...prev, lengthPreset: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{lengthPresets.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Модель</Label>
              <Select value={aiSettings.generationModel} onValueChange={v => setAISettings(prev => ({ ...prev, generationModel: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allAiModels.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Верифікація</Label>
              <div className="flex items-center gap-2 h-8">
                <Switch checked={aiSettings.verificationModel !== ""} onCheckedChange={() => {}} disabled />
                <span className="text-xs text-muted-foreground">Увімк.</span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Генерація: {batchSize} × {costPerArticle} кр</span>
              <span className="font-medium tabular-nums">{genCost} кр/день</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Верифікація: {batchSize} × {verCostPerArticle} кр</span>
              <span className="font-medium tabular-nums">{verCost} кр/день</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Моніторинг джерел</span>
              <span className="font-medium tabular-nums">~{monitoringPerDay} кр/день</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-semibold">
              <span>Разом</span>
              <span className="tabular-nums">~{dailyCost} кр/день → ~{monthlyCost} кр/міс</span>
            </div>
          </div>

          {/* Tariff comparison */}
          <div className={cn(
            "p-3 rounded-lg flex items-start gap-3",
            fitsInTariff ? "bg-emerald-500/10" : "bg-amber-500/10"
          )}>
            {fitsInTariff ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {fitsInTariff
                  ? `Вкладаєтесь у тариф «${planName}» (${totalMonthly} кр/міс)`
                  : `Перевищення тарифу «${planName}» на ~${surplusCredits} кр`
                }
              </p>
              {!fitsInTariff && (
                <p className="text-xs text-muted-foreground">
                  Доплата: ~{surplusUah} грн/міс • Або зменште до {maxArticlesInTariff} стат/день — вкладетесь у тариф
                </p>
              )}
              {fitsInTariff && (
                <p className="text-xs text-muted-foreground">
                  Залишок: ~{totalMonthly - monthlyCost} кр/міс • Наступне оновлення: {nextBillingDate}
                </p>
              )}
            </div>
          </div>

          {/* Balance bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help underline decoration-dotted text-muted-foreground">
                      Залишок: <span className="font-semibold text-foreground">{balance.toLocaleString()}</span> / {totalMonthly.toLocaleString()} кр
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs space-y-1">
                    <p className="font-semibold">Що таке кредит?</p>
                    <p>Кредит — одиниця обліку AI-запитів. Тариф «{planName}» включає {totalMonthly} кр/міс.</p>
                    <p>Додаткові кредити купуються через «Поповнити баланс» (1 грн ≈ {CREDIT_RATE.toLocaleString()} кр).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Badge variant="secondary" className="text-xs font-semibold">{planName}</Badge>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  forecastStatus === "critical" ? "bg-destructive" : forecastStatus === "warning" ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${percentRemaining}%` }}
              />
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button className="h-8 gap-2" size="sm" onClick={() => { window.location.href = "/admin/top-up"; }}>
              <Plus className="h-4 w-4" />
              Поповнити баланс
            </Button>
            <Button variant="outline" className="h-8 gap-2" size="sm" onClick={() => { window.location.href = "/dashboard?tab=user-settings&subtab=tariff&section=tariffs"; }}>
              <ArrowRight className="h-4 w-4" />
              Змінити тариф
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Model selection ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Моделі AI
          </CardTitle>
          <CardDescription className="text-xs">Генерація: {selectedGenModel?.label} (~{costPerArticle} кр/стат) • Верифікація: {selectedVerModel?.label} (~{verCostPerArticle} кр)</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-3 gap-3">
            {aiModelTiers.map(tier => (
              <div key={tier.tier} className="space-y-2">
                <div className="text-center space-y-1">
                  <Badge className={cn("text-[10px] font-semibold", tier.badgeColor)}>{tier.label}</Badge>
                  <p className="text-[10px] text-muted-foreground">{tier.description}</p>
                </div>
                {tier.models.map(m => {
                  const isSelected = aiSettings.generationModel === m.value;
                  const mCost = calcCostPerArticle(m.costPerKTokens, selectedLength.tokens);
                  return (
                    <button
                      key={m.value}
                      onClick={() => setAISettings(prev => ({ ...prev, generationModel: m.value }))}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        isSelected ? `${tier.borderColor} ${tier.bgColor} ring-1 ring-offset-0` : "border-border hover:bg-muted/50"
                      )}
                    >
                      <p className="text-sm font-semibold">{m.label}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground tabular-nums cursor-help underline decoration-dotted">~{mCost} кр/стат</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            <p>Скільки кредитів витрачається на генерацію однієї статті ({selectedLength.words}) обраною моделлю</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Zap className="h-3 w-3" />{m.avgResponseTime}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="mt-1.5 flex justify-center">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          </TooltipProvider>
          {/* Verification model — compact */}
          <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Модель верифікації</p>
                <p className="text-[10px] text-muted-foreground">Рекомендуємо дешевшу модель</p>
              </div>
            </div>
            <Select value={aiSettings.verificationModel} onValueChange={v => setAISettings(prev => ({ ...prev, verificationModel: v }))}>
              <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {aiModelTiers.map(tier => (
                  <div key={tier.tier}>
                    <p className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{tier.label}</p>
                    {tier.models.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label} (~{calcVerCost(m.costPerKTokens)} кр)</SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Parameters ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Параметри
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Креативність</Label>
              <span className="text-xs font-medium text-muted-foreground">{temperatureLabel} ({aiSettings.temperature[0].toFixed(1)})</span>
            </div>
            <Slider
              value={aiSettings.temperature}
              onValueChange={v => setAISettings(prev => ({ ...prev, temperature: v }))}
              min={0} max={1} step={0.1}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>📋 Точний</span><span>✨ Збалансований</span><span>🎨 Креативний</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Budget Protection (limits + alerts) ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Захист бюджету
          </CardTitle>
          <CardDescription className="text-xs">Ліміти запобігають випадковому вичерпанню балансу</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Денний ліміт</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">Сьогодні: {todayUsed}/{dailyLimitNum}</span>
                <Select value={creditLimits.dailyLimit} onValueChange={v => setCreditLimits(prev => ({ ...prev, dailyLimit: v }))}>
                  <SelectTrigger className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{limitPresets.map(p => <SelectItem key={p} value={p}>{p} кр</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${Math.min((todayUsed / dailyLimitNum) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Тижневий ліміт</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">{weekUsed}/{weeklyLimitNum}</span>
                <Select value={creditLimits.weeklyLimit} onValueChange={v => setCreditLimits(prev => ({ ...prev, weeklyLimit: v }))}>
                  <SelectTrigger className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{limitPresets.map(p => <SelectItem key={p} value={p}>{p} кр</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", weekUsed / weeklyLimitNum > 0.9 ? "bg-destructive" : "bg-primary/60")} style={{ width: `${Math.min((weekUsed / weeklyLimitNum) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm">⏸ Пауза при досягненні ліміту</span>
              <Switch checked={creditLimits.pauseOnLimit} onCheckedChange={v => setCreditLimits(prev => ({ ...prev, pauseOnLimit: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">📧 Сповіщення при залишку</span>
                <Select value={creditLimits.alertThreshold} onValueChange={v => setCreditLimits(prev => ({ ...prev, alertThreshold: v }))}>
                  <SelectTrigger className="h-6 w-[72px] text-[10px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{alertPresets.map(p => <SelectItem key={p} value={p}>&lt;{p} кр</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Switch checked={creditLimits.emailAlert} onCheckedChange={v => setCreditLimits(prev => ({ ...prev, emailAlert: v }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 5. System prompt ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            Додаткові інструкції
          </CardTitle>
          <CardDescription className="text-xs">Буде додано до базового промпту для всіх запитів</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={aiSettings.systemPromptOverride}
            onChange={e => { if (e.target.value.length <= 2000) setAISettings(prev => ({ ...prev, systemPromptOverride: e.target.value })); }}
            rows={3} maxLength={2000}
            placeholder="Приклад: Завжди додавай посилання на актуальні нормативні акти. Відповідай українською мовою."
            className="text-sm"
          />
          <p className="text-[10px] text-muted-foreground text-right mt-1">{aiSettings.systemPromptOverride.length}/2000 символів</p>
        </CardContent>
      </Card>

      {/* ── Test connection ── */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Перевірити налаштування</span>
              <Badge variant="outline" className="text-[9px] ml-1">Demo</Badge>
            </div>
            <Button onClick={handleTest} disabled={testing} variant="outline" size="sm" className="gap-1.5">
              {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {testing ? "Перевірка..." : "Перевірити"}
            </Button>
          </div>
          {testResult && <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 mt-3">{testResult}</p>}
        </CardContent>
      </Card>

      {/* ── 6. Transaction history ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Історія витрат
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {historyEntries.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums w-16">{getRelativeDate(h.date)}</span>
                  {historyIcon(h.type)}
                  <span className="text-sm">{h.operation}</span>
                </div>
                <span className={cn("text-sm font-semibold tabular-nums", h.credits > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>
                  {h.credits > 0 ? "+" : ""}{h.credits} кр
                </span>
              </div>
            ))}
          </div>
          {!showAllHistory && mockCreditHistory.length > 5 && (
            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setShowAllHistory(true)}>
              Показати більше
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Main Page — Steps 2-4: lifted state, full persistence
// ═════════════════════════════════════════════════════════════

const defaultAutonomyDetails: AutonomyDetailSettings = {
  ideasPerDay: "10",
  ideaSources: { trends: true, competitors: true, userQueries: true },
  verifyThreshold: [85],
  rejectThreshold: [60],
  notifyReady: true,
  notifyDigest: true,
  autoApproveThreshold: [90],
  dailyPubLimit: "5",
};

import { AUTHORS, type Author } from "@/portal/data/authors";

function AuthorsTab() {
  const [authors, setAuthors] = useState<Author[]>(() => [...AUTHORS]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" /> Автори порталу
        </CardTitle>
        <CardDescription>Управління авторами контенту ({authors.length} записів)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {authors.map((author) => (
            <div key={author.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                {author.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{author.name}</p>
                <p className="text-xs text-muted-foreground">{author.title}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{author.yearsExperience} р. досвіду</span>
                <span>{author.articlesCount} статей</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Для додавання авторів відредагуйте файл <code className="bg-muted px-1 rounded">src/portal/data/authors.ts</code>
        </p>
      </CardContent>
    </Card>
  );
}

export default function EditorialSettingsAdmin() {
  const [activeTab, setActiveTab] = useState("sources");
  const [saving, setSaving] = useState(false);

  // Settings state
  const [types, setTypes] = useState(initialContentTypeConfigs);
  const [sources, setSources] = useState<DataSource[]>(initialDataSources);
  const [model, setModel] = useState("gemini-flash");
  const [frequency, setFrequency] = useState("daily");
  const [articlesPerBatch, setArticlesPerBatch] = useState("3");
  const [tone, setTone] = useState("professional");
  const [autoLaunch, setAutoLaunch] = useState(true);
  const [autonomyLevel, setAutonomyLevel] = useState("generate");
  const [brandVoice, setBrandVoice] = useState(
    "FINTODO — це український фінансовий портал для підприємців, бухгалтерів та фізичних осіб. Тон: професійний але доступний. Уникаємо канцеляриту. Даємо конкретні цифри та посилання на нормативні акти."
  );
  const [guardrails, setGuardrails] = useState("Заборонені теми: політика, релігія. Обов'язково: перевіряти актуальність даних, посилатися на офіційні джерела (ДПС, НБУ, ВРУ).");

  // Step 5: verification — no thresholds, only checks + model
  const [verificationSettings, setVerificationSettings] = useState<AIVerificationSettings>({
    checks: { brandVoice: true, uniqueness: true, facts: true, seo: true, structure: true },
    verificationModel: "gemini-pro",
  });

  // Step 3: brandDo/brandDont lifted to main component
  const [brandDo, setBrandDo] = useState("Конкретні суми та дати\nПосилання на закони\nПрактичні приклади\nСтруктуровані блоки :::container");
  const [brandDont, setBrandDont] = useState("Загальні фрази без конкретики\nЖаргон без пояснення\nПолітичні оцінки\nНеперевірені факти");
  const [contentPlanSettings, setContentPlanSettings] = useState<ContentPlanSettings>(defaultContentPlanSettings);

  // Step 2: autonomy details lifted to main component
  const [autonomyDetails, setAutonomyDetails] = useState<AutonomyDetailSettings>(defaultAutonomyDetails);

  // AI settings & credit limits
  const [aiSettings, setAISettings] = useState<AISettings>(defaultAISettings);
  const [creditLimits, setCreditLimits] = useState<CreditLimits>(defaultCreditLimits);

  // Step 7: Templates with fallback labels
  const [templates, setTemplates] = useState<TemplateConfig[]>(() =>
    Object.entries(defaultTemplateSections).map(([id, sections]) => ({
      id,
      label: initialContentTypeConfigs.find(c => c.id === id)?.label || templateLabelFallback[id] || id,
      sections: [...sections],
    }))
  );

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fintodo_autocontent_settings");
      if (!saved) return;
      const s = JSON.parse(saved);
      if (s.brandVoice) setBrandVoice(s.brandVoice);
      if (s.tone) setTone(s.tone);
      if (s.model) setModel(s.model);
      if (s.frequency) setFrequency(s.frequency);
      if (s.articlesPerBatch) setArticlesPerBatch(s.articlesPerBatch);
      if (s.autoLaunch !== undefined) setAutoLaunch(s.autoLaunch);
      if (s.guardrails) setGuardrails(s.guardrails);
      if (s.autonomyLevel) setAutonomyLevel(s.autonomyLevel);
      if (s.verificationSettings) setVerificationSettings(s.verificationSettings);
      if (s.brandDo) setBrandDo(s.brandDo);
      if (s.brandDont) setBrandDont(s.brandDont);
      if (s.autonomyDetails) setAutonomyDetails(s.autonomyDetails);
      if (s.aiSettings) setAISettings(s.aiSettings);
      if (s.creditLimits) setCreditLimits(s.creditLimits);
      if (s.types) {
        setTypes(prev => prev.map(t => {
          const sv = s.types.find((st: any) => st.id === t.id);
          return sv ? { ...t, enabled: sv.enabled, prompt: sv.prompt, audience: sv.audience } : t;
        }));
      }
      // Step 4: restore sources — merge base + custom
      if (s.sources) {
        setSources(prev => {
          const baseMerged = prev.map(src => {
            const sv = s.sources.find((ss: any) => ss.id === src.id);
            return sv ? { ...src, enabled: sv.enabled } : src;
          });
          // Add custom sources from saved data
          const customSources = s.sources
            .filter((ss: any) => ss.isCustom)
            .map((ss: any) => ({ ...ss, icon: Globe }));
          return [...baseMerged, ...customSources];
        });
      }
      if (s.templates) setTemplates(s.templates);
    } catch { /* ignore */ }
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      const settings = {
        brandVoice, tone, model, frequency, articlesPerBatch, autoLaunch, guardrails, autonomyLevel,
        brandDo, brandDont,
        autonomyDetails,
        aiSettings, creditLimits,
        types: types.map(t => ({ id: t.id, enabled: t.enabled, prompt: t.prompt, audience: t.audience })),
        // Step 4: save custom sources fully, base sources as id+enabled
        sources: sources.map(s => s.isCustom
          ? { id: s.id, label: s.label, url: s.url, type: s.type, description: s.description, frequency: s.frequency, isCustom: true, enabled: s.enabled }
          : { id: s.id, enabled: s.enabled }
        ),
        verificationSettings,
        templates: templates.map(t => ({ id: t.id, label: t.label, sections: t.sections })),
      };
      localStorage.setItem("fintodo_autocontent_settings", JSON.stringify(settings));
    } catch (e) { /* ignore */ }
    setTimeout(() => { setSaving(false); toast.success("Налаштування збережено"); }, 300);
  };

  return (
    <div className="space-y-0">
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Налаштування редакції
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Конфігурація джерел, генерації, шаблонів, автономності та AI-витрат</p>
      </div>

      <SubtabShelf
        tabs={subtabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        entityStyle={{ pillActiveClass: "bg-primary/10 text-primary ring-primary/30", color: "text-primary" }}
      />

      <div className="p-6">
        {activeTab === "sources" && (
          <SourcesTab
            sources={sources} setSources={setSources}
          />
        )}
        {activeTab === "generation" && (
          <GenerationTab
            types={types} setTypes={setTypes}
            model={model} setModel={setModel}
            tone={tone} setTone={setTone}
            brandVoice={brandVoice} setBrandVoice={setBrandVoice}
            verificationSettings={verificationSettings} setVerificationSettings={setVerificationSettings}
            guardrails={guardrails} setGuardrails={setGuardrails}
            brandDo={brandDo} setBrandDo={setBrandDo}
            brandDont={brandDont} setBrandDont={setBrandDont}
            contentPlanSettings={contentPlanSettings} setContentPlanSettings={setContentPlanSettings}
          />
        )}
        {activeTab === "templates" && (
          <TemplatesTab templates={templates} setTemplates={setTemplates} />
        )}
        {activeTab === "autonomy" && (
          <AutonomyTab
            frequency={frequency} setFrequency={setFrequency}
            articlesPerBatch={articlesPerBatch} setArticlesPerBatch={setArticlesPerBatch}
            autoLaunch={autoLaunch} setAutoLaunch={setAutoLaunch}
            autonomyLevel={autonomyLevel} setAutonomyLevel={setAutonomyLevel}
            autonomyDetails={autonomyDetails} setAutonomyDetails={setAutonomyDetails}
          />
        )}

        {activeTab === "ai-credits" && (
          <AIAndCreditsTab aiSettings={aiSettings} setAISettings={setAISettings} creditLimits={creditLimits} setCreditLimits={setCreditLimits} />
        )}

        {activeTab === "authors" && (
          <AuthorsTab />
        )}

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border py-3 mt-6 -mx-6 px-6 flex items-center justify-end">
          <Button className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Збереження..." : "Зберегти налаштування"}
          </Button>
        </div>
      </div>
    </div>
  );
}
