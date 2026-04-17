import {
  createContext,
  useContext,
  useMemo,
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

type LangProviderProps = {
  children: ReactNode;
};

export function LangProvider({ children }: LangProviderProps) {
  const [lang, setLang] = useState<Lang>("es");

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: translations[lang],
    }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const context = useContext(LangContext);

  if (!context) {
    throw new Error("useLang must be used within a LangProvider.");
  }

  return context;
}
