import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Truck, CreditCard, MapPin, ArrowLeft, Apple } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartStore, selectCartTotal } from "@/personal/cart/cartStore";
import { useOrdersStore } from "@/personal/orders/personalOrdersStore";
import { fmtUah } from "@/components/cabinets/orders/_primitives";
import type { PersonalOrder } from "@/personal/orders/personalOrdersMock";

type Step = "delivery" | "payment" | "review" | "done";

const ADDRESSES = [
  { id: "home", label: "Київ, вул. Хрещатик 22, кв. 7" },
  { id: "work", label: "Київ, вул. Володимирська 60, оф. 314" },
];

const PAY_METHODS = [
  { id: "applepay", label: "Apple Pay", icon: Apple },
  { id: "card", label: "Картка ····4242", icon: CreditCard },
  { id: "cod", label: "При отриманні", icon: Truck },
] as const;

export function CheckoutSheet({ cabinetId }: { cabinetId: string }) {
  const { items, isCheckoutOpen, closeCheckout, clear } = useCartStore();
  const total = useCartStore(selectCartTotal);
  const addOrder = useOrdersStore((s) => s.addOrder);
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("delivery");
  const [address, setAddress] = useState("home");
  const [newAddr, setNewAddr] = useState("");
  const [pay, setPay] = useState<(typeof PAY_METHODS)[number]["id"]>("applepay");
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleClose = (v: boolean) => {
    if (!v) {
      closeCheckout();
      setTimeout(() => { setStep("delivery"); setOrderId(null); }, 300);
    }
  };

  const confirm = () => {
    const id = `ord-new-${Date.now().toString(36)}`;
    const order: PersonalOrder = {
      id,
      kind: "purchase",
      title: items.length === 1 ? items[0].title : `Замовлення на ${items.length} товарів`,
      vendor: items[0]?.vendor ?? "Магазин",
      date: new Date().toISOString().slice(0, 10),
      amountUah: total,
      status: "active",
      paymentMethod: pay === "applepay" ? "applepay" : pay === "cod" ? "cash" : "card",
      paymentLast4: pay === "card" ? "4242" : undefined,
      deliveryStatus: "preparing",
      trackingNo: `NP${1000000 + Math.floor(Math.random() * 9000000)}`,
      address: address === "new" ? newAddr : ADDRESSES.find((a) => a.id === address)?.label,
      items: items.map((i) => ({ title: i.title, qty: i.qty, priceUah: i.priceUah })),
    };
    addOrder(cabinetId, order);
    clear();
    setOrderId(id);
    setStep("done");
    toast({ title: "Замовлення оформлено", description: `№ ${id.slice(-6).toUpperCase()}` });
  };

  return (
    <Sheet open={isCheckoutOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            {step !== "delivery" && step !== "done" && (
              <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2"
                onClick={() => setStep(step === "review" ? "payment" : "delivery")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {step === "delivery" && "Доставка"}
            {step === "payment" && "Оплата"}
            {step === "review" && "Підтвердження"}
            {step === "done" && "Готово"}
          </SheetTitle>
          <SheetDescription>
            {step === "done" ? "Замовлення прийнято в обробку" : `Крок ${step === "delivery" ? 1 : step === "payment" ? 2 : 3} з 3`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === "delivery" && (
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Адреса</Label>
              <RadioGroup value={address} onValueChange={setAddress} className="space-y-2">
                {ADDRESSES.map((a) => (
                  <Card key={a.id} className="p-3 cursor-pointer" onClick={() => setAddress(a.id)}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={a.id} />
                      <div className="flex-1">
                        <div className="text-sm font-medium capitalize">{a.id === "home" ? "Дім" : "Офіс"}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{a.label}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Card className="p-3 cursor-pointer" onClick={() => setAddress("new")}>
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="new" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Інша адреса</div>
                      {address === "new" && (
                        <Input className="mt-2 h-8 text-xs" placeholder="Місто, вулиця, будинок..."
                          value={newAddr} onChange={(e) => setNewAddr(e.target.value)} />
                      )}
                    </div>
                  </div>
                </Card>
              </RadioGroup>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Метод оплати</Label>
              <RadioGroup value={pay} onValueChange={(v) => setPay(v as typeof pay)} className="space-y-2">
                {PAY_METHODS.map((m) => (
                  <Card key={m.id} className="p-3 cursor-pointer" onClick={() => setPay(m.id)}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={m.id} />
                      <m.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{m.label}</span>
                    </div>
                  </Card>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Перевірте</div>
              <Card className="p-3 space-y-2 text-sm">
                <Row label="Доставка" value={address === "new" ? newAddr : ADDRESSES.find((a) => a.id === address)?.label ?? ""} />
                <Row label="Оплата" value={PAY_METHODS.find((p) => p.id === pay)?.label ?? ""} />
                <Separator />
                {items.map((i) => (
                  <div key={i.productId} className="flex justify-between text-xs">
                    <span className="truncate">{i.title} × {i.qty}</span>
                    <span className="tabular-nums">{fmtUah(i.priceUah * i.qty)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Разом</span>
                  <span className="tabular-nums">{fmtUah(total)}</span>
                </div>
              </Card>
            </div>
          )}

          {step === "done" && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <div className="text-lg font-semibold">Дякуємо!</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Замовлення {orderId && `№ ${orderId.slice(-6).toUpperCase()}`} у «Мої замовлення»
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-5">
          {step === "delivery" && (
            <Button className="w-full" onClick={() => setStep("payment")}
              disabled={address === "new" && !newAddr.trim()}>Далі</Button>
          )}
          {step === "payment" && (
            <Button className="w-full" onClick={() => setStep("review")}>Далі</Button>
          )}
          {step === "review" && (
            <Button className="w-full" onClick={confirm}>Підтвердити та оплатити · {fmtUah(total)}</Button>
          )}
          {step === "done" && (
            <Button className="w-full" onClick={() => handleClose(false)}>Готово</Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-right truncate">{value}</span>
    </div>
  );
}
