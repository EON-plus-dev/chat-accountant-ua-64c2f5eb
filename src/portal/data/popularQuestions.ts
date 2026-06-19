export interface PopularQuestion {
  id: string;
  question: string;
  audience: "business" | "personal" | "accountant" | "both";
  emoji: string;
  category?: string;
  title?: string;
  hint?: string;
}

export const POPULAR_QUESTIONS: PopularQuestion[] = [
  // Business
  { id: "b1", emoji: "💰", question: "ЄСВ 2025: яка мінімальна ставка для ФОП?", audience: "business", category: "tax", title: "ЄСВ у 2025", hint: "Мінімальна ставка для ФОП" },
  { id: "b2", emoji: "📊", question: "ФОП 3 група: який ліміт доходу та ставка ЄП?", audience: "business", category: "tax", title: "ФОП 3 група", hint: "Ліміт доходу та ставка ЄП" },
  { id: "b3", emoji: "🧾", question: "Коли обов'язкова реєстрація платником ПДВ?", audience: "business", category: "tax", title: "Реєстрація ПДВ", hint: "Коли стає обов'язковою" },
  { id: "b4", emoji: "📅", question: "Дедлайни звітності для ФОП у 2025 році?", audience: "business", category: "reporting" },
  { id: "b5", emoji: "🖥️", question: "ПРРО: хто зобов'язаний використовувати?", audience: "business", category: "compliance", title: "ПРРО", hint: "Хто зобов'язаний використовувати" },
  { id: "b6", emoji: "🔍", question: "Як підготуватися до перевірки ДПС?", audience: "business", category: "compliance" },

  // Personal
  { id: "p1", emoji: "📋", question: "Коли подавати декларацію про доходи фізособі?", audience: "personal", category: "tax", title: "Декларація", hint: "Коли подавати фізособі" },
  { id: "p2", emoji: "🏠", question: "Який податок при здачі квартири в оренду?", audience: "personal", category: "tax", title: "Оренда житла", hint: "Який податок при здачі" },
  { id: "p3", emoji: "📈", question: "ПДФО з інвестицій та дивідендів: як розрахувати?", audience: "personal", category: "tax", title: "Інвестиції", hint: "ПДФО з дивідендів" },
  { id: "p4", emoji: "🏘️", question: "Податок при продажу нерухомості: коли платити?", audience: "personal", category: "tax", title: "Продаж нерухомості", hint: "Коли платити податок" },
  { id: "p5", emoji: "🌍", question: "Як декларувати іноземні доходи в Україні?", audience: "personal", category: "tax" },

  // Accountant
  { id: "a1", emoji: "📑", question: "Зміни в П(С)БО та МСФЗ у 2025 році?", audience: "accountant", category: "standards", title: "П(С)БО / МСФЗ", hint: "Зміни у 2025 році" },
  { id: "a2", emoji: "📝", question: "Нові форми фінансової звітності: що змінилось?", audience: "accountant", category: "reporting", title: "Фінзвітність", hint: "Нові форми звітності" },
  { id: "a3", emoji: "🧮", question: "Облік резервів сумнівних боргів: методи та проводки?", audience: "accountant", category: "accounting", title: "Сумнівні борги", hint: "Методи та проводки" },
  { id: "a4", emoji: "📦", question: "Інвентаризація 2025: строки та порядок проведення?", audience: "accountant", category: "accounting", title: "Інвентаризація", hint: "Строки та порядок" },
  { id: "a5", emoji: "💻", question: "Електронний документообіг: вимоги та впровадження?", audience: "accountant", category: "compliance" },

  // Both
  { id: "g1", emoji: "⚖️", question: "Що змінилось у податковому законодавстві у 2025?", audience: "both", category: "tax", title: "Зміни 2025", hint: "Що нового в ПКУ" },
  { id: "g2", emoji: "💳", question: "Фінмоніторинг: які операції потребують пояснення?", audience: "both", category: "compliance", title: "Фінмоніторинг", hint: "Які операції пояснювати" },

  // New real-world scenarios
  { id: "n1", emoji: "🏦", question: "Де відкрити рахунок ФОП і що взяти?", audience: "business", category: "banking", title: "Рахунок ФОП", hint: "Де відкрити і що взяти" },
  { id: "n2", emoji: "🛡", question: "Як оформити ОСЦПВ онлайн — найдешевше?", audience: "both", category: "insurance", title: "ОСЦПВ онлайн", hint: "Найдешевший варіант" },
  { id: "n3", emoji: "📦", question: "Як підключити Нову Пошту до інтернет-магазину?", audience: "business", category: "logistics", title: "Нова Пошта API", hint: "Підключення до магазину" },
  { id: "n4", emoji: "🖊", question: "Що потрібно для нотаріуса — список документів", audience: "both", category: "legal", title: "Нотаріус", hint: "Список документів" },
  { id: "n5", emoji: "🤲", question: "Як подати на грант USAID — кроки і документи", audience: "business", category: "grants", title: "Грант USAID", hint: "Кроки і документи" },
  { id: "n6", emoji: "💱", question: "Як отримувати оплату від іноземних клієнтів через Wise?", audience: "business", category: "payments", title: "Wise для ФОП", hint: "Оплата з-за кордону" },
  { id: "n7", emoji: "🏛", question: "Де знаходиться моя податкова і коли вона працює?", audience: "both", category: "gov", title: "Моя податкова", hint: "Адреса та графік роботи" },
  { id: "n8", emoji: "📋", question: "Що потрібно щоб відкрити рахунок ТОВ у Приватбанку?", audience: "business", category: "banking", title: "Рахунок ТОВ", hint: "Документи для ПриватБанку" },
];
