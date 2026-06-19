// Спільні валідатори для бізнес-сутностей України

/**
 * Валідація ЄДРПОУ (8 цифр з контрольною сумою)
 * Алгоритм: https://uk.wikipedia.org/wiki/Код_ЄДРПОУ
 */
export const validateEdrpou = (code: string): boolean => {
  if (!/^\d{8}$/.test(code)) return false;
  
  const digits = code.split('').map(Number);
  
  // Перша спроба з вагами 1-7
  const weights1 = [1, 2, 3, 4, 5, 6, 7];
  let sum = weights1.reduce((acc, w, i) => acc + w * digits[i], 0);
  let control = sum % 11;
  
  // Якщо результат >= 10, використовуємо ваги 3-9
  if (control >= 10) {
    const weights2 = [3, 4, 5, 6, 7, 8, 9];
    sum = weights2.reduce((acc, w, i) => acc + w * digits[i], 0);
    control = sum % 11;
    if (control >= 10) control = 0;
  }
  
  return control === digits[7];
};

/**
 * Валідація ІПН/РНОКПП (10 цифр з контрольною сумою)
 * Алгоритм перевірки контрольної суми
 */
export const validateIpn = (code: string): boolean => {
  if (!/^\d{10}$/.test(code)) return false;
  
  const digits = code.split('').map(Number);
  const weights = [-1, 5, 7, 9, 4, 6, 10, 5, 7];
  
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  const control = (sum % 11) % 10;
  
  return control === digits[9];
};

/**
 * Валідація українського IBAN (UA + 27 цифр)
 * Алгоритм MOD-97 згідно ISO 13616
 */
export const validateIban = (iban: string): boolean => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  
  // Український IBAN: UA + 27 цифр = 29 символів
  if (!/^UA\d{27}$/.test(cleaned)) return false;
  
  // MOD-97 перевірка згідно ISO 7064:
  // 1. Переносимо перші 4 символи (UA + 2 контрольні цифри) в кінець
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  
  // 2. Замінюємо літери на числа: A=10, B=11, ..., U=30, ..., Z=35
  const numeric = rearranged.replace(/[A-Z]/g, (char) => 
    (char.charCodeAt(0) - 55).toString()
  );
  
  // 3. Обчислюємо MOD-97 для великого числа (посимвольно)
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + parseInt(digit, 10)) % 97;
  }
  
  // Результат має дорівнювати 1
  return remainder === 1;
};

/**
 * Валідація українського номера телефону
 * Формат: +380XXXXXXXXX (12 цифр)
 */
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+380\d{9}$/.test(cleaned);
};

/**
 * Валідація email
 */
export const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(email);
};

/**
 * Валідація коду КВЕД
 * Формат: XX.XX
 */
export const validateKved = (kved: string): boolean => {
  return /^\d{2}\.\d{2}$/.test(kved);
};

/**
 * Валідація ПІБ (українською)
 * Формат: Прізвище Ім'я По-батькові (з апострофами та дефісами)
 */
export const validateFullName = (name: string): boolean => {
  // Мінімум 2 слова (Прізвище Ім'я), максимум 4 (подвійне прізвище + ім'я + по-батькові)
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2 || parts.length > 4) return false;
  
  // Кожне слово має починатися з великої літери
  const wordPattern = /^[А-ЯІЇЄҐ][а-яіїєґ'ʼ']+(-[А-ЯІЇЄҐ][а-яіїєґ'ʼ']+)?$/;
  return parts.every(part => wordPattern.test(part));
};

/**
 * Валідація назви підприємства
 */
