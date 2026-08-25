import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HiOutlineChat } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../context/CategoriesContext';
import { useToast } from '../context/ToastContext';
import { api, listingApi } from '../services/api';
import { DISTRICTS } from '../constants/locations';
import { getItemDate, getListing } from '../constants/listings';
import { useI18n } from '../context/LanguageContext';
import { formatDate, getCategoryName, getErrorMessage } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import ItemImage from '../components/ui/ItemImage';
import ImageUpload from '../components/ui/ImageUpload';
import StatusBadge from '../components/ui/StatusBadge';
import ContactFounder from '../components/ui/ContactFounder';
import PossibleMatches from '../components/PossibleMatches';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { ConfirmModal } from '../components/ui/Modal';
import { DetailSkeleton } from '../components/ui/Skeleton';
import Container from '../components/ui/Container';

export default function ItemDetail({ kind = 'found' }) {
  const { t } = useI18n();
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
  const [imageFile, setImageFile] = useState(null);
  const [chatStarting, setChatStarting] = useState(false);

  usePageTitle(item ? `${item.title} ${t.meta.itemSuffix}` : t.meta.itemFallback);

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
      let payload = form;
      if (imageFile) {
        payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          payload.append(key, value ?? '');
        });
        payload.append('image', imageFile);
      }

      const data = await listingApi(kind).update(id, payload);
      setItem(data.item);
      setEditing(false);
      setImageFile(null);
      showToast(t.item.updated);
    } catch (err) {
      showToast(getErrorMessage(err, t.errors.generic), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await listingApi(kind).delete(id);
      showToast(t.item.removed);
      navigate(isLost ? '/my-items?tab=lost' : '/my-items');
    } catch (err) {
      showToast(getErrorMessage(err, t.errors.generic), 'error');
    } finally {
      setActionLoading(false);
      setConfirmCancel(false);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`${listing.listPath}/${id}`)}`);
      return;
    }

    setChatStarting(true);
    try {
      const data = await api.chats.start({ itemId: id, itemKind: kind });
      navigate(`/chats/${data.chat.id}`);
    } catch (err) {
      showToast(getErrorMessage(err, t.chat.error), 'error');
    } finally {
      setChatStarting(false);
    }
  };

  const handleMarkReturned = async () => {
    setActionLoading(true);
    try {
      const data = await listingApi(kind).markReturned(id);
      setItem(data.item);
      showToast(isLost ? t.myItems.markedFound : t.myItems.markedReturned);
    } catch (err) {
      showToast(getErrorMessage(err, t.errors.generic), 'error');
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
        <h1 className="text-ink">{t.errors.notFoundTitle}</h1>
        <p className="mx-auto mt-3 text-ink-soft">{t.errors.notFoundBody}</p>
        <Button as={Link} to={listing.listPath} className="mt-6">
          {isLost ? t.detail.backLost : t.detail.back}
        </Button>
      </Container>
    );
  }

  const isActive = item.status === 'active';
  const statusCopy = {
    active: isLost ? t.detail.lostActive : t.detail.active,
    returned: isLost ? t.detail.lostReturned : t.detail.returned,
    expired: t.detail.expired,
    cancelled: t.detail.cancelled,
  };

  return (
    <Container className="py-8 sm:py-12">
      <nav className="mb-6 hidden text-sm text-muted md:block" aria-label={t.a11y.breadcrumb}>
        <Link to="/" className="hover:text-forest">
          {t.nav.home}
        </Link>
        <span className="mx-2">/</span>
        <Link to={listing.listPath} className="hover:text-forest">
          {isLost ? t.nav.lostItems : t.nav.items}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{item.title}</span>
      </nav>

      <Button as={Link} to={listing.listPath} variant="ghost" size="sm" className="mb-6">
        ← {isLost ? t.detail.backLost : t.detail.back}
      </Button>

      <div className="surface overflow-hidden lg:grid lg:grid-cols-[1fr_1.1fr]">
        <ItemImage item={item} alt={item.title} className="h-72 w-full lg:h-full lg:min-h-[420px]" />

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
                <Info label={t.detail.category} value={getCategoryName(item.category)} />
                <Info label={t.detail.district} value={item.district} />
                <Info label={t.detail.village} value={item.village} />
                <Info
                  label={isLost ? t.detail.lostDate : t.detail.foundDate}
                  value={formatDate(getItemDate(item))}
                />
              </dl>

              {isActive && (
                <div className="mt-8">
                  <ContactFounder phone={item.contactPhone} kind={kind} />
                  {!isOwner && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      loading={chatStarting}
                      onClick={handleStartChat}
                    >
                      <HiOutlineChat className="size-4" />
                      {isAuthenticated ? t.chat.start : t.chat.loginToChat}
                    </Button>
                  )}
                </div>
              )}

              {!isActive && (
                <p className="mt-8 rounded-xl bg-cream px-4 py-3 text-sm text-ink-soft">
                  {t.item.inactiveNote}
                </p>
              )}

              {isOwner && (
                <div className="mt-8 rounded-[1.35rem] border border-line/70 bg-cream/80 p-4">
                  <p className="text-sm font-semibold text-ink">{t.detail.ownerNote}</p>
                  {isActive && (
                    <p className="mt-2 text-sm text-ink-soft">
                      {t.chat.ownItem}{' '}
                      <Link to="/chats" className="font-semibold text-forest hover:underline">
                        {t.nav.chats}
                      </Link>
                    </p>
                  )}
                  {isActive && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                        {t.actions.edit}
                      </Button>
                      <Button type="button" onClick={() => setConfirmReturned(true)}>
                        {isLost ? t.actions.markFound : t.actions.markReturned}
                      </Button>
                      <Button type="button" variant="danger" onClick={() => setConfirmCancel(true)}>
                        {t.actions.cancel}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              <Input
                label={t.post.title}
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <Select
                label={t.detail.category}
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
                label={t.detail.district}
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
                label={t.detail.village}
                value={form.village || ''}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                required
              />
              <Input
                label={isLost ? t.detail.lostDate : t.detail.foundDate}
                type="date"
                value={form[dateField] || ''}
                onChange={(e) => setForm({ ...form, [dateField]: e.target.value })}
                required
              />
              <Input
                label={t.post.phone}
                value={form.contactPhone || ''}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                required
              />
              <ImageUpload
                file={imageFile}
                existingUrl={item.image}
                onFileChange={setImageFile}
              />
              <p className="text-xs leading-5 text-muted">{t.detail.privacy}</p>
              <div className="flex gap-3">
                <Button type="submit" loading={actionLoading}>
                  {t.common.save}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setEditing(false); setImageFile(null); }}>
                  {t.common.dismiss}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {!editing && isActive && <PossibleMatches itemId={id} kind={kind} />}

      <ConfirmModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleDelete}
        danger
        loading={actionLoading}
        title={t.item.confirmRemoveTitle}
        description={t.item.confirmRemoveBody}
        confirmLabel={t.item.confirmRemove}
        cancelLabel={t.common.dismiss}
      />

      <ConfirmModal
        open={confirmReturned}
        onClose={() => setConfirmReturned(false)}
        onConfirm={handleMarkReturned}
        loading={actionLoading}
        title={isLost ? t.item.confirmFoundTitle : t.item.confirmReturnedTitle}
        description={t.item.confirmStatusBody}
        confirmLabel={isLost ? t.item.confirmFound : t.item.confirmReturned}
        cancelLabel={t.common.no}
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
