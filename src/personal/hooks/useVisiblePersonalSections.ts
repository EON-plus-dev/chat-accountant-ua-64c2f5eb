import { getPersonalPack, type PersonalSection, type PersonalSectionId } from "@/personal/composition";
import type { Cabinet } from "@/types/cabinet";

const ACCOUNTANT_VISIBLE: PersonalSectionId[] = ["taxes", "documents"];
const AUDITOR_VISIBLE: PersonalSectionId[] = ["documents"];

/**
 * Visibility of PersonalPack sections per cabinet role.
 * - owner: всі 9
 * - accountant (делегований бухгалтер): taxes + documents
 * - auditor: documents (read-only)
 */
export function useVisiblePersonalSections(role: Cabinet["role"]): PersonalSection[] {
  const all = getPersonalPack().sections;
  if (role === "accountant") return all.filter((s) => ACCOUNTANT_VISIBLE.includes(s.id));
  if (role === "auditor") return all.filter((s) => AUDITOR_VISIBLE.includes(s.id));
  return all;
}

export function isPersonalSectionVisible(
  sectionId: PersonalSectionId,
  role: Cabinet["role"],
): boolean {
  if (role === "owner") return true;
  if (role === "accountant") return ACCOUNTANT_VISIBLE.includes(sectionId);
  return AUDITOR_VISIBLE.includes(sectionId);
}
