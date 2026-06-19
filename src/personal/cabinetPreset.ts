/**
 * Resolver: який пресет Personal-даних повертати для конкретного individual-кабінету.
 *
 * Реальні individual-кабінети в `src/config/cabinetsData.ts`:
 *  - `demo-individual-declarant` (Ткаченко Ольга) — головний демо
 *  - `2` (Коваленко Марія) — бухгалтер-декларант ПДФО
 *  - `8` (Сидоренко Іван)   — орендодавець
 *  - `ind-master-s-*`       — staff-майстри салону (особиста сторона)
 *  - `ind-master-f-*` / `fop-master-f-*` — ФОП-майстри (особиста сторона)
 *
 * Старе ID `demo-individual-1` ніколи не існувало в каталозі — лишали як
 * технічний ключ моків. Тепер мапимо все на 3 пресети.
 */
export type PersonalPreset = "declarant" | "renter" | "master";

export const PRIMARY_INDIVIDUAL_DEMO_ID = "demo-individual-declarant";

const EXPLICIT: Record<string, PersonalPreset> = {
  "demo-individual-declarant": "declarant",
  "2": "declarant",
  "8": "renter",
};

export function resolvePersonalPreset(cabinetId: string): PersonalPreset {
  if (EXPLICIT[cabinetId]) return EXPLICIT[cabinetId];
  if (cabinetId.startsWith("ind-master-") || cabinetId.startsWith("fop-master-")) {
    return "master";
  }
  // Default: повний демо-сценарій, щоб жоден individual-кабінет не лишався порожнім.
  return "declarant";
}

/** Generic lookup: точний ID → пресет → declarant fallback. */
export function pickByPreset<T>(
  cabinetId: string,
  byPreset: Partial<Record<PersonalPreset, T>>,
  fallback: T,
): T {
  const preset = resolvePersonalPreset(cabinetId);
  return byPreset[preset] ?? byPreset.declarant ?? fallback;
}