export const validateCompanyName = (name: string): boolean => {
  if (name.length < 3 || name.length > 200) return false;
  // Дозволені: літери (укр/англ), цифри, пробіли, лапки, дефіс, крапка
  return /^[А-ЯІЇЄҐа-яіїєґA-Za-z0-9\s"'«»\-\.]+$/.test(name);
};

/**
 * Валідація поштового індексу України
 * 5 цифр
 */
export const validatePostalCode = (code: string): boolean => {
  return /^\d{5}$/.test(code);
};

/**
 * Валідація номера ПДВ
 * Формат: 12 цифр (де перші 10 — ІПН платника)
 * 
 * Примітка: Номер ПДВ складається з ІПН (10 цифр) + 2 службові цифри ДПС.
 * Контрольна сума перевіряється тільки для перших 10 цифр (ІПН частина).
 */
export const validateVatNumber = (vatNumber: string): boolean => {
  if (!/^\d{12}$/.test(vatNumber)) return false;
  
  // Перевіряємо перші 10 цифр як ІПН
  const ipnPart = vatNumber.slice(0, 10);
  return validateIpn(ipnPart);
};

/**
 * Отримати опис помилки для номера ПДВ
 */
export const getVatValidationError = (vatNumber: string): string | null => {
  if (!vatNumber) return 'Обов\'язкове поле';
  if (!/^\d+$/.test(vatNumber)) return 'Тільки цифри';
  if (vatNumber.length !== 12) return 'Номер ПДВ має містити 12 цифр';
  
  // Перевіряємо ІПН частину (перші 10 цифр)
  const ipnPart = vatNumber.slice(0, 10);
  if (!validateIpn(ipnPart)) {
    return 'Невірна контрольна сума ІПН частини';
  }
  
  return null;
};

/**
 * Отримати опис помилки для ПІБ
 */
export const getFullNameValidationError = (name: string): string | null => {
  if (!name) return 'Обов\'язкове поле';
  const trimmed = name.trim();
  if (trimmed.length < 5) return 'Вкажіть повне ПІБ';
  
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return 'Формат: Прізвище Імʼя';
  if (parts.length > 4) return 'Занадто багато слів';
  
  const wordPattern = /^[А-ЯІЇЄҐ][а-яіїєґ'ʼ']+(-[А-ЯІЇЄҐ][а-яіїєґ'ʼ']+)?$/;
  for (const part of parts) {
    if (!wordPattern.test(part)) {
      return 'Кожне слово з великої літери (кирилиця)';
    }
  }
  return null;
};

/**
 * Перевірка коду (ЄДРПОУ або ІПН) залежно від типу суб'єкта
 */
export const validateBusinessCode = (code: string, entityType: 'tov' | 'fop' | 'individual'): boolean => {
  if (entityType === 'tov') {
    return validateEdrpou(code);
  }
  return validateIpn(code);
};

/**
 * Отримати опис помилки для коду
 */
export const getCodeValidationError = (code: string, entityType: 'tov' | 'fop' | 'individual'): string | null => {
  if (!code) return 'Обов\'язкове поле';
  
  if (entityType === 'tov') {
    if (!/^\d+$/.test(code)) return 'Тільки цифри';
    if (code.length !== 8) return 'ЄДРПОУ має містити 8 цифр';
    if (!validateEdrpou(code)) return 'Невірна контрольна сума ЄДРПОУ';
    return null;
  }
  
  if (!/^\d+$/.test(code)) return 'Тільки цифри';
  if (code.length !== 10) return 'ІПН має містити 10 цифр';
  if (!validateIpn(code)) return 'Невірна контрольна сума ІПН';
  return null;
};

/**
 * Отримати опис помилки для IBAN
 */
export const getIbanValidationError = (iban: string): string | null => {
  if (!iban) return null; // Опціональне поле
  
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  
  if (!cleaned.startsWith('UA')) return 'IBAN має починатися з UA';
  if (!/^UA\d+$/.test(cleaned)) return 'Після UA мають бути лише цифри';
  if (cleaned.length !== 29) return 'IBAN має містити 29 символів (UA + 27 цифр)';
  if (!validateIban(cleaned)) return 'Невірна контрольна сума IBAN';
  return null;
};
