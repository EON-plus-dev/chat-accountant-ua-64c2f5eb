import type { 
  DocumentSummary, 
  DocumentChecklist, 
  ChecklistItem,
  ChecklistItemType,
  ChecklistPriority,
  ContractSummary 
} from "@/types/documentSummary";
import { getDemoScenarioById } from "@/config/documentSummaryDemo";
import { 
  type Document, 
  detectDocumentIssues, 
  type DocumentIssueType 
} from "@/config/documentFlowConfig";

// Mapping from document issues to checklist items
const issueToChecklistConfig: Partial<Record<DocumentIssueType, {
  type: ChecklistItemType;
  priority: ChecklistPriority;
  title: string;
  description: string;
  actionLabel: string;
  actionType: "manual" | "auto" | "invite" | "validate" | "navigate" | "upload";
}>> = {
  "pending-signature": {
    type: "missing-signature",
    priority: "high",
    title: "Підписати документ",
    description: "Документ очікує на ваш підпис КЕП",
    actionLabel: "Підписати",
    actionType: "manual",
  },
  "expired": {
    type: "prolongation-check",
    priority: "critical",
    title: "Термін дії минув",
    description: "Документ прострочений, потрібна дія",
    actionLabel: "Переглянути",
    actionType: "manual",
  },
  "overdue-payment": {
    type: "payment-link",
    priority: "critical",
    title: "Прострочена оплата",
    description: "Термін оплати минув, потрібно вжити заходів",
    actionLabel: "Створити нагадування",
    actionType: "navigate",
  },
  "missing-payment": {
    type: "payment-link",
    priority: "high",
    title: "Очікується оплата",
    description: "Рахунок відправлено, оплата не надійшла",
    actionLabel: "Перевірити надходження",
    actionType: "navigate",
  },
  "partial-payment": {
    type: "payment-link",
    priority: "medium",
    title: "Часткова оплата",
    description: "Документ оплачено частково, залишок потребує контролю",
    actionLabel: "Переглянути платежі",
    actionType: "navigate",
  },
  "missing-contractor": {
    type: "unknown-contractor",
    priority: "high",
    title: "Додати контрагента",
    description: "Контрагент не вказаний або не знайдений в базі",
    actionLabel: "Запросити контрагента",
    actionType: "invite",
  },
  "missing-file": {
    type: "missing-annex",
    priority: "medium",
    title: "Завантажити файл",
    description: "Документ не має прикріпленого файлу", // Will be overridden dynamically
    actionLabel: "Завантажити",
    actionType: "upload",
  },
  "registration-pending": {
    type: "tax-invoice",
    priority: "critical",
    title: "Зареєструвати ПН",
    description: "Податкова накладна потребує реєстрації в ЄРПН",
    actionLabel: "Реєструвати",
    actionType: "manual",
  },
  "retention-expiring": {
    type: "prolongation-check",
    priority: "low",
    title: "Термін зберігання спливає",
    description: "Наближається термін архівування документа",
    actionLabel: "Переглянути",
    actionType: "manual",
  },
  // Mandatory field validation issues
  "missing-amount": {
    type: "missing-signature", // Using existing type for field missing
    priority: "high",
    title: "Вказати суму документа",
    description: "Сума є обов'язковим полем для реєстрації",
    actionLabel: "Редагувати",
    actionType: "manual",
  },
  "missing-date": {
    type: "missing-signature",
    priority: "critical",
    title: "Вказати дату документа",
    description: "Дата є обов'язковим полем для реєстрації",
    actionLabel: "Редагувати",
    actionType: "manual",
  },
  "missing-subject": {
    type: "missing-signature",
    priority: "high",
    title: "Вказати предмет договору",
    description: "Предмет договору необхідний для класифікації та обліку",
    actionLabel: "Редагувати",
    actionType: "manual",
  },
  "missing-contractor-code": {
    type: "contractor-validation",
    priority: "medium",
    title: "Вказати ЄДРПОУ/ІПН контрагента",
    description: "Код контрагента потрібен для перевірки в реєстрах",
    actionLabel: "Редагувати",
    actionType: "manual",
  },
};

