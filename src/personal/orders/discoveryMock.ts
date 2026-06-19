import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

// ───────────────────────────────────────────── Recommendations / Promos / Specials / Announcements

export interface OfferRecommendation {
  id: string;
  title: string;
  provider: string;
  reason: string;
  saving?: string;
  cta: string;
  accent: "blue" | "violet" | "emerald" | "amber";
}

export interface OfferPromo {
  id: string;
  title: string;
  provider: string;
  discount: string;
  validUntil: string;
  category: string;
}

export interface OfferSpecial {
  id: string;
  title: string;
  provider: string;
  description: string;
  benefit: string;
}

export interface OfferAnnouncement {
  id: string;
  title: string;
  provider: string;
  date: string;
  kind: "movie" | "course" | "event" | "service" | "sale" | "program";
}

// ───────────────────────────────────────────── Products / Services / Bookings discovery

export interface ProductOffer {
  id: string;
  title: string;
  provider: string;
  priceUah: number;
  rating: number;
  emoji: string;
  tag?: string;
}

export interface ServiceOffer {
  id: string;
  title: string;
  provider: string;
  fromUah: number;
  rating: number;
  category: string;
  distanceKm?: number;
}

export type BookingOfferKind = "hotel" | "restaurant" | "doctor" | "court" | "spa" | "event";

export interface BookingOffer {
  id: string;
  title: string;
  provider: string;
  location: string;
  nextSlot: string;
  rating: number;
  kind?: BookingOfferKind;
  priceFromUah?: number;
  durationMin?: number;
  nights?: number;
}

const RECS: Partial<Record<PersonalPreset, OfferRecommendation[]>> = {
  declarant: [
    { id: "rec-1", title: "Страхування авто Toyota CHR", provider: "ARX · UNIQA · ІнГо", reason: "AI знайшов вигіднішу пропозицію ніж поточна", saving: "−1 200 ₴ / рік", cta: "Порівняти", accent: "emerald" },
    { id: "rec-2", title: "Курс англійської B2", provider: "Cambridge.ua", reason: "Відповідає вашій цілі «Підтягнути англійську»", saving: "Старт наступного тижня", cta: "Дізнатись більше", accent: "blue" },
    { id: "rec-3", title: "Інвестиційний депозит 16,5%", provider: "monobank", reason: "На основі вашого фінансового профілю", saving: "+8 400 ₴ / рік", cta: "Відкрити", accent: "violet" },
  ],
  renter: [
    { id: "rec-r-1", title: "Страхування квартири", provider: "UNIQA · ARX", reason: "Поточний поліс закінчується за 21 день", saving: "−640 ₴ vs продовження", cta: "Підібрати", accent: "amber" },
    { id: "rec-r-2", title: "Сервіс прибирання щомісяця", provider: "CleanMe", reason: "Часто замовляєте разові клінінги — підписка дешевша", saving: "−18%", cta: "Оформити", accent: "blue" },
  ],
  master: [
    { id: "rec-m-1", title: "Курс «Колористика 2026»", provider: "Beauty Academy", reason: "Підвищить середній чек на 15–20%", saving: "Знижка −10% до 15.04", cta: "Записатись", accent: "violet" },
    { id: "rec-m-2", title: "Професійний фен Dyson Pro", provider: "Барбершоп-маркет", reason: "Знос поточного — 2+ роки", saving: "Розстрочка 0% · 6 міс.", cta: "Купити", accent: "emerald" },
    { id: "rec-m-3", title: "SMM-просування Instagram", provider: "BeautyMedia", reason: "+30% записів за прогнозом AI", saving: "Перший тиждень безкоштовно", cta: "Спробувати", accent: "blue" },
    { id: "rec-m-4", title: "Страхування професійної відповідальності", provider: "ARX", reason: "Захист від претензій клієнтів", saving: "від 1 200 ₴ / рік", cta: "Підібрати", accent: "amber" },
  ],

};

