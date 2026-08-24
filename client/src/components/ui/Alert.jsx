import { cn } from '../../utils/cn';

const styles = {
  error: 'border-danger/20 bg-danger-light text-danger',
  success: 'border-ok/20 bg-ok-light text-ok',
  info: 'border-forest/20 bg-forest-light text-forest',
  warning: 'border-warn/30 bg-warn-light text-warn',
};

export default function Alert({ type = 'info', children, className }) {
  if (!children) return null;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn('rounded-xl border px-4 py-3 text-sm leading-6', styles[type], className)}
    >
      {children}
    </div>
  );
}
