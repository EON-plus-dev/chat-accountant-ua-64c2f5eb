/**
 * Mock-сім'я для individual-кабінетів. Уся передача доступу — через
 * `delegation_contracts` (поки що не створюються), тут лише презентаційний шар.
 * Ключі — пресети з `cabinetPreset.ts`.
 */
import { pickByPreset, type PersonalPreset } from "../cabinetPreset";
export type FamilyRole = "spouse" | "child" | "parent" | "sibling";

export interface FamilyMember {
  id: string;
  name: string;
  shortName: string;
  role: FamilyRole;
  roleLabel: string;
  age?: number;
  birthYear?: number;
  initials: string;
  /** Кольоровий акцент аватара через семантичний токен. */
  accent: "primary" | "amber" | "emerald" | "sky" | "violet";
  /** Які розділи цей член сім'ї бачить у вашому кабінеті (read-only мок). */
  sharedAccess: Array<"budget" | "documents" | "goals" | "health" | "calendar">;
  status: "active" | "invitation_pending";
  lastSeenLabel?: string;
}

const FAMILY: Partial<Record<PersonalPreset, FamilyMember[]>> = {
  declarant: [
    {
      id: "fm-spouse",
      name: "Олена Шевченко",
      shortName: "Олена",
      role: "spouse",
      roleLabel: "Дружина",
      age: 34,
      birthYear: 1992,
      initials: "ОШ",
      accent: "violet",
      sharedAccess: ["budget", "documents", "goals", "calendar"],
      status: "active",
      lastSeenLabel: "сьогодні о 09:14",
    },
    {
      id: "fm-son",
      name: "Артем Шевченко",
      shortName: "Артем",
      role: "child",
      roleLabel: "Син",
      age: 8,
      birthYear: 2018,
      initials: "АШ",
      accent: "sky",
      sharedAccess: ["documents", "health", "calendar"],
      status: "active",
    },
    {
      id: "fm-daughter",
      name: "Софія Шевченко",
      shortName: "Софія",
      role: "child",
      roleLabel: "Донька",
      age: 5,
      birthYear: 2021,
      initials: "СШ",
      accent: "amber",
      sharedAccess: ["documents", "health"],
      status: "active",
    },
    {
      id: "fm-father",
      name: "Михайло Шевченко",
      shortName: "Батько",
      role: "parent",
      roleLabel: "Батько",
      age: 64,
      birthYear: 1962,
      initials: "МШ",
      accent: "emerald",
      sharedAccess: ["documents"],
      status: "active",
      lastSeenLabel: "вчора о 18:22",
    },
  ],
  renter: [
    {
      id: "fm-renter-spouse",
      name: "Тетяна Сидоренко",
      shortName: "Тетяна",
      role: "spouse",
      roleLabel: "Дружина",
      age: 47,
      birthYear: 1979,
      initials: "ТС",
      accent: "violet",
      sharedAccess: ["documents", "calendar"],
      status: "active",
      lastSeenLabel: "сьогодні о 08:40",
    },
  ],
  master: [],
};

export function getFamilyMembersForCabinet(cabinetId: string): FamilyMember[] {
  return pickByPreset(cabinetId, FAMILY, []);
}