/**
 * Get specific description for missing file based on document type
 */
const getMissingFileDescription = (doc: Document): string => {
  switch (doc.type) {
    case "contract":
    case "supply-contract":
    case "fop-service-contract":
    case "rental-agreement":
      return "Додаток до договору (специфікація, прейскурант або скан оригіналу)";
    case "invoice":
      return "Скан підписаного оригіналу рахунку-фактури";
    case "act":
      return "Акт виконаних робіт з підписами обох сторін";
    case "waybill":
    case "ttn":
      return "Скан товарно-транспортної накладної з відмітками про доставку";
    case "tax-invoice":
      return "Податкова накладна у форматі XML або PDF";
    case "power-of-attorney":
      return "Скан нотаріально завіреної довіреності";
    case "reconciliation":
      return "Акт звірки з підписами та печатками обох сторін";
    case "employment-order":
    case "vacation-order":
    case "dismissal-order":
      return "Скан підписаного наказу з відміткою про ознайомлення працівника";
    default:
      return "Скан або PDF оригіналу документа";
  }
};

/**
 * Generate dynamic checklist based on real document state
 */
export const generateDynamicChecklist = (doc: Document): DocumentChecklist => {
  const issues = detectDocumentIssues(doc);
  const items: ChecklistItem[] = [];
  let criticalCount = 0;

  // Generate items from detected issues
  issues.forEach((issue, index) => {
    const config = issueToChecklistConfig[issue];
    if (config) {
      if (config.priority === "critical") criticalCount++;
      
      // Dynamic description for missing-file issue
      let description = config.description;
      if (issue === "missing-file") {
        description = getMissingFileDescription(doc);
      }
      
      items.push({
        id: `dyn-${doc.id}-${issue}-${index}`,
        type: config.type,
        priority: config.priority,
        title: config.title,
        description,
        status: "pending",
        action: {
          type: config.actionType,
          label: config.actionLabel,
        },
      });
    }
  });

  // Add type-specific items
  const typeSpecificItems = getTypeSpecificChecklistItems(doc);
  items.push(...typeSpecificItems);
  typeSpecificItems.forEach(item => {
    if (item.priority === "critical") criticalCount++;
  });

  // Add contract-specific items
  if (["contract", "supply-contract", "fop-service-contract", "rental-agreement"].includes(doc.type)) {
    const contractItems = getContractChecklistItems(doc);
    items.push(...contractItems);
    contractItems.forEach(item => {
      if (item.priority === "critical") criticalCount++;
    });
  }

  // Calculate completion
  const completedItems = items.filter(i => i.status === "done").length;
  const completionPercent = items.length > 0 
    ? Math.round((completedItems / items.length) * 100) 
    : 100;

  return {
    documentId: doc.id,
    generatedAt: new Date().toISOString(),
    items,
    completionPercent,
    totalItems: items.length,
    completedItems,
    criticalItems: criticalCount,
  };
};

/**
 * Get type-specific checklist items
 */
