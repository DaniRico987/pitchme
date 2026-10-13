import { useState, useId } from "react";
import { ArrowRight, ChevronDown, Search, Check, X } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { useLang } from "../../context/LangContext";
import type { AnalysisResult as AnalysisResultType } from "../../types";

// Type for the translation object structure used in KeywordGapSection
type TranslationKeywordGap = {
  title: string;
  matchLabel: string;
  missingLabel: string;
  matchingLabel: string;
  extraLabel: string;
  noMissing: string;
  noMatching: string;
  noExtra: string;
  statsLabel: string;
};

function KeywordTag({
  keyword,
  type,
}: {
  keyword: string;
  type: "missing" | "matching" | "extra";
}) {
  const styles = {
    missing: "bg-red-50 text-red-700 border-red-200",
    matching: "bg-green-50 text-green-700 border-green-200",
    extra: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const icons = {
    missing: <X className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />,
    matching: <Check className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />,
    extra: <Search className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />,
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles[type]}`}
    >
      {icons[type]}
      {keyword}
    </span>
  );
}

function KeywordGapSection({
  gap,
  t,
}: {
  gap: NonNullable<AnalysisResultType["keywordGap"]>;
  t: { analyze: { keywordGap: TranslationKeywordGap } };
}) {
  if (!gap) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
          <h3 className="text-base font-semibold text-gray-900">
            {t.analyze?.keywordGap?.title || "Análisis de Palabras Clave"}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            {gap.matchPercentage}%
          </p>
          <p className="text-xs text-gray-500">
            {t.analyze?.keywordGap?.matchLabel || "Coincidencia"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {/* Missing Keywords */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              aria-hidden="true"
            />
            <h4 className="font-medium text-red-700 text-sm">
              {t.analyze?.keywordGap?.missingLabel || "Faltantes"} (
              {gap.missing.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gap.missing.length === 0 ? (
              <p className="text-xs text-red-500">
                {t.analyze?.keywordGap?.noMissing ||
                  "¡Todas las keywords están presentes!"}
              </p>
            ) : (
              gap.missing
                .slice(0, 12)
                .map((kw, i) => (
                  <KeywordTag key={`${kw}-${i}`} keyword={kw} type="missing" />
                ))
            )}
          </div>
        </div>

        {/* Matching Keywords */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="w-1.5 h-1.5 rounded-full bg-green-500"
              aria-hidden="true"
            />
            <h4 className="font-medium text-green-700 text-sm">
              {t.analyze?.keywordGap?.matchingLabel || "Coincidentes"} (
              {gap.matching.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gap.matching.length === 0 ? (
              <p className="text-xs text-green-500">
                {t.analyze?.keywordGap?.noMatching || "Sin coincidencias"}
              </p>
            ) : (
              gap.matching
                .slice(0, 12)
                .map((kw, i) => (
                  <KeywordTag key={`${kw}-${i}`} keyword={kw} type="matching" />
                ))
            )}
          </div>
        </div>

        {/* Extra Keywords */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="w-1.5 h-1.5 rounded-full bg-blue-500"
              aria-hidden="true"
            />
            <h4 className="font-medium text-blue-700 text-sm">
              {t.analyze?.keywordGap?.extraLabel || "Adicionales en CV"} (
              {gap.extra.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gap.extra.length === 0 ? (
              <p className="text-xs text-blue-500">
                {t.analyze?.keywordGap?.noExtra || "Sin keywords adicionales"}
              </p>
            ) : (
              gap.extra
                .slice(0, 12)
                .map((kw, i) => (
                  <KeywordTag key={`${kw}-${i}`} keyword={kw} type="extra" />
                ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>
            {t.analyze?.keywordGap?.statsLabel || "Estadísticas"}:
          </strong>{" "}
          {gap.totalJobKeywords} keywords en la oferta · {gap.totalCVKeywords}{" "}
          keywords en tu CV ·{gap.matchPercentage}% de coincidencia
        </p>
      </div>
    </div>
  );
}

export function AnalysisResult({ result }: { result: AnalysisResultType }) {
  const [openSectionIndex, setOpenSectionIndex] = useState(0);
  const { t } = useLang();
  const rootId = useId();

  const scoreColorClass =
    result.score < 40
      ? "text-red-600"
      : result.score < 70
        ? "text-amber-500"
        : "text-green-600";

  const progressColorClass =
    result.score < 40
      ? "bg-red-600"
      : result.score < 70
        ? "bg-amber-500"
        : "bg-green-600";

  const normalizedScore = Math.max(0, Math.min(100, result.score));

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-gray-50 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div aria-live="polite" aria-atomic="true">
              <p
                className={`text-4xl md:text-5xl font-bold ${scoreColorClass}`}
                aria-label={`${normalizedScore} out of 100`}
              >
                {normalizedScore}
              </p>
              <div
                className="mt-3 h-1.5 w-full rounded-full bg-gray-200"
                role="progressbar"
                aria-valuenow={normalizedScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Match score"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-700 ${progressColorClass}`}
                  style={{ width: `${normalizedScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-base font-medium text-gray-900">
              {result.scoreLabel}
            </p>
            <p className="text-xs text-gray-500">{t.analyze.scoreLabel}</p>
          </div>
        </div>
      </div>

      {/* Keyword Gap Analysis Section */}
      {result.keywordGap && <KeywordGapSection gap={result.keywordGap} t={t} />}

      <div className="space-y-2" role="region" aria-label="Analysis sections">
        {(result.sections ?? []).map((section, index) => {
          const isOpen = openSectionIndex === index;
          const sectionId = `${rootId}-section-${index}`;
          const panelId = `${sectionId}-panel`;

          return (
            <div
              key={`${section.title}-${index}`}
              className="rounded-xl border border-gray-200"
            >
              <button
                id={sectionId}
                type="button"
                onClick={() => setOpenSectionIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-2">
                  <Badge type={section.type} />
                  <p className="font-medium text-gray-900 text-sm">
                    {section.title}
                  </p>
                </div>

                <ChevronDown
                  className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                  aria-hidden="true"
                />
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={sectionId}
                className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-80" : "max-h-0"}`}
              >
                <div className="px-3 pb-3">
                  <p className="text-xs text-gray-600">{section.summary}</p>

                  <ul className="mt-2 space-y-1.5">
                    {(section.suggestions ?? []).map(
                      (suggestion, suggestionIndex) => (
                        <li
                          key={`${section.title}-suggestion-${suggestionIndex}`}
                          className="flex items-start gap-1.5 text-xs text-gray-700"
                        >
                          <ArrowRight
                            size={12}
                            className="mt-0.5 shrink-0 text-gray-500"
                            aria-hidden="true"
                          />
                          <span>{suggestion}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
