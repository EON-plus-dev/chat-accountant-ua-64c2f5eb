import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useAiChatQueriesAdmin } from "@/hooks/useAiChatQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  Mail,
  Calendar,
  BookOpen,
  Wrench,
  Scale,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  GraduationCap,
  Bot,
  Hash,
  Globe,
  Gift,
  Award,
  Newspaper,
  Plus,
  Brain,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Database,
  Percent,
  BadgeCheck,
  Building2,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminBadgeCounts } from "@/admin/hooks/useAdminBadgeCounts";

import { ARTICLES } from "@/portal/data/articles";
import { TOOLS } from "@/portal/data/tools";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import { NEWSLETTER_ISSUES } from "@/portal/data/newsletter";
import { mockConsultations } from "@/config/consultationMockData";
import { aiConsultations } from "@/config/aiConsultationMockData";
import { COURSES, WEBINARS } from "@/portal/data/learn";
import { DEADLINES } from "@/portal/data/deadlines";
import { LAWS } from "@/portal/data/laws";
import { GRANTS } from "@/portal/data/grants";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { HUBS } from "@/portal/data/hubs";
import { RANKINGS } from "@/portal/data/rankings";
import { PENALTIES } from "@/portal/data/penalties";
import { TEMPLATES } from "@/portal/data/templates";
import { REGISTERS } from "@/portal/data/registers";
import { RATE_TABLES } from "@/portal/data/rates";
import { LICENSES } from "@/portal/data/licenses";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { ACCOUNTANTS } from "@/portal/data/accountants";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { POPULAR_QUESTIONS } from "@/portal/data/popularQuestions";
import { COMPARISONS } from "@/portal/data/comparisons";
import { MORTGAGE_PROGRAMS } from "@/portal/data/mortgageRates";
import { SALARY_BENCHMARKS } from "@/portal/data/laborMarket";
import { CATALOG_CATEGORIES } from "@/portal/data/catalog";
import { CURRENCY_RATES, FINANCIAL_INDICES, DEPOSIT_OFFERS, CARD_OFFERS, INSURANCE_OFFERS, FEE_COMPARISONS } from "@/portal/data/finder";

