import { ShieldCheck } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { Button } from "@/components/ui/button";
import { SettingsHubCard, type HubTone } from "@/components/user-settings/hub/SettingsHubCard";
import {
  getSettingsSubTabs,
  getSettingsSubTabsForPassive,
  type SettingsSubTab,
} from "@/config/settingsConfig";

interface Props {
  cabinet: Cabinet;
  onSubTabChange?: (subTab: string) => void;
}

type SectionKey = "account" | "system" | "platform" | "other";

const SECTION_TITLE: Record<SectionKey, string> = {
  account: "Акаунт",
  system: "Система",
  platform: "Платформа",
  other: "Інше",
};

const SECTION_ORDER: SectionKey[] = ["account", "system", "platform", "other"];

const SECTION_OF: Record<string, SectionKey> = {
  "profile-requisites": "account",
  "tax-profile": "account",
  "kep-signatures": "account",
  "kved-licensing": "account",
  notifications: "system",
  connections: "system",
  "document-policies": "system",
  "ai-actions": "system",
  "goals-budget": "platform",
  "team-access": "platform",
  "network-partners": "platform",
  references: "platform",
  "signature-log": "platform",
  salon: "platform",
};

const TONE_OF: Record<string, HubTone> = {
  "profile-requisites": "violet",
  "tax-profile": "indigo",
  "kep-signatures": "emerald",
  "kved-licensing": "blue",
  notifications: "amber",
  connections: "sky",
  "document-policies": "indigo",
  "ai-actions": "violet",
  "goals-budget": "rose",
  "team-access": "indigo",
  "network-partners": "sky",
  references: "blue",
  "signature-log": "amber",
  salon: "rose",
};

export default function CabinetSettingsHub({ cabinet, onSubTabChange }: Props) {
  const go = (tab: string) => onSubTabChange?.(tab);
  const isPassive = cabinet.accessMode === "passive";
  const subtabs = isPassive
    ? getSettingsSubTabsForPassive(cabinet.type)
    : getSettingsSubTabs(cabinet.type, cabinet);

  const bySection = new Map<SectionKey, SettingsSubTab[]>();
  for (const tab of subtabs) {
    const key = SECTION_OF[tab.id] ?? "other";
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key)!.push(tab);
  }

  const securityScore = 88;

  return (
    <div className="w-full max-w-6xl mx-auto px-1 md:px-2 py-1 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Налаштування кабінету</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Швидкий старт по всіх розділах налаштувань — {cabinet.name}.
            {isPassive && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                Режим контрагента
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => go("kep-signatures")} className="gap-2">
          <ShieldCheck className="w-4 h-4" />
          Центр безпеки
        </Button>
      </header>

      {SECTION_ORDER.map((key) => {
        const tabs = bySection.get(key);
        if (!tabs || tabs.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {SECTION_TITLE[key]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tabs.map((tab) => (
                <SettingsHubCard
                  key={tab.id}
                  icon={tab.icon}
                  tone={TONE_OF[tab.id] ?? "blue"}
                  title={tab.label}
                  description={tab.description ?? "Перейти в розділ"}
                  onClick={() => go(tab.id)}
                />
              ))}
            </div>
          </section>
        );
      })}

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
