/**
 * Phase 5 — Consumer Inbox: /me/inbox
 *
 * Кабінет фізособи "Мої покупки/записи". Демо-режим без auth:
 * телефон береться з ?phone= query param (зазвичай переданий з banner-CTA
 * після створення кабінету). Реальна версія — фільтр за auth.uid().
 *
 * 3 таби: Майбутні / Історія / Чеки.
 */

import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Receipt, ArrowLeft, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useConsumerInbox, type ConsumerInboxItem } from "@/lib/consumerInbox/store";
import { isTaxSeason } from "@/lib/clientRegistrationPitch/taxSeason";

export default function ConsumerInboxPage() {
  const [params] = useSearchParams();
  const phone = params.get("phone") ?? "";
  const isOnboarded = params.get("new") === "1";
  const items = useConsumerInbox(phone);

  const upcoming = useMemo(() => items.filter((i) => i.isUpcoming), [items]);
  const history = useMemo(() => items.filter((i) => !i.isUpcoming && !i.isCanceled), [items]);
  const receipts = useMemo(() => items.filter((i) => !i.isCanceled), [items]);
  const [tab, setTab] = useState<string>(upcoming.length > 0 ? "upcoming" : "receipts");

  if (!phone) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold">Мої покупки</h1>
          <p className="text-muted-foreground text-sm">
            Демо-режим: додайте у посилання <code>?phone=380XXXXXXXXX</code>, щоб побачити
            ваші записи з усіх ФОПів на Fintodo.
          </p>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> На головну
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 md:py-10">
      <div className="max-w-2xl mx-auto space-y-4">
        <header className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Мій кабінет</p>
          <h1 className="text-2xl font-semibold">Мої покупки й записи</h1>
          <p className="text-sm text-muted-foreground">
            Усі ваші записи від ФОПів-учасників Fintodo в одному місці.
          </p>
        </header>

        {isOnboarded && items.length > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <Sparkles className="w-3.5 h-3.5" /> Вітаємо у Fintodo!
            </div>
            <h2 className="font-semibold">Ось чому ви тут — ось ваші {items.length} {plural(items.length)}</h2>
            <p className="text-sm text-muted-foreground">
              Тут зберігаються всі ваші чеки й записи. Жоден ФОП не бачить чеки іншого ФОПа —
              ці дані під вашим контролем.
            </p>
            {isTaxSeason() && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/tax-refund-pitch?phone=${encodeURIComponent(phone)}`}>
                  Як отримати ПДФО-знижку →
                </Link>
              </Button>
            )}
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="upcoming">Майбутні ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="history">Історія ({history.length})</TabsTrigger>
            <TabsTrigger value="receipts">Чеки ({receipts.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-2 mt-3">
            {upcoming.length === 0 ? (
              <EmptyState text="Жодних запланованих записів." />
            ) : (
              upcoming.map((i) => <InboxItemCard key={i.booking.id} item={i} />)
            )}
          </TabsContent>
          <TabsContent value="history" className="space-y-2 mt-3">
            {history.length === 0 ? (
              <EmptyState text="Поки що тут порожньо." />
            ) : (
              history.map((i) => <InboxItemCard key={i.booking.id} item={i} />)
            )}
          </TabsContent>
          <TabsContent value="receipts" className="space-y-2 mt-3">
            {receipts.length === 0 ? (
              <EmptyState text="Чеків ще немає." />
            ) : (
              receipts.map((i) => <InboxItemCard key={i.booking.id} item={i} showReceipt />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function plural(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "запис";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "записи";
  return "записів";
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function InboxItemCard({ item, showReceipt }: { item: ConsumerInboxItem; showReceipt?: boolean }) {
  const { booking, brandName, serviceNames, masterName } = item;
  return (
    <div className="rounded-lg border bg-card p-3 md:p-4 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="w-3.5 h-3.5" />
          {brandName}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {booking.date} · {booking.startTime}
        </span>
      </div>
      <div className="text-sm font-medium">{serviceNames}</div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {masterName ? `Майстер: ${masterName}` : "—"} · {booking.durationMin} хв
        </span>
        <span className="font-semibold text-foreground tabular-nums">
          {booking.totalPrice} ₴
        </span>
      </div>
      {showReceipt && (
        <div className="pt-1.5">
          <Button asChild size="sm" variant="outline">
            <Link to={`/receipt/${booking.cancelToken}`} target="_blank" rel="noreferrer">
              <Receipt className="w-3.5 h-3.5 mr-1.5" />
              Відкрити квитанцію
            </Link>
          </Button>
        </div>
      )}
      {!showReceipt && item.isUpcoming && (
        <div className="pt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5" />
          Нагадаємо за 24 год до візиту
        </div>
      )}
    </div>
  );
}
