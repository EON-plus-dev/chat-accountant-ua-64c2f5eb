import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, AlertCircle, Info, FileText, Clock, CheckCircle2 } from "lucide-react";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import {
  AnalyticsRole,
  PeriodType,
  analyticsRolesConfig,
  periodOptions,
  getRoleConfig,
  formatValue,
} from "@/config/analyticsConfig";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  onChatPromptClick?: (prompt: string) => void;
}

export function AnalyticsDashboard({ onChatPromptClick }: AnalyticsDashboardProps) {
  const [selectedRole, setSelectedRole] = useState<AnalyticsRole>("fop-services");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("this-month");

  const roleConfig = getRoleConfig(selectedRole);

  const chartConfig = {
    income: { label: "Дохід", color: "hsl(var(--success))" },
    expenses: { label: "Витрати", color: "hsl(var(--destructive))" },
    orders: { label: "Замовлення", color: "hsl(var(--chart-1))" },
    revenue: { label: "Виручка", color: "hsl(var(--chart-2))" },
    risks: { label: "Ризики", color: "hsl(var(--destructive))" },
  };

  const renderMainChart = () => {
    const { mainChart } = roleConfig;

    switch (mainChart.type) {
      case "income-expense-line":
        return (
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{mainChart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48 sm:h-56 md:h-64 w-full">
                <LineChart data={mainChart.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--success))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--destructive))" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        );

      case "orders-revenue-bar":
        return (
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{mainChart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48 sm:h-56 md:h-64 w-full">
                <BarChart data={mainChart.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" tickFormatter={(v) => `${v / 1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar yAxisId="left" dataKey="orders" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        );

      case "report-calendar":
        return (
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{mainChart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mainChart.data.map((report: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{report.report}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Дедлайн: {new Date(report.deadline).toLocaleDateString("uk-UA")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={report.status === "ready" ? "default" : "secondary"}
                      className={report.status === "ready" ? "bg-success text-success-foreground" : ""}
                    >
                      {report.status === "ready" ? "Готово" : "Очікує"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "companies-table":
        return (
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{mainChart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mainChart.data.map((company: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          company.status === "ok" && "bg-success",
                          company.status === "warning" && "bg-warning",
                          company.status === "error" && "bg-destructive"
                        )}
                      />
                      <span className="font-medium text-sm">{company.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{company.comment}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "risk-heatmap":
        return (
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{mainChart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-48 sm:h-56 md:h-64 w-full">
                <BarChart data={mainChart.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="risks" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderSecondaryBlock = (block: any) => {
    switch (block.type) {
      case "important-alerts":
        return (
          <Card key={block.type} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {block.data.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      alert.type === "error" && "bg-destructive/10 border-destructive/20",
                      alert.type === "warning" && "bg-warning/10 border-warning/20",
                      alert.type === "info" && "bg-primary/10 border-primary/20"
                    )}
                  >
                    {alert.type === "error" && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />}
                    {alert.type === "warning" && <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />}
                    {alert.type === "info" && <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
                    <p className="text-sm">{alert.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "expense-structure":
        return (
          <Card key={block.type} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={block.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {block.data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-md">
                              <p className="text-sm font-medium">{payload[0].name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatValue(payload[0].value as number, "currency")}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {block.data.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "payment-funnel":
        return (
          <Card key={block.type} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold tabular-nums">{block.data.created}</p>
                  <p className="text-xs text-muted-foreground">Створено</p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold tabular-nums">{block.data.invoiced}</p>
                  <p className="text-xs text-muted-foreground">Виставлено</p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold tabular-nums text-success">{block.data.paid}</p>
                  <p className="text-xs text-muted-foreground">Оплачено</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "top-items":
        return (
          <Card key={block.type} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {block.data.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm truncate flex-1">{item.name}</span>
                    <span className="text-sm font-medium tabular-nums ml-2">
                      {formatValue(item.revenue || item.amount, "currency")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "debtors":
        return (
          <Card key={block.type} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{block.title}</span>
                <span className="text-destructive font-bold tabular-nums">
                  {formatValue(block.data.total, "currency")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {block.data.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-1 text-sm">
                    <span className="truncate flex-1">{item.name}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-medium tabular-nums">{formatValue(item.amount, "currency")}</span>
                      <Badge variant="destructive" className="text-xs">
                        {item.days} дн.
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "data-quality":
        return (
          <Card key={block.type} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold tabular-nums text-warning">{block.data.noCategory}</p>
                  <p className="text-xs text-muted-foreground">Без категорії</p>
                </div>
                <div>
                  <p className="text-xl font-bold tabular-nums text-warning">{block.data.noCounterparty}</p>
                  <p className="text-xs text-muted-foreground">Без контрагента</p>
                </div>
                <div>
                  <p className="text-xl font-bold tabular-nums text-destructive">{block.data.duplicates}</p>
                  <p className="text-xs text-muted-foreground">Дублікати</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "tasks":
        return (
          <Card key={block.type} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {block.data.map((task: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "risk-zones":
        return (
          <Card key={block.type} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {block.data.map((risk: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{risk}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "summary":
        return (
          <Card key={block.type} className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">{block.data}</p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 space-y-4 md:space-y-5">
        {/* Selectors Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Переглянути як:</span>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AnalyticsRole)}>
              <SelectTrigger className="w-full sm:w-[200px] min-h-[44px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {Object.values(analyticsRolesConfig).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <role.icon className="h-4 w-4" />
                      <span>{role.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Період:</span>
            <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodType)}>
              <SelectTrigger className="w-full sm:w-[160px] min-h-[44px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {periodOptions.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-stretch">
          {roleConfig.kpis.map((kpi) => (
            <UniversalKPICard
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              trend={kpi.trend ? { ...kpi.trend, direction: kpi.trend.direction as "up" | "down" | "stable" } : undefined}
              description={kpi.description}
              icon={kpi.icon}
              format={kpi.format}
              density="comfortable"
            />
          ))}
        </div>

        {/* Main Chart */}
        {renderMainChart()}

        {/* Secondary Blocks */}
        {roleConfig.secondaryBlocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {roleConfig.secondaryBlocks.map((block) => renderSecondaryBlock(block))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
