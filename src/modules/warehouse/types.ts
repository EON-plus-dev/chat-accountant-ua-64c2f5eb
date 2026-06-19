/**
 * Warehouse domain — основна модель Phase 3.
 *
 * Принципи:
 *   • StockMove — єдина одиниця правди. Поточний залишок = Σ qty.
 *   • Усі сторонні модулі (Fulfillment, ПРРО-чек, WriteOff, Inventory)
 *     створюють StockMove, але не зберігають поточний залишок як поле.
 *   • InventoryDoc / WriteOffDoc — це бізнес-документи, кожен з яких
 *     генерує `kind: "inventory_adj"` або `kind: "writeoff"` move.
 */

export type StockLocationKind = "shop" | "cafe" | "backroom" | "counter" | "salon";

export interface StockLocation {
  id: string;
  cabinetId: string;
  name: string;
  kind: StockLocationKind;
  /** Чи це торгова точка (ПРРО). */
  isFiscal?: boolean;
}

export type StockMoveKind =
  | "receipt"          // PO → GRN
  | "shipment"         // SO → DN (B2B-відвантаження)
  | "prro_sale"        // ПРРО-чек
  | "writeoff"         // Списання
  | "transfer_out"
  | "transfer_in"
  | "inventory_adj"    // Інв.-коригування
  | "return_in"        // Повернення від клієнта
  | "return_out";      // Повернення постачальнику

export interface StockMove {
  id: string;
  cabinetId: string;
  productId: string;
  locationId: string;
  /** Підписана к-сть: +приходи, −витрати. */
  qty: number;
  kind: StockMoveKind;
  /** Тип посилального документа. */
  refType?: "order" | "fulfillment" | "prro_receipt" | "writeoff_doc" | "inventory_doc" | "transfer_doc";
  refId?: string;
  /** Собівартість одиниці на момент руху (для FIFO/середньозваж.). */
  costPerUnit?: number;
  date: string;
  notes?: string;
}

export type WriteOffReason =
  | "expired"
  | "damage"
  | "theft"
  | "internal_use"
  | "marketing"
  | "tester"
  | "other";

export interface WriteOffLine {
  productId: string;
  qty: number;
  reason: WriteOffReason;
  notes?: string;
}

export interface WriteOffDoc {
  id: string;
  cabinetId: string;
  locationId: string;
  date: string;
  number: string;
  lines: WriteOffLine[];
  /** Підсумкова сума собівартості (для проводки у витрати). */
  totalCost: number;
  /** Чи створено проводку у Книгу витрат (для ФОП — впливає на ЄП). */
  expensePosted?: boolean;
  status: "draft" | "confirmed" | "cancelled";
  responsibleName?: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryLine {
  productId: string;
  expectedQty: number;
  countedQty: number;
  /** Розрахункова собівартість delta (для проводки). */
  deltaCost: number;
}

export interface InventoryDoc {
  id: string;
  cabinetId: string;
  locationId: string;
  date: string;
  number: string;
  lines: InventoryLine[];
  status: "draft" | "in_progress" | "confirmed" | "cancelled";
  responsibleName?: string;
  notes?: string;
  createdAt: string;
}
