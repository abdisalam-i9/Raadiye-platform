import { Link } from 'react-router-dom';
import ItemCard from './ItemCard';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { useI18n } from '../../context/LanguageContext';
import { getListing } from '../../constants/listings';

export default function ItemsGrid({ items = [], emptyAction, kind = 'found' }) {
  const { t } = useI18n();
  const listing = getListing(kind);

  if (!items.length) {
    return (
      <EmptyState
        title={t.empty.itemsTitle}
        description={t.empty.itemsBody}
        action={
          emptyAction || (
            <Button as={Link} to={listing.postPath}>
              {kind === 'lost' ? t.actions.postLost : t.actions.postFound}
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item._id} item={item} kind={kind} />
      ))}
    </div>
  );
}
