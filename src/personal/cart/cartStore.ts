import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  title: string;
  vendor: string;
  emoji?: string;
  priceUah: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      isCheckoutOpen: false,
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId ? { ...i, qty: i.qty + (item.qty ?? 1) } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, qty: item.qty ?? 1 }] };
        }),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: qty <= 0
            ? s.items.filter((i) => i.productId !== productId)
            : s.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: false }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
    }),
    { name: "lovable-personal-cart" }
  )
);

export const selectCartCount = (s: { items: CartItem[] }) =>
  s.items.reduce((a, i) => a + i.qty, 0);
export const selectCartTotal = (s: { items: CartItem[] }) =>
  s.items.reduce((a, i) => a + i.priceUah * i.qty, 0);
