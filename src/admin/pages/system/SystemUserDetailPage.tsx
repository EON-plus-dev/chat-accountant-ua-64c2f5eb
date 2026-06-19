import { useParams, useNavigate } from "react-router-dom";
import { SystemPageShell } from "./SystemPageShell";
import { MOCK_USERS, MOCK_CABINETS } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ArrowLeft, ShieldAlert } from "lucide-react";
import { NavLink } from "@/components/NavLink";

export default function SystemUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = MOCK_USERS.find((u) => u.id === userId);
  const cabinets = MOCK_CABINETS.filter((c) => c.ownerUserId === userId);

  if (!user) {
    return (
      <SystemPageShell title="Користувача не знайдено">
        <Button variant="outline" onClick={() => navigate("/admin/system/users")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> До списку
        </Button>
      </SystemPageShell>
    );
  }

  return (
    <SystemPageShell
      title={user.name}
      description={user.email}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/system/users")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> До списку
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Статус</div>
          <div className="text-base font-semibold capitalize mt-1">{user.status}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Тариф</div>
          <div className="text-base font-semibold capitalize mt-1">{user.plan}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Останній вхід</div>
          <div className="text-base font-semibold mt-1">{new Date(user.lastLoginAt).toLocaleString("uk-UA")}</div>
        </CardContent></Card>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="flex-1 text-sm">
            <div className="font-medium">Support View (демо)</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Відкрити кабінет користувача в режимі підтримки read-only без зміни даних.
            </div>
          </div>
          <Button size="sm" variant="outline">Відкрити як користувач</Button>
        </CardContent>
      </Card>

      <div>
        <div className="text-sm font-semibold mb-2">Кабінети користувача ({cabinets.length})</div>
        <Card><CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {cabinets.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">Немає кабінетів.</div>
            )}
            {cabinets.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 hover:bg-muted/40">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.code} · {c.integrationsCount} інтеграцій</div>
                </div>
                <Badge variant="outline" className="text-xs">{c.errorsCount} помилок</Badge>
                <NavLink to={`/admin/system/cabinets/${c.id}`} className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Паспорт
                </NavLink>
              </div>
            ))}
          </div>
        </CardContent></Card>
      </div>
    </SystemPageShell>
  );
}
