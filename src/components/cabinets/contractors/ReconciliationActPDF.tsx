import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { Cabinet } from "@/types/cabinet";
import type { Contractor } from "@/config/settingsConfig";
import type { ContractorPaymentRecord } from "@/config/contractorHistoryConfig";

// Styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    width: 120,
    color: "#666",
  },
  value: {
    flex: 1,
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
    paddingHorizontal: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  tableCell: {
    fontSize: 9,
  },
  colDate: { width: "15%" },
  colDoc: { width: "25%" },
  colDebit: { width: "15%", textAlign: "right" },
  colCredit: { width: "15%", textAlign: "right" },
  colBalance: { width: "15%", textAlign: "right" },
  colPurpose: { width: "15%" },
  totalsSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginTop: 30,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 9,
    textAlign: "center",
    color: "#666",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});

interface ReconciliationActPDFProps {
  cabinet: Cabinet;
  contractor: Contractor;
  payments: ContractorPaymentRecord[];
  period: { from: string; to: string };
  openingBalance: number;
}

export const ReconciliationActPDF = ({
  cabinet,
  contractor,
  payments,
  period,
  openingBalance,
}: ReconciliationActPDFProps) => {
  // Calculate totals
  const incomingTotal = payments
    .filter(p => p.direction === "incoming" && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const outgoingTotal = payments
    .filter(p => p.direction === "outgoing" && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  
  const closingBalance = openingBalance + incomingTotal - outgoingTotal;

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("uk-UA")} грн`;
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd.MM.yyyy", { locale: uk });
  };

  // Calculate running balance for table
  let runningBalance = openingBalance;
  const tableRows = payments
    .filter(p => p.status === "completed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(payment => {
      const debit = payment.direction === "outgoing" ? payment.amount : 0;
      const credit = payment.direction === "incoming" ? payment.amount : 0;
      runningBalance = runningBalance + credit - debit;
      return {
        date: formatDate(payment.date),
        document: payment.linkedDocumentNumber || "—",
        debit,
        credit,
        balance: runningBalance,
        purpose: payment.paymentPurpose?.substring(0, 30) || "—",
      };
    });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>АКТ ЗВІРКИ ВЗАЄМОРОЗРАХУНКІВ</Text>
          <Text style={styles.subtitle}>
            за період з {formatDate(period.from)} по {formatDate(period.to)}
          </Text>
        </View>

        {/* Party 1 - Cabinet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сторона 1</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Назва:</Text>
            <Text style={styles.value}>{cabinet.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{cabinet.type === "fop" ? "ІПН:" : "ЄДРПОУ:"}</Text>
            <Text style={styles.value}>{cabinet.taxId}</Text>
          </View>
        </View>

        {/* Party 2 - Contractor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сторона 2</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Назва:</Text>
            <Text style={styles.value}>{contractor.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{contractor.type === "legal" ? "ЄДРПОУ:" : "ІПН:"}</Text>
            <Text style={styles.value}>{contractor.code}</Text>
          </View>
          {contractor.iban && (
            <View style={styles.row}>
              <Text style={styles.label}>IBAN:</Text>
              <Text style={styles.value}>{contractor.iban}</Text>
            </View>
          )}
        </View>

        {/* Operations Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Операції за період</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.colDate]}>Дата</Text>
              <Text style={[styles.tableCell, styles.colDoc]}>Документ</Text>
              <Text style={[styles.tableCell, styles.colDebit]}>Дебет</Text>
              <Text style={[styles.tableCell, styles.colCredit]}>Кредит</Text>
              <Text style={[styles.tableCell, styles.colBalance]}>Сальдо</Text>
            </View>
            
            {/* Opening balance row */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDate]}>—</Text>
              <Text style={[styles.tableCell, styles.colDoc]}>Вхідне сальдо</Text>
              <Text style={[styles.tableCell, styles.colDebit]}>—</Text>
              <Text style={[styles.tableCell, styles.colCredit]}>—</Text>
              <Text style={[styles.tableCell, styles.colBalance]}>{formatCurrency(openingBalance)}</Text>
            </View>

            {/* Table Rows */}
            {tableRows.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDate]}>{row.date}</Text>
                <Text style={[styles.tableCell, styles.colDoc]}>{row.document}</Text>
                <Text style={[styles.tableCell, styles.colDebit]}>
                  {row.debit > 0 ? formatCurrency(row.debit) : "—"}
                </Text>
                <Text style={[styles.tableCell, styles.colCredit]}>
                  {row.credit > 0 ? formatCurrency(row.credit) : "—"}
                </Text>
                <Text style={[styles.tableCell, styles.colBalance]}>{formatCurrency(row.balance)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Вхідне сальдо:</Text>
            <Text style={styles.totalValue}>{formatCurrency(openingBalance)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Обороти за Дебетом (ми винні):</Text>
            <Text style={styles.totalValue}>{formatCurrency(outgoingTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Обороти за Кредитом (нам винні):</Text>
            <Text style={styles.totalValue}>{formatCurrency(incomingTotal)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: "#ccc" }]}>
            <Text style={[styles.totalLabel, { fontWeight: "bold" }]}>Вихідне сальдо:</Text>
            <Text style={[styles.totalValue, { fontSize: 12 }]}>{formatCurrency(closingBalance)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontStyle: "italic" }]}>
              {closingBalance > 0 
                ? "На користь Сторони 1 (нам винні)" 
                : closingBalance < 0 
                ? "На користь Сторони 2 (ми винні)"
                : "Розбіжностей немає"}
            </Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5 }}>Сторона 1</Text>
            <Text style={{ fontSize: 9 }}>{cabinet.name}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>підпис / М.П.</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5 }}>Сторона 2</Text>
            <Text style={{ fontSize: 9 }}>{contractor.name}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>підпис / М.П.</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Документ згенеровано системою автоматично • {format(new Date(), "dd.MM.yyyy HH:mm")}
        </Text>
      </Page>
    </Document>
  );
};
