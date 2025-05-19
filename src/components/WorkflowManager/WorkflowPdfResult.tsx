import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  step: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  response: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 8,
  },
  code: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'Courier',
    marginBottom: 8,
  },
})

export const PDFDocument = ({
  steps,
}: {
  steps: { order: number; response: string }[]
}) => (
  <Document>
    <Page size='A4' style={styles.page}>
      {steps.map((step) => (
        <View key={step.order} style={styles.step}>
          <Text style={styles.stepTitle}>Step {step.order}</Text>
          <Text style={styles.response}>{step.response}</Text>
        </View>
      ))}
    </Page>
  </Document>
)
