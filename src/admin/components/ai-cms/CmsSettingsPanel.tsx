import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Users,
  Bot,
  MessageSquare,
  Search,
  PenSquare,
  FolderTree,
  Globe,
  Wallet,
  Cog,
} from "lucide-react";
import AdminUsersPage from "@/admin/pages/AdminUsersPage";

import EditorialSettingsAdmin from "@/admin/pages/EditorialSettingsAdmin";
import HubsAdmin from "@/admin/pages/HubsAdmin";
import CategoriesAdmin from "@/admin/pages/CategoriesAdmin";
import DovidnykyAdmin from "@/admin/pages/DovidnykyAdmin";
import SiteConfigPage from "@/admin/pages/SiteConfigPage";
import AdminTopUp from "@/admin/pages/AdminTopUp";
import CmsCoreSettings from "./CmsCoreSettings";
import CmsAiConsultantSettings from "./CmsAiConsultantSettings";

type SettingsSection =
  | "access"
  | "ai-generation"
  | "ai-consultant"
  | "seo-config"
  | "editorial"
  | "taxonomy"
  | "site"
  | "billing";

const SECTIONS: { id: SettingsSection; label: string; icon: typeof Users; description: string }[] = [
  { id: "access", label: "Доступ і ролі", icon: Users, description: "Користувачі CMS, ролі та права" },
  { id: "ai-generation", label: "AI-генерація", icon: Bot, description: "Моделі, ліміти, шаблони промптів" },
  { id: "ai-consultant", label: "AI-консультант", icon: MessageSquare, description: "Публічний консультант порталу" },
  { id: "seo-config", label: "SEO-налаштування", icon: Search, description: "Глобальні шаблони, канонікали" },
  { id: "editorial", label: "Редакційні правила", icon: PenSquare, description: "Tone of voice, заборонені формулювання" },
  { id: "taxonomy", label: "Таксономія", icon: FolderTree, description: "Хаби, категорії, секції довідників" },
  { id: "site", label: "Конфігурація сайту", icon: Globe, description: "Домен, аудиторії, публічні налаштування" },
  { id: "billing", label: "Білінг CMS", icon: Wallet, description: "Поповнення AI-кредитів, виплати" },
];

export default function CmsSettingsPanel() {
  const [section, setSection] = useState<SettingsSection>("access");
  const [taxonomyTab, setTaxonomyTab] = useState<"hubs" | "categories" | "dovidnyky">("hubs");

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row bg-background">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border/60 bg-muted/20">
        <div className="px-3 py-3 border-b border-border/60 flex items-center gap-2">
          <Cog className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Налаштування</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={s.description}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile horizontal tabs */}
      <div className="md:hidden shrink-0 border-b border-border/60 bg-muted/20 overflow-x-auto">
        <div className="flex gap-1 px-2 py-2 min-w-max">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  "shrink-0 px-2.5 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground bg-background border border-border"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <ScrollArea className="h-full">
          <div className="p-4 md:p-6">
            {section === "access" && <AdminUsersPage />}
            {section === "ai-generation" && (
              <CmsCoreSettings
                filter="ai"
                title="AI-генерація"
                description="Моделі, температура, ліміти та шаблон system prompt для авто-генерації статей."
              />
            )}
            {section === "ai-consultant" && <CmsAiConsultantSettings />}
            {section === "seo-config" && (
              <CmsCoreSettings
                filter="seo"
                title="SEO-налаштування"
                description="Глобальні шаблони title/description, дефолтна OG-картинка, llms.txt header, canonical base."
              />
            )}

            {section === "editorial" && <EditorialSettingsAdmin />}
            {section === "taxonomy" && (
              <div className="space-y-4">
                <div className="flex items-center gap-1 border-b border-border/60">
                  {[
                    { id: "hubs", label: "Хаби" },
                    { id: "categories", label: "Категорії" },
                    { id: "dovidnyky", label: "Секції довідників" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTaxonomyTab(t.id as typeof taxonomyTab)}
                      className={cn(
                        "px-3 py-2 text-sm border-b-2 -mb-px transition-colors",
                        taxonomyTab === t.id
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {taxonomyTab === "hubs" && <HubsAdmin />}
                {taxonomyTab === "categories" && <CategoriesAdmin />}
                {taxonomyTab === "dovidnyky" && <DovidnykyAdmin />}
              </div>
            )}
            {section === "site" && <SiteConfigPage />}
            {section === "billing" && <AdminTopUp />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
