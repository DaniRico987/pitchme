import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useLang } from "../context/LangContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { showToast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          showToast(
            "success",
            t.auth?.callbackSuccess || "Sesión iniciada correctamente",
          );
          navigate("/analyze", { replace: true });
        } else {
          showToast(
            "error",
            t.auth?.callbackError || "Error al iniciar sesión",
          );
          navigate("/auth", { replace: true });
        }
      } catch {
        showToast("error", t.auth?.callbackError || "Error al iniciar sesión");
        navigate("/auth", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, t, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2
          className="h-12 w-12 animate-spin text-black mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-gray-500">
          {t.auth?.checkingAuth || "Verificando sesión..."}
        </p>
      </div>
    </div>
  );
}

export default AuthCallback;
