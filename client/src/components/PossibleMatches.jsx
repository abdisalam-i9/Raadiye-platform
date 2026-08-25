import { useEffect, useState } from 'react';
import { listingApi } from '../services/api';
import { useI18n } from '../context/LanguageContext';
import ItemCard from './Home/ItemCard';
import { ItemCardSkeleton } from './ui/Skeleton';

export default function PossibleMatches({ itemId, kind }) {
  const { t } = useI18n();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await listingApi(kind).getMatches(itemId);
        if (!cancelled) setMatches(data.matches || []);
      } catch {
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [itemId, kind]);

  if (!loading && matches.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-ink">{t.match.title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{t.match.body}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [1, 2, 3].map((key) => <ItemCardSkeleton key={key} />)
          : matches.map((match) => (
              <div key={String(match.item._id)} className="relative">
                <ItemCard item={match.item} kind={match.kind} />
                <div className="pointer-events-none absolute left-3 top-14 flex flex-wrap gap-1">
                  <span className="rounded-full bg-paper/95 px-2 py-0.5 text-[11px] font-semibold text-forest shadow-sm">
                    {Math.round(match.score * 100)}% {t.match.score}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {[
                    match.reasons?.category && t.match.sameCategory,
                    match.reasons?.district && t.match.sameDistrict,
                    match.reasons?.title >= 0.5 && t.match.similarTitle,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            ))}
      </div>
    </section>
  );
}
