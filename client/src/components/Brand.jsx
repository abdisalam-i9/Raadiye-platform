import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';
import { so } from '../i18n/so';
import { cn } from '../utils/cn';

export default function Brand({ onClick, compact = false, light = false }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 no-underline transition hover:opacity-90',
        light ? 'text-paper' : 'text-ink'
      )}
    >
      <span
        className={cn(
          'grid size-9 place-items-center rounded-2xl shadow-sm',
          light ? 'bg-paper text-forest' : 'bg-forest text-paper'
        )}
        aria-hidden="true"
      >
        <HiOutlineHeart className="size-5" />
      </span>
      <span
        className={cn(
          'font-display font-semibold tracking-tight',
          compact ? 'text-xl' : 'text-[1.35rem]'
        )}
      >
        {so.brand}
      </span>
    </Link>
  );
}
