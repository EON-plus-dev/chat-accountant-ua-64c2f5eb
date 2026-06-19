import type { Report } from "@/config/reportsConfig";

export interface CorrectionInput {
  originalReport: Report;
  correctionReason?: string;
  updatedCalculation?: Report["calculation"];
}

/**
 * Створює коригуючий звіт на основі відхиленого оригіналу
 */
export function createCorrectionReport(input: CorrectionInput): Report {
  const { originalReport, correctionReason } = input;
  
  // Визначаємо номер корекції (перевіряємо наявні корекції)
  const correctionNumber = (originalReport.correctionNumber || 0) + 1;
  
  const correctionReport: Report = {
    ...originalReport,
    id: `${originalReport.id}-corr-${correctionNumber}`,
    
    // Метадані корекції
    isCorrection: true,
    correctionOf: originalReport.id,
    correctionNumber,
    correctionReason: correctionReason || originalReport.rejectionDetails?.reason,
    originalRejectionCode: originalReport.rejectionDetails?.code,
    
    // Скидаємо статус на "review"
    status: "review",
    statusLabel: "На перевірку",
    
    // Оновлюємо назву
    name: `${originalReport.name.replace(/ \(коригуючий №\d+\)$/, "")} (коригуючий №${correctionNumber})`,
    
    // Очищаємо дані відхилення та подання
    rejectionDetails: undefined,
    receipt1: undefined,
    receipt2: undefined,
    submittedDate: undefined,
    acceptedDate: undefined,
    
    // Оновлюємо історію
    history: [
      {
        date: new Date().toISOString(),
        action: `Створено коригуючий звіт на підставі відхилення (${originalReport.rejectionDetails?.code || "—"})`,
        user: "Система",
      },
      ...(originalReport.history || []),
    ],
  };
  
  return correctionReport;
}

/**
 * Отримує інформацію про термін виправлення
 */
export function getCorrectionDeadlineInfo(originalReport: Report): {
  deadline: string;
  daysRemaining: number;
  isUrgent: boolean;
} {
  const correctionDeadline = originalReport.rejectionDetails?.correctionDeadline;
  
  if (correctionDeadline) {
    const deadline = new Date(correctionDeadline);
    const now = new Date();
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      deadline: correctionDeadline,
      daysRemaining,
      isUrgent: daysRemaining <= 3,
    };
  }
  
  // За замовчуванням: 10 днів від відхилення
  const rejectionDate = new Date(originalReport.rejectionDetails?.date || new Date());
  rejectionDate.setDate(rejectionDate.getDate() + 10);
  
  return {
    deadline: rejectionDate.toISOString().split("T")[0],
    daysRemaining: 10,
    isUrgent: false,
  };
}

/**
 * Маппінг кодів помилок ДПС на рекомендації
 */
export const errorCodeRecommendations: Record<string, {
  title: string;
  checks: string[];
}> = {
  "E040": {
    title: "Помилка коду КАТОТТГ",
    checks: [
      "Перевірте код території за місцем реєстрації",
      "Звірте з даними з ДПС",
      "Оновіть адресу в налаштуваннях кабінету",
    ],
  },
  "E010": {
    title: "Помилка реквізитів платника",
    checks: [
      "Перевірте РНОКПП/ІПН",
      "Звірте ПІБ з документами",
      "Перевірте правильність групи ЄП",
    ],
  },
  "C001": {
    title: "Помилка розрахунку сум",
    checks: [
      "Звірте дохід з Книгою доходів",
      "Перевірте правильність ставки",
      "Звірте з банківськими виписками",
    ],
  },
  "C002": {
    title: "Невідповідність сум податку",
    checks: [
      "Перерахуйте суму ЄП",
      "Перевірте авансові платежі",
      "Звірте з попередніми звітами",
    ],
  },
  "DEFAULT": {
    title: "Загальна помилка",
    checks: [
      "Перевірте всі реквізити",
      "Звірте розрахунки",
      "Зверніться до підтримки ДПС за деталями",
    ],
  },
};

/**
 * Отримує рекомендації за кодом помилки
 */
export function getRecommendationsForError(errorCode?: string) {
  if (!errorCode) return errorCodeRecommendations["DEFAULT"];
  return errorCodeRecommendations[errorCode] || errorCodeRecommendations["DEFAULT"];
}
