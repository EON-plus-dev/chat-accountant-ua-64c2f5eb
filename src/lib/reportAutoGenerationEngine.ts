import { Report, ReportType, ReportPeriod, EPCalculation, ESVCalculation, VZCalculation, OnedfCalculation, ESV_MIN_2025, MIN_SALARY_2025, VZ_RATE_GROUP_3, VZ_FIXED_GROUP_1 } from "@/config/reportsConfig";
import { Cabinet } from "@/types/cabinet";
import { getEmployeesForCabinet, Employee } from "@/config/employeesConfig";
import { calculateMilitaryTax } from "@/lib/militaryTaxCalculator";
import { getMilitaryTaxRate } from "@/config/taxRatesByPeriod";

// ============================================================
// TYPES
// ============================================================

export interface ReportGenerationInput {
  cabinet: Cabinet;
  reportType: ReportType;
  period: ReportPeriod;
  year: number;
  quarter?: number; // 1-4 for Q1-Q4
  month?: number;   // 1-12 for month period
}

export interface GenerationWarning {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  affectedRecords?: string[];
}

export interface DataQualityScore {
  score: number;
  hasUnclarifiedRecords: boolean;
  missingDocumentsCount: number;
  incompleteEmployeeData: boolean;
}

export interface GeneratedReport {
  report: Report;
  warnings: GenerationWarning[];
  dataQuality: DataQualityScore;
}

// Demo income records for generation (simplified from incomeBookConfig)
interface IncomeRecord {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: "income" | "clarification" | "not-income";
  hasDocument: boolean;
}

// ============================================================
// DEMO DATA (simplified from incomeBookConfig)
// ============================================================

