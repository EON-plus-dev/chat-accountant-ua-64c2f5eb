import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

export type PersonalDocCategory =
  | "personal"
  | "diia"
  | "tax"
  | "property"
  | "contracts"
  | "insurance"
  | "medical"
  | "archive";

export interface PersonalDocument {
  id: string;
  title: string;
  category: PersonalDocCategory;
  issuedAt: string;
  expiresAt?: string;
  source: string;
  signed?: boolean;
}

const DATA: Partial<Record<PersonalPreset, PersonalDocument[]>> = {
  declarant: [
    { id: "d1", title: "ID-картка (паспорт)", category: "personal", issuedAt: "2018-04-10", expiresAt: "2028-04-10", source: "МВС" },
    { id: "d2", title: "Закордонний паспорт", category: "personal", issuedAt: "2020-07-22", expiresAt: "2030-07-22", source: "МВС" },
    { id: "d3", title: "Водійське посвідчення", category: "diia", issuedAt: "2019-09-12", expiresAt: "2029-09-12", source: "Дія" },
    { id: "d4", title: "Свідоцтво про реєстрацію авто", category: "diia", issuedAt: "2023-05-04", source: "Дія" },
    { id: "d5", title: "Декларація про доходи за 2025 р.", category: "tax", issuedAt: "2026-02-14", source: "ДПС", signed: true },
    { id: "d6", title: "Витяг про сплачені податки", category: "tax", issuedAt: "2026-01-10", source: "ДПС" },
    { id: "d7", title: "Свідоцтво про право власності (кв.)", category: "property", issuedAt: "2021-11-30", source: "Нотаріус" },
    { id: "d8", title: "Технічний паспорт квартири", category: "property", issuedAt: "2021-11-30", source: "БТІ" },
    { id: "d9", title: "Договір оренди гаража", category: "contracts", issuedAt: "2025-03-01", expiresAt: "2027-03-01", source: "Контрагент", signed: true },
    { id: "d10", title: "Договір з тренером з тенісу", category: "contracts", issuedAt: "2026-01-15", source: "Контрагент" },
    { id: "d11", title: "Поліс ДМС INGO", category: "insurance", issuedAt: "2026-01-15", expiresAt: "2027-01-15", source: "INGO" },
    { id: "d12", title: "Поліс ОСЦПВ — Toyota CHR", category: "insurance", issuedAt: "2025-07-01", expiresAt: "2026-07-01", source: "ARX" },
    { id: "d13", title: "Виписка з амбулаторної картки", category: "medical", issuedAt: "2026-03-18", source: "Добробут" },
    { id: "d14", title: "Результати аналізів — березень", category: "medical", issuedAt: "2026-03-18", source: "Сінево" },
    { id: "d15", title: "Старий трудовий договір (2019)", category: "archive", issuedAt: "2019-02-01", source: "Архів" },
  ],
  renter: [
    { id: "dr1", title: "ID-картка (паспорт)", category: "personal", issuedAt: "2016-03-12", expiresAt: "2026-03-12", source: "МВС" },
    { id: "dr2", title: "Водійське посвідчення", category: "diia", issuedAt: "2018-06-10", expiresAt: "2028-06-10", source: "Дія" },
    { id: "dr3", title: "Свідоцтво про право власності (кв. на оренду)", category: "property", issuedAt: "2014-09-08", source: "Нотаріус" },
    { id: "dr4", title: "Технічний паспорт квартири", category: "property", issuedAt: "2014-09-08", source: "БТІ" },
    { id: "dr5", title: "Договір оренди — орендар Іванов І.І.", category: "contracts", issuedAt: "2025-01-15", expiresAt: "2026-01-15", source: "Контрагент", signed: true },
    { id: "dr6", title: "Договір оренди — орендар Петров П.П.", category: "contracts", issuedAt: "2025-09-01", expiresAt: "2026-09-01", source: "Контрагент", signed: true },
    { id: "dr7", title: "Декларація про доходи за 2025 р.", category: "tax", issuedAt: "2026-02-20", source: "ДПС", signed: true },
    { id: "dr8", title: "Поліс ОСЦПВ", category: "insurance", issuedAt: "2025-05-01", expiresAt: "2026-05-01", source: "UNIQA" },
  ],
  master: [
    { id: "dm1", title: "ID-картка (паспорт)", category: "personal", issuedAt: "2019-07-04", expiresAt: "2029-07-04", source: "МВС" },
    { id: "dm2", title: "Кваліфікаційний сертифікат", category: "personal", issuedAt: "2023-05-20", source: "Навчальний центр" },
    { id: "dm3", title: "Медична книжка", category: "medical", issuedAt: "2025-11-12", expiresAt: "2026-11-12", source: "Поліклініка №3" },
    { id: "dm4", title: "Договір про надання послуг (салон)", category: "contracts", issuedAt: "2025-03-01", source: "Контрагент", signed: true },
  ],
};

export function getDocumentsForPersonalCabinet(cabinetId: string): PersonalDocument[] {
  return pickByPreset(cabinetId, DATA, []);
}

export function getDocumentsByCategory(cabinetId: string, category: PersonalDocCategory): PersonalDocument[] {
  return getDocumentsForPersonalCabinet(cabinetId).filter((d) => d.category === category);
}
