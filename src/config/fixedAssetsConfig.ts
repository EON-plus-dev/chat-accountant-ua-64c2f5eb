import { isDemoCabinet } from "@/config/demoCabinetsData";

// ============ Types ============

export type FixedAssetCategory = "equipment" | "transport" | "furniture" | "intangible" | "other";
export type FixedAssetStatus = "active" | "written-off" | "sold" | "under-repair";
export type DepreciationMethod = "straight-line" | "reducing-balance" | "production";
export type VehicleBodyType = "van" | "flatbed" | "dump" | "sedan" | "wagon" | "suv" | "hatchback" | "forklift";
export type VehicleFuelType = "diesel" | "petrol" | "gas" | "electric" | "hybrid";
export type VehicleInsuranceType = "osago" | "casco" | "both" | "none";
export type EquipmentEnergyClass = "A+++" | "A++" | "A+" | "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type IntangibleAssetType = "license" | "patent" | "trademark" | "copyright" | "software" | "other";
export type IntangibleTerritory = "ukraine" | "international" | "eu" | "cis";
export type WriteOffReason = "physical-wear" | "moral-wear" | "damage" | "theft" | "other";
export type InventoryResult = "found" | "missing" | "damaged";

export interface FixedAsset {
  id: string;
  name: string;
  inventoryNumber: string;
  category: FixedAssetCategory;
  purchaseDate: string;
  originalCost: number;
  residualValue: number;
  depreciationRate: number;
  usefulLifeMonths: number;
  status: FixedAssetStatus;
  location: string;
  responsiblePerson: string;
  photos?: string[];
  notes?: string;
  // Category-specific optional fields
  serialNumber?: string;    // equipment
  plateNumber?: string;     // transport
  licenseNumber?: string;   // intangible
  // New accounting fields
  salvageValue?: number;           // ліквідаційна вартість
  accountingAccount?: string;      // субрахунок обліку ("104", "105" тощо)
  taxGroup?: string;               // податкова група за ПКУ
  depreciationMethod?: DepreciationMethod;
  commissioningActNumber?: string;
  commissioningActDate?: string;
  salePrice?: number;              // ціна продажу (при статусі sold)
  // Transport-specific fields
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleVIN?: string;
  vehicleBodyType?: VehicleBodyType;
  vehicleFuelType?: VehicleFuelType;
  vehicleEngineVolume?: number;
  vehicleMileage?: number;
  vehicleColor?: string;
  vehicleInsuranceType?: VehicleInsuranceType;
  vehicleInsurancePolicyNumber?: string;
  vehicleInsuranceExpiry?: string;
  vehicleLastServiceDate?: string;
  vehicleNextServiceDate?: string;
  vehicleNextServiceMileage?: number;
  // Equipment-specific fields
  equipmentBrand?: string;
  equipmentModel?: string;
  equipmentPassportNumber?: string;
  equipmentCalibrationDate?: string;
  equipmentNextCalibrationDate?: string;
  equipmentCalibrationInterval?: number;
  equipmentWarrantyExpiry?: string;
  equipmentPowerKw?: number;
  equipmentVoltage?: number;
  equipmentEnergyClass?: EquipmentEnergyClass;
  equipmentManufactureYear?: number;
  equipmentOperatingHours?: number;
  // Intangible-specific fields
  intangibleType?: IntangibleAssetType;
  intangibleCertificateNumber?: string;
  intangibleRegistrationDate?: string;
  intangibleExpiryDate?: string;
  intangibleTerritory?: IntangibleTerritory;
  intangibleAuthor?: string;
  intangibleRightsHolder?: string;
  intangibleRegistrationAuthority?: string;
  intangibleClassification?: string;
  // Write-off fields
  writeOffDate?: string;
  writeOffReason?: WriteOffReason;
  writeOffActNumber?: string;
  writeOffCommission?: string;
  // Sale fields
  saleDate?: string;
  saleBuyer?: string;
  saleContractNumber?: string;
  // Inventory fields
  lastInventoryDate?: string;
  lastInventoryResult?: InventoryResult;
}

// ============ Labels & Colors ============

export const fixedAssetCategoryLabels: Record<FixedAssetCategory, string> = {
  equipment: "Обладнання",
  transport: "Транспорт",
  furniture: "Меблі",
  intangible: "Нематеріальні",
  other: "Інше",
};

