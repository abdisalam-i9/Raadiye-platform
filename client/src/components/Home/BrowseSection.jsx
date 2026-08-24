import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { HiAdjustments } from 'react-icons/hi';
import ItemsGrid from './ItemsGrid';
import { ItemCardSkeleton } from '../ui/Skeleton';
import Pagination from '../ui/Pagination';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import PageHeader from '../ui/PageHeader';
import Container from '../ui/Container';
import { useCategories } from '../../context/CategoriesContext';
import { useDebounce } from '../../hooks/useDebounce';
import { listingApi } from '../../services/api';
import { DISTRICTS } from '../../constants/locations';
import { getListing } from '../../constants/listings';
import { so } from '../../i18n/so';

export default function BrowseSection({ kind = 'found' }) {
  const listing = getListing(kind);
  const isLost = kind === 'lost';
  const { categories, loading: categoriesLoading } = useCategories();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const urlSearch = params.get('search') || '';
  const category = params.get('category') || '';
  const district = params.get('district') || '';
  const urlVillage = params.get('village') || '';
  const page = Math.max(Number(params.get('page')) || 1, 1);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [villageInput, setVillageInput] = useState(urlVillage);
  const debouncedSearch = useDebounce(searchInput);
  const debouncedVillage = useDebounce(villageInput);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const hasFilters = Boolean(urlSearch || category || district || urlVillage);

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

  const setPage = (nextPage) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (nextPage > 1) next.set('page', String(nextPage));
      else next.delete('page');
      return next;
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setVillageInput('');
    setParams({});
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await listingApi(kind).list({
        search: urlSearch || undefined,
        category: category || undefined,
        district: district || undefined,
        village: urlVillage || undefined,
        page,
        limit: 12,
      });
      setItems(data.items || []);
      setPagination(data.pagination || null);
    } catch {
      setError(true);
      setItems([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [urlSearch, category, district, urlVillage, page, kind]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <section className="section-y">
      <Container>
        <PageHeader
          title={isLost ? so.browse.lostTitle : so.browse.foundTitle}
          description={isLost ? so.browse.lostBody : so.browse.foundBody}
        />

        <div className="relative">
          <label htmlFor="browse-search" className="sr-only">
            Raadi shay
          </label>
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="browse-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Raadi shay..."
            className="h-12 w-full rounded-xl border border-line bg-paper pl-11 pr-4 text-sm outline-none transition focus:border-forest focus:ring-4 focus:ring-forest/10"
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
            Shaandho
          </Button>
        </div>

        <div className={`mt-4 grid gap-3 md:grid-cols-3 ${filtersOpen ? 'grid' : 'hidden md:grid'}`}>
          <Select
            label="Qaybta"
            value={category}
            onChange={(e) => setFilter('category', e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">Dhammaan qaybaha</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>

          <Select
            label="Degmo"
            value={district}
            onChange={(e) => setFilter('district', e.target.value)}
          >
            <option value="">Dhammaan degmooyinka</option>
            {DISTRICTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>

          <Input
            label="Xaafad"
            value={villageInput}
            onChange={(e) => setVillageInput(e.target.value)}
            placeholder="Tusaale: KM4"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {pagination
              ? `${pagination.totalItems} ${isLost ? so.browse.lostCount : so.browse.foundCount}`
              : loading
                ? 'Waa la raadinayaa...'
                : ''}
          </p>
          {hasFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              {so.actions.clearFilters}
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-8 rounded-[1.15rem] border border-line bg-paper p-8 text-center">
            <p className="text-ink-soft">{so.errors.browse}</p>
            <Button type="button" className="mt-4" onClick={fetchItems}>
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

        {!error && !loading && (
          <>
            <div className="mt-8">
              <ItemsGrid
                items={items}
                kind={kind}
                emptyAction={
                  hasFilters ? (
                    <Button type="button" onClick={clearFilters}>
                      {so.actions.clearFilters}
                    </Button>
                  ) : (
                    <Button as={Link} to={listing.postPath}>
                      {isLost ? so.actions.postLost : so.actions.postFound}
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