const getTypeSpecificChecklistItems = (doc: Document): ChecklistItem[] => {
  const items: ChecklistItem[] = [];

  switch (doc.type) {
    case "invoice":
      // Check if linked to contract
      if (!doc.linkedDocuments?.length) {
        items.push({
          id: `type-${doc.id}-linked-contract`,
          type: "linked-contract",
          priority: "medium",
          title: "Прив'язати до договору",
          description: "Рекомендуємо зв'язати рахунок з договором для кращого обліку",
          status: "pending",
          action: {
            type: "navigate",
            label: "Зв'язати",
          },
        });
      }
      
      // Check if needs to be sent
      if (doc.status === "signed") {
        items.push({
          id: `type-${doc.id}-edo-send`,
          type: "edo-send",
          priority: "high",
          title: "Відправити через ЕДО",
          description: "Рахунок підписано, але не відправлено контрагенту",
          status: "pending",
          action: {
            type: "manual",
            label: "Відправити",
          },
        });
      }
      break;

    case "act":
      // Check if linked to invoice
      if (!doc.linkedDocuments?.length) {
        items.push({
          id: `type-${doc.id}-linked-invoice`,
          type: "linked-contract",
          priority: "medium",
          title: "Прив'язати до рахунку",
          description: "Акт не пов'язаний з рахунком-фактурою",
          status: "pending",
          action: {
            type: "navigate",
            label: "Зв'язати",
          },
        });
      }
      
      // Check kudir entry
      if (doc.status === "confirmed" && !doc.linkedPayments?.length) {
        items.push({
          id: `type-${doc.id}-kudir`,
          type: "kudir-entry",
          priority: "high",
          title: "Відобразити в Книзі доходів",
          description: "Акт підтверджено, але запис в КУДіР відсутній",
          status: "pending",
          action: {
            type: "navigate",
            label: "Додати запис",
          },
        });
      }
      break;

    case "tax-invoice":
      if (doc.status === "confirmed" && !doc.taxInvoiceNumber) {
        items.push({
          id: `type-${doc.id}-register`,
          type: "tax-invoice",
          priority: "critical",
          title: "Зареєструвати в ЄРПН",
          description: "Податкова накладна підтверджена, але не зареєстрована",
          status: "pending",
          action: {
            type: "manual",
            label: "Реєструвати",
          },
        });
      }
      break;

    case "waybill":
      // Перевірка зв'язку з актом прийому
      if (!doc.linkedDocuments?.length) {
        items.push({
          id: `type-${doc.id}-linked-act`,
          type: "linked-contract",
          priority: "medium",
          title: "Зв'язати з актом прийому",
          description: "Накладна не пов'язана з актом прийому товару",
          status: "pending",
          action: {
            type: "navigate",
            label: "Зв'язати",
          },
        });
      }
      // Підтвердження доставки
      if (doc.status === "sent") {
        items.push({
          id: `type-${doc.id}-delivery`,
          type: "delivery-confirm",
          priority: "high",
          title: "Підтвердити отримання",
          description: "Накладну відправлено, очікується підтвердження отримання",
          status: "pending",
          action: {
            type: "manual",
            label: "Підтвердити",
          },
        });
      }
      break;

    case "ttn":
      // Перевірка маршруту
      if (!doc.route) {
        items.push({
          id: `type-${doc.id}-route`,
          type: "route-missing",
          priority: "medium",
          title: "Вказати маршрут доставки",
          description: "ТТН не містить інформації про маршрут",
          status: "pending",
          action: {
            type: "manual",
            label: "Вказати",
          },
        });
      }
      // Підтвердження перевізником
      if (doc.status === "sent") {
        items.push({
          id: `type-${doc.id}-carrier`,
          type: "delivery-confirm",
          priority: "high",
          title: "Очікується підтвердження отримання",
          description: "ТТН відправлено, підтвердження від отримувача не надійшло",
          status: "pending",
          action: {
            type: "manual",
            label: "Перевірити",
          },
        });
      }
      break;

    case "reconciliation":
      // Перевірка підпису контрагента
      if (doc.status !== "confirmed") {
        items.push({
          id: `type-${doc.id}-sign`,
          type: "reconciliation-sign",
          priority: "high",
          title: "Отримати підпис контрагента",
          description: "Акт звірки потребує підтвердження контрагентом",
          status: "pending",
          action: {
            type: "manual",
            label: "Надіслати",
          },
        });
      }
      break;

    case "power-of-attorney":
      // Перевірка терміну дії
      if (doc.dueDate) {
        const now = new Date();
        const dueDate = new Date(doc.dueDate);
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 7 && daysUntil > 0) {
          items.push({
            id: `type-${doc.id}-expiring`,
            type: "attorney-expiring",
            priority: "high",
            title: "Термін довіреності спливає",
            description: `До закінчення терміну дії залишилось ${daysUntil} днів`,
            status: "pending",
            action: {
              type: "manual",
              label: "Продовжити",
            },
            dueDate: doc.dueDate,
          });
        }
      }
      break;

    case "prro-receipt":
      // Перевірка фіскального номера
      if (!doc.prroFiscalNumber) {
        items.push({
          id: `type-${doc.id}-fiscal`,
          type: "fiscal-number",
          priority: "critical",
          title: "Відсутній фіскальний номер",
          description: "Чек ПРРО не містить фіскального номера, можлива помилка реєстрації",
          status: "pending",
          action: {
            type: "manual",
            label: "Перевірити",
          },
        });
      }
      break;

    case "employment-order":
      // Внесення в кадровий облік
      items.push({
        id: `type-${doc.id}-hr`,
        type: "hr-register",
        priority: "high",
        title: "Внести в реєстр працівників",
        description: "Оформити працівника в кадровому обліку та повідомити ПФУ",
        status: "pending",
        action: {
          type: "navigate",
          label: "Перейти до працівників",
          targetRoute: "/cabinets/:cabinetId/employees",
        },
      });
      break;

    case "dismissal-order": {
      // Фінальний розрахунок
      items.push({
        id: `type-${doc.id}-final-calc`,
        type: "payment-link",
        priority: "critical",
        title: "Провести фінальний розрахунок",
        description: "Нарахувати компенсацію за невикористану відпустку та інші виплати",
        status: "pending",
        action: {
          type: "navigate",
          label: "Перейти до платежів",
          targetRoute: "/cabinets/:cabinetId/payments",
        },
      });
      
      // Видати документи працівнику
      items.push({
        id: `type-${doc.id}-work-book`,
        type: "hr-register",
        priority: "high",
        title: "Видати документи працівнику",
        description: "Трудова книжка, копія наказу, довідка про доходи",
        status: "pending",
        action: {
          type: "manual",
          label: "Позначити виконаним",
        },
      });
      
      // Повідомлення ПФУ
      items.push({
        id: `type-${doc.id}-pfu`,
        type: "hr-register",
        priority: "high",
        title: "Повідомити ПФУ",
        description: "Подати повідомлення про звільнення до Пенсійного фонду",
        status: "pending",
        action: {
          type: "manual",
          label: "Позначити виконаним",
        },
      });
      break;
    }

    case "vacation-order":
      // Розрахунок відпускних
      items.push({
        id: `type-${doc.id}-vacation`,
        type: "vacation-calculation",
        priority: "high",
        title: "Нарахувати відпускні",
        description: "Провести розрахунок та виплату відпускних до початку відпустки",
        status: "pending",
        action: {
          type: "navigate",
          label: "Перейти до платежів",
          targetRoute: "/cabinets/:cabinetId/payments",
        },
      });
      break;

    case "rental-agreement":
    case "sale-agreement": {
      // Пролонгація (якщо близько до закінчення)
      if (doc.dueDate) {
        const now = new Date();
        const dueDate = new Date(doc.dueDate);
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 60 && daysUntil > 0) {
          items.push({
            id: `type-${doc.id}-prolongation`,
            type: "prolongation-check",
            priority: daysUntil <= 14 ? "critical" : "high",
            title: "Перевірити умови пролонгації",
            description: `До закінчення договору ${daysUntil} днів. Уточніть наміри сторін щодо продовження.`,
            status: "pending",
            action: {
              type: "manual",
              label: "Ініціювати перегляд",
            },
            dueDate: doc.dueDate,
          });
        }
      }
      
      // Для оренди — перевірка актів здачі-приймання
      if (doc.type === "rental-agreement") {
        items.push({
          id: `type-${doc.id}-acceptance-act`,
          type: "linked-contract",
          priority: "medium",
          title: "Перевірити акт приймання-передачі",
          description: "Переконайтесь, що акт приймання майна підписано обома сторонами",
          status: "pending",
          action: {
            type: "navigate",
            label: "Пов'язані документи",
          },
        });
      }
      break;
    }

    case "discrepancy-act": {
      // Відстеження відповіді
      if (doc.status === "sent") {
        items.push({
          id: `type-${doc.id}-response`,
          type: "contractor-validation",
          priority: "high",
          title: "Очікується відповідь контрагента",
          description: "Акт розбіжностей надіслано, слідкуйте за відповіддю",
          status: "pending",
          action: {
            type: "manual",
            label: "Перевірити статус",
          },
        });
      }
      
      // Після підтвердження — узгодження нових умов
      if (doc.status === "confirmed") {
        items.push({
          id: `type-${doc.id}-negotiate`,
          type: "linked-contract",
          priority: "medium",
          title: "Узгодити нові умови",
          description: "Розбіжності підтверджено, підготуйте ДУ до основного договору",
          status: "pending",
          action: {
            type: "navigate",
            label: "Створити ДУ",
          },
        });
      }
      break;
    }

    case "bank-statement":
      // Звірка залишків
      if (doc.statementTotals) {
        items.push({
          id: `type-${doc.id}-reconcile`,
          type: "statement-reconcile",
          priority: "medium",
          title: "Звірити залишки з обліком",
          description: "Порівняти залишки виписки з даними бухгалтерського обліку",
          status: "pending",
          action: {
            type: "manual",
            label: "Звірити",
          },
        });
      }
      break;
  }

  return items;
};