const PROMOS: Partial<Record<PersonalPreset, OfferPromo[]>> = {
  declarant: [
    { id: "pr-1", title: "Огляд + чистка зубів", provider: "Дентал Студіо", discount: "−20%", validUntil: "до 30.04", category: "Стоматологія" },
    { id: "pr-2", title: "Каско Toyota CHR", provider: "UNIQA", discount: "−15%", validUntil: "до 20.04", category: "Страхування" },
    { id: "pr-3", title: "Ремонт iPhone 15", provider: "iLand Service", discount: "−10%", validUntil: "до 25.04", category: "Ремонт техніки" },
    { id: "pr-4", title: "Пакет аналізів «Чек-ап»", provider: "Сінево", discount: "−25%", validUntil: "до 18.04", category: "Здоров'я" },
    { id: "pr-5", title: "Сімейна пʼятниця в Multiplex", provider: "Multiplex", discount: "2+1", validUntil: "щопʼятниці", category: "Кіно" },
    { id: "pr-6", title: "Tax Sale на побутову техніку", provider: "Rozetka", discount: "−30%", validUntil: "1–7 травня", category: "Електроніка" },
    { id: "pr-7", title: "Кешбек на пальне WOG", provider: "WOG · monobank", discount: "10%", validUntil: "до 30.04", category: "Пальне" },
    { id: "pr-8", title: "−15% на Bolt Food", provider: "Bolt Food", discount: "−15%", validUntil: "до 14.04", category: "Доставка їжі" },
    { id: "pr-9", title: "Авіаквитки Київ–Варшава", provider: "SkyUp", discount: "від 1 990 ₴", validUntil: "май–червень", category: "Подорож" },
    { id: "pr-10", title: "Книжки у Yakaboo", provider: "Yakaboo", discount: "−25%", validUntil: "до 17.04", category: "Книги" },
  ],
  renter: [
    { id: "pr-r-1", title: "Генеральне прибирання", provider: "CleanMe", discount: "−18%", validUntil: "до 30.04", category: "Клінінг" },
    { id: "pr-r-2", title: "Сантехнік у будь-який час", provider: "ProFix", discount: "−10%", validUntil: "щомісяця", category: "Сервіс" },
    { id: "pr-r-3", title: "Доставка води 19 л", provider: "AquaLife", discount: "−15% на перші 3", validUntil: "до 20.04", category: "Побут" },
    { id: "pr-r-4", title: "Хімчистка штор / килимів", provider: "Чистенько", discount: "−20%", validUntil: "до 30.04", category: "Дім" },
    { id: "pr-r-5", title: "Заміна замка вхідних дверей", provider: "Door Service", discount: "−10%", validUntil: "до 25.04", category: "Безпека" },
  ],
  master: [
    { id: "pr-m-1", title: "Професійні фарби Wella", provider: "Барбершоп-маркет", discount: "−15%", validUntil: "до 25.04", category: "Інструменти" },
    { id: "pr-m-2", title: "Майстер-клас «Балаяж»", provider: "Beauty Academy", discount: "−20%", validUntil: "до 12.04", category: "Освіта" },
    { id: "pr-m-3", title: "Інструмент Andis", provider: "Барбершоп-маркет", discount: "−12%", validUntil: "до 30.04", category: "Інструменти" },
    { id: "pr-m-4", title: "Косметика EVA −25%", provider: "EVA", discount: "−25%", validUntil: "до 20.04", category: "Краса" },
    { id: "pr-m-5", title: "Сімейна пʼятниця в Multiplex", provider: "Multiplex", discount: "2+1", validUntil: "щопʼятниці", category: "Кіно" },
    { id: "pr-m-6", title: "Кешбек 10% на пальне ОККО", provider: "ОККО · monobank", discount: "10%", validUntil: "до 30.04", category: "Пальне" },
    { id: "pr-m-7", title: "Доставка Glovo −20%", provider: "Glovo", discount: "−20%", validUntil: "до 14.04", category: "Доставка їжі" },
    { id: "pr-m-8", title: "Книжки у Yakaboo", provider: "Yakaboo", discount: "−25%", validUntil: "до 17.04", category: "Книги" },
  ],

};

