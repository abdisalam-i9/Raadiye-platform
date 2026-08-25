import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineBell,
  HiOutlineChat,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineCollection,
  HiOutlineExclamationCircle,
  HiOutlineLocationMarker,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { api } from '../services/api';
import { useI18n } from '../context/LanguageContext';
import { getErrorMessage } from '../utils/helpers';
import { cn } from '../utils/cn';
import { usePageTitle } from '../hooks/usePageTitle';
import Container from '../components/ui/Container';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Skeleton from '../components/ui/Skeleton';

const TONES = {
  forest: 'bg-forest-light text-forest',
  clay: 'bg-clay-light text-clay',
  info: 'bg-info-light text-info',
  ok: 'bg-ok-light text-ok',
};

function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface p-5">
            <Skeleton className="size-10 rounded-2xl" />
            <Skeleton className="mt-4 h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-6 h-3 w-full rounded-full" />
          <Skeleton className="mt-6 h-24 w-full" />
        </div>
        <div className="surface p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-6 h-3 w-full rounded-full" />
          <Skeleton className="mt-6 h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, hint, tone = 'forest', to }) {
  const content = (
    <>
      <span className={cn('grid size-11 place-items-center rounded-2xl', TONES[tone])}>
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="surface card-hover block p-5">
        {content}
      </Link>
    );
  }

  return <div className="surface p-5">{content}</div>;
}

function Section({ title, description, children }) {
  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function PipelineCard({ title, href, counts, t, tone }) {
  const total = counts.total || 0;
  const pending = counts.pending || 0;
  const matched = counts.matched || 0;
  const closed = counts.closed || 0;
  const returned = counts.returned || 0;
  const expired = counts.expired || 0;
  const cancelled = counts.cancelled || 0;
  const recovered = percent(returned, total);

  return (
    <div className="surface p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-ink">{title}</h3>
          <p className="mt-1 text-sm text-muted">
            {total} {t.dashboard.totalListings}
          </p>
        </div>
        <Button as={Link} to={href} variant="ghost" size="sm">
          {t.actions.view}
        </Button>
      </div>

      {total ? (
        <>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-cream">
            <div
              className="bg-forest"
              style={{ width: `${percent(pending, total)}%` }}
              title={t.track.pending}
            />
            <div
              className="bg-info"
              style={{ width: `${percent(matched, total)}%` }}
              title={t.track.matched}
            />
            <div
              className="bg-line"
              style={{ width: `${percent(closed, total)}%` }}
              title={t.track.closed}
            />
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-forest-light/70 px-2 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t.track.pending}
              </dt>
              <dd className="mt-1 font-display text-2xl text-ink">{pending}</dd>
            </div>
            <div className="rounded-2xl bg-info-light px-2 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t.track.matched}
              </dt>
              <dd className="mt-1 font-display text-2xl text-ink">{matched}</dd>
            </div>
            <div className="rounded-2xl bg-cream px-2 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t.track.closed}
              </dt>
              <dd className="mt-1 font-display text-2xl text-ink">{closed}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4 text-sm">
            <p className="text-ink-soft">
              {t.status.returned} {returned}
              <span className="mx-2 text-line">·</span>
              {t.status.expired} {expired}
              <span className="mx-2 text-line">·</span>
              {t.status.cancelled} {cancelled}
            </p>
            <p className={cn('font-semibold', tone === 'clay' ? 'text-clay' : 'text-forest')}>
              {recovered}% {t.dashboard.recoveryRate}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-6 rounded-2xl bg-cream px-4 py-8 text-center text-sm text-muted">
          {t.dashboard.noData}
        </p>
      )}
    </div>
  );
}

