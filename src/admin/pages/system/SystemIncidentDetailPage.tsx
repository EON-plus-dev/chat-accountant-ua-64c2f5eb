import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BellRing, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { StatusChip, type StatusLevel } from "@/admin/components/system/StatusChip";
import { EntityAuditTab } from "@/admin/components/system/EntityAuditTab";
import { MOCK_INCIDENTS, MOCK_USER_BANNERS, type IncidentMock } from "@/admin/system/data/mocks";

const SEVERITY_LEVEL: Record<IncidentMock["severity"], StatusLevel> = {
  low: "info",
  medium: "warning",
  high: "warning",
  critical: "critical",
};
const STATUS_LEVEL: Record<IncidentMock["status"], StatusLevel> = {
  new: "info",
  in_progress: "warning",
  resolved: "ok",
};
const STATUS_LABEL: Record<IncidentMock["status"], string> = {
  new: "Новий",
  in_progress: "В роботі",
  resolved: "Закрито",
};

interface LocalEvent { id: string; at: string; actor: string; text: string; }

export default function SystemIncidentDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const baseIncident = MOCK_INCIDENTS.find((i) => i.id === id);

  const [status, setStatus] = useState<IncidentMock["status"]>(baseIncident?.status ?? "new");
  const [notified, setNotified] = useState(false);
  const [events, setEvents] = useState<LocalEvent[]>([]);

  const initialEvents: LocalEvent[] = useMemo(() => baseIncident ? [
    { id: "e0", at: baseIncident.createdAt, actor: "Система", text: `Інцидент створено. ${baseIncident.description}` },
  ] : [], [baseIncident]);

  if (!baseIncident) {
    return (
      <div className="max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Назад
        </Button>
        <Card><CardContent className="p-8 text-center text-muted-foreground">Інцидент {id} не знайдено.</CardContent></Card>
      </div>
    );
  }

  const allEvents = [...initialEvents, ...events];

  const handleNotify = () => {
    setNotified(true);
    setEvents((arr) => [...arr, {
      id: `local-${Date.now()}`,
      at: new Date().toISOString(),
      actor: "Support Admin (Ви)",
      text: `Розіслано сповіщення ${baseIncident.affectedCabinets} ураженим кабінетам.`,
    }]);
    // demo: push user banner
    MOCK_USER_BANNERS.push({
      id: `ub-${Date.now()}`,
      integrationId: baseIncident.source === "integration" ? "privat24" : undefined,
      title: baseIncident.title,
      description: baseIncident.description,
      severity: baseIncident.severity === "critical" ? "error" : "warn",
      createdAt: new Date().toISOString(),
      active: true,
    });
    toast({ title: `Сповіщено ${baseIncident.affectedCabinets} кабінетів (демо)` });
  };

  const handleResolve = () => {
    setStatus("resolved");
    setEvents((arr) => [...arr, {
      id: `local-${Date.now()}`,
      at: new Date().toISOString(),
      actor: "Support Admin (Ви)",
      text: "Інцидент позначено як вирішений.",
    }]);
    toast({ title: "Інцидент закрито (демо)" });
  };

  return (
    <div className="max-w-6xl space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/system/incidents")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> До інцидентів
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-muted-foreground">{baseIncident.id} · джерело: {baseIncident.source}</div>
          <h1 className="text-2xl md:text-3xl font-semibold mt-1">{baseIncident.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusChip level={SEVERITY_LEVEL[baseIncident.severity]}>Severity: {baseIncident.severity}</StatusChip>
            <StatusChip level={STATUS_LEVEL[status]}>{STATUS_LABEL[status]}</StatusChip>
            <StatusChip level="info">Уражено: {baseIncident.affectedCabinets} кабінетів</StatusChip>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNotify} disabled={notified}>
            <BellRing className="h-4 w-4 mr-1" />
            {notified ? "Сповіщено" : "Notify affected"}
          </Button>
          <Button size="sm" onClick={handleResolve} disabled={status === "resolved"}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Хронологія</TabsTrigger>
          <TabsTrigger value="affected">Уражені</TabsTrigger>
          <TabsTrigger value="audit">Аудит</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Події інциденту</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {allEvents.map((e) => (
                  <div key={e.id} className="p-4 flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{e.actor}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(e.at).toLocaleString("uk-UA")}
                        </span>
                      </div>
                      <div className="text-sm text-foreground/90 mt-1">{e.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affected" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Уражені кабінети</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>За демо-даними інцидент торкнувся {baseIncident.affectedCabinets} кабінетів.</p>
              <p>Натисніть «Notify affected», щоб імітувати розсилання банера в UI користувачів. Активні банери видно на <Link to="/" className="text-primary hover:underline">головній</Link>.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <EntityAuditTab entityId={id} emptyText="Поки що немає записів в аудиті для цього інциденту (демо)." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
