import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  applyLocale,
  getT,
  normalizeLocale,
  readStoredLocale,
} from '../i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() =>
    typeof window === 'undefined' ? DEFAULT_LOCALE : readStoredLocale()
  );

  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next) => {
    setLocaleState(normalizeLocale(next));
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === 'en' ? 'so' : 'en'));
  }, []);

  const t = useMemo(() => getT(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      t,
      setLocale,
      toggleLocale,
      isSomali: locale === 'so',
    }),
    [locale, t, setLocale, toggleLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within LanguageProvider');
  }
  return context;
}
