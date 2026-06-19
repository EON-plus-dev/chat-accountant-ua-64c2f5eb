// API для верифікації даних у державних реєстрах України
// TODO: Замінити mock-реалізації на реальні API інтеграції

import { validateEdrpou, validateIpn, validateIban } from './validators';

export type VerificationStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'not-found' | 'error';

export interface VerificationResult {
  status: VerificationStatus;
  source: 'edr' | 'vat' | 'singleTax' | 'format';
  message?: string;
  data?: {
    name?: string;
    status?: 'active' | 'suspended' | 'terminated';
    registrationDate?: string;
    taxGroup?: number;
    taxRate?: number;
    isVatPayer?: boolean;
  };
}

/**
 * Перевірка ЄДРПОУ/ІПН у Єдиному державному реєстрі
 */
export const verifyInEDR = async (code: string, entityType: 'tov' | 'fop'): Promise<VerificationResult> => {
  // Локальна валідація формату
  const isEdrpou = entityType === 'tov';
  const isValidFormat = isEdrpou ? validateEdrpou(code) : validateIpn(code);
  
  if (!isValidFormat) {
    return {
      status: 'invalid',
      source: 'format',
      message: isEdrpou 
        ? 'Невірний формат ЄДРПОУ (8 цифр з контрольною сумою)'
        : 'Невірний формат ІПН (10 цифр з контрольною сумою)',
    };
  }
  
  // TODO: Реальний API запит до ЄДР
  // Імітуємо затримку API
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock: коди що закінчуються на 00 — "не знайдено" для тестування
  if (code.endsWith('00')) {
    return {
      status: 'not-found',
      source: 'edr',
      message: 'Код не знайдено в ЄДР',
    };
  }
  
  // Mock: коди що закінчуються на 99 — "призупинено"
  if (code.endsWith('99')) {
    return {
      status: 'valid',
      source: 'edr',
      message: 'Знайдено в ЄДР (діяльність призупинено)',
      data: {
        status: 'suspended',
        registrationDate: '2018-03-20',
      },
    };
  }
  
  // Mock: валідний формат = знайдено в реєстрі
  return {
    status: 'valid',
    source: 'edr',
    message: 'Знайдено в ЄДР',
    data: {
      status: 'active',
      registrationDate: '2020-01-15',
    },
  };
};

/**
 * Перевірка статусу платника ПДВ
 */
export const verifyVatStatus = async (code: string): Promise<VerificationResult> => {
  // Локальна валідація
  const isValidEdrpou = validateEdrpou(code);
  const isValidIpn = validateIpn(code);
  
  if (!isValidEdrpou && !isValidIpn) {
    return {
      status: 'invalid',
      source: 'format',
      message: 'Невірний формат коду',
    };
  }
  
  // TODO: Реальний API запит до реєстру ПДВ
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Mock
  return {
    status: 'valid',
    source: 'vat',
    data: {
      isVatPayer: false,
    },
  };
};

/**
 * Перевірка статусу платника єдиного податку
 */
export const verifySingleTaxStatus = async (code: string): Promise<VerificationResult> => {
  // Локальна валідація
  const isValidIpn = validateIpn(code);
  
  if (!isValidIpn) {
    return {
      status: 'invalid',
      source: 'format',
      message: 'Невірний формат ІПН',
    };
  }
  
  // TODO: Реальний API запит до реєстру ЄП
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock
  return {
    status: 'valid',
    source: 'singleTax',
    data: {
      taxGroup: 3,
      taxRate: 5,
    },
  };
};

/**
 * Перевірка IBAN
 */
export const verifyIban = (iban: string): VerificationResult => {
  if (!iban) {
    return { status: 'idle', source: 'format' };
  }
  
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  
  if (!validateIban(cleaned)) {
    return {
      status: 'invalid',
      source: 'format',
      message: 'Невірний формат IBAN',
    };
  }
  
  return {
    status: 'valid',
    source: 'format',
    message: 'Формат IBAN коректний',
  };
};

/**
 * Комплексна перевірка всіх полів
 */
export interface FieldValidation {
  field: string;
  isValid: boolean;
  error?: string;
  isVerifying?: boolean;
}

export const validateAllFields = (
  data: Record<string, any>,
  entityType: 'tov' | 'fop'
): FieldValidation[] => {
  const validations: FieldValidation[] = [];
  
  // Назва
  if (!data.name || data.name.length < 3) {
    validations.push({ field: 'name', isValid: false, error: 'Мінімум 3 символи' });
  } else {
    validations.push({ field: 'name', isValid: true });
  }
  
  // Код (ЄДРПОУ/ІПН)
  const isValidCode = entityType === 'tov' 
    ? validateEdrpou(data.code || '')
    : validateIpn(data.code || '');
  
  validations.push({
    field: 'code',
    isValid: isValidCode,
    error: isValidCode ? undefined : (entityType === 'tov' ? 'Невірний ЄДРПОУ' : 'Невірний ІПН'),
  });
  
  // Адреса
  if (!data.address || data.address.length < 10) {
    validations.push({ field: 'address', isValid: false, error: 'Вкажіть повну адресу' });
  } else {
    validations.push({ field: 'address', isValid: true });
  }
  
  // Керівник
  if (!data.director || data.director.length < 5) {
    validations.push({ field: 'director', isValid: false, error: 'Вкажіть ПІБ керівника' });
  } else {
    validations.push({ field: 'director', isValid: true });
  }
  
  // IBAN (опціонально)
  if (data.iban) {
    const isValidIban = validateIban(data.iban);
    validations.push({
      field: 'iban',
      isValid: isValidIban,
      error: isValidIban ? undefined : 'Невірний формат IBAN',
    });
  }
  
  return validations;
};
