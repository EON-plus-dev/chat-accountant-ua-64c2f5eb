export interface FieldSchema {
  key: string;
  label: string;
  type: "string" | "text" | "markdown" | "number" | "boolean" | "select" | "tags" | "array" | "json";
  editable?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  group?: string;
  fullWidth?: boolean;
}

export const grantSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false, group: "main" },
  { key: "name", label: "Назва", type: "string", editable: true, group: "main" },
  { key: "slug", label: "Slug", type: "string", editable: true, group: "main" },
  { key: "organization", label: "Організація", type: "string", editable: true, group: "main" },
  { key: "type", label: "Тип", type: "select", editable: true, group: "main", options: [
    { value: "grant", label: "Грант" }, { value: "loan", label: "Кредит" },
    { value: "guarantee", label: "Гарантія" }, { value: "technical_assistance", label: "Тех. допомога" },
  ]},
  { key: "status", label: "Статус", type: "select", editable: true, group: "main", options: [
    { value: "active", label: "Активний" }, { value: "upcoming", label: "Скоро" },
    { value: "closed", label: "Завершений" }, { value: "announced", label: "Оголошений" },
  ]},
  { key: "audience", label: "Аудиторія", type: "select", editable: true, group: "main", options: [
    { value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" },
  ]},
  { key: "amount", label: "Сума", type: "string", editable: true, group: "main" },
  { key: "deadline", label: "Дедлайн", type: "string", editable: true, group: "main" },
  { key: "description", label: "Опис", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "tags", label: "Теги", type: "tags", editable: true, group: "meta" },
  { key: "requirements", label: "Вимоги", type: "array", editable: true, group: "content" },
  { key: "steps", label: "Кроки", type: "array", editable: true, group: "content" },
  { key: "websiteUrl", label: "Веб-сайт", type: "string", editable: true, group: "meta" },
  { key: "fintodoHelp", label: "FINTODO допомога", type: "text", editable: true, group: "content", fullWidth: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const penaltySchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false, group: "main" },
  { key: "title", label: "Назва", type: "string", editable: true, group: "main" },
  { key: "category", label: "Категорія", type: "string", editable: true, group: "main" },
  { key: "severity", label: "Критичність", type: "select", editable: true, group: "main", options: [
    { value: "critical", label: "Critical" }, { value: "high", label: "High" },
    { value: "medium", label: "Medium" }, { value: "low", label: "Low" },
  ]},
  { key: "audience", label: "Аудиторія", type: "select", editable: true, group: "main", options: [
    { value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" },
  ]},
  { key: "penaltyAmount", label: "Сума штрафу", type: "string", editable: true, group: "main" },
  { key: "penaltyAmountSecond", label: "Повторний штраф", type: "string", editable: true, group: "main" },
  { key: "legalBasis", label: "Правова підстава", type: "string", editable: true, group: "meta" },
  { key: "legalUrl", label: "URL закону", type: "string", editable: true, group: "meta" },
  { key: "description", label: "Опис", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "howToAvoid", label: "Як уникнути", type: "array", editable: true, group: "content" },
  { key: "fintodoHelp", label: "FINTODO допомога", type: "text", editable: true, group: "content", fullWidth: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const kvedSchema: FieldSchema[] = [
  { key: "code", label: "Код", type: "string", editable: true },
  { key: "name", label: "Назва", type: "string", editable: true },
  { key: "section", label: "Секція", type: "string", editable: true },
  { key: "description", label: "Опис", type: "text", editable: true },
  { key: "fopGroups", label: "Групи ФОП", type: "tags", editable: true },
  { key: "requiresLicense", label: "Потрібна ліцензія", type: "boolean", editable: true },
  { key: "licenseInfo", label: "Інфо про ліцензію", type: "text", editable: true },
  { key: "taxNotes", label: "Податкові нотатки", type: "text", editable: true },
  { key: "examples", label: "Приклади", type: "array", editable: true },
  { key: "isPopular", label: "Популярний", type: "boolean", editable: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];


export const questionSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "emoji", label: "Emoji", type: "string", editable: true },
  { key: "question", label: "Питання", type: "string", editable: true },
  { key: "audience", label: "Аудиторія", type: "select", editable: true, options: [
    { value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" },
    { value: "accountant", label: "Бухгалтер" }, { value: "both", label: "Всі" },
  ]},
  { key: "category", label: "Категорія", type: "string", editable: true },
  { key: "title", label: "Заголовок", type: "string", editable: true },
  { key: "hint", label: "Підказка", type: "string", editable: true },
];

export const hubViewSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "title", label: "Заголовок", type: "string", editable: false },
  { key: "slug", label: "Slug", type: "string", editable: false },
  { key: "subtitle", label: "Підзаголовок", type: "text", editable: false },
  { key: "updatedAt", label: "Оновлено", type: "string", editable: false },
  { key: "featuredArticleSlug", label: "Featured стаття", type: "string", editable: false },
];

export const consultationSchema: FieldSchema[] = [
  // Main
  { key: "id", label: "ID", type: "string", editable: false, group: "main" },
  { key: "slug", label: "Slug", type: "string", editable: true, group: "main" },
  { key: "question", label: "Питання", type: "text", editable: true, group: "main" },
  { key: "audience", label: "Аудиторія", type: "select", editable: true, group: "main", options: [
    { value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" },
  ]},
  { key: "status", label: "Статус", type: "select", editable: true, group: "main", options: [
    { value: "draft", label: "Чернетка" }, { value: "published", label: "Опубліковано" },
  ]},
  { key: "tags", label: "Теги", type: "tags", editable: true, group: "main" },
  { key: "date", label: "Дата", type: "string", editable: true, group: "main" },
  { key: "updatedDate", label: "Оновлено", type: "string", editable: true, group: "main" },
  { key: "views_count", label: "Перегляди", type: "number", editable: false, group: "main" },
  // Hub settings
  { key: "layout", label: "Лейаут", type: "select", editable: true, group: "hub", options: [
    { value: "standard", label: "Standard" }, { value: "hub", label: "Hub" },
  ]},
  { key: "heroTitle", label: "Hero Title", type: "string", editable: true, group: "hub" },
  { key: "subtitle", label: "Підзаголовок", type: "text", editable: true, group: "hub" },
  { key: "headerBadges", label: "Header Badges", type: "tags", editable: true, group: "hub" },
  { key: "relevanceNote", label: "Актуальність", type: "string", editable: true, group: "hub" },
  // Content
  { key: "answer", label: "Відповідь", type: "markdown", editable: true, group: "content", fullWidth: true },
  // CTA
  { key: "cardDescription", label: "Опис для картки", type: "text", editable: true, group: "cta" },
  { key: "ctaTitle", label: "CTA Title", type: "string", editable: true, group: "cta" },
  { key: "ctaDescription", label: "CTA Description", type: "text", editable: true, group: "cta" },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
  // FAQ
  { key: "faqItems", label: "FAQ Items", type: "array", editable: true, group: "content" },
  { key: "history", label: "Історія змін", type: "array", editable: false, group: "meta" },
];

export const articleSchema: FieldSchema[] = [
  // Main
  { key: "slug", label: "Slug", type: "string", editable: false, group: "main" },
  { key: "title", label: "Заголовок", type: "string", editable: true, group: "main" },
  { key: "excerpt", label: "Анотація", type: "text", editable: true, group: "main" },
  { key: "type", label: "Тип", type: "select", editable: true, group: "main", options: [
    { value: "news", label: "Новина" }, { value: "guide", label: "Гайд" },
    { value: "analysis", label: "Аналітика" }, { value: "change", label: "Зміна" },
    { value: "dps", label: "ДПС" }, { value: "podcast", label: "Подкаст" }, { value: "video", label: "Відео" },
  ]},
  { key: "audience", label: "Аудиторія", type: "select", editable: true, group: "main", options: [
    { value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" },
  ]},
  { key: "authorId", label: "Автор", type: "string", editable: true, group: "main" },
  { key: "category", label: "Категорія", type: "string", editable: true, group: "main" },
  { key: "categoryLabel", label: "Категорія (label)", type: "string", editable: true, group: "main" },
  { key: "tags", label: "Теги", type: "tags", editable: true, group: "main" },
  { key: "publishedAt", label: "Дата публікації", type: "string", editable: true, group: "main" },
  { key: "updatedAt", label: "Оновлено", type: "string", editable: true, group: "main" },
  { key: "readingMinutes", label: "Час читання (хв)", type: "number", editable: true, group: "main" },
  { key: "views", label: "Перегляди", type: "number", editable: false, group: "main" },
  { key: "isFeatured", label: "Featured", type: "boolean", editable: true, group: "main" },
  { key: "isPremium", label: "Premium", type: "boolean", editable: true, group: "main" },
  // Content
  { key: "content", label: "Контент", type: "markdown", editable: true, group: "content", fullWidth: true },
  { key: "tldr", label: "TL;DR", type: "text", editable: true, group: "content", fullWidth: true },
  // Media
  { key: "contentType", label: "Тип контенту", type: "select", editable: true, group: "media", options: [
    { value: "text", label: "Текст" }, { value: "podcast", label: "Подкаст" }, { value: "video", label: "Відео" },
  ]},
  { key: "mediaType", label: "Тип медіа", type: "select", editable: true, group: "media", options: [
    { value: "video", label: "Відео" }, { value: "audio", label: "Аудіо" }, { value: "image", label: "Зображення" },
  ]},
  { key: "mediaUrl", label: "Media URL", type: "string", editable: true, group: "media" },
  { key: "mediaDuration", label: "Тривалість", type: "string", editable: true, group: "media" },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
  // Extras
  { key: "chapters", label: "Розділи", type: "array", editable: true, group: "content" },
  { key: "guests", label: "Гості", type: "array", editable: true, group: "media" },
  { key: "episodeNumber", label: "Номер епізоду", type: "number", editable: true, group: "media" },
  { key: "transcript", label: "Транскрипція", type: "markdown", editable: true, group: "media", fullWidth: true },
  { key: "externalLinks", label: "Зовнішні посилання", type: "array", editable: true, group: "meta" },
];

export const deadlineSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "title", label: "Назва", type: "string", editable: true },
  { key: "date", label: "Дата", type: "string", editable: true },
  { key: "type", label: "Тип", type: "select", editable: true, options: [
    { value: "payment", label: "Оплата" }, { value: "report", label: "Звіт" },
  ]},
  { key: "taxType", label: "Платник", type: "string", editable: true },
  { key: "quarter", label: "Квартал", type: "number", editable: true },
  { key: "penalty", label: "Штраф", type: "text", editable: true },
  { key: "legalBasis", label: "Правова підстава", type: "string", editable: true },
  { key: "isCritical", label: "Критичний", type: "boolean", editable: true },
];

export const toolSchema: FieldSchema[] = [
  { key: "slug", label: "Slug", type: "string", editable: false },
  { key: "name", label: "Назва", type: "string", editable: true },
  { key: "category", label: "Категорія", type: "string", editable: true },
  { key: "emoji", label: "Emoji", type: "string", editable: true },
  { key: "isPremium", label: "Premium", type: "boolean", editable: true },
  { key: "isNew", label: "New", type: "boolean", editable: true },
  { key: "usageLabel", label: "Використання", type: "string", editable: true },
];

export const knowledgeSchema: FieldSchema[] = [
  { key: "slug", label: "Slug", type: "string", editable: false },
  { key: "term", label: "Термін", type: "string", editable: true },
  { key: "category", label: "Категорія", type: "string", editable: true },
  { key: "shortDefinition", label: "Коротке визначення", type: "text", editable: true },
  { key: "relatedTermSlugs", label: "Пов'язані терміни", type: "tags", editable: true },
  { key: "relatedArticleIds", label: "Пов'язані статті", type: "tags", editable: true },
  { key: "relatedToolIds", label: "Пов'язані інструменти", type: "tags", editable: true },
];

export const newsletterSchema: FieldSchema[] = [
  { key: "issue", label: "Номер", type: "number", editable: false },
  { key: "title", label: "Заголовок", type: "string", editable: true },
  { key: "date", label: "Дата", type: "string", editable: true },
  { key: "summary", label: "Опис", type: "text", editable: true },
  { key: "subscribersAtTime", label: "Підписники", type: "number", editable: false },
  { key: "highlights", label: "Highlights", type: "array", editable: true },
  { key: "articleIds", label: "ID статей", type: "tags", editable: true },
];

export const courseSchema: FieldSchema[] = [
  // Main
  { key: "slug", label: "Slug", type: "string", editable: false, group: "main" },
  { key: "title", label: "Назва", type: "string", editable: true, group: "main" },
  { key: "tagline", label: "Підзаголовок", type: "string", editable: true, group: "main" },
  { key: "description", label: "Опис", type: "text", editable: true, group: "main", fullWidth: true },
  { key: "level", label: "Рівень", type: "select", editable: true, group: "main", options: [
    { value: "beginner", label: "Початковий" }, { value: "intermediate", label: "Середній" }, { value: "advanced", label: "Просунутий" },
  ]},
  { key: "format", label: "Формат", type: "select", editable: true, group: "main", options: [
    { value: "video", label: "Відео" }, { value: "text", label: "Текст" }, { value: "interactive", label: "Інтерактив" }, { value: "webinar", label: "Вебінар" },
  ]},
  { key: "category", label: "Категорія", type: "string", editable: true, group: "main" },
  { key: "categoryLabel", label: "Категорія (label)", type: "string", editable: true, group: "main" },
  { key: "lessonsCount", label: "Уроків", type: "number", editable: true, group: "main" },
  { key: "duration", label: "Тривалість", type: "string", editable: true, group: "main" },
  // Pricing & stats
  { key: "isFree", label: "Безкоштовний", type: "boolean", editable: true, group: "main" },
  { key: "price", label: "Ціна", type: "number", editable: true, group: "main" },
  { key: "enrolled", label: "Записані", type: "number", editable: false, group: "main" },
  { key: "rating", label: "Рейтинг", type: "number", editable: true, group: "main" },
  { key: "isNew", label: "Новий", type: "boolean", editable: true, group: "meta" },
  { key: "isPopular", label: "Популярний", type: "boolean", editable: true, group: "meta" },
  // Instructor
  { key: "instructorName", label: "Інструктор (ім'я)", type: "string", editable: true, group: "meta" },
  { key: "instructorRole", label: "Інструктор (роль)", type: "string", editable: true, group: "meta" },
  { key: "certificate", label: "Сертифікат", type: "boolean", editable: true, group: "meta" },
  // Content
  { key: "whatYouLearn", label: "Що вивчите", type: "array", editable: true, group: "content" },
  { key: "requirements", label: "Вимоги", type: "array", editable: true, group: "content" },
  { key: "relatedToolIds", label: "Пов'язані інструменти", type: "tags", editable: true, group: "content" },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const lawSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "shortName", label: "Коротка назва", type: "string", editable: true },
  { key: "fullName", label: "Повна назва", type: "text", editable: true },
  { key: "number", label: "Номер", type: "string", editable: true },
  { key: "category", label: "Категорія", type: "string", editable: true },
  { key: "type", label: "Тип", type: "string", editable: true },
  { key: "description", label: "Опис", type: "text", editable: true },
  { key: "officialUrl", label: "URL", type: "string", editable: true },
  { key: "keyPoints", label: "Ключові норми", type: "array", editable: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];


export const accountantSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "name", label: "Ім'я", type: "string", editable: true },
  { key: "city", label: "Місто", type: "string", editable: true },
  { key: "region", label: "Область", type: "string", editable: true },
  { key: "isOnline", label: "Онлайн", type: "boolean", editable: true },
  { key: "specializations", label: "Спеціалізації", type: "tags", editable: true },
  { key: "experience", label: "Досвід (років)", type: "number", editable: true },
  { key: "priceDisplay", label: "Ціна", type: "string", editable: true },
  { key: "rating", label: "Рейтинг", type: "number", editable: true },
  { key: "reviewCount", label: "Відгуків", type: "number", editable: true },
  { key: "description", label: "Опис", type: "text", editable: true },
  { key: "isFintodoCertified", label: "FINTODO Certified", type: "boolean", editable: true },
  { key: "isVerified", label: "Verified", type: "boolean", editable: true },
  { key: "languages", label: "Мови", type: "tags", editable: true },
  { key: "responseTime", label: "Час відповіді", type: "string", editable: true },
];

