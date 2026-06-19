/**
 * Утиліти для генерації deep links та QR-кодів для банківських додатків
 * Phase 1: Deep links + QR codes (без API-інтеграції)
 */

import type { TaxPayment, ContractorPayment, BankProvider } from "@/config/paymentsConfig";

// ========== TYPES ==========

export interface BankDeepLinkResult {
  provider: BankProvider;
  deepLink: string | null;
  fallbackUrl: string | null;
  qrData: string;
  isSupported: boolean;
  instructions: string;
}

export interface PaymentQRData {
  iban: string;
  amount: number;
  purpose: string;
  recipientName: string;
  recipientCode: string;
}

// ========== DEEP LINK GENERATORS ==========

/**
 * Генерує deep link для Monobank
 * Monobank підтримує URL-схему для переказів
 */
export function generateMonobankDeepLink(payment: {
  recipientIban?: string;
  amount: number;
  purpose: string;
  recipientName?: string;
}): string | null {
  if (!payment.recipientIban) return null;
  
  const params = new URLSearchParams({
    iban: payment.recipientIban,
    amount: String(payment.amount),
    purpose: payment.purpose,
  });
  
  // Monobank deep link format
  return `monobank://transfer?${params.toString()}`;
}

/**
 * Генерує deep link для Приват24
 * Privat24 підтримує web-based API
 */
export function generatePrivat24DeepLink(payment: {
  recipientIban?: string;
  amount: number;
  purpose: string;
  recipientCode?: string;
}): string | null {
  if (!payment.recipientIban) return null;
  
  const params = new URLSearchParams({
    acc: payment.recipientIban,
    amt: String(payment.amount),
    ccy: "UAH",
    comm: payment.purpose,
  });
  
  if (payment.recipientCode) {
    params.set("edrpou", payment.recipientCode);
  }
  
  // Privat24 web payment form
  return `https://next.privat24.ua/payments/form/index?${params.toString()}`;
}

/**
 * Генерує універсальний deep link для будь-якого банку
 */
export function generateBankDeepLink(
  payment: TaxPayment | ContractorPayment,
  provider: BankProvider
): BankDeepLinkResult {
  const recipientIban = payment.recipientIban || "";
  const amount = "amountToPay" in payment ? payment.amountToPay : payment.amount;
  const purpose = "purpose" in payment ? payment.purpose : "Оплата за рахунком";
  const recipientCode = "budgetCode" in payment ? (payment.budgetCode || "") : "";
  const recipientName = "contractor" in payment ? payment.contractor : "ГУ ДПС";
  
  const paymentData = {
    recipientIban,
    amount,
    purpose,
    recipientCode,
    recipientName,
  };
  
  const qrData = generatePaymentQRString({
    iban: recipientIban,
    amount,
    purpose,
    recipientName,
    recipientCode,
  });
  
  switch (provider) {
    case "monobank":
      return {
        provider,
        deepLink: generateMonobankDeepLink(paymentData),
        fallbackUrl: null,
        qrData,
        isSupported: true,
        instructions: "Відкрийте Monobank → Платежі → Сканувати QR або перейдіть за посиланням",
      };
      
    case "privatbank":
      return {
        provider,
        deepLink: null,
        fallbackUrl: generatePrivat24DeepLink(paymentData),
        qrData,
        isSupported: true,
        instructions: "Відкрийте Приват24 → Платежі → Новий платіж або перейдіть за посиланням",
      };
      
    default:
      return {
        provider,
        deepLink: null,
        fallbackUrl: null,
        qrData,
        isSupported: false,
        instructions: "Скопіюйте реквізити та введіть їх вручну у вашому банківському додатку",
      };
  }
}

// ========== QR CODE DATA ==========

/**
 * Генерує рядок даних для QR-коду у форматі НБУ
 * Формат: ЕМ2U стандарт для платіжних QR-кодів
 */
export function generatePaymentQRString(data: PaymentQRData): string {
  // Simplified QR format compatible with Ukrainian banks
  const lines = [
    `IBAN:${data.iban}`,
    `AMT:${data.amount.toFixed(2)}`,
    `CCY:UAH`,
    `NAME:${data.recipientName}`,
    `CODE:${data.recipientCode}`,
    `PURPOSE:${data.purpose.slice(0, 160)}`, // Max 160 chars for QR
  ];
  
  return lines.join("\n");
}

/**
 * Генерує текст для копіювання реквізитів
 */
export function formatPaymentRequisites(payment: TaxPayment | ContractorPayment): string {
  const lines: string[] = [];
  
  if ("taxTypeLabel" in payment) {
    // Tax payment
    lines.push(`Отримувач: ГУ ДПС у м. Києві`);
    lines.push(`ЄДРПОУ: 44094520`);
    lines.push(`IBAN: ${payment.recipientIban || ""}`);
    lines.push(`Сума: ${formatAmount(payment.amountToPay)}`);
    lines.push(`Призначення: *;101;${payment.budgetCode || ""};${payment.taxTypeLabel} за ${payment.period}`);
  } else {
    // Contractor payment
    lines.push(`Отримувач: ${payment.contractor}`);
    if (payment.contractorCode) {
      lines.push(`ЄДРПОУ/ІПН: ${payment.contractorCode}`);
    }
    lines.push(`IBAN: ${payment.recipientIban || ""}`);
    lines.push(`Сума: ${formatAmount(payment.amount)}`);
    lines.push(`Призначення: ${payment.purpose}`);
  }
  
  return lines.join("\n");
}

