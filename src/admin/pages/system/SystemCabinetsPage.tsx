import { useState } from "react";
import { SystemPageShell } from "./SystemPageShell";
import { MOCK_CABINETS } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import { Search, CheckCircle2, AlertTriangle, XCircle, Eye } from "lucide-react";

const TYPE_LABEL = { fop: "ФОП", tov: "ТОВ", fop_group: "Група ФОП", individual: "Фізособа" } as const;
const STATUS = {
  ok: { label: "OK", icon: CheckCircle2, className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  warning: { label: "Warning", icon: AlertTriangle, className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  error: { label: "Error", icon: XCircle, className: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30" },
} as const;

export default function SystemCabinetsPage() {
  const [q, setQ] = useState("");
  const list = MOCK_CABINETS.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.code.includes(q));

  return (
    <SystemPageShell
      title="Кабінети клієнтів"
      description="Портфель усіх ФОП / ТОВ / Груп ФОП / Фізосіб: інтеграції, синхронізації, паспорт кабінету та support-режим."
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук за назвою або кодом…" className="pl-8 h-9" />
        </div>
        <Badge variant="outline" className="text-xs">{list.length} кабінетів (демо)</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {list.map((c) => {
              const s = STATUS[c.status];
              const SIcon = s.icon;
              return (
                <div key={c.id} className="flex items-center gap-3 p-3 hover:bg-muted/40">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {TYPE_LABEL[c.type]} · {c.code} · ост. синхр. {new Date(c.lastSyncAt).toLocaleString("uk-UA")}
                    </div>
                  </div>
                  <Badge className={`text-xs ${s.className}`}>
                    <SIcon className="h-3 w-3 mr-1" />
                    {s.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs hidden md:inline-flex">{c.integrationsCount} інт.</Badge>
                  <Badge variant="outline" className="text-xs hidden md:inline-flex">{c.errorsCount} помил.</Badge>
                  <NavLink
                    to={`/admin/system/cabinets/${c.id}`}
                    className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <Eye className="h-3 w-3" /> Паспорт
                  </NavLink>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
