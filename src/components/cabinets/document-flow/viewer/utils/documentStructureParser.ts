/**
 * Парсер структури документа з HTML
 * Витягує заголовки H1/H2/H3 для навігації по розділах
 */

export interface DocumentSection {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  fragmentRef: string;
  children: DocumentSection[];
}

/**
 * Парсить HTML і витягує структуру заголовків
 */
export function parseDocumentStructure(html: string): DocumentSection[] {
  if (!html || !html.trim()) return [];
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const sections: DocumentSection[] = [];
  
  headings.forEach((heading, index) => {
    const tagName = heading.tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1)) as 1 | 2 | 3;
    
    // Ліміт до 3 рівнів
    const normalizedLevel = Math.min(level, 3) as 1 | 2 | 3;
    
    const title = heading.textContent?.trim() || `Розділ ${index + 1}`;
    const id = `section-${index}`;
    
    sections.push({
      id,
      title,
      level: normalizedLevel,
      fragmentRef: id,
      children: [],
    });
  });
  
  // Якщо немає заголовків, спробуємо знайти нумеровані розділи (1., 2., тощо)
  if (sections.length === 0) {
    const numberedSections = extractNumberedSections(html);
    return numberedSections;
  }
  
  // Побудова ієрархії
  return buildSectionHierarchy(sections);
}

/**
 * Витягує нумеровані розділи з тексту (1. Загальні положення)
 */
function extractNumberedSections(html: string): DocumentSection[] {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  
  // Шукаємо патерни: "1.", "1.1.", "РОЗДІЛ 1", "Стаття 1"
  const patterns = [
    /(?:^|\n)\s*(\d+)\.\s+([А-ЯІЇЄҐA-Z][^.\n]{5,60})/gmi,  // "1. Загальні положення"
    /(?:^|\n)\s*(\d+)\.(\d+)\.\s+([А-ЯІЇЄҐA-Z][^.\n]{5,60})/gmi,  // "1.1. Підрозділ"
    /(?:^|\n)\s*(?:РОЗДІЛ|Розділ)\s+(\d+)[.:]\s*([^\n]{5,60})/gi,  // "РОЗДІЛ 1: Назва"
    /(?:^|\n)\s*(?:СТАТТЯ|Стаття)\s+(\d+)[.:]\s*([^\n]{5,60})/gi,  // "Стаття 1: Назва"
  ];
  
  const sections: DocumentSection[] = [];
  let sectionIndex = 0;
  
  // Спочатку шукаємо основні розділи
  const mainPattern = /(?:^|\n)\s*(\d+)\.\s+([А-ЯІЇЄҐA-Z][^.\n]{5,60})/gmi;
  let match;
  
  while ((match = mainPattern.exec(text)) !== null) {
    const number = match[1];
    const title = match[2].trim();
    
    // Пропускаємо якщо це схоже на суму чи дату
    if (/^\d+\s*(грн|UAH|днів|місяців|років)/i.test(title)) continue;
    
    sections.push({
      id: `section-${sectionIndex}`,
      title: `${number}. ${title}`,
      level: 1,
      fragmentRef: `section-${sectionIndex}`,
      children: [],
    });
    sectionIndex++;
  }
  
  return sections;
}

/**
 * Побудова ієрархії розділів з плоского списку
 */
function buildSectionHierarchy(flatSections: DocumentSection[]): DocumentSection[] {
  if (flatSections.length === 0) return [];
  
  const result: DocumentSection[] = [];
  const stack: DocumentSection[] = [];
  
  for (const section of flatSections) {
    const newSection: DocumentSection = { ...section, children: [] };
    
    // Знаходимо батьківський елемент
    while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      result.push(newSection);
    } else {
      stack[stack.length - 1].children.push(newSection);
    }
    
    stack.push(newSection);
  }
  
  return result;
}

/**
 * Генерує демо-структуру для документа
 */
export function generateDemoStructure(documentType: string): DocumentSection[] {
  const structures: Record<string, DocumentSection[]> = {
    contract: [
      { id: "s1", title: "1. Предмет Договору", level: 1, fragmentRef: "s1", children: [] },
      { id: "s2", title: "2. Ціна та порядок розрахунків", level: 1, fragmentRef: "s2", children: [
        { id: "s2-1", title: "2.1. Загальна вартість", level: 2, fragmentRef: "s2-1", children: [] },
        { id: "s2-2", title: "2.2. Умови оплати", level: 2, fragmentRef: "s2-2", children: [] },
      ]},
      { id: "s3", title: "3. Права та обов'язки Сторін", level: 1, fragmentRef: "s3", children: [
        { id: "s3-1", title: "3.1. Права Виконавця", level: 2, fragmentRef: "s3-1", children: [] },
        { id: "s3-2", title: "3.2. Обов'язки Виконавця", level: 2, fragmentRef: "s3-2", children: [] },
        { id: "s3-3", title: "3.3. Права Замовника", level: 2, fragmentRef: "s3-3", children: [] },
        { id: "s3-4", title: "3.4. Обов'язки Замовника", level: 2, fragmentRef: "s3-4", children: [] },
      ]},
      { id: "s4", title: "4. Строк дії Договору", level: 1, fragmentRef: "s4", children: [] },
      { id: "s5", title: "5. Відповідальність Сторін", level: 1, fragmentRef: "s5", children: [] },
      { id: "s6", title: "6. Форс-мажор", level: 1, fragmentRef: "s6", children: [] },
      { id: "s7", title: "7. Порядок вирішення спорів", level: 1, fragmentRef: "s7", children: [] },
      { id: "s8", title: "8. Заключні положення", level: 1, fragmentRef: "s8", children: [] },
      { id: "s9", title: "9. Реквізити Сторін", level: 1, fragmentRef: "s9", children: [] },
    ],
    invoice: [
      { id: "s1", title: "Реквізити постачальника", level: 1, fragmentRef: "s1", children: [] },
      { id: "s2", title: "Реквізити покупця", level: 1, fragmentRef: "s2", children: [] },
      { id: "s3", title: "Перелік товарів/послуг", level: 1, fragmentRef: "s3", children: [] },
      { id: "s4", title: "Умови оплати", level: 1, fragmentRef: "s4", children: [] },
    ],
    act: [
      { id: "s1", title: "Сторони", level: 1, fragmentRef: "s1", children: [] },
      { id: "s2", title: "Перелік виконаних робіт", level: 1, fragmentRef: "s2", children: [] },
      { id: "s3", title: "Загальна вартість", level: 1, fragmentRef: "s3", children: [] },
      { id: "s4", title: "Підписи сторін", level: 1, fragmentRef: "s4", children: [] },
    ],
  };
  
  return structures[documentType] || structures.contract;
}

/**
 * Плоский список всіх секцій (для пошуку)
 */
export function flattenSections(sections: DocumentSection[]): DocumentSection[] {
  const result: DocumentSection[] = [];
  
  function traverse(section: DocumentSection) {
    result.push(section);
    section.children.forEach(traverse);
  }
  
  sections.forEach(traverse);
  return result;
}