const demoIncomeRecords: IncomeRecord[] = [
  { id: "1", date: "2025-01-15", amount: 45000, description: "Консалтинг", status: "income", hasDocument: true },
  { id: "2", date: "2025-01-22", amount: 32000, description: "Розробка сайту", status: "income", hasDocument: true },
  { id: "3", date: "2025-02-10", amount: 55000, description: "IT послуги", status: "income", hasDocument: true },
  { id: "4", date: "2025-02-18", amount: 28000, description: "Підтримка", status: "income", hasDocument: false },
  { id: "5", date: "2025-03-05", amount: 67000, description: "Проект Alpha", status: "income", hasDocument: true },
  { id: "6", date: "2025-03-20", amount: 41000, description: "Консультації", status: "clarification", hasDocument: false },
  { id: "7", date: "2025-04-12", amount: 52000, description: "Розробка API", status: "income", hasDocument: true },
  { id: "8", date: "2025-04-25", amount: 38000, description: "Техпідтримка", status: "income", hasDocument: true },
  { id: "9", date: "2025-05-08", amount: 63000, description: "Проект Beta", status: "income", hasDocument: true },
  { id: "10", date: "2025-05-22", amount: 29000, description: "Навчання", status: "income", hasDocument: false },
  { id: "11", date: "2025-06-15", amount: 71000, description: "Інтеграція систем", status: "income", hasDocument: true },
  { id: "12", date: "2025-06-28", amount: 44000, description: "Консалтинг", status: "income", hasDocument: true },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateReportId(): string {
  return `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getQuarterFromPeriod(period: ReportPeriod): number | undefined {
  const quarterMap: Record<string, number> = {
    "Q1": 1, "Q2": 2, "Q3": 3, "Q4": 4
  };
  return quarterMap[period];
}

function getPeriodDates(
  period: ReportPeriod,
  year: number,
  quarter?: number,
  month?: number
): { start: Date; end: Date; label: string } {
  // Handle Q1-Q4 periods
  if (period === "Q1" || period === "Q2" || period === "Q3" || period === "Q4") {
    const q = getQuarterFromPeriod(period) || 1;
    const startMonth = (q - 1) * 3;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 3, 0);
    const romanQuarter = ["I", "II", "III", "IV"][q - 1];
    return { start, end, label: `${romanQuarter} квартал ${year}` };
  }
  
  // Handle month period
  if (period === "month" && month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const monthNames = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", 
                        "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
    return { start, end, label: `${monthNames[month - 1]} ${year}` };
  }
  
  // Handle year period
  return { 
    start: new Date(year, 0, 1), 
    end: new Date(year, 11, 31),
    label: `${year} рік`
  };
}

function getIncomeRecordsForCabinet(cabinetId: string): IncomeRecord[] {
  // Demo: records only for cabinet "2" (Ivanenko)
  if (cabinetId === "2") {
    return demoIncomeRecords;
  }
  // For other cabinets, generate some demo data
  return demoIncomeRecords.map(r => ({
    ...r,
    amount: Math.round(r.amount * (0.5 + Math.random()))
  }));
}

function filterRecordsByPeriod(
  records: IncomeRecord[],
  start: Date,
  end: Date
): IncomeRecord[] {
  return records.filter(r => {
    const date = new Date(r.date);
    return date >= start && date <= end;
  });
}

function calculateIncomeForPeriod(
  cabinetId: string,
  start: Date,
  end: Date
): { totalIncome: number; records: IncomeRecord[] } {
  const allRecords = getIncomeRecordsForCabinet(cabinetId);
  const periodRecords = filterRecordsByPeriod(allRecords, start, end);
  
  const incomeRecords = periodRecords.filter(r => r.status === "income");
  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  
  return { totalIncome, records: periodRecords };
}

function getActiveEmployeesForPeriod(
  cabinetId: string,
  _start: Date,
  _end: Date
): Employee[] {
  const employees = getEmployeesForCabinet(cabinetId);
  // Filter active employees (simplified - all active)
  return employees.filter(e => e.status === "active");
}

function calculateSalaryTaxesForPeriod(
  employees: Employee[],
  monthsCount: number,
  year: number,
  month: number
): { totalSalary: number; pdfo: number; vz: number; esv: number; vzRate: number } {
  // Calculate total salary based on employees
  const monthlyTotal = employees.reduce((sum, emp) => {
    // Use FTE to determine salary (demo logic)
    const baseSalary = MIN_SALARY_2025 * (emp.fte || 1) * 1.5; // 1.5x min salary
    return sum + baseSalary;
  }, 0);
  
  const totalSalary = monthlyTotal * monthsCount;
  const pdfo = Math.round(totalSalary * 0.18);
  // Динамічна ставка ВЗ із єдиного джерела правди (taxRatesByPeriod.ts)
  const vzRate = getMilitaryTaxRate(year, month, "employee");
  const vz = Math.round(totalSalary * vzRate);
  const esv = Math.round(totalSalary * 0.22);
  
  return { totalSalary, pdfo, vz, esv, vzRate };
}

function validateDataQuality(
  records: IncomeRecord[],
  employees: Employee[]
): DataQualityScore {
  const unclarifiedRecords = records.filter(r => r.status === "clarification");
  const missingDocs = records.filter(r => !r.hasDocument);
  const incompleteEmployees = employees.filter(e => !e.position);
  
  let score = 100;
  
  if (unclarifiedRecords.length > 0) {
    score -= unclarifiedRecords.length * 5;
  }
  if (missingDocs.length > 0) {
    score -= missingDocs.length * 3;
  }
  if (incompleteEmployees.length > 0) {
    score -= incompleteEmployees.length * 10;
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    hasUnclarifiedRecords: unclarifiedRecords.length > 0,
    missingDocumentsCount: missingDocs.length,
    incompleteEmployeeData: incompleteEmployees.length > 0,
  };
}

function generateWarnings(
  records: IncomeRecord[],
  employees: Employee[],
  reportType: ReportType
): GenerationWarning[] {
  const warnings: GenerationWarning[] = [];
  
  // Check for unclarified records
  const unclarified = records.filter(r => r.status === "clarification");
  if (unclarified.length > 0) {
    warnings.push({
      code: "UNCLARIFIED_RECORDS",
      severity: "warning",
      message: `${unclarified.length} запис(ів) потребують уточнення`,
      affectedRecords: unclarified.map(r => r.id),
    });
  }
  
  // Check for missing documents
  const missingDocs = records.filter(r => !r.hasDocument && r.status === "income");
  if (missingDocs.length > 0) {
    warnings.push({
      code: "MISSING_DOCUMENTS",
      severity: "info",
      message: `${missingDocs.length} запис(ів) без пов'язаних документів`,
      affectedRecords: missingDocs.map(r => r.id),
    });
  }
  
  // Check for no income data
  if (records.length === 0 && (reportType === "ep" || reportType === "vz")) {
    warnings.push({
      code: "NO_INCOME_DATA",
      severity: "error",
      message: "Немає записів в Книзі доходів за обраний період",
    });
  }
  
  // Check for incomplete employee data (for 1df)
  if (reportType === "1df") {
    const incomplete = employees.filter(e => !e.fullName);
    if (incomplete.length > 0) {
      warnings.push({
        code: "INCOMPLETE_EMPLOYEE",
        severity: "warning",
        message: `${incomplete.length} працівник(ів) з неповними даними`,
        affectedRecords: incomplete.map(e => e.id),
      });
    }
    
    if (employees.length === 0) {
      warnings.push({
        code: "NO_EMPLOYEES",
        severity: "error",
        message: "Немає працівників для формування звіту 4ДФ (Податковий розрахунок)",
      });
    }
  }
  
  return warnings;
}

