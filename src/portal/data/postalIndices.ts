export interface PostalIndexEntry {
  index: string;
  city: string;
  district?: string;
  region: string;
  type: 'city' | 'town' | 'village' | 'urban_village';
}

export const POSTAL_INDICES_AS_OF = 'квітень 2026';
export const POSTAL_INDICES_NOTE =
  'Стартова вибірка — обласні центри, міста обласного значення та найбільші райцентри. Повний реєстр індексів (~30 000) — на сайті Укрпошти.';

export const POSTAL_INDICES_SOURCE = 'https://ukrposhta.ua/ua/dovidnik-poshtovih-indeksiv';

/**
 * Топ ~180 населених пунктів з основними поштовими індексами.
 * Для повного довідника використовуйте офіційний сервіс Укрпошти.
 */
export const POSTAL_INDICES: PostalIndexEntry[] = [
  // Київ і область
  { index: '01001', city: 'Київ', region: 'м. Київ', type: 'city' },
  { index: '02000', city: 'Київ', district: 'Дніпровський', region: 'м. Київ', type: 'city' },
  { index: '03000', city: 'Київ', district: 'Солом\u02bcянський', region: 'м. Київ', type: 'city' },
  { index: '04000', city: 'Київ', district: 'Подільський', region: 'м. Київ', type: 'city' },
  { index: '07300', city: 'Вишгород', region: 'Київська', type: 'city' },
  { index: '07400', city: 'Бровари', region: 'Київська', type: 'city' },
  { index: '08130', city: 'Бориспіль', region: 'Київська', type: 'city' },
  { index: '08200', city: 'Ірпінь', region: 'Київська', type: 'city' },
  { index: '08500', city: 'Фастів', region: 'Київська', type: 'city' },
  { index: '08700', city: 'Обухів', region: 'Київська', type: 'city' },
  { index: '08800', city: 'Миронівка', region: 'Київська', type: 'city' },
  { index: '09000', city: 'Сквира', region: 'Київська', type: 'city' },
  { index: '09100', city: 'Біла Церква', region: 'Київська', type: 'city' },
  { index: '09600', city: 'Рокитне', region: 'Київська', type: 'town' },

  // Львів і область
  { index: '79000', city: 'Львів', region: 'Львівська', type: 'city' },
  { index: '79005', city: 'Львів', district: 'Галицький', region: 'Львівська', type: 'city' },
  { index: '80100', city: 'Червоноград', region: 'Львівська', type: 'city' },
  { index: '80300', city: 'Жовква', region: 'Львівська', type: 'city' },
  { index: '81100', city: 'Самбір', region: 'Львівська', type: 'city' },
  { index: '81400', city: 'Мостиська', region: 'Львівська', type: 'town' },
  { index: '82100', city: 'Дрогобич', region: 'Львівська', type: 'city' },
  { index: '82200', city: 'Трускавець', region: 'Львівська', type: 'city' },
  { index: '82400', city: 'Стрий', region: 'Львівська', type: 'city' },
  { index: '82500', city: 'Сколе', region: 'Львівська', type: 'town' },

  // Харків і область
  { index: '61001', city: 'Харків', region: 'Харківська', type: 'city' },
  { index: '61010', city: 'Харків', district: 'Київський', region: 'Харківська', type: 'city' },
  { index: '62300', city: 'Дергачі', region: 'Харківська', type: 'town' },
  { index: '63100', city: 'Чугуїв', region: 'Харківська', type: 'city' },
  { index: '63500', city: 'Куп\u02bcянськ', region: 'Харківська', type: 'city' },
  { index: '64000', city: 'Балаклія', region: 'Харківська', type: 'city' },
  { index: '64200', city: 'Лозова', region: 'Харківська', type: 'city' },
  { index: '64600', city: 'Ізюм', region: 'Харківська', type: 'city' },

  // Одеса і область
  { index: '65000', city: 'Одеса', region: 'Одеська', type: 'city' },
  { index: '65014', city: 'Одеса', district: 'Приморський', region: 'Одеська', type: 'city' },
  { index: '66100', city: 'Котовськ (Подільськ)', region: 'Одеська', type: 'city' },
  { index: '67800', city: 'Овідіополь', region: 'Одеська', type: 'town' },
  { index: '68000', city: 'Білгород-Дністровський', region: 'Одеська', type: 'city' },
  { index: '68600', city: 'Ізмаїл', region: 'Одеська', type: 'city' },
  { index: '68800', city: 'Кілія', region: 'Одеська', type: 'city' },
  { index: '68000', city: 'Чорноморськ', region: 'Одеська', type: 'city' },

  // Дніпро і область
  { index: '49000', city: 'Дніпро', region: 'Дніпропетровська', type: 'city' },
  { index: '50000', city: 'Кривий Ріг', region: 'Дніпропетровська', type: 'city' },
  { index: '51200', city: 'Нікополь', region: 'Дніпропетровська', type: 'city' },
  { index: '51400', city: 'Покров', region: 'Дніпропетровська', type: 'city' },
  { index: '52000', city: 'Підгородне', region: 'Дніпропетровська', type: 'city' },
  { index: '52500', city: 'Синельникове', region: 'Дніпропетровська', type: 'city' },
  { index: '53200', city: 'Покровське', region: 'Дніпропетровська', type: 'town' },
  { index: '53300', city: 'Кам\u02bcянське', region: 'Дніпропетровська', type: 'city' },

  // Запоріжжя і область
  { index: '69000', city: 'Запоріжжя', region: 'Запорізька', type: 'city' },
  { index: '70000', city: 'Василівка', region: 'Запорізька', type: 'city' },
  { index: '71100', city: 'Бердянськ', region: 'Запорізька', type: 'city' },
  { index: '71700', city: 'Токмак', region: 'Запорізька', type: 'city' },
  { index: '72000', city: 'Мелітополь', region: 'Запорізька', type: 'city' },

  // Донецька область (підконтрольна територія)
  { index: '84500', city: 'Бахмут', region: 'Донецька', type: 'city' },
  { index: '85300', city: 'Покровськ', region: 'Донецька', type: 'city' },
  { index: '85700', city: 'Костянтинівка', region: 'Донецька', type: 'city' },
  { index: '87500', city: 'Маріуполь', region: 'Донецька', type: 'city' },
  { index: '84100', city: 'Слов\u02bcянськ', region: 'Донецька', type: 'city' },
  { index: '84200', city: 'Краматорськ', region: 'Донецька', type: 'city' },

  // Луганська область
  { index: '93000', city: 'Лисичанськ', region: 'Луганська', type: 'city' },
  { index: '93100', city: 'Сєвєродонецьк', region: 'Луганська', type: 'city' },
  { index: '93300', city: 'Рубіжне', region: 'Луганська', type: 'city' },
  { index: '92100', city: 'Старобільськ', region: 'Луганська', type: 'city' },

  // Чернігів і область
  { index: '14000', city: 'Чернігів', region: 'Чернігівська', type: 'city' },
  { index: '15300', city: 'Городня', region: 'Чернігівська', type: 'town' },
  { index: '15700', city: 'Корюківка', region: 'Чернігівська', type: 'city' },
  { index: '16000', city: 'Ніжин', region: 'Чернігівська', type: 'city' },
  { index: '17500', city: 'Прилуки', region: 'Чернігівська', type: 'city' },
  { index: '17600', city: 'Срібне', region: 'Чернігівська', type: 'town' },

  // Суми і область
  { index: '40000', city: 'Суми', region: 'Сумська', type: 'city' },
  { index: '41100', city: 'Шостка', region: 'Сумська', type: 'city' },
  { index: '41400', city: 'Глухів', region: 'Сумська', type: 'city' },
  { index: '41600', city: 'Конотоп', region: 'Сумська', type: 'city' },
  { index: '42300', city: 'Лебедин', region: 'Сумська', type: 'city' },
  { index: '42600', city: 'Тростянець', region: 'Сумська', type: 'city' },

  // Полтава і область
  { index: '36000', city: 'Полтава', region: 'Полтавська', type: 'city' },
  { index: '37300', city: 'Миргород', region: 'Полтавська', type: 'city' },
  { index: '37500', city: 'Лохвиця', region: 'Полтавська', type: 'city' },
  { index: '38400', city: 'Гадяч', region: 'Полтавська', type: 'city' },
  { index: '39600', city: 'Кременчук', region: 'Полтавська', type: 'city' },
  { index: '39800', city: 'Горішні Плавні', region: 'Полтавська', type: 'city' },

  // Вінниця і область
  { index: '21000', city: 'Вінниця', region: 'Вінницька', type: 'city' },
  { index: '22000', city: 'Калинівка', region: 'Вінницька', type: 'city' },
  { index: '22400', city: 'Козятин', region: 'Вінницька', type: 'city' },
  { index: '23000', city: 'Жмеринка', region: 'Вінницька', type: 'city' },
  { index: '23500', city: 'Бар', region: 'Вінницька', type: 'city' },
  { index: '24000', city: 'Тульчин', region: 'Вінницька', type: 'city' },
  { index: '24500', city: 'Могилів-Подільський', region: 'Вінницька', type: 'city' },

  // Житомир і область
  { index: '10000', city: 'Житомир', region: 'Житомирська', type: 'city' },
  { index: '11500', city: 'Овруч', region: 'Житомирська', type: 'city' },
  { index: '11700', city: 'Коростень', region: 'Житомирська', type: 'city' },
  { index: '12500', city: 'Малин', region: 'Житомирська', type: 'city' },
  { index: '13300', city: 'Бердичів', region: 'Житомирська', type: 'city' },

  // Хмельницький і область
  { index: '29000', city: 'Хмельницький', region: 'Хмельницька', type: 'city' },
  { index: '30000', city: 'Шепетівка', region: 'Хмельницька', type: 'city' },
  { index: '31000', city: 'Старокостянтинів', region: 'Хмельницька', type: 'city' },
  { index: '31300', city: 'Полонне', region: 'Хмельницька', type: 'city' },
  { index: '32300', city: 'Кам\u02bcянець-Подільський', region: 'Хмельницька', type: 'city' },

  // Тернопіль і область
  { index: '46000', city: 'Тернопіль', region: 'Тернопільська', type: 'city' },
  { index: '47600', city: 'Збараж', region: 'Тернопільська', type: 'city' },
  { index: '47700', city: 'Кременець', region: 'Тернопільська', type: 'city' },
  { index: '48000', city: 'Чортків', region: 'Тернопільська', type: 'city' },
  { index: '48400', city: 'Бучач', region: 'Тернопільська', type: 'city' },

  // Івано-Франківськ і область
  { index: '76000', city: 'Івано-Франківськ', region: 'Івано-Франківська', type: 'city' },
  { index: '77100', city: 'Тисмениця', region: 'Івано-Франківська', type: 'city' },
  { index: '77300', city: 'Калуш', region: 'Івано-Франківська', type: 'city' },
  { index: '78400', city: 'Надвірна', region: 'Івано-Франківська', type: 'city' },
  { index: '78500', city: 'Яремче', region: 'Івано-Франківська', type: 'city' },
  { index: '78600', city: 'Косів', region: 'Івано-Франківська', type: 'city' },

  // Закарпатська область
  { index: '88000', city: 'Ужгород', region: 'Закарпатська', type: 'city' },
  { index: '89000', city: 'Перечин', region: 'Закарпатська', type: 'city' },
  { index: '89500', city: 'Великий Березний', region: 'Закарпатська', type: 'town' },
  { index: '89600', city: 'Мукачево', region: 'Закарпатська', type: 'city' },
  { index: '90300', city: 'Виноградів', region: 'Закарпатська', type: 'city' },
  { index: '90500', city: 'Хуст', region: 'Закарпатська', type: 'city' },
  { index: '90600', city: 'Тячів', region: 'Закарпатська', type: 'city' },
  { index: '90700', city: 'Рахів', region: 'Закарпатська', type: 'city' },

  // Чернівецька область
  { index: '58000', city: 'Чернівці', region: 'Чернівецька', type: 'city' },
  { index: '59300', city: 'Сторожинець', region: 'Чернівецька', type: 'city' },
  { index: '59400', city: 'Вижниця', region: 'Чернівецька', type: 'city' },
  { index: '60100', city: 'Хотин', region: 'Чернівецька', type: 'city' },

  // Рівне і область
  { index: '33000', city: 'Рівне', region: 'Рівненська', type: 'city' },
  { index: '34300', city: 'Сарни', region: 'Рівненська', type: 'city' },
  { index: '34400', city: 'Дубровиця', region: 'Рівненська', type: 'city' },
  { index: '34600', city: 'Костопіль', region: 'Рівненська', type: 'city' },
  { index: '35400', city: 'Здолбунів', region: 'Рівненська', type: 'city' },
  { index: '35600', city: 'Дубно', region: 'Рівненська', type: 'city' },
  { index: '35800', city: 'Острог', region: 'Рівненська', type: 'city' },

  // Волинь
  { index: '43000', city: 'Луцьк', region: 'Волинська', type: 'city' },
  { index: '44500', city: 'Ковель', region: 'Волинська', type: 'city' },
  { index: '44700', city: 'Старовижівськ', region: 'Волинська', type: 'town' },
  { index: '45200', city: 'Володимир', region: 'Волинська', type: 'city' },
  { index: '45400', city: 'Нововолинськ', region: 'Волинська', type: 'city' },

  // Кропивницький
  { index: '25000', city: 'Кропивницький', region: 'Кіровоградська', type: 'city' },
  { index: '26000', city: 'Олександрія', region: 'Кіровоградська', type: 'city' },
  { index: '26400', city: 'Світловодськ', region: 'Кіровоградська', type: 'city' },
  { index: '27500', city: 'Знам\u02bcянка', region: 'Кіровоградська', type: 'city' },
  { index: '28000', city: 'Бобринець', region: 'Кіровоградська', type: 'city' },

  // Черкаси
  { index: '18000', city: 'Черкаси', region: 'Черкаська', type: 'city' },
  { index: '19400', city: 'Жашків', region: 'Черкаська', type: 'town' },
  { index: '19500', city: 'Звенигородка', region: 'Черкаська', type: 'city' },
  { index: '19700', city: 'Шпола', region: 'Черкаська', type: 'city' },
  { index: '20300', city: 'Умань', region: 'Черкаська', type: 'city' },
  { index: '20700', city: 'Смiла', region: 'Черкаська', type: 'city' },
  { index: '20800', city: 'Канів', region: 'Черкаська', type: 'city' },

  // Миколаїв
  { index: '54000', city: 'Миколаїв', region: 'Миколаївська', type: 'city' },
  { index: '55400', city: 'Вознесенськ', region: 'Миколаївська', type: 'city' },
  { index: '56000', city: 'Первомайськ', region: 'Миколаївська', type: 'city' },
  { index: '57000', city: 'Очаків', region: 'Миколаївська', type: 'city' },
  { index: '57500', city: 'Снігурівка', region: 'Миколаївська', type: 'city' },

  // Херсон
  { index: '73000', city: 'Херсон', region: 'Херсонська', type: 'city' },
  { index: '74000', city: 'Берислав', region: 'Херсонська', type: 'city' },
  { index: '74400', city: 'Каховка', region: 'Херсонська', type: 'city' },
  { index: '75000', city: 'Скадовськ', region: 'Херсонська', type: 'city' },
];
