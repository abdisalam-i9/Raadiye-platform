import { cn } from '../../utils/cn';
import { fieldClass } from './Input';

export default function Textarea({
  label,
  hint,
  error,
  id,
  className,
  rows = 5,
  ...props
}) {
  const textareaId = id || props.name;

  return (
    <div className="grid gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          fieldClass,
          'h-auto resize-y py-3',
          error && 'border-danger focus:border-danger focus:ring-danger/10',
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
