/**
 * CREATE ORDER SHEET
 * 
 * 3-step order creation: Catalog → Cart → Confirmation
 */

import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  Calendar,
  CreditCard,
  Truck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNomenclaturePrice } from "@/config/nomenclatureConfig";
import {
  type ContractorProduct,
  type ContractorTerms,
  contractorStockStatusLabels,
  contractorStockStatusColors,
  contractorStockStatusIcons,
  paymentTermsLabels,
  deliveryTermsLabels,
} from "@/config/contractorInteractionConfig";
import { toast } from "sonner";

interface CartItem {
  product: ContractorProduct;
  quantity: number;
}

interface CreateOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ContractorProduct[];
  terms: ContractorTerms;
  contractorName: string;
  initialCartItems?: { productId: string; quantity: number }[];
}

const STEPS = ["Каталог", "Кошик", "Підтвердження"] as const;

export const CreateOrderSheet = ({
  open,
  onOpenChange,
  products,
  terms,
  contractorName,
  initialCartItems,
}: CreateOrderSheetProps) => {
  const [step, setStep] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [comment, setComment] = useState("");
  const [initialApplied, setInitialApplied] = useState(false);

  // Apply initial cart items when sheet opens
  if (open && !initialApplied && initialCartItems && initialCartItems.length > 0) {
    const initialCart: CartItem[] = initialCartItems
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return { product, quantity: item.quantity };
      })
      .filter(Boolean) as CartItem[];
    if (initialCart.length > 0) {
      setCart(initialCart);
      setStep(1);
    }
    setInitialApplied(true);
  }
  if (!open && initialApplied) {
    setInitialApplied(false);
  }

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.nomenclatureName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.contractorSku?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const discount = terms.discountPercent
      ? subtotal * (terms.discountPercent / 100)
      : 0;
    return { subtotal, discount, total: subtotal - discount, items: cart.length };
  }, [cart, terms.discountPercent]);

  const maxLeadTime = useMemo(
    () => Math.max(0, ...cart.map((i) => i.product.leadTimeDays)),
    [cart]
  );

  const expectedDelivery = useMemo(() => {
    if (maxLeadTime === 0) return null;
    const d = new Date();
    d.setDate(d.getDate() + maxLeadTime);
    return d.toLocaleDateString("uk-UA");
  }, [maxLeadTime]);

  const getCartQuantity = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.quantity ?? 0;

  const updateCart = (product: ContractorProduct, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (!existing) {
        if (delta <= 0) return prev;
        return [...prev, { product, quantity: Math.max(product.minOrderQuantity, delta) }];
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter((i) => i.product.id !== product.id);
      return prev.map((i) =>
        i.product.id === product.id ? { ...i, quantity: newQty } : i
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleSubmit = () => {
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 900) + 100
    )}`;
    toast.success(`Замовлення ${orderNumber} створено`, {
      description: `${cart.length} позицій на суму ${formatNomenclaturePrice(cartTotal.total, terms.currency)}`,
    });
    setStep(0);
    setCart([]);
    setComment("");
    setSearch("");
    onOpenChange(false);
  };

  const resetAndClose = (val: boolean) => {
    if (!val) {
      setStep(0);
      setCart([]);
      setComment("");
      setSearch("");
    }
    onOpenChange(val);
  };

  return (
    <Sheet open={open} onOpenChange={resetAndClose}>
      <SheetContent
        side="responsive-right"
        className="flex flex-col w-full sm:max-w-lg p-0"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 p-4 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            Нове замовлення — {contractorName}
          </SheetTitle>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs hidden sm:inline",
                    i === step ? "font-medium" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </SheetHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4">
            {step === 0 && (
              <StepCatalog
                products={filteredProducts}
                search={search}
                onSearchChange={setSearch}
                getCartQuantity={getCartQuantity}
                onUpdateCart={updateCart}
                currency={terms.currency}
              />
            )}
            {step === 1 && (
              <StepCart
                cart={cart}
                terms={terms}
                comment={comment}
                onCommentChange={setComment}
                onUpdateCart={updateCart}
                onRemove={removeFromCart}
                cartTotal={cartTotal}
                expectedDelivery={expectedDelivery}
              />
            )}
            {step === 2 && (
              <StepConfirmation
                cart={cart}
                terms={terms}
                contractorName={contractorName}
                comment={comment}
                cartTotal={cartTotal}
                expectedDelivery={expectedDelivery}
              />
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 border-t p-4 space-y-3">
          {step === 0 && cart.length > 0 && (
            <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-2">
              <span>
                <Badge variant="secondary">{cart.length}</Badge> позицій
              </span>
              <span className="font-mono font-medium">
                {formatNomenclaturePrice(cartTotal.subtotal, terms.currency)}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>
            )}
            <div className="flex-1" />
            {step < 2 && (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={cart.length === 0}
                className="gap-1"
              >
                Далі
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {step === 2 && (
              <Button onClick={handleSubmit} className="gap-1">
                <Check className="h-4 w-4" />
                Створити замовлення
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ========== STEP 1: Catalog ==========

const StepCatalog = ({
  products,
  search,
  onSearchChange,
  getCartQuantity,
  onUpdateCart,
  currency,
}: {
  products: ContractorProduct[];
  search: string;
  onSearchChange: (v: string) => void;
  getCartQuantity: (id: string) => number;
  onUpdateCart: (p: ContractorProduct, delta: number) => void;
  currency: string;
}) => (
  <div className="space-y-3">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Пошук товарів..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>
    {products.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Нічого не знайдено
      </div>
    ) : (
      products.map((p) => {
        const qty = getCartQuantity(p.id);
        const isOutOfStock = p.stockStatus === "out-of-stock";
        return (
          <div
            key={p.id}
            className={cn(
              "rounded-lg border p-3 space-y-2 transition-colors",
              qty > 0 && "border-primary/40 bg-primary/5"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {p.nomenclatureName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.sku}
                  {p.contractorSku && ` • ${p.contractorSku}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono font-medium text-sm">
                  {formatNomenclaturePrice(p.price, currency)}
                </p>
                <p className="text-xs text-muted-foreground">/{p.unit}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span>{contractorStockStatusIcons[p.stockStatus]}</span>
                <span className={contractorStockStatusColors[p.stockStatus]}>
                  {contractorStockStatusLabels[p.stockStatus]}
                </span>
                {p.stockQuantity != null && (
                  <span className="text-muted-foreground">
                    ({p.stockQuantity} {p.unit})
                  </span>
                )}
                <span className="text-muted-foreground">
                  • Мін. {p.minOrderQuantity}
                </span>
              </div>
              {isOutOfStock ? (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Немає
                </Badge>
              ) : qty === 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateCart(p, p.minOrderQuantity)}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Додати
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => onUpdateCart(p, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {qty}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => onUpdateCart(p, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })
    )}
  </div>
);

