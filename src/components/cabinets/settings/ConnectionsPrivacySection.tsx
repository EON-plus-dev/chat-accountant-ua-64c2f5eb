/**
 * ConnectionsPrivacySection — хаб «Підключення та приватність» (фізособа).
 * Заміна старого `network-partners` + governance над L3-підписками.
 *
 * Патерн: Apple Privacy Dashboard / Google Account → Data & privacy.
 * Розділення з Операції → Підписки: тут «manage» (scope, відписка, журнал, експорт),
 * там «use» (запис, замовлення, бонуси).
 */
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Link2, ShieldCheck, Eye, Database } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { ConnectionsSection } from "./ConnectionsSection";
import { PlacesSubscriptionsTab } from "./connections-privacy/PlacesSubscriptionsTab";
import { ConsentMarketingTab } from "./connections-privacy/ConsentMarketingTab";
import { AccessLogTab } from "./connections-privacy/AccessLogTab";
import { MyDataTab } from "./connections-privacy/MyDataTab";

interface Props {
  cabinet: Cabinet;
  /** Опційний deep-link від PlaceCard ⚙ → відкрити менеджмент конкретної підписки. */
  initialInnerTab?: string;
  initialSubscriptionId?: string | null;
}

const TABS = [
  { id: "places", label: "Заклади", icon: MapPin },
  { id: "banks", label: "Банки та сервіси", icon: Link2 },
  { id: "consent", label: "Згоди", icon: ShieldCheck },
  { id: "access-log", label: "Журнал доступу", icon: Eye },
  { id: "my-data", label: "Мої дані", icon: Database },
] as const;

export function ConnectionsPrivacySection({
  cabinet,
  initialInnerTab,
  initialSubscriptionId,
}: Props) {
  const [tab, setTab] = useState<string>(initialInnerTab ?? "places");

  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Підключення та приватність
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Єдине місце, де ви керуєте підписками на заклади, банками, дозволами та своїми даними.
          Швидкі дії з закладами — у розділі <strong className="text-foreground">Управління → Підписки</strong>.
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 flex-wrap">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger key={t.id} value={t.id} className="gap-1.5 h-8 text-xs">
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="places" className="mt-4">
          <PlacesSubscriptionsTab initialSubscriptionId={initialSubscriptionId} />
        </TabsContent>
        <TabsContent value="banks" className="mt-4">
          <ConnectionsSection cabinet={cabinet} />
        </TabsContent>
        <TabsContent value="consent" className="mt-4">
          <ConsentMarketingTab />
        </TabsContent>
        <TabsContent value="access-log" className="mt-4">
          <AccessLogTab />
        </TabsContent>
        <TabsContent value="my-data" className="mt-4">
          <MyDataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ConnectionsPrivacySection;
