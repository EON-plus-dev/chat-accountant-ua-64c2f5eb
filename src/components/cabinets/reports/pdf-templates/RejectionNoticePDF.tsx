import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Report } from "@/config/reportsConfig";
import type { Cabinet } from "@/types/cabinet";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { textAlign: "center", marginBottom: 20 },
  agency: { fontSize: 9, color: "#666", marginBottom: 4 },
  title: { fontSize: 14, fontWeight: "bold", color: "#b91c1c" },
  metaBox: {
    border: "1 solid #fca5a5",
    backgroundColor: "#fef2f2",
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
  reasonBox: {
    border: "1 solid #999",
    padding: 12,
    marginTop: 6,
  },
  deadline: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#fef3c7",
    border: "1 solid #f59e0b",
    fontSize: 10,
    fontWeight: "bold",
    color: "#92400e",
  },
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

interface RejectionNoticePDFProps {
  report: Report;
  cabinet: Cabinet;
}

export function RejectionNoticePDF({ report, cabinet }: RejectionNoticePDFProps) {
  const r = report.rejectionDetails;
  const dateStr = r?.date ? new Date(r.date).toLocaleString("uk-UA") : "—";
  const deadlineStr = r?.correctionDeadline
    ? new Date(r.correctionDeadline).toLocaleDateString("uk-UA")
    : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.agency}>ДЕРЖАВНА ПОДАТКОВА СЛУЖБА УКРАЇНИ</Text>
          <Text style={styles.title}>ПОВІДОМЛЕННЯ ПРО ВІДХИЛЕННЯ</Text>
          <Text style={{ fontSize: 9, color: "#666", marginTop: 4 }}>
            електронного документа звітності
          </Text>
        </View>

        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Код помилки:</Text>
            <Text style={styles.metaValue}>{r?.code || "—"}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Дата відхилення:</Text>
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

        <Text style={styles.sectionTitle}>Причина відхилення</Text>
        <View style={styles.reasonBox}>
          <Text style={{ fontSize: 10, lineHeight: 1.6 }}>
            {r?.reason || "Причину не вказано."}
          </Text>
        </View>

        {deadlineStr && (
          <Text style={styles.deadline}>
            ⏱ Виправити та подати повторно до: {deadlineStr}
          </Text>
        )}

        <Text style={{ marginTop: 20, fontSize: 9, color: "#666", lineHeight: 1.5 }}>
          Документ не прийнятий до обліку. Платник податків зобовʼязаний усунути зазначені
          помилки та подати документ повторно у встановлений строк. У разі неподання або
          несвоєчасного подання застосовується відповідальність згідно зі ст. 120 ПКУ.
        </Text>

        <Text style={styles.footer}>
          Демонстраційне повідомлення · згенеровано в BizBook · {new Date().toLocaleDateString("uk-UA")}
        </Text>
      </Page>
    </Document>
  );
}
