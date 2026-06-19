/**
 * Tiered Referral Program Configuration
 * Based on modern SaaS referral best practices
 */

export interface ReferralTier {
  level: number;
  name: string;
  nameEn: string;
  minReferrals: number;
  creditsPerReferral: number;
  badge: string | null;
  bonus?: string;
  bonusDetails?: string;
}

export interface ReferralType {
  id: string;
  credits: number;
  label: string;
  description: string;
}

export interface ReferralStats {
  totalReferrals: number;
  paidConversions: number;
  totalCreditsEarned: number;
  currentTier: ReferralTier;
  nextTier: ReferralTier | null;
  progressToNextTier: number; // percentage
}

export interface ReferralTransaction {
  id: string;
  type: 'referral' | 'paid_conversion' | 'tier_bonus';
  amount: number;
  description: string;
  date: Date;
  referralName?: string;
}

// Tier definitions - progressive rewards
export const referralTiers: ReferralTier[] = [
  {
    level: 1,
    name: "Старт",
    nameEn: "Starter",
    minReferrals: 0,
    creditsPerReferral: 5000,
    badge: null,
  },
  {
    level: 2,
    name: "Промоутер",
    nameEn: "Promoter",
    minReferrals: 5,
    creditsPerReferral: 10000,
    badge: "🥉",
    bonus: "Безкоштовний місяць Смарт",
    bonusDetails: "Отримайте місяць тарифу Смарт безкоштовно при досягненні цього рівня",
  },
  {
    level: 3,
    name: "Амбасадор",
    nameEn: "Ambassador",
    minReferrals: 15,
    creditsPerReferral: 15000,
    badge: "🥈",
    bonus: "Знижка 20% назавжди",
    bonusDetails: "Постійна знижка 20% на всі тарифи та поповнення",
  },
  {
    level: 4,
    name: "Партнер",
    nameEn: "Partner",
    minReferrals: 50,
    creditsPerReferral: 20000,
    badge: "🥇",
    bonus: "Revenue share 10%",
    bonusDetails: "Отримуйте 10% від платежів залучених клієнтів",
  },
];

// Types of referral actions
export const referralTypes: Record<string, ReferralType> = {
  contractor: {
    id: "contractor",
    credits: 5000,
    label: "За контрагента",
    description: "Коли контрагент зареєструється за вашим запрошенням",
  },
  teamMember: {
    id: "teamMember",
    credits: 5000,
    label: "За члена команди",
    description: "Коли член команди приєднається до вашого кабінету",
  },
  paidConversion: {
    id: "paidConversion",
    credits: 5000,
    label: "За першу оплату",
    description: "Коли запрошений користувач стане платним клієнтом",
  },
};

// Special offers for contractors (passive cabinet users)
export const contractorSpecialOffers = {
  firstMonthDiscount: 50, // 50% off first month
  bonusCredits: 5000, // bonus credits on first payment
  syncWithPartner: true, // auto-sync requisites with inviting partner
};

// Helper function to get current tier based on referral count
export function getCurrentTier(referralCount: number): ReferralTier {
  const sortedTiers = [...referralTiers].sort((a, b) => b.minReferrals - a.minReferrals);
  return sortedTiers.find(tier => referralCount >= tier.minReferrals) || referralTiers[0];
}

// Helper function to get next tier
export function getNextTier(referralCount: number): ReferralTier | null {
  const currentTier = getCurrentTier(referralCount);
  const nextTierIndex = referralTiers.findIndex(t => t.level === currentTier.level) + 1;
  return nextTierIndex < referralTiers.length ? referralTiers[nextTierIndex] : null;
}

// Helper function to calculate progress to next tier
export function getProgressToNextTier(referralCount: number): number {
  const currentTier = getCurrentTier(referralCount);
  const nextTier = getNextTier(referralCount);
  
  if (!nextTier) return 100;
  
  const referralsInCurrentTier = referralCount - currentTier.minReferrals;
  const referralsNeededForNext = nextTier.minReferrals - currentTier.minReferrals;
  
  return Math.min(100, Math.round((referralsInCurrentTier / referralsNeededForNext) * 100));
}

// Generate referral statistics
export function getReferralStats(
  totalReferrals: number,
  paidConversions: number = 0
): ReferralStats {
  const currentTier = getCurrentTier(totalReferrals);
  const nextTier = getNextTier(totalReferrals);
  
  // Calculate total credits earned
  let totalCreditsEarned = 0;
  let remainingReferrals = totalReferrals;
  
  for (let i = referralTiers.length - 1; i >= 0; i--) {
    const tier = referralTiers[i];
    const prevTierMin = i > 0 ? referralTiers[i - 1].minReferrals : 0;
    
    if (remainingReferrals >= tier.minReferrals) {
      const referralsInTier = Math.min(
        remainingReferrals - tier.minReferrals,
        i < referralTiers.length - 1 ? referralTiers[i + 1].minReferrals - tier.minReferrals : remainingReferrals - tier.minReferrals
      );
      totalCreditsEarned += referralsInTier * tier.creditsPerReferral;
    }
  }
  
  // Add paid conversion bonuses
  totalCreditsEarned += paidConversions * referralTypes.paidConversion.credits;
  
  return {
    totalReferrals,
    paidConversions,
    totalCreditsEarned,
    currentTier,
    nextTier,
    progressToNextTier: getProgressToNextTier(totalReferrals),
  };
}

// Generate mock transactions for demo purposes
export function generateMockTransactions(count: number = 5): ReferralTransaction[] {
  const mockNames = ["Іван К.", "Олена М.", "Петро С.", "Марія Д.", "Андрій В."];
  const now = new Date();
  
  const transactions: ReferralTransaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const daysAgo = i * 2;
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    if (i === 0) {
      transactions.push({
        id: `tx_${i}`,
        type: 'referral',
        amount: 5000,
        description: 'Новий реферал',
        date,
        referralName: mockNames[i % mockNames.length],
      });
    } else if (i === 1) {
      transactions.push({
        id: `tx_${i}`,
        type: 'paid_conversion',
        amount: 5000,
        description: 'Перша оплата',
        date,
        referralName: mockNames[i % mockNames.length],
      });
    } else if (i === 2) {
      transactions.push({
        id: `tx_${i}`,
        type: 'tier_bonus',
        amount: 0,
        description: 'Досягнуто рівень Промоутер',
        date,
      });
    } else {
      transactions.push({
        id: `tx_${i}`,
        type: 'referral',
        amount: 5000,
        description: 'Новий реферал',
        date,
        referralName: mockNames[i % mockNames.length],
      });
    }
  }
  
  return transactions;
}

// Helper function to format credits consistently across the app
export function formatReferralCredits(credits: number, withPlus = true, withSuffix = false): string {
  const formatted = credits >= 1000 ? `${(credits / 1000).toFixed(0)}K` : String(credits);
  const prefix = withPlus ? "+" : "";
  const suffix = withSuffix ? " кредитів" : "";
  return `${prefix}${formatted}${suffix}`;
}

// Convert credits to approximate UAH value (for display purposes)
export function creditsToUah(credits: number): number {
  // Approximate: 17 credits per 1 грн based on Smart plan rate
  return Math.round(credits / 17);
}

export default {
  referralTiers,
  referralTypes,
  contractorSpecialOffers,
  getCurrentTier,
  getNextTier,
  getProgressToNextTier,
  getReferralStats,
  generateMockTransactions,
  formatReferralCredits,
  creditsToUah,
};
