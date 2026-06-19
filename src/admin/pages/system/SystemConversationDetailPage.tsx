import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Flag, BookPlus, Bot, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { StatusChip, type StatusLevel } from "@/admin/components/system/StatusChip";
import { EntityAuditTab } from "@/admin/components/system/EntityAuditTab";
import { MOCK_AI_QA, MOCK_CONVERSATION_TRANSCRIPTS, MOCK_CABINETS, type AiQaDialogMock } from "@/admin/system/data/mocks";
import { cn } from "@/lib/utils";

const STATUS_LEVEL: Record<AiQaDialogMock["status"], StatusLevel> = {
  pending: "info",
  ok: "ok",
  needs_fix: "warning",
};

export default function SystemConversationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qa = MOCK_AI_QA.find((q) => q.id === id);
  const transcript = useMemo(() => MOCK_CONVERSATION_TRANSCRIPTS[id] ?? [], [id]);
  const cabinet = MOCK_CABINETS.find((c) => c.id === qa?.cabinetId);

  const [flagged, setFlagged] = useState<boolean>(qa?.flags && qa.flags.length > 0 ? true : false);
  const [knowledgeCreated, setKnowledgeCreated] = useState(false);

  if (!qa) {
    return (
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Назад
        </Button>
        <Card><CardContent className="p-8 text-center text-muted-foreground">Діалог {id} не знайдено.</CardContent></Card>
      </div>
    );
  }

  const handleFlag = () => {
    setFlagged(true);
    toast({ title: "Діалог позначено для QA (демо)" });
  };

  const handleCreateKnowledge = () => {
    setKnowledgeCreated(true);
    toast({ title: "Створено чернетку статті бази знань (демо)", description: "Перейдіть у «AI та база знань» → Чернетки." });
  };

  return (
    <div className="max-w-6xl space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/system/ai/qa")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> До списку QA
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-muted-foreground">{qa.id} · {qa.channel}</div>
          <h1 className="text-2xl md:text-3xl font-semibold mt-1">Інтент: {qa.intent}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusChip level={STATUS_LEVEL[qa.status]}>{qa.status}</StatusChip>
            {qa.flags.map((f) => (
              <StatusChip key={f} level="warning">{f}</StatusChip>
            ))}
            {flagged && qa.flags.length === 0 && <StatusChip level="warning">flagged</StatusChip>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleFlag} disabled={flagged}>
            <Flag className="h-4 w-4 mr-1" /> {flagged ? "Позначено" : "Flag for QA"}
          </Button>
          <Button size="sm" onClick={handleCreateKnowledge} disabled={knowledgeCreated}>
            <BookPlus className="h-4 w-4 mr-1" /> {knowledgeCreated ? "Створено" : "Create knowledge task"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transcript">
        <TabsList>
          <TabsTrigger value="transcript">Транскрипт</TabsTrigger>
          <TabsTrigger value="audit">Аудит</TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Діалог</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {transcript.length === 0 && (
                  <div className="text-sm text-muted-foreground">Транскрипт недоступний (демо).</div>
                )}
                {transcript.map((m, i) => (
                  <div key={i} className={cn("flex gap-3", m.role === "user" ? "" : "flex-row-reverse")}>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      m.role === "user" ? "bg-muted" : "bg-primary/15 text-primary",
                    )}>
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                      m.role === "user" ? "bg-muted" : "bg-primary/10",
                    )}>
                      <div>{m.text}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(m.at).toLocaleString("uk-UA")}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Контекст</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <Row k="Кабінет" v={cabinet?.name ?? qa.cabinetId} />
                  <Row k="Канал" v={qa.channel} />
                  <Row k="Інтент" v={qa.intent} mono />
                  <Row k="Дата" v={new Date(qa.createdAt).toLocaleString("uk-UA")} />
                  <Row k="Статус QA" v={qa.status} />
                </CardContent>
              </Card>
              {cabinet && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Звʼязані</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1.5">
                    <Link to={`/admin/system/cabinets/${cabinet.id}`} className="block text-primary hover:underline">
                      Картка кабінета →
                    </Link>
                    <Link to="/admin/system/ai/knowledge" className="block text-primary hover:underline">
                      База знань →
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <EntityAuditTab entityId={id} emptyText="Поки що немає записів в аудиті для цього діалогу (демо)." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("text-right", mono && "font-mono text-xs")}>{v}</span>
    </div>
  );
}
