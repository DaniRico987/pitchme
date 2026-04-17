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
  const counterColorClass =
    value.length < 100 ? "text-gray-400" : "text-gray-600";

  return (
    <div>
      <input
        type="text"
        value={jobTitle}
        onChange={(event) => onJobTitleChange(event.target.value)}
        placeholder="Nombre del cargo — ej: Desarrollador Frontend"
        disabled={isLoading}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 mb-3"
      />

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pega aquí la descripción completa de la oferta..."
        disabled={isLoading}
        className="w-full min-h-48 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none"
      />

      <p className={`text-xs text-right mt-1 ${counterColorClass}`}>
        {value.length}
      </p>
    </div>
  );
}
