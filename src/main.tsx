import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { initSentry } from "./lib/sentry";
import "./index.css";
import App from "./App.tsx";

// Initialize Sentry as early as possible
initSentry();

// Register Service Worker for PWA (only in production or when SW is available)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { type: "module" })
      .then((registration) => {
        console.log("SW registered: ", registration.scope);
      })
      .catch((registrationError) => {
        console.warn("SW registration failed: ", registrationError);
      });
  });
}

// Wrap the app with Sentry Error Boundary
const rootElement = document.getElementById("root")!;

// Check if there's already a root (HMR case)
const root =
  (window as unknown as { __REACT_ROOT__?: ReturnType<typeof createRoot> })
    .__REACT_ROOT__ || createRoot(rootElement);
(
  window as unknown as { __REACT_ROOT__?: ReturnType<typeof createRoot> }
).__REACT_ROOT__ = root;

root.render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={SentryFallback}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);

// eslint-disable-next-line react-refresh/only-export-components
function SentryFallback({
  error,
  resetError,
}: {
  error: unknown;
  resetError: () => void;
  componentStack?: string;
  eventId?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Algo salió mal</h2>
          <p className="mt-2 text-gray-500">
            Ocurrió un error inesperado. Nuestro equipo ha sido notificado.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => resetError()}
            className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Intentar de nuevo
          </button>
          <details className="text-sm text-gray-500">
            <summary className="cursor-pointer mb-2">Detalles técnicos</summary>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 text-left">
              {(error as Error).message}
              {(error as Error).stack && `\n\n${(error as Error).stack}`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
