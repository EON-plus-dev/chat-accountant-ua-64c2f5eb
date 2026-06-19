import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Sparkles } from "lucide-react";
import { useMyPlaces } from "@/modules/network";
import { MyPlaceDetailSheet } from "./MyPlaceDetailSheet";
import { PlaceSearchInline } from "./PlaceSearchInline";
import { PlaceCard } from "./PlaceCard";



export function MyPlacesPanel() {
  const places = useMyPlaces();
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <span>Підписки</span>
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {places.length} {places.length === 1 ? "заклад" : "закладів"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {places.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <Sparkles className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Підпишіться на заклад через QR-код, посилання або після першого замовлення —
                і він зʼявиться тут для швидкого доступу.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {places.map((vm) => (
                <PlaceCard
                  key={vm.subscription.id}
                  vm={vm}
                  onOpen={() => setOpenPlaceId(vm.subscription.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Підписки — лише ви бачите свою історію. Заклад бачить тільки візити у себе.</span>
            <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => setSearchOpen((v) => !v)}>
              <Plus className="h-3 w-3" />
              {searchOpen ? "Закрити" : "Знайти заклад"}
            </Button>
          </div>

          {searchOpen && <PlaceSearchInline onClose={() => setSearchOpen(false)} />}
        </CardContent>
      </Card>

      <MyPlaceDetailSheet
        placeId={openPlaceId}
        onOpenChange={(o) => !o && setOpenPlaceId(null)}
      />
    </>
  );
}
