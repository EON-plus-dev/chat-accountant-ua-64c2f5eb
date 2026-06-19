import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ArrowRight, Mic } from "lucide-react";
import { MostReadWidget } from "./MostReadWidget";
import { DEADLINES } from "@/portal/data/deadlines";
import { CURRENCY_RATES } from "@/portal/data/finder";
import { WEBINARS } from "@/portal/data/learn";
import { ARTICLES } from "@/portal/data/articles";
import { cn } from "@/lib/utils";

const urgencyStyles: Record<string, string> = {
  urgent: "border-l-destructive bg-destructive/5",
  upcoming: "border-l-warning bg-warning/5",
  ok: "border-l-info bg-info/5",
};

const upcomingDeadlines = DEADLINES.slice(0, 3);
const topCurrencies = CURRENCY_RATES.rates.slice(0, 3);
const upcomingWebinar = WEBINARS.find(w => w.isUpcoming);
const latestPodcast = ARTICLES.find(a => a.mediaType === 'podcast');

export const HomeSidebar = () => {
  return (
    <aside className="space-y-5">
      {/* 1. Currency widget */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Курси НБУ</p>
            <Link to="/analytics/currency" className="text-xs text-primary hover:underline">Всі →</Link>
          </div>
          {topCurrencies.map(r => (
            <div key={r.currency} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{r.flag} {r.currency}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-foreground">{r.nbuRate.toFixed(2)} ₴</span>
                <span className={cn("text-xs font-mono", r.nbuChange > 0 ? "text-destructive" : r.nbuChange < 0 ? "text-chart-2" : "text-muted-foreground")}>
                  {r.nbuChange > 0 ? '▲' : r.nbuChange < 0 ? '▼' : '—'}{Math.abs(r.nbuChange).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground">{CURRENCY_RATES.meta.lastUpdated}</p>
        </CardContent>
      </Card>

      {/* 3. Deadlines */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Найближчі дедлайни</p>
          </div>
          {upcomingDeadlines.map((d) => (
            <div
              key={d.id}
              className={cn(
                "border-l-2 rounded-r-md px-3 py-2 space-y-0.5",
                urgencyStyles[d.urgency]
              )}
            >
              <p className="text-sm font-medium text-foreground">{d.title}</p>
              <p className="text-xs text-muted-foreground">
                {d.date} · {d.daysLeft > 0 ? `${d.daysLeft} дн.` : "Сьогодні!"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Thematic sections */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Тематичні розділи</p>
          {[
            { href: "/fop", label: "🏪 ФОП" },
            { href: "/taxes", label: "📋 Оподаткування" },
            { href: "/accounting", label: "📊 Бухоблік" },
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors py-0.5"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/publications" className="text-xs text-primary hover:underline block mt-1">
            Всі публікації →
          </Link>
        </CardContent>
      </Card>

      {/* Latest Podcast */}
      {latestPodcast && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Останній подкаст</p>
            </div>
            <p className="text-sm font-medium text-foreground leading-snug">{latestPodcast.title}</p>
            <p className="text-xs text-muted-foreground">
              {latestPodcast.mediaDuration} · {latestPodcast.publishedAt}
            </p>
            <Link to={`/articles/${latestPodcast.slug}`} className="text-xs text-primary hover:underline flex items-center gap-1">
              Слухати <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* 5. Most read */}
      <MostReadWidget />

      {/* 6. Upcoming webinar */}
      {upcomingWebinar && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Найближчий вебінар</p>
            </div>
            <p className="text-sm font-medium text-foreground">{upcomingWebinar.title}</p>
            <p className="text-xs text-muted-foreground">{upcomingWebinar.date}</p>
            <Link to="/learn/webinars" className="text-xs text-primary hover:underline flex items-center gap-1">
              Зареєструватись <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      )}

    </aside>
  );
};
