import { useState, useCallback } from "react";
import { 
  TrendingUp, 
  Briefcase, 
  AlertTriangle, 
  Calendar,
  Wallet,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Users,
  Building2,
  User,
  BarChart3,
  FileCheck,
  ShieldAlert,
  Target,
  Clock,
  ArrowRight,
  GitCompare,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UniversalKPICard, type BreakdownItem } from "@/components/ui/UniversalKPICard";
import { HealthScoreCard } from "@/components/analytics/HealthScoreCard";
import { ComparisonStudio } from "@/components/analytics/comparison";
import { TaxAnalyticsSection, SalaryAnalyticsSection, DeadlinesSection, AuditsSection, ReportsAnalyticsSection, IncomeAnalyticsSection, HealthScoreDetailsSection } from "@/components/analytics/sections";

import { demoAudits } from "@/config/taxAuditsConfig";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { QuickPromptsRow } from "@/components/dashboard/QuickPromptsRow";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, Area, AreaChart } from "recharts";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { mockCabinets } from "@/config/cabinetsData";
import { usePortfolioMetrics } from "@/hooks/usePortfolioMetrics";
import { portfolioAIPrompts, portfolioSections, typeLabels, FOP_LIMITS, type PortfolioInsightAction } from "@/config/portfolioAnalyticsConfig";
import type { Cabinet } from "@/types/cabinet";

// Phase 2 & 3: Mobile optimization imports
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { PullToRefreshIndicator } from "@/components/ui/PullToRefreshIndicator";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

type PeriodType = "month" | "quarter" | "year";

interface PortfolioAnalyticsPageProps {
  cabinets?: Cabinet[];
  onChatPromptInsert?: (prompt: string) => void;
  onCabinetSelect?: (cabinet: Cabinet) => void;
  onScroll?: (isScrolled: boolean) => void;
  onBackToCabinets?: () => void;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(value);

const formatCompact = (value: number) =>
  value >= 1000000 
    ? `${(value / 1000000).toFixed(1)}M` 
    : value >= 1000 
    ? `${(value / 1000).toFixed(0)}K` 
    : value.toString();

export function PortfolioAnalyticsPage({ 
  cabinets = mockCabinets,
  onChatPromptInsert,
  onCabinetSelect,
  onScroll,
  onBackToCabinets,
}: PortfolioAnalyticsPageProps) {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<string>("kpi");
  const [showSecondaryKPIs, setShowSecondaryKPIs] = useState(!isMobile);
  const [showAllCabinets, setShowAllCabinets] = useState(false);
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [period, setPeriod] = useState<PeriodType>("month");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const metrics = usePortfolioMetrics(cabinets);

  // Phase 2: Swipe navigation for mobile tabs
  const tabIds = portfolioSections.map(s => s.id);
  const { swipeOffset, isSwiping, handlers: swipeHandlers } = useSwipeNavigation({
    tabs: tabIds,
    activeTab: activeSection,
    onTabChange: setActiveSection,
    threshold: 50,
  });

  // Phase 3: Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  const { pullDistance, isRefreshing, handlers: pullHandlers } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  const handleInsightAction = (action: PortfolioInsightAction | undefined) => {
    if (!action) return;
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    if (action.scrollTo) {
      document.getElementById(action.scrollTo)?.scrollIntoView({ 
        behavior: "smooth",
        block: "start",
      });
      // For mobile — switch tab
      if (isMobile) {
        const sectionMap: Record<string, string> = {
          "risks-section": "risks",
          "deadlines-section": "compliance",
          "income-chart-section": "finance",
        };
        setActiveSection(sectionMap[action.scrollTo] || "kpi");
      }
    }
    
    if (action.cabinetId) {
      const cabinet = cabinets.find(c => c.id === action.cabinetId);
      if (cabinet) onCabinetSelect?.(cabinet);
    }
    
    if (action.promptText && onChatPromptInsert) {
      onChatPromptInsert(action.promptText);
    }
  };

  const periodLabels: Record<PeriodType, { full: string; short: string }> = {
    month: { full: "Місяць", short: "Міс." },
    quarter: { full: "Квартал", short: "Кв." },
    year: { full: "Рік", short: "Рік" },
  };

