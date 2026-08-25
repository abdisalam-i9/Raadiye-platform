import so from './so.json';
import en from './en.json';

export const DEFAULT_LOCALE = 'so';
export const LOCALES = ['so', 'en'];
export const LANG_STORAGE_KEY = 'raadiye-lang';
const LEGACY_LANG_STORAGE_KEY = 'baafiye-lang';

export const dictionaries = { so, en };

let currentLocale = DEFAULT_LOCALE;

export function normalizeLocale(value) {
  return value === 'en' ? 'en' : DEFAULT_LOCALE;
}

export function readStoredLocale() {
  try {
    return normalizeLocale(
      localStorage.getItem(LANG_STORAGE_KEY) || localStorage.getItem(LEGACY_LANG_STORAGE_KEY)
    );
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function applyLocale(locale) {
  currentLocale = normalizeLocale(locale);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLocale;
  }
  try {
    localStorage.setItem(LANG_STORAGE_KEY, currentLocale);
  } catch {
    /* ignore */
  }
  return currentLocale;
}

export function getLocale() {
  return currentLocale;
}

export function getT(locale = currentLocale) {
  return dictionaries[normalizeLocale(locale)] || dictionaries.so;
}

export function interpolate(template, vars = {}) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : ''
  );
}

if (typeof window !== 'undefined') {
  currentLocale = readStoredLocale();
  applyLocale(currentLocale);
}
