// ============= FORM FIELD TYPES & INTERFACES =============
import { getUnitOptions } from "@/config/unitsConfig";

// Get unit options from centralized config
const UNIT_OPTIONS = getUnitOptions();

export type FormFieldType = 
  | "text"           // Текстове поле
  | "number"         // Число
  | "currency"       // Гроші (з форматуванням ₴)
  | "date"           // Дата (input type="date")
  | "select"         // Випадаючий список
  | "combobox"       // Пошуковий select (контрагенти, номенклатура)
  | "positions"      // Табличні позиції товарів/послуг
  | "textarea"       // Багаторядковий текст
  | "checkbox"       // Так/Ні
  | "iban"           // IBAN з валідацією UA...
  | "edrpou"         // ЄДРПОУ (8 цифр)
  | "ipn"            // ІПН (10 цифр)
  | "phone"          // Телефон
  | "email"          // Email
  | "employee"       // Вибір працівника з довідника
  | "contract-ref";  // Посилання на договір

export type FieldGroup = 
  | "header"         // Номер, дата, тип
  | "supplier"       // Реквізити постачальника/виконавця
  | "buyer"          // Реквізити покупця/замовника
  | "employee"       // Дані працівника (для HR)
  | "positions"      // Табличні позиції
  | "totals"         // Підсумки, суми
  | "terms"          // Умови (оплата, строки)
  | "transport"      // Транспортні дані (для ТТН)
  | "signatures";    // Підписи

export type FieldSource = 
  | "cabinet"        // Автозаповнення з кабінету
  | "contractor"     // Автозаповнення з контрагента
  | "employee"       // Автозаповнення з працівника
  | "manual"         // Ручне введення
  | "computed";      // Обчислюване поле

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
}

export interface FormField {
  key: string;
  label: string;
  fieldType: FormFieldType;
  source: FieldSource;
  sourceKey?: string;
  group: FieldGroup;
  order: number;
  required: boolean;
  defaultValue?: string | number | boolean;
  placeholder?: string;
  width?: "full" | "half" | "third";
  options?: FormFieldOption[];
  computeFormula?: string;
  validation?: FormFieldValidation;
  showIf?: { field: string; value: string | boolean | number };
  aiHint?: string;
}

export interface PositionColumn {
  key: string;
  label: string;
  type: "text" | "number" | "currency" | "combobox" | "select";
  width: string;
  required: boolean;
  editable: boolean;
  computed?: string;
  options?: FormFieldOption[];
}

// ============= FINANCIAL DOCUMENTS =============

