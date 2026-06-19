import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ArrowRight, Mic, TrendingUp } from "lucide-react";
import { getUpcomingDeadlines, getMostReadArticles } from "@/portal/data/dailyDigest";
import { WEBINARS } from "@/portal/data/learn";
import { ARTICLES } from "@/portal/data/articles";
import { cn } from "@/lib/utils";

const urgencyStyles: Record<string, string> = {
  urgent: "border-l-destructive bg-destructive/5",
  upcoming: "border-l-warning bg-warning/5",
  ok: "border-l-info bg-info/5",
};

export const OverviewSidebar = () => {
  const deadlines = getUpcomingDeadlines(4);
  const mostRead = getMostReadArticles(5);
  const upcomingWebinar = WEBINARS.find(w => w.isUpcoming);
  const latestPodcast = !upcomingWebinar ? ARTICLES.find(a => a.mediaType === "podcast") : undefined;

  return (
    <aside className="sticky top-20 space-y-5">
      {/* Deadlines */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Події</p>
            </div>
            <Link to="/analytics/deadlines" className="text-[10px] text-primary hover:underline">Всі →</Link>
          </div>
          {deadlines.map(d => (
            <div key={d.id} className={cn("border-l-2 rounded-r-md px-3 py-2 space-y-0.5", urgencyStyles[d.urgency])}>
              <p className="text-xs font-medium text-foreground leading-snug">{d.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {d.date} · {d.daysLeft > 0 ? `${d.daysLeft} дн.` : "Сьогодні!"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Most Read */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Популярне</p>
          </div>
          {mostRead.map((a, i) => (
            <Link key={a.id} to={`/articles/${a.slug}`} className="flex items-start gap-2 group">
              <span className="text-xs font-bold text-muted-foreground/50 mt-0.5 w-4 shrink-0">{i + 1}</span>
              <p className="text-xs text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Webinar OR Podcast (priority: upcoming webinar) */}
      {upcomingWebinar && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Вебінар</p>
            </div>
            <p className="text-xs font-medium text-foreground">{upcomingWebinar.title}</p>
            <p className="text-[10px] text-muted-foreground">{upcomingWebinar.date}</p>
            <Link to="/learn/webinars" className="text-xs text-primary hover:underline flex items-center gap-1">
              Зареєструватись <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      )}

      {latestPodcast && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Останній подкаст</p>
            </div>
            <p className="text-xs font-medium text-foreground leading-snug">{latestPodcast.title}</p>
            <p className="text-[10px] text-muted-foreground">{latestPodcast.mediaDuration} · {latestPodcast.publishedAt}</p>
            <Link to={`/articles/${latestPodcast.slug}`} className="text-xs text-primary hover:underline flex items-center gap-1">
              Слухати <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      )}
    </aside>
  );
};
