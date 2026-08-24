import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';
import { listingApi } from '../services/api';
import { DISTRICTS } from '../constants/locations';
import { getItemDate, getListing } from '../constants/listings';
import { so } from '../i18n/so';
import { formatDate, getCategoryName, getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import CategoryImage from '../components/ui/CategoryImage';
import StatusBadge from '../components/ui/StatusBadge';
import ContactFounder from '../components/ui/ContactFounder';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { ConfirmModal } from '../components/ui/Modal';
import { DetailSkeleton } from '../components/ui/Skeleton';
import Container from '../components/ui/Container';

export default function ItemDetail({ kind = 'found' }) {
  const listing = getListing(kind);
  const isLost = kind === 'lost';
  const dateField = listing.dateField;
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { categories } = useCategories();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmReturned, setConfirmReturned] = useState(false);
  const [form, setForm] = useState({});

  usePageTitle(item ? `${item.title} — Baafiye` : 'Baafiye');

  const fetchItem = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await listingApi(kind).getById(id);
      setItem(data.item);
      setForm({
        title: data.item.title,
        category: data.item.category?._id || data.item.category,
        district: data.item.district,
        village: data.item.village,
        [dateField]: data.item[dateField]?.slice(0, 10),
        contactPhone: data.item.contactPhone,
      });
    } catch {
      setError(true);
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id, kind, dateField]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const isOwner =
    isAuthenticated &&
    item &&
    String(item.postedBy?._id || item.postedBy) === String(user?.id);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setActionLoading(true);

    try {
      const data = await listingApi(kind).update(id, form);
      setItem(data.item);
      setEditing(false);
      showToast('Shayga waa la cusboonaysiiyay');
    } catch (err) {
      showToast(getErrorMessage(err, so.errors.generic), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await listingApi(kind).delete(id);
      showToast('Shayga waa laga saaray raadinta');
      navigate(isLost ? '/my-items?tab=lost' : '/my-items');
    } catch (err) {
      showToast(getErrorMessage(err, so.errors.generic), 'error');
    } finally {
      setActionLoading(false);
      setConfirmCancel(false);
    }
  };

  const handleMarkReturned = async () => {
    setActionLoading(true);
    try {
      const data = await listingApi(kind).markReturned(id);
      setItem(data.item);
      showToast(
        isLost ? 'Shayga waxaa loo calaamadeeyay in la helay' : 'Shayga waxaa loo calaamadeeyay in la celiyay'
      );
    } catch (err) {
      showToast(getErrorMessage(err, so.errors.generic), 'error');
    } finally {
      setActionLoading(false);
      setConfirmReturned(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-12">
        <DetailSkeleton />
      </Container>
    );
  }

  if (error || !item) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-ink">{so.errors.notFoundTitle}</h1>
        <p className="mx-auto mt-3 text-ink-soft">{so.errors.notFoundBody}</p>
        <Button as={Link} to={listing.listPath} className="mt-6">
          {isLost ? so.detail.backLost : so.detail.back}
        </Button>
      </Container>
    );
  }

  const isActive = item.status === 'active';
  const statusCopy = {
    active: isLost ? so.detail.lostActive : so.detail.active,
    returned: isLost ? so.detail.lostReturned : so.detail.returned,
    expired: so.detail.expired,
    cancelled: so.detail.cancelled,
  };

  return (
    <Container className="py-8 sm:py-12">
      <nav className="mb-6 hidden text-sm text-muted md:block" aria-label="Jidka bogga">
        <Link to="/" className="hover:text-forest">
          {so.nav.home}
        </Link>
        <span className="mx-2">/</span>
        <Link to={listing.listPath} className="hover:text-forest">
          {isLost ? so.nav.lostItems : so.nav.items}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{item.title}</span>
      </nav>

      <Button as={Link} to={listing.listPath} variant="ghost" size="sm" className="mb-6">
        ← {isLost ? so.detail.backLost : so.detail.back}
      </Button>

      <div className="surface overflow-hidden lg:grid lg:grid-cols-[1fr_1.1fr]">
        <CategoryImage item={item} alt={item.title} className="h-72 w-full lg:h-full lg:min-h-[420px]" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-forest-light px-3 py-1 text-xs font-semibold text-forest">
              {getCategoryName(item.category)}
            </span>
            <StatusBadge status={item.status} />
          </div>

          <h1 className="mt-4 text-ink">{item.title}</h1>
          <p className="mt-2 text-sm font-medium text-forest">
            {statusCopy[item.status] || statusCopy.active}
          </p>

          {!editing ? (
            <>
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <Info label={so.detail.category} value={getCategoryName(item.category)} />
                <Info label={so.detail.district} value={item.district} />
                <Info label={so.detail.village} value={item.village} />
                <Info
                  label={isLost ? so.detail.lostDate : so.detail.foundDate}
                  value={formatDate(getItemDate(item))}
                />
              </dl>

              {isActive && (
                <div className="mt-8">
                  <ContactFounder phone={item.contactPhone} kind={kind} />
                </div>
              )}

              {!isActive && (
                <p className="mt-8 rounded-xl bg-cream px-4 py-3 text-sm text-ink-soft">
                  Shaygan hadda lama heli karo, sidaas darteed lambarka xiriirka lama muujinayo.
                </p>
              )}

              {isOwner && (
                <div className="mt-8 rounded-[1.35rem] border border-line/70 bg-cream/80 p-4">
                  <p className="text-sm font-semibold text-ink">{so.detail.ownerNote}</p>
                  {isActive && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                        {so.actions.edit}
                      </Button>
                      <Button type="button" onClick={() => setConfirmReturned(true)}>
                        {isLost ? so.actions.markFound : so.actions.markReturned}
                      </Button>
                      <Button type="button" variant="danger" onClick={() => setConfirmCancel(true)}>
                        {so.actions.cancel}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              <Input
                label={so.post.title}
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <Select
                label={so.detail.category}
                value={form.category || ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              <Select
                label={so.detail.district}
                value={form.district || ''}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                required
              >
                {DISTRICTS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
              <Input
                label={so.detail.village}
                value={form.village || ''}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                required
              />
              <Input
                label={isLost ? so.detail.lostDate : so.detail.foundDate}
                type="date"
                value={form[dateField] || ''}
                onChange={(e) => setForm({ ...form, [dateField]: e.target.value })}
                required
              />
              <Input
                label={so.post.phone}
                value={form.contactPhone || ''}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                required
              />
              <p className="text-xs leading-5 text-muted">{so.detail.privacy}</p>
              <div className="flex gap-3">
                <Button type="submit" loading={actionLoading}>
                  Kaydi
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Ka noqo
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleDelete}
        danger
        loading={actionLoading}
        title="Ma hubtaa inaad rabto inaad ka saarto shaygan?"
        description="Ficilkan wuxuu ka dhigayaa shayga mid aan dadku ka raadin karin."
        confirmLabel="Haa, ka saar"
        cancelLabel="Ka noqo"
      />

      <ConfirmModal
        open={confirmReturned}
        onClose={() => setConfirmReturned(false)}
        onConfirm={handleMarkReturned}
        loading={actionLoading}
        title={isLost ? 'Shaygan ma la helay?' : 'Shaygan ma la siiyay qofkii lahaa?'}
        description="Haddii aad calaamadaysid, shaygan kama soo muuqan doono raadinta dadweynaha."
        confirmLabel={isLost ? 'Haa, waa la helay' : 'Haa, waa la celiyay'}
        cancelLabel="Maya"
      />
    </Container>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-cream/90 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}
