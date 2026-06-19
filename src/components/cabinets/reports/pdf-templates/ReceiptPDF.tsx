import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Report } from "@/config/reportsConfig";
import type { Cabinet } from "@/types/cabinet";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { textAlign: "center", marginBottom: 20 },
  agency: { fontSize: 9, color: "#666", marginBottom: 4 },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#333" },
  metaBox: {
    border: "1 solid #999",
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  metaRow: { flexDirection: "row", marginBottom: 6 },
  metaLabel: { width: 160, color: "#666", fontSize: 9 },
  metaValue: { flex: 1, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 6,
    marginTop: 10,
    marginBottom: 8,
  },
  stampWrap: {
    marginTop: 30,
    alignItems: "center",
  },
  stamp: {
    border: "2 solid #2563eb",
    color: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  stampDate: { fontSize: 8, color: "#666", marginTop: 4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#999",
    textAlign: "center",
    borderTop: "1 solid #ddd",
    paddingTop: 6,
  },
});

interface ReceiptPDFProps {
  report: Report;
  cabinet: Cabinet;
  receiptNumber: 1 | 2;
}

export function ReceiptPDF({ report, cabinet, receiptNumber }: ReceiptPDFProps) {
  const receipt = receiptNumber === 1 ? report.receipt1 : report.receipt2;
  const stampLabel = receiptNumber === 1 ? "ДОСТАВЛЕНО" : "ПРИЙНЯТО";
  const titleLabel = receiptNumber === 1
    ? "Квитанція №1 — про доставку"
    : "Квитанція №2 — про прийняття";

  const dateStr = receipt?.date
    ? new Date(receipt.date).toLocaleString("uk-UA")
    : "—";
  const numberStr = receipt?.number || "—";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.agency}>ДЕРЖАВНА ПОДАТКОВА СЛУЖБА УКРАЇНИ</Text>
          <Text style={styles.title}>{titleLabel}</Text>
          <Text style={styles.subtitle}>
            електронного документа звітності
          </Text>
        </View>

        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Номер квитанції:</Text>
            <Text style={styles.metaValue}>{numberStr}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Дата та час:</Text>
            <Text style={styles.metaValue}>{dateStr}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Тип документа:</Text>
            <Text style={styles.metaValue}>
              {report.typeLabel || report.type.toUpperCase()}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Код форми:</Text>
            <Text style={styles.metaValue}>{report.formCode || "—"}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Звітний період:</Text>
            <Text style={styles.metaValue}>{report.periodLabel}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Платник податків</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Найменування:</Text>
          <Text style={styles.metaValue}>{cabinet.name}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>РНОКПП / ЄДРПОУ:</Text>
          <Text style={styles.metaValue}>{cabinet.taxId}</Text>
        </View>

        <Text style={styles.sectionTitle}>Статус обробки</Text>
        <Text style={{ fontSize: 9, color: "#333", lineHeight: 1.5 }}>
          {receiptNumber === 1
            ? "Електронний документ успішно доставлено до системи приймання звітності ДПС України. Документ зареєстровано в журналі вхідних повідомлень."
            : "Електронний документ пройшов автоматизовану перевірку та прийнятий до обліку контролюючим органом. Звітність вважається поданою."}
        </Text>

        <View style={styles.stampWrap}>
          <Text style={styles.stamp}>{stampLabel}</Text>
          <Text style={styles.stampDate}>{dateStr}</Text>
        </View>

        <Text style={styles.footer}>
          Демонстраційна квитанція · згенеровано в BizBook · {new Date().toLocaleDateString("uk-UA")}
          {"\n"}Цей документ є електронним відображенням оригінальної квитанції ДПС України.
        </Text>
      </Page>
    </Document>
  );
}
