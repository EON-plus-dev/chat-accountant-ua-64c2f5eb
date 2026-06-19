import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Handshake, CheckCircle2, XCircle, Clock, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

interface EngagementRequest {
  id: string;
  accountant_slug: string;
  client_user_id: string;
  client_email: string | null;
  client_name: string | null;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
  responded_at: string | null;
  cabinet_id: string | null;
}

interface Props {
  cabinetId: string;
  highlightRequestId?: string | null;
}

export function PartnerEngagementRequestsCard({ cabinetId, highlightRequestId }: Props) {
  const [requests, setRequests] = useState<EngagementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<EngagementRequest | null>(null);
  const [action, setAction] = useState<"accepted" | "declined">("accepted");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("partner_engagement_requests")
      .select("*")
      .eq("cabinet_id", cabinetId)
      .order("created_at", { ascending: false })
      .limit(20);
    setRequests((data as EngagementRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`partner-requests-${cabinetId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partner_engagement_requests", filter: `cabinet_id=eq.${cabinetId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabinetId]);

  // Auto-open from URL ?request=<id>
  useEffect(() => {
    if (!highlightRequestId || requests.length === 0) return;
    const r = requests.find((x) => x.id === highlightRequestId);
    if (r && r.status === "pending") {
      setResponding(r);
      setAction("accepted");
    }
  }, [highlightRequestId, requests]);

  const pending = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
  const recent = useMemo(() => requests.filter((r) => r.status !== "pending").slice(0, 5), [requests]);

  const respond = async () => {
    if (!responding) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("partner_engagement_requests")
        .update({ status: action, responded_at: new Date().toISOString() })
        .eq("id", responding.id);
      if (error) throw error;
      toast.success(action === "accepted" ? "Запит прийнято" : "Запит відхилено");
      setResponding(null);
      setReply("");
    } catch {
      toast.error("Не вдалося оновити запит");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;
  if (pending.length === 0 && recent.length === 0) return null;

  const initials = (s: string) =>
    s
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Handshake className="w-4 h-4 text-primary" />
              Запити партнерів
            </CardTitle>
            {pending.length > 0 && (
              <Badge className="bg-primary/15 text-primary border-primary/30">
                {pending.length} {pending.length === 1 ? "новий" : "нових"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 && (
            <p className="text-xs text-muted-foreground">Активних запитів немає.</p>
          )}
          {pending.map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-3 bg-muted/20"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {initials(r.client_name || r.client_email || r.accountant_slug)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {r.client_name || r.accountant_slug}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: uk })}
                  {r.client_email && <span className="truncate">· {r.client_email}</span>}
                </p>
                {r.message && (
                  <p className="text-xs text-foreground/80 mt-1 line-clamp-2 flex gap-1">
                    <MessageSquare className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
                    {r.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResponding(r);
                    setAction("declined");
                  }}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Відхилити
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setResponding(r);
                    setAction("accepted");
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Відповісти
                </Button>
              </div>
            </div>
          ))}

          {recent.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Останні відповіді</p>
              <div className="space-y-1.5">
                {recent.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <span className="truncate text-foreground/80">
                      {r.client_name || r.accountant_slug}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "accepted"
                          ? "border-primary/40 text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      {r.status === "accepted" ? "Прийнято" : r.status === "declined" ? "Відхилено" : "Скасовано"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!responding} onOpenChange={(o) => !o && setResponding(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "accepted" ? "Прийняти запит партнера" : "Відхилити запит партнера"}
            </DialogTitle>
            <DialogDescription>
              {action === "accepted"
                ? "Партнер отримає read-only доступ до кабінету. Ви можете в будь-який момент відкликати його з розділу «Учасники»."
                : "Партнер отримає сповіщення про відмову. Ви зможете прийняти повторний запит у майбутньому."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Повідомлення (необов'язково)</label>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={
                action === "accepted"
                  ? "Вітаю! Радий співпраці…"
                  : "На жаль, наразі не можемо прийняти запит…"
              }
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponding(null)} disabled={busy}>
              Скасувати
            </Button>
            <Button
              onClick={respond}
              disabled={busy}
              variant={action === "declined" ? "destructive" : "default"}
            >
              {busy && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {action === "accepted" ? "Прийняти" : "Відхилити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