/**
 * Визначає підтримку банку для автоматичної оплати
 */
export function isBankSupported(provider: BankProvider): boolean {
  return ["monobank", "privatbank"].includes(provider);
}

/**
 * Отримує список підтримуваних банків
 */
export function getSupportedBanks(): { id: BankProvider; name: string; logo?: string }[] {
  return [
    { id: "monobank", name: "Monobank" },
    { id: "privatbank", name: "Приват24" },
  ];
}

/**
 * Генерує інструкції для користувача
 */
export function getPaymentInstructions(provider: BankProvider): string[] {
  switch (provider) {
    case "monobank":
      return [
        "Відкрийте додаток Monobank",
        "Перейдіть у розділ «Платежі»",
        "Виберіть «Сканувати QR-код» або «Новий платіж»",
        "Підтвердіть реквізити та суму",
        "Підтвердіть оплату",
      ];
      
    case "privatbank":
      return [
        "Відкрийте додаток Приват24",
        "Перейдіть у розділ «Платежі та перекази»",
        "Виберіть «Оплата за реквізитами»",
        "Введіть IBAN отримувача",
        "Вкажіть суму та призначення",
        "Підтвердіть оплату",
      ];
      
    default:
      return [
        "Відкрийте ваш банківський додаток",
        "Створіть новий платіж",
        "Введіть IBAN отримувача",
        "Вкажіть суму та призначення платежу",
        "Перевірте реквізити та підтвердіть оплату",
      ];
  }
}

// ========== WEB-FALLBACK LINKS ДЛЯ БЮДЖЕТНИХ ПЛАТЕЖІВ ==========

/**
 * ЧЕСНЕ ЗАСТЕРЕЖЕННЯ:
 * Ані Monobank, ані Privat24 не мають публічно зареєстрованої URL-схеми
 * вигляду `monobank://transfer?iban=...` або `privat24://pay?...`, яка б
 * автоматично заповнювала платіж до бюджетного IBAN. Тому замість «фейкового»
 * deeplink (silent no-op у браузері) ми ведемо користувача на офіційну web-форму
 * банку та просимо ввести IBAN/суму вручну (або сканувати QR-код, який
 * містить усі реквізити у форматі NBU EMV).
 *
 * Ці функції повертають **web-URL** для відкриття у новій вкладці. Реальна
 * цінність UX: великий QR + «Скопіювати реквізити» одним натиском.
 */

export function buildMonobankWebLink(): string {
  // Універсальна точка входу у веб-Monobank.
  // p2p send-форма не приймає IBAN через query — користувач вибирає «Платежі»
  // або сканує QR із кишені.
  return "https://www.monobank.ua/";
}

export function buildPrivat24WebLink(payment?: {
  iban?: string;
  amount?: number;
  purpose?: string;
  recipientCode?: string;
}): string {
  // Приват24 має web-форму платежу за реквізитами, яка частково підтримує
  // pre-fill через query. Якщо немає даних — ведемо на головну.
  if (!payment?.iban) {
    return "https://next.privat24.ua/";
  }
  const params = new URLSearchParams({
    acc: payment.iban,
    ccy: "UAH",
  });
  if (payment.amount) params.set("amt", String(payment.amount));
  if (payment.purpose) params.set("comm", payment.purpose);
  if (payment.recipientCode) params.set("edrpou", payment.recipientCode);
  return `https://next.privat24.ua/payments/form/index?${params.toString()}`;
}

/**
 * Відкриває банк у новій вкладці. Якщо переданий `appDeepLink` (mono://, privat24://)
 * — спочатку пробує його, потім через 1.2с робить fallback на web-URL.
 * На практиці для бюджетних платежів `appDeepLink` зараз = null,
 * тому одразу відкриваємо web.
 */
export function openBankLink(webUrl: string, appDeepLink?: string | null): void {
  if (typeof window === "undefined") return;
  if (appDeepLink) {
    // Спроба відкрити нативну схему; якщо не зареєстрована — нічого не станеться
    const start = Date.now();
    window.location.href = appDeepLink;
    setTimeout(() => {
      // Якщо користувач лишився в браузері довше за поріг — fallback на web
      if (Date.now() - start < 2000) {
        window.open(webUrl, "_blank", "noopener,noreferrer");
      }
    }, 1200);
    return;
  }
  window.open(webUrl, "_blank", "noopener,noreferrer");
}

// ========== HELPERS ==========

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " грн";
}
