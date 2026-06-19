/**
 * SubscribedClientsPanel — L3 «Клієнти-фізособи з мережі».
 *
 * Privacy-VIEW: лише імʼя, телефон, історія у цьому бізнесі. Жодних
 * інших підписок, фінансів чи декларацій клієнта.
 * Див. mem://architecture/cabinet-network-protocol-uk.
 */
import { useState } from "react";
import { Users, Phone, ShoppingBag, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCabinetSubscribers, type CabinetSubscriberVM } from "@/modules/network/hooks/useCabinetSubscribers";

interface Props {
  cabinetId: string;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "short" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function SubscribedClientsPanel({ cabinetId }: Props) {
  const subscribers = useCabinetSubscribers(cabinetId).filter((s) => s.client.isIndividual);
  const [selected, setSelected] = useState<CabinetSubscriberVM | null>(null);

  if (subscribers.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Клієнти з мережі (L3)</h3>
          <Badge variant="secondary" className="text-[10px]">{subscribers.length}</Badge>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" /> Privacy-VIEW
        </span>
      </div>

      <div className="divide-y">
        {subscribers.map((vm) => (
          <button
            key={vm.subscription.id}
            type="button"
            onClick={() => setSelected(vm)}
            className="w-full text-left p-3 hover:bg-muted/40 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{vm.client.displayName}</div>
              <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {vm.client.phone}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-muted-foreground">Замовлень</div>
              <div className="text-sm font-medium">{vm.subscription.stats?.totalOrders ?? 0}</div>
            </div>
          </button>
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="space-y-1">
                <SheetTitle>{selected.client.displayName}</SheetTitle>
                <SheetDescription className="inline-flex items-center gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" />
                  Ви бачите лише імʼя, телефон та історію цього клієнта у вашому закладі.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Останнє замовлення</div>
                  <div className="text-sm font-medium mt-1">
                    {formatDate(selected.subscription.stats?.lastOrderAt ?? selected.subscription.stats?.lastVisitAt)}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Витрачено у вас</div>
                  <div className="text-sm font-medium mt-1">
                    {(selected.subscription.stats?.totalSpentUah ?? 0).toLocaleString("uk-UA")} ₴
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Усього замовлень</div>
                  <div className="text-sm font-medium mt-1">{selected.subscription.stats?.totalOrders ?? 0}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Підписався</div>
                  <div className="text-sm font-medium mt-1">{formatDate(selected.subscription.acceptedTermsAt)}</div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
                <div className="font-medium text-foreground mb-1 inline-flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" /> Що ви НЕ бачите
                </div>
                Інших підписок цього клієнта, його доходів, декларацій, балансу гаманця,
                підписок в інших ваших конкурентів — за дизайном Cabinet Network Protocol.
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
