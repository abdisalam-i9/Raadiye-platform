import { cn } from '../../utils/cn';

const variants = {
  primary:
    'bg-forest text-white shadow-sm hover:bg-forest-dark disabled:bg-forest/50',
  secondary:
    'bg-clay text-white shadow-sm hover:bg-clay-dark disabled:bg-clay/50',
  outline:
    'border border-line bg-paper text-ink hover:border-forest hover:text-forest disabled:opacity-50',
  danger:
    'bg-danger text-white shadow-sm hover:bg-red-800 disabled:bg-danger/50',
  ghost:
    'bg-transparent text-ink-soft hover:bg-cream hover:text-ink disabled:opacity-50',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled,
  children,
  type,
  ...props
}) {
  const isButton = Component === 'button';

  return (
    <Component
      type={isButton ? type || 'button' : undefined}
      disabled={isButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-150',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </Component>
  );
}
