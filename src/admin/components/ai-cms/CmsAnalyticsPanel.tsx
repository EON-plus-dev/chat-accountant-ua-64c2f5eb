import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BarChart3, Search, ShieldCheck, Bot, TrendingUp } from "lucide-react";
import ContentAnalytics from "@/admin/pages/ContentAnalytics";
import SeoPortalAdmin from "@/admin/pages/SeoPortalAdmin";
import SeoQualityMonitor from "@/admin/components/SeoQualityMonitor";
import ContentAuditAdmin from "@/admin/pages/ContentAuditAdmin";
import AIAgentAdmin from "@/admin/pages/AIAgentAdmin";
import CmsCompetitorsPanel from "./CmsCompetitorsPanel";

type AnalyticsSection = "overview" | "seo" | "audit" | "ai-agent" | "market";

const SECTIONS: { id: AnalyticsSection; label: string; icon: typeof BarChart3; description: string }[] = [
  { id: "overview", label: "Огляд показників", icon: BarChart3, description: "Трафік, інвентар контенту, тренди" },
  { id: "seo", label: "SEO", icon: Search, description: "Мета-теги, sitemap, якість описів" },
  { id: "audit", label: "Аудит покриття", icon: ShieldCheck, description: "Прогалини, дублі, застарілий контент" },
  { id: "ai-agent", label: "AI-агент", icon: Bot, description: "Логи генерацій, успішність, кредити" },
  { id: "market", label: "Конкуренти / ринок", icon: TrendingUp, description: "Позиціонування на ринку" },
];

export default function CmsAnalyticsPanel() {
  const [section, setSection] = useState<AnalyticsSection>("overview");

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border/60 bg-muted/20">
        <div className="px-3 py-3 border-b border-border/60">
          <h2 className="text-sm font-semibold">Аналітика</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Здоровʼя сайту</p>
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
            {section === "overview" && <ContentAnalytics />}
            {section === "seo" && (
              <div className="space-y-4">
                <SeoQualityMonitor />
                <SeoPortalAdmin />
              </div>
            )}
            {section === "audit" && <ContentAuditAdmin />}
            {section === "ai-agent" && <AIAgentAdmin />}
            {section === "market" && <CmsCompetitorsPanel />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
