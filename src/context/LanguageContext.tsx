import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useProgress } from '../context/ProgressContext';
import { t, type TranslationKeys } from '../i18n/translations';
import type { Locale } from '../types';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  tr: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { progress, updateSettings } = useProgress();
  const locale = progress.settings.locale;

  const setLocale = useCallback(
    (newLocale: Locale) => updateSettings({ locale: newLocale }),
    [updateSettings],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, tr: t(locale) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