// Рахунок-фактура (invoice)
export const invoiceFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Номер рахунку", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  { key: "dueDate", label: "Оплатити до", fieldType: "date", source: "manual", group: "header", order: 3, required: false, width: "half" },
  
  // === SUPPLIER ===
  { key: "supplierName", label: "Постачальник", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "supplierCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  { key: "supplierIban", label: "IBAN", fieldType: "iban", source: "cabinet", sourceKey: "cabinet.iban", group: "supplier", order: 3, required: true, width: "full" },
  { key: "supplierBank", label: "Банк", fieldType: "text", source: "cabinet", sourceKey: "cabinet.bankName", group: "supplier", order: 4, required: false, width: "half" },
  { key: "supplierMfo", label: "МФО", fieldType: "text", source: "cabinet", sourceKey: "cabinet.mfo", group: "supplier", order: 5, required: false, width: "half" },
  { key: "supplierAddress", label: "Адреса", fieldType: "text", source: "cabinet", sourceKey: "cabinet.legalAddress", group: "supplier", order: 6, required: false, width: "full" },
  { key: "supplierPhone", label: "Телефон", fieldType: "phone", source: "cabinet", sourceKey: "cabinet.phone", group: "supplier", order: 7, required: false, width: "half" },
  
  // === BUYER ===
  { key: "buyerName", label: "Покупець", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "buyerCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "contractor", sourceKey: "contractor.code", group: "buyer", order: 2, required: true, width: "half" },
  { key: "buyerIban", label: "IBAN", fieldType: "iban", source: "contractor", sourceKey: "contractor.iban", group: "buyer", order: 3, required: false, width: "full" },
  { key: "buyerAddress", label: "Адреса", fieldType: "text", source: "contractor", sourceKey: "contractor.address", group: "buyer", order: 4, required: false, width: "full" },
  
  // === POSITIONS ===
  { key: "positions", label: "Позиції", fieldType: "positions", source: "manual", group: "positions", order: 1, required: true, width: "full" },
  
  // === TOTALS ===
  { key: "hasVat", label: "З ПДВ", fieldType: "checkbox", source: "manual", group: "totals", order: 1, required: false, width: "half" },
  { key: "subtotal", label: "Сума без ПДВ", fieldType: "currency", source: "computed", computeFormula: "SUM(positions.amount)", group: "totals", order: 2, required: true, width: "third" },
  { key: "vatAmount", label: "ПДВ 20%", fieldType: "currency", source: "computed", computeFormula: "subtotal * 0.2", group: "totals", order: 3, required: false, width: "third", showIf: { field: "hasVat", value: true } },
  { key: "total", label: "Разом до сплати", fieldType: "currency", source: "computed", computeFormula: "subtotal + vatAmount", group: "totals", order: 4, required: true, width: "third" },
  
  // === TERMS ===
  { key: "paymentTerms", label: "Умови оплати", fieldType: "select", source: "manual", group: "terms", order: 1, required: false, width: "half",
    options: [
      { value: "prepaid", label: "Передоплата 100%" },
      { value: "postpaid", label: "Післяплата" },
      { value: "partial-50", label: "50% аванс, 50% по факту" },
      { value: "net-7", label: "Протягом 7 днів" },
      { value: "net-30", label: "Протягом 30 днів" },
    ]
  },
  { key: "notes", label: "Примітки", fieldType: "textarea", source: "manual", group: "terms", order: 2, required: false, width: "full" },
];

export const invoicePositionColumns: PositionColumn[] = [
  { key: "lineNumber", label: "№", type: "number", width: "w-12", required: true, editable: false },
  { key: "name", label: "Найменування товару/послуги", type: "combobox", width: "flex-1 min-w-[200px]", required: true, editable: true },
  { key: "unit", label: "Од.", type: "select", width: "w-16", required: true, editable: true, options: UNIT_OPTIONS },
  { key: "quantity", label: "К-ть", type: "number", width: "w-20", required: true, editable: true },
  { key: "price", label: "Ціна", type: "currency", width: "w-28", required: true, editable: true },
  { key: "amount", label: "Сума", type: "currency", width: "w-28", required: true, editable: false, computed: "quantity * price" },
];

// Акт виконаних робіт (act)
export const actFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Номер акту", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  { key: "contractRef", label: "До договору", fieldType: "contract-ref", source: "manual", group: "header", order: 3, required: true, width: "full", placeholder: "№ договору від дати" },
  { key: "periodStart", label: "Період з", fieldType: "date", source: "manual", group: "header", order: 4, required: true, width: "half" },
  { key: "periodEnd", label: "Період по", fieldType: "date", source: "manual", group: "header", order: 5, required: true, width: "half" },
  
  // === EXECUTOR ===
  { key: "executorName", label: "Виконавець", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "executorCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  { key: "executorDirector", label: "Представник", fieldType: "text", source: "cabinet", sourceKey: "cabinet.director", group: "supplier", order: 3, required: true, width: "half" },
  
  // === CUSTOMER ===
  { key: "customerName", label: "Замовник", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "customerCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "contractor", sourceKey: "contractor.code", group: "buyer", order: 2, required: true, width: "half" },
  { key: "customerDirector", label: "Представник", fieldType: "text", source: "contractor", sourceKey: "contractor.director", group: "buyer", order: 3, required: false, width: "half" },
  
  // === POSITIONS ===
  { key: "positions", label: "Перелік виконаних робіт/послуг", fieldType: "positions", source: "manual", group: "positions", order: 1, required: true, width: "full" },
  
  // === TOTALS ===
  { key: "total", label: "Загальна вартість", fieldType: "currency", source: "computed", computeFormula: "SUM(positions.amount)", group: "totals", order: 1, required: true, width: "half" },
  { key: "totalInWords", label: "Сума прописом", fieldType: "text", source: "computed", group: "totals", order: 2, required: true, width: "full" },
];

export const actPositionColumns: PositionColumn[] = [
  { key: "lineNumber", label: "№", type: "number", width: "w-12", required: true, editable: false },
  { key: "description", label: "Найменування робіт/послуг", type: "text", width: "flex-1 min-w-[250px]", required: true, editable: true },
  { key: "unit", label: "Од.", type: "select", width: "w-16", required: true, editable: true, options: UNIT_OPTIONS },
  { key: "quantity", label: "К-ть", type: "number", width: "w-20", required: true, editable: true },
  { key: "price", label: "Ціна", type: "currency", width: "w-28", required: true, editable: true },
  { key: "amount", label: "Сума", type: "currency", width: "w-28", required: true, editable: false, computed: "quantity * price" },
];

// Видаткова накладна (waybill)
export const waybillFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Номер накладної", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  { key: "basis", label: "Підстава", fieldType: "contract-ref", source: "manual", group: "header", order: 3, required: false, width: "full" },
  
  // === SUPPLIER ===
  { key: "supplierName", label: "Постачальник", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "supplierCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  { key: "supplierAddress", label: "Адреса", fieldType: "text", source: "cabinet", sourceKey: "cabinet.legalAddress", group: "supplier", order: 3, required: false, width: "full" },
  
  // === RECIPIENT ===
  { key: "recipientName", label: "Отримувач", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "recipientCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "contractor", sourceKey: "contractor.code", group: "buyer", order: 2, required: true, width: "half" },
  { key: "recipientAddress", label: "Адреса доставки", fieldType: "text", source: "contractor", sourceKey: "contractor.address", group: "buyer", order: 3, required: false, width: "full" },
  
  // === POSITIONS ===
  { key: "positions", label: "Товари", fieldType: "positions", source: "manual", group: "positions", order: 1, required: true, width: "full" },
  
  // === TOTALS ===
  { key: "total", label: "Всього", fieldType: "currency", source: "computed", computeFormula: "SUM(positions.amount)", group: "totals", order: 1, required: true, width: "half" },
];

export const waybillPositionColumns: PositionColumn[] = [
  { key: "lineNumber", label: "№", type: "number", width: "w-12", required: true, editable: false },
  { key: "name", label: "Найменування товару", type: "combobox", width: "flex-1 min-w-[200px]", required: true, editable: true },
  { key: "sku", label: "Артикул", type: "text", width: "w-24", required: false, editable: true },
  { key: "unit", label: "Од.", type: "select", width: "w-16", required: true, editable: true, options: UNIT_OPTIONS },
  { key: "quantity", label: "К-ть", type: "number", width: "w-20", required: true, editable: true },
  { key: "price", label: "Ціна", type: "currency", width: "w-28", required: true, editable: true },
  { key: "amount", label: "Сума", type: "currency", width: "w-28", required: true, editable: false, computed: "quantity * price" },
];

// Товарно-транспортна накладна (ttn)
export const ttnFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "№ ТТН", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  
  // === SENDER ===
  { key: "senderName", label: "Вантажовідправник", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "senderCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  { key: "senderAddress", label: "Адреса відвантаження", fieldType: "text", source: "cabinet", sourceKey: "cabinet.factualAddress", group: "supplier", order: 3, required: true, width: "full" },
  
  // === RECEIVER ===
  { key: "receiverName", label: "Вантажоотримувач", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "receiverCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "contractor", sourceKey: "contractor.code", group: "buyer", order: 2, required: true, width: "half" },
  { key: "receiverAddress", label: "Адреса доставки", fieldType: "text", source: "contractor", sourceKey: "contractor.address", group: "buyer", order: 3, required: true, width: "full" },
  
  // === TRANSPORT ===
  { key: "carrierName", label: "Перевізник", fieldType: "combobox", source: "manual", group: "transport", order: 1, required: true, width: "full", placeholder: "Назва транспортної компанії" },
  { key: "carrierCode", label: "ЄДРПОУ/ІПН перевізника", fieldType: "text", source: "manual", group: "transport", order: 2, required: false, width: "half" },
  { key: "driverName", label: "Водій (ПІБ)", fieldType: "text", source: "manual", group: "transport", order: 3, required: true, width: "half" },
  { key: "driverLicense", label: "Посвідчення водія", fieldType: "text", source: "manual", group: "transport", order: 4, required: false, width: "half" },
  { key: "vehicleNumber", label: "Номер авто", fieldType: "text", source: "manual", group: "transport", order: 5, required: true, width: "half", placeholder: "АА 0000 ХХ" },
  { key: "vehicleType", label: "Тип авто", fieldType: "select", source: "manual", group: "transport", order: 6, required: false, width: "half",
    options: [
      { value: "truck", label: "Вантажівка" },
      { value: "van", label: "Фургон" },
      { value: "car", label: "Легковий" },
      { value: "trailer", label: "З причепом" },
    ]
  },
  { key: "route", label: "Маршрут", fieldType: "text", source: "manual", group: "transport", order: 7, required: false, width: "full", placeholder: "Київ → Львів" },
  
  // === POSITIONS ===
  { key: "positions", label: "Вантаж", fieldType: "positions", source: "manual", group: "positions", order: 1, required: true, width: "full" },
  
  // === TOTALS ===
  { key: "totalWeight", label: "Загальна вага, кг", fieldType: "number", source: "computed", computeFormula: "SUM(positions.weight)", group: "totals", order: 1, required: true, width: "third" },
  { key: "totalPlaces", label: "Кількість місць", fieldType: "number", source: "computed", computeFormula: "SUM(positions.places)", group: "totals", order: 2, required: true, width: "third" },
  { key: "totalAmount", label: "Сума", fieldType: "currency", source: "computed", computeFormula: "SUM(positions.amount)", group: "totals", order: 3, required: true, width: "third" },
];

export const ttnPositionColumns: PositionColumn[] = [
  { key: "lineNumber", label: "№", type: "number", width: "w-12", required: true, editable: false },
  { key: "name", label: "Найменування вантажу", type: "text", width: "flex-1 min-w-[180px]", required: true, editable: true },
  { key: "packaging", label: "Тара", type: "select", width: "w-20", required: false, editable: true,
    options: [{ value: "box", label: "Кор." }, { value: "pallet", label: "Пал." }, { value: "bag", label: "Мішок" }, { value: "none", label: "—" }] },
  { key: "places", label: "Місць", type: "number", width: "w-16", required: true, editable: true },
  { key: "weight", label: "Вага, кг", type: "number", width: "w-20", required: true, editable: true },
  { key: "price", label: "Ціна", type: "currency", width: "w-24", required: false, editable: true },
  { key: "amount", label: "Сума", type: "currency", width: "w-24", required: false, editable: false, computed: "places * price" },
];

// ============= CONTRACTS =============

// Договір на послуги (contract)
export const contractFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "№ договору", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "city", label: "Місто", fieldType: "text", source: "manual", group: "header", order: 2, required: true, width: "half", defaultValue: "м. Київ" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 3, required: true, width: "half" },
  
  // === EXECUTOR ===
  { key: "executorName", label: "Виконавець (повна назва)", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "executorCode", label: "Код ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  { key: "executorAddress", label: "Адреса", fieldType: "text", source: "cabinet", sourceKey: "cabinet.legalAddress", group: "supplier", order: 3, required: true, width: "full" },
  { key: "executorIban", label: "IBAN", fieldType: "iban", source: "cabinet", sourceKey: "cabinet.iban", group: "supplier", order: 4, required: true, width: "full" },
  { key: "executorDirector", label: "В особі (ПІБ)", fieldType: "text", source: "cabinet", sourceKey: "cabinet.director", group: "supplier", order: 5, required: true, width: "half" },
  { key: "executorPosition", label: "Посада", fieldType: "text", source: "cabinet", sourceKey: "cabinet.directorPosition", group: "supplier", order: 6, required: false, width: "half", defaultValue: "Директора" },
  { key: "executorBasis", label: "Діє на підставі", fieldType: "select", source: "manual", group: "supplier", order: 7, required: true, width: "half",
    options: [
      { value: "statute", label: "Статуту" },
      { value: "certificate", label: "Свідоцтва" },
      { value: "extract", label: "Виписки з ЄДР" },
      { value: "power-of-attorney", label: "Довіреності" },
    ]
  },
  
  // === CUSTOMER ===
  { key: "customerName", label: "Замовник", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "customerCode", label: "Код ЄДРПОУ/ІПН", fieldType: "text", source: "contractor", sourceKey: "contractor.code", group: "buyer", order: 2, required: true, width: "half" },
  { key: "customerAddress", label: "Адреса", fieldType: "text", source: "contractor", sourceKey: "contractor.address", group: "buyer", order: 3, required: false, width: "full" },
  { key: "customerIban", label: "IBAN", fieldType: "iban", source: "contractor", sourceKey: "contractor.iban", group: "buyer", order: 4, required: false, width: "full" },
  { key: "customerDirector", label: "В особі (ПІБ)", fieldType: "text", source: "contractor", sourceKey: "contractor.director", group: "buyer", order: 5, required: false, width: "half" },
  { key: "customerPosition", label: "Посада", fieldType: "text", source: "contractor", sourceKey: "contractor.directorPosition", group: "buyer", order: 6, required: false, width: "half" },
  
  // === TERMS ===
  { key: "subject", label: "Предмет договору", fieldType: "textarea", source: "manual", group: "terms", order: 1, required: true, width: "full", placeholder: "Виконавець зобов'язується надати послуги з...", aiHint: "Детальний опис послуг" },
  { key: "totalPrice", label: "Вартість послуг", fieldType: "currency", source: "manual", group: "terms", order: 2, required: true, width: "half" },
  { key: "priceType", label: "Тип вартості", fieldType: "select", source: "manual", group: "terms", order: 3, required: true, width: "half",
    options: [
      { value: "fixed", label: "Фіксована" },
      { value: "hourly", label: "Погодинна" },
      { value: "monthly", label: "Щомісячна" },
      { value: "per-project", label: "За проєкт" },
    ]
  },
  { key: "paymentSchedule", label: "Порядок оплати", fieldType: "textarea", source: "manual", group: "terms", order: 4, required: false, width: "full" },
  { key: "validFrom", label: "Дата початку", fieldType: "date", source: "manual", group: "terms", order: 5, required: true, width: "half" },
  { key: "validUntil", label: "Дата завершення", fieldType: "date", source: "manual", group: "terms", order: 6, required: false, width: "half" },
  { key: "autoRenewal", label: "Автопролонгація", fieldType: "checkbox", source: "manual", group: "terms", order: 7, required: false, width: "half" },
];

// Договір поставки (supply-contract)
export const supplyContractFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "№ договору", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  
  // === SUPPLIER ===
  { key: "supplierName", label: "Постачальник", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "supplierCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  { key: "supplierIban", label: "IBAN", fieldType: "iban", source: "cabinet", sourceKey: "cabinet.iban", group: "supplier", order: 3, required: true, width: "full" },
  { key: "supplierDirector", label: "В особі", fieldType: "text", source: "cabinet", sourceKey: "cabinet.director", group: "supplier", order: 4, required: true, width: "half" },
  
  // === BUYER ===
  { key: "buyerName", label: "Покупець", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "buyerCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "contractor", sourceKey: "contractor.code", group: "buyer", order: 2, required: true, width: "half" },
  { key: "buyerIban", label: "IBAN", fieldType: "iban", source: "contractor", sourceKey: "contractor.iban", group: "buyer", order: 3, required: false, width: "full" },
  { key: "buyerDirector", label: "В особі", fieldType: "text", source: "contractor", sourceKey: "contractor.director", group: "buyer", order: 4, required: false, width: "half" },
  
  // === TERMS ===
  { key: "goodsDescription", label: "Товар", fieldType: "textarea", source: "manual", group: "terms", order: 1, required: true, width: "full", placeholder: "Найменування та характеристики товару" },
  { key: "totalPrice", label: "Загальна вартість", fieldType: "currency", source: "manual", group: "terms", order: 2, required: true, width: "half" },
  { key: "deliveryTerms", label: "Умови поставки", fieldType: "select", source: "manual", group: "terms", order: 3, required: true, width: "half",
    options: [
      { value: "exw", label: "EXW (самовивіз)" },
      { value: "dap", label: "DAP (доставка до адреси)" },
      { value: "dpu", label: "DPU (доставка з розвантаженням)" },
      { value: "fca", label: "FCA (перевізнику)" },
    ]
  },
  { key: "deliveryAddress", label: "Адреса доставки", fieldType: "text", source: "manual", group: "terms", order: 4, required: false, width: "full" },
  { key: "deliveryDeadline", label: "Строк поставки", fieldType: "date", source: "manual", group: "terms", order: 5, required: true, width: "half" },
  { key: "paymentTerms", label: "Умови оплати", fieldType: "select", source: "manual", group: "terms", order: 6, required: true, width: "half",
    options: [
      { value: "prepaid-100", label: "100% передоплата" },
      { value: "prepaid-50", label: "50% аванс" },
      { value: "postpaid", label: "Післяплата" },
      { value: "letter-of-credit", label: "Акредитив" },
    ]
  },
  { key: "validFrom", label: "Діє з", fieldType: "date", source: "manual", group: "terms", order: 7, required: true, width: "half" },
  { key: "validUntil", label: "Діє до", fieldType: "date", source: "manual", group: "terms", order: 8, required: false, width: "half" },
];

// Договір з ФОП-підрядником (fop-service-contract)
export const fopContractFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "№ договору", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "city", label: "Місто", fieldType: "text", source: "manual", group: "header", order: 2, required: true, width: "half", defaultValue: "м. Київ" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 3, required: true, width: "half" },
  
  // === CLIENT ===
  { key: "clientName", label: "Замовник", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "clientCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  { key: "clientIban", label: "IBAN", fieldType: "iban", source: "cabinet", sourceKey: "cabinet.iban", group: "supplier", order: 3, required: true, width: "full" },
  { key: "clientDirector", label: "В особі", fieldType: "text", source: "cabinet", sourceKey: "cabinet.director", group: "supplier", order: 4, required: true, width: "half" },
  
  // === FOP CONTRACTOR ===
  { key: "fopName", label: "ФОП-виконавець", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "fopIpn", label: "ІПН", fieldType: "ipn", source: "contractor", sourceKey: "contractor.code", group: "buyer", order: 2, required: true, width: "half" },
  { key: "fopIban", label: "IBAN", fieldType: "iban", source: "contractor", sourceKey: "contractor.iban", group: "buyer", order: 3, required: true, width: "full" },
  { key: "fopAddress", label: "Адреса реєстрації", fieldType: "text", source: "contractor", sourceKey: "contractor.address", group: "buyer", order: 4, required: false, width: "full" },
  { key: "fopGroup", label: "Група ЄП", fieldType: "select", source: "manual", group: "buyer", order: 5, required: true, width: "half",
    options: [
      { value: "group-3", label: "3 група (5%)" },
      { value: "group-2", label: "2 група" },
      { value: "general", label: "Загальна система" },
    ]
  },
  
  // === TERMS ===
  { key: "servicesDescription", label: "Перелік послуг", fieldType: "textarea", source: "manual", group: "terms", order: 1, required: true, width: "full", placeholder: "Детальний опис послуг, що надаватимуться" },
  { key: "monthlyFee", label: "Щомісячна оплата", fieldType: "currency", source: "manual", group: "terms", order: 2, required: true, width: "half" },
  { key: "paymentDay", label: "День оплати", fieldType: "select", source: "manual", group: "terms", order: 3, required: false, width: "half",
    options: [
      { value: "5", label: "До 5 числа" },
      { value: "10", label: "До 10 числа" },
      { value: "last", label: "Останній день місяця" },
    ]
  },
  { key: "workSchedule", label: "Графік роботи", fieldType: "text", source: "manual", group: "terms", order: 4, required: false, width: "full", placeholder: "Пн-Пт, 09:00-18:00" },
  { key: "validFrom", label: "Діє з", fieldType: "date", source: "manual", group: "terms", order: 5, required: true, width: "half" },
  { key: "validUntil", label: "Діє до", fieldType: "date", source: "manual", group: "terms", order: 6, required: false, width: "half" },
];

// ============= HR DOCUMENTS =============

// Наказ про прийняття (employment-order)
export const employmentOrderFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Наказ №", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  
  // === COMPANY ===
  { key: "companyName", label: "Підприємство", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "companyCode", label: "ЄДРПОУ", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  { key: "director", label: "Директор", fieldType: "text", source: "cabinet", sourceKey: "cabinet.director", group: "supplier", order: 3, required: true, width: "half" },
  
  // === EMPLOYEE ===
  { key: "employeeName", label: "ПІБ працівника", fieldType: "employee", source: "employee", group: "employee", order: 1, required: true, width: "full" },
  { key: "employeeIpn", label: "РНОКПП (ІПН)", fieldType: "ipn", source: "employee", group: "employee", order: 2, required: true, width: "half" },
  { key: "employeeBirthDate", label: "Дата народження", fieldType: "date", source: "employee", group: "employee", order: 3, required: false, width: "half" },
  
  // === POSITION DETAILS ===
  { key: "position", label: "Посада", fieldType: "text", source: "manual", group: "terms", order: 1, required: true, width: "half" },
  { key: "department", label: "Підрозділ", fieldType: "text", source: "manual", group: "terms", order: 2, required: false, width: "half" },
  { key: "startDate", label: "Дата початку роботи", fieldType: "date", source: "manual", group: "terms", order: 3, required: true, width: "half" },
  { key: "contractType", label: "Тип договору", fieldType: "select", source: "manual", group: "terms", order: 4, required: true, width: "half",
    options: [
      { value: "permanent", label: "Безстроковий" },
      { value: "fixed-term", label: "Строковий" },
      { value: "temporary", label: "Тимчасовий" },
    ]
  },
  { key: "salary", label: "Посадовий оклад", fieldType: "currency", source: "manual", group: "terms", order: 5, required: true, width: "half" },
  { key: "probationPeriod", label: "Випробувальний термін", fieldType: "select", source: "manual", group: "terms", order: 6, required: false, width: "half",
    options: [
      { value: "none", label: "Без випробування" },
      { value: "1-month", label: "1 місяць" },
      { value: "3-months", label: "3 місяці" },
    ]
  },
  { key: "workSchedule", label: "Режим роботи", fieldType: "select", source: "manual", group: "terms", order: 7, required: false, width: "half",
    options: [
      { value: "full-time", label: "Повний робочий день" },
      { value: "part-time", label: "Неповний день" },
      { value: "shift", label: "Змінний графік" },
      { value: "remote", label: "Дистанційна робота" },
    ]
  },
  { key: "basis", label: "Підстава", fieldType: "text", source: "manual", group: "terms", order: 8, required: true, width: "full", defaultValue: "Заява працівника" },
];

// Наказ про звільнення (dismissal-order)
export const dismissalOrderFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Наказ №", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  
  // === COMPANY ===
  { key: "companyName", label: "Підприємство", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "director", label: "Директор", fieldType: "text", source: "cabinet", sourceKey: "cabinet.director", group: "supplier", order: 2, required: true, width: "half" },
  
  // === EMPLOYEE ===
  { key: "employeeName", label: "ПІБ працівника", fieldType: "employee", source: "employee", group: "employee", order: 1, required: true, width: "full" },
  { key: "position", label: "Посада", fieldType: "text", source: "employee", group: "employee", order: 2, required: true, width: "half" },
  { key: "department", label: "Підрозділ", fieldType: "text", source: "employee", group: "employee", order: 3, required: false, width: "half" },
  
  // === DISMISSAL DETAILS ===
  { key: "dismissalDate", label: "Дата звільнення", fieldType: "date", source: "manual", group: "terms", order: 1, required: true, width: "half" },
  { key: "lastWorkDay", label: "Останній робочий день", fieldType: "date", source: "manual", group: "terms", order: 2, required: true, width: "half" },
  { key: "dismissalReason", label: "Підстава звільнення", fieldType: "select", source: "manual", group: "terms", order: 3, required: true, width: "full",
    options: [
      { value: "own-will", label: "За власним бажанням (ст. 38 КЗпП)" },
      { value: "agreement", label: "За угодою сторін (п.1 ст.36 КЗпП)" },
      { value: "end-of-contract", label: "Закінчення строку договору (п.2 ст.36 КЗпП)" },
      { value: "transfer", label: "Переведення (п.5 ст.36 КЗпП)" },
      { value: "redundancy", label: "Скорочення штату (п.1 ст.40 КЗпП)" },
      { value: "disciplinary", label: "Дисциплінарне стягнення (п.3 ст.40 КЗпП)" },
    ]
  },
  { key: "compensations", label: "Компенсації", fieldType: "textarea", source: "manual", group: "terms", order: 4, required: false, width: "full", placeholder: "Компенсація невикористаної відпустки тощо" },
  { key: "basis", label: "Підстава (документ)", fieldType: "text", source: "manual", group: "terms", order: 5, required: true, width: "full", placeholder: "Заява працівника від дата" },
];

// Наказ про відпустку (vacation-order)
export const vacationOrderFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Наказ №", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  
  // === COMPANY ===
  { key: "companyName", label: "Підприємство", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "director", label: "Директор", fieldType: "text", source: "cabinet", sourceKey: "cabinet.director", group: "supplier", order: 2, required: true, width: "half" },
  
  // === EMPLOYEE ===
  { key: "employeeName", label: "ПІБ працівника", fieldType: "employee", source: "employee", group: "employee", order: 1, required: true, width: "full" },
  { key: "position", label: "Посада", fieldType: "text", source: "employee", group: "employee", order: 2, required: true, width: "half" },
  { key: "department", label: "Підрозділ", fieldType: "text", source: "employee", group: "employee", order: 3, required: false, width: "half" },
  
  // === VACATION DETAILS ===
  { key: "vacationType", label: "Вид відпустки", fieldType: "select", source: "manual", group: "terms", order: 1, required: true, width: "full",
    options: [
      { value: "annual", label: "Щорічна основна" },
      { value: "annual-additional", label: "Щорічна додаткова" },
      { value: "unpaid", label: "Без збереження зарплати" },
      { value: "sick", label: "У зв'язку з хворобою" },
      { value: "maternity", label: "У зв'язку з вагітністю та пологами" },
      { value: "childcare", label: "По догляду за дитиною" },
      { value: "study", label: "Навчальна" },
      { value: "creative", label: "Творча" },
    ]
  },
  { key: "startDate", label: "Дата початку", fieldType: "date", source: "manual", group: "terms", order: 2, required: true, width: "half" },
  { key: "endDate", label: "Дата закінчення", fieldType: "date", source: "manual", group: "terms", order: 3, required: true, width: "half" },
  { key: "daysCount", label: "Кількість календарних днів", fieldType: "number", source: "computed", computeFormula: "DATEDIFF(endDate, startDate) + 1", group: "terms", order: 4, required: true, width: "half" },
  { key: "workingYear", label: "За робочий рік", fieldType: "text", source: "manual", group: "terms", order: 5, required: false, width: "half", placeholder: "з дата по дата" },
  { key: "vacationPay", label: "Відпускні", fieldType: "checkbox", source: "manual", group: "terms", order: 6, required: false, width: "half", defaultValue: true },
  { key: "basis", label: "Підстава", fieldType: "text", source: "manual", group: "terms", order: 7, required: true, width: "full", defaultValue: "Заява працівника" },
];

// ============= OTHER DOCUMENTS =============

// Довіреність (power-of-attorney)
export const powerOfAttorneyFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Довіреність №", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "city", label: "Місто", fieldType: "text", source: "manual", group: "header", order: 2, required: true, width: "half", defaultValue: "м. Київ" },
  { key: "documentDate", label: "Дата видачі", fieldType: "date", source: "manual", group: "header", order: 3, required: true, width: "half" },
  { key: "validUntil", label: "Дійсна до", fieldType: "date", source: "manual", group: "header", order: 4, required: true, width: "half" },
  
  // === PRINCIPAL ===
  { key: "principalName", label: "Довіритель", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "principalCode", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  { key: "principalAddress", label: "Адреса", fieldType: "text", source: "cabinet", sourceKey: "cabinet.legalAddress", group: "supplier", order: 3, required: true, width: "full" },
  { key: "principalDirector", label: "В особі", fieldType: "text", source: "cabinet", sourceKey: "cabinet.director", group: "supplier", order: 4, required: true, width: "half" },
  
  // === AGENT ===
  { key: "agentName", label: "Уповноважена особа (ПІБ)", fieldType: "text", source: "manual", group: "buyer", order: 1, required: true, width: "full" },
  { key: "agentIpn", label: "РНОКПП (ІПН)", fieldType: "ipn", source: "manual", group: "buyer", order: 2, required: true, width: "half" },
  { key: "agentPassport", label: "Паспорт", fieldType: "text", source: "manual", group: "buyer", order: 3, required: false, width: "half", placeholder: "Серія, номер" },
  { key: "agentAddress", label: "Адреса реєстрації", fieldType: "text", source: "manual", group: "buyer", order: 4, required: false, width: "full" },
  
  // === POWERS ===
  { key: "powers", label: "Повноваження", fieldType: "textarea", source: "manual", group: "terms", order: 1, required: true, width: "full", placeholder: "Перелік повноважень..." },
  { key: "powerScope", label: "Обсяг повноважень", fieldType: "select", source: "manual", group: "terms", order: 2, required: false, width: "half",
    options: [
      { value: "full", label: "Повні повноваження" },
      { value: "limited", label: "Обмежені повноваження" },
      { value: "one-time", label: "Разова довіреність" },
    ]
  },
  { key: "rightToSubstitute", label: "Право передоручення", fieldType: "checkbox", source: "manual", group: "terms", order: 3, required: false, width: "half" },
];

// Акт звірки (reconciliation)
export const reconciliationFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Акт звірки №", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  { key: "periodStart", label: "Період з", fieldType: "date", source: "manual", group: "header", order: 3, required: true, width: "half" },
  { key: "periodEnd", label: "Період по", fieldType: "date", source: "manual", group: "header", order: 4, required: true, width: "half" },
  
  // === PARTY 1 ===
  { key: "party1Name", label: "Сторона 1", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "party1Code", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  
  // === PARTY 2 ===
  { key: "party2Name", label: "Сторона 2", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "party2Code", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "contractor", sourceKey: "contractor.code", group: "buyer", order: 2, required: true, width: "half" },
  
  // === BALANCES ===
  { key: "openingBalance", label: "Сальдо на початок періоду", fieldType: "currency", source: "manual", group: "totals", order: 1, required: true, width: "half" },
  { key: "totalDebit", label: "Обороти дебет", fieldType: "currency", source: "manual", group: "totals", order: 2, required: true, width: "half" },
  { key: "totalCredit", label: "Обороти кредит", fieldType: "currency", source: "manual", group: "totals", order: 3, required: true, width: "half" },
  { key: "closingBalance", label: "Сальдо на кінець періоду", fieldType: "currency", source: "computed", computeFormula: "openingBalance + totalDebit - totalCredit", group: "totals", order: 4, required: true, width: "half" },
  { key: "balanceHolder", label: "Заборгованість на користь", fieldType: "select", source: "manual", group: "totals", order: 5, required: false, width: "half",
    options: [
      { value: "party1", label: "Сторони 1" },
      { value: "party2", label: "Сторони 2" },
      { value: "none", label: "Відсутня" },
    ]
  },
];

// ============= TAX INVOICE (ПДВ) =============

export const taxInvoiceFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Номер ПН", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата складання", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  { key: "taxInvoiceNumber", label: "Реєстраційний № в ЄРПН", fieldType: "text", source: "manual", group: "header", order: 3, required: false, width: "half" },
  { key: "registrationDate", label: "Дата реєстрації", fieldType: "date", source: "manual", group: "header", order: 4, required: false, width: "half" },
  
  // === SELLER ===
  { key: "sellerName", label: "Продавець", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "sellerIpn", label: "ІПН продавця", fieldType: "ipn", source: "cabinet", sourceKey: "cabinet.ipn", group: "supplier", order: 2, required: true, width: "half" },
  { key: "sellerAddress", label: "Місцезнаходження", fieldType: "text", source: "cabinet", sourceKey: "cabinet.legalAddress", group: "supplier", order: 3, required: true, width: "full" },
  
  // === BUYER ===
  { key: "buyerName", label: "Покупець", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "buyerIpn", label: "ІПН покупця", fieldType: "ipn", source: "contractor", sourceKey: "contractor.ipn", group: "buyer", order: 2, required: true, width: "half" },
  { key: "buyerAddress", label: "Місцезнаходження", fieldType: "text", source: "contractor", sourceKey: "contractor.address", group: "buyer", order: 3, required: true, width: "full" },
  
  // === POSITIONS ===
  { key: "positions", label: "Номенклатура", fieldType: "positions", source: "manual", group: "positions", order: 1, required: true, width: "full" },
  
  // === TOTALS ===
  { key: "subtotal", label: "Загальна сума без ПДВ", fieldType: "currency", source: "computed", computeFormula: "SUM(positions.amount)", group: "totals", order: 1, required: true, width: "third" },
  { key: "vatAmount", label: "ПДВ 20%", fieldType: "currency", source: "computed", computeFormula: "subtotal * 0.2", group: "totals", order: 2, required: true, width: "third" },
  { key: "total", label: "Загальна сума з ПДВ", fieldType: "currency", source: "computed", computeFormula: "subtotal + vatAmount", group: "totals", order: 3, required: true, width: "third" },
  
  // === SPECIAL ===
  { key: "operationType", label: "Вид операції", fieldType: "select", source: "manual", group: "terms", order: 1, required: true, width: "half",
    options: [
      { value: "sale", label: "Постачання товарів/послуг" },
      { value: "return", label: "Повернення товарів" },
      { value: "adjustment", label: "Коригування" },
    ]
  },
  { key: "uktZedCode", label: "Код УКТ ЗЕД", fieldType: "text", source: "manual", group: "terms", order: 2, required: false, width: "half", placeholder: "0000 00 00 00" },
];