/**
 * Get contract-specific checklist items
 */
const getContractChecklistItems = (doc: Document): ChecklistItem[] => {
  const items: ChecklistItem[] = [];
  const now = new Date();

  // Check contract expiration
  if (doc.dueDate) {
    const dueDate = new Date(doc.dueDate);
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 30 && daysUntil > 0) {
      items.push({
        id: `contract-${doc.id}-expiring`,
        type: "prolongation-check",
        priority: daysUntil <= 7 ? "critical" : "high",
        title: "Договір закінчується",
        description: `До закінчення залишилось ${daysUntil} днів. Перевірте умови пролонгації`,
        status: "pending",
        action: {
          type: "manual",
          label: "Перевірити пролонгацію",
        },
        dueDate: doc.dueDate,
      });
    }
  }

  // Check contractor validation
  if (doc.contractor && doc.contractor.validationStatus !== "valid") {
    items.push({
      id: `contract-${doc.id}-validate`,
      type: "contractor-validation",
      priority: "medium",
      title: "Перевірити контрагента",
      description: "Рекомендуємо перевірити статус контрагента в реєстрах",
      status: "pending",
      action: {
        type: "validate",
        label: "Перевірити",
      },
    });
  }

  return items;
};

/**
 * Generate document checklist from demo scenario or dynamic analysis
 */
