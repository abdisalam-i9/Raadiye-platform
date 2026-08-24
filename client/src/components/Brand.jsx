import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';
import { so } from '../i18n/so';

export default function Brand({ onClick, compact = false }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="flex items-center gap-2.5 text-ink no-underline hover:text-ink"
    >
      <span
        className="grid size-9 place-items-center rounded-xl bg-forest text-paper"
        aria-hidden="true"
      >
        <HiOutlineHeart className="size-5" />
      </span>
      <span className={compact ? 'font-display text-xl font-semibold' : 'font-display text-[1.35rem] font-semibold tracking-tight'}>
        {so.brand}
      </span>
    </Link>
  );
}
