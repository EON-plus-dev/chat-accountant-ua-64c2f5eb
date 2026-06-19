/**
 * Cabinet Capabilities — адаптивний склад модулів кабінету.
 *
 * Замість жорстко прив'язаного до `type` списку підрозділів, кожен модуль
 * (підтаб "Операції") може вимагати наявності однієї/кількох capabilities.
 * Capabilities виводяться автоматично з профілю кабінету (галузь, наявність
 * працівників, тип, тощо) або задаються явно через `Cabinet.capabilities`.
 *
 * Приклад: модуль "Склад" доступний лише якщо `capabilities` містить
 * "warehouse". Це автоматично вмикається для торгівлі/виробництва/автосервісу,
 * або коли в основних засобах виявлено об'єкт "склад" / договір оренди складу.
 */

import type { Cabinet, CabinetCapability } from "@/types/cabinet";

export interface CapabilityMeta {
  id: CabinetCapability;
  label: string;
  description: string;
  /** Коротке пояснення «звідки взялося» для UI «Активні модулі». */
  derivedFromHint: string;
}

export const CAPABILITY_META: Record<CabinetCapability, CapabilityMeta> = {
  warehouse: {
    id: "warehouse",
    label: "Склад",
    description: "Складський облік, рух товарів, інвентаризація",
    derivedFromHint: "Договір оренди складу, ОЗ-склад або товарна номенклатура",
  },
  employees: {
    id: "employees",
    label: "Працівники / Payroll",
    description: "Кадровий облік, зарплата, ЄСВ, ПДФО з ФОТ",
    derivedFromHint: "Заповнено «Є наймані працівники»",
  },
  vat: {
    id: "vat",
    label: "ПДВ",
    description: "Реєстрація податкових накладних, декларація ПДВ",
    derivedFromHint: "Платник ПДВ за реєстром або типом кабінету",
  },
  saas_business: {
    id: "saas_business",
    label: "SaaS-операції",
    description: "CRM, підписки клієнтів, партнерська мережа",
    derivedFromHint: "Власна SaaS-операційна модель (внутрішній dogfooding)",
  },
  imports_exports: {
    id: "imports_exports",
    label: "ЗЕД",
    description: "Зовнішньоекономічна діяльність, валютні контракти",
    derivedFromHint: "Виявлені валютні рахунки або зовнішні контракти",
  },
  fixed_assets: {
    id: "fixed_assets",
    label: "Основні засоби",
    description: "Облік ОЗ, амортизація, інвентаризація",
    derivedFromHint: "Є об'єкти ОЗ або документи на придбання активу",
  },
  retail_prro: {
    id: "retail_prro",
    label: "ПРРО / Каса",
    description: "Фіскальні чеки, касові операції, повернення",
    derivedFromHint: "Роздрібна торгівля або зареєстрований ПРРО",
  },
  bookings: {
    id: "bookings",
    label: "Щоденник",
    description: "Запис клієнтів до майстрів, календар, послуги, винагороди",
    derivedFromHint: "Бізнес типу салон/клініка/фітнес — приймає клієнтів за записом",
  },
  "bookings:chair": {
    id: "bookings:chair",
    label: "Запис на крісло",
    description: "Subcapability bookings для салонних кабінетів (крісло як ресурс)",
    derivedFromHint: "Галузь salon — додається автоматично разом з bookings",
  },
  "bookings:court": {
    id: "bookings:court",
    label: "Бронювання корту",
    description: "Subcapability bookings для спортивних клубів (корт як ресурс)",
    derivedFromHint: "Галузь tennis_club — додається автоматично разом з bookings",
  },
  "bookings:room": {
    id: "bookings:room",
    label: "Бронювання номера",
    description: "Subcapability bookings для готелів (номер, date-range stays)",
    derivedFromHint: "Галузь hotel — додається автоматично разом з bookings",
  },
  "bookings:table": {
    id: "bookings:table",
    label: "Резерв столика",
    description: "Subcapability bookings для ресторанів (столик як ресурс)",
    derivedFromHint: "Галузь restaurant — додається автоматично разом з bookings",
  },
  bookings_personal: {
    id: "bookings_personal",
    label: "Щоденник (legacy)",
    description: "Legacy alias для `bookings_personal:view` — лишається для backward-compat (1 реліз).",
    derivedFromHint: "Активна salon-master делегація (будь-яка)",
  },
  "bookings_personal:view": {
    id: "bookings_personal:view",
    label: "Мої бронювання (перегляд)",
    description: "RO-layer у Календарі: майстер бачить свої записи з усіх активних делегацій",
    derivedFromHint: "Активна salon-master делегація (employment або services)",
  },
  "bookings_personal:operate": {
    id: "bookings_personal:operate",
    label: "Щоденник майстра",
    description: "Повний операційний інструмент: створення/перенесення/скасування записів, картки клієнтів, прайс",
    derivedFromHint: "ФОП-делегація з terms.kind ∈ {workspace_rental, hybrid} — майстер має власних клієнтів",
  },
  client_book: {
    id: "client_book",
    label: "Клієнти",
    description: "База клієнтів: картки, історія візитів, RFM-сегменти, лояльність, синхронізація з зовнішньою CRM",
    derivedFromHint: "Бізнес-кабінет, що приймає клієнтів за записом (салон/клініка/фітнес)",
  },
  goods_sales: {
    id: "goods_sales",
    label: "Продажі",
    description: "Продажі товарів клієнтам: каса (ПРРО), B2B-рахунки, допродажі на візиті, маркетплейс",
    derivedFromHint: "Роздрібна торгівля (ПРРО) або галузь з товарообігом (салон/трейд/автосервіс/dealer)",
  },
  purchases: {
    id: "purchases",
    label: "Закупки",
    description: "Замовлення постачальникам, прийом (GRN), landed cost, scorecard постачальників, мульти-валютність",
    derivedFromHint: "Наявність складу/постачальників або галузь з товарообігом",
  },
  delivery: {
    id: "delivery",
    label: "Доставка",
    description: "Курʼєрська доставка замовлень: маршрути, статуси, час доставки, зони",
    derivedFromHint: "Ресторан або e-commerce кабінет з власною службою доставки",
  },
};


