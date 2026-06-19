import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Report, OnedfCalculation, ReportCalculation } from "@/config/reportsConfig";
import type { Cabinet } from "@/types/cabinet";

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 7,
    color: "#666",
    marginBottom: 2,
  },
  formCode: {
    fontSize: 7,
    textAlign: "right",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 4,
    marginTop: 8,
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #ccc",
    paddingVertical: 3,
    alignItems: "center",
  },
  rowNumber: {
    width: 25,
    fontSize: 7,
    color: "#666",
  },
  rowLabel: {
    flex: 1,
    paddingRight: 6,
  },
  rowValue: {
    width: 80,
    textAlign: "right",
    fontWeight: "bold",
  },
  table: {
    marginTop: 8,
    border: "1 solid #ccc",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    borderBottom: "1 solid #ccc",
    paddingVertical: 3,
  },
  tableHeaderCell: {
    fontSize: 6,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 2,
    borderRight: "1 solid #ddd",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #eee",
    paddingVertical: 2,
  },
  tableCell: {
    fontSize: 7,
    textAlign: "center",
    paddingHorizontal: 2,
    borderRight: "1 solid #eee",
  },
  tableCellLeft: {
    fontSize: 7,
    textAlign: "left",
    paddingHorizontal: 2,
    borderRight: "1 solid #eee",
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderTop: "1 solid #999",
    paddingVertical: 3,
    fontWeight: "bold",
  },
  summarySection: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "#f9f9f9",
    border: "1 solid #ddd",
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  summaryLabel: {
    width: 180,
    fontSize: 7,
  },
  summaryValue: {
    flex: 1,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "right",
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
  },
  signatureLine: {
    borderBottom: "1 solid #000",
    marginTop: 15,
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 6,
    color: "#666",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 15,
    left: 25,
    right: 25,
    fontSize: 6,
    color: "#999",
    textAlign: "center",
  },
  infoBlock: {
    marginTop: 8,
    padding: 6,
    backgroundColor: "#fafafa",
    border: "1 solid #ddd",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  infoLabel: {
    width: 130,
    fontSize: 7,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 7,
  },
  appendixTitle: {
    fontSize: 8,
    fontWeight: "bold",
    backgroundColor: "#e0e0e0",
    padding: 4,
    marginTop: 12,
    marginBottom: 6,
    textAlign: "center",
  },
});

