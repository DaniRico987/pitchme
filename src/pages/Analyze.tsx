import { useEffect, useState } from "react";
import { useAnalyzer } from "../hooks/useAnalyzer";
import { UploadZone } from "../components/analyzer/UploadZone";
import { JobDescInput } from "../components/analyzer/JobDescInput";
import { AnalysisResult } from "../components/analyzer/AnalysisResult";
import { Button } from "../components/ui/Button";
import { useLang } from "../context/LangContext";

export function Analyze() {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const { isLoading, error, result, analyze, resetResult } = useAnalyzer();
  const { t, lang } = useLang();

  useEffect(() => {
    resetResult();
  }, [lang, resetResult]);

  const isAnalyzeDisabled =
    cvText.trim().length === 0 ||
    jobDescription.trim().length < 50 ||
    jobTitle.trim().length === 0 ||
    isLoading;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          {t.analyze.title}
        </h2>

        <div className="space-y-4">
          <UploadZone onFileProcessed={setCvText} isLoading={isLoading} />

          <JobDescInput
            value={jobDescription}
            onChange={setJobDescription}
            jobTitle={jobTitle}
            onJobTitleChange={setJobTitle}
            isLoading={isLoading}
          />

          <Button
            className="cursor-pointer"
            onClick={() => analyze(cvText, jobDescription, jobTitle, lang)}
            disabled={isAnalyzeDisabled}
          >
            {t.analyze.analyzeBtn}
          </Button>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-gray-400">{t.analyze.analyzing}</p>
          ) : null}
        </div>
      </div>

      <div>
        {result ? (
          <AnalysisResult result={result} />
        ) : (
          <div className="h-full min-h-80 rounded-2xl bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400">{t.analyze.emptyState}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analyze;
