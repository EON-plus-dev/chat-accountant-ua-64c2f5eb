import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Report, ESVCalculation, ReportCalculation } from "@/config/reportsConfig";
import type { Cabinet } from "@/types/cabinet";
import { 
  MINIMUM_WAGE, 
  TAX_RATES, 
  getMinimumWageForDate 
} from "@/config/taxConstantsConfig";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 8,
    color: "#666",
    marginBottom: 2,
  },
  formCode: {
    fontSize: 8,
    textAlign: "right",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 4,
    marginTop: 10,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #ccc",
    paddingVertical: 4,
    alignItems: "center",
  },
  rowNumber: {
    width: 30,
    fontSize: 8,
    color: "#666",
  },
  rowLabel: {
    flex: 1,
    paddingRight: 8,
  },
  rowValue: {
    width: 100,
    textAlign: "right",
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
    border: "1 solid #ccc",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "1 solid #ccc",
    paddingVertical: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    paddingVertical: 3,
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  totalRow: {
    flexDirection: "row",
    borderTop: "2 solid #000",
    borderBottom: "2 solid #000",
    paddingVertical: 6,
    marginTop: 10,
    backgroundColor: "#f9f9f9",
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
  },
  signatureLine: {
    borderBottom: "1 solid #000",
    marginTop: 20,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 7,
    color: "#999",
    textAlign: "center",
  },
  infoBlock: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f9f9f9",
    border: "1 solid #ddd",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 150,
    fontSize: 8,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 8,
    fontWeight: "bold",
  },
});

interface ESVReportPDFProps {
  report: Report;
  cabinet: Cabinet;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getPeriodLabel(period: string): string {
  const [type, year] = period.split("-");
  const quarterNames: Record<string, string> = {
    Q1: "I квартал",
    Q2: "II квартал",
    Q3: "III квартал",
    Q4: "IV квартал",
  };
  const monthNames: Record<string, string> = {
    M01: "Січень",
    M02: "Лютий",
    M03: "Березень",
    M04: "Квітень",
    M05: "Травень",
    M06: "Червень",
    M07: "Липень",
    M08: "Серпень",
    M09: "Вересень",
    M10: "Жовтень",
    M11: "Листопад",
    M12: "Грудень",
  };
  return `${quarterNames[type] || monthNames[type] || type} ${year}`;
}

function getESVCalculation(calc: ReportCalculation | undefined): ESVCalculation | null {
  if (calc && calc.type === "esv") {
    return calc.data;
  }
  return null;
}

// ESV constants from centralized config
const ESV_RATE_PERCENT = TAX_RATES.esv * 100; // 22%

export function ESVReportPDF({ report, cabinet }: ESVReportPDFProps) {
  const esvCalc = getESVCalculation(report.calculation);
  const months = esvCalc?.monthsCount ?? 3;
  
  // Get minimum wage for the report period
  const [reportPeriodType, reportYear] = report.period.split("-");
  const periodYear = parseInt(reportYear, 10);
  const periodDate = new Date(periodYear, 0, 1);
  const minSalary = getMinimumWageForDate(periodDate);
  
  const esvRate = ESV_RATE_PERCENT;
  const esvAmount = esvCalc?.totalESV ?? (minSalary * (esvRate / 100) * months);
  const toPay = esvCalc?.toPay ?? esvAmount;
  
  const periodLabel = getPeriodLabel(report.period);
  
  // Generate months data for quarterly report
  const monthsData = [];
  const quarterStartMonth: Record<string, number> = { Q1: 1, Q2: 4, Q3: 7, Q4: 10 };
  const startMonth = quarterStartMonth[reportPeriodType] ?? 1;
  
  const monthNamesFull = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];
  
  for (let i = 0; i < months; i++) {
    const monthIndex = startMonth + i - 1;
    monthsData.push({
      month: monthNamesFull[monthIndex],
      base: minSalary,
      rate: esvRate,
      amount: minSalary * (esvRate / 100),
    });
  }
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>ДЕРЖАВНА ПОДАТКОВА СЛУЖБА УКРАЇНИ</Text>
          <Text style={styles.headerTitle}>ЗВІТ</Text>
          <Text style={styles.headerTitle}>про суми нарахованого єдиного внеску на</Text>
          <Text style={styles.headerTitle}>загальнообов'язкове державне соціальне страхування</Text>
        </View>
        
        <Text style={styles.formCode}>Форма {report.formCode || "F0133108"}</Text>
        
        {/* Payer info */}
        <View style={styles.infoBlock}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Платник:</Text>
            <Text style={styles.infoValue}>{cabinet.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ІПН:</Text>
            <Text style={styles.infoValue}>{cabinet.taxId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Звітний період:</Text>
            <Text style={styles.infoValue}>{periodLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Категорія платника:</Text>
            <Text style={styles.infoValue}>ФОП на єдиному податку {cabinet.fopGroup} групи</Text>
          </View>
        </View>
        
        {/* Section - Calculation */}
        <Text style={styles.sectionTitle}>Розрахунок суми ЄСВ</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>01</Text>
          <Text style={styles.rowLabel}>Мінімальна заробітна плата на 01.01.{reportYear}</Text>
          <Text style={styles.rowValue}>{formatCurrency(minSalary)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>02</Text>
          <Text style={styles.rowLabel}>Ставка ЄСВ</Text>
          <Text style={styles.rowValue}>{esvRate}%</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>03</Text>
          <Text style={styles.rowLabel}>Кількість місяців у звітному періоді</Text>
          <Text style={styles.rowValue}>{months}</Text>
        </View>
        
        {/* Monthly breakdown table */}
        <Text style={styles.sectionTitle}>Розбивка по місяцях</Text>
        
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Місяць</Text>
            <Text style={styles.tableHeaderCell}>База (грн)</Text>
            <Text style={styles.tableHeaderCell}>Ставка (%)</Text>
            <Text style={styles.tableHeaderCell}>Сума ЄСВ (грн)</Text>
          </View>
          
          {monthsData.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{row.month}</Text>
              <Text style={styles.tableCell}>{formatCurrency(row.base)}</Text>
              <Text style={styles.tableCell}>{row.rate}%</Text>
              <Text style={styles.tableCell}>{formatCurrency(row.amount)}</Text>
            </View>
          ))}
        </View>
        
        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.rowNumber}></Text>
          <Text style={styles.rowLabel}>ВСЬОГО ДО СПЛАТИ за {periodLabel}</Text>
          <Text style={styles.rowValue}>{formatCurrency(toPay)}</Text>
        </View>
        
        {/* Payment details */}
        <Text style={styles.sectionTitle}>Реквізити для сплати</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Отримувач: ГУ ДПС у м. Києві</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Код ЄДРПОУ: 44116011</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Призначення платежу: ЄСВ за {periodLabel}, {cabinet.name}, ІПН {cabinet.taxId}</Text>
        </View>
        
        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>(підпис платника)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>(дата)</Text>
          </View>
        </View>
        
        <Text style={styles.footer}>
          Звіт сформовано в системі BizBook • {new Date().toLocaleDateString("uk-UA")}
        </Text>
      </Page>
    </Document>
  );
}
