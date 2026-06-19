import { SelectableDocument } from "@/components/cabinets/audits/AuditDocumentSelector";

export interface AiDocumentSuggestion {
  documentId: string;
  relevance: "high" | "medium" | "low";
  reason: string;
}

export interface AiSuggestionResult {
  suggestions: AiDocumentSuggestion[];
  explanation: string;
}

// Правила матчингу для імітації AI логіки
interface MatchingRule {
  keywords: string[];
  docTypes: string[];
  relevance: "high" | "medium" | "low";
  reasonTemplate: string;
}

const matchingRules: MatchingRule[] = [
  // High relevance - прямо запитані документи
  { 
    keywords: ["книг", "облік", "доход", "kudoir"], 
    docTypes: ["Книга доходів"], 
    relevance: "high",
    reasonTemplate: "Книга обліку доходів — прямо запитано в запиті"
  },
  { 
    keywords: ["виписк", "банк", "рахун", "операці"], 
    docTypes: ["Виписка"], 
    relevance: "high",
    reasonTemplate: "Банківська виписка — підтверджує надходження коштів"
  },
  { 
    keywords: ["акт", "виконан", "робот", "послуг", "реалізац"], 
    docTypes: ["Акт"], 
    relevance: "high",
    reasonTemplate: "Акт виконаних робіт — підтверджує реалізацію"
  },
  
  // Medium relevance - пов'язані документи
  { 
    keywords: ["договір", "контракт", "угод"], 
    docTypes: ["Договір"], 
    relevance: "medium",
    reasonTemplate: "Договір — базовий документ для господарських операцій"
  },
  { 
    keywords: ["рахун", "оплат", "платі"], 
    docTypes: ["Рахунок"], 
    relevance: "medium",
    reasonTemplate: "Рахунок — підтверджує розрахунки"
  },
  { 
    keywords: ["чек", "прро", "фіскал", "каса"], 
    docTypes: ["Чек ПРРО"], 
    relevance: "medium",
    reasonTemplate: "Фіскальний чек — додаткове підтвердження розрахунків"
  },
  
  // Low relevance - можуть бути корисні
  { 
    keywords: ["декларац", "звіт", "єп", "подат"], 
    docTypes: ["Звіт"], 
    relevance: "low",
    reasonTemplate: "Податкова звітність — довідкова інформація"
  },
  { 
    keywords: ["оренд", "офіс", "приміщен"], 
    docTypes: ["Договір"], 
    relevance: "low",
    reasonTemplate: "Договір оренди — може бути запитаний додатково"
  },
];

// Аналіз тексту запиту та підбір документів
function analyzeRequest(
  requestSubject: string,
  requestDescription: string,
  documentsRequested: string[]
): Set<string> {
  const allText = [
    requestSubject, 
    requestDescription, 
    ...documentsRequested
  ].join(" ").toLowerCase();
  
  const matchedTypes = new Set<string>();
  
  for (const rule of matchingRules) {
    const hasKeyword = rule.keywords.some(kw => allText.includes(kw.toLowerCase()));
    if (hasKeyword) {
      rule.docTypes.forEach(t => matchedTypes.add(t));
    }
  }
  
  return matchedTypes;
}

// Визначення relevance для документа
function getRelevanceForDocument(
  doc: SelectableDocument,
  requestText: string,
  directlyRequested: string[]
): { relevance: "high" | "medium" | "low"; reason: string } | null {
  const docTypeLower = doc.type.toLowerCase();
  const requestLower = requestText.toLowerCase();
  
  // Перевіряємо кожне правило
  for (const rule of matchingRules) {
    const typeMatches = rule.docTypes.some(t => 
      docTypeLower.includes(t.toLowerCase()) || t.toLowerCase().includes(docTypeLower)
    );
    
    if (!typeMatches) continue;
    
    const keywordMatches = rule.keywords.some(kw => requestLower.includes(kw));
    
    // Перевіряємо чи документ прямо запитаний
    const isDirectlyRequested = directlyRequested.some(req => 
      docTypeLower.includes(req.toLowerCase()) || 
      req.toLowerCase().includes(docTypeLower) ||
      doc.title.toLowerCase().includes(req.toLowerCase())
    );
    
    if (isDirectlyRequested) {
      return {
        relevance: "high",
        reason: rule.reasonTemplate || `${doc.type} — прямо запитано в запиті`
      };
    }
    
    if (keywordMatches) {
      return {
        relevance: rule.relevance,
        reason: rule.reasonTemplate
      };
    }
  }
  
  return null;
}

