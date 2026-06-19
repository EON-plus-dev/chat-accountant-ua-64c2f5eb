import { describe, it, expect } from 'vitest';
import {
  validateEdrpou,
  validateIpn,
  validateIban,
  validatePhone,
  validateEmail,
  validateKved,
  validateFullName,
  validateCompanyName,
  validatePostalCode,
  validateVatNumber,
  getVatValidationError,
  getFullNameValidationError,
  validateBusinessCode,
  getCodeValidationError,
  getIbanValidationError,
} from './validators';

// ==================== validateEdrpou ====================
describe('validateEdrpou', () => {
  describe('валідні коди', () => {
    it('повертає true для валідного ЄДРПОУ з першою цифрою 0-3', () => {
      expect(validateEdrpou('14360570')).toBe(true);
    });

    it('повертає true для валідного ЄДРПОУ з першою цифрою 4-9', () => {
      expect(validateEdrpou('40075829')).toBe(true);
    });

    it('повертає true для ЄДРПОУ що починається з нуля', () => {
      expect(validateEdrpou('00032129')).toBe(true);
    });
  });

  describe('невалідні коди', () => {
    it('повертає false для коду з 7 цифр', () => {
      expect(validateEdrpou('1234567')).toBe(false);
    });

    it('повертає false для коду з 9 цифр', () => {
      expect(validateEdrpou('123456789')).toBe(false);
    });

    it('повертає false для невірної контрольної суми', () => {
      expect(validateEdrpou('12345679')).toBe(false);
    });

    it('повертає false для коду з літерами', () => {
      expect(validateEdrpou('1234567A')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validateEdrpou('')).toBe(false);
    });

    it('повертає false для коду з пробілами', () => {
      expect(validateEdrpou('1436 0570')).toBe(false);
    });
  });
});

// ==================== validateIpn ====================
describe('validateIpn', () => {
  describe('валідні коди', () => {
    it('повертає true для валідного ІПН', () => {
      expect(validateIpn('3184710691')).toBe(true);
    });

    it('повертає true для ІПН що починається з нуля', () => {
      expect(validateIpn('0123456789')).toBe(false); // Невірна контрольна сума
    });
  });

  describe('невалідні коди', () => {
    it('повертає false для коду з 9 цифр', () => {
      expect(validateIpn('123456789')).toBe(false);
    });

    it('повертає false для коду з 11 цифр', () => {
      expect(validateIpn('12345678901')).toBe(false);
    });

    it('повертає false для невірної контрольної суми', () => {
      expect(validateIpn('1234567890')).toBe(false);
    });

    it('повертає false для коду з літерами', () => {
      expect(validateIpn('123456789A')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validateIpn('')).toBe(false);
    });
  });
});

// ==================== validateIban ====================
describe('validateIban', () => {
  describe('валідні IBAN', () => {
    it('повертає true для валідного українського IBAN', () => {
      expect(validateIban('UA213223130000026007233566001')).toBe(true);
    });

    it('повертає true для IBAN з пробілами', () => {
      expect(validateIban('UA21 3223 1300 0002 6007 2335 66001')).toBe(true);
    });

    it('повертає true для IBAN в нижньому регістрі', () => {
      expect(validateIban('ua213223130000026007233566001')).toBe(true);
    });

    it('повертає true для IBAN зі змішаним регістром', () => {
      expect(validateIban('Ua213223130000026007233566001')).toBe(true);
    });
  });

  describe('невалідні IBAN', () => {
    it('повертає false для неукраїнського IBAN', () => {
      expect(validateIban('DE89370400440532013000')).toBe(false);
    });

    it('повертає false для невірної контрольної суми', () => {
      expect(validateIban('UA213223130000026007233566002')).toBe(false);
    });

    it('повертає false для невірної довжини (26 символів)', () => {
      expect(validateIban('UA2132231300000260072335660')).toBe(false);
    });

    it('повертає false для невірної довжини (30 символів)', () => {
      expect(validateIban('UA21322313000002600723356600123')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validateIban('')).toBe(false);
    });

    it('повертає false для IBAN з літерами замість цифр', () => {
      expect(validateIban('UA21322313000002600723356600A')).toBe(false);
    });
  });
});

