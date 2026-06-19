import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles, Inbox, AlertTriangle, Bell, PlugZap, CalendarDays,
  Activity, Workflow, Plus, ArrowRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import type { TabType } from "@/components/dashboard/WorkspacePanel";

interface Props {
  cabinet: Cabinet;
  onTabChange?: (tab: TabType, sub?: string) => void;
  onChatPromptInsert?: (prompt: string) => void;
}

type Tone = "violet" | "emerald" | "blue" | "rose" | "amber";

const toneBg: Record<Tone, string> = {
  violet: "bg-violet-50 dark:bg-violet-950/30",
  emerald: "bg-emerald-50 dark:bg-emerald-950/30",
  blue: "bg-blue-50 dark:bg-blue-950/30",
  rose: "bg-rose-50 dark:bg-rose-950/30",
  amber: "bg-amber-50 dark:bg-amber-950/30",
};
const toneIcon: Record<Tone, string> = {
  violet: "text-violet-600 dark:text-violet-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  blue: "text-blue-600 dark:text-blue-400",
  rose: "text-rose-600 dark:text-rose-400",
  amber: "text-amber-600 dark:text-amber-400",
};

interface TileProps {
  icon: React.ReactNode;
  tone: Tone;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  cta?: { label: string; onClick: () => void };
}