export const generateDocumentChecklist = (
  scenarioId?: string,
  _summary?: DocumentSummary,
  doc?: Document
): DocumentChecklist | null => {
  // If demo scenario provided, use it
  if (scenarioId) {
    const scenario = getDemoScenarioById(scenarioId);
    if (scenario) {
      return scenario.checklist;
    }
  }
  
  // If document provided, generate dynamic checklist
  if (doc) {
    return generateDynamicChecklist(doc);
  }
  
  // No data available
  return null;
};

/**
 * Update checklist item status
 */
export const updateChecklistItemStatus = (
  checklist: DocumentChecklist,
  itemId: string,
  status: ChecklistItem["status"]
): DocumentChecklist => {
  const updatedItems = checklist.items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        status,
        completedAt: status === "done" ? new Date().toISOString() : undefined,
      };
    }
    return item;
  });
  
  const completedItems = updatedItems.filter(i => i.status === "done").length;
  
  return {
    ...checklist,
    items: updatedItems,
    completedItems,
    completionPercent: Math.round((completedItems / checklist.totalItems) * 100),
  };
};

/**
 * Get checklist items grouped by priority
 */
export const getChecklistItemsByPriority = (checklist: DocumentChecklist) => {
  const critical = checklist.items.filter(i => i.priority === "critical" && i.status !== "done");
  const high = checklist.items.filter(i => i.priority === "high" && i.status !== "done");
  const medium = checklist.items.filter(i => i.priority === "medium" && i.status !== "done");
  const low = checklist.items.filter(i => i.priority === "low" && i.status !== "done");
  const completed = checklist.items.filter(i => i.status === "done");
  
  return { critical, high, medium, low, completed };
};

/**
 * Check if summary is a contract summary
 */
export const isContractSummary = (summary: DocumentSummary): summary is ContractSummary => {
  return "contract" in summary;
};
