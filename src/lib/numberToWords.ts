/**
 * Number to Words Utility
 * Converts numeric amounts to Ukrainian words with proper grammatical forms
 */

const units = ["", "одна", "дві", "три", "чотири", "п'ять", "шість", "сім", "вісім", "дев'ять"];
const unitsM = ["", "один", "два", "три", "чотири", "п'ять", "шість", "сім", "вісім", "дев'ять"];
const teens = ["десять", "одинадцять", "дванадцять", "тринадцять", "чотирнадцять", "п'ятнадцять", "шістнадцять", "сімнадцять", "вісімнадцять", "дев'ятнадцять"];
const tens = ["", "", "двадцять", "тридцять", "сорок", "п'ятдесят", "шістдесят", "сімдесят", "вісімдесят", "дев'яносто"];
const hundreds = ["", "сто", "двісті", "триста", "чотириста", "п'ятсот", "шістсот", "сімсот", "вісімсот", "дев'ятсот"];
const thousands = ["тисяча", "тисячі", "тисяч"];
const millions = ["мільйон", "мільйони", "мільйонів"];

/**
 * Get correct form for a number (for plural forms)
 */
function getForm(n: number, forms: string[]): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 19) return forms[2];
  const last = n % 10;
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

/**
 * Convert a number under 1000 to words
 * @param num - number < 1000
 * @param feminine - use feminine forms (одна, дві) vs masculine (один, два)
 */
function convertHundreds(num: number, feminine = true): string {
  if (num === 0) return "";
  
  const arr = feminine ? units : unitsM;
  
  if (num < 10) return arr[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return `${tens[ten]}${unit > 0 ? " " + arr[unit] : ""}`;
  }
  
  const h = Math.floor(num / 100);
  const remainder = num % 100;
  return `${hundreds[h]}${remainder > 0 ? " " + convertHundreds(remainder, feminine) : ""}`;
}

/**
 * Convert a number to Ukrainian words
 * Handles numbers up to millions
 */
export function numberToWords(num: number): string {
  if (num === 0) return "нуль";
  if (num < 0) return `мінус ${numberToWords(Math.abs(num))}`;
  
  const parts: string[] = [];
  
  // Millions
  if (num >= 1000000) {
    const mil = Math.floor(num / 1000000);
    parts.push(`${convertHundreds(mil, false)} ${getForm(mil, millions)}`);
    num %= 1000000;
  }
  
  // Thousands (feminine: одна тисяча, дві тисячі)
  if (num >= 1000) {
    const th = Math.floor(num / 1000);
    parts.push(`${convertHundreds(th, true)} ${getForm(th, thousands)}`);
    num %= 1000;
  }
  
  // Hundreds, tens, units
  if (num > 0) {
    parts.push(convertHundreds(num, true));
  }
  
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Convert amount to Ukrainian words with hryvnias and kopecks
 */
export function numberToWordsUkrainian(amount: number): string {
  const intPart = Math.floor(Math.abs(amount));
  const decPart = Math.round((Math.abs(amount) - intPart) * 100);
  
  const hryvniaForms = ["гривня", "гривні", "гривень"];
  const kopForms = ["копійка", "копійки", "копійок"];
  
  const intWords = numberToWords(intPart);
  const hryvniaForm = getForm(intPart, hryvniaForms);
  const kopForm = getForm(decPart, kopForms);
  
  const prefix = amount < 0 ? "мінус " : "";
  
  return `${prefix}${intWords} ${hryvniaForm} ${decPart.toString().padStart(2, "0")} ${kopForm}`;
}

/**
 * Capitalize first letter of a string
 */
export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