export default function AdminDashboard() {
  const [emailSubscribers, setEmailSubscribers] = useState(0);
  
  const { data: aiQueries } = useAiChatQueriesAdmin();
  const navigate = useNavigate();
  const badgeCounts = useAdminBadgeCounts();

  useEffect(() => {
    async function fetchStats() {
      const subsRes = await supabase.from("email_subscriptions").select("id", { count: "exact", head: true });
      setEmailSubscribers(subsRes.count ?? 0);
    }
    fetchStats();
  }, []);

  const totalArticles = ARTICLES.length;
  const articlesByType = ARTICLES.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});
  const articlesByAudience = ARTICLES.reduce<Record<string, number>>((acc, a) => {
    acc[a.audience] = (acc[a.audience] || 0) + 1;
    return acc;
  }, {});

  const now = new Date();
  const staleArticles = ARTICLES.filter((a) => {
    const updated = new Date(a.updatedAt);
    const diffDays = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 90;
  });

  const getDaysAgo = (dateStr: string) => {
    const diff = Math.floor((now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    return `${diff} дн. тому`;
  };

  const recentArticles = [...ARTICLES]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const kpiRoutes: Record<string, string> = {
    "Публікації": "/admin/articles",
    "AI-форум": "/admin/ai-consultations",
    "Email підписники": "/admin/subscribers",
    "Курси": "/admin/courses",
  };

  const keyMetrics = [
    { title: "Публікації", value: totalArticles, icon: FileText, detail: `${articlesByAudience.business || 0} бізнес · ${articlesByAudience.personal || 0} фіз.`, color: "text-blue-600 dark:text-blue-400" },
    { title: "AI-форум", value: aiQueries?.length ?? 0, icon: Bot, detail: `${aiQueries?.filter((c) => c.audience === "business").length ?? 0} бізнес · ${aiQueries?.filter((c) => c.audience === "individual").length ?? 0} фіз.`, color: "text-pink-600 dark:text-pink-400" },
    { title: "Email підписники", value: emailSubscribers, icon: Mail, detail: "Активні підписки", color: "text-amber-600 dark:text-amber-400" },
    { title: "Курси", value: COURSES.length, icon: GraduationCap, detail: `${WEBINARS.length} вебінарів`, color: "text-orange-600 dark:text-orange-400" },
  ];

  const contentStats = [
    { title: "Консультації", value: mockConsultations.length, icon: MessageSquare, color: "text-violet-600 dark:text-violet-400", route: "/admin/consultations" },
    { title: "AI-консультації", value: aiConsultations.length, icon: Brain, color: "text-cyan-600 dark:text-cyan-400", route: "/admin/ai-consultations" },
    { title: "Інструменти", value: TOOLS.length, icon: Wrench, color: "text-rose-600 dark:text-rose-400", route: "/admin/tools" },
    { title: "Хаби", value: Object.keys(HUBS).length, icon: Globe, color: "text-purple-600 dark:text-purple-400", route: "/admin/hubs" },
    { title: "Розсилки", value: NEWSLETTER_ISSUES.length, icon: Newspaper, color: "text-indigo-600 dark:text-indigo-400", route: "/admin/newsletter" },
    { title: "Рейтинги", value: RANKINGS.length, icon: Award, color: "text-yellow-600 dark:text-yellow-400", route: "/admin/rankings" },
    { title: "Порівняння", value: Object.keys(COMPARISONS).length, icon: Scale, color: "text-sky-600 dark:text-sky-400", route: "/admin/comparisons" },
    { title: "Поп. питання", value: POPULAR_QUESTIONS.length, icon: MessageSquare, color: "text-teal-600 dark:text-teal-400", route: "/admin/popular-questions" },
    { title: "Установи", value: INSTITUTION_PROFILES.length, icon: Building2, color: "text-blue-600 dark:text-blue-400", route: "/admin/institutions" },
    { title: "Каталог", value: CATALOG_CATEGORIES.length, icon: Database, color: "text-emerald-600 dark:text-emerald-400", route: "/admin/catalog" },
  ];

  const directoryStats = [
    { title: "Словник", value: KNOWLEDGE.length, icon: BookOpen, color: "text-teal-600 dark:text-teal-400", route: "/admin/directories?tab=dictionary" },
    { title: "Дедлайни", value: DEADLINES.length, icon: Calendar, color: "text-red-600 dark:text-red-400", route: "/admin/tax-calendar" },
    { title: "Закони", value: LAWS.length, icon: Scale, color: "text-sky-600 dark:text-sky-400", route: "/admin/directories?tab=laws" },
    { title: "Гранти", value: GRANTS.length, icon: Gift, color: "text-lime-600 dark:text-lime-400", route: "/admin/directories?tab=grants" },
    { title: "КВЕД", value: KVED_ENTRIES.length, icon: Hash, color: "text-gray-600 dark:text-gray-400", route: "/admin/directories?tab=kved" },
    { title: "Штрафи", value: PENALTIES.length, icon: ShieldAlert, color: "text-orange-600 dark:text-orange-400", route: "/admin/directories?tab=penalties" },
    { title: "Шаблони", value: TEMPLATES.length, icon: FileCheck, color: "text-cyan-600 dark:text-cyan-400", route: "/admin/directories?tab=templates" },
    { title: "Реєстри", value: REGISTERS.length, icon: Database, color: "text-slate-600 dark:text-slate-400", route: "/admin/directories?tab=registers" },
    { title: "Ставки", value: RATE_TABLES.length, icon: Percent, color: "text-emerald-600 dark:text-emerald-400", route: "/admin/directories?tab=rates" },
    { title: "Ліцензії", value: LICENSES.length, icon: BadgeCheck, color: "text-blue-600 dark:text-blue-400", route: "/admin/directories?tab=licenses" },
    { title: "Форми бізнесу", value: BUSINESS_FORMS.length, icon: Building2, color: "text-fuchsia-600 dark:text-fuchsia-400", route: "/admin/directories?tab=business-forms" },
    { title: "Бухгалтери", value: ACCOUNTANTS.length, icon: Users, color: "text-pink-600 dark:text-pink-400", route: "/admin/directories?tab=accountants" },
    { title: "Іпотечні програми", value: MORTGAGE_PROGRAMS.length, icon: TrendingUp, color: "text-violet-600 dark:text-violet-400", route: "/admin/directories?tab=mortgage" },
    { title: "Зарплатні дані", value: SALARY_BENCHMARKS.length, icon: Users, color: "text-amber-600 dark:text-amber-400", route: "/admin/directories?tab=salary" },
  ];

  const financialStats = [
    { title: "Валюти", value: CURRENCY_RATES.rates.length, icon: TrendingUp, color: "text-green-600 dark:text-green-400", route: "/admin/directories?tab=currencies" },
    { title: "Індекси", value: FINANCIAL_INDICES.indices.length, icon: TrendingUp, color: "text-blue-600 dark:text-blue-400", route: "/admin/directories?tab=indices" },
    { title: "Депозити", value: DEPOSIT_OFFERS.offers.length, icon: Database, color: "text-violet-600 dark:text-violet-400", route: "/admin/directories?tab=deposits" },
    { title: "Картки", value: CARD_OFFERS.offers.length, icon: FileText, color: "text-rose-600 dark:text-rose-400", route: "/admin/directories?tab=cards" },
    { title: "Страхування", value: INSURANCE_OFFERS.offers.length, icon: ShieldAlert, color: "text-cyan-600 dark:text-cyan-400", route: "/admin/directories?tab=insurance" },
    { title: "Тарифи", value: FEE_COMPARISONS.comparisons.length, icon: Percent, color: "text-amber-600 dark:text-amber-400", route: "/admin/directories?tab=fees" },
  ];

  const quickActions = [
    { label: "Нова публікація (AI)", icon: Sparkles, url: "/admin/autocontent?tab=plan&new=1" },
  ];

  const typeLabels: Record<string, string> = {
    news: "Новина",
    guide: "Гайд",
    podcast: "Подкаст",
    video: "Відео",
    review: "Огляд",
    analysis: "Аналітика",
    change: "Зміна",
    dps: "ДПС",
    comparison: "Порівняння",
    explainer: "Пояснення",
  };

  const calendarPosts = (() => {
    try {
      const raw = localStorage.getItem("fintodo_content_calendar");
      if (!raw) return [];
      return JSON.parse(raw) as { id: string; title: string; date: string; type: string; status: string }[];
    } catch { return []; }
  })();
  const now2 = new Date();
  const weekStart = new Date(now2);
  weekStart.setDate(now2.getDate() - now2.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekPosts = calendarPosts.filter(p => {
    const d = new Date(p.date);
    return d >= weekStart && d <= weekEnd;
  });

  const stalePercent = totalArticles > 0 ? Math.round((staleArticles.length / totalArticles) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Огляд порталу</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Моніторинг контенту та стану порталу FINTODO
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              onClick={() => navigate(action.url)}
              className="gap-1.5"
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics — card grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {keyMetrics.map((kpi) => (
          <Card
            key={kpi.title}
            className="cursor-pointer hover:bg-muted/50 transition-colors group"
            onClick={() => navigate(kpiRoutes[kpi.title] || "/admin")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  <span className="text-xs font-medium text-muted-foreground">{kpi.title}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.detail}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attention Required */}
      {(() => {
        const attentionItems = [
          { label: "AI-форум", count: badgeCounts["/admin/ai-consultations"], route: "/admin/ai-consultations", icon: Bot, color: "text-blue-500" },
          { label: "Відгуки", count: badgeCounts["/admin/gov-reviews"], route: "/admin/gov-reviews", icon: MessageSquare, color: "text-amber-500" },
          { label: "Автоконтент", count: badgeCounts["/admin/autocontent"], route: "/admin/autocontent", icon: Sparkles, color: "text-emerald-500" },
          { label: "Дедлайни", count: badgeCounts["/admin/tax-calendar"], route: "/admin/tax-calendar", icon: Calendar, color: "text-red-500" },
          { label: "Застарілий контент", count: staleArticles.length, route: "/admin/articles?status=stale", icon: AlertTriangle, color: "text-orange-500" },
        ];
        const activeItems = attentionItems.filter(i => i.count > 0);
        return (
          <Card>
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Потребує уваги
                {activeItems.length === 0 && (
                  <Badge variant="success" size="sm" className="ml-2">✓ Все в порядку</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              {activeItems.length > 0 ? (
                activeItems.map(item => (
                  <div
                    key={item.route}
                    className="flex items-center justify-between px-4 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(item.route)}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                      <span className="text-sm text-foreground">{item.label}</span>
                      <Badge variant="secondary" size="sm">{item.count}</Badge>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              ) : null}
            </CardContent>
          </Card>
        );
      })()}

      {/* Content & Education + Portal Data — two compact lists side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Контент & Навчання</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-1">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {contentStats.map((stat) => (
                <div
                  key={stat.title}
                  className="flex items-center justify-between px-4 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(stat.route)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <stat.icon className={`h-3.5 w-3.5 shrink-0 ${stat.color}`} />
                    <span className="text-sm text-foreground truncate">{stat.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground tabular-nums">{stat.value}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Дані порталу</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-1">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {[...directoryStats, ...financialStats].map((stat) => (
                <div
                  key={stat.title}
                  className="flex items-center justify-between px-4 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(stat.route)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <stat.icon className={`h-3.5 w-3.5 shrink-0 ${stat.color}`} />
                    <span className="text-sm text-foreground truncate">{stat.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground tabular-nums">{stat.value}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Health+Distribution merged + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Distribution — donut chart */}
        <Card>
          <CardContent className="p-4">
            {(() => {
              const segmentColors: Record<string, string> = {
                guide: '#3b82f6',
                analytics: '#10b981',
                podcast: '#8b5cf6',
                review: '#f59e0b',
                video: '#f43f5e',
              };
              const sorted = Object.entries(articlesByType).sort((a, b) => b[1] - a[1]);
              const mainSegments = sorted.filter(([, count]) => Math.round((count / totalArticles) * 100) >= 3);
              const otherCount = sorted.filter(([, count]) => Math.round((count / totalArticles) * 100) < 3).reduce((s, [, c]) => s + c, 0);

              const segments = [
                ...mainSegments.map(([type, count]) => ({
                  type,
                  count,
                  pct: Math.round((count / totalArticles) * 100),
                  color: segmentColors[type] || 'hsl(var(--muted-foreground) / 0.4)',
                  label: typeLabels[type] || type,
                })),
                ...(otherCount > 0 ? [{
                  type: 'other',
                  count: otherCount,
                  pct: Math.round((otherCount / totalArticles) * 100),
                  color: 'hsl(var(--muted-foreground) / 0.4)',
                  label: 'Інше',
                }] : []),
              ];

              return (
                <div className="flex items-center gap-4 min-w-0">
                  {/* Donut */}
                  <div className="relative w-[120px] h-[120px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={segments}
                          dataKey="count"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={54}
                          paddingAngle={2}
                          strokeWidth={0}
                          onClick={(_, idx) => {
                            const seg = segments[idx];
                            if (seg && seg.type !== 'other') navigate(`/admin/articles?type=${seg.type}`);
                          }}
                          className="cursor-pointer"
                        >
                          {segments.map((seg) => (
                            <Cell key={seg.type} fill={seg.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-lg font-semibold text-foreground">{totalArticles}</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-1 min-w-0">
                    {segments.map((seg) => (
                      <span
                        key={seg.type}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => seg.type !== 'other' && navigate(`/admin/articles?type=${seg.type}`)}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="truncate">{seg.label}</span>
                        <span className="text-foreground font-medium">{seg.count}</span>
                        <span className="text-muted-foreground/60">({seg.pct}%)</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Recent Publications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Останні публікації
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {recentArticles.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-sm text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{getDaysAgo(a.updatedAt)}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {typeLabels[a.type] || a.type}
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 gap-1 text-xs"
              onClick={() => navigate("/admin/articles")}
            >
              Всі публікації <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tax Calendar + Content Calendar previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Urgent Deadlines */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-destructive" />
              Найближчі дедлайни
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {DEADLINES.filter(d => d.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5).map(d => {
                const color = d.urgency === "urgent" ? "text-destructive font-bold" : d.urgency === "upcoming" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground";
                return (
                  <div key={d.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-sm text-foreground truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.date}</p>
                    </div>
                    <span className={`text-sm ${color}`}>{d.daysLeft} дн.</span>
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-2 gap-1 text-xs" onClick={() => navigate("/admin/tax-calendar")}>
              Податковий календар <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Content Calendar preview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Календар публікацій
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weekPosts.length > 0 ? (
              <div className="space-y-1.5 mb-2">
                <p className="text-xs text-muted-foreground">Цей тиждень: {weekPosts.length} запланован{weekPosts.length === 1 ? 'о' : 'о'}</p>
                {weekPosts.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                    <span className="text-sm text-foreground truncate max-w-[200px]">{p.title}</span>
                    <Badge variant="outline" className="text-[10px]">{p.date}</Badge>
                  </div>
                ))}
                {weekPosts.length > 3 && <p className="text-xs text-muted-foreground">+{weekPosts.length - 3} ще...</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">На цей тиждень немає запланованих публікацій</p>
            )}
            <Button variant="ghost" size="sm" className="w-full gap-1 text-xs" onClick={() => navigate("/admin/content-calendar")}>
              Відкрити календар <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
