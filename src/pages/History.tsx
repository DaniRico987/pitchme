import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Trash2, Download, FileText, Clock } from "lucide-react";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { generateAndDownloadPDF } from "../components/analyzer/PDFReport";
import type { AnalysisRecord } from "../types";

export function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLang();
  const { showToast } = useToast();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("analyses")
        .select(
          "id, user_id, job_title, job_description, cv_text, result, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Map snake_case DB columns to camelCase TypeScript types
      const mappedHistory: AnalysisRecord[] = (data || []).map(
        (item: Record<string, unknown>) => ({
          id: String(item.id),
          jobTitle: String(item.job_title),
          jobDescription: String(item.job_description),
          cvText: String(item.cv_text),
          result: item.result as AnalysisRecord["result"],
          createdAt: String(item.created_at),
        }),
      );

      setHistory(mappedHistory);
    } catch (err) {
      console.error("Error loading history:", err);
      showToast("error", "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("analyses").delete().eq("id", id);
      if (error) throw error;
      setHistory((prev) => prev.filter((item) => item.id !== id));
      showToast("success", "Análisis eliminado");
    } catch {
      showToast("error", "Error al eliminar");
    }
  };

  const handleExport = async (record: AnalysisRecord) => {
    try {
      await generateAndDownloadPDF(record);
      showToast("success", "Reporte PDF exportado");
    } catch {
      showToast("error", "Error al generar el PDF");
    }
  };

  const scoreColor = (score: number) =>
    score < 40
      ? "text-red-600"
      : score < 70
        ? "text-amber-500"
        : "text-green-600";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/analyze")}
                className="w-auto"
              >
                <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                {t.history?.backToAnalyze || "Nuevo análisis"}
              </Button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {t.history?.title || "Historial de análisis"}
          </h1>
          <p className="text-gray-500 text-sm">
            {t.history?.subtitle || "Tus análisis previos"}
          </p>
        </header>

        {history.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 md:p-12 text-center">
            <FileText
              className="h-16 w-16 text-gray-300 mx-auto mb-4"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t.history?.emptyTitle || "Sin análisis aún"}
            </h2>
            <p className="text-gray-500 mb-6">
              {t.history?.emptySubtitle || "Tu primer análisis aparecerá aquí"}
            </p>
            <Button onClick={() => navigate("/analyze")}>
              {t.history?.firstAnalysisBtn || "Crear mi primer análisis"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(expandedId === record.id ? null : record.id)
                  }
                  className="w-full p-3 md:p-4 flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        (record.result?.score ?? 0) < 40
                          ? "bg-red-100"
                          : (record.result?.score ?? 0) < 70
                            ? "bg-amber-100"
                            : "bg-green-100"
                      }`}
                    >
                      <span
                        className={`text-lg md:text-xl font-bold ${scoreColor(record.result?.score ?? 0)}`}
                      >
                        {record.result?.score ?? 0}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {record.jobTitle}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1.5">
                        <Clock
                          className="h-3 w-3 md:h-3.5 md:w-3.5"
                          aria-hidden="true"
                        />
                        {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      type={
                        (record.result?.score ?? 0) < 40
                          ? "critical"
                          : (record.result?.score ?? 0) < 70
                            ? "improve"
                            : "good"
                      }
                    />
                  </div>
                </button>

                {expandedId === record.id && (
                  <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        type={
                          (record.result?.score ?? 0) < 40
                            ? "critical"
                            : (record.result?.score ?? 0) < 70
                              ? "improve"
                              : "good"
                        }
                      />
                      <span className="text-sm text-gray-500">
                        {t.history?.scoreLabel || "Puntuación"}:{" "}
                        {record.result?.score ?? 0}/100
                      </span>
                      <span className="text-sm text-gray-500">
                        {record.result?.scoreLabel ?? ""}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {t.history?.jobDescription ||
                            "Descripción del puesto"}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {record.jobDescription}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {t.history?.cvPreview || "Vista previa del CV"}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {record.cvText}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(record.result?.sections ?? []).map((section) => (
                        <div
                          key={section.title}
                          className="rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Badge type={section.type} />
                            <h5 className="font-medium text-gray-900 text-sm">
                              {section.title}
                            </h5>
                          </div>
                          <p className="text-xs text-gray-600 mb-1.5">
                            {section.summary}
                          </p>
                          <ul className="space-y-1 pl-3">
                            {(section.suggestions ?? []).map((s, i) => (
                              <li
                                key={i}
                                className="text-xs text-gray-700 flex items-start gap-1.5"
                              >
                                <span className="text-gray-400">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200 flex-wrap">
                      <Button
                        variant="secondary"
                        onClick={() => handleExport(record)}
                        className="flex-1 min-w-[140px]"
                      >
                        <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t.history?.exportBtn || "Exportar"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:bg-red-50 border-red-200 min-w-[140px]"
                      >
                        <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t.history?.deleteBtn || "Eliminar"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