export const taxInvoicePositionColumns: PositionColumn[] = [
  { key: "lineNumber", label: "№", type: "number", width: "w-10", required: true, editable: false },
  { key: "name", label: "Номенклатура постачання", type: "combobox", width: "flex-1 min-w-[200px]", required: true, editable: true },
  { key: "uktZed", label: "Код УКТ ЗЕД", type: "text", width: "w-28", required: false, editable: true },
  { key: "unit", label: "Од.", type: "select", width: "w-16", required: true, editable: true,
    options: [{ value: "шт", label: "шт" }, { value: "послуга", label: "послуга" }, { value: "кг", label: "кг" }, { value: "м", label: "м" }] },
  { key: "quantity", label: "К-ть", type: "number", width: "w-16", required: true, editable: true },
  { key: "price", label: "Ціна без ПДВ", type: "currency", width: "w-24", required: true, editable: true },
  { key: "amount", label: "Обсяг без ПДВ", type: "currency", width: "w-24", required: true, editable: false, computed: "quantity * price" },
  { key: "vatRate", label: "Ставка", type: "select", width: "w-16", required: true, editable: true, 
    options: [{ value: "20", label: "20%" }, { value: "7", label: "7%" }, { value: "0", label: "0%" }] },
  { key: "vatAmount", label: "ПДВ", type: "currency", width: "w-24", required: true, editable: false, computed: "amount * vatRate / 100" },
];

