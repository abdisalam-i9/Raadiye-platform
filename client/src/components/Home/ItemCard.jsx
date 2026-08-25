import { Link } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlineLocationMarker } from 'react-icons/hi';
import { formatDate, getCategoryName } from '../../utils/helpers';
import { getItemDate, getListing } from '../../constants/listings';
import { useI18n } from '../../context/LanguageContext';
import ItemImage from '../ui/ItemImage';
import StatusBadge from '../ui/StatusBadge';

export default function ItemCard({ item, kind = 'found' }) {
  const { t } = useI18n();
  const resolvedKind = item.kind || kind;
  const listing = getListing(resolvedKind);
  const location = [item.district, item.village].filter(Boolean).join(' • ');

  return (
    <Link
      to={`${listing.listPath}/${item._id}`}
      className="surface card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <ItemImage
          item={item}
          alt={item.title}
          className="h-48 w-full transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${
              resolvedKind === 'lost' ? 'bg-clay-light text-clay' : 'bg-forest-light text-forest'
            }`}
          >
            {resolvedKind === 'lost' ? t.browse.kindLost : t.browse.kindFound}
          </span>
          <span className="rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-semibold text-forest shadow-sm backdrop-blur">
            {getCategoryName(item.category)}
          </span>
        </div>
        <div className="absolute right-3 top-3">
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="text-lg font-semibold leading-snug text-ink">{item.title}</h3>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-muted">
          <span className="inline-flex min-w-0 items-center gap-1">
            <HiOutlineLocationMarker className="size-3.5 shrink-0" />
            <span className="truncate">{location || t.common.mogadishu}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <HiOutlineCalendar className="size-3.5" />
            {formatDate(getItemDate(item))}
          </span>
        </div>

        <span className="mt-4 inline-flex w-fit items-center rounded-full bg-forest-light px-3 py-1.5 text-sm font-semibold text-forest transition group-hover:bg-forest group-hover:text-white">
          {t.common.details}
        </span>
      </div>
    </Link>
  );
}
