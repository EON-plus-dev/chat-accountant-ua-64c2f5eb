import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KeyRound, Cpu, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OPERATION_CATALOG } from "@/config/operationCatalog";
import { SystemPageShell } from "./SystemPageShell";

interface CreditAgg { date: string; total: number; }

export default function SystemAiGatewayPage() {
  const [keyOk] = useState(true); // LOVABLE_API_KEY завжди є в проєкті з увімкненим Cloud
  const [spendTotal, setSpendTotal] = useState<number | null>(null);
  const [rotating, setRotating] = useState(false);

  const aiOps = useMemo(
    () => Object.values(OPERATION_CATALOG).filter((o) => o.kind === "ai"),
    []
  );
  const models = useMemo(() => {
    const s = new Set<string>();
    aiOps.forEach((o) => o.defaultModel && s.add(o.defaultModel));
    return Array.from(s).sort();
  }, [aiOps]);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from("ai_credit_transactions")
        .select("credits_spent")
        .gte("created_at", since)
        .limit(1000);
      const total = (data || []).reduce((s: number, r: any) => s + Number(r.credits_spent || 0), 0);
      setSpendTotal(total);
    })();
  }, []);

  const onRotate = () => {
    setRotating(true);
    toast.info("Ротація LOVABLE_API_KEY — операція адміна Lovable Cloud. Виконайте через Project Settings → Secrets.");
    setTimeout(() => setRotating(false), 800);
  };

  return (
    <SystemPageShell
      title="AI Gateway"
      description="Усі AI-виклики проходять через Lovable AI Gateway. Безкоштовно — лише операції типу manual/system; усе з kind: ai списує кредити."
      actions={
        <Button size="sm" variant="outline" onClick={onRotate} disabled={rotating}>
          {rotating ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5 mr-1.5" />}
          Ротувати ключ
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">LOVABLE_API_KEY</div>
          <div className="text-xl font-semibold mt-1 flex items-center gap-2">
            <Badge variant={keyOk ? "secondary" : "destructive"} className={keyOk ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : ""}>
              {keyOk ? "Активний" : "Відсутній"}
            </Badge>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">AI-операцій у каталозі</div>
          <div className="text-xl font-semibold mt-1">{aiOps.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Витрачено кредитів за 30 днів</div>
          <div className="text-xl font-semibold mt-1 tabular-nums">
            {spendTotal === null ? "—" : new Intl.NumberFormat("uk-UA").format(spendTotal)}
          </div>
        </CardContent></Card>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
          <Cpu className="h-4 w-4" /> Дозволені моделі
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {models.map((m) => (
            <Badge key={m} variant="outline" className="text-[11px] font-mono">{m}</Badge>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Операції з білінгом ({aiOps.length})
        </h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Назва</TableHead>
                  <TableHead>Група</TableHead>
                  <TableHead className="text-right">Кредити</TableHead>
                  <TableHead>Модель за замовч.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aiOps.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell>{o.label}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{o.group}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{o.estimatedCredits}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{o.defaultModel ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SystemPageShell>
  );
}
