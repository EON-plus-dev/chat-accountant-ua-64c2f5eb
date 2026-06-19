import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Users,
  MessageSquare,
  BookOpen,
  Mail,
  Calendar,
  Scale,
  Wrench,
  Building,
  Building2,
  BarChart3,
  Shield,
  Settings,
  GraduationCap,
  Gift,
  AlertTriangle,
  Hash,
  Layers,
  HelpCircle,
  Globe,
  UserCheck,
  ArrowLeftRight,
  Briefcase,
  Home,
  FolderOpen,
  Award,
  Brain,
  Bot,
  TrendingUp,
  Headphones,
  Video,
  FlaskConical,
  ClipboardList,
  CalendarDays,
  PenTool,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Sparkles,
  ScrollText,
  Landmark,
  Star,
  Layout,
  Cpu,
  Cog,
  Percent,
  Server,
  CreditCard,
  Activity,
  Plug,

} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { useAdminBadgeCounts } from "@/admin/hooks/useAdminBadgeCounts";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

// AI CMS поглинула: Автоконтент, AI-агент, Календар публікацій,
// Аудит покриття, SEO порталу, Контент-аналітика, Підписки, Редакційні налаштування.
// Тут лишаємо лише CRUD-сторінки, до яких досвідчений адмін заходить напряму.
const contentItems = [
  { title: "Публікації", url: "/admin/articles", icon: FileText },
  { title: "Новини", url: "/admin/articles?type=news", icon: Newspaper, indent: true },
  { title: "Гайди", url: "/admin/articles?type=guide", icon: BookOpen, indent: true },
  { title: "Подкасти", url: "/admin/articles?type=podcast", icon: Headphones, indent: true },
  { title: "Відео", url: "/admin/articles?type=video", icon: Video, indent: true },
  { title: "Огляди", url: "/admin/articles?type=review", icon: ClipboardList, indent: true },
  { title: "Дослідження", url: "/admin/rankings", icon: FlaskConical },
  { title: "Консультації", url: "/admin/consultations", icon: MessageSquare },
  { title: "Дайджест", url: "/admin/newsletter", icon: CalendarDays },
  { title: "АІ-форум", url: "/admin/ai-consultations", icon: Bot },
];

const dovidnykyItems = [
  { title: "Словник", url: "/admin/knowledge", icon: BookOpen },
  { title: "КВЕД", url: "/admin/kved", icon: Hash },
  { title: "Закони", url: "/admin/laws", icon: Scale },
  { title: "Гранти", url: "/admin/grants", icon: Gift },
  { title: "Штрафи", url: "/admin/penalties", icon: AlertTriangle },
  { title: "Шаблони", url: "/admin/templates", icon: FileText },
  { title: "Реєстри", url: "/admin/registers", icon: Globe },
  { title: "Ставки", url: "/admin/rates", icon: Percent },
  { title: "Ліцензії", url: "/admin/licenses", icon: ScrollText },
  { title: "Форми бізнесу", url: "/admin/business-forms", icon: Briefcase },
  { title: "Бухгалтери", url: "/admin/accountants", icon: UserCheck },
];

const institutionsItems = [
  { title: "Каталог", url: "/admin/catalog", icon: Building },
  { title: "Профілі", url: "/admin/institution-profiles", icon: Building2 },
  { title: "Держоргани", url: "/admin/gov-branches", icon: Landmark },
  { title: "Послуги", url: "/admin/gov-services", icon: Layers },
  { title: "Відгуки", url: "/admin/gov-reviews", icon: Star },
];

const learnItems = [
  { title: "Курси", url: "/admin/courses", icon: GraduationCap },
];

const toolsItems = [
  { title: "Калькулятори", url: "/admin/tools", icon: Wrench },
  { title: "Порівняння", url: "/admin/comparisons", icon: ArrowLeftRight },
];

const analyticsDataItems = [
  { title: "Фінансові ринки", url: "/admin/finder", icon: TrendingUp },
  { title: "Зарплати", url: "/admin/labor-market", icon: Briefcase },
  { title: "Іпотека", url: "/admin/mortgage", icon: Home },
  { title: "Податковий календар", url: "/admin/tax-calendar", icon: Calendar },
];

const configItems = [
  { title: "AI Агент CMS", url: "/admin/ai-cms", icon: Cpu },
  { title: "Секції довідників", url: "/admin/dovidnyky", icon: BookOpen },
  { title: "Категорії", url: "/admin/categories", icon: FolderOpen },
  { title: "Тематичні розділи", url: "/admin/hubs", icon: Layout },
  { title: "Користувачі", url: "/admin/users", icon: Shield },
  { title: "Конфігурація сайту", url: "/admin/config", icon: Cog },
];


const commsItems = [
  { title: "Питання", url: "/admin/questions", icon: HelpCircle },
];

const systemOpsItems = [
  { title: "Операційний центр", url: "/admin/system", icon: LayoutDashboard },
  { title: "Користувачі", url: "/admin/system/users", icon: Users },
  { title: "Кабінети клієнтів", url: "/admin/system/cabinets", icon: Building2 },
  { title: "Інтеграції та дані", url: "/admin/system/integrations", icon: Plug },
  { title: "Партнерська мережа", url: "/admin/system/partners", icon: UserCheck },
  { title: "Інциденти", url: "/admin/system/incidents", icon: AlertTriangle },
];

