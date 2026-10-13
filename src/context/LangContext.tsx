import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { translations, type Lang } from "../lib/i18n";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (typeof translations)[Lang];
};

const LangContext = createContext<LangContextValue | undefined>(undefined);

const STORAGE_KEY = "pitchme-lang";

function getStoredLang(): Lang | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") {
      return stored;
    }
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === "es" || browserLang === "en") {
      return browserLang;
    }
  }
  return null;
}

type LangProviderProps = {
  children: ReactNode;
};

export function LangProvider({ children }: LangProviderProps) {
  // Initialize with default, will be overridden by effect if needed
  const [lang, setLangState] = useState<Lang>("es");
  const initialLangRef = useRef<Lang | null>(null);

  // Initialize from localStorage/browser on mount (client only)
  useEffect(() => {
    const stored = getStoredLang();
    if (stored !== null && stored !== lang) {
      setLangState(stored);
    }
    initialLangRef.current = lang;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage and update document lang when lang changes
  useEffect(() => {
    if (initialLangRef.current !== null) {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
    initialLangRef.current = lang;
  }, [lang]);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
  };

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: translations[lang],
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const context = useContext(LangContext);

  if (!context) {
    throw new Error("useLang must be used within a LangProvider.");
  }

  return context;
}