const SPECIALS: Partial<Record<PersonalPreset, OfferSpecial[]>> = {
  declarant: [
    { id: "sp-1", title: "Кешбек 10% на пальне", provider: "monobank · WOG", description: "Для вашого тарифу White", benefit: "до 500 ₴ / міс" },
    { id: "sp-2", title: "Безкоштовний огляд у дерматолога", provider: "Добробут", description: "Як учаснику програми «Family Care»", benefit: "−1 800 ₴" },
    { id: "sp-3", title: "Подвійні бали в Сільпо", provider: "Сільпо", description: "На вихідних 12–13 квітня", benefit: "×2 бали" },
    { id: "sp-4", title: "Кешбек 5% на курси Coursera", provider: "monobank", description: "Підтримка цілі «Освіта»", benefit: "до 1 500 ₴" },
    { id: "sp-5", title: "−30% на перший Uklon Comfort", provider: "Uklon", description: "Раз на квартал для активних користувачів", benefit: "−180 ₴" },
    { id: "sp-6", title: "Безкоштовний тест-драйв BYD", provider: "BYD Україна", description: "З Вашого профілю інтересів", benefit: "Запис без передоплати" },
  ],
  renter: [
    { id: "sp-r-1", title: "−30% на перший виклик майстра", provider: "ProFix", description: "Як новому клієнту платформи", benefit: "−300 ₴" },
    { id: "sp-r-2", title: "Безкоштовна доставка побутової хімії", provider: "Епіцентр", description: "Замовлення від 800 ₴", benefit: "0 ₴ доставка" },
    { id: "sp-r-3", title: "Безкоштовний аудит лічильників", provider: "Київенерго", description: "Допомога у зниженні комуналки", benefit: "0 ₴" },
  ],
  master: [
    { id: "sp-m-1", title: "−25% на сертифікацію Wella", provider: "Wella Studio", description: "Для активних майстрів платформи", benefit: "−1 200 ₴" },
    { id: "sp-m-2", title: "Безкоштовна фотосесія робіт", provider: "BeautyMedia", description: "1 раз на квартал для портфоліо", benefit: "−2 000 ₴" },
  ],
};

const ANNOUNCEMENTS: Partial<Record<PersonalPreset, OfferAnnouncement[]>> = {
  declarant: [
    { id: "an-1", title: "«Дюна 3» — прем'єра", provider: "Multiplex", date: "18 квітня", kind: "movie" },
    { id: "an-2", title: "Новий курс «Особисті фінанси»", provider: "Prometheus", date: "Старт 22 квітня", kind: "course" },
    { id: "an-3", title: "Tax Sale до 50%", provider: "Rozetka", date: "1–7 травня", kind: "sale" },
    { id: "an-4", title: "Запуск Apple Music Classical UA", provider: "Apple", date: "Травень", kind: "service" },
    { id: "an-5", title: "Atlas Weekend 2026 — старт продажів", provider: "Concert.ua", date: "15 квітня", kind: "event" },
    { id: "an-6", title: "Програма «єОселя» — нові умови", provider: "Уряд", date: "Квітень", kind: "program" },
  ],
  renter: [
    { id: "an-r-1", title: "Новий сервіс «Розумна квартира»", provider: "Київстар", date: "Травень", kind: "service" },
    { id: "an-r-2", title: "Програма утеплення фасадів", provider: "Уряд", date: "Подача з 15.04", kind: "program" },
  ],
  master: [
    { id: "an-m-1", title: "Beauty Expo Kyiv 2026", provider: "ВЦ «Парковий»", date: "20–22 травня", kind: "event" },
  ],
};

