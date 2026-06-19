export interface MortgageProgram {
  id: string;
  name: string;
  bank: string;
  type: 'state' | 'commercial';
  rate: number;
  rateDisplay: string;
  minDownPayment: number;
  maxTermYears: number;
  maxAmount?: number;
  targetAudience: string[];
  requirements: string[];
  applyUrl: string;
  isOpen: boolean;
  badge?: string;
  note?: string;
}

export interface MortgageCalcInput {
  propertyValue: number;
  downPaymentPercent: number;
  termYears: number;
  ratePercent: number;
}

export const MORTGAGE_PROGRAMS: MortgageProgram[] = [
  {
    id: 'eoselya-3',
    name: 'єОселя — 3% річних',
    bank: 'Укрфінжитло + банки-партнери',
    type: 'state',
    rate: 3,
    rateDisplay: '3% річних',
    minDownPayment: 20,
    maxTermYears: 20,
    maxAmount: 5000000,
    targetAudience: ['Педагоги', 'Лікарі', 'Медики', 'Ветерани', 'Учасники бойових дій'],
    requirements: [
      'Підтверджена зайнятість у відповідній сфері',
      'Перший внесок від 20%',
      'Перше власне житло або не мати у власності',
      'Громадянство України',
    ],
    applyUrl: 'https://eoselia.gov.ua',
    isOpen: true,
    badge: 'Найнижча ставка',
    note: 'Ставка 3% — для педагогів, медиків, ветеранів. Подати через Дію або банк-партнер.',
  },
  {
    id: 'eoselya-7',
    name: 'єОселя — 7% річних',
    bank: 'Укрфінжитло + банки-партнери',
    type: 'state',
    rate: 7,
    rateDisplay: '7% річних',
    minDownPayment: 20,
    maxTermYears: 20,
    maxAmount: 5000000,
    targetAudience: ['Всі громадяни України'],
    requirements: [
      'Перший внесок від 20%',
      'Перше власне житло або не мати житла більше 52 м²',
      'Громадянство України',
      'Офіційний дохід',
    ],
    applyUrl: 'https://eoselia.gov.ua',
    isOpen: true,
    badge: 'Загальна програма',
  },
  {
    id: 'privat-commercial',
    name: 'Іпотека Приватбанк',
    bank: 'Приватбанк',
    type: 'commercial',
    rate: 16.5,
    rateDisplay: 'від 16.5% річних',
    minDownPayment: 30,
    maxTermYears: 20,
    targetAudience: ['Всі'],
    requirements: ['Перший внесок від 30%', 'Офіційний дохід', 'Хороша кредитна історія'],
    applyUrl: 'https://privatbank.ua',
    isOpen: true,
  },
  {
    id: 'oschad-commercial',
    name: 'Іпотека Ощадбанк',
    bank: 'Ощадбанк',
    type: 'commercial',
    rate: 15.9,
    rateDisplay: 'від 15.9% річних',
    minDownPayment: 25,
    maxTermYears: 20,
    targetAudience: ['Всі'],
    requirements: ['Перший внесок від 25%', 'Офіційний дохід'],
    applyUrl: 'https://oschadbank.ua',
    isOpen: true,
  },
];

export function calcMonthlyPayment(input: MortgageCalcInput) {
  const loanAmount = input.propertyValue * (1 - input.downPaymentPercent / 100);
  const monthlyRate = input.ratePercent / 100 / 12;
  const numPayments = input.termYears * 12;

  if (monthlyRate === 0) {
    const monthlyPayment = loanAmount / numPayments;
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(loanAmount),
      totalInterest: 0,
      loanAmount: Math.round(loanAmount),
    };
  }

  const monthlyPayment =
    (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
  const totalPayment = monthlyPayment * numPayments;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalPayment - loanAmount),
    loanAmount: Math.round(loanAmount),
  };
}
