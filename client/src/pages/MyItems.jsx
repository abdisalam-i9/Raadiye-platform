import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, listingApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { so } from '../i18n/so';
import { getListing, getItemDate } from '../constants/listings';
import {
  formatDate,
  getCategoryName,
  getErrorMessage,
} from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import { ItemCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import CategoryImage from '../components/ui/CategoryImage';
import { ConfirmModal } from '../components/ui/Modal';
import { cn } from '../utils/cn';

const TABS = [
  { id: 'found', label: so.nav.items },
  { id: 'lost', label: so.nav.lostItems },
];

export default function MyItems() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'lost' ? 'lost' : 'found');
  const [foundItems, setFoundItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');
  const [confirm, setConfirm] = useState(null);
  const { showToast } = useToast();

  usePageTitle('Alaabtayda — Baafiye');

  const listing = getListing(tab);
  const items = tab === 'lost' ? lostItems : foundItems;
  const isLost = tab === 'lost';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [foundData, lostData] = await Promise.all([
        api.items.myItems(),
        api.lostItems.myItems(),
      ]);
      setFoundItems(foundData.items || []);
      setLostItems(lostData.items || []);
    } catch (err) {
      setError(getErrorMessage(err, so.errors.generic));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const setItemsForTab = (kind, updater) => {
    if (kind === 'lost') setLostItems(updater);
    else setFoundItems(updater);
  };

  const handleDelete = async () => {
    if (!confirm) return;
    const { id, kind } = confirm;
    setActionId(id);
    try {
      await listingApi(kind).delete(id);
      setItemsForTab(kind, (current) => current.filter((item) => item._id !== id));
      showToast('Shayga waa laga saaray raadinta');
    } catch (err) {
      showToast(getErrorMessage(err, so.errors.generic), 'error');
    } finally {
      setActionId('');
      setConfirm(null);
    }
  };

  const handleMarkReturned = async (id, kind) => {
    setActionId(id);
    try {
      const data = await listingApi(kind).markReturned(id);
      setItemsForTab(kind, (current) =>
        current.map((item) => (item._id === id ? data.item : item))
      );
      showToast(
        kind === 'lost'
          ? 'Shayga waxaa loo calaamadeeyay in la helay'
          : 'Shayga waxaa loo calaamadeeyay in la celiyay'
      );
    } catch (err) {
      showToast(getErrorMessage(err, so.errors.generic), 'error');
    } finally {
      setActionId('');
    }
  };

  if (loading) {
    return (
      <Container className="py-10 sm:py-14">
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <ItemCardSkeleton key={index} />
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        title={so.nav.myItems}
        description={so.empty.myItemsBody}
        action={
          <div className="flex flex-wrap gap-2">
            <Button as={Link} to="/post-item" size="sm">
              {so.actions.postFound}
            </Button>
            <Button as={Link} to="/post-lost" variant="outline" size="sm">
              {so.actions.postLost}
            </Button>
          </div>
        }
      />

      <div className="mb-8 flex gap-1 rounded-2xl border border-line bg-cream p-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
              tab === item.id ? 'bg-paper text-forest shadow-sm' : 'text-ink-soft hover:text-ink'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-6 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {!items.length ? (
        <EmptyState
          title={isLost ? so.empty.myLostTitle : so.empty.myItemsTitle}
          description={isLost ? so.empty.myLostBody : so.empty.myItemsBody}
          action={
            <Button as={Link} to={listing.postPath}>
              {isLost ? so.actions.postLost : so.actions.postFound}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6">
          {items.map((item) => (
            <article
              key={item._id}
              className="surface overflow-hidden sm:flex"
            >
              <CategoryImage
                item={item}
                alt={item.title}
                className="h-48 w-full sm:h-auto sm:w-56"
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-forest-light px-3 py-1 text-xs font-semibold text-forest">
                    {getCategoryName(item.category)}
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                <h2 className="mt-3 text-xl font-semibold text-ink">{item.title}</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  {item.district}, {item.village} · {formatDate(getItemDate(item))}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {item.status === 'active' ? (
                    <>
                      <Button as={Link} to={`${listing.listPath}/${item._id}`} variant="outline" size="sm">
                        {so.actions.view}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={actionId === item._id}
                        onClick={() => handleMarkReturned(item._id, tab)}
                      >
                        {isLost ? so.actions.markFound : so.actions.markReturned}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={actionId === item._id}
                        onClick={() => setConfirm({ id: item._id, kind: tab })}
                      >
                        {so.actions.cancel}
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted">
                      Shaygan hadda kama soo muuqanayo raadinta dadweynaha.
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        danger
        loading={Boolean(actionId)}
        title="Ma hubtaa inaad rabto inaad ka saarto shaygan?"
        description="Ficilkan wuxuu ka dhigayaa shayga mid aan dadku ka raadin karin."
        confirmLabel="Haa, ka saar"
        cancelLabel="Ka noqo"
      />
    </Container>
  );
}