const PRODUCTS: Partial<Record<PersonalPreset, ProductOffer[]>> = {
  declarant: [
    { id: "p-1", title: "iPhone 15 Pro 256 ГБ", provider: "Rozetka", priceUah: 52990, rating: 4.8, emoji: "📱", tag: "Хіт" },
    { id: "p-2", title: "AirPods Pro 2", provider: "iStore", priceUah: 9990, rating: 4.9, emoji: "🎧" },
    { id: "p-3", title: "Книга «Атомні звички»", provider: "Yakaboo", priceUah: 320, rating: 4.7, emoji: "📚" },
    { id: "p-4", title: "Кросівки Nike Pegasus 41", provider: "Intertop", priceUah: 4290, rating: 4.6, emoji: "👟" },
    { id: "p-5", title: "Подарунковий сертифікат Сільпо 1000 ₴", provider: "Сільпо", priceUah: 1000, rating: 4.8, emoji: "🎁" },
    { id: "p-6", title: "Кавомашина DeLonghi Magnifica", provider: "Comfy", priceUah: 18990, rating: 4.5, emoji: "☕" },
    { id: "p-7", title: "MacBook Air 13 M3", provider: "iStore", priceUah: 56990, rating: 4.9, emoji: "💻", tag: "Новинка" },
    { id: "p-8", title: "Garmin Forerunner 265", provider: "Rozetka", priceUah: 17990, rating: 4.7, emoji: "⌚" },
    { id: "p-9", title: "Lego Technic McLaren P1", provider: "Будинок іграшок", priceUah: 4990, rating: 4.8, emoji: "🧱" },
    { id: "p-10", title: "Декантер Riedel", provider: "Goodwine", priceUah: 2890, rating: 4.6, emoji: "🍷" },
    { id: "p-11", title: "Tefal сковорода 28 см", provider: "Comfy", priceUah: 1490, rating: 4.5, emoji: "🍳" },
    { id: "p-12", title: "Сертифікат «Книгарня Є» 500 ₴", provider: "Книгарня Є", priceUah: 500, rating: 4.9, emoji: "📖" },
  ],
  renter: [
    { id: "p-r-1", title: "Бойлер Ariston 80 л", provider: "Епіцентр", priceUah: 8990, rating: 4.6, emoji: "🚿" },
    { id: "p-r-2", title: "Набір інструменту Bosch 108 шт.", provider: "Епіцентр", priceUah: 3290, rating: 4.7, emoji: "🧰" },
    { id: "p-r-3", title: "Робот-пилосос Xiaomi", provider: "Rozetka", priceUah: 11990, rating: 4.5, emoji: "🤖" },
    { id: "p-r-4", title: "Зволожувач повітря Boneco", provider: "Comfy", priceUah: 4290, rating: 4.6, emoji: "💧" },
    { id: "p-r-5", title: "Світильник IKEA Tertial", provider: "IKEA UA", priceUah: 690, rating: 4.7, emoji: "💡" },
  ],
  master: [
    { id: "p-m-1", title: "Ножиці Tondeo S-Line", provider: "Барбершоп-маркет", priceUah: 4200, rating: 4.9, emoji: "✂️", tag: "Хіт" },
    { id: "p-m-2", title: "Фен Dyson Supersonic", provider: "iStore", priceUah: 18990, rating: 4.8, emoji: "💨" },
    { id: "p-m-3", title: "Стілець майстра Comair", provider: "Барбершоп-маркет", priceUah: 9990, rating: 4.6, emoji: "💺" },
    { id: "p-m-4", title: "Набір пензлів Wella Pro", provider: "Pro Hair Shop", priceUah: 1490, rating: 4.7, emoji: "🖌️" },
    { id: "p-m-5", title: "Фарби Koleston (палітра)", provider: "Pro Hair Shop", priceUah: 3450, rating: 4.8, emoji: "🎨" },
    { id: "p-m-6", title: "Кросівки Nike Air Max", provider: "Intertop", priceUah: 3990, rating: 4.6, emoji: "👟" },
    { id: "p-m-7", title: "AirPods Pro 2", provider: "iStore", priceUah: 9990, rating: 4.9, emoji: "🎧" },
    { id: "p-m-8", title: "Книга «Beauty Business»", provider: "Yakaboo", priceUah: 420, rating: 4.7, emoji: "📚" },
  ],

};

const SERVICES: Partial<Record<PersonalPreset, ServiceOffer[]>> = {
  declarant: [
    { id: "sv-1", title: "Декларація ПДФО «під ключ»", provider: "FINTODO AI", fromUah: 0, rating: 4.9, category: "Податки" },
    { id: "sv-2", title: "Юридична консультація", provider: "Юрист Online", fromUah: 600, rating: 4.7, category: "Юридичне" },
    { id: "sv-3", title: "Каско + ОСЦПВ", provider: "UNIQA", fromUah: 2840, rating: 4.6, category: "Страхування" },
    { id: "sv-4", title: "Сімейний лікар (річний пакет)", provider: "Добробут", fromUah: 4800, rating: 4.8, category: "Здоров'я" },
    { id: "sv-5", title: "Чистка кондиціонера", provider: "ClimaPro", fromUah: 850, rating: 4.5, category: "Дім" },
    { id: "sv-6", title: "Англійська 1-на-1", provider: "Cambridge.ua", fromUah: 450, rating: 4.8, category: "Освіта" },
  ],
  renter: [
    { id: "sv-r-1", title: "Клінінг квартири", provider: "CleanMe", fromUah: 1200, rating: 4.7, category: "Клінінг" },
    { id: "sv-r-2", title: "Сантехнік / електрик", provider: "ProFix", fromUah: 500, rating: 4.6, category: "Ремонт" },
    { id: "sv-r-3", title: "Перевезення речей", provider: "GoTo Move", fromUah: 1800, rating: 4.5, category: "Логістика" },
  ],
  master: [
    { id: "sv-m-1", title: "Курс «Балаяж 2026»", provider: "Beauty Academy", fromUah: 6500, rating: 4.9, category: "Освіта" },
    { id: "sv-m-2", title: "SMM для майстра", provider: "BeautyMedia", fromUah: 3500, rating: 4.6, category: "Маркетинг" },
    { id: "sv-m-3", title: "Фотосесія портфоліо", provider: "BeautyMedia", fromUah: 2000, rating: 4.8, category: "Контент" },
    { id: "sv-m-4", title: "Декларація ЄП Q1", provider: "FINTODO AI", fromUah: 0, rating: 4.9, category: "Податки" },
    { id: "sv-m-5", title: "Клінінг квартири", provider: "CleanMe", fromUah: 1100, rating: 4.7, category: "Дім" },
    { id: "sv-m-6", title: "Сімейний лікар", provider: "Добробут", fromUah: 4800, rating: 4.8, category: "Здоровʼя" },
  ],

};

