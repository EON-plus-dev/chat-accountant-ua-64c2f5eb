// ОСЦПВ (Mandatory Auto Liability Insurance) — tariff coefficients
// Legal basis: ЗУ № 1961-IV, Розпорядження Нацкомфінпослуг про базові тарифи
// Snapshot April 2026

export interface OsagoTariff {
  id: string;
  category: string;
  vehicleType: string;
  enginePowerKw?: string;
  baseTariff: number; // ₴/рік базовий
  notes?: string;
}

export const OSAGO_AS_OF = "2026-04-01";
export const OSAGO_BASE_AMOUNT = 1505; // ₴ — нова базова ставка (2026)

export const OSAGO_TARIFFS: OsagoTariff[] = [
  { id: "ot-car-1", category: "B", vehicleType: "Легковий", enginePowerKw: "до 50 кВт", baseTariff: 1505 },
  { id: "ot-car-2", category: "B", vehicleType: "Легковий", enginePowerKw: "51–70 кВт", baseTariff: 1806 },
  { id: "ot-car-3", category: "B", vehicleType: "Легковий", enginePowerKw: "71–100 кВт", baseTariff: 2107 },
  { id: "ot-car-4", category: "B", vehicleType: "Легковий", enginePowerKw: "понад 100 кВт", baseTariff: 2710 },
  { id: "ot-truck-1", category: "C", vehicleType: "Вантажний", enginePowerKw: "до 12 т", baseTariff: 3010 },
  { id: "ot-truck-2", category: "C", vehicleType: "Вантажний", enginePowerKw: "понад 12 т", baseTariff: 4515 },
  { id: "ot-bus-1", category: "D", vehicleType: "Автобус", enginePowerKw: "до 20 місць", baseTariff: 3010 },
  { id: "ot-bus-2", category: "D", vehicleType: "Автобус", enginePowerKw: "понад 20 місць", baseTariff: 5417 },
  { id: "ot-moto", category: "A", vehicleType: "Мотоцикл", baseTariff: 753 },
  { id: "ot-trailer", category: "E", vehicleType: "Причіп до вантажного", baseTariff: 451 },
];

// Coefficients (multipliers applied to baseTariff)
export const OSAGO_COEFFICIENTS = {
  territory: {
    "Київ": 1.30,
    "Обласний центр (понад 1 млн)": 1.20,
    "Місто 500 тис.–1 млн": 1.00,
    "Місто 100–500 тис.": 0.85,
    "Місто 50–100 тис.": 0.75,
    "До 50 тис.": 0.65,
    "Села": 0.50,
  },
  driverAge: {
    "до 25 років, стаж < 3 років": 1.50,
    "25–65, стаж ≥ 3 років": 1.00,
    "понад 65 років": 1.20,
  },
  bonusMalus: {
    "Клас 0 (новий)": 1.00,
    "Клас 1 (1 рік без аварій)": 0.95,
    "Клас 3 (3 роки)": 0.85,
    "Клас 5 (5+ років)": 0.75,
    "Після аварії": 1.55,
  },
  contractType: {
    "1 рік звичайний": 1.00,
    "Сезонний (6 міс.)": 0.70,
    "Короткостроковий (15 днів)": 0.30,
  },
};

export const OSAGO_PAYOUT_LIMITS = {
  health: 320000, // ₴ — шкода життю/здоров'ю
  property: 160000, // ₴ — шкода майну
};
