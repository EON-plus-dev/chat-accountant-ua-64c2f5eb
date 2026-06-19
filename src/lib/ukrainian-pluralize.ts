/**
 * Ukrainian language pluralization helpers
 * Based on Ukrainian grammar rules for number agreement
 */

/**
 * Pluralize "день" (day)
 * 1 день, 2-4 дні, 5-20 днів, 21 день, 22-24 дні, etc.
 */
export function pluralizeDays(count: number): string {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "днів";
  if (lastDigit === 1) return "день";
  if (lastDigit >= 2 && lastDigit <= 4) return "дні";
  return "днів";
}

/**
 * Pluralize "документ" (document)
 * 1 документ, 2-4 документи, 5-20 документів, etc.
 */
export function pluralizeDocuments(count: number): string {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "документів";
  if (lastDigit === 1) return "документ";
  if (lastDigit >= 2 && lastDigit <= 4) return "документи";
  return "документів";
}

/**
 * Pluralize "година" (hour)
 */
export function pluralizeHours(count: number): string {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "годин";
  if (lastDigit === 1) return "година";
  if (lastDigit >= 2 && lastDigit <= 4) return "години";
  return "годин";
}

/**
 * Generic Ukrainian pluralization.
 * forms = [singular (1, 21, 31...), few (2-4, 22-24...), many (0, 5-20, 25-30...)]
 * Example: pluralizeUk(3, ["курс", "курси", "курсів"]) → "курси"
 */
export function pluralizeUk(count: number, forms: [string, string, string]): string {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return forms[2];
  if (lastDigit === 1) return forms[0];
  if (lastDigit >= 2 && lastDigit <= 4) return forms[1];
  return forms[2];
}

export const pluralizeCourses = (n: number) => pluralizeUk(n, ["курс", "курси", "курсів"]);
export const pluralizeLessons = (n: number) => pluralizeUk(n, ["урок", "уроки", "уроків"]);
export const pluralizeWebinars = (n: number) => pluralizeUk(n, ["вебінар", "вебінари", "вебінарів"]);
export const pluralizeStudents = (n: number) => pluralizeUk(n, ["студент", "студенти", "студентів"]);
export const pluralizeMaterials = (n: number) => pluralizeUk(n, ["матеріал", "матеріали", "матеріалів"]);

/**
 * Format days with short suffix
 * Examples: "1д", "5д", "12д"
 */
export function formatDaysShort(count: number): string {
  return `${count}д`;
}

/**
 * Format days with full word
 * Examples: "1 день", "5 днів", "12 днів"
 */
export function formatDaysFull(count: number): string {
  return `${count} ${pluralizeDays(count)}`;
}
