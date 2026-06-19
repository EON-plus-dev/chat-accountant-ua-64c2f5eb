interface SeoInput {
  title: string;
  content?: string;
  tldr?: string;
  type?: string;
  audience?: string;
}

interface SeoResult {
  seoTitle: string;
  seoDescription: string;
  slug: string;
}

const BRAND_NAME = "FINTODO";
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 155;

const UK_STOP_WORDS = new Set([
  "а", "або", "але", "без", "біля", "бути", "в", "від", "для", "до", "ж",
  "за", "з", "і", "із", "й", "їх", "коли", "на", "над", "не", "ні", "о",
  "по", "під", "при", "про", "та", "те", "у", "це", "ця", "цей", "ці", "що",
  "як", "чи",
]);

type SeoContentKind =
  | "article"
  | "consultation"
  | "institution"
  | "dictionary"
  | "template"
  | "register"
  | "rate"
  | "license"
  | "law"
  | "grant"
  | "penalty"
  | "kved"
  | "course"
  | "businessForm"
  | "accountant";

/** Transliterate Ukrainian to latin slug */
function transliterate(text: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye",
    ж: "zh", з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l",
    м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "",
    ю: "yu", я: "ya",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function stripMarkup(text: string): string {
  return normalizeWhitespace(
    text
      .replace(/<[^>]*>/g, " ")
      .replace(/[#[\]*_`~>|]/g, " ")
      .replace(/https?:\/\/\S+/g, " ")
  );
}

function smartTrim(text: string, maxLength: number): string {
  const normalized = normalizeWhitespace(text);
  if (normalized.length <= maxLength) return normalized;

  const trimmed = normalized.slice(0, maxLength + 1);
  const lastSpace = trimmed.lastIndexOf(" ");
  const candidate = lastSpace > maxLength * 0.6 ? trimmed.slice(0, lastSpace) : normalized.slice(0, maxLength);

  return candidate.replace(/[,:;\-–\s]+$/g, "").trim();
}

function limitSentence(text: string, maxLength: number): string {
  const cleaned = smartTrim(text, maxLength);
  return cleaned.replace(/[\s,.!?:;]+$/g, "").trim();
}

function normalizeSnippet(text?: string): string {
  if (!text) return "";

  const cleaned = stripMarkup(text);
  if (!cleaned) return "";

  const firstSentence = cleaned.match(/.+?[.!?](?=\s|$)/)?.[0] ?? cleaned;
  return limitSentence(firstSentence, 105);
}

function inferContentKind(type?: string): SeoContentKind {
  const normalized = (type || "article").toLowerCase();

  if (normalized.includes("consult")) return "consultation";
  if (normalized.includes("institution")) return "institution";
  if (normalized.includes("knowledge") || normalized.includes("dictionary") || normalized.includes("слов")) return "dictionary";
  if (normalized.includes("template")) return "template";
  if (normalized.includes("register")) return "register";
  if (normalized.includes("rate")) return "rate";
  if (normalized.includes("license")) return "license";
  if (normalized.includes("law")) return "law";
  if (normalized.includes("grant")) return "grant";
  if (normalized.includes("penalt")) return "penalty";
  if (normalized.includes("kved")) return "kved";
  if (normalized.includes("course") || normalized.includes("learn")) return "course";
  if (normalized.includes("business-form") || normalized.includes("business_form")) return "businessForm";
  if (normalized.includes("accountant")) return "accountant";

  return "article";
}

function getAudienceSuffix(audience?: string): string {
  const normalized = (audience || "").toLowerCase();
  if (!normalized) return "";
  if (normalized.includes("фіз") && !normalized.includes("фоп")) return " для фізосіб";
  if (normalized.includes("біз") || normalized.includes("компан") || normalized.includes("юрос") || normalized.includes("фоп")) {
    return " для ФОП і бізнесу";
  }
  return "";
}

function extractFocusPhrase(title: string): string {
  const cleanedTitle = normalizeWhitespace(title.replace(/[«»"']/g, " "));
  const words = cleanedTitle
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !UK_STOP_WORDS.has(word));

  const uniqueWords = [...new Set(words)].slice(0, 5);
  if (uniqueWords.length >= 2) {
    return limitSentence(uniqueWords.join(" "), 52);
  }

  return limitSentence(cleanedTitle || "матеріал", 52);
}

function buildSeoTitle(title: string, kind: SeoContentKind): string {
  const normalizedTitle = normalizeWhitespace(title) || "Матеріал";
  const focusPhrase = extractFocusPhrase(normalizedTitle);

  const suffixByKind: Record<SeoContentKind, string> = {
    article: "стаття",
    consultation: "консультація",
    institution: "установа",
    dictionary: "пояснення",
    template: "шаблон",
    register: "реєстр",
    rate: "ставки",
    license: "ліцензія",
    law: "закон",
    grant: "грант",
    penalty: "штраф",
    kved: "КВЕД",
    course: "курс",
    businessForm: "форма бізнесу",
    accountant: "бухгалтер",
  };

  const candidates = [
    `${normalizedTitle} | ${BRAND_NAME}`,
    `${normalizedTitle} — ${suffixByKind[kind]}`,
    `${focusPhrase} | ${BRAND_NAME}`,
    normalizedTitle,
  ].map((candidate) => normalizeWhitespace(candidate));

  const fittingCandidate = candidates.find((candidate) => candidate.length <= MAX_TITLE_LENGTH);
  return fittingCandidate ?? smartTrim(candidates[0], MAX_TITLE_LENGTH);
}

function buildTemplateDescription(kind: SeoContentKind, focusPhrase: string, audienceSuffix: string): string {
  switch (kind) {
    case "consultation":
      return `Відповідь на запитання про ${focusPhrase}${audienceSuffix}: пояснення, кроки та практичні висновки.`;
    case "institution":
      return `${focusPhrase}: послуги, умови, тарифи та важливі деталі${audienceSuffix}.`;
    case "dictionary":
      return `Що означає ${focusPhrase}${audienceSuffix}: просте пояснення, приклади та контекст використання.`;
    case "template":
      return `Шаблон «${focusPhrase}»${audienceSuffix}: як заповнити, коли використовувати та що перевірити перед поданням.`;
    case "register":
      return `Реєстр «${focusPhrase}»${audienceSuffix}: що містить, як перевірити дані та коли він потрібен.`;
    case "rate":
      return `${focusPhrase}${audienceSuffix}: актуальні ставки, розміри платежів і правила застосування.`;
    case "license":
      return `Ліцензія «${focusPhrase}»${audienceSuffix}: вимоги, документи та порядок отримання.`;
    case "law":
      return `Закон «${focusPhrase}»${audienceSuffix}: ключові норми, зміни та практичне значення.`;
    case "grant":
      return `Грант «${focusPhrase}»${audienceSuffix}: умови участі, вимоги та як підготувати заявку.`;
    case "penalty":
      return `Штрафи щодо ${focusPhrase}${audienceSuffix}: суми, підстави та як уникнути порушень.`;
    case "kved":
      return `КВЕД «${focusPhrase}»${audienceSuffix}: опис діяльності, нюанси вибору та практичне застосування.`;
    case "course":
      return `Курс «${focusPhrase}»${audienceSuffix}: програма, формат навчання та для кого підійде.`;
    case "businessForm":
      return `${focusPhrase}${audienceSuffix}: особливості форми бізнесу, податки та організаційні нюанси.`;
    case "accountant":
      return `${focusPhrase}${audienceSuffix}: послуги бухгалтера, спеціалізація та як обрати фахівця.`;
    case "article":
    default:
      return `Практичний матеріал про ${focusPhrase}${audienceSuffix}: пояснення, приклади та важливі акценти.`;
  }
}

function composeDescription(base: string, snippet: string): string {
  if (!snippet) return limitSentence(base, MAX_DESCRIPTION_LENGTH);

  const normalizedBase = normalizeWhitespace(base);
  const normalizedSnippet = normalizeWhitespace(snippet);
  const sameStart = normalizedSnippet.toLowerCase().startsWith(normalizedBase.toLowerCase());
  const combined = sameStart ? normalizedSnippet : `${normalizedBase} ${normalizedSnippet}`;

  return limitSentence(combined, MAX_DESCRIPTION_LENGTH);
}

function generateLocalSeo(input: SeoInput): SeoResult {
  const fallbackTitle = normalizeWhitespace(input.title || "Матеріал");
  const kind = inferContentKind(input.type);
  const audienceSuffix = getAudienceSuffix(input.audience);
  const focusPhrase = extractFocusPhrase(fallbackTitle);
  const snippet = normalizeSnippet(input.tldr || input.content);

  return {
    seoTitle: buildSeoTitle(fallbackTitle, kind),
    seoDescription: composeDescription(buildTemplateDescription(kind, focusPhrase, audienceSuffix), snippet),
    slug: transliterate(fallbackTitle),
  };
}

/** Generate SEO fields locally without backend AI */
export async function generateSeoFields(input: SeoInput): Promise<SeoResult> {
  return generateLocalSeo(input);
}

/** Quick local-only slug generation */
export function generateSlug(title: string): string {
  return transliterate(title);
}