// ============================================================
// REPORT GENERATORS
// ============================================================

function getReportPeriod(quarter?: number): ReportPeriod {
  if (quarter === 1) return "Q1";
  if (quarter === 2) return "Q2";
  if (quarter === 3) return "Q3";
  if (quarter === 4) return "Q4";
  return "year";
}

function generateEPReport(input: ReportGenerationInput): Report {
  const quarter = getQuarterFromPeriod(input.period) || input.quarter;
  const { start, end, label } = getPeriodDates(input.period, input.year, quarter, input.month);
  const { totalIncome } = calculateIncomeForPeriod(input.cabinet.id, start, end);
  
  // Tax rate based on FOP group
  const taxRate = input.cabinet.fopGroup === 3 ? 5 : 0;
  const calculatedTax = Math.round(totalIncome * taxRate / 100);
  
  // Demo: some advances already paid
  const paidAdvances = Math.round(calculatedTax * 0.3);
  
  const epCalculation: EPCalculation = {
    totalIncome,
    taxRate,
    calculatedTax,
    paidAdvances,
    toPay: calculatedTax - paidAdvances,
  };
  
  // Calculate deadline (40 days after period end for group 3)
  const deadline = new Date(end);
  deadline.setDate(deadline.getDate() + 40);
  
  const romanQuarter = quarter ? ["I", "II", "III", "IV"][quarter - 1] : "";
  
  return {
    id: generateReportId(),
    cabinetId: input.cabinet.id,
    type: "ep",
    typeLabel: "Єдиний податок",
    name: `Декларація ЄП за ${label}`,
    period: input.period,
    periodLabel: label,
    year: input.year,
    quarter,
    status: "review",
    statusLabel: "На перевірку",
    deadline: deadline.toISOString().split("T")[0],
    formCode: input.cabinet.fopGroup === 3 ? "F0103308" : "F0103406",
    calculation: { type: "ep", data: epCalculation },
    dataSources: ["income-book"],
    history: [
      {
        date: new Date().toISOString(),
        action: "Автоматична генерація чернетки",
        user: "Система",
      },
    ],
  };
}

