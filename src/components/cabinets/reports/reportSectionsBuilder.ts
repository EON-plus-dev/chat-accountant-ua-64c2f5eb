import type { Report, ReportType } from "@/config/reportsConfig";

export type SectionStatus = "ready" | "empty" | "error";

export interface ReportSection {
  code: string;        // 1-літерний код для кружка ("Р", "I", "II", "П")
  name: string;        // повна назва для tooltip / списку
  hint?: string;       // коротка статистика або опис, що буде у розділі
  status: SectionStatus;
}

/**
 * Будує структуру розділів звіту за типом.
 * Розділи з нульовою релевантністю не включаються.
 * Для scheduled/processing звітів `hint` містить опис того, ЩО буде у розділі
 * (бо даних ще немає).
 */
export function buildReportSections(report: Report): ReportSection[] {
  const type: ReportType = report.type;
  const calc = report.calculation;
  const hasCalc = !!calc?.data;
  const isApprovedOrLater =
    report.status === "approved" || report.status === "submitted" || report.status === "accepted";
  const signStatus: SectionStatus = isApprovedOrLater ? "ready" : "empty";

  switch (type) {
    case "1df": {
      const onedf = calc?.type === "1df" ? calc.data : null;
      const sectionI: SectionStatus = onedf && onedf.totalSalary > 0 ? "ready" : "empty";
      const sectionII: SectionStatus = onedf && onedf.vz > 0 ? "ready" : "empty";
      return [
        {
          code: "Р",
          name: "Розрахунок",
          hint: onedf
            ? "Дані сформовано"
            : "Підсумкові показники за період",
          status: hasCalc ? "ready" : "empty",
        },
        {
          code: "I",
          name: "Розділ I — Нараховано доходу",
          hint: onedf
            ? `${onedf.employeesCount} прац., ПДФО ${onedf.pdfo.toLocaleString("uk-UA")} ₴`
            : "ПДФО з ЗП працівників (18%)",
          status: sectionI,
        },
        {
          code: "II",
          name: "Розділ II — Військовий збір",
          hint: onedf
            ? `ВЗ ${onedf.vz.toLocaleString("uk-UA")} ₴`
            : "ВЗ з нарахованої ЗП (5%)",
          status: sectionII,
        },
        // Розділ III типово порожній — не показуємо
        {
          code: "П",
          name: "Підпис відповідальної особи",
          hint: "Ваш ЕЦП після перевірки чернетки",
          status: signStatus,
        },
      ];
    }
    case "ep": {
      const ep = calc?.type === "ep" ? calc.data : null;
      return [
        {
          code: "Р",
          name: "Розрахунок ЄП",
          hint: hasCalc ? "Дані сформовано" : "Підсумкові показники за період",
          status: hasCalc ? "ready" : "empty",
        },
        {
          code: "Д",
          name: "Дохід",
          hint: ep
            ? `${ep.totalIncome.toLocaleString("uk-UA")} ₴`
            : "Сума доходу з банків та Книги доходів",
          status: ep && ep.totalIncome > 0 ? "ready" : "empty",
        },
        {
          code: "П",
          name: "Сума податку",
          hint: ep
            ? `${ep.toPay.toLocaleString("uk-UA")} ₴`
            : "Розрахунок єдиного податку до сплати",
          status: ep && ep.toPay >= 0 ? "ready" : "empty",
        },
        {
          code: "✓",
          name: "Підпис",
          hint: "Ваш ЕЦП після перевірки чернетки",
          status: signStatus,
        },
      ];
    }
    case "esv":
    case "esv-emp": {
      const esv = calc?.type === "esv" ? calc.data : null;
      return [
        {
          code: "Р",
          name: "Розрахунок ЄСВ",
          hint: hasCalc ? "Дані сформовано" : "Підсумкові показники за період",
          status: hasCalc ? "ready" : "empty",
        },
        {
          code: "М",
          name: "Місяці",
          hint: esv
            ? `${esv.monthsCount} міс.`
            : "Місяці нарахування ЄСВ у періоді",
          status: esv && esv.monthsCount > 0 ? "ready" : "empty",
        },
        {
          code: "С",
          name: "Сума ЄСВ",
          hint: esv
            ? `${esv.toPay.toLocaleString("uk-UA")} ₴`
            : "Сума ЄСВ до сплати (22% від бази)",
          status: esv && esv.toPay > 0 ? "ready" : "empty",
        },
        {
          code: "✓",
          name: "Підпис",
          hint: "Ваш ЕЦП після перевірки чернетки",
          status: signStatus,
        },
      ];
    }
    case "vz":
    case "vz-emp": {
      const vz = calc?.type === "vz" ? calc.data : null;
      return [
        {
          code: "Р",
          name: "Розрахунок ВЗ",
          hint: hasCalc ? "Дані сформовано" : "Підсумкові показники за період",
          status: hasCalc ? "ready" : "empty",
        },
        {
          code: "Б",
          name: "База",
          hint: vz
            ? `${vz.baseAmount.toLocaleString("uk-UA")} ₴`
            : "База оподаткування військовим збором",
          status: vz && vz.baseAmount > 0 ? "ready" : "empty",
        },
        {
          code: "С",
          name: "Сума ВЗ",
          hint: vz
            ? `${vz.toPay.toLocaleString("uk-UA")} ₴`
            : "Сума військового збору до сплати (5%)",
          status: vz && vz.toPay > 0 ? "ready" : "empty",
        },
        {
          code: "✓",
          name: "Підпис",
          hint: "Ваш ЕЦП після перевірки чернетки",
          status: signStatus,
        },
      ];
    }
    default:
      return [
        {
          code: "Р",
          name: "Розрахунок",
          hint: "Підсумкові показники за період",
          status: hasCalc ? "ready" : "empty",
        },
        {
          code: "✓",
          name: "Підпис",
          hint: "Ваш ЕЦП після перевірки чернетки",
          status: signStatus,
        },
      ];
  }
}