// ============= DISCREPANCY ACT (Акт розбіжностей) =============

export const discrepancyActFormSchema: FormField[] = [
  // === HEADER ===
  { key: "documentNumber", label: "Номер акту", fieldType: "text", source: "computed", group: "header", order: 1, required: true, width: "half" },
  { key: "documentDate", label: "Дата складання", fieldType: "date", source: "manual", group: "header", order: 2, required: true, width: "half" },
  { key: "parentDocument", label: "До документа", fieldType: "contract-ref", source: "manual", group: "header", order: 3, required: true, width: "full" },
  
  // === PARTIES ===
  { key: "party1Name", label: "Сторона 1 (Ми)", fieldType: "text", source: "cabinet", sourceKey: "cabinet.name", group: "supplier", order: 1, required: true, width: "full" },
  { key: "party1Code", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "cabinet", sourceKey: "cabinet.edrpou", group: "supplier", order: 2, required: true, width: "half" },
  
  { key: "party2Name", label: "Сторона 2", fieldType: "combobox", source: "contractor", sourceKey: "contractor.name", group: "buyer", order: 1, required: true, width: "full" },
  { key: "party2Code", label: "ЄДРПОУ/ІПН", fieldType: "text", source: "contractor", sourceKey: "contractor.code", group: "buyer", order: 2, required: true, width: "half" },
  
  // === DISCREPANCY DETAILS ===
  { key: "discrepancyType", label: "Тип розбіжності", fieldType: "select", source: "manual", group: "terms", order: 1, required: true, width: "half",
    options: [
      { value: "quantity", label: "Невідповідність кількості" },
      { value: "quality", label: "Невідповідність якості" },
      { value: "price", label: "Невідповідність ціни" },
      { value: "documentation", label: "Невідповідність документації" },
      { value: "delivery", label: "Порушення термінів доставки" },
    ]
  },
  { key: "discrepancyDescription", label: "Опис розбіжності", fieldType: "textarea", source: "manual", group: "terms", order: 2, required: true, width: "full" },
  { key: "expectedValue", label: "Очікуване значення", fieldType: "text", source: "manual", group: "terms", order: 3, required: true, width: "half" },
  { key: "actualValue", label: "Фактичне значення", fieldType: "text", source: "manual", group: "terms", order: 4, required: true, width: "half" },
  { key: "proposedResolution", label: "Пропоноване рішення", fieldType: "textarea", source: "manual", group: "terms", order: 5, required: false, width: "full" },
];