function Tile({ icon, tone, title, subtitle, children, cta }: TileProps) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", toneBg[tone], toneIcon[tone])}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base leading-tight">{title}</CardTitle>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {children}
        {cta && (
          <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2 text-primary" onClick={cta.onClick}>
            {cta.label} <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function IndividualOverviewBoard({ cabinet, onTabChange, onChatPromptInsert }: Props) {
  const go = (tab: TabType, sub?: string) => onTabChange?.(tab, sub);
  const soon = (what: string) => toast({ title: what, description: "Незабаром — у плані розробки." });
  const today = new Date().toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="max-w-7xl mx-auto w-full p-3 md:p-6 space-y-5">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50 dark:from-violet-950/30 dark:via-blue-950/30 dark:to-emerald-950/30 p-5 md:p-6 border border-border/40">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" /> Огляд · {today}
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold mt-1.5">Привіт, {cabinet.name?.split(" ")[0] || "користувачу"}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          AI стежить за вашими сферами. Сьогодні все під контролем — 2 справи потребують уваги.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" onClick={() => onChatPromptInsert?.("Розкажи що важливого сьогодні")}>
            <Sparkles className="w-4 h-4 mr-1.5" /> Запитати AI
          </Button>
          <Button size="sm" variant="outline" onClick={() => go("operations")}>
            Мої сфери
          </Button>
        </div>
      </div>

      {/* 3×3 Life Status Board */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          icon={<Sparkles className="w-5 h-5" />} tone="violet"
          title="AI-зведення дня"
          subtitle="Що нового, що важливо"
          cta={{ label: "Відкрити чат", onClick: () => onChatPromptInsert?.("Сформуй ранкове зведення") }}
        >
          <ul className="space-y-1.5 text-muted-foreground">
            <li>• Прийшов лист від ДПС — потребує підпису.</li>
            <li>• Поліс ОСЦПВ завершиться через 12 днів.</li>
            <li>• 3 нові операції по картці.</li>
          </ul>
        </Tile>

        <Tile
          icon={<Inbox className="w-5 h-5" />} tone="amber"
          title="Inbox дій"
          subtitle="Усе, що чекає на вас"
          cta={{ label: "Усі завдання", onClick: () => go("operations", "work-center") }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Підписати документ ДПС</span>
              <Badge variant="destructive" className="text-[10px]">Сьогодні</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Підтвердити витрату 2 450 ₴</span>
              <Badge variant="secondary" className="text-[10px]">2 дні</Badge>
            </div>
          </div>
        </Tile>

        <Tile
          icon={<AlertTriangle className="w-5 h-5" />} tone="rose"
          title="Радар ризиків"
          subtitle="Прогалини та дедлайни"
          cta={{ label: "Деталі", onClick: () => soon("Радар ризиків") }}
        >
          <ul className="space-y-1.5 text-muted-foreground">
            <li>• Немає страхування здоровʼя.</li>
            <li>• Декларація — дедлайн 30 квітня.</li>
            <li>• Лічильник води не передано 2 міс.</li>
          </ul>
        </Tile>

        <Tile
          icon={<Bell className="w-5 h-5" />} tone="blue"
          title="Сповіщення"
          subtitle="Від організацій та системи"
          cta={{ label: "Відкрити", onClick: () => soon("Центр сповіщень") }}
        >
          <ul className="space-y-1.5 text-muted-foreground">
            <li>• ПриватБанк: новий випуск картки.</li>
            <li>• Дія: оновлено паспорт.</li>
            <li>• Школа: розклад на тиждень.</li>
          </ul>
        </Tile>

        <Tile
          icon={<PlugZap className="w-5 h-5" />} tone="emerald"
          title="Підключення"
          subtitle="Банки, реєстри, КЕП"
          cta={{ label: "Налаштування", onClick: () => go("settings", "integrations") }}
        >
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">Дія ✓</Badge>
            <Badge variant="outline" className="text-[10px]">Моно ✓</Badge>
            <Badge variant="outline" className="text-[10px]">ПриватБанк ✓</Badge>
            <Badge variant="secondary" className="text-[10px]">КЕП —</Badge>
          </div>
        </Tile>

        <Tile
          icon={<CalendarDays className="w-5 h-5" />} tone="violet"
          title="Сьогодні та тиждень"
          subtitle="Найближчі події"
          cta={{ label: "Календар", onClick: () => go("event-journal") }}
        >
          <ul className="space-y-1.5 text-muted-foreground">
            <li>• 10:00 — візит до лікаря</li>
            <li>• 16:00 — онлайн-урок (Skyeng)</li>
            <li>• Завтра — оплата інтернету</li>
          </ul>
        </Tile>

        <Tile
          icon={<Activity className="w-5 h-5" />} tone="emerald"
          title="Ключові показники"
          subtitle="Cash · Net Worth · Health"
          cta={{ label: "Аналітика", onClick: () => go("analytics") }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div><div className="text-xs text-muted-foreground">Готівка</div><div className="font-semibold">48 200 ₴</div></div>
            <div><div className="text-xs text-muted-foreground">Net Worth</div><div className="font-semibold">312 ₴k</div></div>
            <div><div className="text-xs text-muted-foreground">Health</div><div className="font-semibold">82/100</div></div>
            <div><div className="text-xs text-muted-foreground">Звички</div><div className="font-semibold">5/7</div></div>
          </div>
        </Tile>

        <Tile
          icon={<Workflow className="w-5 h-5" />} tone="blue"
          title="Активні AI-сценарії"
          subtitle="Workflow Engine"
          cta={{ label: "Усі сценарії", onClick: () => soon("Workflow Center") }}
        >
          <ul className="space-y-1.5 text-muted-foreground">
            <li>• Авто-категоризація витрат</li>
            <li>• Нагадування про продовження полісів</li>
            <li>• Тижневий фінансовий брифінг</li>
          </ul>
        </Tile>

        <Tile
          icon={<Plus className="w-5 h-5" />} tone="rose"
          title="Швидко додати"
          subtitle="Задача · документ · витрата"
        >
          <div className="flex flex-col gap-1.5">
            <Button size="sm" variant="outline" className="justify-start" onClick={() => soon("Нова задача")}>+ Задача</Button>
            <Button size="sm" variant="outline" className="justify-start" onClick={() => soon("Завантажити документ")}>+ Документ</Button>
            <Button size="sm" variant="outline" className="justify-start" onClick={() => soon("Витрата")}>+ Витрата</Button>
          </div>
        </Tile>
      </div>
    </div>
  );
}

export default IndividualOverviewBoard;
