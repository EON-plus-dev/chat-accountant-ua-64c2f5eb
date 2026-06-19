import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles, LayoutDashboard, Wallet, Clock, Heart, GraduationCap,
  Briefcase, House, GitCompare, TrendingUp, Brain,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";

interface Props {
  cabinet: Cabinet;
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

interface Metric { label: string; value: string; delta?: string; positive?: boolean }

function MetricRow({ items }: { items: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((m) => (
        <div key={m.label}>
          <div className="text-xs text-muted-foreground">{m.label}</div>
          <div className="font-semibold text-sm">{m.value}</div>
          {m.delta && (
            <div className={cn("text-[11px]", m.positive ? "text-emerald-600" : "text-rose-600")}>{m.delta}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function Section({
  icon, tone, title, subtitle, children,
}: {
  icon: React.ReactNode; tone: Tone; title: string; subtitle?: string; children: React.ReactNode;
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
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">{children}</CardContent>
    </Card>
  );
}

export function IndividualAnalyticsBoard({ cabinet: _cabinet, onChatPromptInsert }: Props) {
  const soon = (what: string) => toast({ title: what, description: "Незабаром — поглиблений вигляд." });

  return (
    <div className="max-w-7xl mx-auto w-full p-3 md:p-6 space-y-5">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-blue-50 to-violet-50 dark:from-emerald-950/30 dark:via-blue-950/30 dark:to-violet-950/30 p-5 md:p-6 border border-border/40">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" /> Аналітика
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold mt-1.5">Ваш стан</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Перетин ваших сфер: фінанси, час, здоровʼя, освіта, карʼєра, дім. AI знаходить звʼязки і прогнозує тренди.
        </p>
        <Button size="sm" className="mt-4" onClick={() => onChatPromptInsert?.("Зроби тижневий огляд моїх справ")}>
          <Sparkles className="w-4 h-4 mr-1.5" /> AI-аналіз тижня
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Section icon={<LayoutDashboard className="w-5 h-5" />} tone="violet" title="Summary" subtitle="Загальний пульс">
          <MetricRow items={[
            { label: "Health Score", value: "82/100", delta: "+3", positive: true },
            { label: "Wealth Score", value: "74/100", delta: "+2", positive: true },
            { label: "Time Index", value: "68/100", delta: "−4" },
            { label: "Growth", value: "5 курсів" },
          ]} />
        </Section>

        <Section icon={<Wallet className="w-5 h-5" />} tone="emerald" title="Фінанси" subtitle="Cashflow місяця">
          <MetricRow items={[
            { label: "Дохід", value: "84 200 ₴", delta: "+6%", positive: true },
            { label: "Витрати", value: "52 700 ₴", delta: "+11%" },
            { label: "Чистий", value: "31 500 ₴", positive: true },
            { label: "Savings rate", value: "37%" },
          ]} />
          <Button size="sm" variant="ghost" className="h-7 px-2 -ml-2 text-primary" onClick={() => soon("Розкласти по категоріях")}>
            Розкласти по категоріях →
          </Button>
        </Section>

        <Section icon={<Clock className="w-5 h-5" />} tone="blue" title="Час" subtitle="Розподіл тижня">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Робота</span><span className="text-muted-foreground">42 год</span></div>
            <div className="flex justify-between"><span>Сон</span><span className="text-muted-foreground">52 год</span></div>
            <div className="flex justify-between"><span>Спорт</span><span className="text-muted-foreground">5 год</span></div>
            <div className="flex justify-between"><span>Сімʼя</span><span className="text-muted-foreground">14 год</span></div>
            <div className="flex justify-between"><span>Навчання</span><span className="text-muted-foreground">6 год</span></div>
          </div>
        </Section>

        <Section icon={<Heart className="w-5 h-5" />} tone="rose" title="Здоровʼя" subtitle="Ключові маркери">
          <MetricRow items={[
            { label: "Кроки/день", value: "8 240", positive: true },
            { label: "Пульс спок.", value: "62 уд/хв" },
            { label: "Сон", value: "7.2 год" },
            { label: "Тренувань", value: "3/тижд" },
          ]} />
        </Section>

        <Section icon={<GraduationCap className="w-5 h-5" />} tone="violet" title="Освіта" subtitle="Прогрес навчання">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Активних курсів</span><Badge variant="secondary" className="text-[10px]">3</Badge></div>
            <div className="flex justify-between"><span>Завершено за рік</span><Badge variant="outline" className="text-[10px]">7</Badge></div>
            <div className="flex justify-between"><span>Год навчання/тижд</span><span className="text-muted-foreground">6.5</span></div>
          </div>
        </Section>

        <Section icon={<Briefcase className="w-5 h-5" />} tone="amber" title="Карʼєра" subtitle="Поточна траєкторія">
          <MetricRow items={[
            { label: "Дохід (рік)", value: "1.01 М₴", delta: "+12%", positive: true },
            { label: "Бенчмарк ринку", value: "+8% вище", positive: true },
            { label: "Кар. ціль", value: "67%" },
            { label: "Інтервʼю", value: "2 актив." },
          ]} />
        </Section>

        <Section icon={<House className="w-5 h-5" />} tone="emerald" title="Дім" subtitle="Витрати дому">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Комуналка</span><span className="text-muted-foreground">3 240 ₴</span></div>
            <div className="flex justify-between"><span>Інтернет/підписки</span><span className="text-muted-foreground">1 180 ₴</span></div>
            <div className="flex justify-between"><span>Сервіси/прибирання</span><span className="text-muted-foreground">2 400 ₴</span></div>
            <div className="flex justify-between font-medium"><span>Разом</span><span>6 820 ₴</span></div>
          </div>
        </Section>

        <Section icon={<GitCompare className="w-5 h-5" />} tone="blue" title="Порівняння" subtitle="Місяць · рік">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span>Витрати vs минулий міс</span><span className="text-rose-600">+11%</span></div>
            <div className="flex justify-between"><span>Дохід vs минулий рік</span><span className="text-emerald-600">+18%</span></div>
            <div className="flex justify-between"><span>Час на сімʼю</span><span className="text-emerald-600">+9%</span></div>
            <div className="flex justify-between"><span>Час на спорт</span><span className="text-rose-600">−14%</span></div>
          </div>
        </Section>

        <Section icon={<TrendingUp className="w-5 h-5" />} tone="violet" title="Прогнози" subtitle="На 3–12 місяців">
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>• Заощадження за рік: ~378 ₴k</li>
            <li>• Реальна податкова знижка: ~14 200 ₴</li>
            <li>• Прогноз ваги: −3 кг до серпня</li>
          </ul>
        </Section>

        <Section icon={<Brain className="w-5 h-5" />} tone="rose" title="AI-інсайти" subtitle="Що варто помітити">
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>• Витрати на доставку зросли на 38% — варіант оптимізації.</li>
            <li>• 3 поліси завершаться у червні — обʼєднайте продовження.</li>
            <li>• Сон &lt; 7 год у пʼятницях — корелює з продуктивністю.</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

export default IndividualAnalyticsBoard;
