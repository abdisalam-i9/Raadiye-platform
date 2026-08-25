import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { HiAdjustments, HiPlus, HiX } from 'react-icons/hi';
import ItemsGrid from './ItemsGrid';
import { ItemCardSkeleton } from '../ui/Skeleton';
import Pagination from '../ui/Pagination';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import PageHeader from '../ui/PageHeader';
import Container from '../ui/Container';
import PostItem from '../../pages/PostItem';
import { useAuth } from '../../context/AuthContext';
import { useCategories } from '../../context/CategoriesContext';
import { useDebounce } from '../../hooks/useDebounce';
import { listingApi } from '../../services/api';
import { DISTRICTS } from '../../constants/locations';
import { itemPath } from '../../constants/listings';
import { useI18n } from '../../context/LanguageContext';
import { cn } from '../../utils/cn';

function readKind(value) {
  if (value === 'lost' || value === 'found') return value;
  return 'all';
}

export default function BrowseSection() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const kindFilter = readKind(params.get('kind'));
  const addOpen = params.get('add') === '1';
  const urlSearch = params.get('search') || '';
  const category = params.get('category') || '';
  const district = params.get('district') || '';
  const urlVillage = params.get('village') || '';
  const dateFrom = params.get('dateFrom') || '';
  const dateTo = params.get('dateTo') || '';
  const status = params.get('status') || '';
  const page = Math.max(Number(params.get('page')) || 1, 1);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [villageInput, setVillageInput] = useState(urlVillage);
  const debouncedSearch = useDebounce(searchInput);
  const debouncedVillage = useDebounce(villageInput);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const hasFilters = Boolean(urlSearch || category || district || urlVillage || dateFrom || dateTo || status);
  const postKind = kindFilter === 'lost' ? 'lost' : 'found';

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setVillageInput(urlVillage);
  }, [urlVillage]);

  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (debouncedSearch) next.set('search', debouncedSearch);
      else next.delete('search');
      next.delete('page');
      return next;
    });
  }, [debouncedSearch, urlSearch, setParams]);

  useEffect(() => {
    if (debouncedVillage === urlVillage) return;
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (debouncedVillage) next.set('village', debouncedVillage);
      else next.delete('village');
      next.delete('page');
      return next;
    });
  }, [debouncedVillage, urlVillage, setParams]);

  const setFilter = (key, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      return next;
    });
  };

  const setKind = (nextKind) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (nextKind === 'all') next.delete('kind');
      else next.set('kind', nextKind);
      next.delete('page');
      return next;
    });
  };

  const setPage = (nextPage) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (nextPage > 1) next.set('page', String(nextPage));
      else next.delete('page');
      return next;
    });
  };

  const toggleAdd = (open) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (open) next.set('add', '1');
      else next.delete('add');
      return next;
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setVillageInput('');
    setParams((current) => {
      const next = new URLSearchParams();
      const kind = current.get('kind');
      if (kind === 'found' || kind === 'lost') next.set('kind', kind);
      if (current.get('add') === '1') next.set('add', '1');
      return next;
    });
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(false);
    const query = {
      search: urlSearch || undefined,
      category: category || undefined,
      district: district || undefined,
      village: urlVillage || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: status || undefined,
      page,
      limit: 12,
    };

    try {
      if (kindFilter === 'all') {
        const [foundData, lostData] = await Promise.all([
          listingApi('found').list({ ...query, page: 1, limit: 50 }),
          listingApi('lost').list({ ...query, page: 1, limit: 50 }),
        ]);
        const merged = [
          ...(foundData.items || []).map((item) => ({ ...item, kind: 'found' })),
          ...(lostData.items || []).map((item) => ({ ...item, kind: 'lost' })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const start = (page - 1) * 12;
        const totalItems = merged.length;
        const totalPages = Math.max(Math.ceil(totalItems / 12), 1);
        setItems(merged.slice(start, start + 12));
        setPagination({
          currentPage: page,
          itemsPerPage: 12,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        });
      } else {
        const data = await listingApi(kindFilter).list(query);
        setItems((data.items || []).map((item) => ({ ...item, kind: kindFilter })));
        setPagination(data.pagination || null);
      }
    } catch {
      setError(true);
      setItems([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [urlSearch, category, district, urlVillage, dateFrom, dateTo, status, page, kindFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (!addOpen) return undefined;
    document.getElementById('add-item')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return undefined;
  }, [addOpen]);

  const kindTabs = [
    { id: 'all', label: t.browse.all },
    { id: 'found', label: t.browse.kindFound },
    { id: 'lost', label: t.browse.kindLost },
  ];

  const countLabel =
    kindFilter === 'lost' ? t.browse.lostCount : kindFilter === 'found' ? t.browse.foundCount : t.browse.itemCount;

  return (
    <section className="section-y">
      <Container>
        <PageHeader title={t.browse.title} description={t.browse.body} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-full border border-line bg-cream/80 p-1 dark:bg-forest-light/40">
            {kindTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setKind(tab.id)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-semibold transition',
                  kindFilter === tab.id
                    ? 'bg-paper text-forest shadow-sm'
                    : 'text-ink-soft hover:text-ink'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button type="button" size="sm" variant={addOpen ? 'outline' : 'primary'} onClick={() => toggleAdd(!addOpen)}>
            {addOpen ? <HiX className="size-4" /> : <HiPlus className="size-4" />}
            {addOpen ? t.browse.closeAdd : t.browse.add}
          </Button>
        </div>

        {addOpen && (
          <div id="add-item" className="mt-6">
            {isAuthenticated ? (
              <>
                <p className="mb-4 text-sm text-ink-soft">{t.browse.addBody}</p>
                <PostItem
                  compact
                  kind={postKind}
                  onPosted={(item, kind) => navigate(itemPath(kind, item._id))}
                />
              </>
            ) : (
              <div className="surface p-5">
                <p className="text-sm text-ink-soft">{t.browse.addBody}</p>
                <Button as={Link} to={`/login?redirect=${encodeURIComponent('/items?add=1')}`} className="mt-4">
                  {t.browse.loginToAdd}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="glass relative mt-6 rounded-2xl">
          <label htmlFor="browse-search" className="sr-only">
            {t.common.searchLabel}
          </label>
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="browse-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t.common.searchPlaceholder}
            className="h-12 w-full rounded-2xl bg-transparent pl-11 pr-4 text-sm outline-none"
          />
        </div>

        <div className="mt-4 md:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
          >
            <HiAdjustments className="size-4" />
            {t.common.filter}
          </Button>
        </div>

        <div
          className={`mt-4 grid gap-3 rounded-[1.35rem] border border-white/70 bg-paper/50 p-4 backdrop-blur md:grid-cols-3 dark:border-white/10 dark:bg-paper/60 ${filtersOpen ? 'grid' : 'hidden md:grid'}`}
        >
          <Select
            label={t.common.category}
            value={category}
            onChange={(e) => setFilter('category', e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">{t.common.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>

          <Select
            label={t.common.district}
            value={district}
            onChange={(e) => setFilter('district', e.target.value)}
          >
            <option value="">{t.common.allDistricts}</option>
            {DISTRICTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>

          <Input
            label={t.common.village}
            value={villageInput}
            onChange={(e) => setVillageInput(e.target.value)}
            placeholder={t.common.villagePlaceholder}
          />

          <Input
            label={t.browse.dateFrom}
            type="date"
            value={dateFrom}
            onChange={(e) => setFilter('dateFrom', e.target.value)}
          />
          <Input
            label={t.browse.dateTo}
            type="date"
            value={dateTo}
            onChange={(e) => setFilter('dateTo', e.target.value)}
          />
          <Select
            label={t.browse.status}
            value={status}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">{t.browse.openItems}</option>
            <option value="pending">{t.track.pending}</option>
            <option value="matched">{t.track.matched}</option>
            <option value="closed">{t.track.closed}</option>
          </Select>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {pagination
              ? `${pagination.totalItems} ${countLabel}`
              : loading
                ? t.common.searching
                : ''}
          </p>
          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              {t.actions.clearFilters}
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-8 surface p-8 text-center">
            <p className="text-ink-soft">{t.errors.browse}</p>
            <Button type="button" className="mt-4" onClick={fetchItems}>
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

        {!error && !loading && (
          <>
            <div className="mt-8">
              <ItemsGrid
                items={items}
                kind={kindFilter === 'all' ? 'found' : kindFilter}
                emptyAction={
                  hasFilters ? (
                    <Button type="button" onClick={clearFilters}>
                      {t.actions.clearFilters}
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => toggleAdd(true)}>
                      {t.browse.add}
                    </Button>
                  )
                }
              />
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </Container>
    </section>
  );
}
