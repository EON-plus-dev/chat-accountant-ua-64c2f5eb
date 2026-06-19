import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock, CalendarDays, AlarmClock, History, Bell, ArrowRight, Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";

interface Props { cabinet: Cabinet }

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

function Section({
  icon, tone, title, subtitle, children, action,
}: {
  icon: React.ReactNode; tone: Tone; title: string; subtitle?: string;
  children: React.ReactNode; action?: { label: string; onClick: () => void };
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", toneBg[tone], toneIcon[tone])}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action && (
            <Button size="sm" variant="ghost" className="h-8 text-primary" onClick={action.onClick}>
              {action.label} <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function EventRow({
  time, title, meta, tone = "blue",
}: { time: string; title: string; meta?: string; tone?: Tone }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
      <div className={cn("text-xs font-medium w-14 shrink-0 mt-0.5", toneIcon[tone])}>{time}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">{title}</div>
        {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
      </div>
    </div>
  );
}

export function IndividualEventsBoard({ cabinet: _cabinet }: Props) {
  const soon = (what: string) => toast({ title: what, description: "Незабаром." });
  const today = new Date().toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="max-w-7xl mx-auto w-full p-3 md:p-6 space-y-5">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 p-5 md:p-6 border border-border/40">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" /> Події · {today}
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold mt-1.5">Сьогодні у вас 4 події</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Усе з ваших сфер в одному агенда-вигляді: візити, дедлайни, уроки, платежі.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          icon={<Clock className="w-5 h-5" />} tone="violet"
          title="Сьогодні" subtitle="Хронологія дня"
        >
          <div className="-mt-1">
            <EventRow time="09:00" title="Сніданок + ранкова рутина" tone="emerald" />
            <EventRow time="10:00" title="Візит до сімейного лікаря" meta="Клініка Добробут · вул. Лесі Українки 5" tone="rose" />
            <EventRow time="13:00" title="Обід з командою" tone="blue" />
            <EventRow time="16:00" title="Онлайн-урок англійської" meta="Skyeng · 60 хв" tone="violet" />
            <EventRow time="19:00" title="Тренування" tone="emerald" />
          </div>
        </Section>

        <Section
          icon={<AlarmClock className="w-5 h-5" />} tone="rose"
          title="Дедлайни" subtitle="Найближчі 30 днів"
          action={{ label: "Усі", onClick: () => soon("Дедлайни") }}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Декларація про доходи</span><Badge variant="destructive" className="text-[10px]">30 квіт</Badge></div>
            <div className="flex items-center justify-between"><span>ОСЦПВ — продовження</span><Badge variant="secondary" className="text-[10px]">15 трав</Badge></div>
            <div className="flex items-center justify-between"><span>Закордонний паспорт — закінчується</span><Badge variant="secondary" className="text-[10px]">22 трав</Badge></div>
            <div className="flex items-center justify-between"><span>Сертифікат IELTS — оновити</span><Badge variant="outline" className="text-[10px]">1 черв</Badge></div>
          </div>
        </Section>

        <Section
          icon={<CalendarDays className="w-5 h-5" />} tone="blue"
          title="Календар" subtitle="Тиждень · місяць"
          action={{ label: "Відкрити", onClick: () => soon("Календарний вигляд") }}
        >
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Пн","Вт","Ср","Чт","Пт","Сб","Нд"].map(d => (
              <div key={d} className="text-muted-foreground py-1">{d}</div>
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className={cn(
                "aspect-square rounded-md flex items-center justify-center",
                i === 2 && "bg-primary text-primary-foreground font-semibold",
                (i === 5 || i === 9 || i === 12) && "bg-violet-100 dark:bg-violet-950/40",
              )}>{i + 1}</div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Кольорові дати — дні з подіями.</p>
        </Section>

        <Section
          icon={<History className="w-5 h-5" />} tone="emerald"
          title="Стрічка" subtitle="Що відбулось"
          action={{ label: "Уся історія", onClick: () => soon("Журнал подій") }}
        >
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground text-xs mr-2">Вчора</span>Сплачено інтернет — 320 ₴</div>
            <div><span className="text-muted-foreground text-xs mr-2">Вчора</span>Завантажено довідку 2-ПДФО</div>
            <div><span className="text-muted-foreground text-xs mr-2">2 дні</span>Підписано договір з банком</div>
            <div><span className="text-muted-foreground text-xs mr-2">3 дні</span>Завершено курс «React Basics»</div>
          </div>
        </Section>

        <Section
          icon={<Bell className="w-5 h-5" />} tone="amber"
          title="Нагадування" subtitle="Повторювані + AI-rules"
          action={{ label: "Налаштувати", onClick: () => soon("Правила нагадувань") }}
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Передати показники лічильників</span><Badge variant="outline" className="text-[10px]">Щомісяця</Badge></div>
            <div className="flex items-center justify-between"><span>Чекап здоровʼя</span><Badge variant="outline" className="text-[10px]">Щороку</Badge></div>
            <div className="flex items-center justify-between"><span>Виплата по кредитній картці</span><Badge variant="outline" className="text-[10px]">25 числа</Badge></div>
          </div>
        </Section>
      </div>
    </div>
  );
}

export default IndividualEventsBoard;
