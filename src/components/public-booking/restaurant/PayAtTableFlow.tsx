/**
 * Pay-by-Table flow для публічного віджета ресторану.
 *
 * Сценарій: клієнт відсканував QR на столі / ввів номер столика →
 * бачить свій відкритий рахунок (його відкрив офіціант) →
 * додає сервіс/чайові, опціонально розділяє → оплачує онлайн →
 * йде, не очікуючи офіціанта та чек.
 *
 * Кроки: find → bill → pay → done.
 * Без бекенду: open-tab генерується детерміновано від tableId.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Receipt, CreditCard, Check, ChevronLeft, Sparkles,
  Loader2, AlertCircle, Users, Star, Search, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { NumericTablePad } from "./NumericTablePad";
import { TablePickerSheet } from "./TablePickerSheet";
import {
  getDemoOpenTab,
  getTableNumber,
  tableHasOpenTab,
  calcBill,
  formatOpenedAgo,
  ZONE_LABEL,
  type OpenTab,
} from "@/lib/publicBooking/payAtTableDemo";
import { restaurantTables } from "@/config/demoCabinets/restaurantData";

interface Props {
  accent: string;
  brandName: string;
  initialTableNumber?: number;
}

type Step = "find" | "bill" | "pay" | "done";
type SplitMode = "full" | "even" | "items";

const TIP_PRESETS = [0, 5, 10, 15] as const;
const EVEN_OPTIONS = [2, 3, 4] as const;

export function PayAtTableFlow({ accent, brandName, initialTableNumber }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(initialTableNumber ? "bill" : "find");
  const [pad, setPad] = useState<string>(initialTableNumber ? String(initialTableNumber) : "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tab, setTab] = useState<OpenTab | null>(
    initialTableNumber ? getDemoOpenTab(initialTableNumber) : null,
  );
  const [serviceOn, setServiceOn] = useState(true);
  const [tipPct, setTipPct] = useState<number>(10);
  const [customTip, setCustomTip] = useState<string>("");
  const [splitMode, setSplitMode] = useState<SplitMode>("full");
  const [splitInto, setSplitInto] = useState<number>(2);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [reviewStars, setReviewStars] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");

  // initial deep-link
  useEffect(() => {
    if (initialTableNumber && !tab) {
      const t = getDemoOpenTab(initialTableNumber);
      if (t) {
        setTab(t);
        setStep("bill");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────── helpers
  const tryFind = () => {
    const n = parseInt(pad, 10);
    if (!Number.isFinite(n) || n < 1 || n > restaurantTables.length) {
      toast({
        title: "Невірний номер",
        description: `Введіть число від 1 до ${restaurantTables.length}.`,
        variant: "destructive",
      });
      return;
    }
    if (!tableHasOpenTab(n)) {
      toast({
        title: `Столик №${n} не має відкритого рахунку`,
        description: "Зверніться до офіціанта або переконайтесь у номері.",
        variant: "destructive",
      });
      return;
    }
    const t = getDemoOpenTab(n);
    if (!t) return;
    setTab(t);
    setStep("bill");
  };

  const onPickFromSheet = (tableId: string) => {
    const n = getTableNumber(tableId);
    if (n == null) return;
    setPad(String(n));
    const t = getDemoOpenTab(n);
    if (t) {
      setTab(t);
      setStep("bill");
    }
  };

  // ───────── bill calc
  const selectedKeys = splitMode === "items" ? selectedItems : null;
  const baseBill = useMemo(
    () =>
      tab
        ? calcBill(
            tab.lines,
            selectedKeys,
            serviceOn ? 10 : 0,
            tipPct,
            customTip ? parseInt(customTip, 10) : undefined,
          )
        : null,
    [tab, selectedKeys, serviceOn, tipPct, customTip],
  );

  const payAmount = useMemo(() => {
    if (!baseBill) return 0;
    if (splitMode === "even") return Math.round(baseBill.total / splitInto);
    return baseBill.total;
  }, [baseBill, splitMode, splitInto]);

  // ───────── render
  if (step === "done") {
    return (
      <div className="p-6 md:p-8 text-center space-y-4">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <Check className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Оплачено · {payAmount.toLocaleString("uk-UA")} ₴</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Дякуємо! Чек надійшов на вашу пошту. Можете йти — офіціант отримав сповіщення.
          </p>
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-left text-sm max-w-sm mx-auto space-y-1.5">
          <Row label="Столик" value={`№${tab?.tableNumber} · ${tab ? ZONE_LABEL[tab.zone] : ""}`} />
          <Row label="Заклад" value={brandName} />
          <Row label="Сума" value={`${payAmount.toLocaleString("uk-UA")} ₴`} />
          {baseBill && baseBill.tip > 0 && (
            <Row label="з них чайові" value={`${baseBill.tip} ₴`} />
          )}
        </div>

        {/* Mini-review */}
        <div className="max-w-sm mx-auto rounded-lg border p-3 text-left">
          <div className="text-sm font-medium mb-2">Як вам сьогодні? (необовʼязково)</div>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setReviewStars(s)}
                aria-label={`${s} зірок`}
                className="p-0.5"
              >
                <Star
                  className={cn("w-7 h-7", s <= reviewStars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
                />
              </button>
            ))}
          </div>
          {reviewStars > 0 && (
            <>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Що сподобалось або що покращити?"
                rows={2}
                className="w-full text-sm rounded-md border bg-background p-2 resize-none"
              />
              <Button
                size="sm"
                className="w-full mt-2 text-white"
                style={{ background: accent }}
                onClick={() => {
                  toast({ title: "Дякуємо за відгук!" });
                  setReviewStars(0);
                  setReviewText("");
                }}
              >
                Надіслати відгук
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={() => {
            setStep("find");
            setTab(null);
            setPad("");
            setSelectedItems(new Set());
            setTipPct(10);
            setCustomTip("");
            setSplitMode("full");
          }}
        >
          Оплатити інший столик
        </Button>
      </div>
    );
  }

  if (step === "pay") {
    // mock processing
    setTimeout(() => setStep("done"), 1800);
    return (
      <div className="p-10 text-center space-y-4">
        <Loader2 className="w-10 h-10 mx-auto animate-spin" style={{ color: accent }} />
        <div className="font-medium">Обробляємо оплату…</div>
        <div className="text-xs text-muted-foreground">Apple Pay / Google Pay / картка</div>
        <Badge variant="outline" className="mx-auto">
          ДЕМО — реальне списання не відбувається
        </Badge>
      </div>
    );
  }

  if (step === "bill" && tab) {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="px-4 md:px-6 pt-4 pb-3 border-b">
          <button
            onClick={() => { setStep("find"); setTab(null); }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="w-3 h-3" /> Інший столик
          </button>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Рахунок столика</div>
              <h2 className="text-2xl font-bold leading-tight flex items-center gap-2">
                №{tab.tableNumber}
                <Badge variant="secondary" className="text-[10px]">
                  {ZONE_LABEL[tab.zone]}
                </Badge>
              </h2>
              <div className="text-[11px] text-muted-foreground mt-1 inline-flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-0.5">
                  <Users className="w-3 h-3" /> {tab.guests} гостей
                </span>
                <span>·</span>
                <span>Офіціант: {tab.waiterName}</span>
                <span>·</span>
                <span>Відкрито {formatOpenedAgo(tab.openedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="px-4 md:px-6 py-3 max-h-[40vh] overflow-y-auto divide-y">
          {tab.lines.map((l) => {
            const checked = selectedItems.has(l.key);
            const interactive = splitMode === "items";
            return (
              <label
                key={l.key}
                className={cn(
                  "flex items-center gap-3 py-2.5 first:pt-0",
                  interactive && "cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded",
                )}
              >
                {interactive && (
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedItems((s) => {
                        const next = new Set(s);
                        next.has(l.key) ? next.delete(l.key) : next.add(l.key);
                        return next;
                      })
                    }
                    className="w-4 h-4 accent-current"
                    style={{ accentColor: accent }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {l.qty}× {l.item.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {l.item.price} ₴/шт
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums shrink-0">
                  {(l.item.price * l.qty).toLocaleString("uk-UA")} ₴
                </div>
              </label>
            );
          })}
        </div>

        {/* Controls */}
        <div className="px-4 md:px-6 pb-3 pt-2 space-y-3 border-t bg-muted/20">
          {/* Service fee */}
          <label className="flex items-center justify-between text-sm cursor-pointer">
            <span>Сервісний збір 10%</span>
            <input
              type="checkbox"
              checked={serviceOn}
              onChange={(e) => setServiceOn(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: accent }}
            />
          </label>

          {/* Tips */}
          <div>
            <div className="text-sm mb-1.5">Чайові</div>
            <div className="flex flex-wrap gap-1.5">
              {TIP_PRESETS.map((p) => {
                const active = !customTip && tipPct === p;
                return (
                  <button
                    key={p}
                    onClick={() => { setTipPct(p); setCustomTip(""); }}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                      active ? "text-white" : "hover:bg-muted bg-card",
                    )}
                    style={active ? { background: accent, borderColor: accent } : undefined}
                  >
                    {p === 0 ? "Без" : `${p}%`}
                  </button>
                );
              })}
              <Input
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value.replace(/\D/g, ""))}
                placeholder="Своя ₴"
                className="h-8 w-24 text-sm"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Split */}
          <div>
            <div className="text-sm mb-1.5">Як платимо?</div>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { id: "full", label: "Усе" },
                { id: "even", label: "Порівну" },
                { id: "items", label: "Свої позиції" },
              ] as const).map((o) => {
                const active = splitMode === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSplitMode(o.id);
                      if (o.id !== "items") setSelectedItems(new Set());
                    }}
                    className={cn(
                      "rounded-lg border py-2 text-xs font-medium transition-all",
                      active ? "text-white" : "hover:bg-muted bg-card",
                    )}
                    style={active ? { background: accent, borderColor: accent } : undefined}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            {splitMode === "even" && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">На:</span>
                {EVEN_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setSplitInto(n)}
                    className={cn(
                      "w-9 h-9 rounded-lg border text-sm font-semibold",
                      splitInto === n ? "text-white" : "hover:bg-muted bg-card",
                    )}
                    style={splitInto === n ? { background: accent, borderColor: accent } : undefined}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
            {splitMode === "items" && selectedItems.size === 0 && (
              <div className="mt-2 text-[11px] text-amber-600 inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Позначте позиції, які оплачуєте.
              </div>
            )}
          </div>

          {/* Totals */}
          {baseBill && (
            <div className="rounded-lg border bg-card p-2.5 text-sm space-y-1">
              <Row label="Підсумок" value={`${baseBill.subtotal.toLocaleString("uk-UA")} ₴`} />
              {baseBill.serviceFee > 0 && <Row label="Сервіс 10%" value={`${baseBill.serviceFee} ₴`} />}
              {baseBill.tip > 0 && <Row label="Чайові" value={`${baseBill.tip} ₴`} />}
              {splitMode === "even" && (
                <Row label={`Ваша частка (1/${splitInto})`} value={`${payAmount.toLocaleString("uk-UA")} ₴`} />
              )}
              <div className="flex justify-between font-bold pt-1 border-t mt-1">
                <span>До оплати</span>
                <span className="tabular-nums">{payAmount.toLocaleString("uk-UA")} ₴</span>
              </div>
            </div>
          )}
        </div>

        {/* Pay CTA */}
        <div className="border-t bg-card p-3 md:p-4 sticky bottom-0">
          <Button
            className="w-full h-12 text-white text-base"
            style={{ background: accent }}
            disabled={payAmount <= 0 || (splitMode === "items" && selectedItems.size === 0)}
            onClick={() => setStep("pay")}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Оплатити {payAmount.toLocaleString("uk-UA")} ₴
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Apple Pay · Google Pay · картка. Безпечно через Fintodo.
          </p>
        </div>
      </div>
    );
  }

  // ───────── FIND
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="text-center space-y-1">
        <div
          className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <Receipt className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold">Оплатити рахунок столика</h2>
        <p className="text-xs text-muted-foreground">
          Введіть номер з таблички на столі або скануйте QR — і оплатіть онлайн без очікування офіціанта.
        </p>
      </div>

      {/* Big number display */}
      <div className="rounded-2xl border bg-card p-4 text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 inline-flex items-center gap-1">
          <Hash className="w-3 h-3" /> Номер столика
        </div>
        <div
          className={cn(
            "text-5xl md:text-6xl font-bold tabular-nums leading-none my-1",
            !pad && "text-muted-foreground/30",
          )}
          style={pad ? { color: accent } : undefined}
        >
          {pad || "—"}
        </div>
        <div className="text-[11px] text-muted-foreground">
          1–{restaurantTables.length}
        </div>
      </div>

      <NumericTablePad value={pad} onChange={setPad} maxDigits={2} accent={accent} />

      <Button
        className="w-full h-12 text-white text-base"
        style={{ background: accent }}
        disabled={!pad}
        onClick={tryFind}
      >
        <Search className="w-4 h-4 mr-2" /> Знайти мій рахунок
      </Button>

      <button
        onClick={() => setPickerOpen(true)}
        className="w-full text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
      >
        <Sparkles className="w-3 h-3" /> Показати схему залу
      </button>

      <TablePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={onPickFromSheet}
        accent={accent}
        mode="pay"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right tabular-nums">{value}</span>
    </div>
  );
}
