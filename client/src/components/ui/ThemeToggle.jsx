import { HiMoon, HiSun } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import { so } from '../../i18n/so';
import { cn } from '../../utils/cn';

export default function ThemeToggle({ className }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? so.a11y.lightMode : so.a11y.darkMode}
      title={isDark ? so.a11y.lightMode : so.a11y.darkMode}
      onClick={toggleTheme}
      className={cn(
        'relative h-9 w-[3.75rem] shrink-0 rounded-full border border-line/80 bg-forest-light p-1 transition duration-300',
        'hover:border-forest/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
        className
      )}
    >
      <span
        className={cn(
          'absolute top-1 left-1 grid size-7 place-items-center rounded-full bg-paper text-clay shadow-sm transition duration-300',
          isDark && 'translate-x-[1.7rem] bg-paper text-forest'
        )}
      >
        {isDark ? <HiMoon className="size-4" /> : <HiSun className="size-4" />}
      </span>
      <span className="sr-only">{so.a11y.toggleTheme}</span>
    </button>
  );
}
