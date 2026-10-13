import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
};

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-xl font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-sm gap-1.5"
      : size === "lg"
        ? "px-6 py-3.5 text-lg gap-2"
        : "px-4 py-2.5 text-base gap-2";

  const variantClasses =
    variant === "primary"
      ? "bg-black text-white hover:bg-gray-800"
      : variant === "secondary"
        ? "bg-white text-black border border-gray-200 hover:bg-gray-50"
        : variant === "ghost"
          ? "text-gray-700 hover:bg-gray-100"
          : "border border-gray-200 bg-white text-black hover:bg-gray-50";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
