/**
 * Спільна детермінована генерація демо-відгуків майстра.
 * Однаковий результат у публічному `MasterDetailSheet` і in-system `MasterProfilePage`.
 */

export interface DemoReview {
  name: string;
  text: string;
  daysAgo: number;
  stars: number;
}

const REVIEW_TEMPLATES = [
  { name: "Олена К.", text: "Дуже задоволена результатом! Уважно поставилися до моїх побажань, без поспіху." },
  { name: "Марія П.", text: "Найкращий салон, до якого ходила. Майстер — золоті руки. Рекомендую усім подругам." },
  { name: "Анна Л.", text: "Все ідеально: атмосфера, акуратність, результат. Уже втретє повертаюсь." },
  { name: "Юлія С.", text: "Професіонал своєї справи. Зробили саме так, як я хотіла, і ще запропонували догляд." },
  { name: "Катерина М.", text: "Записалась випадково через знайому — тепер тільки сюди. Найкраща ціна-якість." },
  { name: "Ірина В.", text: "Дуже комфортно. Майстер відчуває, коли клієнт хоче помовчати, а коли поспілкуватись." },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateDemoReviews(masterId: string, count = 3): DemoReview[] {
  const seed = hashStr(masterId);
  return Array.from({ length: count }).map((_, i) => {
    const tpl = REVIEW_TEMPLATES[(seed + i * 7) % REVIEW_TEMPLATES.length];
    const daysAgo = ((seed + i * 13) % 60) + 2;
    const stars = 4 + ((seed + i) % 2);
    return { ...tpl, daysAgo, stars };
  });
}
