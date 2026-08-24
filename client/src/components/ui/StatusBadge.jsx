import { cn } from '../../utils/cn';
import { ITEM_STATUS_LABELS } from '../../constants/locations';

const styles = {
  active: 'bg-forest-light text-forest',
  returned: 'bg-info-light text-info',
  expired: 'bg-cream text-muted',
  cancelled: 'bg-danger-light text-danger',
};

export default function StatusBadge({ status }) {
  if (!status) return null;

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm backdrop-blur',
        styles[status] || styles.active
      )}
    >
      {ITEM_STATUS_LABELS[status] || status}
    </span>
  );
}
