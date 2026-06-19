import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Report, EPCalculation, ReportCalculation } from "@/config/reportsConfig";
import type { Cabinet } from "@/types/cabinet";

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
  checkboxRow: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 20,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  checkboxBox: {
    width: 10,
    height: 10,
    border: "1 solid #000",
    marginRight: 4,
    textAlign: "center",
    fontSize: 8,
  },
  periodRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 20,
  },
  periodItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  periodLabel: {
    marginRight: 4,
  },
  periodValue: {
    fontWeight: "bold",
    borderBottom: "1 solid #000",
    paddingHorizontal: 8,
    minWidth: 50,
    textAlign: "center",
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
  totalRow: {
    flexDirection: "row",
    borderTop: "2 solid #000",
    borderBottom: "2 solid #000",
    paddingVertical: 6,
    marginTop: 10,
    backgroundColor: "#f9f9f9",
  },
  vzSection: {
    marginTop: 15,
    border: "1 solid #666",
    padding: 8,
  },
  vzTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
});

interface EPDeclarationPDFProps {
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
    Q2: "Півріччя",
    Q3: "9 місяців",
    Q4: "Рік",
  };
  return `${quarterNames[type] || type} ${year}`;
}

function getEPCalculation(calc: ReportCalculation | undefined): EPCalculation | null {
  if (calc && calc.type === "ep") {
    return calc.data;
  }
  return null;
}

export function EPDeclarationPDF({ report, cabinet }: EPDeclarationPDFProps) {
  const epCalc = getEPCalculation(report.calculation);
  const income = epCalc?.totalIncome ?? 0;
  const taxRate = epCalc?.taxRate ?? 5;
  const epAmount = epCalc?.calculatedTax ?? 0;
  const paidAdvances = epCalc?.paidAdvances ?? 0;
  const toPay = epCalc?.toPay ?? epAmount;
  
  // Get VZ data from militaryTax field
  const vzCalc = report.militaryTax;
  const vzAmount = vzCalc?.calculatedVZ ?? (income * 0.01);
  const vzPaid = vzCalc?.paidAmount ?? 0;
  const vzToPay = vzCalc?.toPay ?? vzAmount;
  
  const periodLabel = getPeriodLabel(report.period);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>ДЕРЖАВНА ПОДАТКОВА СЛУЖБА УКРАЇНИ</Text>
          <Text style={styles.headerTitle}>ПОДАТКОВА ДЕКЛАРАЦІЯ</Text>
          <Text style={styles.headerTitle}>ПЛАТНИКА ЄДИНОГО ПОДАТКУ</Text>
          <Text style={styles.headerSubtitle}>третьої групи (фізичної особи — підприємця)</Text>
        </View>
        
        <Text style={styles.formCode}>Форма {report.formCode || "F0103308"}</Text>
        
        {/* Declaration type */}
        <View style={styles.checkboxRow}>
          <View style={styles.checkbox}>
            <Text style={styles.checkboxBox}>✓</Text>
            <Text>Звітна</Text>
          </View>
          <View style={styles.checkbox}>
            <Text style={styles.checkboxBox}> </Text>
            <Text>Звітна нова</Text>
          </View>
          <View style={styles.checkbox}>
            <Text style={styles.checkboxBox}> </Text>
            <Text>Уточнююча</Text>
          </View>
        </View>
        
        {/* Period */}
        <View style={styles.periodRow}>
          <View style={styles.periodItem}>
            <Text style={styles.periodLabel}>Звітний період:</Text>
            <Text style={styles.periodValue}>{periodLabel}</Text>
          </View>
        </View>
        
        {/* Section I - General info */}
        <Text style={styles.sectionTitle}>Розділ I. Загальні відомості</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>01</Text>
          <Text style={styles.rowLabel}>Прізвище, ім'я, по батькові платника</Text>
          <Text style={styles.rowValue}>{cabinet.name}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>02</Text>
          <Text style={styles.rowLabel}>Реєстраційний номер облікової картки платника податків (ІПН)</Text>
          <Text style={styles.rowValue}>{cabinet.taxId}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>03</Text>
          <Text style={styles.rowLabel}>Податкова адреса (місце проживання)</Text>
          <Text style={styles.rowValue}>м. Київ</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>09</Text>
          <Text style={styles.rowLabel}>Середньооблікова чисельність працівників</Text>
          <Text style={styles.rowValue}>{cabinet.hasEmployees ? "2" : "0"}</Text>
        </View>
        
        {/* Section IV - Income indicators */}
        <Text style={styles.sectionTitle}>Розділ IV. Показники господарської діяльності для платників єдиного податку третьої групи</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>06</Text>
          <Text style={styles.rowLabel}>Обсяг доходу за звітний період, що оподатковується за ставкою {taxRate}%</Text>
          <Text style={styles.rowValue}>{formatCurrency(income)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>08</Text>
          <Text style={styles.rowLabel}>Загальний обсяг доходу за звітний період (сума рядків 06 + 07)</Text>
          <Text style={styles.rowValue}>{formatCurrency(income)}</Text>
        </View>
        
        {/* Section V - Tax obligations */}
        <Text style={styles.sectionTitle}>Розділ V. Визначення податкових зобов'язань з єдиного податку</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>11</Text>
          <Text style={styles.rowLabel}>Сума єдиного податку за звітний період (рядок 06 × {taxRate}%)</Text>
          <Text style={styles.rowValue}>{formatCurrency(epAmount)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowNumber}>13</Text>
          <Text style={styles.rowLabel}>Сума єдиного податку за попередній звітний період (наростаючим підсумком)</Text>
          <Text style={styles.rowValue}>{formatCurrency(paidAdvances)}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.rowNumber}>14</Text>
          <Text style={styles.rowLabel}>Сума єдиного податку до сплати за поточний звітний період (рядок 11 − рядок 13)</Text>
          <Text style={styles.rowValue}>{formatCurrency(toPay)}</Text>
        </View>
        
        {/* Section VIII - Military tax (VZ) */}
        <View style={styles.vzSection}>
          <Text style={styles.vzTitle}>Розділ VIII. Визначення податкових зобов'язань з військового збору</Text>
          <Text style={{ fontSize: 8, marginBottom: 6, color: "#666" }}>
            (для платників третьої групи — з 01.12.2024)
          </Text>
          
          <View style={styles.row}>
            <Text style={styles.rowNumber}>23</Text>
            <Text style={styles.rowLabel}>Сума військового збору (дохід × 1%)</Text>
            <Text style={styles.rowValue}>{formatCurrency(vzAmount)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.rowNumber}>24</Text>
            <Text style={styles.rowLabel}>Сума ВЗ за попередній звітний період</Text>
            <Text style={styles.rowValue}>{formatCurrency(vzPaid)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.rowNumber}>25</Text>
            <Text style={styles.rowLabel}>Сума ВЗ до сплати за поточний період (рядок 23 − рядок 24)</Text>
            <Text style={styles.rowValue}>{formatCurrency(vzToPay)}</Text>
          </View>
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
          Декларація сформована в системі BizBook • {new Date().toLocaleDateString("uk-UA")}
        </Text>
      </Page>
    </Document>
  );
}
