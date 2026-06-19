// Registry integration types and mock services for KEP/Diia authentication

export interface KVEDCode {
  code: string;
  name: string;
  isPrimary: boolean;
}

export interface LeadershipInfo {
  director: string;
  position: string;
  signatories?: string[];
}

export interface TaxInfo {
  vatPayer: boolean;
  vatNumber?: string;
  singleTax?: {
    group: 1 | 2 | 3 | 4;
    rate: number;
  };
  taxSystem: 'general' | 'simplified';
}

export interface BankingInfo {
  iban: string;
  bankName: string;
  mfo: string;
}

export type RegistryEntityType = 'tov' | 'fop' | 'individual';

export interface RegistryData {
  source: 'edr' | 'vat' | 'singleTax' | 'bank' | 'drfo';
  entityType: RegistryEntityType;
  basic: {
    name: string;
    code: string; // ЄДРПОУ or ІПН
    shortName?: string;
    address: string;
    registrationDate: string;
    status: 'active' | 'suspended' | 'terminated';
  };
  leadership: LeadershipInfo;
  activity: {
    kveds: KVEDCode[];
  };
  tax: TaxInfo;
  banking?: BankingInfo;
  contacts?: {
    phone?: string;
    email?: string;
  };
}

export interface RegistrySyncProgress {
  stage: 'edr' | 'vat' | 'singleTax' | 'bank' | 'complete';
  progress: number; // 0-100
  currentAction: string;
  data?: Partial<RegistryData>;
}

// Mock data for demo purposes
// All codes are valid and pass checksum validation
const MOCK_TOV_DATA: RegistryData = {
  source: 'edr',
  entityType: 'tov',
  basic: {
    name: 'ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ "ТЕХНОПРОМ ГРУП"',
    shortName: 'ТОВ "ТЕХНОПРОМ ГРУП"',
    code: '32855961', // Valid EDRPOU
    address: 'м. Київ, вул. Хрещатик, 22, офіс 305',
    registrationDate: '2019-03-15',
    status: 'active',
  },
  leadership: {
    director: 'Коваленко Олександр Петрович',
    position: 'Директор',
    signatories: ['Коваленко О.П.', 'Мельник І.В.'],
  },
  activity: {
    kveds: [
      { code: '62.01', name: 'Комп\'ютерне програмування', isPrimary: true },
      { code: '62.02', name: 'Консультування з питань інформатизації', isPrimary: false },
      { code: '63.11', name: 'Оброблення даних, розміщення інформації на веб-вузлах', isPrimary: false },
      { code: '70.22', name: 'Консультування з питань комерційної діяльності', isPrimary: false },
    ],
  },
  tax: {
    vatPayer: true,
    vatNumber: '318471069101', // Valid VAT number
    taxSystem: 'general',
  },
  banking: {
    iban: 'UA213223130000026007233566001',
    bankName: 'АТ КБ "ПРИВАТБАНК"',
    mfo: '322313',
  },
  contacts: {
    phone: '+380442345678',
    email: 'info@technoprom.ua',
  },
};

const MOCK_FOP_DATA: RegistryData = {
  source: 'edr',
  entityType: 'fop',
  basic: {
    name: 'ФІЗИЧНА ОСОБА-ПІДПРИЄМЕЦЬ ШЕВЧЕНКО МАРІЯ ІВАНІВНА',
    code: '3184710691', // Valid IPN
    address: 'м. Львів, вул. Шевченка, 15, кв. 7',
    registrationDate: '2021-06-20',
    status: 'active',
  },
  leadership: {
    director: 'Шевченко Марія Іванівна',
    position: 'ФОП',
  },
  activity: {
    kveds: [
      { code: '74.10', name: 'Спеціалізована діяльність у сфері дизайну', isPrimary: true },
      { code: '73.11', name: 'Рекламні агентства', isPrimary: false },
      { code: '62.01', name: 'Комп\'ютерне програмування', isPrimary: false },
    ],
  },
  tax: {
    vatPayer: false,
    singleTax: {
      group: 3,
      rate: 5,
    },
    taxSystem: 'simplified',
  },
  banking: {
    iban: 'UA213223130000026007233566001',
    bankName: 'АТ "УКРСИББАНК"',
    mfo: '305299',
  },
  contacts: {
    phone: '+380671234567',
    email: 'maria.design@gmail.com',
  },
};

const MOCK_INDIVIDUAL_DATA: RegistryData = {
  source: 'drfo',
  entityType: 'individual',
  basic: {
    name: 'Шевченко Марія Іванівна',
    code: '3184710691', // ІПН
    address: 'м. Львів, вул. Шевченка, 15, кв. 7',
    registrationDate: '1990-04-12', // дата народження
    status: 'active',
  },
  leadership: {
    director: 'Шевченко Марія Іванівна',
    position: 'Фізична особа',
  },
  activity: { kveds: [] },
  tax: {
    vatPayer: false,
    taxSystem: 'general',
  },
  contacts: {
    phone: '+380671234567',
    email: 'maria@gmail.com',
  },
};

