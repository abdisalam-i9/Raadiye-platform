import { cn } from '../../utils/cn';
import { useI18n } from '../../context/LanguageContext';

const styles = {
  active: 'bg-forest-light text-forest',
  returned: 'bg-info-light text-info',
  expired: 'bg-line/80 text-muted',
  cancelled: 'bg-danger-light text-danger',
};

export default function StatusBadge({ status }) {
  const { t } = useI18n();
  if (!status) return null;

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm backdrop-blur',
        styles[status] || styles.active
      )}
    >
      {t.status[status] || status}
    </span>
  );
}
