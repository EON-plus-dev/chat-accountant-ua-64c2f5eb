import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Store, Plus, Package, ShoppingCart, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { useSubscribedSuppliers, type SubscribedPlaceVM } from "@/modules/network";

interface Props {
  cabinetId: string;
}

function formatDateShort(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

function SupplierCard({
  vm,
  onOpen,
}: {
  vm: SubscribedPlaceVM;
  onOpen: () => void;
}) {
  const pending = vm.subscription.stats?.pendingActionsCount ?? 0;
  const lastOrder = formatDateShort(vm.subscription.stats?.lastOrderAt);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group text-left rounded-lg border border-border/70 bg-card",
        "p-3 hover:bg-muted/50 hover:border-border transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="rounded-md bg-primary/10 p-1.5 text-primary">
          <Store className="h-4 w-4" />
        </div>
        {pending > 0 ? (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {pending} дія
          </Badge>
        ) : (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            Опт
          </Badge>
        )}
      </div>
      <div className="mt-2 text-sm font-medium leading-tight truncate">
        {vm.publication.displayName}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
        {vm.publication.shortDescription}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="tabular-nums">
          {vm.subscription.stats?.totalOrders ?? 0} зам.
        </span>
        {lastOrder ? (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lastOrder}
          </span>
        ) : (
          <span>—</span>
        )}
      </div>
    </button>
  );
}

function SupplierDetailSheet({
  place,
  open,
  onOpenChange,
}: {
  place: SubscribedPlaceVM | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!place) return null;
  const { publication, subscription } = place;
  const stats = subscription.stats ?? {};
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate">{publication.displayName}</SheetTitle>
              <SheetDescription className="truncate">
                {publication.shortDescription}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border bg-card p-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Замовлень
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {stats.totalOrders ?? 0}
            </div>
          </div>
          <div className="rounded-md border bg-card p-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Обіг
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {formatCurrency(stats.totalSpentUah ?? 0)}
            </div>
          </div>
          <div className="rounded-md border bg-card p-2">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Тариф
            </div>
            <div className="text-sm font-semibold">
              {subscription.scope.pricesTier === "wholesale" ? "Опт" : "Базовий"}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <section className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-primary" />
              Каталог постачальника
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Доступний для перегляду та замовлення. Позиції підтягуються з каталогу
              постачальника зі знижкою вашого тарифу.
            </p>
            <Button size="sm" variant="secondary" className="mt-2 gap-1">
              <ExternalLink className="h-3 w-3" /> Відкрити каталог
            </Button>
          </section>

          <section className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Швидке замовлення
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Створити замовлення цьому постачальнику. Поле «Постачальник» буде
              заповнене автоматично.
            </p>
            <Button size="sm" className="mt-2 gap-1">
              <Plus className="h-3 w-3" /> Нове замовлення
            </Button>
          </section>

          <section className="rounded-lg border bg-card p-3 text-xs text-muted-foreground space-y-1">
            <div className="text-foreground font-medium text-sm">Умови співпраці</div>
            <p>
              Підписка діє з{" "}
              {new Date(subscription.acceptedTermsAt ?? subscription.createdAt)
                .toLocaleDateString("uk-UA")}
              . Постачальник бачить ваше юридичне найменування, обіг та історію замовлень
              у себе. Доступу у ваш кабінет не має — це L3-підписка, а не делегація.
            </p>
            <p>
              Контакти постачальника: {publication.phone ?? "—"}
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SubscribedSuppliersPanel({ cabinetId }: Props) {
  const suppliers = useSubscribedSuppliers(cabinetId);
  const [openId, setOpenId] = useState<string | null>(null);
  const place = suppliers.find((s) => s.subscription.id === openId) ?? null;

  if (suppliers.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="w-5 h-5 text-primary shrink-0" />
              <span>Постачальники з каталогом</span>
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {suppliers.length} активних
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {suppliers.map((vm) => (
              <SupplierCard
                key={vm.subscription.id}
                vm={vm}
                onOpen={() => setOpenId(vm.subscription.id)}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Підписка ≠ делегація: постачальник не отримує доступу у ваш кабінет.
            </span>
            <Button variant="ghost" size="sm" className="h-7 gap-1">
              <Plus className="h-3 w-3" />
              Підписатись
            </Button>
          </div>
        </CardContent>
      </Card>

      <SupplierDetailSheet
        place={place}
        open={!!openId}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </>
  );
}
