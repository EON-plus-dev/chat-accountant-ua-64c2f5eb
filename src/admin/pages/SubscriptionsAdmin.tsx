import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, Mail, TrendingUp, Calendar, Users, BarChart3 } from "lucide-react";
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { uk } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

interface SubRow {
  id: string;
  email: string;
  name: string | null;
  source: string;
  audience_type: string | null;
  topics: string[] | null;
  article_slug: string | null;
  created_at: string | null;
  is_active: boolean | null;
}

const SOURCE_LABELS: Record<string, string> = {
  lead_magnet: "Lead Magnet",
  alert_subscription: "Сповіщення",
  article_alert: "Стаття",
  sidebar_mini: "Сайдбар",
  unified_cta: "CTA",
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(210, 70%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(45, 90%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 70%, 55%)",
];

export default function SubscriptionsAdmin() {
  const { data: subs = [], isLoading, error } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("analytics-stats");
      // analytics-stats returns aggregated stats, but we need raw data for charts
      // Use the edge function that has service_role access
      const res = await supabase.functions.invoke("admin-subscriptions-data");
      if (res.error) throw res.error;
      return (res.data || []) as SubRow[];
    },
  });

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    return {
      total: subs.length,
      today: subs.filter((s) => s.created_at && isAfter(new Date(s.created_at), todayStart)).length,
      week: subs.filter((s) => s.created_at && isAfter(new Date(s.created_at), weekAgo)).length,
      month: subs.filter((s) => s.created_at && isAfter(new Date(s.created_at), monthAgo)).length,
      active: subs.filter((s) => s.is_active !== false).length,
    };
  }, [subs]);

  // Source breakdown for pie chart
  const sourceData = useMemo(() => {
    const map = new Map<string, number>();
    subs.forEach((s) => {
      const key = s.source || "unknown";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name: SOURCE_LABELS[name] || name, value }))
      .sort((a, b) => b.value - a.value);
  }, [subs]);

  // Daily signups for last 30 days (area chart)
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(now, i), "yyyy-MM-dd");
      days[d] = 0;
    }
    subs.forEach((s) => {
      if (!s.created_at) return;
      const d = format(new Date(s.created_at), "yyyy-MM-dd");
      if (d in days) days[d]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: format(new Date(date), "dd.MM", { locale: uk }),
      count,
    }));
  }, [subs]);

  // Topics breakdown
  const topicsData = useMemo(() => {
    const map = new Map<string, number>();
    subs.forEach((s) => {
      (s.topics || []).forEach((t) => map.set(t, (map.get(t) || 0) + 1));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [subs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-muted-foreground">Помилка завантаження підписок</p>
        <p className="text-xs text-muted-foreground max-w-md text-center">
          Переконайтесь, що edge function "admin-subscriptions-data" розгорнута
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Підписки</h1>
        <p className="text-muted-foreground mt-1">Аналітика email-підписок та джерел трафіку</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Всього", value: stats.total, icon: Mail, color: "text-primary" },
          { label: "Активних", value: stats.active, icon: Users, color: "text-emerald-600" },
          { label: "Сьогодні", value: stats.today, icon: Calendar, color: "text-blue-600" },
          { label: "За тиждень", value: stats.week, icon: TrendingUp, color: "text-purple-600" },
          { label: "За місяць", value: stats.month, icon: BarChart3, color: "text-amber-600" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-lg font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily signups */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Нові підписки за 30 днів</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="url(#subGrad)"
                  strokeWidth={2}
                  name="Підписки"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Джерела підписок</CardTitle>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">Немає даних</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Topics breakdown */}
      {topicsData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Популярні теми</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topicsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Підписників" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
