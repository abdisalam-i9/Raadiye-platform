import { cn } from '../../utils/cn';

const variants = {
  primary:
    'bg-forest text-white shadow-[0_8px_20px_rgb(15_122_98_/_0.28)] hover:bg-forest-dark hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgb(15_122_98_/_0.32)] disabled:translate-y-0 disabled:bg-forest/50 disabled:shadow-none',
  secondary:
    'bg-clay text-white shadow-[0_8px_20px_rgb(224_122_61_/_0.28)] hover:bg-clay-dark hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-clay/50 disabled:shadow-none',
  outline:
    'border border-line bg-paper/80 text-ink hover:border-forest hover:text-forest hover:bg-forest-light/60 disabled:opacity-50',
  danger:
    'bg-danger text-white shadow-sm hover:bg-red-800 disabled:bg-danger/50',
  ghost:
    'bg-transparent text-ink-soft hover:bg-forest-light/70 hover:text-ink disabled:opacity-50',
  onDark:
    'border border-white/30 bg-transparent text-white hover:bg-white/10 disabled:opacity-50',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm',
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
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition duration-200',
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
