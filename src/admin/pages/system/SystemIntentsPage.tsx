import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_INTENTS, MOCK_KNOWLEDGE_ARTICLES } from "@/admin/system/data/mocks";

const GROUP: Record<string, string> = {
  integration: "Інтеграційні", operation: "Операційні", analytics: "Аналітичні", profile: "Профільні", billing: "Білінгові",
};

export default function SystemIntentsPage() {
  return (
    <SystemPageShell title="Бібліотека інтентів" description="Єдина бібліотека Chat + Voice. Звʼязки intent → стаття знань.">
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {MOCK_INTENTS.map((i) => {
              const art = MOCK_KNOWLEDGE_ARTICLES.find((a) => a.id === i.linkedArticle);
              return (
                <div key={i.id} className="flex items-center gap-3 p-3">
                  <Badge variant="outline" className="text-[10px]">{GROUP[i.group]}</Badge>
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-mono">{i.name}</code>
                    {art && <div className="text-xs text-muted-foreground mt-0.5">→ {art.title}</div>}
                  </div>
                  <div className="flex gap-1">
                    {i.channels.map((c) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