// ========== STEP 2: Cart ==========

const StepCart = ({
  cart,
  terms,
  comment,
  onCommentChange,
  onUpdateCart,
  onRemove,
  cartTotal,
  expectedDelivery,
}: {
  cart: CartItem[];
  terms: ContractorTerms;
  comment: string;
  onCommentChange: (v: string) => void;
  onUpdateCart: (p: ContractorProduct, delta: number) => void;
  onRemove: (id: string) => void;
  cartTotal: { subtotal: number; discount: number; total: number; items: number };
  expectedDelivery: string | null;
}) => (
  <div className="space-y-4">
    <h3 className="font-medium text-sm">Обрані позиції ({cart.length})</h3>
    {cart.map(({ product: p, quantity }) => (
      <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{p.nomenclatureName}</p>
          <p className="text-xs text-muted-foreground">{p.sku}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onUpdateCart(p, -1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onUpdateCart(p, 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <p className="font-mono text-sm w-24 text-right">
          {formatNomenclaturePrice(p.price * quantity, terms.currency)}
        </p>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-destructive"
          onClick={() => onRemove(p.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    ))}

    <Separator />

    {/* Terms summary */}
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Оплата:</span>
        <span>{paymentTermsLabels[terms.paymentTerms]}</span>
      </div>
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Доставка:</span>
        <span>{deliveryTermsLabels[terms.deliveryTerms]}</span>
      </div>
      {expectedDelivery && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Очікувана дата:</span>
          <span>{expectedDelivery}</span>
        </div>
      )}
    </div>

    <Separator />

    {/* Totals */}
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Підсумок</span>
        <span className="font-mono">
          {formatNomenclaturePrice(cartTotal.subtotal, terms.currency)}
        </span>
      </div>
      {cartTotal.discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Знижка {terms.discountPercent}%</span>
          <span className="font-mono">
            −{formatNomenclaturePrice(cartTotal.discount, terms.currency)}
          </span>
        </div>
      )}
      <div className="flex justify-between font-medium text-base pt-1 border-t">
        <span>Разом</span>
        <span className="font-mono">
          {formatNomenclaturePrice(cartTotal.total, terms.currency)}
        </span>
      </div>
    </div>

    <Separator />

    <div>
      <label className="text-sm text-muted-foreground mb-1 block">
        Коментар до замовлення
      </label>
      <Textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Додаткові побажання..."
        rows={2}
      />
    </div>
  </div>
);

// ========== STEP 3: Confirmation ==========

const StepConfirmation = ({
  cart,
  terms,
  contractorName,
  comment,
  cartTotal,
  expectedDelivery,
}: {
  cart: CartItem[];
  terms: ContractorTerms;
  contractorName: string;
  comment: string;
  cartTotal: { subtotal: number; discount: number; total: number; items: number };
  expectedDelivery: string | null;
}) => (
  <div className="space-y-4">
    <div className="rounded-lg bg-muted/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Підтвердження замовлення</h3>
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Контрагент</span>
          <span className="font-medium">{contractorName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Позицій</span>
          <span>{cart.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Оплата</span>
          <span>{paymentTermsLabels[terms.paymentTerms]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Доставка</span>
          <span>{deliveryTermsLabels[terms.deliveryTerms]}</span>
        </div>
        {expectedDelivery && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Очікувана дата</span>
            <span>{expectedDelivery}</span>
          </div>
        )}
      </div>
    </div>

    <Separator />

    <div className="space-y-2">
      <h4 className="text-sm font-medium">Позиції</h4>
      {cart.map(({ product: p, quantity }) => (
        <div
          key={p.id}
          className="flex items-center justify-between text-sm py-1"
        >
          <div className="flex-1 min-w-0">
            <span className="truncate">{p.nomenclatureName}</span>
            <span className="text-muted-foreground ml-1">× {quantity}</span>
          </div>
          <span className="font-mono shrink-0 ml-2">
            {formatNomenclaturePrice(p.price * quantity, terms.currency)}
          </span>
        </div>
      ))}
    </div>

    <Separator />

    <div className="space-y-1 text-sm">
      {cartTotal.discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Знижка {terms.discountPercent}%</span>
          <span className="font-mono">
            −{formatNomenclaturePrice(cartTotal.discount, terms.currency)}
          </span>
        </div>
      )}
      <div className="flex justify-between font-medium text-lg">
        <span>До сплати</span>
        <span className="font-mono">
          {formatNomenclaturePrice(cartTotal.total, terms.currency)}
        </span>
      </div>
    </div>

    {comment && (
      <>
        <Separator />
        <div>
          <p className="text-xs text-muted-foreground">Коментар</p>
          <p className="text-sm mt-1">{comment}</p>
        </div>
      </>
    )}
  </div>
);
