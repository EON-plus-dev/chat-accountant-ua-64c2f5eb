import {
  User, Shield, Lock, Bell, Link2, Sparkles, Gem, Users, LifeBuoy,
  Mail, Smartphone, MessageSquare, KeyRound, Monitor, ShieldCheck, FileDown, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SettingsHubCard } from "./hub/SettingsHubCard";

interface Props {
  onSubTabChange?: (subTab: string) => void;
}

export default function SettingsHub({ onSubTabChange }: Props) {
  const { toast } = useToast();
  const go = (tab: string) => onSubTabChange?.(tab);
  const soon = (what: string) =>
    toast({ title: `${what} — скоро`, description: "Розділ зʼявиться у наступному оновленні." });

  // Mock — реальні значення підтягнемо у Phase 4
  const securityScore = 92;

  return (
    <div className="w-full max-w-6xl mx-auto px-1 md:px-2 py-1 space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Налаштування</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Керуйте системою, безпекою, інтеграціями та персональними параметрами.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => go("security")} className="gap-2">
          <ShieldCheck className="w-4 h-4" />
          Центр безпеки
        </Button>
      </header>

      {/* GROUP 1: Акаунт */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Акаунт
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SettingsHubCard
            icon={User}
            tone="violet"
            title="Профіль"
            description="Особисті дані, фото, мова та регіон"
            items={[
              { label: "Українська", value: "UA" },
              { label: "Часовий пояс", value: "GMT+3 Київ" },
            ]}
            onClick={() => go("personal")}
          />
          <SettingsHubCard
            icon={Shield}
            tone="emerald"
            title="Безпека"
            description="Захист акаунту, паролі, пристрої та сесії"
            items={[
              { icon: KeyRound, label: "Двоетапна перевірка", value: "Увімкнено", valueClassName: "text-emerald-600 dark:text-emerald-400" },
              { icon: MessageSquare, label: "Активні сесії", value: "3" },
              { icon: Monitor, label: "Довірені пристрої", value: "5" },
            ]}
            onClick={() => go("security")}
          />
          <SettingsHubCard
            icon={Lock}
            tone="blue"
            title="Конфіденційність"
            description="Керування даними, дозволами та згодами"
            items={[
              { icon: ShieldCheck, label: "Керування дозволами" },
              { icon: FileDown, label: "Експорт моїх даних" },
              { icon: History, label: "Історія згод" },
            ]}
            onClick={() => go("export")}
          />
        </div>
      </section>

      {/* GROUP 2: Система */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Система
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SettingsHubCard
            icon={Bell}
            tone="amber"
            title="Сповіщення"
            description="Налаштуйте, як і про що ви хочете отримувати сповіщення"
            items={[
              { icon: Mail, label: "Email", value: "Увімкнено", valueClassName: "text-emerald-600 dark:text-emerald-400" },
              { icon: Bell, label: "Push", value: "Увімкнено", valueClassName: "text-emerald-600 dark:text-emerald-400" },
              { icon: Smartphone, label: "SMS", value: "Вимкнено", valueClassName: "text-muted-foreground" },
            ]}
            onClick={() => go("notifications")}
          />
          <SettingsHubCard
            icon={Link2}
            tone="sky"
            title="Інтеграції"
            description="Підключайте сервіси та керуйте доступом"
            items={[
              { label: "Дія · Monobank · Google · Apple", value: "+6" },
              { label: "Усі інтеграції", value: "9 активних", valueClassName: "text-foreground" },
            ]}
            onClick={() => soon("Інтеграції")}
          />
          <SettingsHubCard
            icon={Sparkles}
            tone="violet"
            title="AI Налаштування"
            description="Персоналізуйте роботу AI та рівень автоматизації"
            items={[
              { icon: Sparkles, label: "Рівень автономності", value: "Середній" },
              { icon: ShieldCheck, label: "Підтвердження дій", value: "Важливі дії" },
              { icon: Lock, label: "Safe Mode", value: "Увімкнено", valueClassName: "text-emerald-600 dark:text-emerald-400" },
            ]}
            onClick={() => soon("AI Налаштування")}
          />
        </div>
      </section>

      {/* GROUP 3: Платформа */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Платформа
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SettingsHubCard
            icon={Gem}
            tone="rose"
            title="Підписка та оплата"
            description="Керування підпискою, платежами та рахунками"
            items={[
              { label: "Premium Plan", value: "Активна", valueClassName: "text-emerald-600 dark:text-emerald-400" },
              { label: "Наступний платіж", value: "25.06.2026" },
            ]}
            onClick={() => go("tariff")}
          />
          <SettingsHubCard
            icon={Users}
            tone="indigo"
            title="Доступи та організації"
            description="Керування доступами, ролями та запрошеннями"
            items={[
              { label: "Мої організації", value: "4" },
              { label: "Запрошення", value: "2 очікують", valueClassName: "text-amber-600 dark:text-amber-400" },
              { label: "Ролі та доступи" },
            ]}
            onClick={() => go("cabinets")}
          />
          <SettingsHubCard
            icon={LifeBuoy}
            tone="amber"
            title="Підтримка та допомога"
            description="Отримайте допомогу та знайдіть відповіді"
            items={[
              { label: "Центр підтримки" },
              { label: "FAQ" },
              { label: "Надіслати відгук" },
            ]}
            onClick={() => soon("Центр підтримки")}
          />
        </div>
      </section>

      {/* Security strip */}
      <button
        type="button"
        onClick={() => go("security")}
        className="w-full rounded-2xl border border-border/70 bg-card p-4 md:p-5 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow text-left"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-500/15">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base font-semibold">Рівень безпеки</h3>
              <span className="text-sm text-muted-foreground">
                Ваш акаунт захищений на високому рівні
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xl font-bold tabular-nums">
                {securityScore}
                <span className="text-sm font-normal text-muted-foreground"> / 100</span>
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Високий рівень</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${securityScore}%` }}
              />
            </div>
          </div>
          <span className="hidden md:inline-flex items-center text-sm font-medium text-primary shrink-0">
            Детальний звіт →
          </span>
        </div>
      </button>
    </div>
  );
}
