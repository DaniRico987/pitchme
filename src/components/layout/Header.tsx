import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../../context/LangContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { lang, setLang, t } = useLang();
  const { user, signOut, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    showToast("success", "Sesión cerrada");
    navigate("/");
  };

  const navLinks = [
    { path: "/analyze", label: t.nav.analyze },
    {
      path: "/history",
      label:
        (t.nav as { analyze: string; history?: string }).history ?? "History",
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-gray-900"
          aria-label={t.nav.analyze}
        >
          Pitchme
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex md:items-center md:gap-4"
          aria-label="Navegación principal"
        >
          {!loading && user ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="rounded-full bg-black px-4 py-1.5 text-sm text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {link.label}
                </Link>
              ))}

              {/* User Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span className="truncate max-w-[150px]">
                    {user?.email || "Usuario"}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-black px-4 py-1.5 text-sm text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {t.nav.analyze}
            </Link>
          )}
        </nav>

        {/* Language Toggle */}
        <button
          type="button"
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          aria-pressed={lang === "en"}
          aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}
          className="mr-3 rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-500 transition hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {lang === "es" ? "EN" : "ES"}
        </button>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-gray-100 bg-white py-4 px-4 animate-slide-in"
        >
          <nav className="flex flex-col gap-2" aria-label="Navegación móvil">
            {!loading && user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-black px-4 py-3 text-center text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500 px-2 mb-2">
                    {user?.email}
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 rounded-xl hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-black px-4 py-3 text-center text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {t.nav.analyze}
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Language Toggle in Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <button
            type="button"
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            aria-pressed={lang === "en"}
            aria-label={
              lang === "es" ? "Switch to English" : "Cambiar a español"
            }
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
