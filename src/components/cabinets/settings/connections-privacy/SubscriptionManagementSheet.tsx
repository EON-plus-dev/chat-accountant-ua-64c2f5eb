import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Download, Pause, Play, Trash2, LogOut, AlertTriangle } from "lucide-react";
import { useMyPlace } from "@/modules/network";
import { useSubscriptionScope } from "@/modules/network/hooks/useSubscriptionScope";
import { toast } from "sonner";

interface Props {
  subscriptionId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionManagementSheet({ subscriptionId, onOpenChange }: Props) {
  const place = useMyPlace(subscriptionId);
  const { scope, update } = useSubscriptionScope(subscriptionId);
  const open = !!subscriptionId && !!place;

  if (!place || !scope) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg" />
      </Sheet>
    );
  }

  const pub = place.publication;

  const handleExport = () => {
    const data = JSON.stringify({ subscription: place.subscription, publication: pub, scope }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pub.slug}-my-data.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Дані експортовано (JSON)");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{pub.displayName}</SheetTitle>
          <SheetDescription>Керування підпискою, дозволами та даними у цьому закладі.</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          {/* Transparency */}
          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-foreground font-medium text-[13px]">
              <Shield className="h-3.5 w-3.5" /> Що бачить заклад
            </div>
            <p className="text-muted-foreground">
              Тільки: ваше імʼя, телефон, історію візитів і замовлень{" "}
              <strong className="text-foreground">у цьому закладі</strong>. Жодних даних з інших
              закладів, фінансів, декларацій або інших підписок.
            </p>
          </div>

          {/* Scope */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Дозволи</h3>
            <ScopeToggle
              label="Бачити каталог послуг"
              hint="Меню/прайс, без якого не можна замовляти"
              checked={scope.catalog}
              onChange={(v) => update({ catalog: v })}
            />
            <ScopeToggle
              label="Заклад бачить мої замовлення"
              hint="Інакше не зможете оформити замовлення"
              checked={scope.orders}
              onChange={(v) => update({ orders: v })}
            />
            <ScopeToggle
              label="Заклад бачить мої бронювання"
              hint="Інакше не зможете записатись на візит"
              checked={scope.bookings}
              onChange={(v) => update({ bookings: v })}
            />
            <Separator />
            <ScopeToggle
              label="Маркетинг-розсилка від закладу"
              hint="Акції, новинки, нагадування"
              checked={scope.marketing}
              onChange={(v) => update({ marketing: v })}
            />
            <ScopeToggle
              label="Персоналізовані пропозиції"
              hint="Пропозиції на основі історії візитів"
              checked={scope.personalization}
              onChange={(v) => update({ personalization: v })}
            />
          </section>

          {/* Dangerous actions */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Дії з підпискою</h3>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9"
              onClick={() => {
                update({ paused: !scope.paused });
                toast.success(scope.paused ? "Підписку відновлено" : "Підписку призупинено");
              }}
            >
              {scope.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {scope.paused ? "Відновити підписку" : "Призупинити підписку"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Завантажити мої дані з цього закладу
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9"
              onClick={() => toast.info("Демо: запит на відписку надіслано закладу.")}
            >
              <LogOut className="h-4 w-4" />
              Відписатися
              <Badge variant="secondary" className="ml-auto h-5 text-[10px]">soft</Badge>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-9 text-destructive hover:text-destructive"
              onClick={() => toast.info("Демо: запит на видалення профілю надіслано (GDPR Art. 17).")}
            >
              <Trash2 className="h-4 w-4" />
              Видалити мій профіль у закладі
              <Badge variant="outline" className="ml-auto h-5 text-[10px] border-destructive/30 text-destructive">
                GDPR
              </Badge>
            </Button>

            <div className="flex items-start gap-2 text-[11px] text-muted-foreground pt-1">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>
                «Відписатися» зберігає історію у вас і у закладі для звітності.
                «Видалити профіль» — заклад зобовʼязаний видалити свою картку про вас.
              </span>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ScopeToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 cursor-pointer">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
