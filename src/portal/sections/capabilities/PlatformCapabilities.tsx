import { Link } from "react-router-dom";
import {
  Calculator, Bot, CalendarClock, BarChart3, BookOpen, GraduationCap,
  FileText, BookOpenCheck, ScanSearch, FileStack, Wallet, ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

interface Capability {
  icon: LucideIcon;
  metric: string;
  title: string;
  desc: string;
  href: string;
  badge?: string;
}

const KNOWLEDGE_CAPABILITIES: Capability[] = [
  { icon: Calculator, metric: "12+", title: "Калькулятори", desc: "ЄСВ, ПДФО, зарплата — актуальні ставки 2026", href: "/tools" },
  { icon: Bot, metric: "<2 хв", title: "AI-консультант", desc: "Відповідь з посиланням на закон", href: "/qa" },
  { icon: CalendarClock, metric: "24/7", title: "Дедлайни", desc: "Авто-нагадування за 7, 3, 1 день", href: "/analytics/deadlines" },
  { icon: BarChart3, metric: "Live", title: "Аналітика", desc: "Курси, індекси, макропоказники", href: "/analytics" },
  { icon: BookOpen, metric: "200+", title: "База знань", desc: "Довідники, закони, КВЕД, гранти", href: "/dovidnyky" },
  { icon: GraduationCap, metric: "3 курси", title: "Навчання", desc: "Від нуля до декларації — безкоштовно", href: "/learn" },
];

const AUTOMATION_CAPABILITIES: Capability[] = [
  { icon: FileText, metric: "1 клік", title: "Авто-звітність", desc: "Декларації ФОП та фізосіб — формуються автоматично", href: "/" },
  { icon: BookOpenCheck, metric: "Auto", title: "Книга обліку", desc: "Доходи фіксуються автоматично — без ручного введення", href: "/" },
  { icon: ScanSearch, metric: "Live", title: "Фін. моніторинг", desc: "Контроль лімітів ЄП, P2P та порогів ДПС", href: "/" },
  { icon: FileStack, metric: "AI", title: "Документообіг", desc: "Акти, рахунки, договори — автозаповнення з реквізитів", href: "/tools/invoice" },
  { icon: Wallet, metric: "Smart", title: "Платіжний хаб", desc: "Податки, зарплати, контрагенти — платіжки з розрахунком", href: "/" },
  { icon: ShieldCheck, metric: "24/7", title: "Податковий аудит", desc: "Перевірка ризиків та відповідності перед подачею", href: "/" },
];

const CapabilityCard = ({ cap, accentClass }: { cap: Capability; accentClass: string }) => (
  <Link to={cap.href}>
    <Card className="h-full hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] transition-all group">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors", accentClass)}>
          <cap.icon className="h-5 w-5" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-lg font-bold tabular-nums", accentClass.includes("emerald") ? "text-emerald-600 dark:text-emerald-400" : "text-primary")}>
              {cap.metric}
            </span>
            <span className="text-sm font-semibold text-foreground">{cap.title}</span>
            {cap.badge && <Badge variant="secondary" size="sm">{cap.badge}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export const PlatformCapabilities = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="platform-capabilities"
      ref={ref}
      className={cn("py-10 sm:py-16 transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5")}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Одна платформа — повний контроль
          </h2>
          <p className="text-muted-foreground text-sm lg:text-base max-w-xl mx-auto">
            Усе, що потрібно для керування фінансами ФОП та фізичної особи — в одному місці
          </p>
        </div>

        {/* Knowledge & Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-1 w-6 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Знаємо і аналізуємо
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KNOWLEDGE_CAPABILITIES.map((cap) => (
              <CapabilityCard key={cap.title} cap={cap} accentClass="bg-primary/10 text-primary group-hover:bg-primary/20" />
            ))}
          </div>
        </div>

        {/* Automation & Control */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-1 w-6 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Автоматизуємо і контролюємо
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUTOMATION_CAPABILITIES.map((cap) => (
              <CapabilityCard key={cap.title} cap={cap} accentClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
