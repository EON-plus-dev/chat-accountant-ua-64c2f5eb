/**
 * PlaceSearchInline — інлайн-пошук публічних L3-закладів прямо в
 * `MyPlacesPanel`. Жодних нових сторінок. Підписка — оптимістична
 * (runtime store + event).
 */
import { useMemo, useState } from "react";
import { Search, Plus, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MOCK_CATALOG_PUBLICATIONS } from "@/modules/network/data/mockNetworkData";
import { addRuntimeSub, isUserSubscribed } from "@/modules/network/data/subscriptionRuntime";
import { DEMO_INDIVIDUAL_USER_ID } from "@/modules/network";

interface Props {
  onClose: () => void;
}

export function PlaceSearchInline({ onClose }: Props) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_CATALOG_PUBLICATIONS.filter(
      (p) =>
        p.visibility === "public" &&
        p.kind === "c2b_place" &&
        (q === "" ||
          p.displayName.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.categoryKey.includes(q)),
    ).slice(0, 8);
  }, [query]);

  const subscribe = (pubId: string, name: string) => {
    if (isUserSubscribed(DEMO_INDIVIDUAL_USER_ID, pubId, [])) {
      toast({ title: "Вже у «Моїх місцях»" });
      return;
    }
    addRuntimeSub({
      id: `sub-rt-${Date.now()}`,
      publicationId: pubId,
      subscriberUserId: DEMO_INDIVIDUAL_USER_ID,
      status: "active",
      scope: { catalog: true, orders: true, bookings: true, pricesTier: "default" },
      acceptedTermsAt: new Date().toISOString(),
      clientCardId: `client-rt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      stats: { totalOrders: 0, totalSpentUah: 0 },
    });
    toast({ title: "Підписку оформлено", description: `«${name}» додано в «Підписки».` });
  };

  return (
    <div className="rounded-lg border bg-muted/20 p-3 space-y-2 mt-3">
      <div className="relative">
        <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Знайти заклад: салон, теніс, готель…"
          className="pl-8 h-9 text-sm"
        />
      </div>
      <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" /> Заклад отримає лише імʼя і телефон.
      </div>
      <div className="space-y-1.5">
        {results.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 text-center">Нічого не знайдено.</p>
        ) : (
          results.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-1.5">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.displayName}</div>
                <div className="text-[11px] text-muted-foreground truncate">{p.shortDescription}</div>
              </div>
              <Button size="sm" variant="outline" className="h-7 gap-1 shrink-0" onClick={() => subscribe(p.id, p.displayName)}>
                <Plus className="h-3 w-3" /> Підписатися
              </Button>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>Закрити</Button>
      </div>
    </div>
  );
}
