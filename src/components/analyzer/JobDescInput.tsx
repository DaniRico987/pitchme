import { useId } from "react";
import { useLang } from "../../context/LangContext";

type JobDescInputProps = {
  value: string;
  onChange: (value: string) => void;
  jobTitle: string;
  onJobTitleChange: (value: string) => void;
  isLoading: boolean;
};

export function JobDescInput({
  value,
  onChange,
  jobTitle,
  onJobTitleChange,
  isLoading,
}: JobDescInputProps) {
  const { t } = useLang();
  const jobTitleId = useId();
  const jobDescId = useId();
  const counterId = useId();

  const counterColorClass =
    value.length < 100 ? "text-gray-400" : "text-gray-600";

  return (
    <div className="space-y-2.5">
      <label htmlFor={jobTitleId} className="sr-only">
        {t.analyze.jobTitlePlaceholder}
      </label>
      <input
        id={jobTitleId}
        type="text"
        value={jobTitle}
        onChange={(event) => onJobTitleChange(event.target.value)}
        placeholder={t.analyze.jobTitlePlaceholder}
        disabled={isLoading}
        aria-describedby={counterId}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
      />

      <label htmlFor={jobDescId} className="sr-only">
        {t.analyze.jobDescPlaceholder}
      </label>
      <textarea
        id={jobDescId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.analyze.jobDescPlaceholder}
        disabled={isLoading}
        aria-describedby={counterId}
        className="w-full min-h-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-y"
      />

      <p
        id={counterId}
        className={`text-xs text-right ${counterColorClass}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {value.length} / 30000
      </p>
    </div>
  );
}
