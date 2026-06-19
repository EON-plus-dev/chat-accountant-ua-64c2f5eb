import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/admin/utils/generateSeo";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { SubtabShelf } from "@/components/ui/SubtabShelf";
import {
  Settings, FileCheck, Rocket, Sparkles, Newspaper, BookOpen, ClipboardList,
  CalendarDays, Eye, RotateCcw, Check, X, Clock, Send, ToggleLeft, ToggleRight,
  BarChart3, ListTodo, PenLine, Shield, Lightbulb, Target, Tag, Users,
  FileText, Globe, Star, TrendingUp, CheckCircle2, AlertTriangle, Hash,
  ChevronDown, ChevronRight, ChevronLeft, Save, Loader2, Info, Plus, Database, Zap,
  ArrowRight, Play, Pause, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addWeeks, startOfWeek, addDays, format, isSameDay, isWithinInterval, endOfDay } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import MarkdownToolbar from "@/admin/components/MarkdownToolbar";
import { renderMarkdown } from "@/lib/markdownRenderer";
import { toast } from "sonner";

// ─── Shared constants ───
const articleTypes = [
  { id: "news", label: "Новини", icon: Newspaper },
  { id: "guide", label: "Гайди", icon: BookOpen },
  { id: "analysis", label: "Аналітика", icon: TrendingUp },
  { id: "review", label: "Огляди", icon: ClipboardList },
  { id: "digest", label: "Дайджест", icon: CalendarDays },
  { id: "dps", label: "ДПС", icon: FileText },
  { id: "change", label: "Зміни", icon: RotateCcw },
  { id: "podcast", label: "Подкасти", icon: Newspaper },
  { id: "video", label: "Відео", icon: FileText },
  { id: "consultation", label: "Консультації", icon: ClipboardList },
];

const audiences = ["fop", "accountant", "director", "personal"];
const hubs = ["taxes", "fop", "accounting", "personal", "law", "wartime"];

const typeLabels: Record<string, string> = {
  news: "Новини", guide: "Гайди", review: "Огляди", digest: "Дайджест",
  analysis: "Аналітика", dps: "ДПС", change: "Зміни",
  podcast: "Подкасти", video: "Відео", consultation: "Консультації",
};
const audienceLabels: Record<string, string> = {
  fop: "ФОП", accountant: "Бухгалтер", director: "Керівник", personal: "Фізособа",
};
const hubLabels: Record<string, string> = {
  taxes: "Податки", fop: "ФОП", accounting: "Облік", personal: "Фізособи", law: "Право", wartime: "Воєнний час",
};

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  reviewed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  idea: "bg-muted text-muted-foreground",
  generating: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const subtabs = [
  { id: "plan", label: "Контент-план", icon: ListTodo },
  { id: "moderation", label: "Модерація", icon: FileCheck },
  { id: "publication", label: "Публікація", icon: Rocket },
  { id: "analytics", label: "Аналітика", icon: BarChart3 },
];

// ─── Types & initial data ───

interface ContentTypeConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  prompt: string;
  audience: string;
}

interface DataSource {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  description: string;
}

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
  { id: "laws", label: "Законодавство (ДПС, НБУ, ВРУ)", icon: FileText, enabled: true, description: "tax.gov.ua, rada.gov.ua — нормативні акти" },
  { id: "finance", label: "Фінансові дані", icon: TrendingUp, enabled: true, description: "minfin.gov.ua — курси, ставки, індекси" },
  { id: "trends", label: "Тренди ринку", icon: BarChart3, enabled: false, description: "Аналітика та прогнози" },
  { id: "kved", label: "КВЕД / класифікатори", icon: Hash, enabled: false, description: "Коди діяльності, довідники" },
  { id: "grants", label: "Гранти та програми", icon: Star, enabled: true, description: "Державні програми підтримки" },
];

