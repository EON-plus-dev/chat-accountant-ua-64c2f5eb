/**
 * HTML-шаблони для реалістичного відображення документів
 * Кожна функція генерує повноцінний HTML документа у стилі справжніх українських документів
 */

import { type Document } from "./documentFlowConfig";
import { type Cabinet } from "@/types/cabinet";

// ============================================
// УТИЛІТИ ФОРМАТУВАННЯ
// ============================================

export const formatDateUkr = (dateStr?: string): string => {
  if (!dateStr) return "__.__.____";
  const date = new Date(dateStr);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatDateShort = (dateStr?: string): string => {
  if (!dateStr) return "__.__.____";
  const date = new Date(dateStr);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatAmount = (amount?: number): string => {
  if (!amount) return "—";
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const amountInWords = (amount?: number): string => {
  if (!amount) return "—";
  
  const units = ["", "одна", "дві", "три", "чотири", "п'ять", "шість", "сім", "вісім", "дев'ять"];
  const teens = ["десять", "одинадцять", "дванадцять", "тринадцять", "чотирнадцять", 
                 "п'ятнадцять", "шістнадцять", "сімнадцять", "вісімнадцять", "дев'ятнадцять"];
  const tens = ["", "", "двадцять", "тридцять", "сорок", "п'ятдесят", 
                "шістдесят", "сімдесят", "вісімдесят", "дев'яносто"];
  const hundreds = ["", "сто", "двісті", "триста", "чотириста", "п'ятсот", 
                    "шістсот", "сімсот", "вісімсот", "дев'ятсот"];
  
  const wholeAmount = Math.floor(amount);
  const kopecks = Math.round((amount - wholeAmount) * 100);
  
  const convertHundreds = (num: number): string => {
    if (num === 0) return "";
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      return tens[ten] + (unit ? " " + units[unit] : "");
    }
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return hundreds[hundred] + (rest ? " " + convertHundreds(rest) : "");
  };
  
  const thousands = Math.floor(wholeAmount / 1000);
  const rest = wholeAmount % 1000;
  
  let result = "";
  if (thousands > 0) {
    if (thousands === 1) result = "одна тисяча";
    else if (thousands < 5) result = convertHundreds(thousands) + " тисячі";
    else result = convertHundreds(thousands) + " тисяч";
  }
  
  if (rest > 0) {
    result += (result ? " " : "") + convertHundreds(rest);
  }
  
  if (wholeAmount === 0) result = "нуль";
  
  // Гривні
  const lastDigit = wholeAmount % 10;
  const lastTwoDigits = wholeAmount % 100;
  let hryvnia = "гривень";
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    hryvnia = "гривень";
  } else if (lastDigit === 1) {
    hryvnia = "гривня";
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    hryvnia = "гривні";
  }
  
  return `${result} ${hryvnia} ${kopecks.toString().padStart(2, "0")} коп.`;
};

// ============================================
// СПІЛЬНІ СТИЛІ
// ============================================

const documentStyles = `
  <style>
    .doc-container {
      font-family: 'Times New Roman', Times, serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .doc-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .doc-logo {
      font-size: 10px;
      color: #666;
      margin-bottom: 8px;
    }
    .doc-title {
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .doc-subtitle {
      font-size: 14px;
      margin-bottom: 8px;
    }
    .doc-number {
      font-size: 14px;
      margin-top: 8px;
    }
    .doc-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .doc-parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .doc-party {
      font-size: 13px;
    }
    .doc-party-title {
      font-weight: bold;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-size: 11px;
      color: #555;
    }
    .doc-party-name {
      font-weight: bold;
      margin-bottom: 4px;
    }
    .doc-section {
      margin: 16px 0;
    }
    .doc-section-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
    }
    .doc-table th {
      background: #f5f5f5;
      border: 1px solid #333;
      padding: 8px;
      text-align: left;
      font-weight: bold;
    }
    .doc-table td {
      border: 1px solid #333;
      padding: 8px;
      vertical-align: top;
    }
    .doc-table .text-right {
      text-align: right;
    }
    .doc-table .text-center {
      text-align: center;
    }
    .doc-table tfoot td {
      font-weight: bold;
      background: #fafafa;
    }
    .doc-total {
      margin: 16px 0;
      font-size: 14px;
    }
    .doc-total-amount {
      font-weight: bold;
      font-size: 16px;
    }
    .doc-signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 48px;
    }
    .doc-signature-block {
      text-align: center;
    }
    .doc-signature-title {
      font-weight: bold;
      font-size: 11px;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 8px;
    }
    .doc-signature-name {
      margin-bottom: 24px;
    }
    .doc-signature-line {
      border-bottom: 1px solid #333;
      height: 30px;
      margin-bottom: 4px;
    }
    .doc-signature-label {
      font-size: 10px;
      color: #666;
    }
    .doc-stamp {
      font-size: 10px;
      color: #666;
      margin-top: 8px;
    }
    .doc-intro {
      text-align: justify;
      margin-bottom: 24px;
      text-indent: 2em;
    }
    .doc-article {
      margin: 16px 0;
    }
    .doc-article-title {
      font-weight: bold;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .doc-article-content {
      text-align: justify;
    }
    .doc-article-content p {
      margin: 4px 0;
      text-indent: 2em;
    }
    .doc-note {
      font-size: 12px;
      color: #555;
      font-style: italic;
      margin-top: 16px;
    }
    .doc-footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #666;
      text-align: center;
    }
    .doc-highlight {
      background: #fffde7;
      padding: 2px 4px;
    }
    .doc-bold {
      font-weight: bold;
    }
    .doc-3col {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
    }
    .doc-route {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
    }
    .doc-route-arrow {
      font-size: 18px;
      color: #666;
    }
    .doc-qr {
      width: 80px;
      height: 80px;
      border: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #999;
    }
  </style>
`;

// ============================================
// РАХУНОК-ФАКТУРА (Invoice)
// ============================================

export const generateInvoiceHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-title">РАХУНОК-ФАКТУРА</div>
    <div class="doc-number">№ ${doc.number} від ${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-parties">
    <div class="doc-party">
      <div class="doc-party-title">Постачальник:</div>
      <div class="doc-party-name">${cabinetData.name}</div>
      <div>${cabinetData.taxLabel}: ${cabinetData.taxId}</div>
      <div>Адреса: ${cabinetData.address}</div>
      <div>Р/р: ${cabinetData.iban}</div>
      <div>Банк: ${cabinetData.bankName}</div>
      <div>МФО: ${cabinetData.mfo}</div>
    </div>
    <div class="doc-party">
      <div class="doc-party-title">Покупець:</div>
      <div class="doc-party-name">${doc.contractor?.name || "—"}</div>
      <div>ЄДРПОУ/ІПН: ${doc.contractor?.code || "—"}</div>
      ${doc.contractor?.iban ? `<div>IBAN: ${doc.contractor.iban}</div>` : ""}
    </div>
  </div>

  <div class="doc-section">
    <div class="doc-section-title">Призначення платежу:</div>
    <div>${doc.subject || doc.title}${doc.period ? ` за ${doc.period.label}` : ""}${doc.linkedDocuments?.length ? ` згідно Договору` : ""}</div>
  </div>

  <table class="doc-table">
    <thead>
      <tr>
        <th style="width: 40px;">№</th>
        <th>Найменування товарів (робіт, послуг)</th>
        <th style="width: 60px;">Од. вим.</th>
        <th style="width: 60px;">К-сть</th>
        <th style="width: 100px;">Ціна, грн</th>
        <th style="width: 100px;">Сума, грн</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td>${doc.subject || doc.title}</td>
        <td class="text-center">${doc.type === "invoice" ? "послуга" : "шт."}</td>
        <td class="text-center">1</td>
        <td class="text-right">${formatAmount(doc.amount)}</td>
        <td class="text-right">${formatAmount(doc.amount)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5" class="text-right">ВСЬОГО:</td>
        <td class="text-right">${formatAmount(doc.amount)} грн</td>
      </tr>
    </tfoot>
  </table>

  <div class="doc-total">
    <div class="doc-note">${cabinetData.taxNote}</div>
    <div style="margin-top: 8px;">
      <span class="doc-bold">Всього до сплати:</span> 
      <span class="doc-total-amount doc-highlight">${formatAmount(doc.amount)} грн</span>
    </div>
    <div style="font-style: italic; margin-top: 4px;">(${amountInWords(doc.amount)})</div>
    ${doc.dueDate ? `<div style="margin-top: 8px;"><span class="doc-bold">Термін оплати:</span> до ${formatDateUkr(doc.dueDate)}</div>` : ""}
  </div>

  <div class="doc-signatures" style="grid-template-columns: 1fr;">
    <div class="doc-signature-block" style="text-align: left;">
      <div class="doc-signature-title">Постачальник:</div>
      <div class="doc-signature-name">${cabinetData.ownerName || cabinetData.name}</div>
      <div style="display: flex; gap: 40px; align-items: flex-end;">
        <div style="flex: 1;">
          <div class="doc-signature-line"></div>
          <div class="doc-signature-label">підпис</div>
        </div>
        <div class="doc-stamp">М.П.</div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    Рахунок дійсний протягом 10 банківських днів з дати виставлення
  </div>
</div>
`;
};

// ============================================
// АКТ ВИКОНАНИХ РОБІТ (Act)
// ============================================

export const generateActHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-title">АКТ</div>
    <div class="doc-subtitle">приймання-передачі виконаних робіт (наданих послуг)</div>
    <div class="doc-number">№ ${doc.number} від ${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-meta">
    <div>м. Київ</div>
    <div>${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-intro">
    Ми, що нижче підписалися, <strong>Замовник</strong> — <strong>${doc.contractor?.name || "—"}</strong> 
    в особі _________________, що діє на підставі _____________, з однієї сторони,
    та <strong>Виконавець</strong> — <strong>${cabinetData.name}</strong>, з іншої сторони,
    склали цей Акт про наступне:
  </div>

  <div class="doc-section">
    <div class="doc-section-title">1. Виконавець виконав, а Замовник прийняв наступні роботи (послуги):</div>
  </div>

  <table class="doc-table">
    <thead>
      <tr>
        <th style="width: 40px;">№</th>
        <th>Найменування робіт (послуг)</th>
        <th style="width: 60px;">Од.</th>
        <th style="width: 60px;">К-сть</th>
        <th style="width: 120px;">Вартість, грн</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td>${doc.subject || doc.title}${doc.period ? ` за ${doc.period.label}` : ""}</td>
        <td class="text-center">послуга</td>
        <td class="text-center">1</td>
        <td class="text-right">${formatAmount(doc.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="doc-total">
    <div><span class="doc-bold">Всього надано послуг на суму:</span> ${formatAmount(doc.amount)} грн</div>
    <div style="font-style: italic;">(${amountInWords(doc.amount)})</div>
    <div class="doc-note" style="margin-top: 8px;">${cabinetData.taxNote}</div>
  </div>

  <div class="doc-section">
    <div style="margin-bottom: 8px;"><strong>2.</strong> Роботи (послуги) виконані своєчасно та в повному обсязі. Сторони претензій одна до одної не мають.</div>
    <div><strong>3.</strong> Цей Акт складено у двох примірниках, що мають однакову юридичну силу, по одному для кожної із Сторін.</div>
  </div>

  <div class="doc-signatures">
    <div class="doc-signature-block">
      <div class="doc-signature-title">Замовник:</div>
      <div class="doc-signature-name">${doc.contractor?.name || "—"}</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
      <div class="doc-stamp">М.П.</div>
    </div>
    <div class="doc-signature-block">
      <div class="doc-signature-title">Виконавець:</div>
      <div class="doc-signature-name">${cabinetData.ownerName || cabinetData.name}</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
      <div class="doc-stamp">М.П.</div>
    </div>
  </div>
</div>
`;
};

// ============================================
// ДОГОВІР (Contract)
// ============================================

export const generateContractHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  const contractType = doc.type === "rental-agreement" ? "оренди" : 
                      doc.type === "supply-contract" ? "поставки" : "про надання послуг";
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-title">ДОГОВІР</div>
    <div class="doc-subtitle">${contractType}</div>
    <div class="doc-number">№ ${doc.number}</div>
  </div>

  <div class="doc-meta">
    <div>м. Київ</div>
    <div>${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-intro">
    <strong>${doc.contractor?.name || "—"}</strong> (надалі — «Замовник»), в особі директора ______________, 
    що діє на підставі Статуту, з однієї сторони, та 
    <strong>${cabinetData.name}</strong> (надалі — «Виконавець»), з іншої сторони,
    разом іменовані «Сторони», а кожна окремо — «Сторона», уклали цей Договір про наступне:
  </div>

  <div class="doc-article">
    <div class="doc-article-title">1. Предмет договору</div>
    <div class="doc-article-content">
      <p>1.1. Виконавець зобов'язується надати Замовнику послуги: ${doc.subject || "згідно специфікації"}.</p>
      <p>1.2. Замовник зобов'язується прийняти та оплатити надані послуги в порядку та на умовах, визначених цим Договором.</p>
      <p>1.3. Обсяг, строки та інші умови надання послуг можуть бути деталізовані у Додатках до цього Договору.</p>
    </div>
  </div>

  <div class="doc-article">
    <div class="doc-article-title">2. Вартість послуг та порядок розрахунків</div>
    <div class="doc-article-content">
      <p>2.1. Вартість послуг за цим Договором становить <span class="doc-highlight doc-bold">${formatAmount(doc.amount)} грн</span>${doc.period ? ` за ${doc.period.label}` : ""}.</p>
      <p>2.2. ${cabinetData.taxNote}</p>
      <p>2.3. Оплата здійснюється протягом 10 (десяти) банківських днів з дати виставлення рахунку шляхом безготівкового перерахування коштів на розрахунковий рахунок Виконавця.</p>
      <p>2.4. Датою оплати вважається дата зарахування коштів на рахунок Виконавця.</p>
    </div>
  </div>

  <div class="doc-article">
    <div class="doc-article-title">3. Права та обов'язки сторін</div>
    <div class="doc-article-content">
      <p>3.1. Виконавець зобов'язується: надавати послуги якісно та у встановлені строки; інформувати Замовника про хід виконання робіт.</p>
      <p>3.2. Замовник зобов'язується: своєчасно надавати необхідну інформацію; здійснювати оплату у встановлені строки.</p>
    </div>
  </div>

  <div class="doc-article">
    <div class="doc-article-title">4. Строк дії договору</div>
    <div class="doc-article-content">
      <p>4.1. Договір набирає чинності з моменту підписання і діє до <span class="doc-highlight">${formatDateUkr(doc.dueDate)}</span>.</p>
      <p>4.2. Договір автоматично пролонгується на кожний наступний календарний рік за відсутності письмового повідомлення однієї із Сторін про припинення не пізніше ніж за 30 днів до закінчення строку дії.</p>
    </div>
  </div>

  <div class="doc-article">
    <div class="doc-article-title">5. Відповідальність сторін</div>
    <div class="doc-article-content">
      <p>5.1. За невиконання або неналежне виконання умов цього Договору Сторони несуть відповідальність згідно з чинним законодавством України.</p>
      <p>5.2. За прострочення оплати Замовник сплачує пеню у розмірі 0,1% від суми заборгованості за кожен день прострочення.</p>
    </div>
  </div>

  <div class="doc-article">
    <div class="doc-article-title">6. Реквізити та підписи сторін</div>
  </div>

  <div class="doc-signatures">
    <div class="doc-signature-block" style="text-align: left;">
      <div class="doc-signature-title">Замовник:</div>
      <div class="doc-party-name">${doc.contractor?.name || "—"}</div>
      <div style="font-size: 12px; margin-bottom: 8px;">
        <div>ЄДРПОУ: ${doc.contractor?.code || "—"}</div>
        <div>Адреса: м. Київ</div>
        ${doc.contractor?.iban ? `<div>IBAN: ${doc.contractor.iban}</div>` : ""}
      </div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
      <div class="doc-stamp">М.П.</div>
    </div>
    <div class="doc-signature-block" style="text-align: left;">
      <div class="doc-signature-title">Виконавець:</div>
      <div class="doc-party-name">${cabinetData.name}</div>
      <div style="font-size: 12px; margin-bottom: 8px;">
        <div>${cabinetData.taxLabel}: ${cabinetData.taxId}</div>
        <div>Адреса: ${cabinetData.address}</div>
        <div>IBAN: ${cabinetData.iban}</div>
        <div>Банк: ${cabinetData.bankName}</div>
      </div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">${cabinetData.ownerName || "підпис"}</div>
      <div class="doc-stamp">М.П.</div>
    </div>
  </div>
</div>
`;
};

// ============================================
// ТТН - ТОВАРНО-ТРАНСПОРТНА НАКЛАДНА
// ============================================

export const generateTTNHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-logo">Типова форма № 1-ТН</div>
    <div class="doc-title">ТОВАРНО-ТРАНСПОРТНА НАКЛАДНА</div>
    <div class="doc-number">№ ${doc.number} від ${formatDateUkr(doc.date)}</div>
  </div>

  <table class="doc-table" style="margin-bottom: 16px;">
    <tbody>
      <tr>
        <td style="width: 50%;">
          <div class="doc-party-title">Вантажовідправник:</div>
          <div class="doc-party-name">${doc.contractor?.name || "—"}</div>
          <div>ЄДРПОУ: ${doc.contractor?.code || "—"}</div>
          <div>Адреса: ${doc.route?.from || "м. Київ"}</div>
        </td>
        <td style="width: 50%;">
          <div class="doc-party-title">Вантажоодержувач:</div>
          <div class="doc-party-name">${cabinetData.name}</div>
          <div>${cabinetData.taxLabel}: ${cabinetData.taxId}</div>
          <div>Адреса: ${doc.route?.to || cabinetData.address}</div>
        </td>
      </tr>
    </tbody>
  </table>

  <table class="doc-table" style="margin-bottom: 16px;">
    <tbody>
      <tr>
        <td><strong>Автомобіль:</strong> AA 1234 BB</td>
        <td><strong>Водій:</strong> Петренко І.В., посв. серія ВНС № 123456</td>
      </tr>
      <tr>
        <td colspan="2">
          <strong>Маршрут:</strong>
          <div class="doc-route">
            <span>${doc.route?.from || "Київ"}</span>
            <span class="doc-route-arrow">→</span>
            <span>${doc.route?.to || "Одеса"}</span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="doc-section-title">Відомості про вантаж:</div>

  <table class="doc-table">
    <thead>
      <tr>
        <th style="width: 40px;">№</th>
        <th>Найменування вантажу</th>
        <th style="width: 60px;">Од. вим.</th>
        <th style="width: 60px;">К-сть</th>
        <th style="width: 80px;">Маса, кг</th>
        <th style="width: 100px;">Вартість, грн</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td>${doc.subject || "Товар згідно специфікації"}</td>
        <td class="text-center">шт.</td>
        <td class="text-center">1</td>
        <td class="text-right">—</td>
        <td class="text-right">${formatAmount(doc.amount)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5" class="text-right"><strong>ВСЬОГО:</strong></td>
        <td class="text-right"><strong>${formatAmount(doc.amount)} грн</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="doc-3col" style="margin-top: 32px;">
    <div class="doc-signature-block">
      <div class="doc-signature-title">Здав вантаж:</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
      <div class="doc-stamp">М.П.</div>
    </div>
    <div class="doc-signature-block">
      <div class="doc-signature-title">Прийняв вантаж:</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
      <div class="doc-stamp">М.П.</div>
    </div>
    <div class="doc-signature-block">
      <div class="doc-signature-title">Водій:</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис</div>
    </div>
  </div>

  <div class="doc-footer">
    Вантаж прийнято без зауважень
  </div>
</div>
`;
};

// ============================================
// НАКЛАДНА (Waybill)
// ============================================

export const generateWaybillHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-title">ВИДАТКОВА НАКЛАДНА</div>
    <div class="doc-number">№ ${doc.number} від ${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-parties">
    <div class="doc-party">
      <div class="doc-party-title">Постачальник:</div>
      <div class="doc-party-name">${doc.contractor?.name || "—"}</div>
      <div>ЄДРПОУ: ${doc.contractor?.code || "—"}</div>
    </div>
    <div class="doc-party">
      <div class="doc-party-title">Отримувач:</div>
      <div class="doc-party-name">${cabinetData.name}</div>
      <div>${cabinetData.taxLabel}: ${cabinetData.taxId}</div>
    </div>
  </div>

  <table class="doc-table">
    <thead>
      <tr>
        <th style="width: 40px;">№</th>
        <th>Найменування</th>
        <th style="width: 60px;">Од.</th>
        <th style="width: 60px;">К-сть</th>
        <th style="width: 100px;">Ціна, грн</th>
        <th style="width: 100px;">Сума, грн</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td>${doc.subject || doc.title}</td>
        <td class="text-center">шт.</td>
        <td class="text-center">1</td>
        <td class="text-right">${formatAmount(doc.amount)}</td>
        <td class="text-right">${formatAmount(doc.amount)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5" class="text-right">ВСЬОГО:</td>
        <td class="text-right">${formatAmount(doc.amount)} грн</td>
      </tr>
    </tfoot>
  </table>

  <div class="doc-total">
    <div>Всього найменувань: 1, на суму: ${formatAmount(doc.amount)} грн</div>
    <div style="font-style: italic;">(${amountInWords(doc.amount)})</div>
  </div>

  <div class="doc-signatures">
    <div class="doc-signature-block">
      <div class="doc-signature-title">Відпустив:</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
    </div>
    <div class="doc-signature-block">
      <div class="doc-signature-title">Отримав:</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
    </div>
  </div>
</div>
`;
};

// ============================================
// АКТ ЗВІРКИ (Reconciliation)
// ============================================

export const generateReconciliationHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  const balance = doc.reconciliationBalance;
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-title">АКТ ЗВІРКИ</div>
    <div class="doc-subtitle">взаємних розрахунків</div>
    <div class="doc-number">№ ${doc.number}</div>
  </div>

  <div class="doc-meta">
    <div>м. Київ</div>
    <div>${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-intro">
    Ми, що нижче підписалися, представники <strong>${cabinetData.name}</strong> 
    та <strong>${doc.contractor?.name || "—"}</strong>, 
    склали цей Акт про те, що провели звірку взаємних розрахунків 
    ${doc.period ? `за період: ${doc.period.label}` : "станом на " + formatDateUkr(doc.date)} 
    і встановили наступне:
  </div>

  <table class="doc-table">
    <thead>
      <tr>
        <th>Показник</th>
        <th style="width: 200px;">За даними ${cabinetData.name}</th>
        <th style="width: 200px;">За даними ${doc.contractor?.name || "контрагента"}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Сальдо на початок періоду</td>
        <td class="text-right">0,00 грн</td>
        <td class="text-right">0,00 грн</td>
      </tr>
      <tr>
        <td>Обороти (дебет)</td>
        <td class="text-right">${formatAmount(balance?.amount || 0)} грн</td>
        <td class="text-right">${formatAmount(balance?.amount || 0)} грн</td>
      </tr>
      <tr>
        <td>Обороти (кредит)</td>
        <td class="text-right">${formatAmount(balance?.amount || 0)} грн</td>
        <td class="text-right">${formatAmount(balance?.amount || 0)} грн</td>
      </tr>
      <tr style="font-weight: bold;">
        <td>Сальдо на кінець періоду</td>
        <td class="text-right ${balance?.amount && balance.amount > 0 ? "doc-highlight" : ""}">
          ${balance?.amount ? formatAmount(balance.amount) + " грн" : "0,00 грн"}
          ${balance?.inFavor === "us" ? "(на нашу користь)" : balance?.inFavor === "them" ? "(на користь контрагента)" : ""}
        </td>
        <td class="text-right">
          ${balance?.amount ? formatAmount(balance.amount) + " грн" : "0,00 грн"}
        </td>
      </tr>
    </tbody>
  </table>

  <div class="doc-section">
    <p>Розбіжностей за результатами звірки не виявлено.</p>
    <p>Цей Акт складено у двох примірниках, по одному для кожної зі Сторін.</p>
  </div>

  <div class="doc-signatures">
    <div class="doc-signature-block">
      <div class="doc-signature-title">${cabinetData.name}:</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
      <div class="doc-stamp">М.П.</div>
    </div>
    <div class="doc-signature-block">
      <div class="doc-signature-title">${doc.contractor?.name || "Контрагент"}:</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
      <div class="doc-stamp">М.П.</div>
    </div>
  </div>
</div>
`;
};

// ============================================
// НАКАЗ (Order - HR)
// ============================================

export const generateOrderHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  const orderType = doc.type === "employment-order" ? "про прийняття на роботу" :
                   doc.type === "dismissal-order" ? "про звільнення" :
                   doc.type === "vacation-order" ? "про надання відпустки" : "";
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-party-name" style="margin-bottom: 16px;">${cabinetData.name}</div>
    <div class="doc-title">НАКАЗ</div>
    <div class="doc-subtitle">${orderType}</div>
    <div class="doc-number">№ ${doc.number} від ${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-section" style="margin-top: 32px;">
    ${doc.type === "employment-order" ? `
      <p><strong>НАКАЗУЮ:</strong></p>
      <p>1. Прийняти на роботу <strong>${doc.employee?.name || "___________________"}</strong> на посаду <strong>${doc.employee?.position || "___________________"}</strong>${doc.employee?.department ? ` до ${doc.employee.department}` : ""} з ${formatDateUkr(doc.date)}.</p>
      <p>2. Встановити випробувальний термін — 3 (три) місяці.</p>
      <p>3. Бухгалтерії нараховувати заробітну плату згідно штатного розпису.</p>
    ` : doc.type === "vacation-order" ? `
      <p><strong>НАКАЗУЮ:</strong></p>
      <p>1. Надати <strong>${doc.employee?.name || "___________________"}</strong>, ${doc.employee?.position || "___________________"}, щорічну основну відпустку${doc.period ? ` з ${formatDateShort(doc.period.from)} по ${formatDateShort(doc.period.to)}` : ""} тривалістю ___ календарних днів.</p>
      <p>2. Бухгалтерії нарахувати та виплатити відпускні у встановлені строки.</p>
    ` : `
      <p><strong>НАКАЗУЮ:</strong></p>
      <p>${doc.subject || doc.title}</p>
    `}
  </div>

  <div class="doc-section" style="margin-top: 48px;">
    <div><strong>Підстава:</strong> ${doc.type === "employment-order" ? "заява працівника, трудовий договір" : 
                                     doc.type === "vacation-order" ? "заява працівника, графік відпусток" : 
                                     "—"}</div>
  </div>

  <div class="doc-signatures" style="grid-template-columns: 1fr; margin-top: 48px;">
    <div class="doc-signature-block" style="text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div class="doc-signature-title">Директор:</div>
          <div class="doc-signature-line" style="width: 200px;"></div>
          <div class="doc-signature-label">${cabinetData.ownerName || "підпис"}</div>
        </div>
        <div class="doc-stamp">М.П.</div>
      </div>
    </div>
  </div>

  <div class="doc-section" style="margin-top: 48px;">
    <div>З наказом ознайомлений(а):</div>
    <div style="margin-top: 16px;">
      <div class="doc-signature-line" style="width: 300px; display: inline-block;"></div>
      <span style="margin-left: 16px;">${doc.employee?.name || "___________________"}</span>
    </div>
    <div style="margin-top: 4px; font-size: 11px; color: #666;">
      <span style="margin-left: 100px;">підпис</span>
    </div>
  </div>
</div>
`;
};

// ============================================
// ДОВІРЕНІСТЬ (Power of Attorney)
// ============================================

export const generatePowerOfAttorneyHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-title">ДОВІРЕНІСТЬ</div>
    <div class="doc-number">№ ${doc.number}</div>
  </div>

  <div class="doc-meta">
    <div>м. Київ</div>
    <div>${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-intro">
    <strong>${cabinetData.name}</strong> (${cabinetData.taxLabel}: ${cabinetData.taxId}), 
    в особі ${cabinetData.ownerName || "___________________"}, 
    цією довіреністю уповноважує:
  </div>

  <div class="doc-section" style="background: #f9f9f9; padding: 16px; border: 1px solid #ddd; margin: 24px 0;">
    <div class="doc-party-name">${doc.employee?.name || "___________________"}</div>
    <div>Посада: ${doc.employee?.position || "___________________"}</div>
    <div>Паспорт: серія ___ № _____________, виданий ___________________</div>
  </div>

  <div class="doc-section">
    <p><strong>Представляти інтереси ${cabinetData.name} та здійснювати наступні дії:</strong></p>
    <div style="padding-left: 24px; margin-top: 8px;">
      <p>— ${doc.subject || "отримувати товарно-матеріальні цінності"};</p>
      <p>— підписувати накладні, акти та інші первинні документи;</p>
      <p>— виконувати інші дії, необхідні для виконання цієї довіреності.</p>
    </div>
  </div>

  <div class="doc-section">
    <p><strong>Довіреність дійсна до:</strong> <span class="doc-highlight">${formatDateUkr(doc.dueDate)}</span></p>
    <p>Підпис уповноваженої особи _______________ засвідчую.</p>
  </div>

  <div class="doc-signatures" style="grid-template-columns: 1fr; margin-top: 48px;">
    <div class="doc-signature-block" style="text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div class="doc-signature-title">${cabinetData.type === "fop" ? "ФОП" : "Директор"}:</div>
          <div class="doc-signature-line" style="width: 200px;"></div>
          <div class="doc-signature-label">${cabinetData.ownerName || "підпис"}</div>
        </div>
        <div class="doc-stamp">М.П.</div>
      </div>
    </div>
  </div>
</div>
`;
};

// ============================================
// ЧЕК ПРРО (Fiscal Receipt)
// ============================================

export const generateReceiptHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  
  return `
${documentStyles}
<div class="doc-container" style="max-width: 400px; font-family: 'Courier New', monospace; font-size: 12px;">
  <div style="text-align: center; border-bottom: 1px dashed #333; padding-bottom: 16px; margin-bottom: 16px;">
    <div style="font-weight: bold; font-size: 14px;">${cabinetData.name}</div>
    <div>${cabinetData.address}</div>
    <div>${cabinetData.taxLabel}: ${cabinetData.taxId}</div>
  </div>

  <div style="text-align: center; margin-bottom: 16px;">
    <div style="font-weight: bold; font-size: 16px;">ФІСКАЛЬНИЙ ЧЕК</div>
    <div>ПРРО</div>
  </div>

  <div style="border-bottom: 1px dashed #333; padding-bottom: 16px; margin-bottom: 16px;">
    <div style="display: flex; justify-content: space-between;">
      <span>1. ${doc.subject || "Послуга"}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>   1 x ${formatAmount(doc.amount)}</span>
      <span>${formatAmount(doc.amount)}</span>
    </div>
  </div>

  <div style="font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; margin-bottom: 8px;">
    <span>СУМА:</span>
    <span>${formatAmount(doc.amount)} грн</span>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
    <span>Готівка:</span>
    <span>${formatAmount(doc.amount)} грн</span>
  </div>

  <div style="border-top: 1px dashed #333; padding-top: 16px; text-align: center; font-size: 11px;">
    <div>Фіскальний номер: ${doc.prroFiscalNumber || "—"}</div>
    <div>Дата: ${formatDateShort(doc.date)} ${new Date(doc.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}</div>
    <div style="margin-top: 8px;">
      <div class="doc-qr" style="margin: 8px auto;">QR</div>
    </div>
    <div style="margin-top: 8px;">ДЯКУЄМО ЗА ПОКУПКУ!</div>
  </div>
</div>
`;
};

// ============================================
// ВИПИСКА БАНКУ (Bank Statement)
// ============================================

export const generateBankStatementHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  const totals = doc.statementTotals || { income: 0, expense: 0, closingBalance: 0 };
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-logo">${cabinetData.bankName}</div>
    <div class="doc-title">ВИПИСКА ПО РАХУНКУ</div>
    <div class="doc-number">№ ${doc.number}</div>
  </div>

  <div class="doc-parties" style="grid-template-columns: 1fr;">
    <div class="doc-party">
      <div class="doc-party-title">Власник рахунку:</div>
      <div class="doc-party-name">${cabinetData.name}</div>
      <div>${cabinetData.taxLabel}: ${cabinetData.taxId}</div>
      <div>IBAN: ${cabinetData.iban}</div>
    </div>
  </div>

  <div class="doc-section">
    <div><strong>Період:</strong> ${doc.period ? `${formatDateShort(doc.period.from)} — ${formatDateShort(doc.period.to)}` : formatDateShort(doc.date)}</div>
  </div>

  <table class="doc-table">
    <thead>
      <tr>
        <th>Дата</th>
        <th>Призначення платежу</th>
        <th style="width: 120px;">Надходження</th>
        <th style="width: 120px;">Списання</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="4" style="background: #f5f5f5; font-weight: bold;">
          Сальдо на початок: ${formatAmount(totals.closingBalance - totals.income + totals.expense)} грн
        </td>
      </tr>
      <tr>
        <td>${formatDateShort(doc.date)}</td>
        <td>Оплата за послуги згідно рах. №РАХ-2024-042</td>
        <td class="text-right">${formatAmount(totals.income)}</td>
        <td class="text-right">—</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" class="text-right">Обороти за період:</td>
        <td class="text-right">${formatAmount(totals.income)}</td>
        <td class="text-right">${formatAmount(totals.expense)}</td>
      </tr>
      <tr>
        <td colspan="2" class="text-right"><strong>Сальдо на кінець:</strong></td>
        <td colspan="2" class="text-right"><strong>${formatAmount(totals.closingBalance)} грн</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="doc-footer">
    Виписка сформована автоматично та не потребує підпису
  </div>
</div>
`;
};

// ============================================
// УНІВЕРСАЛЬНИЙ ШАБЛОН (Fallback)
// ============================================

export const generateGenericHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-title">${doc.title}</div>
    <div class="doc-number">№ ${doc.number} від ${formatDateUkr(doc.date)}</div>
  </div>

  ${doc.contractor ? `
  <div class="doc-parties">
    <div class="doc-party">
      <div class="doc-party-title">Від:</div>
      <div class="doc-party-name">${cabinetData.name}</div>
    </div>
    <div class="doc-party">
      <div class="doc-party-title">Кому:</div>
      <div class="doc-party-name">${doc.contractor.name}</div>
    </div>
  </div>
  ` : ""}

  <div class="doc-section">
    ${doc.subject ? `<p><strong>Предмет:</strong> ${doc.subject}</p>` : ""}
    ${doc.amount ? `<p><strong>Сума:</strong> ${formatAmount(doc.amount)} грн</p>` : ""}
    ${doc.dueDate ? `<p><strong>Термін дії:</strong> до ${formatDateUkr(doc.dueDate)}</p>` : ""}
  </div>

  <div class="doc-signatures">
    <div class="doc-signature-block">
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис</div>
    </div>
  </div>
</div>
`;
};

// ============================================
// РЕКВІЗИТИ КАБІНЕТУ
// ============================================

interface CabinetRequisites {
  name: string;
  ownerName?: string;
  taxId: string;
  taxLabel: string;
  taxNote: string;
  iban: string;
  bankName: string;
  mfo: string;
  address: string;
  phone: string;
  email: string;
  type: string;
}

export const getCabinetRequisites = (cabinet: Cabinet): CabinetRequisites => {
  // Демо-реквізити для різних типів кабінетів
  const requisitesMap: Record<string, Partial<CabinetRequisites>> = {
    "2": { // ФОП Іваненко
      ownerName: "Іваненко Іван Іванович",
      iban: "UA213223130000026007233566001",
      bankName: "АТ «МОНОБАНК»",
      mfo: "322313",
      address: "м. Київ, вул. Хрещатик, 1, кв. 10",
      phone: "+380 (50) 123-45-67",
      email: "ivanenko@example.com",
    },
    "1": { // ТОВ Ромашка
      ownerName: "Директор Петренко О.В.",
      iban: "UA503052990000026004025643892",
      bankName: "АТ «ПРИВАТБАНК»",
      mfo: "305299",
      address: "м. Київ, вул. Шевченка, 25",
      phone: "+380 (44) 555-12-34",
      email: "office@romashka.ua",
    },
    "7": { // Фізособа Коваленко
      ownerName: "Коваленко Марія Олексіївна",
      iban: "UA913052990000026000000123456",
      bankName: "АТ «ПРИВАТБАНК»",
      mfo: "305299",
      address: "м. Київ, вул. Лесі Українки, 15, кв. 42",
      phone: "+380 (67) 987-65-43",
      email: "kovalenko@gmail.com",
    },
  };
  
  const customReqs = requisitesMap[cabinet.id] || {};
  
  const isFop = cabinet.type === "fop";
  const isTov = cabinet.type === "tov";
  
  return {
    name: cabinet.name,
    ownerName: customReqs.ownerName,
    taxId: cabinet.taxId,
    taxLabel: isFop ? "ІПН" : "ЄДРПОУ",
    taxNote: isFop 
      ? `Без ПДВ (платник єдиного податку ${cabinet.fopGroup || 3} групи)` 
      : isTov 
      ? "ПДВ 20% включено у вартість" 
      : "Без ПДВ",
    iban: customReqs.iban || "UA_______________________________",
    bankName: customReqs.bankName || "АТ «БАНК»",
    mfo: customReqs.mfo || "______",
    address: customReqs.address || "м. Київ",
    phone: customReqs.phone || "+380 (__) ___-__-__",
    email: customReqs.email || "email@example.com",
    type: cabinet.type,
  };
};

// ============================================
// ПОДАТКОВА НАКЛАДНА (Tax Invoice)
// ============================================

export const generateTaxInvoiceHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  const subtotal = doc.amount ? doc.amount / 1.2 : 0;
  const vatAmount = doc.amount ? doc.amount - subtotal : 0;
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-logo">ЗАТВЕРДЖЕНО<br>Наказ Мінфіну 31.12.2015 № 1307</div>
    <div class="doc-title">ПОДАТКОВА НАКЛАДНА</div>
    <div class="doc-number">№ ${doc.number} від ${formatDateUkr(doc.date)}</div>
    ${doc.taxInvoiceNumber ? `<div style="margin-top: 8px; font-size: 12px; color: #666;">Реєстраційний номер в ЄРПН: <strong>${doc.taxInvoiceNumber}</strong></div>` : '<div style="margin-top: 8px; font-size: 12px; color: #c00;">⚠ Не зареєстровано в ЄРПН</div>'}
  </div>

  <table class="doc-table" style="margin-bottom: 16px;">
    <tr>
      <td style="width: 50%; vertical-align: top;">
        <div class="doc-party-title">Постачальник (продавець):</div>
        <div class="doc-party-name">${cabinetData.name}</div>
        <div>ІПН: ${cabinetData.taxId}</div>
        <div>Адреса: ${cabinetData.address}</div>
        <div>Тел.: ${cabinetData.phone}</div>
      </td>
      <td style="width: 50%; vertical-align: top;">
        <div class="doc-party-title">Отримувач (покупець):</div>
        <div class="doc-party-name">${doc.contractor?.name || "—"}</div>
        <div>ІПН: ${doc.contractor?.code || "—"}</div>
      </td>
    </tr>
  </table>

  <table class="doc-table">
    <thead>
      <tr>
        <th style="width: 30px;">№</th>
        <th>Номенклатура постачання</th>
        <th style="width: 80px;">Код УКТ ЗЕД</th>
        <th style="width: 50px;">Од.</th>
        <th style="width: 50px;">К-ть</th>
        <th style="width: 80px;">Ціна без ПДВ</th>
        <th style="width: 80px;">Обсяг без ПДВ</th>
        <th style="width: 50px;">Ставка</th>
        <th style="width: 80px;">Сума ПДВ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center">1</td>
        <td>${doc.subject || doc.title}</td>
        <td class="text-center">—</td>
        <td class="text-center">послуга</td>
        <td class="text-center">1</td>
        <td class="text-right">${formatAmount(subtotal)}</td>
        <td class="text-right">${formatAmount(subtotal)}</td>
        <td class="text-center">20%</td>
        <td class="text-right">${formatAmount(vatAmount)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="6" class="text-right"><strong>Усього:</strong></td>
        <td class="text-right"><strong>${formatAmount(subtotal)}</strong></td>
        <td class="text-center">×</td>
        <td class="text-right"><strong>${formatAmount(vatAmount)}</strong></td>
      </tr>
      <tr>
        <td colspan="8" class="text-right"><strong>Загальна сума з ПДВ:</strong></td>
        <td class="text-right"><strong class="doc-highlight">${formatAmount(doc.amount)} грн</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="doc-total">
    <div style="font-style: italic;">(${amountInWords(doc.amount)})</div>
  </div>

  <div class="doc-signatures" style="grid-template-columns: 1fr;">
    <div class="doc-signature-block" style="text-align: left;">
      <div class="doc-signature-title">Особа, відповідальна за складання ПН:</div>
      <div style="display: flex; gap: 40px; align-items: flex-end; margin-top: 16px;">
        <div style="flex: 1;">
          <div class="doc-signature-line"></div>
          <div class="doc-signature-label">підпис / П.І.Б.</div>
        </div>
        <div class="doc-stamp">М.П.</div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    Дата та час складання: ${formatDateUkr(doc.date)} ${new Date(doc.date).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
  </div>
</div>
`;
};

// ============================================
// АКТ РОЗБІЖНОСТЕЙ (Discrepancy Act)
// ============================================

export const generateDiscrepancyActHTML = (doc: Document, cabinet: Cabinet): string => {
  const cabinetData = getCabinetRequisites(cabinet);
  
  return `
${documentStyles}
<div class="doc-container">
  <div class="doc-header">
    <div class="doc-title">АКТ РОЗБІЖНОСТЕЙ</div>
    <div class="doc-number">№ ${doc.number} від ${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-meta">
    <div>м. Київ</div>
    <div>${formatDateUkr(doc.date)}</div>
  </div>

  <div class="doc-intro">
    Цей Акт складено до документа: <strong>${doc.subject || "—"}</strong>
  </div>

  <div class="doc-parties">
    <div class="doc-party">
      <div class="doc-party-title">Сторона 1:</div>
      <div class="doc-party-name">${cabinetData.name}</div>
      <div>${cabinetData.taxLabel}: ${cabinetData.taxId}</div>
    </div>
    <div class="doc-party">
      <div class="doc-party-title">Сторона 2:</div>
      <div class="doc-party-name">${doc.contractor?.name || "—"}</div>
      <div>ЄДРПОУ/ІПН: ${doc.contractor?.code || "—"}</div>
    </div>
  </div>

  <div class="doc-section">
    <div class="doc-section-title">Виявлені розбіжності:</div>
    <div style="padding: 12px; background: #fff8e1; border-left: 4px solid #ffc107; margin: 8px 0;">
      ${doc.subject || "Опис розбіжностей"}
    </div>
  </div>

  ${doc.amount ? `
  <div class="doc-section">
    <div class="doc-section-title">Сума розбіжностей:</div>
    <div class="doc-total-amount doc-highlight" style="font-size: 18px;">
      ${formatAmount(doc.amount)} грн
    </div>
  </div>
  ` : ""}

  <div class="doc-section">
    <div class="doc-section-title">Пропоноване рішення:</div>
    <div style="padding: 8px 0;">
      Сторони домовились про врегулювання розбіжностей шляхом _______________________________.
    </div>
  </div>

  <div class="doc-signatures">
    <div class="doc-signature-block">
      <div class="doc-signature-title">Сторона 1:</div>
      <div class="doc-signature-name">${cabinetData.ownerName || cabinetData.name}</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
      <div class="doc-stamp">М.П.</div>
    </div>
    <div class="doc-signature-block">
      <div class="doc-signature-title">Сторона 2:</div>
      <div class="doc-signature-name">${doc.contractor?.name || "—"}</div>
      <div class="doc-signature-line"></div>
      <div class="doc-signature-label">підпис / П.І.Б.</div>
      <div class="doc-stamp">М.П.</div>
    </div>
  </div>
</div>
`;
};

// ============================================
// ГОЛОВНА ФУНКЦІЯ ВИБОРУ ШАБЛОНУ
// ============================================

export const generateDocumentHTML = (doc: Document, cabinet: Cabinet): string => {
  switch (doc.type) {
    case "invoice":
      return generateInvoiceHTML(doc, cabinet);
    case "act":
      return generateActHTML(doc, cabinet);
    case "contract":
    case "rental-agreement":
    case "sale-agreement":
    case "supply-contract":
    case "fop-service-contract":
      return generateContractHTML(doc, cabinet);
    case "ttn":
      return generateTTNHTML(doc, cabinet);
    case "waybill":
      return generateWaybillHTML(doc, cabinet);
    case "reconciliation":
      return generateReconciliationHTML(doc, cabinet);
    case "order":
    case "employment-order":
    case "dismissal-order":
    case "vacation-order":
      return generateOrderHTML(doc, cabinet);
    case "power-of-attorney":
      return generatePowerOfAttorneyHTML(doc, cabinet);
    case "prro-receipt":
    case "receipt":
      return generateReceiptHTML(doc, cabinet);
    case "bank-statement":
      return generateBankStatementHTML(doc, cabinet);
    case "tax-invoice":
      return generateTaxInvoiceHTML(doc, cabinet);
    case "discrepancy-act":
      return generateDiscrepancyActHTML(doc, cabinet);
    default:
      return generateGenericHTML(doc, cabinet);
  }
};
