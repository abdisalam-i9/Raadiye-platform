import { Link } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import { useI18n } from '../context/LanguageContext';
import { cn } from '../utils/cn';

export default function Brand({ onClick, compact = false, light = false }) {
  const { t } = useI18n();
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2 no-underline',
        light ? 'text-white' : 'text-ink'
      )}
    >
      <span
        className={cn(
          'relative grid size-8 place-items-center rounded-[0.7rem] transition duration-200 group-hover:scale-[1.04]',
          light
            ? 'bg-white text-forest shadow-sm'
            : 'bg-gradient-to-br from-forest to-forest-dark text-white shadow-[0_8px_18px_rgb(15_122_98_/_0.28)]'
        )}
        aria-hidden="true"
      >
        <HiOutlineSearch className="size-4" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-semibold tracking-tight',
            compact ? 'text-lg' : 'text-xl'
          )}
        >
          {t.brand}
        </span>
      </span>
    </Link>
  );
}
