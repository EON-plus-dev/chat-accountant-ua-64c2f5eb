import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WEBINARS, LEARN_CATEGORIES, type CourseAudience } from "@/portal/data/learn";
import { CalendarDays, Users, Clock, ArrowRight } from "lucide-react";

interface Props {
  archive?: boolean;
}

const LearnWebinarsPage = ({ archive = false }: Props) => {
  const now = new Date();
  const webinars = WEBINARS.filter(w => archive ? new Date(w.dateISO) <= now : new Date(w.dateISO) > now);

  return (
    <PortalLayout meta={{
      title: archive ? "Архів вебінарів — FINTODO" : "Вебінари — FINTODO",
      description: archive
        ? "Записи минулих вебінарів по бухобліку, оподаткуванню та FINTODO."
        : "Майбутні вебінари по бухобліку, оподаткуванню та FINTODO. Безкоштовна реєстрація.",
      canonical: archive ? "https://fintodo.com.ua/learn/webinars/archive" : "https://fintodo.com.ua/learn/webinars",
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Навчання", url: `${SITE_URL}/learn` },
        { name: archive ? "Архів вебінарів" : "Вебінари", url: `${SITE_URL}/learn/webinars${archive ? '/archive' : ''}` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Навчання", to: "/learn" },
          { label: archive ? "Архів вебінарів" : "Вебінари" },
        ]} />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {archive ? "Архів вебінарів" : "Вебінари"}
          </h1>
          <Button variant="outline" size="sm" asChild>
            <Link to={archive ? "/learn/webinars" : "/learn/webinars/archive"}>
              {archive ? "Майбутні →" : "Архів →"}
            </Link>
          </Button>
        </div>

        {webinars.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">
            {archive ? "Архів вебінарів поки порожній" : "Немає запланованих вебінарів"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {webinars.map(w => (
              <Card key={w.id} className="hover:border-primary/40 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{w.date}</span>
                    </div>
                    <Badge variant={w.isFree ? "secondary" : "outline"}>
                      {w.isFree ? "Безкоштовно" : "Платний"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{w.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{w.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {w.enrolled && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {w.enrolled} зареєструвались
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {w.duration}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {w.audience.map(a => (
                      <Badge key={a} variant="outline" className="text-[10px]">
                        {LEARN_CATEGORIES[a].label}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{w.speakerName} · {w.speakerRole}</p>
                  <Button size="sm" className="w-full">
                    {w.isUpcoming ? "Зареєструватись" : "Дивитись запис"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default LearnWebinarsPage;
