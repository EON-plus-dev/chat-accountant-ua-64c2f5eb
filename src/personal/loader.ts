import type { Cabinet } from "@/types/cabinet";
import { getPersonalPack, type PersonalPack } from "./composition";

export type ResolvedPack =
  | { kind: "personal"; pack: PersonalPack }
  | { kind: "vertical"; cabinet: Cabinet };

/**
 * Розвʼязує який pack відрендерити для кабінету.
 * - individual → Personal Core (9 sections)
 * - fop / tov / інше → Vertical Pack (рендериться існуючим vertical-shell)
 *
 * Поки що повертаємо лише дискримінатор; підключення до існуючих
 * vertical shell-ів — наступний крок.
 */
export function resolvePackForCabinet(cabinet: Cabinet): ResolvedPack {
  if (cabinet.type === "individual") {
    return { kind: "personal", pack: getPersonalPack() };
  }
  return { kind: "vertical", cabinet };
}
