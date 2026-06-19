/**
 * CONTRACTOR INTERACTION CONFIG
 * 
 * Типи та mock-дані для табу "Взаємодія" в ContractorDetailPage
 * Визначає товари/послуги контрагента, умови співпраці та замовлення
 */

// ============================================
// CONTRACTOR PRODUCT (linked to Nomenclature)
// ============================================

export type ContractorStockStatus = "available" | "limited" | "out-of-stock" | "on-order";

export interface ContractorProduct {
  id: string;
  nomenclatureId: string;     // Зв'язок з номенклатурою
  nomenclatureName: string;
  sku: string;
  contractorSku?: string;     // Артикул постачальника
  price: number;              // Ціна від контрагента
  currency: string;
  minOrderQuantity: number;   // MOQ
  leadTimeDays: number;       // Час доставки
  stockStatus: ContractorStockStatus;
  stockQuantity?: number;
  lastOrderDate?: string;
  lastOrderQuantity?: number;
  isPreferred: boolean;       // Основний постачальник для цього товару
  category: "product" | "service";
  unit: string;
}

export const contractorStockStatusLabels: Record<ContractorStockStatus, string> = {
  "available": "В наявності",
  "limited": "Обмежено",
  "out-of-stock": "Немає",
  "on-order": "Замовлено",
};

export const contractorStockStatusColors: Record<ContractorStockStatus, string> = {
  "available": "text-green-600 dark:text-green-400",
  "limited": "text-amber-600 dark:text-amber-400",
  "out-of-stock": "text-red-600 dark:text-red-400",
  "on-order": "text-blue-600 dark:text-blue-400",
};

export const contractorStockStatusIcons: Record<ContractorStockStatus, string> = {
  "available": "🟢",
  "limited": "🟡",
  "out-of-stock": "🔴",
  "on-order": "📦",
};

// ============================================
// CONTRACTOR TERMS
// ============================================

export type PaymentTerms = "prepaid" | "net-7" | "net-14" | "net-30" | "net-45" | "net-60" | "cod" | "credit";
export type DeliveryTerms = "EXW" | "FCA" | "CPT" | "CIP" | "DAP" | "DDP" | "FOB" | "CIF";

export const paymentTermsLabels: Record<PaymentTerms, string> = {
  "prepaid": "Передоплата 100%",
  "net-7": "7 днів після відвантаження",
  "net-14": "14 днів після відвантаження",
  "net-30": "30 днів після відвантаження",
  "net-45": "45 днів після відвантаження",
  "net-60": "60 днів після відвантаження",
  "cod": "Накладний платіж",
  "credit": "Кредитна лінія",
};

export const deliveryTermsLabels: Record<DeliveryTerms, string> = {
  "EXW": "EXW (франко-завод)",
  "FCA": "FCA (франко-перевізник)",
  "CPT": "CPT (перевезення оплачено до)",
  "CIP": "CIP (перевезення та страхування оплачено до)",
  "DAP": "DAP (доставлено в місце)",
  "DDP": "DDP (доставлено з оплатою мита)",
  "FOB": "FOB (франко-борт)",
  "CIF": "CIF (вартість, страхування, фрахт)",
};

export interface ContractorTerms {
  paymentTerms: PaymentTerms;
  paymentDays?: number;
  deliveryTerms: DeliveryTerms;
  deliveryAddress?: string;
  minOrderAmount?: number;
  priceGroupId?: string;
  priceGroupName?: string;
  discountPercent?: number;
  currency: string;
  contractId?: string;
  contractNumber?: string;
  contractDate?: string;
  notes?: string;
  creditLimit?: number;
  creditUsed?: number;
}

// ============================================
// CONTRACTOR ORDER
// ============================================

export type ContractorOrderStatus = "draft" | "sent" | "confirmed" | "shipped" | "delivered" | "cancelled";

export const contractorOrderStatusLabels: Record<ContractorOrderStatus, string> = {
  "draft": "Чернетка",
  "sent": "Надіслано",
  "confirmed": "Підтверджено",
  "shipped": "В дорозі",
  "delivered": "Доставлено",
  "cancelled": "Скасовано",
};

