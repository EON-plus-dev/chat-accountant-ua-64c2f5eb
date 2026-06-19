import { useParams, useNavigate } from "react-router-dom";
import { SystemPageShell } from "./SystemPageShell";
import { MOCK_CABINETS } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

const CHECKLIST = [
  { ok: true, label: "Реквізити заповнені" },
  { ok: true, label: "КЕП підключено" },
  { ok: false, label: "Банк-інтеграція ПриватБанк: токен прострочений" },
  { ok: true, label: "КВЕДи актуальні" },
  { ok: false, label: "Не всі контрагенти у довіднику" },
];

export default function SystemCabinetDetailPage() {
  const { cabinetId } = useParams<{ cabinetId: string }>();
  const navigate = useNavigate();
  const c = MOCK_CABINETS.find((x) => x.id === cabinetId);

  if (!c) {
    return (
      <SystemPageShell title="Кабінет не знайдено">
        <Button variant="outline" onClick={() => navigate("/admin/system/cabinets")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> До списку
        </Button>
      </SystemPageShell>
    );
  }

  return (
    <SystemPageShell
      title={c.name}
      description={`${c.code} · Тип: ${c.type.toUpperCase()}`}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/system/cabinets")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> До списку
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Інтеграцій</div>
          <div className="text-2xl font-semibold mt-1">{c.integrationsCount}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Помилок</div>
          <div className="text-2xl font-semibold mt-1">{c.errorsCount}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Статус</div>
          <Badge variant="outline" className="mt-1 capitalize">{c.status}</Badge>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Остання синхр.</div>
          <div className="text-sm font-medium mt-1">{new Date(c.lastSyncAt).toLocaleString("uk-UA")}</div>
        </CardContent></Card>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="flex-1 text-sm">
            <div className="font-medium">Support View (демо)</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Відкрити кабінет у read-only режимі для діагностики, без модифікації даних клієнта.
            </div>
          </div>
          <Button size="sm" variant="outline">Відкрити у режимі підтримки</Button>
        </CardContent>
      </Card>

      <div>
        <div className="text-sm font-semibold mb-2">Чеклист стану кабінету (демо)</div>
        <Card><CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {CHECKLIST.map((row, i) => (
              <div key={i} className="flex items-center gap-3 p-3 text-sm">
                {row.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                )}
                <span className="flex-1">{row.label}</span>
              </div>
            ))}
          </div>
        </CardContent></Card>
      </div>
    </SystemPageShell>
  );
}
