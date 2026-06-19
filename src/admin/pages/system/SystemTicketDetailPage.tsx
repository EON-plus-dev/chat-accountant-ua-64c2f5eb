import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, MessageSquarePlus, CheckCircle2, Clock, AlertCircle, FileText, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { StatusChip, type StatusLevel } from "@/admin/components/system/StatusChip";
import { EntityAuditTab } from "@/admin/components/system/EntityAuditTab";
import { MOCK_TICKETS, MOCK_TICKET_TIMELINE, type TicketTimelineEventMock, type TicketMock } from "@/admin/system/data/mocks";

const PRIORITY_LEVEL: Record<TicketMock["priority"], StatusLevel> = {
  low: "info",
  med: "info",
  high: "warning",
  urgent: "critical",
};
const STATUS_LEVEL: Record<TicketMock["status"], StatusLevel> = {
  new: "info",
  in_progress: "warning",
  resolved: "ok",
};
const STATUS_LABEL: Record<TicketMock["status"], string> = {
  new: "Новий",
  in_progress: "В роботі",
  resolved: "Закрито",
};
const KIND_ICON: Record<TicketTimelineEventMock["kind"], React.ComponentType<{ className?: string }>> = {
  created: AlertCircle,
  assigned: UserPlus,
  note: MessageSquarePlus,
  status_changed: RefreshCw,
  resolved: CheckCircle2,
  template_reply: FileText,
};

export default function SystemTicketDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const baseTicket = MOCK_TICKETS.find((t) => t.id === id);

  const [status, setStatus] = useState<TicketMock["status"]>(baseTicket?.status ?? "new");
  const [comment, setComment] = useState("");
  const [extraEvents, setExtraEvents] = useState<TicketTimelineEventMock[]>([]);

  const timeline = useMemo(() => {
    const base = MOCK_TICKET_TIMELINE.filter((e) => e.ticketId === id);
    return [...base, ...extraEvents].sort((a, b) => a.at.localeCompare(b.at));
  }, [id, extraEvents]);

  if (!baseTicket) {
    return (
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Назад
        </Button>
        <Card><CardContent className="p-8 text-center text-muted-foreground">Тікет {id} не знайдено.</CardContent></Card>
      </div>
    );
  }

  const pushEvent = (kind: TicketTimelineEventMock["kind"], text: string, actor = "Support Admin (Ви)") => {
    setExtraEvents((arr) => [
      ...arr,
      { id: `local-${Date.now()}`, ticketId: id, at: new Date().toISOString(), actor, kind, text },
    ]);
  };

  const handleAssignMe = () => {
    pushEvent("assigned", "Призначено собі.");
    toast({ title: "Тікет призначено вам (демо)" });
  };

  const handleStatusChange = (next: TicketMock["status"]) => {
    setStatus(next);
    pushEvent(next === "resolved" ? "resolved" : "status_changed", `Статус → ${STATUS_LABEL[next]}.`);
    toast({ title: `Статус оновлено: ${STATUS_LABEL[next]} (демо)` });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    pushEvent("note", comment.trim());
    setComment("");
    toast({ title: "Коментар додано (демо)" });
  };

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/system/incidents/tickets")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> До списку тікетів
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-muted-foreground">{baseTicket.id} · {baseTicket.cabinet}</div>
          <h1 className="text-2xl md:text-3xl font-semibold mt-1">{baseTicket.subject}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusChip level={STATUS_LEVEL[status]}>{STATUS_LABEL[status]}</StatusChip>
            <StatusChip level={PRIORITY_LEVEL[baseTicket.priority]}>Пріоритет: {baseTicket.priority}</StatusChip>
            <StatusChip level="info">Канал: {baseTicket.channel}</StatusChip>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> SLA {baseTicket.sla}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAssignMe}>
            <UserPlus className="h-4 w-4 mr-1" /> Призначити собі
          </Button>
          <Select value={status} onValueChange={(v) => handleStatusChange(v as TicketMock["status"])}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Новий</SelectItem>
              <SelectItem value="in_progress">В роботі</SelectItem>
              <SelectItem value="resolved">Закрито</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Хронологія</TabsTrigger>
          <TabsTrigger value="audit">Аудит</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Хронологія</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/60">
                  {timeline.map((e) => {
                    const Icon = KIND_ICON[e.kind];
                    return (
                      <div key={e.id} className="p-4 flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{e.actor}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(e.at).toLocaleString("uk-UA")}
                            </span>
                          </div>
                          <div className="text-sm text-foreground/90 mt-1">{e.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-border space-y-2">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Додати внутрішній коментар…"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>
                      <MessageSquarePlus className="h-4 w-4 mr-1" /> Додати коментар
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Деталі</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  <Row k="Кабінет" v={baseTicket.cabinet} />
                  <Row k="Канал" v={baseTicket.channel} />
                  <Row k="Пріоритет" v={baseTicket.priority} />
                  <Row k="SLA" v={baseTicket.sla} />
                  <Row k="ID" v={baseTicket.id} mono />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Звʼязані</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1.5">
                  <Link to="/admin/system/incidents" className="block text-primary hover:underline">
                    Інциденти платформи →
                  </Link>
                  <Link to="/admin/system/cabinets" className="block text-primary hover:underline">
                    Картка кабінета →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <EntityAuditTab entityId={id} emptyText="Поки що немає записів в аудиті для цього тікета (демо)." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{v}</span>
    </div>
  );
}
