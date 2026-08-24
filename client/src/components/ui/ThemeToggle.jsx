import { HiMoon, HiSun } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/LanguageContext';
import { cn } from '../../utils/cn';

export default function ThemeToggle({ className }) {
  const { t } = useI18n();
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? t.a11y.lightMode : t.a11y.darkMode}
      title={isDark ? t.a11y.lightMode : t.a11y.darkMode}
      onClick={toggleTheme}
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition duration-200',
        'hover:bg-forest-light hover:text-forest',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
        className
      )}
    >
      {isDark ? <HiSun className="size-[1.15rem]" /> : <HiMoon className="size-[1.15rem]" />}
      <span className="sr-only">{t.a11y.toggleTheme}</span>
    </button>
  );
}
