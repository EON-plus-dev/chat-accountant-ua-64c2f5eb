/**
 * Серіалізує реєстр знань у компактний markdown (~3–6 KB), придатний для
 * вставки в system prompt AI-консультанта чи в cabinet-chat.
 *
 * Завдяки тому, що всі факти беруться з одного реєстру, AI цитує ті ж
 * самі цифри, що показує користувачу /analytics.
 */

import { KNOWLEDGE_FACTS, KNOWLEDGE_FORECASTS, getNextNbuMeeting } from "./registry";
import { formatAsOf } from "./resolvers";
import { getAllDirectoryEntries } from "./directoryAdapters";
import type { DirectoryEntry, DirectoryCategory } from "./directoryTypes";
import { DIRECTORY_CATEGORY_LABEL } from "./directoryTypes";
import { getSeeAlsoForAi } from "./entryGraph";



const DIRECTORY_URL_PREFIX: Record<DirectoryCategory, string> = {
  penalties: "/dovidnyky/penalties",
  laws: "/dovidnyky/zakony",
  kved: "/dovidnyky/kved",
  grants: "/dovidnyky/granty",
  licenses: "/dovidnyky/litsenziyi",
  registers: "/dovidnyky/reestry",
  templates: "/dovidnyky/templates",
  businessForms: "/dovidnyky/formy-biznesu",
  slovnyk: "/dovidnyky/slovnyk",
  stavky: "/dovidnyky/stavky",
  accountants: "/dovidnyky/accountants",
  calendar: "/dovidnyky/kalendar",
  sudy: "/dovidnyky/sudy",
  rozyasnennia: "/dovidnyky/roz-yasnennia",
  derzhorgany: "/dovidnyky/derzhorgany",
  "biudzhetni-rakhunky": "/dovidnyky/biudzhetni-rakhunky",
  "atsk-kep": "/dovidnyky/atsk-kep",
  katottg: "/dovidnyky/katottg",
  profesii: "/dovidnyky/profesii",
  "plan-rakhunkiv": "/dovidnyky/plan-rakhunkiv",
  "ukt-zed": "/dovidnyky/ukt-zed",
  "viyskovyy-oblik": "/dovidnyky/viyskovyy-oblik",
  "pdv-pilhy": "/dovidnyky/pdv-pilhy",
};

export function directoryEntryUrl(entry: Pick<DirectoryEntry, "category" | "slug">): string {
  return `${DIRECTORY_URL_PREFIX[entry.category]}/${entry.slug}`;
}

/**
 * Compact serialization of directory entries (penalties, laws, …) for AI context.
 * Limited to `limit` per category to stay within token budget.
 */
export function serializeDirectoriesForAi(limit = 6): string {


  const all = getAllDirectoryEntries();
  const byCat = new Map<DirectoryCategory, DirectoryEntry[]>();
  for (const e of all) {
    const arr = byCat.get(e.category) ?? [];
    arr.push(e);
    byCat.set(e.category, arr);
  }

  const lines: string[] = [];
  lines.push("## Довідники FINTODO — записи (для цитування з посиланнями)");
  const cats = Array.from(byCat.keys()).sort();
  for (const cat of cats) {
    const entries = byCat.get(cat)!;
    const label = DIRECTORY_CATEGORY_LABEL[cat];
    lines.push(`### ${label} (${entries.length})`);
    for (const e of entries.slice(0, limit)) {
      const summary = e.summary.slice(0, 120).replace(/\s+/g, " ");
      lines.push(`- [${e.title}](${directoryEntryUrl(e)}) — ${summary}`);
      const see = getSeeAlsoForAi({ category: e.category, slug: e.slug }, 3);
      if (see.length > 0) {
        const seeStr = see.map((s) => `[${s.title}](${s.url})`).join(", ");
        lines.push(`  - Див. також: ${seeStr}`);
      }
    }
    if (entries.length > limit) {
      lines.push(`- … ще ${entries.length - limit} записів у цій категорії`);
    }
  }
  return lines.join("\n");
}


function fmt(v: number, unit: string): string {
  if (unit.startsWith("₴") && v >= 1000) return `${v.toLocaleString("uk-UA")} ${unit}`;
  if (unit.startsWith("%")) return `${v}${unit.slice(1) ? " " + unit.slice(1).trim() : "%"}`;
  if (unit === "%") return `${v}%`;
  return `${v} ${unit}`;
}

export function serializeKnowledgeForAi(): string {
  const f = KNOWLEDGE_FACTS;
  const nextMeeting = getNextNbuMeeting();
  const inflationForecast = KNOWLEDGE_FORECASTS.find((x) => x.id === "inflation-forecast");

  const lines: string[] = [];
  lines.push(`## Україна — ключові макро-факти (snapshot ${formatAsOf(f["inflation-cpi-yoy"].asOf)})`);
  lines.push(`- Облікова ставка НБУ: ${f["nbu-key-rate"].display} (наступне засідання ${nextMeeting.label}, ${f["nbu-key-rate"].source})`);
  lines.push(`- Інфляція ІСЦ р/р: ${f["inflation-cpi-yoy"].display} (${f["inflation-cpi-yoy"].source}, ${formatAsOf(f["inflation-cpi-yoy"].asOf)})`);
  lines.push(`- Мінімальна зарплата: ${f["min-wage"].display} (з ${formatAsOf(f["min-wage"].asOf)})`);
  lines.push(`- Мін. ЄСВ ФОП: ${f["min-esv-monthly"].display}/міс`);
  lines.push(`- Прожитковий мінімум (працездатні): ${f["subsistence-min"].display}`);
  lines.push(`- ПДФО ${f["pdfo-rate"].display}, ВЗ ${f["military-tax-rate"].display}, ЄСВ ${f["esv-rate"].display}, ЄП 3-гр ${f["ep-group-3"].display}, ПДВ ${f["vat-standard"].display}`);
  lines.push(`- ОВДП 3 міс: ${f["ovdp-yield-3m"].display} gross, без ПДФО/ВЗ (${f["ovdp-yield-3m"].source}, ${formatAsOf(f["ovdp-yield-3m"].asOf)})`);
  lines.push(`- Курси НБУ: USD ${f["fx-usd-uah"].display}, EUR ${f["fx-eur-uah"].display}, PLN ${f["fx-pln-uah"].display}, GBP ${f["fx-gbp-uah"].display}`);
  lines.push(`- Бензин А-95: ${f["fuel-a95"].display} (${f["fuel-a95"].source})`);

  if (inflationForecast) {
    const fc = inflationForecast.forecast.map((p) => `${p.period}→${p.value}%`).join(", ");
    lines.push(`- Прогноз інфляції НБУ: ${fc} (${formatAsOf(inflationForecast.asOf)})`);
  }

  lines.push("");
  lines.push("## Довідники FINTODO (де брати посилання)");
  for (const [cat, prefix] of Object.entries(DIRECTORY_URL_PREFIX) as [DirectoryCategory, string][]) {
    lines.push(`- ${DIRECTORY_CATEGORY_LABEL[cat]}: ${prefix}/{slug}`);
  }
  lines.push("- Калькулятори: /tools/{slug}");
  lines.push("- Аналітика (макро/курси/ринок): /analytics, /analytics/currency, /analytics/indices, /analytics/labor, /analytics/mortgage");
  lines.push("");
  lines.push("Якщо користувач питає про свіжіші дані — нагадай, що це snapshot і дай посилання на джерело.");
  lines.push("Коли цитуєш норму/штраф/ставку — додай посилання на відповідну entry-сторінку довідника або офіційне джерело.");
  return lines.join("\n");
}
