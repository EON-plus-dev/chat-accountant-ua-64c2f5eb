import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, AlertTriangle, Sparkles, FileText } from "lucide-react";
import ContentCalendarAdmin from "@/admin/pages/ContentCalendarAdmin";
import DeadlinesAdmin from "@/admin/pages/DeadlinesAdmin";
import TaxCalendarAdmin from "@/admin/pages/TaxCalendarAdmin";
import { useContentIdeas } from "@/admin/hooks/useContentIdeas";

/**
 * Календар AI CMS — 4 шари в табах:
 *  1. План публікацій (ContentCalendarAdmin)
 *  2. Податкові дедлайни (DeadlinesAdmin) — як контент-тригери
 *  3. Податковий календар (TaxCalendarAdmin) — моніторинг + сповіщення
 *  4. AI-теми — заплановані ідеї з content_ideas
 */
export default function CmsCalendarPanel() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6">
        <Tabs defaultValue="plan" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="plan" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> План публікацій
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Дедлайни
            </TabsTrigger>
            <TabsTrigger value="tax" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Податковий календар
            </TabsTrigger>
            <TabsTrigger value="ai-ideas" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> AI-теми
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-0">
            <ContentCalendarAdmin />
          </TabsContent>
          <TabsContent value="deadlines" className="mt-0">
            <DeadlinesAdmin />
          </TabsContent>
          <TabsContent value="tax" className="mt-0">
            <TaxCalendarAdmin />
          </TabsContent>
          <TabsContent value="ai-ideas" className="mt-0">
            <AiIdeasCalendarLayer />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

function AiIdeasCalendarLayer() {
  const { ideas, loading } = useContentIdeas();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof ideas>();
    for (const i of ideas) {
      if (i.status === "dismissed" || i.status === "published") continue;
      const key = i.created_at.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(i);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [ideas]);

  if (loading) {
    return <div className="text-sm text-muted-foreground py-12 text-center">Завантаження AI-тем…</div>;
  }

  if (grouped.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Поки немає AI-ідей. Згенеруйте їх у Редакторі → Редагувати → «Згенерувати ідеї».
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Заплановані AI-ідеї згруповані за датою створення. Клік на ідею у Редакторі переводить її в публікацію.
      </p>
      {grouped.map(([date, items]) => (
        <Card key={date}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {new Date(date).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
              <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex items-start gap-2 text-sm border-b last:border-0 pb-2 last:pb-0">
                <Badge variant="outline" className="text-[10px] shrink-0">{i.audience}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{i.title}</div>
                  {i.description && <div className="text-xs text-muted-foreground line-clamp-2">{i.description}</div>}
                  <code className="text-[10px] text-muted-foreground">{i.page_path}</code>
                </div>
                <Badge variant={i.status === "generated" ? "default" : "secondary"} className="text-[10px] shrink-0">
                  {i.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
