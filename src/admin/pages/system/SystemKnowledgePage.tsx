import { useState } from "react";
import { SystemPageShell } from "./SystemPageShell";
import { MOCK_KNOWLEDGE_ARTICLES } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GitBranch, Link2 } from "lucide-react";

const STATUS_LABEL = { draft: "Чернетка", review: "На перевірці", active: "Активна", archived: "Архів" } as const;
const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  archived: "bg-zinc-500/15 text-zinc-700 border-zinc-500/30",
};

const CATEGORY: Record<string, string> = { taxes: "Податки", documents: "Документи", integrations: "Інтеграції", examples: "Приклади" };

export default function SystemKnowledgePage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const list = MOCK_KNOWLEDGE_ARTICLES.filter((a) =>
    (status === "all" || a.status === status) &&
    (!q || a.title.toLowerCase().includes(q.toLowerCase()) || a.intents.some((i) => i.includes(q.toLowerCase())))
  );

  return (
    <SystemPageShell
      title="База знань AI"
      description="Статті, версії та звʼязки intent → стаття. Джерело правди для AI-чату та телефонії."
      actions={<Button size="sm">+ Нова стаття</Button>}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук за назвою або intent…" className="pl-8 h-9" />
        </div>
        {(["all", "draft", "review", "active", "archived"] as const).map((s) => (
          <Button key={s} size="sm" variant={status === s ? "default" : "outline"} className="h-8" onClick={() => setStatus(s)}>
            {s === "all" ? "Усі" : STATUS_LABEL[s]}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {list.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 hover:bg-muted/40">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                    <span>{CATEGORY[a.category]}</span>
                    <span>·</span>
                    <span>оновлено {new Date(a.updatedAt).toLocaleDateString("uk-UA")}</span>
                    <span>·</span>
                    <span>{a.author}</span>
                    {a.intents.map((i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        <Link2 className="h-2.5 w-2.5 mr-1" /> {i}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${STATUS_CLASS[a.status]}`}>{STATUS_LABEL[a.status as keyof typeof STATUS_LABEL]}</Badge>
                <Badge variant="outline" className="text-xs">
                  <GitBranch className="h-3 w-3 mr-1" /> v{a.version}
                </Badge>
                <Button size="sm" variant="outline" className="h-7 text-xs">Редагувати</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
