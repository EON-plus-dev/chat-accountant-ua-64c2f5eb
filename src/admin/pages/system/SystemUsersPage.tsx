import { useState } from "react";
import { SystemPageShell } from "./SystemPageShell";
import { MOCK_USERS } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import { Search, Eye, UserCheck, UserX, Clock } from "lucide-react";

const STATUS_BADGE = {
  active: { label: "Активний", icon: UserCheck, className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  blocked: { label: "Заблокований", icon: UserX, className: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30" },
  pending_verification: { label: "Верифікація", icon: Clock, className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
} as const;

export default function SystemUsersPage() {
  const [q, setQ] = useState("");
  const list = MOCK_USERS.filter(
    (u) => !q || u.email.toLowerCase().includes(q.toLowerCase()) || u.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <SystemPageShell
      title="Користувачі"
      description="CRM-картки користувачів платформи: статуси, ролі, прив'язані кабінети, історія входів, Support View (демо)."
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук за email або імʼям…" className="pl-8 h-9" />
        </div>
        <Badge variant="outline" className="text-xs">{list.length} осіб (демо)</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {list.map((u) => {
              const sb = STATUS_BADGE[u.status];
              const SbIcon = sb.icon;
              return (
                <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-muted/40">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <Badge className={`text-xs ${sb.className}`}>
                    <SbIcon className="h-3 w-3 mr-1" />
                    {sb.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs hidden md:inline-flex">
                    {u.cabinetsCount} каб.
                  </Badge>
                  <Badge variant="outline" className="text-xs hidden md:inline-flex capitalize">
                    {u.plan}
                  </Badge>
                  <NavLink
                    to={`/admin/system/users/${u.id}`}
                    className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <Eye className="h-3 w-3" /> Відкрити
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
