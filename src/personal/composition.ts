/**
 * PersonalPack — композиційний контракт для individual-кабінету.
 * Паралельний до `VerticalPack` (бізнес), але з власною ментальною моделлю:
 * час > гроші, дім > компанія, родина > команда.
 *
 * Sidebar individual-кабінету генерується з `sections` (а не хардкод).
 */

import type { LucideIcon } from "lucide-react";
import {
  Wallet,
  ShoppingBag,
  Gift,
  PiggyBank,
  Home,
  Receipt,
  FileText,
  Target,
  Sparkles,
} from "lucide-react";

export type PersonalSectionId =
  | "finance"
  | "shopping"
  | "loyalty"
  | "savings"
  | "property"
  | "taxes"
  | "documents"
  | "lifeGoals"
  | "assistant";

export interface PersonalSection {
  id: PersonalSectionId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** Where the section routes in URL (relative to /me) */
  path: string;
  /** Optional one-line description for empty states */
  description?: string;
}

export interface PersonalPack {
  id: "default";
  sections: PersonalSection[];
}

export const DEFAULT_PERSONAL_PACK: PersonalPack = {
  id: "default",
  sections: [
    { id: "finance", label: "Фінанси", shortLabel: "Фінанси", icon: Wallet, path: "finance",
      description: "Доходи, витрати, баланс — без бухгалтерського жаргону." },
    { id: "shopping", label: "Покупки і чеки", shortLabel: "Покупки", icon: ShoppingBag, path: "shopping",
      description: "Чеки, гарантії, повернення." },
    { id: "loyalty", label: "Програми лояльності", shortLabel: "Лояльність", icon: Gift, path: "loyalty",
      description: "Бонуси, картки, кешбек." },
    { id: "savings", label: "Накопичення", shortLabel: "Накопичення", icon: PiggyBank, path: "savings",
      description: "Цілі, депозити, резервний фонд." },
    { id: "property", label: "Майно", shortLabel: "Майно", icon: Home, path: "property",
      description: "Житло, авто, цінні речі — облік і податки." },
    { id: "taxes", label: "Податки", shortLabel: "Податки", icon: Receipt, path: "taxes",
      description: "ПДФО, декларація, податкова знижка." },
    { id: "documents", label: "Документи", shortLabel: "Документи", icon: FileText, path: "documents",
      description: "Договори, скани ID, гарантії." },
    { id: "lifeGoals", label: "Життєві цілі", shortLabel: "Цілі", icon: Target, path: "lifeGoals",
      description: "Великі покупки, освіта, родинні плани." },
    { id: "assistant", label: "AI-консьєрж", shortLabel: "AI", icon: Sparkles, path: "assistant",
      description: "Персональний помічник з фінансових питань." },
  ],
};

export function getPersonalPack(): PersonalPack {
  return DEFAULT_PERSONAL_PACK;
}

export function getPersonalSection(id: PersonalSectionId): PersonalSection | null {
  return DEFAULT_PERSONAL_PACK.sections.find((s) => s.id === id) ?? null;
}
