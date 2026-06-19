/**
 * Замовлення страв для ресторану «Смак».
 * Кроки: тип (dine_in/takeaway/delivery) → меню+корзина → контакти(+адреса) → confirm.
 *
 * Світовий рівень UX:
 *  - картки з фото / дієтичними бейджами / гостротою / ккал;
 *  - детальна шторка страви (модифікатори, нотатка, алергени, інгредієнти);
 *  - hero-карусель «Хіти шефа»;
 *  - фільтр-чіпи (веган / без глютену / гостре / швидко);
 *  - sticky категорійна навігація;
 *  - кошик з модифікаторами і per-line нотатками.
 */

import { useMemo, useState } from "react";
import {
  Search, ShoppingBag, Bike, Store, UtensilsCrossed, Check,
  MapPin, Phone, User as UserIcon, Trash2, ChevronRight, Clock,
  Hash, LayoutGrid, QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { restaurantMenu, restaurantTables, type MenuItem } from "@/config/demoCabinets/restaurantData";
import { enrichMenu, CATEGORY_VISUAL, type EnrichedMenuItem } from "./dishVisuals";
import { DishCard } from "./DishCard";
import { DishDetailSheet, type CartLine } from "./DishDetailSheet";
import { SignatureCarousel } from "./SignatureCarousel";
import { TablePickerSheet } from "./TablePickerSheet";
import { getTableByNumber, getTableNumber, ZONE_LABEL } from "@/lib/publicBooking/payAtTableDemo";

interface Props {
  cabinet: Cabinet;
  brandName: string;
  accent: string;
}

type OrderKind = "dine_in" | "takeaway" | "delivery";
type Step = "kind" | "menu" | "contact" | "done";
type FilterTag = "vegan" | "vegetarian" | "gluten_free" | "spicy" | "fast";

const FILTER_META: Record<FilterTag, { label: string; emoji: string }> = {
  vegan:        { label: "Веганське",   emoji: "🌱" },
  vegetarian:   { label: "Вегетаріанське", emoji: "🥬" },
  gluten_free:  { label: "Без глютену", emoji: "🌾" },
  spicy:        { label: "Гостре",      emoji: "🌶" },
  fast:         { label: "До 15 хв",    emoji: "⚡" },
};

const KIND_META: Record<OrderKind, { label: string; hint: string; icon: typeof UtensilsCrossed; eta: string }> = {
  dine_in:  { label: "У залі",     hint: "Замовлення до столу", icon: UtensilsCrossed, eta: "10–25 хв" },
  takeaway: { label: "Самовивіз",  hint: "Готово за 25–30 хв",  icon: Store,           eta: "25–30 хв" },
  delivery: { label: "Доставка",   hint: "До 60 хв у межах міста", icon: Bike,         eta: "45–60 хв" },
};

const ENRICHED_MENU: EnrichedMenuItem[] = enrichMenu(restaurantMenu);

function dishMatchesFilter(d: EnrichedMenuItem, tag: FilterTag): boolean {
  if (tag === "vegan") return d.dietary.includes("vegan");
  if (tag === "vegetarian") return d.dietary.includes("vegetarian") || d.dietary.includes("vegan");
  if (tag === "gluten_free") return d.dietary.includes("gluten_free") || !d.allergens.includes("глютен");
  if (tag === "spicy") return d.spicy > 0;
  if (tag === "fast") return d.prepTimeMin <= 15;
  return true;
}

export function MenuOrderFlow({ brandName, accent }: Props) {
  const [step, setStep] = useState<Step>("kind");
  const [kind, setKind] = useState<OrderKind>("delivery");
  const [tableNumberInput, setTableNumberInput] = useState<string>("");
  const [tableId, setTableId] = useState<string | undefined>();
  const [guestAtSomeoneElse, setGuestAtSomeoneElse] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCat, setActiveCat] = useState<MenuItem["category"] | "all">("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Set<FilterTag>>(new Set());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [detail, setDetail] = useState<EnrichedMenuItem | null>(null);

  const selectedTable = tableId ? restaurantTables.find((t) => t.id === tableId) : null;
  const selectedTableNumber = tableId ? getTableNumber(tableId) : null;
  const dineInValid = kind !== "dine_in" || (!!tableId && selectedTableNumber != null);

  const baseMenu = useMemo(
    () => (kind === "delivery" ? ENRICHED_MENU.filter((m) => m.availableDelivery) : ENRICHED_MENU),
    [kind],
  );

  const signatureItems = useMemo(
    () => baseMenu.filter((m) => m.chefPick && !m.stopList).slice(0, 8),
    [baseMenu],
  );

  const categoriesPresent = useMemo(() => {
    const set = new Set<MenuItem["category"]>();
    baseMenu.forEach((m) => set.add(m.category));
    return (Object.keys(CATEGORY_VISUAL) as MenuItem["category"][]).filter((c) => set.has(c));
  }, [baseMenu]);

  const filteredMenu = useMemo(() => {
    let list = baseMenu;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q),
      );
    } else if (activeCat !== "all") {
      list = list.filter((m) => m.category === activeCat);
    }
    if (filters.size > 0) {
      list = list.filter((m) => Array.from(filters).every((t) => dishMatchesFilter(m, t)));
    }
    return list;
  }, [baseMenu, search, activeCat, filters]);

  // Групування для табу «Все меню»
  const groupedMenu = useMemo(() => {
    if (search.trim() || activeCat !== "all") return null;
    const groups = new Map<MenuItem["category"], EnrichedMenuItem[]>();
    filteredMenu.forEach((m) => {
      const arr = groups.get(m.category) ?? [];
      arr.push(m);
      groups.set(m.category, arr);
    });
    return groups;
  }, [filteredMenu, search, activeCat]);

  const cartQty = (itemId: string) =>
    cart.filter((c) => c.itemId === itemId).reduce((s, l) => s + l.qty, 0);

  const subtotal = cart.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const deliveryFee = kind === "delivery" ? (subtotal >= 800 ? 0 : 80) : 0;
  const total = subtotal + deliveryFee;
  const totalQty = cart.reduce((s, l) => s + l.qty, 0);

  const quickInc = (m: EnrichedMenuItem) => {
    // Якщо є модифікатори — обов'язково через детальну шторку
    if (m.modifiers?.some((x) => x.required)) {
      setDetail(m);
      return;
    }
    setCart((c) => {
      const existing = c.find((x) => x.itemId === m.id && !x.note && x.modifierSummary.length === 0);
      if (existing) {
        return c.map((x) => (x === existing ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...c,
        {
          key: `${m.id}-quick`,
          itemId: m.id,
          name: m.name,
          qty: 1,
          unitPrice: m.price,
          basePrice: m.price,
          modifierSummary: [],
          imageUrl: m.imageUrl,
        },
      ];
    });
  };

  const quickDec = (m: EnrichedMenuItem) => {
    setCart((c) => {
      const existing = c.find((x) => x.itemId === m.id && !x.note && x.modifierSummary.length === 0);
      if (!existing) return c;
      if (existing.qty <= 1) return c.filter((x) => x !== existing);
      return c.map((x) => (x === existing ? { ...x, qty: x.qty - 1 } : x));
    });
  };

  const addFromSheet = (line: CartLine) => {
    setCart((c) => {
      const existing = c.find((x) => x.key === line.key);
      if (existing) {
        return c.map((x) => (x === existing ? { ...x, qty: x.qty + line.qty } : x));
      }
      return [...c, line];
    });
  };

  const removeLine = (key: string) => setCart((c) => c.filter((x) => x.key !== key));
  const setLineQty = (key: string, delta: number) =>
    setCart((c) =>
      c
        .map((x) => (x.key === key ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0),
    );

  const toggleFilter = (t: FilterTag) =>
    setFilters((s) => {
      const next = new Set(s);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  // ─────── DONE ───────
  if (step === "done") {
    const slugForPay = "restoran-smak";
    return (
      <div className="p-6 md:p-8 text-center space-y-4">
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <Check className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold">Замовлення прийнято</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {kind === "dine_in"
              ? `Передано на кухню. Очікуйте на столик №${selectedTableNumber} · ${selectedTable ? ZONE_LABEL[selectedTable.zone as keyof typeof ZONE_LABEL] : ""}.`
              : `${brandName} зателефонує на ${phone || "—"} для підтвердження.`}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-3 md:p-4 text-left text-sm space-y-1.5 max-w-sm mx-auto">
          <Row label="Тип" value={KIND_META[kind].label} />
          {kind === "dine_in" && selectedTableNumber != null && (
            <Row
              label="Столик"
              value={`№${selectedTableNumber}${selectedTable ? ` · ${ZONE_LABEL[selectedTable.zone as keyof typeof ZONE_LABEL]}` : ""}`}
            />
          )}
          <Row label="Позицій" value={`${cart.length} (${totalQty} шт)`} />
          {kind === "delivery" && address && <Row label="Адреса" value={address} />}
          <Row label="Орієнтовний час" value={KIND_META[kind].eta} />
          <Row label="Сума" value={`${total.toLocaleString("uk-UA")} ₴`} />
        </div>

        {kind === "dine_in" && selectedTableNumber != null && (
          <div
            className="rounded-xl border-2 border-dashed p-3 md:p-4 max-w-sm mx-auto"
            style={{ borderColor: `${accent}66`, background: `${accent}0a` }}
          >
            <div className="flex items-start gap-3 text-left">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${accent}1a`, color: accent }}
              >
                <QrCode className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Оплатіть і йдіть без офіціанта</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Коли закінчите — оплатіть онлайн за номером столика, чек прийде на email.
                </p>
                <a
                  href={`/book/${slugForPay}?pay=table-${selectedTableNumber}`}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold underline"
                  style={{ color: accent }}
                >
                  Оплатити столик №{selectedTableNumber} <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => {
            setCart([]);
            setStep("kind");
            setName("");
            setPhone("");
            setAddress("");
            setNote("");
            setTableId(undefined);
            setTableNumberInput("");
            setGuestAtSomeoneElse(false);
          }}
          className="w-full md:w-auto"
        >
          Зробити нове замовлення
        </Button>
      </div>
    );
  }


  return (
    <>
      <div className="flex flex-col">
        {/* ─────── KIND ─────── */}
        {step === "kind" && (
          <div className="p-4 md:p-6 space-y-3">
            <Label className="text-sm">Як ви хочете отримати замовлення?</Label>
            {(Object.keys(KIND_META) as OrderKind[]).map((k) => {
              const m = KIND_META[k];
              const Icon = m.icon;
              const active = kind === k;
              return (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={cn(
                    "w-full rounded-xl border p-3 md:p-4 text-left transition-all flex items-center gap-3",
                    active ? "border-foreground bg-muted" : "hover:bg-muted",
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${accent}1a`, color: accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.hint}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {m.eta}
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4 ml-2" style={{ color: accent }} />}
                </button>
              );
            })}

            {/* ─── Вибір столика для dine_in ─── */}
            {kind === "dine_in" && (
              <div
                className="rounded-xl border-2 p-3 md:p-4 space-y-3"
                style={{ borderColor: tableId ? accent : `${accent}33`, background: `${accent}06` }}
              >
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} />
                  <div className="flex-1">
                    <Label className="text-sm font-semibold">Номер вашого столика</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Знайдіть номер на табличці на столі або скануйте QR.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={restaurantTables.length}
                    value={tableNumberInput}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                      setTableNumberInput(v);
                      const n = parseInt(v, 10);
                      if (Number.isFinite(n) && n >= 1 && n <= restaurantTables.length) {
                        const t = getTableByNumber(n);
                        if (t) setTableId(t.id);
                      } else {
                        setTableId(undefined);
                      }
                    }}
                    placeholder={`1–${restaurantTables.length}`}
                    className="text-2xl font-bold h-14 text-center tabular-nums"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 px-3 shrink-0"
                    onClick={() => setPickerOpen(true)}
                  >
                    <LayoutGrid className="w-4 h-4 mr-1.5" />
                    Схема
                  </Button>
                </div>

                {selectedTable && selectedTableNumber != null && (
                  <div className="rounded-lg bg-card border px-3 py-2 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        Столик №{selectedTableNumber} · {ZONE_LABEL[selectedTable.zone as keyof typeof ZONE_LABEL]}
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        До {selectedTable.seats} місць
                      </div>
                    </div>
                    <Check className="w-4 h-4" style={{ color: accent }} />
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guestAtSomeoneElse}
                    onChange={(e) => setGuestAtSomeoneElse(e.target.checked)}
                    className="w-4 h-4"
                    style={{ accentColor: accent }}
                  />
                  <span>Я гість за чужим столиком (приєднався)</span>
                </label>
              </div>
            )}

            <Button
              className="w-full h-11 mt-2 text-white"
              onClick={() => setStep("menu")}
              disabled={!dineInValid}
              style={{ background: dineInValid ? accent : "hsl(var(--muted))" }}
            >
              {kind === "dine_in" && !tableId ? "Спочатку оберіть столик" : "До меню"}
            </Button>
          </div>
        )}


        {/* ─────── MENU ─────── */}
        {(step === "menu" || step === "contact") && (
          <>
            {/* Sticky header (search + filters + categories) */}
            <div className="border-b sticky top-0 bg-card z-10">
              <div className="p-3 md:p-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Пошук страви..."
                    className="pl-9 text-base h-10"
                  />
                </div>
                {/* Filters */}
                <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-hide snap-x -mx-1 px-1">
                  {(Object.keys(FILTER_META) as FilterTag[]).map((f) => {
                    const active = filters.has(f);
                    const meta = FILTER_META[f];
                    return (
                      <button
                        key={f}
                        onClick={() => toggleFilter(f)}
                        className={cn(
                          "snap-start shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all inline-flex items-center gap-1",
                          active ? "text-white" : "hover:bg-muted",
                        )}
                        style={active ? { background: accent, borderColor: accent } : undefined}
                      >
                        <span>{meta.emoji}</span>
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Categories */}
              {!search && (
                <div className="px-3 md:px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide snap-x">
                  <button
                    onClick={() => setActiveCat("all")}
                    className={cn(
                      "snap-start shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      activeCat === "all" ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
                    )}
                  >
                    Усе меню
                  </button>
                  {categoriesPresent.map((c) => {
                    const vis = CATEGORY_VISUAL[c];
                    const count = baseMenu.filter((m) => m.category === c).length;
                    const active = activeCat === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setActiveCat(c)}
                        className={cn(
                          "snap-start shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all inline-flex items-center gap-1.5",
                          active ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
                        )}
                      >
                        <span>{vis.emoji}</span>
                        <span>{vis.label}</span>
                        <span className={cn("text-[10px]", active ? "opacity-70" : "text-muted-foreground")}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Menu body */}
            <div className="max-h-[60vh] overflow-y-auto pb-2">
              {/* Hero carousel — лише на "Усе меню" без активного пошуку/фільтрів */}
              {activeCat === "all" && !search && filters.size === 0 && (
                <SignatureCarousel
                  items={signatureItems}
                  accent={accent}
                  onSelect={(m) => setDetail(m)}
                />
              )}

              {filteredMenu.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Нічого не знайдено. Спробуйте інший запит або зніміть фільтри.
                </div>
              )}

              {groupedMenu && filters.size === 0 ? (
                // Згруповане «Усе меню»
                <div className="divide-y">
                  {Array.from(groupedMenu.entries()).map(([cat, items]) => (
                    <section key={cat}>
                      <div
                        className="px-3 md:px-4 pt-3 pb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground sticky top-0 bg-card/95 backdrop-blur-sm"
                      >
                        {CATEGORY_VISUAL[cat].emoji} {CATEGORY_VISUAL[cat].label}
                      </div>
                      <div className="divide-y">
                        {items.map((m) => (
                          <DishCard
                            key={m.id}
                            item={m}
                            qty={cartQty(m.id)}
                            accent={accent}
                            onOpen={() => setDetail(m)}
                            onInc={() => quickInc(m)}
                            onDec={() => quickDec(m)}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMenu.map((m) => (
                    <DishCard
                      key={m.id}
                      item={m}
                      qty={cartQty(m.id)}
                      accent={accent}
                      onOpen={() => setDetail(m)}
                      onInc={() => quickInc(m)}
                      onDec={() => quickDec(m)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sticky cart bar */}
            <div className="border-t bg-card p-3 md:p-4 sticky bottom-0">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm">
                  <div className="font-medium">{cart.length} поз.</div>
                  <div className="text-xs text-muted-foreground">{totalQty} шт</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">{total.toLocaleString("uk-UA")} ₴</div>
                  {kind === "delivery" && (
                    <div className="text-[11px] text-muted-foreground">
                      {deliveryFee === 0 ? "Безкоштовна доставка" : `+${deliveryFee} ₴ доставка`}
                    </div>
                  )}
                </div>
                <Button
                  className="h-11 text-white"
                  disabled={cart.length === 0}
                  onClick={() => setStep("contact")}
                  style={{ background: cart.length === 0 ? "hsl(var(--muted))" : accent }}
                >
                  <ShoppingBag className="w-4 h-4 mr-1" /> Оформити
                  <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ─────── CONTACT (bottom-sheet on mobile, right panel on desktop) ─────── */}
        <Sheet
          open={step === "contact"}
          onOpenChange={(o) => {
            if (!o && step === "contact") setStep("menu");
          }}
        >
          <SheetContent
            side="responsive-right"
            className="p-0 flex flex-col gap-0"
          >
            <SheetHeader className="px-4 md:px-6 pt-4 pb-2 border-b text-left">
              <SheetTitle className="text-base md:text-lg">
                Оформлення замовлення
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {KIND_META[kind].label} · {cart.length} поз · {totalQty} шт
              </p>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3 space-y-3">
              {/* Table badge for dine_in */}
              {kind === "dine_in" && selectedTable && selectedTableNumber != null && (
                <div
                  className="rounded-xl border-2 p-3 flex items-center gap-3"
                  style={{ borderColor: accent, background: `${accent}0d` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 text-white"
                    style={{ background: accent }}
                  >
                    <span className="text-[9px] uppercase tracking-wider leading-none">столик</span>
                    <span className="text-xl font-bold leading-tight tabular-nums">№{selectedTableNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-sm">
                    <div className="font-semibold truncate">
                      {ZONE_LABEL[selectedTable.zone as keyof typeof ZONE_LABEL]}
                      {guestAtSomeoneElse && " · приєднання"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Замовлення піде на цей столик
                    </div>
                  </div>
                </div>
              )}

              {/* Cart summary з мініатюрами і модифікаторами */}
              <div className="rounded-lg border bg-muted/40 p-2.5 divide-y">
                {cart.map((line) => (
                  <div key={line.key} className="py-2 first:pt-0 last:pb-0 flex gap-2.5">
                    {line.imageUrl ? (
                      <img
                        src={line.imageUrl}
                        alt=""
                        loading="lazy"
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-md object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 text-sm">
                      <div className="font-medium truncate">
                        {line.qty}× {line.name}
                      </div>
                      {line.modifierSummary.length > 0 && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          {line.modifierSummary.map((m) => m.label).join(" · ")}
                        </div>
                      )}
                      {line.note && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 truncate">
                          ✎ {line.note}
                        </div>
                      )}
                      <div className="mt-1 inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setLineQty(line.key, -1)}
                          className="w-6 h-6 rounded-full border text-xs hover:bg-muted"
                        >−</button>
                        <span className="text-xs tabular-nums w-4 text-center">{line.qty}</span>
                        <button
                          onClick={() => setLineQty(line.key, +1)}
                          className="w-6 h-6 rounded-full border text-xs hover:bg-muted"
                        >+</button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold tabular-nums">
                        {(line.unitPrice * line.qty).toLocaleString("uk-UA")} ₴
                      </div>
                      <button
                        onClick={() => removeLine(line.key)}
                        className="text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> видалити
                      </button>
                    </div>
                  </div>
                ))}
                {kind === "delivery" && (
                  <div className="flex justify-between text-xs text-muted-foreground pt-1.5 mt-1.5">
                    <span>Доставка</span>
                    <span>{deliveryFee === 0 ? "Безкоштовно" : `${deliveryFee} ₴`}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1.5">
                  <span>Разом</span>
                  <span className="tabular-nums">{total.toLocaleString("uk-UA")} ₴</span>
                </div>
              </div>

              <div>
                <Label htmlFor="m-name" className="text-sm flex items-center gap-2 mb-1.5">
                  <UserIcon className="w-4 h-4" /> Імʼя {kind === "dine_in" && <span className="text-[10px] text-muted-foreground">(необовʼязково)</span>}
                </Label>
                <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Олена" className="text-base" />
              </div>
              <div>
                <Label htmlFor="m-phone" className="text-sm flex items-center gap-2 mb-1.5">
                  <Phone className="w-4 h-4" /> Телефон
                </Label>
                <Input id="m-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380 67 123 45 67" className="text-base" />
              </div>
              {kind === "delivery" && (
                <div>
                  <Label htmlFor="m-addr" className="text-sm flex items-center gap-2 mb-1.5">
                    <MapPin className="w-4 h-4" /> Адреса доставки
                  </Label>
                  <Input
                    id="m-addr"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="вул. Хрещатик, 22, кв. 14, домофон 14К"
                    className="text-base"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="m-note" className="text-sm mb-1.5 block">
                  Коментар до замовлення (необовʼязково)
                </Label>
                <Textarea
                  id="m-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    kind === "delivery"
                      ? "Не дзвоніть у домофон, є дитина"
                      : kind === "dine_in"
                        ? "Без цибулі / алергія на горіхи"
                        : "Без цибулі в усіх стравах"
                  }
                  rows={2}
                  className="text-base"
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center pt-1">
                Оплата на місці (готівка / картка). Онлайн-оплата зʼявиться скоро.
              </p>
            </div>

            {/* Sticky footer CTA */}
            <div
              className="border-t bg-card px-4 md:px-6 py-3"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              <div className="grid grid-cols-[auto_1fr] gap-2 items-stretch">
                <Button variant="outline" className="h-12" onClick={() => setStep("menu")}>
                  Назад
                </Button>
                <Button
                  className="h-12 text-white text-base font-semibold"
                  onClick={() => setStep("done")}
                  disabled={
                    phone.replace(/\D/g, "").length < 9 ||
                    (kind !== "dine_in" && !name.trim()) ||
                    (kind === "delivery" && address.trim().length < 5)
                  }
                  style={{ background: accent }}
                >
                  Підтвердити · {total.toLocaleString("uk-UA")} ₴
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

      </div>

      {/* Detail Sheet (один на весь flow) */}
      <DishDetailSheet
        item={detail}
        open={!!detail}
        accent={accent}
        onClose={() => setDetail(null)}
        onAdd={addFromSheet}
      />

      {/* Table picker (dine_in) */}
      <TablePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(id) => {
          setTableId(id);
          const n = getTableNumber(id);
          if (n != null) setTableNumberInput(String(n));
        }}
        selectedTableId={tableId}
        accent={accent}
        mode="order"
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