export const comparisonSchema: FieldSchema[] = [
  { key: "id", label: "Slug", type: "string", editable: false },
  { key: "leftTitle", label: "Ліва сторона", type: "string", editable: true },
  { key: "rightTitle", label: "Права сторона", type: "string", editable: true },
];

export const salarySchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "position", label: "Посада", type: "string", editable: true },
  { key: "category", label: "Категорія", type: "string", editable: true },
  { key: "region", label: "Регіон", type: "string", editable: true },
  { key: "experienceLevel", label: "Рівень", type: "select", editable: true, options: [
    { value: "junior", label: "Junior" }, { value: "middle", label: "Middle" }, { value: "senior", label: "Senior" },
  ]},
  { key: "salaryMedian", label: "Медіана", type: "number", editable: true },
  { key: "salaryMin", label: "Мінімум", type: "number", editable: true },
  { key: "salaryMax", label: "Максимум", type: "number", editable: true },
  { key: "currency", label: "Валюта", type: "select", editable: true, options: [
    { value: "UAH", label: "UAH" }, { value: "USD", label: "USD" },
  ]},
  { key: "trend", label: "Тренд", type: "select", editable: true, options: [
    { value: "up", label: "Зростає" }, { value: "down", label: "Падає" }, { value: "stable", label: "Стабільно" },
  ]},
  { key: "trendPercent", label: "Тренд %", type: "number", editable: true },
  { key: "demandLevel", label: "Попит", type: "select", editable: true, options: [
    { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" },
  ]},
  { key: "topSkills", label: "Топ навички", type: "tags", editable: true },
];

