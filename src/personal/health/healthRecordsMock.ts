import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

export interface HealthVisit {
  id: string;
  date: string;
  doctor: string;
  speciality: string;
  clinic: string;
  summary: string;
  followUpDate?: string;
}

export interface HealthPrescription {
  id: string;
  drug: string;
  dosage: string;
  prescribedBy: string;
  startedAt: string;
  refillBy?: string;
}

export interface HealthInsurance {
  id: string;
  provider: string;
  type: "ДМС" | "ОМС";
  policyNumber: string;
  validUntil: string;
  coveredFor: string[];
}

export interface HealthRecord {
  visits: HealthVisit[];
  prescriptions: HealthPrescription[];
  insurances: HealthInsurance[];
}

const DATA: Partial<Record<PersonalPreset, HealthRecord>> = {
  declarant: {
    visits: [
      {
        id: "hv-1",
        date: "2026-03-18",
        doctor: "Олег Кравченко",
        speciality: "Сімейний лікар",
        clinic: "Добробут, Київ",
        summary: "Плановий огляд, аналізи в нормі. Рекомендовано вітамін D 2000 МО/добу.",
        followUpDate: "2026-09-18",
      },
      {
        id: "hv-2",
        date: "2026-02-04",
        doctor: "Тетяна Романюк",
        speciality: "Стоматолог",
        clinic: "Lumi Dental",
        summary: "Професійна гігієна, заміна старої пломби (16 зуб).",
        followUpDate: "2026-08-04",
      },
    ],
    prescriptions: [
      { id: "rx-1", drug: "Вітамін D3", dosage: "2000 МО × 1/день", prescribedBy: "Олег Кравченко", startedAt: "2026-03-18", refillBy: "2026-06-18" },
      { id: "rx-2", drug: "Магній B6", dosage: "1 табл. × 2/день, 30 днів", prescribedBy: "Олег Кравченко", startedAt: "2026-03-18" },
      { id: "rx-3", drug: "Назальний спрей", dosage: "за потреби", prescribedBy: "Тетяна Романюк", startedAt: "2026-02-04" },
    ],
    insurances: [
      {
        id: "ins-1",
        provider: "INGO Україна",
        type: "ДМС",
        policyNumber: "DMS-2026-184320",
        validUntil: "2027-01-15",
        coveredFor: ["Олег Шевченко", "Олена Шевченко", "Артем", "Софія"],
      },
    ],
  },
  renter: {
    visits: [
      {
        id: "hv-r-1",
        date: "2026-02-20",
        doctor: "Іван Гончарук",
        speciality: "Сімейний лікар",
        clinic: "Поліклініка №9",
        summary: "Профілактичний огляд. Тиск у нормі.",
      },
    ],
    prescriptions: [],
    insurances: [],
  },
  master: {
    visits: [
      {
        id: "hv-m-1",
        date: "2025-11-12",
        doctor: "Світлана Лук'яненко",
        speciality: "Огляд для медкнижки",
        clinic: "Поліклініка №3",
        summary: "Допуск до роботи: 12 місяців.",
        followUpDate: "2026-11-12",
      },
    ],
    prescriptions: [],
    insurances: [],
  },
};

export function getHealthForCabinet(cabinetId: string): HealthRecord | null {
  return pickByPreset(cabinetId, DATA, null);
}