export const contractorOrderStatusColors: Record<ContractorOrderStatus, string> = {
  "draft": "text-muted-foreground",
  "sent": "text-blue-600 dark:text-blue-400",
  "confirmed": "text-cyan-600 dark:text-cyan-400",
  "shipped": "text-amber-600 dark:text-amber-400",
  "delivered": "text-green-600 dark:text-green-400",
  "cancelled": "text-red-600 dark:text-red-400",
};

export const contractorOrderStatusIcons: Record<ContractorOrderStatus, string> = {
  "draft": "📝",
  "sent": "📤",
  "confirmed": "✓",
  "shipped": "🚚",
  "delivered": "✅",
  "cancelled": "❌",
};

export interface ContractorOrder {
  id: string;
  orderNumber: string;
  date: string;
  amount: number;
  currency: string;
  status: ContractorOrderStatus;
  itemsCount: number;
  expectedDelivery?: string;
  deliveredAt?: string;
}

// ============================================
// CONTRACTOR ORDER ITEM
// ============================================

export interface ContractorOrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  unit: string;
  total: number;
}

export const getMockOrderItems = (orderId: string): ContractorOrderItem[] => {
  const hash = orderId.charCodeAt(orderId.length - 1) % 3;
  
  const itemSets: ContractorOrderItem[][] = [
    [
      { id: `${orderId}-i1`, productId: "nom-off-001", name: "Папір офісний A4, 500 арк", sku: "OFF-PAP-A4-500", quantity: 50, price: 210, unit: "пач", total: 10500 },
      { id: `${orderId}-i2`, productId: "nom-off-002", name: "Тонер для принтера HP CF280X", sku: "OFF-TNR-HP-80X", quantity: 10, price: 2850, unit: "шт", total: 28500 },
      { id: `${orderId}-i3`, productId: "nom-off-003", name: "Степлер Rapid F30", sku: "OFF-STP-RAP-F30", quantity: 5, price: 890, unit: "шт", total: 4450 },
    ],
    [
      { id: `${orderId}-i1`, productId: "nom-it-001", name: "Ноутбук Dell Latitude 5540", sku: "IT-LAP-DELL-01", quantity: 2, price: 45000, unit: "шт", total: 90000 },
      { id: `${orderId}-i2`, productId: "nom-it-002", name: "Монітор LG 27\" 4K", sku: "IT-MON-LG-27", quantity: 2, price: 18500, unit: "шт", total: 37000 },
    ],
    [
      { id: `${orderId}-i1`, productId: "nom-srv-001", name: "Юридичний супровід", sku: "SRV-JUR-01", quantity: 8, price: 2500, unit: "год", total: 20000 },
      { id: `${orderId}-i2`, productId: "nom-srv-002", name: "Бухгалтерський консалтинг", sku: "SRV-ACC-01", quantity: 12, price: 1800, unit: "год", total: 21600 },
      { id: `${orderId}-i3`, productId: "nom-it-003", name: "Клавіатура Logitech MX Keys", sku: "IT-KB-LOG-MX", quantity: 5, price: 4200, unit: "шт", total: 21000 },
      { id: `${orderId}-i4`, productId: "nom-off-001", name: "Папір офісний A4, 500 арк", sku: "OFF-PAP-A4-500", quantity: 20, price: 210, unit: "пач", total: 4200 },
    ],
  ];

  return itemSets[hash];
};

// ============================================
// NOMENCLATURE SUPPLIER (for NomenclatureSuppliersTab)
// ============================================

export interface NomenclatureSupplier {
  id: string;
  contractorId: string;
  contractorName: string;
  contractorCode: string;
  supplierSku?: string;
  price: number;
  currency: string;
  minOrderQuantity: number;
  leadTimeDays: number;
  isPreferred: boolean;
  lastDeliveryDate?: string;
  reliability: number; // 0-100
  notes?: string;
}

// ============================================
// PRICE HISTORY
// ============================================

export interface PriceHistoryPoint {
  date: string;
  price: number;
  priceWithVat: number;
  changePercent?: number;
  reason?: string;
  source?: "manual" | "import" | "sync";
}

