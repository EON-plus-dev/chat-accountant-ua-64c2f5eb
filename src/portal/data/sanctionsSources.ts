/**
 * Метадані 4 санкційних джерел, які агрегує edge `sanctions-check`.
 * Snapshot: 2026-04
 */

export const SANCTIONS_AS_OF = "2026-04";

export type SanctionsSourceId = "rnbo" | "ofac" | "eu" | "uk";

export interface SanctionsSource {
  id: SanctionsSourceId;
  shortLabel: string;
  fullLabel: string;
  authority: string;
  jurisdiction: string;
  description: string;
  updateFrequency: string;
  officialUrl: string;
  searchUrl: string;
  legalBasis: string;
}

export const SANCTIONS_SOURCES: SanctionsSource[] = [
  {
    id: "rnbo",
    shortLabel: "РНБО",
    fullLabel: "Єдиний державний реєстр санкцій (НАЗК)",
    authority: "Національне агентство з питань запобігання корупції",
    jurisdiction: "Україна",
    description:
      "Об'єднаний реєстр санкцій РНБО, КМУ і ВРУ. Містить фізособи й юрособи з санкційного переліку України. Перевірка обов'язкова для всіх ділових відносин — порушення = ст. 209 КК (фінмоніторинг).",
    updateFrequency: "Щодоби",
    officialUrl: "https://sanctions.nazk.gov.ua/",
    searchUrl: "https://sanctions.nazk.gov.ua/sanctions/",
    legalBasis: "ЗУ № 1644-VII «Про санкції»; Укази Президента про введення санкцій",
  },
  {
    id: "ofac",
    shortLabel: "OFAC SDN",
    fullLabel: "Specially Designated Nationals (US Treasury)",
    authority: "Office of Foreign Assets Control",
    jurisdiction: "США",
    description:
      "Реєстр осіб, з якими резидентам США (і будь-кому, хто використовує USD) заборонено вести бізнес. Українським компаніям важливий, якщо вони працюють з USD-переказами, мають банки-кореспонденти в США або клієнтів з американською присутністю.",
    updateFrequency: "Щодоби",
    officialUrl: "https://ofac.treasury.gov/sanctions-list-service",
    searchUrl: "https://sanctionssearch.ofac.treas.gov/",
    legalBasis: "International Emergency Economic Powers Act (IEEPA), Executive Orders",
  },
  {
    id: "eu",
    shortLabel: "EU CFSP",
    fullLabel: "EU Consolidated Financial Sanctions List",
    authority: "European External Action Service (EEAS)",
    jurisdiction: "Європейський Союз",
    description:
      "Зведений реєстр осіб під санкціями ЄС (включно з 14+ пакетами проти РФ). Обов'язковий для перевірки контрагентів з ЄС, при роботі в EUR через банки ЄС, і для отримання експортних ліцензій.",
    updateFrequency: "Щотижня (або частіше при нових пакетах)",
    officialUrl:
      "https://www.sanctionsmap.eu/",
    searchUrl: "https://webgate.ec.europa.eu/fsd/fsf/public/files/searchPanel/content",
    legalBasis: "Common Foreign and Security Policy (CFSP), Council Regulation (EU) 269/2014 та інші",
  },
  {
    id: "uk",
    shortLabel: "UK OFSI",
    fullLabel: "UK Consolidated Sanctions List",
    authority: "Office of Financial Sanctions Implementation (HM Treasury)",
    jurisdiction: "Велика Британія",
    description:
      "Британський реєстр фінансових санкцій. Містить всіх осіб під санкціями UK (включно з пост-Brexit пакетами проти РФ). Перевірка потрібна для роботи з GBP, контрагентами UK і при наявності бенефіціарів-резидентів Сполученого Королівства.",
    updateFrequency: "Щодоби",
    officialUrl: "https://www.gov.uk/government/publications/the-uk-sanctions-list",
    searchUrl:
      "https://sanctionssearch.ofsi.hmtreasury.gov.uk/",
    legalBasis: "Sanctions and Anti-Money Laundering Act 2018",
  },
];
