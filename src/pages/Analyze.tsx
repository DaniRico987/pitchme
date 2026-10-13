import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalyzer } from "../hooks/useAnalyzer";
import { UploadZone } from "../components/analyzer/UploadZone";
import { JobDescInput } from "../components/analyzer/JobDescInput";
import { AnalysisResult } from "../components/analyzer/AnalysisResult";
import { Button } from "../components/ui/Button";
import { useLang } from "../context/LangContext";
import { FileText, ClipboardList, Sparkles, Loader2 } from "lucide-react";

export function Analyze() {
  const navigate = useNavigate();
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

  const steps = [
    {
      icon: FileText,
      title: t.analyze.step1Title,
      desc: t.analyze.step1Desc,
      completed: cvText.length > 0,
    },
    {
      icon: ClipboardList,
      title: t.analyze.step2Title,
      desc: t.analyze.step2Desc,
      completed: jobDescription.length >= 50 && jobTitle.length > 0,
    },
    {
      icon: Sparkles,
      title: t.analyze.step3Title,
      desc: t.analyze.step3Desc,
      completed: !!result,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header - Compact with Home Link */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-2 rounded-xl hover:bg-gray-100 transition"
              aria-label="Volver al inicio"
            >
              <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {t.analyze.title}
              </h1>
              <p className="text-gray-500 text-sm">{t.analyze.subtitle}</p>
            </div>
          </div>
        </header>

        {/* Progress Steps - Compact */}
        <div className="mb-6 hidden md:flex items-center gap-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : index === 0 &&
                          !cvText.length &&
                          !jobDescription.length &&
                          !jobTitle.length
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.completed ? (
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={`text-xs font-medium ${step.completed ? "text-green-700" : "text-gray-600"}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-gray-400">{step.desc}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 bg-gray-200 ml-3 mr-3"
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile Progress - Compact */}
        <div className="mb-4 md:hidden">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 transition-all ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : index === 0 &&
                          !cvText.length &&
                          !jobDescription.length &&
                          !jobTitle.length
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.completed ? (
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <p
                  className={`text-[10px] text-center ${step.completed ? "text-green-700" : "text-gray-500"}`}
                >
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="lg:sticky lg:top-20">
            <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
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
                  className="w-full cursor-pointer py-2.5 text-base"
                  onClick={() =>
                    analyze(cvText, jobDescription, jobTitle, lang)
                  }
                  disabled={isAnalyzeDisabled}
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      {t.analyze.analyzing}
                    </>
                  ) : (
                    t.analyze.analyzeBtn
                  )}
                </Button>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                    <span className="mt-0.5" role="img" aria-label="error">
                      ⚠️
                    </span>
                    <span>{error}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div>
            {result ? (
              <AnalysisResult result={result} />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 h-full min-h-[400px] flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                    <FileText
                      className="h-8 w-8 text-gray-300"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {t.analyze.emptyStateTitle}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm text-sm">
                    {t.analyze.emptyStateDesc}
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-400">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50">
                      <FileText className="h-4 w-4" />
                      <span>{t.analyze.step1Title}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50">
                      <ClipboardList className="h-4 w-4" />
                      <span>{t.analyze.step2Title}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50">
                      <Sparkles className="h-4 w-4" />
                      <span>{t.analyze.step3Title}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analyze;
