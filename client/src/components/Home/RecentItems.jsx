import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listingApi } from '../../services/api';
import ItemCard from './ItemCard';
import { ItemCardSkeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import Container from '../ui/Container';
import { so } from '../../i18n/so';
import { getListing } from '../../constants/listings';

export default function RecentItems({ kind = 'found' }) {
  const listing = getListing(kind);
  const isLost = kind === 'lost';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await listingApi(kind).list({ page: 1, limit: 6 });
      setItems(data.items || []);
    } catch {
      setError(true);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return (
    <section className="section-y">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-ink">
              {isLost
                ? 'Waxyaabihii ugu dambeeyay ee lumay'
                : 'Waxyaabihii ugu dambeeyay ee la helay'}
            </h2>
            <p className="mt-2 text-ink-soft">
              {isLost
                ? 'Haddii aad heshay shay, waxaa laga yaabaa in qofkii lahaa uu halkan soo gudbiyay.'
                : 'Waxaa laga yaabaa in waxa aad raadineyso uu halkan yaallo.'}
            </p>
          </div>
          <Button as={Link} to={listing.listPath} variant="ghost">
            Arag dhammaan
          </Button>
        </div>

        {error && (
          <div className="mt-8 surface p-6 text-center">
            <p className="text-ink-soft">{so.errors.recent}</p>
            <Button type="button" className="mt-4" onClick={fetchRecent}>
              Mar kale isku day
            </Button>
          </div>
        )}

        {!error && loading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ItemCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!error && !loading && !items.length && (
          <div className="mt-8">
            <EmptyState
              title={isLost ? so.empty.homeLostTitle : so.empty.homeItemsTitle}
              description={isLost ? so.empty.homeLostBody : so.empty.homeItemsBody}
              action={
                <Button as={Link} to={listing.postPath}>
                  {isLost ? so.actions.postLost : so.actions.postFound}
                </Button>
              }
            />
          </div>
        )}

        {!error && !loading && items.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} kind={kind} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
