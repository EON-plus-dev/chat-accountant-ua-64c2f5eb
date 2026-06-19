import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Shield, UserPlus, Search, Trash2, Crown, Eye, Edit3, Users } from "lucide-react";
import { toast } from "sonner";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "editor" | "viewer" | "partner_accountant";
  created_at: string;
  email?: string;
}

const ROLE_META: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  admin:  { label: "Адміністратор", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: Crown },
  editor: { label: "Редактор",     color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Edit3 },
  viewer: { label: "Переглядач",   color: "bg-muted text-muted-foreground", icon: Eye },
};

export default function AdminUsersPage() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor" | "viewer" | "partner_accountant">("viewer");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  async function loadRoles() {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Не вдалося завантажити ролі");
      setLoading(false);
      return;
    }

    setRoles(data || []);
    setLoading(false);
  }

  async function addRole() {
    if (!newEmail.trim()) {
      toast.error("Введіть email користувача");
      return;
    }

    setSaving(true);

    // Look up user by email via edge function
    const { data: fnData, error: fnError } = await supabase.functions.invoke("admin-lookup-user", {
      body: { email: newEmail.trim() },
    });

    if (fnError || !fnData?.user_id) {
      toast.error("Користувача з таким email не знайдено");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("user_roles").insert({
      user_id: fnData.user_id,
      role: newRole,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("Цей користувач вже має таку роль");
      } else {
        toast.error("Помилка додавання ролі");
      }
      setSaving(false);
      return;
    }

    toast.success(`Роль "${ROLE_META[newRole].label}" додано`);
    setDialogOpen(false);
    setNewEmail("");
    setNewRole("viewer");
    setSaving(false);
    loadRoles();
  }

  async function removeRole(id: string) {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) {
      toast.error("Не вдалося видалити роль");
      return;
    }
    toast.success("Роль видалено");
    setRoles((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = roles.filter((r) => {
    if (filterRole !== "all" && r.role !== filterRole) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.user_id.toLowerCase().includes(q) && !(r.email || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    total: roles.length,
    admin: roles.filter((r) => r.role === "admin").length,
    editor: roles.filter((r) => r.role === "editor").length,
    viewer: roles.filter((r) => r.role === "viewer").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управління доступом</h1>
          <p className="text-muted-foreground">Ролі та дозволи користувачів</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Додати роль
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.total}</p>
                <p className="text-xs text-muted-foreground">Всього ролей</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {(["admin", "editor", "viewer"] as const).map((role) => {
          const meta = ROLE_META[role];
          const Icon = meta.icon;
          return (
            <Card key={role}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{counts[role]}</p>
                    <p className="text-xs text-muted-foreground">{meta.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
            placeholder="Пошук за email або ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі ролі</SelectItem>
            <SelectItem value="admin">Адміністратор</SelectItem>
            <SelectItem value="editor">Редактор</SelectItem>
            <SelectItem value="viewer">Переглядач</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ролі користувачів ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Завантаження...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Немає записів</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Користувач</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Роль</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Додано</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const meta = ROLE_META[r.role];
                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-2">
                          <div>
                            <span className="text-sm">{r.email || "—"}</span>
                            <span className="block font-mono text-[10px] text-muted-foreground">{r.user_id.slice(0, 8)}…</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className={meta.color}>
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("uk-UA")}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeRole(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Додати роль користувачу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Email користувача</Label>
              <Input
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>Роль</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as typeof newRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Адміністратор</SelectItem>
                  <SelectItem value="editor">Редактор</SelectItem>
                  <SelectItem value="viewer">Переглядач</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={addRole} disabled={saving}>
              {saving ? "Додаю..." : "Додати"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
