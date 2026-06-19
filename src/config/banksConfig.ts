/**
 * Ukrainian Banks Reference (МФО codes)
 * Used for IBAN parsing and auto-fill functionality
 */

export interface UkrainianBank {
  mfo: string;         // МФО код (6 цифр)
  name: string;        // Повна назва ("АТ КБ «ПриватБанк»")
  shortName: string;   // Коротка назва ("ПриватБанк")
  swift?: string;      // SWIFT/BIC код
  edrpou: string;      // ЄДРПОУ банку
  isActive: boolean;   // Чи активний банк
  category: "state" | "private" | "foreign" | "other";
}

/**
 * Top Ukrainian banks by MFO code
 * Updated for 2025
 */
export const UKRAINIAN_BANKS: UkrainianBank[] = [
  // === STATE BANKS (Державні) ===
  {
    mfo: "305299",
    name: "АТ КБ «ПриватБанк»",
    shortName: "ПриватБанк",
    swift: "PBANUA2X",
    edrpou: "14360570",
    isActive: true,
    category: "state",
  },
  {
    mfo: "300465",
    name: "АТ «Ощадбанк»",
    shortName: "Ощадбанк",
    swift: "OSCBUA2X",
    edrpou: "00032129",
    isActive: true,
    category: "state",
  },
  {
    mfo: "320478",
    name: "АТ «Укргазбанк»",
    shortName: "Укргазбанк",
    swift: "UGASUAUK",
    edrpou: "23697280",
    isActive: true,
    category: "state",
  },
  {
    mfo: "322313",
    name: "АТ «Укрексімбанк»",
    shortName: "Укрексімбанк",
    swift: "EXBSUAUK",
    edrpou: "00032112",
    isActive: true,
    category: "state",
  },
  
  // === PRIVATE BANKS (Приватні українські) ===
  {
    mfo: "322001",
    name: "АТ «УНІВЕРСАЛ БАНК»",
    shortName: "monobank",
    swift: "UNJSUAUK",
    edrpou: "21133352",
    isActive: true,
    category: "private",
  },
  {
    mfo: "334851",
    name: "АТ «ПУМБ»",
    shortName: "ПУМБ",
    swift: "FUIBUAUK",
    edrpou: "14282829",
    isActive: true,
    category: "private",
  },
  {
    mfo: "307770",
    name: "АТ «А-Банк»",
    shortName: "А-Банк",
    swift: "ABNKUA2K",
    edrpou: "26366776",
    isActive: true,
    category: "private",
  },
  {
    mfo: "339500",
    name: "АТ «ТАСКОМБАНК»",
    shortName: "Таскомбанк",
    swift: "TBCHUAUK",
    edrpou: "09806443",
    isActive: true,
    category: "private",
  },
  {
    mfo: "328168",
    name: "АТ «Сенс Банк»",
    shortName: "Sense Bank",
    swift: "SENSUAUK",
    edrpou: "23494714",
    isActive: true,
    category: "private",
  },
  {
    mfo: "380805",
    name: "АТ «ПРАВЕКС БАНК»",
    shortName: "Правекс-Банк",
    swift: "PRAVUAUK",
    edrpou: "14360920",
    isActive: true,
    category: "private",
  },
  {
    mfo: "328209",
    name: "АТ «БАНК ПІВДЕННИЙ»",
    shortName: "Південний",
    swift: "PILOUA2X",
    edrpou: "20953647",
    isActive: true,
    category: "private",
  },
  {
    mfo: "300528",
    name: "АТ «ОТП БАНК»",
    shortName: "OTP Bank",
    swift: "OTPVUAUK",
    edrpou: "21685166",
    isActive: true,
    category: "foreign",
  },
  
  // === FOREIGN BANKS (Іноземні) ===
  {
    mfo: "351005",
    name: "АТ «УКРСИББАНК»",
    shortName: "Укрсиббанк",
    swift: "KABORUUK",
    edrpou: "09807862",
    isActive: true,
    category: "foreign",
  },
  {
    mfo: "300614",
    name: "АТ «КРЕДІ АГРІКОЛЬ БАНК»",
    shortName: "Креді Агріколь",
    swift: "AABORUUK",
    edrpou: "14361575",
    isActive: true,
    category: "foreign",
  },
  {
    mfo: "300346",
    name: "АТ «АЛЬФА-БАНК»",
    shortName: "Альфа-Банк",
    swift: "SLNBUAUK",
    edrpou: "23494714",
    isActive: true,
    category: "private",
  },
  {
    mfo: "380805",
    name: "АТ «Райффайзен Банк»",
    shortName: "Райффайзен Банк",
    swift: "AVALUAUK",
    edrpou: "14305909",
    isActive: true,
    category: "foreign",
  },
  {
    mfo: "320702",
    name: "АТ «КРЕДОБАНК»",
    shortName: "Кредобанк",
    swift: "WUCBUAUK",
    edrpou: "09807595",
    isActive: true,
    category: "foreign",
  },
  {
    mfo: "325365",
    name: "АТ «ІНГ Банк Україна»",
    shortName: "ING Bank",
    swift: "INGBUAUK",
    edrpou: "21684818",
    isActive: true,
    category: "foreign",
  },
  {
    mfo: "300131",
    name: "АТ «Сітібанк»",
    shortName: "Citibank",
    swift: "CITIUAUK",
    edrpou: "21685485",
    isActive: true,
    category: "foreign",
  },
  
  // === OTHER ===
  {
    mfo: "321842",
    name: "АТ «sportbank»",
    shortName: "sportbank",
    swift: undefined,
    edrpou: "26367043",
    isActive: true,
    category: "private",
  },
  {
    mfo: "380399",
    name: "АТ «izibank»",
    shortName: "izibank",
    swift: undefined,
    edrpou: "38690458",
    isActive: true,
    category: "private",
  },
];

// ============= Helper Functions =============

/**
 * Get bank by MFO code
 */
export function getBankByMfo(mfo: string): UkrainianBank | undefined {
  return UKRAINIAN_BANKS.find(b => b.mfo === mfo);
}

/**
 * Get bank short name by MFO
 */
export function getBankShortNameByMfo(mfo: string): string | null {
  const bank = getBankByMfo(mfo);
  return bank?.shortName || null;
}

/**
 * Get bank full name by MFO
 */
export function getBankNameByMfo(mfo: string): string | null {
  const bank = getBankByMfo(mfo);
  return bank?.name || null;
}

/**
 * Get all active banks
 */
export function getActiveBanks(): UkrainianBank[] {
  return UKRAINIAN_BANKS.filter(b => b.isActive);
}

/**
 * Get banks by category
 */
export function getBanksByCategory(category: UkrainianBank["category"]): UkrainianBank[] {
  return getActiveBanks().filter(b => b.category === category);
}

/**
 * Format bank options for select components
 */
export function getBankOptions(): { value: string; label: string; mfo: string }[] {
  return getActiveBanks().map(b => ({
    value: b.mfo,
    label: b.shortName,
    mfo: b.mfo,
  }));
}

/**
 * Search banks by name (fuzzy)
 */
export function searchBanks(query: string): UkrainianBank[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return getActiveBanks();
  
  return getActiveBanks().filter(
    b =>
      b.name.toLowerCase().includes(normalizedQuery) ||
      b.shortName.toLowerCase().includes(normalizedQuery) ||
      b.mfo.includes(normalizedQuery)
  );
}
