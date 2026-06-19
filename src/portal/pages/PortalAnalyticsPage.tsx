import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { Card } from "@/components/ui/card";
import { BarChart3, ExternalLink } from "lucide-react";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";
import { Button } from "@/components/ui/button";

interface Stats {
  total: number;
  today: number;
  week: number;
  bySource: {
    lead_magnet: number;
    alert_subscription: number;
    article_alert: number;
    sidebar_mini: number;
  };
}

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-stats`;

const MetricCard = ({ label, value }: { label: string; value: number }) => (
  <Card className="p-4 space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold text-foreground">{value}</p>
  </Card>
);

const SOURCE_LABELS: Record<string, string> = {
  lead_magnet: "Лід-магніт",
  alert_subscription: "Підписка на зміни",
  article_alert: "Підписка зі статті",
  sidebar_mini: "Міні-форма",
};

const PortalAnalyticsPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) {
          setError("Необхідна авторизація");
          setLoading(false);
          return;
        }
        const res = await fetch(FUNC_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setStats(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <PortalLayout
      meta={{
        title: "Аналітика підписок | FINTODO",
        description: "Внутрішня сторінка аналітики email-підписок",
        canonical: "https://fintodo.com.ua/analytics",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Аналітика підписок
            </h1>
            <p className="text-sm text-muted-foreground">Дані з бази email-підписок</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="https://plausible.io/fintodo.com.ua" target="_blank" rel="noopener noreferrer">
              Plausible <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </Button>
        </div>

        {loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SectionSkeleton key={i} variant="kpi" />
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-5 w-32 rounded bg-muted animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SectionSkeleton key={i} variant="kpi" />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <Card className="p-6 text-center text-destructive">
            <p>Помилка: {error}</p>
          </Card>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <MetricCard label="Всього підписок" value={stats.total} />
              <MetricCard label="Сьогодні" value={stats.today} />
              <MetricCard label="За тиждень" value={stats.week} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">По джерелах</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(stats.bySource).map(([key, val]) => (
                  <MetricCard key={key} label={SOURCE_LABELS[key] || key} value={val} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
};

export default PortalAnalyticsPage;
