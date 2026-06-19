import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  Store,
  MapPin,
  Megaphone,
  Link2,
  Shield,
  Plus,
  ExternalLink,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { formatCurrency } from "@/lib/formatters";
import {
  MOCK_CATALOG_PUBLICATIONS,
  MOCK_CATALOG_SUBSCRIPTIONS,
} from "@/modules/network/data/mockNetworkData";

interface Props {
  cabinet: Cabinet;
}

/**
 * NetworkPartnersSection — L3 (Cabinet Network Protocol).
 *
 * Окремо від «Команди / Делегування» (L4):
 * - L3 = підписка на каталог. Жодного доступу у чужий кабінет.
 *        Жодного КЕП. Оферта + згода.
 * - L4 = делегація з КЕП. Інша вкладка налаштувань.
 *
 * Тут показуємо ДВІ ролі цього кабінету у мережі:
 *   1) як ПРОВАЙДЕР — публікації власних каталогів і хто на них підписаний.
 *   2) як ПІДПИСНИК — на чиї каталоги підписаний цей кабінет.
 */
export function NetworkPartnersSection({ cabinet }: Props) {
  const ownPublications = useMemo(
    () => MOCK_CATALOG_PUBLICATIONS.filter((p) => p.providerCabinetId === cabinet.id),
    [cabinet.id],
  );

  const subscriptionsToMe = useMemo(
    () =>
      MOCK_CATALOG_SUBSCRIPTIONS.filter((s) =>
        ownPublications.some((p) => p.id === s.publicationId),
      ),
    [ownPublications],
  );

  const mySubscriptions = useMemo(
    () =>
      MOCK_CATALOG_SUBSCRIPTIONS.filter(
        (s) => s.subscriberCabinetId === cabinet.id,
      ).map((s) => ({
        sub: s,
        pub: MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === s.publicationId)!,
      })),
    [cabinet.id],
  );

  return (
    <div className="space-y-5">
      <Header />

      {/* Provider role */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              Мої публікації каталогів
            </span>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <Plus className="h-3 w-3" />
              Опублікувати
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ownPublications.length === 0 ? (
            <EmptyHint
              icon={Megaphone}
              text="Цей кабінет ще не публікує каталог для зовнішніх підписників. Опублікуйте каталог, щоб клієнти або партнери могли підписатись через QR-код чи посилання — без надання доступу у ваш кабінет."
            />
          ) : (
            ownPublications.map((pub) => {
              const subs = subscriptionsToMe.filter((s) => s.publicationId === pub.id);
              return (
                <PublicationCard key={pub.id} pub={pub} subscribersCount={subs.length} />
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Subscriber role */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Мої підписки
            </span>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <Plus className="h-3 w-3" />
              Підписатись
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mySubscriptions.length === 0 ? (
            <EmptyHint
              icon={Link2}
              text="Цей кабінет ще не підписаний на жоден каталог. Підпишіться на постачальника або заклад — і його каталог стане доступним у відповідному розділі."
            />
          ) : (
            mySubscriptions.map(({ sub, pub }) => (
              <SubscriptionRow key={sub.id} pub={pub} sub={sub} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Privacy contract */}
      <Card className="border-border/70 bg-muted/30">
        <CardContent className="pt-4 text-sm text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Shield className="h-4 w-4" /> Контракт приватності
          </div>
          <p>
            Підписка ≠ делегація. Провайдер каталогу <strong>не отримує доступу</strong> у
            ваш кабінет, не бачить вашу фінансову звітність, інші підписки та
            бухгалтерію.
          </p>
          <p>
            Якщо ви провайдер, ви бачите про клієнта-фізособу лише <em>імʼя, телефон</em>{" "}
            та <em>історію замовлень/візитів у вас</em>. Бізнес-підписника ви бачите за
            юридичним найменуванням і обігом у вас. Це гарантовано RLS на рівні бази.
          </p>
          <p>
            Делегації (з КЕП, з доступом у кабінет) керуються у вкладці{" "}
            <strong>«Команда / Делегування (L4)»</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <header>
      <div className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          Партнери в мережі
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
        Підписки на каталоги: ви публікуєте свій каталог для клієнтів/партнерів або
        підписуєтесь на чужий. Без КЕП, без доступу у чужий кабінет.
      </p>
    </header>
  );
}

function PublicationCard({
  pub,
  subscribersCount,
}: {
  pub: (typeof MOCK_CATALOG_PUBLICATIONS)[number];
  subscribersCount: number;
}) {
  const Icon = pub.kind === "b2b_supplier" ? Store : MapPin;
  return (
    <div className="rounded-lg border bg-card p-3 flex items-start gap-3">
      <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium truncate">{pub.displayName}</div>
          <Badge variant="outline" className="h-5 text-[10px]">
            {pub.kind === "b2b_supplier" ? "B2B" : "C2B"}
          </Badge>
          <Badge variant="secondary" className="h-5 text-[10px]">
            {pub.visibility === "public" ? "Публічно" : "За запрошенням"}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          {pub.shortDescription}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="tabular-nums">{subscribersCount} підписників</span>
          {pub.publicBookingUrl && (
            <a
              href={pub.publicBookingUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" /> {pub.slug}
            </a>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <Button size="sm" variant="ghost" className="h-7 text-xs">
          Налаштувати
        </Button>
      </div>
    </div>
  );
}

function SubscriptionRow({
  pub,
  sub,
}: {
  pub: (typeof MOCK_CATALOG_PUBLICATIONS)[number];
  sub: (typeof MOCK_CATALOG_SUBSCRIPTIONS)[number];
}) {
  const Icon = pub.kind === "b2b_supplier" ? Store : MapPin;
  return (
    <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
      <div className="rounded-md bg-primary/10 p-1.5 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{pub.displayName}</div>
        <div className="text-xs text-muted-foreground truncate">
          {pub.shortDescription}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs tabular-nums">
          {sub.stats?.totalOrders ?? 0} зам · {formatCurrency(sub.stats?.totalSpentUah ?? 0)}
        </div>
        <div className="text-[10px] text-muted-foreground">
          Тариф: {sub.scope.pricesTier === "wholesale" ? "Опт" : "Базовий"}
        </div>
      </div>
      <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0">
        Пауза
      </Button>
    </div>
  );
}

function EmptyHint({
  icon: Icon,
  text,
}: {
  icon: typeof Megaphone;
  text: string;
}) {
  return (
    <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
      <Icon className="h-5 w-5 mx-auto mb-2 opacity-60" />
      {text}
    </div>
  );
}

export default NetworkPartnersSection;