export const fixedAssetCategoryColors: Record<FixedAssetCategory, string> = {
  equipment: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  transport: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  furniture: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  intangible: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export const fixedAssetStatusLabels: Record<FixedAssetStatus, string> = {
  active: "Активний",
  "written-off": "Списаний",
  sold: "Проданий",
  "under-repair": "На ремонті",
};

export const fixedAssetStatusColors: Record<FixedAssetStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "written-off": "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  sold: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  "under-repair": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

// ============ Accounting Dictionaries ============

export const accountingAccountLabels: Record<string, string> = {
  "104": "Машини та обладнання",
  "105": "Транспортні засоби",
  "106": "Інструменти, прилади та інвентар",
  "109": "Інші основні засоби",
  "111": "Бібліотечні фонди",
  "112": "Малоцінні необоротні матеріальні активи",
  "121": "Права користування природними ресурсами",
  "122": "Права користування майном",
  "125": "Авторське право та суміжні з ним права",
  "127": "Інші нематеріальні активи",
};

export const taxGroupLabels: Record<string, string> = {
  "1": "Група 1 — Земельні ділянки (не амортизується)",
  "2": "Група 2 — Капітальні витрати на поліпшення земель (15 років)",
  "3": "Група 3 — Будівлі, споруди (20 років)",
  "4": "Група 4 — Машини та обладнання (5 років)",
  "5": "Група 5 — Транспортні засоби (5 років)",
  "6": "Група 6 — Інструменти, прилади (4 роки)",
  "7": "Група 7 — Тварини (6 років)",
  "8": "Група 8 — Багаторічні насадження (10 років)",
  "9": "Група 9 — Інші ОЗ (12 років)",
  "10": "Група 10 — Бібліотечні фонди (не амортизується)",
  "11": "Група 11 — МНМА (не амортизується)",
  "12": "Група 12 — Тимчасові нетитульні споруди (5 років)",
  "13": "Група 13 — Природні ресурси (не амортизується)",
  "14": "Група 14 — Інвентарна тара (6 років)",
  "15": "Група 15 — Предмети прокату (5 років)",
  "16": "Група 16 — Довгострокові біологічні активи (7 років)",
};

export const depreciationMethodLabels: Record<DepreciationMethod, string> = {
  "straight-line": "Прямолінійний",
  "reducing-balance": "Зменшення залишкової вартості",
  "production": "Виробничий",
};

export const vehicleBodyTypeLabels: Record<VehicleBodyType, string> = {
  van: "Фургон",
  flatbed: "Бортовий",
  dump: "Самоскид",
  sedan: "Седан",
  wagon: "Універсал",
  suv: "Позашляховик",
  hatchback: "Хетчбек",
  forklift: "Навантажувач",
};

export const vehicleFuelTypeLabels: Record<VehicleFuelType, string> = {
  diesel: "Дизель",
  petrol: "Бензин",
  gas: "Газ (LPG/CNG)",
  electric: "Електро",
  hybrid: "Гібрид",
};

export const vehicleInsuranceTypeLabels: Record<VehicleInsuranceType, string> = {
  osago: "ОСЦПВ (автоцивілка)",
  casco: "КАСКО",
  both: "ОСЦПВ + КАСКО",
  none: "Без страховки",
};

export const equipmentEnergyClassLabels: Record<EquipmentEnergyClass, string> = {
  "A+++": "A+++ (найвища)",
  "A++": "A++",
  "A+": "A+",
  "A": "A",
  "B": "B",
  "C": "C",
  "D": "D",
  "E": "E",
  "F": "F",
  "G": "G (найнижча)",
};

export const intangibleAssetTypeLabels: Record<IntangibleAssetType, string> = {
  license: "Ліцензія",
  patent: "Патент",
  trademark: "Торговельна марка",
  copyright: "Авторське право",
  software: "Програмне забезпечення",
  other: "Інше",
};

export const intangibleTerritoryLabels: Record<IntangibleTerritory, string> = {
  ukraine: "Україна",
  international: "Міжнародний",
  eu: "ЄС",
  cis: "СНД",
};

export const writeOffReasonLabels: Record<WriteOffReason, string> = {
  "physical-wear": "Фізичний знос",
  "moral-wear": "Моральний знос",
  damage: "Пошкодження / аварія",
  theft: "Крадіжка",
  other: "Інше",
};

export const inventoryResultLabels: Record<InventoryResult, string> = {
  found: "Наявний",
  missing: "Відсутній",
  damaged: "Пошкоджений",
};

export const categoryToAccountMapping: Record<FixedAssetCategory, { account: string; taxGroup: string }> = {
  equipment: { account: "104", taxGroup: "4" },
  transport: { account: "105", taxGroup: "5" },
  furniture: { account: "106", taxGroup: "6" },
  intangible: { account: "127", taxGroup: "5" },
  other: { account: "109", taxGroup: "9" },
};

// ============ Categories for Select ============

export const fixedAssetCategories: { value: FixedAssetCategory; label: string }[] = [
  { value: "equipment", label: "Обладнання" },
  { value: "transport", label: "Транспорт" },
  { value: "furniture", label: "Меблі" },
  { value: "intangible", label: "Нематеріальні" },
  { value: "other", label: "Інше" },
];

// ============ Category Defaults ============

export const categoryDefaults: Record<FixedAssetCategory, { depreciationRate: number; usefulLifeMonths: number }> = {
  equipment: { depreciationRate: 20, usefulLifeMonths: 60 },
  transport: { depreciationRate: 20, usefulLifeMonths: 60 },
  furniture: { depreciationRate: 25, usefulLifeMonths: 48 },
  intangible: { depreciationRate: 50, usefulLifeMonths: 24 },
  other: { depreciationRate: 15, usefulLifeMonths: 84 },
};

export function generateNextInventoryNumber(existingAssets: FixedAsset[]): string {
  const nums = existingAssets
    .map(a => a.inventoryNumber.match(/ОЗ-(\d+)/)?.[1])
    .filter(Boolean)
    .map(Number);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `ОЗ-${String(next).padStart(5, "0")}`;
}

// ============ Utilities ============

export function calculateWearPercent(asset: FixedAsset): number {
  if (asset.originalCost <= 0) return 0;
  const wear = ((asset.originalCost - asset.residualValue) / asset.originalCost) * 100;
  return Math.min(100, Math.max(0, Math.round(wear)));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + " ₴";
}

/** Calculate residual value based on straight-line depreciation */
export function calculateResidualValue(asset: FixedAsset): number {
  const salvage = asset.salvageValue ?? 0;
  const depreciableAmount = asset.originalCost - salvage;
  if (depreciableAmount <= 0) return asset.originalCost;

  const startDate = new Date(asset.purchaseDate);
  const now = new Date();
  const monthsElapsed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  const effectiveMonths = Math.max(0, Math.min(monthsElapsed, asset.usefulLifeMonths));

  const monthlyDepreciation = depreciableAmount / asset.usefulLifeMonths;
  const totalDepreciation = monthlyDepreciation * effectiveMonths;

  return Math.max(salvage, Math.round(asset.originalCost - totalDepreciation));
}

/** Calculate monthly depreciation amount */
export function calculateMonthlyDepreciation(asset: FixedAsset): number {
  const salvage = asset.salvageValue ?? 0;
  const depreciableAmount = asset.originalCost - salvage;
  if (depreciableAmount <= 0 || asset.usefulLifeMonths <= 0) return 0;
  return Math.round(depreciableAmount / asset.usefulLifeMonths);
}

/** Calculate remaining useful life in months */
export function calculateRemainingMonths(asset: FixedAsset): number {
  const startDate = new Date(asset.purchaseDate);
  const now = new Date();
  const monthsElapsed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  return Math.max(0, asset.usefulLifeMonths - monthsElapsed);
}

/** Calculate expected depreciation end date */
export function calculateDepreciationEndDate(asset: FixedAsset): string {
  const startDate = new Date(asset.purchaseDate);
  startDate.setMonth(startDate.getMonth() + asset.usefulLifeMonths);
  return startDate.toISOString().split("T")[0];
}

// ============ Demo Data ============

const consultingAssets: FixedAsset[] = [
  { id: "fa-c-1", name: "MacBook Pro 16\" M3 Max", inventoryNumber: "ОЗ-00001", category: "equipment", purchaseDate: "2024-03-15", originalCost: 145000, residualValue: 116000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Офіс, кімн. 301", responsiblePerson: "Коваленко М.В.", serialNumber: "C02ZN1MDLVDM", salvageValue: 14500, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-01/2024", commissioningActDate: "2024-03-15", equipmentBrand: "Apple", equipmentModel: "MacBook Pro 16\" M3 Max", equipmentManufactureYear: 2024, equipmentPowerKw: 0.14, equipmentVoltage: 220, equipmentWarrantyExpiry: "2027-03-15" },
  { id: "fa-c-2", name: "Монітор Dell U2723QE 27\"", inventoryNumber: "ОЗ-00002", category: "equipment", purchaseDate: "2024-03-15", originalCost: 28500, residualValue: 22800, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Офіс, кімн. 301", responsiblePerson: "Коваленко М.В.", serialNumber: "CN-0F7HMR-FCC00", salvageValue: 2850, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-02/2024", commissioningActDate: "2024-03-15", equipmentBrand: "Dell", equipmentModel: "U2723QE", equipmentManufactureYear: 2024, equipmentPowerKw: 0.03, equipmentVoltage: 220, equipmentEnergyClass: "A", equipmentWarrantyExpiry: "2027-03-15" },
  { id: "fa-c-3", name: "Крісло Herman Miller Aeron", inventoryNumber: "ОЗ-00003", category: "furniture", purchaseDate: "2023-09-01", originalCost: 52000, residualValue: 39000, depreciationRate: 25, usefulLifeMonths: 48, status: "active", location: "Офіс, кімн. 301", responsiblePerson: "Петренко О.І.", salvageValue: 5200, accountingAccount: "106", taxGroup: "6", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-03/2023", commissioningActDate: "2023-09-01" },
  { id: "fa-c-4", name: "МФУ HP LaserJet Pro M428", inventoryNumber: "ОЗ-00004", category: "equipment", purchaseDate: "2023-06-10", originalCost: 18500, residualValue: 11100, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Офіс, приймальня", responsiblePerson: "Сидоренко І.П.", serialNumber: "VNB3K42017", salvageValue: 1850, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-04/2023", commissioningActDate: "2023-06-10", equipmentBrand: "HP", equipmentModel: "LaserJet Pro M428", equipmentManufactureYear: 2023, equipmentPowerKw: 0.72, equipmentVoltage: 220, equipmentEnergyClass: "B", equipmentWarrantyExpiry: "2025-06-10" },
  { id: "fa-c-5", name: "Ліцензія Microsoft 365 Business", inventoryNumber: "НА-00001", category: "intangible", purchaseDate: "2024-01-01", originalCost: 12000, residualValue: 6000, depreciationRate: 50, usefulLifeMonths: 24, status: "active", location: "—", responsiblePerson: "Коваленко М.В.", licenseNumber: "MS365-BUS-2024-0412", salvageValue: 0, accountingAccount: "127", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "НА-01/2024", commissioningActDate: "2024-01-01", intangibleType: "license", intangibleCertificateNumber: "MS365-BUS-2024-0412", intangibleRegistrationDate: "2024-01-01", intangibleExpiryDate: "2026-01-01", intangibleTerritory: "international", intangibleRightsHolder: "Microsoft Corporation" },
];

const autoRepairAssets: FixedAsset[] = [
  { id: "fa-a-1", name: "Підйомник двостійковий 4т", inventoryNumber: "ОЗ-00001", category: "equipment", purchaseDate: "2022-05-20", originalCost: 185000, residualValue: 111000, depreciationRate: 15, usefulLifeMonths: 84, status: "active", location: "Бокс №1", responsiblePerson: "Мельник С.А.", serialNumber: "PD4T-2022-0847", salvageValue: 18500, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-01/2022", commissioningActDate: "2022-05-20", equipmentBrand: "Launch", equipmentModel: "TLT240SC", equipmentManufactureYear: 2022, equipmentPowerKw: 2.2, equipmentVoltage: 380, equipmentPassportNumber: "ТП-PD4T-2022-0847", equipmentWarrantyExpiry: "2025-05-20", equipmentCalibrationDate: "2025-06-15", equipmentNextCalibrationDate: "2026-06-15", equipmentCalibrationInterval: 12 },
  { id: "fa-a-2", name: "Компресор Atlas Copco GA5", inventoryNumber: "ОЗ-00002", category: "equipment", purchaseDate: "2022-05-20", originalCost: 95000, residualValue: 57000, depreciationRate: 15, usefulLifeMonths: 84, status: "active", location: "Бокс №2", responsiblePerson: "Мельник С.А.", serialNumber: "AC-GA5-AIF-287456", salvageValue: 9500, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-02/2022", commissioningActDate: "2022-05-20", equipmentBrand: "Atlas Copco", equipmentModel: "GA5", equipmentManufactureYear: 2022, equipmentPowerKw: 5.5, equipmentVoltage: 380, equipmentEnergyClass: "A", equipmentPassportNumber: "ТП-AC-GA5-287456", equipmentOperatingHours: 8500, equipmentWarrantyExpiry: "2025-05-20" },
  { id: "fa-a-3", name: "Ford Transit Custom 2021", inventoryNumber: "ОЗ-00003", category: "transport", purchaseDate: "2021-11-10", originalCost: 820000, residualValue: 410000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Паркінг", responsiblePerson: "Бондар В.М.", plateNumber: "АА 1234 ВВ", salvageValue: 82000, accountingAccount: "105", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-03/2021", commissioningActDate: "2021-11-10", vehicleBrand: "Ford", vehicleModel: "Transit Custom", vehicleYear: 2021, vehicleVIN: "WF0XXXGCDX1A12345", vehicleBodyType: "van", vehicleFuelType: "diesel", vehicleEngineVolume: 2.0, vehicleMileage: 87500, vehicleColor: "Білий", vehicleInsuranceType: "osago", vehicleInsurancePolicyNumber: "АА/1234567", vehicleInsuranceExpiry: "2026-05-15", vehicleLastServiceDate: "2025-10-20", vehicleNextServiceDate: "2026-04-20", vehicleNextServiceMileage: 100000 },
  { id: "fa-a-4", name: "Діагностичний сканер Autel MaxiSys", inventoryNumber: "ОЗ-00004", category: "equipment", purchaseDate: "2023-02-15", originalCost: 75000, residualValue: 56250, depreciationRate: 25, usefulLifeMonths: 48, status: "active", location: "Бокс №1", responsiblePerson: "Ткаченко Д.О.", serialNumber: "MS909-UA-2023-1542", salvageValue: 7500, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-04/2023", commissioningActDate: "2023-02-15", equipmentBrand: "Autel", equipmentModel: "MaxiSys MS909", equipmentManufactureYear: 2023, equipmentPowerKw: 0.05, equipmentVoltage: 220, equipmentWarrantyExpiry: "2026-02-15", equipmentCalibrationDate: "2025-08-01", equipmentNextCalibrationDate: "2026-08-01", equipmentCalibrationInterval: 12 },
  { id: "fa-a-5", name: "Шиномонтажний верстат", inventoryNumber: "ОЗ-00005", category: "equipment", purchaseDate: "2020-03-01", originalCost: 42000, residualValue: 8400, depreciationRate: 15, usefulLifeMonths: 84, status: "under-repair", location: "Бокс №3", responsiblePerson: "Мельник С.А.", notes: "Потребує заміни електромотора", serialNumber: "SHV-2020-003", salvageValue: 4200, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-05/2020", commissioningActDate: "2020-03-01", equipmentBrand: "Sicam", equipmentModel: "SBM V550", equipmentManufactureYear: 2020, equipmentPowerKw: 1.1, equipmentVoltage: 220, equipmentPassportNumber: "ТП-SHV-2020-003", equipmentWarrantyExpiry: "2023-03-01" },
  { id: "fa-a-6", name: "Стелаж металевий 2000x1000", inventoryNumber: "ОЗ-00006", category: "furniture", purchaseDate: "2022-06-01", originalCost: 8500, residualValue: 5100, depreciationRate: 15, usefulLifeMonths: 84, status: "active", location: "Склад", responsiblePerson: "Бондар В.М.", salvageValue: 850, accountingAccount: "106", taxGroup: "6", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-06/2022", commissioningActDate: "2022-06-01" },
];

const itAssets: FixedAsset[] = [
  { id: "fa-i-1", name: "Сервер Dell PowerEdge R750", inventoryNumber: "ОЗ-00001", category: "equipment", purchaseDate: "2023-01-20", originalCost: 320000, residualValue: 224000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Серверна", responsiblePerson: "DevOps Team", serialNumber: "SVR-R750-2023-UA01", salvageValue: 32000, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-01/2023", commissioningActDate: "2023-01-20", equipmentBrand: "Dell", equipmentModel: "PowerEdge R750", equipmentManufactureYear: 2023, equipmentPowerKw: 0.8, equipmentVoltage: 220, equipmentPassportNumber: "ТП-SVR-R750-2023", equipmentWarrantyExpiry: "2026-01-20", equipmentOperatingHours: 15000 },
  { id: "fa-i-2", name: "MacBook Pro 14\" M2 Pro (x5)", inventoryNumber: "ОЗ-00002", category: "equipment", purchaseDate: "2023-06-01", originalCost: 475000, residualValue: 332500, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Офіс", responsiblePerson: "HR Department", serialNumber: "MBP14-BATCH-2023", salvageValue: 47500, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-02/2023", commissioningActDate: "2023-06-01", equipmentBrand: "Apple", equipmentModel: "MacBook Pro 14\" M2 Pro", equipmentManufactureYear: 2023, equipmentPowerKw: 0.096, equipmentVoltage: 220, equipmentWarrantyExpiry: "2026-06-01" },
  { id: "fa-i-3", name: "Ліцензія JetBrains All Products Pack", inventoryNumber: "НА-00001", category: "intangible", purchaseDate: "2024-01-01", originalCost: 45000, residualValue: 22500, depreciationRate: 50, usefulLifeMonths: 24, status: "active", location: "—", responsiblePerson: "CTO", licenseNumber: "JB-ALL-2024-ENT-056", salvageValue: 0, accountingAccount: "127", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "НА-01/2024", commissioningActDate: "2024-01-01", intangibleType: "license", intangibleCertificateNumber: "JB-ALL-2024-ENT-056", intangibleRegistrationDate: "2024-01-01", intangibleExpiryDate: "2026-01-01", intangibleTerritory: "international", intangibleRightsHolder: "JetBrains s.r.o." },
  { id: "fa-i-4", name: "UPS APC Smart-UPS 3000VA", inventoryNumber: "ОЗ-00003", category: "equipment", purchaseDate: "2023-01-20", originalCost: 68000, residualValue: 47600, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Серверна", responsiblePerson: "DevOps Team", serialNumber: "APC-SU3000-2023", salvageValue: 6800, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-03/2023", commissioningActDate: "2023-01-20", equipmentBrand: "APC", equipmentModel: "Smart-UPS 3000VA", equipmentManufactureYear: 2023, equipmentPowerKw: 2.7, equipmentVoltage: 220, equipmentEnergyClass: "A+", equipmentWarrantyExpiry: "2026-01-20" },
  { id: "fa-i-5", name: "Стіл регульований IKEA BEKANT (x5)", inventoryNumber: "ОЗ-00004", category: "furniture", purchaseDate: "2023-04-15", originalCost: 75000, residualValue: 56250, depreciationRate: 25, usefulLifeMonths: 48, status: "active", location: "Офіс", responsiblePerson: "Office Manager", salvageValue: 7500, accountingAccount: "106", taxGroup: "6", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-04/2023", commissioningActDate: "2023-04-15" },
];

const dealerAssets: FixedAsset[] = [
  { id: "fa-d-1", name: "Касовий апарат Datecs FP-101", inventoryNumber: "ОЗ-00001", category: "equipment", purchaseDate: "2023-08-01", originalCost: 15000, residualValue: 10500, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Торговий зал", responsiblePerson: "Продавець", serialNumber: "FP101-2023-UA-4421", salvageValue: 1500, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-01/2023", commissioningActDate: "2023-08-01", equipmentBrand: "Datecs", equipmentModel: "FP-101", equipmentManufactureYear: 2023, equipmentPowerKw: 0.02, equipmentVoltage: 220, equipmentWarrantyExpiry: "2025-08-01", equipmentCalibrationDate: "2025-07-01", equipmentNextCalibrationDate: "2026-01-01", equipmentCalibrationInterval: 6 },
  { id: "fa-d-2", name: "Стелаж торговий (x10)", inventoryNumber: "ОЗ-00002", category: "furniture", purchaseDate: "2022-01-15", originalCost: 120000, residualValue: 60000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Торговий зал", responsiblePerson: "Комірник", salvageValue: 12000, accountingAccount: "106", taxGroup: "6", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-02/2022", commissioningActDate: "2022-01-15" },
  { id: "fa-d-3", name: "Газель Next 2022", inventoryNumber: "ОЗ-00003", category: "transport", purchaseDate: "2022-04-10", originalCost: 680000, residualValue: 340000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Паркінг", responsiblePerson: "Водій", plateNumber: "КА 5678 ВС", salvageValue: 68000, accountingAccount: "105", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-03/2022", commissioningActDate: "2022-04-10", vehicleBrand: "ГАЗ", vehicleModel: "Газель Next", vehicleYear: 2022, vehicleVIN: "X96A21R32N2A00123", vehicleBodyType: "van", vehicleFuelType: "petrol", vehicleEngineVolume: 2.7, vehicleMileage: 62000, vehicleColor: "Білий", vehicleInsuranceType: "osago", vehicleInsurancePolicyNumber: "ВВ/7654321", vehicleInsuranceExpiry: "2026-04-01", vehicleLastServiceDate: "2025-12-10", vehicleNextServiceDate: "2026-06-10", vehicleNextServiceMileage: 75000 },
  { id: "fa-d-4", name: "Ваги торгові CAS SW-20", inventoryNumber: "ОЗ-00004", category: "equipment", purchaseDate: "2023-03-01", originalCost: 8500, residualValue: 6375, depreciationRate: 25, usefulLifeMonths: 48, status: "active", location: "Торговий зал", responsiblePerson: "Продавець", serialNumber: "CAS-SW20-2023-112", salvageValue: 850, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-04/2023", commissioningActDate: "2023-03-01", equipmentBrand: "CAS", equipmentModel: "SW-20", equipmentManufactureYear: 2023, equipmentPowerKw: 0.01, equipmentVoltage: 220, equipmentCalibrationDate: "2025-09-01", equipmentNextCalibrationDate: "2026-03-01", equipmentCalibrationInterval: 6, equipmentPassportNumber: "ТП-CAS-SW20-112", equipmentWarrantyExpiry: "2026-03-01" },
  { id: "fa-d-5", name: "Холодильна вітрина 2м", inventoryNumber: "ОЗ-00005", category: "equipment", purchaseDate: "2021-06-15", originalCost: 95000, residualValue: 33250, depreciationRate: 15, usefulLifeMonths: 84, status: "active", location: "Торговий зал", responsiblePerson: "Комірник", serialNumber: "HV-200-2021-078", salvageValue: 9500, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-05/2021", commissioningActDate: "2021-06-15", equipmentBrand: "Cold Line", equipmentModel: "HV-200", equipmentManufactureYear: 2021, equipmentPowerKw: 0.45, equipmentVoltage: 220, equipmentEnergyClass: "C", equipmentWarrantyExpiry: "2024-06-15", equipmentOperatingHours: 26000 },
  { id: "fa-d-6", name: "Терміналоприбутковий Ingenico", inventoryNumber: "ОЗ-00006", category: "equipment", purchaseDate: "2023-08-01", originalCost: 5500, residualValue: 0, depreciationRate: 50, usefulLifeMonths: 24, status: "written-off", location: "Торговий зал", responsiblePerson: "Продавець", notes: "Замінений на новий POS", salvageValue: 0, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", writeOffDate: "2025-08-01", writeOffReason: "moral-wear", writeOffActNumber: "АС-00000001", writeOffCommission: "Комісією встановлено, що POS-термінал морально застарів та не підтримує нові платіжні системи. Рекомендовано списання." },
];

// ============ TOV Mock Data ============

const tovRomashkaAssets: FixedAsset[] = [
  { id: "fa-tov1-1", name: "Виробнича лінія пакування", inventoryNumber: "ОЗ-00001", category: "equipment", purchaseDate: "2022-03-10", originalCost: 850000, residualValue: 595000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Цех №1", responsiblePerson: "Іваненко О.М.", serialNumber: "VL-PKG-2022-001", salvageValue: 85000, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-01/2022", commissioningActDate: "2022-03-10", equipmentBrand: "Bosch Packaging", equipmentModel: "Pack 301 LS", equipmentManufactureYear: 2022, equipmentPowerKw: 15.0, equipmentVoltage: 380, equipmentPassportNumber: "ТП-VL-PKG-2022-001", equipmentOperatingHours: 12000, equipmentWarrantyExpiry: "2025-03-10", equipmentEnergyClass: "B" },
  { id: "fa-tov1-2", name: "Фрезерний верстат ЧПУ", inventoryNumber: "ОЗ-00002", category: "equipment", purchaseDate: "2023-01-15", originalCost: 420000, residualValue: 336000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Цех №2", responsiblePerson: "Савченко Р.Д.", serialNumber: "FRZ-CNC-2023-045", salvageValue: 42000, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-02/2023", commissioningActDate: "2023-01-15", equipmentBrand: "Haas", equipmentModel: "VF-2SS", equipmentManufactureYear: 2023, equipmentPowerKw: 22.4, equipmentVoltage: 380, equipmentPassportNumber: "ТП-FRZ-CNC-045", equipmentOperatingHours: 6500, equipmentWarrantyExpiry: "2026-01-15", equipmentCalibrationDate: "2025-07-01", equipmentNextCalibrationDate: "2026-01-01", equipmentCalibrationInterval: 6 },
  { id: "fa-tov1-3", name: "Вантажівка MAN TGL 12.250", inventoryNumber: "ОЗ-00003", category: "transport", purchaseDate: "2021-08-20", originalCost: 1200000, residualValue: 720000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Автопарк", responsiblePerson: "Кравченко В.І.", plateNumber: "АІ 9012 ОС", salvageValue: 120000, accountingAccount: "105", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-03/2021", commissioningActDate: "2021-08-20", vehicleBrand: "MAN", vehicleModel: "TGL 12.250", vehicleYear: 2021, vehicleVIN: "WMAN05ZZ6CY123456", vehicleBodyType: "flatbed", vehicleFuelType: "diesel", vehicleEngineVolume: 4.6, vehicleMileage: 145000, vehicleColor: "Синій", vehicleInsuranceType: "both", vehicleInsurancePolicyNumber: "СС/9988776", vehicleInsuranceExpiry: "2026-08-20", vehicleLastServiceDate: "2025-11-01", vehicleNextServiceDate: "2026-05-01", vehicleNextServiceMileage: 160000 },
  { id: "fa-tov1-4", name: "Навантажувач Toyota 8FBE15", inventoryNumber: "ОЗ-00004", category: "transport", purchaseDate: "2022-06-01", originalCost: 580000, residualValue: 406000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Склад", responsiblePerson: "Бойко А.С.", plateNumber: "—", salvageValue: 58000, accountingAccount: "105", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-04/2022", commissioningActDate: "2022-06-01", vehicleBrand: "Toyota", vehicleModel: "8FBE15", vehicleYear: 2022, vehicleVIN: "8FBE15E00012345AB", vehicleBodyType: "forklift", vehicleFuelType: "electric", vehicleMileage: 3200, vehicleColor: "Помаранчевий", vehicleInsuranceType: "none", vehicleLastServiceDate: "2025-09-15", vehicleNextServiceDate: "2026-03-15" },
  { id: "fa-tov1-5", name: "Офісні меблі комплект", inventoryNumber: "ОЗ-00005", category: "furniture", purchaseDate: "2023-04-01", originalCost: 95000, residualValue: 71250, depreciationRate: 25, usefulLifeMonths: 48, status: "active", location: "Офіс, 2-й поверх", responsiblePerson: "Офіс-менеджер", salvageValue: 9500, accountingAccount: "106", taxGroup: "6", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-05/2023", commissioningActDate: "2023-04-01" },
  { id: "fa-tov1-6", name: "1С:Підприємство 8.3 ліцензія", inventoryNumber: "НА-00001", category: "intangible", purchaseDate: "2023-01-01", originalCost: 35000, residualValue: 8750, depreciationRate: 50, usefulLifeMonths: 24, status: "active", location: "—", responsiblePerson: "Головний бухгалтер", licenseNumber: "1C-ENT83-2023-UA-0891", salvageValue: 0, accountingAccount: "127", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "НА-01/2023", commissioningActDate: "2023-01-01", intangibleType: "software", intangibleCertificateNumber: "1C-ENT83-2023-UA-0891", intangibleRegistrationDate: "2023-01-01", intangibleTerritory: "ukraine", intangibleRightsHolder: "ТОВ «1С-Україна»" },
  { id: "fa-tov1-7", name: "Принтер Xerox WorkCentre 3345", inventoryNumber: "ОЗ-00006", category: "equipment", purchaseDate: "2020-02-01", originalCost: 14500, residualValue: 0, depreciationRate: 20, usefulLifeMonths: 60, status: "written-off", location: "Офіс", responsiblePerson: "Офіс-менеджер", notes: "Списаний у зв'язку з повним зносом", salvageValue: 0, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", writeOffDate: "2025-02-01", writeOffReason: "physical-wear", writeOffActNumber: "АС-00000002", writeOffCommission: "Принтер повністю зношений, ремонт економічно недоцільний. Комісія рекомендує списання." },
];

const tovTechPlusAssets: FixedAsset[] = [
  { id: "fa-tov3-1", name: "Серверна стійка HPE ProLiant DL380", inventoryNumber: "ОЗ-00001", category: "equipment", purchaseDate: "2023-03-01", originalCost: 680000, residualValue: 544000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Серверна, стійка A", responsiblePerson: "Інфраструктурний відділ", serialNumber: "HPE-DL380-2023-UA-017", salvageValue: 68000, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-01/2023", commissioningActDate: "2023-03-01", equipmentBrand: "HPE", equipmentModel: "ProLiant DL380 Gen10", equipmentManufactureYear: 2023, equipmentPowerKw: 1.6, equipmentVoltage: 220, equipmentPassportNumber: "ТП-HPE-DL380-017", equipmentWarrantyExpiry: "2026-03-01", equipmentOperatingHours: 14000 },
  { id: "fa-tov3-2", name: "Робочі станції Dell Precision (x12)", inventoryNumber: "ОЗ-00002", category: "equipment", purchaseDate: "2023-06-15", originalCost: 720000, residualValue: 576000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Open space, 3-й поверх", responsiblePerson: "HR Department", serialNumber: "DELL-PREC-BATCH-2023", salvageValue: 72000, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-02/2023", commissioningActDate: "2023-06-15", equipmentBrand: "Dell", equipmentModel: "Precision 5570", equipmentManufactureYear: 2023, equipmentPowerKw: 0.13, equipmentVoltage: 220, equipmentWarrantyExpiry: "2026-06-15" },
  { id: "fa-tov3-3", name: "Toyota Camry 2023 (корпоративний)", inventoryNumber: "ОЗ-00003", category: "transport", purchaseDate: "2023-04-01", originalCost: 950000, residualValue: 760000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Паркінг B1", responsiblePerson: "Директор", plateNumber: "АА 7890 КХ", salvageValue: 95000, accountingAccount: "105", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-03/2023", commissioningActDate: "2023-04-01", vehicleBrand: "Toyota", vehicleModel: "Camry", vehicleYear: 2023, vehicleVIN: "JTDBR32E830012345", vehicleBodyType: "sedan", vehicleFuelType: "hybrid", vehicleEngineVolume: 2.5, vehicleMileage: 28500, vehicleColor: "Чорний металік", vehicleInsuranceType: "both", vehicleInsurancePolicyNumber: "КК/5566778", vehicleInsuranceExpiry: "2026-04-01", vehicleLastServiceDate: "2025-12-15", vehicleNextServiceDate: "2026-06-15", vehicleNextServiceMileage: 40000 },
  { id: "fa-tov3-4", name: "Ліцензія SAP Business One", inventoryNumber: "НА-00001", category: "intangible", purchaseDate: "2023-01-01", originalCost: 280000, residualValue: 140000, depreciationRate: 50, usefulLifeMonths: 24, status: "active", location: "—", responsiblePerson: "CTO", licenseNumber: "SAP-B1-2023-UA-ENT-042", salvageValue: 0, accountingAccount: "127", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "НА-01/2023", commissioningActDate: "2023-01-01", intangibleType: "license", intangibleCertificateNumber: "SAP-B1-2023-UA-ENT-042", intangibleRegistrationDate: "2023-01-01", intangibleExpiryDate: "2025-01-01", intangibleTerritory: "international", intangibleRightsHolder: "SAP SE" },
  { id: "fa-tov3-5", name: "Патент на ПЗ «CloudSync Pro»", inventoryNumber: "НА-00002", category: "intangible", purchaseDate: "2022-09-01", originalCost: 150000, residualValue: 37500, depreciationRate: 50, usefulLifeMonths: 24, status: "active", location: "—", responsiblePerson: "CTO", licenseNumber: "PAT-UA-2022-09-CSP", salvageValue: 0, accountingAccount: "125", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "НА-02/2022", commissioningActDate: "2022-09-01", intangibleType: "patent", intangibleCertificateNumber: "PAT-UA-2022-09-CSP", intangibleRegistrationDate: "2022-09-01", intangibleExpiryDate: "2042-09-01", intangibleTerritory: "ukraine", intangibleAuthor: "Шевченко О.П.", intangibleRightsHolder: "ТОВ «ТехПлюс»", intangibleRegistrationAuthority: "НОІВ (Укрпатент)", intangibleClassification: "G06F 16/00" },
  { id: "fa-tov3-6", name: "Конференц-зал обладнання", inventoryNumber: "ОЗ-00004", category: "furniture", purchaseDate: "2023-05-01", originalCost: 180000, residualValue: 135000, depreciationRate: 25, usefulLifeMonths: 48, status: "active", location: "Конференц-зал, 4-й поверх", responsiblePerson: "Office Manager", salvageValue: 18000, accountingAccount: "106", taxGroup: "6", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-04/2023", commissioningActDate: "2023-05-01" },
  { id: "fa-tov3-7", name: "Серверна стійка Dell (стара)", inventoryNumber: "ОЗ-00005", category: "equipment", purchaseDate: "2020-06-01", originalCost: 450000, residualValue: 90000, depreciationRate: 20, usefulLifeMonths: 60, status: "under-repair", location: "Серверна, стійка B", responsiblePerson: "Інфраструктурний відділ", notes: "Заміна блоку живлення та HDD масиву", serialNumber: "DELL-SVR-2020-OLD", salvageValue: 45000, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-05/2020", commissioningActDate: "2020-06-01", equipmentBrand: "Dell", equipmentModel: "PowerEdge R640", equipmentManufactureYear: 2020, equipmentPowerKw: 0.75, equipmentVoltage: 220, equipmentOperatingHours: 32000, equipmentWarrantyExpiry: "2023-06-01" },
];

const defaultAssets: FixedAsset[] = [
  { id: "fa-def-1", name: "Ноутбук ASUS VivoBook 15", inventoryNumber: "ОЗ-00001", category: "equipment", purchaseDate: "2024-01-10", originalCost: 32000, residualValue: 25600, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Офіс", responsiblePerson: "Власник", serialNumber: "ASUS-VB15-2024", salvageValue: 3200, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-01/2024", commissioningActDate: "2024-01-10", equipmentBrand: "ASUS", equipmentModel: "VivoBook 15", equipmentManufactureYear: 2024, equipmentPowerKw: 0.065, equipmentVoltage: 220, equipmentWarrantyExpiry: "2026-01-10" },
  { id: "fa-def-2", name: "Принтер HP LaserJet", inventoryNumber: "ОЗ-00002", category: "equipment", purchaseDate: "2023-05-01", originalCost: 9500, residualValue: 5700, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Офіс", responsiblePerson: "Власник", salvageValue: 950, accountingAccount: "104", taxGroup: "4", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-02/2023", commissioningActDate: "2023-05-01", equipmentBrand: "HP", equipmentModel: "LaserJet Pro", equipmentManufactureYear: 2023, equipmentPowerKw: 0.5, equipmentVoltage: 220, equipmentWarrantyExpiry: "2025-05-01" },
  { id: "fa-def-3", name: "Стіл офісний", inventoryNumber: "ОЗ-00003", category: "furniture", purchaseDate: "2023-01-01", originalCost: 12000, residualValue: 7200, depreciationRate: 25, usefulLifeMonths: 48, status: "active", location: "Офіс", responsiblePerson: "Власник", salvageValue: 1200, accountingAccount: "106", taxGroup: "6", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-03/2023", commissioningActDate: "2023-01-01" },
];

const fopIvanenkoAssets: FixedAsset[] = [
  ...defaultAssets.map(a => ({ ...a, responsiblePerson: "Іваненко І.І." })),
  { id: "fa-fop2-1", name: "Вантажний автомобіль Renault Master 2022", inventoryNumber: "ОЗ-00004", category: "transport", purchaseDate: "2022-09-15", originalCost: 920000, residualValue: 552000, depreciationRate: 20, usefulLifeMonths: 60, status: "active", location: "Паркінг", responsiblePerson: "Іваненко І.І.", plateNumber: "ВІ 3456 АН", salvageValue: 92000, accountingAccount: "105", taxGroup: "5", depreciationMethod: "straight-line", commissioningActNumber: "ОЗ-04/2022", commissioningActDate: "2022-09-15", vehicleBrand: "Renault", vehicleModel: "Master", vehicleYear: 2022, vehicleVIN: "VF1MA000X67890123", vehicleBodyType: "van", vehicleFuelType: "diesel", vehicleEngineVolume: 2.3, vehicleMileage: 54300, vehicleColor: "Сірий", vehicleInsuranceType: "osago", vehicleInsurancePolicyNumber: "ГГ/1122334", vehicleInsuranceExpiry: "2025-12-31", vehicleLastServiceDate: "2025-08-01", vehicleNextServiceDate: "2026-02-01", vehicleNextServiceMileage: 60000 },
];

export function getFixedAssetsForCabinet(cabinetId: string): FixedAsset[] {
  if (cabinetId === "demo-consulting-3") return consultingAssets;
  if (cabinetId === "demo-autorepair-2") return autoRepairAssets;
  if (cabinetId === "demo-it-3") return itAssets;
  if (cabinetId === "demo-dealer-2") return dealerAssets;
  // TOV cabinets
  if (cabinetId === "1") return tovRomashkaAssets;
  if (cabinetId === "3") return tovTechPlusAssets;
  // FOP cabinets
  if (cabinetId === "2") return fopIvanenkoAssets;
  if (isDemoCabinet(cabinetId)) return defaultAssets;
  return defaultAssets;
}

// ============ Depreciation schedule ============

export interface DepreciationEntry {
  period: string;
  openingValue: number;
  depreciation: number;
  closingValue: number;
}

export function generateDepreciationSchedule(asset: FixedAsset): DepreciationEntry[] {
  const entries: DepreciationEntry[] = [];
  const salvage = asset.salvageValue ?? 0;
  const monthlyRate = asset.depreciationRate / 100 / 12;
  let currentValue = asset.originalCost;
  const startDate = new Date(asset.purchaseDate);

  for (let i = 0; i < Math.min(asset.usefulLifeMonths, 24); i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    const period = d.toLocaleDateString("uk-UA", { month: "short", year: "numeric" });
    const depreciation = Math.round(currentValue * monthlyRate);
    const closingValue = Math.max(salvage, currentValue - depreciation);

    entries.push({ period, openingValue: currentValue, depreciation: currentValue - closingValue, closingValue });
    currentValue = closingValue;
    if (currentValue <= salvage) break;
  }

  return entries;
}
