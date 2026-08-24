import { Link } from 'react-router-dom';
import ItemCard from './ItemCard';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { so } from '../../i18n/so';
import { getListing } from '../../constants/listings';

export default function ItemsGrid({ items = [], emptyAction, kind = 'found' }) {
  const listing = getListing(kind);

  if (!items.length) {
    return (
      <EmptyState
        title={so.empty.itemsTitle}
        description={so.empty.itemsBody}
        action={
          emptyAction || (
            <Button as={Link} to={listing.postPath}>
              {kind === 'lost' ? so.actions.postLost : so.actions.postFound}
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
