import { cn } from '../../utils/cn';

const fieldClass =
  'h-12 w-full rounded-xl border border-line bg-paper px-4 text-sm text-ink placeholder:text-muted outline-none transition focus:border-forest focus:ring-4 focus:ring-forest/10 disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted';

export default function Input({
  label,
  hint,
  error,
  id,
  className,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className="grid gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(fieldClass, error && 'border-danger focus:border-danger focus:ring-danger/10', className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export { fieldClass };
