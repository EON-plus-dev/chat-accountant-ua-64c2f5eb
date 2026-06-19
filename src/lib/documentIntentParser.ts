/**
 * Document Intent Parser
 * Parses user chat input to extract document creation intent
 */

import type { DocumentType } from "@/config/documentFlowConfig";

export interface DocumentIntent {
  type: DocumentType | null;
  suggestedTags: string[];
  contractorHint?: string;
  subjectHint?: string;
  confidence: number; // 0-1
}

// Keywords mapping to document types (expanded for better intent detection)
const typeKeywords: Partial<Record<DocumentType, string[]>> = {
  "invoice": ["рахунок", "рахунок-фактура", "інвойс", "виставити рахунок"],
  "act": ["акт", "акт виконаних робіт", "акт прийому", "підписати акт", "акт приймання"],
  "contract": ["договір", "контракт", "угода", "укласти договір", "nda", "конфіденційність"],
  "waybill": ["накладна", "видаткова накладна", "товарна накладна"],
  "tax-invoice": ["податкова накладна", "пн", "податкову"],
  "payment-order": ["платіжка", "платіжне доручення", "оплата"],
  "reconciliation": ["акт звірки", "звірка", "взаєморозрахунки"],
  "ttn": ["ттн", "товарно-транспортна", "транспортна накладна"],
  "rental-agreement": ["оренда", "орендувати", "договір оренди", "здати в оренду", "винайм"],
  "supply-contract": ["поставка", "договір поставки", "постачання"],
  "fop-service-contract": ["фоп", "договір з фоп", "підрядник фоп", "аутсорс", "outsource"],
  "employment-order": ["наказ про прийняття", "прийняти на роботу"],
  "dismissal-order": ["наказ про звільнення", "звільнити"],
  "vacation-order": ["наказ про відпустку", "відпустка"],
  "power-of-attorney": ["довіреність", "уповноважити"],
};

// Subject keywords to tags mapping (expanded for better AI matching)
const subjectKeywords: Record<string, string[]> = {
  "оренда": ["оренда", "орендувати", "здати", "винайм", "орендна плата"],
  "офіс": ["офіс", "офісне приміщення", "робоче місце"],
  "склад": ["склад", "складське приміщення", "зберігання"],
  "нерухомість": ["нерухомість", "приміщення", "будівля", "квартира"],
  "послуги": ["послуги", "надання послуг", "сервіс"],
  "it": ["it", "іт", "програмування", "розробка", "веб", "сайт", "додаток", "software"],
  "консалтинг": ["консалтинг", "консультація", "консультаційні"],
  "маркетинг": ["маркетинг", "реклама", "просування", "smm", "seo"],
  "поставка": ["поставка", "товар", "продаж", "купівля", "закупівля"],
  "транспорт": ["перевезення", "транспорт", "доставка", "вантаж"],
  "будівництво": ["будівництво", "ремонт", "будівельні роботи"],
  "дизайн": ["дизайн", "графіка", "оформлення", "брендинг"],
  // НОВІ категорії (Phase 3)
  "фінанси": ["кредит", "позика", "відсотки", "фінансування", "інвестиції"],
  "логістика": ["логістика", "склад", "перевезення", "доставка", "експедирування"],
  "ліцензування": ["ліцензія", "права", "інтелектуальна власність", "патент", "копірайт"],
  "франчайзинг": ["франшиза", "бренд", "франчайзинг", "ліцензування бренду"],
  "агент": ["агент", "агентський", "посередник", "представник", "брокер"],
  "аутсорс": ["аутсорс", "outsource", "підряд", "зовнішній підрядник"],
  "конфіденційність": ["nda", "конфіденційність", "нерозголошення", "таємниця", "секрет"],
};

// Pattern for contractor extraction: "з/для/від + Name" or "контрагент Name"
const contractorPatterns = [
  /(?:з|для|від|контрагент[ао]?м?)\s+([«"']?(?:тов|фоп|пп)?\s*[«"']?[\w\s'']+[»"']?)/gi,
  /(?:компані[яюєї]|фірм[аиою]|організаці[яюєї])\s+([«"']?[\w\s'']+[»"']?)/gi,
];

/**
 * Parse user input and extract document creation intent
 */
export function parseDocumentIntent(userInput: string): DocumentIntent {
  const lowerInput = userInput.toLowerCase();
  const result: DocumentIntent = {
    type: null,
    suggestedTags: [],
    confidence: 0,
  };

  // 1. Detect document type
  let maxTypeScore = 0;
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        const score = keyword.length / lowerInput.length + 0.3; // Longer keywords = higher confidence
        if (score > maxTypeScore) {
          maxTypeScore = score;
          result.type = type as DocumentType;
        }
      }
    }
  }

  // 2. Extract subject tags
  const detectedTags: string[] = [];
  for (const [tag, keywords] of Object.entries(subjectKeywords)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        if (!detectedTags.includes(tag)) {
          detectedTags.push(tag);
        }
        break;
      }
    }
  }
  result.suggestedTags = detectedTags;

  // 3. Extract contractor hint
  for (const pattern of contractorPatterns) {
    const match = pattern.exec(userInput);
    if (match && match[1]) {
      const contractorName = match[1].trim().replace(/[«»"']/g, "");
      // Filter out common words
      if (contractorName.length > 3 && !["для", "від", "що", "яка"].includes(contractorName.toLowerCase())) {
        result.contractorHint = contractorName;
        break;
      }
    }
  }

  // 4. Extract subject hint (text after "на" or "для")
  const subjectMatch = /(?:на|для|щодо)\s+(.+?)(?:\.|,|$)/i.exec(userInput);
  if (subjectMatch && subjectMatch[1]) {
    const subject = subjectMatch[1].trim();
    if (subject.length > 5 && subject.length < 100) {
      result.subjectHint = subject;
    }
  }

  // 5. Calculate confidence
  let confidence = 0;
  if (result.type) confidence += 0.4;
  if (result.suggestedTags.length > 0) confidence += 0.2 * Math.min(result.suggestedTags.length, 2);
  if (result.contractorHint) confidence += 0.15;
  if (result.subjectHint) confidence += 0.1;
  
  // Boost confidence for explicit creation intent
  const creationKeywords = ["створи", "зроби", "підготуй", "оформи", "виставити", "укласти"];
  if (creationKeywords.some(k => lowerInput.includes(k))) {
    confidence += 0.2;
  }

  result.confidence = Math.min(confidence, 1);

  return result;
}

/**
 * Check if user input indicates document creation intent
 */
export function hasDocumentCreationIntent(userInput: string): boolean {
  const lowerInput = userInput.toLowerCase();
  const creationKeywords = ["створи", "зроби", "підготуй", "оформи", "виставити", "укласти", "потрібен", "потрібна", "потрібно"];
  const documentKeywords = ["документ", "договір", "рахунок", "акт", "накладна", "контракт"];
  
  const hasCreationWord = creationKeywords.some(k => lowerInput.includes(k));
  const hasDocumentWord = documentKeywords.some(k => lowerInput.includes(k));
  
  return hasCreationWord && hasDocumentWord;
}
