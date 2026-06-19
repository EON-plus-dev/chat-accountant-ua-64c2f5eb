import type { Industry, IndustryBenchmark } from "@/types/comparison";

export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  {
    id: "it",
    label: "ІТ",
    icon: "monitor",
    benchmarks: {
      taxBurden: { low: 4, optimal: 6, high: 8 },
      laborCost: { low: 50, optimal: 62, high: 75 },
    },
    description: "ІТ-послуги, розробка ПЗ, аутсорс",
  },
  {
    id: "trade",
    label: "Торгівля",
    icon: "shopping-cart",
    benchmarks: {
      taxBurden: { low: 6, optimal: 10, high: 14 },
      laborCost: { low: 12, optimal: 20, high: 28 },
    },
    description: "Оптова та роздрібна торгівля",
  },
  {
    id: "services",
    label: "Послуги",
    icon: "briefcase",
    benchmarks: {
      taxBurden: { low: 5, optimal: 8, high: 12 },
      laborCost: { low: 28, optimal: 38, high: 50 },
    },
    description: "Сервісні компанії, B2B/B2C",
  },
  {
    id: "manufacturing",
    label: "Виробництво",
    icon: "factory",
    benchmarks: {
      taxBurden: { low: 8, optimal: 12, high: 18 },
      laborCost: { low: 30, optimal: 42, high: 55 },
    },
    description: "Виробничі підприємства",
  },
  {
    id: "consulting",
    label: "Консалтинг",
    icon: "users",
    benchmarks: {
      taxBurden: { low: 4, optimal: 6.5, high: 9 },
      laborCost: { low: 38, optimal: 50, high: 65 },
    },
    description: "Консультаційні послуги, аудит",
  },
  {
    id: "autorepair",
    label: "Автосервіс",
    icon: "wrench",
    benchmarks: {
      taxBurden: { low: 5, optimal: 8, high: 12 },
      laborCost: { low: 25, optimal: 35, high: 48 },
    },
    description: "Ремонт та обслуговування транспортних засобів",
  },
  {
    id: "dealer",
    label: "Дилерство",
    icon: "package",
    benchmarks: {
      taxBurden: { low: 6, optimal: 9, high: 13 },
      laborCost: { low: 15, optimal: 22, high: 32 },
    },
    description: "Дистрибуція, торгівля від виробника",
  },
  {
    id: "salon",
    label: "Салон краси",
    icon: "scissors",
    benchmarks: {
      taxBurden: { low: 6, optimal: 9, high: 13 },
      laborCost: { low: 45, optimal: 58, high: 70 },
    },
    description: "Салони краси, перукарні, манікюр, масаж, SPA",
  },
  {
    id: "tennis_club",
    label: "Тенісний клуб",
    icon: "trophy",
    benchmarks: {
      taxBurden: { low: 6, optimal: 9, high: 13 },
      laborCost: { low: 30, optimal: 42, high: 55 },
    },
    description: "Тенісні клуби: оренда кортів, тренування, прокат, магазин і кафе",
  },
  {
    id: "restaurant",
    label: "Ресторан / HoReCa",
    icon: "utensils",
    benchmarks: {
      taxBurden: { low: 5, optimal: 8, high: 12 },
      laborCost: { low: 28, optimal: 38, high: 50 },
    },
    description: "Ресторани, кафе, бари, бістро: зал, кухня, доставка",
  },
  {
    id: "hotel",
    label: "Готель",
    icon: "bed-double",
    benchmarks: {
      taxBurden: { low: 5, optimal: 8, high: 12 },
      laborCost: { low: 22, optimal: 32, high: 45 },
    },
    description: "Готелі, апарт-готелі, B&B: номери, ресепшн, мінібар, прибирання",
  },
];

export function getIndustryBenchmark(industryId: Industry): IndustryBenchmark | undefined {
  return INDUSTRY_BENCHMARKS.find(b => b.id === industryId);
}

export function getIndustryLabel(industryId: Industry): string {
  return INDUSTRY_BENCHMARKS.find(b => b.id === industryId)?.label || industryId;
}