function Bars({ rows, emptyLabel, accent = 'bg-forest' }) {
  if (!rows?.length) {
    return <p className="rounded-2xl bg-cream px-4 py-8 text-center text-sm text-muted">{emptyLabel}</p>;
  }

  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.name}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate font-medium text-ink">{row.name}</span>
            <span className="shrink-0 tabular-nums text-muted">{row.count}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-cream">
            <div
              className={cn('h-full rounded-full', accent)}
              style={{ width: `${Math.max(percent(row.count, max), 6)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Fact({ icon: Icon, label, value, tone = 'forest' }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-cream/80 px-4 py-3">
      <span className={cn('grid size-9 place-items-center rounded-xl', TONES[tone])}>
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="font-display text-xl text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  usePageTitle(t.meta.dashboard);

  const loadStats = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await api.admin.stats();
      setStats(data.stats);
    } catch (err) {
      setError(getErrorMessage(err));
      if (!silent) setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const openListings = (stats?.found.open || 0) + (stats?.lost.open || 0);
  const matched = (stats?.found.matched || 0) + (stats?.lost.matched || 0);
  const returned = (stats?.found.returned || 0) + (stats?.lost.returned || 0);
  const listingTotal = (stats?.found.total || 0) + (stats?.lost.total || 0);
  const pendingClaims = stats?.claims?.pending || 0;

  return (
    <Container className="py-8 sm:py-12">
      <PageHeader
        eyebrow={t.nav.admin}
        title={t.dashboard.title}
        description={t.dashboard.body}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => loadStats({ silent: true })}
              disabled={refreshing}
            >
              <HiOutlineRefresh className={cn('size-4', refreshing && 'animate-spin')} />
              {t.dashboard.refresh}
            </Button>
            <Button as={Link} to="/admin/categories" variant="outline">
              {t.dashboard.manageCategories}
            </Button>
          </div>
        }
      />

      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              icon={HiOutlineUsers}
              label={t.dashboard.users}
              value={stats.users.total}
              hint={`${stats.users.new7d} ${t.dashboard.newThisWeek}`}
              tone="forest"
            />
            <KpiCard
              icon={HiOutlineClipboardList}
              label={t.dashboard.openListings}
              value={openListings}
              hint={`${stats.found.open} ${t.browse.kindFound} · ${stats.lost.open} ${t.browse.kindLost}`}
              tone="clay"
              to="/items"
            />
            <KpiCard
              icon={HiOutlineSearch}
              label={t.dashboard.matched}
              value={matched}
              hint={t.dashboard.matchedHint}
              tone="info"
            />
            <KpiCard
              icon={HiOutlineCheckCircle}
              label={t.dashboard.returned}
              value={returned}
              hint={`${percent(returned, listingTotal)}% ${t.dashboard.recoveryRate}`}
              tone="ok"
            />
            <KpiCard
              icon={HiOutlineShieldCheck}
              label={t.dashboard.pendingClaims}
              value={pendingClaims}
              hint={t.dashboard.pendingClaimsHint}
              tone="clay"
            />
          </div>

          <Section title={t.dashboard.pipeline} description={t.dashboard.pipelineBody}>
            <div className="grid gap-6 lg:grid-cols-2">
              <PipelineCard
                title={t.browse.kindFound}
                href="/items?kind=found"
                counts={stats.found}
                t={t}
                tone="forest"
              />
              <PipelineCard
                title={t.browse.kindLost}
                href="/items?kind=lost"
                counts={stats.lost}
                t={t}
                tone="clay"
              />
            </div>
          </Section>

          <Section title={t.dashboard.community} description={t.dashboard.communityBody}>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="surface p-6">
                <h3 className="font-semibold text-ink">{t.dashboard.users}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Fact
                    icon={HiOutlineCheckCircle}
                    label={t.dashboard.verified}
                    value={stats.users.verified}
                    tone="ok"
                  />
                  <Fact
                    icon={HiOutlineShieldCheck}
                    label={t.dashboard.pendingClaims}
                    value={pendingClaims}
                    tone="clay"
                  />
                  <Fact
                    icon={HiOutlineUsers}
                    label={t.dashboard.newUsers}
                    value={stats.users.new7d}
                    tone="forest"
                  />
                </div>
              </div>

              <div className="surface p-6">
                <h3 className="font-semibold text-ink">{t.dashboard.activity}</h3>
                <div className="mt-4 grid gap-3">
                  <Fact icon={HiOutlineChat} label={t.dashboard.chats} value={stats.chats} tone="forest" />
                  <Fact
                    icon={HiOutlineBell}
                    label={t.dashboard.notifications}
                    value={stats.notifications}
                    tone="info"
                  />
                  <Fact
                    icon={HiOutlineCollection}
                    label={t.dashboard.categoriesCount}
                    value={stats.categories}
                    tone="clay"
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section title={t.dashboard.geography} description={t.dashboard.geographyBody}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="surface p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-forest-light text-forest">
                    <HiOutlineLocationMarker className="size-4" />
                  </span>
                  <h3 className="font-semibold text-ink">{t.dashboard.foundDistricts}</h3>
                </div>
                <Bars rows={stats.districts.found} emptyLabel={t.dashboard.noData} />
              </div>
              <div className="surface p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-clay-light text-clay">
                    <HiOutlineExclamationCircle className="size-4" />
                  </span>
                  <h3 className="font-semibold text-ink">{t.dashboard.lostDistricts}</h3>
                </div>
                <Bars rows={stats.districts.lost} emptyLabel={t.dashboard.noData} accent="bg-clay" />
              </div>
            </div>
          </Section>

          <Section title={t.dashboard.whatPeoplePost} description={t.dashboard.whatPeoplePostBody}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="surface p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-forest-light text-forest">
                    <HiOutlineTag className="size-4" />
                  </span>
                  <h3 className="font-semibold text-ink">{t.dashboard.foundCategories}</h3>
                </div>
                <Bars rows={stats.topCategories.found} emptyLabel={t.dashboard.noData} />
              </div>
              <div className="surface p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-clay-light text-clay">
                    <HiOutlineTag className="size-4" />
                  </span>
                  <h3 className="font-semibold text-ink">{t.dashboard.lostCategories}</h3>
                </div>
                <Bars rows={stats.topCategories.lost} emptyLabel={t.dashboard.noData} accent="bg-clay" />
              </div>
            </div>
          </Section>
        </>
      ) : null}
    </Container>
  );
}
