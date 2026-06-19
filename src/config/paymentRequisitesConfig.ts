/**
 * Реквізити для сплати податків ФОП до ДПС.
 *
 * Структура: paymentType → { name, kbk, account_template }
 * IBAN залежить від області — користувач підтверджує/уточнює в кабінеті платника
 * (https://cabinet.tax.gov.ua) перед сплатою.
 *
 * КБК (код бюджетної класифікації) — стабільний по всій країні.
 * Призначення платежу — за шаблоном ДПС: *;101;ЄДРПОУ_платника;опис.
 *
 * Останнє оновлення: 2026-04-21
 */

export type PaymentRequisiteType = "ep" | "esv" | "vz" | "pdfo";

export interface PaymentRequisite {
  /** Назва платежу (для UI) */
  label: string;
  /** Отримувач (загальний шаблон, конкретна ГУК визначається областю реєстрації) */
  recipientTemplate: string;
  /** Код бюджетної класифікації */
  kbk: string;
  /** Шаблон призначення платежу (підставити ЄДРПОУ/ІПН платника та період) */
  purposeTemplate: string;
  /** Примітка/правова підстава */
  note?: string;
}

export const PAYMENT_REQUISITES: Record<PaymentRequisiteType, PaymentRequisite> = {
  ep: {
    label: "Єдиний податок (ФОП)",
    recipientTemplate: "ГУК у [область] / Єдиний податок з фізичних осіб",
    kbk: "18050400",
    purposeTemplate: "*;101;{ipn};Єдиний податок ФОП за {period};{report_id}",
    note: "Сплачується за місцем реєстрації ФОП. Код виду сплати: 101.",
  },
  esv: {
    label: "Єдиний соціальний внесок",
    recipientTemplate: "ГУК у [область] / ЄСВ",
    kbk: "71040000",
    purposeTemplate: "*;101;{ipn};ЄСВ ФОП за {period}",
    note: "Сплачується щоквартально, до 19 числа місяця, наступного за кварталом.",
  },
  vz: {
    label: "Військовий збір (1% для ФОП)",
    recipientTemplate: "ГУК у [область] / Військовий збір",
    kbk: "11011001",
    purposeTemplate: "*;101;{ipn};ВЗ ФОП за {period};{report_id}",
    note: "Ставка 1% від доходу для ФОП всіх груп (ЗУ №4015-IX, з 01.12.2024).",
  },
  pdfo: {
    label: "ПДФО",
    recipientTemplate: "ГУК у [область] / ПДФО",
    kbk: "11010500",
    purposeTemplate: "*;101;{ipn};ПДФО за {period}",
    note: "Загальна ставка 18% від оподатковуваного доходу.",
  },
};

/**
 * Сформувати призначення платежу за шаблоном.
 */
export function buildPaymentPurpose(
  type: PaymentRequisiteType,
  ipn: string,
  period: string,
  reportId?: string,
): string {
  const requisite = PAYMENT_REQUISITES[type];
  return requisite.purposeTemplate
    .replace("{ipn}", ipn || "—")
    .replace("{period}", period || "—")
    .replace("{report_id}", reportId || "—");
}
