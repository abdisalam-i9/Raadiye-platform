import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listingApi } from '../../services/api';
import ItemCard from './ItemCard';
import { ItemCardSkeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import Container from '../ui/Container';
import { useI18n } from '../../context/LanguageContext';
import { getListing } from '../../constants/listings';

export default function RecentItems({ kind = 'found' }) {
  const { t } = useI18n();
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
            <h2 className="text-ink">{isLost ? t.recent.lostTitle : t.recent.foundTitle}</h2>
            <p className="mt-2 text-ink-soft">{isLost ? t.recent.lostBody : t.recent.foundBody}</p>
          </div>
          <Button as={Link} to={isLost ? '/items?kind=lost' : '/items'} variant="ghost">
            {t.recent.viewAll}
          </Button>
        </div>

        {error && (
          <div className="mt-8 surface p-6 text-center">
            <p className="text-ink-soft">{t.errors.recent}</p>
            <Button type="button" className="mt-4" onClick={fetchRecent}>
              {t.common.retry}
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
              title={isLost ? t.empty.homeLostTitle : t.empty.homeItemsTitle}
              description={isLost ? t.empty.homeLostBody : t.empty.homeItemsBody}
              action={
                <Button as={Link} to={listing.postPath}>
                  {t.browse.add}
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