function generateESVReport(input: ReportGenerationInput): Report {
  const quarter = getQuarterFromPeriod(input.period) || input.quarter;
  const { start, end, label } = getPeriodDates(input.period, input.year, quarter, input.month);
  
  // Calculate months count
  const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
  const monthsCount = Math.min(monthsDiff, 12);
  
  const totalESV = ESV_MIN_2025 * monthsCount;
  const paidAmount = Math.round(totalESV * 0.5); // Demo: 50% already paid
  
  const esvCalculation: ESVCalculation = {
    minContribution: ESV_MIN_2025,
    monthsCount,
    totalESV,
    paidAmount,
    toPay: totalESV - paidAmount,
  };
  
  // Deadline: 19th of next month after period
  const deadline = new Date(end);
  deadline.setMonth(deadline.getMonth() + 1);
  deadline.setDate(19);
  
  return {
    id: generateReportId(),
    cabinetId: input.cabinet.id,
    type: "esv",
    typeLabel: "ЄСВ",
    name: `Звіт ЄСВ за ${label}`,
    period: input.period,
    periodLabel: label,
    year: input.year,
    quarter,
    status: "review",
    statusLabel: "На перевірку",
    deadline: deadline.toISOString().split("T")[0],
    formCode: "F0133108",
    calculation: { type: "esv", data: esvCalculation },
    dataSources: ["manual"],
    history: [
      {
        date: new Date().toISOString(),
        action: "Автоматична генерація чернетки",
        user: "Система",
      },
    ],
  };
}

function generateVZReport(input: ReportGenerationInput): Report {
  const quarter = getQuarterFromPeriod(input.period) || input.quarter;
  const { start, end, label } = getPeriodDates(input.period, input.year, quarter, input.month);
  const { totalIncome } = calculateIncomeForPeriod(input.cabinet.id, start, end);
  
  // Use military tax calculator
  const vzResult = calculateMilitaryTax({
    fopGroup: input.cabinet.fopGroup || 3,
    income: totalIncome,
    periodStart: start,
    periodEnd: end,
  });
  
  const vzCalculation: VZCalculation = {
    baseAmount: vzResult.baseAmount,
    rate: vzResult.rate,
    calculatedVZ: vzResult.calculatedVZ,
    toPay: vzResult.toPay,
    isLinkedToEP: true,
  };
  
  // VZ deadline same as EP
  const deadline = new Date(end);
  deadline.setDate(deadline.getDate() + 40);
  
  return {
    id: generateReportId(),
    cabinetId: input.cabinet.id,
    type: "vz",
    typeLabel: "Військовий збір",
    name: `Військовий збір за ${label}`,
    period: input.period,
    periodLabel: label,
    year: input.year,
    quarter,
    status: "review",
    statusLabel: "На перевірку",
    deadline: deadline.toISOString().split("T")[0],
    formCode: "F0103308-VZ",
    calculation: { type: "vz", data: vzCalculation },
    militaryTax: vzCalculation,
    dataSources: ["income-book"],
    history: [
      {
        date: new Date().toISOString(),
        action: "Автоматична генерація чернетки",
        user: "Система",
      },
    ],
  };
}

function generate1dfReport(input: ReportGenerationInput): Report {
  const quarter = getQuarterFromPeriod(input.period) || input.quarter;
  const { start, end, label } = getPeriodDates(input.period, input.year, quarter, input.month);
  
  const employees = getActiveEmployeesForPeriod(input.cabinet.id, start, end);
  const monthsCount = input.period === "month" ? 1 : 
                       (input.period === "Q1" || input.period === "Q2" || input.period === "Q3" || input.period === "Q4") ? 3 : 12;
  
  // Беремо середній місяць періоду для коректної ставки ВЗ (якщо період охоплює зміну ставки — використовуємо актуальний)
  const periodMidMonth = start.getMonth() + Math.floor(monthsCount / 2) + 1;
  const { totalSalary, pdfo, vz, esv } = calculateSalaryTaxesForPeriod(employees, monthsCount, input.year, periodMidMonth);
  
  const onedfCalculation: OnedfCalculation = {
    employeesCount: employees.length,
    totalSalary,
    pdfo,
    vz,
    esv,
    totalTaxes: pdfo + vz + esv,
  };
  
  // 1DF deadline: 40 days after quarter
  const deadline = new Date(end);
  deadline.setDate(deadline.getDate() + 40);
  
  return {
    id: generateReportId(),
    cabinetId: input.cabinet.id,
    type: "1df",
    typeLabel: "Податковий розрахунок (4ДФ)",
    name: `Податковий розрахунок (4ДФ) за ${label}`,
    period: input.period,
    periodLabel: label,
    year: input.year,
    quarter,
    status: "review",
    statusLabel: "На перевірку",
    deadline: deadline.toISOString().split("T")[0],
    formCode: "F0500107",
    calculation: { type: "1df", data: onedfCalculation },
    dataSources: ["employees"],
    history: [
      {
        date: new Date().toISOString(),
        action: "Автоматична генерація чернетки",
        user: "Система",
      },
    ],
  };
}

