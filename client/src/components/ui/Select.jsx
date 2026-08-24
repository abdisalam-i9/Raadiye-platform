import { cn } from '../../utils/cn';
import { fieldClass } from './Input';

export default function Select({
  label,
  hint,
  error,
  id,
  className,
  children,
  ...props
}) {
  const selectId = id || props.name;

  return (
    <div className="grid gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(fieldClass, error && 'border-danger focus:border-danger focus:ring-danger/10', className)}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
