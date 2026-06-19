import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusChip } from "@/admin/components/system/StatusChip";
import { NotificationsBell } from "@/admin/components/system/NotificationsBell";
import { CommandPalette, useCommandPaletteShortcut } from "@/admin/components/system/CommandPalette";
import { MOCK_INCIDENTS } from "@/admin/system/data/mocks";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Адмін",
  system: "Система",
  users: "Користувачі",
  cabinets: "Кабінети",
  incidents: "Інциденти",
  tickets: "Тікети",
  ai: "AI",
  qa: "QA",
  knowledge: "База знань",
  templates: "Шаблони",
  policies: "Політики",
  comms: "Комунікації",
  chat: "Чат",
  voice: "Голос",
  intents: "Інтенти",
  escalations: "Ескалації",
  analytics: "Аналітика",
  compliance: "Комплаєнс",
  rules: "Правила",
  assistant: "Асистент",
  billing: "Білінг",
  transactions: "Транзакції",
  anomalies: "Аномалії",
  plans: "Тарифи",
  audit: "Аудит",
  settings: "Налаштування",
  roles: "Ролі",
  flags: "Фіче-флаги",
  "status-page": "Статус-сторінка",
  "ai-gateway": "AI Gateway",
  "edge-functions": "Edge-функції",
  capabilities: "Можливості",
  connections: "Підключення",
  health: "Здоровʼя БД",
  "ai-conversations": "AI Діалоги",
};

function labelFor(segment: string) {
  return SEGMENT_LABELS[segment] ?? segment;
}

export function AdminTopbar() {
  const location = useLocation();
  
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandPaletteShortcut(() => setPaletteOpen(true));

  const crumbs = useMemo(() => {
    const segs = location.pathname.split("/").filter(Boolean);
    return segs.map((seg, i) => ({
      label: labelFor(seg),
      href: "/" + segs.slice(0, i + 1).join("/"),
      isLast: i === segs.length - 1,
    }));
  }, [location.pathname]);

  const activeIncident = MOCK_INCIDENTS.find(
    (i) => i.status !== "resolved" && (i.severity === "high" || i.severity === "critical"),
  );

  return (
    <>
      <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center gap-3 px-4">
        <SidebarTrigger className="md:hidden" />

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1 text-sm min-w-0 flex-1">
          {crumbs.map((c, i) => (
            <div key={c.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
              {c.isLast ? (
                <span className="font-medium truncate">{c.label}</span>
              ) : (
                <Link to={c.href} className="text-muted-foreground hover:text-foreground truncate">
                  {c.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile: тільки остання крихта */}
        <div className="md:hidden text-sm font-medium truncate flex-1">
          {crumbs[crumbs.length - 1]?.label}
        </div>

        {/* Center: search */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPaletteOpen(true)}
          className="hidden md:inline-flex h-9 px-3 gap-2 text-muted-foreground font-normal min-w-[260px] justify-between"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            Пошук…
          </span>
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setPaletteOpen(true)}
          aria-label="Пошук"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeIncident ? (
            <Link to={`/admin/system/incidents/${activeIncident.id}`} className="hidden sm:block">
              <StatusChip level="warning">Degraded</StatusChip>
            </Link>
          ) : (
            <StatusChip level="ok" className="hidden sm:inline-flex">Operational</StatusChip>
          )}

          <NotificationsBell />
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