import { getDelegationsForMasterCabinet } from "@/config/demoCabinets/salonMasterDelegations";

/**
 * Автоматичне виведення capabilities з профілю кабінету.
 * Якщо в `cabinet.capabilities` заданий explicit override — повертається він.
 *
 * Виняток: навіть якщо `capabilities` задано явно, для кабінетів майстрів
 * (individual / fop) з активною salon-master делегацією додаємо
 * `bookings_personal`, щоб Щоденник був доступний завжди.
 */
export function deriveCapabilities(cabinet: Cabinet): CabinetCapability[] {
  // Перевірка на майстра — спільна для explicit і derived гілок.
  const isMasterCabinet = cabinet.type === "individual" || cabinet.type === "fop";
  const masterDelegations = isMasterCabinet
    ? getDelegationsForMasterCabinet(cabinet.id)
    : [];
  const hasMasterDelegations = masterDelegations.length > 0;

  // Перевірка: чи має майстер хоча б один контракт, який дає доступ до повного
  // операційного Щоденника (власні клієнти → потрібен робочий інструмент).
  const hasOperateContract = masterDelegations.some(
    (d) =>
      d.contract_kind === "services" &&
      (d.terms.kind === "workspace_rental" || d.terms.kind === "hybrid"),
  );

  if (cabinet.capabilities && cabinet.capabilities.length > 0) {
    const explicit = new Set<CabinetCapability>(cabinet.capabilities);
    if (hasMasterDelegations) {
      explicit.add("bookings_personal");
      explicit.add("bookings_personal:view");
    }
    if (hasOperateContract) explicit.add("bookings_personal:operate");
    return Array.from(explicit);
  }

  const caps = new Set<CabinetCapability>();

  // Працівники
  if (cabinet.hasEmployees) caps.add("employees");

  // ПДВ: за замовчуванням ТОВ — платник ПДВ (для ФОП 3-ї групи окремо
  // має задаватися явно через `capabilities` або `registrySync.vat`).
  if (cabinet.type === "tov") caps.add("vat");
  if (cabinet.registrySync?.vat?.isVatPayer) caps.add("vat");

  // Галузь → склад / ОЗ / ПРРО.
  // ВАЖЛИВО: для кабінетів майстрів (individual/fop) з активною делегацією
  // НЕ додаємо salon-owner модулі (bookings/retail_prro/employees), навіть
  // якщо `industry === "salon"`. Майстер не є власником салону.
  const isSalonMaster = hasMasterDelegations;
  switch (cabinet.industry) {
    case "trade":
    case "dealer":
      caps.add("warehouse");
      caps.add("fixed_assets");
      caps.add("retail_prro");
      caps.add("goods_sales");
      caps.add("purchases");
      break;
    case "manufacturing":
      caps.add("warehouse");
      caps.add("fixed_assets");
      caps.add("purchases");
      break;
    case "autorepair":
      caps.add("warehouse");
      caps.add("retail_prro");
      caps.add("fixed_assets");
      caps.add("goods_sales");
      caps.add("purchases");
      break;
    case "it":
      if (cabinet.type === "tov") caps.add("fixed_assets");
      break;
    case "consulting":
    case "services":
      break;
    case "salon":
      if (!isSalonMaster) {
        caps.add("employees");
        caps.add("retail_prro");
        caps.add("bookings");
        caps.add("bookings:chair");
        caps.add("client_book");
        caps.add("goods_sales");
        caps.add("purchases");
      }
      break;
    case "tennis_club":
      // Тенісний клуб = салон + торгівля + кафе + закупки інвентаря/їжі.
      // Майстер (тренер) у власному кабінеті отримує `bookings_personal` через master-delegation,
      // owner-модулі знімаються нижче, як для салону.
      if (!isSalonMaster) {
        caps.add("employees");
        caps.add("retail_prro");
        caps.add("bookings");
        caps.add("bookings:court");
        caps.add("client_book");
        caps.add("goods_sales");
        caps.add("purchases");
        caps.add("warehouse");
        caps.add("fixed_assets");
      }
      break;
    case "restaurant":
      // Ресторан = tennis_club + delivery. bookings = столики.
      // Кухарі/офіціанти моделюються як salon-masters; staff-делегації знімають owner-модулі
      // у їх особистих кабінетах, як для салону/тенісу.
      if (!isSalonMaster) {
        caps.add("employees");
        caps.add("retail_prro");
        caps.add("bookings");
        caps.add("bookings:table");
        caps.add("client_book");
        caps.add("goods_sales");
        caps.add("purchases");
        caps.add("warehouse");
        caps.add("fixed_assets");
        caps.add("delivery");
      }
      break;
    case "hotel":
      // Готель = tennis_club + multi-day stays. bookings = номери.
      // Персонал (прибиральниці, технічні майстри, ресепшн) — звичайні employees,
      // НЕ salon-masters (гість бронює номер напряму, без вибору майстра).
      caps.add("employees");
      caps.add("retail_prro");
      caps.add("bookings");
      caps.add("bookings:room");
      caps.add("client_book");
      caps.add("goods_sales");
      caps.add("purchases");
      caps.add("warehouse");
      caps.add("fixed_assets");
      break;
  }

  if (hasMasterDelegations) {
    caps.add("bookings_personal"); // legacy alias
    caps.add("bookings_personal:view");
    if (hasOperateContract) caps.add("bookings_personal:operate");
    // Захист від випадково доданих salon-owner модулів.
    caps.delete("bookings");
    caps.delete("bookings:chair");
    caps.delete("bookings:court");
    caps.delete("bookings:room");
    caps.delete("bookings:table");
    caps.delete("employees");
    caps.delete("retail_prro");
    caps.delete("client_book");
    caps.delete("goods_sales");
    caps.delete("purchases");
    caps.delete("delivery");
  }

  return Array.from(caps);
}


/** Чи має кабінет конкретну capability (через derive або explicit). */
export function hasCapability(
  cabinet: Cabinet,
  capability: CabinetCapability,
): boolean {
  return deriveCapabilities(cabinet).includes(capability);
}

/** Чи має кабінет ВСІ перелічені capabilities. */
export function hasAllCapabilities(
  cabinet: Cabinet,
  required: CabinetCapability | CabinetCapability[],
): boolean {
  const arr = Array.isArray(required) ? required : [required];
  const have = new Set(deriveCapabilities(cabinet));
  return arr.every((c) => have.has(c));
}
