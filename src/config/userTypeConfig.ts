// User-type → onboarding routing & cabinet-type mapping.
// Three primary user types, each with a different identity-verification path.

import type { CabinetTypeOption } from "./addCabinetConfig";
import { CABINET_TYPE_OPTIONS } from "./addCabinetConfig";

export type UserType = "business" | "fop" | "individual";

export interface UserTypeDefinition {
  id: UserType;
  title: string;
  description: string;
  authMethod: "kep" | "diia_signature";
  authMethodLabel: string;
  legalNote: string;
  // Which cabinet types this user can create on first onboarding
  allowedCabinetTypes: Array<CabinetTypeOption["id"]>;
}

export const USER_TYPES: UserTypeDefinition[] = [
  {
    id: "business",
    title: "Бізнес (компанія)",
    description: "Юридична особа: ТОВ, АТ, ПП. Реєстрація — за КЕП керівника або уповноваженої особи.",
    authMethod: "kep",
    authMethodLabel: "КЕП юридичної особи (ЗУ № 2155-VIII)",
    legalNote:
      "Кваліфікований електронний підпис (КЕП) — обов'язковий для дій від імені юрособи. Ключ зберігається у вашого АЦСК або апаратному носії.",
    // Керівник може мати власний ФОП — спільний ІПН з фізособою
    allowedCabinetTypes: ["tov", "fop"],
  },
  {
    id: "fop",
    title: "ФОП",
    description: "Фізична особа-підприємець. Реєстрація через КЕП ФОП або хмарний підпис (Дія).",
    authMethod: "kep",
    authMethodLabel: "КЕП ФОП або хмарний підпис Дія",
    legalNote:
      "Для бізнес-операцій ФОП використовує КЕП. Хмарний підпис через Дія — рівнозначний за юридичною силою.",
    // ФОП = фізособа з підприємницьким статусом, спільний ІПН → дозволяємо individual
    allowedCabinetTypes: ["fop", "individual"],
  },
  {
    id: "individual",
    title: "Фізична особа",
    description: "Без підприємницької діяльності. Особисті фінанси, дивіденди, нерухомість, авто.",
    authMethod: "diia_signature",
    authMethodLabel: "Дія.Підпис",
    legalNote:
      "Для приватних операцій достатньо Дія.Підпису. КЕП теж підходить, якщо ви ним користуєтесь.",
    // Фізособа може зареєструвати власний ФОП — спільний ІПН
    allowedCabinetTypes: ["individual", "fop"],
  },
];

export function getUserTypeById(id: UserType): UserTypeDefinition | undefined {
  return USER_TYPES.find((t) => t.id === id);
}

/** Returns the cabinet-type options available for a given user type. */
export function getCabinetOptionsForUserType(userType: UserType): CabinetTypeOption[] {
  const def = getUserTypeById(userType);
  if (!def) return CABINET_TYPE_OPTIONS;
  return CABINET_TYPE_OPTIONS.filter((opt) => def.allowedCabinetTypes.includes(opt.id));
}

/** Suggests a default user type from a freshly created account. UI can override. */
export function inferUserTypeFromCabinetType(
  cabinetType: CabinetTypeOption["id"]
): UserType {
  if (cabinetType === "tov") return "business";
  if (cabinetType === "individual") return "individual";
  return "fop";
}
