import type { LessonLink } from "./learn";

export const LESSON_LINK_PRESETS: Record<string, LessonLink[]> = {
  netWorth: [
    { label: 'Калькулятор Net Worth', href: '/tools/net-worth', kind: 'tool',
      description: 'Порахуйте чисті активи за 5 хв' },
    { label: 'Калькулятор подушки безпеки', href: '/tools/emergency-fund', kind: 'tool',
      description: 'Скільки місяців витрат тримати в резерві' },
    { label: 'Каталог депозитів', href: '/catalog/banks?product=deposit', kind: 'catalog',
      description: 'Порівняти ставки топ-банків (квітень 2026)' },
    { label: 'Каталог ОВДП', href: '/catalog/ovdp', kind: 'catalog',
      description: 'Дохідність 13–15% у гривні' },
  ],
  budget: [
    { label: 'Бюджет 50/30/20', href: '/tools/budget-503020', kind: 'tool' },
    { label: 'Імпакт інфляції на бюджет', href: '/tools/inflation-impact', kind: 'tool' },
  ],
  emergency: [
    { label: 'Калькулятор подушки', href: '/tools/emergency-fund', kind: 'tool' },
    { label: 'ОВДП-драбина (laddering)', href: '/catalog/ovdp', kind: 'catalog' },
    { label: 'Депозити з достроковим зняттям', href: '/catalog/banks?product=deposit', kind: 'catalog' },
  ],
  investments: [
    { label: 'Інвест-калькулятор (складні %)', href: '/tools/invest-calc', kind: 'tool' },
    { label: 'Каталог брокерів', href: '/catalog/brokers', kind: 'catalog' },
    { label: 'Каталог ETF', href: '/catalog/etf', kind: 'catalog' },
    { label: 'Депозити vs ОВДП', href: '/catalog/banks?product=deposit', kind: 'catalog' },
  ],
  insurance: [
    { label: 'Каталог страхових компаній', href: '/catalog/insurance', kind: 'catalog' },
    { label: 'Калькулятор страхування', href: '/tools/insurance-calc', kind: 'tool' },
  ],
  debt: [
    { label: 'Калькулятор «Снігова куля» / «Лавина»', href: '/tools/debt-snowball', kind: 'tool' },
    { label: 'Каталог рефінансу', href: '/catalog/banks?product=credit', kind: 'catalog' },
  ],
  pdfo: [
    { label: 'Калькулятор ПДФО + ВЗ', href: '/tools/pdfo-calc', kind: 'tool',
      description: 'ПДФО 18% + ВЗ 5% за хвилину' },
    { label: 'Калькулятор зарплати', href: '/tools/salary-calc', kind: 'tool',
      description: 'Gross → Net з усіма утриманнями' },
    { label: 'Календар податків', href: '/tax-calendar', kind: 'directory',
      description: 'Дедлайни декларації фізособи' },
    { label: 'Майстер декларації у FINTODO', href: '/checkout?plan=smart&trial=true', kind: 'tool',
      description: 'Подати декларацію за 15 хв' },
  ],
  taxDiscount: [
    { label: 'Калькулятор податкової знижки', href: '/tools/tax-discount-calc', kind: 'tool',
      description: 'Скільки ПДФО можна повернути' },
    { label: 'Категорії витрат (довідник)', href: '/dovidnyky/tax-discount-categories', kind: 'directory',
      description: 'Навчання, лікування, іпотека, страхування' },
    { label: 'Tax Discount Wizard у FINTODO', href: '/checkout?plan=smart&trial=true', kind: 'tool',
      description: 'Автоматичне заповнення декларації' },
  ],
  kik: [
    { label: 'KIK-модуль FINTODO', href: '/checkout?plan=smart&trial=true', kind: 'tool',
      description: 'Дерево володіння + автозаповнення з НБУ-курсами' },
    { label: 'Курси НБУ (історичні)', href: '/tools/nbu-rates', kind: 'tool',
      description: 'Курс на дату операції з прибутком КІК' },
    { label: 'Календар КІК-звітності', href: '/tax-calendar?type=kik', kind: 'directory',
      description: 'Дедлайни звіту і повної декларації' },
  ],
  monthlyVz: [
    { label: 'Калькулятор місячного ВЗ 5%', href: '/tools/monthly-vz', kind: 'tool',
      description: 'Авторозрахунок з різних джерел доходу' },
    { label: 'Календар ВЗ-декларацій', href: '/tax-calendar?type=vz', kind: 'directory',
      description: 'Місячні дедлайни подачі' },
    { label: 'Автодекларація у FINTODO', href: '/checkout?plan=smart&trial=true', kind: 'tool',
      description: '5 хв на місяць замість години' },
  ],
};
