import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useMemo,
  useRef,
} from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useLang } from "./LangContext";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastType, ReactNode> = {
  success: (
    <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
  ),
  error: <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />,
  warning: (
    <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />
  ),
  info: <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />,
};

const BG_CLASSES: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-amber-50 border-amber-200",
  info: "bg-blue-50 border-blue-200",
};

const TEXT_CLASSES: Record<ToastType, string> = {
  success: "text-green-800",
  error: "text-red-800",
  warning: "text-amber-800",
  info: "text-blue-800",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = ++toastIdRef.current;
      const toast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    [],
  );

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({ toasts, showToast, hideToast }),
    [toasts, showToast, hideToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: number) => void;
}) {
  const { t } = useLang();

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] max-w-md animate-slide-in ${BG_CLASSES[toast.type]}`}
          role="alert"
        >
          {ICONS[toast.type]}
          <p
            className={`flex-1 text-sm font-medium ${TEXT_CLASSES[toast.type]}`}
          >
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => onClose(toast.id)}
            className="shrink-0 p-1 rounded hover:bg-black/10 transition focus:outline-none focus:ring-2 focus:ring-current"
            aria-label={t.toast?.close || "Close"}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
