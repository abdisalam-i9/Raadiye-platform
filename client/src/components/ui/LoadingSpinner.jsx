export default function LoadingSpinner({ label = 'Waa la soo rarayaa...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-muted">
      <div className="size-10 animate-spin rounded-full border-4 border-forest-light border-t-forest" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
