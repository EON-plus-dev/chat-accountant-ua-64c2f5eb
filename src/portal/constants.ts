/**
 * Централізовані CTA-цілі для конверсії.
 *
 * Політика (квітень 2026):
 * - Бізнес/Фізособа мають безкоштовний тариф Start (300 кр./міс), тому головний CTA
 *   входу — «Почати безкоштовно» → Start (без trial).
 * - 14-денний trial — лише для Партнерів (у яких немає free tier) і як вторинний
 *   CTA-апсейл для Смарт/Преміум усередині Pricing або в paywall.
 */

export const CTA_START_BUSINESS = "/checkout?plan=start";
export const CTA_START_INDIVIDUAL = "/checkout?plan=free";
export const CTA_TRIAL_PARTNER = "/checkout?plan=pro_agency&trial=true";
export const CTA_TRIAL_SMART_UPGRADE = "/checkout?plan=smart&trial=true";

/**
 * @deprecated Використовуйте `CTA_START_BUSINESS` для бізнесу/входу або
 * `CTA_TRIAL_SMART_UPGRADE` для апсейлу. Залишено для зворотної сумісності.
 */
export const CTA_CHECKOUT_URL = CTA_START_BUSINESS;