// ============================================================
// MAIN ENGINE FUNCTION
// ============================================================

export async function autoGenerateReport(
  input: ReportGenerationInput
): Promise<GeneratedReport> {
  const quarter = getQuarterFromPeriod(input.period) || input.quarter;
  const { start, end } = getPeriodDates(input.period, input.year, quarter, input.month);
  
  // Get data for quality analysis
  const { records } = calculateIncomeForPeriod(input.cabinet.id, start, end);
  const employees = getActiveEmployeesForPeriod(input.cabinet.id, start, end);
  
  // Generate report based on type
  let report: Report;
  
  switch (input.reportType) {
    case "ep":
      report = generateEPReport(input);
      break;
    case "esv":
      report = generateESVReport(input);
      break;
    case "vz":
      report = generateVZReport(input);
      break;
    case "1df":
      report = generate1dfReport(input);
      break;
    default:
      throw new Error(`Unsupported report type: ${input.reportType}`);
  }
  
  // Generate warnings
  const warnings = generateWarnings(records, employees, input.reportType);
  
  // Calculate data quality score
  const dataQuality = validateDataQuality(records, employees);
  
  return {
    report,
    warnings,
    dataQuality,
  };
}

// ============================================================
// BATCH GENERATION
// ============================================================

export interface BatchGenerationResult {
  reports: GeneratedReport[];
  totalWarnings: number;
  averageQuality: number;
}

export async function autoGenerateAllReportsForPeriod(
  cabinet: Cabinet,
  period: ReportPeriod,
  year: number,
  quarter?: number
): Promise<BatchGenerationResult> {
  const hasEmployees = getEmployeesForCabinet(cabinet.id).length > 0;
  
  // Determine which reports to generate
  const reportTypes: ReportType[] = ["ep", "esv", "vz"];
  if (hasEmployees) {
    reportTypes.push("1df");
  }
  
  const results: GeneratedReport[] = [];
  
  for (const reportType of reportTypes) {
    try {
      const result = await autoGenerateReport({
        cabinet,
        reportType,
        period,
        year,
        quarter,
      });
      results.push(result);
    } catch (error) {
      console.error(`Failed to generate ${reportType}:`, error);
    }
  }
  
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const averageQuality = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.dataQuality.score, 0) / results.length)
    : 0;
  
  return {
    reports: results,
    totalWarnings,
    averageQuality,
  };
}

// ============================================================
// EXPORT HELPERS
// ============================================================

export function getReportTypeLabel(type: ReportType): string {
  const labels: Record<ReportType, string> = {
    ep: "Декларація ЄП",
    esv: "Звіт ЄСВ",
    "esv-emp": "ЄСВ (працівники)",
    vz: "Військовий збір",
    "vz-emp": "ВЗ (працівники)",
    "1df": "Податковий розрахунок (4ДФ)",
    mpz: "МПЗ",
    pdfo: "ПДФО",
    stat: "Статистичний",
    other: "Інший",
  };
  return labels[type] || type;
}

export function getPeriodLabel(period: ReportPeriod): string {
  const labels: Record<ReportPeriod, string> = {
    Q1: "I квартал",
    Q2: "II квартал",
    Q3: "III квартал",
    Q4: "IV квартал",
    year: "Рік",
    month: "Місяць",
  };
  return labels[period] || period;
}