export const mortgageSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "name", label: "Назва", type: "string", editable: true },
  { key: "bank", label: "Банк", type: "string", editable: true },
  { key: "type", label: "Тип", type: "select", editable: true, options: [
    { value: "state", label: "Державна" }, { value: "commercial", label: "Комерційна" },
  ]},
  { key: "rate", label: "Ставка %", type: "number", editable: true },
  { key: "rateDisplay", label: "Відображення ставки", type: "string", editable: true },
  { key: "minDownPayment", label: "Мін. внесок %", type: "number", editable: true },
  { key: "maxTermYears", label: "Макс. термін (р.)", type: "number", editable: true },
  { key: "isOpen", label: "Відкрита", type: "boolean", editable: true },
  { key: "requirements", label: "Вимоги", type: "array", editable: true },
  { key: "targetAudience", label: "Цільова аудиторія", type: "tags", editable: true },
];

export const categorySchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "emoji", label: "Emoji", type: "string", editable: true },
  { key: "name", label: "Назва", type: "string", editable: true },
  { key: "count", label: "Статей", type: "number", editable: true },
  { key: "hotTopic", label: "Hot Topic", type: "string", editable: true },
  { key: "slug", label: "Slug", type: "string", editable: true },
];

export const dovidnykySchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "slug", label: "Slug", type: "string", editable: true },
  { key: "name", label: "Назва", type: "string", editable: true },
  { key: "emoji", label: "Emoji", type: "string", editable: true },
  { key: "tagline", label: "Tagline", type: "string", editable: true },
  { key: "description", label: "Опис", type: "text", editable: true },
  { key: "audience", label: "Аудиторія", type: "select", editable: true, options: [
    { value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" },
  ]},
  { key: "entryCount", label: "К-сть записів", type: "number", editable: true },
  { key: "entryLabel", label: "Лейбл записів", type: "string", editable: true },
  { key: "isNew", label: "Новий", type: "boolean", editable: true },
  { key: "isLive", label: "Live", type: "boolean", editable: true },
  { key: "highlights", label: "Highlights", type: "tags", editable: true },
];

