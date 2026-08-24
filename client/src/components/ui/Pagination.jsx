import { useI18n } from '../../context/LanguageContext';
import { interpolate } from '../../i18n';

export default function Pagination({ pagination, onPageChange }) {
  const { t } = useI18n();
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, hasPreviousPage, hasNextPage } = pagination;

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-11 rounded-full border border-line bg-paper/80 px-4 text-sm font-semibold text-ink transition hover:border-forest hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t.pagination.prev}
      </button>

      <span className="px-3 text-sm text-muted">
        {interpolate(t.pagination.page, { current: currentPage, total: totalPages })}
      </span>

      <button
        type="button"
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-11 rounded-full border border-line bg-paper/80 px-4 text-sm font-semibold text-ink transition hover:border-forest hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t.pagination.next}
      </button>
    </div>
  );
}
