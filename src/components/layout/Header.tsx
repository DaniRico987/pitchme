import { Link } from "react-router-dom";
import { useLang } from "../../context/LangContext";

export function Header() {
  const { lang, setLang } = useLang();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-gray-900"
        >
          Pitchme
        </Link>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="mr-3 rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>

          <Link
            to="/analyze"
            className="rounded-full bg-black px-4 py-1.5 text-sm text-white transition hover:bg-gray-800"
          >
            Analizar CV
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
