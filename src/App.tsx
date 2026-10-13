import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
// import Layout from "./components/layout/Layout"; // Not used with RouterProvider
import Home from "./pages/Home";
import { LangProvider } from "./context/LangContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Lazy load pages for code splitting
const Analyze = lazy(() => import("./pages/Analyze"));
const History = lazy(() => import("./pages/History"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4" />
        <p className="text-gray-500">Cargando...</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Public route wrapper (redirects authenticated users)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (user) {
    return <Navigate to="/analyze" replace />;
  }

  return <>{children}</>;
}

// Define routes using RouteObject for createBrowserRouter
const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/analyze",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <Analyze />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/history",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <History />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth",
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingFallback />}>
          <AuthPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: "/auth/callback",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AuthCallback />
      </Suspense>
    ),
  },
];

// Create router instance
const router = createBrowserRouter(routes);

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </LangProvider>
  );
}

export default App;

// Auth page component (inline for simplicity)
import { useState } from "react";
import { useLang } from "./context/LangContext";
import { Button } from "./components/ui/Button";
import { useToast } from "./context/ToastContext";
import { Mail } from "lucide-react";

function AuthPage() {
  const [email, setEmail] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useLang();
  const { showToast } = useToast();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const { error } = isSignUp ? await signUp(email) : await signIn(email);

    if (error) {
      showToast("error", error.message);
    } else {
      showToast(
        "success",
        isSignUp
          ? "Revisa tu email para confirmar tu cuenta"
          : "Revisa tu email para iniciar sesión",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isSignUp
              ? t.auth?.signUpTitle || "Crear cuenta"
              : t.auth?.signInTitle || "Iniciar sesión"}
          </h1>
          <p className="mt-2 text-gray-500">
            {isSignUp
              ? t.auth?.signUpSubtitle ||
                "Ingresa tu email para crear una cuenta"
              : t.auth?.signInSubtitle || "Ingresa tu email para acceder"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t.auth?.emailLabel || "Email"}
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!email.trim()}>
            {isSignUp
              ? t.auth?.signUpBtn || "Crear cuenta"
              : t.auth?.signInBtn || "Iniciar sesión"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isSignUp
            ? t.auth?.hasAccount || "¿Ya tienes cuenta?"
            : t.auth?.noAccount || "¿No tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-black font-medium hover:underline"
          >
            {isSignUp
              ? t.auth?.signInLink || "Inicia sesión"
              : t.auth?.signUpLink || "Regístrate"}
          </button>
        </p>
      </div>
    </div>
  );
}