const templateSections: Record<string, string[]> = {
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

interface PlanItem {
  id: number;
  topic: string;
  type: string;
  audience: string;
  hub: string;
  keywords: string[];
  status: "idea" | "generating";
  source?: string;
  sourceUrl?: string;
  sourceDate?: string;
  description?: string;
  progress?: number;
  // AI confidence & source
  aiConfidence?: number;       // 0-100
  aiSource?: "auto" | "manual"; // auto = AI monitoring, manual = user-added
  // Idea argumentation
  uniquenessNote?: string;
  targetAudienceNote?: string;
  expectedImpact?: string;
  reasoning?: string;
  estimatedReadTime?: number;
  contentGap?: string;
}

type ModerationStatus = "draft" | "reviewed" | "rejected";

interface AIVerificationResult {
  status: "pending" | "passed" | "warnings" | "failed";
  brandVoiceScore: number;
  uniquenessScore: number;
  structureScore: number;
  factsScore: number;
  seoScore: number;
  overallScore: number;
  recommendations: string[];
  checkedAt?: string;
  verdict?: string;
  decision?: "approve" | "revise" | "reject";
}

interface AIVerificationSettings {
  autoVerify: boolean;
  autoApproveThreshold: number;
  checks: {
    brandVoice: boolean;
    uniqueness: boolean;
    facts: boolean;
    seo: boolean;
    structure: boolean;
  };
  verificationModel: string;
}

interface MockArticle {
  id: number;
  title: string;
  type: string;
  audience: string;
  hub: string;
  tags: string[];
  tldr: string;
  readingMinutes: number;
  status: ModerationStatus;
  generatedAt: string;
  wordCount: number;
  content: string;
  qualityScore: number;
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
  aiVerification?: AIVerificationResult;
}

// ─── Initial mock data ───

const initialPlanItems: PlanItem[] = [
  { id: 1, topic: "ДПС роз'яснила порядок подачі звіту ЄСВ за Q1 2026", type: "news", audience: "accountant", hub: "taxes", keywords: ["ЄСВ", "звіт", "Q1"], status: "idea", aiConfidence: 92, aiSource: "auto", source: "tax.gov.ua", sourceUrl: "https://tax.gov.ua/media-tsentr/novini/", sourceDate: "29.03.2026", description: "Державна податкова служба опублікувала роз'яснення щодо порядку подачі квартального звіту ЄСВ для ФОП 3 групи.", reasoning: "Дедлайн подачі звіту через 12 днів. Пошуковий попит зростає. Тема висвітлена у 2 конкурентів, але без покрокових інструкцій.", uniquenessNote: "Покроковий алгоритм з урахуванням нових форм 2026", contentGap: "Схожа стаття на порталі — 21 день тому, без оновлених форм", expectedImpact: "Високий", estimatedReadTime: 5 },
  { id: 2, topic: "Законопроєкт №12345: зміни ставок ПДФО з липня 2026", type: "change", audience: "personal", hub: "law", keywords: ["ПДФО", "ставки", "законопроєкт"], status: "idea", aiConfidence: 78, aiSource: "auto", source: "rada.gov.ua", sourceUrl: "https://rada.gov.ua/news/", sourceDate: "28.03.2026", description: "Внесено законопроєкт про зміну ставок ПДФО для доходів понад 20 МЗП.", reasoning: "Ніхто з конкурентів не покрив детально. Потенційно впливає на всіх фізосіб з доходом понад 20 МЗП.", uniquenessNote: "Перший детальний аналіз з калькулятором впливу", contentGap: "Немає на порталі", expectedImpact: "Високий", estimatedReadTime: 7 },
  { id: 3, topic: "Мінфін затвердив нові форми звітності для ФОП", type: "news", audience: "fop", hub: "fop", keywords: ["Мінфін", "звітність", "форми"], status: "idea", aiConfidence: 85, aiSource: "auto", source: "minfin.gov.ua", sourceUrl: "https://minfin.gov.ua/news/", sourceDate: "27.03.2026", description: "Наказ Мінфіну про оновлення форм декларації для спрощеної системи оподаткування.", reasoning: "Нові форми обов'язкові з Q2 2026. 1 конкурент покрив поверхнево, без зразків заповнення.", uniquenessNote: "Зразки заповнення нових форм + порівняння зі старими", contentGap: "Немає на порталі", expectedImpact: "Високий", estimatedReadTime: 6 },
  { id: 4, topic: "Аналіз податкових пільг для IT-сектору", type: "analysis", audience: "accountant", hub: "taxes", keywords: ["IT", "пільги", "Дія Сіті"], status: "idea", aiConfidence: 88, aiSource: "auto", reasoning: "Тема Дія Сіті залишається актуальною через нещодавні зміни в умовах участі. Покриття конкурентів застаріле (2024 рік), що створює вікно для актуального аналізу.", uniquenessNote: "Унікальний кут: порівняння пільг Дія Сіті vs загальна система у 2026", targetAudienceNote: "IT-бухгалтери та CFO перед податковим плануванням Q3", expectedImpact: "Високий", contentGap: "На порталі немає актуального аналізу з урахуванням змін 2026 року", estimatedReadTime: 8 },
  { id: 5, topic: "Покроковий гайд: реєстрація ФОП онлайн", type: "guide", audience: "fop", hub: "fop", keywords: ["реєстрація", "ФОП", "Дія"], status: "idea", aiConfidence: 95, aiSource: "auto", reasoning: "Процедура оновлена з квітня 2026. Конкуренти мають гайди 2024-2025 років — всі застарілі. Пошуковий попит стабільно високий.", uniquenessNote: "Актуальні скріншоти порталу Дія станом на квітень 2026", targetAudienceNote: "Початківці-підприємці, які вперше реєструють ФОП", expectedImpact: "Високий", contentGap: "Існуючі гайди на порталі застаріли (липень 2025)", estimatedReadTime: 12 },
  { id: 6, topic: "Тижневий дайджест: 24-30 березня 2026", type: "digest", audience: "accountant", hub: "accounting", keywords: ["дайджест", "березень"], status: "idea", aiConfidence: 72, aiSource: "auto", reasoning: "Регулярна рубрика з лояльною аудиторією. Остання публікація — 2 тижні тому. Пропуск знижує утримання підписників.", uniquenessNote: "Формат: структурований огляд з посиланнями на першоджерела", targetAudienceNote: "Бухгалтери-підписники щотижневої розсилки", expectedImpact: "Середній", contentGap: "Пропущено 1 випуск — аудиторія очікує регулярність", estimatedReadTime: 5 },
  { id: 7, topic: "Як перейти з загальної на спрощену систему", type: "guide", audience: "fop", hub: "fop", keywords: ["спрощена", "перехід"], status: "idea", aiConfidence: 81, aiSource: "auto", reasoning: "Пік запитів припадає на кінець кварталу, коли ФОП планують перехід. Конкуренти мають статті, але без покрокових інструкцій із зразками заяв.", uniquenessNote: "Включає зразки заяв та калькулятор вигоди переходу", targetAudienceNote: "ФОП на загальній системі з оборотом до 1167 МЗП", expectedImpact: "Середній", contentGap: "Немає гайду з калькулятором вигоди на порталі", estimatedReadTime: 10 },
  { id: 8, topic: "Нові штрафи за неподання звітності", type: "news", audience: "accountant", hub: "taxes", keywords: ["штрафи", "звітність"], status: "generating", progress: 0 },
  { id: 9, topic: "Військовий збір: зміни 2026 року", type: "news", audience: "personal", hub: "wartime", keywords: ["ВЗ", "2026", "зміни"], status: "generating", progress: 0 },
];

const initialModerationArticles: MockArticle[] = [
  {
    id: 101, title: "Нові правила ЄСВ для ФОП у 2026 році", type: "news", audience: "fop", hub: "taxes",
    tags: ["ЄСВ", "ФОП", "2026"], tldr: "З 1 квітня 2026 змінюються правила сплати ЄСВ для ФОП", readingMinutes: 4,
    status: "draft", generatedAt: "2026-03-28 14:30", wordCount: 520, qualityScore: 78,
    content: "## Основні зміни\n\nЗ 1 квітня 2026 року набувають чинності оновлені правила сплати єдиного соціального внеску для фізичних осіб-підприємців.\n\n### Ключові нововведення\n\n- Мінімальний розмір ЄСВ зростає до 1 902,34 ₴\n- Нові терміни подачі звітності\n- Спрощена процедура для 1-ї групи\n\n:::container\n**Важливо**\n\nФОП 1-ї групи звільнені від сплати ЄСВ за умови отримання пенсії.\n:::\n\n## Хто постраждає найбільше\n\nФОП 2-ї та 3-ї групи, які мають найманих працівників.\n\n:::conclusion\n**Висновок**\n\nРекомендуємо переглянути свої зобов'язання до 1 квітня.\n:::"
  },
  {
    id: 102, title: "Як обрати систему оподаткування: покроковий гайд", type: "guide", audience: "fop", hub: "fop",
    tags: ["оподаткування", "спрощена", "загальна"], tldr: "Покроковий гайд вибору між спрощеною та загальною системою", readingMinutes: 8,
    status: "draft", generatedAt: "2026-03-28 12:00", wordCount: 1200, qualityScore: 85,
    content: "## Вступ\n\n:::intro\n**Для кого ця стаття?**\n\nДля підприємців, які реєструють ФОП або хочуть змінити систему оподаткування.\n:::\n\n## Крок 1: Визначте вид діяльності\n\nПерший крок — зрозуміти, які обмеження є для вашого КВЕД.\n\n### Обмеження спрощеної системи\n\n| Група | Ліміт доходу | Кількість працівників |\n|---|---|---|\n| 1 | 1 336 740 ₴ | 0 |\n| 2 | 5 587 800 ₴ | 10 |\n| 3 | 8 381 700 ₴ | без обмежень |\n\n## Крок 2: Порахуйте податкове навантаження\n\n:::container\n**Формула розрахунку**\n\nСпрощена: дохід × ставка ЄП + ЄСВ\nЗагальна: (дохід - витрати) × 18% ПДФО + 1.5% ВЗ + ЄСВ\n:::\n\n## Крок 3: Подайте заяву\n\nЗаява подається через кабінет платника на сайті ДПС.\n\n:::conclusion\n**Висновок**\n\nДля більшості ФОП з невеликими витратами спрощена система вигідніша.\n:::"
  },
  {
    id: 103, title: "Огляд банківських рахунків для ФОП", type: "review", audience: "fop", hub: "fop",
    tags: ["банки", "рахунки", "тарифи"], tldr: "Порівняння тарифів 10 банків для відкриття рахунку ФОП", readingMinutes: 6,
    status: "reviewed", generatedAt: "2026-03-27 16:45", wordCount: 890, qualityScore: 72,
    content: "## Порівняння тарифів\n\nУ цьому огляді ми аналізуємо умови обслуговування рахунків для ФОП у 10 найбільших банках.\n\n| Банк | Відкриття | Обслуговування |\n|---|---|---|\n| ПриватБанк | безкоштовно | 0 ₴/міс |\n| Моно | безкоштовно | 0 ₴/міс |\n| ПУМБ | безкоштовно | 99 ₴/міс |\n\n### Висновки\n\nНайвигідніші умови пропонують ПриватБанк та Monobank."
  },
  {
    id: 104, title: "Військовий збір 2026: що змінилось", type: "news", audience: "personal", hub: "taxes",
    tags: ["ВЗ", "2026", "зміни"], tldr: "Аналіз змін у нарахуванні військового збору з квітня 2026", readingMinutes: 5,
    status: "reviewed", generatedAt: "2026-03-29 10:15", wordCount: 680, qualityScore: 81,
    content: "## Зміни у військовому зборі\n\nЗ квітня 2026 року ставка ВЗ залишається 5%, але змінюється база нарахування.\n\n### Основні зміни\n\n- Розширено перелік доходів\n- Нові правила для ФОП 3 групи\n\n:::conclusion\n**Висновок**\n\nПерерахуйте свої зобовʼязання до 10 квітня.\n:::"
  },
  {
    id: 105, title: "Топ-5 помилок при заповненні декларації", type: "guide", audience: "accountant", hub: "accounting",
    tags: ["декларація", "помилки", "перевірка"], tldr: "Найчастіші помилки бухгалтерів при заповненні декларації ФОП", readingMinutes: 7,
    status: "reviewed", generatedAt: "2026-03-30 09:00", wordCount: 1050, qualityScore: 88,
    content: "## Помилка №1: Неправильний код КВЕД\n\nНайпоширеніша помилка — зазначення неактуального КВЕД.\n\n## Помилка №2: Невірний період\n\nЧасто плутають квартал і рік.\n\n:::conclusion\n**Висновок**\n\nПеревіряйте декларацію за чек-листом перед подачею.\n:::"
  },
];

// ─── Generate content for a plan item via AI ───
function generateFallbackContent(item: PlanItem, brandVoice: string): string {
  return `## ${item.topic}\n\n:::intro\n${item.description || "Огляд актуальної теми для " + (audienceLabels[item.audience] || item.audience)}\n:::\n\n## Основний зміст\n\nДетальний аналіз теми "${item.topic}" для аудиторії ${audienceLabels[item.audience] || item.audience}.\n\n- Ключове слово: ${item.keywords.join(", ")}\n- Хаб: ${hubLabels[item.hub] || item.hub}\n\n:::container\n**Деталі**\n\nКонтент згенеровано AI з урахуванням Brand Voice.\n:::\n\n:::conclusion\n**Висновок**\n\nРекомендуємо ознайомитися з повним текстом та перевірити актуальність даних.\n:::`;
}

async function generateArticleContent(
  item: PlanItem,
  brandVoice: string,
  tone: string,
  guardrails: string,
): Promise<{ content: string; tldr: string; wordCount: number }> {
  try {
    const template = templateSections[item.type] || templateSections["news"];
    const { data, error } = await supabase.functions.invoke("generate-article", {
      body: {
        topic: item.topic, type: item.type, audience: item.audience,
        hub: item.hub, keywords: item.keywords, brandVoice, tone, template, guardrails,
      },
    });
    if (error || !data?.content) {
      if (data?.code === "PAYMENT_REQUIRED") {
        toast.error("AI кредити вичерпано", { description: "Поповніть баланс Lovable Cloud для продовження генерації." });
      }
      console.warn("AI article generation failed, using fallback:", error || data?.error);
      const fallback = generateFallbackContent(item, brandVoice);
      return { content: fallback, tldr: item.description || item.topic, wordCount: fallback.split(/\s+/).length };
    }
    return { content: data.content, tldr: data.tldr, wordCount: data.wordCount };
  } catch (e) {
    console.warn("AI article generation error:", e);
    const fallback = generateFallbackContent(item, brandVoice);
    return { content: fallback, tldr: item.description || item.topic, wordCount: fallback.split(/\s+/).length };
  }
}

async function verifyArticleContent(
  title: string,
  content: string,
  brandVoice: string,
  checks: Record<string, boolean>,
): Promise<AIVerificationResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke("verify-article", {
      body: { title, content, brandVoice, checks },
    });
    if (data?.code === "PAYMENT_REQUIRED") {
      toast.error("AI кредити вичерпано", { description: "Верифікація неможлива — поповніть баланс Lovable Cloud." });
      return null;
    }
    if (error || !data?.overallScore) {
      console.warn("AI verification failed:", error || data?.error);
      return null;
    }
    return {
      status: data.status,
      brandVoiceScore: data.brandVoiceScore ?? 100,
      uniquenessScore: data.uniquenessScore ?? 100,
      structureScore: data.structureScore ?? 100,
      factsScore: data.factsScore ?? 100,
      seoScore: data.seoScore ?? 100,
      overallScore: data.overallScore,
      recommendations: data.recommendations || [],
      checkedAt: data.checkedAt,
      verdict: data.verdict,
      decision: data.decision,
    };
  } catch (e) {
    console.warn("AI verification error:", e);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════
// Content Plan Tab — uses shared sources & settings
// ═════════════════════════════════════════════════════════════

interface ContentPlanTabProps {
  items: PlanItem[];
  setItems: React.Dispatch<React.SetStateAction<PlanItem[]>>;
  sources: DataSource[];
  model: string;
  enabledSourcesCount: number;
}

function ContentPlanTab({ items, setItems, sources, model, enabledSourcesCount }: ContentPlanTabProps) {
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [checkFrequency, setCheckFrequency] = useState("6");
  const [newIdea, setNewIdea] = useState({ topic: "", description: "", type: "news", audience: "fop", hub: "taxes", keywords: "" });
  const [aiValidation, setAiValidation] = useState<{ loading: boolean; result: null | { verdict: "recommended" | "needs_work" | "not_recommended"; reasoning: string; contentGap: string; expectedImpact: string; aiConfidence: number } }>({ loading: false, result: null });

  // Idea filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [hubFilter, setHubFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [sortByConfidence, setSortByConfidence] = useState<"desc" | "none">("desc");

  const hasIdeaFilters = typeFilter !== "all" || hubFilter !== "all" || sourceFilter !== "all" || impactFilter !== "all";
  const resetIdeaFilters = () => { setTypeFilter("all"); setHubFilter("all"); setSourceFilter("all"); setImpactFilter("all"); };

  const statusLabels: Record<string, string> = { idea: "Ідеї", generating: "В роботі" };
  const statusIcons: Record<string, React.ElementType> = { idea: Lightbulb, generating: Sparkles };

  const filtered = useMemo(() => {
    let result = filter === "all" ? items : items.filter(i => i.status === filter);
    if (typeFilter !== "all") result = result.filter(i => i.type === typeFilter);
    if (hubFilter !== "all") result = result.filter(i => i.hub === hubFilter);
    if (sourceFilter !== "all") result = result.filter(i => i.aiSource === sourceFilter);
    if (impactFilter !== "all") result = result.filter(i => i.expectedImpact === impactFilter);
    if (sortByConfidence === "desc") {
      result = [...result].sort((a, b) => (b.aiConfidence ?? 0) - (a.aiConfidence ?? 0));
    }
    return result;
  }, [items, filter, typeFilter, hubFilter, sourceFilter, impactFilter, sortByConfidence]);

  const counts = {
    idea: items.filter(i => i.status === "idea").length,
    generating: items.filter(i => i.status === "generating").length,
  };

  const updateItem = (id: number, updates: Partial<PlanItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const startGenerating = (item: PlanItem) => {
    updateItem(item.id, { status: "generating", progress: 0 });
  };

  const validateAndAddIdea = () => {
    if (!newIdea.topic.trim()) return;
    setAiValidation({ loading: true, result: null });
    // Mock AI validation
    setTimeout(() => {
      const confidence = Math.floor(Math.random() * 40) + 55; // 55-95
      const verdicts = confidence >= 75 ? "recommended" as const : confidence >= 55 ? "needs_work" as const : "not_recommended" as const;
      setAiValidation({
        loading: false,
        result: {
          verdict: verdicts,
          reasoning: confidence >= 75
            ? `Тема "${newIdea.topic}" актуальна — є пошуковий попит та відсутнє покриття на порталі. Рекомендовано до створення.`
            : confidence >= 55
            ? `Тема має потенціал, але потребує звуження фокусу або додаткового контексту для максимального впливу.`
            : `Тема вже достатньо покрита на порталі або має низький пошуковий попит. Рекомендуємо переглянути кут подачі.`,
          contentGap: confidence >= 65 ? "На порталі немає актуального матеріалу з цієї теми" : "Схожий контент опубліковано 2 тижні тому",
          expectedImpact: confidence >= 80 ? "Високий" : confidence >= 60 ? "Середній" : "Низький",
          aiConfidence: confidence,
        },
      });
    }, 1500);
  };

  const confirmAddIdea = () => {
    const id = Math.max(0, ...items.map(i => i.id)) + 1;
    setItems(prev => [...prev, {
      id,
      topic: newIdea.topic,
      description: newIdea.description,
      type: newIdea.type,
      audience: newIdea.audience,
      hub: newIdea.hub,
      keywords: newIdea.keywords.split(",").map(k => k.trim()).filter(Boolean),
      status: "idea" as const,
      aiSource: "manual" as const,
      aiConfidence: aiValidation.result?.aiConfidence ?? 50,
      reasoning: aiValidation.result?.reasoning,
      contentGap: aiValidation.result?.contentGap,
      expectedImpact: aiValidation.result?.expectedImpact,
    }]);
    toast.success("Ідею додано до контент-плану");
    setNewIdea({ topic: "", description: "", type: "news", audience: "fop", hub: "taxes", keywords: "" });
    setAiValidation({ loading: false, result: null });
    setDialogOpen(false);
  };

  const confidenceBadge = (confidence?: number, source?: "auto" | "manual") => {
    if (confidence == null) return null;
    const color = confidence >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : confidence >= 50 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return (
      <div className="flex items-center gap-1.5">
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", color)}>{confidence}%</span>
        {source && (
          <span className="text-xs text-muted-foreground">{source === "auto" ? "AI" : "Ручна"}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Monitoring settings — uses shared sources */}
      <Collapsible open={monitoringOpen} onOpenChange={setMonitoringOpen}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", monitoringEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Моніторинг джерел</p>
                  <p className="text-xs text-muted-foreground">
                    {monitoringEnabled ? `Активний · перевірка кожні ${checkFrequency} год · ${enabledSourcesCount} джерел` : "Вимкнено"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={monitoringEnabled} onCheckedChange={setMonitoringEnabled} onClick={e => e.stopPropagation()} />
                {monitoringOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-1 border-dashed">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Активні джерела (з Налаштувань → Крок 3)</Label>
                <div className="space-y-2">
                  {sources.map(src => {
                    const SrcIcon = src.icon;
                    return (
                      <div key={src.id} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <SrcIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{src.label}</span>
                        </div>
                        <Badge variant={src.enabled ? "default" : "secondary"} className="text-xs">
                          {src.enabled ? "Увімкнено" : "Вимкнено"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Щоб змінити джерела, перейдіть у Налаштування → Крок 3 «Звідки дані»
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Тематичні фільтри (хаби)</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {hubs.map(h => (
                      <Badge key={h} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">{hubLabels[h]}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Частота перевірки</Label>
                  <Select value={checkFrequency} onValueChange={setCheckFrequency}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Кожну годину</SelectItem>
                      <SelectItem value="6">Кожні 6 годин</SelectItem>
                      <SelectItem value="12">Кожні 12 годин</SelectItem>
                      <SelectItem value="24">Раз на добу</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Pipeline status ribbon — 2 stages */}
      <div className="flex items-center gap-0 bg-muted/30 rounded-xl p-1">
        {(["idea", "generating"] as const).map((s, i) => {
          const Icon = statusIcons[s];
          const isActive = filter === s;
          return (
            <div key={s} className="flex items-center flex-1">
              <button
                onClick={() => setFilter(s === filter ? "all" : s)}
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg transition-all text-center",
                  isActive ? "bg-background shadow-sm ring-1 ring-border/50" : "hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>{statusLabels[s]}</span>
                <Badge variant="secondary" className="text-xs h-5 min-w-[20px] px-1.5">{counts[s]}</Badge>
              </button>
              {i < 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mx-0.5" />}
            </div>
          );
        })}
      </div>

      {/* Idea filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Тип" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі типи</SelectItem>
            {articleTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={hubFilter} onValueChange={setHubFilter}>
          <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Хаб" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі хаби</SelectItem>
            {hubs.map(h => <SelectItem key={h} value={h}>{hubLabels[h]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Джерело" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі</SelectItem>
            <SelectItem value="auto">AI</SelectItem>
            <SelectItem value="manual">Ручна</SelectItem>
          </SelectContent>
        </Select>
        <Select value={impactFilter} onValueChange={setImpactFilter}>
          <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Вплив" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Будь-який</SelectItem>
            <SelectItem value="Високий">Високий</SelectItem>
            <SelectItem value="Середній">Середній</SelectItem>
            <SelectItem value="Низький">Низький</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={sortByConfidence === "desc" ? "secondary" : "ghost"}
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={() => setSortByConfidence(prev => prev === "desc" ? "none" : "desc")}
        >
          <TrendingUp className="h-3 w-3" />
          Впевненість
        </Button>
        {hasIdeaFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground" onClick={resetIdeaFilters}>
            <X className="h-3 w-3" /> Скинути
          </Button>
        )}
        <div className="flex-1" />
        <Button size="sm" className="gap-1.5 h-8" onClick={() => { setDialogOpen(true); setAiValidation({ loading: false, result: null }); }}>
          <Plus className="h-3.5 w-3.5" /> Додати ідею
        </Button>
      </div>

      {/* Plan items */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">{hasIdeaFilters ? "Немає ідей за обраними фільтрами" : "Немає елементів у цьому фільтрі"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3 border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium">{item.topic}</h3>
                  {item.source && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <a href={item.sourceUrl} target="_blank" rel="noopener" className="hover:underline text-primary/80">{item.source}</a>
                      {item.sourceDate && <><span>·</span><Clock className="h-3 w-3" /><span>{item.sourceDate}</span></>}
                    </div>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs">{typeLabels[item.type] || item.type}</Badge>
                    <Badge variant="secondary" className="text-xs">{audienceLabels[item.audience]}</Badge>
                    <Badge variant="secondary" className="text-xs">{hubLabels[item.hub]}</Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {confidenceBadge(item.aiConfidence, item.aiSource)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Hash className="h-3 w-3 text-muted-foreground" />
                {item.keywords.map(kw => (
                  <span key={kw} className="text-xs bg-muted px-1.5 py-0.5 rounded">{kw}</span>
                ))}
              </div>
              {item.status === "idea" && (
                <div className="space-y-2">
                  {(item.reasoning || item.uniquenessNote || item.contentGap || item.expectedImpact) && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                      {item.reasoning && (
                        <div className="flex items-start gap-1.5">
                          <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <p className="text-xs italic text-muted-foreground">{item.reasoning}</p>
                        </div>
                      )}
                      {item.uniquenessNote && (
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Унікальність:</span>
                          <span className="text-xs">{item.uniquenessNote}</span>
                        </div>
                      )}
                      {item.contentGap && (
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Контент-гап:</span>
                          <span className="text-xs">{item.contentGap}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.expectedImpact && (
                          <Badge variant={item.expectedImpact === "Високий" ? "default" : "secondary"} className="text-xs">
                            Вплив: {item.expectedImpact}
                          </Badge>
                        )}
                        {item.targetAudienceNote && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> {item.targetAudienceNote}
                          </span>
                        )}
                        {item.estimatedReadTime && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> ~{item.estimatedReadTime} хв читання
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1 h-7 text-xs" onClick={() => startGenerating(item)}>
                      <Sparkles className="h-3 w-3" /> Генерувати
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs text-destructive" onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}>
                      <X className="h-3 w-3" /> Відхилити
                    </Button>
                  </div>
                </div>
              )}
              {item.status === "generating" && (
                <div className="space-y-1">
                  <Progress value={item.progress ?? 0} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {(item.progress ?? 0) < 100
                      ? `Генерація контенту… ${item.progress ?? 0}% — після завершення → Модерація`
                      : "Завершено! Переміщення в Модерацію…"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Idea Dialog with AI Validation */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setAiValidation({ loading: false, result: null }); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Додати ідею</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">Тема *</Label>
              <Input value={newIdea.topic} onChange={e => setNewIdea(p => ({ ...p, topic: e.target.value }))} placeholder="Напр.: Зміни в подачі декларації 2026" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Опис / Контекст</Label>
              <Textarea value={newIdea.description} onChange={e => setNewIdea(p => ({ ...p, description: e.target.value }))} placeholder="Короткий контекст або пояснення чому ця тема важлива" className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Тип</Label>
                <Select value={newIdea.type} onValueChange={v => setNewIdea(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{articleTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Аудиторія</Label>
                <Select value={newIdea.audience} onValueChange={v => setNewIdea(p => ({ ...p, audience: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{audiences.map(a => <SelectItem key={a} value={a}>{audienceLabels[a]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Хаб</Label>
                <Select value={newIdea.hub} onValueChange={v => setNewIdea(p => ({ ...p, hub: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{hubs.map(h => <SelectItem key={h} value={h}>{hubLabels[h]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ключові слова (через кому)</Label>
              <Input value={newIdea.keywords} onChange={e => setNewIdea(p => ({ ...p, keywords: e.target.value }))} placeholder="ЄСВ, ФОП, 2026" className="mt-1" />
            </div>

            {/* AI Validation Result */}
            {aiValidation.loading && (
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium">AI аналізує ідею…</p>
                  <p className="text-xs text-muted-foreground">Перевірка актуальності, унікальності та покриття порталу</p>
                </div>
              </div>
            )}

            {aiValidation.result && (
              <div className={cn("rounded-lg p-4 space-y-3 border", aiValidation.result.verdict === "recommended" ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800" : aiValidation.result.verdict === "needs_work" ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800" : "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800")}>
                <div className="flex items-center gap-2">
                  {aiValidation.result.verdict === "recommended" ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" /> : aiValidation.result.verdict === "needs_work" ? <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" /> : <X className="h-5 w-5 text-red-600 dark:text-red-400" />}
                  <span className="text-sm font-semibold">
                    {aiValidation.result.verdict === "recommended" ? "Рекомендовано" : aiValidation.result.verdict === "needs_work" ? "Потребує доопрацювання" : "Не рекомендовано"}
                  </span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium ml-auto", aiValidation.result.aiConfidence >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : aiValidation.result.aiConfidence >= 50 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400")}>
                    {aiValidation.result.aiConfidence}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">{aiValidation.result.reasoning}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Контент-гап: {aiValidation.result.contentGap}</span>
                </div>
                <Badge variant={aiValidation.result.expectedImpact === "Високий" ? "default" : "secondary"} className="text-xs">
                  Вплив: {aiValidation.result.expectedImpact}
                </Badge>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Скасувати</Button>
            {!aiValidation.result ? (
              <Button onClick={validateAndAddIdea} disabled={!newIdea.topic.trim() || aiValidation.loading} className="gap-1.5">
                {aiValidation.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Перевірити ідею (AI)
              </Button>
            ) : (
              <Button onClick={confirmAddIdea} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {aiValidation.result.verdict === "not_recommended" ? "Додати все одно" : "Додати"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Moderation Tab — compact list + fullscreen Dialog editor
// ═════════════════════════════════════════════════════════════

function calcQuality(article: { content: string; wordCount: number }): number {
  let score = 40;
  if (article.wordCount >= 400) score += 10;
  if (article.wordCount >= 700) score += 5;
  if (article.content.includes("## ")) score += 10;
  if (article.content.includes("### ")) score += 5;
  if (article.content.includes(":::container")) score += 10;
  if (article.content.includes(":::conclusion")) score += 10;
  if (article.content.includes("|")) score += 5;
  if (article.content.includes("- ")) score += 5;
  return Math.min(100, score);
}

const qualityBreakdown = [
  { label: "≥400 слів", points: 10 },
  { label: "≥700 слів", points: 5 },
  { label: "Заголовки ##", points: 10 },
  { label: "Підзаголовки ###", points: 5 },
  { label: ":::container блоки", points: 10 },
  { label: ":::conclusion блок", points: 10 },
  { label: "Таблиці", points: 5 },
  { label: "Списки", points: 5 },
];

function QualityBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-600 dark:text-green-400" : score >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";
  const bg = score >= 80 ? "bg-green-100 dark:bg-green-900/30" : score >= 60 ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-red-100 dark:bg-red-900/30";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full cursor-help", color, bg)}>
          {score}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <p className="text-xs font-semibold mb-1">Quality Score Breakdown</p>
        <p className="text-xs text-muted-foreground mb-2">Базовий: 40 балів</p>
        <div className="space-y-0.5">
          {qualityBreakdown.map(q => (
            <div key={q.label} className="flex justify-between text-xs">
              <span>{q.label}</span>
              <span className="text-muted-foreground">+{q.points}</span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// generateSlug imported from generateSeo.ts (with proper transliteration)

interface ModerationTabProps {
  articles: MockArticle[];
  setArticles: React.Dispatch<React.SetStateAction<MockArticle[]>>;
  model: string;
  brandVoice: string;
  tone: string;
  guardrails: string;
  verificationSettings: AIVerificationSettings;
}

function ModerationTab({ articles, setArticles, model, brandVoice, tone, guardrails, verificationSettings }: ModerationTabProps) {
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editingArticle, setEditingArticle] = useState<MockArticle | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editorTab, setEditorTab] = useState<"editor" | "preview">("editor");
  const [editMeta, setEditMeta] = useState<{
    type: string; audience: string; hub: string; tldr: string;
    tags: string; readingMinutes: number; seoTitle: string; seoDescription: string; slug: string;
  }>({ type: "", audience: "", hub: "", tldr: "", tags: "", readingMinutes: 0, seoTitle: "", seoDescription: "", slug: "" });
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);

  const filters = ["all", ...articleTypes.map(t => t.id)];
  const statusLabels: Record<string, string> = { draft: "Чернетка", reviewed: "Затверджено", rejected: "Відхилено" };
  const filtered = filter === "all" ? articles : articles.filter(a => a.type === filter);

  const updateArticle = (id: number, updates: Partial<MockArticle>) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const selectAll = () => {
    selectedIds.size === filtered.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filtered.map(a => a.id)));
  };

  const batchApprove = () => {
    setArticles(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, status: "reviewed" as const } : a));
    setSelectedIds(new Set());
  };

  const batchReject = () => {
    setArticles(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, status: "rejected" as const } : a));
    setSelectedIds(new Set());
  };

  const openEditor = (article: MockArticle) => {
    setEditingArticle(article);
    setEditingContent(article.content);
    setEditorTab("editor");
    setEditMeta({
      type: article.type,
      audience: article.audience,
      hub: article.hub,
      tldr: article.tldr,
      tags: article.tags.join(", "),
      readingMinutes: article.readingMinutes,
      seoTitle: article.seoTitle || article.title.slice(0, 60),
      seoDescription: article.seoDescription || article.tldr.slice(0, 160),
      slug: article.slug || generateSlug(article.title),
    });
  };

  const saveAndClose = (newStatus?: ModerationStatus) => {
    if (!editingArticle) return;
    const wordCount = editingContent.split(/\s+/).filter(Boolean).length;
    const updates: Partial<MockArticle> = {
      content: editingContent,
      wordCount,
      qualityScore: calcQuality({ content: editingContent, wordCount }),
      type: editMeta.type,
      audience: editMeta.audience,
      hub: editMeta.hub,
      tldr: editMeta.tldr,
      tags: editMeta.tags.split(",").map(t => t.trim()).filter(Boolean),
      readingMinutes: editMeta.readingMinutes,
      seoTitle: editMeta.seoTitle,
      seoDescription: editMeta.seoDescription,
      slug: editMeta.slug,
    };
    if (newStatus) updates.status = newStatus;
    updateArticle(editingArticle.id, updates);
    setEditingArticle(null);
    if (newStatus) {
      toast.success(newStatus === "reviewed" ? "Статтю затверджено" : "Статтю відхилено");
    } else {
      toast.success("Зміни збережено");
    }
  };

  const handleRegenerate = () => {
    toast.info(`Регенерація з моделлю ${model}...`, { description: `Brand Voice: ${brandVoice.slice(0, 60)}…` });
    if (editingArticle) {
      const fallback = generateFallbackContent(
        { id: editingArticle.id, topic: editingArticle.title, type: editMeta.type, audience: editMeta.audience, hub: editMeta.hub, keywords: editMeta.tags.split(",").map(t => t.trim()), status: "generating" },
        brandVoice
      );
      setEditingContent(fallback);
      // Also trigger real AI regeneration in background
      generateArticleContent(
        { id: editingArticle.id, topic: editingArticle.title, type: editMeta.type, audience: editMeta.audience, hub: editMeta.hub, keywords: editMeta.tags.split(",").map(t => t.trim()), status: "generating" },
        brandVoice, tone || "professional", guardrails || ""
      ).then(result => {
        setEditingContent(result.content);
        toast.success("AI регенерація завершена");
      }).catch(() => {
        toast.warning("AI недоступний, використано шаблон");
      });
    }
  };

  const [editVerification, setEditVerification] = useState<AIVerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  const runAIVerification = useCallback(async () => {
    setVerifying(true);
    toast.info(`AI перевірка з моделлю ${verificationSettings.verificationModel}...`, { description: "Аналіз brand voice, унікальності, фактів, SEO та структури" });
    try {
      const result = await verifyArticleContent(
        editingArticle?.title || "",
        editingContent,
        brandVoice,
        verificationSettings.checks,
      );
      if (result) {
        setEditVerification(result);
        if (editingArticle) {
          updateArticle(editingArticle.id, { aiVerification: result });
        }
        toast.success(`AI перевірка завершена: ${result.overallScore}/100`, {
          description: result.status === "passed" ? "Контент пройшов перевірку" : `${result.recommendations.length} рекомендацій`,
        });
      } else {
        toast.error("AI перевірка не вдалася", { description: "Перевірте баланс або спробуйте пізніше" });
      }
      setVerifying(false);
    } catch (e) {
      setVerifying(false);
      toast.error("AI перевірка не вдалася", { description: "Спробуйте пізніше" });
    }
  }, [verificationSettings, editingArticle, editingContent, brandVoice]);

  // Reset verification when opening editor — auto-verify if enabled
  const openEditorWithVerification = (article: MockArticle) => {
    openEditor(article);
    const existing = article.aiVerification ?? null;
    setEditVerification(existing);
    if (verificationSettings.autoVerify && !existing) {
      setTimeout(() => runAIVerification(), 100);
    }
  };

  const liveQuality = editingArticle
    ? calcQuality({ content: editingContent, wordCount: editingContent.split(/\s+/).filter(Boolean).length })
    : 0;

  return (
    <div className="space-y-4">
      {/* Filters & batch actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap overflow-x-auto">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-full transition-colors shrink-0",
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}>
              {f === "all" ? `Усі (${articles.length})` : typeLabels[f]}
            </button>
          ))}
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Обрано: {selectedIds.size}</span>
            <Button size="sm" className="gap-1 h-7 text-xs" onClick={batchApprove}><Check className="h-3 w-3" /> Затвердити</Button>
            <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={batchReject}><X className="h-3 w-3" /> Відхилити</Button>
          </div>
        )}
      </div>

      {/* Compact list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Немає статей для модерації</p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-4 py-1.5">
            <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={selectAll} className="rounded border-border" />
            <span className="text-xs text-muted-foreground flex-1">Обрати всі</span>
            <span className="text-xs text-muted-foreground w-8 text-center">AI</span>
            <span className="text-xs text-muted-foreground w-12 text-center">Q</span>
            <span className="text-xs text-muted-foreground w-16 text-center">Слів</span>
            <span className="text-xs text-muted-foreground w-20 text-center">Статус</span>
            <span className="w-16" />
          </div>

          {filtered.map(article => {
            const aiStatus = article.aiVerification?.status;
            return (
            <div key={article.id} className="flex items-center gap-3 px-4 py-2.5 border border-border rounded-lg hover:bg-muted/30 transition-colors group">
              <input type="checkbox" checked={selectedIds.has(article.id)} onChange={() => toggleSelect(article.id)} className="rounded border-border" />
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditorWithVerification(article)}>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="shrink-0 text-xs">{typeLabels[article.type]}</Badge>
                  <span className="text-sm font-medium truncate">{article.title}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{article.tldr}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-8 text-center shrink-0 cursor-help">
                    {aiStatus === "passed" ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /> :
                     aiStatus === "warnings" ? <AlertTriangle className="h-4 w-4 text-yellow-500 mx-auto" /> :
                     aiStatus === "failed" ? <X className="h-4 w-4 text-red-500 mx-auto" /> :
                     <span className="h-4 w-4 rounded-full bg-muted inline-block" />}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{aiStatus === "passed" ? "AI: Перевірено ✓" : aiStatus === "warnings" ? "AI: Є зауваження" : aiStatus === "failed" ? "AI: Не пройшло" : "AI: Не перевірено"}</p>
                  {article.aiVerification?.overallScore && <p className="text-xs text-muted-foreground">Score: {article.aiVerification.overallScore}/100</p>}
                </TooltipContent>
              </Tooltip>
              <QualityBadge score={article.qualityScore} />
              <span className="text-xs text-muted-foreground w-16 text-center shrink-0">{article.wordCount}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium w-20 text-center shrink-0", statusColors[article.status])}>
                {statusLabels[article.status]}
              </span>
              <Button size="sm" variant="ghost" className="h-7 w-16 text-xs gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openEditorWithVerification(article)}>
                <PenLine className="h-3 w-3" /> Відкрити
              </Button>
            </div>
            );
          })}
        </div>
      )}

      {/* ═══ Fullscreen Editor Dialog ═══ */}
      <Dialog open={!!editingArticle} onOpenChange={(open) => { if (!open) setEditingArticle(null); }}>
        <DialogContent aria-describedby={undefined} className="fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none sm:inset-0 sm:left-0 sm:top-0 sm:translate-x-0 sm:translate-y-0 sm:max-w-none sm:max-h-none sm:rounded-none sm:border-0 rounded-none border-0 p-0 gap-0 flex flex-col bg-background [&>button:last-child]:hidden">
          <DialogTitle className="sr-only">{editingArticle?.title ?? "Редактор модерації"}</DialogTitle>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setEditingArticle(null)}>
                <X className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold truncate">{editingArticle?.title}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleRegenerate}>
                    <RotateCcw className="h-3.5 w-3.5 mr-2" /> Регенерувати
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={runAIVerification} disabled={verifying}>
                    {verifying ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Shield className="h-3.5 w-3.5 mr-2" />}
                    {verifying ? "Перевірка..." : "AI: Переперевірити"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => saveAndClose()}>
                <Save className="h-3 w-3" /> Зберегти
              </Button>
              <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive" onClick={() => saveAndClose("rejected")}>
                <X className="h-3 w-3" /> Відхилити
              </Button>
              <Button size="sm" className="gap-1 text-xs" onClick={() => saveAndClose("reviewed")}>
                <Check className="h-3 w-3" /> Затвердити
              </Button>
            </div>
          </div>

          {/* Body: sidebar + editor */}
          <div className="flex flex-1 overflow-hidden">
            {/* ── Sidebar: metadata + SEO ── */}
            <aside className="w-80 shrink-0 border-r border-border overflow-y-auto p-4 space-y-5 hidden lg:block">
              {/* ── AI Verdict (first in sidebar) ── */}
              {editVerification?.decision && (
                <div className={cn("rounded-lg p-3 space-y-1.5 border",
                  editVerification.decision === "approve" ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" :
                  editVerification.decision === "revise" ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" :
                  "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                )}>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    {editVerification.decision === "approve" ? "🟢 ЗАТВЕРДИТИ" :
                     editVerification.decision === "revise" ? "🟡 ДООПРАЦЮВАТИ" :
                     "🔴 ВІДХИЛИТИ"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{editVerification.verdict}</p>
                  {editVerification.checkedAt && (
                    <p className="text-[10px] text-muted-foreground/70">Перевірено: {editVerification.checkedAt}</p>
                  )}
                </div>
              )}
              {!editVerification && (verifying || verificationSettings.autoVerify) && (
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>AI формує висновок...</span>
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              )}

              {/* Quality */}
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Quality Score</p>
                <div className={cn(
                  "text-3xl font-bold",
                  liveQuality >= 80 ? "text-green-600 dark:text-green-400" : liveQuality >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                )}>{liveQuality}</div>
                <Progress value={liveQuality} className="h-1.5" />
              </div>

              {/* ── AI Verification Panel ── */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> AI Перевірка
                  </p>
                  {editVerification && (
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                      editVerification.status === "passed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      editVerification.status === "warnings" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      editVerification.status === "failed" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {editVerification.status === "passed" ? "✓ Пройдено" : editVerification.status === "warnings" ? "⚠ Зауваження" : editVerification.status === "failed" ? "✗ Не пройшло" : "Очікує"}
                    </span>
                  )}
                </div>

                {!editVerification ? (
                  <div className="text-center py-3">
                    {verifying || verificationSettings.autoVerify ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          AI аналізує контент...
                        </div>
                        <div className="space-y-1.5">
                          {["Brand Voice", "Унікальність", "Структура", "Факти", "SEO"].map(label => (
                            <div key={label} className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">{label}</span>
                              <Skeleton className="h-2 w-16 rounded" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : !verificationSettings.autoVerify ? (
                      <>
                        <p className="text-xs text-muted-foreground mb-2">Контент ще не перевірено AI</p>
                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={runAIVerification} disabled={verifying}>
                          <Shield className="h-3 w-3" />
                          Запустити перевірку
                        </Button>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold",
                        editVerification.overallScore >= 80 ? "text-green-600 dark:text-green-400" :
                        editVerification.overallScore >= 65 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
                      )}>{editVerification.overallScore}</div>
                      <p className="text-xs text-muted-foreground">AI Score</p>
                    </div>

                    <div className="space-y-1.5">
                      {([
                        { label: "Brand Voice", score: editVerification.brandVoiceScore, enabled: verificationSettings.checks.brandVoice },
                        { label: "Унікальність", score: editVerification.uniquenessScore, enabled: verificationSettings.checks.uniqueness },
                        { label: "Структура", score: editVerification.structureScore, enabled: verificationSettings.checks.structure },
                        { label: "Факти", score: editVerification.factsScore, enabled: verificationSettings.checks.facts },
                        { label: "SEO", score: editVerification.seoScore, enabled: verificationSettings.checks.seo },
                      ]).filter(c => c.enabled).map(check => (
                        <div key={check.label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            {check.score >= 80 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                            <span>{check.label}</span>
                          </div>
                          <span className={cn("font-medium", check.score >= 80 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400")}>{check.score}%</span>
                        </div>
                      ))}
                    </div>

                    {editVerification.recommendations.length > 0 && (
                      <div className="bg-muted/30 rounded-lg p-2.5 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Рекомендації AI:</p>
                        {editVerification.recommendations.map((rec, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="text-primary shrink-0">•</span> {rec}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* AI Verdict moved to top of sidebar */}

                    <Button size="sm" variant="ghost" className="w-full gap-1 text-xs" onClick={runAIVerification} disabled={verifying}>
                      {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                      Перевірити знову
                    </Button>
                  </div>
                )}
              </div>

              {/* Article metadata */}
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Метадані
                </p>
                <div>
                  <Label className="text-xs text-muted-foreground">Тип</Label>
                  <Select value={editMeta.type} onValueChange={(v) => setEditMeta(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{articleTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Аудиторія</Label>
                  <Select value={editMeta.audience} onValueChange={(v) => setEditMeta(p => ({ ...p, audience: v }))}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{audiences.map(a => <SelectItem key={a} value={a}>{audienceLabels[a]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Хаб</Label>
                  <Select value={editMeta.hub} onValueChange={(v) => setEditMeta(p => ({ ...p, hub: v }))}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{hubs.map(h => <SelectItem key={h} value={h}>{hubLabels[h]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">TL;DR</Label>
                  <Textarea value={editMeta.tldr} onChange={(e) => setEditMeta(p => ({ ...p, tldr: e.target.value }))} rows={2} className="text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Теги (через кому)</Label>
                  <Input value={editMeta.tags} onChange={(e) => setEditMeta(p => ({ ...p, tags: e.target.value }))} className="h-8 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Читання (хв)</Label>
                  <Input type="number" value={editMeta.readingMinutes} onChange={(e) => setEditMeta(p => ({ ...p, readingMinutes: +e.target.value }))} className="h-8 text-xs mt-1" />
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> SEO
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] gap-1"
                    onClick={async () => {
                      const { generateSeoFields } = await import("@/admin/utils/generateSeo");
                      toast.promise(
                        generateSeoFields({
                          title: editMeta.seoTitle || editingArticle?.title || "",
                          content: editingContent,
                          tldr: editMeta.seoDescription || editingArticle?.tldr || "",
                          type: editingArticle?.type,
                          audience: editingArticle?.audience,
                        }).then((seo) => {
                          setEditMeta((p) => ({
                            ...p,
                            seoTitle: seo.seoTitle,
                            seoDescription: seo.seoDescription,
                            slug: seo.slug,
                          }));
                        }),
                        { loading: "Генерація SEO…", success: "SEO згенеровано!", error: "Помилка генерації" }
                      );
                    }}
                  >
                    ✨ AI SEO
                  </Button>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Meta Title <span className="text-muted-foreground/60">({editMeta.seoTitle.length}/60)</span></Label>
                  <Input value={editMeta.seoTitle} onChange={(e) => setEditMeta(p => ({ ...p, seoTitle: e.target.value }))} className="h-8 text-xs mt-1" maxLength={70} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Meta Description <span className="text-muted-foreground/60">({editMeta.seoDescription.length}/160)</span></Label>
                  <Textarea value={editMeta.seoDescription} onChange={(e) => setEditMeta(p => ({ ...p, seoDescription: e.target.value }))} rows={3} className="text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Slug</Label>
                  <Input value={editMeta.slug} onChange={(e) => setEditMeta(p => ({ ...p, slug: e.target.value }))} className="h-8 text-xs mt-1 font-mono" />
                </div>

                {/* SEO preview snippet */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-0.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Google Preview</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">{editMeta.seoTitle || "Заголовок сторінки"}</p>
                  <p className="text-xs text-green-700 dark:text-green-400 truncate">fintodo.com.ua/articles/{editMeta.slug || "slug"}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{editMeta.seoDescription || "Опис сторінки..."}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Згенеровано: {editingArticle?.generatedAt}</p>
                <p>Слів: {editingContent.split(/\s+/).filter(Boolean).length}</p>
              </div>
            </aside>

            {/* ── Main: Editor / Preview ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Editor tabs */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0 bg-muted/20">
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditorTab("editor")}
                    className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      editorTab === "editor" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    <PenLine className="h-3 w-3 inline mr-1" />Редактор
                  </button>
                  <button
                    onClick={() => setEditorTab("preview")}
                    className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      editorTab === "preview" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Eye className="h-3 w-3 inline mr-1" />Попередній перегляд
                  </button>
                </div>
                <QualityBadge score={liveQuality} />
              </div>

              {editorTab === "editor" ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <MarkdownToolbar
                    textareaRef={editorTextareaRef}
                    onUpdate={setEditingContent}
                    isPreview={false}
                    onTogglePreview={() => setEditorTab("preview")}
                  />
                  <Textarea
                    ref={editorTextareaRef}
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="flex-1 rounded-none border-0 border-t font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-0"
                    style={{ height: "100%" }}
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 bg-background">
                  <div className="max-w-3xl mx-auto">
                    {/* Hero header mock */}
                    <div className="mb-8 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{typeLabels[editMeta.type] || editMeta.type}</Badge>
                        <Badge variant="secondary" className="text-xs">{audienceLabels[editMeta.audience] || editMeta.audience}</Badge>
                        <Badge variant="secondary" className="text-xs">{hubLabels[editMeta.hub] || editMeta.hub}</Badge>
                      </div>
                      <h1 className="text-2xl font-bold tracking-tight">{editingArticle?.title}</h1>
                      {editMeta.tldr && (
                        <p className="text-base text-muted-foreground leading-relaxed">{editMeta.tldr}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground border-b border-border pb-4">
                        <span>📅 {editingArticle?.generatedAt}</span>
                        <span>⏱ {editMeta.readingMinutes} хв читання</span>
                        <span>📝 {editingContent.split(/\s+/).filter(Boolean).length} слів</span>
                      </div>
                    </div>
                    {/* Portal-style rendered content */}
                    <div className="kved-article">
                      <div className="content" dangerouslySetInnerHTML={{ __html: renderMarkdown(editingContent) }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile metadata (shown below editor on small screens) */}
          <div className="lg:hidden border-t border-border p-4 space-y-3 overflow-y-auto max-h-[30vh] shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Тип</Label>
                <Select value={editMeta.type} onValueChange={(v) => setEditMeta(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{articleTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Аудиторія</Label>
                <Select value={editMeta.audience} onValueChange={(v) => setEditMeta(p => ({ ...p, audience: v }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{audiences.map(a => <SelectItem key={a} value={a}>{audienceLabels[a]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">TL;DR</Label>
              <Input value={editMeta.tldr} onChange={(e) => setEditMeta(p => ({ ...p, tldr: e.target.value }))} className="h-8 text-xs mt-1" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Publication Tab — with calendar grid
// ═════════════════════════════════════════════════════════════

type PubStatus = "scheduled" | "published" | "draft";
interface PubArticle {
  id: number;
  title: string;
  type: string;
  status: PubStatus;
  scheduledAt: string;
  autoPublish: boolean;
  author: string;
  audience: string;
  hub: string;
}

const pubStatusLabels: Record<PubStatus, string> = {
  scheduled: "Заплановано",
  published: "Опубліковано",
  draft: "Чернетка",
};

// mockPubArticles removed — PublicationTab now receives approved articles from parent

interface PublicationTabProps {
  approvedArticles: MockArticle[];
}

function PublicationTab({ approvedArticles }: PublicationTabProps) {
  // Smart time slot allocation: max 3 per day, slots at 09:00, 13:00, 17:00
  const findNextAvailableSlot = useCallback((existingItems: PubArticle[], fromDate: Date): Date => {
    const SLOTS = [9, 13, 17];
    const MAX_PER_DAY = 3;
    let current = new Date(fromDate);
    // Start from tomorrow
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const checkDate = addDays(current, dayOffset);
      const dayItems = existingItems.filter(it => {
        if (it.status !== "scheduled") return false;
        const d = new Date(it.scheduledAt.replace(" ", "T"));
        return isSameDay(d, checkDate);
      });
      if (dayItems.length >= MAX_PER_DAY) continue;
      const usedHours = new Set(dayItems.map(it => new Date(it.scheduledAt.replace(" ", "T")).getHours()));
      for (const slot of SLOTS) {
        if (!usedHours.has(slot)) {
          const result = new Date(checkDate);
          result.setHours(slot, 0, 0, 0);
          return result;
        }
      }
    }
    // Fallback: tomorrow 09:00
    const fallback = addDays(fromDate, 1);
    fallback.setHours(9, 0, 0, 0);
    return fallback;
  }, []);

  // Convert approved moderation articles to PubArticle format
  const initialPubs: PubArticle[] = approvedArticles.map(a => ({
    id: a.id,
    title: a.title,
    type: a.type,
    status: "draft" as PubStatus,
    scheduledAt: format(new Date(), "yyyy-MM-dd HH:mm"),
    autoPublish: false,
    author: "AI Автор",
    audience: a.audience,
    hub: a.hub,
  }));

  const [globalAuto, setGlobalAuto] = useState(false);
  const [items, setItems] = useState<PubArticle[]>(initialPubs);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState("09:00");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterHub, setFilterHub] = useState<string>("all");

  // Sync approved articles into publication pipeline
  useEffect(() => {
    setItems(prev => {
      const existingIds = new Set(prev.map(i => i.id));
      const newArticles = approvedArticles.filter(a => !existingIds.has(a.id));
      if (newArticles.length === 0) return prev;
      const newItems: PubArticle[] = newArticles.map(a => {
        if (globalAuto) {
          const slot = findNextAvailableSlot([...prev], new Date());
          return {
            id: a.id, title: a.title, type: a.type,
            status: "scheduled" as PubStatus,
            scheduledAt: format(slot, "yyyy-MM-dd HH:mm"),
            autoPublish: true, author: "AI Автор", audience: a.audience, hub: a.hub,
          };
        }
        return {
          id: a.id, title: a.title, type: a.type,
          status: "draft" as PubStatus,
          scheduledAt: format(new Date(), "yyyy-MM-dd HH:mm"),
          autoPublish: false, author: "AI Автор", audience: a.audience, hub: a.hub,
        };
      });
      return [...prev, ...newItems];
    });
  }, [approvedArticles, globalAuto, findNextAvailableSlot]);

  const toggleItemAuto = (id: number) => {
    setItems(prev => prev.map(a => a.id === id ? { ...a, autoPublish: !a.autoPublish } : a));
  };

  const handlePublishNow = (id: number) => {
    setItems(prev => prev.map(a => a.id === id ? { ...a, status: "published" as PubStatus, scheduledAt: format(new Date(), "yyyy-MM-dd HH:mm") } : a));
  };

  const handleUnschedule = (id: number) => {
    setItems(prev => prev.map(a => a.id === id ? { ...a, status: "draft" as PubStatus } : a));
  };

  const handleRescheduleConfirm = () => {
    if (!rescheduleId || !rescheduleDate) return;
    const dateStr = format(rescheduleDate, "yyyy-MM-dd") + " " + rescheduleTime;
    setItems(prev => prev.map(a => a.id === rescheduleId ? { ...a, scheduledAt: dateStr, status: "scheduled" as PubStatus } : a));
    setRescheduleId(null);
    setRescheduleDate(undefined);
    setRescheduleTime("09:00");
  };

  const openReschedule = (id: number) => {
    const item = items.find(a => a.id === id);
    if (item) {
      const d = new Date(item.scheduledAt.replace(" ", "T"));
      setRescheduleDate(d);
      setRescheduleTime(item.scheduledAt.split(" ")[1] || "09:00");
    }
    setRescheduleId(id);
  };

  const handleBulkPublish = () => {
    setItems(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, status: "published" as PubStatus, scheduledAt: format(new Date(), "yyyy-MM-dd HH:mm") } : a));
    setSelectedIds(new Set());
  };

  const handleBulkUnschedule = () => {
    setItems(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, status: "draft" as PubStatus } : a));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterType !== "all" && item.type !== filterType) return false;
      if (filterHub !== "all" && item.hub !== filterHub) return false;
      return true;
    });
  }, [items, filterStatus, filterType, filterHub]);

  const selectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const scheduled = items.filter(i => i.status === "scheduled").length;
  const published = items.filter(i => i.status === "published").length;
  const drafts = items.filter(i => i.status === "draft").length;

  const weekDayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  const weekDays = useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const mon = weekDays[0];
    const sun = weekDays[6];
    const monStr = format(mon, "d", { locale: uk });
    const sunStr = format(sun, "d MMM yyyy", { locale: uk });
    return `${monStr}–${sunStr}`;
  }, [weekDays]);

  const calendarItems = useMemo(() => {
    const map: Record<number, PubArticle[]> = {};
    const start = weekDays[0];
    const end = endOfDay(weekDays[6]);
    items.forEach(item => {
      if (item.status === "draft") return;
      const date = new Date(item.scheduledAt.replace(" ", "T"));
      if (!isWithinInterval(date, { start, end })) return;
      const dayIdx = weekDays.findIndex(d => isSameDay(d, date));
      if (dayIdx < 0) return;
      if (!map[dayIdx]) map[dayIdx] = [];
      map[dayIdx].push(item);
    });
    return map;
  }, [items, weekDays]);

  const today = new Date();

  const getDensityColor = (count: number) => {
    if (count === 0) return "bg-muted-foreground/20";
    if (count <= 2) return "bg-green-500";
    if (count === 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Counters */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-primary">{items.length}</p>
            <p className="text-xs text-muted-foreground">Всього</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-primary">{scheduled}</p>
            <p className="text-xs text-muted-foreground">Заплановано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-primary">{published}</p>
            <p className="text-xs text-muted-foreground">Опубліковано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{drafts}</p>
            <p className="text-xs text-muted-foreground">Чернетки</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-publish + view toggle */}
      <div className="flex items-center justify-between gap-3">
        <Card className="flex-1">
          <CardContent className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Автопублікація</p>
              <p className="text-xs text-muted-foreground">Затверджений контент публікується автоматично</p>
            </div>
            <Switch checked={globalAuto} onCheckedChange={setGlobalAuto} />
          </CardContent>
        </Card>
        <div className="flex gap-1 border border-border rounded-lg p-0.5">
          <button
            onClick={() => setView("list")}
            className={cn("px-3 py-1.5 text-xs rounded-md transition-colors", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Список
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn("px-3 py-1.5 text-xs rounded-md transition-colors", view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Календар
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі статуси</SelectItem>
                <SelectItem value="scheduled">Заплановано</SelectItem>
                <SelectItem value="published">Опубліковано</SelectItem>
                <SelectItem value="draft">Чернетка</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі типи</SelectItem>
                {Object.entries(typeLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterHub} onValueChange={setFilterHub}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Хаб" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі хаби</SelectItem>
                {Object.entries(hubLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk actions toolbar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
              <span className="text-xs font-medium text-muted-foreground">Обрано: {selectedIds.size}</span>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleBulkPublish}>
                <Send className="h-3 w-3" /> Опублікувати
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleBulkUnschedule}>
                <X className="h-3 w-3" /> Зняти з розкладу
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>
                Скасувати
              </Button>
            </div>
          )}

          {/* List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Rocket className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Немає контенту для публікації</p>
            </div>
          ) : (
            <>
              {/* Select all */}
              <div className="flex items-center gap-2 px-1">
                <Checkbox
                  checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={selectAll}
                  className="h-4 w-4"
                />
                <span className="text-xs text-muted-foreground">Обрати всі</span>
              </div>
              {filteredItems.map(item => (
                <div key={item.id} className="border border-border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs shrink-0">{typeLabels[item.type]}</Badge>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.scheduledAt}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{audienceLabels[item.audience]}</span>
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" />{hubLabels[item.hub]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[item.status])}>
                        {pubStatusLabels[item.status]}
                      </span>
                      {item.status === "scheduled" && (
                        <>
                          <button onClick={() => toggleItemAuto(item.id)} className="text-muted-foreground hover:text-foreground transition-colors" title={item.autoPublish ? "Автопублікація увімк." : "Автопублікація вимк."}>
                            {item.autoPublish ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5" />}
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                <Send className="h-3 w-3" /> Опублікувати <ChevronDown className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePublishNow(item.id)}>
                                <Send className="h-3.5 w-3.5 mr-2" /> Опублікувати зараз
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openReschedule(item.id)}>
                                <CalendarDays className="h-3.5 w-3.5 mr-2" /> Змінити час
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUnschedule(item.id)} className="text-destructive">
                                <X className="h-3.5 w-3.5 mr-2" /> Зняти з розкладу
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                      {item.status === "draft" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openReschedule(item.id)}>
                          <CalendarDays className="h-3 w-3" /> Запланувати
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Тижневий календар публікацій</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs font-medium text-foreground hover:text-primary transition-colors min-w-[140px] text-center"
                >
                  {weekLabel}
                </button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {weekOffset !== 0 && (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setWeekOffset(0)}>
                    Сьогодні
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {weekDayLabels.map((dayLabel, i) => {
                const dayDate = weekDays[i];
                const isToday = isSameDay(dayDate, today);
                const dayItems = calendarItems[i] || [];
                const count = dayItems.length;

                return (
                  <div key={dayLabel + i} className="text-center">
                    <div className={cn(
                      "text-xs font-medium py-1",
                      isToday ? "text-primary font-bold" : "text-muted-foreground"
                    )}>
                      {dayLabel}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 pb-1">
                      <span className={cn(
                        "text-xs",
                        isToday ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-bold" : "text-muted-foreground/60"
                      )}>
                        {format(dayDate, "d")}
                      </span>
                      <span className={cn("w-1.5 h-1.5 rounded-full", getDensityColor(count))} />
                    </div>
                    <div className={cn(
                      "min-h-[120px] max-h-[200px] overflow-y-auto rounded-md p-1 space-y-1",
                      isToday ? "bg-primary/5 ring-1 ring-primary/20" : "bg-muted/20"
                    )}>
                      {count === 0 ? (
                        <span className="text-muted-foreground/40 text-[10px] block pt-4">Немає публікацій</span>
                      ) : (
                        dayItems.map(item => (
                          <Popover key={item.id}>
                            <PopoverTrigger asChild>
                              <button
                                className={cn(
                                  "w-full text-xs p-1.5 rounded text-left leading-tight cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all",
                                  item.status === "published"
                                    ? "bg-accent/60 text-accent-foreground"
                                    : "bg-secondary text-secondary-foreground"
                                )}
                              >
                                <span className="font-medium line-clamp-2">{item.title}</span>
                                <span className="text-[11px] opacity-70 flex items-center gap-0.5 mt-0.5">
                                  <Clock className="h-2.5 w-2.5" />
                                  {item.scheduledAt.split(" ")[1]}
                                </span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3 space-y-2" side="bottom">
                              <p className="text-sm font-medium leading-tight">{item.title}</p>
                              <div className="flex flex-wrap gap-1.5">
                                <Badge variant="outline" className="text-[10px]">{typeLabels[item.type]}</Badge>
                                <Badge variant="secondary" className="text-[10px]">{hubLabels[item.hub]}</Badge>
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusColors[item.status])}>
                                  {pubStatusLabels[item.status]}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground space-y-0.5">
                                <p className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.scheduledAt}</p>
                                <p className="flex items-center gap-1"><Users className="h-3 w-3" />{audienceLabels[item.audience]}</p>
                                <p className="flex items-center gap-1"><PenLine className="h-3 w-3" />{item.author}</p>
                              </div>
                              <div className="flex gap-1.5 pt-1">
                                <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => openReschedule(item.id)}>
                                  <CalendarDays className="h-3 w-3 mr-1" /> Змінити час
                                </Button>
                                {item.status === "scheduled" && (
                                  <Button size="sm" className="h-7 text-xs flex-1 gap-1" onClick={() => handlePublishNow(item.id)}>
                                    <Send className="h-3 w-3" /> Опублікувати
                                  </Button>
                                )}
                              </div>
                              {item.status === "scheduled" && (
                                <Button size="sm" variant="ghost" className="h-7 text-xs w-full text-destructive hover:text-destructive" onClick={() => handleUnschedule(item.id)}>
                                  <X className="h-3 w-3 mr-1" /> Зняти з розкладу
                                </Button>
                              )}
                            </PopoverContent>
                          </Popover>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleId !== null} onOpenChange={(open) => { if (!open) setRescheduleId(null); }}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-base">
              {items.find(a => a.id === rescheduleId)?.status === "draft" ? "Запланувати публікацію" : "Змінити час публікації"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground truncate">
              {items.find(a => a.id === rescheduleId)?.title}
            </p>
            <Calendar
              mode="single"
              selected={rescheduleDate}
              onSelect={setRescheduleDate}
              className="p-3 pointer-events-auto mx-auto"
            />
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">Час:</Label>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="h-8 text-xs w-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRescheduleId(null)}>Скасувати</Button>
            <Button size="sm" onClick={handleRescheduleConfirm} disabled={!rescheduleDate}>
              <CalendarDays className="h-3.5 w-3.5 mr-1" /> Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Analytics Tab
// ═════════════════════════════════════════════════════════════

function AnalyticsTab({ moderationArticles, planItems }: { moderationArticles: MockArticle[]; planItems: PlanItem[] }) {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"today" | "all">("all");

  const todayStr = new Date().toISOString().split("T")[0];
  const filteredArticles = analyticsPeriod === "today"
    ? moderationArticles.filter(a => a.generatedAt.startsWith(todayStr))
    : moderationArticles;

  const periodLabel = analyticsPeriod === "today" ? "сьогодні" : "за весь час";

  const totalGenerated = filteredArticles.length;
  const approved = filteredArticles.filter(a => a.status === "reviewed").length;
  const rejected = filteredArticles.filter(a => a.status === "rejected").length;
  const onModeration = filteredArticles.filter(a => a.status === "draft").length;
  const avgQuality = totalGenerated > 0 ? Math.round(filteredArticles.reduce((sum, a) => sum + a.qualityScore, 0) / totalGenerated) : 0;
  const approvalPct = totalGenerated > 0 ? ((approved / totalGenerated) * 100).toFixed(0) : "0";

  const metrics = [
    { label: "Згенеровано", value: String(totalGenerated), icon: Sparkles, change: periodLabel },
    { label: "Затверджено", value: String(approved), icon: Check, change: `${approvalPct}% від загальної кількості` },
    { label: "На модерації", value: String(onModeration), icon: Clock, change: "очікують перевірки" },
    { label: "Якість", value: String(avgQuality), icon: Star, change: "середній бал (0–100)" },
  ];

  // By type
  const typeMap = new Map<string, { generated: number; approved: number }>();
  for (const a of filteredArticles) {
    const label = typeLabels[a.type] || a.type;
    const entry = typeMap.get(label) || { generated: 0, approved: 0 };
    entry.generated++;
    if (a.status === "reviewed") entry.approved++;
    typeMap.set(label, entry);
  }
  const byType = Array.from(typeMap.entries()).map(([type, counts]) => ({
    type, generated: counts.generated, approved: counts.approved,
    approvalPct: counts.generated > 0 ? Math.round((counts.approved / counts.generated) * 100) : 0,
  })).sort((a, b) => b.generated - a.generated).slice(0, 5);
  const maxVal = Math.max(...byType.map(r => r.generated), 1);

  // Keywords with counts
  const keywordCounts = new Map<string, number>();
  for (const a of filteredArticles) {
    for (const tag of a.tags) {
      keywordCounts.set(tag, (keywordCounts.get(tag) || 0) + 1);
    }
  }
  const topKeywords = Array.from(keywordCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Pipeline from planItems
  const pipelineIdeas = planItems.filter(p => p.status === "idea").length;
  const pipelineGenerating = planItems.filter(p => p.status === "generating").length;
  const pipelineStages = [
    { label: "Ідеї", count: pipelineIdeas },
    { label: "Генерація", count: pipelineGenerating },
    { label: "Модерація", count: onModeration },
    { label: "Затверджено", count: approved },
    { label: "Відхилено", count: rejected },
  ];

  return (
    <div className="space-y-6">
      {/* Period switcher */}
      <div className="inline-flex items-center rounded-lg bg-muted p-1">
        <button
          onClick={() => setAnalyticsPeriod("today")}
          className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${analyticsPeriod === "today" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Сьогодні
        </button>
        <button
          onClick={() => setAnalyticsPeriod("all")}
          className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${analyticsPeriod === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          За весь час
        </button>
      </div>

      {totalGenerated === 0 && analyticsPeriod === "today" ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Сьогодні ще немає згенерованого контенту
          </CardContent>
        </Card>
      ) : (<>
      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="py-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-2xl font-bold">{m.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground/70">{m.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Воронка контенту</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {pipelineStages.map((stage, i) => {
              const maxCount = Math.max(...pipelineStages.map(s => s.count), 1);
              const width = Math.max(20, (stage.count / maxCount) * 100);
              return (
                <div key={stage.label} className="flex items-center gap-1 flex-1">
                  <div className="flex-1 text-center">
                    <div
                      className="mx-auto rounded bg-primary/20 flex items-center justify-center text-sm font-bold"
                      style={{ height: "40px", width: `${width}%`, minWidth: "36px" }}
                    >
                      {stage.count}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stage.label}</p>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Distribution by type */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Розподіл по типах контенту</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {byType.map(row => (
              <div key={row.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {row.generated} шт. · {row.approvalPct}% схвалено
                  </span>
                </div>
                <div className="bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(row.generated / maxVal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Популярні ключові слова</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map(([kw, count]) => (
              <Badge key={kw} variant="secondary" className="text-xs">{kw} ({count})</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Trend */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Тренд якості</CardTitle></CardHeader>
        <CardContent>
          {(() => {
            const dateScores = new Map<string, number[]>();
            for (const a of moderationArticles) {
              const d = a.generatedAt.split("T")[0];
              const arr = dateScores.get(d) || [];
              arr.push(a.qualityScore);
              dateScores.set(d, arr);
            }
            const sorted = Array.from(dateScores.entries()).sort((a, b) => a[0].localeCompare(b[0]));
            const trendData = sorted.map(([date, scores]) => ({
              date: date.slice(5).replace("-", "/"),
              score: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
            }));

            if (trendData.length < 2) {
              return <p className="text-sm text-muted-foreground text-center py-4">Недостатньо даних (потрібно мін. 2 дні)</p>;
            }

            const scores = trendData.map(d => d.score);
            const minScore = Math.min(...scores);
            const maxScore = Math.max(...scores);
            const range = maxScore - minScore || 10;
            const padMin = minScore - range * 0.15;
            const padMax = maxScore + range * 0.15;
            const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            const avgPct = ((avgScore - padMin) / (padMax - padMin)) * 100;

            return (
              <>
                <div className="relative flex items-end gap-1 h-28">
                  {/* Average line */}
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/30"
                    style={{ bottom: `${avgPct}%` }}
                  >
                    <span className="absolute -top-4 right-0 text-[10px] text-muted-foreground">сер. {avgScore}</span>
                  </div>
                  {trendData.map((d, i) => {
                    const heightPct = ((d.score - padMin) / (padMax - padMin)) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex items-end justify-center" style={{ height: "96px" }}>
                          <div
                            className="w-full max-w-[32px] bg-primary/25 hover:bg-primary/45 transition-colors rounded-t-sm relative group"
                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {d.score}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1">{d.date}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>
    </>)}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// Main Page — shared state hub
// ═════════════════════════════════════════════════════════════

export default function AutoContentAdmin() {
  const [activeTab, setActiveTab] = useState("plan");

  // ── Shared settings state (lifted from SettingsTab) ──
  const [types, setTypes] = useState(initialContentTypeConfigs);
  const [sources, setSources] = useState(initialDataSources);
  const [model, setModel] = useState("gemini-flash");
  const [frequency, setFrequency] = useState("daily");
  const [articlesPerBatch, setArticlesPerBatch] = useState("3");
  const [tone, setTone] = useState("professional");
  const [autoLaunch, setAutoLaunch] = useState(true);
  const [brandVoice, setBrandVoice] = useState(
    "FINTODO — це український фінансовий портал для підприємців, бухгалтерів та фізичних осіб. Тон: професійний але доступний. Уникаємо канцеляриту. Даємо конкретні цифри та посилання на нормативні акти."
  );
  const [guardrails, setGuardrails] = useState("Заборонені теми: політика, релігія. Обов'язково: перевіряти актуальність даних, посилатися на офіційні джерела (ДПС, НБУ, ВРУ).");

  // ── AI Verification settings ──
  const [verificationSettings, setVerificationSettings] = useState<AIVerificationSettings>({
    autoVerify: true,
    autoApproveThreshold: 80,
    checks: { brandVoice: true, uniqueness: true, facts: true, seo: true, structure: true },
    verificationModel: "gemini-pro",
  });

  // ── Shared plan & moderation state ──
  const [planItems, setPlanItems] = useState(initialPlanItems);
  const [moderationArticles, setModerationArticles] = useState(initialModerationArticles);

  const enabledSourcesCount = sources.filter(s => s.enabled).length;

  // ── Restore settings from localStorage ──
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
      if (s.verificationSettings) setVerificationSettings(s.verificationSettings);
      if (s.types) {
        setTypes(prev => prev.map(t => {
          const saved = s.types.find((st: any) => st.id === t.id);
          return saved ? { ...t, enabled: saved.enabled, prompt: saved.prompt, audience: saved.audience } : t;
        }));
      }
      if (s.sources) {
        setSources(prev => prev.map(src => {
          const saved = s.sources.find((ss: any) => ss.id === src.id);
          return saved ? { ...src, enabled: saved.enabled } : src;
        }));
      }
    } catch { /* ignore */ }
  }, []);

  // ── Pipeline: generating items progress tick → complete → move to moderation ──
  useEffect(() => {
    const generatingItems = planItems.filter(i => i.status === "generating");
    if (generatingItems.length === 0) return;

    const interval = setInterval(() => {
      setPlanItems(prev => {
        const updated = prev.map(item => {
          if (item.status !== "generating") return item;
          const newProgress = Math.min(100, (item.progress ?? 0) + Math.floor(Math.random() * 15) + 5);
          return { ...item, progress: newProgress };
        });
        return updated;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [planItems.filter(i => i.status === "generating").length]);

  // ── When progress reaches 100, move to moderation with real AI ──
  useEffect(() => {
    const completed = planItems.filter(i => i.status === "generating" && (i.progress ?? 0) >= 100);
    if (completed.length === 0) return;

    const timeout = setTimeout(async () => {
      // Generate articles via AI (with fallback)
      const newArticles: MockArticle[] = [];
      for (const item of completed) {
        const result = await generateArticleContent(item, brandVoice, tone, guardrails);
        const qualityScore = calcQuality({ content: result.content, wordCount: result.wordCount });

        newArticles.push({
          id: Date.now() + item.id,
          title: item.topic,
          type: item.type,
          audience: item.audience,
          hub: item.hub,
          tags: item.keywords,
          tldr: result.tldr,
          readingMinutes: Math.max(2, Math.ceil(result.wordCount / 200)),
          status: "draft" as const,
          generatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          wordCount: result.wordCount,
          content: result.content,
          qualityScore,
          seoTitle: item.topic.slice(0, 60),
          seoDescription: result.tldr.slice(0, 155),
          slug: generateSlug(item.topic),
        });
      }

      setModerationArticles(prev => [...newArticles, ...prev]);
      setPlanItems(prev => prev.filter(i => !(i.status === "generating" && (i.progress ?? 0) >= 100)));

      // Trigger AI verification in background for auto-verify
      if (verificationSettings.autoVerify) {
        for (const article of newArticles) {
          verifyArticleContent(article.title, article.content, brandVoice, verificationSettings.checks)
            .then(verification => {
              if (verification) {
                setModerationArticles(prev => prev.map(a => a.id === article.id ? { ...a, aiVerification: verification } : a));
              }
            })
            .catch(() => { /* verification failed silently */ });
        }
      }

      toast.success(`${completed.length} стаття(ей) згенеровано → Модерація`, {
        description: "Перейдіть на вкладку Модерація для перегляду",
        action: { label: "Відкрити", onClick: () => setActiveTab("moderation") },
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [planItems, brandVoice, tone, guardrails]);

  // ── "Згенерувати зараз" from Settings → creates ideas in Content Plan ──
  const handleGenerateNow = useCallback(() => {
    const enabledTypes = types.filter(t => t.enabled);
    const count = Math.min(parseInt(articlesPerBatch), enabledTypes.length);
    if (count === 0) {
      toast.error("Немає увімкнених типів контенту");
      return;
    }

    const baseId = Math.max(0, ...planItems.map(i => i.id)) + 1;
    const newIdeas: PlanItem[] = [];
    for (let i = 0; i < count; i++) {
      const typeConfig = enabledTypes[i % enabledTypes.length];
      newIdeas.push({
        id: baseId + i,
        topic: `[Авто] ${typeConfig.label} — ${new Date().toLocaleDateString("uk")}`,
        type: typeConfig.id,
        audience: typeConfig.audience,
        hub: typeConfig.id === "dps" || typeConfig.id === "news" || typeConfig.id === "change" ? "taxes" : typeConfig.audience === "fop" ? "fop" : typeConfig.audience === "personal" ? "personal" : "accounting",
        keywords: ["авто", typeConfig.id],
        status: "generating",
        progress: 0,
        description: `Автоматично згенеровано з налаштувань (модель: ${model})`,
      });
    }

    setPlanItems(prev => [...prev, ...newIdeas]);
    setActiveTab("plan");
    toast.info(`Додано ${count} елементів у Контент-план → В роботі`, {
      description: `Модель: ${model} · Типи: ${enabledTypes.slice(0, count).map(t => t.label).join(", ")}`,
    });
  }, [types, articlesPerBatch, model, planItems]);

  return (
    <div className="space-y-0">
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Автоконтент
        </h1>
        <p className="text-sm text-muted-foreground mt-1">AI Content Operations — генерація, модерація та публікація контенту</p>
      </div>

      <SubtabShelf
        tabs={subtabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        entityStyle={{ pillActiveClass: "bg-primary/10 text-primary ring-primary/30", color: "text-primary" }}
      />

      <div className="p-6">
        {activeTab === "plan" && (
          <ContentPlanTab
            items={planItems}
            setItems={setPlanItems}
            sources={sources}
            model={model}
            enabledSourcesCount={enabledSourcesCount}
          />
        )}
        {activeTab === "moderation" && (
          <ModerationTab
            articles={moderationArticles}
            setArticles={setModerationArticles}
            model={model}
            brandVoice={brandVoice}
            tone={tone}
            guardrails={guardrails}
            verificationSettings={verificationSettings}
          />
        )}
        {activeTab === "publication" && <PublicationTab approvedArticles={moderationArticles.filter(a => a.status === "reviewed")} />}
        {activeTab === "analytics" && <AnalyticsTab moderationArticles={moderationArticles} planItems={planItems} />}
      </div>
    </div>
  );
}
