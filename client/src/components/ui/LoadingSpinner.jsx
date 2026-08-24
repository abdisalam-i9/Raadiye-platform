import { getT } from '../../i18n';

export default function LoadingSpinner({ label }) {
  const text = label || getT().common.loading;

  return (
    <div className="flex flex-col items-center justify-center gap-3 text-muted">
      <div className="size-10 animate-spin rounded-full border-4 border-forest-light border-t-forest" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