// Simulate registry sync process
export const simulateRegistrySync = async (
  entityType: RegistryEntityType,
  onProgress: (progress: RegistrySyncProgress) => void
): Promise<RegistryData> => {
  const mockData =
    entityType === 'tov' ? MOCK_TOV_DATA :
    entityType === 'fop' ? MOCK_FOP_DATA :
    MOCK_INDIVIDUAL_DATA;

  if (entityType === 'individual') {
    // Скорочений сценарій: ДРФО → резидентство → крос-лінк ФОП
    onProgress({ stage: 'edr', progress: 15, currentAction: 'Підключення до ДРФО за ІПН...' });
    await delay(800);
    onProgress({
      stage: 'edr',
      progress: 45,
      currentAction: 'Завантаження персональних даних...',
      data: { basic: mockData.basic, leadership: mockData.leadership },
    });
    await delay(1100);
    onProgress({ stage: 'vat', progress: 70, currentAction: 'Перевірка статусу резидентства...' });
    await delay(800);
    onProgress({
      stage: 'singleTax',
      progress: 90,
      currentAction: 'Пошук пов\u02bcязаного ФОП за ІПН...',
      data: mockData,
    });
    await delay(700);
    onProgress({
      stage: 'complete',
      progress: 100,
      currentAction: 'Синхронізацію завершено!',
      data: mockData,
    });
    return mockData;
  }

  // Stage 1: EDR (основні дані)
  onProgress({
    stage: 'edr',
    progress: 10,
    currentAction: 'Підключення до ЄДР...',
  });
  await delay(800);
  
  onProgress({
    stage: 'edr',
    progress: 25,
    currentAction: 'Завантаження основних реквізитів...',
    data: { basic: mockData.basic, leadership: mockData.leadership },
  });
  await delay(1200);
  
  onProgress({
    stage: 'edr',
    progress: 40,
    currentAction: 'Отримання КВЕДів...',
    data: { basic: mockData.basic, leadership: mockData.leadership, activity: mockData.activity },
  });
  await delay(1000);
  
  onProgress({
    stage: 'vat',
    progress: 55,
    currentAction: 'Перевірка статусу платника ПДВ...',
  });
  await delay(900);
  
  onProgress({
    stage: 'singleTax',
    progress: 70,
    currentAction: 'Перевірка реєстру єдиного податку...',
  });
  await delay(800);
  
  onProgress({
    stage: 'singleTax',
    progress: 80,
    currentAction: 'Отримання податкової інформації...',
    data: { ...mockData, banking: undefined },
  });
  await delay(700);
  
  onProgress({
    stage: 'bank',
    progress: 90,
    currentAction: 'Завантаження банківських реквізитів...',
  });
  await delay(600);
  
  onProgress({
    stage: 'complete',
    progress: 100,
    currentAction: 'Синхронізацію завершено!',
    data: mockData,
  });
  
  return mockData;
};

// Simulate KEP authentication. `forcedEntityType` фіксує сутність
// (приходить із попереднього кроку UserTypeOnboardingWizard).
export const simulateKepAuth = async (
  onProgress: (message: string) => void,
  forcedEntityType?: RegistryEntityType,
): Promise<{ success: boolean; entityType: RegistryEntityType }> => {
  onProgress('Читання сертифіката...');
  await delay(1000);
  onProgress('Перевірка підпису...');
  await delay(800);
  onProgress('Верифікація в АЦСК...');
  await delay(1200);
  onProgress('Автентифікація успішна!');
  await delay(500);
  return {
    success: true,
    entityType: forcedEntityType ?? (Math.random() > 0.5 ? 'tov' : 'fop'),
  };
};

// Simulate Diia authentication
export const simulateDiiaAuth = async (
  onProgress: (message: string) => void,
  forcedEntityType?: RegistryEntityType,
): Promise<{ success: boolean; entityType: RegistryEntityType }> => {
  onProgress('Очікування підтвердження в Дія...');
  await delay(2000);
  onProgress('Отримання даних підпису...');
  await delay(1000);
  onProgress('Верифікація успішна!');
  await delay(500);
  return {
    success: true,
    entityType: forcedEntityType ?? (Math.random() > 0.5 ? 'tov' : 'fop'),
  };
};

// Helper function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Format helpers
export const formatEDRPOU = (code: string): string => {
  if (code.length === 8) {
    return code; // ЄДРПОУ
  }
  return code; // ІПН
};

export const formatIBAN = (iban: string): string => {
  return iban.replace(/(.{4})/g, '$1 ').trim();
};

export const getEntityTypeLabel = (type: 'tov' | 'fop'): string => {
  return type === 'tov' ? 'ТОВ' : 'ФОП';
};

export const getTaxSystemLabel = (tax: TaxInfo): string => {
  if (tax.singleTax) {
    return `Єдиний податок, ${tax.singleTax.group} група (${tax.singleTax.rate}%)`;
  }
  return tax.vatPayer ? 'Загальна система (платник ПДВ)' : 'Загальна система';
};
