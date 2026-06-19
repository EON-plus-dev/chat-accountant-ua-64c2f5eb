import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, Eye } from "lucide-react";
import { useAccessLog, getAccessLogActionLabel, type AccessLogAction } from "@/modules/network/hooks/useAccessLog";
import { toast } from "sonner";

const ACTION_FILTERS: { value: AccessLogAction | "all"; label: string }[] = [
  { value: "all", label: "Усі дії" },
  { value: "view_phone", label: "Перегляд телефону" },
  { value: "view_history", label: "Перегляд історії" },
  { value: "view_upcoming", label: "Майбутні візити" },
  { value: "view_order", label: "Замовлення" },
  { value: "update_card", label: "Оновлення картки" },
];

export function AccessLogTab() {
  const entries = useAccessLog();
  const [providerId, setProviderId] = useState<string>("all");
  const [action, setAction] = useState<string>("all");

  const providers = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((e) => map.set(e.publicationId, e.providerName));
    return Array.from(map.entries());
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (providerId !== "all" && e.publicationId !== providerId) return false;
      if (action !== "all" && e.action !== action) return false;
      return true;
    });
  }, [entries, providerId, action]);

  const handleExport = () => {
    const header = "date,provider,action,reason\n";
    const rows = filtered.map(
      (e) => `${e.at},"${e.providerName}",${e.action},"${e.reason}"`,
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Експортовано CSV");
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Хто і коли звертався до ваших даних. Заклад бачить лише те, на що ви дали дозвіл —
        тут видно кожне звернення прозоро.
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={providerId} onValueChange={setProviderId}>
          <SelectTrigger className="h-9 flex-1"><SelectValue placeholder="Заклад" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Усі заклади</SelectItem>
            {providers.map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="h-9 flex-1"><SelectValue placeholder="Дія" /></SelectTrigger>
          <SelectContent>
            {ACTION_FILTERS.map((a) => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-9 gap-1" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" /> CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <Eye className="h-6 w-6 mx-auto mb-2 opacity-60" />
            Доступів за поточними фільтрами не знайдено.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="rounded-md border bg-card p-2.5 text-xs flex items-center gap-3"
            >
              <div className="tabular-nums shrink-0 text-muted-foreground w-24">
                {fmt(e.at)}
              </div>
              <div className="font-medium truncate w-40 shrink-0">{e.providerName}</div>
              <div className="text-muted-foreground flex-1 truncate">
                {getAccessLogActionLabel(e.action)}
              </div>
              <div className="text-[11px] text-muted-foreground shrink-0 hidden sm:block">
                ({e.reason})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch { return iso; }
}
