import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, Upload, Loader2, AlertCircle } from "lucide-react";
import { useLang } from "../../context/LangContext";
import { usePdfExtractor } from "../../hooks/usePdfExtractor";

type UploadZoneProps = {
  onFileProcessed: (text: string) => void;
  isLoading: boolean;
};

export function UploadZone({ onFileProcessed, isLoading }: UploadZoneProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const {
    extractText,
    isExtracting,
    progress,
    error: workerError,
  } = usePdfExtractor();
  const { t } = useLang();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || isLoading || isExtracting) {
        return;
      }

      // Validate file type
      if (file.type !== "application/pdf") {
        setExtractError(
          t.upload.errors?.invalidType || "Only PDF files are allowed",
        );
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setExtractError(
          t.upload.errors?.tooLarge || "File size must be less than 10MB",
        );
        return;
      }

      setExtractError(null);
      setFileName(file.name);

      try {
        const extractedText = await extractText(file);

        if (!extractedText.trim()) {
          setExtractError(
            t.upload.errors?.emptyPdf ||
              "Could not extract text from PDF. The file may be scanned or password-protected.",
          );
          return;
        }

        onFileProcessed(extractedText);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unknown error during PDF extraction";
        setExtractError(message);
      }
    },
    [isLoading, isExtracting, onFileProcessed, extractText, t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isLoading || isExtracting,
  });

  const activeClasses = isDragActive ? "border-black bg-gray-50" : "";
  const disabledClasses =
    isLoading || isExtracting ? "opacity-60 cursor-not-allowed" : "";

  const displayError = extractError || workerError;

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed border-gray-200 rounded-xl p-5 md:p-6 text-center cursor-pointer transition ${activeClasses} ${disabledClasses}`.trim()}
      role="button"
      tabIndex={0}
      aria-label={t.upload.drag}
      aria-disabled={isLoading || isExtracting}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-2.5">
        {isExtracting ? (
          <>
            <Loader2
              className="h-5 w-5 text-gray-700 animate-spin"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-gray-900">
              {t.upload.extracting || "Extracting text..."}
            </p>
            <div className="w-full max-w-xs mt-1">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="PDF extraction progress"
                />
              </div>
              <p className="text-xs text-gray-500 mt-0.5 text-right">
                {progress}%
              </p>
            </div>
          </>
        ) : displayError ? (
          <>
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            <p className="text-sm font-medium text-red-600">
              {t.upload.error || "Error processing PDF"}
            </p>
            <p className="text-xs text-red-500 text-center max-w-sm">
              {displayError}
            </p>
            <button
              type="button"
              onClick={() => setFileName(null)}
              className="mt-1.5 text-xs text-gray-600 hover:text-gray-900 underline"
            >
              {t.upload.tryAgain || "Try again"}
            </button>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-gray-700" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-900">{t.upload.drag}</p>
            <p className="text-xs text-gray-500">{t.upload.sub}</p>
          </>
        )}

        {fileName && !isExtracting && !displayError && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            <span className="truncate max-w-[200px]">{fileName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
