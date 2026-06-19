import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

export interface LoyaltyTierThreshold {
  tier: string;
  minBalance: number;
}

export interface LoyaltyTransaction {
  date: string;
  delta: number;
  reason: string;
}

export interface LoyaltyProgram {
  id: string;
  brand: string;
  category: "bank" | "grocery" | "fuel" | "cinema" | "beauty" | "other";
  balance: number;
  unit: "₴" | "балів" | "л" | "сеансів";
  tier?: string;
  expiresAt?: string;
  lastActivity?: string;
  pointsRate?: number;
  tierThresholds?: LoyaltyTierThreshold[];
  currentTierIndex?: number;
  expiryRules?: string;
  transactions?: LoyaltyTransaction[];
}

const DATA: Partial<Record<PersonalPreset, LoyaltyProgram[]>> = {
  declarant: [
    { id: "loy-1", brand: "monobank Cashback", category: "bank", balance: 1240, unit: "₴", tier: "White", lastActivity: "сьогодні" },
    { id: "loy-2", brand: "Сільпо «Власний рахунок»", category: "grocery", balance: 340, unit: "балів", tier: "Срібний", lastActivity: "3 дні тому" },
    { id: "loy-3", brand: "WOG Pride", category: "fuel", balance: 18, unit: "л", tier: "Gold", lastActivity: "минулого тижня" },
    { id: "loy-4", brand: "Multiplex Club", category: "cinema", balance: 4, unit: "сеансів", expiresAt: "2026-12-31" },
    { id: "loy-5", brand: "EVA MOL", category: "beauty", balance: 820, unit: "балів", tier: "Експерт", lastActivity: "минулого місяця" },
    { id: "loy-6", brand: "Rozetka Premium", category: "other", balance: 2150, unit: "балів", tier: "Gold", lastActivity: "вчора" },
    { id: "loy-7", brand: "ОККО Drive", category: "fuel", balance: 12, unit: "л", tier: "Silver", lastActivity: "тиждень тому" },
    { id: "loy-8", brand: "Watsons Club", category: "beauty", balance: 480, unit: "балів", tier: "Базовий", lastActivity: "2 тижні тому" },
    { id: "loy-9", brand: "Comfy Club", category: "other", balance: 730, unit: "балів", tier: "Срібло", lastActivity: "минулого місяця" },
    { id: "loy-10", brand: "MasterCard Каштан", category: "bank", balance: 380, unit: "₴", tier: "Стандарт", lastActivity: "сьогодні" },
  ],
  renter: [
    { id: "loy-r-1", brand: "monobank Cashback", category: "bank", balance: 640, unit: "₴", tier: "White", lastActivity: "сьогодні" },
    { id: "loy-r-2", brand: "Епіцентр Eclub", category: "other", balance: 1280, unit: "балів", tier: "Срібло", lastActivity: "тиждень тому" },
  ],
  master: [
    { id: "loy-m-1", brand: "monobank Cashback", category: "bank", balance: 980, unit: "₴", tier: "White", lastActivity: "сьогодні" },
    { id: "loy-m-2", brand: "EVA MOL", category: "beauty", balance: 1640, unit: "балів", tier: "Експерт", lastActivity: "вчора" },
    { id: "loy-m-3", brand: "Watsons Club", category: "beauty", balance: 890, unit: "балів", tier: "Срібний", lastActivity: "3 дні тому" },
    { id: "loy-m-4", brand: "Сільпо «Власний рахунок»", category: "grocery", balance: 280, unit: "балів", tier: "Базовий", lastActivity: "тиждень тому" },
    { id: "loy-m-5", brand: "ОККО Drive", category: "fuel", balance: 9, unit: "л", tier: "Silver", lastActivity: "минулого тижня" },
    { id: "loy-m-6", brand: "Rozetka Premium", category: "other", balance: 1340, unit: "балів", tier: "Срібло", lastActivity: "вчора" },
    { id: "loy-m-7", brand: "Multiplex Club", category: "cinema", balance: 3, unit: "сеансів", expiresAt: "2026-12-31" },
    { id: "loy-m-8", brand: "Pro Hair Club", category: "beauty", balance: 540, unit: "балів", tier: "Майстер", lastActivity: "сьогодні" },
  ],
};

export function getLoyaltyForCabinet(cabinetId: string): LoyaltyProgram[] {
  return pickByPreset(cabinetId, DATA, []);
}