interface OnedfReportPDFProps {
  report: Report;
  cabinet: Cabinet;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getPeriodLabel(report: Report): string {
  // Якщо в звіті є готовий periodLabel — використовуємо його (місячні/квартальні)
  if (report.periodLabel) return report.periodLabel;
  const period = report.period;
  const quarterNames: Record<string, string> = {
    Q1: "I квартал",
    Q2: "II квартал",
    Q3: "III квартал",
    Q4: "IV квартал",
  };
  return `${quarterNames[period] || period} ${report.year}`;
}

function getOnedfCalculation(calc: ReportCalculation | undefined): OnedfCalculation | null {
  if (calc && calc.type === "1df") {
    return calc.data;
  }
  return null;
}

export function OnedfReportPDF({ report, cabinet }: OnedfReportPDFProps) {
  const onedfCalc = getOnedfCalculation(report.calculation);
  const employeesCount = onedfCalc?.employeesCount ?? 0;
  const totalSalary = onedfCalc?.totalSalary ?? 0;
  const pdfo = onedfCalc?.pdfo ?? 0;
  const vz = onedfCalc?.vz ?? 0;
  const esv = onedfCalc?.esv ?? 0;
  
  const periodLabel = getPeriodLabel(report);
  
  // Demo employee data
  const employees = [
    { ipn: "2345678901", name: "Петренко О.І.", income: totalSalary * 0.6, pdfo: pdfo * 0.6, vz: vz * 0.6, esv: esv * 0.6, code: "101" },
    { ipn: "3456789012", name: "Коваленко М.С.", income: totalSalary * 0.4, pdfo: pdfo * 0.4, vz: vz * 0.4, esv: esv * 0.4, code: "101" },
  ].slice(0, employeesCount);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>ДЕРЖАВНА ПОДАТКОВА СЛУЖБА УКРАЇНИ</Text>
          <Text style={styles.headerTitle}>ПОДАТКОВИЙ РОЗРАХУНОК</Text>
          <Text style={styles.headerSubtitle}>сум доходу, нарахованого (сплаченого) на користь платників податків —</Text>
          <Text style={styles.headerSubtitle}>фізичних осіб, і сум утриманого з них податку, а також сум</Text>
          <Text style={styles.headerSubtitle}>нарахованого єдиного внеску</Text>
          <Text style={{ fontSize: 7, marginTop: 4 }}>(з Додатком 4ДФ та Додатками Д1, Д5, Д6)</Text>
        </View>
        
        <Text style={styles.formCode}>Форма {report.formCode || "F0500107"}</Text>
        
        {/* Employer info */}
        <View style={styles.infoBlock}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Роботодавець:</Text>
            <Text style={styles.infoValue}>{cabinet.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ІПН/ЄДРПОУ:</Text>
            <Text style={styles.infoValue}>{cabinet.taxId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Звітний період:</Text>
            <Text style={styles.infoValue}>{periodLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Кількість працівників:</Text>
            <Text style={styles.infoValue}>{employeesCount}</Text>
          </View>
        </View>
        
        {/* Summary section */}
        <Text style={styles.sectionTitle}>Загальні підсумки</Text>
        
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Загальна сума нарахованого доходу:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalSalary)} грн</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ПДФО (18%):</Text>
            <Text style={styles.summaryValue}>{formatCurrency(pdfo)} грн</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Військовий збір (5%):</Text>
            <Text style={styles.summaryValue}>{formatCurrency(vz)} грн</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ЄСВ (22%):</Text>
            <Text style={styles.summaryValue}>{formatCurrency(esv)} грн</Text>
          </View>
        </View>
        
        {/* Appendix D1 - ESV */}
        <Text style={styles.appendixTitle}>Додаток Д1 — Відомості про нарахування ЄСВ</Text>
        
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: 25 }]}>№</Text>
            <Text style={[styles.tableHeaderCell, { width: 70 }]}>ІПН</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>ПІБ</Text>
            <Text style={[styles.tableHeaderCell, { width: 70 }]}>Сума ЗП</Text>
            <Text style={[styles.tableHeaderCell, { width: 60, borderRight: "none" }]}>ЄСВ</Text>
          </View>
          
          {employees.map((emp, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: 25 }]}>{index + 1}</Text>
              <Text style={[styles.tableCell, { width: 70 }]}>{emp.ipn}</Text>
              <Text style={[styles.tableCellLeft, { flex: 1 }]}>{emp.name}</Text>
              <Text style={[styles.tableCell, { width: 70 }]}>{formatCurrency(emp.income)}</Text>
              <Text style={[styles.tableCell, { width: 60, borderRight: "none" }]}>{formatCurrency(emp.esv)}</Text>
            </View>
          ))}
          
          <View style={styles.totalRow}>
            <Text style={[styles.tableCell, { width: 25 }]}></Text>
            <Text style={[styles.tableCell, { width: 70 }]}></Text>
            <Text style={[styles.tableCellLeft, { flex: 1, fontWeight: "bold" }]}>ВСЬОГО:</Text>
            <Text style={[styles.tableCell, { width: 70, fontWeight: "bold" }]}>{formatCurrency(totalSalary)}</Text>
            <Text style={[styles.tableCell, { width: 60, fontWeight: "bold", borderRight: "none" }]}>{formatCurrency(esv)}</Text>
          </View>
        </View>
        
        {/* Appendix 4DF - PDFO + VZ */}
        <Text style={styles.appendixTitle}>Додаток 4ДФ — ПДФО та військовий збір</Text>
        
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: 20 }]}>№</Text>
            <Text style={[styles.tableHeaderCell, { width: 60 }]}>ІПН</Text>
            <Text style={[styles.tableHeaderCell, { width: 60 }]}>Дохід</Text>
            <Text style={[styles.tableHeaderCell, { width: 50 }]}>ПДФО нар.</Text>
            <Text style={[styles.tableHeaderCell, { width: 50 }]}>ПДФО спл.</Text>
            <Text style={[styles.tableHeaderCell, { width: 45 }]}>ВЗ нар.</Text>
            <Text style={[styles.tableHeaderCell, { width: 45 }]}>ВЗ спл.</Text>
            <Text style={[styles.tableHeaderCell, { width: 30, borderRight: "none" }]}>Код</Text>
          </View>
          
          {employees.map((emp, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: 20 }]}>{index + 1}</Text>
              <Text style={[styles.tableCell, { width: 60 }]}>{emp.ipn}</Text>
              <Text style={[styles.tableCell, { width: 60 }]}>{formatCurrency(emp.income)}</Text>
              <Text style={[styles.tableCell, { width: 50 }]}>{formatCurrency(emp.pdfo)}</Text>
              <Text style={[styles.tableCell, { width: 50 }]}>{formatCurrency(emp.pdfo)}</Text>
              <Text style={[styles.tableCell, { width: 45 }]}>{formatCurrency(emp.vz)}</Text>
              <Text style={[styles.tableCell, { width: 45 }]}>{formatCurrency(emp.vz)}</Text>
              <Text style={[styles.tableCell, { width: 30, borderRight: "none" }]}>{emp.code}</Text>
            </View>
          ))}
          
          <View style={styles.totalRow}>
            <Text style={[styles.tableCell, { width: 20 }]}></Text>
            <Text style={[styles.tableCell, { width: 60 }]}>ВСЬОГО</Text>
            <Text style={[styles.tableCell, { width: 60 }]}>{formatCurrency(totalSalary)}</Text>
            <Text style={[styles.tableCell, { width: 50 }]}>{formatCurrency(pdfo)}</Text>
            <Text style={[styles.tableCell, { width: 50 }]}>{formatCurrency(pdfo)}</Text>
            <Text style={[styles.tableCell, { width: 45 }]}>{formatCurrency(vz)}</Text>
            <Text style={[styles.tableCell, { width: 45 }]}>{formatCurrency(vz)}</Text>
            <Text style={[styles.tableCell, { width: 30, borderRight: "none" }]}></Text>
          </View>
        </View>
        
        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>(підпис роботодавця / уповноваженої особи)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>(дата подання)</Text>
          </View>
        </View>
        
        <Text style={styles.footer}>
          Податковий розрахунок (4ДФ) сформовано в системі BizBook • {new Date().toLocaleDateString("uk-UA")}
        </Text>
      </Page>
    </Document>
  );
}
