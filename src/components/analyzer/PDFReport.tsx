import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { AnalysisRecord, AnalysisSection } from "../../types";

// Register fonts (using built-in Helvetica for simplicity)
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@react-pdf/fonts@3.0.0/Helvetica/Helvetica-Regular.afm",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@react-pdf/fonts@3.0.0/Helvetica/Helvetica-Bold.afm",
      fontWeight: "bold",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@react-pdf/fonts@3.0.0/Helvetica/Helvetica-Oblique.afm",
      fontStyle: "italic",
    },
  ],
});

// Color palette
const colors = {
  primary: "#000000",
  secondary: "#374151",
  accent: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  lightGray: "#F3F4F6",
  gray: "#9CA3AF",
  darkGray: "#4B5563",
  white: "#FFFFFF",
  border: "#E5E7EB",
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  date: {
    fontSize: 10,
    color: colors.gray,
  },
  titleSection: {
    marginBottom: 24,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.secondary,
    marginTop: 12,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.darkGray,
    marginBottom: 6,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 4,
    marginLeft: 12,
  },
  bullet: {
    fontSize: 10,
    color: colors.gray,
    marginRight: 6,
  },
  badge: {
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgeCritical: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
  },
  badgeImprove: {
    backgroundColor: "#FFFBEB",
    color: "#D97706",
  },
  badgeGood: {
    backgroundColor: "#ECFDF5",
    color: "#059669",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.gray,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 24,
  },
  column: {
    flex: 1,
  },
});

function ScoreCircle({ score }: { score: number }) {
  const getColor = (s: number) =>
    s < 40 ? colors.accent : s < 70 ? colors.warning : colors.success;

  return (
    <View style={[styles.scoreCircle, { borderColor: getColor(score) }]}>
      <Text style={[styles.scoreText, { color: getColor(score) }]}>
        {score}
      </Text>
    </View>
  );
}

function Badge({ type }: { type: "critical" | "improve" | "good" }) {
  const styleMap = {
    critical: styles.badgeCritical,
    improve: styles.badgeImprove,
    good: styles.badgeGood,
  };
  const labelMap = {
    critical: "CRÍTICO",
    improve: "MEJORAR",
    good: "BIEN",
  };
  return (
    <View style={[styles.badge, styleMap[type]]}>
      <Text>{labelMap[type]}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function BodyText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.bodyText}>{children}</Text>;
}

function BulletPoint({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletPoint}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bodyText}>{children}</Text>
    </View>
  );
}

interface PDFReportProps {
  record: AnalysisRecord;
}

export function PDFReportDocument({ record }: PDFReportProps) {
  const date = new Date(record.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>PitchMe</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        {/* Title & Score */}
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle}>{record.jobTitle}</Text>
          <View style={styles.scoreContainer}>
            <ScoreCircle score={record.result.score} />
            <View>
              <Text
                style={[
                  styles.scoreLabel,
                  {
                    color:
                      record.result.score < 40
                        ? colors.accent
                        : record.result.score < 70
                          ? colors.warning
                          : colors.success,
                  },
                ]}
              >
                {record.result.scoreLabel.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 10, color: colors.gray }}>
                {record.result.score} / 100 puntos
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Job Description & CV Preview */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <SectionTitle>DESCRIPCIÓN DEL PUESTO</SectionTitle>
            <BodyText>{record.jobDescription}</BodyText>
          </View>
          <View style={styles.column}>
            <SectionTitle>VISTA PREVIA DEL CV</SectionTitle>
            <BodyText>{record.cvText}</BodyText>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Analysis Sections */}
        {record.result.sections.map(
          (section: AnalysisSection, index: number) => (
            <View key={`${section.title}-${index}`} style={styles.section}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <SectionTitle>{section.title}</SectionTitle>
                <Badge type={section.type} />
              </View>
              <BodyText>{section.summary}</BodyText>
              {section.suggestions.map((suggestion: string, i: number) => (
                <BulletPoint key={i}>{suggestion}</BulletPoint>
              ))}
            </View>
          ),
        )}

        <View style={styles.footer}>
          <Text>Generado por PitchMe - Analizador de CV</Text>
          <Text>Confidencial - Solo para uso personal</Text>
        </View>
      </Page>
    </Document>
  );
}

// Helper function to generate and download PDF
// eslint-disable-next-line react-refresh/only-export-components
export async function generateAndDownloadPDF(
  record: AnalysisRecord,
): Promise<void> {
  try {
    const blob = await pdf(<PDFReportDocument record={record} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pitchme-informe-${record.jobTitle.replace(/\s+/g, "-")}-${new Date(record.createdAt).toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Error al generar el PDF");
  }
}

// For preview in browser
export function PDFPreview({ record }: { record: AnalysisRecord }) {
  return <PDFReportDocument record={record} />;
}
