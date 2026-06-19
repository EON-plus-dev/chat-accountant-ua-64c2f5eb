/**
 * Universal orderable types — нормалізовані shape для Sales/Purchases UI.
 * Обʼєднує різнорідні джерела: SalonProduct, NomenclatureItemV2, NomenclatureItem,
 * SalonClient, SalonSupplier, TennisSupplier, Contractor.
 */

export type OrderableProductSource =
  | "salon-product"
  | "tennis-seed"
  | "nomenclature"
  | "settings-legacy";

export interface OrderableProduct {
  id: string;
  sku: string;
  name: string;
  unit: string;
  /** Роздрібна / стандартна ціна продажу (UAH). */
  price: number;
  /** Очікувана собівартість (UAH, для маржі). */
  cost: number;
  /** Поточний залишок (синхронізується зі warehouse коли є). */
  stockQty: number;
  minStock: number;
  /** ID типового постачальника (зв’язок з OrderCounterparty kind="supplier"). */
  supplierId?: string;
  supplierName?: string;
  /** Локація за замовч. (warehouse). */
  defaultLocationId?: string;
  /** Категорія для угрупування у Combobox. */
  group?: string;
  /** Послуга (не списується зі складу). */
  isService?: boolean;
  source: OrderableProductSource;
}

export type OrderCounterpartyKind = "client" | "supplier" | "both";

export interface OrderCounterparty {
  id: string;
  name: string;
  taxId?: string;
  kind: OrderCounterpartyKind;
  currency: "UAH" | "USD" | "EUR";
  paymentTermsDays?: number;
  /** Країна (для PO). */
  country?: string;
  /** On-time доставки (тільки для supplier). */
  onTimePct?: number;
  /** Lead time у днях (тільки для supplier). */
  defaultLeadDays?: number;
}