// ============================================
// MOCK DATA
// ============================================

export const getMockContractorProducts = (contractorId: string): ContractorProduct[] => {
  // Different products based on contractor ID hash
  const hash = contractorId.charCodeAt(0) + contractorId.charCodeAt(contractorId.length - 1);
  
  if (hash % 3 === 0) {
    // Service provider
    return [
      {
        id: `prod-${contractorId}-1`,
        nomenclatureId: "nom-srv-001",
        nomenclatureName: "Юридичний супровід",
        sku: "SRV-JUR-01",
        contractorSku: "LEGAL-001",
        price: 2500,
        currency: "UAH",
        minOrderQuantity: 2,
        leadTimeDays: 1,
        stockStatus: "available",
        isPreferred: true,
        category: "service",
        unit: "год",
      },
      {
        id: `prod-${contractorId}-2`,
        nomenclatureId: "nom-srv-002",
        nomenclatureName: "Бухгалтерський консалтинг",
        sku: "SRV-ACC-01",
        contractorSku: "ACC-CONS-01",
        price: 1800,
        currency: "UAH",
        minOrderQuantity: 4,
        leadTimeDays: 1,
        stockStatus: "available",
        lastOrderDate: "2025-01-10",
        lastOrderQuantity: 8,
        isPreferred: false,
        category: "service",
        unit: "год",
      },
    ];
  }
  
  if (hash % 3 === 1) {
    // IT Supplier
    return [
      {
        id: `prod-${contractorId}-1`,
        nomenclatureId: "nom-it-001",
        nomenclatureName: "Ноутбук Dell Latitude 5540",
        sku: "IT-LAP-DELL-01",
        contractorSku: "DELL-LAT5540-I7",
        price: 45000,
        currency: "UAH",
        minOrderQuantity: 1,
        leadTimeDays: 5,
        stockStatus: "available",
        stockQuantity: 12,
        lastOrderDate: "2025-01-08",
        lastOrderQuantity: 3,
        isPreferred: true,
        category: "product",
        unit: "шт",
      },
      {
        id: `prod-${contractorId}-2`,
        nomenclatureId: "nom-it-002",
        nomenclatureName: "Монітор LG 27\" 4K",
        sku: "IT-MON-LG-27",
        contractorSku: "LG-27UP850-W",
        price: 18500,
        currency: "UAH",
        minOrderQuantity: 2,
        leadTimeDays: 3,
        stockStatus: "limited",
        stockQuantity: 4,
        isPreferred: true,
        category: "product",
        unit: "шт",
      },
      {
        id: `prod-${contractorId}-3`,
        nomenclatureId: "nom-it-003",
        nomenclatureName: "Клавіатура Logitech MX Keys",
        sku: "IT-KB-LOG-MX",
        contractorSku: "LOG-920-009417",
        price: 4200,
        currency: "UAH",
        minOrderQuantity: 5,
        leadTimeDays: 2,
        stockStatus: "available",
        stockQuantity: 50,
        isPreferred: false,
        category: "product",
        unit: "шт",
      },
    ];
  }
  
  // Default: General supplier
  return [
    {
      id: `prod-${contractorId}-1`,
      nomenclatureId: "nom-off-001",
      nomenclatureName: "Папір офісний A4, 500 арк",
      sku: "OFF-PAP-A4-500",
      contractorSku: "PAP-A4-PREM",
      price: 210,
      currency: "UAH",
      minOrderQuantity: 10,
      leadTimeDays: 2,
      stockStatus: "available",
      stockQuantity: 500,
      lastOrderDate: "2025-01-15",
      lastOrderQuantity: 50,
      isPreferred: true,
      category: "product",
      unit: "пач",
    },
    {
      id: `prod-${contractorId}-2`,
      nomenclatureId: "nom-off-002",
      nomenclatureName: "Тонер для принтера HP CF280X",
      sku: "OFF-TNR-HP-80X",
      contractorSku: "HP-CF280X-ORIG",
      price: 2850,
      currency: "UAH",
      minOrderQuantity: 2,
      leadTimeDays: 3,
      stockStatus: "limited",
      stockQuantity: 8,
      isPreferred: true,
      category: "product",
      unit: "шт",
    },
    {
      id: `prod-${contractorId}-3`,
      nomenclatureId: "nom-off-003",
      nomenclatureName: "Степлер Rapid F30",
      sku: "OFF-STP-RAP-F30",
      price: 890,
      currency: "UAH",
      minOrderQuantity: 1,
      leadTimeDays: 2,
      stockStatus: "out-of-stock",
      stockQuantity: 0,
      isPreferred: false,
      category: "product",
      unit: "шт",
    },
  ];
};