const BOOKINGS: Partial<Record<PersonalPreset, BookingOffer[]>> = {
  declarant: [
    { id: "bk-1", title: "Стоматолог · огляд", provider: "Дентал Студіо", location: "Київ, Печерськ", nextSlot: "Сьогодні 18:30", rating: 4.8 },
    { id: "bk-2", title: "Корт №3, 90 хв", provider: "Tennis Club «Forhand»", location: "Київ, Дарниця", nextSlot: "Завтра 19:00", rating: 4.7 },
    { id: "bk-3", title: "Вечеря на двох", provider: "Bao + Bun", location: "Київ, центр", nextSlot: "Пт 20:00", rating: 4.6 },
    { id: "bk-4", title: "Готель у Львові, 2 ночі", provider: "Citadel Inn", location: "Львів", nextSlot: "10–12 травня", rating: 4.8 },
    { id: "bk-5", title: "Сімейний лікар", provider: "Добробут", location: "Київ, Лук'янівка", nextSlot: "Пн 09:40", rating: 4.7 },
  ],
  renter: [
    { id: "bk-r-1", title: "Майстер-сантехнік", provider: "ProFix", location: "Київ, ваш район", nextSlot: "Сьогодні 16:00", rating: 4.6 },
    { id: "bk-r-2", title: "Клінінг 2-кімн. квартири", provider: "CleanMe", location: "Київ", nextSlot: "Завтра 10:00", rating: 4.7 },
  ],
  master: [
    { id: "bk-m-1", title: "Майстер-клас «Колористика»", provider: "Beauty Academy", location: "Київ, Подол", nextSlot: "Сб 11:00", rating: 4.9 },
    { id: "bk-m-2", title: "Стоматолог · огляд", provider: "Дентал Студіо", location: "Київ, Печерськ", nextSlot: "Завтра 18:30", rating: 4.8 },
    { id: "bk-m-3", title: "Вечеря з подругою", provider: "Канапа", location: "Київ, центр", nextSlot: "Пт 19:30", rating: 4.7 },
    { id: "bk-m-4", title: "СПА-день", provider: "Five Element", location: "Київ", nextSlot: "Нд 12:00", rating: 4.8 },
    { id: "bk-m-5", title: "Йога Hatha", provider: "Yoga House", location: "Київ, Поділ", nextSlot: "Пн 19:00", rating: 4.7 },
  ],

};

export const getRecommendations = (id: string) => pickByPreset(id, RECS, [] as OfferRecommendation[]);
export const getPromos = (id: string) => pickByPreset(id, PROMOS, [] as OfferPromo[]);
export const getSpecials = (id: string) => pickByPreset(id, SPECIALS, [] as OfferSpecial[]);
export const getAnnouncements = (id: string) => pickByPreset(id, ANNOUNCEMENTS, [] as OfferAnnouncement[]);
export const getProductOffers = (id: string) => pickByPreset(id, PRODUCTS, [] as ProductOffer[]);
export const getServiceOffers = (id: string) => pickByPreset(id, SERVICES, [] as ServiceOffer[]);
export const getBookingOffers = (id: string) => pickByPreset(id, BOOKINGS, [] as BookingOffer[]);
