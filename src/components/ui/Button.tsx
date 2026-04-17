import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit";
};

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
}: ButtonProps) {
  const baseClasses =
    "w-full rounded-xl py-3 font-medium transition disabled:opacity-40 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "primary"
      ? "bg-black text-white hover:bg-gray-800"
      : "bg-white text-black border border-gray-200 hover:bg-gray-50";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