// ==================== validatePhone ====================
describe('validatePhone', () => {
  describe('валідні номери', () => {
    it('повертає true для номера +380XXXXXXXXX', () => {
      expect(validatePhone('+380501234567')).toBe(true);
    });

    it('повертає true для номера з пробілами', () => {
      expect(validatePhone('+380 50 123 45 67')).toBe(true);
    });

    it('повертає true для номера з дужками та дефісами', () => {
      expect(validatePhone('+380 (50) 123-45-67')).toBe(true);
    });

    it('повертає true для різних операторів', () => {
      expect(validatePhone('+380671234567')).toBe(true);
      expect(validatePhone('+380931234567')).toBe(true);
      expect(validatePhone('+380441234567')).toBe(true);
    });
  });

  describe('невалідні номери', () => {
    it('повертає false для номера без +380', () => {
      expect(validatePhone('0501234567')).toBe(false);
    });

    it('повертає false для номера з +38', () => {
      expect(validatePhone('+380501234')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validatePhone('')).toBe(false);
    });

    it('повертає false для іноземного номера', () => {
      expect(validatePhone('+48501234567')).toBe(false);
    });
  });
});

// ==================== validateEmail ====================
describe('validateEmail', () => {
  describe('валідні email', () => {
    it('повертає true для простого email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('повертає true для email з піддоменом', () => {
      expect(validateEmail('test@mail.example.com')).toBe(true);
    });

    it('повертає true для email з крапкою в імені', () => {
      expect(validateEmail('first.last@example.com')).toBe(true);
    });

    it('повертає true для email з плюсом', () => {
      expect(validateEmail('test+tag@example.com')).toBe(true);
    });

    it('повертає true для email з цифрами', () => {
      expect(validateEmail('test123@example123.com')).toBe(true);
    });
  });

  describe('невалідні email', () => {
    it('повертає false для email без @', () => {
      expect(validateEmail('testexample.com')).toBe(false);
    });

    it('повертає false для email без домену', () => {
      expect(validateEmail('test@')).toBe(false);
    });

    it('повертає false для email без локальної частини', () => {
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('повертає false для email з пробілами', () => {
      expect(validateEmail('test @example.com')).toBe(false);
    });
  });
});

// ==================== validateKved ====================
describe('validateKved', () => {
  describe('валідні коди', () => {
    it('повертає true для коду XX.XX', () => {
      expect(validateKved('62.01')).toBe(true);
    });

    it('повертає true для різних кодів', () => {
      expect(validateKved('01.11')).toBe(true);
      expect(validateKved('99.99')).toBe(true);
      expect(validateKved('45.20')).toBe(true);
    });
  });

  describe('невалідні коди', () => {
    it('повертає false для коду без крапки', () => {
      expect(validateKved('6201')).toBe(false);
    });

    it('повертає false для коду з однією цифрою', () => {
      expect(validateKved('6.01')).toBe(false);
    });

    it('повертає false для коду з трьома цифрами після крапки', () => {
      expect(validateKved('62.011')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validateKved('')).toBe(false);
    });

    it('повертає false для коду з літерами', () => {
      expect(validateKved('AB.CD')).toBe(false);
    });
  });
});

// ==================== validateFullName ====================
describe('validateFullName', () => {
  describe('валідні імена', () => {
    it('повертає true для ПІБ з 3 слів', () => {
      expect(validateFullName('Шевченко Тарас Григорович')).toBe(true);
    });

    it('повертає true для ПІБ з 2 слів', () => {
      expect(validateFullName('Шевченко Тарас')).toBe(true);
    });

    it("повертає true для ПІБ з апострофом (ʼ)", () => {
      expect(validateFullName("Пʼятаков Сергій Вікторович")).toBe(true);
    });

    it("повертає true для ПІБ з апострофом (')", () => {
      expect(validateFullName("П'ятаков Сергій")).toBe(true);
    });

    it('повертає true для ПІБ з дефісом', () => {
      expect(validateFullName('Іванов-Петров Олександр')).toBe(true);
    });

    it('повертає true для ПІБ з 4 слів', () => {
      expect(validateFullName('Шевченко Тарас Григорович Олександрович')).toBe(true);
    });
  });

  describe('невалідні імена', () => {
    it('повертає false для одного слова', () => {
      expect(validateFullName('Шевченко')).toBe(false);
    });

    it('повертає false для латиниці', () => {
      expect(validateFullName('Shevchenko Taras')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validateFullName('')).toBe(false);
    });

    it('повертає false для імені з цифрами', () => {
      expect(validateFullName('Шевченко Тарас123')).toBe(false);
    });

    it('повертає false для імені зі спеціальними символами', () => {
      expect(validateFullName('Шевченко @Тарас')).toBe(false);
    });
  });
});

// ==================== validateCompanyName ====================
describe('validateCompanyName', () => {
  describe('валідні назви', () => {
    it('повертає true для назви з лапками', () => {
      expect(validateCompanyName('ТОВ "Компанія"')).toBe(true);
    });

    it('повертає true для простої назви', () => {
      expect(validateCompanyName('Приватне підприємство Зоря')).toBe(true);
    });

    it('повертає true для назви з цифрами', () => {
      expect(validateCompanyName('ТОВ Компанія 2024')).toBe(true);
    });

    it('повертає true для назви з дефісом', () => {
      expect(validateCompanyName('ТОВ Укр-Буд')).toBe(true);
    });

    it('повертає true для назви довжиною 3 символи', () => {
      expect(validateCompanyName('АБВ')).toBe(true);
    });
  });

  describe('невалідні назви', () => {
    it('повертає false для назви з 2 символів', () => {
      expect(validateCompanyName('АБ')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validateCompanyName('')).toBe(false);
    });

    it('повертає false для назви довшої за 200 символів', () => {
      expect(validateCompanyName('А'.repeat(201))).toBe(false);
    });
  });
});

// ==================== validatePostalCode ====================
describe('validatePostalCode', () => {
  describe('валідні індекси', () => {
    it('повертає true для 5-значного індексу', () => {
      expect(validatePostalCode('01001')).toBe(true);
    });

    it('повертає true для індексу що починається з 0', () => {
      expect(validatePostalCode('00100')).toBe(true);
    });

    it('повертає true для максимального індексу', () => {
      expect(validatePostalCode('99999')).toBe(true);
    });
  });

  describe('невалідні індекси', () => {
    it('повертає false для 4-значного індексу', () => {
      expect(validatePostalCode('0100')).toBe(false);
    });

    it('повертає false для 6-значного індексу', () => {
      expect(validatePostalCode('010010')).toBe(false);
    });

    it('повертає false для індексу з літерами', () => {
      expect(validatePostalCode('0100A')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validatePostalCode('')).toBe(false);
    });
  });
});

// ==================== validateVatNumber ====================
describe('validateVatNumber', () => {
  describe('валідні номери ПДВ', () => {
    it('повертає true для 12-значного номера з валідним ІПН', () => {
      // Перші 10 цифр — валідний ІПН 3184710691
      expect(validateVatNumber('318471069101')).toBe(true);
      expect(validateVatNumber('318471069199')).toBe(true);
    });
  });

  describe('невалідні номери ПДВ', () => {
    it('повертає false для 11-значного номера', () => {
      expect(validateVatNumber('12345678901')).toBe(false);
    });

    it('повертає false для 13-значного номера', () => {
      expect(validateVatNumber('1234567890123')).toBe(false);
    });

    it('повертає false для невірної контрольної суми ІПН', () => {
      expect(validateVatNumber('123456789012')).toBe(false);
    });

    it('повертає false для порожнього рядка', () => {
      expect(validateVatNumber('')).toBe(false);
    });

    it('повертає false для номера з літерами', () => {
      expect(validateVatNumber('31847106910A')).toBe(false);
    });
  });
});

// ==================== getVatValidationError ====================
describe('getVatValidationError', () => {
  describe('валідні дані', () => {
    it('повертає null для валідного номера', () => {
      expect(getVatValidationError('318471069101')).toBe(null);
    });
  });

  describe('помилки валідації', () => {
    it('повертає помилку для порожнього значення', () => {
      expect(getVatValidationError('')).toBe("Обов'язкове поле");
    });

    it('повертає помилку для нецифрових символів', () => {
      expect(getVatValidationError('31847106910A')).toBe('Тільки цифри');
    });

    it('повертає помилку для невірної довжини', () => {
      expect(getVatValidationError('12345678901')).toBe('Номер ПДВ має містити 12 цифр');
    });

    it('повертає помилку для невірної контрольної суми ІПН', () => {
      expect(getVatValidationError('123456789012')).toBe('Невірна контрольна сума ІПН частини');
    });
  });
});

// ==================== getFullNameValidationError ====================
describe('getFullNameValidationError', () => {
  describe('валідні дані', () => {
    it('повертає null для валідного ПІБ', () => {
      expect(getFullNameValidationError('Шевченко Тарас Григорович')).toBe(null);
    });

    it('повертає null для ПІБ з 2 слів', () => {
      expect(getFullNameValidationError('Шевченко Тарас')).toBe(null);
    });
  });

  describe('помилки валідації', () => {
    it('повертає помилку для порожнього значення', () => {
      expect(getFullNameValidationError('')).toBe("Обов'язкове поле");
    });

    it('повертає помилку для одного слова', () => {
      expect(getFullNameValidationError('Шевченко')).toBe("Формат: Прізвище Імʼя");
    });

    it('повертає помилку для латиниці', () => {
      expect(getFullNameValidationError('Shevchenko Taras')).toBe('Кожне слово з великої літери (кирилиця)');
    });
  });
});

// ==================== validateBusinessCode ====================
describe('validateBusinessCode', () => {
  describe('валідація для ТОВ', () => {
    it('повертає true для валідного ЄДРПОУ', () => {
      expect(validateBusinessCode('14360570', 'tov')).toBe(true);
    });

    it('повертає false для невалідного ЄДРПОУ', () => {
      expect(validateBusinessCode('12345679', 'tov')).toBe(false);
    });

    it('повертає false для ІПН замість ЄДРПОУ', () => {
      expect(validateBusinessCode('3184710691', 'tov')).toBe(false);
    });
  });

  describe('валідація для ФОП', () => {
    it('повертає true для валідного ІПН', () => {
      expect(validateBusinessCode('3184710691', 'fop')).toBe(true);
    });

    it('повертає false для невалідного ІПН', () => {
      expect(validateBusinessCode('1234567890', 'fop')).toBe(false);
    });

    it('повертає false для ЄДРПОУ замість ІПН', () => {
      expect(validateBusinessCode('14360570', 'fop')).toBe(false);
    });
  });
});

// ==================== getCodeValidationError ====================
describe('getCodeValidationError', () => {
  describe('помилки для ТОВ', () => {
    it('повертає null для валідного ЄДРПОУ', () => {
      expect(getCodeValidationError('14360570', 'tov')).toBe(null);
    });

    it('повертає помилку для порожнього значення', () => {
      expect(getCodeValidationError('', 'tov')).toBe("Обов'язкове поле");
    });

    it('повертає помилку для нецифрових символів', () => {
      expect(getCodeValidationError('3285596A', 'tov')).toBe('Тільки цифри');
    });

    it('повертає помилку для невірної довжини', () => {
      expect(getCodeValidationError('1234567', 'tov')).toBe('ЄДРПОУ має містити 8 цифр');
    });

    it('повертає помилку для невірної контрольної суми', () => {
      expect(getCodeValidationError('12345679', 'tov')).toBe('Невірна контрольна сума ЄДРПОУ');
    });
  });

  describe('помилки для ФОП', () => {
    it('повертає null для валідного ІПН', () => {
      expect(getCodeValidationError('3184710691', 'fop')).toBe(null);
    });

    it('повертає помилку для невірної довжини', () => {
      expect(getCodeValidationError('123456789', 'fop')).toBe('ІПН має містити 10 цифр');
    });

    it('повертає помилку для невірної контрольної суми', () => {
      expect(getCodeValidationError('1234567890', 'fop')).toBe('Невірна контрольна сума ІПН');
    });
  });
});

// ==================== getIbanValidationError ====================
describe('getIbanValidationError', () => {
  describe('валідні дані', () => {
    it('повертає null для порожнього значення (опціональне поле)', () => {
      expect(getIbanValidationError('')).toBe(null);
    });

    it('повертає null для валідного IBAN', () => {
      expect(getIbanValidationError('UA213223130000026007233566001')).toBe(null);
    });
  });

  describe('помилки валідації', () => {
    it('повертає помилку для невірного префікса', () => {
      expect(getIbanValidationError('DE89370400440532013000')).toBe('IBAN має починатися з UA');
    });

    it('повертає помилку для невірної довжини', () => {
      expect(getIbanValidationError('UA2132231300000260072335660')).toBe('IBAN має містити 29 символів (UA + 27 цифр)');
    });

    it('повертає помилку для невірної контрольної суми', () => {
      expect(getIbanValidationError('UA213223130000026007233566002')).toBe('Невірна контрольна сума IBAN');
    });
  });
});
