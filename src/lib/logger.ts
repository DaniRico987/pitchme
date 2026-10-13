import { captureException, addBreadcrumb, setTags } from "./sentry";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
    setTags(this.context as Record<string, string>);
  }

  clearContext(): void {
    this.context = {};
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const fullContext = { ...this.context, ...context };
    const timestamp = new Date().toISOString();

    // Console output with formatting
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const logMessage = `${prefix} ${message}`;

    switch (level) {
      case "debug":
        console.debug(logMessage, fullContext);
        break;
      case "info":
        console.info(logMessage, fullContext);
        break;
      case "warn":
        console.warn(logMessage, fullContext);
        break;
      case "error":
        console.error(logMessage, fullContext);
        break;
    }

    // Add breadcrumb for non-debug levels
    if (level !== "debug") {
      addBreadcrumb(
        "app",
        message,
        level === "error" ? "error" : "info",
        fullContext,
      );
    }

    // Send to Sentry for error level
    if (level === "error") {
      const error =
        context?.error instanceof Error ? context.error : new Error(message);
      captureException(error, fullContext);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log("error", message, { ...context, error });
  }

  // Specific methods for common operations
  apiRequest(
    method: string,
    url: string,
    status?: number,
    duration?: number,
  ): void {
    this.info(`API ${method} ${url}`, {
      method,
      url,
      status,
      duration: duration ? `${duration}ms` : undefined,
      type: "api_request",
    });
  }

  apiError(method: string, url: string, error: Error, status?: number): void {
    this.error(`API ${method} ${url} failed`, error, {
      method,
      url,
      status,
      type: "api_error",
    });
  }

  userAction(action: string, details?: LogContext): void {
    this.info(`User action: ${action}`, { ...details, type: "user_action" });
  }

  performance(operation: string, duration: number, success: boolean): void {
    this.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      success,
      type: "performance",
    });
  }

  businessEvent(event: string, data?: LogContext): void {
    this.info(`Business event: ${event}`, { ...data, type: "business_event" });
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports
export const { debug, info, warn, error } = logger;

// Helper to create child logger with additional context
export function createChildLogger(baseContext: LogContext): typeof logger {
  const child = new Logger();
  child.setContext(baseContext);
  return child;
}
