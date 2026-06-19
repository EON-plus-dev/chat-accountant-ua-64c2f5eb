/**
 * CONTRACTOR INTERACTION TAB
 * 
 * Таб "Взаємодія" - показує предмет комерційних відносин з контрагентом:
 * - Товари та послуги
 * - Умови співпраці
 * - Історія замовлень
 * - Швидке замовлення
 */

import { useState, useCallback } from "react";
import { ContractorProductsSection } from "./ContractorProductsSection";
import { ContractorTermsCard } from "./ContractorTermsCard";
import { ContractorOrdersSection } from "./ContractorOrdersSection";
import { QuickOrderCard } from "./QuickOrderCard";
import { CreateOrderSheet } from "./CreateOrderSheet";
import { OrderDetailSheet } from "./OrderDetailSheet";
import { ContractorProductDetailSheet } from "./ContractorProductDetailSheet";
import type { Contractor } from "@/config/settingsConfig";
import { toast } from "sonner";
import {
  getMockContractorProducts,
  getMockContractorTerms,
  getMockContractorOrders,
} from "@/config/contractorInteractionConfig";


interface ContractorInteractionTabProps {
  contractor: Contractor;
  onNavigateToDocument?: (documentId: string) => void;
  onCreateOrder?: () => void;
}

export const ContractorInteractionTab = ({
  contractor,
  onNavigateToDocument,
}: ContractorInteractionTabProps) => {
  const products = getMockContractorProducts(contractor.id);
  const terms = getMockContractorTerms(contractor.id);
  const orders = getMockContractorOrders(contractor.id);

  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([]);

  const handleCreateOrder = () => setCreateOrderOpen(true);

  const handleViewProduct = (productId: string) => {
    setViewProductId(productId);
  };

  const handleAddToCart = useCallback((productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, quantity: product.minOrderQuantity }];
    });
    toast.success(`${product.nomenclatureName} додано до кошика`);
  }, [products]);

  const selectedProduct = viewProductId
    ? products.find((p) => p.id === viewProductId) ?? null
    : null;

  const selectedOrder = viewOrderId
    ? orders.find((o) => o.id === viewOrderId) ?? null
    : null;

  return (
    <div className="space-y-4">
      <ContractorProductsSection 
        products={products}
        contractorName={contractor.name}
        relationshipType={contractor.relationshipType === "master" ? "supplier" : contractor.relationshipType}
        onCreateOrder={handleCreateOrder}
        onViewProduct={handleViewProduct}
        onAddToCart={handleAddToCart}
        cartItemsCount={cartItems.length}
      />

      <ContractorTermsCard 
        terms={terms}
        onNavigateToContract={onNavigateToDocument}
      />

      <ContractorOrdersSection 
        orders={orders}
        onViewOrder={(id) => setViewOrderId(id)}
        onViewAllOrders={() => setShowAllOrders((v) => !v)}
        onCreateOrder={handleCreateOrder}
        showAll={showAllOrders}
      />

      <QuickOrderCard 
        hasProducts={products.length > 0}
        onCreateOrder={handleCreateOrder}
      />

      <CreateOrderSheet
        open={createOrderOpen}
        onOpenChange={(v) => {
          setCreateOrderOpen(v);
          if (!v) setCartItems([]);
        }}
        products={products}
        terms={terms}
        contractorName={contractor.name}
        initialCartItems={cartItems}
      />

      <OrderDetailSheet
        open={!!viewOrderId}
        onOpenChange={(v) => { if (!v) setViewOrderId(null); }}
        order={selectedOrder}
        contractorName={contractor.name}
      />

      <ContractorProductDetailSheet
        open={!!viewProductId}
        onOpenChange={(v) => { if (!v) setViewProductId(null); }}
        product={selectedProduct}
        onCreateOrder={() => {
          setViewProductId(null);
          handleCreateOrder();
        }}
      />
    </div>
  );
};
