import { AuditRequest } from "@/config/taxAuditsConfig";

export type AnalysisRiskLevel = "low" | "medium" | "high";

export interface AuditRequestAnalysis {
  /** 2–3 речення: чого реально хоче інспектор. */
  intent: string;
  /** Юридична підстава (стаття ПКУ). */
  legalBasis: string;
  /** Що саме треба надати у відповіді (буллети). */
  requiredItems: string[];
  /** Запропонований план відповіді (нумерований). */
  responseOutline: string[];
  /** Ризики, які бачить AI у цьому запиті. */
  risks: { level: AnalysisRiskLevel; text: string }[];
  /** Готовий чорновик короткої відповіді (для копіювання у форму). */
  draftResponse: string;
}

const containsAny = (text: string, kws: string[]) =>
  kws.some((k) => text.toLowerCase().includes(k.toLowerCase()));

export function analyzeAuditRequest(request: AuditRequest): AuditRequestAnalysis {
  const text = `${request.subject} ${request.description}`.toLowerCase();
  const docs = request.documentsRequested ?? [];
  const counterparty = request.relatedCounterparty?.name;
  const isRisky = !!request.relatedCounterparty?.isRisky;

  // Визначаємо «інтент» інспектора
  let intent = "Інспектор просить підтвердити реальність господарської операції первинними документами.";
  let legalBasis = "п. 73.3 ПКУ — письмовий запит контролюючого органу";

  if (containsAny(text, ["камерал"])) {
    intent = "Камеральна звірка показників декларації з первинними даними.";
    legalBasis = "ст. 76 ПКУ — камеральна перевірка";
  } else if (containsAny(text, ["розбіжн", "невідповід"])) {
    intent = "Інспектор виявив розбіжності і просить пояснення з документами.";
    legalBasis = "пп. 78.1.4 ПКУ — невідповідність у звітності";
  } else if (containsAny(text, ["контрагент", "ризик", "сумнівн"])) {
    intent = "Перевірка реальності операцій із вказаним контрагентом.";
    legalBasis = "пп. 78.1.1 ПКУ — інформація про можливі порушення";
  } else if (containsAny(text, ["прро", "розрахунк", "касов"])) {
    intent = "Перевірка дотримання порядку проведення розрахункових операцій.";
    legalBasis = "Закон про РРО + ст. 80 ПКУ";
  }

  // Що треба надати
  const requiredItems: string[] = [];
  if (docs.length > 0) {
    requiredItems.push(...docs.map((d) => `Копія: ${d}`));
  }
  requiredItems.push("Письмові пояснення (вільна форма) на бланку ФОП");
  if (counterparty) {
    requiredItems.push(`Підтвердження операцій з контрагентом: ${counterparty}`);
  }

  // План відповіді
  const responseOutline = [
    "Коротко зазначити, що відповідь надається у відповідь на запит № " +
      request.number +
      " від " +
      request.date +
      ".",
    "Послатися на " + legalBasis + ".",
    "Перелічити документи, що додаються (за списком вище).",
    "Стисло пояснити суть операції / ситуації по запиту.",
    "Підпис, дата, печатка (за наявності).",
  ];

  // Ризики
  const risks: { level: AnalysisRiskLevel; text: string }[] = [];
  if (isRisky) {
    risks.push({
      level: "high",
      text: "Контрагент у списку ризикових (KWoD). Ймовірні додаткові питання — підготуйте максимум доказів реальності операції (товаро-транспортні, листування, фото).",
    });
  }
  if (containsAny(text, ["прро", "касов"])) {
    risks.push({
      level: "medium",
      text: "Питання щодо РРО: перевірте наявність Z-звітів і відповідність сум денним надходженням.",
    });
  }
  if (containsAny(text, ["розбіжн", "невідповід"])) {
    risks.push({
      level: "medium",
      text: "Якщо розбіжність дійсна — варто подати уточнюючу декларацію ДО завершення перевірки (зменшення штрафу).",
    });
  }
  if (risks.length === 0) {
    risks.push({
      level: "low",
      text: "Стандартний інформаційний запит. За умови повного пакета документів ризик донарахувань мінімальний.",
    });
  }

  // Чернетка відповіді
  const draftResponse =
    `На виконання Вашого запиту № ${request.number} від ${request.date}, керуючись ${legalBasis}, ` +
    `ФОП повідомляє наступне.\n\n` +
    `На підтвердження ${
      counterparty ? `операцій з контрагентом «${counterparty}»` : "запитуваних обставин"
    } додаються такі документи:\n` +
    (docs.length > 0 ? docs.map((d, i) => `${i + 1}. ${d}`).join("\n") : "— перелік у додатку") +
    `\n\nВсі господарські операції є реальними, відображені в обліку та підтверджені первинними документами. ` +
    `У разі необхідності готові надати додаткові пояснення.`;

  return { intent, legalBasis, requiredItems, responseOutline, risks, draftResponse };
}
