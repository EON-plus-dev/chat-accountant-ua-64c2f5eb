import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
    color: '#6b7280',
  },
  partiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 20,
  },
  party: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  partyLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  partyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  partyCode: {
    fontSize: 10,
    color: '#374151',
  },
  bodyContainer: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  amountContainer: {
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  termsList: {
    marginBottom: 24,
  },
  termItem: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 12,
  },
  signaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 8,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginBottom: 4,
    height: 20,
  },
  signatureHint: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

// Default contract body text for demo
const defaultContractText = `ПРЕДМЕТ ДОГОВОРУ

1.1. Виконавець зобов'язується надати Замовнику комплекс послуг з розробки та технічної підтримки програмного забезпечення відповідно до Технічного завдання (Додаток №1), а Замовник зобов'язується прийняти та оплатити ці послуги на умовах, визначених цим Договором.

1.2. Детальний перелік, обсяг та терміни надання послуг визначаються у Специфікаціях, що є невід'ємними додатками до цього Договору.

ВАРТІСТЬ ТА ПОРЯДОК РОЗРАХУНКІВ

2.1. Вартість послуг за цим Договором визначається на підставі погоджених Сторонами Специфікацій та може коригуватися за письмовою згодою Сторін.

2.2. Оплата здійснюється Замовником у безготівковій формі шляхом перерахування коштів на поточний рахунок Виконавця протягом 5 (п'яти) банківських днів з моменту підписання Акту наданих послуг.

2.3. Датою оплати вважається дата зарахування коштів на рахунок Виконавця.

ПРАВА ТА ОБОВ'ЯЗКИ СТОРІН

3.1. Виконавець зобов'язується:
- надати послуги якісно та у строки, визначені Договором;
- інформувати Замовника про хід виконання робіт;
- забезпечити конфіденційність отриманої інформації.

3.2. Замовник зобов'язується:
- своєчасно надати Виконавцю інформацію та матеріали, необхідні для надання послуг;
- прийняти та оплатити належним чином надані послуги;
- не розголошувати конфіденційну інформацію Виконавця.

ВІДПОВІДАЛЬНІСТЬ СТОРІН

4.1. За невиконання або неналежне виконання зобов'язань за цим Договором Сторони несуть відповідальність згідно з чинним законодавством України.

4.2. За порушення строків оплати Замовник сплачує Виконавцю пеню у розмірі подвійної облікової ставки НБУ від суми заборгованості за кожен день прострочення.

СТРОК ДІЇ ДОГОВОРУ

5.1. Цей Договір набирає чинності з моменту його підписання Сторонами та діє до повного виконання Сторонами своїх зобов'язань.

5.2. Договір може бути розірваний достроково за взаємною згодою Сторін або в односторонньому порядку з письмовим повідомленням іншої Сторони не менше ніж за 30 календарних днів.`;

interface DocumentPDFTemplateProps {
  documentType: string;
  documentNumber: string;
  documentDate: string;
  supplier: { name: string; code: string };
  buyer: { name: string; code: string };
  amount?: number;
  currency?: string;
  keyTerms?: string[];
  bodyText?: string;
}

export const DocumentPDFTemplate = ({
  documentType,
  documentNumber,
  documentDate,
  supplier,
  buyer,
  amount,
  currency = 'UAH',
  keyTerms,
  bodyText,
}: DocumentPDFTemplateProps) => {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return '₴';
    }
  };

  const displayBodyText = bodyText || defaultContractText;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{documentType.toUpperCase()}</Text>
          <Text style={styles.subtitle}>
            № {documentNumber} від {documentDate}
          </Text>
        </View>

        {/* Parties */}
        <View style={styles.partiesContainer}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Постачальник</Text>
            <Text style={styles.partyName}>{supplier.name || '—'}</Text>
            <Text style={styles.partyCode}>
              {supplier.code ? `ЄДРПОУ/ІПН: ${supplier.code}` : ''}
            </Text>
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Покупець</Text>
            <Text style={styles.partyName}>{buyer.name || '—'}</Text>
            <Text style={styles.partyCode}>
              {buyer.code ? `ЄДРПОУ/ІПН: ${buyer.code}` : ''}
            </Text>
          </View>
        </View>

        {/* Body Text */}
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyText}>{displayBodyText}</Text>
        </View>

        {/* Amount */}
        {amount !== undefined && amount > 0 && (
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Сума документа</Text>
            <Text style={styles.amountValue}>
              {formatAmount(amount)} {getCurrencySymbol(currency)}
            </Text>
          </View>
        )}

        {/* Key Terms */}
        {keyTerms && keyTerms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ключові умови:</Text>
            <View style={styles.termsList}>
              {keyTerms.map((term, index) => (
                <Text key={index} style={styles.termItem}>
                  • {term}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Постачальник</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureHint}>(підпис, М.П.)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Покупець</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureHint}>(підпис, М.П.)</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Документ згенеровано системою • {new Date().toLocaleDateString('uk-UA')}
        </Text>
      </Page>
    </Document>
  );
};
