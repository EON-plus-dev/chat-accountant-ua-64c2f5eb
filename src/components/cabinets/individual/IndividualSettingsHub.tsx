import {
  User, Receipt, KeyRound, Bell, Shield, Bot, Target, Users, BookOpen, ScrollText, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsHubCard } from "@/components/user-settings/hub/SettingsHubCard";
import type { Cabinet } from "@/types/cabinet";

interface Props {
  cabinet: Cabinet;
  onSubTabChange?: (subTab: string) => void;
}

export default function IndividualSettingsHub({ cabinet, onSubTabChange }: Props) {
  const go = (tab: string) => onSubTabChange?.(tab);
  const securityScore = 92;

  return (
    <div className="w-full max-w-6xl mx-auto px-1 md:px-2 py-1 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Налаштування кабінету</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Швидкий старт по всіх розділах налаштувань — {cabinet.name}.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => go("kep-signatures")} className="gap-2">
          <ShieldCheck className="w-4 h-4" />
          Центр безпеки
        </Button>
      </header>

      {/* Акаунт */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Акаунт
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SettingsHubCard
            icon={User}
            tone="violet"
            title="Профіль та реквізити"
            description="Особисті дані та реквізити для документів"
            onClick={() => go("profile-requisites")}
          />
          <SettingsHubCard
            icon={Receipt}
            tone="indigo"
            title="Податковий профіль"
            description="Система оподаткування та статуси"
            onClick={() => go("tax-profile")}
          />
          <SettingsHubCard
            icon={KeyRound}
            tone="emerald"
            title="КЕП/Підпис"
            description="Електронні підписи та Дія.Підпис"
            onClick={() => go("kep-signatures")}
          />
        </div>
      </section>

      {/* Система */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Система
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SettingsHubCard
            icon={Bell}
            tone="amber"
            title="Сповіщення"
            description="Правила сповіщень та канали доставки"
            onClick={() => go("notifications")}
          />
          <SettingsHubCard
            icon={Shield}
            tone="sky"
            title="Підключення та приватність"
            description="Підписки на заклади, банки, дозволи та експорт"
            onClick={() => go("connections-privacy")}
          />
          <SettingsHubCard
            icon={Bot}
            tone="violet"
            title="AI-автодії"
            description="Автоматизація рутинних дій"
            onClick={() => go("ai-actions")}
          />
        </div>
      </section>

      {/* Платформа */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Платформа
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SettingsHubCard
            icon={Target}
            tone="rose"
            title="Цілі та бюджет"
            description="Особисті плани, ліміти та цілі"
            onClick={() => go("goals-budget")}
          />
          <SettingsHubCard
            icon={Users}
            tone="indigo"
            title="Команда та делегування"
            description="Доступи, ролі та КЕП-делегації"
            onClick={() => go("team-access")}
          />
          <SettingsHubCard
            icon={BookOpen}
            tone="blue"
            title="Довідники"
            description="Контрагенти, категорії та довідкові дані"
            onClick={() => go("references")}
          />
          <SettingsHubCard
            icon={ScrollText}
            tone="amber"
            title="Журнал підписів"
            description="Аудит-trail усіх КЕП-підписів"
            onClick={() => go("signature-log")}
          />
        </div>
      </section>

      <button
        type="button"
        onClick={() => go("kep-signatures")}
        className="w-full rounded-2xl border border-border/70 bg-card p-4 md:p-5 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow text-left"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-500/15">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base font-semibold">Рівень безпеки кабінету</h3>
              <span className="text-sm text-muted-foreground">
                КЕП активний, делегування під контролем
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
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${securityScore}%` }} />
            </div>
          </div>
          <span className="hidden md:inline-flex items-center text-sm font-medium text-primary shrink-0">
            Перейти в КЕП/Підпис →
          </span>
        </div>
      </button>
    </div>
  );
}
