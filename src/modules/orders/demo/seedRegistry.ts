/**
 * Order seed registry — диспетчер seed-функцій для модуля Orders.
 * Кожен демо-кабінет з SO/PO підключається тут одним рядком, без правок
 * у `useOrdersStore` / `useFulfillmentsStore` / consumer-сторінках.
 */

import type { Order, Fulfillment } from "@/modules/orders/types";
import { salonAllOrders, salonFulfillments } from "@/config/demoCabinets/salonOrdersData";
import { tennisAllOrders, tennisFulfillments } from "@/config/demoCabinets/tennisOrdersData";
import { restaurantAllOrders, restaurantFulfillments } from "@/config/demoCabinets/restaurantOrdersData";
import { hotelAllOrders, hotelFulfillments } from "@/config/demoCabinets/hotelOrdersData";

const ORDERS: Record<string, Order[]> = {
  "demo-salon-3": salonAllOrders,
  "demo-tennis-3": tennisAllOrders,
  "demo-restaurant-3": restaurantAllOrders,
  "demo-hotel-3": hotelAllOrders,
};

const FULFILLMENTS: Record<string, Fulfillment[]> = {
  "demo-salon-3": salonFulfillments,
  "demo-tennis-3": tennisAllOrders ? tennisFulfillments : [],
  "demo-restaurant-3": restaurantFulfillments,
  "demo-hotel-3": hotelFulfillments,
};

export function seedOrdersForCabinet(cabinetId: string): Order[] {
  return ORDERS[cabinetId] ?? [];
}

export function seedFulfillmentsForCabinet(cabinetId: string): Fulfillment[] {
  return FULFILLMENTS[cabinetId] ?? [];
}