export const getMockContractorTerms = (contractorId: string): ContractorTerms => {
  const hash = contractorId.charCodeAt(0) % 4;
  
  const terms: ContractorTerms[] = [
    {
      paymentTerms: "net-30",
      deliveryTerms: "DDP",
      deliveryAddress: "м. Київ, вул. Хрещатик, 1",
      minOrderAmount: 10000,
      priceGroupName: "Дистриб'ютор",
      discountPercent: 15,
      currency: "UAH",
      contractNumber: "ДП-2025/001",
      contractDate: "2025-01-01",
      creditLimit: 100000,
      creditUsed: 25000,
      notes: "Знижка від 50 000 ₴ - додаткові 5%",
    },
    {
      paymentTerms: "prepaid",
      deliveryTerms: "FCA",
      minOrderAmount: 5000,
      priceGroupName: "Стандарт",
      discountPercent: 0,
      currency: "UAH",
      contractNumber: "ДП-2024/156",
      contractDate: "2024-06-15",
    },
    {
      paymentTerms: "net-14",
      deliveryTerms: "DAP",
      deliveryAddress: "м. Львів, вул. Личаківська, 25",
      minOrderAmount: 3000,
      priceGroupName: "Преміум",
      discountPercent: 20,
      currency: "UAH",
      contractNumber: "ДП-2024/089",
      contractDate: "2024-03-20",
      creditLimit: 50000,
      creditUsed: 12000,
    },
    {
      paymentTerms: "net-45",
      deliveryTerms: "CIP",
      minOrderAmount: 25000,
      priceGroupName: "VIP-партнер",
      discountPercent: 25,
      currency: "UAH",
      contractNumber: "ДП-2023/234",
      contractDate: "2023-09-01",
      creditLimit: 500000,
      creditUsed: 180000,
      notes: "Пріоритетна обробка замовлень. Персональний менеджер.",
    },
  ];
  
  return terms[hash];
};

export const getMockContractorOrders = (contractorId: string): ContractorOrder[] => {
  const baseYear = 2025;
  const hash = contractorId.charCodeAt(0) % 100;
  
  return [
    {
      id: `ord-${contractorId}-1`,
      orderNumber: `ORD-${baseYear}-${String(hash + 42).padStart(3, "0")}`,
      date: "2025-02-05",
      amount: 125000,
      currency: "UAH",
      status: "delivered",
      itemsCount: 15,
      expectedDelivery: "2025-02-08",
      deliveredAt: "2025-02-07",
    },
    {
      id: `ord-${contractorId}-2`,
      orderNumber: `ORD-${baseYear}-${String(hash + 38).padStart(3, "0")}`,
      date: "2025-01-28",
      amount: 78500,
      currency: "UAH",
      status: "shipped",
      itemsCount: 8,
      expectedDelivery: "2025-02-10",
    },
    {
      id: `ord-${contractorId}-3`,
      orderNumber: `ORD-${baseYear}-${String(hash + 35).padStart(3, "0")}`,
      date: "2025-01-20",
      amount: 45000,
      currency: "UAH",
      status: "confirmed",
      itemsCount: 5,
    },
    {
      id: `ord-${contractorId}-4`,
      orderNumber: `ORD-${baseYear}-${String(hash + 30).padStart(3, "0")}`,
      date: "2025-01-15",
      amount: 12300,
      currency: "UAH",
      status: "draft",
      itemsCount: 3,
    },
    {
      id: `ord-${contractorId}-5`,
      orderNumber: `ORD-2024-${String(hash + 512).padStart(3, "0")}`,
      date: "2024-12-20",
      amount: 92000,
      currency: "UAH",
      status: "delivered",
      itemsCount: 12,
      expectedDelivery: "2024-12-24",
      deliveredAt: "2024-12-24",
    },
    {
      id: `ord-${contractorId}-6`,
      orderNumber: `ORD-2024-${String(hash + 490).padStart(3, "0")}`,
      date: "2024-12-01",
      amount: 5600,
      currency: "UAH",
      status: "cancelled",
      itemsCount: 2,
    },
    {
      id: `ord-${contractorId}-7`,
      orderNumber: `ORD-2024-${String(hash + 478).padStart(3, "0")}`,
      date: "2024-11-10",
      amount: 210000,
      currency: "UAH",
      status: "delivered",
      itemsCount: 20,
      expectedDelivery: "2024-11-15",
      deliveredAt: "2024-11-14",
    },
    {
      id: `ord-${contractorId}-8`,
      orderNumber: `ORD-${baseYear}-${String(hash + 44).padStart(3, "0")}`,
      date: "2025-02-08",
      amount: 33500,
      currency: "UAH",
      status: "sent",
      itemsCount: 6,
    },
  ];
};