const systemAiItems = [
  { title: "AI та база знань", url: "/admin/system/ai", icon: Brain },
  { title: "AI QA — Якість", url: "/admin/system/ai/qa", icon: ClipboardList, indent: true },
  { title: "AI Комунікації", url: "/admin/system/comms", icon: Bot },
];

const systemRulesItems = [
  { title: "Rules & Testing Studio", url: "/admin/system/rules", icon: FlaskConical },
  { title: "AI Rules Assistant", url: "/admin/system/rules/assistant", icon: Sparkles, indent: true },
];

const systemBillingItems = [
  { title: "Тарифні плани", url: "/admin/system/plans", icon: CreditCard },
  { title: "Підписки клієнтів", url: "/admin/system/billing/subscriptions", icon: CreditCard },
  { title: "Транзакції", url: "/admin/system/billing/transactions", icon: ArrowLeftRight },
  { title: "AI-собівартість", url: "/admin/system/billing/ai-cost", icon: Cpu },
  { title: "Аудит і комплаєнс", url: "/admin/system/audit", icon: Shield },
];

const systemInfraItems = [
  { title: "AI Gateway", url: "/admin/system/ai-gateway", icon: Cpu },
  { title: "Edge-функції", url: "/admin/system/edge-functions", icon: Server },
  { title: "Можливості кабінетів", url: "/admin/system/capabilities", icon: Layers },
  { title: "Підключення", url: "/admin/system/connections", icon: Plug },
  { title: "Здоровʼя БД", url: "/admin/system/health", icon: Activity },
];

const systemSettingsItems = [
  { title: "Ролі (RBAC)", url: "/admin/system/settings/roles", icon: Shield },
  { title: "Фіче-флаги", url: "/admin/system/settings/flags", icon: Cog },
  { title: "Статус-сторінка", url: "/admin/system/settings/status-page", icon: Activity },
];


type MenuItem = { title: string; url: string; icon: React.ElementType; indent?: boolean };

export function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAdminAuth();
  const userEmail = user?.email ?? "";
  const badgeCounts = useAdminBadgeCounts();
  const isSystemMode = location.pathname.startsWith("/admin/system");

  const isActive = (itemUrl: string) => {
    const [path, query] = itemUrl.split("?");
    if (query) {
      return location.pathname === path && location.search === `?${query}`;
    }
    return location.pathname === path && !location.search;
  };

  const renderGroup = (label: string, items: MenuItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url);
            const count = badgeCounts[item.url] ?? 0;
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end
                    className={`${active ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}${item.indent ? " pl-8" : ""}`}
                    activeClassName={item.url.includes("?") ? undefined : "bg-muted text-primary font-medium"}
                  >
                    <item.icon className={`mr-2 h-4 w-4 shrink-0${item.indent ? " h-3.5 w-3.5" : ""}`} />
                    {!collapsed && (
                      <>
                        <span className={`flex-1 ${item.indent ? "text-sm" : ""}`}>{item.title}</span>
                        {count > 0 && (
                          <Badge variant="destructive" size="sm" className="ml-auto">
                            {count}
                          </Badge>
                        )}
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-3">
        {collapsed ? (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors mx-auto"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex items-center justify-between">
            <NavLink to={isSystemMode ? "/admin/system" : "/admin"} end className="flex items-center gap-2">
              {isSystemMode ? (
                <Server className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <LayoutDashboard className="h-5 w-5 text-primary shrink-0" />
              )}
              <span className="font-semibold text-foreground text-sm">
                {isSystemMode ? "FINTODO АДМІН" : "FINTODO CMS"}
              </span>
            </NavLink>
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {isSystemMode ? (
          <>
            {renderGroup("Operations", systemOpsItems)}
            {renderGroup("AI Ops", systemAiItems)}
            {renderGroup("Rules Studio", systemRulesItems)}
            {renderGroup("Білінг & Аудит", systemBillingItems)}
            {renderGroup("Інфраструктура", systemInfraItems)}
            {renderGroup("Налаштування платформи", systemSettingsItems)}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/admin" end className="hover:bg-muted/50 text-muted-foreground">
                        <ArrowLeftRight className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span>Перемкнутись на CMS</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (

          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin"
                        end
                        className="hover:bg-muted/50"
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span>Огляд порталу</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {renderGroup("Контент", contentItems)}
            {renderGroup("Довідники", dovidnykyItems)}
            {renderGroup("Установи", institutionsItems)}
            {renderGroup("Навчання", learnItems)}
            {renderGroup("Інструменти", toolsItems)}
            {renderGroup("Аналітика & Дані", analyticsDataItems)}
            {renderGroup("Комунікації", commsItems)}
            {renderGroup("Конфігурація", configItems)}

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/admin/system" className="hover:bg-muted/50 text-muted-foreground">
                        <Server className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span>Перемкнутись на Адмін</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>


      <SidebarFooter className="border-t border-border/50 p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {userEmail?.charAt(0).toUpperCase() ?? "A"}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-primary">
                  {userEmail?.charAt(0).toUpperCase() ?? "A"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
            </div>
            <NavLink
              to="/overview"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Повернутися до порталу
            </NavLink>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
