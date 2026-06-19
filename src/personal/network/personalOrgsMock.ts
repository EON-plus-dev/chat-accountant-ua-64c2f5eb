import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

export interface PersonalOrganization {
  id: string;
  name: string;
  category: "dental" | "restaurant" | "sport" | "insurance" | "school" | "auto" | "beauty";
  city: string;
  lastInteraction: string;
  amountSpentYtd?: number;
  hasSubscription?: boolean;
}

export interface PersonalExpert {
  id: string;
  name: string;
  speciality: string;
  rating: number;
  consultations: number;
  lastConsultation?: string;
}

const ORGS: Partial<Record<PersonalPreset, PersonalOrganization[]>> = {
  declarant: [
    { id: "org-1", name: "Lumi Dental", category: "dental", city: "Київ", lastInteraction: "2026-02-04", amountSpentYtd: 4_200, hasSubscription: true },
    { id: "org-2", name: "Ресторан «Канапа»", category: "restaurant", city: "Київ", lastInteraction: "2026-04-01", amountSpentYtd: 18_400, hasSubscription: true },
    { id: "org-3", name: "Tennis Club «Forhand»", category: "sport", city: "Київ", lastInteraction: "2026-04-07", amountSpentYtd: 12_750, hasSubscription: true },
    { id: "org-4", name: "INGO Україна", category: "insurance", city: "Київ", lastInteraction: "2026-01-15", amountSpentYtd: 14_800 },
    { id: "org-5", name: "Школа №38, 3-А клас", category: "school", city: "Київ", lastInteraction: "2026-03-29", amountSpentYtd: 3_600 },
    { id: "org-6", name: "AutoSpace СТО", category: "auto", city: "Київ", lastInteraction: "2026-03-12", amountSpentYtd: 6_400, hasSubscription: true },
  ],
  renter: [
    { id: "org-r-1", name: "ОСББ «Перемога-12»", category: "insurance", city: "Київ", lastInteraction: "2026-04-01", amountSpentYtd: 9_600 },
    { id: "org-r-2", name: "UNIQA Страхування", category: "insurance", city: "Київ", lastInteraction: "2026-05-01", amountSpentYtd: 3_600 },
    { id: "org-r-3", name: "Епіцентр", category: "auto", city: "Київ", lastInteraction: "2026-03-22", amountSpentYtd: 14_200 },
  ],
  master: [
    { id: "org-m-1", name: "Beauty Academy", category: "beauty", city: "Київ", lastInteraction: "2026-03-10", amountSpentYtd: 6_500 },
    { id: "org-m-2", name: "Поліклініка №3", category: "dental", city: "Київ", lastInteraction: "2025-11-12", amountSpentYtd: 850 },
  ],
};

const EXPERTS: Partial<Record<PersonalPreset, PersonalExpert[]>> = {
  declarant: [
    { id: "ex-1", name: "Олег Кравченко", speciality: "Сімейний лікар", rating: 4.9, consultations: 6, lastConsultation: "2026-03-18" },
    { id: "ex-2", name: "Анна Петренко", speciality: "Адвокат, сімейне право", rating: 4.8, consultations: 2, lastConsultation: "2025-11-20" },
    { id: "ex-3", name: "Ігор Семенчук", speciality: "Бухгалтер-консультант", rating: 5.0, consultations: 4, lastConsultation: "2026-02-15" },
    { id: "ex-4", name: "Дмитро Лозовий", speciality: "Тренер з тенісу", rating: 4.9, consultations: 18, lastConsultation: "2026-04-04" },
  ],
  renter: [
    { id: "ex-r-1", name: "Марія Литвин", speciality: "Адвокат, оренда нерухомості", rating: 4.7, consultations: 3, lastConsultation: "2026-02-10" },
    { id: "ex-r-2", name: "Сергій Білик", speciality: "Майстер-універсал", rating: 4.8, consultations: 5, lastConsultation: "2026-03-25" },
  ],
  master: [
    { id: "ex-m-1", name: "Тетяна Литвиненко", speciality: "Бізнес-тренер для майстрів", rating: 4.9, consultations: 2, lastConsultation: "2026-02-28" },
  ],
};

export function getOrgsForCabinet(cabinetId: string): PersonalOrganization[] {
  return pickByPreset(cabinetId, ORGS, []);
}

export function getExpertsForCabinet(cabinetId: string): PersonalExpert[] {
  return pickByPreset(cabinetId, EXPERTS, []);
}
