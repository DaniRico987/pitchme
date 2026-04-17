import { useLang } from "../../context/LangContext";

type BadgeType = "critical" | "improve" | "good";

type BadgeProps = {
  type: BadgeType;
  label?: string;
};

const typeClasses: Record<BadgeType, string> = {
  critical: "bg-red-50 text-red-700 border border-red-200",
  improve: "bg-amber-50 text-amber-700 border border-amber-200",
  good: "bg-green-50 text-green-700 border border-green-200",
};

export function Badge({ type, label }: BadgeProps) {
  const { t } = useLang();

  const defaultLabels: Record<BadgeType, string> = {
    critical: t.badges.critical,
    improve: t.badges.improve,
    good: t.badges.good,
  };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeClasses[type]}`}
    >
      {label ?? defaultLabels[type]}
    </span>
  );
}
