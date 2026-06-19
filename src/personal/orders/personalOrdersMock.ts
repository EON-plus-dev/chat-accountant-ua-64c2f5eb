import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

export type PersonalOrderKind = "purchase" | "service" | "booking";
export type PersonalOrderStatus = "scheduled" | "active" | "completed" | "cancelled";
export type PersonalOrderPaymentMethod =
  | "card" | "applepay" | "googlepay" | "cash" | "fop_iban" | "balance";
export type PersonalOrderDeliveryStatus =
  | "preparing" | "shipped" | "out_for_delivery" | "delivered";

export interface PersonalOrderItem {
  title: string;
  qty: number;
  priceUah: number;
}

export interface PersonalOrder {
  id: string;
  kind: PersonalOrderKind;
  title: string;
  vendor: string;
  date: string;
  amountUah: number;
  status: PersonalOrderStatus;
  // Розширені поля (опційні — старі записи лишаються валідними)
  paymentMethod?: PersonalOrderPaymentMethod;
  paymentLast4?: string;
  deliveryStatus?: PersonalOrderDeliveryStatus;
  trackingNo?: string;
  returnableUntil?: string;
  invoiceUrl?: string;
  items?: PersonalOrderItem[];
  address?: string;
  notes?: string;
}

const DATA: Partial<Record<PersonalPreset, PersonalOrder[]>> = {
  declarant: [
    { id: "ord-1", kind: "purchase", title: "Кросівки Nike Pegasus 41", vendor: "Intertop", date: "2026-03-28", amountUah: 4290, status: "completed" },
    { id: "ord-2", kind: "purchase", title: "Замовлення продуктів", vendor: "Rozetka", date: "2026-04-02", amountUah: 1845, status: "active" },
    { id: "ord-3", kind: "service", title: "Хімчистка пуховика", vendor: "Чистенько", date: "2026-04-04", amountUah: 620, status: "completed" },
    { id: "ord-4", kind: "service", title: "Заміна гальмівних колодок", vendor: "AutoSpace СТО", date: "2026-04-10", amountUah: 3200, status: "scheduled" },
    { id: "ord-5", kind: "booking", title: "Корт №3, 90 хв", vendor: "Tennis Club «Forhand»", date: "2026-04-07", amountUah: 850, status: "scheduled" },
    { id: "ord-6", kind: "booking", title: "Огляд у сімейного лікаря", vendor: "Добробут", date: "2026-04-12", amountUah: 0, status: "scheduled" },
    { id: "ord-7", kind: "purchase", title: "AirPods Pro 2", vendor: "iStore", date: "2026-04-03", amountUah: 9990, status: "active" },
    { id: "ord-8", kind: "purchase", title: "Сертифікат «Книгарня Є» 500 ₴", vendor: "Книгарня Є", date: "2026-04-01", amountUah: 500, status: "completed" },
    { id: "ord-9", kind: "service", title: "Каско Toyota CHR — поновлення", vendor: "UNIQA", date: "2026-04-08", amountUah: 14400, status: "completed" },
    { id: "ord-10", kind: "booking", title: "Вечеря на двох", vendor: "Bao + Bun", date: "2026-04-11", amountUah: 0, status: "scheduled" },
    { id: "ord-11", kind: "booking", title: "Стоматолог · огляд", vendor: "Дентал Студіо", date: "2026-04-15", amountUah: 600, status: "scheduled" },
    { id: "ord-12", kind: "service", title: "Прибирання квартири", vendor: "CleanMe", date: "2026-04-06", amountUah: 1200, status: "completed" },
    { id: "ord-13", kind: "purchase", title: "Кавомашина DeLonghi Magnifica", vendor: "Comfy", date: "2026-03-22", amountUah: 18990, status: "completed" },
    { id: "ord-14", kind: "purchase", title: "Книги (3 шт.)", vendor: "Yakaboo", date: "2026-03-18", amountUah: 1140, status: "completed" },
    { id: "ord-15", kind: "service", title: "Технічний огляд авто", vendor: "AutoSpace СТО", date: "2026-03-15", amountUah: 850, status: "completed" },
    { id: "ord-16", kind: "booking", title: "Multiplex · Дюна 2", vendor: "Multiplex", date: "2026-03-10", amountUah: 480, status: "completed" },
    { id: "ord-17", kind: "purchase", title: "Доставка Сільпо", vendor: "Сільпо", date: "2026-03-05", amountUah: 2340, status: "completed" },
    { id: "ord-18", kind: "purchase", title: "Lego Technic McLaren P1", vendor: "Будинок іграшок", date: "2026-02-26", amountUah: 4990, status: "completed" },
    { id: "ord-19", kind: "booking", title: "Готель у Львові, 2 ночі", vendor: "Citadel Inn", date: "2026-02-20", amountUah: 6400, status: "completed" },
    { id: "ord-20", kind: "service", title: "Декларація ПДФО 2025", vendor: "FINTODO AI", date: "2026-02-14", amountUah: 0, status: "completed" },
    { id: "ord-21", kind: "purchase", title: "Подарунковий букет", vendor: "FlowerShop", date: "2026-02-14", amountUah: 1800, status: "completed" },
    { id: "ord-22", kind: "booking", title: "СПА на двох", vendor: "Five Element", date: "2026-02-15", amountUah: 3200, status: "completed" },
  ],
  renter: [
    { id: "ord-r-1", kind: "service", title: "Клінінг квартири перед заселенням", vendor: "CleanMe", date: "2026-04-05", amountUah: 1400, status: "scheduled" },
    { id: "ord-r-2", kind: "purchase", title: "Бойлер Ariston 80 л", vendor: "Епіцентр", date: "2026-03-22", amountUah: 8990, status: "completed" },
    { id: "ord-r-3", kind: "service", title: "Сантехнік — заміна змішувача", vendor: "ProFix", date: "2026-04-09", amountUah: 750, status: "scheduled" },
  ],
  master: [
    // Поточні / заплановані
    { id: "ord-m-1", kind: "purchase", title: "Професійні ножиці Tondeo S-Line", vendor: "Барбершоп-маркет", date: "2026-04-02", amountUah: 4200, status: "active" },
    { id: "ord-m-2", kind: "purchase", title: "Фарби Wella Koleston (набір)", vendor: "Pro Hair Shop", date: "2026-04-04", amountUah: 3450, status: "active" },
    { id: "ord-m-3", kind: "booking", title: "Майстер-клас «Балаяж 2026»", vendor: "Beauty Academy", date: "2026-05-10", amountUah: 6500, status: "scheduled" },
    { id: "ord-m-4", kind: "service", title: "Фотосесія робіт для портфоліо", vendor: "BeautyMedia", date: "2026-04-14", amountUah: 2000, status: "scheduled" },
    { id: "ord-m-5", kind: "booking", title: "Огляд у стоматолога", vendor: "Дентал Студіо", date: "2026-04-11", amountUah: 600, status: "scheduled" },
    { id: "ord-m-6", kind: "service", title: "Прибирання квартири", vendor: "CleanMe", date: "2026-04-08", amountUah: 1100, status: "scheduled" },
    { id: "ord-m-7", kind: "purchase", title: "Замовлення продуктів", vendor: "Сільпо", date: "2026-04-03", amountUah: 1620, status: "active" },
    { id: "ord-m-8", kind: "booking", title: "Сімейна вечеря", vendor: "Канапа", date: "2026-04-13", amountUah: 0, status: "scheduled" },
    // Березень
    { id: "ord-m-9", kind: "purchase", title: "Фен Dyson Supersonic", vendor: "iStore", date: "2026-03-28", amountUah: 18990, status: "completed" },
    { id: "ord-m-10", kind: "purchase", title: "Косметика для волосся (запас)", vendor: "EVA", date: "2026-03-24", amountUah: 1850, status: "completed" },
    { id: "ord-m-11", kind: "service", title: "Реклама в Instagram (тиждень)", vendor: "Meta Ads", date: "2026-03-20", amountUah: 1500, status: "completed" },
    { id: "ord-m-12", kind: "booking", title: "Манікюр", vendor: "Nail Bar Studio", date: "2026-03-18", amountUah: 850, status: "completed" },
    { id: "ord-m-13", kind: "purchase", title: "Кросівки Nike Air Max", vendor: "Intertop", date: "2026-03-15", amountUah: 3990, status: "completed" },
    { id: "ord-m-14", kind: "service", title: "Декларація ЄП Q1", vendor: "FINTODO AI", date: "2026-03-12", amountUah: 0, status: "completed" },
    { id: "ord-m-15", kind: "booking", title: "Multiplex · кіно з подругою", vendor: "Multiplex", date: "2026-03-08", amountUah: 320, status: "completed" },
    { id: "ord-m-16", kind: "purchase", title: "Доставка Glovo (вечеря)", vendor: "Glovo", date: "2026-03-05", amountUah: 480, status: "completed" },
    // Лютий
    { id: "ord-m-17", kind: "booking", title: "СПА-день", vendor: "Five Element", date: "2026-02-22", amountUah: 1800, status: "completed" },
    { id: "ord-m-18", kind: "service", title: "Чистка кондиціонера", vendor: "ClimaPro", date: "2026-02-18", amountUah: 850, status: "completed" },
    { id: "ord-m-19", kind: "purchase", title: "Книга «Beauty Business»", vendor: "Yakaboo", date: "2026-02-12", amountUah: 420, status: "completed" },
    { id: "ord-m-20", kind: "booking", title: "Готель у Львові, вихідні", vendor: "Citadel Inn", date: "2026-02-08", amountUah: 4800, status: "completed" },
  ],
};

export function getPersonalOrders(cabinetId: string): PersonalOrder[] {
  return pickByPreset(cabinetId, DATA, []);
}