// ============= SCHEMA MAPPING =============

import type { DocumentType } from "./documentFlowConfig";

export const formSchemasByType: Partial<Record<DocumentType, FormField[]>> = {
  invoice: invoiceFormSchema,
  act: actFormSchema,
  waybill: waybillFormSchema,
  ttn: ttnFormSchema,
  contract: contractFormSchema,
  "supply-contract": supplyContractFormSchema,
  "fop-service-contract": fopContractFormSchema,
  "employment-order": employmentOrderFormSchema,
  "dismissal-order": dismissalOrderFormSchema,
  "vacation-order": vacationOrderFormSchema,
  "power-of-attorney": powerOfAttorneyFormSchema,
  reconciliation: reconciliationFormSchema,
  "tax-invoice": taxInvoiceFormSchema,
  "discrepancy-act": discrepancyActFormSchema,
};

export const positionColumnsByType: Partial<Record<DocumentType, PositionColumn[]>> = {
  invoice: invoicePositionColumns,
  act: actPositionColumns,
  waybill: waybillPositionColumns,
  ttn: ttnPositionColumns,
  "tax-invoice": taxInvoicePositionColumns,
};

// Helper to get form schema for a document type
export const getFormSchemaForType = (type: DocumentType): FormField[] | undefined => {
  return formSchemasByType[type];
};