/**
 * Mock функція для імітації AI-підбору документів
 * Аналізує текст запиту ДПС та повертає рекомендовані документи з рівнем релевантності
 */
export function mockAiSuggestDocuments(
  requestSubject: string,
  requestDescription: string,
  documentsRequested: string[],
  availableDocuments: SelectableDocument[]
): Promise<AiSuggestionResult> {
  return new Promise((resolve) => {
    // Імітуємо затримку AI (1-1.5 секунди)
    const delay = 1000 + Math.random() * 500;
    
    setTimeout(() => {
      const requestText = `${requestSubject} ${requestDescription} ${documentsRequested.join(" ")}`;
      const suggestions: AiDocumentSuggestion[] = [];
      
      // Аналізуємо кожен доступний документ
      for (const doc of availableDocuments) {
        const result = getRelevanceForDocument(doc, requestText, documentsRequested);
        
        if (result) {
          suggestions.push({
            documentId: doc.id,
            relevance: result.relevance,
            reason: result.reason
          });
        }
      }
      
      // Сортуємо за релевантністю: high → medium → low
      const relevanceOrder = { high: 0, medium: 1, low: 2 };
      suggestions.sort((a, b) => relevanceOrder[a.relevance] - relevanceOrder[b.relevance]);
      
      // Генеруємо пояснення
      const highCount = suggestions.filter(s => s.relevance === "high").length;
      const mediumCount = suggestions.filter(s => s.relevance === "medium").length;
      const lowCount = suggestions.filter(s => s.relevance === "low").length;
      
      const parts: string[] = [];
      if (highCount > 0) parts.push(`${highCount} ключових`);
      if (mediumCount > 0) parts.push(`${mediumCount} пов'язаних`);
      if (lowCount > 0) parts.push(`${lowCount} додаткових`);
      
      const explanation = suggestions.length > 0
        ? `Знайдено ${suggestions.length} документів: ${parts.join(", ")}. Рекомендовано прикріпити ключові та пов'язані документи.`
        : "Не знайдено документів, що відповідають запиту. Спробуйте додати документи вручну.";
      
      resolve({
        suggestions,
        explanation
      });
    }, delay);
  });
}

/**
 * Експорт демо-документів для зовнішнього використання
 */
export const demoDocumentsForAi: SelectableDocument[] = [
  { id: "doc-001", number: "ДОГ-2024-015", title: "Договір з ТОВ «Діджитал Солюшнс»", type: "Договір", date: "2024-03-01", contractor: "ТОВ «Діджитал Солюшнс»" },
  { id: "doc-002", number: "АКТ-2024-012", title: "Акт виконаних робіт №12", type: "Акт", date: "2024-06-15", contractor: "ТОВ «Діджитал Солюшнс»", amount: 15000 },
  { id: "doc-003", number: "РАХ-2024-042", title: "Рахунок на оплату", type: "Рахунок", date: "2024-06-15", contractor: "ТОВ «Діджитал Солюшнс»", amount: 15000 },
  { id: "doc-004", number: "АКТ-2024-018", title: "Акт виконаних робіт №18", type: "Акт", date: "2024-09-30", contractor: "ФОП Петренко І.В.", amount: 8500 },
  { id: "doc-005", number: "ДОГ-2024-022", title: "Договір з ФОП Петренко І.В.", type: "Договір", date: "2024-08-01", contractor: "ФОП Петренко І.В." },
  { id: "doc-006", number: "РАХ-2024-043", title: "Рахунок на оплату", type: "Рахунок", date: "2024-08-15", contractor: "ФОП Петренко І.В.", amount: 8500 },
  { id: "doc-007", number: "ЧЕК-20241001", title: "Фіскальний чек ПРРО", type: "Чек ПРРО", date: "2024-10-01", amount: 2500 },
  { id: "doc-008", number: "ЧЕК-20241115", title: "Фіскальний чек ПРРО", type: "Чек ПРРО", date: "2024-11-15", amount: 3200 },
  { id: "doc-009", number: "ВИП-2024-Q3", title: "Банківська виписка за III кв.", type: "Виписка", date: "2024-10-05" },
  { id: "doc-010", number: "ДЕК-ЄП-Q3", title: "Декларація ЄП за III кв. 2024", type: "Звіт", date: "2024-10-15" },
  { id: "doc-011", number: "КД-2024", title: "Книга обліку доходів 2024", type: "Книга доходів", date: "2024-12-01" },
  { id: "doc-012", number: "ДОГ-2024-018", title: "Договір оренди офісу", type: "Договір", date: "2024-01-15", contractor: "ТОВ «Бізнес-Центр»" },
];
