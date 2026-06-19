import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, AlertOctagon, FileJson, FileText } from "lucide-react";
import { useMyPlaces } from "@/modules/network";
import { useConsents } from "@/modules/network/hooks/useConsentLog";
import { toast } from "sonner";

export function MyDataTab() {
  const places = useMyPlaces();
  const { consents, log } = useConsents();

  const exportAll = (format: "json" | "txt") => {
    const payload = {
      exportedAt: new Date().toISOString(),
      subscriptions: places.map((p) => ({
        place: p.publication.displayName,
        category: p.publication.categoryKey,
        since: p.subscription.createdAt,
        scope: p.subscription.scope,
        stats: p.subscription.stats,
      })),
      consents,
      consentLog: log.slice(0, 100),
    };
    const text = format === "json"
      ? JSON.stringify(payload, null, 2)
      : renderTxt(payload);
    const blob = new Blob([text], { type: format === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-data-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Експорт готовий");
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        GDPR Art. 15-17: ви маєте право отримати усі свої дані, видалити окремі категорії
        або повністю припинити відносини з платформою.
      </div>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Download className="h-4 w-4 text-primary" /> Експорт моїх даних
          </div>
          <p className="text-xs text-muted-foreground">
            Архів містить: список підписок, дозволи, статистику візитів,
            журнал згод і налаштування сповіщень.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => exportAll("json")}>
              <FileJson className="h-3.5 w-3.5" /> Завантажити JSON
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => exportAll("txt")}>
              <FileText className="h-3.5 w-3.5" /> Завантажити TXT
            </Button>
          </div>
          <div className="text-[11px] text-muted-foreground">
            У продакшені: посилання на повний архів (включно з даними від закладів) приходить на email за 24h.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Trash2 className="h-4 w-4 text-primary" /> Видалити окремі дані
          </div>
          <div className="space-y-1.5 text-sm">
            <ActionRow
              label="Видалити усі мої підписки одразу"
              hint="Локальна історія залишиться, заклади більше не бачитимуть ваші дані"
              onClick={() => toast.info("Демо: запит на масову відписку надіслано.")}
            />
            <ActionRow
              label="Видалити журнал згод"
              hint="Очищає аудит-trail змін toggle'ів"
              onClick={() => {
                try { localStorage.removeItem("network:consent-log:v1"); } catch { /* ignore */ }
                toast.success("Журнал згод очищено");
              }}
            />
            <ActionRow
              label="Очистити збережені налаштування дозволів"
              hint="Повертає scope до значень за замовчуванням закладу"
              onClick={() => {
                try { localStorage.removeItem("network:scope-overrides:v1"); } catch { /* ignore */ }
                try { window.dispatchEvent(new CustomEvent("network:scope-changed")); } catch { /* ignore */ }
                toast.success("Дозволи скинуто");
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertOctagon className="h-4 w-4" /> Видалити обліковий запис
          </div>
          <p className="text-xs text-muted-foreground">
            Повне припинення відносин з платформою згідно GDPR Art. 17. Після підтвердження
            email-кодом дані видаляються незворотно протягом 30 днів.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/40 hover:bg-destructive/5"
            onClick={() => toast.info("Демо: запит на видалення обліковки відкрито.")}
          >
            Розпочати видалення
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionRow({ label, hint, onClick }: { label: string; hint?: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-card p-2.5">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0" onClick={onClick}>
        Виконати
      </Button>
    </div>
  );
}

function renderTxt(payload: ReturnType<() => unknown>): string {
  return JSON.stringify(payload, null, 2);
}
