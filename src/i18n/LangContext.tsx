import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { TRANSLATIONS, loadLang, saveLang } from './translations';
import type { LangCode, Translations } from './translations';

interface LangContextValue {
  lang: LangCode;
  tr: Translations;
  setLang: (lang: LangCode) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  tr: TRANSLATIONS.en,
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(loadLang);

  const setLang = useCallback((newLang: LangCode) => {
    saveLang(newLang);
    setLangState(newLang);
  }, []);

  return (
    <LangContext.Provider value={{ lang, tr: TRANSLATIONS[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
