import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import { listingApi } from '../services/api';
import { useI18n } from '../context/LanguageContext';
import { getErrorMessage } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import Textarea from './ui/Textarea';

export default function ClaimPanel({
  kind,
  itemId,
  isOwner,
  isAuthenticated,
  isOpen,
  item,
  myClaim,
  claims,
  onRefresh,
}) {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await listingApi(kind).createClaim(itemId, { description });
      setDescription('');
      showToast(t.claim.sent);
      await onRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, t.errors.generic), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (claimId, status) => {
    setReviewing(claimId + status);
    try {
      await listingApi(kind).reviewClaim(itemId, claimId, status);
      showToast(status === 'accepted' ? t.claim.statusAccepted : t.claim.statusRejected);
      await onRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, t.errors.generic), 'error');
    } finally {
      setReviewing('');
    }
  };

  if (isOwner) {
    return (
      <div className="mt-8 rounded-[1.35rem] border border-forest/20 bg-paper p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-forest-light text-forest">
            <HiOutlineShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-ink">{t.claim.ownerTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-ink-soft">{t.claim.ownerBody}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-cream/90 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t.claim.yourMarks}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
            {item.identifyingMarks || t.claim.emptyMarks}
          </p>
        </div>

        {claims.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{t.claim.none}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {claims.map((claim) => (
              <li key={claim.id} className="rounded-2xl border border-line/70 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{claim.claimant?.name || t.chat.you}</p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-forest">
                    {claim.status === 'accepted'
                      ? t.claim.statusAccepted
                      : claim.status === 'rejected'
                        ? t.claim.statusRejected
                        : t.claim.statusPending}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{claim.description}</p>
                {claim.status === 'pending' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      loading={reviewing === `${claim.id}accepted`}
                      onClick={() => handleReview(claim.id, 'accepted')}
                    >
                      {t.claim.accept}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      loading={reviewing === `${claim.id}rejected`}
                      onClick={() => handleReview(claim.id, 'rejected')}
                    >
                      {t.claim.reject}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-8 rounded-[1.35rem] border border-line/70 bg-cream/70 p-5">
        <h2 className="text-lg font-semibold text-ink">{t.claim.title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{t.claim.body}</p>
        {item.hasMarks && <p className="mt-2 text-sm text-forest">{t.detail.hasMarks}</p>}
        <Button as={Link} to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="mt-4">
          {t.claim.login}
        </Button>
      </div>
    );
  }

  if (myClaim?.status === 'accepted') {
    return (
      <p className="mt-6 rounded-2xl bg-ok-light px-4 py-3 text-sm text-ok">{t.claim.accepted}</p>
    );
  }

  if (myClaim?.status === 'pending') {
    return (
      <div className="mt-8 rounded-[1.35rem] border border-forest/20 bg-forest-light/50 p-5">
        <h2 className="text-lg font-semibold text-ink">{t.claim.title}</h2>
        <p className="mt-2 text-sm text-ink-soft">{t.claim.pending}</p>
        <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-paper px-4 py-3 text-sm text-ink">
          {myClaim.description}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-[1.35rem] border border-line/70 bg-paper p-5">
      <h2 className="text-lg font-semibold text-ink">{t.claim.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{t.claim.body}</p>
      {item.hasMarks && <p className="mt-2 text-sm font-medium text-forest">{t.detail.hasMarks}</p>}
      <Textarea
        className="mt-4"
        name="claimDescription"
        rows={4}
        maxLength={400}
        required
        minLength={12}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder={t.claim.placeholder}
      />
      {myClaim?.status === 'rejected' && (
        <p className="mt-3 text-sm text-clay">{t.claim.rejected}</p>
      )}
      <Button type="submit" className="mt-4" loading={loading}>
        {loading ? t.claim.submitting : t.claim.submit}
      </Button>
    </form>
  );
}