// Helper to get position columns for a document type
export const getPositionColumnsForType = (type: DocumentType): PositionColumn[] | undefined => {
  return positionColumnsByType[type];
};

// Helper to get fields grouped by section
export const getFieldsByGroup = (schema: FormField[]): Record<FieldGroup, FormField[]> => {
  const groups: Record<FieldGroup, FormField[]> = {
    header: [],
    supplier: [],
    buyer: [],
    employee: [],
    positions: [],
    totals: [],
    terms: [],
    transport: [],
    signatures: [],
  };
  
  schema.forEach(field => {
    if (groups[field.group]) {
      groups[field.group].push(field);
    }
  });
  
  // Sort each group by order
  Object.keys(groups).forEach(key => {
    groups[key as FieldGroup].sort((a, b) => a.order - b.order);
  });
  
  return groups;
};

// Helper to get only cabinet-autofilled fields
export const getCabinetAutofilledFields = (schema: FormField[]): FormField[] => {
  return schema.filter(f => f.source === "cabinet");
};

// Helper to get only contractor-autofilled fields  
export const getContractorAutofilledFields = (schema: FormField[]): FormField[] => {
  return schema.filter(f => f.source === "contractor");
};

// Field group labels for UI
export const fieldGroupLabels: Record<FieldGroup, string> = {
  header: "Основна інформація",
  supplier: "Постачальник / Виконавець",
  buyer: "Покупець / Замовник",
  employee: "Дані працівника",
  positions: "Позиції",
  totals: "Підсумки",
  terms: "Умови",
  transport: "Транспорт",
  signatures: "Підписи",
};