  const typeIcons: Record<string, typeof Building2> = {
    fop: User,
    tov: Building2,
    individual: Users,
    "fop-group": Users,
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(e.currentTarget.scrollTop > 10);
  };

  // Chart config for recharts
  const incomeChartConfig = {
    income: { label: "Дохід", color: "hsl(var(--chart-1))" },
  };

  const pieChartConfig = metrics.typeDistribution.reduce((acc, item) => {
    acc[item.type] = { label: item.label, color: item.color };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  // Section to tab mapping for mobile scroll navigation
  const sectionToTab: Record<string, string> = {
    "health-score-details": "kpi",
    "income-chart-section": "finance",
    "cabinet-leaderboard-section": "finance",
    "income-analytics-wrapper": "finance",
    "deadlines-section": "compliance",
    "tax-analytics": "compliance",
    "salary-analytics": "compliance",
    "reports-analytics": "compliance",
    "risks-section": "risks",
    "audits-section": "risks",
    "insights-section": "insights",
  };

  const handleBeforeScroll = useCallback((targetId: string) => {
    if (isMobile && sectionToTab[targetId]) {
      setActiveSection(sectionToTab[targetId]);
    }
  }, [isMobile]);

  // KPI Section
  const renderKPISection = () => (
    <div className="space-y-4">
      {/* Primary KPIs - responsive 4-column grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
        {/* Health Score */}
        <UniversalKPICard
          title="Здоров'я портфеля"
          value={`${metrics.healthScore.total} · ${metrics.healthScore.grade}`}
          format="number"
          description="4 категорії"
          icon={Heart}
          variant={
            metrics.healthScore.total >= 80 ? "success" : 
            metrics.healthScore.total >= 60 ? "warning" : "danger"
          }
          trend={metrics.healthScore.trend}
          scrollTargetId="health-score-details"
          onBeforeScroll={() => handleBeforeScroll("health-score-details")}
          details={[
            { label: "Compliance", value: `${metrics.healthScore.categories.compliance.score}%` },
            { label: "Finance", value: `${metrics.healthScore.categories.finance.score}%` },
            { label: "Risks", value: `${metrics.healthScore.categories.risks.score}%` },
            { label: "Data Quality", value: `${metrics.healthScore.categories.dataQuality.score}%` },
          ]}
        />
        
        {/* Загальний дохід */}
        <UniversalKPICard
          title="Загальний дохід"
          value={metrics.totalMonthlyIncome}
          format="currency"
          trend={metrics.incomeTrend}
          description="за місяць"
          icon={TrendingUp}
          variant="success"
          scrollTargetId="income-chart-section"
          onBeforeScroll={() => handleBeforeScroll("income-chart-section")}
          details={metrics.typeDistribution.map(t => ({ label: t.label, value: formatCurrency(t.value) }))}
        />
        
        {/* Активних кабінетів */}
        <UniversalKPICard
          title="Активних кабінетів"
          value={metrics.activeCabinets}
          format="number"
          description={metrics.archivedCabinets > 0 ? `+ ${metrics.archivedCabinets} архівних` : "всього"}
          icon={Briefcase}
          scrollTargetId="cabinet-leaderboard-section"
          onBeforeScroll={() => handleBeforeScroll("cabinet-leaderboard-section")}
        />
        
        {/* Потребують уваги */}
        <UniversalKPICard
          title="Потребують уваги"
          value={metrics.attentionRequired}
          format="number"
          description="кабінетів з завданнями"
          icon={AlertTriangle}
          variant={metrics.attentionRequired > 0 ? "warning" : "default"}
          scrollTargetId="risks-section"
          onBeforeScroll={() => handleBeforeScroll("risks-section")}
        />

      </div>

      {/* Expandable Secondary KPIs */}
      <Collapsible open={showSecondaryKPIs} onOpenChange={setShowSecondaryKPIs}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
          >
            <span>{showSecondaryKPIs ? "Згорнути" : "Показати більше"}</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              showSecondaryKPIs && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 items-stretch">
            {/* Deadlines */}
            <UniversalKPICard
              title="Дедлайнів"
              value={metrics.upcomingDeadlines.length}
              format="number"
              description={metrics.nearestDeadline 
                ? `Найближчий: ${metrics.nearestDeadline.daysLeft} дн.`
                : "на найближчі 30 днів"
              }
              icon={Calendar}
              variant={metrics.nearestDeadline && metrics.nearestDeadline.daysLeft <= 3 ? "danger" : metrics.nearestDeadline && metrics.nearestDeadline.daysLeft <= 7 ? "warning" : "default"}
              size="sm"
              scrollTargetId="deadlines-section"
              onBeforeScroll={() => handleBeforeScroll("deadlines-section")}
              details={metrics.nearestDeadline ? [
                { label: "Тип", value: metrics.nearestDeadline.label },
                { label: "Кабінет", value: metrics.nearestDeadline.cabinetName },
                { label: "Днів до дедлайну", value: `${metrics.nearestDeadline.daysLeft}` },
              ] : undefined}
            />
            
            {/* Tax payments - scroll to dedicated section */}
            <UniversalKPICard
              title="До сплати податків"
              value={metrics.taxPaymentsDue}
              format="currency"
              description={
                <span className="flex items-center gap-1">
                  <span className={cn(
                    "font-medium",
                    metrics.taxBreakdown.percentOfIncome < 7 ? "text-success" :
                    metrics.taxBreakdown.percentOfIncome < 10 ? "text-amber-600" :
                    "text-destructive"
                  )}>
                    {metrics.taxBreakdown.percentOfIncome}%
                  </span>
                  <span>від доходу</span>
                </span>
              }
              icon={Wallet}
              size="sm"
              scrollTargetId="tax-analytics"
              onBeforeScroll={() => handleBeforeScroll("tax-analytics")}
              details={[
                { label: metrics.taxBreakdown.ep.label, value: formatCurrency(metrics.taxBreakdown.ep.amount) },
                { label: metrics.taxBreakdown.esv.label, value: formatCurrency(metrics.taxBreakdown.esv.amount) },
                { label: metrics.taxBreakdown.pdfo.label, value: formatCurrency(metrics.taxBreakdown.pdfo.amount) },
                { label: metrics.taxBreakdown.military.label, value: formatCurrency(metrics.taxBreakdown.military.amount) },
              ].filter(d => parseFloat(d.value.replace(/[^\d.-]/g, '')) > 0)}
            />
            
            {/* Salary payments - scroll to dedicated section */}
            <UniversalKPICard
              title="Виплати працівникам"
              value={metrics.salaryPaymentsDue}
              format="currency"
              description={
                <span className="flex items-center gap-1">
                  <span className={cn(
                    "font-medium",
                    metrics.salaryBreakdown.percentOfIncome < 30 ? "text-success" :
                    metrics.salaryBreakdown.percentOfIncome < 50 ? "text-amber-600" :
                    "text-destructive"
                  )}>
                    {metrics.salaryBreakdown.percentOfIncome}%
                  </span>
                  <span>· {metrics.salaryBreakdown.employeeCount} чол.</span>
                </span>
              }
              icon={Users}
              size="sm"
              scrollTargetId="salary-analytics"
              onBeforeScroll={() => handleBeforeScroll("salary-analytics")}
              details={[
                { label: "Зарплати", value: `${formatCurrency(metrics.salaryBreakdown.salary.amount)} (${metrics.salaryBreakdown.salary.count} чол.)` },
                { label: "ЦПД", value: `${formatCurrency(metrics.salaryBreakdown.civil.amount)} (${metrics.salaryBreakdown.civil.count} чол.)` },
                { label: "Премії", value: formatCurrency(metrics.salaryBreakdown.bonus.amount) },
                { label: "Середнє на чол.", value: formatCurrency(metrics.salaryBreakdown.avgPerEmployee) },
              ].filter(d => !d.value.includes("₴0") && !d.value.includes("(0 чол.)"))}
            />
            
            {/* Audits - scroll to dedicated section */}
            <UniversalKPICard
              title="Активних перевірок"
              value={metrics.activeAudits}
              format="number"
              description={
                metrics.auditsBreakdown.responseRequired > 0 
                  ? <span className="text-destructive font-medium">Потребує відповіді: {metrics.auditsBreakdown.responseRequired}</span>
                  : metrics.auditsBreakdown.inProgress > 0
                  ? "В процесі"
                  : "ДПС"
              }
              icon={ShieldAlert}
              size="sm"
              variant={metrics.auditsBreakdown.responseRequired > 0 ? "danger" : metrics.activeAudits > 0 ? "warning" : "default"}
              scrollTargetId="audits-section"
              onBeforeScroll={() => handleBeforeScroll("audits-section")}
              details={metrics.activeAudits > 0 ? [
                { label: "Очікує відповіді", value: `${metrics.auditsBreakdown.responseRequired}` },
                { label: "В процесі", value: `${metrics.auditsBreakdown.inProgress}` },
                { label: "Оголошено", value: `${metrics.auditsBreakdown.announced}` },
              ] : undefined}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Health Score Details Section */}
      <HealthScoreDetailsSection
        healthScore={metrics.healthScore}
        onChatPromptInsert={onChatPromptInsert}
      />
    </div>
  );

  // Finance Section
  const renderFinanceSection = () => (
    <div id="income-analytics-wrapper" className="space-y-6">
      {/* Dedicated Income Analytics Section */}
      <IncomeAnalyticsSection
        totalIncome={metrics.totalMonthlyIncome}
        previousPeriodIncome={metrics.totalMonthlyIncome * 0.92}
        trend={metrics.incomeTrend}
        typeDistribution={metrics.typeDistribution}
        topCabinets={metrics.cabinetLeaderboard.slice(0, 5).map(item => ({
          cabinetId: item.cabinet.id,
          cabinetName: item.cabinet.name,
          type: item.cabinet.type,
          typeLabel: item.cabinet.typeLabel,
          income: item.monthlyIncome,
          trend: item.trend,
          rank: item.rank,
        }))}
        monthlyData={metrics.incomeByMonth}
        onCabinetClick={(cabinetId) => {
          const cabinet = cabinets.find(c => c.id === cabinetId);
          if (cabinet) onCabinetSelect?.(cabinet);
        }}
      />

      {/* Income Trend Chart */}
      <Card id="income-chart-section">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Динаміка доходу портфеля</CardTitle>
          <CardDescription>Останні 6 місяців</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={incomeChartConfig} className="h-[200px] md:h-[250px] w-full">
            <AreaChart data={metrics.incomeByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis tickFormatter={formatCompact} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--chart-1))" 
                fill="url(#incomeGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Type Distribution Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Структура портфеля</CardTitle>
            <CardDescription>За типом суб'єкта</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={metrics.typeDistribution}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {metrics.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {metrics.typeDistribution.map(item => (
                <div key={item.type} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cabinet Leaderboard with expand/collapse */}
        <Card id="cabinet-leaderboard-section" className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Топ кабінетів за доходом</CardTitle>
                <CardDescription>Клікніть для деталей</CardDescription>
              </div>
              {metrics.cabinetLeaderboard.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  {metrics.cabinetLeaderboard.length} кабінетів
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className={cn(showAllCabinets ? "h-[400px]" : "h-[240px]")}>
              <div className="divide-y divide-border">
                {(showAllCabinets ? metrics.cabinetLeaderboard : metrics.cabinetLeaderboard.slice(0, 6)).map((item) => {
                  const TypeIcon = typeIcons[item.cabinet.type] || Building2;
                  return (
                    <button
                      key={item.cabinet.id}
                      onClick={() => onCabinetSelect?.(item.cabinet)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-muted-foreground w-5">{item.rank}</span>
                      <div className="p-1.5 rounded-md bg-muted">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.cabinet.name}</p>
                        <p className="text-xs text-muted-foreground">{item.cabinet.typeLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{formatCompact(item.monthlyIncome)}</p>
                        <p className={cn(
                          "text-xs flex items-center justify-end gap-0.5",
                          item.trend.direction === "up" ? "text-success" : "text-destructive"
                        )}>
                          {item.trend.direction === "up" ? "↑" : "↓"}{item.trend.value}%
                        </p>
                      </div>
                      {item.riskCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5">{item.riskCount}</Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
          {metrics.cabinetLeaderboard.length > 6 && (
            <div className="p-2 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full gap-1.5 text-xs"
                onClick={() => setShowAllCabinets(!showAllCabinets)}
              >
                {showAllCabinets ? (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                    Згорнути
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Показати всі ({metrics.cabinetLeaderboard.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      {/* Comparison Studio */}
      <ComparisonStudio 
        cabinets={cabinets}
        onCabinetSelect={onCabinetSelect}
        onInsightClick={(insight) => onChatPromptInsert?.(insight)}
      />

    </div>
  );

  // Compliance Section - helper for percentage
  const getReportPercent = (value: number) => {
    if (metrics.reportsStats.total === 0) return 0;
    return Math.round((value / metrics.reportsStats.total) * 100);
  };

  const renderComplianceSection = () => (
    <div className="space-y-6">
      {/* Reports Stats - clickable cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <UniversalKPICard
          title="Прийнято"
          value={metrics.reportsStats.accepted}
          format="number"
          description={`${getReportPercent(metrics.reportsStats.accepted)}% від ${metrics.reportsStats.total}`}
          icon={FileCheck}
          variant="success"
          size="sm"
          scrollTargetId="reports-analytics"
        />
        <UniversalKPICard
          title="Подано"
          value={metrics.reportsStats.submitted}
          format="number"
          description={`${getReportPercent(metrics.reportsStats.submitted)}% від ${metrics.reportsStats.total}`}
          icon={Clock}
          size="sm"
          scrollTargetId="reports-analytics"
        />
        <UniversalKPICard
          title="На перевірку"
          value={metrics.reportsStats.review}
          format="number"
          description={`${getReportPercent(metrics.reportsStats.review)}% від ${metrics.reportsStats.total}`}
          icon={BarChart3}
          variant="warning"
          size="sm"
          scrollTargetId="reports-analytics"
        />
        <UniversalKPICard
          title="Заплановано"
          value={metrics.reportsStats.scheduled}
          format="number"
          description={`${getReportPercent(metrics.reportsStats.scheduled)}% від ${metrics.reportsStats.total}`}
          icon={AlertTriangle}
          size="sm"
          scrollTargetId="reports-analytics"
        />
      </div>

      {/* Reports Analytics Section - dedicated */}
      <ReportsAnalyticsSection
        stats={metrics.reportsStats}
        reports={cabinets.slice(0, 5).map((c, i) => ({
          id: `report-${c.id}`,
          name: `Декларація ЄП за IV кв. 2024`,
          period: "IV кв. 2024",
          cabinetId: c.id,
          cabinetName: c.name,
          status: i === 0 ? "accepted" : i === 1 ? "submitted" : i === 2 ? "review" : "scheduled",
          deadline: "15.01.2025",
        }))}
        onReportClick={(report) => {
          const cabinet = cabinets.find(c => c.id === report.cabinetId);
          if (cabinet) onCabinetSelect?.(cabinet);
        }}
        onCabinetClick={(cabinetId) => {
          const cabinet = cabinets.find(c => c.id === cabinetId);
          if (cabinet) onCabinetSelect?.(cabinet);
        }}
      />

      {/* Deadlines Section - dedicated component */}
      <DeadlinesSection
        deadlines={metrics.upcomingDeadlines.map(d => ({
          id: d.id,
          label: d.label,
          cabinetId: d.cabinetId,
          cabinetName: d.cabinetName,
          date: d.date,
          type: d.type as "tax" | "report" | "payment" | "other",
          urgency: d.urgency,
        }))}
        onDeadlineClick={(deadline) => {
          const cabinet = cabinets.find(c => c.id === deadline.cabinetId);
          if (cabinet) onCabinetSelect?.(cabinet);
        }}
        onCabinetClick={(cabinetId) => {
          const cabinet = cabinets.find(c => c.id === cabinetId);
          if (cabinet) onCabinetSelect?.(cabinet);
        }}
      />

      {/* Tax Analytics Section - dedicated component with id for scroll navigation */}
      <TaxAnalyticsSection
        totalTax={metrics.taxPaymentsDue}
        taxBreakdown={metrics.taxBreakdown}
        taxByCabinet={cabinets.map((c, i) => {
          // Mock tax distribution per cabinet
          const mockTaxAmounts = [45000, 32000, 18000, 12000, 8000];
          const taxAmount = mockTaxAmounts[i % mockTaxAmounts.length] || 10000;
          return {
            cabinetId: c.id,
            cabinetName: c.name,
            total: taxAmount,
            percentOfTotal: metrics.taxPaymentsDue > 0 
              ? Math.round((taxAmount / metrics.taxPaymentsDue) * 100) 
              : 0,
          };
        })}
        previousPeriodTax={metrics.taxPaymentsDue * 0.92}
        onCabinetClick={(cabinetId) => {
          const cabinet = cabinets.find(c => c.id === cabinetId);
          if (cabinet) onCabinetSelect?.(cabinet);
        }}
        onAiPromptClick={onChatPromptInsert}
      />

      {/* Salary Analytics Section - dedicated component with id for scroll navigation */}
      <SalaryAnalyticsSection
        totalSalary={metrics.salaryPaymentsDue}
        salaryBreakdown={metrics.salaryBreakdown}
        salaryByCabinet={cabinets
          .filter(c => c.hasEmployees)
          .map((c, i) => {
            // Mock salary distribution per cabinet
            const mockSalaryAmounts = [85000, 62000, 45000];
            const mockEmployeeCounts = [5, 3, 2];
            return {
              cabinetId: c.id,
              cabinetName: c.name,
              total: mockSalaryAmounts[i % mockSalaryAmounts.length] || 40000,
              employeeCount: mockEmployeeCounts[i % mockEmployeeCounts.length] || 2,
              percentOfTotal: metrics.salaryPaymentsDue > 0 
                ? Math.round((mockSalaryAmounts[i % mockSalaryAmounts.length] || 40000) / metrics.salaryPaymentsDue * 100) 
                : 0,
            };
          })}
        previousPeriodSalary={metrics.salaryPaymentsDue * 0.95}
        onCabinetClick={(cabinetId) => {
          const cabinet = cabinets.find(c => c.id === cabinetId);
          if (cabinet) onCabinetSelect?.(cabinet);
        }}
        onAiPromptClick={onChatPromptInsert}
      />
    </div>
  );

  // Risks Section
  const renderRisksSection = () => (
    <div id="risks-section" className="space-y-6">
      {/* FOP Limits */}
      {metrics.limitAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Ліміти ФОП
            </CardTitle>
            <CardDescription>Використання річного ліміту доходу</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.limitAlerts.map((alert) => (
              <div key={alert.cabinetId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const cabinet = cabinets.find(c => c.id === alert.cabinetId);
                        if (cabinet) onCabinetSelect?.(cabinet);
                      }}
                      className="text-sm font-medium hover:underline"
                    >
                      {alert.cabinetName}
                    </button>
                    <Badge variant="outline" className="text-xs">{alert.fopGroup} група</Badge>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold",
                    alert.severity === "high" ? "text-destructive" :
                    alert.severity === "medium" ? "text-amber-600" :
                    "text-muted-foreground"
                  )}>
                    {alert.percent}%
                  </span>
                </div>
                <Progress 
                  value={alert.percent} 
                  className={cn(
                    "h-2",
                    alert.severity === "high" ? "[&>div]:bg-destructive" :
                    alert.severity === "medium" ? "[&>div]:bg-amber-500" :
                    ""
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(alert.yearlyIncome)}</span>
                  <span>Ліміт: {formatCurrency(alert.limit)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Risks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Зведені ризики
          </CardTitle>
          <CardDescription>По всіх кабінетах</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {metrics.riskItems.length === 0 ? (
            <div className="p-6 text-center">
              <FileCheck className="h-12 w-12 mx-auto text-success/50 mb-2" />
              <p className="text-sm text-muted-foreground">Критичних ризиків не виявлено</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {metrics.riskItems.map((risk) => {
                const RiskIcon = risk.icon;
                return (
                  <button
                    key={risk.id}
                    onClick={() => {
                      const cabinet = cabinets.find(c => c.id === risk.cabinetId);
                      if (cabinet) onCabinetSelect?.(cabinet);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      risk.severity === "high" ? "bg-destructive/10" :
                      risk.severity === "medium" ? "bg-amber-500/10" :
                      "bg-muted"
                    )}>
                      <RiskIcon className={cn(
                        "h-4 w-4",
                        risk.severity === "high" ? "text-destructive" :
                        risk.severity === "medium" ? "text-amber-600" :
                        "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{risk.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{risk.cabinetName}</p>
                    </div>
                    {risk.value && (
                      <Badge 
                        variant={risk.severity === "high" ? "destructive" : "secondary"}
                        className="shrink-0"
                      >
                        {risk.value}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dedicated Audits Section */}
      <AuditsSection
        totalAudits={metrics.activeAudits}
        auditsBreakdown={metrics.auditsBreakdown}
        audits={demoAudits
          .filter(a => a.status === "in-progress" || a.status === "response-required" || a.status === "announced")
          .slice(0, 5)
          .map((audit, i) => ({
            id: audit.id,
            cabinetId: cabinets[i % cabinets.length]?.id || "1",
            cabinetName: cabinets[i % cabinets.length]?.name || "ФОП Іваненко І.І.",
            type: audit.period,
            status: audit.status as "response-required" | "in-progress" | "announced",
            daysLeft: audit.status === "response-required" ? 5 : undefined,
            authority: audit.taxOffice.split(" ").slice(0, 3).join(" "),
          }))}
        onAuditClick={(audit) => {
          const cabinet = cabinets.find(c => c.id === audit.cabinetId);
          if (cabinet) onCabinetSelect?.(cabinet);
        }}
        onCabinetClick={(cabinetId) => {
          const cabinet = cabinets.find(c => c.id === cabinetId);
          if (cabinet) onCabinetSelect?.(cabinet);
        }}
      />
    </div>
  );

  // Insights Section
  const renderInsightsSection = () => {
    const visibleInsights = showAllInsights 
      ? metrics.insights 
      : metrics.insights.slice(0, 3);
    const hasMore = metrics.insights.length > 3;

    return (
      <div id="insights-section" className="space-y-6">
        {/* AI Insights */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Smart Insights
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {metrics.insights.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">Автоматичні рекомендації на основі даних</CardDescription>
              </div>
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllInsights(!showAllInsights)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showAllInsights ? "Згорнути" : `Ще ${metrics.insights.length - 3}`}
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-1 transition-transform",
                    showAllInsights && "rotate-180"
                  )} />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleInsights.map((insight) => {
              const InsightIcon = insight.icon;
              return (
                <div 
                  key={insight.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg",
                    insight.type === "success" ? "bg-success/10" :
                    insight.type === "warning" ? "bg-amber-500/10" :
                    "bg-primary/5"
                  )}
                >
                  <InsightIcon className={cn(
                    "h-5 w-5 mt-0.5 shrink-0",
                    insight.type === "success" ? "text-success" :
                    insight.type === "warning" ? "text-amber-600" :
                    "text-primary"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                    
                    {/* Action button */}
                    {insight.action && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-1.5 text-xs text-primary"
                        onClick={() => handleInsightAction(insight.action)}
                      >
                        {insight.action.label}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Mobile tabs navigation with swipe support
  const renderMobileTabs = () => (
    <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
      <ScrollArea className="w-full">
        <TabsList className="w-full flex h-auto p-1.5 gap-1">
          {portfolioSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className={cn(
                  "flex flex-col gap-1 py-2.5 px-3 flex-shrink-0",
                  "text-xs font-medium",
                  "min-w-[56px] min-h-[52px]", // Better touch target + min width
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "transition-all duration-200"
                )}
              >
                <SectionIcon className="h-4 w-4" />
                <span className="truncate max-w-[60px]">{section.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <ScrollBar orientation="horizontal" className="h-1" />
      </ScrollArea>
      
      {/* Swipe container for tab content */}
      <div 
        className="mt-5 overflow-hidden"
        {...swipeHandlers}
        style={{
          transform: isSwiping ? `translateX(${swipeOffset}px)` : undefined,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isSwiping ? Math.max(0.7, 1 - Math.abs(swipeOffset) / 300) : 1,
        }}
      >
        <TabsContent value="kpi" className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              <SectionSkeleton variant="kpi" />
              <SectionSkeleton variant="kpi" />
              <SectionSkeleton variant="kpi" />
              <SectionSkeleton variant="kpi" />
            </div>
          ) : renderKPISection()}
        </TabsContent>
        <TabsContent value="finance" className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="space-y-4">
              <SectionSkeleton variant="chart" />
              <SectionSkeleton variant="list" />
            </div>
          ) : renderFinanceSection()}
        </TabsContent>
        <TabsContent value="compliance" className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="space-y-4">
              <SectionSkeleton variant="list" />
              <SectionSkeleton variant="chart" />
            </div>
          ) : renderComplianceSection()}
        </TabsContent>
        <TabsContent value="risks" className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <div className="space-y-4">
              <SectionSkeleton variant="list" />
              <SectionSkeleton variant="list" />
            </div>
          ) : renderRisksSection()}
        </TabsContent>
        <TabsContent value="insights" className="mt-0 focus-visible:outline-none">
          {isLoading ? (
            <SectionSkeleton variant="list" />
          ) : renderInsightsSection()}
        </TabsContent>
      </div>
    </Tabs>
  );

  // Desktop layout - all sections visible
  const renderDesktopLayout = () => (
    <div className="space-y-8">
      {/* KPI Section - Full width */}
      <section>
        <div className="mb-4"><SectionHeader title="Ключові показники" icon={BarChart3} /></div>
        {renderKPISection()}
      </section>
      
      {/* Finance Section - Full width */}
      <section>
        <div className="mb-4"><SectionHeader title="Фінансовий огляд" icon={Wallet} /></div>
        {renderFinanceSection()}
      </section>
      
      {/* Compliance Section - Full width */}
      <section>
        <div className="mb-4"><SectionHeader title="Compliance & Звітність" icon={FileCheck} /></div>
        {renderComplianceSection()}
      </section>
      
      {/* Risks Section - Full width */}
      <section>
        <div className="mb-4"><SectionHeader title="Ризики та увага" icon={ShieldAlert} /></div>
        {renderRisksSection()}
      </section>
      
      {/* Insights Section - Full width */}
      <section>
        <div className="mb-4"><SectionHeader title="Інсайти та рекомендації" icon={Sparkles} /></div>
        {renderInsightsSection()}
      </section>
    </div>
  );

  return (
    <div 
      className="h-full overflow-auto relative"
      onScroll={handleScroll}
      {...(isMobile ? pullHandlers : {})}
    >
      {/* Phase 3: Pull-to-refresh indicator */}
      {isMobile && (
        <PullToRefreshIndicator 
          pullDistance={pullDistance} 
          isRefreshing={isRefreshing}
          threshold={80}
        />
      )}
      
      <div 
        className={cn(
          "p-4 md:p-6 lg:p-8 space-y-6",
          "pb-[calc(env(safe-area-inset-bottom,0px)+8rem)] md:pb-20",
          isMobile && pullDistance > 0 && `pt-${Math.min(Math.round(pullDistance / 4), 12)}`
        )}
        style={{
          transform: isMobile && pullDistance > 0 ? `translateY(${pullDistance * 0.5}px)` : undefined,
          transition: isRefreshing ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {/* Header with Back Button & Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToCabinets && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToCabinets}
                className="p-2 h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
                aria-label="Повернутися до кабінетів"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Аналітика портфеля</h1>
              <p className="text-sm text-muted-foreground">
                Зведена аналітика по {metrics.activeCabinets} активних кабінетах
              </p>
            </div>
          </div>
          
          {/* Period Selectors & Offline Indicator */}
          <div className="flex items-center gap-2">
            {/* Phase 3: Offline indicator */}
            <OfflineIndicator lastUpdated={lastUpdated} />
            
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-[80px] sm:w-[90px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
              <SelectTrigger className="w-[72px] sm:w-[110px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{isMobile ? periodLabels.month.short : periodLabels.month.full}</SelectItem>
                <SelectItem value="quarter">{isMobile ? periodLabels.quarter.short : periodLabels.quarter.full}</SelectItem>
                <SelectItem value="year">{isMobile ? periodLabels.year.short : periodLabels.year.full}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {isMobile ? renderMobileTabs() : renderDesktopLayout()}
      </div>
    </div>
  );
}

export default PortfolioAnalyticsPage;
