import type { PitchBenefit, PitchSource } from "./types";

export interface BenefitCopy {
  badge: string;       // короткий бейдж зверху
  headline: string;    // основний заголовок
  subhead: string;     // підзаголовок з конкретною цифрою/фактом
  primaryCta: string;
  primaryHint?: string; // дрібна підказка під primary (метод/час)
  secondaryCta: string;
}

/**
 * Адаптивний бенефіт за industry + контекст pitch'у.
 * salon → зручність календаря, tennis_club → крос-бронювання,
 * multi-fop → найсильніше, tax-season → ПДФО.
 */
export function resolveBenefit(industry: string | undefined, source: PitchSource, hasMultiFop = false): PitchBenefit {
  if (hasMultiFop || source === "multi-fop") return "multi-fop-calendar";
  if (source === "tax-season") return "tax-refund";
  switch (industry) {
    case "salon":
      return "convenience-bookings";
    case "tennis_club":
      return "cross-booking-calendar";
    default:
      return "tax-refund";
  }
}

const DEFAULT_PRIMARY = "Створити безкоштовний кабінет";
const DEFAULT_HINT = "Через Дію.Підпис · 30 секунд";
const DEFAULT_SECONDARY = "Надіслати email-посилання";

export function getBenefitCopy(benefit: PitchBenefit, brandName?: string): BenefitCopy {
  const brand = brandName ?? "цього закладу";
  switch (benefit) {
    case "tax-refund":
      return {
        badge: "Безкоштовний кабінет Fintodo",
        headline: "Поверніть до 4 200 ₴ податку за рік",
        subhead:
          "Ми збираємо ваші чеки за медицину, освіту й благодійність — і самі рахуємо податкову знижку. Декларація — за 5 хвилин.",
        primaryCta: DEFAULT_PRIMARY,
        primaryHint: DEFAULT_HINT,
        secondaryCta: DEFAULT_SECONDARY,
      };
    case "convenience-bookings":
      return {
        badge: "Безкоштовний кабінет Fintodo",
        headline: "Усі ваші записи — в одному календарі",
        subhead: `Переносьте і скасовуйте записи у ${brand} без дзвінків. In-app сповіщення замість SMS — і безкоштовно.`,
        primaryCta: DEFAULT_PRIMARY,
        primaryHint: DEFAULT_HINT,
        secondaryCta: DEFAULT_SECONDARY,
      };
    case "cross-booking-calendar":
      return {
        badge: "Безкоштовний кабінет Fintodo",
        headline: "Бронюйте корти й тренування з одного календаря",
        subhead:
          "Бачте всі майбутні візити, переносьте онлайн, отримуйте нагадування за 24 год і 2 год. Без дзвінків.",
        primaryCta: DEFAULT_PRIMARY,
        primaryHint: DEFAULT_HINT,
        secondaryCta: DEFAULT_SECONDARY,
      };
    case "multi-fop-calendar":
      return {
        badge: "Обʼєднайте чеки",
        headline: "У вас уже є чеки від кількох закладів на Fintodo",
        subhead:
          "Зберіть їх в одному кабінеті — для гарантії, ПДФО-знижки і простого пошуку. Без імпорту, ми вже все маємо.",
        primaryCta: "Обʼєднати в один кабінет",
        primaryHint: DEFAULT_HINT,
        secondaryCta: DEFAULT_SECONDARY,
      };
    case "in-app-push-savings":
      return {
        badge: "Безкоштовний кабінет Fintodo",
        headline: "0 ₴ за SMS — сповіщення прямо в застосунку",
        subhead: `${brand} зекономить на SMS, а ви отримаєте миттєві сповіщення з можливістю переносу одним кліком.`,
        primaryCta: DEFAULT_PRIMARY,
        primaryHint: DEFAULT_HINT,
        secondaryCta: DEFAULT_SECONDARY,
      };
  }
}