export const rankingSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false, group: "main" },
  { key: "slug", label: "Slug", type: "string", editable: true, group: "main" },
  { key: "name", label: "Назва", type: "string", editable: true, group: "main" },
  { key: "rank", label: "Ранг", type: "number", editable: true, group: "main" },
  { key: "score", label: "Оцінка", type: "number", editable: true, group: "main" },
  { key: "category", label: "Категорія", type: "string", editable: true, group: "main" },
  { key: "tags", label: "Теги", type: "tags", editable: true, group: "main" },
  { key: "description", label: "Опис", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "pros", label: "Переваги", type: "array", editable: true, group: "content" },
  { key: "cons", label: "Недоліки", type: "array", editable: true, group: "content" },
  { key: "isOurProduct", label: "Наш продукт", type: "boolean", editable: true, group: "meta" },
  { key: "badge", label: "Badge", type: "string", editable: true, group: "meta" },
  { key: "website", label: "Сайт", type: "string", editable: true, group: "meta" },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const aiConsultationSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false, group: "main" },
  { key: "slug", label: "Slug", type: "string", editable: true, group: "main" },
  { key: "question", label: "Питання", type: "text", editable: true, group: "main" },
  { key: "status", label: "Статус", type: "select", editable: true, group: "main", options: [
    { value: "pending", label: "На модерації" }, { value: "published", label: "Опубліковано" }, { value: "rejected", label: "Відхилено" },
  ]},
  { key: "audience", label: "Аудиторія", type: "select", editable: true, group: "main", options: [
    { value: "business", label: "Бізнес" }, { value: "individual", label: "Фізособа" },
  ]},
  { key: "tags", label: "Теги", type: "tags", editable: true, group: "main" },
  { key: "date", label: "Дата", type: "string", editable: false, group: "main" },
  { key: "viewCount", label: "Перегляди", type: "number", editable: false, group: "main" },
  { key: "followUpCount", label: "Follow-ups", type: "number", editable: false, group: "main" },
  { key: "source", label: "Джерело", type: "string", editable: false, group: "meta" },
  // Content
  { key: "answer", label: "Відповідь", type: "markdown", editable: true, group: "content", fullWidth: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const institutionProfileSchema: FieldSchema[] = [
  // Main
  { key: "id", label: "ID", type: "string", editable: false, group: "main" },
  { key: "slug", label: "Slug", type: "string", editable: true, group: "main" },
  { key: "name", label: "Назва", type: "string", editable: true, group: "main" },
  { key: "shortName", label: "Коротка назва", type: "string", editable: true, group: "main" },
  { key: "legalName", label: "Юридична назва", type: "string", editable: true, group: "main" },
  { key: "brandNames", label: "Бренди", type: "tags", editable: true, group: "main" },
  { key: "website", label: "Вебсайт", type: "string", editable: true, group: "main" },
  { key: "verified", label: "Верифіковано", type: "boolean", editable: true, group: "main" },
  { key: "verifiedDate", label: "Дата верифікації", type: "string", editable: true, group: "main" },
  { key: "dataLastUpdated", label: "Дані оновлено", type: "string", editable: true, group: "main" },
  { key: "types", label: "Типи послуг", type: "tags", editable: true, group: "main" },
  // Company
  { key: "company.foundedYear", label: "Рік заснування", type: "number", editable: true, group: "company" },
  { key: "company.headquarters", label: "Штаб-квартира", type: "string", editable: true, group: "company" },
  { key: "company.employeesCount", label: "Кількість працівників", type: "string", editable: true, group: "company" },
  { key: "company.story", label: "Історія", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "company.keyPeople", label: "Ключові люди", type: "json", editable: true, group: "company" },
  { key: "company.milestones", label: "Етапи розвитку", type: "json", editable: true, group: "company" },
  { key: "company.investors", label: "Інвестори", type: "tags", editable: true, group: "company" },
  { key: "company.funding", label: "Фінансування", type: "string", editable: true, group: "company" },
  // Legal
  { key: "legal.edrpou", label: "ЄДРПОУ", type: "string", editable: true, group: "legal" },
  { key: "legal.status", label: "Юридичний статус", type: "select", editable: true, group: "legal", options: [
    { value: "active", label: "Активна" }, { value: "liquidation", label: "Ліквідація" }, { value: "suspended", label: "Призупинена" },
  ]},
  { key: "legal.licenses", label: "Ліцензії", type: "json", editable: true, group: "legal" },
  { key: "legal.certifications", label: "Сертифікації", type: "json", editable: true, group: "legal" },
  { key: "legal.regulators", label: "Регулятори", type: "tags", editable: true, group: "legal" },
  { key: "legal.registrationNumber", label: "Номер реєстрації", type: "string", editable: true, group: "legal" },
  { key: "legal.registrationDate", label: "Дата реєстрації", type: "string", editable: true, group: "legal" },
  { key: "legal.address.legal", label: "Юридична адреса", type: "string", editable: true, group: "legal" },
  { key: "legal.address.actual", label: "Фактична адреса", type: "string", editable: true, group: "legal" },
  // Contacts
  { key: "contacts.support.freePhone", label: "Безкоштовний телефон", type: "string", editable: true, group: "contacts" },
  { key: "contacts.support.email", label: "Email підтримки", type: "string", editable: true, group: "contacts" },
  { key: "contacts.mainOffice.phones", label: "Телефони офісу", type: "tags", editable: true, group: "contacts" },
  { key: "contacts.mainOffice.emails", label: "Email офісу", type: "tags", editable: true, group: "contacts" },
  { key: "contacts.mainOffice.address", label: "Адреса офісу", type: "string", editable: true, group: "contacts" },
  { key: "contacts.press.email", label: "Email прес-служби", type: "string", editable: true, group: "contacts" },
  { key: "contacts.social.telegram", label: "Telegram", type: "string", editable: true, group: "contacts" },
  { key: "contacts.social.facebook", label: "Facebook", type: "string", editable: true, group: "contacts" },
  { key: "contacts.social.instagram", label: "Instagram", type: "string", editable: true, group: "contacts" },
  { key: "contacts.social.youtube", label: "YouTube", type: "string", editable: true, group: "contacts" },
  // Platforms
  { key: "platforms.web.available", label: "Веб-платформа", type: "boolean", editable: true, group: "meta" },
  { key: "platforms.ios.rating", label: "iOS рейтинг", type: "number", editable: true, group: "meta" },
  { key: "platforms.android.rating", label: "Android рейтинг", type: "number", editable: true, group: "meta" },
  // Security & Compliance
  { key: "security.certifications", label: "Сертифікати безпеки", type: "tags", editable: true, group: "compliance_detail" },
  { key: "compliance.aml", label: "AML", type: "boolean", editable: true, group: "compliance_detail" },
  { key: "compliance.gdpr", label: "GDPR", type: "boolean", editable: true, group: "compliance_detail" },
  { key: "compliance.nbu", label: "Ліцензія НБУ", type: "boolean", editable: true, group: "compliance_detail" },
  { key: "compliance.dps", label: "ДПС", type: "boolean", editable: true, group: "compliance_detail" },
  { key: "compliance.dia", label: "Дія", type: "boolean", editable: true, group: "compliance_detail" },
  { key: "compliance.pep", label: "PEP перевірка", type: "boolean", editable: true, group: "compliance_detail" },
  { key: "compliance.sanctions", label: "Санкції", type: "boolean", editable: true, group: "compliance_detail" },
  { key: "compliance.openBanking", label: "Open Banking", type: "boolean", editable: true, group: "compliance_detail" },
  { key: "compliance.reportingFormats", label: "Формати звітності", type: "tags", editable: true, group: "compliance_detail" },
  // Branches
  { key: "branches.totalCount", label: "Відділень", type: "number", editable: true, group: "meta" },
  { key: "branches.atmCount", label: "Банкоматів", type: "number", editable: true, group: "meta" },
  // Ratings
  { key: "ratings.fintodo.overall", label: "Рейтинг FINTODO", type: "number", editable: true, group: "ratings_ext" },
  { key: "ratings.fintodo.rank", label: "Ранг FINTODO", type: "number", editable: true, group: "ratings_ext" },
  { key: "ratings.external", label: "Зовнішні рейтинги", type: "json", editable: true, group: "ratings_ext" },
  { key: "ratings.averageExternal", label: "Середній зовнішній", type: "number", editable: true, group: "ratings_ext" },
  { key: "ratings.totalReviewsAllSources", label: "Всього відгуків", type: "number", editable: true, group: "ratings_ext" },
  // Products
  { key: "products", label: "Продукти", type: "json", editable: true, group: "products", fullWidth: true },
  // Editorial
  { key: "editorial.oneLiner", label: "Короткий опис", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "editorial.shortTake", label: "Висновок", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "editorial.fullVerdict", label: "Повний вердикт", type: "markdown", editable: true, group: "content", fullWidth: true },
  { key: "editorial.verdict", label: "Вердикт (коротко)", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "editorial.prosShort", label: "Переваги (коротко)", type: "array", editable: true, group: "content" },
  { key: "editorial.consShort", label: "Недоліки (коротко)", type: "array", editable: true, group: "content" },
  { key: "editorial.bestFor", label: "Найкраще для", type: "array", editable: true, group: "content" },
  { key: "editorial.notFor", label: "Не підходить для", type: "array", editable: true, group: "content" },
  { key: "editorial.totalScore", label: "Загальна оцінка", type: "number", editable: true, group: "editorial" },
  { key: "editorial.totalFormula", label: "Формула оцінки", type: "string", editable: true, group: "editorial" },
  { key: "editorial.independenceStatement", label: "Заява про незалежність", type: "text", editable: true, group: "editorial" },
  { key: "editorial.scores", label: "Оцінки за категоріями", type: "json", editable: true, group: "editorial" },
  { key: "editorial.methodology", label: "Методологія", type: "json", editable: true, group: "editorial" },
  // Reviews
  { key: "reviewThemes", label: "Теми відгуків", type: "json", editable: true, group: "reviews" },
  { key: "reviewSourcesNote", label: "Примітка джерел", type: "text", editable: true, group: "reviews" },
  // Comparisons
  { key: "comparisons", label: "Порівняння", type: "json", editable: true, group: "comparisons", fullWidth: true },
  // News & Changelog
  { key: "news", label: "Новини", type: "json", editable: true, group: "news" },
  { key: "changelog", label: "Changelog", type: "json", editable: true, group: "news" },
  // Awards & Partnerships
  { key: "awards", label: "Нагороди", type: "json", editable: true, group: "awards" },
  { key: "partnerships", label: "Партнерства", type: "json", editable: true, group: "awards" },
  // War period
  { key: "warPeriod.operationalStatus", label: "Операційний статус", type: "string", editable: true, group: "war" },
  { key: "warPeriod.reliability", label: "Надійність", type: "text", editable: true, group: "war" },
  { key: "warPeriod.charity", label: "Благодійність", type: "text", editable: true, group: "war" },
  // Integrations
  { key: "integrations", label: "Інтеграції", type: "json", editable: true, group: "integrations" },
  // CTA
  { key: "cta.primary.label", label: "CTA Primary Label", type: "string", editable: true, group: "cta" },
  { key: "cta.primary.href", label: "CTA Primary URL", type: "string", editable: true, group: "cta" },
  { key: "cta.secondary.label", label: "CTA Secondary Label", type: "string", editable: true, group: "cta" },
  { key: "cta.secondary.href", label: "CTA Secondary URL", type: "string", editable: true, group: "cta" },
  // Checklists & Service details
  { key: "documentChecklists", label: "Документ. чеклісти", type: "json", editable: true, group: "checklists", fullWidth: true },
  { key: "commonMistakes", label: "Типові помилки", type: "array", editable: true, group: "checklists" },
  { key: "onlineServices", label: "Онлайн-сервіси", type: "array", editable: true, group: "checklists" },
  { key: "offlineRequirements", label: "Офлайн-вимоги", type: "array", editable: true, group: "checklists" },
  // AI
  { key: "aiUsefulLinks", label: "AI корисні посилання", type: "json", editable: true, group: "ai" },
  // FAQ & Known Issues
  { key: "faq", label: "FAQ", type: "json", editable: true, group: "content", fullWidth: true },
  { key: "knownIssues", label: "Відомі проблеми / скарги", type: "json", editable: true, group: "content", fullWidth: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const competencySchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "emoji", label: "Emoji", type: "string", editable: true },
  { key: "title", label: "Назва", type: "string", editable: true },
  { key: "description", label: "Опис", type: "text", editable: true },
  { key: "accessTier", label: "Доступ", type: "select", editable: true, options: [
    { value: "sponsored", label: "Sponsored" }, { value: "premium", label: "Premium" },
  ]},
  { key: "sponsorName", label: "Спонсор", type: "string", editable: true },
  { key: "badge", label: "Badge", type: "string", editable: true },
  { key: "examples", label: "Приклади", type: "array", editable: true },
  { key: "quickStartPrompt", label: "Quick Start Prompt", type: "string", editable: true },
];

export const templateSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "slug", label: "Slug", type: "string", editable: true },
  { key: "name", label: "Назва", type: "string", editable: true },
  { key: "category", label: "Категорія", type: "string", editable: true },
  { key: "audience", label: "Аудиторія", type: "select", editable: true, options: [
    { value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" },
  ]},
  { key: "format", label: "Формат", type: "string", editable: true },
  { key: "description", label: "Опис", type: "text", editable: true },
  { key: "tags", label: "Теги", type: "tags", editable: true },
  { key: "isPopular", label: "Популярний", type: "boolean", editable: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const registerSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "slug", label: "Slug", type: "string", editable: true },
  { key: "shortName", label: "Коротка назва", type: "string", editable: true },
  { key: "name", label: "Повна назва", type: "string", editable: true },
  { key: "operator", label: "Оператор", type: "string", editable: true },
  { key: "url", label: "URL", type: "string", editable: true },
  { key: "isFree", label: "Безкоштовний", type: "boolean", editable: true },
  { key: "audience", label: "Аудиторія", type: "select", editable: true, options: [
    { value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" },
  ]},
  { key: "description", label: "Опис", type: "text", editable: true },
  { key: "whatToCheck", label: "Що перевірити", type: "array", editable: true },
  { key: "tags", label: "Теги", type: "tags", editable: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const rateTableSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "slug", label: "Slug", type: "string", editable: true },
  { key: "name", label: "Назва", type: "string", editable: true },
  { key: "category", label: "Категорія", type: "select", editable: true, options: [
    { value: "wages", label: "Зарплата та соцпоказники" }, { value: "taxes", label: "Податки" }, { value: "social", label: "Соціальне забезпечення" },
  ]},
  { key: "description", label: "Опис", type: "text", editable: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const businessFormSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false },
  { key: "slug", label: "Slug", type: "string", editable: true },
  { key: "name", label: "Назва", type: "string", editable: true },
  { key: "fullName", label: "Повна назва", type: "string", editable: true },
  { key: "emoji", label: "Emoji", type: "string", editable: true },
  { key: "liability", label: "Відповідальність", type: "string", editable: true },
  { key: "minCapital", label: "Стат. капітал", type: "string", editable: true },
  { key: "registrationTime", label: "Час реєстрації", type: "string", editable: true },
  { key: "accountingComplexity", label: "Складність обліку", type: "select", editable: true, options: [
    { value: "low", label: "Низька" }, { value: "medium", label: "Середня" }, { value: "high", label: "Висока" },
  ]},
  { key: "employeesAllowed", label: "Наймані працівники", type: "boolean", editable: true },
  { key: "description", label: "Опис", type: "text", editable: true },
  { key: "pros", label: "Переваги", type: "array", editable: true },
  { key: "cons", label: "Недоліки", type: "array", editable: true },
  { key: "taxOptions", label: "Системи оподаткування", type: "array", editable: true },
  { key: "bestFor", label: "Найкраще для", type: "array", editable: true },
  { key: "tags", label: "Теги", type: "tags", editable: true },
  // SEO
  { key: "seoTitle", label: "SEO Title", type: "string", editable: true, group: "seo" },
  { key: "seoDescription", label: "SEO Description", type: "text", editable: true, group: "seo" },
  { key: "seoKeywords", label: "SEO Keywords", type: "tags", editable: true, group: "seo" },
];

export const licenseSchema: FieldSchema[] = [
  { key: "id", label: "ID", type: "string", editable: false, group: "main" },
  { key: "slug", label: "Slug", type: "string", editable: true, group: "main" },
  { key: "name", label: "Назва", type: "string", editable: true, group: "main" },
  { key: "category", label: "Категорія", type: "string", editable: true, group: "main" },
  { key: "audience", label: "Аудиторія", type: "select", editable: true, group: "main", options: [
    { value: "business", label: "Бізнес" }, { value: "personal", label: "Фізособа" }, { value: "both", label: "Обидва" },
  ]},
  { key: "issuingAuthority", label: "Орган видачі", type: "string", editable: true, group: "main" },
  { key: "cost", label: "Вартість", type: "string", editable: true, group: "main" },
  { key: "costDetails", label: "Деталі вартості", type: "text", editable: true, group: "main" },
  { key: "processingTime", label: "Термін оформлення", type: "string", editable: true, group: "main" },
  { key: "validity", label: "Термін дії", type: "string", editable: true, group: "main" },
  { key: "legalBasis", label: "Правова підстава", type: "string", editable: true, group: "content" },
  { key: "legalUrl", label: "URL закону", type: "string", editable: true, group: "content" },
  { key: "description", label: "Короткий опис", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "fullDescription", label: "Повний опис", type: "markdown", editable: true, group: "content", fullWidth: true },
  { key: "requiredDocuments", label: "Документи", type: "tags", editable: true, group: "content", fullWidth: true },
  { key: "kvedCodes", label: "Коди КВЕД", type: "tags", editable: true, group: "content" },
  { key: "fintodoHelp", label: "Допомога Fintodo", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "warnings", label: "Попередження", type: "tags", editable: true, group: "content" },
  { key: "consequences", label: "Наслідки", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "practicalExample", label: "Практичний приклад", type: "text", editable: true, group: "content", fullWidth: true },
  { key: "faq", label: "FAQ", type: "json", editable: true, group: "content", fullWidth: true },
];

// Group labels for UI
export const FIELD_GROUP_LABELS: Record<string, string> = {
  main: "Основне",
  content: "Контент",
  hub: "Hub-налаштування",
  seo: "SEO",
  cta: "CTA / Промо",
  media: "Медіа",
  meta: "Мета-дані",
  company: "Компанія",
  legal: "Юридичне",
  contacts: "Контакти",
  compliance_detail: "Безпека та відповідність",
  ratings_ext: "Рейтинги",
  products: "Продукти",
  editorial: "Редакційні оцінки",
  reviews: "Відгуки",
  comparisons: "Порівняння",
  news: "Новини та Changelog",
  awards: "Нагороди та партнерства",
  war: "Воєнний стан",
  integrations: "Інтеграції",
  checklists: "Чеклісти та сервіси",
  ai: "AI",
};
