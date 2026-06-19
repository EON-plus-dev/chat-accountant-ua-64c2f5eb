import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPersonalOrders, type PersonalOrderStatus } from "@/personal/orders/personalOrdersMock";

const STATUS_LABEL: Record<PersonalOrderStatus, string> = {
  scheduled: "Заплановано",
  active: "В дорозі",
  completed: "Виконано",
  cancelled: "Скасовано",
};

const KIND_LABEL = {
  purchase: "Покупка",
  service: "Послуга",
  booking: "Бронювання",
} as const;

function fmt(n: number) {
  return new Intl.NumberFormat("uk-UA").format(n) + " ₴";
}

interface Props {
  cabinetId: string;
  filterKind?: "purchase" | "service" | "booking";
}

export function PersonalOrdersList({ cabinetId, filterKind }: Props) {
  const all = getPersonalOrders(cabinetId);
  const items = filterKind ? all.filter((o) => o.kind === filterKind) : all;
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Замовлень у цій категорії ще немає.</p>;
  }
  return (
    <div className="grid gap-2">
      {items.map((o) => (
        <Card key={o.id} className="p-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{o.title}</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {KIND_LABEL[o.kind]}
              </Badge>
              <Badge
                variant={o.status === "completed" ? "secondary" : o.status === "cancelled" ? "outline" : "default"}
                className="text-[10px] h-4 px-1.5"
              >
                {STATUS_LABEL[o.status]}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{o.vendor} · {o.date}</p>
          </div>
          <div className="text-sm font-semibold whitespace-nowrap">{o.amountUah > 0 ? fmt(o.amountUah) : "—"}</div>
        </Card>
      ))}
    </div>
  );
}
