import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useI18n } from '../context/LanguageContext';
import { formatDate, getErrorMessage, resolveImageUrl } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import ItemCard from '../components/Home/ItemCard';
import Button from '../components/ui/Button';
import { DetailSkeleton } from '../components/ui/Skeleton';

export default function PublicProfile() {
  const { t } = useI18n();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState({ found: [], lost: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  usePageTitle(profile?.name ? `${profile.name} ${t.meta.itemSuffix}` : t.meta.profile);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.users
      .getById(id)
      .then((data) => {
        if (cancelled) return;
        setProfile(data.user);
        setListings({
          found: data.listings?.found || [],
          lost: data.listings?.lost || [],
        });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Container className="py-12">
        <DetailSkeleton />
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-ink">{t.errors.notFoundTitle}</h1>
        <p className="mt-3 text-ink-soft">{getErrorMessage(null, t.profile.missing)}</p>
        <Button as={Link} to="/" className="mt-6">
          {t.actions.backHome}
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="flex items-start gap-4">
        {profile.avatar ? (
          <img
            src={resolveImageUrl(profile.avatar)}
            alt=""
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <div className="grid size-20 place-items-center rounded-full bg-forest text-xl font-bold text-white">
            {(profile.name || '?').slice(0, 1)}
          </div>
        )}
        <PageHeader
          title={profile.name}
          description={profile.bio || t.profile.noBio}
        />
      </div>
      <p className="mt-2 text-sm text-muted">
        {profile.district ? `${profile.district} · ` : ''}
        {t.profile.memberSince} {formatDate(profile.createdAt)}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl text-ink">{t.nav.items}</h2>
          <div className="mt-4 grid gap-4">
            {listings.found.map((item) => (
              <ItemCard key={item._id} item={item} kind="found" />
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink">{t.nav.lostItems}</h2>
          <div className="mt-4 grid gap-4">
            {listings.lost.map((item) => (
              <ItemCard key={item._id} item={item} kind="lost" />
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
}
