import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  // Translations passed from wrapper
  somethingWentWrong?: string;
  unexpectedError?: string;
  tryAgain?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const {
        somethingWentWrong = "Something went wrong",
        unexpectedError = "An unexpected error occurred",
        tryAgain = "Try again",
      } = this.props;

      return (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
          role="alert"
        >
          <AlertTriangle
            className="h-12 w-12 text-red-500 mx-auto mb-4"
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {somethingWentWrong}
          </h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || unexpectedError}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {tryAgain}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper that provides translations
import { useLang } from "../../context/LangContext";

export function ErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { t } = useLang();

  return (
    <ErrorBoundaryInner
      somethingWentWrong={t.errors?.somethingWentWrong}
      unexpectedError={t.errors?.unexpectedError}
      tryAgain={t.errors?.tryAgain}
      fallback={fallback}
    >
      {children}
    </ErrorBoundaryInner>
  );
}
