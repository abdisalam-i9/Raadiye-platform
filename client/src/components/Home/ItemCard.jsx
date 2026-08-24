import { Link } from 'react-router-dom';
import { FaCalendar, FaMapPin } from 'react-icons/fa';
import { formatDate, getCategoryName } from '../../utils/helpers';
import { getItemDate, getListing } from '../../constants/listings';
import CategoryImage from '../ui/CategoryImage';
import StatusBadge from '../ui/StatusBadge';

export default function ItemCard({ item, kind = 'found' }) {
  const listing = getListing(kind);
  const location = [item.district, item.village].filter(Boolean).join(' • ');

  return (
    <Link
      to={`${listing.listPath}/${item._id}`}
      className="group flex flex-col overflow-hidden rounded-[1.15rem] border border-line bg-paper shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <CategoryImage
        item={item}
        alt={item.title}
        className="h-44 w-full"
      />

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-forest">
            {getCategoryName(item.category)}
          </span>
          <StatusBadge status={item.status} />
        </div>

        <h3 className="text-lg font-semibold leading-snug text-ink">{item.title}</h3>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <FaMapPin />
            {location || 'Muqdisho'}
          </span>
          <span className="inline-flex items-center gap-1">
            <FaCalendar />
            {formatDate(getItemDate(item))}
          </span>
        </div>

        <span className="mt-3 text-sm font-semibold text-forest group-hover:underline">
          Faahfaahin
        </span>
      </div>
    </Link>
  );
}
