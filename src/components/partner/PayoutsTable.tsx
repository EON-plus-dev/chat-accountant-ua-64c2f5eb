import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PartnerPayoutRow {
  id: string;
  period_from: string;
  period_to: string;
  amount_uah: number;
  status: "requested" | "approved" | "paid" | "rejected";
  method: string;
  recipient_name?: string | null;
  iban?: string | null;
  card_last4?: string | null;
  paid_at?: string | null;
  reference?: string | null;
  requested_at?: string | null;
  rejected_reason?: string | null;
}

interface Props {
  payouts: PartnerPayoutRow[];
}

const STATUS: Record<PartnerPayoutRow["status"], { label: string; className: string }> = {
  requested: { label: "Запит", className: "bg-warning/10 text-warning border-warning/30" },
  approved: { label: "Схвалено", className: "bg-primary/10 text-primary border-primary/30" },
  paid: { label: "Виплачено", className: "bg-primary/10 text-primary border-primary/30" },
  rejected: { label: "Відхилено", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

const fmtUah = (v: number) =>
  new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 2 }).format(v);

export function PayoutsTable({ payouts }: Props) {
  if (payouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Виплат поки що не було. Накопичіть мінімальну суму та запросіть першу виплату.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {payouts.map((p) => (
        <Card key={p.id}>
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">
                {p.period_from === p.period_to ? p.period_from : `${p.period_from} — ${p.period_to}`}
                <span className="ml-2 text-xs text-muted-foreground">
                  Запит: {new Date(p.requested_at).toLocaleDateString("uk-UA")}
                  {p.paid_at && ` · виплачено: ${new Date(p.paid_at).toLocaleDateString("uk-UA")}`}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {p.method === "iban" && p.iban
                  ? `IBAN ${p.iban.slice(0, 6)}…${p.iban.slice(-4)}`
                  : p.method === "card" && p.card_last4
                  ? `Картка •••• ${p.card_last4}`
                  : "Інший спосіб"}
                {p.reference && ` · реф. ${p.reference}`}
                {p.rejected_reason && ` · ${p.rejected_reason}`}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-semibold">{fmtUah(p.amount_uah)}</span>
              <Badge variant="outline" className={`${STATUS[p.status].className} border`}>
                {STATUS[p.status].label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
