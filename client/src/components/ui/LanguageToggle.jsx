import { useI18n } from '../../context/LanguageContext';
import { cn } from '../../utils/cn';

export default function LanguageToggle({ className }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.a11y.toggleLang}
      className={cn(
        'inline-flex h-8 shrink-0 items-center rounded-full bg-cream/90 p-0.5 dark:bg-forest-light/70',
        className
      )}
    >
      {['so', 'en'].map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={cn(
              'min-w-[1.9rem] rounded-full px-2 py-1 text-[10px] font-bold tracking-wider transition',
              active
                ? 'bg-paper text-forest shadow-sm dark:bg-paper dark:text-forest'
                : 'text-muted hover:text-ink'
            )}
          >
            {t.language[code]}
          </button>
        );
      })}
    </div>
  );
}
