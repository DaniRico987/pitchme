import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE;
const RELEASE = import.meta.env.VITE_APP_VERSION || "dev";

export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log("[Sentry] DSN not configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance monitoring
    tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    // Session replay
    replaysSessionSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors from development
      if (ENVIRONMENT === "development") {
        console.log("[Sentry] Would send event:", event);
        return null;
      }

      // Filter out common noise
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignore network errors that are likely user connectivity issues
        if (
          error.message.includes("Network Error") ||
          error.message.includes("Failed to fetch") ||
          error.name === "AbortError"
        ) {
          return null;
        }

        // Ignore resize observer loop errors (common benign issue)
        if (error.message.includes("ResizeObserver loop")) {
          return null;
        }
      }

      return event;
    },
    // Add user context
    initialScope: {
      tags: {
        app: "pitchme",
      },
    },
  });

  console.log("[Sentry] Initialized for environment:", ENVIRONMENT);
}

// Helper to set user context after auth
export function setSentryUser(
  user: { id: string; email?: string } | null,
): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
}

// Helper to add breadcrumb
export function addBreadcrumb(
  category: string,
  message: string,
  level: Sentry.SeverityLevel = "info",
  data?: Record<string, unknown>,
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

// Helper to capture exception with context
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Helper to capture message
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
): void {
  Sentry.captureMessage(message, level);
}

// Helper to set tags
export function setTags(tags: Record<string, string>): void {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

// Helper to measure performance
export function startTransaction(
  name: string,
  op: string,
): Sentry.Span | undefined {
  return Sentry.startInactiveSpan({
    name,
    op,
  });
}