export const getMockNomenclatureSuppliers = (nomenclatureId: string): NomenclatureSupplier[] => {
  // Generate realistic suppliers for nomenclature item
  return [
    {
      id: `sup-${nomenclatureId}-1`,
      contractorId: "contr-001",
      contractorName: "ТОВ \"ТехноПостач\"",
      contractorCode: "12345678",
      supplierSku: "TP-" + nomenclatureId.slice(-4),
      price: 42000,
      currency: "UAH",
      minOrderQuantity: 1,
      leadTimeDays: 3,
      isPreferred: true,
      lastDeliveryDate: "2025-01-12",
      reliability: 95,
    },
    {
      id: `sup-${nomenclatureId}-2`,
      contractorId: "contr-002",
      contractorName: "ПП \"Офіс-Центр\"",
      contractorCode: "87654321",
      supplierSku: "OC-" + nomenclatureId.slice(-4),
      price: 43500,
      currency: "UAH",
      minOrderQuantity: 2,
      leadTimeDays: 5,
      isPreferred: false,
      lastDeliveryDate: "2024-12-05",
      reliability: 88,
      notes: "Дешевша доставка від 5 шт",
    },
    {
      id: `sup-${nomenclatureId}-3`,
      contractorId: "contr-003",
      contractorName: "ТОВ \"Імпорт-Трейд\"",
      contractorCode: "11223344",
      price: 39800,
      currency: "UAH",
      minOrderQuantity: 5,
      leadTimeDays: 14,
      isPreferred: false,
      reliability: 72,
      notes: "Довгий lead time, але найнижча ціна",
    },
  ];
};

export const getMockPriceHistory = (nomenclatureId: string): PriceHistoryPoint[] => {
  const basePrice = 1000 + (nomenclatureId.charCodeAt(0) % 100) * 50;
  
  return [
    {
      date: "2025-01-15",
      price: basePrice,
      priceWithVat: basePrice * 1.2,
      reason: "Поточна ціна",
      source: "manual",
    },
    {
      date: "2024-12-01",
      price: basePrice * 0.95,
      priceWithVat: basePrice * 0.95 * 1.2,
      changePercent: 5.26,
      reason: "Сезонне підвищення",
      source: "manual",
    },
    {
      date: "2024-09-15",
      price: basePrice * 0.92,
      priceWithVat: basePrice * 0.92 * 1.2,
      changePercent: 3.26,
      reason: "Зміна валютного курсу",
      source: "sync",
    },
    {
      date: "2024-06-01",
      price: basePrice * 0.88,
      priceWithVat: basePrice * 0.88 * 1.2,
      changePercent: 4.55,
      reason: "Оновлення прайсу",
      source: "import",
    },
    {
      date: "2024-03-01",
      price: basePrice * 0.85,
      priceWithVat: basePrice * 0.85 * 1.2,
      changePercent: 3.53,
      reason: "Первинна ціна",
      source: "manual",
    },
  ];
};
